'use strict'
const expressionToString = require('../json2mo/expression.js')
const jsonQuery = require('../lib/jsonquery')
const logger = require('winston'); // This retrieves the default logger which is configured in app.js
const objectExtractor = require('../lib/objectExtractor.js')
const path = require('path')
const utilM2j = require('../lib/util.js')
global.math = require("mathjs"); // Import in global scope to be used by indirect eval.

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
  'min', 'max', 'sum',
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
const pathToComposition = pathToClassSpecifier.concat(['long_class_specifier', 'composition'])
const pathToClassAnnotation = pathToComposition.concat(['annotation'])


/**
 * Converts an expression object into a string that can be evaluated with JS eval.
 *
 * - Technical debts:
 *   - Modleica function rem() not supported yet.
 *   - Array construction by comprehension not supported yet.
 *
 * @param {Object} obj The expression object to be converted.
 * @returns {string} The string representation of the expression.
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
          name: 'math.floor',  // Modelica integer() is equivalent to Math.floor() in JS
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
  if (obj.if_expression) {
    /* Logical NOT in JS requires parentheses to be added around the negated expression.
       Otherwise: ! 2 < 3 is interpreted as ! 2 (= false → 0) < 3
       which evaluates to true instead of false. */
    return expressionToString.parse(JSON.parse(JSON.stringify(obj, // We use the recursive algorithm of JSON.stringify
      (key, val) => {
        if (val.not) return Object.assign(
          JSON.parse(JSON.stringify(val)), // Copy the object to avoid modifying the original
          {
            arithmetic_expressions: [
              { name: '(' + val.arithmetic_expressions[0].name },
              { name: val.arithmetic_expressions[1].name + ')' },
            ]
          }
        )
        else return val
      })))
  }
  return expressionToString.parse(obj)
}

/**
 * Extracts and returns the components of a class object.
 *
 * - The 'unit' property is only populated for primitive type instances with a declaration attribute.
 *   (Non-primitive types are not parsed to retrieve the original 'unit' value.)
 *
 * @param {Object} classObject The class object to extract components from.
 *     Class definition is also accepted.
 * @param {function} [stringifyExpression=] Function to convert expression
 *     objects into Modelica expressions (strings).
 * @returns {Array} An array of components extracted from the class object.
 */
function getComponents (classObject, stringifyExpression) {
  const components = [];
  let annotation_cdl;
  let modification;
  let assignment;
  let bindings;
  let condition_expression;
  let unit;
  const elements = {
    'public': jsonQuery.findNestedObjects(classObject, 'element_list').concat(
      jsonQuery.findNestedObjects(classObject, 'public_element_list')).flat(),
    'protected': jsonQuery.findNestedObjects(classObject, 'protected_element_list').flat()
  }
  for (const [key, subset] of Object.entries(elements)) { // key = protected | public
    subset.forEach((element) => {
      // JSON parser may yield undefined values for public_element_list or protected_element_list.
      element?.component_clause?.component_list.forEach((component) => {
        annotation_cdl = jsonQuery.findNestedObjects(
          component.description?.annotation, 'name', '__cdl'
        )[0]?.modification
        annotation_cdl = annotation_cdl == null
          ? null
          : objectExtractor.parseModifications(annotation_cdl, stringifyExpression)
        modification = component.declaration.modification
        /* objectExtractor.parseModifications only parses ***class*** modifications:
           direct assignments (such as in parameter declarations) are not returned. */
        bindings = modification == null
          ? null
          : objectExtractor.parseModifications(modification, stringifyExpression)
        assignment = modification?.equal == null
          ? null
          : stringifyExpression != null ? stringifyExpression(modification.expression) : modification.expression
        condition_expression = component.condition_attribute?.expression == null // Replace undefined with null
          ? null
          : component.condition_attribute.expression
        unit = jsonQuery.findNestedObjects(element, 'name', 'unit')[0]
        unit = unit == null
          ? null
          : unit.modification.expression.simple_expression
        components.push({
          protected: key === 'protected',
          final: element.final ?? false,
          identifier: component.declaration.identifier,
          type_prefix: element.component_clause?.type_prefix,
          type_specifier: element.component_clause?.type_specifier,
          condition_expression,
          assignment,
          bindings,
          annotation_cdl,
          unit,
        });
      });
    });
  };
  return components
}

