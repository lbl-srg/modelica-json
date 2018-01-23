const as = require('assert')
const mo = require('mocha')
const path = require('path')
const pa = require('../lib/parser.js')
const fs = require('fs')

mo.describe('parser.js', function () {
  mo.describe('parse from Modelica', function () {
    mo.it('should return true', function () {
      const jsonFileOld = path.join(__dirname, 'FromModelica', 'Parameter1-simplified.json')
      const jOld = JSON.parse(fs.readFileSync(jsonFileOld, 'utf8'))
      pa.run(path.join(__dirname, 'FromModelica', 'Parameter1.mo'), 'json-simplified')
      const jsonFileNew = 'Parameter1-simplified.json'
      const jNew = JSON.parse(fs.readFileSync(jsonFileNew, 'utf8'))
      as.deepEqual(jNew, jOld)
    })
  })
})
