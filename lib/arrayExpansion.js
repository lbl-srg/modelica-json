'use strict'

const logger = require('winston') // This retrieves the default logger which is configured in app.js

// seperator between the name of an array component and its index of its element
const indexSeparator = '_'

/* Where an instance records the subscripts it was declared with, before they
   were evaluated. The expansion erases the subscripts of an element, so it
   erases this with them: the element is not the array and has no declared size
   of its own to be put back. See `resolveEvaluationMarkers` in objectExtractor. */
const originalSubscriptsKey = '_originalSubscripts'

/**
 * Splits a text on a separator, ignoring the separators that sit inside
 * brackets, braces or parentheses.
 *
 * A Modelica array literal holds commas of its own - {{1,2},{3,4}} - and a
 * subscript holds a component reference which may hold a dot, so neither can be
 * split with String.split.
 *
 * @param {string} text - The text to split.
 * @param {string} separator - The single character to split on.
 * @returns {string[]} The parts, in the order they appear.
 */
function splitModArrayString (text, separator) {
  const parts = []
  let depth = 0
  let part = ''
  for (const character of text) {
    if ('([{'.includes(character)) depth += 1
    if (')]}'.includes(character)) depth -= 1
    if (character === separator && depth === 0) {
      parts.push(part)
      part = ''
    } else {
      part += character
    }
  }
  parts.push(part)
  return parts
}

/**
 * The value a conditional component was declared with, once it is evaluated.
 *
 * @param {Object} instance - One entry of an objects json instances map.
 * @returns {boolean|null} Whether the component is instantiated, or null when
 *     the component is not conditional or its guard did not evaluate.
 */
function conditionValue (instance) {
  const expression = instance.single_component_list?.condition_attribute?.expression // get the expression of an instance
  if (expression === undefined || expression === null) {
    return null
  }
  const value = expression.simple_expression
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return null
}

/**
 * The sizes of the dimensions of an array component, or null when it is not an
 * array or its dimensions did not evaluate to literal sizes.
 *
 * A dimension that is still an expression - because the parameter it is built
 * from was never supplied - leaves the component unexpanded rather than
 * expanded to a guessed size.
 *
 * @param {Object} instance - One entry of an objects json instances map.
 * @returns {number[]|null} The size of each dimension.
 */
function arraySizes (instance) {
  if (instance.isVector !== true) {
    return null
  }
  const subscripts = String(instance.arraySubscripts ?? '')
  if (!/^\[.*\]$/.test(subscripts)) {
    return null
  }
  const sizes = splitModArrayString(subscripts.slice(1, -1), ',')
    .map(size => Number(size.trim()))
  if (sizes.length === 0 ||
    sizes.some(size => !Number.isInteger(size) || size < 1)) {
    return null
  }
  return sizes
}

/**
 * Every index of an array of the given dimensions, in row major order.
 *
 * @param {number[]} sizes - The size of each dimension.
 * @returns {number[][]} One 1 based index per element.
 */
function indices (sizes) {
  return sizes.reduce((tuples, size) => {
    const expanded = []
    tuples.forEach(tuple => {
      for (let index = 1; index <= size; index++) {
        expanded.push(tuple.concat([index]))
      }
    })
    return expanded
  }, [[]])
}

/**
 * Formatting the element name of an array component, based on the index seperator and index
 *
 * @param {string} name - The name of the array component.
 * @param {number[]} index - The 1 based index of the element.
 * @returns {string} The name of the element, blk_1 or blk_1_2.
 */
function elementName (name, index) {
  return name + indexSeparator + index.join(indexSeparator)
}

/**
 * The elements of a Modelica array literal, as the strings they are written as.
 *
 * Example:
 *   arrayLiteralElements('{1, 2, 3}') // ['1', '2', '3']
 *
 * @param {*} value - The value to split, which is only a literal when it is a
 *     string of the form {...}.
 * @returns {string[]|null} The elements, or null when the value is not an array
 *     literal.
 */
function arrayLiteralElements (value) {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  if (!/^\{[\s\S]*\}$/.test(trimmed)) {
    return null
  }
  const body = trimmed.slice(1, -1).trim()
  if (body === '') {
    return null
  }
  return splitModArrayString(body, ',').map(element => element.trim())
}

