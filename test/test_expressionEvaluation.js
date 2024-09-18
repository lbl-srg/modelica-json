const assert = require('assert')
const fs = require('bluebird').promisifyAll(require('fs'))
const jsonQuery = require('../lib/jsonquery')
const mocha = require('mocha')
const path = require('path')
const rewire = require('rewire')

// We use rewire to access private functions and test them
const expressionEvaluation = rewire('../lib/expressionEvaluation.js')

const expression = jsonQuery.findNestedObjects(JSON.parse(
  fs.readFileSync(path.join(
    process.cwd(), 'test', 'expressionEvaluation', 'Expression.json'), 'utf8')),
  'expression')
const expressionParam = JSON.parse(
  fs.readFileSync(path.join(
    process.cwd(), 'test', 'expressionEvaluation', 'ExpressionParam.json'), 'utf8')
)
const enableJsons = JSON.parse(
  fs.readFileSync(path.join(
    process.cwd(), 'test', 'expressionEvaluation', 'Enable.json'), 'utf8')
)
const enableParam = JSON.parse(
  fs.readFileSync(path.join(
    process.cwd(), 'test', 'expressionEvaluation', 'EnableParam.json'), 'utf8')
)
const expressionVal = [
  [ "1", 1 ] ,
  [ "a*2", 2 ] ,
  [ "b^b", 4 ] ,
  [ "a == b", false ] ,
  [ "a <> b", true ] ,
  [ "a <= b", true ] ,
  [ "a >= b", false ] ,
  [ "a < b", true ] ,
  [ "a > b", false ] ,
  [ " if b > a then 1 else 0", 1 ] ,
  [ " if a > b then 0 elseif b == 2 then 1 else -1", 1 ] ,
  [ " if not (a < b) then 1 else 2", 2 ] ,
  [ " if a < b and not (a < b) then 1 else 2", 2 ] ,
  [
    " if not ([object Object]) then 1 else 2",
    " ! ( [ objectObject ] )  ?  1  :  2"
  ] ,
  [
    " if ([object Object]) and not ([object Object]) then 1 else 2",
    " ( [ objectObject ] ) && ! ( [ objectObject ] )  ?  1  :  2"
  ] ,
  [ "Array(4).fill(a)", [ 1, 1, 1, 1 ] ] ,
  [ "math.size(fil)[1 - 1]", 4 ] ,
  [ "math.size(fil)", [ 4 ] ] ,
  [
    "{{{i,j} for i in 1:a} for j in 1:b}",
    "[ [ [ i , j ] for i in 1 : 1 ] for j in 1 : 2 ]"
  ] ,
  [ "{{i,j} for i in 1:a}", "[ [ i , j ] for i in 1 : 1 ]" ] ,
  [ "{i,j}", "[ i , j ]" ] ,
  [ "math.abs(-b)", 2 ] ,
  [ "math.sign(b)", 1 ] ,
  [ "math.sqrt(b)", 1.4142135623730951 ] ,
  [ "math.floor(math.divide(a,b))", 0 ] ,
  [ "math.mod(a,b)", 1 ] ,
  [ "rem(a,b)", "rem( 1 , 2 )" ] ,
  [ "math.ceil(a/b)", 1 ] ,
  [ "math.floor(a/b)", 0 ] ,
  [ "math.floor(a/b)", 0 ] ,
  [ "math.max(a,b)", 2 ] ,
  [ "math.max(fil)", 1 ] ,
  [ "math.min(a,b)", 1 ] ,
  [ "math.min(fil)", 1 ] ,
  [ "math.sum(fil)", 4 ] ,
]
const enableVal = {
  use_enthalpy: true,
  delTOutHis: 1,
  delEntHis: 1000,
  retDamFulOpeTim: 180,
  disDel: 15,
  "truFalHol.trueHoldDuration": 600,
  "truFalHol.falseHoldDuration": 600,
  "truFalHol.pre_u_start": false,
  TOutHigLimCutHig: 0,
  TOutHigLimCutLow: -1,
  hOutHigLimCutHig: 0,
  hOutHigLimCutLow: -1000,
  "hysOutTem.uLow": -1,
  "hysOutTem.uHigh": 0,
  "hysOutTem.pre_y_start": false,
  "hysOutEnt.uLow": -1000,
  "hysOutEnt.uHigh": 0,
  "hysOutEnt.pre_y_start": false,
  "delOutDamOsc.delayTime": 15,
  "delOutDamOsc.delayOnInit": false,
  "delOutDamOsc.t_past": null,
  "delRetDam.delayTime": 180,
  "delRetDam.delayOnInit": false,
  "delRetDam.t_past": null,
  "conInt.k": "Buildings.Controls.OBC.ASHRAE.G36.Types.FreezeProtectionStages.stage0",
  "entSubst1.k": false
}
mocha.describe('expressionEvaluation', function () {
  mocha.describe('#evalInContext()', function () {
    mocha.it('should return 2', function () {
      assert.strictEqual(
        expressionEvaluation.evalInContext('a', { a: 'b', b: 2 }),
        2)
    })
    mocha.it('should return [ -4, 3 ]', function () {
      assert.deepStrictEqual(
        expressionEvaluation.evalInContext('math.floor([-3.14, 3.14])'),
        [-4, 3])
    })
    mocha.it('should return "a + 1" // unsuccessful evaluation', function () {
      assert.strictEqual(
        expressionEvaluation.evalInContext('a + 1', { a: '1' }),
        'a + 1')
    })
    mocha.it('should return 1', function () {
      assert.strictEqual(
        expressionEvaluation.evalInContext('b', { 'a.b': 'c', b: 2, c: 1 }, 'a'),
        1)
    })
  })

  mocha.describe('#stringifyExpression()', function () {
    const stringifyExpression = expressionEvaluation.__get__('stringifyExpression')
    mocha.it('should return the given expression strings', function () {
      assert.deepStrictEqual(
        expression.map(obj => stringifyExpression(obj)),
        expressionVal.map(el => el[0]))
    })
  })

  mocha.describe('#evalExpression()', function () {
    mocha.it('should return the given values (case with a flat model with all types of expression)', function () {
      const values = []
      expressionVal.forEach((el) => {
        values.push(expressionEvaluation.evalExpression(
          el[0],
          expressionParam.reduce((a, v) => ({ ...a, [v.name]: v.value }), {}) ))
      })
      assert.deepStrictEqual(
        values,
        expressionVal.map(el => el[1]))
    })
    mocha.it('should return the given values (case with a composite model with a few types of expression)', function () {
      const values = {}
      enableParam.forEach( (par) => {
        values[par.name] = expressionEvaluation.evalExpression(
          par.value,
          enableParam.reduce((a, v) => ({ ...a, [v.name]: v.value }), {}) )
      })
      assert.deepStrictEqual(
        values,
        enableVal)
    })
  })

  mocha.describe('#getComponents()', function () {
    mocha.it('should return the given set of components for the given class object', function () {
      const components = JSON.parse(
        fs.readFileSync(path.join(
          process.cwd(), 'test', 'expressionEvaluation', 'EnableComponents.json'), 'utf8')
      )
      assert.equal(
        JSON.stringify(expressionEvaluation.getComponents(enableJsons[0])),
        JSON.stringify(components)
      )
    })
  })

  mocha.describe('#getParametersAndBindings()', function () {
    mocha.it('should return the given set of parameters for the given class object', function () {
      assert.deepStrictEqual(
        expressionEvaluation.getParametersAndBindings(
          enableJsons[0], enableJsons).parameters,
        enableParam)
    })
    mocha.it('should return the given set of parameters for the given class definition', function () {
      assert.deepStrictEqual(
        expressionEvaluation.getParametersAndBindings(
          enableJsons[0].class_definition[0], enableJsons).parameters,
        enableParam)
    })
  })
})
