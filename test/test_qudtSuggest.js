'use strict'

const as = require('assert')
const mo = require('mocha')
const { quantityKinds, units } = require('../lib/qudtUnits.json')
const {
  formatQuantityWarning,
  formatUnitWarning,
  suggestQuantity,
  suggestUnit,
  unitDimension
} = require('../lib/qudtSuggest')

mo.describe('qudtSuggest.js', function () {
  mo.describe('unitDimension', function () {
    mo.it('returns the QUDT dimension vector of a unit', function () {
      as.strictEqual(unitDimension('m/s'), 'A0E0L1I0M0H0T-1D0')
      as.strictEqual(unitDimension('N.m/s'), unitDimension('W'))
      as.strictEqual(unitDimension('kg/kg'), 'A0E0L0I0M0H0T0D1')
      as.strictEqual(unitDimension('1'), 'A0E0L0I0M0H0T0D1')
    })

    mo.it('returns null for invalid units and non-integer dimensions', function () {
      as.strictEqual(unitDimension('not a unit'), null)
      as.strictEqual(unitDimension('m(1/2)'), null)
    })
  })

  mo.describe('suggestQuantity', function () {
    mo.it('finds quantity kinds from similar names and matching dimensions', function () {
      const torque = suggestQuantity('Torq', { unit: 'N.m', topK: 3 })
      as.strictEqual(torque[0].kind, 'Torque')
      as.strictEqual(torque[0].dimensionMatch, true)
      as.strictEqual(suggestQuantity('PresureDifference')[0].kind, 'Pressure')
      as.strictEqual(suggestQuantity('TempSlope', { unit: 'K/s' })[0].kind, 'TemperatureRateOfChange')
    })

    mo.it('reports an exact match first with the Modelica name', function () {
      const [best] = suggestQuantity('TemperatureSlope')
      as.deepStrictEqual(
        [best.kind, best.modelicaName, best.score, best.reason],
        ['TemperatureRateOfChange', 'TemperatureSlope', 1, 'exact_match']
      )
    })

    mo.it('suggests only existing quantity kinds and respects the limit', function () {
      const suggestions = suggestQuantity('Reactance per meter', { unit: 'Ohm/m', topK: 2 })
      as.strictEqual(suggestions.length, 2)
      for (const { kind } of suggestions) as.ok(kind in quantityKinds, kind)
      as.deepStrictEqual(suggestQuantity(''), [])
    })
  })

  mo.describe('suggestUnit', function () {
    mo.it('repairs common mistakes', function () {
      const cases = {
        kpa: 'kPa',
        'W/(m2K)': 'W/(m2.K)',
        'm^2': 'm2',
        ohm: 'Ohm',
        degR: 'degRk',
        '°C': 'degC',
        'Ω*m': 'Ohm.m',
        μm: 'um'
      }
      for (const [text, unit] of Object.entries(cases)) {
        as.strictEqual(suggestUnit(text)[0].modelicaUnit, unit, text)
      }
    })

    mo.it('suggests units of the same dimension for a valid unit without a QUDT unit', function () {
      const [best] = suggestUnit('N.m/s')
      as.strictEqual(best.modelicaUnit, 'W')
      as.strictEqual(best.dimensionMatch, true)
      as.deepStrictEqual(suggestUnit('W/s'), [])
    })

    mo.it('reports a unit with a QUDT unit as an exact match', function () {
      const [best] = suggestUnit('m/s')
      as.deepStrictEqual([best.modelicaUnit, best.qudtUnit, best.score], ['m/s', 'M-PER-SEC', 1])
    })

    mo.it('suggests only units in the vocabulary and respects the limit', function () {
      const suggestions = suggestUnit('kgs', { topK: 2 })
      as.ok(suggestions.length <= 2)
      for (const { qudtUnit } of suggestions) as.ok(qudtUnit in units, qudtUnit)
      as.deepStrictEqual(suggestUnit(''), [])
    })
  })

  mo.describe('warnings', function () {
    mo.it('names the literal fallback and the suggestions', function () {
      const unit = formatUnitWarning('kpa')
      as.ok(unit.startsWith('Unit kpa could not be mapped to QUDT. Using S231:unit with literal value kpa.'))
      as.ok(unit.includes('kPa (unit:KiloPA)'))
      const quantity = formatQuantityWarning('PresureDifference', 'Pa')
      as.ok(quantity.startsWith('Quantity kind PresureDifference could not be mapped to QUDT.'))
      as.ok(quantity.includes('Pressure (q:Pressure)'))
    })
  })
})
