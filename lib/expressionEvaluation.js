'use strict'
const expressionToString = require('../json2mo/expression.js')
const jsonQuery = require('../lib/jsonquery')
const logger = require('winston') // This retrieves the default logger which is configured in app.js
const objectExtractor = require('../lib/objectExtractor.js')
const path = require('path')
const utilM2j = require('../lib/util.js')
const math = require('mathjs')

const operators = [
  '==', '<>', '>', '>=', '<', '<=', // relational-operator
  'if', 'then', 'else', 'elseif', // expression
  'not', 'and', 'or', // logical
  '&&', '||', // logical JS
  '+', '.+', '-', '.-', // add-operator
  '*', '.*', '/', '.*', // mul-operator
  '^', '.^', // factor
  'der', 'false', 'true', '{', '}', '(', ')', '[', ']', ';', // primary
  ',', 'for', 'in', ':' // array-arguments and subscripts
]
// Modelica functions that can be directly evaluated with math.js
const functionsMathJS = [ // https://obc.lbl.gov/specification/cdl.html#functions
  'abs', 'sign',
  'sqrt',
  'mod',
  'ceil', 'floor',
  'min', 'max', 'sum'
]
// All patterns that must be considered as functions when parsing an expression
const functions = [ // https://obc.lbl.gov/specification/cdl.html#functions
  ...functionsMathJS,
  'div', 'rem',
  'fill', 'size',
  'Array', 'divide' // JS functions
]
const variableRegExp = /^\.?(\D\w*)(\.\w+)*/
const primitiveTypes = ['Boolean', 'Integer', 'Real', 'String']

// paths to properties
const pathToClassSpecifier = ['class_definition', 0, 'class_specifier']
const pathToComposition = [...pathToClassSpecifier, 'long_class_specifier', 'composition']
const pathToClassAnnotation = [...pathToComposition, 'annotation']

/**
 * Converts an expression object into a string that can be evaluated with JS eval.
 *
 * - Exceptions: some constructs are handled differently, after the expession is
 *  converted to a string (for example: if, then else constructs).
 *  This is done by `convertSymbolsInExpression`.
 * - We don't use a recursive algorithm for function calls because of
 *   https://github.com/lbl-srg/modelica-json/issues/247
 *
 * @param {Object} obj - The expression object to be converted.
 * @returns {string} - The string representation of the expression.
 */
function stringifyExpression (obj) {
  if (functionsMathJS.includes(obj.simple_expression?.function_call?.name)) {
    return expressionToString.parse({
      simple_expression: {
        function_call: {
          name: `math.${obj.simple_expression.function_call.name}`,
          arguments: obj.simple_expression.function_call.arguments
        }
      }
    })
  }
  if (obj.simple_expression?.function_call?.name === 'integer') {
    return expressionToString.parse({
      simple_expression: {
        function_call: {
          name: 'math.floor', // Modelica integer() is equivalent to Math.floor() in JS
          arguments: obj.simple_expression.function_call.arguments
        }
      }
    })
  }
  if (obj.simple_expression?.function_call?.name === 'div') {
    return expressionToString.parse({
      simple_expression: {
        function_call: {
          name: 'math.floor(math.divide',
          arguments: [
            obj.simple_expression.function_call.arguments[0],
            { name: obj.simple_expression.function_call.arguments[1].name + ')' }
          ]
        }
      }
    })
  }
  if (obj.simple_expression?.function_call?.name === 'fill') {
    /* Modelica fill($1, $2) with 2 arguments is converted into
       Array($2).fill($1) */
    return expressionToString.parse({
      simple_expression: {
        function_call: {
          name: `Array(${obj.simple_expression.function_call.arguments[1].name}).fill`,
          arguments: [obj.simple_expression.function_call.arguments[0]]
        }
      }
    })
  }
  if (obj.simple_expression?.function_call?.name === 'size') {
    /* Modelica size($1, $2?) with 1 or 2 arguments is converted into
       $2 ? math.size($1)[$2 - 1] : math.size($1) */
    return expressionToString.parse({
      simple_expression: {
        function_call: {
          name: 'math.size',
          arguments: [obj.simple_expression.function_call.arguments[0]]
        }
      }
    }) + (obj.simple_expression.function_call.arguments[1] // Optional second argument to size() in Modelica
      ? `[${obj.simple_expression.function_call.arguments[1].name} - 1]` // Modelica arrays start at 1 VS 0 in JS
      : '')
  }
  if (obj.if_expression ||
    obj.simple_expression?.logical_expression ||
    obj.simple_expression?.if_expression) {
    /* Logical NOT in JS requires parentheses to be added around the negated expression.
       Otherwise: ! 2 < 3 is interpreted as ! 2 (= false → 0) < 3
       which evaluates to true instead of false. */
    return expressionToString.parse(JSON.parse(JSON.stringify(obj, // We use the recursive algorithm of JSON.stringify
      (_, val) => {
        if (val?.not) {
          return {
            ...val,
            arithmetic_expressions: [
              { name: '(' + val.arithmetic_expressions[0].name },
              { name: val.arithmetic_expressions[1].name + ')' }
            ]
          }
        } else return val
      })))
  }
  return expressionToString.parse(obj)
}

