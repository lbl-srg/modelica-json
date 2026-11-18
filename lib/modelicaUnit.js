'use strict'

/*
 * Parses and formats Modelica unit expressions (MLS section 19.1).
 *
 * A parsed unit is a list of factors { symbol, exp }. `symbol` is a known unit
 * symbol with its prefix, such as 'kg', and `exp` is an exact { num, den }.
 * A dimensionless unit has no factors. Factors of the same symbol with opposite
 * signs are kept apart, because kg/kg and 1 are different units in QUDT.
 */

const {
  COMPOUND_SYMBOLS,
  PREFIXABLE_UNITS,
  SYMBOL_ALIASES,
  UNIT_PREFIXES,
  UNPREFIXED_UNITS
} = require('./qudtVocab')

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

function gcd (a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

function makeExp (num, den = 1) {
  if (den === 0) throw new Error('Zero denominator in unit exponent')
  const divisor = gcd(num, den) || 1
  return { num: num / divisor, den: den / divisor }
}

const addExp = (a, b) => makeExp(a.num * b.den + b.num * a.den, a.den * b.den)
const mulExp = (a, b) => makeExp(a.num * b.num, a.den * b.den)
const negate = factors => factors.map(({ symbol, exp }) => ({ symbol, exp: { num: -exp.num, den: exp.den } }))

const canonicalSymbol = symbol => hasOwn(SYMBOL_ALIASES, symbol) ? SYMBOL_ALIASES[symbol] : symbol
const isPrefixable = symbol => hasOwn(PREFIXABLE_UNITS, canonicalSymbol(symbol))
const isUnitSymbol = symbol => isPrefixable(symbol) || hasOwn(UNPREFIXED_UNITS, symbol)

/** Returns the unprefixed symbol of a factor. */
function baseSymbol (symbol) {
  return splitOperand(symbol).base
}

/** Splits a unit operand into prefix and symbol. A whole-word symbol wins. */
function splitOperand (operand) {
  if (isUnitSymbol(operand) || hasOwn(COMPOUND_SYMBOLS, operand)) {
    return { prefix: '', base: operand }
  }
  for (const length of [2, 1]) {
    const prefix = operand.slice(0, length)
    const base = operand.slice(length)
    if (hasOwn(UNIT_PREFIXES, prefix) && (isPrefixable(base) || isPrefixableCompound(base))) {
      return { prefix, base }
    }
  }
  throw new Error(`Unrecognized Modelica unit symbol: ${operand}`)
}

function isPrefixableCompound (symbol) {
  return hasOwn(COMPOUND_SYMBOLS, symbol) && isPrefixable(parseUnit(COMPOUND_SYMBOLS[symbol])[0].symbol)
}

function operandFactors (operand) {
  const { prefix, base } = splitOperand(operand)
  const factors = hasOwn(COMPOUND_SYMBOLS, base)
    ? parseUnit(COMPOUND_SYMBOLS[base])
    : [{ symbol: canonicalSymbol(base), exp: makeExp(1) }]
  return factors.map((factor, i) => i === 0 ? { ...factor, symbol: prefix + factor.symbol } : factor)
}

/** Combines factors of the same symbol and the same sign, such as m.m to m2. */
function mergeFactors (factors) {
  const merged = []
  for (const { symbol, exp } of factors) {
    const same = merged.find(f => f.symbol === symbol && (f.exp.num > 0) === (exp.num > 0))
    if (same) same.exp = addExp(same.exp, exp)
    else if (exp.num !== 0) merged.push({ symbol, exp })
  }
  return merged
}

/**
 * Parses a unit expression into factors.
 *
 * @param {string} text Unit expression.
 * @return {Array} The factors, in order of appearance.
 * @throws {Error} If the syntax is invalid or a symbol is unknown.
 */
function parseUnit (text) {
  let pos = 0

  const fail = () => { throw new Error(`Invalid Modelica unit syntax in "${text}" at position ${pos}`) }
  const accept = char => {
    if (text[pos] !== char) return false
    pos++
    return true
  }
  const match = regex => {
    regex.lastIndex = pos
    const result = regex.exec(text)
    if (result) pos = regex.lastIndex
    return result
  }

  function parseParenthesized () {
    const factors = parseExpression()
    if (!accept(')')) fail()
    return factors
  }

  // unit-exponent: [ "+" | "-" ] ( UNSIGNED-INTEGER | "(" UNSIGNED-INTEGER "/" UNSIGNED-INTEGER ")" )
  function parseExponent () {
    const result = match(/([+-]?)(?:(\d+)|\((\d+)\/(\d+)\))/y)
    if (!result) return makeExp(1)
    const sign = result[1] === '-' ? -1 : 1
    return result[2] !== undefined
      ? makeExp(sign * Number(result[2]))
      : makeExp(sign * Number(result[3]), Number(result[4]))
  }

  // unit-factor: unit-operand [ unit-exponent ]
  function parseFactor () {
    const operand = match(/[A-Za-z_%]+/y)
    if (!operand) fail()
    const exp = parseExponent()
    return operandFactors(operand[0]).map(f => ({ symbol: f.symbol, exp: mulExp(f.exp, exp) }))
  }

  // unit-numerator: "1" | unit-factors | "(" unit-expression ")"
  function parseNumerator () {
    if (accept('(')) return parseParenthesized()
    if (accept('1')) return []
    const factors = parseFactor()
    while (accept('.')) factors.push(...parseFactor())
    return factors
  }

  // unit-expression: unit-numerator [ "/" unit-denominator ]
  // unit-denominator: unit-factor | "(" unit-expression ")"
  function parseExpression () {
    const numerator = parseNumerator()
    if (!accept('/')) return numerator
    return [...numerator, ...negate(accept('(') ? parseParenthesized() : parseFactor())]
  }

  const factors = parseExpression()
  if (pos !== text.length) fail()
  return mergeFactors(factors)
}

function formatExponent ({ num, den }) {
  if (den !== 1) return `(${num}/${den})`
  return num === 1 ? '' : String(num)
}

/** Formats factors as a Modelica unit expression. */
function formatUnit (factors) {
  const format = list => list.map(({ symbol, exp }) => symbol + formatExponent(exp))
  const numerator = format(factors.filter(f => f.exp.num > 0))
  const denominator = format(negate(factors.filter(f => f.exp.num < 0)))
  const top = numerator.join('.') || '1'
  if (denominator.length === 0) return top
  const bottom = denominator.join('.')
  return `${top}/${denominator.length > 1 ? `(${bottom})` : bottom}`
}

/** Returns a key that is equal for units with the same factors in any order. */
function unitKey (factors) {
  return factors.map(({ symbol, exp }) => `${symbol}^${exp.num}/${exp.den}`).sort().join('.')
}

module.exports = {
  baseSymbol,
  formatUnit,
  makeExp,
  mergeFactors,
  negate,
  operandFactors,
  parseUnit,
  unitKey
}