/**
 * Retrieves the class identifier from the given class specifier.
 *
 * @param {object} classSpecifier The class specifier object.
 * @returns {string|undefined} The class identifier, or undefined if not found.
 */
function getClassIdentifier (classSpecifier) {
  return classSpecifier == null
    ? null
    : classSpecifier.long_class_specifier?.identifier ||
    classSpecifier.short_class_specifier?.identifier ||
    classSpecifier.der_class_specifier?.identifier
}

/**
 * Retrieves the class definition based on the provided JSON data and type specifier.
 * :warning: Requires *full* type_specifier (no class name lookup).
 * Search within both standard class definitions and short class definitions.
 * Search based on within and identifier.
 *
 * @param {Array} jsons The JSON data to search within.
 * @param {string} type_specifier The type specifier to match against.
 * @param {Object=} classObject The class object or class definition containing the short class definition,
 *     only required for short class specifiers.
 * @returns {Object|null} The class definition object if found — with additional 'within' and
 *     'fullMoFilePath' properties — or null if not found.
 */
function getClassDefinition (jsons, type_specifier, classObject) {
  if (type_specifier == null) { return null }

  if (!/\./.test(type_specifier)) { // Short class definition looked up in the class object
    const classDefinition = jsonQuery.findNestedObjects(classObject, 'class_definition').filter(
      d => getClassIdentifier(d.class_specifier) === type_specifier
    )[0]
    if (classDefinition != null) {
      return {
        ...classDefinition,
        ...{ within: classObject.within, fullMoFilePath: classObject.fullMoFilePath }
      }
    }
  }

  let within = type_specifier.replace(/^(.+)\.(.+)$/, '$1');
  let identifier = type_specifier.replace(/^(.+)\.(.+)$/, '$2');
  for (const classObject of jsonQuery.findNestedObjects(jsons, 'within', within)) {
    // handle class_definition as array or non-array: see https://github.com/lbl-srg/modelica-json/issues/239
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
  let packageIdentifier = within.replace(/^(.+)\.(.+)$/, '$2');
  within = within.replace(/^(.+)\.(.+)$/, '$1');
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
  logger.debug(`Class definition not found for: ${type_specifier}`)
  return null
}

/**
 * Converts a file path to a class name.
 *
 * @param {string} moFilePath The file path to be converted.
 * @returns {string} The converted class name.
 */
function convertPathToClassName (moFilePath) {
  for (const p of utilM2j.getMODELICAPATH()) {
    if (moFilePath.includes(p)) {
      return moFilePath
        .replace(new RegExp(p + '/|\\.mo$' + '', 'g'), '')
        .replace(new RegExp(path.sep, 'g'), '.')
    }
  }
}

/**
 * Looks up the class name based on the given type specifier.
 *
 * @param {string} typeSpecifier The type specifier to lookup the class name for.
 * @param {string} within The within clause of the class with the type instance.
 * @param {string} moFilePath The Modelica file path of the class with the type instance.
 * @returns {string|undefined} The class name if found, otherwise undefined.
 */
function lookupClassName (typeSpecifier, within, moFilePath) {
  const path = utilM2j.searchPath(
    [typeSpecifier],
    within,
    moFilePath)[0]
  if (path == null) {
    // Simple class names not found are short class definitions: these are returned unchanged
    if (!/\./.test(typeSpecifier)) return typeSpecifier;
    else logger.debug(`Path not found for ${typeSpecifier} used in ${moFilePath}`);
  }
  else { return convertPathToClassName(path) }
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
 * @param {Array<string>} strings The array of strings to generate the regular expression from.
 * @param {string} flags The flags to be used in the regular expression.
 * @param {boolean} [useWholeWord=true] Indicates whether to perform a whole word match.
 * @param {boolean} [useGroupMatch=false] Indicates whether to use group match in the regular expression.
 * @param {boolean} [isFunction=false] Indicates whether the pattern is for a function.
 * @returns {RegExp} The generated regular expression.
 */
function regexFrom (strings, flags, useWholeWord = true, useGroupMatch = false, isFunction = false) {
  let strForRegExp = strings
    // Remove new lines
    .map(s => s.replace(/\\n/g, ''))
    // Escape special characters
    .map(s => s.replace(/[()[\]{}*+?^$|#.,\/\\\s-]/g, "\\$&"))
    .map(s => useWholeWord && /^[a-zA-Z]+$/.test(s) ? '\\b' + s + '\\b' : s)
    .map(s => isFunction ? s + '\\s*\\(' : s)
    // Sort for maximal munch
    .sort((a, b) => b.length - a.length)
    .join("|")
  strForRegExp = useGroupMatch ? `(${strForRegExp})` : strForRegExp
  return new RegExp(strForRegExp, flags)
}

/**
 * Splits an expression into an array of substrings based on operators and functions.
 *
 * - Function names are bundled with the opening parenthesis in the returned array
 *   (because instance names may have function names, like 'mod').
 *
 * @param {string | boolean | number | undefined} expression The expression to be split.
 * @param {boolean} [keepOperator=false] Whether to keep the operator in the resulting array.
 * @returns {Array<string> | string | boolean | number | undefined} The array of substrings
 *     if the expression is a string, otherwise the expression itself.
 */
function splitExpression (expression, keepOperator = false) {
  if (typeof expression === 'string') {
    return expression
      .split(new RegExp(
        regexFrom(operators, '', true, keepOperator, false).source + // Split by operators
        '|' +                                                        // or
        regexFrom(functions, '', true, keepOperator, true).source))  // by functions
      .map(s => s?.replace(/\s+|\n/g, '')) // Remove spaces and new lines
      .filter(s => s != null && s.length > 0) // Exclude undefined and empty string
  } else if (['boolean', 'number'].includes(typeof expression) || expression == null) {
    return expression
  } else {
    logger.debug('Got expression with unsupported type: ' + expression)
  }
}

/**
 * Retrieves the parameters and bindings for a given class object, using the JSONs of all instantiated classes.
 *
 * Not supported:
 * - Nested bindings such as: p(q(r=1))
 * - Record function calls such as: parameter Record p = Record(q=1)
 *
 * @param {Array} jsons The JSONs of all instantiated classes.
 * @param {Object} classObject The class object to retrieve the parameters and bindings from.
 *     Class definition is also accepted.
 * @param {boolean} [fetchDoc=false] Whether to fetch the documentation.
 * @param {{name: string, protected: boolean, condition: boolean|string, cdlAnnotation: Object}} [_instance=]
 *     Instance data — used for recursive calls only.
 * @param {Object} [_bindings=] The bindings object — used for recursive calls only.
 * @returns {{parameters: Object, units: Object, documentation: Array<Object>}}
 *     The parameters, parameter units and documentation of the class object.
 *
 * @todo Store in memory parameters and doc of types already processed to avoid redundant lookups.
 */
function getParametersAndBindings (jsons, classObject, fetchDoc = false, _instance, _bindings) {
  const toReturn = { parameters: {}, units: {}, documentation: [] };
  let components = getComponents(classObject, stringifyExpression);
  let componentNames = components.map(({ identifier }) => identifier);
  let fullClassName;
  let classDefinition;

  function prependIdentifier (identifier, separator = '$') {
    /* We use `$` as default separator between instances because '.' is reserved
       in JS to access object properties. So eval('a.b') will error even if
       'a.b' is defined in the context. */
    return (_instance ? `${_instance.name}${separator}` : '') + identifier
  }

  function prependExpression (expression, separator = '$') {
    const variablesToPrepend = splitExpression(expression)
    if (Array.isArray(variablesToPrepend)) {
      utilM2j.getUniqueObjectsFromArray(variablesToPrepend)
        .filter(s => componentNames.includes(s.match(variableRegExp)?.[1])) // Keep only variables that match component names
        .forEach(v => {
          expression = _instance
            ? expression.replaceAll(
              new RegExp('\\b' + v + '\\b', "g"), // Whole word match to avoid 'ab' → 'ins$abins$b' if both a and b are also component names
              `${_instance.name}${separator}${v}`)
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

  function handleSimpleAssignment (toReturn, component) {
    const identifier = prependIdentifier(component.identifier)
    Object.assign(
      toReturn.parameters,
      {
        [identifier]: // Square brackets are used to pass a variable as key
          (_bindings != null && _bindings[component.identifier])
            ? _bindings[component.identifier] // Bindings passed as arguments override local assignments
            : prependExpression(component.assignment)
      });
    Object.assign(
      toReturn.units,
      {
        [identifier]: component.unit?.function_call?.name == "fill" // In case of array parameters
          ? component.unit.function_call.arguments[0].name
          : component.unit
      });
  }

  function handleCompositeComponent (toReturn, component, jsons, classDefinition, fetchDoc) {
    /* Variables in bindings expressions are prepended by the name of the instance
     * of the class where the component with bindings is declared.
     * Example:
     * class TopLevel parameter Real p=1; A a(q=p);
     * class A parameter Real q=2; B b(r=q);
     * Output: { p: 1, a.q: p, a.b.r: a.q }
     */
    const componentData = getParametersAndBindings(
      jsons,
      classDefinition,
      fetchDoc,
      /* _instance= */ {
        name: prependIdentifier(component.identifier),
        protected: component.protected,
        condition: component.condition_expression,
        cdlAnnotation: component.annotation_cdl,
      },
      /* _bindings= */ prependBindings(component.bindings)
    )
    Object.assign(
      toReturn.parameters,
      componentData.parameters
    )
    Object.assign(
      toReturn.units,
      componentData.units
    )
    if (fetchDoc) {
      toReturn.documentation.push(
        ...componentData.documentation
      )
    }
  }

  for (const component of components) {
    // Local declarations of parameters and constants
    if (['parameter', 'constant'].some(el => component.type_prefix?.includes(el))) {
      // Primitive types
      if (primitiveTypes.includes(component.type_specifier)) {
        handleSimpleAssignment(toReturn, component)
        continue
      }
      fullClassName = lookupClassName(component.type_specifier, classObject.within, classObject.fullMoFilePath)
      classDefinition = getClassDefinition(jsons, fullClassName, classObject)
      if (classDefinition == null) continue;
      // Enumeration types
      if (classDefinition.class_prefixes?.includes('type')) {
        handleSimpleAssignment(toReturn, component)
        continue
      }
      // Record types
      // parameter Record p(q=1) → Store p.q = 1 → need to process as any other composite class instance
      if (classDefinition.class_prefixes?.includes('record')) {
        handleCompositeComponent(toReturn, component, jsons, classDefinition, /* fetchDoc= */ false)
        continue
      }
    }
    // Instances of non primitive types (composite components) excluding I/O
    else if (
      !(['input', 'output'].some(el => component.type_prefix?.includes(el))) &&
      !/\.CDL\.Interfaces\..*(Input|Output)$/.test(component.type_specifier) &&
      !primitiveTypes.includes(component.type_specifier)
    ) {
      fullClassName = lookupClassName(component.type_specifier, classObject.within, classObject.fullMoFilePath)
      classDefinition = getClassDefinition(jsons, fullClassName, classObject)
      if (classDefinition == null) continue;
      handleCompositeComponent(toReturn, component, jsons, classDefinition, fetchDoc)
    }
  }

  fullClassName = classObject.within + '.' + getClassIdentifier(jsonQuery.getProperty(
    classObject.class_definition
      ? pathToClassSpecifier
      : pathToClassSpecifier.slice(-pathToClassSpecifier.length + 2),  // If classObject is already a class definition
    classObject
  ))

  // We already exclude protected components and elementary CDL blocks from the documentation
  fetchDoc = fetchDoc &&
    !_instance?.protected &&
    !/^Buildings\.Controls\.OBC\.CDL/.test(fullClassName)

  if (fetchDoc) {
    const classAnnotation = jsonQuery.getProperty(
      classObject.class_definition
        ? pathToClassAnnotation
        : pathToClassAnnotation.slice(-pathToClassAnnotation.length + 2),  // If classObject is already a class definition
      classObject
    )
    let classCdlAnnotation = jsonQuery.findNestedObjects(classAnnotation, 'name', '__cdl')[0]?.modification
    classCdlAnnotation = classCdlAnnotation == null
      ? null
      : objectExtractor.parseModifications(classCdlAnnotation)
    const classDocInfo = jsonQuery.findNestedObjects(
      // We don't use findNestedObjects to find the class Documentation as it would also return __cdl(Documentation(...)).
      classAnnotation?.filter(
        x => x.element_modification_or_replaceable?.element_modification?.name === "Documentation")[0],
      'name', 'info')[0]?.modification?.expression?.simple_expression

    toReturn.documentation.push({
      instance: _instance,
      classCdlAnnotation,
      classDocInfo,
      fullClassName,
    })
  }

  return toReturn
}

// Functions and terms that can be readily evaluated in expressions using math.js
const mathFunctions = [
  'abs', 'cos', 'cosh', 'sin', 'sinh', 'tan', 'tanh', 'max', 'min', 'sqrt', 'mod', 'ceil', 'floor', 'sign',
]
const exponentialRegExp = /(\d|\.)\s*(e|E)\s*(\+|-)*\s*\d/g // Scientific number = real number optionally followed by an exponent
const mathSymbolsRegExp = new RegExp(
  regexFrom(mathFunctions, '', true, false, true).source +
  '|' +
  exponentialRegExp.source
)

/**
 * Evaluates a *single* parameter in a given context, or a literal expression
 *
 * - Parameter *expressions* are not evaluated and are returned unchanged.
 *
 * @param {string} str The parameter or expression to evaluate.
 * @param {object=} context The context object containing variables and their values.
 * @param {string=} prefix An optional prefix to prepend to the parameter before
 *     evaluation (for nested instances).
 * @param {string='$'} separator Character used as separator between instance names.
 * @returns {*} The result of the evaluation.
 * @example
 * evalInContext('a', , {a: 'b', b: 2})) // returns 2
 * @example
 * evalInContext('math.floor([-3.14, 3.14])') // returns [ -4, 3 ]
 * @example
 * evalInContext('a + 1', {a: 1}) // returns 'a + 1' (unsuccessful evaluation)
 * @example
 * evalInContext('b', {a$b: 'c', b: 2, c: 1}, 'a') // returns 1
 */
function evalInContext (str, context, prefix, separator = '$') {
  // Tentative parameter evaluation
  const strPrefixed = prefix ? `${prefix}${separator}${str}` : str
  if (context != null && Object.keys(context).includes(strPrefixed)) {
    /* We return each evaluation from context surrounded by parentheses
       to avoid issues such as: a / b → 1 / 1 * 2 = 2 instead of 0.5 */
    return evalInContext(context[strPrefixed], context) // The prefix is not passed to the next call
  }
  // Literal expression evaluation
  if (/^(;|\s*)$/.test(str)) { return str } // We return the following characters unchanged: ; empty or blank strings

  // We remove any space within exponential numbers: 1e - 10 → 1e-10
  let expArr = typeof str === 'string' ? str.match(exponentialRegExp) : null
  if (Array.isArray(expArr)) {
    expArr.forEach(v => str = str.replace(v, v.replace(/\s+/g, '')))
  }

  /* We use eval because we need to evaluate expressions that may contain
     'if' 'else' statements, and a function constructor with 'return (if ...)'
     would error. The use of indirect eval?.() is based on the rationale from
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_direct_eval!
     This requires importing all dependencies in the global scope, e.g., math.js. */
  try { return eval?.(`"use strict"; ${str}`) }
  catch (error) { return str }
}

/**
 * Evaluates an expression with the given context.
 *
 * - Recursively evaluates parameters within the expression.
 * - Ultimately returns the evaluated expression.
 *
 * @example
 * evalExpression('a + b', {a: 1, b: 'a'}) // returns 2
 * @param {string} expression The expression to evaluate.
 * @param {object} context The context object containing variables and their values.
 * @param {string=} prefix Optional prefix to prepend to the parameter before evaluation (for nested instances).
 * @param {string='$'} separator Character used as separator between instance names.
 * @param {boolean=false} _recursive Internal parameter used to indicate a recursive call.
 * @returns {*} The result of the evaluated expression.
 */
function evalExpression (expression, context, prefix, separator = '$', _recursive = false) {
  if (!['boolean', 'number', 'string'].includes(typeof expression) || expression == null) { return expression }
  let exprToEvaluate = splitExpression(expression, true) // Keeps operators and functions in returned array
  if (Array.isArray(exprToEvaluate)) {
    // Evaluate each member of the expression with the given context and prefix
    for (const [idx, term] of Object.entries(exprToEvaluate)) {
      exprToEvaluate[idx] = evalInContext(term, context, prefix, separator)
      // Any term null means that the expression cannot be evaluated and we return null
      if (exprToEvaluate[idx] == null) return null;
      // The parameter value found in context may be another expression with parameters to be further evaluated
      const termEvalSplit = splitExpression(exprToEvaluate[idx])
      if (Array.isArray(termEvalSplit) && termEvalSplit.some(
        x => Object.keys(context).includes(x))) {
          exprToEvaluate[idx] = evalExpression(exprToEvaluate[idx], context, undefined, separator, true)
          if (Array.isArray(exprToEvaluate[idx])) {
            // Arrays need to be stringified so they are not expanded by the join function below
            exprToEvaluate[idx] = JSON.stringify(exprToEvaluate[idx])
          }
        }
    }
    // At this step we only have literal elements that we merge into a string
    exprToEvaluate = exprToEvaluate.join(' ')
  }
  // Ultimately evaluate the expression which is now either literal or a single parameter
  if (_recursive) { prefix = undefined }  // Reset prefix in case of a recursive call
  return evalInContext(convertSymbols(exprToEvaluate), context, prefix, separator)
}

function convertSymbols (expression) {
  const mapping = {
    'if': 'if (',
    'then': ')',
    'else': '; else',
    'elseif': '; else if (',
    'and': '&&',
    'or': '||',
    'not': '!',
    '<>': '!=',
    '^': '**',
  }
  const enumRegExp = /[a-zA-Z]+\w*(\.[a-zA-Z]+\w*)+/g
  return expression
    .replaceAll(
      regexFrom(Object.keys(mapping), 'g'),
      (match) => mapping[match])
    .replaceAll(enumRegExp, '\'$&\'') // Add quotes to enumerations so they can be evaluated with string comparison (==|!=)
}


module.exports.getClassDefinition = getClassDefinition
module.exports.getComponents = getComponents
module.exports.evalExpression = evalExpression
module.exports.evalInContext = evalInContext
module.exports.getParametersAndBindings = getParametersAndBindings
module.exports.lookupClassName = lookupClassName

module.exports.functions = functions
module.exports.operators = operators
module.exports.primitiveTypes = primitiveTypes
