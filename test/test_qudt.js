'use strict'

const as = require('assert')
const fs = require('fs')
const mo = require('mocha')
const path = require('path')
const { formatUnit, parseUnit, unitKey } = require('../lib/modelicaUnit')
const { fromCxf, quantityToQudt, qudtToQuantity, qudtToUnit, unitToQudt } = require('../lib/qudt')
const vocab = require('../lib/qudtVocab')
const { aliases, quantityKinds, units } = require('../lib/qudtUnits.json')

const QUDT_SCHEMA_NS = vocab.QUDT_SCHEMA_NS
const sameUnit = (a, b) => unitKey(parseUnit(a)) === unitKey(parseUnit(b))

// Allowed values of the quantity attribute in the CDL specification, section 7.4.1.1
const CDL_QUANTITIES = [
  'Angle', 'Area', 'Energy', 'Frequency', 'Illuminance', 'Irradiance', 'MassFlowRate',
  'MassFraction', 'Power', 'PowerFactor', 'Pressure', 'PressureDifference', 'SpecificEnergy',
  'TemperatureDifference', 'Time', 'ThermodynamicTemperature', 'Velocity', 'VolumeFlowRate'
]

// Results for the library versions in .travis.yml. These lists change only when
// a library or QUDT is updated, or when a unit gets a mapping.
const MBL_UNITS_WITHOUT_QUDT_UNIT = [
  '(Pa.kg)/m3', '(kg/s)/W', '1/F', '1/s3', 'J/(K.m)', 'J/(K.m2)', 'J/(kg.K.s)', 'J/(kg.K2)',
  'K/J', 'K/rad', 'K/s3', 'K3', 'K4', 'K4/W', 'N.s/(m2.K)', 'Pa.kg/m3', 'W/(kg/s)',
  'W/(m.K2)', 'W/(m2.K2)', 'W/K4', 'W/s', 'kg.K2/J', 'kg/(s.m4)', 'm3/(kg.K)', 'm3/(kg.Pa)',
  'm3/(kg.s)', 's/K'
]
const MBL_QUANTITIES_WITHOUT_QUDT_KIND = ['1/s', 'Reactance per meter']
const MSL_UNITS_WITH_UNKNOWN_SYMBOLS = ['phon', 'sone']

function findLibrary (name) {
  for (const dir of (process.env.MODELICAPATH || '').split(':')) {
    const library = path.join(dir, name)
    if (dir !== '' && fs.existsSync(library)) return library
  }
  return null
}

function moFiles (dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return moFiles(file)
    return entry.name.endsWith('.mo') ? [file] : []
  })
}

/** Returns the distinct non-empty values of an attribute in a library. */
function attributeValues (dir, attribute) {
  const regex = new RegExp(`\\b${attribute}\\s*=\\s*"([^"]+)"`, 'g')
  const values = new Set()
  for (const file of moFiles(dir)) {
    for (const match of fs.readFileSync(file, 'latin1').matchAll(regex)) values.add(match[1])
  }
  return [...values].sort()
}

const withoutQudtUnit = list => list.filter(unit => unitToQudt(unit) === null)

function assertRoundTrips (list) {
  for (const unit of list.filter(u => unitToQudt(u) !== null)) {
    const name = unitToQudt(unit)
    const back = qudtToUnit(name)
    as.ok(sameUnit(unit, back), `${unit} -> ${name} -> ${back}`)
    as.strictEqual(unitToQudt(back), name, `${back} does not map to ${name}`)
  }
}

