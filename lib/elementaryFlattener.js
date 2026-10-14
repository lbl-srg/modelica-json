'use strict'

const logger = require('winston') // This retrieves the default logger which is configured in app.js
const arrayExpansion = require('./arrayExpansion.js')

/**
 * What every flattening in this file builds up and returns: the declarations to
 * add and the connections that wire them, keyed by the end a signal leaves.
 * Always this shape, starting as { elementList: [], connections: {} }.
 *
 * @typedef {{elementList: Object[], connections: Object<string, string[]>}} Added
 */


// Where a generated component records what made it, so the elementary block the blocks were flattened out of can still be read off the objects json. 
const expansionKey = 'elementaryExpansion';

const cdl = 'Buildings.Controls.OBC.CDL.';

const flattenableBlocks = {
  // ---------------------------------- condense ----------------------------------
  [cdl + 'Reals.MultiSum']: {
    kind: 'condense',
    input: { u: 'RealInput' },
    output: { y: 'RealOutput' },
    parameter: { k: 'k', nin: 'nin' }, // k = ['1', '10', '100'], nin = 3
    product: cdl + 'Reals.MultiplyByParameter',
    aggregate: cdl + 'Reals.Add'
  },
  [cdl + 'Integers.MultiSum']: {
    kind: 'condense',
    input: { u: 'IntegerInput' },
    output: { y: 'IntegerOutput' },
    parameter: { k: 'k', nin: 'nin' }, // k = ['1', '10', '100'], nin = 3
    // Integers has no MultiplyByParameter, so k reaches Multiply through u2
    product: cdl + 'Integers.Multiply',
    aggregate: cdl + 'Integers.Add'
  },
  [cdl + 'Reals.MultiMax']: {
    kind: 'condense',
    input: { u: 'RealInput' },
    output: { y: 'RealOutput' },
    parameter: { nin: 'nin' }, // nin = 3
    aggregate: cdl + 'Reals.Max'
  },
  [cdl + 'Reals.MultiMin']: {
    kind: 'condense',
    input: { u: 'RealInput' },
    output: { y: 'RealOutput' },
    parameter: { nin: 'nin' }, // nin = 3
    aggregate: cdl + 'Reals.Min'
  },
  [cdl + 'Logical.MultiAnd']: {
    kind: 'condense',
    input: { u: 'BooleanInput' },
    output: { y: 'BooleanOutput' },
    parameter: { nin: 'nin' }, // nin = 3
    aggregate: cdl + 'Logical.And'
  },
  [cdl + 'Logical.MultiOr']: {
    kind: 'condense',
    input: { u: 'BooleanInput' },
    output: { y: 'BooleanOutput' },
    parameter: { nin: 'nin' }, // nin = 3
    aggregate: cdl + 'Logical.Or'
  },
  [cdl + 'Reals.MatrixGain']: {
    // K is nout by nin; nin is size(K, 2) and nout is size(K, 1)
    kind: 'condense',
    input: { u: 'RealInput' },
    output: { y: 'RealOutput' },
    // K = [['1', '2'], ['3', '4']], nin = 2, nout = 2
    parameter: { K: 'K', nin: 'nin', nout: 'nout' },
    product: cdl + 'Reals.MultiplyByParameter',
    aggregate: cdl + 'Reals.Add'
  },
  [cdl + 'Reals.MatrixMax']: {
    kind: 'condense',
    input: { u: 'RealInput' },
    output: { y: 'RealOutput' },
    // rowMax = true, nRow = 3, nCol = 3; true aggregates each row, false each column
    parameter: { rowMax: 'rowMax', nRow: 'nRow', nCol: 'nCol' },
    aggregate: cdl + 'Reals.Max'
  },
  [cdl + 'Reals.MatrixMin']: {
    kind: 'condense',
    input: { u: 'RealInput' },
    output: { y: 'RealOutput' },
    // rowMin = false, nRow = 3, nCol = 3
    parameter: { rowMin: 'rowMin', nRow: 'nRow', nCol: 'nCol' },
    aggregate: cdl + 'Reals.Min'
  },


};

