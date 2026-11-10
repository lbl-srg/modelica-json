const path = require('path')
const jq = require('./jsonquery.js')
const mj = require('./modelicaToJSON.js')
const pa = require('./parser.js')
const ut = require('./util.js')

const CDL_SCHEMA = path.join(__dirname, '..', 'schema-cdl.json')

// Functions allowed in parameter assignments, see table 7.2 of the CDL specification.
const ALLOWED_FUNCTIONS = new Set(['abs', 'sign', 'sqrt', 'div', 'mod', 'rem', 'ceil', 'floor',
  'integer', 'min', 'max', 'sum', 'cat', 'fill', 'size'])

// Native data types of section 7.4.1, other than enumerations.
const PREDEFINED_TYPES = ['Real', 'Integer', 'Boolean', 'String']

/**
 * Classes that are resolved during a check, by file, with the JSON representation of each file.
 * See 'checkCdlCompliance'.
 */
class ClassResolver {
  constructor (jsons) {
    this.files = new Map(jsons.map(json => [path.resolve(json.fullMoFilePath), json]))
  }

  /**
   * Get the JSON representation of a file, parsing it if it is not known yet.
   *
   * @param {string} moFile path of the Modelica file
   * @returns {Object} simplified JSON representation
   */
  getFile (moFile) {
    const key = path.resolve(moFile)
    if (!this.files.has(key)) {
      this.files.set(key, jq.simplifyModelicaJSON(mj.toJSON(moFile)))
    }
    return this.files.get(key)
  }

  /**
   * Find a class used in another class.
   *
   * A class may be stored in its own file, or inside the file of an enclosing package,
   * such as the classes of a package stored in one file. In the latter case, the returned
   * representation only contains this class, with the 'within' clause of the enclosing package.
   *
   * @param {string} name class name, as written in the class that uses it
   * @param {Object} json simplified JSON representation of the class that uses it
   * @returns {{json: Object, ownFile: boolean}|null} representation of the class, and whether
   *     it is stored in its own file; null if it cannot be found
   */
  find (name, json) {
    return this.findInFile(name, json) ?? this.findInLibraries(name, json)
  }

  /**
   * Find a class in the file of the class that uses it, looking up the name in the enclosing
   * classes of this file, from the innermost one, as for the classes of a package stored in one file.
   *
   * @param {string} name class name, as written in the class that uses it
   * @param {Object} json simplified JSON representation of the class that uses it
   * @returns {{json: Object, ownFile: boolean}|null} see 'find'
   */
  findInFile (name, json) {
    const fileJson = this.getFile(json.fullMoFilePath)
    const fileClass = ut.getClassNameFromJson(fileJson)
    const scopes = `${json.within}.${getIdentifier(json.stored_class_definitions[0])}`.split('.')
    for (let i = scopes.length; i > 0; i--) {
      const fullName = [...scopes.slice(0, i), name].join('.')
      if (fullName.startsWith(`${fileClass}.`)) {
        const found = getNestedClass(fileJson, fullName.slice(fileClass.length + 1).split('.'))
        if (found !== null) {
          return found
        }
      }
    }
    return null
  }

  /**
   * Find a class in the libraries, see 'ut.searchPath'.
   *
   * @param {string} name class name, as written in the class that uses it
   * @param {Object} json simplified JSON representation of the class that uses it
   * @returns {{json: Object, ownFile: boolean}|null} see 'find'
   */
  findInLibraries (name, json) {
    const moFile = ut.searchPath([name], json.within, json.fullMoFilePath)[0]
    if (moFile === undefined) {
      return null
    }
    const fileJson = this.getFile(moFile)
    // Components of the name below the class stored in the file
    const parts = name.split('.')
    const index = parts.lastIndexOf(getIdentifier(fileJson.stored_class_definitions[0]))
    return getNestedClass(fileJson, index === -1 ? [] : parts.slice(index + 1))
  }
}

