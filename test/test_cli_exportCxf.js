'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const ut = require('../lib/util')

mo.describe('CLI --exportCxfFromModelica', function () {
  const templatesDir = path.join(__dirname, 'ModelicaMode')
  const moFile = path.join(templatesDir, 'VAVBoxCoolingOnly.mo')
  const directory = process.cwd()
  const referenceDir = path.join(__dirname, 'reference', 'cxf', 'test', 'ModelicaMode')

  mo.before(function () {
    // Clean up previous runs
    const cxfDir = path.join(process.cwd(), 'cxf')
    if (fs.existsSync(cxfDir)) {
      ut.removeDir(cxfDir)
    }
  })

  mo.after(function () {
    const cxfDir = path.join(process.cwd(), 'cxf')
    if (fs.existsSync(cxfDir)) {
      ut.removeDir(cxfDir)
    }
  })

  mo.it('exports CXF when --exportCxfFromModelica flag is used', function () {
    // Run the tool with the new flag
    execSync(`node app.js --exportCxfFromModelica -o cxf -f ${moFile}`, { stdio: 'inherit' })

    const cxfDir = path.join(process.cwd(), 'cxf', 'test', 'ModelicaMode')
    const modelCxfPath = path.join(cxfDir, 'VAVBoxCoolingOnly.jsonld')
    const controllerCxfPath = path.join(cxfDir, 'G36VAVBoxCoolingOnly.jsonld')

    as.ok(fs.existsSync(modelCxfPath), 'Model CXF should be exported')
    as.ok(fs.existsSync(controllerCxfPath), 'Controller CXF should be exported')

    const modelCxf = JSON.parse(fs.readFileSync(modelCxfPath, 'utf8'))
    const referenceModelCxf = JSON.parse(fs.readFileSync(path.join(referenceDir, 'VAVBoxCoolingOnly.jsonld'), 'utf8'))
    as.deepStrictEqual(modelCxf, referenceModelCxf, 'Exported Model CXF should match reference')

    const controllerCxf = JSON.parse(fs.readFileSync(controllerCxfPath, 'utf8'))
    const referenceControllerCxf = JSON.parse(fs.readFileSync(path.join(referenceDir, 'G36VAVBoxCoolingOnly.jsonld'), 'utf8'))
    as.deepStrictEqual(controllerCxf, referenceControllerCxf, 'Exported Controller CXF should match reference')
  })
})