// Routing blocks vary by either "Scalar" or "Vector" in their names. 

['Real', 'Integer', 'Boolean'].forEach(type => {
  // ----------------------------------- rewire -----------------------------------
  flattenableBlocks[`${cdl}Routing.${type}ScalarReplicator`] = {
    kind: 'rewire',
    input: { u: `${type}Input` },
    output: { y: `${type}Output` },
    parameter: { nout: 'nout' } // nout = 3
  }
  flattenableBlocks[`${cdl}Routing.${type}VectorReplicator`] = {
    kind: 'rewire',
    input: { u: `${type}Input` },
    output: { y: `${type}Output` },
    parameter: { nin: 'nin', nout: 'nout' } // nin = 3, nout = 3
  }
  flattenableBlocks[`${cdl}Routing.${type}VectorFilter`] = {
    kind: 'rewire',
    input: { u: `${type}Input` },
    output: { y: `${type}Output` },
    // nin = 3, nout = 2, msk = ['true', 'false', 'true']
    parameter: { nin: 'nin', nout: 'nout', msk: 'msk' }
    // nout must equal the number of trues
  }
  flattenableBlocks[`${cdl}Routing.${type}ExtractSignal`] = {
    kind: 'rewire',
    input: { u: `${type}Input` },
    output: { y: `${type}Output` },
    // nin = 3, nout = 3, extract = ['1', '2', '3']
    // indices may repeat, so one u can feed several y
    parameter: { nin: 'nin', nout: 'nout', extract: 'extract' }
  }


  // ------------------------------------ misc ------------------------------------
  flattenableBlocks[`${cdl}Routing.${type}Extractor`] = {
    kind: 'misc',
    input: { u: `${type}Input`, index: 'IntegerInput' },
    output: { y: `${type}Output` },
    parameter: { nin: 'nin' }, // nin = 3
    // index is only known at runtime, so the routing is built out of blocks:
    // compare compares index with a threshold, route picks between two inputs
    compare: cdl + 'Integers.LessEqualThreshold',
    route: cdl + (type === 'Boolean' ? 'Logical' : `${type}s`) + '.Switch'
  }
});




// ------------------------------------ helpers ------------------------------------

/**
 * Checks whether an elementary block is in this module's list of flattenable blocks.
 *
 * @param {string} fullClassName - The full class name of the block.
 * @returns {boolean} Whether a template for it exists.
 */
function isFlattenable (fullClassName) {
  return typeof fullClassName === 'string' && fullClassName in flattenableBlocks
}

/**
 * The name one element of an expanded array takes, as arrayExpansion writes it.
 *
 * @param {string} name - The name of the array component.
 * @param {...number} index - The 1 based index of the element, one per dimension.
 * @returns {string} u and 2 give u_2; u, 1 and 2 give u_1_2.
 */
function elementName (name, ...index) {
  return arrayExpansion.elementName(name, index)
}

/**
 * The prefix the instances generated of a class are named with: the first three
 * letters of the class, lowercased. mul for MultiplyByParameter, add for Add, etc.
 *
 * @param {string} className - The full class name of a product, aggregate or constant.
 * @returns {string} The prefix.
 */
function prefixOf (className) {
  return className.split('.').pop().slice(0, 3).toLowerCase()
}

/**
 * The literal value a parameter of an extracted class equals.
 * 
 * @param {Object} instances - The instances map of the extracted class.
 * @param {string} identifier - The name the parameter is declared with.
 * @returns {string|null} The value as it is written, or null when the component
 *     is not a parameter or never resolved to a literal.
 */
function parameterLiteral (instances, identifier) {
  const component = instances?.[identifier]
  if (component?.type !== 'element' ||
    !(component.type_prefix ?? '').includes('parameter')) {
    return null
  }

  // have an equal property means that it was assigned a value with =, not just attributes
  const modification = component.single_component_list?.declaration?.modification
  if (modification?.equal !== true) {
    return null
  }

  // only accepts string or number literals
  const val = modification.expression?.simple_expression
  return (typeof val === 'string' || typeof val === 'number') ? String(val).trim() : null
}