/**
 * Extracts and returns the components of a class object.
 *
 * - The unit property is only populated for primitive type instances with a declaration attribute.
 *   (Non-primitive types are not parsed to retrieve the original unit value.)
 *
 * @param {Object} classObject - The class object to extract components from.
 *     Class definition is also accepted.
 * @param {function} [stringifyExpression] - Function to convert expression
 *     objects into Modelica expressions (strings).
 * @returns {Array} An array of components extracted from the class object.
 */
function getComponents (classObject, stringifyExpression) {
  const components = []
  let cdlAnnotation
  let dialogAnnotation
  let modification
  let assignment
  let bindings
  let conditionExpression
  let unit
  let displayUnit
  let descriptionString
  const elements = {
    public: jsonQuery.findNestedObjects(classObject, 'element_list').concat(
      jsonQuery.findNestedObjects(classObject, 'public_element_list')).flat(),
    protected: jsonQuery.findNestedObjects(classObject, 'protected_element_list').flat()
  }
  for (const [key, subset] of Object.entries(elements)) { // key = protected | public
    subset.forEach((element) => {
      // JSON parser may yield undefined values for public_element_list or protected_element_list.
      element?.component_clause?.component_list.forEach((component) => {
        cdlAnnotation = jsonQuery.findNestedObjects(
          component.description?.annotation, 'name', '__cdl'
        )[0]?.modification
        cdlAnnotation = cdlAnnotation == null
          ? null
          : objectExtractor.parseModifications(cdlAnnotation, stringifyExpression)
        dialogAnnotation = jsonQuery.findNestedObjects(
          component.description?.annotation, 'name', 'Dialog'
        )[0]?.modification
        dialogAnnotation = dialogAnnotation == null
          ? null
          : objectExtractor.parseModifications(dialogAnnotation)
        modification = component.declaration.modification
        /* objectExtractor.parseModifications only parses ***class*** modifications:
           direct assignments (such as in parameter declarations) are not returned. */
        bindings = modification == null
          ? null
          : objectExtractor.parseModifications(modification, stringifyExpression)
        assignment = modification?.equal == null
          ? null
          : stringifyExpression != null
            ? stringifyExpression(modification.expression)
            : modification.expression
        conditionExpression = component.condition_attribute?.expression == null // Replace undefined with null
          ? null
          : stringifyExpression != null
            ? stringifyExpression(component.condition_attribute.expression)
            : component.condition_attribute.expression
        unit = jsonQuery.findNestedObjects(element, 'name', 'unit')[0]
        unit = unit == null
          ? null
          : unit.modification.expression.simple_expression
        displayUnit = jsonQuery.findNestedObjects(element, 'name', 'displayUnit')[0]
        displayUnit = displayUnit == null
          ? null
          : displayUnit.modification.expression.simple_expression
        descriptionString = component.description?.description_string ?? null
        components.push({
          protected: key === 'protected',
          final: element.final ?? false,
          identifier: component.declaration.identifier,
          typePrefix: element.component_clause?.type_prefix,
          typeSpecifier: element.component_clause?.type_specifier,
          conditionExpression,
          assignment,
          bindings,
          cdlAnnotation,
          dialogAnnotation,
          unit,
          displayUnit,
          descriptionString
        })
      })
    })
  };
  return components
}

