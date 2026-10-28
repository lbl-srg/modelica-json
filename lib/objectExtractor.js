const arrayExpansion = require('./arrayExpansion.js')
const elementaryFlattener = require('./elementaryFlattener.js') 
const ut = require('./util.js')
const json2moExpression = require('../json2mo/expression.js')
const expressionEvaluation = require('./expressionEvaluation.js')

const logger = require('winston') // use the default logger

const originalValueKey = '_originalValue'
const originalModificationKey = '_originalModification'
/* Declared beside the expansion, which is what erases it. */
const originalSubscriptsKey = arrayExpansion.originalSubscriptsKey

// TODO: change structure to put all instances in "defined_instances" keyword

/*
{
    "instances": {
      "instance_a": {
        "type": "element",
        "type_specifier": "...",
        "type_prefix": "...",
        "annotation": {},
        "class_modification": {},
        "long_class_specifier_identifier": "..."
      },
      ...
    },
    "requiredReferences": {
        "extends_clause": [
            {
                "name": ...,
                "long_class_specifier_identifier": ..
                "class_modification": {},
                "annotation": {}
            }
        ],
        "import_clause": [
            {
                ...
            }
        ],
        "connections": {
          "instance_a": ["instance_b", "instance_c", ...],
          "instance_b": [...]
        }
    }
}

*/
function updateRequiredReferences (requiredReferences, newRequiredReferences) {
  if (newRequiredReferences !== null && newRequiredReferences !== undefined) {
    if ('extends_clause' in newRequiredReferences) {
      if ('extends_clause' in requiredReferences) {
        requiredReferences.extends_clause = requiredReferences.extends_clause.concat(newRequiredReferences.extends_clause)
      } else {
        requiredReferences.extends_clause = newRequiredReferences.extends_clause.concat([])
      }
    }
    if ('import_clause' in newRequiredReferences) {
      if ('import_clause' in requiredReferences) {
        requiredReferences.import_clause = requiredReferences.import_clause.concat(newRequiredReferences.import_clause)
      } else {
        requiredReferences.import_clause = newRequiredReferences.import_clause.concat([])
      }
    }
    if ('connections' in newRequiredReferences) {
      if ('connections' in requiredReferences) {
        requiredReferences.connections = updateConnections(requiredReferences.connections, newRequiredReferences.connections)
      } else {
        requiredReferences.connections = Object.assign({}, newRequiredReferences.connections)
      }
    }
  }
  return requiredReferences
}

function updateConnections (connections, newConnections) {
  if (newConnections !== null && newConnections !== undefined) {
    for (const element in newConnections) {
      if (!(element in connections)) {
        connections[element] = newConnections[element].concat([])
      } else {
        newConnections[element].forEach(connectedElement => {
          if (!(connectedElement in connections[element])) {
            connections[element] = connections[element].concat([connectedElement])
          }
        })
      }
    }
  }
  return connections
}

