'use strict'
const as = require('assert')
const mo = require('mocha')
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const MODELICA_MODEL = path.join(__dirname, 'ModelicaMode', 'ModelWithControlsBlock.mo')
const CDL_BLOCK = path.join(__dirname, 'FromModelica', 'Enable.mo')
const TEMP_CDL_DIR = path.join(__dirname, 'temp_CDL')

function runParser(args) {
  const command = `node app.js -f "${args.file}" ${args.output ? `-o ${args.output}` : ''} ${args.exportCxfFromModelica ? '--exportCxfFromModelica' : ''} ${args.cxfCore ? '--cxfCore' : ''} ${args.elementary ? '--elementary' : ''} ${args.validateCdlSchema ? '--validateCdlSchema' : ''}`
  return execSync(command, { encoding: 'utf8', stdio: 'pipe' })
}

function runParserAndExpectError(args, expectedError) {
  try {
    runParser(args)
    as.fail('Expected an error but the parser succeeded')
  } catch (err) {
    const stdout = err.stdout || ''
    const stderr = err.stderr || ''
    const actualError = stdout + stderr
    if (expectedError === 'exit1') {
      as.ok(err.status !== 0, `Expected process to exit with non-zero status, but got ${err.status}`)
    } else {
      as.ok(actualError.includes(expectedError), `Expected error containing "${expectedError}", but got: ${actualError}`)
    }
  }
}

mo.describe('CLI Combinations Testing', function () {
  this.timeout(120000)

  mo.describe('Modelica Model (non-CDL) input', function () {
    it('raw-json | exportCxf=false | cxfCore=false | elem=false | valCDL=false -> Success', () => {
      runParser({ file: MODELICA_MODEL, output: 'raw-json', exportCxfFromModelica: false, cxfCore: false, elementary: false, validateCdlSchema: false })
    })

    it('raw-json | exportCxf=false | cxfCore=false | elem=false | valCDL=true -> Error', () => {
      runParserAndExpectError({ file: MODELICA_MODEL, output: 'raw-json', exportCxfFromModelica: false, cxfCore: false, elementary: false, validateCdlSchema: true }, 'exit1')
    })

    it('raw-json | exportCxf=false | cxfCore=false | elem=true | valCDL=false -> Success', () => {
      runParser({ file: MODELICA_MODEL, output: 'raw-json', exportCxfFromModelica: false, cxfCore: false, elementary: true, validateCdlSchema: false })
    })

    it('raw-json | exportCxf=false | cxfCore=true | elem=false | valCDL=false -> Error (cxfCore output)', () => {
      runParserAndExpectError({ file: MODELICA_MODEL, output: 'raw-json', exportCxfFromModelica: false, cxfCore: true, elementary: false, validateCdlSchema: false }, 'should be cxf')
    })

    it('raw-json | exportCxf=true | cxfCore=false | elem=false | valCDL=false -> Error (exportCxf output)', () => {
      runParserAndExpectError({ file: MODELICA_MODEL, output: 'raw-json', exportCxfFromModelica: true, cxfCore: false, elementary: false, validateCdlSchema: false }, 'only be used when the output format (-o) is "cxf"')
    })

    it('cxf | exportCxf=false | cxfCore=false | elem=false | valCDL=false -> Error (non-CDL compliant)', () => {
      runParserAndExpectError({ file: MODELICA_MODEL, output: 'cxf', exportCxfFromModelica: false, cxfCore: false, elementary: false, validateCdlSchema: false }, 'exit1') 
    })

    it('cxf | exportCxf=true | cxfCore=false | elem=false | valCDL=false -> Success', () => {
      runParser({ file: MODELICA_MODEL, output: 'cxf', exportCxfFromModelica: true, cxfCore: false, elementary: false, validateCdlSchema: false })
    })
  })

  mo.describe('CDL Composite Block input', function () {
    it('raw-json | exportCxf=false | cxfCore=false | elem=false | valCDL=false -> Success', () => {
      runParser({ file: CDL_BLOCK, output: 'raw-json', exportCxfFromModelica: false, cxfCore: false, elementary: false, validateCdlSchema: false })
    })

    it('raw-json | exportCxf=false | cxfCore=false | elem=false | valCDL=true -> Success', () => {
      runParser({ file: CDL_BLOCK, output: 'raw-json', exportCxfFromModelica: false, cxfCore: false, elementary: false, validateCdlSchema: true })
    })

    it('raw-json | exportCxf=false | cxfCore=false | elem=true | valCDL=false -> Success', () => {
      runParser({ file: CDL_BLOCK, output: 'raw-json', exportCxfFromModelica: false, cxfCore: false, elementary: true, validateCdlSchema: false })
    })

    it('raw-json | exportCxf=false | cxfCore=true | elem=false | valCDL=false -> Error (cxfCore output)', () => {
      runParserAndExpectError({ file: CDL_BLOCK, output: 'raw-json', exportCxfFromModelica: false, cxfCore: true, elementary: false, validateCdlSchema: false }, 'should be cxf')
    })

    it('raw-json | exportCxf=true | cxfCore=false | elem=false | valCDL=false -> Error (exportCxf output)', () => {
      runParserAndExpectError({ file: CDL_BLOCK, output: 'raw-json', exportCxfFromModelica: true, cxfCore: false, elementary: false, validateCdlSchema: false }, 'only be used when the output format (-o) is "cxf"')
    })

    it('cxf | exportCxf=false | cxfCore=false | elem=false | valCDL=false -> Success', () => {
      runParser({ file: CDL_BLOCK, output: 'cxf', exportCxfFromModelica: false, cxfCore: false, elementary: false, validateCdlSchema: false })
    })

    it('cxf | exportCxf=false | cxfCore=true | elem=false | valCDL=false -> Error (cxfCore needs elementary)', () => {
      runParserAndExpectError({ file: TEMP_CDL_DIR, output: 'cxf', exportCxfFromModelica: false, cxfCore: true, elementary: false, validateCdlSchema: false }, '--elementary flag must be used')
    })

    it('cxf | exportCxf=false | cxfCore=true | elem=true | valCDL=false -> Success (if file is CDL package)', () => {
      // Note: cxfCore requires input to be a CDL package. 
      const cdlPath = path.join(process.cwd(), 'Buildings', 'Controls', 'OBC', 'CDL')
      if (fs.existsSync(cdlPath)) {
        runParser({ file: cdlPath, output: 'cxf', exportCxfFromModelica: false, cxfCore: true, elementary: true, validateCdlSchema: false })
      } else {
        console.log('Skipping cxfCore test: Buildings library path not found')
      }
    })
  })
})