/**
 * Retrieves the class identifier from the given class specifier.
 *
 * @param {Object} classSpecifier - The class specifier object.
 * @returns {string|undefined} - The class identifier, or undefined if not found.
 */
function getClassIdentifier (classSpecifier) {
  return classSpecifier == null
    ? null
    : classSpecifier.long_class_specifier?.identifier ||
    classSpecifier.short_class_specifier?.identifier ||
    classSpecifier.der_class_specifier?.identifier
}

/**
 * Retrieves the class definition based on the provided JSON data and full class name.
 *
 * - :warning: Requires *full* class name (no class name lookup).
 * - Search within both standard class definitions and short class definitions.
 * - Search based on within and identifier.
 *
 * @param {string} fullClassName - The full class name to match against.
 * @param {Array} jsons - The JSON data to search within.
 * @param {Object} [classObject] - The class object or class definition containing
 *     the short class definition, only required for short class specifiers.
 * @returns {Object|null} - The class definition object if found — with additional
 *     within and fullMoFilePath properties — or null if not found.
 */
function getClassDefinition (fullClassName, jsons, classObject) {
  if (fullClassName == null) { return null }

  if (!/\./.test(fullClassName)) { // Test for short class definition: to be looked up in the class object
    const classDefinition = jsonQuery.findNestedObjects(classObject, 'class_definition')
      .find(d => getClassIdentifier(d?.class_specifier) === fullClassName)
    if (classDefinition != null) {
      return {
        ...classDefinition,
        ...{ within: classObject.within, fullMoFilePath: classObject.fullMoFilePath }
      }
    }
  }

  let within = fullClassName.replace(/^(.+)\.(.+)$/, '$1')
  const identifier = fullClassName.replace(/^(.+)\.(.+)$/, '$2')
  for (const classObject of jsonQuery.findNestedObjects(jsons, 'within', within)) {
    // Handle class_definition as array or non-array: see https://github.com/lbl-srg/modelica-json/issues/239
    for (const classDefinition of
      (Array.isArray(classObject.class_definition)
        ? classObject.class_definition
        : classObject.class_definition ? [classObject.class_definition] : [])) {
      if (getClassIdentifier(classDefinition.class_specifier) === identifier) {
        return {
          ...classDefinition,
          ...{ within, fullMoFilePath: classObject.fullMoFilePath }
        }
      }
    }
  }
  /* In case of Single File Mapping (typically for Types), the within clause shall
     be further truncated and the class definition looked up within the element_list
     of the package class. */
  const packageIdentifier = within.replace(/^(.+)\.(.+)$/, '$2')
  within = within.replace(/^(.+)\.(.+)$/, '$1')
  for (const classObject of jsonQuery.findNestedObjects(jsons, 'within', within)) {
    // Handles class_definition as array or non-array: see https://github.com/lbl-srg/modelica-json/issues/239
    for (const classDefinition of
      (Array.isArray(classObject.class_definition)
        ? classObject.class_definition
        : classObject.class_definition ? [classObject.class_definition] : [])) {
      if (getClassIdentifier(classDefinition.class_specifier) === packageIdentifier) {
        for (const element of classDefinition.class_specifier.long_class_specifier?.composition?.element_list) {
          if (getClassIdentifier(element.class_definition?.class_specifier) === identifier) {
            return {
              ...element.class_definition,
              ...{ within, fullMoFilePath: classObject.fullMoFilePath }
            }
          }
        }
      }
    }
  }
  logger.debug(`Class definition not found for: ${fullClassName}`)
  return null
}

/**
 * Converts a file path to a class name.
 *
 * @param {string} moFilePath - The file path to be converted.
 * @returns {string|undefined} - The converted class name if found on MODELICAPATH,
 *     otherwise undefined.
 */
