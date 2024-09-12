const expressionEvaluation = require('../lib/expressionEvaluation.js');
const logger = require('winston'); // This retrieves the default logger which is configured in app.js

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
 * @param {Object} docElement The document element to be evaluated.
 * @param {Object} context The context in which parameter evaluation is performed.
 * @returns {boolean} True if the document element should be documented, false otherwise.
 */
function shallBeDocumented (docElement, context) {
  /* Expression evaluation requires prepending the stacked instance name to the parameter names
     so that the context from the top-level class can be used */
  const isInstantiated = docElement.instance?.condition == null
    ? true
    : expressionEvaluation.evalExpression(
        docElement.instance.condition,
        context,
        /* prefix */ docElement.instance?.name,
      )
  const isInstanceCdlDocIncluded =
    docElement.instance?.cdlAnnotation?.Documentation?.include == null
      ? null
      : expressionEvaluation.evalExpression(
          docElement.instance.cdlAnnotation.Documentation.include,
          context,
          /* prefix */ docElement.instance?.name,
        )
  const isTypeEligible = /^Buildings.Controls.OBC(?!\.CDL).*$/
    .test(docElement.fullClassName)
  const isClassCdlDocIncluded =
    docElement.classCdlAnnotation?.Documentation?.include == null
      ? null
      : expressionEvaluation.evalExpression(
          docElement.classCdlAnnotation.Documentation.include,
          context,
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
