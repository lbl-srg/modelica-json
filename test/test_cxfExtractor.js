'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const fs = require('fs')
const pa = require('../lib/parser')
const ut = require('../lib/util')
const ce = require('../lib/cxfExtractor.js')
const rdflib = require('rdflib')
const logger = require('winston')

mo.describe('cxfExtractor.js', function () {
  // The ModelicaMode package lives under test/. Its classes are referenced by
  // fully-qualified name (e.g. ModelicaMode.VAVBox); getMoFiles resolves them via
  // the test directory, which is registered as a library root by getJsons below,
  // based on the 'within' clause of the parsed files.
  // The objects JSON used by the validation helpers is generated below in
  // 'modelica' mode.
  const templatesDir = path.join(__dirname, 'ModelicaMode')
  const baseClass = 'ModelicaMode.VAVBox'
  const instanceName = 'ctl'
  const directory = process.cwd()

  mo.before(function () {
    const files = [
      path.join(templatesDir, 'VAVBoxCoolingOnly.mo'),
      path.join(templatesDir, 'VAVBoxCoolingOnlyOpenLoop.mo'),
      path.join(templatesDir, 'VAVBoxCoolingOnlyInvalid.mo'),
      path.join(templatesDir, 'BadController.mo')
    ]
    pa.getJsons(files, 'cxf', 'current', true, false, false, 'modelica')
  })

  mo.after(function () {
    for (const d of ['objects', 'json', 'cxf']) {
      const p = path.join(process.cwd(), d)
      if (fs.existsSync(p)) {
        ut.removeDir(p)
      }
    }
  })

  mo.describe('getConstrainingType(baseClass, instanceName, directory)', function () {
    mo.it('returns the constrainedby type of a replaceable component', function () {
      const constrainingType = ce.getConstrainingType(baseClass, instanceName, directory)
      as.equal(constrainingType, 'ModelicaMode.PartialController')
    })
  })

  mo.describe('isSubtype(redeclaredType, constrainingType, directory)', function () {
    mo.it('returns true for a structural subtype', function () {
      as.ok(ce.isSubtype('ModelicaMode.G36VAVBoxCoolingOnly', 'ModelicaMode.PartialController', directory))
    })
    mo.it('returns true for an identical type', function () {
      as.ok(ce.isSubtype('ModelicaMode.PartialController', 'ModelicaMode.PartialController', directory))
    })
    mo.it('returns false when a required component is missing', function () {
      as.ok(!ce.isSubtype('ModelicaMode.BadController', 'ModelicaMode.PartialController', directory))
    })
  })

  mo.describe('validateRedeclareConstrainedBy(redeclaredType, instanceName, baseClass, directory)', function () {
    mo.it('passes when the redeclared type is a subtype of the constraining type (G36)', function () {
      const result = ce.validateRedeclareConstrainedBy('ModelicaMode.G36VAVBoxCoolingOnly', instanceName, baseClass, directory)
      as.equal(result.constrainingType, 'ModelicaMode.PartialController')
      as.ok(result.valid, result.message || 'expected G36VAVBoxCoolingOnly to satisfy constrainedby')
    })

    mo.it('passes when the redeclared type is a subtype of the constraining type (OpenLoop)', function () {
      const result = ce.validateRedeclareConstrainedBy('ModelicaMode.OpenLoopVAVBoxCoolingOnly', instanceName, baseClass, directory)
      as.ok(result.valid, result.message || 'expected OpenLoopVAVBoxCoolingOnly to satisfy constrainedby')
    })

    mo.it('fails when the redeclared type is not a subtype of the constraining type (BadController)', function () {
      const result = ce.validateRedeclareConstrainedBy('ModelicaMode.BadController', instanceName, baseClass, directory)
      as.equal(result.constrainingType, 'ModelicaMode.PartialController')
      as.ok(!result.valid, 'expected BadController to fail constrainedby validation')
      as.ok(result.message && result.message.includes('not a subtype'),
        'expected an explanatory failure message')
    })
  })

  mo.describe('validateExtendsRedeclarations(moFile, directory)', function () {
    mo.it('does not throw for a template with a valid redeclared controller', function () {
      const moFile = path.join(templatesDir, 'VAVBoxCoolingOnly.mo')
      as.doesNotThrow(function () { ce.validateExtendsRedeclarations(moFile, directory) })
    })

    mo.it('throws when a template redeclares ctl to a type violating constrainedby (BadController)', function () {
      const moFile = path.join(templatesDir, 'VAVBoxCoolingOnlyInvalid.mo')
      as.throws(
        function () { ce.validateExtendsRedeclarations(moFile, directory) },
        /ModelicaMode\.BadController.*not a subtype.*ModelicaMode\.PartialController/
      )
    })
  })

  mo.describe('getCxfFromModelica(moFile, directory) — export CXF from a template (issue 280)', function () {
    const cxfDir = path.join(process.cwd(), 'cxf', 'ModelicaMode')

    mo.it('exports CXF for a controller redeclared in an extends clause', function () {
      ce.getCxfFromModelica(path.join(templatesDir, 'VAVBoxCoolingOnly.mo'), directory, true)
      const modelCxf = fs.readFileSync(path.join(cxfDir, 'VAVBoxCoolingOnly.jsonld'), 'utf8')
      const controllerCxf = fs.readFileSync(path.join(cxfDir, 'G36VAVBoxCoolingOnly.jsonld'), 'utf8')
      // The template model contains the control block redeclared as 'ctl',
      // typed by the redeclared controller.
      as.ok(modelCxf.includes('containsBlock'), 'model should contain the control block')
      as.ok(modelCxf.includes('VAVBoxCoolingOnly.ctl'), 'model should reference the ctl instance')
      as.ok(modelCxf.includes('ModelicaMode.G36VAVBoxCoolingOnly'), 'ctl should be typed by the redeclared controller')
      // The control block class CXF exposes its connectors.
      as.ok(controllerCxf.includes('hasInput') && controllerCxf.includes('hasOutput'),
        'control block CXF should expose input and output connectors')
    })

    mo.it('throws when the redeclared controller violates constrainedby', function () {
      as.throws(
        function () { ce.getCxfFromModelica(path.join(templatesDir, 'VAVBoxCoolingOnlyInvalid.mo'), directory, true) },
        /ModelicaMode\.BadController.*not a subtype.*ModelicaMode\.PartialController/
      )
    })
  })

  mo.describe('QUDT unit and quantity kind mapping (issue 340)', function () {
    const s231Ns = rdflib.Namespace('http://data.ashrae.org/S231#')
    const qudtNs = rdflib.Namespace('http://qudt.org/schema/qudt#')
    const unitNs = rdflib.Namespace('http://qudt.org/vocab/unit#')
    const qudtQkNs = rdflib.Namespace('http://qudt.org/vocab/quantitykind#')

    mo.it('maps CDL and MBL units to QUDT unit vocabulary', function () {
      as.equal(ce.getQudtUnit('1/s', unitNs).value, unitNs('PER-SEC').value)
      as.equal(ce.getQudtUnit('1/K', unitNs).value, unitNs('PER-K').value)
      as.equal(ce.getQudtUnit('J/(kg.K)', unitNs).value, unitNs('J-PER-KiloGM-K').value)
      as.equal(ce.getQudtUnit('Pa', unitNs).value, unitNs('PA').value)
      as.equal(ce.getQudtUnit('1', unitNs).value, unitNs('UNITLESS').value)
      as.equal(ce.getQudtUnit('cfm', unitNs).value, unitNs('FT3-PER-MIN').value)
      as.equal(ce.getQudtUnit('', unitNs), null)
    })

    mo.it('maps CDL and MBL quantity kinds to QUDT quantitykind vocabulary', function () {
      as.equal(ce.getQudtQuanityKind('PressureDifference', qudtQkNs).value, qudtQkNs('Pressure').value)
      as.equal(ce.getQudtQuanityKind('HeatFlowRate', qudtQkNs).value, qudtQkNs('HeatFlowRate').value)
      as.equal(ce.getQudtQuanityKind('SpecificHeatCapacity', qudtQkNs).value, qudtQkNs('SpecificHeatCapacity').value)
      as.equal(ce.getQudtQuanityKind('TemperatureSlope', qudtQkNs).value, qudtQkNs('TemperatureRate').value)
      as.equal(ce.getQudtQuanityKind('Density', qudtQkNs).value, qudtQkNs('Density').value)
      as.equal(ce.getQudtQuanityKind('', qudtQkNs), null)
    })

    mo.it('adds qudt:hasUnit, S231:hasDisplayUnit, and qudt:hasQuantityKind for mapped values', function () {
      const graph = rdflib.graph()
      const node = s231Ns('TestParam')
      const modDict = {
        unit: { value: '1/K' },
        displayUnit: { value: 'degC' },
        quantity: { value: 'SpecificHeatCapacity' }
      }
      ce.addAttributesToNode(graph, s231Ns, 'unit', modDict, node)
      ce.addAttributesToNode(graph, s231Ns, 'displayUnit', modDict, node)
      ce.addAttributesToNode(graph, s231Ns, 'quantity', modDict, node)

      as.equal(graph.any(node, qudtNs('hasUnit')).value, unitNs('PER-K').value)
      as.equal(graph.any(node, s231Ns('hasDisplayUnit')).value, unitNs('DEG_C').value)
      as.equal(graph.any(node, qudtNs('hasQuantityKind')).value, qudtQkNs('SpecificHeatCapacity').value)
    })

    mo.it('falls back to S231:unit, S231:displayUnit, and S231:quantity literals and warns on unmapped values', function () {
      const warnings = []
      const origWarn = logger.warn
      logger.warn = function (msg) { warnings.push(msg) }
      try {
        const graph = rdflib.graph()
        const node = s231Ns('TestUnmappedParam')
        const modDict = {
          unit: { value: 'customUnit' },
          displayUnit: { value: 'customDisplayUnit' },
          quantity: { value: 'PresureDifference' }
        }
        ce.addAttributesToNode(graph, s231Ns, 'unit', modDict, node)
        ce.addAttributesToNode(graph, s231Ns, 'displayUnit', modDict, node)
        ce.addAttributesToNode(graph, s231Ns, 'quantity', modDict, node)

        as.equal(graph.any(node, qudtNs('hasUnit')), undefined)
        as.equal(graph.any(node, s231Ns('hasDisplayUnit')), undefined)
        as.equal(graph.any(node, qudtNs('hasQuantityKind')), undefined)

        as.equal(graph.any(node, s231Ns('unit')).value, 'customUnit')
        as.equal(graph.any(node, s231Ns('displayUnit')).value, 'customDisplayUnit')
        as.equal(graph.any(node, s231Ns('quantity')).value, 'PresureDifference')
        as.equal(warnings.length, 3)
      } finally {
        logger.warn = origWarn
      }
    })
  })
})
