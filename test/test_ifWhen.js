'use strict'
// Tests that if-equations, if-statements, when-equations and when-statements
// keep their conditions and the equations or statements of each branch, in
// the raw-json and json outputs, see
// https://github.com/lbl-srg/modelica-json/issues/336 and
// https://github.com/lbl-srg/modelica-json/issues/346
const as = require('assert')
const mo = require('mocha')
const fs = require('fs')
const path = require('path')
const Ajv = require('ajv')
const antlr4 = require('antlr4/index')
const ModelicaParser = require('../jsParser/antlrFiles/modelicaParser').modelicaParser
const ModelicaLexer = require('../jsParser/antlrFiles/modelicaLexer').modelicaLexer
const Stored_definitionVisitor = require('../jsParser/parser/Stored_definitionVisitor').Stored_definitionVisitor // eslint-disable-line camelcase
const jq = require('../lib/jsonquery.js')
const expressionParser = require('../json2mo/expression.js')
const equationParser = require('../json2mo/equation.js')
const statementParser = require('../json2mo/statement.js')
const storedDefinitionParser = require('../json2mo/storedDefinition.js')

const equationModel = `
model IfWhenEquations "If-equations and when-equations"
  parameter Boolean b = true "Switch";
  parameter Integer n = 1 "Branch selector";
  Real x "Variable set by an if-equation";
  Real y "Variable set by an if-equation";
  Real v(start = 1, fixed = true) "State reinitialized by a when-equation";
  discrete Real w(start = 0, fixed = true) "Variable set by a when-equation";
equation
  der(v) = -v;
  if n == 1 then
    x = 1;
    y = 2 "Second equation of the first branch";
  elseif n == 2 then
    x = 3;
    y = 4;
  elseif n == 3 then
    if b then
      x = 5;
    else
      x = 6;
    end if;
    y = 7;
  else
    x = 8;
    y = 9;
  end if;
  when {v < 0.5, v < 0.2} then
    w = pre(w) + 1;
    reinit(v, 1);
  elsewhen time > 10 then
    w = 0;
  end when;
end IfWhenEquations;
`

const statementModel = `
model IfWhenStatements "If-statements and when-statements"
  parameter Integer n = 1 "Branch selector";
  Real y "Variable set by an if-statement";
  Real s "Variable set by an if-statement";
  discrete Real z(start = 0, fixed = true) "Variable set by a when-statement";
algorithm
  if n == 1 then
    y := 1;
    s := 2;
  elseif n == 2 then
  elseif n == 3 then
    s := 0;
    for i in 1:3 loop
      s := s + i;
    end for;
    y := s;
  else
    y := 3;
  end if;
  when time > 0.5 then
    z := pre(z) + 1;
  elsewhen {time > 0.7, time > 0.9} then
    z := pre(z) - 1;
    s := z;
  elsewhen time > 2 then
  end when;
end IfWhenStatements;
`

/** Error listener that turns syntax errors into exceptions. */
class ThrowingErrorListener extends antlr4.error.ErrorListener {
  syntaxError (recognizer, offendingSymbol, line, column, msg) {
    throw new SyntaxError('line ' + line + ':' + column + ' ' + msg)
  }
}

/**
 * Parse Modelica source text into the raw-json representation, as
 * lib/modelicaToJSON.js does for a file, but fail on any syntax error
 * rather than letting the parser recover from it.
 */
function toRawJson (source) {
  const lexer = new ModelicaLexer(new antlr4.InputStream(source))
  lexer.removeErrorListeners()
  lexer.addErrorListener(new ThrowingErrorListener())
  const parser = new ModelicaParser(new antlr4.CommonTokenStream(lexer))
  parser.removeErrorListeners()
  parser.addErrorListener(new ThrowingErrorListener())
  const visitor = new Stored_definitionVisitor()
  return JSON.parse(JSON.stringify(visitor.visitStored_definition(parser.stored_definition())))
}

function rawSections (raw) {
  return raw.final_class_definitions[0].class_definition.class_specifier.long_class_specifier.composition.element_sections
}

function jsonSections (json) {
  return json.stored_class_definitions[0].class_specifier.long_class_specifier.composition.element_sections
}

/** Render a json expression, equation or statement as Modelica text. */
function exp (e) { return expressionParser.parse(e).trim() }
function equ (e) { return equationParser.parse(e).trim() }
function sta (s) { return statementParser.parse(s).trim() }