function convertPathToClassName (moFilePath) {
  for (const p of utilM2j.getMODELICAPATH()) {
    if (moFilePath.includes(p)) {
      return moFilePath
        .replace(new RegExp(p + '/*|\\.mo$' + '', 'g'), '')
        .replace(new RegExp(path.sep, 'g'), '.')
    }
  }
}

/**
 * Looks up the class name based on the given type specifier.
 *
 * @param {string} typeSpecifier - The type specifier to lookup the class name for.
 * @param {string} within - The within clause of the class with the type instance.
 * @param {string} moFilePath - The Modelica file path of the class with the type instance.
 * @returns {string|undefined} - The class name if found, otherwise undefined.
 */
function lookupClassName (typeSpecifier, within, moFilePath) {
  const path = utilM2j.searchPath(
    [typeSpecifier],
    within,
    moFilePath)[0]
  if (path == null) {
    // Simple class names not found by 'searchPath' are short class definitions: these are returned unchanged
    if (!/\./.test(typeSpecifier)) return typeSpecifier
    else logger.debug(`Path not found for ${typeSpecifier} used in ${moFilePath}`)
  } else {
    const className = convertPathToClassName(path)
    // When mapping a package to a file, 'searchPath' returns the package path for any class in the package.
    // We then need to append the simple class name to the package path.
    const simpleClassNameToFind = typeSpecifier.split('.').slice(-1)[0]
    const simpleClassNameFound = className.split('.').slice(-1)[0]
    if (simpleClassNameFound !== simpleClassNameToFind) {
      return `${className}.${simpleClassNameToFind}`
    } else {
      return className
    }
  }
}

/**
 * Generates a regular expression from the given strings, flags, and optional parameters.
 *
 * - If useWholeWord each pattern is surrounded by \b.
 *   /\bmax\b/.test('TSup_max') returns false
 * - useGroupMatch adds parentheses around the pattern.
 *   Typically used to also return splitting patterns when splitting a string.
 * - If isFunction, transforms the pattern 'func' into 'func\s*('
 *   (because instance names may have function names, like 'mod')
 *
 * @param {Array<string>} strings - The array of strings to generate the regular expression from.
 * @param {string} flags - The flags to be used in the regular expression.
 * @param {boolean} [useWholeWord=true] - Indicates whether to perform a whole word match.
 * @param {boolean} [useGroupMatch=false] - Indicates whether to use group match in the regular expression.
 * @param {boolean} [isFunction=false] - Indicates whether the pattern is for a function.
 * @returns {RegExp} - The generated regular expression.
 */
