'use strict'

const {
  ATOMIC_UNITS,
  EXACT_QUANTITY_KINDS,
  MINTED_COMPOUND_UNITS,
  MINTED_PREFIXED_ATOMS,
  MODELICA_TO_QUDT_QK,
  MSL_TYPES,
  PREFIXABLE_ATOMS,
  QUDT_ATOM_ALIASES,
  QUDT_DV_NS,
  QUDT_PREFIX_TO_SI,
  QUDT_QK_NS,
  QUDT_SCHEMA_NS,
  QUDT_TO_MODELICA_QK,
  QUDT_UNIT_NS,
  S231_NS,
  SI_PREFIXES,
  ZERO_DIM
} = require('./qudtVocab')

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

// --- Exact rational exponent helpers ---

function gcd (a, b) {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return x || 1
}

function makeExp (num, den = 1) {
  if (den === 0) throw new Error('Zero denominator in unit exponent')
  if (num === 0) return { num: 0, den: 1 }
  const sign = den < 0 ? -1 : 1
  const g = gcd(num, den)
  return { num: (sign * num) / g, den: (sign * den) / g }
}

function parseExpInput (val) {
  if (typeof val === 'number') {
    if (!Number.isInteger(val)) throw new Error(`Non-integer numeric exponent: ${val}`)
    return { num: val, den: 1 }
  }
  if (typeof val === 'object' && val !== null && typeof val.num === 'number' && typeof val.den === 'number') {
    return makeExp(val.num, val.den)
  }
  if (typeof val === 'string') {
    const s = val.trim().replace(/^\((.*)\)$/, '$1')
    if (/^[+-]?\d+$/.test(s)) return { num: parseInt(s, 10), den: 1 }
    const m = /^([+-]?\d+)\s*\/\s*(\d+)$/.exec(s)
    if (m) return makeExp(parseInt(m[1], 10), parseInt(m[2], 10))
  }
  throw new Error(`Invalid unit exponent: ${val}`)
}

const expAdd = (a, b) => makeExp(a.num * b.den + b.num * a.den, a.den * b.den)
const expMul = (a, b) => makeExp(a.num * b.num, a.den * b.den)
const expNeg = a => ({ num: -a.num, den: a.den })
const expPublic = a => (a.den === 1 ? a.num : `${a.num}/${a.den}`)

function formatModelicaExp (exp) {
  if (exp.den === 1) return exp.num === 1 ? '' : String(exp.num)
  return `(${exp.num}/${exp.den})`
}

function factorKey (factors) {
  const copy = factors.slice().sort((a, b) => {
    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1
    return a[1].num * b[1].den - b[1].num * a[1].den
  })
  return copy.map(([ql, e]) => `${ql}:${expPublic(e)}`).join('|')
}

// --- Precomputed lookup indices ---

const MINTED_SINGLE_UNITS = new Set(MINTED_PREFIXED_ATOMS)
const QUDT_ATOM_TO_MODELICA = {}
for (const [moSym, [qudtLocal]] of Object.entries(ATOMIC_UNITS)) {
  MINTED_SINGLE_UNITS.add(qudtLocal)
  if (!hasOwn(QUDT_ATOM_TO_MODELICA, qudtLocal)) {
    QUDT_ATOM_TO_MODELICA[qudtLocal] = moSym
  }
}
Object.assign(QUDT_ATOM_TO_MODELICA, QUDT_ATOM_ALIASES)

const REVERSE_UNIT_MAP = Object.assign({ 'M3-PER-M2-SEC': 'm3/(s.m2)' }, QUDT_ATOM_TO_MODELICA)
const MINTED_BY_KEY = new Map()
for (const [rawFactors, qudtLocal, moStr] of MINTED_COMPOUND_UNITS) {
  const normFactors = rawFactors.map(([ql, e]) => [ql, parseExpInput(e)])
  MINTED_BY_KEY.set(factorKey(normFactors), [qudtLocal, moStr])
  if (!hasOwn(REVERSE_UNIT_MAP, qudtLocal)) {
    REVERSE_UNIT_MAP[qudtLocal] = moStr
  }
}

const MODELICA_UNIT_SYNONYMS = {
  BtuPerHour: 'Btu/h'
}

const SI_PREFIX_LIST = ['da', ...Object.keys(SI_PREFIXES).filter(k => k.length === 1)]
const QUDT_PREFIX_NAMES = Object.keys(QUDT_PREFIX_TO_SI)

const HYPHENATED_QUDT_ATOMS = Object.keys(QUDT_ATOM_TO_MODELICA)
  .filter(k => k.includes('-') && !k.includes('-PER-'))
  .sort((a, b) => b.length - a.length)

function stripUnitNs (value) {
  const val = String(value).trim()
  if (val.startsWith(QUDT_UNIT_NS)) return val.slice(QUDT_UNIT_NS.length)
  if (val.startsWith('unit:')) return val.slice(5)
  return val
}

function stripQkNs (value) {
  const val = String(value).trim()
  if (val.startsWith(QUDT_QK_NS)) return val.slice(QUDT_QK_NS.length)
  if (val.startsWith('quantitykind:')) return val.slice(13)
  if (val.startsWith('q:')) return val.slice(2)
  return val
}

function formatDimensionVector (vec) {
  const isZero = vec.every(v => v === 0)
  return `${QUDT_DV_NS}A${vec[0]}E${vec[1]}L${vec[2]}I${vec[3]}M${vec[4]}H${vec[5]}T${vec[6]}D${isZero ? 1 : 0}`
}

