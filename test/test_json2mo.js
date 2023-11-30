const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')
const path = require('path')
const glob = require('glob-promise')
const fs = require('fs')
const pa = require('../lib/parser.js')

mo.afterEach(() => {
  sinon.restore()
})

function getFiles (topFolder, fileType) {
  // get all test modelica files to convert to json
  const pattern = path.join(__dirname, topFolder, '*.' + fileType)
  return glob.sync(pattern)
}

mo.describe('testing json2mo', function () {
  mo.describe('testing parsing test/reference/json folder', function () {
    mo.it('testing structure', function () {
      fs.rmSync(path.join('test', 'reverse'), { recursive: true, force: true })
      fs.rmSync(path.join('test', 'reverse2'), { recursive: true, force: true })

      // convert mo to json
      const inputMoFiles = getFiles('FromModelica', 'mo').splice(3)
      pa.getJsons(inputMoFiles, 'modelica', 'json', path.join('test', 'reverse'), 'false')

      // convert json back to mo
      const jsonOp1Files = getFiles(path.join('reverse', 'json', 'test', 'FromModelica'), 'json')
      jsonOp1Files.forEach(json1FilePath => {
        json1FilePath = path.join('test', json1FilePath.split(__dirname)[1])
        pa.convertToModelica(json1FilePath, path.join('test', 'reverse'), false)
      })

      // convert modelica back to json
      const generatedMoFiles = getFiles(path.join('reverse', 'modelica', 'test', 'reverse', 'json', 'test', 'FromModelica'), 'mo')
      pa.getJsons(generatedMoFiles, 'modelica', 'json', path.join('test', 'reverse2'), 'false')

      jsonOp1Files.forEach(file1 => {
        const tokens = file1.split(path.sep)
        const filename = tokens[tokens.length - 1]
        console.log('checking for ', filename)

        const originalJsonFilePath = path.join(__dirname, 'reverse', 'json', 'test', 'FromModelica', filename)
        const originalJson = JSON.parse(fs.readFileSync(originalJsonFilePath), 'utf8')

        const newJsonFilePath = path.join(__dirname, 'reverse2', 'json', 'test', 'reverse', 'modelica', 'test', 'reverse', 'json', 'test', 'FromModelica', filename)
        const newJson = JSON.parse(fs.readFileSync(newJsonFilePath), 'utf8')

        newJson.modelicaFile = originalJson.modelicaFile
        newJson.fullMoFilePath = originalJson.fullMoFilePath
        newJson.checksum = originalJson.checksum

        const tempOld = JSON.stringify(originalJson).trim()
        const tempNew = JSON.stringify(newJson).trim()

        as.deepEqual(tempNew.length, tempOld.length, 'JSON result different')
      })

      fs.rmSync(path.join('test', 'reverse'), { recursive: true, force: true })
      fs.rmSync(path.join('test', 'reverse2'), { recursive: true, force: true })
    })
  })
})