/**
 * Get a class stored in a file, possibly inside the class stored in this file.
 *
 * @param {Object} fileJson simplified JSON representation of the file
 * @param {string[]} nested identifiers of the enclosing classes and of the class,
 *     below the class stored in the file; empty for this class
 * @returns {{json: Object, ownFile: boolean}|null} representation of the class, with the
 *     'within' clause of its enclosing class, and whether it is stored in its own file;
 *     null if it is not found
 */
function getNestedClass (fileJson, nested) {
  if (nested.length === 0) {
    return { json: fileJson, ownFile: true }
  }
  let classDefinition = fileJson.stored_class_definitions[0]
  let within = ut.getClassNameFromJson(fileJson)
  for (const [i, identifier] of nested.entries()) {
    const comp = classDefinition.class_specifier.long_class_specifier?.composition
    const { pubEleLis, proEleLis } = comp ? pa.getElementLists(comp) : { pubEleLis: [], proEleLis: [] }
    classDefinition = pubEleLis.concat(proEleLis).map(obj => obj.class_definition)
      .find(obj => obj && getIdentifier(obj) === identifier)
    if (classDefinition === undefined) {
      return null
    }
    if (i < nested.length - 1) {
      within = `${within}.${identifier}`
    }
  }
  return {
    json: { within, stored_class_definitions: [classDefinition], fullMoFilePath: fileJson.fullMoFilePath },
    ownFile: false
  }
}

/**
 * Get the identifier of a class definition.
 *
 * @param {Object} classDefinition class definition of a simplified JSON representation
 * @returns {string} identifier
 */
function getIdentifier (classDefinition) {
  const specifier = classDefinition.class_specifier
  return (specifier.long_class_specifier ?? specifier.short_class_specifier).identifier
}

/**
 * Get the composition of a class.
 *
 * @param {Object} json simplified JSON representation of a class
 * @returns {Object|undefined} composition, undefined for a short class definition
 */
function getComposition (json) {
  return json.stored_class_definitions[0].class_specifier.long_class_specifier?.composition
}

/**
 * Get the elements of a class.
 *
 * @param {Object} json simplified JSON representation of a class
 * @returns {{pubEleLis: Array, proEleLis: Array}} public and protected elements
 */
function getElements (json) {
  const comp = getComposition(json)
  return comp ? pa.getElementLists(comp) : { pubEleLis: [], proEleLis: [] }
}

/**
 * Get the kind of a class, as defined by the CDL specification.
 *
 * @param {Object} json simplified JSON representation of a class
 * @returns {string} 'cdl connector' for a connector of the CDL package (section 7.8),
 *     'elementary' for another class of the CDL package (section 7.6),
 *     'extension' for an extension block (section 7.13), 'enumeration' (section 7.4.1.5),
 *     'composite' for any other block (section 7.12), 'package',
 *     or the class prefixes for any other class, such as 'model'
 */
function getClassKind (json) {
  const classDefinition = json.stored_class_definitions[0]
  const prefixes = classDefinition.class_prefixes
  if (prefixes === 'type' && classDefinition.class_specifier.short_class_specifier?.value?.enum_list) {
    return 'enumeration'
  }
  if (ut.isCdlElementaryClass(ut.getClassNameFromJson(json))) {
    return prefixes === 'connector' ? 'cdl connector' : 'elementary'
  }
  if (ut.isExtensionBlock(json)) {
    return 'extension'
  }
  if (prefixes === 'block' || prefixes === 'partial block') {
    return 'composite'
  }
  if (prefixes === 'package' || prefixes === 'partial package') {
    return 'package'
  }
  return prefixes
}

/**
 * Get the direction of a connector of a class.
 *
 * @param {Object} json simplified JSON representation of a class
 * @param {string} connector name of the connector
 * @param {ClassResolver} resolver classes of the check
 * @param {Set<string>} visited names of the classes already visited, to stop on cycles
 * @returns {string|null} 'input', 'output', or null if this is unknown
 */
