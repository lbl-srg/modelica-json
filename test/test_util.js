const as = require('assert')
const mo = require('mocha')
const path = require('path')
const ut = require('../lib/util.js')
const fs = require('fs')

const env = Object.assign({}, process.env)

mo.afterEach(() => {
  process.env = Object.assign({}, env)
})

mo.describe('util', function () {
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
        'BlockWithArray3.mo',
        'BlockWithArray4.mo',
        'BlockWithArray5.mo',
        'BlockWithBlock1.mo',
        'ConditionalBlock.mo',
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
        'ModelWithControlsBlock.mo',
        'ModelWithControlsBlock2.mo',
        'MyController.mo',
        'MyControllerWithExportAnnotation1.mo',
        'MyControllerWithPropagate.mo',
        'MyControllerWithSemantics.mo',
        'NoClassComment.mo',
        'NoWithin.mo',
        'Parameter1.mo',
        'Parameter1WithVendorAnnotation.mo',
        'Parameter2.mo',
        'Parameter3.mo',
        'ParameterWithAttributes.mo',
        'ParameterWithDefaultName.mo',
        'ParameterWithInfo.mo',
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
      moFiles.forEach(moFile => {
        as.ok(expectedFilesInTestFolder.includes(path.basename(moFile)), 'File ' + moFile + ' are not found in expected files in test folder')
      })
    })
    mo.it('testing with single file', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const moFiles = ut.getMoFiles('Enable.mo')
      const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
      as.deepEqual(moFiles, expectedResult)
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
    mo.it('testing with single file without ending with .mo', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const moFiles = ut.getMoFiles(path.join('Enable'))
      const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
      as.deepEqual(moFiles, expectedResult)
    })
    mo.it('testing with single file, with package name without ending with .mo', function () {
      process.env.MODELICAPATH = path.join(__dirname)
      const moFiles = ut.getMoFiles('FromModelica.Enable')
      const expectedResult = [path.join(__dirname, 'FromModelica', 'Enable.mo')]
      as.deepEqual(moFiles, expectedResult)
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
})
