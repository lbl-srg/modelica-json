'use strict'

const as = require('assert')
const mo = require('mocha')
const fs = require('fs')
const path = require('path')
const rdflib = require('rdflib')
const qudt = require('../lib/qudt')
const qudtVocab = require('../lib/qudtVocab')

const {
  QUDT_DV_NS,
  QUDT_QK_NS,
  QUDT_SCHEMA_NS,
  QUDT_UNIT_NS,
  S231_NS,
  convertFromQudt,
  convertToQudt,
  fromCxf,
  quantityToQudt,
  qudtToQuantity,
  qudtToUnit,
  suggestQuantity,
  suggestUnit,
  toCxf,
  unitToQudt
} = qudt

const pinned = JSON.parse(fs.readFileSync(path.join(__dirname, 'qudt', 'qudt-vocab.json'), 'utf8'))

mo.describe('qudt.js — bidirectional Modelica/CDL <-> QUDT & CXF converter', function () {
  mo.describe('bidirectional units and ratio preservation', function () {
    mo.it('preserves same-unit and dimensional ratios by default and cancels when requested', function () {
      const uKg = unitToQudt('kg/kg')
      as.strictEqual(uKg.uri, `${QUDT_UNIT_NS}KiloGM-PER-KiloGM`)
      as.strictEqual(uKg.curie, 'unit:KiloGM-PER-KiloGM')
      as.strictEqual(uKg.preservedRatio, true)
      as.strictEqual(uKg.dimensionVector, `${QUDT_DV_NS}A0E0L0I0M0H0T0D1`)
      as.strictEqual(qudtToUnit(uKg.uri), 'kg/kg')
      as.strictEqual(qudtToUnit('unit:KiloGM-PER-KiloGM'), 'kg/kg')
      as.strictEqual(unitToQudt('kg/kg', { cancelRatios: true }).uri, `${QUDT_UNIT_NS}UNITLESS`)
      as.strictEqual(qudtToUnit('unit:KiloGM-PER-KiloGM', { cancelRatios: true }), '1')

      const uFlux = unitToQudt('m3/(s.m2)')
      as.strictEqual(uFlux.uri, `${QUDT_UNIT_NS}M3-PER-SEC-M2`)
      as.strictEqual(uFlux.preservedRatio, true)
      as.strictEqual(qudtToUnit(uFlux.uri), 'm3/(s.m2)')
      as.strictEqual(qudtToUnit('unit:M3-PER-M2-SEC'), 'm3/(s.m2)')
      as.strictEqual(unitToQudt('m3/(s.m2)', { cancelRatios: true }).uri, `${QUDT_UNIT_NS}M-PER-SEC`)
      as.strictEqual(qudtToUnit(uFlux.uri, { cancelRatios: true }), 'm/s')

      const uAch = unitToQudt('m3/(m3.h)')
      as.strictEqual(uAch.uri, null)
      as.strictEqual(uAch.preservedRatio, true)
      as.strictEqual(qudtToUnit(uAch), 'm3/(m3.h)')
      as.strictEqual(qudtToUnit(uAch.factors), 'm3/(m3.h)')
      as.strictEqual(qudtToUnit('unit:M3-PER-M3-HR'), 'm3/(m3.h)')
      as.strictEqual(unitToQudt('m3/(m3.h)', { cancelRatios: true }).uri, `${QUDT_UNIT_NS}PER-HR`)

      as.strictEqual(unitToQudt('J/s').uri, `${QUDT_UNIT_NS}J-PER-SEC`)
      as.strictEqual(qudtToUnit('unit:J-PER-SEC'), 'J/s')
      as.strictEqual(unitToQudt('lm/m2').uri, `${QUDT_UNIT_NS}LM-PER-M2`)
      as.strictEqual(qudtToUnit('unit:CD-SR'), 'cd.sr')
    })

    mo.it('converts systematic QUDT compound names and factor arrays to Modelica syntax', function () {
      as.strictEqual(qudtToUnit('http://qudt.org/vocab/unit/W-PER-M2-K'), 'W/(m2.K)')
      as.strictEqual(qudtToUnit('unit:DEG_C'), 'degC')
      as.strictEqual(qudtToUnit('UNITLESS'), '1')
      as.strictEqual(qudtToUnit('unit:MilliPA-SEC'), 'mPa.s')
      as.strictEqual(qudtToUnit('unit:KiloW-PER-M2'), 'kW/m2')
      as.strictEqual(qudtToUnit('unit:MegaW-HR-PER-M2'), 'MWh/m2')
      as.strictEqual(qudtToUnit('unit:PER-SEC3'), '1/s3')
      as.strictEqual(qudtToUnit('unit:EV-A'), 'eV.A')
      as.strictEqual(qudtToUnit('unit:KiloV-A'), 'kVA')
      as.strictEqual(qudtToUnit('unit:V-A_Reactive'), 'var')
      as.strictEqual(
        qudtToUnit([['unit:KiloGM', 1], ['unit:SEC', -1], ['unit:M', -4]]),
        'kg/(s.m4)'
      )
    })

    mo.it('respects case sensitivity, SI prefixes, and Modelica syntax equivalences', function () {
      as.strictEqual(unitToQudt('S').uri, `${QUDT_UNIT_NS}S`)
      as.strictEqual(unitToQudt('s').uri, `${QUDT_UNIT_NS}SEC`)
      as.strictEqual(unitToQudt('MW').uri, `${QUDT_UNIT_NS}MegaW`)
      as.strictEqual(unitToQudt('mW').uri, `${QUDT_UNIT_NS}MilliW`)
      as.strictEqual(unitToQudt('uW').uri, `${QUDT_UNIT_NS}MicroW`)
      as.strictEqual(unitToQudt('\u03bcW').uri, `${QUDT_UNIT_NS}MicroW`)
      as.strictEqual(unitToQudt('\u03bcW').ucum, 'uW')
      as.strictEqual(unitToQudt('1/m').uri, unitToQudt('m-1').uri)
      as.strictEqual(unitToQudt('1/s').uri, unitToQudt('s-1').uri)
      as.deepStrictEqual(unitToQudt('(Pa.kg)/m3').factors, unitToQudt('Pa.kg/m3').factors)

      // Valid Modelica prefixed unit that has no minted QUDT IRI in v3.1.11
      const cW = unitToQudt('cW')
      as.strictEqual(cW.uri, null)
      as.strictEqual(cW.ucum, 'cW')
      as.strictEqual(cW.dimensionVector, unitToQudt('W').dimensionVector)
      as.strictEqual(qudtToUnit(cW), 'cW')
    })

    mo.it('handles non-SI HVAC/CDL symbols and prevents femtotonne collision on ft', function () {
      as.strictEqual(unitToQudt('l').uri, `${QUDT_UNIT_NS}L`)
      as.strictEqual(unitToQudt('l/s').uri, `${QUDT_UNIT_NS}L-PER-SEC`)
      as.strictEqual(unitToQudt('ml').uri, `${QUDT_UNIT_NS}MilliL`)
      as.strictEqual(qudtToUnit('unit:L'), 'L')
      as.strictEqual(unitToQudt('kJ/kg').uri, `${QUDT_UNIT_NS}KiloJ-PER-KiloGM`)
      as.strictEqual(unitToQudt('BtuPerHour').uri, `${QUDT_UNIT_NS}BTU_IT-PER-HR`)

      as.strictEqual(unitToQudt('t').uri, `${QUDT_UNIT_NS}TON_Metric`)
      as.strictEqual(qudtToUnit('unit:TON_Metric'), 't')
      as.strictEqual(qudtToUnit(unitToQudt('t/h')), 't/h')
      as.throws(() => unitToQudt('ft'), /Unrecognized Modelica unit symbol/)

      as.strictEqual(unitToQudt('rpm').uri, `${QUDT_UNIT_NS}REV-PER-MIN`)
      as.strictEqual(unitToQudt('rev/min').uri, `${QUDT_UNIT_NS}REV-PER-MIN`)
      as.strictEqual(unitToQudt('rev').uri, `${QUDT_UNIT_NS}REV`)
      as.strictEqual(unitToQudt('dB').uri, `${QUDT_UNIT_NS}DeciB`)
      as.strictEqual(qudtToUnit('unit:DeciB'), 'dB')
      as.strictEqual(unitToQudt('eV').uri, `${QUDT_UNIT_NS}EV`)
      as.strictEqual(unitToQudt('MeV').uri, `${QUDT_UNIT_NS}MegaEV`)
      as.strictEqual(qudtToUnit('unit:MegaEV'), 'MeV')
      as.strictEqual(unitToQudt('Np').uri, `${QUDT_UNIT_NS}NP`)
      as.strictEqual(unitToQudt('degRk').uri, `${QUDT_UNIT_NS}DEG_R`)
      as.strictEqual(qudtToUnit('unit:DEG_R'), 'degRk')
      as.strictEqual(unitToQudt('inH2O').uri, `${QUDT_UNIT_NS}IN_H2O_60DEG_F`)
      as.strictEqual(unitToQudt('cfm').uri, `${QUDT_UNIT_NS}FT3-PER-MIN`)
    })

    mo.it('parses and formats Modelica §19.1 rational exponents', function () {
      const noise = unitToQudt('V/Hz(1/2)')
      as.strictEqual(noise.uri, null)
      as.strictEqual(noise.dimensionVector, null)
      as.strictEqual(noise.ucum, null)
      as.deepStrictEqual(noise.factors, [
        [`${QUDT_UNIT_NS}V`, 1],
        [`${QUDT_UNIT_NS}HZ`, '-1/2']
      ])
      as.strictEqual(qudtToUnit(noise), 'V/Hz(1/2)')

      const mNeg = unitToQudt('m-(1/3)')
      as.deepStrictEqual(mNeg.factors, [[`${QUDT_UNIT_NS}M`, '-1/3']])
      as.deepStrictEqual(mNeg.factors, unitToQudt('m(-1/3)').factors)
      as.strictEqual(qudtToUnit(mNeg), '1/m(1/3)')

      const mWhole = unitToQudt('m(1/2).m(1/2)')
      as.strictEqual(mWhole.uri, `${QUDT_UNIT_NS}M`)
      as.strictEqual(mWhole.dimensionVector, `${QUDT_DV_NS}A0E0L1I0M0H0T0D0`)

      const ratioHalf = unitToQudt('m(1/2)/m(1/2)')
      as.strictEqual(ratioHalf.preservedRatio, true)
      as.strictEqual(qudtToUnit(ratioHalf), 'm(1/2)/m(1/2)')
      as.strictEqual(qudtToUnit(ratioHalf, { cancelRatios: true }), '1')
    })

    mo.it('handles empty inputs and rejects invalid syntax or Object.prototype keys', function () {
      as.strictEqual(unitToQudt('').uri, null)
      as.deepStrictEqual(unitToQudt('').factors, [])
      as.strictEqual(qudtToUnit(''), null)
      as.strictEqual(qudtToUnit(null), null)
      as.strictEqual(qudtToUnit([]), null)

      as.throws(() => unitToQudt('m^2'), /Invalid Modelica unit syntax/)
      as.throws(() => unitToQudt('(m/s'), /Unclosed/)
      as.throws(() => unitToQudt('m(1/0)'), /Zero denominator/)
      as.throws(() => unitToQudt('toString'), /Unrecognized Modelica unit symbol/)
      as.strictEqual(quantityToQudt('toString'), null)
      as.strictEqual(qudtToQuantity('toString'), null)
    })
  })

  mo.describe('bidirectional quantities, MSL types, and displayUnit preservation', function () {
    mo.it('converts Modelica/CDL quantities to QUDT QuantityKinds and back', function () {
      as.strictEqual(quantityToQudt('ThermodynamicTemperature'), `${QUDT_QK_NS}ThermodynamicTemperature`)
      as.strictEqual(qudtToQuantity(`${QUDT_QK_NS}ThermodynamicTemperature`), 'ThermodynamicTemperature')
      as.strictEqual(quantityToQudt('PressureDifference'), `${QUDT_QK_NS}Pressure`)
      as.strictEqual(qudtToQuantity('q:Pressure'), 'Pressure')
      as.strictEqual(quantityToQudt('Modelica.Units.SI.SpecificEnthalpy'), `${QUDT_QK_NS}SpecificEnthalpy`)
      as.strictEqual(quantityToQudt('ReflectionCoefficient'), `${QUDT_QK_NS}Reflectance`)
      as.strictEqual(qudtToQuantity('quantitykind:Reflectance'), 'ReflectionCoefficient')
      as.strictEqual(quantityToQudt('TemperatureSlope'), `${QUDT_QK_NS}TemperatureRateOfChange`)
      as.strictEqual(qudtToQuantity('q:TemperatureRateOfChange'), 'TemperatureSlope')
      as.strictEqual(qudtToQuantity('q:TemperaturePerTime'), 'TemperatureSlope')
      as.strictEqual(quantityToQudt('LinearTemperatureCoefficient'), `${QUDT_QK_NS}LinearThermalExpansion`)
      as.strictEqual(qudtToQuantity('q:LinearThermalExpansion'), 'LinearTemperatureCoefficient')
      as.strictEqual(quantityToQudt('Resistance per meter'), `${QUDT_QK_NS}LineicResistance`)
      as.strictEqual(qudtToQuantity('q:LineicResistance'), 'Resistance per meter')
      as.strictEqual(quantityToQudt('Current.AC'), `${QUDT_QK_NS}ElectricCurrent`)
      as.strictEqual(quantityToQudt('Voltage.RMS'), `${QUDT_QK_NS}ElectricPotential`)
    })

    mo.it('preserves displayUnit verbatim and resolves MSL SI/NonSI type defaults', function () {
      const fwd = convertToQudt({
        unit: 'K',
        quantity: 'ThermodynamicTemperature',
        displayUnit: 'degC'
      })
      as.strictEqual(fwd.qudtUnit.uri, `${QUDT_UNIT_NS}K`)
      as.strictEqual(fwd.qudtQuantityKind, `${QUDT_QK_NS}ThermodynamicTemperature`)
      as.strictEqual(fwd.displayUnit, 'degC')

      const rev = convertFromQudt({
        qudtUnit: fwd.qudtUnit,
        qudtQuantityKind: fwd.qudtQuantityKind,
        displayUnit: fwd.displayUnit
      })
      as.deepStrictEqual(rev, {
        unit: 'K',
        quantity: 'ThermodynamicTemperature',
        displayUnit: 'degC'
      })

      const mslSi = convertToQudt({ typeName: 'Modelica.Units.SI.Pressure' })
      as.strictEqual(mslSi.qudtUnit.uri, `${QUDT_UNIT_NS}PA`)
      as.strictEqual(mslSi.qudtQuantityKind, `${QUDT_QK_NS}Pressure`)
      as.strictEqual(mslSi.displayUnit, 'bar')

      const mslNonSi = convertToQudt({ typeName: 'Modelica.Units.NonSI.Temperature_degC' })
      as.strictEqual(mslNonSi.qudtUnit.uri, `${QUDT_UNIT_NS}DEG_C`)
      as.strictEqual(mslNonSi.qudtQuantityKind, `${QUDT_QK_NS}ThermodynamicTemperature`)
    })
  })

  mo.describe('CXF JSON-LD and rdflib bidirectional conversion (toCxf / fromCxf)', function () {
    mo.it('converts mapped attributes to CXF JSON-LD and back', function () {
      const cxfNode = toCxf({
        unit: 'm3/s',
        displayUnit: 'cfm',
        quantity: 'VolumeFlowRate'
      })
      as.deepStrictEqual(cxfNode, {
        'qudt:hasUnit': { '@id': 'unit:M3-PER-SEC' },
        'S231:displayUnit': 'cfm',
        'qudt:hasQuantityKind': { '@id': 'q:VolumeFlowRate' }
      })
      as.deepStrictEqual(fromCxf(cxfNode), {
        unit: 'm3/s',
        displayUnit: 'cfm',
        quantity: 'VolumeFlowRate'
      })
    })

    mo.it('falls back to S231 literals with suggestion warnings and round-trips back', function () {
      const warnings = []
      const cxfNode = toCxf({
        unit: 'W/s',
        displayUnit: 'customDisp',
        quantity: 'PresureDifference',
        warn: msg => warnings.push(msg)
      })
      as.deepStrictEqual(cxfNode, {
        'S231:unit': 'W/s',
        'S231:displayUnit': 'customDisp',
        'S231:quantity': 'PresureDifference'
      })
      as.strictEqual(warnings.length, 2)
      as.ok(warnings[1].includes('Pressure (q:Pressure)'))
      as.deepStrictEqual(fromCxf(cxfNode), {
        unit: 'W/s',
        displayUnit: 'customDisp',
        quantity: 'PresureDifference'
      })
    })

    mo.it('reconstructs Modelica units from QUDT factor units, custom @context, and rdflib graphs', function () {
      const factorNode = {
        '@context': {
          myqudt: QUDT_SCHEMA_NS,
          u: QUDT_UNIT_NS,
          qk: QUDT_QK_NS,
          s: S231_NS
        },
        'myqudt:hasFactorUnit': [
          { 'myqudt:hasUnit': { '@id': 'u:KiloGM' }, 'myqudt:exponent': 1 },
          { 'myqudt:hasUnit': { '@id': 'u:SEC' }, 'myqudt:exponent': -1 },
          { 'myqudt:hasUnit': { '@id': 'u:M' }, 'myqudt:exponent': -4 }
        ],
        'myqudt:hasQuantityKind': { '@id': 'qk:LinearThermalExpansion' },
        's:hasDisplayUnit': { '@id': 'u:DEG_C' }
      }
      as.deepStrictEqual(fromCxf(factorNode), {
        unit: 'kg/(s.m4)',
        quantity: 'LinearTemperatureCoefficient',
        displayUnit: 'degC'
      })

      // rdflib graph round-trip
      const graph = rdflib.graph()
      const s231Ns = rdflib.Namespace(S231_NS)
      const qudtNs = rdflib.Namespace(QUDT_SCHEMA_NS)
      const unitNs = rdflib.Namespace(QUDT_UNIT_NS)
      const qkNs = rdflib.Namespace(QUDT_QK_NS)
      const subj = s231Ns('Param1')
      graph.add(subj, qudtNs('hasUnit'), unitNs('J-PER-KiloGM-K'))
      graph.add(subj, qudtNs('hasQuantityKind'), qkNs('SpecificHeatCapacity'))
      graph.add(subj, s231Ns('displayUnit'), 'J/(kg.degC)')

      as.deepStrictEqual(fromCxf(subj, { graph }), {
        unit: 'J/(kg.K)',
        quantity: 'SpecificHeatCapacity',
        displayUnit: 'J/(kg.degC)'
      })
    })
  })

  mo.describe('nearest-match suggestions (suggestUnit / suggestQuantity)', function () {
    mo.it('suggests quantities using lexical similarity, aliases, and unit dimensions', function () {
      const torq = suggestQuantity('Torq', { unit: 'N.m', topK: 3 })
      as.strictEqual(torq[0].qudtUri, `${QUDT_QK_NS}Torque`)
      as.strictEqual(torq[0].qudtCurie, 'q:Torque')
      as.strictEqual(torq[0].dimensionMatch, true)

      const presNoUnit = suggestQuantity('PresureDifference', { topK: 3 })
      as.strictEqual(presNoUnit[0].qudtUri, `${QUDT_QK_NS}Pressure`)

      const presWithUnit = suggestQuantity('PresureDifference', { unit: 'Pa', topK: 3 })
      as.strictEqual(presWithUnit[0].qudtUri, `${QUDT_QK_NS}Pressure`)
      as.strictEqual(presWithUnit[0].dimensionMatch, true)

      const react = suggestQuantity('Reactance per meter', { unit: 'Ohm/m', topK: 5 })
      const uris = react.map(s => s.qudtUri)
      as.ok(uris.includes(`${QUDT_QK_NS}LineicResistance`))
      as.ok(uris.includes(`${QUDT_QK_NS}Reactance`))

      const slope = suggestQuantity('TempSlope', { unit: 'K/s', topK: 3 })
      as.strictEqual(slope[0].qudtUri, `${QUDT_QK_NS}TemperatureRateOfChange`)
      as.strictEqual(slope[0].dimensionMatch, true)

      // Every suggested QUDT QuantityKind must exist and be non-deprecated in pinned QUDT
      for (const s of [...torq, ...presWithUnit, ...react, ...slope]) {
        const entry = pinned.quantityKinds[s.qudtUri]
        as.ok(entry && !entry.deprecated, `invalid QK suggestion: ${s.qudtUri}`)
      }
    })

    mo.it('repairs mistyped units and suggests dimensionally equivalent QUDT units', function () {
      const powerEquiv = suggestUnit('N.m/s', { topK: 3 })
      as.strictEqual(powerEquiv[0].modelicaUnit, 'W')
      as.strictEqual(powerEquiv[0].qudtUri, `${QUDT_UNIT_NS}W`)
      as.strictEqual(powerEquiv[0].dimensionMatch, true)

      as.strictEqual(suggestUnit('kpa')[0].modelicaUnit, 'kPa')
      as.strictEqual(suggestUnit('W/(m2K)')[0].modelicaUnit, 'W/(m2.K)')
      as.strictEqual(suggestUnit('m^2')[0].modelicaUnit, 'm2')
      as.strictEqual(suggestUnit('ohm')[0].modelicaUnit, 'Ohm')
      as.strictEqual(suggestUnit('degR')[0].modelicaUnit, 'degRk')
      as.strictEqual(suggestUnit('\u00b0C')[0].modelicaUnit, 'degC')
      as.strictEqual(suggestUnit('\u03a9*m')[0].modelicaUnit, 'Ohm.m')
    })
  })

  mo.describe('vocabulary & MBL unit round-trip invariants', function () {
    mo.it('round-trips all MSL_TYPES and compound units with identical factor multisets', function () {
      const units = new Set([
        ...Object.keys(qudtVocab.ATOMIC_UNITS),
        ...qudtVocab.MINTED_COMPOUND_UNITS.map(([, , moStr]) => moStr),
        ...Object.values(qudtVocab.MSL_TYPES).map(([u]) => u),
        'kg.m2/s', 'S/m', 'V/m', 'C/m2', 'N.s', 'cd/m2', 'A/m', 'J/mol',
        'J/(mol.K)', 'm3/mol', 'kg.m/s', 'H/m', 'F/m', '1/H', 'Ohm.m', 'N/m',
        'W/K4', 'K3', 'K4', 'm/m', 'cd.sr', 'J/(m2.K)', 'W/(m2.K2)'
      ])

      for (const sym of units) {
        const q1 = unitToQudt(sym)
        as.ok(q1.factors.length > 0, `empty factors for ${sym}`)
        const back = qudtToUnit(q1)
        as.ok(back !== null, `reverse failed for ${sym}`)
        const q2 = unitToQudt(back)
        as.strictEqual(q2.dimensionVector, q1.dimensionVector, `dimension mismatch on round-trip: ${sym} -> ${back}`)
        if (q1.uri !== null) {
          as.strictEqual(q2.uri, q1.uri, `URI mismatch on round-trip: ${sym} -> ${back}`)
        } else {
          as.deepStrictEqual(
            q1.factors.slice().sort(),
            q2.factors.slice().sort(),
            `factor mismatch on round-trip: ${sym} -> ${back}`
          )
        }
      }
    })
  })
})