function getConnectorDirection (json, connector, resolver, visited = new Set()) {
  const className = ut.getClassNameFromJson(json)
  if (visited.has(className)) {
    return null
  }
  visited.add(className)
  const { pubEleLis } = getElements(json)
  const clause = pubEleLis.map(obj => obj.component_clause)
    .find(obj => obj?.component_list.some(com => com.declaration.identifier === connector))
  if (clause) {
    const connectorClass = resolver.find(clause.type_specifier, json)?.json
    return connectorClass?.stored_class_definitions[0].class_specifier.short_class_specifier?.value?.base_prefix ?? null
  }
  for (const obj of pubEleLis.filter(obj => obj.extends_clause)) {
    const extended = resolver.find(obj.extends_clause.name, json)?.json
    const direction = extended ? getConnectorDirection(extended, connector, resolver, visited) : null
    if (direction !== null) {
      return direction
    }
  }
  return null
}

/**
 * Get the classes of the instances annotated with '__cdl(extensionBlock=true)'.
 * These extension blocks may be external, such as an FMU, so they may have no Modelica file.
 *
 * @param {Object} json simplified JSON representation of a class
 * @returns {string[]} class names
 */
function getExternalExtensionBlocks (json) {
  const { pubEleLis, proEleLis } = getElements(json)
  return pubEleLis.concat(proEleLis).map(obj => obj.component_clause).filter(Boolean)
    .filter(obj => obj.component_list.some(com => ut.hasExtensionBlockAnnotation(com.description?.annotation)))
    .map(obj => obj.type_specifier)
}

/**
 * Check the classes of the instances of a block.
 * - A parameter (section 7.4.2) and a constant (section 7.4.3) are instances of a native data type:
 *   'Real', 'Integer', 'Boolean', 'String' or an enumeration (section 7.4.1).
 * - Any other instance is a connector, an elementary block, a composite block (section 7.12),
 *   or an extension block (section 7.13). Instances of a predefined type that are neither
 *   parameters nor constants are rejected by the schema.
 * The composite blocks used are returned to be checked.
 *
 * @param {Object} json simplified JSON representation of a class
 * @param {ClassResolver} resolver classes of the check
 * @returns {{errors: string[], used: Object[]}} error messages, and the composite blocks used
 */
function checkInstances (json, resolver) {
  const errors = []
  const used = []
  const external = getExternalExtensionBlocks(json)
  const isChecked = name => !external.includes(name)
  const { pubEleLis, proEleLis } = getElements(json)
  const clauses = pubEleLis.concat(proEleLis).map(obj => obj.component_clause).filter(Boolean)

  // Parameters and constants
  clauses.filter(clause => /\b(parameter|constant)\b/.test(clause.type_prefix ?? '')).forEach((clause) => {
    const name = clause.type_specifier
    if (PREDEFINED_TYPES.includes(name) || !isChecked(name)) {
      return
    }
    const found = resolver.find(name, json)
    if (found === null) {
      errors.push(`Cannot find class ${name}`)
    } else if (getClassKind(found.json) !== 'enumeration') {
      const variability = clause.type_prefix.match(/\b(parameter|constant)\b/)[1]
      const identifiers = clause.component_list.map(com => com.declaration.identifier).join(', ')
      errors.push(`The ${variability} ${identifiers} is an instance of ${name}, which is not a native data type ` +
        `(${variability === 'parameter' ? '7.4.2' : '7.4.3'})`)
    }
  })

  // Other instances, with the classes of the constraining clauses and of the redeclarations
  const dataTypes = clauses.filter(clause => /\b(parameter|constant)\b/.test(clause.type_prefix ?? ''))
    .map(clause => clause.type_specifier)
  const extended = pubEleLis.concat(proEleLis).filter(obj => obj.extends_clause).map(obj => obj.extends_clause.name)
  pa.getUsedClassNames(json)
    .filter(name => !dataTypes.includes(name) && !extended.includes(name) && !PREDEFINED_TYPES.includes(name))
    .filter(isChecked).forEach((name) => {
      const found = resolver.find(name, json)
      if (found === null) {
        errors.push(`Cannot find class ${name}`)
        return
      }
      const kind = getClassKind(found.json)
      if (kind === 'composite') {
        used.push(found.json)
        if (!found.ownFile) {
          errors.push(`${name} is a composite block that is not stored in its own file (7.12)`)
        }
      } else if (!['cdl connector', 'elementary', 'extension'].includes(kind)) {
        errors.push(`${name} is not a CDL connector, an elementary block, a composite block or an extension block, ` +
          'so it cannot be instantiated in a block (7.12, 7.13)')
      }
    })
  return { errors, used }
}

