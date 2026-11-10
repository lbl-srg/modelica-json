'use strict'
const as = require('assert')
const mo = require('mocha')
const expressionParser = require('../json2mo/expression.js')

/**
 * Build the expression wrapper the parsers expect around a single logical
 * factor, so a test states only the factor it is about.
 */
function guard (logicalFactor) {
  return {
    simple_expression: {
      logical_expression: { logical_or: [{ logical_and: [logicalFactor] }] }
    }
  }
}

mo.describe('json2mo/expression.js', function () {
  mo.describe('operands of a logical factor', function () {
    // lib/jsonquery.js stores an operand as a plain string, and only wraps it
    // in {name: ...} for graphical annotations; lib/expressionEvaluation.js
    // synthesizes the same wrapped shape. Both have to render.
    mo.it('renders a plain string operand', function () {
      as.equal(expressionParser.parse(guard({ arithmetic_expressions: ['have_a'] })), 'have_a')
    })
    mo.it('renders a relation between plain string operands', function () {
      as.equal(
        expressionParser.parse(guard({ arithmetic_expressions: ['k', '0'], relation_operator: '>' })),
        'k > 0')
    })
    mo.it('renders a negated plain string operand', function () {
      as.equal(
        expressionParser.parse(guard({ not: true, arithmetic_expressions: ['have_a'] })),
        'not have_a')
    })
    mo.it('renders a {name} operand unchanged', function () {
      // The shape lib/expressionEvaluation.js builds when it distributes
      // parentheses across a relation; it must keep rendering byte-identically.
      as.equal(
        expressionParser.parse(guard({
          not: true,
          arithmetic_expressions: [{ name: '(x' }, { name: 'y)' }],
          relation_operator: '>'
        })),
        'not (x > y)')
    })
    mo.it('restores the parentheses of a grouped operand', function () {
      // An array is how jsonquery stores output_expression_list, i.e. exactly a
      // parenthesised group in the source. Dropping it would let `and` bind
      // tighter than the source intended.
      const grouped = {
        simple_expression: {
          logical_expression: {
            logical_or: [
              { logical_and: [{ arithmetic_expressions: ['have_a'] }] },
              { logical_and: [{ arithmetic_expressions: ['have_b'] }] }
            ]
          }
        }
      }
      as.equal(
        expressionParser.parse(guard({ arithmetic_expressions: [[grouped]] })),
        '(have_a or have_b)')
    })
    mo.it('renders an unrecognised operand shape verbatim', function () {
      // Visibly wrong beats a plausible expression that means something else.
      as.equal(
        expressionParser.parse(guard({ arithmetic_expressions: [{ unexpected: 1 }] })),
        '{"unexpected":1}')
    })
  })
})
