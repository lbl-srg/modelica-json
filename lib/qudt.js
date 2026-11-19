'use strict'

/*
 * Converts between Modelica/CDL units and quantities and their QUDT terms.
 *
 * QUDT terms are local names, such as 'M-PER-SEC' or 'Pressure'. The code that
 * reads or writes RDF adds and removes the namespaces.
 */

const { parseUnit, unitKey } = require('./modelicaUnit')
const {
  BROADER_QUANTITIES,
  QUANTITY_PREFIXES,
  QUANTITY_RENAMES,
  QUDT_QK_NS,
  QUDT_SCHEMA_NS,
  QUDT_UNIT_NS,
  S231_NS
} = require('./qudtVocab')
const { aliases, quantityKinds, units } = require('./qudtUnits.json')

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const QUANTITY_KINDS = new Set(quantityKinds)

const QUANTITY_BY_KIND = Object.fromEntries(
  Object.entries(QUANTITY_RENAMES).map(([quantity, kind]) => [kind, quantity])
)

const DEFAULT_PREFIXES = {
  qudt: QUDT_SCHEMA_NS,
  unit: QUDT_UNIT_NS,
  q: QUDT_QK_NS,
  quantitykind: QUDT_QK_NS,
  S231: S231_NS
}

let qudtUnitByKey = null

function getQudtUnitByKey () {
  if (qudtUnitByKey === null) {
    qudtUnitByKey = new Map(Object.entries(units).map(([name, unit]) => [unitKey(parseUnit(unit)), name]))
  }
  return qudtUnitByKey
}

/**
 * Returns the QUDT unit of a Modelica unit expression.
 *
 * @param {string} unit Modelica unit expression, such as 'J/(kg.K)'.
 * @return {?string} QUDT unit name, or null if there is none or the expression
 *   is invalid.
 */
function unitToQudt (unit) {
  try {
    return getQudtUnitByKey().get(unitKey(parseUnit(unit))) || null
  } catch (_) {
    return null
  }
}

/**
 * Returns the Modelica unit expression of a QUDT unit.
 *
 * @param {string} name QUDT unit name, such as 'J-PER-KiloGM-K'.
 * @return {?string} Modelica unit expression, or null if there is none.
 */
function qudtToUnit (name) {
  const main = hasOwn(aliases, name) ? aliases[name] : name
  return hasOwn(units, main) ? units[main] : null
}

/**
 * Returns the QUDT quantity kind of a Modelica quantity.
 *
 * @param {string} quantity Modelica quantity, such as 'PressureDifference'.
 * @return {?string} QUDT quantity kind name, or null if there is none.
 */
function quantityToQudt (quantity) {
  if (hasOwn(QUANTITY_RENAMES, quantity)) return QUANTITY_RENAMES[quantity]
  if (hasOwn(BROADER_QUANTITIES, quantity)) return BROADER_QUANTITIES[quantity]
  if (QUANTITY_KINDS.has(quantity)) return quantity
  const prefix = Object.keys(QUANTITY_PREFIXES).find(p => String(quantity).startsWith(p))
  return prefix ? QUANTITY_PREFIXES[prefix] : null
}

/**
 * Returns the Modelica quantity of a QUDT quantity kind.
 *
 * @param {string} kind QUDT quantity kind name.
 * @return {?string} Modelica quantity, or null if the kind is unknown.
 */
function qudtToQuantity (kind) {
  if (hasOwn(QUANTITY_BY_KIND, kind)) return QUANTITY_BY_KIND[kind]
  return QUANTITY_KINDS.has(kind) ? kind : null
}

function expandIri (term, prefixes) {
  const colon = term.indexOf(':')
  const prefix = term.slice(0, colon)
  return colon > 0 && hasOwn(prefixes, prefix) ? prefixes[prefix] + term.slice(colon + 1) : term
}

const firstValue = value => Array.isArray(value) ? value[0] : value

function literalValue (value) {
  const item = firstValue(value)
  const literal = item !== null && typeof item === 'object' ? item['@value'] : item
  return literal === undefined || literal === null ? null : String(literal)
}

/** Returns the part of the identifier in `value` after `namespace`, if any. */
function localName (value, namespace, prefixes) {
  const item = firstValue(value)
  const id = item !== null && typeof item === 'object' ? item['@id'] : item
  if (typeof id !== 'string') return null
  const iri = expandIri(id, prefixes)
  return iri.startsWith(namespace) ? iri.slice(namespace.length) : null
}

/**
 * Reads the unit, quantity and display unit of a CXF JSON-LD node.
 *
 * @param {Object} node JSON-LD node.
 * @param {Object} [options]
 * @param {Object} [options.context] JSON-LD context with the prefixes of the
 *   node, if the node does not have its own.
 * @return {{unit: ?string, quantity: ?string, displayUnit: ?string}} The
 *   Modelica attributes. QUDT terms take precedence over S231 literals.
 */
function fromCxf (node, { context = null } = {}) {
  const prefixes = { ...DEFAULT_PREFIXES }
  for (const [key, value] of Object.entries(context || node['@context'] || {})) {
    if (typeof value === 'string') prefixes[key] = value
  }
  const properties = {}
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith('@')) properties[expandIri(key, prefixes)] = value
  }

  const unitName = localName(properties[`${QUDT_SCHEMA_NS}hasUnit`], QUDT_UNIT_NS, prefixes)
  const kindName = localName(properties[`${QUDT_SCHEMA_NS}hasQuantityKind`], QUDT_QK_NS, prefixes)
  return {
    unit: (unitName && qudtToUnit(unitName)) || literalValue(properties[`${S231_NS}unit`]),
    quantity: (kindName && qudtToQuantity(kindName)) || literalValue(properties[`${S231_NS}quantity`]),
    displayUnit: literalValue(properties[`${S231_NS}displayUnit`])
  }
}

module.exports = {
  fromCxf,
  quantityToQudt,
  qudtToQuantity,
  qudtToUnit,
  unitToQudt
}