mo.describe('modelicaUnit.js', function () {
  mo.it('parses the unit expressions of MLS section 19.1', function () {
    const cases = {
      1: '1',
      m: 'm',
      'm.s': 'm.s',
      'm/s': 'm/s',
      'm2/s-1': 'm2.s',
      '1/s': '1/s',
      's-1': '1/s',
      'J/(kg.K)': 'J/(kg.K)',
      '(m.K)/W': 'm.K/W',
      'W/(kg/s)': 'W.s/kg',
      '(kg/s)/W': 'kg/(s.W)',
      'm+2': 'm2',
      'm.m': 'm2',
      'kg/kg': 'kg/kg',
      'm(1/2)': 'm(1/2)',
      'm-(1/2)': '1/m(1/2)',
      'm(1/2).m(1/2)': 'm',
      'm(2/4)': 'm(1/2)'
    }
    for (const [text, formatted] of Object.entries(cases)) {
      as.strictEqual(formatUnit(parseUnit(text)), formatted, text)
    }
  })

  mo.it('prefers a unit symbol to a prefix and a symbol', function () {
    const symbol = text => parseUnit(text)[0].symbol
    as.strictEqual(symbol('min'), 'min')
    as.strictEqual(symbol('h'), 'h')
    as.strictEqual(symbol('T'), 'T')
    as.strictEqual(symbol('cd'), 'cd')
    as.strictEqual(symbol('ms'), 'ms')
    as.strictEqual(symbol('hPa'), 'hPa')
    as.strictEqual(symbol('dam'), 'dam')
    as.strictEqual(symbol('um'), 'um')
    as.strictEqual(symbol('l'), 'L')
    as.strictEqual(symbol('ml'), 'mL')
  })

  mo.it('expands symbols of compound units and applies the prefix to the first factor', function () {
    as.strictEqual(formatUnit(parseUnit('kWh')), 'kW.h')
    as.strictEqual(formatUnit(parseUnit('kVA')), 'kV.A')
    as.strictEqual(formatUnit(parseUnit('rpm')), 'rev/min')
    as.strictEqual(formatUnit(parseUnit('cfm')), 'ft3/min')
    as.strictEqual(formatUnit(parseUnit('rpm2')), 'rev2/min2')
    as.throws(() => parseUnit('krpm'), /Unrecognized/)
  })

  mo.it('rejects what the grammar does not allow', function () {
    for (const text of ['', ' m', 'm s', 'm/s/s', 'm/s.s', 'm^2', '(m/s', 'm)', 'm.', '/s', 'Nm', '1.m', '(m/s)2', 'm(-1/2)', 'm(1/0)']) {
      as.throws(() => parseUnit(text), Error, JSON.stringify(text))
    }
  })

  mo.it('rejects unknown symbols and prefixes on symbols that do not accept one', function () {
    for (const text of ['BtuPerHour', 'toString', 'kmin', 'kdegC', 'mm_']) {
      as.throws(() => parseUnit(text), /Unrecognized Modelica unit symbol/, text)
    }
  })

  mo.it('gives the same key to units whose factors are in a different order', function () {
    as.strictEqual(unitKey(parseUnit('m.K/W')), unitKey(parseUnit('K.m/W')))
    as.notStrictEqual(unitKey(parseUnit('kg/kg')), unitKey(parseUnit('1')))
  })
})