/**
 * The element an array literal holds at an index.
 *
 * The value is only indexed when the literal has exactly as many elements as
 * the array component has, dimension by dimension. A value of any other shape -
 * a scalar such as `final nin=3`, or an array bound to a parameter which is
 * itself an array - belongs to every element unchanged.
 *
 * @param {*} value - The value the modification carries.
 * @param {number[]} sizes - The size of each dimension of the component.
 * @param {number[]} index - The 1 based index of the element.
 * @returns {string|null} The value of that element, or null when the value is
 *     not indexable.
 */
function elementOfValue (value, sizes, index) {
  let current = value
  for (let dimension = 0; dimension < index.length; dimension++) {
    const elements = arrayLiteralElements(current)
    if (elements === null || elements.length !== sizes[dimension]) {
      return null
    }
    current = elements[index[dimension] - 1]
  }
  return current
}

/**
 * The element an array literal holds at an index, whatever its shape.
 * 
 * @param {string} value - The array literal.
 * @param {number[]} index - The 1 based index, one per dimension.
 * @returns {string|null} The element, or null when the literal has none there.
 */
function literalElement (value, index) {
  let current = String(value).trim()

  // extract the matrix form [1, 2; 3, 4] into the array literal form {{1, 2}, {3, 4}}
  if (/^\[[\s\S]*\]$/.test(current)) {
    current = '{' + splitModArrayString(current.slice(1, -1), ';')
      .map(row => '{' + row + '}').join(',') + '}'
  }

  // iterate through the index to extract the corresponding element
  for (const position of index) {
    const elements = arrayLiteralElements(current)
    if (elements === null || position < 1 || position > elements.length) {
      return null
    }
    current = elements[position - 1]
  }
  return current
}

/**
 * Replaces in place every modification of one element of an array component by
 * the value that element takes.
 *
 * A modification declared `each` applies whole to every element and is left
 * alone, which is what `each` means.
 *
 * @param {Object} modification - The modification to index, mutated in place.
 * @param {number[]} sizes - The size of each dimension of the component.
 * @param {number[]} index - The 1 based index of the element.
 * @returns {void}
 */
function indexModification (modification, sizes, index) {
  if (modification === null || modification === undefined) {
    return
  }
  if (modification.expression?.simple_expression !== undefined) {
    const value = elementOfValue(modification.expression.simple_expression, sizes, index)
    if (value !== null) {
      modification.expression = { simple_expression: value }
    }
  }
  if (Array.isArray(modification.class_modification)) {
    modification.class_modification.forEach(classModification => {
      const elementModification = classModification.element_modification_or_replaceable
      if (elementModification?.each === true) {
        return
      }
      indexModification(elementModification?.element_modification?.modification, sizes, index)
    })
  }
}

/**
 * One element of an array component, as a plain scalar component.
 *
 * The element carries an arrayExpansion property recording where it came from,
 * so that the array the components were written as can still be read off the
 * objects json after the expansion has flattened it away.
 *
 * @param {Object} instance - The array component.
 * @param {string} name - The name of the array component.
 * @param {number[]} sizes - The size of each dimension.
 * @param {number[]} index - The 1 based index of the element.
 * @returns {Object} The element as an instance.
 */
function arrayElement (instance, name, sizes, index) {
  const element = JSON.parse(JSON.stringify(instance))
  const declaration = element.single_component_list.declaration

  declaration.identifier = elementName(name, index)
  delete declaration.array_subscripts
  indexModification(declaration.modification, sizes, index)

  delete element.array_subscripts
  delete element[originalSubscriptsKey]
  element.isVector = false
  element.arraySubscripts = ''
  element.arrayExpansion = { arrayName: name, size: sizes, index }

  return element
}

/**
 * Splits a component reference into the segments it is written as.
 *
 * @param {string} reference - A component reference, blk.u or blk[2].u[1].
 * @returns {Array<{identifier: string, subscripts: number[]|null}>|null} The
 *     segments, or null when the reference does not parse.
 */
