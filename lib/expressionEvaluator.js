'use strict'
const logger = require('winston')
const math = require('mathjs')
const utilM2j = require('../lib/util')

const operators = [
  '==', '<>', '>', '>=', '<', '<=', // relational-operator
  'if', 'then', 'else', 'elseif', // expression
  'not', 'and', 'or', // logical
  '&&', '||', // logical JS
  '+', '.+', '-', '.-', // add-operator
  '*', '.*', '/', '.*', // mul-operator
  '^', '.^', // factor
  'der', 'false', 'true', '{', '}', '(', ')', '[', ']', ';', // primary
  ',', 'for', ':' // array-arguments and subscripts
]
const functions = [ // https://obc.lbl.gov/specification/cdl.html#functions
  'abs', 'sign',
  'sqrt',
  'div', 'mod', 'rem',
  'ceil', 'floor', 'integer',
  'min', 'max', 'sum',
  'fill', 'size'
]
const variableRegExp = /^\.?(\D\w*)(\.\w+)*/

/**
 * Extracts and returns the components of a class object.
 *
 * @param {Object} classObject - The class object to extract components from. Class definition is also accepted.
 * @param {boolean} [parseExpression=true] - Whether to parse expressions.
 * @returns {Array} An array of components extracted from the class object.
 */
function getComponents (classObject, parseExpression = true) {
  const components = [];
  let final;
  let annotation_cdl;
  let modification;
  let assignment;
  let bindings;
  let condition_expression;
  const elements = {
    'public': jsonQuery.findNestedObjects(classObject, 'element_list').concat(
      jsonQuery.findNestedObjects(classObject, 'public_element_list')).flat(),
    'protected': jsonQuery.findNestedObjects(classObject, 'protected_element_list').flat()
  }
  for (const [key, value] of Object.entries(elements)) {  // key = protected | public
    value.forEach((element) => {
      // JSON parser may yield undefined values for public_element_list or protected_element_list.
      element?.component_clause?.component_list.forEach((component) => {
        annotation_cdl = jsonQuery.findNestedObjects(component.description?.annotation, 'name', '__cdl')[0]?.modification
        annotation_cdl = annotation_cdl == null
          ? undefined
          : objectExtractor.parseModifications(annotation_cdl, parseExpression)
        modification = component.declaration.modification
        /* objectExtractor.parseModifications only parses ***class*** modifications:
           direct assignments (such as in parameter declarations) are not returned. */
        bindings = modification == null
          ? undefined
          : objectExtractor.parseModifications(modification, parseExpression)
        assignment = modification?.equal == null
          ? undefined
          : parseExpression ? expressionParser.parse(modification.expression) : modification.expression
        condition_expression = component.condition_attribute?.expression
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
        });
      });
    });
  };
  return components
}

/**
 * Retrieves the class identifier from the given class specifier.
 *
 * @param {object} classSpecifier - The class specifier object.
 * @returns {string|undefined} - The class identifier, or undefined if not found.
 */
function getClassIdentifier (classSpecifier) {
  return classSpecifier.long_class_specifier?.identifier ||
    classSpecifier.short_class_specifier?.identifier ||
    classSpecifier.der_class_specifier?.identifier
}

/**
 * Retrieves the class definition based on the provided JSON data and type specifier.
 * :warning: Requires *full* type_specifier (no class name lookup).
 * Search within both standard class definitions and short class definitions.
 * Search based on within and identifier.
 *
 * @param {Array} jsons - The JSON data to search within.
 * @param {string} type_specifier - The type specifier to match against.
 * @returns {Object|null} - The class definition object if found (with additional within and fullMoFilePath properties), or null if not found.
 */
