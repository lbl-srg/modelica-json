'use strict'

/*
 * Suggests close matches for Modelica units and quantities without a QUDT term,
 * and formats the warnings that report them.
 */

const { baseSymbol, parseUnit } = require('./modelicaUnit')
const { qudtToQuantity, quantityToQudt, unitToQudt } = require('./qudt')
const { BROADER_QUANTITIES, QUANTITY_RENAMES } = require('./qudtVocab')
const { quantityKinds, symbolDimensions, units } = require('./qudtUnits.json')

const MIN_QUANTITY_SCORE = 0.3
const MIN_UNIT_SIMILARITY = 0.55

const WORD_RE = /[A-Z]+(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|\d+/g

const WORD_SYNONYMS = {
  meter: ['length', 'm'],
  metre: ['length', 'm'],
  temp: ['temperature'],
  diff: ['difference'],
  delta: ['difference'],
  vel: ['velocity', 'speed'],
  speed: ['velocity'],
  vol: ['volume'],
  pres: ['pressure'],
  cond: ['conductivity', 'conductance'],
  res: ['resistance', 'resistivity'],
  cap: ['capacity', 'capacitance'],
  slope: ['rate', 'gradient', 'lineic']
}

// Common misspellings of units: [text to find, replacement]
const CHARACTER_REPAIRS = [
  ['°C', 'degC'],
  ['°F', 'degF'],
  ['°R', 'degRk'],
  ['°K', 'K'],
  ['Ω', 'Ohm'],
  ['μ', 'u'],
  ['^', ''],
  ['*', '.'],
  ['·', '.']
]

const WORD_REPAIRS = [
  ['deg_C', 'degC'], ['celsius', 'degC'],
  ['deg_F', 'degF'], ['fahrenheit', 'degF'],
  ['deg_R', 'degRk'], ['degR', 'degRk'],
  ['degK', 'K'], ['kelvin', 'K'],
  ['ohms', 'Ohm'], ['ohm', 'Ohm'],
  ['secs', 's'], ['sec', 's'],
  ['hrs', 'h'], ['hr', 'h']
].map(([word, replacement]) => [new RegExp(`\\b${word}\\b`, 'g'), replacement])

const round = score => Math.round(score * 1000) / 1000

/** Returns the size of the matching blocks of two strings (as Python's difflib). */
function matchingSize (a, aLow, aHigh, b, bLow, bHigh) {
  let bestA = aLow
  let bestB = bLow
  let bestSize = 0
  for (let i = aLow; i < aHigh; i++) {
    for (let j = bLow; j < bHigh; j++) {
      let size = 0
      while (i + size < aHigh && j + size < bHigh && a[i + size] === b[j + size]) size++
      if (size > bestSize) {
        bestA = i
        bestB = j
        bestSize = size
      }
    }
  }
  if (bestSize === 0) return 0
  return bestSize +
    matchingSize(a, aLow, bestA, b, bLow, bestB) +
    matchingSize(a, bestA + bestSize, aHigh, b, bestB + bestSize, bHigh)
}

function similarity (a, b) {
  const total = a.length + b.length
  return total === 0 ? 1 : 2 * matchingSize(a, 0, a.length, b, 0, b.length) / total
}

function tokenize (text) {
  const words = (text.match(WORD_RE) || []).map(word => word.toLowerCase())
  const expanded = new Set(words)
  for (const word of words) {
    for (const synonym of WORD_SYNONYMS[word] || []) expanded.add(synonym)
  }
  return { normalized: words.join(''), words: expanded }
}

/** Returns the QUDT dimension vector of a unit, or null if it has none. */
function unitDimension (unit) {
  let factors
  try {
    factors = parseUnit(unit)
  } catch (_) {
    return null
  }
  const total = [0, 0, 0, 0, 0, 0, 0]
  for (const { symbol, exp } of factors) {
    symbolDimensions[baseSymbol(symbol)].match(/-?\d+(?=[A-Z])/g).slice(0, 7).forEach((value, i) => {
      total[i] += Number(value) * exp.num / exp.den
    })
  }
  if (!total.every(Number.isInteger)) return null
  const [a, e, l, i, m, h, t] = total
  return `A${a}E${e}L${l}I${i}M${m}H${h}T${t}D${total.every(v => v === 0) ? 1 : 0}`
}

let quantityIndex = null

function getQuantityIndex () {
  if (quantityIndex !== null) return quantityIndex
  const namesByKind = new Map()
  for (const [name, kind] of Object.entries({ ...QUANTITY_RENAMES, ...BROADER_QUANTITIES })) {
    if (name !== '1') namesByKind.set(kind, [...(namesByKind.get(kind) || []), name])
  }
  quantityIndex = Object.entries(quantityKinds).map(([kind, dimension]) => {
    const tokens = [kind, ...(namesByKind.get(kind) || [])].map(tokenize)
    return {
      kind,
      dimension,
      modelicaName: qudtToQuantity(kind),
      forms: tokens.map(t => t.normalized),
      words: new Set(tokens.flatMap(t => [...t.words]))
    }
  })
  return quantityIndex
}

let unitIndex = null

function getUnitIndex () {
  if (unitIndex !== null) return unitIndex
  const byDimension = new Map()
  for (const unit of Object.values(units)) {
    const dimension = unitDimension(unit)
    byDimension.set(dimension, [...(byDimension.get(dimension) || []), unit])
  }
  for (const list of byDimension.values()) {
    list.sort((a, b) => a.length - b.length || (a < b ? -1 : 1))
  }
  unitIndex = { byDimension, all: Object.values(units) }
  return unitIndex
}

/**
 * Suggests QUDT quantity kinds for a Modelica quantity.
 *
 * @param {string} query Modelica quantity.
 * @param {Object} [options]
 * @param {?string} [options.unit] Unit of the quantity, to prefer matching dimensions.
 * @param {number} [options.topK] Maximum number of suggestions.
 * @return {Array} Suggestions { kind, modelicaName, score, dimensionMatch, reason }, best first.
 */
function suggestQuantity (query, { unit = null, topK = 5 } = {}) {
  const text = String(query).trim()
  if (text === '') return []
  const targetDimension = unit ? unitDimension(unit) : null
  const exactKind = quantityToQudt(text)
  const { normalized, words } = tokenize(text)
  const results = []

  for (const candidate of getQuantityIndex()) {
    const dimensionMatch = targetDimension && candidate.dimension ? candidate.dimension === targetDimension : null
    const { kind, modelicaName } = candidate
    if (kind === exactKind) {
      results.push({ kind, modelicaName, score: 1, dimensionMatch, reason: 'exact_match' })
      continue
    }
    const textScore = Math.max(...candidate.forms.map(form => similarity(normalized, form)))
    const common = [...words].filter(word => candidate.words.has(word)).length
    const overlap = words.size + candidate.words.size > 0 ? 2 * common / (words.size + candidate.words.size) : 0
    const lexical = Math.max(textScore, 0.9 * overlap)
    let score = lexical
    let reason = overlap >= textScore && overlap > 0 ? 'token_overlap' : 'lexical_similarity'
    if (dimensionMatch === true) {
      score = Math.min(0.99, lexical >= 0.25 ? lexical + 0.25 : 0.55 + 0.3 * lexical)
      reason = lexical >= 0.35 ? 'lexical+dimension_match' : 'dimension_match'
    } else if (dimensionMatch === false) {
      score = Math.max(0, lexical - 0.1)
    }
    if (score >= MIN_QUANTITY_SCORE) {
      results.push({ kind, modelicaName, score: round(score), dimensionMatch, reason })
    }
  }
  return results
    .sort((a, b) => b.score - a.score ||
      (b.dimensionMatch === true) - (a.dimensionMatch === true) ||
      a.kind.length - b.kind.length)
    .slice(0, topK)
}

function repairUnit (text) {
  let repaired = text
  for (const [from, to] of CHARACTER_REPAIRS) repaired = repaired.split(from).join(to)
  for (const [pattern, to] of WORD_REPAIRS) repaired = repaired.replace(pattern, to)
  return repaired.replace(/\s+/g, '.').replace(/(\d)([A-Za-z])/g, '$1.$2')
}

/**
 * Suggests Modelica units with a QUDT unit for a unit expression.
 *
 * @param {string} query Unit expression, which may be invalid.
 * @param {Object} [options]
 * @param {number} [options.topK] Maximum number of suggestions.
 * @return {Array} Suggestions { modelicaUnit, qudtUnit, score, dimensionMatch, reason }, best first.
 */
function suggestUnit (query, { topK = 5 } = {}) {
  const text = String(query).trim()
  if (text === '') return []
  const { byDimension, all } = getUnitIndex()
  const results = new Map()
  const add = (unit, score, dimensionMatch, reason) => {
    const qudtUnit = unitToQudt(unit)
    if (qudtUnit !== null && !results.has(qudtUnit)) {
      results.set(qudtUnit, { modelicaUnit: unit, qudtUnit, score: round(score), dimensionMatch, reason })
    }
  }
  const addSameDimension = (dimension, score) => {
    for (const unit of (byDimension.get(dimension) || []).slice(0, topK)) {
      add(unit, score, true, 'same_dimension_vector')
    }
  }

  const repaired = repairUnit(text)
  const dimension = unitDimension(text)
  const repairedDimension = unitDimension(repaired)
  add(text, 1, true, 'exact_match')
  if (dimension !== null) {
    addSameDimension(dimension, 0.9)
  } else {
    for (const unit of all) {
      if (unit.toLowerCase() === text.toLowerCase()) add(unit, 0.93, null, 'case_match')
    }
    if (repairedDimension !== null) {
      add(repaired, 0.95, true, 'normalized_syntax')
      addSameDimension(repairedDimension, 0.85)
    }
    const lower = text.toLowerCase()
    all
      .map(unit => [similarity(lower, unit.toLowerCase()), unit])
      .filter(([score]) => score >= MIN_UNIT_SIMILARITY)
      .sort((a, b) => b[0] - a[0] || a[1].length - b[1].length)
      .slice(0, topK)
      .forEach(([score, unit]) => add(unit, 0.8 * score, null, 'lexical_similarity'))
  }
  return [...results.values()].sort((a, b) => b.score - a.score).slice(0, topK)
}

const hint = suggestions => suggestions.length > 0 ? ` Did you mean: ${suggestions.join(', ')}?` : ''

/** Returns the warning for a unit that has no QUDT unit. */
function formatUnitWarning (unit) {
  const suggestions = suggestUnit(unit, { topK: 3 }).map(s => `${s.modelicaUnit} (unit:${s.qudtUnit})`)
  return `Unit ${unit} could not be mapped to QUDT. Using S231:unit with literal value ${unit}.${hint(suggestions)}`
}

/** Returns the warning for a quantity that has no QUDT quantity kind. */
function formatQuantityWarning (quantity, unit = null) {
  const suggestions = suggestQuantity(quantity, { unit, topK: 3 })
    .map(s => `${s.modelicaName || s.kind} (q:${s.kind})`)
  return `Quantity kind ${quantity} could not be mapped to QUDT. Using S231:quantity with literal value ${quantity}.${hint(suggestions)}`
}

module.exports = {
  formatQuantityWarning,
  formatUnitWarning,
  suggestQuantity,
  suggestUnit,
  unitDimension
}
