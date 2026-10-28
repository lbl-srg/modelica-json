'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const fs = require('fs')
const os = require('os')
const util = require('util')
const logger = require('winston')

const pa = require('../lib/parser')
const ut = require('../lib/util')
const oe = require('../lib/objectExtractor')
const cxfExt = require('../lib/cxfExtractor')

// function with helper files
const hp = require('./helpers_test')

logger.level = 'error'

// Layout of the evalAndArrays test package:
//   test/evalAndArrays/ -- the sequences under test, a Modelica package so the
//                    folder name must equal the package name declared in its package.mo.
//                    These Modelica files are the only hand written input; everything
//                    else lives under test/reference/ and is derived from them.
//   test/reference/objects/evalAndArrays/ -- the objects json every sequence is
//                    expected to produce
//   test/reference/cxf/evalAndArrays/ -- the CXF graph built from each of those
//                    objects json files, one file per test case
//   test/evalAndArrays/params/ -- user supplied parameter values, keyed by sequence
//                    name, only for the sequences needing them. Hand written input like
//                    the Modelica files, one file per run that is given values:
//                      evalAndArrays.json             -- the parse of this package
//                      evalAndArraysErrors.json       -- every open parameter of test/evalAndArraysErrors
//                      evalAndArraysErrorsPartial.json -- only DefaultingError, so the run stops on ThreepeatUnbound

// order of exec for this file
// 1. Parse the Modelica files to generate the objects json.
// 2. Read the generated objects json and compare against the references.
// 3. Run the cxf extractor and check the resulting graphs.

// although this test file is mainly for the object layer, it's crucial to check if the cxf layer correctly creates the objects

// Specific qualities that are being tested:
//   * every paramater points to a literal value instead of an expression
//   * an array of components becomes one plain component per element, named
//     "<name>_<index>"", and the connections are expanded to match
//   * conditional components that are "false" are removed
//   * the component that instantiates a sub sequence names the class it came
//     from as its `type_specifier` and carries the values it resolved to
//   * an instantiation the class cannot describe, because the values it is
//     given change what it is made of beyond dropping a conditional component,
//     gets a file of its own, named after the class it came from and the
//     instance path it was resolved at, e.g. "Specialize_Unit.uniWide.json"
//     beside "Specialize.json"; the component then names that block as
//     `subInstanceDefinition` -- which is the link the cxf layer follows

// The cxf layer gets no specific references; all of it's input comes solely from the objects layer,
// the bottleneck is the correctness of the objects layer. Thus the cxf creator is unaware of the expression evaluation
// and array support functionality of the previous layer, it simply works with what it's handed

const moDir = path.join('test', 'evalAndArrays')
const referenceDir = path.join(__dirname, 'reference', 'objects', 'evalAndArrays')
const cxfReferenceDir = path.join(__dirname, 'reference', 'cxf', 'evalAndArrays')
const paramsDir = path.join(__dirname, 'evalAndArrays', 'params')
const paramsFile = path.join(paramsDir, 'evalAndArrays.json')

// the flag combination a sequence is parsed with, named for it; every other
// sequence is parsed with both flags on
const flagsOf = {
  FlagsNone: { evaluateExpressions: false, flattenArrays: false },
  FlagsEval: { evaluateExpressions: true, flattenArrays: false },
  FlagsArray: { evaluateExpressions: false, flattenArrays: true }
}
const bothFlags = { evaluateExpressions: true, flattenArrays: true }

// user supplied parameter values of the package, keyed by sequence name; an
// absent file simply means no sequence of the package takes supplied values
const userValues = fs.existsSync(paramsFile)
  ? JSON.parse(fs.readFileSync(paramsFile, 'utf8'))
  : {}

// retrievers the current set of test cases from the reference objects json
//   mainCases -- the top level sequences
//   testCases -- combination of top level and sub sequences
const { mainCases, testCases } = hp.testCaseNames(referenceDir)

