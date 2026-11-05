const as = require('assert')
const mo = require('mocha')
const path = require('path')
const ut = require('../lib/util.js')
const fs = require('fs')
const os = require('os')

const env = Object.assign({}, process.env)

mo.describe('util', function () {
  // These tests mutate process.env.MODELICAPATH; restore it after each test.
  // Scoped to this describe (not a root hook) so it does not reset the
  // environment for other test files in the suite.
  // The library roots registered by the files parsed in other test files are
  // also removed, so that getMODELICAPATH() only depends on MODELICAPATH.
  mo.beforeEach(() => {
    ut.resetLibraryRoots()
  })
  mo.afterEach(() => {
    process.env = Object.assign({}, env)
  })

  mo.describe('testing getMODELICAPATH()', function () {
    mo.it('must contain current directory and modelica-buildings', function () {
      const modelicapaths = ut.getMODELICAPATH()
      const m2jDir = __dirname.split(path.sep + 'test')[0]
      let found = false
      modelicapaths.forEach(moPath => {
        fs.readdirSync(moPath).forEach(file => {
          if (file.includes('Buildings')) {
            found = true
          }
        })
      })
      as.ok(ut.getMODELICAPATH().includes(m2jDir), 'MODELICAPATH must contain modelica-json directory')
      as.ok(found, 'MODELICAPATH must contain Buildings library directory')
    })
  })
  mo.describe('test getMoFiles()', function () {
    mo.it('testing with package', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const moFiles = ut.getMoFiles('FromModelica')
      const expectedFilesInTestFolder = [
        'Block1.mo',
        'BlockInputOutput.mo',
        'BlockWithArray1.mo',
        'BlockWithArray2.mo',
        'BlockWithBlock1.mo',
        'ConditionalBlock.mo',
        'ConditionalBlockWithCompoundGuard.mo',
        'ConditionalBlockWithDefaultValue.mo',
        'CustomPWithLimiter.mo',
        'CustomPWithLimiterExtensionBlock.mo',
        'CustomPWithLimiterNoDescription.mo',
        'DynamicTextColor.mo',
        'EmptyEquation.mo',
        'Enable.mo',
        'Enumeration1.mo',
        'ExtendsClause_1.mo',
        'ExtendsClause_2.mo',
        'ExtendsClause_3.mo',
        'ExtendsClause_4.mo',
        'GainOutputsTwo.mo',
        'MisplacedInfoWithComponent.mo',
        'MisplacedInfoWithEquation.mo',
        'MisplacedInfoWithParameter.mo',
        'MyController.mo',
        'MyControllerWithExportAnnotation1.mo',
        'MyControllerWithPropagate.mo',
        'MyControllerWithSemantics.mo',
        'NoClassComment.mo',
        'Parameter1.mo',
        'Parameter1WithVendorAnnotation.mo',
        'Parameter2.mo',
        'Parameter3.mo',
        'ParameterWithAttributes.mo',
        'ParameterWithDefaultName.mo',
        'ParameterWithInfo.mo',
        'ParameterWithInvalidUnits.mo',
        'ParameterWithValidUnits.mo',
        'ParameterWithVendorAnnotationInInfo.mo',
        'PointList.mo',
        'RedeclaredBlock.mo',
        'RemovableInputs.mo',
        'ReplaceableBlock.mo',
        'ReplaceableCDL.mo',
        'SubController.mo',
        'SubControllerWithSemantics.mo',
        'TestEvaluation_1.mo',
        'TestEvaluation_2.mo',
        'TestEvaluation_3.mo',
        'TestEvaluation_4.mo',
        'VariableModification.mo',
        'WithCDLElementary.mo',
        'package.mo'
      ]
      // Each file must be found once, even if the package is also found below the current directory
      as.deepEqual(moFiles.map(moFile => path.basename(moFile)).sort(), expectedFilesInTestFolder.toSorted())
    })
    mo.it('testing with a bare class name that is not a top-level class', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      as.deepEqual(ut.getMoFiles('Enable.mo'), [])
    })
    mo.it('testing with single file, packages with "."', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const moFiles = ut.getMoFiles('FromModelica.Enable.mo')
      const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
      as.deepEqual(moFiles, expectedResult)
    })
    mo.it('testing with single file, packages with path.sep', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const moFiles = ut.getMoFiles(path.join('FromModelica', 'Enable.mo'))
      const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
      as.deepEqual(moFiles, expectedResult)
    })
    mo.it('testing with a bare class name that is not a top-level class, without ending with .mo', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      as.deepEqual(ut.getMoFiles('Enable'), [])
    })
    mo.it('testing with single file, with package name without ending with .mo', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const moFiles = ut.getMoFiles('FromModelica.Enable')
      const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
      as.deepEqual(moFiles, expectedResult)
    })
    mo.it('testing with a class that does not exist', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      as.deepEqual(ut.getMoFiles('FromModelica.NoSuchClass'), [])
    })
    mo.it('testing with a relative path starting with ../', function () {
      const moFiles = ut.getMoFiles(path.join('..', path.basename(process.cwd()), 'test', 'FromModelica', 'Enable.mo'))
      const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
      as.deepEqual(moFiles, expectedResult)
    })
    mo.it('testing that a relative path starting with ./ is not looked up in MODELICAPATH', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      as.deepEqual(ut.getMoFiles('.' + path.sep + path.join('FromModelica', 'Enable.mo')), [])
    })
    mo.it('testing with paths containing a directory with a dot in its name', function () {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'getMoFiles-'))
      try {
        const pkgDir = path.join(tmpDir, 'my.lib', 'Pkg')
        fs.mkdirSync(pkgDir, { recursive: true })
        const moFile = path.join(pkgDir, 'Enable.mo')
        fs.copyFileSync(path.join(__dirname, 'FromModelica', 'Enable.mo'), moFile)
        as.deepEqual(ut.getMoFiles(moFile), [moFile])
        as.deepEqual(ut.getMoFiles(pkgDir), [moFile])
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
    })
    mo.it('testing with a class name, from a directory outside the repository', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const cwd = process.cwd()
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'getMoFiles-'))
      try {
        process.chdir(tmpDir)
        const moFiles = ut.getMoFiles('FromModelica.Enable')
        const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
        as.deepEqual(moFiles, expectedResult)
      } finally {
        process.chdir(cwd)
        fs.rmSync(tmpDir, { recursive: true, force: true })
      }
    })
  })
  mo.describe('testing searchPath()', function () {
    mo.it('testing location of Enable.mo', function () {
      // console.log(ut.getMoFiles('Templates.Plants.Controls.HeatRecoveryChillers'))
      let sourceFile = ut.getMoFiles('Buildings.Templates.Plants.Controls.HeatRecoveryChillers.Controller.mo')
      as.equal(sourceFile.length, 1, 'Either Buildings.Templates.Plants.Controls.HeatRecoveryChillers.Controller.mo not found or multiple files found. Check MODELICAPATH')
      sourceFile = sourceFile[0]
      const actualOutput = ut.searchPath(['Enable'], 'Buildings.Templates.Plants.Controls.HeatRecoveryChillers', sourceFile)
      const expectedOutput = ut.getMoFiles('Buildings/Templates/Plants/Controls/HeatRecoveryChillers/Enable.mo')
      as.deepEqual(actualOutput, expectedOutput)
    })
  })
  mo.describe('testing readWithin(), getLibrary(), addLibraryRoot() and getRelativePath()', function () {
    let tmpDir
    // Write files in tmpDir, 'files' maps the paths relative to tmpDir to the file contents
    function writeFiles (files) {
      for (const [relPath, content] of Object.entries(files)) {
        const filePath = path.join(tmpDir, relPath)
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, content)
      }
    }
    mo.beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'libraryRoot-'))
    })
    mo.afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true })
      ut.resetLibraryRoots()
    })
    mo.it('testing readWithin()', function () {
      const cases = {
        'Named.mo': ['within A.B;\nblock C\nend C;\n', 'A.B'],
        'Spaces.mo': ['within A . B ;\nblock C\nend C;\n', 'A.B'],
        'Empty.mo': ['within ;\npackage P\nend P;\n', ''],
        'EmptyNoSpace.mo': ['within;\npackage P\nend P;\n', ''],
        'None.mo': ['block C\nend C;\n', null],
        'Comments.mo': ['﻿// within X;\n/* within Y;\n*/\n  within A.B;\nblock C\nend C;\n', 'A.B'],
        'InComment.mo': ['/*\nwithin A.B;\n*/\nblock C\nend C;\n', null],
        'AfterClass.mo': ['block C\nend C;\nwithin A.B;\n', null]
      }
      writeFiles(Object.fromEntries(Object.entries(cases).map(([f, [content]]) => [f, content])))
      for (const [f, [, expected]] of Object.entries(cases)) {
        as.strictEqual(ut.readWithin(path.join(tmpDir, f)), expected, `Wrong within clause for ${f}`)
      }
      as.strictEqual(ut.readWithin(path.join(tmpDir, 'DoesNotExist.mo')), null)
    })
    mo.it('testing getLibrary()', function () {
      const fromModelica = { name: 'FromModelica', root: __dirname }
      as.deepStrictEqual(ut.getLibrary(path.join(__dirname, 'FromModelica', 'Enable.mo')), fromModelica)
      as.deepStrictEqual(ut.getLibrary(path.join(__dirname, 'FromModelica', 'package.mo')), fromModelica)
      // A file without within clause contains a top-level class
      as.deepStrictEqual(ut.getLibrary(path.join(__dirname, 'NoWithin.mo')), { name: 'NoWithin', root: __dirname })
      writeFiles({
        'Lib/Sub/C.mo': 'within Lib.Sub;\nblock C\nend C;\n',
        'Lib/Sub/package.mo': 'within Lib;\npackage Sub\nend Sub;\n',
        'Lib/Other/C.mo': 'within Lib.Sub;\nblock C\nend C;\n',
        'C.mo': 'within Lib;\nblock C\nend C;\n',
        'Top.mo': 'block Top\nend Top;\n',
        'Top2/package.mo': 'within ;\npackage Top2\nend Top2;\n'
      })
      const lib = { name: 'Lib', root: tmpDir }
      as.deepStrictEqual(ut.getLibrary(path.join(tmpDir, 'Lib', 'Sub', 'C.mo')), lib)
      as.deepStrictEqual(ut.getLibrary(path.join(tmpDir, 'Lib', 'Sub', 'package.mo')), lib)
      as.deepStrictEqual(ut.getLibrary(path.join(tmpDir, 'Top.mo')), { name: 'Top', root: tmpDir })
      as.deepStrictEqual(ut.getLibrary(path.join(tmpDir, 'Top2', 'package.mo')), { name: 'Top2', root: tmpDir })
      // The within clause does not match the directories
      as.strictEqual(ut.getLibrary(path.join(tmpDir, 'Lib', 'Other', 'C.mo')), null)
      as.strictEqual(ut.getLibrary(path.join(tmpDir, 'C.mo')), null)
      as.strictEqual(ut.getLibrary(path.join(tmpDir, 'DoesNotExist.mo')), null)
    })
    mo.it('testing that a library registered with addLibraryRoot() takes precedence over MODELICAPATH', function () {
      // Two copies of the library Lib: A (input file) and B (on MODELICAPATH)
      writeFiles({
        'A/Lib/package.mo': 'within ;\npackage Lib\nend Lib;\n',
        'A/Lib/C.mo': 'within Lib;\nblock C\nend C;\n',
        'A/Other.mo': 'block Other\nend Other;\n',
        'B/Lib/package.mo': 'within ;\npackage Lib\nend Lib;\n',
        'B/Lib/C.mo': 'within Lib;\nblock C\nend C;\n',
        'B/Lib/OnlyInB.mo': 'within Lib;\nblock OnlyInB\nend OnlyInB;\n',
        'B/Other.mo': 'block Other\nend Other;\n'
      })
      const dirA = path.join(tmpDir, 'A')
      const dirB = path.join(tmpDir, 'B')
      process.env.MODELICAPATH = dirB
      as.deepEqual(ut.getMoFiles('Lib.C'), [path.join(dirB, 'Lib', 'C.mo')])
      as.deepStrictEqual(ut.addLibraryRoot(path.join(dirA, 'Lib', 'C.mo')), { name: 'Lib', root: dirA })
      // Registering another file of the same library is allowed
      as.deepStrictEqual(ut.addLibraryRoot(path.join(dirA, 'Lib', 'package.mo')), { name: 'Lib', root: dirA })
      // The classes of Lib are only looked up in A
      as.deepEqual(ut.getMoFiles('Lib.C'), [path.join(dirA, 'Lib', 'C.mo')])
      as.deepEqual(ut.getMoFiles('Lib.OnlyInB'), [])
      as.deepEqual(ut.searchPath(['Lib.C'], null), [path.join(dirA, 'Lib', 'C.mo')])
      as.deepEqual(ut.searchPath(['C'], 'Lib', path.join(dirA, 'Lib', 'package.mo')), [path.join(dirA, 'Lib', 'C.mo')])
      // The other classes are only looked up in MODELICAPATH, even if they are in A
      as.deepEqual(ut.getMoFiles('Other'), [path.join(dirB, 'Other.mo')])
      as.deepEqual(ut.getMODELICAPATH(), [process.cwd(), dirB])
      as.deepEqual(ut.getLookupPath(), [process.cwd(), dirB, dirA])
      // Lib cannot be loaded from B anymore
      as.throws(() => ut.addLibraryRoot(path.join(dirB, 'Lib', 'C.mo')), /already been loaded from/)
      ut.resetLibraryRoots()
      as.deepEqual(ut.getMoFiles('Lib.C'), [path.join(dirB, 'Lib', 'C.mo')])
    })
    mo.it('testing that getRelativePath() derives the path of Modelica files from their within clause', function () {
      const enable = path.join(__dirname, 'FromModelica', 'Enable.mo')
      as.strictEqual(ut.getRelativePath(enable), path.join('FromModelica', 'Enable.mo'))
      as.strictEqual(ut.getRelativePath(path.join(__dirname, 'FromModelica', 'package.mo')), path.join('FromModelica', 'package.mo'))
      as.strictEqual(ut.getRelativePath(path.join(__dirname, 'NoWithin.mo')), 'NoWithin.mo')
      // The path does not depend on the current directory
      const cwd = process.cwd()
      try {
        process.chdir(path.join(__dirname, 'FromModelica'))
        as.strictEqual(ut.getRelativePath(enable), path.join('FromModelica', 'Enable.mo'))
        as.strictEqual(ut.getRelativePath('Enable.mo'), path.join('FromModelica', 'Enable.mo'))
      } finally {
        process.chdir(cwd)
      }
    })
    mo.it('testing that getRelativePath() returns the shortest path for a directory', function () {
      // From tmpDir, with MODELICAPATH=tmpDir/Aux, the candidates are 'Aux/Lib' and 'Lib'
      writeFiles({ 'Aux/Lib/package.mo': 'within ;\npackage Lib\nend Lib;\n' })
      const cwd = process.cwd()
      try {
        process.chdir(tmpDir)
        process.env.MODELICAPATH = path.join(tmpDir, 'Aux')
        as.strictEqual(ut.getRelativePath(path.join(tmpDir, 'Aux', 'Lib')), 'Lib')
      } finally {
        process.chdir(cwd)
      }
    })
  })
  mo.describe('testing joinWithinPath()', function () {
    mo.it('testing with current directory modelicapath', function () {
      const moPath = __dirname
      const within = ['FromModelica']
      const actuatOutput = ut.joinWithinPath(moPath, within)
      const expectedOutput = [path.join(__dirname, 'FromModelica'), __dirname]
      as.deepEqual(actuatOutput, expectedOutput)
    })
    mo.it('testing with empty within', function () {
      const moPath = __dirname
      const within = null
      const actuatOutput = ut.joinWithinPath(moPath, within)
      const expectedOutput = [__dirname]
      as.deepEqual(actuatOutput, expectedOutput)
    })
  })
  mo.describe('testing checkIfCdlElementaryBlockOrPackage()', function () {
    mo.it('testing set of files all true', function () {
      const filesToCheck1 = ['CDL/Reals/Add.mo', 'OBC/CDL/Reals/Add.mo', 'Controls/OBC/CDL/Reals/Add.mo', 'Buildings/Controls/OBC/CDL/Reals/Add.mo']
      const expectedOutput1 = true
      const filesToCheck2 = ['CDL.Reals.Add', 'OBC.CDL.Reals.Add', 'Controls.OBC.CDL.Reals.Add', 'Buildings.Controls.OBC.CDL.Reals.Add']
      const expectedOutput2 = true
      const filesToCheck3 = ['Reals/Sources/Constant.mo', 'CDL/Reals/Sources/Constant.mo', 'OBC/CDL/Reals/Sources/Constant.mo', 'Controls/OBC/CDL/Reals/Sources/Constant.mo', 'Buildings/Controls/OBC/CDL/Reals/Sources/Constant.mo']
      const expectedOutput3 = true
      const filesToCheck4 = ['Reals.Sources.Constant', 'CDL.Reals.Sources.Constant', 'OBC.CDL.Reals.Sources.Constant', 'Controls.OBC.CDL.Reals.Sources.Constant', 'Buildings.Controls.OBC.CDL.Reals.Sources.Constant']
      const expectedOutput4 = true

      filesToCheck1.forEach(file => {
        const actualOutput1 = ut.checkIfCdlElementaryBlockOrPackage(file, true)
        as.equal(actualOutput1, expectedOutput1, `File ${file} should return ${expectedOutput1}`)
      })
      filesToCheck2.forEach(file => {
        const actualOutput2 = ut.checkIfCdlElementaryBlockOrPackage(file, true)
        as.equal(actualOutput2, expectedOutput2, `File ${file} should return ${expectedOutput2}`)
      })
      filesToCheck3.forEach(file => {
        const actualOutput3 = ut.checkIfCdlElementaryBlockOrPackage(file, true)
        as.equal(actualOutput3, expectedOutput3, `File ${file} should return ${expectedOutput3}`)
      })
      filesToCheck4.forEach(file => {
        const actualOutput4 = ut.checkIfCdlElementaryBlockOrPackage(file, true)
        as.equal(actualOutput4, expectedOutput4, `File ${file} should return ${expectedOutput4}`)
      })
    })
    mo.it('testing with empty within', function () {
      const moPath = __dirname
      const within = null
      const actuatOutput = ut.joinWithinPath(moPath, within)
      const expectedOutput = [__dirname]
      as.deepEqual(actuatOutput, expectedOutput)
    })
  })
})