function resolveModelicaAtom (symbol) {
  if (hasOwn(ATOMIC_UNITS, symbol)) return ATOMIC_UNITS[symbol]
  for (const pfx of SI_PREFIX_LIST) {
    if (symbol.startsWith(pfx)) {
      const base = symbol.slice(pfx.length)
      if (PREFIXABLE_ATOMS.has(base)) {
        const [baseQudt, baseUcum, dim] = ATOMIC_UNITS[base]
        const qudtLocal = (pfx === 'k' && base === 'g') ? 'KiloGM' : `${SI_PREFIXES[pfx]}${baseQudt}`
        const ucumPfx = pfx === '\u03bc' ? 'u' : pfx
        return [qudtLocal, `${ucumPfx}${baseUcum}`, dim]
      }
    }
  }
  throw new Error(`Unrecognized Modelica unit symbol: ${symbol}`)
}

function resolveQudtAtom (qudtLocal) {
  if (hasOwn(QUDT_ATOM_TO_MODELICA, qudtLocal)) return QUDT_ATOM_TO_MODELICA[qudtLocal]
  for (const qudtPfx of QUDT_PREFIX_NAMES) {
    if (qudtLocal.startsWith(qudtPfx)) {
      const rest = qudtLocal.slice(qudtPfx.length)
      const moBase = hasOwn(QUDT_ATOM_TO_MODELICA, rest) ? QUDT_ATOM_TO_MODELICA[rest] : null
      if (moBase && PREFIXABLE_ATOMS.has(moBase)) {
        const siPfx = QUDT_PREFIX_TO_SI[qudtPfx]
        return (siPfx === 'k' && moBase === 'g') ? 'kg' : `${siPfx}${moBase}`
      }
    }
  }
  throw new Error(`Unrecognized QUDT unit atom: ${qudtLocal}`)
}

// --- Modelica §19.1 unit parser ---

const TOKEN_RE = /\s*(\(|\)|\.|\/|[A-Za-z%\u03bc][A-Za-z0-9_]*|[+-]?\d+|[+-])\s*/y
const ATOM_EXP_RE = /^([A-Za-z%\u03bc_](?:[A-Za-z0-9%\u03bc_]*[A-Za-z%\u03bc_])?)([+-]?\d+)$/
const INT_TOK_RE = /^[+-]?\d+$/
const UINT_TOK_RE = /^\d+$/

function parseModelicaTokens (text) {
  const tokens = []
  let pos = 0
  while (pos < text.length) {
    TOKEN_RE.lastIndex = pos
    const m = TOKEN_RE.exec(text)
    if (!m) throw new Error(`Invalid Modelica unit syntax in "${text}" near "${text.slice(pos)}"`)
    tokens.push(m[1])
    pos = TOKEN_RE.lastIndex
  }

  let idx = 0
  const n = tokens.length

  function parseOptionalExponent () {
    if (idx >= n) return { num: 1, den: 1 }
    if (INT_TOK_RE.test(tokens[idx])) {
      return { num: parseInt(tokens[idx++], 10), den: 1 }
    }
    if (
      (tokens[idx] === '+' || tokens[idx] === '-') &&
      idx + 5 < n &&
      tokens[idx + 1] === '(' &&
      UINT_TOK_RE.test(tokens[idx + 2]) &&
      tokens[idx + 3] === '/' &&
      UINT_TOK_RE.test(tokens[idx + 4]) &&
      tokens[idx + 5] === ')'
    ) {
      const sign = tokens[idx] === '-' ? -1 : 1
      const num = parseInt(tokens[idx + 2], 10)
      const den = parseInt(tokens[idx + 4], 10)
      idx += 6
      return makeExp(sign * num, den)
    }
    if (
      tokens[idx] === '(' &&
      idx + 4 < n &&
      INT_TOK_RE.test(tokens[idx + 1]) &&
      tokens[idx + 2] === '/' &&
      UINT_TOK_RE.test(tokens[idx + 3]) &&
      tokens[idx + 4] === ')'
    ) {
      const num = parseInt(tokens[idx + 1], 10)
      const den = parseInt(tokens[idx + 3], 10)
      idx += 5
      return makeExp(num, den)
    }
    return { num: 1, den: 1 }
  }

  function parseExpr () {
    const items = parseTerm()
    while (idx < n && tokens[idx] === '/') {
      idx++
      for (const [ql, exp, uc, dm] of parseTerm()) {
        items.push([ql, expNeg(exp), uc, dm])
      }
    }
    return items
  }

  function parseTerm () {
    const items = parseFactor()
    while (idx < n && tokens[idx] !== ')' && tokens[idx] !== '/') {
      if (tokens[idx] === '.') idx++
      for (const it of parseFactor()) items.push(it)
    }
    return items
  }

  function parseFactor () {
    if (idx >= n) throw new Error(`Unexpected end of unit expression: "${text}"`)
    const tok = tokens[idx]
    if (tok === '(') {
      idx++
      const inner = parseExpr()
      if (idx >= n || tokens[idx] !== ')') throw new Error(`Unclosed "(" in unit expression: "${text}"`)
      idx++
      const exp = parseOptionalExponent()
      return inner.map(([ql, e, uc, dm]) => [ql, expMul(e, exp), uc, dm])
    }
    idx++
    if (tok === '1') return [['UNITLESS', { num: 1, den: 1 }, '1', ZERO_DIM]]
    let atom = tok
    let exp
    if (hasOwn(ATOMIC_UNITS, tok)) {
      exp = parseOptionalExponent()
    } else {
      const m = ATOM_EXP_RE.exec(tok)
      if (m) {
        atom = m[1]
        exp = { num: parseInt(m[2], 10), den: 1 }
      } else {
        exp = parseOptionalExponent()
      }
    }
    const [ql, uc, dm] = resolveModelicaAtom(atom)
    return [[ql, exp, uc, dm]]
  }

  const result = parseExpr()
  if (idx !== n) throw new Error(`Unexpected token "${tokens[idx]}" in unit "${text}"`)
  return result
}

