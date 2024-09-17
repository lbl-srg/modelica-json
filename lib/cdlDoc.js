const cheerio = require('cheerio');
const expressionEvaluation = require('../lib/expressionEvaluation.js');
const fs = require('bluebird').promisifyAll(require('fs'))
const jsonQuery = require('../lib/jsonquery');
const logger = require('winston'); // This retrieves the default logger which is configured in app.js
const math = require('mathjs');
const path = require('path');
const utilM2j = require('../lib/util.js');

// Object to persist the library paths
const libPath = {}

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
 * @param {string} [instanceName] - The instance name for evaluating the parameters within the expression.
 * @param {Object} evalContext - The evaluation context for the expression.
 * @param {Object} unitContext - The unit context for the expression.
 * @param {Object} unitData - The data containing unit conversion information.
 * @param {number} [round] - The number of decimal places to round the value to.
 * @returns {string|number} - The evaluated value with its unit, or
 *     just the value if no unit is found.
 */
function getValueAndUnit (expStr, instanceName, evalContext, unitContext, unitData, round) {
  // Get value and return if undefined or equal to the expression string
  let value = expressionEvaluation.evalExpression(expStr, evalContext, instanceName)
  if (value == null || value === expStr) return value;
  // Get unit from any term in the expression that is found in the unit context
  const expSplit = expressionEvaluation.splitExpression(expStr)
  let expUnits;
  if (Array.isArray(expSplit)) {
    expUnits = function () {
      for (const term of expSplit) {
        const strInContext = instanceName == null
          ? `${term}`
          : `${instanceName}.${term}`
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

/**
 * Retrieves the path of a specified Modelica library.
 *
 * @param {string} lib - The name of the Modelica library to find.
 * @returns {{nameOnDisk: string, path: string} | undefined} The path and actual name
 *     of the library if found, otherwise undefined.
 */
function getLibraryPath (lib) {
  if (libPath[lib] == null) {
    const libRegexp = new RegExp(`(${lib}(\\s\\S+)?)(\\.mo)?$`)
    bloc_path: { for (const p of utilM2j.getMODELICAPATH()) {
      const files = fs.readdirSync(p)
      for (const file of files) {
        const match = file.match(libRegexp)
        if (match != null) {
          libPath[lib] = {
            nameOnDisk: match[1],
            path: path
          }
          break bloc_path
        }
      }
    }}
  }
  if (libPath[lib] == null) {
    logger.warn(`Library ${lib} not found in MODELICAPATH`)
  }
  return libPath[lib]
}

function getImagePaths (htmlStr) {
  let paths = {}
  const $ = cheerio.load(htmlStr, null, false)
  $('img').each(function (idx) {
    let uri = $(this).attr('src')
    // If there is a trailing /, remove it. It could be from ..pSet.png\"/>
    if (uri.endsWith('/')) {
      uri = uri.slice(0, -1)
    }
    // Remove trailing \"
    if (uri.startsWith('\\"') && uri.endsWith('\\"')) {
      uri = uri.slice(2, -2)
    }
    // Change image paths in the HTML
    let relPath = uri.substring(uri.indexOf('://') + 3)
    const libName = relPath.substring(0, relPath.indexOf('/'))
    const libPath = getLibraryPath(libName)
    /* Replace library name with actual name on disk.
       For example: 'Buildings/Resources' may be in the directory
       'Buildings 5.0.1/Resources' */
    if (libPath.nameOnDisk !== libName) {
      relPath = relPath.replace(new RegExp('^' + libName), libPath.nameOnDisk)
    }
    const newImgName = relPath.replace(/\//g, '_')
    paths = { ...paths, [newImgName]: path.join(libPath.path, relPath) }
    const alt = $(this).attr('alt')
    $(this).replaceWith(`<img alt="${alt}" src="${path.join('img', newImgName)}">`)
  })
  return { paths, html: $.html() }
}


/**
 * Modifies the documentation information of a given documentation element.
 *
 * - The function modifies the HTML string by updating the headings and code elements.
 *
 * @param {Object} docElement - The document element containing the CDL annotations and documentation info.
 * @param {Object} evalContext - The evaluation context used for evaluating parameter expressions.
 * @param {Object} unitContext - The unit context used for unit assignment and/or conversion.
 * @param {Object} unitData - The data containing unit conversion information.
 * @returns {string} - The modified HTML string with updated headings and code elements.
 */
function modifyInfo (docElement, evalContext, unitContext, unitData) {
  const htmlStr = /<html>[\s\S]*\w+[\s\S]*<\/html>/.test(
    docElement.classCdlAnnotation?.Documentation?.info)
    ? docElement.classCdlAnnotation.Documentation.info
    : docElement.classDocInfo
  // Parse document in fragment mode so no boilerplate tags (<body>, <head>) are inserted
  const $ = cheerio.load(htmlStr, null, false)
  // Get new heading index from optional CDL section annotation
  const headingIndex = ((docElement.instance?.cdlAnnotation?.section
    ?? docElement.classCdlAnnotation?.section
    ?? null)?.replace(/\.$/, '').match(/\./g) || []).length + 1
  // Shift index of existing headings
  const headings = []
  $('h1, h2, h3, h4, h5, h6').map((_, el) =>
    headings.push(Number(el.name.replace('h', ''))))
  if (headings.length > 0) {
    const headingOffset = headingIndex - math.min(headings) + 1;
    $('h1, h2, h3, h4, h5, h6').replaceWith((_, el) => {
      const idx = Number(el.name.replace('h', ''));
      return `<h${idx + headingOffset}>${$(el).html()}</h${idx + headingOffset}>`;
    })
  }
  // Insert new heading
  $('*').first().before(`<h${headingIndex}>${docElement.descriptionString}</h${headingIndex}>\n`)
  // Modify each code element into: <code>expression</code> (value unit, adjustable)
  $('code').map(function () {
    let valueAndUnit = getValueAndUnit(
      $(this).text(), docElement.instance?.name, evalContext, unitContext, unitData, /* round= */ undefined)
    if (valueAndUnit != null && valueAndUnit !== $(this).text()) {
      $(this).after(`&nbsp;(${valueAndUnit}, adjustable)`)
    }
  })
  return `<html>${$.html()}</html>`
    .replace(/"?(<\/?html>)"?/g, '$1') // The parser stores double quotes inside strings: "simple_expression": "\"<html>
}


function buildDoc (classObj, jsons, unitData, title, filePath) {
  const paramAndDoc = expressionEvaluation.getParametersAndBindings(
    classObj, jsons, /* fetchDoc= */ true);
  const evalContext = paramAndDoc.parameters.reduce((a, v) =>
    ({ ...a, [v.name]: v.value }), {});
  const unitContext = paramAndDoc.parameters.reduce((a, v) =>
    ({ ...a, [v.name]: { unit: v.unit, displayUnit: v.displayUnit } }), {});
  const documentation = paramAndDoc.documentation
    .filter(docElement => shallBeDocumented(docElement, evalContext));
  documentation.sort(sortDocSections.bind(documentation));
  let output = `<html><title>${title ?? ''}</title>`;
  documentation.forEach(el => {
    const $el = cheerio.load(modifyInfo(
      el, evalContext, unitContext, unitData), null, false);
    output += $el.html();
  });
  output += '</html>';

  // Copy the images and modify the paths in the HTML
  const files = []
  workData.forEach(function (dat) {
    const f = getImageLocations(output)
    f.forEach(function (obj) {
      files.push(obj)
    })
  })

  fs.writeFileSync(filePath, output, 'utf8');
}