function splitReference (reference) {
  const segments = []
  for (const part of splitModArrayString(reference, '.')) {
    const match = /^\s*([A-Za-z_]\w*)\s*(?:\[([^[\]]*)\])?\s*$/.exec(part)
    if (match === null) {
      return null
    }
    let subscripts = null
    if (match[2] !== undefined) {
      subscripts = splitModArrayString(match[2], ',').map(subscript => Number(subscript.trim()))
      if (subscripts.some(subscript => !Number.isInteger(subscript) || subscript < 1)) {
        return null
      }
    }
    segments.push({ identifier: match[1], subscripts })
  }
  return segments.length === 0 ? null : segments
}

/**
 * Renders the segments that follow the head of a component reference.
 *
 * A subscript written in the source - mulSum.u[1] - names one element of an
 * array port and becomes part of the name. A port with no subscript of its own
 * is only indexed when the connection has been expanded around it, which is the
 * broadcast case: an array port of a scalar instance connected to the elements
 * of an array component.
 *
 * @param {Array<Object>} tail - The segments after the head.
 * @param {number[]|null} broadcast - The 1 based index the last segment takes,
 *     one per dimension, or null when the reference is not broadcast.
 * @returns {string} The rendered tail, starting with a dot, or an empty string.
 */
function renderTail (tail, broadcast) {
  return tail.map((segment, position) => {
    if (segment.subscripts !== null) {
      return '.' + elementName(segment.identifier, segment.subscripts)
    }
    if (broadcast !== null && position === tail.length - 1) {
      return '.' + elementName(segment.identifier, broadcast)
    }
    return '.' + segment.identifier
  }).join('')
}

/**
 * How many connections a component reference stands for once the array
 * components it names have been expanded.
 *
 * @param {Array<Object>} segments - The segments of the reference.
 * @param {Map<string, Object>} expanded - The array components, by name.
 * @returns {number} The number of connections.
 */
function referenceArity (segments, expanded) {
  const head = segments[0]
  const array = expanded.get(head.identifier)
  return array !== undefined && head.subscripts === null ? array.names.length : 1
}

/**
 * Renders a component reference as the names of the connections it stands for.
 *
 * @param {Array<Object>} segments - The segments of the reference.
 * @param {Map<string, Object>} expanded - The array components, by name.
 * @param {number} arity - The number of connections the reference must yield.
 * @param {number[][]|null} [broadcast] - The index of the element of the other
 *     side each connection is for, or null when neither side is an array.
 * @returns {string[]|null} One name per connection, or null when the reference
 *     cannot yield that many.
 */
function renderReference (segments, expanded, arity, broadcast = null) {
  const head = segments[0]
  const tail = segments.slice(1)
  const array = expanded.get(head.identifier)

  if (array !== undefined) {
    if (head.subscripts !== null) {
      /* One element of an array component named explicitly: blk[2].u. It stands
         for a single connection, repeated when the other side has several. */
      const name = elementName(head.identifier, head.subscripts) + renderTail(tail, null)
      return new Array(arity).fill(name)
    }
    if (array.names.length !== arity) {
      return null
    }
    return array.names.map(name => name + renderTail(tail, null))
  }

  /* The head names a component this class did not expand, so its subscripts are
     left as they are: the components they would name do not exist. The tail is
     a different matter - it names ports of a class this layer never opens,
     which are only ever referred to by the naming convention. */
  const identifier = head.subscripts === null
    ? head.identifier
    : head.identifier + '[' + head.subscripts.join(',') + ']'
  if (arity === 1) {
    return [identifier + renderTail(tail, null)]
  }
  /* The head is not an array component, yet the connection has been expanded
     around it. Either it is a scalar the elements all connect to, in which case
     the tail is empty and the name repeats, or it is an instance whose port is
     an array, which is referred to by the same convention as the components,
     with the index of the element it is connected to: vecRep.y connected to
     yVec[2, 3] is vecRep.y_1_1 .. vecRep.y_2_3, not vecRep.y_1 .. vecRep.y_6. */
  return Array.from({ length: arity },
    (_, position) => identifier + renderTail(tail, broadcast?.[position] ?? [position + 1]))
}