function mergeParsedFactors (items, cancelRatios) {
  const nonUnitless = items.filter(it => it[0] !== 'UNITLESS')
  const work = nonUnitless.length > 0 ? nonUnitless : [['UNITLESS', { num: 1, den: 1 }, '1', ZERO_DIM]]
  const merged = []
  for (const [ql, exp, uc, dm] of work) {
    if (exp.num === 0) continue
    let found = false
    for (let i = 0; i < merged.length; i++) {
      const [eql, eexp, euc, edm] = merged[i]
      if (eql === ql && (cancelRatios || (eexp.num > 0) === (exp.num > 0))) {
        const nextExp = expAdd(eexp, exp)
        if (nextExp.num === 0) merged.splice(i, 1)
        else merged[i] = [eql, nextExp, euc, edm]
        found = true
        break
      }
    }
    if (!found) merged.push([ql, exp, uc, dm])
  }
  return merged.length > 0 ? merged : [['UNITLESS', { num: 1, den: 1 }, '1', ZERO_DIM]]
}

// --- Core forward & reverse conversion ---

const unitCache = new Map()

function unitToQudt (unit, { cancelRatios = false } = {}) {
  if (unit === undefined || unit === null) {
    return { uri: null, curie: null, factors: [], dimensionVector: null, ucum: null, preservedRatio: false }
  }
  const raw = String(unit).trim()
  if (raw === '') {
    return { uri: null, curie: null, factors: [], dimensionVector: null, ucum: null, preservedRatio: false }
  }
  const cacheKey = `${cancelRatios ? '1' : '0'}:${raw}`
  if (unitCache.has(cacheKey)) return unitCache.get(cacheKey)

  const normRaw = hasOwn(MODELICA_UNIT_SYNONYMS, raw) ? MODELICA_UNIT_SYNONYMS[raw] : raw
  const parsed = parseModelicaTokens(normRaw)
  const merged = mergeParsedFactors(parsed, cancelRatios)

  const dim = Array.from({ length: 7 }, () => ({ num: 0, den: 1 }))
  let posDim = false
  let negDim = false
  let hasFractionalFactor = false

  for (const [, exp, , dm] of merged) {
    if (exp.den !== 1) hasFractionalFactor = true
    for (let j = 0; j < 7; j++) {
      const c = makeExp(dm[j] * exp.num, exp.den)
      dim[j] = expAdd(dim[j], c)
      if (c.num > 0) posDim = true
      else if (c.num < 0) negDim = true
    }
  }

  const allIntDims = dim.every(x => x.den === 1)
  const isZeroDim = dim.every(x => x.num === 0)
  const dimensionVector = allIntDims ? formatDimensionVector(dim.map(x => x.num)) : null

  const posUnits = new Set(merged.filter(it => it[1].num > 0).map(it => it[0]))
  const negUnits = new Set(merged.filter(it => it[1].num < 0).map(it => it[0]))
  let sameBaseRatio = false
  for (const u of posUnits) {
    if (negUnits.has(u)) {
      sameBaseRatio = true
      break
    }
  }
  const preservedRatio = sameBaseRatio || (isZeroDim && posDim && negDim)

  let ucum = null
  if (!hasFractionalFactor) {
    if (merged.length === 1 && merged[0][0] === 'UNITLESS') {
      ucum = '1'
    } else {
      ucum = merged.map(([, exp, uc]) => `${uc}${exp.num !== 1 ? exp.num : ''}`).join('.')
    }
  }

  let qudtLocal = null
  if (merged.length === 1 && merged[0][1].den === 1 && merged[0][1].num === 1) {
    if (MINTED_SINGLE_UNITS.has(merged[0][0])) {
      qudtLocal = merged[0][0]
    }
  } else {
    const minted = MINTED_BY_KEY.get(factorKey(merged.map(([ql, exp]) => [ql, exp])))
    if (minted) qudtLocal = minted[0]
  }

  const result = {
    uri: qudtLocal ? `${QUDT_UNIT_NS}${qudtLocal}` : null,
    curie: qudtLocal ? `unit:${qudtLocal}` : null,
    factors: merged.map(([ql, exp]) => [`${QUDT_UNIT_NS}${ql}`, expPublic(exp)]),
    dimensionVector,
    ucum,
    preservedRatio
  }
  unitCache.set(cacheKey, result)
  return result
}

function formatFactorsToModelica (localFactors, cancelRatios = false) {
  const merged = []
  for (const [rawU, rawExp] of localFactors) {
    const exp = parseExpInput(rawExp)
    const ql = stripUnitNs(rawU)
    if (ql === 'UNITLESS' || exp.num === 0) continue
    const moSym = resolveQudtAtom(ql)
    let found = false
    for (let i = 0; i < merged.length; i++) {
      const [esym, eexp] = merged[i]
      if (esym === moSym && (cancelRatios || (eexp.num > 0) === (exp.num > 0))) {
        const nextExp = expAdd(eexp, exp)
        if (nextExp.num === 0) merged.splice(i, 1)
        else merged[i] = [esym, nextExp]
        found = true
        break
      }
    }
    if (!found) merged.push([moSym, exp])
  }

  if (merged.length === 0) return '1'
  const num = merged.filter(([, e]) => e.num > 0).map(([sym, e]) => `${sym}${formatModelicaExp(e)}`)
  const den = merged.filter(([, e]) => e.num < 0).map(([sym, e]) => `${sym}${formatModelicaExp(expNeg(e))}`)
  if (den.length === 0) return num.join('.')
  const denStr = den.length === 1 ? den[0] : `(${den.join('.')})`
  const numStr = num.length > 0 ? num.join('.') : '1'
  return `${numStr}/${denStr}`
}