/**
 * Check the connectors of a block: they must be public (section 7.8), and their value
 * is set by a connect statement, not in their declaration (section 7.10).
 *
 * @param {Object} json simplified JSON representation of a class
 * @param {ClassResolver} resolver classes of the check
 * @returns {string[]} error messages
 */
function checkConnectors (json, resolver) {
  const { pubEleLis, proEleLis } = getElements(json)
  const isConnector = (clause) => {
    const found = resolver.find(clause.type_specifier, json)
    return found !== null && getClassKind(found.json) === 'cdl connector'
  }
  const errors = []
  pubEleLis.concat(proEleLis).map(obj => obj.component_clause).filter(Boolean)
    .filter(clause => !PREDEFINED_TYPES.includes(clause.type_specifier) && isConnector(clause))
    .forEach((clause) => {
      const isProtected = proEleLis.some(obj => obj.component_clause === clause)
      clause.component_list.forEach((com) => {
        const identifier = com.declaration.identifier
        if (isProtected) {
          errors.push(`The connector ${identifier} is not in a public section (7.8)`)
        }
        if (com.declaration.modification?.expression !== undefined) {
          errors.push(`The value of the connector ${identifier} is set in its declaration (7.10)`)
        }
      })
    })
  return errors
}

/**
 * Check the classes extended by a block: a composite block can only extend another
 * composite block (section 7.15). The extended classes are returned to be checked.
 *
 * @param {Object} json simplified JSON representation of a class
 * @param {ClassResolver} resolver classes of the check
 * @returns {{errors: string[], used: Object[]}} error messages, and the composite blocks extended
 */
function checkExtends (json, resolver) {
  const errors = []
  const used = []
  const { pubEleLis, proEleLis } = getElements(json)
  pubEleLis.concat(proEleLis).filter(obj => obj.extends_clause).map(obj => obj.extends_clause.name)
    .forEach((name) => {
      const found = resolver.find(name, json)
      if (found === null) {
        errors.push(`Cannot find class ${name}`)
        return
      }
      const kind = getClassKind(found.json)
      if (kind !== 'composite') {
        errors.push(`${name} is not a composite block, so it cannot be extended (7.15)`)
        return
      }
      used.push(found.json)
      if (!found.ownFile) {
        errors.push(`${name} is a composite block that is not stored in its own file (7.12)`)
      }
    })
  return { errors, used }
}

/**
 * Get the names of the functions called in a string expression.
 * Some expressions are stored as strings in the simplified JSON representation.
 *
 * @param {string} expression expression
 * @returns {string[]} function names
 */
function getCalledFunctions (expression) {
  const withoutStrings = expression.replace(/"(?:[^"\\]|\\.)*"/g, '""')
  return [...withoutStrings.matchAll(/([A-Za-z_][\w.]*)\s*\(/g)].map(match => match[1])
}

/**
 * Collect the names of the functions called in the expressions of an object.
 * Annotations and descriptions are skipped: they do not hold expressions of the class.
 *
 * @param {*} obj part of a simplified JSON representation
 * @param {Set<string>} functions names of the functions found
 */
