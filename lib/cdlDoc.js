import * as expressionEvaluator from '../lib/expressionEvaluator.js';
import * as jsonQuery from '../lib/jsonquery.js';
import * as objectExtractor from '../lib/objectExtractor.js';
const logger = require('winston'); // This retrieves the default logger which is configured in app.js

function shallBeDocumented (docElement, context) {
  /* Expression evaluation requires prepending the stacked instance name to the parameter names
     so that the context from the top-level class can be used */
  const isInstantiated = docElement.instance?.condition == null
    ? true
    : expressionEvaluator.evalExpression(
      docElement.instance.condition,
      context,
          /* prefix */ docElement.instance?.name,
    )
  const isInstanceCdlDocIncluded = docElement.instance?.cdlAnnotation?.Documentation?.include == null
    ? null
    : expressionEvaluator.evalExpression(
      docElement.instance.cdlAnnotation.Documentation.include,
      context,
          /* prefix */ docElement.instance?.name,
    )
  const isTypeEligible = /^Buildings.Controls.OBC(?!\.CDL).*$/.test(docElement.fullClassName)
  const isClassCdlDocIncluded = docElement.classCdlAnnotation?.Documentation?.include == null
    ? null
    : expressionEvaluator.evalExpression(
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
