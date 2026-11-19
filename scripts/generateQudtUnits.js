/*
 * Generates lib/qudtUnits.json from a pinned QUDT release.
 *
 * Usage, from the root directory of the repository:
 *   node scripts/generateQudtUnits.js
 *
 * Each QUDT unit is translated to a Modelica unit, trying in this order:
 *   1. the unit tables in lib/qudtVocab.js, for QUDT units that are a symbol,
 *   2. the UCUM code of the unit,
 *   3. the factors in the QUDT name, as not all units have a usable UCUM code.
 * A translation is used only if its dimensions match those stated by QUDT. The
 * dimensions are not written to the output.
 * QUDT units that use symbols unknown to lib/qudtVocab.js are left out.
 */
'use strict'

const fs = require('fs')
const https = require('https')
const path = require('path')
const N3 = require('n3')
const {
  formatUnit,
  baseSymbol,
  makeExp,
  mergeFactors,
  negate,
  operandFactors,
  parseUnit,
  unitKey
} = require('../lib/modelicaUnit')
const {
  MODELICA_SPELLINGS,
  PREFERRED_QUDT_UNITS,
  PREFIXABLE_UNITS,
  QUDT_QK_NS,
  QUDT_SCHEMA_NS,
  QUDT_UNIT_NS,
  UCUM_SYMBOLS,
  UNIT_PREFIXES,
  UNPREFIXED_UNITS
} = require('../lib/qudtVocab')

const QUDT_VERSION = 'v3.1.11'
const BASE_URL = `https://raw.githubusercontent.com/qudt/qudt-public-repo/${QUDT_VERSION}/src/main/rdf/vocab`
const UNITS_URL = `${BASE_URL}/unit/VOCAB_QUDT-UNITS-ALL.ttl`
const QUANTITY_KINDS_URL = `${BASE_URL}/quantitykinds/VOCAB_QUDT-QUANTITY-KINDS-ALL.ttl`
const OUT_FILE = path.join(__dirname, '..', 'lib', 'qudtUnits.json')

const OWL_DEPRECATED = 'http://www.w3.org/2002/07/owl#deprecated'
const DIMENSION_RE = /^A(-?[\d.]+)E(-?[\d.]+)L(-?[\d.]+)I(-?[\d.]+)M(-?[\d.]+)H(-?[\d.]+)T(-?[\d.]+)D[\d.]+$/

/** Reads the non-deprecated concepts of a namespace from a Turtle document. */
function readConcepts (ttl, namespace) {
  const concepts = new Map()
  for (const { subject, predicate, object } of new N3.Parser().parse(ttl)) {
    if (!subject.value.startsWith(namespace)) continue
    const name = subject.value.slice(namespace.length)
    if (!concepts.has(name)) concepts.set(name, {})
    const concept = concepts.get(name)
    if (predicate.value === `${QUDT_SCHEMA_NS}deprecated` || predicate.value === OWL_DEPRECATED) {
      concept.deprecated = object.value === 'true'
    } else if (predicate.value === `${QUDT_SCHEMA_NS}ucumCode`) {
      concept.ucum = object.value
    } else if (predicate.value === `${QUDT_SCHEMA_NS}hasDimensionVector`) {
      const dimension = object.value.split('/').pop()
      concept.dimension = DIMENSION_RE.test(dimension) ? dimension : null
    }
  }
  for (const [name, concept] of concepts) {
    if (concept.deprecated) concepts.delete(name)
  }
  return concepts
}

/** Maps the QUDT name of each unit symbol, with all prefixes, to the symbol. */
function symbolsByQudtName () {
  const symbols = new Map(Object.entries(UNPREFIXED_UNITS).map(([symbol, name]) => [name, symbol]))
  for (const [symbol, name] of Object.entries(PREFIXABLE_UNITS)) {
    symbols.set(name, symbol)
    for (const [prefix, qudtPrefix] of Object.entries(UNIT_PREFIXES)) {
      symbols.set(qudtPrefix + name, prefix + symbol)
    }
  }
  return symbols
}

const factorsOfSymbol = (symbol, exp = makeExp(1)) => [{ symbol, exp }]

/** Derives factors from a name such as KiloGM-PER-M2-SEC, or returns null. */
function factorsFromName (name, symbols) {
  const [top, bottom] = name.startsWith('PER-') ? ['', name.slice(4)] : name.split(/-PER-(.*)/s)
  const sideFactors = side => (side ? side.split('-') : []).map(token => {
    const [, atom, power] = /^(.*?)(\d*)$/.exec(token)
    return symbols.has(atom) ? factorsOfSymbol(symbols.get(atom), makeExp(Number(power || 1))) : null
  })
  const sides = [sideFactors(top), sideFactors(bottom)]
  if (sides.flat().includes(null)) return null
  return mergeFactors([...sides[0].flat(), ...negate(sides[1].flat())])
}

/**
 * Derives factors from a UCUM code, or returns null if the code has parts
 * without a Modelica equivalent, such as annotations or numeric factors.
 * In UCUM, "." and "/" apply from left to right: J/kg.K is J.K/kg.
 */