function collectFunctions (obj, functions) {
  if (Array.isArray(obj)) {
    obj.forEach(item => collectFunctions(item, functions))
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (key === 'annotation' || key === 'description' || value === undefined) {
        return
      }
      if (key === 'function_call') {
        functions.add(value.name)
        collectFunctions(value.arguments, functions)
      } else if (typeof value === 'string' && (key === 'simple_expression' || key === 'name')) {
        getCalledFunctions(value).forEach(name => functions.add(name))
      } else {
        collectFunctions(value, functions)
      }
    })
  }
}

/**
 * Check that the expressions of a class only call the functions of table 7.2
 * of the CDL specification (section 7.7.1).
 *
 * @param {Object} json simplified JSON representation of a class
 * @returns {string[]} error messages
 */
function checkFunctions (json) {
  const { pubEleLis, proEleLis } = getElements(json)
  const functions = new Set()
  collectFunctions(pubEleLis.concat(proEleLis), functions)
  return [...functions].filter(name => !ALLOWED_FUNCTIONS.has(name))
    .map(name => `The function ${name} is not allowed in CDL (7.7.1)`)
}

/**
 * Get the text of a component reference, such as 'a.b[1]'.
 *
 * @param {Array} reference component reference
 * @returns {string} text
 */
function getReferenceText (reference) {
  return reference.filter(item => item.identifier).map((item) => {
    const subscripts = item.array_subscripts ? JSON.stringify(item.array_subscripts) : ''
    return item.identifier + subscripts
  }).join('.')
}

/**
 * Get the kind of a connector in a connection.
 * An outside connector belongs to the class itself, an inside connector to one of its instances.
 *
 * @param {Array} reference component reference
 * @param {Object} json simplified JSON representation of a class
 * @param {ClassResolver} resolver classes of the check
 * @returns {{inside: boolean, direction: string|null}} location, and direction of the
 *     connector: 'input', 'output', or null if this is unknown
 */
function getConnectorKind (reference, json, resolver) {
  const names = reference.filter(item => item.identifier).map(item => item.identifier)
  if (names.length === 1) {
    return { inside: false, direction: getConnectorDirection(json, names[0], resolver) }
  }
  const { pubEleLis, proEleLis } = getElements(json)
  const clause = pubEleLis.concat(proEleLis).map(obj => obj.component_clause)
    .find(obj => obj?.component_list.some(com => com.declaration.identifier === names[0]))
  const instanceClass = (names.length === 2 && clause) ? resolver.find(clause.type_specifier, json)?.json : undefined
  return { inside: true, direction: instanceClass ? getConnectorDirection(instanceClass, names[1], resolver) : null }
}

/**
 * Check if the instance at the start of a component reference is conditional.
 * Removing a conditional instance also removes its connections (section 7.7.4).
 *
 * @param {Array} reference component reference
 * @param {Object} json simplified JSON representation of a class
 * @returns {boolean} true if the instance is conditional
 */
function isConditional (reference, json) {
  const { pubEleLis, proEleLis } = getElements(json)
  const identifier = reference.find(item => item.identifier)?.identifier
  return pubEleLis.concat(proEleLis).flatMap(obj => obj.component_clause?.component_list ?? [])
    .some(com => com.declaration.identifier === identifier && com.condition_attribute !== undefined)
}

/**
 * Get the connect statements of a class.
 *
 * @param {Object} json simplified JSON representation of a class
 * @returns {Array<{from: Array, to: Array}>} connect clauses
 */
function getConnections (json) {
  return (getComposition(json)?.element_sections ?? []).flatMap(obj => obj.equation_section?.equation ?? [])
    .map(obj => obj.connect_clause).filter(Boolean)
}

/**
 * Get the connection sets of a class, that is the groups of connectors joined by connect statements.
 * Connections to conditional instances are left out, as whether
 * they exist depends on parameter values, which are not evaluated here.
 *
 * @param {Object} json simplified JSON representation of a class
 * @returns {Array<Array<Array>>} component references of each connection set
 */