function splitQudtSideTokens (side) {
  if (!side) return []
  const placeholders = {}
  let work = side
  HYPHENATED_QUDT_ATOMS.forEach((hatom, idx) => {
    if (!work.includes(hatom)) return
    const ph = `__H${idx}__`
    const escaped = hatom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pfxGroup = QUDT_PREFIX_NAMES.join('|')
    const re = new RegExp(`(^|-|${pfxGroup})${escaped}(?=$|-|[+-]?\\d+)`, 'g')
    work = work.replace(re, (_, lead) => {
      placeholders[ph] = hatom
      return `${lead}${ph}`
    })
  })

  const out = []
  for (const rawTok of work.split('-')) {
    if (!rawTok) continue
    let tok = rawTok
    for (const [ph, hatom] of Object.entries(placeholders)) {
      tok = tok.split(ph).join(hatom)
    }
    if (hasOwn(QUDT_ATOM_TO_MODELICA, tok)) {
      out.push([tok, { num: 1, den: 1 }])
    } else {
      const m = ATOM_EXP_RE.exec(tok)
      if (m) out.push([m[1], { num: parseInt(m[2], 10), den: 1 }])
      else out.push([tok, { num: 1, den: 1 }])
    }
  }
  return out
}

function qudtStrToUnit (qudtStr, cancelRatios) {
  const local = stripUnitNs(qudtStr)
  if (!local) return null

  if (!cancelRatios && hasOwn(REVERSE_UNIT_MAP, local)) {
    return REVERSE_UNIT_MAP[local]
  }
  if (cancelRatios && hasOwn(REVERSE_UNIT_MAP, local)) {
    return formatFactorsToModelica(
      unitToQudt(REVERSE_UNIT_MAP[local], { cancelRatios: true }).factors,
      true
    )
  }

  let numPart = local
  let denPart = ''
  if (local.startsWith('PER-')) {
    numPart = ''
    denPart = local.slice(4)
  } else if (local.includes('-PER-')) {
    const idx = local.indexOf('-PER-')
    numPart = local.slice(0, idx)
    denPart = local.slice(idx + 5)
  }

  const factors = [
    ...splitQudtSideTokens(numPart),
    ...splitQudtSideTokens(denPart).map(([ql, exp]) => [ql, expNeg(exp)])
  ]
  return formatFactorsToModelica(factors, cancelRatios)
}

function qudtToUnit (qudtUnit, { cancelRatios = false } = {}) {
  if (qudtUnit === undefined || qudtUnit === null) return null
  if (typeof qudtUnit === 'string') {
    const s = qudtUnit.trim()
    return s ? qudtStrToUnit(s, cancelRatios) : null
  }
  if (Array.isArray(qudtUnit)) {
    return qudtUnit.length > 0 ? formatFactorsToModelica(qudtUnit, cancelRatios) : null
  }
  if (typeof qudtUnit === 'object') {
    if (qudtUnit.uri) return qudtStrToUnit(qudtUnit.uri, cancelRatios)
    if (Array.isArray(qudtUnit.factors) && qudtUnit.factors.length > 0) {
      return formatFactorsToModelica(qudtUnit.factors, cancelRatios)
    }
  }
  return null
}

function quantityToQudt (quantity) {
  if (quantity === undefined || quantity === null) return null
  let cand = String(quantity).trim()
  if (!cand) return null
  if (cand.includes('.') && (cand.startsWith('Modelica.') || cand.startsWith('SI.') || cand.startsWith('NonSI.'))) {
    cand = cand.split('.').pop()
  }
  if (EXACT_QUANTITY_KINDS.has(cand)) return `${QUDT_QK_NS}${cand}`
  if (hasOwn(MODELICA_TO_QUDT_QK, cand)) return `${QUDT_QK_NS}${MODELICA_TO_QUDT_QK[cand]}`
  if (cand.startsWith('Current.')) return `${QUDT_QK_NS}ElectricCurrent`
  if (cand.startsWith('Voltage.')) return `${QUDT_QK_NS}ElectricPotential`
  return null
}

function qudtToQuantity (qudtQuantityKind) {
  if (qudtQuantityKind === undefined || qudtQuantityKind === null) return null
  const local = stripQkNs(qudtQuantityKind)
  if (!local) return null
  if (hasOwn(QUDT_TO_MODELICA_QK, local)) return QUDT_TO_MODELICA_QK[local]
  if (EXACT_QUANTITY_KINDS.has(local) || hasOwn(MSL_TYPES, local)) return local
  return null
}

function resolveAttributes ({ unit, quantity, displayUnit, typeName }) {
  const shortType = typeName ? String(typeName).split('.').pop() : null
  const msl = shortType && hasOwn(MSL_TYPES, shortType) ? MSL_TYPES[shortType] : null
  const effUnit = (unit !== undefined && unit !== null) ? String(unit) : (msl ? msl[0] : null)
  const effQty = (quantity !== undefined && quantity !== null && String(quantity) !== '')
    ? String(quantity)
    : (msl ? (shortType || msl[1]) : null)
  const effDisp = (displayUnit !== undefined && displayUnit !== null) ? String(displayUnit) : (msl ? msl[2] : null)
  return { effUnit, effQty, effDisp }
}

