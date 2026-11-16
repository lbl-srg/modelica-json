const as = require('assert')
const cp = require('child_process')
const fs = require('fs')
const mo = require('mocha')
const os = require('os')
const path = require('path')

// Tests of the command line interface, see issue 339.
// app.js is run in a temporary directory, so that it does not depend on the current directory.

const root = path.join(__dirname, '..')
const app = path.join(root, 'app.js')
const fromModelica = path.join(__dirname, 'FromModelica')
const modelicaMode = path.join(__dirname, 'ModelicaMode')
const cdlCompliance = path.join(__dirname, 'CdlCompliance')

function makeTempDir () {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cli-'))
}

/**
 * Get the entries of MODELICAPATH as absolute paths. Relative entries, such as on CI,
 * are resolved against the current directory, which is not the one of the processes
 * started by 'runApp'.
 *
 * @returns {string[]} absolute paths
 */
function getModelicaPathEntries () {
  return (process.env.MODELICAPATH ?? '').split(path.delimiter).filter(Boolean).map(p => path.resolve(p))
}

/**
 * Get the directory of the CDL package of the Buildings library.
 *
 * @returns {string} absolute path
 */
function getCdlDir () {
  const entry = getModelicaPathEntries().find(p => fs.existsSync(path.join(p, 'Buildings', 'Controls', 'OBC', 'CDL')))
  return path.join(entry, 'Buildings', 'Controls', 'OBC', 'CDL')
}

/**
 * Run app.js in a temporary directory, with the entries of MODELICAPATH made absolute.
 *
 * @param {string[]} args arguments of app.js
 * @returns {Object} result of 'spawnSync', with 'output', the standard output and error
 */
function runApp (args) {
  const result = cp.spawnSync('node', [app, ...args], {
    cwd: makeTempDir(),
    encoding: 'utf8',
    env: Object.assign({}, process.env, { MODELICAPATH: getModelicaPathEntries().join(path.delimiter) })
  })
  return Object.assign(result, { output: result.stdout + result.stderr })
}

/**
 * Get the files in a directory and its subdirectories.
 *
 * @param {string} dir directory
 * @returns {string[]} paths relative to 'dir', sorted, empty if 'dir' does not exist
 */
function listFiles (dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter(file => fs.statSync(path.join(dir, file)).isFile()).sort() : []
}

/**
 * Write a JSON schema that rejects the classes with the given identifier.
 *
 * @param {string} identifier identifier of the rejected classes
 * @returns {string} path of the schema
 */
function writeSchema (identifier) {
  const schema = path.join(makeTempDir(), 'schema.json')
  fs.writeFileSync(schema, JSON.stringify({
    type: 'object',
    properties: {
      stored_class_definitions: {
        items: {
          properties: {
            class_specifier: {
              properties: {
                long_class_specifier: { properties: { identifier: { not: { const: identifier } } } }
              }
            }
          }
        }
      }
    }
  }))
  return schema
}

const join = (...names) => path.join(...names)

