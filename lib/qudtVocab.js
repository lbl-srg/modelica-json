'use strict'

/*
 * Hand-maintained mappings between Modelica/CDL and QUDT.
 *
 * Everything that can be derived from QUDT lives in the generated
 * lib/qudtUnits.json (see scripts/generateQudtUnits.js). This file holds only
 * what QUDT cannot tell us. Regenerate lib/qudtUnits.json after changing any
 * unit table here.
 */

const QUDT_SCHEMA_NS = 'http://qudt.org/schema/qudt/'
const QUDT_UNIT_NS = 'http://qudt.org/vocab/unit/'
const QUDT_QK_NS = 'http://qudt.org/vocab/quantitykind/'
const S231_NS = 'http://data.ashrae.org/S231#'

// Modelica unit prefix (MLS section 19.1) -> prefix of a QUDT unit name
const UNIT_PREFIXES = {
  Q: 'Quetta',
  R: 'Ronna',
  Y: 'Yotta',
  Z: 'Zetta',
  E: 'Exa',
  P: 'Peta',
  T: 'Tera',
  G: 'Giga',
  M: 'Mega',
  k: 'Kilo',
  h: 'Hecto',
  da: 'Deca',
  d: 'Deci',
  c: 'Centi',
  m: 'Milli',
  u: 'Micro',
  n: 'Nano',
  p: 'Pico',
  f: 'Femto',
  a: 'Atto',
  z: 'Zepto',
  y: 'Yocto',
  r: 'Ronto',
  q: 'Quecto'
}

// Unit symbols that accept a prefix -> QUDT unit name
const PREFIXABLE_UNITS = {
  // SI base units (the kilogram is the prefixed gram)
  mol: 'MOL',
  A: 'A',
  m: 'M',
  cd: 'CD',
  g: 'GM',
  K: 'K',
  s: 'SEC',
  // SI derived units with special names
  rad: 'RAD',
  sr: 'SR',
  Hz: 'HZ',
  N: 'N',
  Pa: 'PA',
  J: 'J',
  W: 'W',
  C: 'C',
  V: 'V',
  F: 'FARAD',
  Ohm: 'OHM',
  S: 'S',
  Wb: 'WB',
  T: 'T',
  H: 'H',
  lm: 'LM',
  lx: 'LUX',
  Bq: 'BQ',
  Gy: 'GRAY',
  Sv: 'SV',
  kat: 'KAT',
  // Non-SI units that are used with prefixes
  L: 'L',
  eV: 'EV',
  bar: 'BAR',
  var: 'VAR',
  B: 'B'
}

// Unit symbols that do not accept a prefix -> QUDT unit name
const UNPREFIXED_UNITS = {
  min: 'MIN',
  h: 'HR',
  d: 'DAY',
  deg: 'DEG',
  degC: 'DEG_C',
  degF: 'DEG_F',
  degRk: 'DEG_R',
  debye: 'DEBYE',
  rev: 'REV',
  t: 'TON_Metric',
  Np: 'NP',
  '%': 'PERCENT',
  ppm: 'PPM',
  // Units of Buildings.Controls.OBC.UnitConversions
  Btu: 'BTU_IT',
  ft: 'FT',
  gal: 'GAL_US',
  hp: 'HP',
  psi: 'PSI',
  quad: 'QUAD',
  ton: 'TON_FG'
}

// Alternative spellings of a unit symbol -> the symbol used in this library
const SYMBOL_ALIASES = {
  l: 'L'
}

// Symbols that stand for a product or ratio of other units. A prefix applies
// to the first factor, so that kWh is kW.h.
const COMPOUND_SYMBOLS = {
  Wh: 'W.h',
  VA: 'V.A',
  rpm: 'rev/min',
  cfm: 'ft3/min'
}

// UCUM atoms that are spelled differently from the Modelica symbol
const UCUM_SYMBOLS = {
  Cel: 'degC',
  '[degF]': 'degF',
  '[degR]': 'degRk',
  '[Btu_IT]': 'Btu',
  '[ft_i]': 'ft',
  '[gal_us]': 'gal',
  '[HP]': 'hp',
  '[ppm]': 'ppm',
  '[psi]': 'psi'
}

// QUDT names to use when several QUDT units have the same factors and the
// default choice (shortest name, then alphabetical) is not the usual one.
const PREFERRED_QUDT_UNITS = [
  'M-K-PER-W'
]

// How to write a unit in Modelica when the order of the factors in the QUDT
// name differs from the spelling that is used in the Modelica libraries.
const MODELICA_SPELLINGS = [
  '(m.K)/W',
  'kg/(s.m2)',
  'm3.Pa/s'
]

// Modelica quantity -> QUDT quantity kind, for names that differ. These
// convert back to the same Modelica quantity. All other quantities that are
// spelled like a QUDT quantity kind map to it directly.
const QUANTITY_RENAMES = {
  Conductivity: 'ElectricConductivity',
  HeatFlux: 'HeatFluxDensity',
  LinearTemperatureCoefficient: 'LinearThermalExpansion',
  Molality: 'MolalityOfSolute',
  RadiantEnergyFluenceRate: 'RadiantFluenceRate',
  ReflectionCoefficient: 'Reflectance',
  'Resistance per meter': 'LineicResistance',
  TemperatureSlope: 'TemperatureRateOfChange',
  TransmissionCoefficient: 'Transmittance',
  WaveNumber: 'Wavenumber'
}

// Modelica quantity -> broader QUDT quantity kind. QUDT has no exact match, so
// these do not convert back: the result is the name of the quantity kind.
const BROADER_QUANTITIES = {
  1: 'DimensionlessRatio',
  AbsolutePressure: 'Pressure',
  DensityOfHeatFlowRate: 'HeatFluxDensity',
  EnthalpyFlowRate: 'HeatFlowRate',
  HeatFlow: 'HeatFlowRate',
  'Per unit': 'DimensionlessRatio',
  PressureDifference: 'Pressure'
}

// Start of a Modelica quantity that is completed by a phase system or medium
// name, such as "Voltage." + phaseSystemName -> QUDT quantity kind
const QUANTITY_PREFIXES = {
  'Current.': 'ElectricCurrent',
  'MassFlowRate.': 'MassFlowRate',
  'Voltage.': 'ElectricPotential'
}

module.exports = {
  BROADER_QUANTITIES,
  COMPOUND_SYMBOLS,
  MODELICA_SPELLINGS,
  PREFERRED_QUDT_UNITS,
  PREFIXABLE_UNITS,
  QUANTITY_PREFIXES,
  QUANTITY_RENAMES,
  QUDT_QK_NS,
  QUDT_SCHEMA_NS,
  QUDT_UNIT_NS,
  S231_NS,
  SYMBOL_ALIASES,
  UCUM_SYMBOLS,
  UNIT_PREFIXES,
  UNPREFIXED_UNITS
}