function convertToQudt ({ unit = null, quantity = null, displayUnit = null, typeName = null, cancelRatios = false } = {}) {
  const { effUnit, effQty, effDisp } = resolveAttributes({ unit, quantity, displayUnit, typeName })
  return {
    qudtUnit: effUnit !== null ? unitToQudt(effUnit, { cancelRatios }) : null,
    qudtQuantityKind: effQty ? quantityToQudt(effQty) : null,
    displayUnit: effDisp
  }
}

function convertFromQudt ({ qudtUnit = null, qudtQuantityKind = null, displayUnit = null, cancelRatios = false } = {}) {
  return {
    unit: qudtUnit !== null ? qudtToUnit(qudtUnit, { cancelRatios }) : null,
    quantity: qudtQuantityKind ? qudtToQuantity(qudtQuantityKind) : null,
    displayUnit: displayUnit !== undefined ? displayUnit : null
  }
}

// --- Suggestion engine (difflib-equivalent SequenceMatcher + repairs + SI dimensions) ---

function matchingBlocksSum (a, alo, ahi, b, blo, bhi) {
  let bestI = alo
  let bestJ = blo
  let bestSize = 0
  for (let i = alo; i < ahi; i++) {
    for (let j = blo; j < bhi; j++) {
      let k = 0
      while (i + k < ahi && j + k < bhi && a.charCodeAt(i + k) === b.charCodeAt(j + k)) k++
      if (k > bestSize) {
        bestI = i
        bestJ = j
        bestSize = k
      }
    }
  }
  if (bestSize === 0) return 0
  let sum = bestSize
  if (alo < bestI && blo < bestJ) sum += matchingBlocksSum(a, alo, bestI, b, blo, bestJ)
  if (bestI + bestSize < ahi && bestJ + bestSize < bhi) {
    sum += matchingBlocksSum(a, bestI + bestSize, ahi, b, bestJ + bestSize, bhi)
  }
  return sum
}

function sequenceRatio (a, b) {
  const total = a.length + b.length
  if (total === 0) return 1
  if (a.length === 0 || b.length === 0) return 0
  return (2 * matchingBlocksSum(a, 0, a.length, b, 0, b.length)) / total
}