/**
 * The index of every element of the side of a connection that is an expanded
 * array, for the other side to be indexed the same way.
 *
 * @param {Array<Object>} fromSegments - The segments of one end.
 * @param {Array<Object>} toSegments - The segments of the other end.
 * @param {Map<string, Object>} expanded - The array components, by name.
 * @returns {number[][]|null} One index per element, or null when neither end
 *     is a whole expanded array.
 */
function broadcastIndices (fromSegments, toSegments, expanded) {
  for (const segments of [fromSegments, toSegments]) {
    const array = expanded.get(segments[0].identifier)
    if (array !== undefined && segments[0].subscripts === null) {
      return array.elements.map(element => element.index)
    }
  }
  return null
}

/**
 * Adds a connection to a connections map.
 *
 * @param {Object} connections - The map to add to, mutated in place.
 * @param {string} from - The reference the connection starts at.
 * @param {string} to - The reference the connection ends at.
 * @returns {void}
 */
function addConnection (connections, from, to) {
  if (!(from in connections)) {
    connections[from] = [to]
  } else if (!connections[from].includes(to)) {
    connections[from].push(to)
  }
}

/**
 * Rewrites the connections of a class so that they refer to the components the
 * expansion produced.
 *
 * @param {Object} connections - The connections of the class.
 * @param {Map<string, Object>} expanded - The array components, by name.
 * @param {string} className - The class, for the log messages.
 * @returns {Object} The rewritten connections.
 */
function expandConnections (connections, expanded, className) {
  const expandedConnections = {}

  Object.entries(connections).forEach(([from, tos]) => {
    tos.forEach(to => {
      const fromSegments = splitReference(from)
      const toSegments = splitReference(to)
      if (fromSegments === null || toSegments === null) {
        logger.warn(`Connection ${from} - ${to} of ${className} could not be parsed and is left as it is.`)
        addConnection(expandedConnections, from, to)
        return
      }

      const arity = Math.max(
        referenceArity(fromSegments, expanded), referenceArity(toSegments, expanded))
      const broadcast = broadcastIndices(fromSegments, toSegments, expanded)
      const fromNames = renderReference(fromSegments, expanded, arity, broadcast)
      const toNames = renderReference(toSegments, expanded, arity, broadcast)
      if (fromNames === null || toNames === null) {
        logger.warn(`Connection ${from} - ${to} of ${className} connects arrays of different sizes and is left as it is.`)
        addConnection(expandedConnections, from, to)
        return
      }

      fromNames.forEach((fromName, position) => {
        addConnection(expandedConnections, fromName, toNames[position])
      })
    })
  })

  return expandedConnections
}

/**
 * Removes the components a conditional expression evaluated to false, and the
 * connections that referred to them.
 *
 * A guard that did evaluate has done its work by the time the objects json is
 * written, so it is removed from the components that were kept. A guard that
 * did not evaluate is left alone, along with the component it guards: a
 * component is only dropped when it is known not to be instantiated.
 *
 * @param {Object} allObjects - The instances and connections of one class,
 *     mutated in place.
 * @param {string} className - The class, for the log messages.
 * @returns {void}
 */
function removeDisabledComponents (allObjects, className) {
  const disabled = new Set()

  Object.entries(allObjects.instances).forEach(([name, instance]) => {
    if (instance.type !== 'element') {
      return
    }
    const condition = conditionValue(instance)
    if (condition === false) {
      disabled.add(name)
      delete allObjects.instances[name]
      logger.debug(`Component ${name} of ${className} is not instantiated and is dropped.`)
    } else if (condition === true) {
      delete instance.single_component_list.condition_attribute
    }
  })

  if (disabled.size === 0) {
    return
  }
  const connections = allObjects.requiredReferences?.connections
  if (connections === undefined || connections === null) {
    return
  }
  const refersToDisabled = reference => disabled.has(splitReference(reference)?.[0]?.identifier)
  Object.entries(connections).forEach(([from, tos]) => {
    if (refersToDisabled(from)) {
      delete connections[from]
      return
    }
    const kept = tos.filter(to => !refersToDisabled(to))
    if (kept.length === 0) {
      delete connections[from]
    } else {
      connections[from] = kept
    }
  })
}