function getClassDefinition (jsons, type_specifier) {
  if (type_specifier == null) { return null }
  let within = type_specifier.replace(/^(.+)\.(.+)$/, '$1');
  let identifier = type_specifier.replace(/^(.+)\.(.+)$/, '$2');
  for (const classObject of jsonQuery.findNestedObjects(jsons, 'within', within)) {
    // handle class_definition as array or non-array: see https://github.com/lbl-srg/modelica-json/issues/239
    for (const classDefinition of
      (Array.isArray(classObject.class_definition)
        ? classObject.class_definition
        : classObject.class_definition ? [classObject.class_definition] : [])) {
      if (classDefinition == null) { console.log(classObject) }
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
}

/**
 * Converts a file path to a class name.
 *
 * @param {string} moFilePath - The file path to be converted.
 * @returns {string} - The converted class name.
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
 * @param {string} typeSpecifier - The type specifier to lookup the class name for.
 * @param {string} within - The within clause of the class with the type instance.
 * @param {string} moFilePath - The Modelica file path of the class with the type instance.
 * @returns {string|undefined} - The class name if found, otherwise undefined.
 */
function lookupClassName (typeSpecifier, within, moFilePath) {
  const pathfound = utilM2j.searchPath(
    [typeSpecifier],
    within,
    moFilePath)[0]
  if (pathfound == null) {
    // FIXME: logger
    console.log('Path not found for ' + typeSpecifier + ' used in ' + moFilePath)
  }
  else { return convertPathToClassName(pathfound) }
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
 * @param {string | boolean | number | undefined} expression - The expression to be split.
 * @param {boolean} [keepOperator=false] - Whether to keep the operator in the resulting array.
 * @returns {Array<string> | string | boolean | number | undefined} - The array of substrings if the expression is a string, otherwise the expression itself.
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
  } else if (['boolean', 'number', 'undefined'].includes(typeof expression)) {
    return expression
  } else {
    // FIXME: logger
    console.log('Got expression with unsupported type: ' + expression)
  }
}

/**
 * Retrieves the parameters and bindings from the given JSONs, class object, instance name, and bindings.
 *
 * Not supported:
 * - Nested bindings such as: p(q(r=1))
 * - Record function calls such as: parameter Record p = Record(q=1)
 *
 * @param {Array} jsons - The JSONs to retrieve the parameters and bindings from.
 * @param {Object} classObject - The class object to retrieve the parameters and bindings from. Class definition is also accepted.
 * @param {string} [instanceName] - The name of the instance.
 * @param {Object} [bindings] - The bindings object.
 * @returns {Object} - The parameters object.
 */
function getParametersAndBindings (jsons, classObject, instanceName = undefined, bindings = undefined) {
  const parameters = {};
  let components = getComponents(classObject);
  let componentNames = components.map(({ identifier }) => identifier);
  let classDefinition;

  function prependIdentifier (identifier, separator = '$') {
    // We use `$` as separator between instances because `.` is reserved in JS to access object properties.
    // So eval('a.b') errors even if 'a.b' is defined in global context.
    return (instanceName ? `${instanceName}${separator}` : '') + identifier
  }

  function prependExpression (expression, separator = '$') {
    const variablesToPrepend = splitExpression(expression)
    if (Array.isArray(variablesToPrepend)) {
      utilM2j.getUniqueObjectsFromArray(variablesToPrepend)
        .filter(s => componentNames.includes(s.match(variableRegExp)?.[1])) // Keep only variables that match component names
        .forEach(v => {
          expression = instanceName
            ? expression.replaceAll(
              new RegExp('\\b' + v + '\\b', "g"), // Whole word match to avoid 'ab' → 'ins$abins$b' if both a and b are component names
              `${instanceName}${separator}${v}`)
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

  function handleSimpleAssignment (parameters, component) {
    Object.assign(
      parameters,
      {
        [prependIdentifier(component.identifier)]: // Square brackets allow using a variable as key
        (bindings != null && bindings[component.identifier])
          ? bindings[component.identifier] // Bindings passed as arguments override local assignments
          : prependExpression(component.assignment)
      });
  }

  function handleCompositeComponent (parameters, component, jsons, classDefinition) {
    /* Variables in bindings expressions are prepended by the name of the instance
     * of the class where the component with bindings is declared.
     * Example:
     * class TopLevel parameter Real p=1; A a(q=p);
     * class A parameter Real q=2; B b(r=q);
     * Output: { p: 1, a.q: p, a.b.r: a.q }
     */
    Object.assign(
      parameters,
      getParametersAndBindings(
        jsons,
        classDefinition,
        prependIdentifier(component.identifier),
        prependBindings(component.bindings)
      )
    );
  }

  for (const component of components) {
    // Local declarations of parameters and constants
    if (['parameter', 'constant'].some(el => component.type_prefix?.includes(el))) {
      // Primitive types
      if (primitiveTypes.includes(component.type_specifier)) {
        handleSimpleAssignment(parameters, component)
        continue
      }
      classDefinition = getClassDefinition(
        jsons,
        lookupClassName(component.type_specifier, classObject.within, classObject.fullMoFilePath))
      if (classDefinition == null) {
        // FIXME: logger
        console.log('Class definition not found for: ' + component.type_specifier)
        continue
      }
      // Enumeration types
      if (classDefinition.class_prefixes?.includes('type')) {
        handleSimpleAssignment(parameters, component)
        continue
      }
      // Record types
      // parameter Record p(q=1) → Store p.q = 1 → need to process as any other composite class instance
      if (classDefinition.class_prefixes?.includes('record')) {
        handleCompositeComponent(parameters, component, jsons, classDefinition)
        continue
      }
    }
    // Parameters of instantiated classes
    else if (!(['input', 'output'].some(el => component.type_prefix?.includes(el)))
      && !primitiveTypes.includes(component.type_specifier)) {
      classDefinition = getClassDefinition(
        jsons,
        lookupClassName(component.type_specifier, classObject.within, classObject.fullMoFilePath))
      if (classDefinition == null) {
        // FIXME: logger
        console.log('Class definition not found for: ' + component.type_specifier)
        continue
      }
      handleCompositeComponent(parameters, component, jsons, classDefinition)
    }
  }
  return parameters
}

const mathFunctions = [
  'abs', 'cos', 'cosh', 'sin', 'sinh', 'tan', 'tanh', 'max', 'min', 'sqrt', 'mod', 'ceil', 'floor'
]
const exponentialRegExp = /(\d|\.)\s*(e|E)\s*(\+|-)*\s*\d/g
const mathSymbolsRegExp = new RegExp(
  regexFrom(mathFunctions, '', true, false, true).source +
  '|' +
  exponentialRegExp.source // Scientific number = real number optionally followed by an exponent
)

/**
* Evaluates a parameter given an optional context
* @example
* const context = {a: 1}; evalInScope('a + 1', context) // returns 2
* @example
* evalInScope('1 + 1') // returns 2
*/
function evalInContext(str, context) {
  if (context != null && Object.keys(context).includes(str)) {
      return evalInContext(context[str], context)
  }
  if (/^(;|\s*)$/.test(str)) { return str } // We return ; and empty or blank strings unchanged
  if (mathSymbolsRegExp.test(str)) { // We first try to evaluate the string as a mathematical expression
      try {
          const expArr = str.match(exponentialRegExp)
          if (Array.isArray(expArr)) {
              // We remove any space within exponential numbers: 1e - 10 → 1e-10
              expArr.forEach(v => str = str.replace(v, v.replace(/\s+/g, '')))
          }
          return math.evaluate(str)
      }
      catch (error) {}
  }
  // We use indirect eval?.() based on the rationale from
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_direct_eval!
  try { return eval?.(`'use strict'; ${str}`) }
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
 * @param {string} expression - The expression to evaluate.
 * @param {object} context - The context object containing variables and their values.
 * @param {RegExp} [instanceSeparator=/\$/] - The regular expression used to separate instances.
 * @returns {*} - The result of the evaluated expression.
 */
function evalExpression(expression, context) {
  if (expression == null) { return expression }
  let exprToEvaluate = splitExpression(expression, true) // Keeps operators and functions in returned array
  if (Array.isArray(exprToEvaluate)) {
      exprToEvaluate = exprToEvaluate.map(v => evalInContext(v, context))
      if (exprToEvaluate.some(v => v == null)) {
          return undefined
      }
      if (exprToEvaluate.some(v => { // The parameter value found in context may be another expression with parameters to be further evaluated
          const w = splitExpression(v, true)
          return Array.isArray(w)
              ? w.some(x => Object.keys(context).includes(x))
              : false
      })) { return evalExpression(exprToEvaluate.join(' '), context) }
  }
  return evalInContext(convertSymbols(exprToEvaluate.join(' ')), context)
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
      '<>': '!='
  }
  const enumRegExp = /[a-zA-Z]+\w?(\.[a-zA-Z]+\w?)+/g
  return expression
      .replaceAll(
          regexFrom(Object.keys(mapping), 'g'),
          (match) => mapping[match])
      .replaceAll(enumRegExp, '\'$&\'') // Add quotes to enumerations so they can be evaluated with string comparison (==|!=)
}