const WORD_SPLIT_RE = /[A-Z]+(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|\d+/g

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

const SYMBOL_CHAR_REPAIRS = [
  ['\u00b0C', 'degC'],
  ['\u00b0F', 'degF'],
  ['\u00b0R', 'degRk'],
  ['\u00b0K', 'K'],
  ['\u03a9', 'Ohm'],
  ['^', ''],
  ['*', '.'],
  ['\u00b7', '.']
]

const WORD_UNIT_REPAIRS = [
  ['deg_C', 'degC'], ['celsius', 'degC'],
  ['deg_F', 'degF'], ['fahrenheit', 'degF'],
  ['deg_R', 'degRk'], ['degR', 'degRk'],
  ['degK', 'K'], ['kelvin', 'K'],
  ['ohms', 'Ohm'], ['ohm', 'Ohm'],
  ['secs', 's'], ['sec', 's'],
  ['hrs', 'h'], ['hr', 'h']
].map(([pat, repl]) => [new RegExp(`\\b${pat}\\b`, 'g'), repl])

function tokenizeWords (text) {
  const matches = String(text).match(WORD_SPLIT_RE) || []
  const rawWords = matches.map(w => w.toLowerCase())
  const expanded = new Set(rawWords)
  for (const w of rawWords) {
    if (hasOwn(WORD_SYNONYMS, w)) {
      for (const syn of WORD_SYNONYMS[w]) expanded.add(syn)
    }
  }
  return { norm: rawWords.join(''), words: expanded }
}

let quantityIndexCache = null

function getQuantityIndex () {
  if (quantityIndexCache) return quantityIndexCache
  const qkDims = new Map()
  for (const [mslName, [moUnit, moQty]] of Object.entries(MSL_TYPES)) {
    const qkUri = quantityToQudt(mslName) || quantityToQudt(moQty)
    if (qkUri) {
      const qkLocal = qkUri.slice(QUDT_QK_NS.length)
      if (!qkDims.has(qkLocal)) {
        const dv = unitToQudt(moUnit).dimensionVector
        if (dv) qkDims.set(qkLocal, dv)
      }
    }
  }
  qkDims.set('LineicResistance', unitToQudt('Ohm/m').dimensionVector)
  qkDims.set('TemperatureRateOfChange', unitToQudt('K/s').dimensionVector)
  qkDims.set('TemperatureGradient', unitToQudt('K/m').dimensionVector)

  const aliasesByQk = new Map()
  for (const [moAlias, qkLocal] of Object.entries(MODELICA_TO_QUDT_QK)) {
    if (moAlias.endsWith('.') || moAlias === '1') continue
    if (!aliasesByQk.has(qkLocal)) aliasesByQk.set(qkLocal, [])
    aliasesByQk.get(qkLocal).push(moAlias)
  }

  const allQks = Array.from(new Set([
    ...EXACT_QUANTITY_KINDS,
    ...Object.values(MODELICA_TO_QUDT_QK)
  ])).sort()

  quantityIndexCache = allQks.map(qkLocal => {
    const moName = qudtToQuantity(qkLocal)
    const { norm, words } = tokenizeWords(qkLocal)
    const norms = new Set([norm])
    if (moName && moName !== qkLocal) {
      const moTok = tokenizeWords(moName)
      norms.add(moTok.norm)
      for (const w of moTok.words) words.add(w)
    }
    for (const alias of (aliasesByQk.get(qkLocal) || [])) {
      const alTok = tokenizeWords(alias)
      norms.add(alTok.norm)
      for (const w of alTok.words) words.add(w)
    }
    return {
      qkLocal,
      norms: Array.from(norms),
      words,
      dimVec: qkDims.get(qkLocal) || null,
      moName
    }
  })
  return quantityIndexCache
}

let unitIndexCache = null

function getUnitIndex () {
  if (unitIndexCache) return unitIndexCache
  const byDim = new Map()
  const byLower = new Map()
  const seenMo = new Set()

  function addLower (key, val) {
    const list = byLower.get(key) || []
    if (!list.includes(val)) list.push(val)
    byLower.set(key, list)
  }

  function register (moU, qudtLocal = null) {
    if (!moU) return
    if (!seenMo.has(moU)) {
      seenMo.add(moU)
      addLower(moU.toLowerCase(), moU)
    }
    let u
    try {
      u = unitToQudt(moU)
    } catch (_) {
      return
    }
    const ql = qudtLocal || (u.uri ? u.uri.slice(QUDT_UNIT_NS.length) : null)
    if (ql && u.dimensionVector) {
      const bucket = byDim.get(u.dimensionVector) || []
      if (!bucket.some(([m, q]) => m === moU && q === ql)) {
        bucket.push([moU, ql])
        byDim.set(u.dimensionVector, bucket)
      }
      addLower(ql.toLowerCase(), moU)
    }
  }

  for (const [moSym, [ql]] of Object.entries(ATOMIC_UNITS)) {
    register(moSym, ql)
  }
  for (const [, ql, moStr] of MINTED_COMPOUND_UNITS) {
    register(moStr, ql)
  }
  for (const ql of MINTED_PREFIXED_ATOMS) {
    const moU = qudtToUnit(ql)
    if (moU) register(moU, ql)
  }

  unitIndexCache = { byDim, byLower, allMoUnits: Array.from(seenMo).sort() }
  return unitIndexCache
}

function suggestQuantity (query, { unit = null, topK = 5 } = {}) {
  if (query === undefined || query === null) return []
  const q = String(query).trim()
  if (!q || topK <= 0) return []

  let targetDv = null
  if (unit) {
    try {
      targetDv = unitToQudt(unit).dimensionVector
    } catch (_) {
      targetDv = null
    }
  }

  const exactUri = quantityToQudt(q)
  const exactLocal = exactUri ? exactUri.slice(QUDT_QK_NS.length) : null
  const strippedQ = (q.startsWith('Modelica.') || q.startsWith('SI.') || q.startsWith('NonSI.'))
    ? q.split('.').pop()
    : q
  const { norm: qNorm, words: qWords } = tokenizeWords(strippedQ)
  const scored = []

  for (const { qkLocal, norms, words: cWords, dimVec, moName } of getQuantityIndex()) {
    const dimMatch = (targetDv && dimVec) ? (dimVec === targetDv) : null
    if (qkLocal === exactLocal) {
      scored.push({
        qudtUri: `${QUDT_QK_NS}${qkLocal}`,
        qudtCurie: `q:${qkLocal}`,
        modelicaName: moName,
        score: 1,
        dimensionMatch: dimMatch,
        reason: 'exact_match'
      })
      continue
    }

    let seqSim = 0
    for (const cNorm of norms) {
      const s = sequenceRatio(qNorm, cNorm)
      if (s > seqSim) seqSim = s
    }

    let inter = 0
    for (const w of qWords) {
      if (cWords.has(w)) inter++
    }
    const overlap = (qWords.size && cWords.size) ? (2 * inter) / (qWords.size + cWords.size) : 0
    const lexScore = Math.max(seqSim, 0.9 * overlap)

    let score = lexScore
    let reason = (overlap >= seqSim && overlap > 0) ? 'token_overlap' : 'lexical_similarity'

    if (dimMatch === true) {
      score = Math.min(0.99, lexScore >= 0.25 ? lexScore + 0.25 : 0.55 + 0.3 * lexScore)
      reason = lexScore >= 0.35 ? 'lexical+dimension_match' : 'dimension_match'
    } else if (dimMatch === false) {
      score = Math.max(0, lexScore - 0.1)
    }

    if (score >= 0.3) {
      scored.push({
        qudtUri: `${QUDT_QK_NS}${qkLocal}`,
        qudtCurie: `q:${qkLocal}`,
        modelicaName: moName,
        score: Math.round(score * 1000) / 1000,
        dimensionMatch: dimMatch,
        reason
      })
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if ((b.dimensionMatch === true) !== (a.dimensionMatch === true)) {
      return b.dimensionMatch === true ? 1 : -1
    }
    return a.qudtCurie.length - b.qudtCurie.length
  })
  return scored.slice(0, topK)
}

function repairUnitString (raw) {
  let s = raw.trim()
  for (const [bad, good] of SYMBOL_CHAR_REPAIRS) {
    s = s.split(bad).join(good)
  }
  for (const [pat, repl] of WORD_UNIT_REPAIRS) {
    s = s.replace(pat, repl)
  }
  s = s.replace(/\s+/g, '.')
  s = s.replace(/(?<!inH)(\d)([A-Za-z\u03bc])/g, '$1.$2')
  return s
}

function suggestUnit (query, { topK = 5 } = {}) {
  if (query === undefined || query === null) return []
  const raw = String(query).trim()
  if (!raw || topK <= 0) return []

  const { byDim, byLower, allMoUnits } = getUnitIndex()
  const results = []
  const seenUnits = new Set()

  function add (moU, score, dimMatch, reason) {
    if (seenUnits.has(moU)) return
    let qu
    try {
      qu = unitToQudt(moU)
    } catch (_) {
      return
    }
    seenUnits.add(moU)
    results.push({
      modelicaUnit: moU,
      qudtUri: qu.uri,
      qudtCurie: qu.curie,
      score: Math.round(score * 1000) / 1000,
      dimensionMatch: dimMatch,
      reason
    })
  }

  let parsedDirect = null
  try {
    parsedDirect = unitToQudt(raw)
  } catch (_) {}

  if (parsedDirect !== null) {
    if (parsedDirect.uri !== null) {
      add(raw, 1, true, 'exact_match')
    }
    if (parsedDirect.dimensionVector) {
      for (const [moCand] of (byDim.get(parsedDirect.dimensionVector) || [])) {
        add(moCand, parsedDirect.uri === null ? 0.9 : 0.8, true, 'same_dimension_vector')
      }
    }
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, topK)
  }

  for (const moCand of (byLower.get(raw.toLowerCase()) || [])) {
    add(moCand, 0.93, null, 'case_or_alias_match')
  }

  const repaired = repairUnitString(raw)
  if (repaired !== raw) {
    try {
      const repQu = unitToQudt(repaired)
      add(repaired, 0.95, repQu.dimensionVector ? true : null, 'normalized_syntax')
      if (repQu.uri === null && repQu.dimensionVector) {
        for (const [moCand] of (byDim.get(repQu.dimensionVector) || [])) {
          add(moCand, 0.85, true, 'same_dimension_vector')
        }
      }
    } catch (_) {
      for (const moCand of (byLower.get(repaired.toLowerCase()) || [])) {
        add(moCand, 0.9, null, 'normalized_syntax')
      }
    }
  }

  const rLow = raw.toLowerCase()
  const lexCands = []
  for (const moCand of allMoUnits) {
    if (seenUnits.has(moCand)) continue
    const sim = sequenceRatio(rLow, moCand.toLowerCase())
    if (sim >= 0.55) lexCands.push([sim, moCand])
  }
  lexCands.sort((a, b) => b[0] - a[0])
  for (const [sim, moCand] of lexCands.slice(0, topK)) {
    add(moCand, 0.8 * sim, null, 'lexical_similarity')
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, topK)
}