/**
 * Expands the array components of one class into one plain component per
 * element, and rewrites the connections to match.
 *
 * This runs on the objects of a class once its expressions have been evaluated,
 * for two reasons: the size of an array is an expression such as [nZon], and a
 * component whose conditional guard turned out to be false must be dropped
 * before it is expanded rather than expanded and then dropped n times.
 *
 * Array *parameters* are expanded too, into one scalar parameter per element:
 * `parameter Real k[3] = {1, 2, 3}` becomes `k_1 = 1`, `k_2 = 2`, `k_3 = 3`.
 * Nothing connects to a parameter and its elements have already been
 * distributed to the components that use them by this point, so this is not
 * needed to resolve the class. It is done because the point of flattening is
 * that the output names no arrays at all: a consumer that has no arrays cannot
 * read `k = {1, 2, 3}` any more than it can read a vector port.
 *
 * @param {Object} allObjects - The instances and connections of one class, in
 *     the shape extractFromLongClassSpecifier returns, mutated in place.
 * @param {string} [className] - The class, for the log messages.
 * @returns {Object} The same object, expanded.
 */
function expandArrays (allObjects, className = 'the class') {
  if (allObjects === null || allObjects === undefined ||
    allObjects.instances === null || allObjects.instances === undefined) {
    return allObjects
  }

  // done in-place 
  removeDisabledComponents(allObjects, className)

  /* The components to expand are collected before anything is rewritten, so
     that a name a component would take can be checked against every name the
     class already holds. */
  const expanded = new Map()
  Object.entries(allObjects.instances).forEach(([name, instance]) => {
    /* Every component, whatever it is declared as: a parameter of a primitive
       type is as much an array to be flattened as a port or a block, and
       `arraySizes` is what decides, by returning null for anything scalar. */
    if (instance.type !== 'element') {
      return
    }
    const sizes = arraySizes(instance)
    if (sizes === null) {
      /*  The component is not an array, or its dimensions did not evaluate to literal sizes.
       It is left as it is, and a warning is logged when it is a vector that could not be expanded. */
      const isValue = ['parameter', 'constant'].some(
        prefix => (instance.type_prefix ?? '').includes(prefix))
      if (instance.isVector === true && !isValue) {

        logger.warn(`Component ${name} of ${className} has dimensions that did not evaluate and is left as an array. Instance: ${JSON.stringify(instance)}`)
      }
      return
    }
    const elements = indices(sizes).map(index => ({ index, name: elementName(name, index) }))
    const taken = elements.map(element => element.name)
      .filter(name => name in allObjects.instances)
    if (taken.length > 0) {
      logger.error(`Expanding the array component ${name} of ${className} would overwrite ${taken.join(', ')}. It is left as an array.`)
      return
    }
    expanded.set(name, { sizes, elements, names: elements.map(element => element.name) })
  })

  if (expanded.size > 0) {
    /* Rebuilt rather than edited so that the elements sit where the array they
       came from sat, instead of at the end of the map. */
    const instances = {}
    Object.entries(allObjects.instances).forEach(([name, instance]) => {
      const array = expanded.get(name)
      if (array === undefined) {
        instances[name] = instance
        return
      }
      array.elements.forEach(element => {
        instances[element.name] = arrayElement(instance, name, array.sizes, element.index)
      })
    })
    allObjects.instances = instances
  }

  /* Run even when this class holds no array component of its own: a connection
     to one element of an array port - mulSum.u[1] - still has to be written the
     way the expanded components are named. */
  if (allObjects.requiredReferences?.connections !== undefined &&
    allObjects.requiredReferences.connections !== null) {
    allObjects.requiredReferences.connections = expandConnections(
      allObjects.requiredReferences.connections, expanded, className)
  }

  return allObjects
}

module.exports.expandArrays = expandArrays
module.exports.removeDisabledComponents = removeDisabledComponents
module.exports.expandConnections = expandConnections
module.exports.splitModArrayString = splitModArrayString
module.exports.splitReference = splitReference
module.exports.arraySizes = arraySizes
module.exports.elementName = elementName
module.exports.literalElement = literalElement
module.exports.addConnection = addConnection
module.exports.originalSubscriptsKey = originalSubscriptsKey
