'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const fs = require('fs')
const pa = require('../lib/parser')
const ut = require('../lib/util')
const rewire = require('rewire')
const ce = rewire('../lib/cxfExtractor.js')
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
    const qudtNs = rdflib.Namespace('http://qudt.org/schema/qudt/')
    const unitNs = rdflib.Namespace('http://qudt.org/vocab/unit/')
    const qudtQkNs = rdflib.Namespace('http://qudt.org/vocab/quantitykind/')
    const getQudtUnit = ce.__get__('getQudtUnit')
    const getQudtQuantityKind = ce.__get__('getQudtQuantityKind')
    const addAttributesToNode = ce.__get__('addAttributesToNode')
    mo.it('maps CDL and MBL units to QUDT unit vocabulary', function () {
      as.equal(getQudtUnit('1/s').value, unitNs('PER-SEC').value)
      as.equal(getQudtUnit('1/K').value, unitNs('PER-K').value)
      as.equal(getQudtUnit('J/(kg.K)').value, unitNs('J-PER-KiloGM-K').value)
      as.equal(getQudtUnit('Pa').value, unitNs('PA').value)
      as.equal(getQudtUnit('1').value, unitNs('UNITLESS').value)
      as.equal(getQudtUnit('cfm').value, unitNs('FT3-PER-MIN').value)
      as.equal(getQudtUnit('kg/kg').value, unitNs('KiloGM-PER-KiloGM').value)
      as.equal(getQudtUnit('m3/(s.m2)').value, unitNs('M3-PER-SEC-M2').value)
      as.equal(getQudtUnit('BtuPerHour'), null)
      as.equal(getQudtUnit(''), null)
    })

    mo.it('maps CDL and MBL quantity kinds to QUDT quantitykind vocabulary', function () {
      as.equal(getQudtQuantityKind('PressureDifference').value, qudtQkNs('Pressure').value)
      as.equal(getQudtQuantityKind('HeatFlowRate').value, qudtQkNs('HeatFlowRate').value)
      as.equal(getQudtQuantityKind('SpecificHeatCapacity').value, qudtQkNs('SpecificHeatCapacity').value)
      as.equal(getQudtQuantityKind('TemperatureSlope').value, qudtQkNs('TemperatureRateOfChange').value)
      as.equal(getQudtQuantityKind('LinearTemperatureCoefficient').value, qudtQkNs('LinearThermalExpansion').value)
      as.equal(getQudtQuantityKind('Density').value, qudtQkNs('Density').value)
      as.equal(getQudtQuantityKind(''), null)
    })

    mo.it('adds qudt:hasUnit, S231:displayUnit literal, and qudt:hasQuantityKind for mapped values', function () {
      const graph = rdflib.graph()
      const node = s231Ns('TestParam')
      const modDict = {
        unit: { value: '1/K' },
        displayUnit: { value: 'degC' },
        quantity: { value: 'SpecificHeatCapacity' }
      }
      addAttributesToNode(graph, s231Ns, 'unit', modDict, node)
      addAttributesToNode(graph, s231Ns, 'displayUnit', modDict, node)
      addAttributesToNode(graph, s231Ns, 'quantity', modDict, node)

      as.equal(graph.any(node, qudtNs('hasUnit')).value, unitNs('PER-K').value)
      as.equal(graph.any(node, s231Ns('hasDisplayUnit')), undefined)
      as.equal(graph.any(node, s231Ns('displayUnit')).value, 'degC')
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
          unit: { value: 'kpa' },
          displayUnit: { value: 'customDisplayUnit' },
          quantity: { value: 'PresureDifference' }
        }
        addAttributesToNode(graph, s231Ns, 'unit', modDict, node)
        addAttributesToNode(graph, s231Ns, 'displayUnit', modDict, node)
        addAttributesToNode(graph, s231Ns, 'quantity', modDict, node)

        as.equal(graph.any(node, qudtNs('hasUnit')), undefined)
        as.equal(graph.any(node, s231Ns('hasDisplayUnit')), undefined)
        as.equal(graph.any(node, qudtNs('hasQuantityKind')), undefined)

        as.equal(graph.any(node, s231Ns('unit')).value, 'kpa')
        as.equal(graph.any(node, s231Ns('displayUnit')).value, 'customDisplayUnit')
        as.equal(graph.any(node, s231Ns('quantity')).value, 'PresureDifference')
        as.equal(warnings.length, 2)
        as.equal(warnings[0], 'Unit kpa could not be mapped to QUDT. Using S231:unit with literal value kpa.')
        as.equal(warnings[1], 'Quantity kind PresureDifference could not be mapped to QUDT. Using S231:quantity with literal value PresureDifference.')
      } finally {
        logger.warn = origWarn
      }
    })
  })

  mo.describe('CDL to CXF integration tests for valid and invalid units and quantity kinds (issue 340)', function () {
    const fromModelicaDir = path.join(__dirname, 'FromModelica')
    const cxfFromModelicaDir = path.join(process.cwd(), 'cxf', 'FromModelica')

    function findByLabel (graph, label) {
      return graph.find(node => node['S231:label'] === label)
    }

    mo.it('exports valid CDL and QUDT units, displayUnits, and quantity kinds from CDL to CXF', function () {
      const warnings = []
      const origWarn = logger.warn
      logger.warn = function (msg) { warnings.push(msg) }
      try {
        const validMo = path.join(fromModelicaDir, 'ParameterWithValidUnits.mo')
        pa.getJsons([validMo], 'cxf', 'current', true)
        const cxfDoc = JSON.parse(fs.readFileSync(path.join(cxfFromModelicaDir, 'ParameterWithValidUnits.jsonld'), 'utf8'))
        const graph = cxfDoc['@graph']

        const kCooCoi = findByLabel(graph, 'kCooCoi')
        as.deepEqual(kCooCoi['qudt:hasUnit'], { '@id': 'unit:PER-K' })
        as.deepEqual(kCooCoi['qudt:hasQuantityKind'], { '@id': 'q:LinearThermalExpansion' })
        as.equal(kCooCoi['S231:unit'], undefined)
        as.equal(kCooCoi['S231:quantity'], undefined)

        const slewRate = findByLabel(graph, 'slewRate')
        as.deepEqual(slewRate['qudt:hasUnit'], { '@id': 'unit:PER-SEC' })
        as.deepEqual(slewRate['qudt:hasQuantityKind'], { '@id': 'q:TemperatureRateOfChange' })

        const cp = findByLabel(graph, 'cp')
        as.deepEqual(cp['qudt:hasUnit'], { '@id': 'unit:J-PER-KiloGM-K' })
        as.deepEqual(cp['qudt:hasQuantityKind'], { '@id': 'q:SpecificHeatCapacity' })

        const TSet = findByLabel(graph, 'TSet')
        as.deepEqual(TSet['qudt:hasUnit'], { '@id': 'unit:K' })
        as.equal(TSet['S231:hasDisplayUnit'], undefined)
        as.equal(TSet['S231:displayUnit'], 'degC')
        as.deepEqual(TSet['qudt:hasQuantityKind'], { '@id': 'q:ThermodynamicTemperature' })

        const VFlow = findByLabel(graph, 'VFlow')
        as.deepEqual(VFlow['qudt:hasUnit'], { '@id': 'unit:M3-PER-SEC' })
        as.equal(VFlow['S231:hasDisplayUnit'], undefined)
        as.equal(VFlow['S231:displayUnit'], 'cfm')
        as.deepEqual(VFlow['qudt:hasQuantityKind'], { '@id': 'q:VolumeFlowRate' })

        as.equal(warnings.length, 0)
      } finally {
        logger.warn = origWarn
      }
    })

    mo.it('falls back to S231 literal properties and logs warnings when exporting invalid units and quantity kinds from CDL to CXF', function () {
      const warnings = []
      const origWarn = logger.warn
      logger.warn = function (msg) { warnings.push(msg) }
      try {
        const invalidMo = path.join(fromModelicaDir, 'ParameterWithInvalidUnits.mo')
        pa.getJsons([invalidMo], 'cxf', 'current', true)
        const cxfDoc = JSON.parse(fs.readFileSync(path.join(cxfFromModelicaDir, 'ParameterWithInvalidUnits.jsonld'), 'utf8'))
        const graph = cxfDoc['@graph']

        const dpDes = findByLabel(graph, 'dpDes')
        as.deepEqual(dpDes['qudt:hasUnit'], { '@id': 'unit:PA' })
        as.equal(dpDes['qudt:hasQuantityKind'], undefined)
        as.equal(dpDes['S231:quantity'], 'PresureDifference')

        const customPar = findByLabel(graph, 'customPar')
        as.equal(customPar['qudt:hasUnit'], undefined)
        as.equal(customPar['S231:hasDisplayUnit'], undefined)
        as.equal(customPar['qudt:hasQuantityKind'], undefined)
        as.equal(customPar['S231:unit'], 'customUnit')
        as.equal(customPar['S231:displayUnit'], 'customDisplayUnit')
        as.equal(customPar['S231:quantity'], 'CustomQuantity')

        const unmappedUnitValidQuantity = findByLabel(graph, 'unmappedUnitValidQuantity')
        as.equal(unmappedUnitValidQuantity['qudt:hasUnit'], undefined)
        as.equal(unmappedUnitValidQuantity['S231:unit'], 'invalidUnit')
        as.deepEqual(unmappedUnitValidQuantity['qudt:hasQuantityKind'], { '@id': 'q:Time' })

        as.equal(warnings.length, 4)
        as.ok(warnings.includes('Quantity kind PresureDifference could not be mapped to QUDT. Using S231:quantity with literal value PresureDifference.'))
      } finally {
        logger.warn = origWarn
      }
    })

    mo.it('only generates S231 classes and properties defined in s231ClassesProperties.ttl across all CXF files', function () {
      const ttlBody = fs.readFileSync(path.join(__dirname, '..', 'lib', 's231ClassesProperties.ttl'), 'utf8')
      const schemaGraph = rdflib.graph()
      rdflib.parse(ttlBody, schemaGraph, 'https://data.ashrae.org/s231.ttl', 'text/turtle')
      const s231Base = 'http://data.ashrae.org/S231#'
      const definedTerms = new Set(
        schemaGraph.statements
          .filter(st => st.subject.termType === 'NamedNode' && st.subject.value.startsWith(s231Base))
          .map(st => st.subject.value)
      )

      const moFiles = [
        path.join(fromModelicaDir, 'ParameterWithValidUnits.mo'),
        path.join(fromModelicaDir, 'ParameterWithInvalidUnits.mo')
      ]

      const warnings = []
      const origWarn = logger.warn
      logger.warn = function (msg) { warnings.push(msg) }
      try {
        pa.getJsons(moFiles, 'cxf', 'current', true)
      } finally {
        logger.warn = origWarn
      }

      function collectJsonldFiles (dir) {
        let results = []
        if (!fs.existsSync(dir)) return results
        for (const entry of fs.readdirSync(dir)) {
          const full = path.join(dir, entry)
          if (fs.statSync(full).isDirectory()) {
            results = results.concat(collectJsonldFiles(full))
          } else if (entry.endsWith('.jsonld') && entry !== 'CXF-Core.jsonld') {
            results.push(full)
          }
        }
        return results
      }

      const cxfFiles = collectJsonldFiles(cxfFromModelicaDir)
        .concat(collectJsonldFiles(path.join(__dirname, 'reference', 'cxf')))

      const expandS231 = (term, s231Prefix) => {
        if (typeof term !== 'string') return null
        if (term.startsWith('S231:')) return s231Prefix + term.slice('S231:'.length)
        if (term.startsWith(s231Prefix)) return term
        return null
      }

      const isCdlInstanceUri = uri => uri.startsWith(s231Base + 'Buildings.')

      const undefinedTerms = []
      for (const file of cxfFiles) {
        const doc = JSON.parse(fs.readFileSync(file, 'utf8'))
        const s231Prefix = (doc['@context'] && doc['@context'].S231) || s231Base
        const relFile = path.relative(process.cwd(), file)
        for (const node of doc['@graph'] || []) {
          const types = Array.isArray(node['@type']) ? node['@type'] : (node['@type'] ? [node['@type']] : [])
          for (const t of types) {
            const uri = expandS231(t, s231Prefix)
            if (uri && !isCdlInstanceUri(uri) && !definedTerms.has(uri)) {
              undefinedTerms.push(`${relFile} @type ${t} (${uri})`)
            }
          }
          for (const [pred, val] of Object.entries(node)) {
            const predUri = expandS231(pred, s231Prefix)
            if (predUri && !definedTerms.has(predUri)) {
              undefinedTerms.push(`${relFile} predicate ${pred} (${predUri})`)
            }
            const items = Array.isArray(val) ? val : [val]
            for (const item of items) {
              const objUri = item && typeof item === 'object' && item['@id'] ? expandS231(item['@id'], s231Prefix) : null
              if (objUri && !isCdlInstanceUri(objUri) && !definedTerms.has(objUri)) {
                undefinedTerms.push(`${relFile} object ${item['@id']} (${objUri})`)
              }
            }
          }
        }
      }
      as.deepStrictEqual(undefinedTerms, [], `Undefined S231 term(s) generated:\n  ${undefinedTerms.join('\n  ')}`)
    })
  })
})