/**
 * The literal value of an element of an array parameter.
 *
 * @param {Object} instances - The instances map of the extracted class.
 * @param {string} name - The name of the array parameter.
 * @param {number[]} index - The 1 based index, one per dimension.
 * @returns {string|null} The value, or null when it did not resolve.
 */
function parameterArrayElement (instances, name, index) {

  // first try the element itselfZ: k_2
  const element = parameterLiteral(instances, elementName(name, ...index))
  if (element !== null) {
    return element
  }

  // if that fails, try the whole array: k
  const whole = parameterLiteral(instances, name)
  return whole === null ? null : arrayExpansion.literalElement(whole, index)
}

/**
 * The size a parameter resolved to.
 *
 * @param {Object} instances - The instances map of the extracted class.
 * @param {string} name - The parameter.
 * @returns {number|null} The size, or null when it is not a positive integer.
 */
function sizeOf (instances, name) {
  const value = Number(parameterLiteral(instances, name))
  return Number.isInteger(value) && value >= 1 ? value : null
}

/**
 * The creation of a Modelica component clause from the json representation of a component.
 * as it gets passed into the object-json creation function(s)
 * 
 * @param {string} typeSpecifier - The full class name the component is of.
 * @param {string} identifier - The name the component is declared with.
 * @param {Object} modifications - The values the declaration binds, keyed by the
 *     parameter they bind, holding the expression as it is written.
 * @param {string} description - The description string the declaration carries.
 * @returns {Object} One entry of an element list, holding a component clause.
 */
function componentClause (typeSpecifier, identifier, modifications, description) {
  const classModification = Object.entries(modifications).map(([name, value]) => ({
    element_modification_or_replaceable: {
      /* final, because the value is one this flattening worked out rather than
         one a consumer may override: the gain of mul_2 is the second element of
         the k the instantiation supplied, and nothing else. */
      final: true,
      element_modification: {
        name,
        modification: { equal: true, expression: { simple_expression: value } }
      }
    }
  }))

  const declaration = { identifier }
  if (classModification.length > 0) {
    declaration.modification = { class_modification: classModification }
  }

  return {
    component_clause: {
      type_specifier: typeSpecifier,
      component_list: [{
        declaration,
        description: { description_string: description }
      }]
    }
  }
}

/**
 * Checks that the specified connectors exist in the instances map.
 *
 * @param {Object} instances - The instances map of the extracted class.
 * @param {string[]} connectors - The connectors to look for.
 * @param {string} blockName - The name of the block, for the log.
 * @returns {boolean} Whether all of them exist.
 */
function connectorsExist (instances, connectors, blockName) {
  const missing = connectors.filter(connector => instances[connector] === undefined)
  if (missing.length > 0) {
    logger.warn(`${blockName}: ${missing.join(', ')} missing, leaving the block unflattened.`)
    return false
  }
  return true
}

// --------------------------- the three kinds of flattening ---------------------------

/**
 * Adds the product stage of one input: the block that weights it by its gain.
 *
 * @param {string} product - The full class name of the product block.
 * @param {string} input - The connector of the input.
 * @param {string} weight - The gain, as it is written.
 * @param {string} weightName - The element the gain is, k[2], for the description.
 * @param {number[]} index - The index the product is generated for.
 * @param {Added} added - Added to in place, contains elementList and connections.
 * @returns {string} The connector the weighted input leaves.
 */
