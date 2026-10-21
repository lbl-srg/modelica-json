'use strict'
const as = require('assert')
const mo = require('mocha')
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')
const ut = require('../lib/util')

// Each test follows a row of the Behavior Table in expected_outputs.md
const MODELICA_MODEL = path.join(__dirname, 'ModelicaMode', 'ModelWithControlsBlock.mo')
const CDL_BLOCK = path.join(__dirname, 'FromModelica', 'Enable.mo')
const CDL_BLOCK_NESTED = path.join(__dirname, 'FromModelica', 'MyController.mo')
const TEMP_CDL_DIR = path.join(__dirname, 'temp_CDL')

const outDirs = []

/**
 * Run app.js with the given flags, writing to a new temporary output directory.
 * Returns the combined stdout/stderr, the exit status and the output directory.
 */
function run (args) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'm2j-cli-'))
  outDirs.push(dir)
  const command = `node app.js -f "${args.file}" -o ${args.output} -d "${dir}" ${args.exportCxfFromModelica ? '--exportCxfFromModelica' : ''} ${args.cxfCore ? '--cxfCore' : ''} ${args.elementary ? '--elementary' : ''} ${args.validateCdlSchema ? '--validateCdlSchema' : ''}`
  try {
    const out = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    return { out, status: 0, dir }
  } catch (err) {
    return { out: (err.stdout || '') + (err.stderr || ''), status: err.status, dir }
  }
}

function runParser (args) {
  const res = run(args)
  as.strictEqual(res.status, 0, `Expected exit code 0, but got ${res.status}: ${res.out}`)
  return res
}

function runParserAndExpectError (args, expectedError) {
  const res = run(args)
  as.notStrictEqual(res.status, 0, 'Expected an error but the parser succeeded')
  if (expectedError !== 'exit1') {
    as.ok(res.out.includes(expectedError), `Expected error containing "${expectedError}", but got: ${res.out}`)
  }
  return res
}

/** List of files in the sub-folder of an output directory, relative to that sub-folder. */
function filesIn (dir, subFolder) {
  const root = path.join(dir, subFolder)
  if (!fs.existsSync(root)) {
    return []
  }
  return fs.readdirSync(root, { recursive: true })
    .filter(f => fs.statSync(path.join(root, f)).isFile())
    .sort()
}

const isElementary = f => f.includes(path.join('OBC', 'CDL'))
const RAW_JSON_WARNING = 'raw-json cannot be validated'
const ELEMENTARY_CXF = path.join('Buildings', 'Controls', 'OBC', 'CDL', 'Interfaces', 'RealInput.jsonld')

const opts = (output, exportCxfFromModelica, cxfCore, elementary, validateCdlSchema) =>
  ({ output, exportCxfFromModelica, cxfCore, elementary, validateCdlSchema })