function formatUnitWarning (value) {
  const suggestions = suggestUnit(value, { topK: 3 })
    .filter(s => s.qudtCurie !== null)
    .map(s => `${s.modelicaUnit} (${s.qudtCurie})`)
  const hint = suggestions.length > 0 ? ` Did you mean: ${suggestions.join(', ')}?` : ''
  return `Unit ${value} could not be mapped to QUDT. Using S231:unit with literal value ${value}.${hint}`
}

function formatQuantityWarning (value, unit = null) {
  const suggestions = suggestQuantity(value, { unit, topK: 3 })
    .map(s => `${s.modelicaName || s.qudtCurie.slice(2)} (${s.qudtCurie})`)
  const hint = suggestions.length > 0 ? ` Did you mean: ${suggestions.join(', ')}?` : ''
  return `Quantity kind ${value} could not be mapped to QUDT. Using S231:quantity with literal value ${value}.${hint}`
}

// --- CXF (JSON-LD & rdflib) bidirectional helpers ---

const DEFAULT_CXF_PREFIXES = {
  qudt: QUDT_SCHEMA_NS,
  unit: QUDT_UNIT_NS,
  q: QUDT_QK_NS,
  quantitykind: QUDT_QK_NS,
  S231: S231_NS
}

function expandIri (term, prefixes) {
  if (typeof term !== 'string') return null
  const idx = term.indexOf(':')
  if (idx > 0 && !term.startsWith('http://') && !term.startsWith('https://')) {
    const pfx = term.slice(0, idx)
    if (hasOwn(prefixes, pfx) && typeof prefixes[pfx] === 'string') {
      return prefixes[pfx] + term.slice(idx + 1)
    }
  }
  return term
}

function extractNodeId (val, prefixes) {
  if (!val) return null
  const item = Array.isArray(val) ? val[0] : val
  if (typeof item === 'string') return expandIri(item, prefixes)
  if (typeof item === 'object' && item['@id']) return expandIri(item['@id'], prefixes)
  return null
}

function extractLiteral (val) {
  if (val === undefined || val === null) return null
  const item = Array.isArray(val) ? val[0] : val
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  if (typeof item === 'object' && hasOwn(item, '@value')) return String(item['@value'])
  return null
}

function toCxf ({ unit = null, quantity = null, displayUnit = null, typeName = null, cancelRatios = false, warn = null } = {}) {
  const { effUnit, effQty, effDisp } = resolveAttributes({ unit, quantity, displayUnit, typeName })
  const out = {}

  if (effUnit !== null && effUnit !== '') {
    let qu = null
    try {
      qu = unitToQudt(effUnit, { cancelRatios })
    } catch (_) {}
    if (qu && qu.curie) {
      out['qudt:hasUnit'] = { '@id': qu.curie }
    } else {
      out['S231:unit'] = effUnit
      if (typeof warn === 'function') warn(formatUnitWarning(effUnit))
    }
  }

  if (effDisp !== null && effDisp !== '') {
    out['S231:displayUnit'] = effDisp
  }

  if (effQty !== null && effQty !== '') {
    const qkUri = quantityToQudt(effQty)
    if (qkUri) {
      out['qudt:hasQuantityKind'] = { '@id': `q:${qkUri.slice(QUDT_QK_NS.length)}` }
    } else {
      out['S231:quantity'] = effQty
      if (typeof warn === 'function') warn(formatQuantityWarning(effQty, effUnit))
    }
  }

  return out
}