function addProduct (product, input, weight, weightName, index, added) {
  const name = elementName(prefixOf(product), ...index)
  const description = `${input} weighted by ${weightName}`

  if ((product).split('.').pop().endsWith('ByParameter')) {
    added.elementList.push(componentClause(product, name,
      { 'k': weight }, description))
    arrayExpansion.addConnection(added.connections, input, `${name}.u`)
  } else {
    // the gain comes from a constant block of the product's package, into u2
    const constant = product.split('.').slice(0, -1).join('.') + '.Sources.Constant'
    const gain = elementName(prefixOf(constant), ...index)
   
    added.elementList.push(componentClause(constant, gain,
      { 'k': weight }, `Value of ${weightName}`))
    added.elementList.push(componentClause(product, name, {}, description))

    // add two connections: ex - input to u1 and gain to u2
    arrayExpansion.addConnection(added.connections, input, `${name}.u1`)
    arrayExpansion.addConnection(added.connections, `${gain}.y`, `${name}.u2`)
  }
  return `${name}.y`
}

/**
 * Adds one aggregate chain: the operands chained left to right through the
 * aggregate block, the first taking the first two operands and every further
 * one what the previous one produced and the next operand. A chain of one
 * operand needs no block; the operand is wired straight to the output.
 *
 * Example, the running example once the products are in:
 *
 *     addAggregate(aggregate, ['mul_1.y', 'mul_2.y', 'mul_3.y'], ['u_1', 'u_2', 'u_3'], 'y', [], added)
 *
 * adds Add add_1 "Add of u_1 to u_2" and Add add_2 "Add of u_1 to u_3", and
 * the connections
 *
 *     'mul_1.y': ['add_1.u1'], 'mul_2.y': ['add_1.u2'],
 *     'add_1.y': ['add_2.u1'], 'mul_3.y': ['add_2.u2'],
 *     'add_2.y': ['y']
 
 *
 * @param {string} aggregate - The full class name of the aggregate block.
 * @param {string[]} operands - The connectors to aggregate.
 * @param {string[]} inputs - The inputs the operands come from, for descriptions.
 * @param {string} output - The connector the result is wired to.
 * @param {number[]} index - Empty for a block with one output; the row or column
 *     for a matrix block.
 * @param {Added} added - Added to in place.
 * @returns {void}
 */
function addAggregate (aggregate, operands, inputs, output, index, added) {
  // start with the first operand
  let running = operands[0]

  for (let position = 1; position < operands.length; position++) {
    const name = elementName(prefixOf(aggregate), ...index, position) // get the current name of the variable and its block
    added.elementList.push(componentClause(aggregate, name, {},
      `${(aggregate).split('.').pop()} of ${inputs[0]} to ${inputs[position]}`)) // dynamically create component clause with custom description
    
    // add two connections: ex - 'mul_1.y' to 'add_1.u1' and 'mul_2.y' to 'add_1.u2'
    arrayExpansion.addConnection(added.connections, running, `${name}.u1`)
    arrayExpansion.addConnection(added.connections, operands[position], `${name}.u2`)
    running = `${name}.y`// new running will be the output (y) of the current variable 
  }
  arrayExpansion.addConnection(added.connections, running, output)
}

/**
 * Decomposes a condensing block - inputs, each optionally weighted by a product,
 * aggregated into an output - into the products and aggregates it stands for.
 *
 * @param {Object} template - The entry of flattenableBlocks for the block.
 * @param {Object} instances - The instances of the extracted block, which hold
 *     the sizes and the parameters the instantiation resolved to.
 * @param {string} blockName - The name of the block, for the log.
 * @returns {Object|null} Added, plus resize when an output has to be sized
 *     first; or null when the block did not resolve to something expandable.
 */