mo.describe('CLI Combinations Testing', function () {
  this.timeout(120000)

  // Modelica model without a controls block. Written to a temporary directory (whose name
  // has no '.') so it is not part of the test/ModelicaMode references.
  let modelicaModelNoControls
  mo.before(function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'm2j-cli-'))
    outDirs.push(dir)
    modelicaModelNoControls = path.join(dir, 'NoControls.mo')
    fs.writeFileSync(modelicaModelNoControls, [
      'model NoControls "Modelica model without a controls block"',
      '  Buildings.Fluid.Sensors.TemperatureTwoPort senTem(redeclare package Medium = Buildings.Media.Air, m_flow_nominal=1) "Sensor";',
      '  Buildings.Fluid.Sources.Boundary_pT bou(redeclare package Medium = Buildings.Media.Air, nPorts=1) "Boundary";',
      'equation',
      '  connect(bou.ports[1], senTem.port_a);',
      'end NoControls;'
    ].join('\n'))
  })

  mo.after(function () {
    outDirs.forEach(dir => ut.removeDir(dir))
  })

  mo.describe('Modelica Model (non-CDL) input', function () {
    const file = MODELICA_MODEL

    mo.it('raw-json | elem=* | valCDL=false -> only the top-level file, no validation', () => {
      ;[false, true].forEach(elementary => {
        const res = runParser({ file, ...opts('raw-json', false, false, elementary, false) })
        as.deepStrictEqual(filesIn(res.dir, 'raw-json'), [path.join('test', 'ModelicaMode', 'ModelWithControlsBlock.json')])
        as.ok(!res.out.includes('not valid'), 'raw-json should not be validated')
      })
    })

    mo.it('raw-json | valCDL=true -> warning, exit 0', () => {
      const res = runParser({ file, ...opts('raw-json', false, false, false, true) })
      as.ok(res.out.includes(RAW_JSON_WARNING), `Expected a warning about raw-json validation, but got: ${res.out}`)
      as.strictEqual(filesIn(res.dir, 'raw-json').length, 1)
    })

    mo.it('json | elem=false | valCDL=false -> json for all instantiated classes, elementary blocks skipped', () => {
      const res = runParser({ file, ...opts('json', false, false, false, false) })
      const files = filesIn(res.dir, 'json')
      as.ok(files.length > 1, 'instantiated classes should be parsed')
      as.ok(!files.some(isElementary), 'elementary blocks should be skipped')
    })

    mo.it('json | elem=true | valCDL=false -> json including elementary blocks', () => {
      const res = runParser({ file, ...opts('json', false, false, true, false) })
      as.ok(filesIn(res.dir, 'json').some(isElementary), 'elementary blocks should be generated')
    })

    mo.it('json | elem=* | valCDL=true -> exit 1, json still written', () => {
      ;[false, true].forEach(elementary => {
        const res = runParserAndExpectError({ file, ...opts('json', false, false, elementary, true) }, 'exit1')
        as.ok(filesIn(res.dir, 'json').length > 1, 'json files should be written before exiting')
      })
    })

    mo.it('raw-json / json / semantic | cxfCore=true -> Error (cxfCore needs -o cxf)', () => {
      ;['raw-json', 'json', 'semantic'].forEach(output => {
        runParserAndExpectError({ file, ...opts(output, false, true, false, false) }, 'should be cxf')
      })
    })

    mo.it('raw-json / json / semantic | exportCxf=true -> Error (exportCxf needs -o cxf)', () => {
      ;['raw-json', 'json', 'semantic'].forEach(output => {
        runParserAndExpectError({ file, ...opts(output, true, false, false, false) }, 'only be used when the output format (-o) is "cxf"')
      })
    })

    mo.it('cxf | exportCxf=false -> Error (not CDL-compliant), suggests --exportCxfFromModelica', () => {
      runParserAndExpectError({ file, ...opts('cxf', false, false, false, false) }, 'use the --exportCxfFromModelica flag')
    })

    mo.it('cxf | exportCxf=true | elem=false | valCDL=* -> cxf for the model and the controls class', () => {
      ;[false, true].forEach(validateCdlSchema => {
        const res = runParser({ file, ...opts('cxf', true, false, false, validateCdlSchema) })
        as.deepStrictEqual(filesIn(res.dir, 'cxf'), [
          path.join('test', 'ModelicaMode', 'ModelWithControlsBlock.jsonld'),
          path.join('test', 'ModelicaMode', 'SubControllerForControlsExport.jsonld')
        ])
        as.ok(!res.out.includes('not valid'), 'only the controls class should be validated against schema-cdl.json')
      })
    })

    mo.it('cxf | exportCxf=true | elem=true -> also cxf for the elementary blocks', () => {
      const res = runParser({ file, ...opts('cxf', true, false, true, true) })
      const files = filesIn(res.dir, 'cxf')
      as.ok(files.includes(path.join('test', 'ModelicaMode', 'SubControllerForControlsExport.jsonld')))
      as.ok(files.includes(ELEMENTARY_CXF), 'elementary block cxf should be generated')
    })

    mo.it('cxf | exportCxf=true | elem=* | no isControls class and not CDL-compliant -> Error, no cxf', () => {
      ;[false, true].forEach(elementary => {
        const res = runParserAndExpectError({ file: modelicaModelNoControls, ...opts('cxf', true, false, elementary, false) }, 'No block annotated with __cdl(isControls=true)')
        as.deepStrictEqual(filesIn(res.dir, 'cxf'), [], 'no cxf should be generated')
        as.ok(filesIn(res.dir, 'json').length > 0, 'simplified json should be generated')
      })
    })

    mo.it('cxf | cxfCore=true -> Error (-f must be the CDL package)', () => {
      runParserAndExpectError({ file, ...opts('cxf', false, true, true, false) }, 'should be path/to/CDL')
    })
  })

  mo.describe('CDL Composite Block input', function () {
    const file = CDL_BLOCK

    mo.it('raw-json | valCDL=false -> only the top-level file', () => {
      const res = runParser({ file, ...opts('raw-json', false, false, true, false) })
      as.deepStrictEqual(filesIn(res.dir, 'raw-json'), [path.join('test', 'FromModelica', 'Enable.json')])
    })

    mo.it('raw-json | valCDL=true -> warning, exit 0', () => {
      const res = runParser({ file, ...opts('raw-json', false, false, false, true) })
      as.ok(res.out.includes(RAW_JSON_WARNING), `Expected a warning about raw-json validation, but got: ${res.out}`)
    })

    mo.it('json | elem=false | valCDL=* -> json, elementary blocks skipped, exit 0', () => {
      ;[false, true].forEach(validateCdlSchema => {
        const res = runParser({ file, ...opts('json', false, false, false, validateCdlSchema) })
        as.deepStrictEqual(filesIn(res.dir, 'json'), [path.join('test', 'FromModelica', 'Enable.json')])
      })
    })

    mo.it('json | elem=true | valCDL=* -> json including elementary blocks, elementary blocks not validated', () => {
      ;[false, true].forEach(validateCdlSchema => {
        const res = runParser({ file, ...opts('json', false, false, true, validateCdlSchema) })
        as.ok(filesIn(res.dir, 'json').some(isElementary), 'elementary blocks should be generated')
        as.ok(!res.out.includes('not valid'), 'elementary blocks should not be validated against schema-cdl.json')
      })
    })

    mo.it('raw-json / json / semantic | cxfCore=true -> Error (cxfCore needs -o cxf)', () => {
      ;['raw-json', 'json', 'semantic'].forEach(output => {
        runParserAndExpectError({ file, ...opts(output, false, true, false, false) }, 'should be cxf')
      })
    })

    mo.it('raw-json / json / semantic | exportCxf=true -> Error (exportCxf needs -o cxf)', () => {
      ;['raw-json', 'json', 'semantic'].forEach(output => {
        runParserAndExpectError({ file, ...opts(output, true, false, false, false) }, 'only be used when the output format (-o) is "cxf"')
      })
    })

    mo.it('cxf | elem=false | valCDL=* -> cxf of the block', () => {
      ;[false, true].forEach(validateCdlSchema => {
        const res = runParser({ file, ...opts('cxf', false, false, false, validateCdlSchema) })
        as.deepStrictEqual(filesIn(res.dir, 'cxf'), [path.join('test', 'FromModelica', 'Enable.jsonld')])
      })
    })

    mo.it('cxf | elem=true | valCDL=true -> cxf including elementary blocks', () => {
      const res = runParser({ file, ...opts('cxf', false, false, true, true) })
      as.ok(filesIn(res.dir, 'cxf').some(isElementary), 'elementary block cxf should be generated')
    })

    mo.it('cxf | exportCxf=true -> identical output as exportCxf=false (incl. nested blocks)', () => {
      ;[CDL_BLOCK, CDL_BLOCK_NESTED].forEach(blockFile => {
        ;[false, true].forEach(elementary => {
          const expected = runParser({ file: blockFile, ...opts('cxf', false, false, elementary, false) })
          const actual = runParser({ file: blockFile, ...opts('cxf', true, false, elementary, false) })
          const files = filesIn(expected.dir, 'cxf')
          as.deepStrictEqual(filesIn(actual.dir, 'cxf'), files)
          files.forEach(f => {
            as.strictEqual(fs.readFileSync(path.join(actual.dir, 'cxf', f), 'utf8'),
              fs.readFileSync(path.join(expected.dir, 'cxf', f), 'utf8'), `CXF differs for ${f}`)
          })
        })
      })
    })

    mo.it('cxf | cxfCore=true -> Error (-f must be the CDL package)', () => {
      runParserAndExpectError({ file, ...opts('cxf', false, true, true, false) }, 'should be path/to/CDL')
    })
  })

  mo.describe('CDL Package input', function () {
    mo.it('cxf | cxfCore=true | elem=false -> Error (cxfCore needs elementary)', () => {
      runParserAndExpectError({ file: TEMP_CDL_DIR, ...opts('cxf', false, true, false, false) }, '--elementary flag must be used')
    })

    mo.it('cxf | cxfCore=true | elem=true -> CXF-Core.jsonld', function () {
      this.timeout(600000)
      const cdlPath = ut.getMODELICAPATH()
        .map(p => path.join(p, 'Buildings', 'Controls', 'OBC', 'CDL'))
        .find(p => fs.existsSync(p))
      if (cdlPath === undefined) {
        this.skip()
      }
      const res = runParser({ file: cdlPath, ...opts('cxf', false, true, true, false) })
      as.ok(filesIn(res.dir, 'cxf').includes('CXF-Core.jsonld'), 'CXF-Core.jsonld should be generated')
    })
  })

  mo.describe('semantic output', function () {
    mo.it('semantic | valCDL=* -> json and objects, no validation', () => {
      ;[false, true].forEach(validateCdlSchema => {
        const res = runParser({ file: MODELICA_MODEL, ...opts('semantic', false, false, false, validateCdlSchema) })
        as.ok(filesIn(res.dir, 'objects').length > 0, 'objects should be generated')
        as.ok(!filesIn(res.dir, 'json').some(isElementary), 'elementary blocks should be skipped')
        as.ok(!res.out.includes('not valid'), 'semantic output should not be validated')
      })
    })
  })
})