function regexFrom (strings, flags, useWholeWord = true, useGroupMatch = false, isFunction = false) {
  let strForRegExp = strings
    // Remove new lines
    .map(s => s.replace(/\\n/g, ''))
    // Escape special characters
    .map(s => s.replace(/[()[\]{}*+?^$|#.,/\\\s-]/g, '\\$&'))
    .map(s => useWholeWord && /^[a-zA-Z]+$/.test(s) ? '\\b' + s + '\\b' : s)
    .map(s => isFunction ? s + '\\s*\\(' : s)
    // Sort for maximal munch
    .sort((a, b) => b.length - a.length)
    .join('|')
  strForRegExp = useGroupMatch ? `(${strForRegExp})` : strForRegExp
  return new RegExp(strForRegExp, flags)
}

/**
 * Splits an expression into an array of substrings based on operators and functions.
 *
 * - Function names are bundled with the opening parenthesis in the returned array
 *   (because instance names may have function names, like 'mod').
 *
 * @param {string | boolean | number | undefined} expression - The expression to be split.
 * @param {boolean} [keepOperator=false] - Whether to keep the operator in the resulting array.
 * @returns {Array<string> | string | boolean | number | undefined} - The array of substrings
 *     if the expression is a string, otherwise the expression itself.
 */
function splitExpression (expression, keepOperator = false) {
  if (typeof expression === 'string') {
    return expression
      .split(new RegExp(
        regexFrom(operators, '', true, keepOperator, false).source + // Split by operators
        '|' + // or
        regexFrom(functions, '', true, keepOperator, true).source)) // by functions
      .map(s => s?.replace(/\s+|\n/g, '')) // Remove spaces and new lines
      .filter(s => s != null && s.length > 0) // Exclude undefined and empty string
  } else if (['boolean', 'number'].includes(typeof expression) || expression == null) {
    return expression
  } else {
    logger.debug('Got expression with unsupported type: ' + expression)
  }
}

/**
 * Retrieves the parameters and bindings for a given class object,
 * and optionally the documentation of all instantiated classes.
 *
 * Not supported:
 * - Nested bindings such as: p(q(r=1))
 * - Record function calls such as: parameter Record p = Record(q=1)
 *
 * @param {Object} classObject - The class object to retrieve the parameters and bindings from.
 *     A class definition can also also be passed (for recursive calls) but it must contain
 *     additional within and fullMoFilePath properties.
 * @param {Array} jsons - The JSONs of all instantiated classes.
 *     Class definition is also accepted.
 * @param {boolean} [fetchDoc=false] - Whether to fetch the documentation.
 * @param {{name: string, protected: boolean, condition: boolean|string, cdlAnnotation: Object}} [_instance]
 *     Instance data — used for recursive calls only.
 * @param {Object} [_bindings] The bindings object — used for recursive calls only.
 * @returns {{parameters: Array<Object>, documentation: Array<Object>}}
 *     The parameters and documentation of the class object.
 * @property {Array<Object>} parameters - The parameters of the class object and all instantiated classes.
 * @property {Array<Object>} documentation - The documentation and instance data of the class object and
 *     all instantiated classes.
 * @property {Object} variables - The inputs, outputs and parameters of the class object and
 *     all instantiated classes, categorized by full class names.
 *
 * @todo Store in memory parameters and doc of types already processed to avoid redundant lookups.
 */
function getParametersAndBindings (classObject, jsons, fetchDoc = false, fetchVariables = false, _instance, _bindings) {
  const toReturn = { parameters: [], documentation: [], variables: {} }
  const components = getComponents(classObject, stringifyExpression)
  const componentNames = components.map(({ identifier }) => identifier)
  let componentFullClassName
  let classDefinition
  const inputs = []
  const outputs = []
  const parameters = []

  function prependIdentifier (identifier) {
    return `${_instance ? _instance.name + '.' : ''}${identifier}`
  }

  function prependExpression (expression) {
    const variablesToPrepend = splitExpression(expression)
    if (Array.isArray(variablesToPrepend)) {
      utilM2j.getUniqueObjectsFromArray(variablesToPrepend)
        .filter(s => componentNames.includes(s.match(variableRegExp)?.[1])) // Keep only variables that match component names
        .forEach(v => {
          expression = _instance
            ? expression.replaceAll(
              new RegExp('\\b' + v + '\\b', 'g'), // Whole word match to avoid 'ab' → 'ins$abins$b' if both a and b are also component names
              `${_instance.name}.${v}`)
            : expression
        })
    }
    return expression
  }

  function prependBindings (bindingsObject) {
    // This will modify bindingsObject inplace, which is fine with only one call for each component
    for (const [key, value] of Object.entries(bindingsObject ?? {})) {
      bindingsObject[key] = prependExpression(value)
    }
    return bindingsObject
  }

  function processUnitAttribute (unit) {
    const myUnit = unit?.function_call?.name === 'fill' // In case of array parameters
      ? unit.function_call.arguments[0].name
      : unit
    return myUnit == null ? null : `${myUnit}`.replace(/"/g, '') // Remove double quotes
  }

  function handleSimpleAssignment (toReturn, component) {
    const identifier = prependIdentifier(component.identifier)
    const unit = processUnitAttribute(component.unit)
    const displayUnit = processUnitAttribute(component.displayUnit)
    toReturn.parameters.push({
      name: identifier,
      value: (_bindings != null && _bindings[component.identifier])
        ? _bindings[component.identifier] // Bindings passed as arguments override local assignments
        : prependExpression(component.assignment),
      unit,
      displayUnit
    })
  }

  function handleCompositeComponent (toReturn, component, jsons, classDefinition, fetchDoc, fetchVariables) {
    /* Variables in bindings expressions are prepended by the name of the instance
     * of the class where the component with bindings is declared.
     * Example:
     *   class TopLevel parameter Real p=1; A a(q=p);
     *   class A parameter Real q=2; B b(r=q);
     *   Output: { p: 1, a.q: p, a.b.r: a.q }
     */
    const componentData = getParametersAndBindings(
      classDefinition,
      jsons,
      fetchDoc,
      fetchVariables,
      /* _instance= */ {
        name: prependIdentifier(component.identifier),
        protected: component.protected,
        condition: component.conditionExpression,
        cdlAnnotation: component.cdlAnnotation,
        descriptionString: component.descriptionString
      },
      /* _bindings= */ prependBindings(component.bindings)
    )
    toReturn.parameters.push(...componentData.parameters)
    if (fetchDoc) toReturn.documentation.push(...componentData.documentation)
    if (fetchVariables) {
      toReturn.variables = {
        ...toReturn.variables,
        ...componentData.variables
      }
    }
  }

  const fullClassName = classObject.within + '.' + getClassIdentifier(
    jsonQuery.getProperty(
      classObject.class_definition
        ? pathToClassSpecifier
        : pathToClassSpecifier.slice(-pathToClassSpecifier.length + 2), // If classObject is already a class definition
      classObject
    )
  )

  // Retrieve the documentation of the class object
  // We already exclude protected components and elementary CDL blocks for the documentation and variables
  fetchDoc = fetchDoc &&
    !_instance?.protected &&
    !/^Buildings\.Controls\.OBC\.CDL/.test(fullClassName)
  fetchVariables = fetchVariables &&
    !_instance?.protected &&
    !/^Buildings\.Controls\.OBC\.CDL/.test(fullClassName)

  if (fetchDoc) {
    const descriptionString = jsonQuery.getProperty(
      [
        ...(
          classObject.class_definition
            ? pathToClassSpecifier
            : pathToClassSpecifier.slice(-pathToClassSpecifier.length + 2) // If classObject is already a class definition
        ),
        'long_class_specifier',
        'description_string'
      ],
      classObject
    )
    const classAnnotation = jsonQuery.getProperty(
      classObject.class_definition
        ? pathToClassAnnotation
        : pathToClassAnnotation.slice(-pathToClassAnnotation.length + 2), // If classObject is already a class definition
      classObject
    )
    let cdlAnnotation = jsonQuery.findNestedObjects(
      classAnnotation, 'name', '__cdl')[0]?.modification
    cdlAnnotation = cdlAnnotation == null
      ? null
      : objectExtractor.parseModifications(cdlAnnotation)
    const documentationInfo = jsonQuery.findNestedObjects(
      // We don't use findNestedObjects to find the class Documentation as it would also return __cdl(Documentation(...)).
      classAnnotation?.filter(
        x => x.element_modification_or_replaceable?.element_modification?.name === 'Documentation')[0],
      'name', 'info')[0]?.modification?.expression?.simple_expression

    toReturn.documentation.push({
      instance: _instance,
      descriptionString,
      cdlAnnotation,
      documentationInfo,
      fullClassName
    })
  }

  // Retrieve the parameters and bindings of the class object
  // and the documentation of each composite component
  for (const component of components) {
    // Local declarations to store in variables
    if (fetchVariables) {
      if (component.typePrefix?.includes('parameter') &&
        !toReturn.variables.fullClassName?.parameters
      ) {
        parameters.push({
          type: component.typeSpecifier.split('.').slice(-1)[0],
          name: component.identifier,
          description: component.descriptionString,
          unit: processUnitAttribute(component.unit),
          dialogTab: component.dialogAnnotation?.tab ?? 'General',
          dialogGroup: component.dialogAnnotation?.group
        })
      } else if ( // Input connectors
        fetchVariables &&
        !toReturn.variables.fullClassName?.inputs &&
        /\.CDL\.Interfaces\..*Input$/.test(component.typeSpecifier)) {
        inputs.push({
          type: component.typeSpecifier.split('.').slice(-1)[0].replace('Input', ''),
          name: component.identifier,
          description: component.descriptionString,
          unit: processUnitAttribute(component.unit)
        })
      } else if ( // Output connectors
        fetchVariables &&
        !toReturn.variables.fullClassName?.outputs &&
        /\.CDL\.Interfaces\..*Output$/.test(component.typeSpecifier)) {
        outputs.push({
          type: component.typeSpecifier.split('.').slice(-1)[0].replace('Output', ''),
          name: component.identifier,
          description: component.descriptionString,
          unit: processUnitAttribute(component.unit)
        })
      }
    }
    // Local declarations of parameters and constants to store in parameters
    if (['parameter', 'constant'].some(el => component.typePrefix?.includes(el))) {
      // Primitive types
      if (primitiveTypes.includes(component.typeSpecifier)) {
        handleSimpleAssignment(toReturn, component)
        continue
      }
      componentFullClassName = lookupClassName(
        component.typeSpecifier, classObject.within, classObject.fullMoFilePath
      )
      classDefinition = getClassDefinition(componentFullClassName, jsons, classObject)
      if (classDefinition == null) continue
      // Enumeration types
      if (classDefinition.class_prefixes?.includes('type')) {
        handleSimpleAssignment(toReturn, component)
        continue
      }
      // Record types
      // parameter Record p(q=1) → Store p.q = 1 → need to process as any other composite class instance
      if (classDefinition.class_prefixes?.includes('record')) {
        handleCompositeComponent(toReturn, component, jsons, classDefinition,
          /* fetchDoc= */ false, /* fetchVariables= */ false) // No documentation and variables from record definitions
        continue
      }
    } else if ( // Instances of non primitive types (composite components) excluding I/O
      !(['input', 'output'].some(el => component.typePrefix?.includes(el))) &&
      !/\.CDL\.Interfaces\..*(Input|Output)$/.test(component.typeSpecifier) &&
      !primitiveTypes.includes(component.type_specifier)
    ) {
      componentFullClassName = lookupClassName(component.typeSpecifier, classObject.within, classObject.fullMoFilePath)
      classDefinition = getClassDefinition(componentFullClassName, jsons, classObject)
      if (classDefinition == null) continue
      handleCompositeComponent(toReturn, component, jsons, classDefinition, fetchDoc, fetchVariables)
    }
  }

  if (fetchVariables) {
    toReturn.variables = {
      ...toReturn.variables,
      [fullClassName]: { inputs, outputs, parameters }
    }
  }

  return toReturn
}

/**
 * Evaluates a *single* parameter in a given context, or a literal expression
 *
 * - Parameter *expressions* are not evaluated and are returned unchanged.
 * @example
 * // returns 2
 * evalInContext('a', , {a: 'b', b: 2}))
 * // See test/test_expressionEvaluation.js for more examples.
 * @param {string} str - The parameter or expression to evaluate.
 * @param {object} [context] - The context object containing variables and their values.
 * @param {string} [prefix] - A prefix to prepend to the parameter before
 *     evaluation (for nested instances).
 * @returns {*} - The result of the evaluation.
 */
function evalInContext (str, context, prefix) {
  // Tentative parameter evaluation
  const strInContext = prefix == null ? `${str}` : `${prefix}.${str}`
  if (context != null && Object.keys(context).includes(strInContext)) {
    return evalInContext(context[strInContext], context) // The prefix is not passed to the next call
  }
  // Literal expression evaluation
  if (/^(;|\s*)$/.test(str)) return str // We return the following characters unchanged: ; empty or blank strings

  // We remove any space within exponential numbers: 1e - 10 → 1e-10
  const exponentialRegExp = /(\d|\.)\s*(e|E)\s*(\+|-)*\s*\d/g
  const expArr = typeof str === 'string' ? str.match(exponentialRegExp) : null
  if (Array.isArray(expArr)) {
    expArr.forEach((v) => { str = str.replace(v, v.replace(/\s+/g, '')) })
  }

  // Modelica arrays are converted into JS arrays
  if (typeof str === 'string') {
    str = str
      .replace(/\{/g, '[')
      .replace(/\}/g, ']')
      .replaceAll(
        /\[.+?;.+?\]/g, // Array constructors with ;
        (match) => {
          const tmp = match
          return `[ ${tmp.replaceAll(/;/g, '], [')} ]`
        })
  }

  try {
    return Function('math', `"use strict"; return ${str}`)(math) /* eslint no-new-func: "off" */
  } catch (error) { return str }
}

/**
 * Evaluates an expression with the given context.
 *
 * - Recursively evaluates parameters within the expression.
 * - Ultimately returns the evaluated expression.
 * @example
 * // returns 2
 * evalExpression('a + b', {a: 1, b: 'a'})
 * // See test/test_expressionEvaluation.js for more examples.
 * @param {string} expression - The expression to evaluate.
 * @param {object} context - The context object containing variables and their values.
 * @param {string} [prefix] - A prefix to prepend to the parameter before evaluation
 *     (for nested instances).
 * @param {boolean} [_recursive=false] - Internal parameter used to indicate a recursive call.
 * @returns {*} - The result of the evaluated expression.
 */
function evalExpression (expression, context, prefix, _recursive = false) {
  // Boolean and number literals are returned unchanged
  if (['boolean', 'number'].includes(typeof expression)) {
    return expression
  }
  // Only string expressions can be evaluated, other types are returned unchanged
  if (typeof expression !== 'string' || expression == null) {
    return expression
  }
  let exprToEvaluate = splitExpression(expression, true) // Keeps operators and functions in returned array
  if (Array.isArray(exprToEvaluate)) {
    // Evaluate each member of the expression with the given context and prefix
    for (const [idx, term] of Object.entries(exprToEvaluate)) {
      exprToEvaluate[idx] = evalInContext(term, context, prefix)
      // Any null term means that the expression cannot be evaluated and we return null
      if (exprToEvaluate[idx] == null) return null
      /* The parameter value found in context may be another expression with parameters
         to be further evaluated. No prefix is used anymore as exprToEvaluate[idx]
         already comes from the context. */
      const termEvalSplit = splitExpression(exprToEvaluate[idx])
      if (Array.isArray(termEvalSplit) && termEvalSplit.some(
        x => Object.keys(context).includes(x))) {
        exprToEvaluate[idx] = evalExpression(
          exprToEvaluate[idx], context, undefined, true)
      }
      if (Array.isArray(exprToEvaluate[idx])) {
        // Arrays need to be stringified so they are not expanded by the join function below
        exprToEvaluate[idx] = JSON.stringify(exprToEvaluate[idx])
      }
    }
    // At this step we only have literal elements that we merge into a string
    exprToEvaluate = exprToEvaluate.join(' ')
  }
  // Ultimately evaluate the expression which is now either literal or a single parameter
  if (_recursive) { prefix = undefined } // Reset prefix in case of a recursive call
  return evalInContext(convertSymbolsInExpression(exprToEvaluate), context, prefix)
}

function convertSymbolsInExpression (expression) {
  const mapping = {
    if: '',
    then: ' ? ',
    else: ' : ',
    elseif: ' : ',
    and: '&&',
    or: '||',
    not: '!',
    '<>': '!=',
    '^': '**'
  }
  const enumRegExp = /[a-zA-Z]+\w*(\.[a-zA-Z]+\w*)+/g
  /* Following regex is used to find Modelica functions that can be directly evaluated
     with math.js but that have not been prefixed with 'math.' yet. */
  const functionsMathJSRaw = new RegExp(/(?<!math\s*\.\s*)/.source +
    regexFrom(functionsMathJS, '', true, true, true).source, 'g')
  return expression
    .replaceAll(enumRegExp, '\'$&\'') // Add quotes to enumerations so expressions can be evaluated with string comparison (==|!=)
    .replaceAll(
      regexFrom(Object.keys(mapping), 'g'),
      (match) => mapping[match])
    .replaceAll(
      functionsMathJSRaw,
      (match) => `math.${match}`)
}

module.exports.getClassDefinition = getClassDefinition
module.exports.getComponents = getComponents
module.exports.evalExpression = evalExpression
module.exports.evalInContext = evalInContext
module.exports.getParametersAndBindings = getParametersAndBindings
module.exports.lookupClassName = lookupClassName
module.exports.splitExpression = splitExpression

module.exports.functions = functions
module.exports.operators = operators
module.exports.primitiveTypes = primitiveTypes