function factorsFromUcum (code) {
  let pos = 0

  function parseComponent () {
    if (code[pos] === '(') {
      pos++
      const inner = parseTerm()
      if (inner === null || code[pos] !== ')') return null
      pos++
      return inner
    }
    const regex = /(\[[^\]]+\]|[A-Za-z%]+)([+-]?\d+)?/y
    regex.lastIndex = pos
    const match = regex.exec(code)
    if (match === null) {
      if (code[pos] !== '1') return null
      pos++
      return []
    }
    pos = regex.lastIndex
    const operand = UCUM_SYMBOLS[match[1]] || match[1]
    try {
      const exp = Number(match[2] || 1)
      return operandFactors(operand).map(f => ({ symbol: f.symbol, exp: makeExp(f.exp.num * exp, f.exp.den) }))
    } catch (_) {
      return null
    }
  }

  function parseTerm () {
    const factors = code[pos] === '/' ? [] : parseComponent()
    if (factors === null) return null
    while (code[pos] === '.' || code[pos] === '/') {
      const divide = code[pos++] === '/'
      const next = parseComponent()
      if (next === null) return null
      factors.push(...(divide ? negate(next) : next))
    }
    return factors
  }

  const factors = parseTerm()
  return factors !== null && pos === code.length ? mergeFactors(factors) : null
}

const dimensionNumbers = dimension => DIMENSION_RE.exec(dimension).slice(1).map(Number)

/** Returns whether the factors have the dimensions stated by QUDT. */
function hasDimension (factors, dimension, symbolDimensions) {
  const total = [0, 0, 0, 0, 0, 0, 0]
  for (const { symbol, exp } of factors) {
    dimensionNumbers(symbolDimensions[baseSymbol(symbol)]).forEach((value, i) => {
      total[i] += value * exp.num / exp.den
    })
  }
  const expected = dimensionNumbers(dimension)
  return total.every((value, i) => Math.abs(value - expected[i]) < 1e-9)
}

function symbolDimensionsFrom (concepts) {
  const dimensions = {}
  for (const [symbol, name] of Object.entries({ ...PREFIXABLE_UNITS, ...UNPREFIXED_UNITS })) {
    const concept = concepts.get(name)
    if (!concept || !concept.dimension) {
      throw new Error(`QUDT has no usable unit ${name} for the Modelica symbol ${symbol}`)
    }
    dimensions[symbol] = concept.dimension
  }
  return dimensions
}

/** Orders QUDT units with the same factors. The first becomes the main name. */
function compareUnits (a, b) {
  const rank = unit => {
    const preferred = PREFERRED_QUDT_UNITS.includes(unit.name) ? 0 : 1
    return [preferred, unit.fromName ? 0 : 1, unit.name.length]
  }
  const [rankA, rankB] = [rank(a), rank(b)]
  for (let i = 0; i < rankA.length; i++) {
    if (rankA[i] !== rankB[i]) return rankA[i] - rankB[i]
  }
  return a.name < b.name ? -1 : 1
}

function buildUnits (concepts, symbolDimensions) {
  const symbols = symbolsByQudtName()
  symbols.delete('UNITLESS')
  const groups = new Map()
  const conflicts = []
  const skipped = []

  for (const [name, concept] of concepts) {
    let named = null
    if (name === 'UNITLESS') named = []
    else if (symbols.has(name)) named = factorsOfSymbol(symbols.get(name))
    else named = factorsFromName(name, symbols)
    const ucum = concept.ucum ? factorsFromUcum(concept.ucum) : null
    const fits = factors => factors !== null && concept.dimension && hasDimension(factors, concept.dimension, symbolDimensions)
    const direct = name === 'UNITLESS' || symbols.has(name)
    const factors = [direct ? named : null, ucum, named].find(fits)
    if (factors === undefined) {
      skipped.push(name)
      continue
    }
    if (fits(ucum) && fits(named) && unitKey(ucum) !== unitKey(named)) {
      conflicts.push(`${name}: UCUM ${formatUnit(ucum)}, name ${formatUnit(named)}`)
    }
    const key = unitKey(factors)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ name, factors, fromName: fits(named) && unitKey(named) === key })
  }

  const spellings = new Map(MODELICA_SPELLINGS.map(unit => [unitKey(parseUnit(unit)), unit]))
  const units = {}
  const aliases = {}
  for (const [key, group] of groups) {
    const [main, ...others] = group.sort(compareUnits)
    units[main.name] = spellings.get(key) || formatUnit(main.factors)
    for (const other of others) aliases[other.name] = main.name
  }
  return { units, aliases, conflicts, skipped }
}

const sortedObject = obj => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : 1)))

/** Builds the content of lib/qudtUnits.json, and a report for the developer. */
function buildVocabulary (unitsTtl, quantityKindsTtl, qudtVersion = QUDT_VERSION) {
  const unitConcepts = readConcepts(unitsTtl, QUDT_UNIT_NS)
  const symbolDimensions = symbolDimensionsFrom(unitConcepts)
  const { units, aliases, conflicts, skipped } = buildUnits(unitConcepts, symbolDimensions)
  return {
    vocabulary: {
      qudtVersion,
      units: sortedObject(units),
      aliases: sortedObject(aliases),
      quantityKinds: [...readConcepts(quantityKindsTtl, QUDT_QK_NS).keys()].sort()
    },
    report: { conflicts, skipped }
  }
}

function fetchUrl (url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        res.resume()
        reject(new Error(`Failed to fetch ${url}: HTTP ${res.statusCode}`))
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    }).on('error', reject)
  })
}

async function main () {
  const [unitsTtl, quantityKindsTtl] = await Promise.all([fetchUrl(UNITS_URL), fetchUrl(QUANTITY_KINDS_URL)])
  const { vocabulary, report } = buildVocabulary(unitsTtl, quantityKindsTtl)
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(vocabulary, null, 2)}\n`)
  console.log(`QUDT ${QUDT_VERSION}: ${Object.keys(vocabulary.units).length} units, ` +
    `${Object.keys(vocabulary.aliases).length} aliases, ${report.skipped.length} units without a Modelica form`)
  for (const conflict of report.conflicts) console.log(`UCUM code and name differ for ${conflict}`)
}

if (require.main === module) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = { buildVocabulary, factorsFromName, factorsFromUcum }