function getConnectionSets (json) {
  const sets = new Map() // Connection set of each connector, as a map from text to reference
  getConnections(json)
    .filter(obj => !isConditional(obj.from, json) && !isConditional(obj.to, json))
    .forEach(({ from, to }) => {
      const merged = new Map([[getReferenceText(from), from], [getReferenceText(to), to]])
      ;[...merged.keys()].forEach((text) => {
        (sets.get(text) ?? new Map()).forEach((reference, key) => merged.set(key, reference))
      })
      merged.forEach((reference, text) => sets.set(text, merged))
    })
  return [...new Set(sets.values())].map(set => [...set.values()])
}

/**
 * Check the connections of a class: two inside input connectors cannot be connected
 * (section 7.10), and each connection set has at most one signal source, that is an outside
 * input connector or an inside output connector, so that every input connector is connected
 * to exactly one output connector (section 7.16).
 *
 * @param {Object} json simplified JSON representation of a class
 * @param {ClassResolver} resolver classes of the check
 * @returns {string[]} error messages
 */
function checkConnections (json, resolver) {
  const kind = reference => getConnectorKind(reference, json, resolver)
  const isInsideInput = (reference) => {
    const { inside, direction } = kind(reference)
    return inside && direction === 'input'
  }
  const isSignalSource = (reference) => {
    const { inside, direction } = kind(reference)
    return direction === (inside ? 'output' : 'input')
  }
  const insideInputs = getConnections(json)
    .filter(({ from, to }) => isInsideInput(from) && isInsideInput(to))
    .map(({ from, to }) => `The input connectors ${getReferenceText(from)} and ${getReferenceText(to)} ` +
      'of instances are connected together (7.10)')
  const sources = getConnectionSets(json)
    .map(set => set.filter(isSignalSource).map(getReferenceText))
    .filter(names => names.length > 1)
    .map(names => `An input connector is connected to more than one output connector: ${names.join(', ')} (7.16)`)
  return insideInputs.concat(sources)
}

/**
 * Check a class on its own.
 *
 * @param {Object} json simplified JSON representation of a class
 * @param {ClassResolver} resolver classes of the check
 * @param {Object} options see 'checkCdlCompliance'
 * @returns {{errors: string[], used: Object[]}} error messages, and the composite blocks
 *     used or extended, which must also be checked
 */
function checkClass (json, resolver, { schema }) {
  const schemaErrors = ut.getSchemaErrors(json, schema)
  const errors = (schemaErrors === null ? [] : [schemaErrors]).concat(checkFunctions(json))
  // The specification has no rule on the content of packages.
  if (getClassKind(json) === 'package') {
    return { errors, used: [] }
  }
  const instances = checkInstances(json, resolver)
  const extended = checkExtends(json, resolver)
  return {
    errors: errors.concat(instances.errors, extended.errors, checkConnectors(json, resolver), checkConnections(json, resolver)),
    used: instances.used.concat(extended.used)
  }
}

/**
 * Check the CDL compliance of classes, with the schema and with the rules that
 * a schema cannot express. This is the only definition of CDL compliance.
 *
 * The classes stored in 'moFiles' are checked, and so are the composite blocks they use or
 * extend, recursively. Elementary blocks and extension blocks are exempt (sections 7.3 and 7.13),
 * and the classes they use are not followed. The class of each instance is checked against the
 * kinds of classes that the specification allows, and the composite blocks used are checked by
 * their content, so a class of another library is checked like any other class.
 *
 * 'jsons' are the simplified JSON representations already parsed, as returned by 'pa.getJsons'
 * with the 'json' output and the 'cdl' mode. They must contain each file of 'moFiles', except
 * those that 'pa.getJsons' leaves out, see 'pa.isLeftOutOfCdlCheck'. The used classes are parsed
 * if they are not in 'jsons'.
 *
 * To leave out classes, leave out their files from 'moFiles', as app.js does for '--exclude'.
 * A used class is always checked, whatever its name: a class that uses a non-compliant class
 * is not compliant, even if the latter matches an exclusion.
 *
 * @param {string[]} moFiles paths of the Modelica files of the classes to check
 * @param {Array<Object>} jsons simplified JSON representations, as returned by 'pa.getJsons'
 * @param {Object} [options]
 * @param {string} [options.schema] path of the schema, by default 'schema-cdl.json',
 *     which checks the specification only. 'schema-cdl-mbl.json' adds the project rules.
 * @returns {Array<{className: string, message: string}>} errors, empty if all classes are compliant
 * @throws {Error} if a file of 'moFiles' has no JSON representation in 'jsons'
 */