mo.describe('app.js', function () {
  mo.describe('-o json', function () {
    mo.it('includes the elementary blocks, without --elementary', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(fromModelica, 'Enable.mo'), '-o', 'json', '-d', dir])
      as.equal(result.status, 0, result.output)
      const files = listFiles(join(dir, 'json'))
      as.equal(files.length, 18, files.join('\n'))
      as.ok(files.includes(join('Buildings', 'Controls', 'OBC', 'CDL', 'Reals', 'Hysteresis.json')))
      as.deepEqual(fs.readdirSync(dir), ['json'], 'Only the requested output is written')
    })
    mo.it('gives the expected output for CDL/Reals/Add.mo', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(getCdlDir(), 'Reals', 'Add.mo'), '-o', 'json', '-d', dir])
      as.equal(result.status, 0, result.output)
      const cdl = join('Buildings', 'Controls', 'OBC', 'CDL')
      as.deepEqual(listFiles(join(dir, 'json')),
        [join(cdl, 'Interfaces', 'RealInput.json'), join(cdl, 'Interfaces', 'RealOutput.json'), join(cdl, 'Reals', 'Add.json')])
    })
    mo.it('validates nothing without --validate, and exits 0', function () {
      const result = runApp(['-i', join(cdlCompliance, 'Case09Model.mo'), '-o', 'json', '-d', makeTempDir()])
      as.equal(result.status, 0, result.output)
    })
    mo.it('accepts a class name', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', 'Buildings.Controls.OBC.CDL.Reals.Add', '-o', 'json', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.equal(listFiles(join(dir, 'json')).length, 3)
    })
    mo.it('writes the outputs to the current directory by default', function () {
      const dir = makeTempDir()
      const result = cp.spawnSync('node', [app, '-i', join(fromModelica, 'Block1.mo')], {
        cwd: dir,
        encoding: 'utf8',
        env: Object.assign({}, process.env, { MODELICAPATH: getModelicaPathEntries().join(path.delimiter) })
      })
      as.equal(result.status, 0, result.stdout + result.stderr)
      as.deepEqual(listFiles(join(dir, 'json')), [join('FromModelica', 'Block1.json')])
    })
  })

  mo.describe('-o cxf', function () {
    mo.it('gives the expected output for CDL/Reals/Add.mo', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(getCdlDir(), 'Reals', 'Add.mo'), '-o', 'cxf', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(join(dir, 'cxf')), [join('Buildings', 'Controls', 'OBC', 'CDL', 'Reals', 'Add.jsonld')])
    })
    mo.it('exports a CDL-compliant class, without the elementary blocks', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(fromModelica, 'Enable.mo'), '-o', 'cxf', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(join(dir, 'cxf')), [join('FromModelica', 'Enable.jsonld')])
      as.deepEqual(fs.readdirSync(dir), ['cxf'], 'Only the requested output is written')
    })
    mo.it('exports a CDL-compliant class, with the elementary blocks used with --elementary', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(fromModelica, 'Enable.mo'), '-o', 'cxf', '--elementary', '-d', dir])
      as.equal(result.status, 0, result.output)
      const files = listFiles(join(dir, 'cxf'))
      as.equal(files.length, 18, files.join('\n'))
      as.ok(files.includes(join('Buildings', 'Controls', 'OBC', 'CDL', 'Reals', 'Hysteresis.jsonld')))
    })
    mo.it('exports a CDL-compliant class and the composite blocks it uses', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(fromModelica, 'BlockWithBlock1.mo'), '-o', 'cxf', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(join(dir, 'cxf')), [join('FromModelica', 'Block1.jsonld'), join('FromModelica', 'BlockWithBlock1.jsonld')])
    })
    mo.it('exports the controls instance of a Modelica model', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(modelicaMode, 'ModelWithControlsBlock.mo'), '-o', 'cxf', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(join(dir, 'cxf')),
        [join('ModelicaMode', 'ModelWithControlsBlock.jsonld'), join('ModelicaMode', 'SubControllerForControlsExport.jsonld')])
      // Same output as the reference of test_parser.js
      ;['ModelWithControlsBlock.jsonld', 'SubControllerForControlsExport.jsonld'].forEach((file) => {
        as.deepEqual(JSON.parse(fs.readFileSync(join(dir, 'cxf', 'ModelicaMode', file), 'utf8')),
          JSON.parse(fs.readFileSync(join(__dirname, 'reference', 'cxf', 'ModelicaMode', file), 'utf8')))
      })
    })
    mo.it('exports the controls instance of a Modelica model, with the elementary blocks used with --elementary', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(modelicaMode, 'ModelWithControlsBlock.mo'), '-o', 'cxf', '--elementary', '-d', dir])
      as.equal(result.status, 0, result.output)
      const cdl = join('Buildings', 'Controls', 'OBC', 'CDL')
      as.deepEqual(listFiles(join(dir, 'cxf')), [
        join(cdl, 'Interfaces', 'RealInput.jsonld'),
        join(cdl, 'Interfaces', 'RealOutput.jsonld'),
        join('ModelicaMode', 'ModelWithControlsBlock.jsonld'),
        join('ModelicaMode', 'SubControllerForControlsExport.jsonld')
      ])
    })
    ;[[], ['--elementary']].forEach((options) => {
      mo.it(`fails for a class that is not CDL-compliant and has no controls instance ${options.join(' ')}`, function () {
        const dir = makeTempDir()
        const result = runApp(['-i', join(modelicaMode, 'VAVBox.mo'), '-o', 'cxf', ...options, '-d', dir])
        as.equal(result.status, 1, result.output)
        as.match(result.stdout, /Class ModelicaMode\.VAVBox is not valid/)
        as.match(result.stdout, /has no instance annotated with __cdl\(isControls=true\)/)
        as.deepEqual(listFiles(dir), [])
      })
    })
    mo.it('does not change the exported CXF with a schema passed with --validate', function () {
      const dirs = [makeTempDir(), makeTempDir()]
      const moFile = join(fromModelica, 'BlockWithBlock1.mo')
      as.equal(runApp(['-i', moFile, '-o', 'cxf', '-d', dirs[0]]).status, 0)
      const result = runApp(['-i', moFile, '-o', 'cxf', '-d', dirs[1], '--validate', writeSchema('Block1')])
      as.equal(result.status, 1, result.output)
      as.match(result.stdout, /Class FromModelica\.Block1 is not valid/)
      const files = listFiles(join(dirs[0], 'cxf'))
      as.deepEqual(listFiles(join(dirs[1], 'cxf')), files)
      files.forEach((file) => {
        as.equal(fs.readFileSync(join(dirs[1], 'cxf', file), 'utf8'), fs.readFileSync(join(dirs[0], 'cxf', file), 'utf8'))
      })
    })
  })

  mo.describe('-o cxf-core', function () {
    mo.it('accepts a trailing slash, and only merges the files of the run', function () {
      const dir = makeTempDir()
      // File left by an earlier run
      fs.mkdirSync(join(dir, 'cxf'))
      fs.writeFileSync(join(dir, 'cxf', 'Stale.jsonld'), JSON.stringify({ '@graph': [{ '@id': 'stale' }] }))
      const result = runApp(['-i', getCdlDir() + path.sep, '-o', 'cxf-core', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(join(dir, 'cxf-core')), ['CXF-Core.jsonld'])
      as.deepEqual(listFiles(join(dir, 'cxf')), ['Stale.jsonld'], 'The CXF of the blocks is not written')
      const graph = JSON.parse(fs.readFileSync(join(dir, 'cxf-core', 'CXF-Core.jsonld'), 'utf8'))['@graph']
      const ids = graph.map(node => node['@id'])
      as.ok(ids.includes('S231:Buildings.Controls.OBC.CDL.Reals.Add'), 'The elementary blocks are included')
      as.ok(!ids.includes('stale'), 'The files of earlier runs are not included')
      as.ok(!ids.some(id => /\.Validation\./.test(id)), 'The validation models are not included')
    })
  })

  mo.describe('-o modelica', function () {
    mo.it('writes the Modelica file of a JSON file at the path of its class', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(__dirname, 'reference', 'json', 'FromModelica', 'Enable.json'), '-o', 'modelica', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(join(dir, 'modelica')), [join('FromModelica', 'Enable.mo')])
    })
    mo.it('accepts a directory', function () {
      const dir = makeTempDir()
      const jsonDir = join(__dirname, 'reference', 'json', 'FromModelica')
      const result = runApp(['-i', jsonDir, '-o', 'modelica', '-d', dir])
      as.equal(result.status, 0, result.output)
      // The path is the one of the class, not of the JSON file: 'package.json' contains the package 'FromModelica'.
      const files = listFiles(join(dir, 'modelica'))
      as.ok(files.includes(join('FromModelica', 'Enable.mo')), files.join('\n'))
      as.ok(files.includes(join('FromModelica', 'package.mo')), files.join('\n'))
      as.ok(files.length > 40, files.join('\n'))
    })
  })

  mo.describe('default output', function () {
    const jsonFile = join(__dirname, 'reference', 'json', 'FromModelica', 'Enable.json')
    mo.it('is modelica for a JSON file', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', jsonFile, '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(dir), [join('modelica', 'FromModelica', 'Enable.mo')])
    })
    mo.it('is modelica for a directory that only contains JSON files', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(__dirname, 'reference', 'json', 'FromModelica'), '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(fs.readdirSync(dir), ['modelica'])
    })
    mo.it('is json for a Modelica file', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(fromModelica, 'Block1.mo'), '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(dir), [join('json', 'FromModelica', 'Block1.json')])
    })
    mo.it('is json for a directory that contains Modelica and JSON files', function () {
      const lib = join(makeTempDir(), 'FromModelica')
      fs.mkdirSync(lib)
      fs.copyFileSync(join(fromModelica, 'Block1.mo'), join(lib, 'Block1.mo'))
      fs.copyFileSync(jsonFile, join(lib, 'Enable.json'))
      const dir = makeTempDir()
      const result = runApp(['-i', lib, '-d', dir])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(dir), [join('json', 'FromModelica', 'Block1.json')])
    })
  })

  mo.describe('arguments', function () {
    const enable = join(fromModelica, 'Enable.mo')
    const cases = {
      '--validate with raw-json': [['-i', enable, '-o', 'raw-json', '--validate', 'cdl'], /--validate does not apply to the output raw-json/],
      '--validate with modelica': [['-i', 'a.json', '-o', 'modelica', '--validate', 'cdl'], /--validate does not apply to the output modelica/],
      '--elementary with json': [['-i', enable, '-o', 'json', '--elementary'], /--elementary only applies to the output cxf/],
      '--elementary with cxf-core': [['-i', enable, '-o', 'cxf-core', '--elementary'], /--elementary only applies to the output cxf/],
      'a missing schema': [['-i', enable, '--validate', 'missing.json'], /--validate missing\.json is neither one of/],
      'an invalid schema': [['-i', enable, '--validate', app], /cannot be compiled/],
      'a .json input without -o modelica': [['-i', 'a.json', '-o', 'json'], /A JSON input requires the output modelica/],
      'a .mo input with -o modelica': [['-i', enable, '-o', 'modelica'], /requires a JSON file or a directory/],
      'modelica with another output': [['-i', 'a.json', '-o', 'modelica,json'], /cannot be combined/],
      'an unknown output': [['-i', enable, '-o', 'json,foo'], /invalid choice/],
      'doc with doc+': [['-i', enable, '-o', 'doc,doc+'], /only one of them/],
      '-i with -f': [['-i', enable, '-f', enable], /only one of them/],
      'no input': [['-o', 'json'], /required: -i\/--input/],
      'a missing input': [['-i', 'NotALibrary.NotAClass'], /Cannot find the Modelica file, package or class/]
    }
    Object.entries(cases).forEach(([name, [args, message]]) => {
      mo.it(`rejects ${name}`, function () {
        const result = runApp(args)
        as.equal(result.status, 2, result.output)
        as.match(result.stderr, message)
      })
    })
  })

  mo.describe('--validate', function () {
    const moFile = join(cdlCompliance, 'Case10NoInstanceDescription.mo')
    ;[['cdl', 0], ['cdl-mbl', 1], ['modelica', 0], ['modelica-mbl', 1]].forEach(([keyword, status]) => {
      mo.it(`${keyword} finds its schema from any directory`, function () {
        const result = runApp(['-i', moFile, '-o', 'json', '--validate', keyword, '-d', makeTempDir()])
        as.equal(result.status, status, result.output)
      })
    })
    mo.it('applies a custom schema to the used classes', function () {
      const result = runApp(['-i', join(fromModelica, 'BlockWithBlock1.mo'), '-o', 'json', '-d', makeTempDir(),
        '--validate', writeSchema('Block1')])
      as.equal(result.status, 1, result.output)
      as.match(result.stdout, /Class FromModelica\.Block1 is not valid/)
      as.doesNotMatch(result.stdout, /Class FromModelica\.BlockWithBlock1 is not valid/)
    })
    mo.it('prints all errors, writes the output files, and exits 1', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', fromModelica, '-o', 'json', '--validate', 'cdl', '-d', dir])
      as.equal(result.status, 1, result.output)
      as.match(result.stdout, /Class FromModelica\.ExtendsClause_1 is not valid/)
      as.match(result.stdout, /Class FromModelica\.Parameter3 is not valid/)
      as.ok(fs.existsSync(join(dir, 'json', 'FromModelica', 'Enable.json')))
      as.ok(fs.existsSync(join(dir, 'json', 'FromModelica', 'Parameter3.json')))
    })
  })

  mo.describe('--exclude', function () {
    mo.it('accepts *, **, |, parentheses and repeated patterns', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', fromModelica, '-o', 'json', '--validate', 'cdl', '-d', dir,
        '--exclude', 'FromModelica.(ExtendsClause_*|Parameter3)', '--exclude', '**.MisplacedInfoWithEquation|FromModelica.DynamicTextColor'])
      as.equal(result.status, 0, result.output)
      const files = listFiles(join(dir, 'json', 'FromModelica'))
      as.ok(files.includes('Enable.json'))
      ;['ExtendsClause_1.json', 'Parameter3.json', 'MisplacedInfoWithEquation.json', 'DynamicTextColor.json'].forEach((file) => {
        as.ok(!files.includes(file), `${file} is written`)
      })
    })
    mo.it('excludes the classes of a package', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', fromModelica, '-o', 'json', '-d', dir, '--exclude', 'FromModelica'])
      as.equal(result.status, 0, result.output)
      as.deepEqual(listFiles(dir), [])
    })
  })

  mo.describe('deprecated options', function () {
    mo.it('maps -f to -i, with a warning', function () {
      const dirs = [makeTempDir(), makeTempDir()]
      const moFile = join(fromModelica, 'Block1.mo')
      const result = runApp(['-f', moFile, '-d', dirs[0]])
      as.equal(result.status, 0, result.output)
      as.match(result.output, /-f\/--file is deprecated: use -i\/--input/)
      as.equal(runApp(['-i', moFile, '-d', dirs[1]]).status, 0)
      as.deepEqual(listFiles(dirs[0]), listFiles(dirs[1]))
    })
    mo.it('maps --cxfCore to -o cxf-core, with a warning', function () {
      const dir = makeTempDir()
      const result = runApp(['-i', join(getCdlDir(), 'Reals', 'Add.mo'), '-o', 'cxf', '--cxfCore', '--elementary', '-d', dir])
      as.equal(result.status, 0, result.output)
      as.match(result.output, /--cxfCore is deprecated: use -o cxf-core/)
      as.deepEqual(listFiles(dir), [join('cxf-core', 'CXF-Core.jsonld')])
    })
    mo.it('maps -m cdl to --validate cdl-mbl with the output json, with a warning', function () {
      const result = runApp(['-i', join(cdlCompliance, 'Case10NoInstanceDescription.mo'), '-o', 'json', '-m', 'cdl', '-d', makeTempDir()])
      as.equal(result.status, 1, result.output)
      as.match(result.output, /-m cdl is replaced with --validate cdl-mbl/)
    })
    mo.it('ignores -m modelica, with a warning', function () {
      const result = runApp(['-i', join(cdlCompliance, 'Case10NoInstanceDescription.mo'), '-o', 'json', '-m', 'modelica', '-d', makeTempDir()])
      as.equal(result.status, 0, result.output)
      as.match(result.output, /-m\/--mode is deprecated and ignored/)
    })
    mo.it('gives the same output with --prettyPrint and --pretty-print', function () {
      const dirs = [makeTempDir(), makeTempDir()]
      const moFile = join(fromModelica, 'Enable.mo')
      as.equal(runApp(['-i', moFile, '--prettyPrint', '-d', dirs[0]]).status, 0)
      as.equal(runApp(['-i', moFile, '--pretty-print', '-d', dirs[1]]).status, 0)
      const file = join('json', 'FromModelica', 'Enable.json')
      const content = fs.readFileSync(join(dirs[0], file), 'utf8')
      as.ok(content.includes('\n  '), 'The output is pretty-printed')
      as.equal(fs.readFileSync(join(dirs[1], file), 'utf8').replace(/"fullMoFilePath": "[^"]*"/, ''),
        content.replace(/"fullMoFilePath": "[^"]*"/, ''))
    })
  })
})
