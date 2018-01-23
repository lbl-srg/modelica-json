const as = require('assert')
const mo = require('mocha')
const jq = require('../lib/jsonquery.js')

mo.describe('jsonquery', function () {
  mo.describe('updateImageLocations()', function () {
    mo.it('should return', function () {
      as.equal(jq.updateImageLocations(
        'aa <img src="modelica://Buildings/Resources/Images/test.png" alt="altComment">'),
        'aa <img src="Buildings/Resources/Images/test.png" alt="altComment">')
      as.equal(jq.updateImageLocations(
        'aa <img src="modelica://Buildings/Resources/Images/test.png">'),
        'aa <img src="Buildings/Resources/Images/test.png">')
      as.equal(jq.updateImageLocations(
        'aa <img src="modelica://Buildings/Resources/Images/test.png">'),
        'aa <img src="Buildings/Resources/Images/test.png">')
      as.equal(jq.updateImageLocations(
        'aa <img src="modelica://Buildings/Resources/Images/test.png"> bb <img src="modelica://Buildings/Resources/Images/test2.png">'),
        'aa <img src="Buildings/Resources/Images/test.png"> bb <img src="Buildings/Resources/Images/test2.png">')
    })
  })
  mo.describe('isType()', function () {
    mo.it('should return true', function () {
      as.equal(jq.isType('Real'), true)
      as.equal(jq.isType('Integer'), true)
      as.equal(jq.isType('String'), true)
      as.equal(jq.isType('Boolean'), true)
    })
    mo.it('should return false', function () {
      as.equal(jq.isType('Modelica.SIunit.Temperature'), false)
      as.equal(jq.isType('Buildings.StringFunctions'), false)
    })
  })
  mo.describe('removeTrailingArray()', function () {
    mo.it('should return true', function () {
      as.deepEqual(jq.removeTrailingArray('a[1]'), 'a')
      as.deepEqual(jq.removeTrailingArray('a[1, 2]'), 'a')
      as.deepEqual(jq.removeTrailingArray('a[1] '), 'a')
    })
  })
})