function checkCdlCompliance (moFiles, jsons, { schema = CDL_SCHEMA } = {}) {
  const options = { schema }
  const resolver = new ClassResolver(jsons)
  const roots = moFiles.filter(moFile => !pa.isLeftOutOfCdlCheck(moFile)).map((moFile) => {
    const json = resolver.files.get(path.resolve(moFile))
    if (json === undefined) {
      throw new Error(`The JSON representation of ${moFile} is missing, so its CDL compliance cannot be checked.`)
    }
    return json
  })
  const errors = []
  const checked = new Set()
  const queue = [...roots]
  while (queue.length > 0) {
    const json = queue.shift()
    const className = ut.getClassNameFromJson(json)
    if (checked.has(className) || ['elementary', 'extension'].includes(getClassKind(json))) {
      continue
    }
    checked.add(className)
    const result = checkClass(json, resolver, options)
    result.errors.forEach(message => errors.push({ className, message }))
    queue.push(...result.used)
  }
  return errors
}

/**
 * Answer the question "are these classes CDL-compliant?", without the reasons.
 *
 * This is the function to use to take a decision based on CDL compliance, such as choosing what
 * to export to CXF (issue 339). It is not called by app.js yet: app.js prints the
 * errors, so it calls 'checkCdlCompliance', on which this function is based.
 *
 * The result applies to the classes of 'moFiles' and to the composite blocks they use,
 * together: it is false if any of them is not compliant. Parse the classes first with
 * 'pa.getJsons', with the 'json' output and the 'cdl' mode, which also writes the JSON files:
 *
 *   const jsons = pa.getJsons(moFiles, 'json', outDir, false, false, false, 'cdl')
 *   if (cc.isCdlCompliant(moFiles, jsons)) { ... }
 *
 * By default, this checks the CDL specification only, with 'schema-cdl.json'. To add the project
 * rules of the Modelica Buildings Library, pass the schema:
 *
 *   cc.isCdlCompliant(moFiles, jsons, { schema: 'path/to/schema-cdl-mbl.json' })
 *
 * To leave out classes, such as validation models, leave out their files, as '--exclude' does:
 *
 *   const isExcluded = ut.getExcludeFilter(['**.Validation'])
 *   const checkedFiles = moFiles.filter(moFile => !isExcluded(ut.getClassName(moFile)))
 *   const jsons = pa.getJsons(checkedFiles, 'json', outDir, false, false, false, 'cdl')
 *   cc.isCdlCompliant(checkedFiles, jsons)
 *
 * The classes used by the checked classes are always checked, whatever their name.
 *
 * @param {string[]} moFiles paths of the Modelica files of the classes to check
 * @param {Array<Object>} jsons simplified JSON representations, as returned by 'pa.getJsons'
 * @param {Object} [options] 'schema', see 'checkCdlCompliance'
 * @returns {boolean} true if all classes are CDL-compliant
 * @throws {Error} if a file of 'moFiles' has no JSON representation in 'jsons'
 */
function isCdlCompliant (moFiles, jsons, options) {
  return checkCdlCompliance(moFiles, jsons, options).length === 0
}

module.exports.checkCdlCompliance = checkCdlCompliance
module.exports.isCdlCompliant = isCdlCompliant
