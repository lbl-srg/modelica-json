'use strict'

const as = require('assert')
const mo = require('mocha')
const { formatUnit } = require('../lib/modelicaUnit')
const { PREFIXABLE_UNITS, UNPREFIXED_UNITS } = require('../lib/qudtVocab')
const { buildVocabulary, factorsFromUcum } = require('../scripts/generateQudtUnits')
const generated = require('../lib/qudtUnits.json')

const PREFIXES = `
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix qkdv: <http://qudt.org/vocab/dimensionvector/> .
@prefix qudt: <http://qudt.org/schema/qudt/> .
@prefix quantitykind: <http://qudt.org/vocab/quantitykind/> .
@prefix unit: <http://qudt.org/vocab/unit/> .
`

const unitTtl = (name, dimension, ucum, extra = '') =>
  `unit:${name} qudt:hasDimensionVector qkdv:${dimension} ${ucum ? `; qudt:ucumCode "${ucum}"` : ''} ${extra} .\n`

// The unit symbols must exist in QUDT, so give all of them a neutral dimension.
const SYMBOL_UNITS = [...new Set([...Object.values(PREFIXABLE_UNITS), ...Object.values(UNPREFIXED_UNITS)])]
  .filter(name => !['M', 'SEC', 'KiloGM', 'GM', 'K', 'W'].includes(name))
  .map(name => unitTtl(name, 'A0E0L0I0M0H0T0D1'))
  .join('')

const BASE_UNITS = [
  unitTtl('M', 'A0E0L1I0M0H0T0D0', 'm'),
  unitTtl('SEC', 'A0E0L0I0M0H0T1D0', 's'),
  unitTtl('GM', 'A0E0L0I0M1H0T0D0', 'g'),
  unitTtl('K', 'A0E0L0I0M0H1T0D0', 'K'),
  unitTtl('W', 'A0E0L2I0M1H0T-3D0', 'W')
].join('')

function build (units, quantityKinds = '') {
  return buildVocabulary(
    PREFIXES + SYMBOL_UNITS + BASE_UNITS + units,
    PREFIXES + quantityKinds,
    'test'
  )
}

const ucumFormat = code => {
  const factors = factorsFromUcum(code)
  return factors === null ? null : formatUnit(factors)
}

mo.describe('generateQudtUnits.js', function () {
  mo.it('reads UCUM codes, applying operators from left to right', function () {
    as.strictEqual(ucumFormat('kg.m-2.s-1'), 'kg/(m2.s)')
    as.strictEqual(ucumFormat('J/kg.K'), 'J.K/kg')
    as.strictEqual(ucumFormat('J/(kg.K)'), 'J/(kg.K)')
    as.strictEqual(ucumFormat('/s'), '1/s')
    as.strictEqual(ucumFormat('1/s'), '1/s')
    as.strictEqual(ucumFormat('Cel'), 'degC')
    as.strictEqual(ucumFormat('[ft_i]3.min-1'), 'ft3/min')
    as.strictEqual(ucumFormat('kW.h'), 'kW.h')
  })

  mo.it('does not read UCUM codes that have no Modelica equivalent', function () {
    for (const code of ['{#}.min-1', 'VA{reactive}', '10*3.m', '[lb_av]', 'k[Btu_IT]', '(m']) {
      as.strictEqual(factorsFromUcum(code), null, code)
    }
  })

  mo.it('uses the UCUM code, and the QUDT name if there is no usable code', function () {
    const { units } = build(
      unitTtl('M-PER-SEC', 'A0E0L1I0M0H0T-1D0', 'm.s-1') +
      unitTtl('KiloGM-PER-SEC', 'A0E0L0I0M1H0T-1D0') +
      unitTtl('M2-PER-SEC', 'A0E0L2I0M0H0T-1D0', '{note}.m2.s-1')
    ).vocabulary
    as.strictEqual(units['M-PER-SEC'], 'm/s')
    as.strictEqual(units['KiloGM-PER-SEC'], 'kg/s')
    as.strictEqual(units['M2-PER-SEC'], 'm2/s')
  })

  mo.it('leaves out deprecated units and units with other dimensions or unknown symbols', function () {
    const { vocabulary: { units }, report } = build(
      unitTtl('M-PER-K', 'A0E0L1I0M0H-1T0D0', 'm.K-1', '; qudt:deprecated true') +
      unitTtl('M-PER-W', 'A0E0L1I0M0H0T0D0', 'm.W-1') +
      unitTtl('LB-PER-SEC', 'A0E0L0I0M1H0T-1D0', '[lb_av].s-1')
    )
    as.deepStrictEqual(['M-PER-K', 'M-PER-W', 'LB-PER-SEC'].filter(name => name in units), [])
    as.ok(report.skipped.includes('M-PER-W'))
    as.ok(report.skipped.includes('LB-PER-SEC'))
    as.ok(!report.skipped.includes('M-PER-K'))
  })

  mo.it('keeps one main name per unit, and the others as aliases', function () {
    const { units, aliases } = build(
      unitTtl('K-M-PER-W', 'A0E0L-1I0M-1H1T3D0', 'K.m.W-1') +
      unitTtl('M-K-PER-W', 'A0E0L-1I0M-1H1T3D0', 'm.K.W-1') +
      unitTtl('PER-SEC', 'A0E0L0I0M0H0T-1D0', 's-1') +
      unitTtl('SAMPLE-PER-SEC', 'A0E0L0I0M0H0T-1D0', 's-1')
    ).vocabulary
    as.strictEqual(units['M-K-PER-W'], '(m.K)/W')
    as.strictEqual(aliases['K-M-PER-W'], 'M-K-PER-W')
    as.strictEqual(units['PER-SEC'], '1/s')
    as.strictEqual(aliases['SAMPLE-PER-SEC'], 'PER-SEC')
  })

  mo.it('reports units whose UCUM code and QUDT name disagree', function () {
    const { report } = build(unitTtl('M2-PER-M', 'A0E0L1I0M0H0T0D0', 'm'))
    as.strictEqual(report.conflicts.length, 1)
    as.ok(report.conflicts[0].startsWith('M2-PER-M:'))
  })

  mo.it('fails if a unit symbol has no unit in QUDT', function () {
    as.throws(() => buildVocabulary(PREFIXES, PREFIXES), /QUDT has no usable unit/)
  })

  mo.it('reads quantity kinds and leaves out deprecated ones', function () {
    const { quantityKinds } = build('',
      'quantitykind:Length qudt:hasDimensionVector qkdv:A0E0L1I0M0H0T0D0 .\n' +
      'quantitykind:Lineic qudt:hasDimensionVector qkdv:NotApplicable .\n' +
      'quantitykind:Old qudt:deprecated true .\n'
    ).vocabulary
    as.deepStrictEqual(quantityKinds, { Length: 'A0E0L1I0M0H0T0D0', Lineic: null })
  })

  mo.it('has generated a vocabulary with the QUDT version', function () {
    as.strictEqual(generated.qudtVersion, 'v3.1.11')
  })
})