mo.describe('if and when clauses', function () {
  const rawEqu = toRawJson(equationModel)
  const rawSta = toRawJson(statementModel)
  const jsonEqu = jq.simplifyModelicaJSON(rawEqu)
  const jsonSta = jq.simplifyModelicaJSON(rawSta)

  mo.describe('raw-json', function () {
    mo.it('keeps the branches of an if-equation', function () {
      const ifEqu = rawSections(rawEqu)[0].equation_section.equations[1].if_equation
      as.deepEqual(ifEqu.if_elseif.map(b => b.then.length), [2, 2, 2])
      ifEqu.if_elseif.forEach(b => as.ok(b.condition.simple_expression, 'missing condition'))
      as.equal(ifEqu.else_equation.length, 2)
      // The nested if-equation of the third branch keeps its own branches.
      const nested = ifEqu.if_elseif[2].then[0].if_equation
      as.deepEqual(nested.if_elseif.map(b => b.then.length), [1])
      as.equal(nested.else_equation.length, 1)
    })
    mo.it('keeps the branches of a when-equation', function () {
      const wheEqu = rawSections(rawEqu)[0].equation_section.equations[2].when_equation
      as.deepEqual(wheEqu.when_elsewhen.map(b => b.then.length), [2, 1])
      wheEqu.when_elsewhen.forEach(b => as.ok(b.condition.simple_expression, 'missing condition'))
    })
    mo.it('keeps the branches of an if-statement, including an empty one', function () {
      const ifSta = rawSections(rawSta)[0].algorithm_section.statements[0].if_statement
      as.deepEqual(ifSta.if_elseif.map(b => b.then.length), [2, 0, 3])
      ifSta.if_elseif.forEach(b => as.ok(b.condition.simple_expression, 'missing condition'))
      as.equal(ifSta.else_statement.length, 1)
    })
    mo.it('keeps the branches of a when-statement', function () {
      const wheSta = rawSections(rawSta)[0].algorithm_section.statements[1].when_statement
      as.deepEqual(wheSta.when_elsewhen.map(b => b.then.length), [1, 2, 0])
      wheSta.when_elsewhen.forEach(b => as.ok(b.condition.simple_expression, 'missing condition'))
    })
  })

  mo.describe('json', function () {
    mo.it('keeps the conditions and equations of an if-equation', function () {
      const ifEqu = jsonSections(jsonEqu)[0].equation_section.equation[1].if_equation
      as.deepEqual(ifEqu.if_elseif.map(b => exp(b.condition)), ['n == 1', 'n == 2', 'n == 3'])
      // Each equation of a branch is wrapped as {equation: ...}, see
      // if_elseIfEquation in schema-modelica.json.
      as.deepEqual(ifEqu.if_elseif.map(b => b.then.map(e => equ(e.equation))), [
        ['x=1', 'y=2\n\t"Second equation of the first branch"'],
        ['x=3', 'y=4'],
        [equ(ifEqu.if_elseif[2].then[0].equation), 'y=7']
      ])
      as.deepEqual(ifEqu.else_equation.map(equ), ['x=8', 'y=9'])
      const nested = ifEqu.if_elseif[2].then[0].equation.if_equation
      as.deepEqual(nested.if_elseif.map(b => exp(b.condition)), ['b'])
      as.deepEqual(nested.if_elseif[0].then.map(e => equ(e.equation)), ['x=5'])
      as.deepEqual(nested.else_equation.map(equ), ['x=6'])
    })
    mo.it('keeps the conditions and equations of a when-equation', function () {
      const wheEqu = jsonSections(jsonEqu)[0].equation_section.equation[2].when_equation
      as.deepEqual(wheEqu.map(b => exp(b.condition)), ['{v < 0.5,v < 0.2}', 'time > 10'])
      as.deepEqual(wheEqu.map(b => b.then.map(equ)), [['w=pre(w) +1', 'reinit (v, 1)'], ['w=0']])
    })
    mo.it('keeps the conditions and statements of an if-statement', function () {
      const ifSta = jsonSections(jsonSta)[0].algorithm_section.statement[0].if_statement
      as.deepEqual(ifSta.if_elseif.map(b => exp(b.condition)), ['n == 1', 'n == 2', 'n == 3'])
      const thens = ifSta.if_elseif.map(b => b.then.map(sta))
      as.deepEqual(thens[0], ['y:=1', 's:=2'])
      as.deepEqual(thens[1], [])
      as.equal(thens[2].length, 3)
      as.equal(thens[2][0], 's:=0')
      as.ok(ifSta.if_elseif[2].then[1].for_statement, 'expected a for-statement in the third branch')
      as.equal(thens[2][2], 'y:=s')
      as.deepEqual(ifSta.else_statement.map(sta), ['y:=3'])
    })
    mo.it('keeps the conditions and statements of a when-statement', function () {
      const wheSta = jsonSections(jsonSta)[0].algorithm_section.statement[1].when_statement
      as.deepEqual(wheSta.map(b => exp(b.condition)), ['time > 0.5', '{time > 0.7,time > 0.9}', 'time > 2'])
      as.deepEqual(wheSta.map(b => b.then.map(sta)), [['z:=pre(z) +1'], ['z:=pre(z) -1', 's:=z'], []])
    })
    mo.it('validates against schema-modelica.json', function () {
      const ajv = new Ajv({ allErrors: true, schemaId: '$id', strict: false })
      const validate = ajv.compile(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'schema-modelica.json'), 'utf8')))
      for (const json of [jsonEqu, jsonSta]) {
        as.ok(validate(json), ajv.errorsText(validate.errors))
      }
    })
    mo.it('round-trips through json2mo', function () {
      // Only the equation and algorithm sections are compared, as json2mo does
      // not reproduce every part of the declarations. toRawJson throws if
      // json2mo writes invalid Modelica, such as a branch without 'then'.
      for (const json of [jsonEqu, jsonSta]) {
        const moText = storedDefinitionParser.parse(json)
        const json2 = jq.simplifyModelicaJSON(toRawJson(moText))
        as.deepEqual(jsonSections(json2), jsonSections(json))
      }
    })
  })
})