function flattenCondense (template, instances, blockName) {
  const parameter = template.parameter
  const [input] = Object.keys(template.input)
  const [output] = Object.keys(template.output)
  const gain = parameter.k ?? parameter.K // undefined when there is no product stage

  // Determine the size names based on the block type
  // but if the block is a Multi block, it only has 'nin' and no 'nout' or 'nRow'/'nCol'
  const sizeNames = parameter.nRow !== undefined
    ? [parameter.nRow, parameter.nCol]
    : (parameter.nout !== undefined ? [parameter.nout, parameter.nin] : [parameter.nin])

  // check if all sizes are fine 
  const sizes = sizeNames.map(name => sizeOf(instances, name))
  if (sizes.includes(null)) {
    logger.warn(`${blockName}: ${sizeNames.join(', ')} did not resolve to a size, ` +
      'leaving the block unflattened.')
    return null
  }

  const groups = []
  let resize = null
  if (sizes.length === 1) {
    // MultiSum, MultiMax, MultiMin, MultiAnd, MultiOr
    const inputs = []
    const weights = []
    for (let position = 1; position <= sizes[0]; position++) {
      inputs.push(elementName(input, position))
      weights.push([position])
    }
    groups.push({ index: [], output, inputs, weights })
  } else if (gain !== undefined) {
    // MatrixGain: y_i = K[i, 1] * u_1 + ... + K[i, nin] * u_nin
    const [rows, cols] = sizes
    for (let row = 1; row <= rows; row++) {
      const inputs = []
      const weights = []
      for (let col = 1; col <= cols; col++) {
        inputs.push(elementName(input, col))
        weights.push([row, col])
      }
      groups.push({ index: [row], output: elementName(output, row), inputs, weights })
    }
  } else {
    // MatrixMax, MatrixMin: y_i is the max or min of row i, or of column i
    const along = parameter.rowMax ?? parameter.rowMin
    const byRow = parameterLiteral(instances, along)
    // determine if the operation is along rows or columns based on the parameter
    if (byRow !== 'true' && byRow !== 'false') {
      logger.warn(`${blockName}: ${along} did not resolve to true or false, ` +
        'leaving the block unflattened.')
      return null
    }

    // determine the number of groups and the length of each group based on the operation direction
    const [rows, cols] = sizes
    const count = byRow === 'true' ? rows : cols
    const length = byRow === 'true' ? cols : rows
    for (let group = 1; group <= count; group++) {
      const inputs = []
      for (let position = 1; position <= length; position++) {
        // determine the input element name based on whether we are iterating by row or by column
        inputs.push(byRow === 'true'
          ? elementName(input, group, position)
          : elementName(input, position, group))
      }
      groups.push({ index: [group], output: elementName(output, group), inputs })
    }

    // if the output element does not exist yet, prepare a resize instruction
    if (instances[groups[0].output] === undefined) {
      resize = { [output]: [count] }
    }
  }

  // a resized output does not exist yet; the caller expands it before wiring
  const connectors = groups.flatMap(group => group.inputs)
    .concat(resize === null ? groups.map(group => group.output) : [])
  if (!connectorsExist(instances, connectors, blockName)) {
    return null
  }

  // every gain is resolved before anything is generated, so a missing one
  // leaves the block as it was
  const gains = []
  if (gain !== undefined) {
    for (const group of groups) {
      const values = group.weights.map(index => parameterArrayElement(instances, gain, index))
      const missing = values.indexOf(null)
      if (missing !== -1) {
        logger.warn(`${blockName}: ${gain}[${group.weights[missing].join(', ')}] did not resolve, ` +
          'leaving the block unflattened.')
        return null
      }
      gains.push(values)
    }
  }

  // prepare the structure that will hold the added elements and connections
  const added = { elementList: [], connections: {} }
  groups.forEach((group, offset) => {
    const operands = gain === undefined
      ? group.inputs
      : group.inputs.map((input, position) => addProduct(template.product, input,
        gains[offset][position], `${gain}[${group.weights[position].join(', ')}]`,
        group.weights[position], added))
    addAggregate(template.aggregate, operands, group.inputs, group.output, group.index, added)
  })
  if (resize !== null) added.resize = resize
  return added
}

/**
 * Decomposes a routing block into the connections it stands for. The block
 * computes nothing, so nothing is generated: every output is wired straight to
 * the input it copies.
 *
 * @param {Object} template - The entry of flattenableBlocks for the block.
 * @param {Object} instances - The instances of the extracted block.
 * @param {string} blockName - The name of the block, for the log.
 * @returns {Added|null} No declarations and the connections to add, or null
 *     when the block did not resolve to something that can be rewired.
 */