function extractAllObjects (jsonOutput, within = null, mode = 'cdl', jsons = null, userValues = null,
  withDefaults = false, evaluateExpressions = false, flattenArrays = false) {
  let instances = {}
  let requiredReferences = {}
  if (within === null) {
    if (jsonOutput.within === null || jsonOutput.within === undefined) {
      within = null
    } else {
      within = jsonOutput.within
    }
  }
  const fullMoFilePath = jsonOutput.fullMoFilePath

  const classDefinitions = jsonOutput.stored_class_definitions
  for (let i = 0; i < classDefinitions.length; i++) {
    let longClassSpecifier = null
    let shortClassSpecifier = null
    let derClassSpecifier = null
    let identifier = null

    const classDefinition = classDefinitions[i]
    const classSpecifier = classDefinition.class_specifier
    const classPrefixes = classDefinition.class_prefixes
    if ('long_class_specifier' in classSpecifier) {
      longClassSpecifier = classSpecifier.long_class_specifier

      /* The four flag combinations:
           eval off, flatten off -> evalContext null; nothing evaluated, nothing expanded
           eval on,  flatten off -> evaluate, drop disabled components, keep the values
           eval off, flatten on  -> evaluate *only so the arrays have sizes*, expand,
                                    then put the source text back on what's left
           eval on,  flatten on  -> evaluate, expand, keep the values
     */
      const evalContext = evaluateExpressions || flattenArrays
        ? evaluationContext(
          Object.assign({}, classDefinition, { within, fullMoFilePath }), jsons, userValues,
          withDefaults, evaluateExpressions)
        : null

      const newAllObjects = extractFromLongClassSpecifier(longClassSpecifier, fullMoFilePath, classPrefixes, within, evalContext)

      if (flattenArrays) {
        // independent of the evaluation, expand arrays if the flag is on
        // only a sequence warns about arrays left unexpanded, as a class it instantiates gets its sizes from it
        arrayExpansion.expandArrays(newAllObjects, longClassSpecifier.identifier, withDefaults)
      } else if (evalContext !== null) {
        // if the arrays aren't expanded but if the evaluation context exists, remove disabled array components
        arrayExpansion.removeDisabledComponents(newAllObjects, longClassSpecifier.identifier)
      }
      if (evalContext !== null) {
        // clean up the evaluation markers left by the evaluation process
        resolveEvaluationMarkers(newAllObjects, evaluateExpressions)
      }
      // merge the newly extracted objects into the main instances and required references
      instances = Object.assign({}, instances, newAllObjects.instances)
      requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
    }
    if ('short_class_specifier' in classSpecifier) {
      shortClassSpecifier = classSpecifier.short_class_specifier
      identifier = shortClassSpecifier.identifier
      const shortClassSpeciiferValue = shortClassSpecifier.value
      let name = null

      if ('name' in shortClassSpeciiferValue && shortClassSpeciiferValue.name !== undefined) {
        name = shortClassSpeciiferValue.name
        instances[identifier] = {
          type: 'short_class_specifier',
          type_specifier: name,
          short_class_specifier_value: shortClassSpeciiferValue,
          within,
          fullMoFilePath,
          description: shortClassSpeciiferValue.description
        }
      }
      if ('enum_list' in shortClassSpeciiferValue && shortClassSpeciiferValue.enum_list !== undefined) {
        instances[identifier] = {
          type: 'enumeration_class',
          type_specifier: name,
          short_class_specifier_value: shortClassSpeciiferValue,
          within,
          fullMoFilePath,
          description: shortClassSpeciiferValue.description
        }
        const enumList = shortClassSpeciiferValue.enum_list

        for (let j = 0; j < enumList.length; j++) {
          const enumListIdentifier = enumList[j].identifier
          instances[enumListIdentifier] = {
            type: 'enumeration',
            description: enumList[j].description,
            enumeration_literal: enumList[j],
            enumeration_kind: identifier
          }
        }
      }
    }
    if ('der_class_specifier' in classSpecifier && classSpecifier.der_class_specifier !== undefined) {
      derClassSpecifier = classSpecifier.der_class_specifier
      identifier = derClassSpecifier.identifier
      const derClassSpeciiferValue = derClassSpecifier.value
      instances[identifier] = {
        type: 'der_class_specifier',
        value: derClassSpeciiferValue,
        within,
        fullMoFilePath
      }
    }
  }
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractFromLongClassSpecifier (longClassSpecifier, fullMoFilePath, classPrefixes = null, within = null, evalContext = null) {
  let instances = {}
  let requiredReferences = {}
  let identifier = null
  let composition = null
  let compositionInstances = {}
  let compositionRequiredReferences = {}
  const dictIdentifier = {}
  dictIdentifier.within = within
  dictIdentifier.fullMoFilePath = fullMoFilePath

  if ('identifier' in longClassSpecifier) {
    identifier = longClassSpecifier.identifier
    dictIdentifier.type = 'long_class_specifier'
  }

  if (classPrefixes !== null) {
    dictIdentifier.class_prefixes = classPrefixes
  }

  if (longClassSpecifier.extends !== null && longClassSpecifier.extends !== undefined) {
    dictIdentifier.extends = true
    if ('class_modification' in longClassSpecifier && longClassSpecifier.class_modification !== undefined) {
      // classModification = longClassSpecifier.classModification
      // TODO: handle later
    }
  }
  if ('composition' in longClassSpecifier && longClassSpecifier.composition !== undefined) {
    composition = longClassSpecifier.composition
    const newAllObjects = extractFromComposition(composition, identifier, fullMoFilePath, within, evalContext)
    compositionInstances = Object.assign({}, compositionInstances, newAllObjects.instances)
    compositionRequiredReferences = updateRequiredReferences(compositionRequiredReferences, newAllObjects.requiredReferences)

    if ('annotation' in composition && composition.annotation !== undefined) {
      dictIdentifier.annotation = composition.annotation
      dictIdentifier.semantics = extractSemanticsFromAnnotations(composition.annotation, identifier)
      dictIdentifier.cdl_annotations = extractCdlAnnotations(composition.annotation)
    }
  }
  if (identifier !== null) {
    instances[identifier] = dictIdentifier
  }
  if (compositionInstances.length !== 0) {
    instances = Object.assign({}, instances, compositionInstances)
  }
  requiredReferences = updateRequiredReferences(requiredReferences, compositionRequiredReferences)
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractFromComposition (composition, longClassSpecifierIdentifier, fullMoFilePath, within, evalContext = null) {
  let elementSections = null
  let instances = {}
  let requiredReferences = {}
  let newAllObjects = null

  if (composition === null || composition === undefined) {
    return { instances: {}, requiredReferences: {} }
  }

  if ('element_list' in composition && composition.element_list !== undefined) {
    const elementList = composition.element_list
    // TODO: check with jianjun
    newAllObjects = extractFromElementList(elementList, longClassSpecifierIdentifier, fullMoFilePath, within, 'public', evalContext)
    instances = Object.assign({}, instances, newAllObjects.instances)
    requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
  }

  if ('element_sections' in composition && composition.element_sections !== undefined) {
    elementSections = composition.element_sections
    for (let i = 0; i < elementSections.length; i++) {
      const elementSection = elementSections[i]
      if ('public_element_list' in elementSection && elementSection.public_element_list !== undefined) {
        const publicElementList = elementSection.public_element_list
        newAllObjects = extractFromElementList(publicElementList, longClassSpecifierIdentifier, fullMoFilePath, within, 'public', evalContext)
        instances = Object.assign({}, instances, newAllObjects.instances)
        requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
      }
      if ('protected_element_list' in elementSection && elementSection.protected_element_list !== undefined) {
        const protectedElementList = elementSection.protected_element_list
        newAllObjects = extractFromElementList(protectedElementList, longClassSpecifierIdentifier, fullMoFilePath, within, 'protected', evalContext)
        instances = Object.assign({}, instances, newAllObjects.instances)
        requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
      }
      if ('equation_section' in elementSection && elementSection.equation_section !== undefined) {
        const equationSection = elementSection.equation_section
        const newConnections = extractConnectionsFromEquationSection(equationSection)
        const newRequiredReferences = { connections: newConnections }
        requiredReferences = updateRequiredReferences(requiredReferences, newRequiredReferences)
      }
    }
  }

  if ('external_composition' in composition && composition.external_composition !== undefined) {
    // TODO:
  }
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractFromElementList (elementList, longClassSpecifierIdentifier, fullMoFilePath, within, compositionSpecifier, evalContext = null) {
  let instances = {}
  let requiredReferences = {}

  for (let i = 0; i < elementList.length; i++) {
    const element = elementList[i]

    if ('extends_clause' in element && element.extends_clause !== undefined) {
      const extendsClause = element.extends_clause
      if (longClassSpecifierIdentifier !== null) {
        extendsClause.long_class_specifier_identifier = longClassSpecifierIdentifier
        extendsClause.within = within
        extendsClause.compositionSpecifier = compositionSpecifier
      }

      if ('extends_clause' in requiredReferences) {
        requiredReferences.extends_clause = requiredReferences.extends_clause.concat([extendsClause])
      } else {
        requiredReferences.extends_clause = [extendsClause]
      }
    }
    if ('import_clause' in element && element.import_clause !== undefined) {
      const importClause = element.import_clause
      if (longClassSpecifierIdentifier !== null) {
        importClause.long_class_specifier_identifier = longClassSpecifierIdentifier
        importClause.within = within
        importClause.compositionSpecifier = compositionSpecifier
      }
      if ('import_clause' in requiredReferences) {
        requiredReferences.import_clause = requiredReferences.import_clause.concat([importClause])
      } else {
        requiredReferences.import_clause = [importClause]
      }
    }
    if ('class_definition' in element && element.class_definition !== undefined) {
      const classDefinitionInstance = {}
      const classSpecifier = element.class_definition.class_specifier
      const classPrefixes = element.class_definition.class_prefixes
      let identifier2 = null
      const dict = {
        within,
        fullMoFilePath,
        classPrefixes,
        compositionSpecifier
      }
      if ('long_class_specifier' in classSpecifier) {
        dict.type = 'long_class_specifier'
        identifier2 = classSpecifier.long_class_specifier.identifier
        dict.annotation = classSpecifier.long_class_specifier.composition.annotation
        dict.semantics = extractSemanticsFromAnnotations(dict.annotation, identifier2)
        dict.cdl_annotations = extractCdlAnnotations(dict.annotation)

        classDefinitionInstance[identifier2] = dict
      } else if ('short_class_specifier' in classSpecifier) {
        // TODO: handle
      }
      // var jsonOp = {'class_definition': [element.class_definition], 'within': within, 'fullMoFilePath': fullMoFilePath}
      // var newAllObjects = extractAllObjects(jsonOp, within=within)
      instances = Object.assign({}, instances, classDefinitionInstance)
      requiredReferences = updateRequiredReferences(requiredReferences, {})
    }
    if ('component_clause' in element && element.component_clause !== undefined) {
      let componentClause = element.component_clause
      if (evalContext !== null && evalContext !== undefined) {
        // expressions replace their placeholders with evaluated values
        componentClause = JSON.parse(JSON.stringify(componentClause))
        evaluateComponentClause(componentClause, evalContext)
      }

      let typePrefix = null
      let typeSpecifier = null
      let arraySubscripts = null
      let constrainingClause = null
      let replaceable = null
      const componentList = componentClause.component_list

      typePrefix = componentClause.type_prefix
      typeSpecifier = ut.resolveTypeSpecifier(componentClause.type_specifier, within, fullMoFilePath)
      arraySubscripts = componentClause.array_subscripts

      if ('constraining_clause' in element && element.constraining_clause !== undefined) {
        constrainingClause = element.constraining_clause
      }
      if ('replaceable' in element && element.replaceable !== undefined) {
        replaceable = element.replaceable
      }

      for (let i = 0; i < componentList.length; i++) {
        const singleComponentList = componentList[i]
        const identifier = singleComponentList.declaration.identifier
        let annotation = null

        if ('description' in singleComponentList && singleComponentList.description !== undefined) {
          if ('annotation' in singleComponentList.description && singleComponentList.description.annotation !== undefined) {
            annotation = singleComponentList.description.annotation
          }
        }
        let isVector = false
        let singleComponentArraySubscripts = ''
        if ('array_subscripts' in singleComponentList.declaration && singleComponentList.declaration.array_subscripts !== undefined) {
          isVector = true
          singleComponentArraySubscripts = parseArraySubscripts(singleComponentList.declaration.array_subscripts)
        }
        instances[identifier] = {
          type_prefix: typePrefix,
          type_specifier: typeSpecifier,
          array_subscripts: arraySubscripts,
          type: 'element',
          compositionSpecifier,
          long_class_specifier_identifier: longClassSpecifierIdentifier,
          single_component_list: singleComponentList,
          annotation,
          semantics: extractSemanticsFromAnnotations(annotation, identifier),
          cdl_annotations: extractCdlAnnotations(annotation),
          isVector,
          arraySubscripts: singleComponentArraySubscripts,
          replaceable,
          constraining_clause: constrainingClause,
          within,
          fullMoFilePath
        }

        // record the original array subscripts for the instance
        if (evalContext !== null && evalContext !== undefined) {
          const arraySubsDec = element.component_clause.component_list[i]?.declaration?.array_subscripts

          // a scalar has no subscripts, recorded as '' to match arraySubscripts
          instances[identifier][originalSubscriptsKey] =
            (arraySubsDec === undefined) ? '' : parseArraySubscripts(arraySubsDec)
        }
      }
    }
  }
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractConnectionsFromEquationSection (equationSection) {
  const connections = {}
  let equations = null
  if ('equation' in equationSection && equationSection.equation !== undefined) {
    equations = equationSection.equation
    for (let i = 0; i < equations.length; i++) {
      const equation = equations[i]
      let connectClause = null

      if ('connect_clause' in equation && equation.connect_clause !== undefined) {
        connectClause = equation.connect_clause

        const from = parseComponentReference(connectClause.from)
        const to = parseComponentReference(connectClause.to)
        if (from in connections) {
          if (!(to in connections[from])) {
            connections[from] = connections[from].concat([to])
          }
        } else {
          connections[from] = [to]
        }
      }
    }
  }
  return connections
}

function parseComponentReference (reference) {
  let name = ''
  reference.forEach(namePart => {
    if (namePart.dot_op === true) {
      name = name + '.'
    }

    if (namePart.identifier !== undefined && namePart.identifier !== null) {
      name = name + namePart.identifier
    }
    if (namePart.array_subscripts !== undefined && namePart.array_subscripts !== null) {
      name = name + parseArraySubscripts(namePart.array_subscripts)
    }
  })
  return name
}

function parseArraySubscripts (arraySubscripts) {
  let arraySubscriptsString = ''
  if (arraySubscripts !== undefined && arraySubscripts !== null && arraySubscripts.length !== 0) {
    arraySubscripts.forEach(subscript => {
      if (subscript !== undefined) {
        if ('colon_op' in subscript && subscript.colon_op !== undefined && subscript.colon_op) {
          arraySubscriptsString += ':'
        }
        if ('expression' in subscript && subscript.expression !== undefined) {
          if ('simple_expression' in subscript.expression && subscript.expression.simple_expression !== undefined) {
            arraySubscriptsString += subscript.expression.simple_expression
          } else {
            arraySubscriptsString += json2moExpression.parse(subscript.expression)
          }
        }
        arraySubscriptsString += ','
      }
    })
    if (arraySubscriptsString !== '') {
      arraySubscriptsString = arraySubscriptsString.slice(0, -1)
      arraySubscriptsString = '[' + arraySubscriptsString + ']'
    }
    return arraySubscriptsString
  } else {
    return ''
  }
}

/**
 * raised when a sequence holds a parameter that nothing ever gives a value to
 *
 * A sequence is written out to be read by something else, so every parameter it
 * carries has to say what it holds. A value reaches one of three ways: the
 * declaration binds it, the instantiation it came through modifies it, or
 * params.json supplies it. A parameter none of the three reached is one whose
 * value the author never decided, and there is nothing to write for it that
 * would not be invented here, so the run stops rather than exporting a number
 * that would read as deliberate.
 *
 * Thrown while the objects are still being built, before the temporary output
 * directory is copied over the output directory, so a run that raises this
 * leaves no files behind. See `getJsons` in parser.
 */
class UnresolvedParameterError extends Error {
  /**
   * @param {string} className The full name of the sequence, package included
   * @param {Array<string>} parameters The parameters left without a value, each
   *     named by its path from the sequence down, as the context keys them
   */
  constructor (className, parameters) {
    super(`${className} has parameters that no declaration, no instantiation ` +
      `and no supplied value gives a value to: ${parameters.join(', ')}. ` +
      'Bind them in the Modelica source, or supply them in the parameter ' +
      'values file, keyed by the name shown here.')
    this.name = 'UnresolvedParameterError'
    this.className = className
    this.parameters = parameters
  }
}

/**
 * the name a class definition declares itself under
 *
 * @param {Object} classDefinition The class definition to name
 * @returns {string|undefined} The identifier, or undefined for a class
 *     definition that is not a long class specifier
 */
function longClassSpecifierIdentifier (classDefinition) {
  return classDefinition.class_specifier?.long_class_specifier?.identifier
}

/**
 * the full names of the enumeration types a set of parsed files define
 *
 * @param {Array<Object>} jsons the JSON representations of the parsed files
 * @returns {Set<string>} The full name of every `type T = enumeration(...)`
 */
function enumerationTypes (jsons) {
  const types = new Set()
  for (const json of jsons ?? []) {
    for (const classDefinition of json?.stored_class_definitions ?? []) {
      const shortClassSpecifier = classDefinition.class_specifier?.short_class_specifier
      if (shortClassSpecifier?.value?.enum_list !== undefined) {
        const name = shortClassSpecifier.identifier
        types.add(json.within ? `${json.within}.${name}` : name)
      }
    }
  }
  return types
}

/**
 * whether a value is a literal of one of the given enumeration types
 *
 * @param {*} value The value to check
 * @param {Set<string>} [types] The full names of the enumeration types
 * @returns {boolean} True for a string `T.literal` with T in types
 */
function isEnumerationLiteral (value, types) {
  if (typeof value !== 'string' || types === undefined || !value.includes('.')) {
    return false
  }
  return types.has(value.slice(0, value.lastIndexOf('.')))
}

/**
 * builds the context of which the expressions of a class are evaluated
 *
 * the context maps every parameter and constant of the class, and of all the
 * classes it instantiates, to its binding
 * @param {Object} classDefinition the class definition to build the context for.
 *     It must carry the additional within and fullMoFilePath properties.
 * @param {Array} jsons the JSON representations of the class and of every class
 *     it instantiates. Without them no lookup is possible and no context is built.
 * @param {Object} [userValues] values that take precedence over the bindings
 *     declared in the Modelica source, keyed the same way as the context.
 * @param {boolean} [withDefaults] whether a parameter with no binding takes the
 *     default of its declared attributes. Set for a sequence, which is a class
 *     no other class of the run instantiates, and so the class whose parameters
 *     have to be fully determined by the time it is written out.
 * @param {boolean} [warnDefaults] whether to warn about each parameter that
 *     took such a default because neither the source nor userValues gave it a
 *     value. Off when the context of the same class is built a second time.
 * @returns {{values: Object, prefix: string|null}|null} The context, or null
 *     when it cannot be built, in which case the expressions are left untouched.
 * @throws {Error} When a parameter of a sequence is left without a value. See
 *     `UnresolvedParameterError`.
 */
function buildEvaluationContext (classDefinition, jsons, userValues, withDefaults = false, warnDefaults = true) {
  if (jsons === null || jsons === undefined) {
    return null
  }
  let extracted
  try {
    extracted = expressionEvaluation.getParametersAndBindings(
      classDefinition, jsons, /* fetchDoc= */ false, /* fetchVariables= */ false,
      /* _instance= */ undefined, /* _bindings= */ undefined, withDefaults)
  } catch (error) {
    /* The context could not be assembled at all, which is not the same as a
       parameter of an assembled context having no value: nothing is known here,
       so nothing is claimed, and the expressions are left as they were. */
    logger.debug(`Could not build the evaluation context of ${classDefinition.within}: ${error}`)
    return null
  }

  const values = {}
  extracted.parameters.forEach(parameter => {
    values[parameter.name] = parameter.value
  })
  /* Supplied values are merged before the check below, so that a parameter the
     Modelica source leaves open is answered by params.json. They are keyed the
     same way the context is, which is by the path from the sequence down to the
     parameter, so `uni1.inpVal` supplies the parameter of the sub sequence
     instantiated as `uni1` just as `inpVal` supplies one of the sequence itself. */
  Object.assign(values, userValues)

  const className = classDefinition.within == null
    ? longClassSpecifierIdentifier(classDefinition)
    : `${classDefinition.within}.${longClassSpecifierIdentifier(classDefinition)}`
  const missing = extracted.unresolved.filter(name => values[name] == null)
  if (missing.length > 0) {
    throw new UnresolvedParameterError(className, missing)
  }
  // handle defaulted parameters by warning the user if they are not supplied in userValues
  if (warnDefaults) {
    extracted.defaulted
      .filter(({ name }) => !(userValues != null && name in userValues))
      .forEach(({ name, attribute, value }) => {
        logger.warn(`${className}: ${name} has no value, so it takes its declared ${attribute} = ${value}.` +
          ` Supply it in the parameter values file to set it. File: ${classDefinition.fullMoFilePath}`)
      })
  }
  return { values, prefix: null, enumerationTypes: enumerationTypes(jsons) }
}

/**
 * `buildEvaluationContext` with a softer failure for the flatten-only run
 *
 * @param {Object} classDefinition The class definition to build the context for.
 * @param {Array} jsons The JSON representations of every class in the run.
 * @param {Object} [userValues] Values that take precedence over the bindings.
 * @param {boolean} [withDefaults] Whether a parameter with no binding takes the
 *     default of its declared attributes.
 * @param {boolean} [required=true] Whether a parameter left without a value
 *     stops the run rather than leaving the class unevaluated.
 * @param {boolean} [warnDefaults=true] Whether a default taken from min or max
 *     is warned about. See `buildEvaluationContext`.
 * @returns {Object|null} The context, or null when there is none to be had.
 * @throws {UnresolvedParameterError} When `required` and a parameter has no value.
 */
function evaluationContext (classDefinition, jsons, userValues, withDefaults, required = true, warnDefaults = true) {
  try {
    return buildEvaluationContext(classDefinition, jsons, userValues, withDefaults, warnDefaults)
  } catch (error) {
    if (required || !(error instanceof UnresolvedParameterError)) {
      throw error
    }
    logger.debug(`${error.message}; ${classDefinition.within} is left unevaluated and its arrays unexpanded.`)
    return null
  }
}

/**
 * turns an evaluation value into a Modelica literal
 *
 * @param {*} value The value to convert
 * @returns {string} The Modelica literal
 */
function stringifyEvaluatedValue (value) {
  if (Array.isArray(value)) {
    return '{' + value.map(stringifyEvaluatedValue).join(',') + '}'
  }
  return `${value}`
}

/**
 * evaluates an expression and returns the value it evaluates to
 *
 * only numbers, booleans, arrays and enumeration literals are substituted, but not
 * strings or other expressions. A string is substituted only when it names a literal
 * of an enumeration type in the context, since an unresolved name such as `sub.k`
 * evaluates to a string of the same form.
 *
 * @param {Object} expression The expression object to evaluate
 * @param {Object} context The context to evaluate the expression in
 * @returns {Object} The value the expression evaluates to, as an expression
 *     object, or the expression itself when it does not evaluate to a value
 */
function evaluateExpression (expression, context) {
  if (expression === null || expression === undefined) {
    return expression
  }

  let value = null

  try {
    value = expressionEvaluation.evalExpression(
      expressionEvaluation.stringifyExpression(expression),
      context.values, context.prefix ?? undefined)
  } catch (error) {
    logger.debug(`Could not evaluate ${JSON.stringify(expression)}: ${error}`)
    return expression
  }

  if (typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value) ||
    isEnumerationLiteral(value, context.enumerationTypes)) {
    return { simple_expression: stringifyEvaluatedValue(value), [originalValueKey]: expression }
  }

  return expression
}

/**
 * replaces every modification's expression by the value it evaluates to
 *
 * nested class modifications are evaluated as well, so that the values bound to
 * the parameters of a sub-component - such as con1(final k=input1) - are resolved.
 *
 * @param {Object} modification the modification to evaluate
 * @param {Object} context the context to evaluate the expressions in
 * @returns {void}
 */
function evaluateModification (modification, context) {
  if (modification === null || modification === undefined) {
    return
  }

  // evaluate the main expression of the modification, if it exists
  if (modification.expression !== undefined) {
    modification.expression = evaluateExpression(modification.expression, context)
  }

  if (Array.isArray(modification.class_modification)) {
    modification.class_modification.forEach(classModification => {
      evaluateModification(
        classModification.element_modification_or_replaceable?.element_modification?.modification,
        context)
    })
  }
}

/**
 * replaces in place every array subscript by the value it evaluates to.
 *
 * @param {Array} arraySubscripts the array subscripts to evaluate
 * @param {Object} context the context to evaluate the expressions in
 * @returns {void}
 */
function evaluateArraySubscripts (arraySubscripts, context) {
  if (!Array.isArray(arraySubscripts)) {
    return
  }
  arraySubscripts.forEach(subscript => {
    if (subscript !== undefined && subscript !== null && subscript.expression !== undefined) {
      subscript.expression = evaluateExpression(subscript.expression, context)
    }
  })
}

/**
 * replaces in place every expression of a component clause
 *
 * A parameter with no binding of its own takes its value from the context when
 * there is one, which is how the values a user supplies reach the extracted objects.
 *
 * @param {Object} componentClause The component clause to evaluate.
 * @param {Object} context The context to evaluate the expressions in.
 * @returns {void}
 */
function evaluateComponentClause (componentClause, context) {
  evaluateArraySubscripts(componentClause.array_subscripts, context)

  componentClause.component_list.forEach(singleComponentList => {
    const declaration = singleComponentList.declaration

    evaluateArraySubscripts(declaration.array_subscripts, context)
    if (declaration.modification !== null && declaration.modification !== undefined) {
      evaluateModification(declaration.modification, context)
    }
    // build the context key for this declaration based on the prefix and identifier
    const contextKey = (context.prefix == null)
      ? declaration.identifier
      : `${context.prefix}.${declaration.identifier}`
    // check if a value for this declaration is supplied by the context
    const supplied = context.prefix != null && context.values[contextKey] != null

    // if a declaration isnt modified to be equal, take its value from the context
    // since it has no binding of its own, it relies on the context for its value
    if (declaration.modification?.equal !== true || supplied) {
      const value = context.values[contextKey]

      // if there's a value in the context, hard-code it into the modification
      if (value !== undefined && value !== null) {
        const evaluated = evaluateExpression({ simple_expression: `${value}` }, context)
       
        // The evaluated expression is now stored in the modification, and the original modification is recorded separately.
        delete evaluated[originalValueKey]
        declaration[originalModificationKey] = declaration.modification ?? null
        declaration.modification = Object.assign({}, declaration.modification, {
          equal: true,
          expression: evaluated
        })
      }
    }
    if (singleComponentList.condition_attribute !== null &&
      singleComponentList.condition_attribute !== undefined) {
      singleComponentList.condition_attribute.expression = evaluateExpression(
        singleComponentList.condition_attribute.expression, context)
    }
  })
}

/**
 * puts back or discards every record of what an expression was before it was
 * evaluated
 *
 * @param {*} node The node to walk, mutated in place.
 * @param {boolean} keepEvaluated Whether the evaluated values are what the run
 *     asked for. With it set the records are discarded and the values stay; with
 *     it clear every recorded expression is put back first.
 * @returns {*} The node.
 */
function resolveEvaluationMarkers (node, keepEvaluated) {
  // Recursively walks the node, restoring original values if keepEvaluated is false.
  if (Array.isArray(node)) {
    node.forEach(entry => resolveEvaluationMarkers(entry, keepEvaluated))
    return node
  }
  if (node === null || typeof node !== 'object') {
    return node
  }

  // Restore the original array subscripts if they exist and keepEvaluated is false.
  if (originalSubscriptsKey in node) {
    const original = node[originalSubscriptsKey]
    delete node[originalSubscriptsKey]
    if (!keepEvaluated) {
      node.arraySubscripts = original
    }
  }

  // Restore the original modification if it exists and keepEvaluated is false.
  if (originalModificationKey in node) {
    const original = node[originalModificationKey]
    delete node[originalModificationKey]
    if (!keepEvaluated) {

      // null records a declaration that carried no modification at all, which
      if (original === null) delete node.modification
      else node.modification = original
    }
  }

  Object.keys(node).forEach(key => {
    const child = node[key]
    if (child !== null && typeof child === 'object' && originalValueKey in child) {
      const original = child[originalValueKey]
      delete child[originalValueKey]
      if (!keepEvaluated) node[key] = original
    }
    /* After the substitution, so that an expression that was put back is walked
       in turn: a modification is evaluated before the branch that replaces it,
       and the two share the nested class modifications. */
    resolveEvaluationMarkers(node[key], keepEvaluated)
  })
  return node
}

/**
 * renames the class an extracted objects json describes based on the instance path
 * it records the class it came from in instanceOf.
 *
 * @param {Object} allObjects The instances and connections of the sub-sequence,
 *     mutated in place.
 * @param {string} identifier The name the class is declared with.
 * @param {string} name The name the sub-sequence takes.
 * @param {string} instanceOf The full name of the class it came from.
 * @returns {void}
 */
function renameExtractedClass (allObjects, identifier, name, instanceOf) {
  const instances = {}

  Object.entries(allObjects.instances).forEach(([key, instance]) => {
    if (instance.long_class_specifier_identifier === identifier) {
      instance.long_class_specifier_identifier = name
    }

    if (key === identifier && instance.type === 'long_class_specifier') {
      instances[name] = Object.assign(instance, { instanceOf })
    } else {
      instances[key] = instance
    }
  })
  // replace the old instances map with the new one that has renamed classes
  allObjects.instances = instances
}

/**
 * class definition of a custom-made sub-sequence, as CDL blocks have transparent definitions
 *
 * @param {Object} instance One entry of an objects json instances map
 * @param {Array} jsons The JSON representations of every class in the run
 * @param {Object} classObject The JSON representation of the class declaring
 *     the component, for short class name lookups
 * @returns {Object|null} the class definition, with its within and
 *     fullMoFilePath properties, or null when the component is not one
 */
function findSubSequenceDefinition (instance, jsons, classObject) {
  const typeSpecifier = instance.type_specifier
  if (typeof typeSpecifier !== 'string' ||
    expressionEvaluation.primitiveTypes.includes(typeSpecifier)) {
    return null
  }
  // if a type specifier includes a dot, it is already a full class name
  // if it doesn't then it needs to be looked up in the context of the instance's location
  const fullClassName = typeSpecifier.includes('.')
    ? typeSpecifier
    : expressionEvaluation.lookupClassName(typeSpecifier, instance.within, instance.fullMoFilePath)

  if (fullClassName == null || ut.checkIfCdlElementaryBlockOrPackage(fullClassName, true)) return null

  const classDefinition = expressionEvaluation.getClassDefinition(fullClassName, jsons, classObject)
  if (classDefinition?.class_specifier?.long_class_specifier?.composition == null) {
    return null
  }
  return Object.assign({}, classDefinition, { fullClassName })
}

/**
 * class definition of an elementary block this parser decomposes
 *
 * @param {Object} instance One entry of an objects json instances map
 * @param {Array} jsons The JSON representations of every class in the run
 * @param {Object} classObject The JSON representation of the class declaring
 *     the component, for short class name lookups
 * @returns {Object|null} the class definition, with its within,
 *     fullMoFilePath and fullClassName properties, or null when the component
 *     is not an elementary block with a decomposition
 */
function findFlattenableDefinition (instance, jsons, classObject) {
  // Check if the instance represents a flattenable elementary block.
  const typeSpecifier = instance.type_specifier
  if (typeof typeSpecifier !== 'string' ||
    expressionEvaluation.primitiveTypes.includes(typeSpecifier)) {
    return null
  }

  // Determine the full class name of the instance, either from the type specifier directly or by looking it up in the context of the instance's location.
  const fullClassName = typeSpecifier.includes('.')
    ? typeSpecifier
    : expressionEvaluation.lookupClassName(typeSpecifier, instance.within, instance.fullMoFilePath)

  if (!elementaryFlattener.isFlattenable(fullClassName)) return null 

  const classDefinition = expressionEvaluation.getClassDefinition(fullClassName, jsons, classObject)
  if (classDefinition?.class_specifier?.long_class_specifier?.composition == null) {
    return null
  }
  return Object.assign({}, classDefinition, { fullClassName })
}

/**
 * writes the connections to an elementary block that is kept as it is with the
 * subscripts its array ports are declared with
 *
 * @param {Object} connections The connections of the declaring class, mutated
 *     in place
 * @param {string} identifier The name the block is declared with
 * @param {Object} subObjects The extracted, expanded class of the block
 * @returns {void}
 */
function restoreArraySubscripts (connections, identifier, subObjects) {
  if (connections == null) return
  const subscripted = {}
  Object.entries(subObjects.instances ?? {}).forEach(([name, instance]) => {
    const record = instance.arrayExpansion
    if (record !== undefined) {
      subscripted[`${identifier}.${name}`] =
        `${identifier}.${record.arrayName}[${record.index.join(',')}]`
    }
  })
  const rename = end => subscripted[end] ?? end
  // rebuilt in place, so the connections keep the order they were written in
  const entries = Object.entries(connections)
  entries.forEach(([from]) => delete connections[from])
  entries.forEach(([from, targets]) => {
    connections[rename(from)] = targets.map(rename)
  })
}

/**
 * adds to an extracted elementary block the blocks it decomposes into
 *
 * @param {Object} subObjects The instances and connections of the extracted
 *     block, mutated in place
 * @param {Object} classDefinition The class definition of the elementary block
 * @param {string} identifier The name the class is declared with, which the
 *     generated components are declared by until the class is renamed
 * @param {string} blockName The name the flattened block takes, for the record
 *     a generated component carries and for the log
 * @returns {boolean} Whether the block was decomposed
 */
function flattenElementaryBlock (subObjects, classDefinition, identifier, blockName) {
  const flattened = elementaryFlattener.flattenElementaryBlock(
    subObjects, classDefinition.fullClassName, blockName)
  if (flattened === null) {
    return false
  }

  // Handle any array resizing information returned by the flattener.
  if (flattened.resize !== undefined) {
    Object.entries(flattened.resize).forEach(([name, sizes]) => {
      subObjects.instances[name].arraySubscripts = `[${sizes.join(',')}]`
    })
    arrayExpansion.expandArrays(subObjects, identifier)
  }

  // protected variables showed up as unconnected because arrayFlattener already does this
  // thus delete them from the instances list
  Object.entries(subObjects.instances).forEach(([name, instance]) => {
    if (instance.type === 'element' && instance.compositionSpecifier === 'protected') {
      delete subObjects.instances[name]
    }
  })

  const added = extractFromElementList(flattened.elementList, identifier,
    classDefinition.fullMoFilePath, classDefinition.within, 'public')
  elementaryFlattener.markExpandedInstances(flattened.elementList, added.instances) 

  subObjects.instances = Object.assign({}, subObjects.instances, added.instances)
  subObjects.requiredReferences = updateRequiredReferences(
    subObjects.requiredReferences ?? {}, { connections: flattened.connections })
  return true
}

/**
 * moves an extracted class into another package
 *
 * @param {Object} allObjects The instances and connections of the class,
 *     mutated in place.
 * @param {string|null} within The package the class is moved into.
 * @returns {void}
 */
function relocateExtractedClass (allObjects, within) {
  Object.values(allObjects.instances ?? {}).forEach(instance => {
    instance.within = within
  })
}

/**
 * the values an instantiation supplies to the class it instantiates
 *
 * A sub-sequence takes its parameters at the point of instantiation, so the
 * modifications the component was declared with are what the expressions inside
 * it resolve against - the guard of a conditional component above all. They are
 * read off the component rather than off the class definition, which is what
 * makes two instantiations of the same class differ: `setChaPre` declared with
 * `use_mulSteSetCha=false` drops the components `setChaShe` keeps.
 *
 * The modifications have already been evaluated in the context of the class
 * that declares the component, so what is read here is literal.
 *
 * @param {Object} instance The component that instantiates the class.
 * @param {string} prefix The instance path the sub-sequence takes, which is how
 *     the evaluation context is keyed.
 * @returns {Object} The values, keyed the same way as the context.
 */
function instantiationValues (instance, prefix) {
  const values = {}
  const classModification =
    instance.single_component_list?.declaration?.modification?.class_modification

  if (!Array.isArray(classModification)) {
    return values
  }

  classModification.forEach(modification => {
    const elementModification =
      modification.element_modification_or_replaceable?.element_modification
    const name = elementModification?.name
    const expression = elementModification?.modification?.expression
    /* A nested modification - con1(k(min=0)) - binds no value of its own, and a
       name with a dot in it belongs to a component of the sub-sequence, not to
       one of its parameters. */
    if (name == null || name.includes('.') || expression === undefined) {
      return
    }
    values[`${prefix}.${name}`] = expressionEvaluation.stringifyExpression(expression)
  })

  return values
}

/**
 * the parameter values one extraction of a sub-sequence resolved to
 *
 * Everything the evaluation turned into a literal, keyed by the name the
 * parameter is declared with. The values the instantiation supplied and the
 * ones derived from them are collected alike: what matters to a consumer is
 * the value a component ends up with, not the path it took to get there.
 *
 * @param {Object} subObjects The instances and connections of the sub-sequence.
 * @returns {Object} One entry per resolved parameter, holding its expression node.
 */
function resolvedParameterValues (subObjects) {
  const values = {}
  Object.entries(subObjects.instances ?? {}).forEach(([identifier, component]) => {
    if (component.type !== 'element' ||
      !(component.type_prefix ?? '').includes('parameter')) {
      return
    }
    const modification = component.single_component_list?.declaration?.modification
    if (modification?.equal !== true || modification.expression === undefined) {
      return
    }
    values[identifier] = modification.expression
  })
  return values
}

/**
 * writes the values a sub-sequence resolved to onto the component that instantiates it
 *
 * `uni1(final inpVal=1)` becomes `uni1(final inpVal=1, derivVal=2)`. The
 * declaration keeps what the source said and gains what the evaluation worked
 * out, so the values an instantiation takes can be read off the sequence that
 * declares it without opening the sub-sequence at all.
 *
 * A parameter the declaration already modifies is left alone: that modification
 * is where the sub-sequence took its value from in the first place, and
 * rewriting it would drop the `final` prefix it carries.
 *
 * @param {Object} instance The component that instantiates the sub-sequence,
 *     mutated in place.
 * @param {Object} values The resolved parameters, as `resolvedParameterValues`
 *     returns them.
 * @returns {void}
 */
function carryResolvedValues (instance, values) {
  const declaration = instance.single_component_list?.declaration
  if (declaration == null) {
    return
  }
  const classModification = declaration.modification?.class_modification ?? []
  const declared = new Set(classModification.map(modification =>
    modification.element_modification_or_replaceable?.element_modification?.name))

  const derived = Object.entries(values)
    .filter(([name]) => !declared.has(name))
    .map(([name, expression]) => ({
      /* Carries no `final`: this is a value the evaluation worked out rather
         than one the source qualified, and an unqualified modification is what
         the parser emits with that key left off. */
      element_modification_or_replaceable: {
        element_modification: {
          name,
          modification: {
            equal: true,
            // Copied, so that editing the block does not edit the declaration.
            expression: JSON.parse(JSON.stringify(expression))
          }
        }
      }
    }))

  if (derived.length === 0) {
    return
  }
  declaration.modification = Object.assign({}, declaration.modification,
    { class_modification: classModification.concat(derived) })
}

/**
 * extracts every sub-sequence a class instantiates as a class of its own
 *
 * reminder: only done when the expression evaluation or array flattening flag is on
 *
 * @param {Object} allObjects The instances and connections of the class,
 *     mutated in place so that its components hold what they resolved to
 * @param {string} name The name the class is known by, which the sub-sequences
 *     are named after
 * @param {Object} context The context the expressions are evaluated in, built
 *     for the class the extraction started from
 * @param {Array} jsons The JSON representations of every class in the run
 * @param {Object} classObject The JSON representation of the class the
 *     extraction started from, for short class name lookups
 * @param {string} [within] The package the sub-sequences belong to
 * @param {Object} [subSequences] The blocks extracted so far, added to in place
 * @param {boolean} [flattenArrays=false] Whether an array is expanded into one
 *     component per element. See `generateAllObjectsJson`.
 * @param {string} [rootName] The class the extraction started from, which a
 *     flattened elementary block is named after
 * @param {boolean} [evaluateExpressions=true] Whether the evaluated values are
 *     kept. With it clear the sub-sequence and the component instantiating it
 *     keep the expressions the source wrote. See `generateAllObjectsJson`.
 * @returns {Object} One entry per sub-sequence block, keyed by the name it takes
 */
function extractSubSequences (allObjects, name, context, jsons, classObject, within = null,
  subSequences = {}, flattenArrays = false, rootName = name, evaluateExpressions = true) {
  Object.entries(allObjects.instances).forEach(([identifier, instance]) => {
    if (instance.type !== 'element') {
      return
    }
    // a component belongs to exactly the one that declares it
    // thus if the long class specifier of the instance does not 
    // match the name of the class being processed means the 
    // component is declared by another class
    if (instance.long_class_specifier_identifier !== name) {
      return
    }
    // Determine if the instance represents a flattened elementary component or a sub-sequence.
    let isFlattenedElementary = false
    let classDefinition = findSubSequenceDefinition(instance, jsons, classObject)
    if (classDefinition === null) {
      classDefinition = flattenArrays
        ? findFlattenableDefinition(instance, jsons, classObject) 
        : null
      if (classDefinition === null) {
        return
      }
      isFlattenedElementary = true
    }
    const longClassSpecifier = classDefinition.class_specifier.long_class_specifier

    const subPrefix = context.prefix == null ? identifier : `${context.prefix}.${identifier}`
    const subName = [isFlattenedElementary ? rootName : classDefinition.fullClassName.split('.').pop()]
      .concat(subPrefix.split('.'))
      .join('.')

    const subContext = {
      /* The context of the class that declares the component, plus what this
         instantiation binds. The latter wins: it is the value the parameter
         takes in this copy of the sub-sequence. */
      values: Object.assign({}, context.values, instantiationValues(instance, subPrefix)),
      prefix: subPrefix,
      enumerationTypes: context.enumerationTypes
    }
    const subObjects = extractFromLongClassSpecifier(
      longClassSpecifier, classDefinition.fullMoFilePath, classDefinition.class_prefixes,
      classDefinition.within, subContext)
    
    // expand the array first if the flag's up, then remove components as evaluated 
    if (flattenArrays) {
      arrayExpansion.expandArrays(subObjects, longClassSpecifier.identifier)
    } else {
      arrayExpansion.removeDisabledComponents(subObjects, longClassSpecifier.identifier)
    }

    // Resolve evaluation markers for the extracted sub-objects, putting the
    // expressions back when only the flattening asked for the evaluation
    resolveEvaluationMarkers(subObjects, evaluateExpressions)

    if (isFlattenedElementary &&
      !flattenElementaryBlock(subObjects, classDefinition, longClassSpecifier.identifier, subName)) { 
     
      // The elementary block could not be flattened, so restore array subscripts for its connections
      restoreArraySubscripts(allObjects.requiredReferences?.connections, identifier, subObjects)
      return
    }

    // If the block is not flattened, carry its resolved values to the instance so they are available for further processing
    if (!isFlattenedElementary && evaluateExpressions) {
      // resolved values gets carried to the instance
      carryResolvedValues(instance, resolvedParameterValues(subObjects))
    }
    instance.type_specifier = classDefinition.fullClassName


    // Determine the context within which the sub-objects are considered, depending on whether the elementary block was flattened.
    const subWithin = isFlattenedElementary ? within : classDefinition.within
    if (isFlattenedElementary) {
      relocateExtractedClass(subObjects, within)
    }

    renameExtractedClass(subObjects, longClassSpecifier.identifier, subName, classDefinition.fullClassName)

    // the sub-sequences inside it, each a block of its own too
    const nested = extractSubSequences(
      subObjects, subName, subContext, jsons, classObject, within, {}, flattenArrays,
      rootName, evaluateExpressions)

    // the exact definition that will reflect the CXF graph
    instance.subInstanceDefinition = subWithin == null ? subName : `${subWithin}.${subName}`

    // the instance path is unique within one Modelica file which works forthis place where all the subsequences meet
    subSequences[subName] = subObjects
    Object.assign(subSequences, nested)
  })
  return subSequences
}

/**
 * extracts every sub-sequence the classes of one Modelica file instantiate
 *
 * @param {Object} allObjects The instances and connections the file yielded,
 *     mutated in place so that its components name the sub-sequences.
 * @param {Object} jsonOutput The JSON representation of the file.
 * @param {Array} jsons The JSON representations of every class in the run.
 * @param {Object} [userValues] Values that take precedence over the bindings
 *     declared in the Modelica source.
 * @param {boolean} [withDefaults] Whether a parameter with no binding takes the
 *     default of its declared attributes or of its data type.
 * @param {boolean} [flattenArrays=false] Whether an array is expanded into one
 *     component per element. See `generateAllObjectsJson`.
 * @param {boolean} [evaluateExpressions=true] Whether the evaluated values are
 *     kept. See `extractSubSequences`.
 * @returns {Object} One entry per sub-sequence, keyed by the name it takes.
 */
function extractAllSubSequences (allObjects, jsonOutput, jsons, userValues = null, withDefaults = false,
  flattenArrays = false, evaluateExpressions = true) {
  if (jsons === null || jsons === undefined) {
    return {}
  }

  const within = jsonOutput.within ?? null
  const fullMoFilePath = jsonOutput.fullMoFilePath
  const subSequences = {}

  for (const classDefinition of jsonOutput.stored_class_definitions ?? []) {
    const longClassSpecifier = classDefinition.class_specifier?.long_class_specifier
    if (longClassSpecifier?.identifier == null) {
      continue
    }
    // the objects of this class already warned about the defaults its context takes
    // the flatten-only run leaves a class it cannot evaluate as it is, as `extractAllObjects` does
    const context = evaluationContext(
      Object.assign({}, classDefinition, { within, fullMoFilePath }), jsons, userValues, withDefaults,
      evaluateExpressions, false)

    if (context === null) {
      continue
    }

    extractSubSequences(allObjects, longClassSpecifier.identifier, context, jsons,
      jsonOutput, within, subSequences, flattenArrays, longClassSpecifier.identifier, evaluateExpressions)
  }
  return subSequences
}

/**
 * Parses *class* modifications and constructs an output dictionary.
 *
 * - Direct assignments (such as in parameter declarations) are not returned.
 *
 * @param {Object} modifications The modifications object to parse.
 * @param {function} [stringifyExpression=] Function to convert expression
 *     objects into Modelica expressions (strings).
 * @returns {Object} The parsed modifications as a dictionary.
 */
function parseModifications (modifications, stringifyExpression) {
  let outputDict = {}
  if (Object.keys(modifications).length > 0) {
    Object.keys(modifications).forEach(modificationKey => {
      const classModifications = modifications[modificationKey]
      if (classModifications?.length > 0) {
        classModifications.forEach(classModification => {
          const eleMod = classModification.element_modification_or_replaceable.element_modification
          const eleKey = eleMod.name
          const eleDict = {}
          const mod = eleMod.modification
          if (mod.expression !== undefined) {
            if (stringifyExpression != null) {
              eleDict[eleKey] = stringifyExpression(mod.expression)
            } else {
              eleDict[eleKey] = mod.expression.simple_expression || mod.expression.if_expression
            }
          } else {
            eleDict[eleKey] = parseModifications(mod, stringifyExpression)
          }
          if (eleKey !== 'propagate') {
            outputDict = Object.assign({}, outputDict, eleDict)
          } else {
            if (outputDict.propagate === undefined) {
              outputDict.propagate = [eleDict[eleKey]]
            } else {
              const existingPropagateList = outputDict.propagate
              existingPropagateList.push(eleDict[eleKey])
              outputDict.propagate = existingPropagateList
            }
          }
        })
      }
    })
  }
  return outputDict
}

function extractCdlAnnotations (annotation) {
  let cdlAnnotations = {}
  if (annotation !== null && annotation !== undefined) {
    annotation.forEach(singleAnnotation => {
      const annotationName = singleAnnotation.element_modification_or_replaceable.element_modification.name
      if (annotationName === '__cdl' || annotationName === '__Buildings') {
        const modifications = singleAnnotation.element_modification_or_replaceable.element_modification.modification
        cdlAnnotations = parseModifications(modifications)
      }
    })
  }
  return cdlAnnotations
}

function extractSemanticsFromAnnotations (annotation, instanceIdentifier) {
  const semantics = {}
  if (annotation !== null && annotation !== undefined) {
    annotation.forEach(singleAnnotation => {
      const annotationName = singleAnnotation.element_modification_or_replaceable.element_modification.name
      if (annotationName === '__cdl' || annotationName === '__Buildings') {
        const classModifications = singleAnnotation.element_modification_or_replaceable.element_modification.modification.class_modification
        classModifications.forEach(classModification => {
          const keyName = classModification.element_modification_or_replaceable.element_modification.name
          if (keyName === 'semantic') {
            const semanticClassModifications = classModification.element_modification_or_replaceable.element_modification.modification.class_modification
            semanticClassModifications.forEach(semanticClassModification => {
              const semanticLanguageKey = semanticClassModification.element_modification_or_replaceable.element_modification.name
              let semanticLanguage = semanticClassModification.element_modification_or_replaceable.element_modification.modification.expression.simple_expression
              const semanticLanguageContent = semanticClassModification.element_modification_or_replaceable.element_modification.description_string
              semanticLanguage = semanticLanguage.split('"')[1]
              // semanticLanguageContent = semanticLanguageContent.replaceAll('<cdl_instance_name>', instanceIdentifier)
              if (semanticLanguageKey === 'metadataLanguageDefinition' || semanticLanguageKey === 'naturalLanguageDefinition') {
                if (!(semanticLanguage in semantics)) {
                  semantics[semanticLanguage] = ''
                }
              } else if (semanticLanguageKey === 'metadataLanguage' || semanticLanguageKey === 'naturalLanguage') {
                if (semanticLanguage in semantics) {
                  semantics[semanticLanguage] = semantics[semanticLanguage] + semanticLanguageContent + '\n'
                } else {
                  semantics[semanticLanguage] = semanticLanguageContent + '\n'
                }
              }
            })
          }
        })
      }
    })
  }

  return semantics
}

module.exports.extractAllObjects = extractAllObjects
module.exports.extractAllSubSequences = extractAllSubSequences
module.exports.updateConnections = updateConnections
module.exports.updateRequiredReferences = updateRequiredReferences
module.exports.extractSemanticsFromAnnotations = extractSemanticsFromAnnotations
module.exports.parseModifications = parseModifications
module.exports.UnresolvedParameterError = UnresolvedParameterError
module.exports.enumerationTypes = enumerationTypes