function fromCxfRdfNode (subject, graph, cancelRatios) {
  const anyVal = (ns, local) => {
    const st = graph.statementsMatching(subject, { termType: 'NamedNode', value: ns + local }, undefined)[0]
    return st ? st.object.value : null
  }

  let unit = null
  const qudtUnitUri = anyVal(QUDT_SCHEMA_NS, 'hasUnit')
  if (qudtUnitUri) {
    try {
      unit = qudtToUnit(qudtUnitUri, { cancelRatios })
    } catch (_) {}
  }
  if (!unit) {
    const factorStmts = graph.statementsMatching(subject, { termType: 'NamedNode', value: `${QUDT_SCHEMA_NS}hasFactorUnit` }, undefined)
    if (factorStmts.length > 0) {
      const factors = []
      for (const st of factorStmts) {
        const fu = anyValOn(graph, st.object, QUDT_SCHEMA_NS, 'hasUnit') || anyValOn(graph, st.object, QUDT_SCHEMA_NS, 'scalingOf')
        const fe = anyValOn(graph, st.object, QUDT_SCHEMA_NS, 'exponent')
        if (fu) factors.push([fu, fe !== null ? fe : 1])
      }
      if (factors.length > 0) {
        try {
          unit = qudtToUnit(factors, { cancelRatios })
        } catch (_) {}
      }
    }
  }
  if (!unit) unit = anyVal(S231_NS, 'unit')

  let quantity = null
  const qkUri = anyVal(QUDT_SCHEMA_NS, 'hasQuantityKind')
  if (qkUri) quantity = qudtToQuantity(qkUri)
  if (!quantity) quantity = anyVal(S231_NS, 'quantity')

  let displayUnit = anyVal(S231_NS, 'displayUnit')
  if (!displayUnit) {
    const legacyDispUri = anyVal(S231_NS, 'hasDisplayUnit')
    if (legacyDispUri) {
      try {
        displayUnit = qudtToUnit(legacyDispUri, { cancelRatios })
      } catch (_) {}
    }
  }

  return { unit: unit || null, quantity: quantity || null, displayUnit: displayUnit || null }
}

function anyValOn (graph, subj, ns, local) {
  const st = graph.statementsMatching(subj, { termType: 'NamedNode', value: ns + local }, undefined)[0]
  return st ? st.object.value : null
}

function fromCxf (node, { graph = null, context = null, cancelRatios = false } = {}) {
  if (!node || typeof node !== 'object') {
    return { unit: null, quantity: null, displayUnit: null }
  }
  if (graph && typeof graph.statementsMatching === 'function') {
    return fromCxfRdfNode(node, graph, cancelRatios)
  }

  const prefixes = Object.assign({}, DEFAULT_CXF_PREFIXES)
  const ctx = context || node['@context']
  if (ctx && typeof ctx === 'object' && !Array.isArray(ctx)) {
    for (const [k, v] of Object.entries(ctx)) {
      if (typeof v === 'string') prefixes[k] = v
    }
  }

  const expanded = {}
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('@')) continue
    expanded[expandIri(k, prefixes)] = v
  }

  let unit = null
  const unitIri = extractNodeId(expanded[`${QUDT_SCHEMA_NS}hasUnit`], prefixes)
  if (unitIri) {
    try {
      unit = qudtToUnit(unitIri, { cancelRatios })
    } catch (_) {}
  }
  if (!unit && expanded[`${QUDT_SCHEMA_NS}hasFactorUnit`]) {
    const rawFactors = Array.isArray(expanded[`${QUDT_SCHEMA_NS}hasFactorUnit`])
      ? expanded[`${QUDT_SCHEMA_NS}hasFactorUnit`]
      : [expanded[`${QUDT_SCHEMA_NS}hasFactorUnit`]]
    const factors = []
    for (const fNode of rawFactors) {
      if (!fNode || typeof fNode !== 'object') continue
      const fExp = {}
      for (const [fk, fv] of Object.entries(fNode)) {
        if (!fk.startsWith('@')) fExp[expandIri(fk, prefixes)] = fv
      }
      const fu = extractNodeId(fExp[`${QUDT_SCHEMA_NS}hasUnit`] || fExp[`${QUDT_SCHEMA_NS}scalingOf`], prefixes)
      const fe = extractLiteral(fExp[`${QUDT_SCHEMA_NS}exponent`])
      if (fu) factors.push([fu, fe !== null ? fe : 1])
    }
    if (factors.length > 0) {
      try {
        unit = qudtToUnit(factors, { cancelRatios })
      } catch (_) {}
    }
  }
  if (!unit) unit = extractLiteral(expanded[`${S231_NS}unit`])

  let quantity = null
  const qkIri = extractNodeId(expanded[`${QUDT_SCHEMA_NS}hasQuantityKind`], prefixes)
  if (qkIri) quantity = qudtToQuantity(qkIri)
  if (!quantity) quantity = extractLiteral(expanded[`${S231_NS}quantity`])

  let displayUnit = extractLiteral(expanded[`${S231_NS}displayUnit`])
  if (!displayUnit) {
    const legacyDisp = extractNodeId(expanded[`${S231_NS}hasDisplayUnit`], prefixes)
    if (legacyDisp) {
      try {
        displayUnit = qudtToUnit(legacyDisp, { cancelRatios })
      } catch (_) {}
    }
  }

  return { unit: unit || null, quantity: quantity || null, displayUnit: displayUnit || null }
}

module.exports = {
  QUDT_DV_NS,
  QUDT_QK_NS,
  QUDT_SCHEMA_NS,
  QUDT_UNIT_NS,
  S231_NS,
  convertFromQudt,
  convertToQudt,
  formatQuantityWarning,
  formatUnitWarning,
  fromCxf,
  quantityToQudt,
  qudtToQuantity,
  qudtToUnit,
  suggestQuantity,
  suggestUnit,
  toCxf,
  unitToQudt
}