function flattenRewire (template, instances, blockName) {
  const parameter = template.parameter
  const [input] = Object.keys(template.input)
  const [output] = Object.keys(template.output)
  const select = parameter.msk ?? parameter.extract

  const inSize = parameter.nin === undefined ? 1 : sizeOf(instances, parameter.nin)
  const outSize = sizeOf(instances, parameter.nout)
  if (inSize === null || outSize === null) {
    logger.warn(`${blockName}: nin or nout did not resolve to a size, ` +
      'leaving the block unflattened.')
    return null
  }

  // each output with the input it copies
  const routes = []
  if (parameter.nin === undefined) {
    // ScalarReplicator
    for (let out = 1; out <= outSize; out++) {
      routes.push([input, elementName(output, out)])
    }
  } else if (select === undefined) {
    // VectorReplicator
    for (let out = 1; out <= outSize; out++) {
      for (let i = 1; i <= inSize; i++) {
        routes.push([elementName(input, i), elementName(output, out, i)])
      }
    }
  } else {
    // VectorFilter: msk has one entry per input; ExtractSignal: extract has one per output
    const isMask = parameter.msk !== undefined
    const values = []
    for (let position = 1; position <= (isMask ? inSize : outSize); position++) {
      values.push(parameterArrayElement(instances, select, [position]))
    }
    if (values.includes(null)) {
      logger.warn(`${blockName}: ${select} did not resolve, leaving the block unflattened.`)
      return null
    }

    // determine the sources for the outputs based on the mask or extract parameter
    const sources = isMask
      ? values.flatMap((value, offset) => value === 'true' ? [offset + 1] : [])
      : values.map(Number)
    if (sources.length !== outSize ||
      sources.some(source => !Number.isInteger(source) || source < 1 || source > inSize)) {
      logger.warn(`${blockName}: ${select} does not select ${outSize} of the ${inSize} inputs, ` +
        'leaving the block unflattened.')
      return null
    }
    sources.forEach((source, offset) => {
      routes.push([elementName(input, source), elementName(output, offset + 1)])
    })
  }

  // at this point, all routes have been determined and validated
  if (!connectorsExist(instances, [...new Set(routes.flat())], blockName)) {
    return null
  }
  const connections = {}
  routes.forEach(([from, to]) => arrayExpansion.addConnection(connections, from, to))
  return { elementList: [], connections }
}

/**
 * Handles the miscellaneous blocks that do not fall into the standard categories.
 *
 * Currently the only block is Extractor, see flattenExtractor.
 *
 * @param {Object} template - The entry of flattenableBlocks for the block.
 * @param {Object} instances - The instances of the extracted block.
 * @param {string} blockName - The name of the block, for the log.
 * @returns {Added|null} What the block decomposes into, or null when it is kept.
 */
function flattenMisc (template, instances, blockName) {
  if (template.compare !== undefined && template.route !== undefined) {
    return flattenExtractor(template, instances, blockName)
  }
  logger.warn(`${blockName}: no flattening is known for this block, leaving it unflattened.`)
  return null
}

/**
 * Only miscellaneous block included is Extractor. Decomposes an Extractor into a chain of
 * switches.
 *
 * With nin = 1 nothing is generated and u_1 is wired straight to y.
 *
 * @param {Object} template - The entry of flattenableBlocks for the block.
 * @param {Object} instances - The instances of the extracted block.
 * @param {string} blockName - The name of the block, for the log.
 * @returns {Added|null} The thresholds, switches and connections, or null when
 *     nin did not resolve or a connector is missing.
 */