// the sequence each objects json belongs to; a sub instance file such as
// "Flags_Unit.uniArr" belongs to the sequence that instantiates it
const sequenceOf = {}
mainCases.forEach(function (name) {
  sequenceOf[name] = name
  hp.subSequenceFiles(referenceDir, name).forEach(function (file) { sequenceOf[file] = name })
})

// the flags a test case was parsed with, those of the sequence it belongs to
function flagsFor (name) {
  return flagsOf[sequenceOf[name] ?? name] || bothFlags
}

mo.describe('evaluation and arrays', function () {
  mo.describe('Testing parse from Modelica to Objects Json', function () {
    // remove the outputs before running the tests, then generate the object files
    mo.before(function () {
      hp.removeOutputDirs(['objects', 'json'])
      // dumps of the previous run, so whatever is left behind belongs to this one
      if (fs.existsSync(hp.diffDir())) ut.removeDir(hp.diffDir())
      /* The flags are always passed explicitly rather than relying on a default.
         The flag sequences are parsed first, each with its own combination; the
         rest of the package last with both on, so a class they share
         (Flags_Unit) is left as the both-flags run writes it. */
      const moFiles = ut.getMoFiles(moDir)
      function parse (files, flags) {
        pa.getJsons(files, 'semantic', 'current', true,
          /* generateElementary= */ false, /* generateCxfCore= */ false,
          /* mode= */ 'cdl', /* valueProp= */ paramsFile,
          flags.evaluateExpressions, flags.flattenArrays)
      }
      Object.entries(flagsOf).forEach(function ([name, flags]) {
        parse(moFiles.filter(function (file) { return path.basename(file, '.mo') === name }), flags)
      })
      parse(moFiles.filter(function (file) { return flagsOf[path.basename(file, '.mo')] === undefined }), bothFlags)
    })

    // remove after running the tests just in case; the dumps a failing
    // comparison writes live outside these folders and are kept on purpose
    mo.after(function () {
      hp.removeOutputDirs(['objects', 'json'])

      if (!fs.existsSync(hp.diffDir())) return
      console.log('\n  Both sides of every failing case were written to ' + hp.diffDir() +
        '\n  Diff one with: git diff --no-index ' +
        path.join('test', 'diffs', '<name>.expected.json') + ' ' +
        path.join('test', 'diffs', '<name>.generated.json') + '\n')
    })

    // testing per each expected objects json file
    hp.jsonBaseNames(referenceDir).forEach(function (name) {
      mo.it('Objects json for ' + name, function () {
        const generatedPath = hp.objectsJsonPath(hp.generatedObjectsDir(moDir), name)
        const referencePath = hp.objectsJsonPath(referenceDir, name)

        // check to capture files that weren't generated
        as.ok(fs.existsSync(generatedPath), 'No objects json was generated at ' + generatedPath)

        // compare the generated and reference objects json files and capture differences
        const generated = hp.readNormalizedObjects(generatedPath)
        const reference = hp.readNormalizedObjects(referencePath)
        const differences = []
        hp.compare(generated, reference, name, differences, 0.001)

        // dump both sides so the mismatch can be read with a diff tool, the
        // generated tree itself being deleted once the suite is done
        let dumpedTo = ''
        if (differences.length > 0) {
          dumpedTo = '\n  Both sides were written to ' +
            hp.writeDiffArtifacts(name, generated, reference, differences)
        }

        // assert the failures as differences
        as.deepStrictEqual(differences, [],
          differences.length + ' difference(s) from ' + referencePath + ':\n  ' +
            differences.join('\n  ') + dumpedTo)
      })
    })

    mo.it('No objects json is generated that is not expected', function () {
      // test case where a generated objects json file has no corresponding reference file
      const generatedDir = hp.generatedObjectsDir(moDir)

      if (!fs.existsSync(generatedDir)) return
      const extraFile = hp.jsonBaseNames(generatedDir).filter(function (name) {
        return !hp.jsonBaseNames(referenceDir).includes(name)
      })

      as.deepStrictEqual(extraFile, [], 'Unexpected objects json: ' + extraFile.join(', '))
    })
  })

  mo.describe('Testing the expected objects', function () {
    // testing the generated object files against the expected sequences
    mo.it('Every entry of params.json belongs to a sequence of the package', function () {
      // checking if every sequence named in params.json is one of this package
      const orphans = Object.keys(userValues)
        .filter(function (name) { return !mainCases.includes(name) })
      as.deepStrictEqual(orphans, [], 'params.json entries with no matching sequence: ' + orphans.join(', '))
    })

    mainCases.forEach(function (name) {
      const supplied = userValues[name]

      if (supplied === undefined) return

      mo.it('values in ' + name + ' propogated correctly', function () {
        // for each parameter-value pair in the input file, check against the expected objects
        // ensure that the value in the input file matches the value in the expected objects

        Object.entries(supplied).forEach(function ([parameter, value]) {
          const instance = hp.readNormalizedObjects(hp.objectsJsonPath(referenceDir, name)).instances[parameter]
          as.ok(instance !== undefined, name + ' declares no parameter named ' + parameter)

          // find and assert the differences
          const differences = []
          hp.compare(hp.parameterValue(instance), String(value),
            name + '.' + parameter, differences, 0.001)
          as.deepStrictEqual(differences, [],
            'Value supplied for ' + name + ' in ' + paramsFile + ' is not the one the expected objects carry: ' +
              differences.join(', '))
        })
      })
    })

    // testing if the expected objects hold literal values only
    // only for the sequences parsed with the evaluation on
    testCases.filter(function (name) { return flagsFor(name).evaluateExpressions }).forEach(function (name) {
      mo.it('expected objects of ' + name + ' hold literal values only', function () {
        const objectsJson = hp.readNormalizedObjects(hp.objectsJsonPath(referenceDir, name))
        const unresolved = []
        Object.entries(objectsJson.instances).forEach(function ([parameter, instance]) {
          // check if instance is a parameter
          if (instance.type_prefix === undefined || !String(instance.type_prefix).includes('parameter')) return

          const value = hp.parameterValue(instance)
          if (value === undefined) {
            unresolved.push(parameter + ' (no value)')
          } else if (typeof value !== 'string') {
            // a structured node here means a for_loop or function_call survived
            unresolved.push(parameter + ' (' + JSON.stringify(value) + ')')
          } else if (/[A-Za-z_]/.test(value) && value !== 'true' && value !== 'false') {
            // checks to see if the value contains any letters, indicating it might be an unresolved identifier
            unresolved.push(parameter + ' (' + value + ')')
          }
        })
        // assert that there are no unresolved parameters if none of the checks above failed
        as.deepStrictEqual(unresolved, [], name + ' has unresolved parameters: ' + unresolved.join(', '))
      })
    })
  })

  mo.describe('Testing CXF generation from the expected objects', function () {
    // the graph each objects json produced, filled in below and read by the last tests
    const graphs = {}

    // the nodes of a graph; one holding a single node, as the package does, is serialized without "@graph"
    function nodesOf (cxf) {
      return Array.isArray(cxf['@graph']) ? cxf['@graph'] : [cxf]
    }

    // one CXF file per objects json, built the way the parser builds it: the
    // sequence, every class and every sub instance each a graph of its own
    hp.jsonBaseNames(referenceDir).forEach(function (name) {
      mo.it('CXF graph of ' + name, function () {
        const objectsJson = hp.readNormalizedObjects(hp.objectsJsonPath(referenceDir, name))
        const cxf = cxfExt.getCxfGraph(
          objectsJson.instances, objectsJson.requiredReferences, name, false, false)

        // assert that the CXF graph is not empty
        as.ok(cxf !== null && nodesOf(cxf).some(function (node) { return node['@id'] !== undefined }),
          'CXF of ' + name + ' has an empty graph')
        graphs[name] = cxf

        // compare against the committed cxf reference
        const referencePath = path.join(cxfReferenceDir, name + '.jsonld')
        as.ok(fs.existsSync(referencePath), 'No reference CXF for ' + name + ' at ' + referencePath)
        as.deepStrictEqual(cxf, JSON.parse(fs.readFileSync(referencePath, 'utf8')),
          'CXF result differs for ' + referencePath)
      })
    })

    mo.it('Every component is typed by a block with a file of its own', function () {
    // every sub-sequence must be fully defined, thus check for dangling blocks
    // a component is typed either by a block in the graph or by a class or sub instance that has a file of its own
      const classFiles = new Set(hp.jsonBaseNames(referenceDir).map(function (name) {
        return 'ex:' + hp.ownClass(hp.readObjects(referenceDir, name)).within + '.' + name
      }))
      const dangling = []
      Object.keys(graphs).forEach(function (name) {
        const cxf = graphs[name]
        if (cxf === undefined) return
        const blocks = new Set(nodesOf(cxf)
          .filter(function (node) { return node['@type'] === 'S231:Block' })
          .map(function (node) { return node['@id'] }))

        nodesOf(cxf).forEach(function (node) {
          const type = node['@type']
          if (typeof type !== 'string') return

          // CDL blocks can't dangle so only check for blocks from this suite of tests
          if (!type.startsWith('ex:evalAndArrays.')) return
          if (!blocks.has(type) && !classFiles.has(type)) dangling.push(name + ': ' + node['@id'] + ' is a ' + type)
        })
      })
      // assert that there are no dangling blocks
      as.deepStrictEqual(dangling, [], 'Components with no block definition:\n  ' + dangling.join('\n  '))
    })

    mo.it('Every expansion record of the objects json is carried into the CXF', function () {
      // instanceOf, arrayExpansion and elementaryExpansion record what the evaluation and
      // the flattening changed; each must reach the node of the same instance unchanged
      const recordKeys = ['instanceOf', 'arrayExpansion', 'elementaryExpansion']

      // a CXF value read back into the shape the objects json has
      function fromCxf (value) {
        if (Array.isArray(value)) return value.map(fromCxf)
        if (value === null || typeof value !== 'object') return value
        if ('@list' in value) return value['@list'].map(fromCxf)
        if ('@value' in value) return value['@value']
        const object = {}
        Object.entries(value).forEach(function ([key, entry]) {
          object[key.replace(/^modelica:/, '')] = fromCxf(entry)
        })
        return object
      }

      const missing = []
      let carried = 0
      hp.jsonBaseNames(referenceDir).forEach(function (name) {
        const objectsJson = hp.readObjects(referenceDir, name)
        const within = hp.ownClass(objectsJson).within
        const nodes = {}
        nodesOf(graphs[name]).forEach(function (node) { nodes[node['@id']] = node })

        Object.entries(objectsJson.instances).forEach(function ([instance, instanceDict]) {
          const id = 'ex:' + within + '.' + (instanceDict.type === 'long_class_specifier' ? name : name + '.' + instance)
          recordKeys.forEach(function (key) {
            if (instanceDict[key] === undefined) return
            carried++
            const node = nodes[id]
            const value = node === undefined ? undefined : fromCxf(node['modelica:' + key])
            // key order is not compared, the serializer sorts the keys of a node
            if (!util.isDeepStrictEqual(value, instanceDict[key])) {
              missing.push(name + ': ' + id + ' ' + key + ' is ' + JSON.stringify(value) +
                ', the objects json has ' + JSON.stringify(instanceDict[key]))
            }
          })
        })
      })
      as.ok(carried > 0, 'No expansion record found in the objects references')
      as.deepStrictEqual(missing, [], 'Expansion records not carried into the CXF:\n  ' + missing.join('\n  '))
    })

    mo.it('Every instantiation of a sub-sequence gets a block of its own', function () {
      // uniKeep has the structure of Specialize_Unit, uniDrop only drops a
      // conditional component the class declares, uniWide has two array
      // elements where the class has one; each is typed by its own block
      const types = {}
      graphs.Specialize['@graph'].forEach(function (node) {
        types[node['@id']] = node['@type']
      })
      ;['uniKeep', 'uniDrop', 'uniWide'].forEach(function (instance) {
        as.strictEqual(types['ex:evalAndArrays.Specialize.' + instance],
          'ex:evalAndArrays.Specialize_Unit.' + instance)
        const block = graphs['Specialize_Unit.' + instance]
        as.ok(block !== undefined, 'No CXF graph of Specialize_Unit.' + instance)
        as.ok(block['@graph'].some(function (node) {
          return node['@id'] === 'ex:evalAndArrays.Specialize_Unit.' + instance && node['@type'] === 'S231:Block'
        }), 'Specialize_Unit.' + instance + ' does not define its own block')
      })
    })

    mo.it('Neither flag gives a sub-sequence a block of its own', function () {
      // FlagsNone is parsed as the Modelica declared it, so uniNone stays a Flags_Unit
      const types = {}
      graphs.FlagsNone['@graph'].forEach(function (node) {
        types[node['@id']] = node['@type']
      })
      as.strictEqual(types['ex:evalAndArrays.FlagsNone.uniNone'], 'ex:evalAndArrays.Flags_Unit')
      as.ok(!hp.jsonBaseNames(referenceDir).includes('Flags_Unit.uniNone'),
        'Flags_Unit.uniNone was written although neither flag was on')
    })
  })

  mo.describe('Testing the two flags against each other', function () {
    // This suite tests the interaction between the evaluation and array flattening flags.
    const sequence = 'FlagsArray'
    const moFile = path.join(moDir, sequence + '.mo')

    // one output directory per combination, all removed once the suite is done
    const outDirs = []
    function run (evaluateExpressions, flattenArrays) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evalAndArraysFlags-'))
      outDirs.push(dir)
      pa.getJsons([moFile], 'semantic', dir, true,
        /* generateElementary= */ false, /* generateCxfCore= */ false,
        /* mode= */ 'cdl', /* valueProp= */ null,
        evaluateExpressions, flattenArrays)
      return hp.readNormalizedObjects(hp.objectsJsonPath(path.join(dir, 'objects', moDir), sequence))
    }

    mo.after(function () {
      outDirs.forEach(function (dir) { if (fs.existsSync(dir)) ut.removeDir(dir) })
    })

    // the components an array of three was written as, by the names they take
    function arrayComponents (objects) {
      return Object.keys(objects.instances)
        .filter(function (name) { return /^multer(_\d+)?$/.test(name) })
        .sort()
    }

    // whether a parameter no array depends on kept the expression it was written as
    function statusIsSymbolic (objects) {
      const expression = objects.instances.status.single_component_list.declaration.modification.expression
      return expression.simple_expression === undefined
    }

    mo.it('Neither flag leaves the arrays and the expressions as written', function () {
      const objects = run(false, false)
      as.deepStrictEqual(arrayComponents(objects), ['multer'])
      as.ok(statusIsSymbolic(objects), 'status was evaluated although neither flag asked for it')
    })

    mo.it('Evaluation alone resolves the expressions and leaves the arrays', function () {
      const objects = run(true, false)
      as.deepStrictEqual(arrayComponents(objects), ['multer'])
      as.ok(!statusIsSymbolic(objects), 'status was left as an expression although the evaluation was asked for')
    })

    mo.it('Both flags resolve the expressions and flatten the arrays', function () {
      const objects = run(true, true)
      as.deepStrictEqual(arrayComponents(objects), ['multer_1', 'multer_2', 'multer_3'])
      as.ok(!statusIsSymbolic(objects), 'status was left as an expression although the evaluation was asked for')
    })

    mo.it('Flattening alone still flattens an array whose size is an expression', function () {
      
      const objects = run(false, true)
      as.deepStrictEqual(arrayComponents(objects), ['multer_1', 'multer_2', 'multer_3'])
    })

    mo.it('Flattening alone keeps the values the flattening needed and only those', function () {
      const objects = run(false, true)

      as.strictEqual(
        hp.parameterValue(objects.instances.k_2), '2',
        'The array binding was not indexed, so the evaluation did not reach the flattening')
      as.strictEqual(
        objects.instances.multer_2.single_component_list.declaration.modification
          .class_modification[0].element_modification_or_replaceable.element_modification
          .modification.expression.simple_expression,
        '2',
        'The element of the array component was not bound to its own value')

      // and what no array depended on is back to the expression it was written as
      as.ok(statusIsSymbolic(objects),
        'status kept the value it evaluated to although the evaluation was not asked for')
      as.strictEqual(
        objects.instances.uniArr.single_component_list.declaration.modification
          .class_modification[0].element_modification_or_replaceable.element_modification
          .modification.expression.simple_expression,
        'nZon',
        'The value the sub sequence is instantiated with kept what it evaluated to')
    })

    mo.it('No record of what an expression was before it was evaluated is written out', function () {
      // the reversion is an internal step; none of its bookkeeping is part of the schema
      ;[[false, false], [true, false], [false, true], [true, true]].forEach(function (flags) {
        const written = hp.stableStringify(run(flags[0], flags[1]))
        as.ok(!written.includes('_original'),
          'evaluateExpressions=' + flags[0] + ', flattenArrays=' + flags[1] +
            ' wrote the pre-evaluation bookkeeping into the objects json')
      })
    })

    mo.it('Flattening alone does not stop on a parameter it cannot resolve', function () {
      // The test checks that flattening alone does not stop on a parameter it cannot resolve.
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evalAndArraysFlags-'))
      outDirs.push(dir)
      const errorMoFiles = ut.getMoFiles(path.join('test', 'evalAndArraysErrors'))

      as.doesNotThrow(function () {
        pa.getJsons(errorMoFiles, 'semantic', dir, true, false, false, 'cdl', null,
          /* evaluateExpressions= */ false, /* flattenArrays= */ true)
      })
      as.throws(function () {
        pa.getJsons(errorMoFiles, 'semantic', dir, true, false, false, 'cdl', null,
          /* evaluateExpressions= */ true, /* flattenArrays= */ true)
      }, oe.UnresolvedParameterError)
    })
  })

  mo.describe('Testing the parameters a sequence leaves without a value', function () {
    const errorMoDir = path.join('test', 'evalAndArraysErrors')
    // supplies every parameter the Modelica sources of that package leave open
    const errorParamsFile = path.join(paramsDir, 'evalAndArraysErrors.json')
    // supplies DefaultingError only, leaving ThreepeatUnbound open
    const partialParamsFile = path.join(paramsDir, 'evalAndArraysErrorsPartial.json')

    // one output directory per run, so that "no files" is a statement about
    // this run and not about whatever an earlier one left behind
    const outDirs = []
    function freshOutDir () {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evalAndArraysErrors-'))
      outDirs.push(dir)
      return dir
    }

    mo.after(function () {
      outDirs.forEach(function (dir) { if (fs.existsSync(dir)) ut.removeDir(dir) })
    })

    // every file below dir, so that an empty tree and a missing one read alike
    function filesUnder (dir) {
      if (!fs.existsSync(dir)) return []
      return fs.readdirSync(dir, { withFileTypes: true }).reduce(function (found, entry) {
        const full = path.join(dir, entry.name)
        return found.concat(entry.isDirectory() ? filesUnder(full) : [full])
      }, [])
    }

    // the same call the suite above makes, against the package of unresolved
    // parameters and with the values file the case under test asks for
    function run (outDir, valuesFile) {
      pa.getJsons(ut.getMoFiles(errorMoDir), 'semantic', outDir, true,
        /* generateElementary= */ false, /* generateCxfCore= */ false,
        /* mode= */ 'cdl', /* valueProp= */ valuesFile,
        /* evaluateExpressions= */ true, /* flattenArrays= */ true)
    }

    mo.it('A parameter of the sequence itself that nothing gives a value to stops the run', function () {
      const outDir = freshOutDir()
      as.throws(function () { run(outDir, null) }, oe.UnresolvedParameterError)

      // DefaultingError.kNone is declared with no binding and no min or max, so
      // nothing in the source constrains it and no value was supplied
      let raised = null
      try { run(outDir, null) } catch (error) { raised = error }
      as.strictEqual(raised.className, 'evalAndArraysErrors.DefaultingError')
      as.deepStrictEqual(raised.parameters, ['kNone'])
    })

    mo.it('A parameter the instantiation leaves unbound stops the run, named by its instance path', function () {
      /* Only DefaultingError is supplied, so the run gets past it and stops on
         ThreepeatUnbound instead: uni1 is declared without the final inpVal its
         siblings carry, so the sub sequence has a parameter the parent never
         binds. It is named by the path from the sequence down, which is the key
         the values file would have to use to answer it. */
      const outDir = freshOutDir()
      let raised = null
      try { run(outDir, partialParamsFile) } catch (error) { raised = error }

      as.ok(raised instanceof oe.UnresolvedParameterError,
        'Expected an UnresolvedParameterError, got ' + raised)
      as.strictEqual(raised.className, 'evalAndArraysErrors.ThreepeatUnbound')
      as.deepStrictEqual(raised.parameters, ['uni1.inpVal'])
    })

    mo.it('No files are written by a run that stops', function () {
      // the whole point of stopping: nothing downstream is handed a sequence
      // holding a value this parser invented for it
      const outDir = freshOutDir()
      as.throws(function () { run(outDir, null) }, oe.UnresolvedParameterError)

      const written = filesUnder(outDir)
      as.deepStrictEqual(written, [], 'A run that stopped still wrote:\n  ' + written.join('\n  '))
    })

    mo.it('A supplied value resolves the parameter the instantiation leaves unbound', function () {
      /* The same package as the two cases above, and the same unbound uni1,
         with every open parameter answered by the values file. The run is
         expected to go through, and the sub sequence to carry the supplied
         value rather than a default. */
      const outDir = freshOutDir()
      as.doesNotThrow(function () { run(outDir, errorParamsFile) })

      /* uni1 has the structure of Threepeat_Unit, so it keeps that class as its
         type and carries the values it resolved to on its own declaration. */
      const objectsDir = path.join(outDir, 'objects', errorMoDir)
      const sequence = hp.objectsJsonPath(objectsDir, 'ThreepeatUnbound')
      as.ok(fs.existsSync(sequence), 'No objects json was generated at ' + sequence)

      /* inpVal is what the values file supplied. derivVal is declared as
         inpVal + 1 and is checked with it, because a supplied value that the
         expressions of the sub sequence do not see is only half resolved. */
      const uni1 = hp.readNormalizedObjects(sequence).instances.uni1
      const supplied = JSON.parse(fs.readFileSync(errorParamsFile, 'utf8')).ThreepeatUnbound['uni1.inpVal']
      const differences = []
      hp.compare(hp.modificationValue(uni1, 'inpVal'), String(supplied),
        'ThreepeatUnbound.uni1.inpVal', differences, 0.001)
      hp.compare(hp.modificationValue(uni1, 'derivVal'), String(supplied + 1),
        'ThreepeatUnbound.uni1.derivVal', differences, 0.001)
      as.deepStrictEqual(differences, [],
        'The supplied value did not reach the sub sequence: ' + differences.join(', '))
    })
  })
})
