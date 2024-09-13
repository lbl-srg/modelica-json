const { exp } = require('mathjs');
const expressionEvaluation = require('../lib/expressionEvaluation.js');
const jsonQuery = require('../lib/jsonquery');
const logger = require('winston'); // This retrieves the default logger which is configured in app.js
const math = require('mathjs');

/**
 * Determines whether a document element should be included in the documentation.
 * The element must be included if:
 *
 * - the component is public (condition already evaluated in getParametersAndBindings), AND
 * - if the component is conditional, the condition-attribute evaluates to true, AND
 * - the declaration annotation contains `__cdl(Documentation(include=true))`
 *   or no `__cdl(Documentation(include))` annotation at all, AND (
 *
 * - type_specifier contains `Buildings.Controls.OBC` but not `Buildings.Controls.OBC.CDL`, OR
 * - the class annotation of type_specifier contains `__cdl(Documentation(include=true)`, ) AND (
 *
 * - the class annotation of type_specifier contains `__cdl(Documentation(info=...))`, OR
 * - the class annotation of type_specifier contains `Documentation(info=...)`. )
 *
 * A warning is written in the log if the documentation must be included but:
 *
 * - no `__cdl(Documentation(info=...))` is found, only `Documentation(info=...)`, OR
 * - neither `__cdl(Documentation(info=...))` nor `Documentation(info=...)` is found.
 *
 * @param {Object} docElement - The document element to be evaluated.
 * @param {Object} evalContext - The context in which parameter evaluation is performed.
 * @returns {boolean} - True if the document element should be documented, false otherwise.
 */
function shallBeDocumented (docElement, evalContext) {
  /* Expression evaluation requires prepending the stacked instance name to the parameter names
     so that the context from the top-level class can be used */
  const isInstantiated = docElement.instance?.condition == null
    ? true
    : expressionEvaluation.evalExpression(
        docElement.instance.condition,
        evalContext,
        /* prefix */ docElement.instance?.name,
      )
  const isInstanceCdlDocIncluded =
    docElement.instance?.cdlAnnotation?.Documentation?.include == null
      ? null
      : expressionEvaluation.evalExpression(
          docElement.instance.cdlAnnotation.Documentation.include,
          evalContext,
          /* prefix */ docElement.instance?.name,
        )
  const isTypeEligible = /^Buildings.Controls.OBC(?!\.CDL).*$/
    .test(docElement.fullClassName)
  const isClassCdlDocIncluded =
    docElement.classCdlAnnotation?.Documentation?.include == null
      ? null
      : expressionEvaluation.evalExpression(
          docElement.classCdlAnnotation.Documentation.include,
          evalContext,
          /* prefix */ docElement.instance?.name,
        )
  // Regex below uses [\s\S]* for testing a match over multiple lines
  const isClassCdlDocInfo = /<html>[\s\S]*\w+[\s\S]*<\/html>/
    .test(docElement.classCdlAnnotation?.Documentation?.info)
  const isClassDocInfo = /<html>[\s\S]*\w+[\s\S]*<\/html>/i
    .test(docElement.classDocInfo)

  const toBeDocumented = isInstantiated &&
    isInstanceCdlDocIncluded !== false &&
    (isTypeEligible || isClassCdlDocIncluded) &&
    (isClassCdlDocInfo || isClassDocInfo)

  if (toBeDocumented && !isClassCdlDocInfo) {
    if (!isClassDocInfo) {
      logger.warn('Both CDL and standard class documentation are missing for component ' +
        `${docElement.instance?.name} of type ${docElement.fullClassName}`)
    } else {
      logger.warn('CDL documentation is missing for component ' +
        `${docElement.instance?.name} of type ${docElement.fullClassName}`)
    }
  }

  return toBeDocumented
}

/**
 * Sorts the document elements based on the section property.
 *
 * - Function to be passed as argument to `Array.prototype.sort` with the context bound:
 *   `doc.sort(sortDocSections.bind(doc))`.
 *
 * @param {Object} a The first document element.
 * @param {Object} b The second document element.
 * @returns {number} The comparison result.
 */
function sortDocSections (a, b) {
  if (a.section == null && b.section == null) {
      return this.map(JSON.stringify).indexOf(JSON.stringify(a)) -
        this.map(JSON.stringify).indexOf(JSON.stringify(b));
  }
  else if (a.section == null) return -1;
  else if (b.section == null) return 1;
  else {
      const compar = a.section < b.section
      if (compar) return -1
      else return 1
  }
}


/**
 * Converts a value from one unit to another display unit using provided unit data.
 *
 * @param {number} value - The numerical value to be converted.
 * @param {string} unit - The original unit of the value.
 * @param {string} [displayUnit] - The target display unit for the conversion.
 * @param {Object} unitData - The data containing unit conversion information.
 * @returns {number} - The converted value in the target display unit.
 */
function convertUnit (value, unit, displayUnit, unitData) {
  if (displayUnit != null) {
      const conversion = jsonQuery.findNestedObjects(
          jsonQuery.findNestedObjects(unitData, 'unit', unit),
          'displayUnit', displayUnit)[0]
      if (conversion != null) {
          value = expressionEvaluation.evalInContext(
              `${value} * (${conversion.multiplier ?? 1}) + (${conversion.offset ?? 0})`
          )
      }
  }
  return value
}

/**
 * Evaluates an expression string to get its value and unit, and
 * optionally rounds the value.
 *
 * @param {string} expStr - The expression string to evaluate.
 * @param {Object} instance - The instance context for the expression.
 * @param {Object} evalContext - The evaluation context for the expression.
 * @param {Object} unitContext - The unit context for the expression.
 * @param {Object} unitData - The unit data for conversion.
 * @param {number} [round] - The number of decimal places to round the value to.
 * @returns {string|number} - The evaluated value with its unit, or
 *     just the value if no unit is found.
 */
function getValueAndUnit (expStr, instance, evalContext, unitContext, unitData, round) {
  let value = expressionEvaluation.evalExpression(expStr, evalContext, instance)
  const expSplit = expressionEvaluation.splitExpression(expStr)
  let expUnits;
  if (Array.isArray(expSplit)) {
      expUnits = function () {
          for (const term of expSplit) {
              const strInContext = instance == null
                  ? `${term}`
                  : `${instance}.${term}`
              if (strInContext in unitContext) return unitContext[strInContext];
          }
      }()
  }
  value = round && typeof value === 'number' ? math.round(value, round) : value
  if (expUnits?.unit == null || `${expUnits?.unit}` === '1') {
      return value
  }
  else if (expUnits?.displayUnit == null || expUnits?.displayUnit === expUnits?.unit) {
      return `${value} ${expUnits.unit}`.replace('deg', '°')
  }
  else {
      value = convertUnit(value, expUnits.unit, expUnits.displayUnit, unitData)
      value = round && typeof value === 'number' ? math.round(value, round) : value
      return `${value} ${expUnits.displayUnit}`.replace('deg', '°')
  }
}


function buildDoc (classObj, jsons) {
  const paramAndDoc = expressionEvaluation.getParametersAndBindings(
    classObj, jsons, /* fetchDoc= */ true);
  const evalContext = paramAndDoc.parameters.reduce((a, v) =>
    ({ ...a, [v.name]: v.value }), {});
  const unitContext = paramAndDoc.parameters.reduce((a, v) =>
    ({ ...a, [v.name]: {unit: v.unit, displayUnit: v.displayUnit} }), {});
  let documentation = paramAndDoc.documentation
    .filter(docElement => shallBeDocumented(docElement, evalContext));
  documentation = documentation.sort(sortDocSections.bind(documentation));

}