function flattenExtractor (template, instances, blockName) {
  const [input, index] = Object.keys(template.input)
  const [output] = Object.keys(template.output)

  const inSize = sizeOf(instances, template.parameter.nin)
  if (inSize === null) {
    logger.warn(`${blockName}: ${template.parameter.nin} did not resolve to a size, ` +
      'leaving the block unflattened.')
    return null
  }

  const inputs = []
  for (let position = 1; position <= inSize; position++) {
    inputs.push(elementName(input, position))
  }
  const connectors = inputs.concat(output, inSize > 1 ? [index] : [])
  if (!connectorsExist(instances, connectors, blockName)) {
    return null
  }

  const added = { elementList: [], connections: {} }

  // built from the bottom up: running is what reaches the switch above
  let running = inputs[inSize - 1]
  for (let position = inSize - 1; position >= 1; position--) {
    const compare = elementName(prefixOf(template.compare), position)
    const route = elementName(prefixOf(template.route), position)

    added.elementList.push(componentClause(template.compare, compare,
      { t: String(position) }, `True when ${index} selects ${inputs[position - 1]} or below`))
    added.elementList.push(componentClause(template.route, route, {},
      `${inputs[position - 1]} when ${index} <= ${position}, else ${running}`))

    // connect the index to the threshold
    arrayExpansion.addConnection(added.connections, index, `${compare}.u`)
    arrayExpansion.addConnection(added.connections, `${compare}.y`, `${route}.u2`)
    arrayExpansion.addConnection(added.connections, inputs[position - 1], `${route}.u1`)
    arrayExpansion.addConnection(added.connections, running, `${route}.u3`)
    running = `${route}.y`
  }

  arrayExpansion.addConnection(added.connections, running, output)
  return added
}

/**
 * Array flattening injection point; calls the family of flattening functions for the block's kind,
 * and marks the array as having been flattened.
 *
 *
 * @param {Object} allObjects - The instances and connections of the extracted
 *     elementary block.
 * @param {string} fullClassName - The full class name of the block.
 * @param {string} [blockName] - The name the flattened block is known by, used
 *     in the record a generated component carries and in the log.
 * @returns {{elementList: Array, connections: Object, resize: Object}|null} The
 *     declarations to extract, the connections to add and, when there is one,
 *     the output to size first, keyed by name and holding its sizes; or null
 *     when the block is kept as it is.
 */
function flattenElementaryBlock (allObjects, fullClassName, blockName = fullClassName) {
  const template = flattenableBlocks[fullClassName]
  if (template === undefined) {
    return null
  }
  const instances = allObjects.instances ?? {}

  let flattened = null
  switch (template.kind) {
    case 'condense':
      flattened = flattenCondense(template, instances, blockName)
      break
    case 'rewire':
      flattened = flattenRewire(template, instances, blockName)
      break
    case 'misc':
      flattened = flattenMisc(template, instances, blockName)
      break
    default:
      logger.warn(`${blockName}: no flattening is known for ${template.kind} blocks.`)
  }
  if (flattened === null) {
    return null
  }

  // marking as flattened 
  flattened.elementList.forEach(element => {
    element.component_clause[expansionKey] = { blockName, elementaryBlock: fullClassName }
  })
  return flattened
}

/**
 * Writes the record a generated declaration carries onto the instance the
 * extraction made of it.
 *
 * The record rides on the component clause through the extraction, which does
 * not know about it, so it is moved onto the instance afterwards.
 *
 * @param {Array} elementList - The declarations that were extracted.
 * @param {Object} instances - The instances the extraction produced, mutated in
 *     place.
 * @returns {void}
 */
function markExpandedInstances (elementList, instances) {
  elementList.forEach(element => {
    const record = element.component_clause[expansionKey]
    const identifier = element.component_clause.component_list[0]?.declaration?.identifier
    if (record === undefined || instances[identifier] === undefined) {
      return
    }
    instances[identifier][expansionKey] = record
  })
}

module.exports.isFlattenable = isFlattenable
module.exports.flattenElementaryBlock = flattenElementaryBlock
module.exports.markExpandedInstances = markExpandedInstances
module.exports.flattenableBlocks = flattenableBlocks
module.exports.expansionKey = expansionKey
