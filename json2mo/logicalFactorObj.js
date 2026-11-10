function parse (content, rawJson = false) {
  const util = require('util')

  let moOutput = ''
  if (content.not != null) {
    moOutput += 'not '
  }
  if (content.arithmetic_expressions) {
    moOutput += parseOperand(content.arithmetic_expressions[0], rawJson)
    if (content.relation_operator) {
      moOutput += ' '
      moOutput += util.format('%s', content.relation_operator)
      moOutput += ' '
      moOutput += parseOperand(content.arithmetic_expressions[1], rawJson)
    }
  }
  return moOutput
}

/**
 * Render one entry of `arithmetic_expressions`.
 *
 * `lib/jsonquery.js` stores an entry in one of three ways: as a plain string
 * (identifiers, literals, function calls, subscripted references and any
 * arithmetic it already flattened), as `{name: …}` for graphical annotations
 * and for the expressions `lib/expressionEvaluation.js` synthesizes, or — when
 * the source parenthesised a sub-expression — as nested term/factor/primary
 * objects. Reading `.name` off all three is what made every operand of a
 * relation serialise as the string `undefined`.
 *
 * Parentheses are restored at, and only at, the array node: `jsonquery#primary`
 * returns a string for every alternative except `output_expression_list`, so an
 * array is exactly a parenthesised group in the source. Emitting them anywhere
 * else would either duplicate them or move them, and a group that moves changes
 * what the expression means — `and` binds tighter than `or`.
 *
 * @param entry one entry of `arithmetic_expressions`
 * @param rawJson passed through to the expression parser
 * @returns {string} the entry in Modelica syntax
 */
function parseOperand (entry, rawJson) {
  const util = require('util')
  const expressionParser = require('./expression')

  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return util.format('%s', entry)
  }
  if (Array.isArray(entry)) {
    // output_expression_list: a parenthesised group in the source
    return '(' + entry.map(ele => expressionParser.parse(ele, rawJson).trim()).join(', ') + ')'
  }
  if (entry.name !== undefined) {
    return util.format('%s', entry.name)
  }
  if (entry.simple_expression !== undefined || entry.if_expression !== undefined) {
    return expressionParser.parse(entry, rawJson)
  }
  if (entry.terms !== undefined) {
    // arithmetic expression: {addOps, terms}. One addOps entry per term means
    // the first term carries a leading sign.
    const terms = entry.terms.map(term => parseOperand(term, rawJson))
    const addOps = entry.addOps || []
    const parts = []
    if (addOps.length === terms.length) {
      for (let i = 0; i < terms.length; i++) {
        parts.push(addOps[i] + terms[i])
      }
    } else {
      parts.push(terms[0])
      for (let i = 0; i < addOps.length; i++) {
        parts.push(addOps[i] + terms[i + 1])
      }
    }
    return parts.join(' ')
  }
  if (entry.factors !== undefined) {
    // term: {operators, factors}
    const factors = entry.factors.map(factor => parseOperand(factor, rawJson))
    const operators = entry.operators || []
    let moOutput = factors[0]
    for (let i = 0; i < operators.length; i++) {
      moOutput += operators[i] + factors[i + 1]
    }
    return moOutput
  }
  if (entry.primary1 !== undefined) {
    // factor: {operator, primary1, primary2}, where operator is '^' or '.^'
    let moOutput = parseOperand(entry.primary1, rawJson)
    if (entry.operator) {
      moOutput += entry.operator + parseOperand(entry.primary2, rawJson)
    }
    return moOutput
  }
  // An unrecognised shape is emitted verbatim: visibly wrong beats a plausible
  // expression that quietly means something else.
  return util.format('%s', JSON.stringify(entry))
}

module.exports = { parse }