mo.describe('qudt.js', function () {
  mo.describe('units', function () {
    mo.it('converts Modelica units to QUDT units', function () {
      const cases = {
        1: 'UNITLESS',
        K: 'K',
        degC: 'DEG_C',
        kg: 'KiloGM',
        kPa: 'KiloPA',
        l: 'L',
        '1/K': 'PER-K',
        'm-1': 'PER-M',
        'm3/(kg)': 'M3-PER-KiloGM',
        'J/(kg.K)': 'J-PER-KiloGM-K',
        '(m.K)/W': 'M-K-PER-W',
        'K.m/W': 'M-K-PER-W',
        'kg/(s.m2)': 'KiloGM-PER-M2-SEC',
        'kg/(m2.s)': 'KiloGM-PER-M2-SEC',
        'm3/(s.m2)': 'M3-PER-SEC-M2',
        'kg/kg': 'KiloGM-PER-KiloGM',
        'mol/mol': 'MOL-PER-MOL',
        'W.h': 'W-HR',
        Wh: 'W-HR',
        kWh: 'KiloW-HR',
        'kW.h': 'KiloW-HR',
        'kW.h/m2': 'KiloW-HR-PER-M2',
        'V.A': 'VA',
        var: 'VAR',
        rpm: 'REV-PER-MIN',
        'rev/min': 'REV-PER-MIN',
        cfm: 'FT3-PER-MIN',
        'Btu/h': 'BTU_IT-PER-HR',
        ton: 'TON_FG',
        quad: 'QUAD',
        debye: 'DEBYE',
        'J/mol': 'J-PER-MOL',
        'S/m': 'S-PER-M',
        'N.s': 'N-SEC'
      }
      for (const [unit, name] of Object.entries(cases)) {
        as.strictEqual(unitToQudt(unit), name, unit)
      }
    })

    mo.it('returns null for units without a QUDT unit and for invalid or empty units', function () {
      for (const unit of ['s/K', 'K4', 'cW', 'BtuPerHour', 'inH2O', 'm^2', 'toString', '']) {
        as.strictEqual(unitToQudt(unit), null, unit)
      }
    })

    mo.it('converts QUDT units to Modelica units', function () {
      const cases = {
        UNITLESS: '1',
        KiloGM: 'kg',
        DEG_C: 'degC',
        'J-PER-KiloGM-K': 'J/(kg.K)',
        'M-K-PER-W': '(m.K)/W',
        'KiloGM-PER-M2-SEC': 'kg/(s.m2)',
        'PER-SEC2': '1/s2',
        'KiloW-HR': 'kW.h',
        'REV-PER-MIN': 'rev/min',
        'FT3-PER-MIN': 'ft3/min',
        VAR: 'var'
      }
      for (const [name, unit] of Object.entries(cases)) {
        as.strictEqual(qudtToUnit(name), unit, name)
      }
    })

    mo.it('converts other QUDT names of a unit to the same Modelica unit', function () {
      as.strictEqual(qudtToUnit('K-M-PER-W'), '(m.K)/W')
      as.strictEqual(qudtToUnit('KiloGM-PER-SEC-M2'), 'kg/(s.m2)')
    })

    mo.it('does not treat different QUDT units as the same unit', function () {
      as.strictEqual(qudtToUnit('BTU_TH'), null)
      as.strictEqual(qudtToUnit('IN_H2O'), null)
    })

    mo.it('returns null for unknown QUDT units', function () {
      for (const name of ['NOT-A-UNIT', 'toString', '']) as.strictEqual(qudtToUnit(name), null, name)
    })
  })

  mo.describe('quantities', function () {
    mo.it('maps every quantity allowed by the CDL specification to a QUDT quantity kind', function () {
      as.deepStrictEqual(CDL_QUANTITIES.filter(q => quantityToQudt(q) === null), [])
    })

    mo.it('converts quantities with a different QUDT name in both directions', function () {
      for (const [quantity, kind] of Object.entries(vocab.QUANTITY_RENAMES)) {
        as.strictEqual(quantityToQudt(quantity), kind)
        as.strictEqual(qudtToQuantity(kind), quantity)
      }
    })

    mo.it('maps quantities without an exact QUDT kind to a broader one', function () {
      as.strictEqual(quantityToQudt('PressureDifference'), 'Pressure')
      as.strictEqual(qudtToQuantity('Pressure'), 'Pressure')
      as.strictEqual(quantityToQudt('1'), 'DimensionlessRatio')
    })

    mo.it('maps quantities that are completed by a phase system or medium name', function () {
      as.strictEqual(quantityToQudt('Voltage.'), 'ElectricPotential')
      as.strictEqual(quantityToQudt('Voltage.ThreePhase_dq'), 'ElectricPotential')
      as.strictEqual(quantityToQudt('Current.ThreePhase_dq'), 'ElectricCurrent')
      as.strictEqual(quantityToQudt('MassFlowRate.Air'), 'MassFlowRate')
    })

    mo.it('returns null for unknown quantities and kinds', function () {
      for (const name of ['NotAQuantity', 'toString', '']) {
        as.strictEqual(quantityToQudt(name), null, name)
        as.strictEqual(qudtToQuantity(name), null, name)
      }
    })
  })

  mo.describe('fromCxf', function () {
    mo.it('reads QUDT terms and the display unit', function () {
      const node = {
        'qudt:hasUnit': { '@id': 'unit:M3-PER-SEC' },
        'qudt:hasQuantityKind': { '@id': 'q:TemperatureRateOfChange' },
        'S231:displayUnit': 'cfm'
      }
      as.deepStrictEqual(fromCxf(node), { unit: 'm3/s', quantity: 'TemperatureSlope', displayUnit: 'cfm' })
    })

    mo.it('falls back to S231 literals', function () {
      const node = { 'S231:unit': 'W/s', 'S231:quantity': { '@value': 'Custom' }, 'S231:displayUnit': ['kW/s'] }
      as.deepStrictEqual(fromCxf(node), { unit: 'W/s', quantity: 'Custom', displayUnit: 'kW/s' })
    })

    mo.it('uses the prefixes of the context and accepts full IRIs', function () {
      const context = { Q: QUDT_SCHEMA_NS, u: vocab.QUDT_UNIT_NS, k: vocab.QUDT_QK_NS }
      const node = { 'Q:hasUnit': { '@id': 'u:K' }, 'Q:hasQuantityKind': [{ '@id': 'k:Time' }] }
      as.deepStrictEqual(fromCxf(node, { context }), { unit: 'K', quantity: 'Time', displayUnit: null })
      const expanded = { [`${QUDT_SCHEMA_NS}hasUnit`]: { '@id': `${vocab.QUDT_UNIT_NS}K` } }
      as.strictEqual(fromCxf(expanded).unit, 'K')
    })

    mo.it('returns nulls for a node without these attributes', function () {
      as.deepStrictEqual(fromCxf({}), { unit: null, quantity: null, displayUnit: null })
    })
  })

  mo.describe('vocabulary', function () {
    mo.it('has a QUDT unit for every unit symbol', function () {
      const symbols = { ...vocab.PREFIXABLE_UNITS, ...vocab.UNPREFIXED_UNITS }
      for (const [symbol, name] of Object.entries(symbols)) {
        as.strictEqual(unitToQudt(symbol), name, symbol)
      }
    })

    mo.it('converts every generated QUDT unit to Modelica and back', function () {
      for (const [name, unit] of Object.entries(units)) {
        as.strictEqual(unitToQudt(unit), name, unit)
        as.strictEqual(qudtToUnit(name), unit, name)
      }
    })

    mo.it('has aliases only for units that are in the vocabulary', function () {
      for (const [alias, name] of Object.entries(aliases)) {
        as.ok(units[name] !== undefined, `${alias} -> ${name}`)
        as.ok(units[alias] === undefined, alias)
      }
    })

    mo.it('uses the configured preferred QUDT names and Modelica spellings', function () {
      for (const name of vocab.PREFERRED_QUDT_UNITS) as.ok(units[name] !== undefined, name)
      for (const unit of vocab.MODELICA_SPELLINGS) as.strictEqual(qudtToUnit(unitToQudt(unit)), unit)
    })

    mo.it('maps quantities only to QUDT quantity kinds that exist', function () {
      const targets = [
        ...Object.values(vocab.QUANTITY_RENAMES),
        ...Object.values(vocab.BROADER_QUANTITIES),
        ...Object.values(vocab.QUANTITY_PREFIXES)
      ]
      as.deepStrictEqual(targets.filter(kind => !quantityKinds.includes(kind)), [])
    })
  })

  mo.describe('Modelica libraries', function () {
    let buildings
    let msl

    mo.before(function () {
      buildings = findLibrary('Buildings')
      msl = findLibrary('Modelica')
    })

    function requireLibrary (context, library) {
      if (library === null) context.skip()
    }

    mo.it('maps all CDL units and quantities, except for s/K that QUDT does not have', function () {
      requireLibrary(this, buildings)
      const cdl = path.join(buildings, 'Controls', 'OBC')
      as.deepStrictEqual(withoutQudtUnit(attributeValues(cdl, 'unit')), ['s/K'])
      as.deepStrictEqual(withoutQudtUnit(attributeValues(cdl, 'displayUnit')), [])
      as.deepStrictEqual(attributeValues(cdl, 'quantity').filter(q => quantityToQudt(q) === null), [])
    })

    mo.it('handles all units and quantities of the Buildings library', function () {
      requireLibrary(this, buildings)
      const unitValues = attributeValues(buildings, 'unit')
      const displayUnits = attributeValues(buildings, 'displayUnit')
      for (const unit of [...unitValues, ...displayUnits]) parseUnit(unit)
      as.deepStrictEqual(withoutQudtUnit(unitValues), MBL_UNITS_WITHOUT_QUDT_UNIT)
      as.deepStrictEqual(withoutQudtUnit(displayUnits), [])
      assertRoundTrips([...unitValues, ...displayUnits])
      as.deepStrictEqual(
        attributeValues(buildings, 'quantity').filter(q => quantityToQudt(q) === null),
        MBL_QUANTITIES_WITHOUT_QUDT_KIND
      )
    })

    mo.it('handles all units of the Modelica Standard Library', function () {
      requireLibrary(this, msl)
      const unitValues = [...attributeValues(msl, 'unit'), ...attributeValues(msl, 'displayUnit')]
      const invalid = unitValues.filter(unit => {
        try {
          parseUnit(unit)
          return false
        } catch (_) {
          return true
        }
      })
      as.deepStrictEqual(invalid, MSL_UNITS_WITH_UNKNOWN_SYMBOLS)
      assertRoundTrips(unitValues)
    })
  })
})
