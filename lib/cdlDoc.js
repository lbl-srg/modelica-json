const cheerio = require('cheerio')
const expressionEvaluation = require('../lib/expressionEvaluation.js')
const fs = require('bluebird').promisifyAll(require('fs'))
const jsonQuery = require('../lib/jsonquery')
const logger = require('winston') // This retrieves the default logger which is configured in app.js
const math = require('mathjs')
const path = require('path')
const utilM2j = require('../lib/util.js')

// Object to persist the library paths
const libPath = {}

/**
 * Creates an HTML table from an array of objects.
 *
 * @param {*} data
 * @returns {string}
 */
function createTable (data) {
  if (data.length === 0) return ''
  const keys = Object.keys(data[0])
  const borderStyle = 'border:1px solid black; border-collapse: collapse;'
  const tableWidth = 600 // in pixels
  const table = `<table style='width:${tableWidth}px; ${borderStyle}'><thead><tr>` +
    `${keys.map(k => {
      const columnWidth = ((k === 'type' || k === 'unit')
? 0.1
: k === 'description'
        ? 0.6
        : 0.15) * tableWidth
      return `<th style='width:${columnWidth}px; ${borderStyle}'>${k[0].toUpperCase() + k.substring(1)}</th>`
    }).join('')}</tr></thead><tbody>`
  return table + data.map(
    row => `<tr>${keys.map(k =>
      `<td style='${borderStyle}'>${row[k]}</td>`)
      .join('')}</tr>`).join('') + '</tbody></table>'
}

/**
 * Determines whether a document element should be included in the documentation.
 * The element must be included if:
 *
 * - the component is public (condition already evaluated in getParametersAndBindings), AND
 * - if the component or any of its parent in the instance tree is conditional,
 *   the condition-attribute evaluates to true, AND
 * - the declaration annotation contains `__cdl(Documentation(include=true))`
 *   or no `__cdl(Documentation(include))` annotation at all, AND (
 *
 * - the full class name contains 'Buildings.Controls.OBC' but not 'Buildings.Controls.OBC.CDL', OR
 * - the class annotation contains `__cdl(Documentation(include=true)` )
 *
 * A warning is written in the log if the documentation must be included but:
 *
 * - no `__cdl(Documentation(info=...))` is found, only `Documentation(info=...)`, OR
 * - neither `__cdl(Documentation(info=...))` nor `Documentation(info=...)` is found.
 *
 * @param {Object} docElement - The document element to be evaluated.
 * @param {Object} evalContext - The context in which parameter evaluation is performed.
 * @param {!Array<Object>} documentation  - The array of documentation objects to find instance parents.
 * @returns {boolean} - True if the document element should be documented, false otherwise.
 */
function shallBeDocumented (docElement, evalContext, documentation) {
  /* Expression evaluation requires prepending the "stacked instance name of the enclosing
  component" to the parameter names so that the context from the top-level class can be used.
  For example: if docElement.instance.name = 'ctl.ena' then 'ctl' is used as prefix. */
  const prefix = docElement.instance?.name?.split('.').slice(0, -1).join('.')

  // Test for conditional instantiation
  let isInstantiated = true
  const parents = findParentsInDoc(docElement.instance?.name, documentation)
  for (const el of [docElement, ...parents]) {
    const prefix = el.instance?.name?.split('.').slice(0, -1).join('.')
    const isElInstantiated = el.instance?.condition == null
      ? true
      : expressionEvaluation.evalExpression(
        el.instance.condition,
        evalContext,
        prefix
      )
    if (isElInstantiated === false) {
      isInstantiated = false
      break
    }
  }
  if (isInstantiated === false) return false

  // Test for inclusion in the documentation based on CDL annotations or type
  const isInstanceCdlDocIncluded =
    docElement.instance?.cdlAnnotation?.Documentation?.include == null
      ? null
      : expressionEvaluation.evalExpression(
        docElement.instance.cdlAnnotation.Documentation.include,
        evalContext,
        prefix
      )
  if (isInstanceCdlDocIncluded === false) return false
  const isTypeEligible = /^Buildings.Controls.OBC(?!\.CDL).*$/
    .test(docElement.fullClassName)
  const isClassCdlDocIncluded =
    docElement.cdlAnnotation?.Documentation?.include == null
      ? null
      : expressionEvaluation.evalExpression(
        docElement.cdlAnnotation.Documentation.include,
        evalContext,
        prefix
      )
  if (!isTypeEligible && isClassCdlDocIncluded !== true) return false
  // From now on, the element shall be included in the documentation.

  /* We allow empty strings for CDL documentation info so that a block
     can be used to exclusively provide a heading. */
  const isClassCdlDocInfo = docElement.cdlAnnotation?.Documentation?.info != null
  // Regex below uses [\s\S]* for testing a match over multiple lines
  const isClassDocInfo = /<html>[\s\S]*\w+[\s\S]*<\/html>/i
    .test(docElement.documentationInfo)

  if (!isClassCdlDocInfo) {
    if (!isClassDocInfo) {
      logger.warn('Both CDL and standard class documentation are missing for component ' +
        `${docElement.instance?.name} of type ${docElement.fullClassName}`)
    } else {
      logger.warn('CDL documentation is missing for component ' +
        `${docElement.instance?.name} of type ${docElement.fullClassName}`)
    }
  }

  return true
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
    // If both are null, sort by instanciation order
    return this.map(JSON.stringify).indexOf(JSON.stringify(a)) -
      this.map(JSON.stringify).indexOf(JSON.stringify(b))
  } else if (a.section == null) return -1
  else if (b.section == null) return 1
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
 * @returns {{value, unit}} - The evaluated value with its unit.
 */
function getValueAndUnit (expStr, instanceName, evalContext, unitContext, unitData, round) {
  // Get value and return if undefined or equal to the expression string
  let value = expressionEvaluation.evalExpression(expStr, evalContext, instanceName)
  if (value == null || value === expStr) return value
  // Get unit from any term in the expression that is found in the unit context
  const expSplit = expressionEvaluation.splitExpression(expStr)
  let expUnits
  if (Array.isArray(expSplit)) {
    expUnits = (function () {
      for (const term of expSplit) {
        const strInContext = instanceName == null
          ? `${term}`
          : `${instanceName}.${term}`
        if (strInContext in unitContext) return unitContext[strInContext]
      }
    }())
  }
  let unit = expUnits?.unit
  if (expUnits?.displayUnit != null && expUnits?.displayUnit !== expUnits?.unit) {
    value = convertUnit(value, expUnits.unit, expUnits.displayUnit, unitData)
    unit = `${expUnits.displayUnit}`.replace('deg', '°')
  }
  value = round && typeof value === 'number' ? math.round(value, round) : value
  unit = unit?.replace('deg', '°')
  return { value, unit }
}

/**
 * Retrieves the path of a specified Modelica library.
 *
 * - Each path found is persisted in the `libPath` object to avoid redundant searches.
 *
 * @param {string} lib - The name of the Modelica library to find.
 * @returns {{nameOnDisk: string, path: string} | undefined} The path and actual name
 *     of the library if found, otherwise undefined.
 */
function getLibraryPath (lib) {
  if (libPath[lib] == null) {
    const libRegexp = new RegExp(`(${lib}(\\s\\S+)?)(\\.mo)?$`)
    blocPath: { /* eslint no-labels: "off" */
      for (const p of utilM2j.getMODELICAPATH()) {
        const files = fs.readdirSync(p)
        for (const file of files) {
          const match = file.match(libRegexp)
          if (match != null) {
            libPath[lib] = {
              nameOnDisk: match[1],
              path: p
            }
            break blocPath /* eslint no-labels: "off" */
          }
        }
      }
    }
  }
  if (libPath[lib] == null) {
    logger.warn(`Library ${lib} not found in MODELICAPATH`)
  }
  return libPath[lib]
}

function getPathFromUri (uri) {
  // If there is a trailing /, remove it. It could be from ..pSet.png\"/>
  if (uri.endsWith('/')) uri = uri.slice(0, -1)
  // Remove escape character and double quotes
  uri = uri.replace(/\\|"/g, '')
  // Return path without URI scheme
  return uri.substring(uri.indexOf('://') + 3)
}

/**
 * Extracts the paths to the image files from a cheerio object,
 * and modifies the paths in place to point to the new image location.
 *
 * @param {Object} $ - The cheerio object to process (will be modified in place).
 * @returns {Object} A mapping of new image names to their corresponding paths.
 */
function processImg ($) {
  let paths = {}
  $('img').each(function (idx) {
    let relPath = getPathFromUri($(this).attr('src'))
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
    $(this).attr('src', path.join('img', newImgName))
  })
  return paths
}

/**
 * Processes the href attributes of anchor tags in the provided cheerio object.
 *
 * - If the href attribute points to a Modelica URI, it modifies the href to point
 *   to the corresponding section within the documentation.
 * - If the href does not point to another section, it removes the href attribute
 *   and wraps the anchor tag in a span with the resource path as ID attribute.
 *
 * @param {Object} $ - The jQuery-like object for manipulating the HTML content.
 * @param {Array<Object>} documentation - An array of documentation objects, each containing
 *     fullClassName, headingNum, and descriptionString.
 */
function processHref ($, documentation) {
  $('a').each(function () {
    let href = $(this).attr('href')
    if (href != null && /modelica:\/\//.test(href)) {
      href = getPathFromUri(href)
      for (const docElement of documentation) {
        // Modify the href attribute pointing to another section of the documentation
        if (docElement.fullClassName === href) {
          const anchorId = createAnchorId(docElement.headingText, docElement.headingNum)
          $(this).before('Section&nbsp;')
          $(this)
            .attr('href', `#${anchorId}`)
            .attr('style', 'white-space: nowrap;')
            .text(`${docElement.headingNum}`)
          return
        }
      }
      // If the href attribute doesn't point to another section of the documentation, remove
      $(this)
        .removeAttr('href')
        .wrap(`<span style="color: grey;" id="${href}"></span>`)
    }
  })
}

/**
 * Processes CDL visibility toggles.
 *
 * - Modifies the cheerio object in place.
 * - If the visible attribute evaluates to false, the span element is emptied.
 *   Syntax: <span><!-- cdl(visible=...) -->...<!-- end cdl --></span>
 *
 * @param {Object} $ - The cheerio object.
 * @param {Object} evalContext - The evaluation context for expressions.
 * @param {string} instanceName - The name of the instance for which the expression is evaluated.
 */
function processCdlToggle ($, evalContext, instanceName) {
  const $span = $('span:contains(cdl):contains(end cdl)')

  $span.contents().map(function () {
    if (/<--.*cdl\s*\(.*visible/.test($(this).text())) {
      const visibleExp = $(this).text().replace(/<--.*visible=(.*)\).*-->/, '$1')
      if (expressionEvaluation.evalExpression(
        visibleExp, evalContext, instanceName) === false) {
        $span.empty()
      }
    }
    return this
  })
}

/**
 * Finds all parent instances of a given instance within the provided documentation.
 *
 * - The returned array contains the parent instances in order from the immediate parent.
 *
 * @param {string} instanceName - The name of the instance to find parents for.
 * @param {Array<Object>} documentation - The documentation array containing instance objects.
 * @returns {Array<Object>} An array of parent instance objects found in the documentation.
 */
function findParentsInDoc (instanceName, documentation) {
  const parents = []
  while (/\./.test(instanceName)) {
    instanceName = instanceName.split('.').slice(0, -1).join('.')
    const parentInDoc = documentation.find(doc => doc.instance?.name === instanceName)
    if (parentInDoc != null && !parents.map(({ instance }) => instance.name).includes(instanceName)) {
      parents.push(parentInDoc)
    } else {
      // Iterative call in case the immediate parent is not in doc but a grandparent is
      parents.push(...findParentsInDoc(instanceName, documentation))
    }
  }
  return parents
}

/**
 * Generates section numbers (modifies array in place).
 *
 * @param {Array<Object>} documentation  - The array of documentation objects to process.
 */
function createSectionNum (documentation) {
  const newUniqueElements = []
  // Sort by instance nesting depth (in a new array that is a ***shallow*** copy!)
  const sortedDoc = documentation.toSorted((a, b) => {
    if (a.instance?.name == null) return -1
    else if (b.instance?.name == null) return 1
    else {
      return a.instance.name.split('.').length - b.instance.name.split('.').length
    }
  })
  sortedDoc.forEach((el, idx) => {
    let section = el.instance?.cdlAnnotation?.Documentation?.section ??
      el.cdlAnnotation?.Documentation?.section ??
      1 // Defaulting to 1 resolves later into sorting sections by instanciation order
    // Remove double quotes surrounding strings: "simple_expression": "\"<html>...</html>\""
    section = typeof section === 'string' ? section.replace(/^\\*"|\\*"$/g, '') : section
    // We modify the section property to be relative to the first parent in the documentation
    const parentInDoc = findParentsInDoc(el.instance?.name, sortedDoc)[0]
    section = (parentInDoc?.section == null ? '' : `${parentInDoc.section}.`) + section
    // Add section property to the elements of both documentation and sortedDoc (shallow copy)
    el.section = section
    /* For the first element annotated with unique we create a new unique element
       and use the unique attribute for the section property. */
    const unique = el.instance?.cdlAnnotation?.Documentation?.unique ??
      el.cdlAnnotation?.Documentation?.unique
    if (unique != null &&
      sortedDoc.findIndex(_ => _.fullClassName === el.fullClassName) === idx) {
      newUniqueElements.push({
        ...JSON.parse(JSON.stringify(el)), // deep copy!
        instance: {
          name: el.fullClassName,
          descriptionString: null,
          cdlAnnotation: null
        },
        section: typeof unique === 'string' ? unique.replace(/^\\*"|\\*"$/g, '') : unique
      })
    }
  })
  documentation.push(...newUniqueElements)
}

/**
 * Generates a new heading number based on the current heading index and
 * the previous heading number.
 *
 * @param {number} headingIdx - The current heading index.
 * @param {string} [prevHeadingNum='0'] - The previous heading number in dot-separated format.
 *
 * @returns {string} The new heading number in dot-separated format.
 */
function createHeadingNum (headingIdx, prevHeadingNum = '0') {
  const prevHeadingSplit = prevHeadingNum.split('.')
  if (headingIdx <= prevHeadingSplit.length) {
    return [
      ...prevHeadingSplit.slice(0, headingIdx - 1),
      Number(prevHeadingSplit[headingIdx - 1]) + 1
    ].join('.')
  } else return [...prevHeadingSplit, 1].join('.')
}

/**
 * Creates an anchor ID from a heading number and heading text.
 *
 * @param {string} headingText - The heading text to convert into an anchor ID.
 * @param {number} [headingNum] - The heading number to prepend for uniqueness.
 *     Will be randomnly generated if null.
 * @param {number} [maxLen=30] - The maximum length of the resulting anchor ID.
 * @returns {string} The generated anchor ID.
 */
function createAnchorId (headingText, headingNum, maxLen = 30) {
  /* We prepend with 'headingNum' to guarantee unicity.
     We truncate to 30 characters due to MS Word limitation. */
  return ((headingNum ?? math.floor(math.random() * 1e6)) + headingText)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, maxLen)
}

/**
 * Creates an HTML heading element with an anchor.
 *
 * @param {number} headingIdx - The level of the heading (e.g., 1 for `<h1>`, 2 for `<h2>`, etc.).
 * @param {string} headingText - The text content of the heading.
 * @param {string} [headingNum] - The number or identifier for the heading (e.g., "1", "1.1").
 * @param {string} [anchorId] - The anchor ID for the heading.
 *     Will be internally created if null.
 * @returns {string} The HTML string for the heading with an anchor.
 */
function createHeading (headingIdx, headingText, headingNum, anchorId) {
  /* We use MS Word syntax for creating an anchor with <a name=...>
     instead of the more common syntax with <section id=...> */
  const myAnchorId = anchorId ?? createAnchorId(headingText, headingNum)
  return `<h${headingIdx}><a name=${myAnchorId}></a>` + (
    headingNum
      ? '<![if !supportLists]><span style=\'mso-list:Ignore\'>' +
      `${headingNum}.&nbsp;</span><![endif]>`
      : '') +
    `${headingText}</h${headingIdx}>\n`
}

function processUniqueElements (documentation) {
  documentation.forEach(el => {
    const unique = el.instance?.cdlAnnotation?.Documentation?.unique ??
      el.cdlAnnotation?.Documentation?.unique
    /* If the element is annotated as unique and is not the new unique element
        created by createSectionNum(), we replace the info section with a URI
        pointing to the fullClassName. */
    if (unique != null && el.fullClassName !== el.instance?.name) {
      const newDoc = `<html><p>See <a href="modelica://${el.fullClassName}">` +
        `${el.fullClassName}</a>.</p></html>`
      if (el.instance?.cdlAnnotation?.Documentation?.info != null) {
        el.instance.cdlAnnotation.Documentation.info = null
      }
      if (el.cdlAnnotation?.Documentation != null) {
        el.cdlAnnotation.Documentation.info = newDoc
      } else {
        el.cdlAnnotation = { Documentation: { info: newDoc } }
      }
      el.documentationInfo = null
    }
  })
}

function createSectionsBlockVars (variables) {
  if (Object.keys(variables).length === 0) return {}
  const blockAnchorIds = {}
  const blockNames = Object.keys(variables).toSorted()
  let htmlBlockVars = "<br clear=all style='page-break-before:always'>" +
    createHeading(1, 'Appendix A. Block Variables')
  blockNames.forEach(blockName => {
    blockAnchorIds[blockName] = createAnchorId(blockName)
    htmlBlockVars += createHeading(
      2, blockName, /* headingNum= */ undefined, blockAnchorIds[blockName])
    for (const typeVar of ['parameters', 'inputs', 'outputs']) {
      if (variables[blockName][typeVar]?.length === 0) continue
      variables[blockName][typeVar].forEach(v => {
        v.unit = v.unit
          ? v.unit.replace(/"/g, '').replace(/1/, '-')
          : '-'
      })
      htmlBlockVars += `<h3>${typeVar[0].toUpperCase() + typeVar.substring(1)}</h3>`
      htmlBlockVars += createTable(variables[blockName][typeVar])
    }
  })
  return { blockAnchorIds, htmlBlockVars }
}

function getDocWithSectionBlockVars (docElement, blockAnchorIds) {
  // Parse document: this will create boilerplate tags (<body>, <head>) if not present
  const $ = cheerio.load(
    (docElement.cdlAnnotation?.Documentation?.info ??
      docElement.documentationInfo)
      .replace(/^\\*"|\\*"$/g, '') // Remove enclosing double quotes: "simple_expression": "\"<html>...</html>\""
  )
  // Get heading indices
  const headings = []
  $('h1, h2, h3, h4, h5, h6').map((_, el) =>
    headings.push(Number(el.name.replace('h', ''))))
  const minHeadingIdx = headings.length === 0 ? 1 : math.min(...headings)

  // Add subsection with link to block variables
  if (blockAnchorIds[docElement.fullClassName]) {
    $('body').append(createHeading(minHeadingIdx, 'Block Variables'))
    $('body').append('<p>For block parameters, input and output connectors see Section ' +
      `<a href="#${blockAnchorIds[docElement.fullClassName]}">${docElement.fullClassName}</a> ` +
      'in Appendix A.</p>')
  }

  return `${$('body').html()}`
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
 * @param {string} lastHeadingNum - The last heading number in the heading nomenclature (pass '0' at first call).
 * @param {Object} [blockAnchorIds] - The data containing unit conversion information.
 * @returns {string} - The modified HTML string with updated headings and code elements.
 */
function modifyInfo (docElement, evalContext, unitContext, unitData, lastHeadingNum, blockAnchorIds) {
  let htmlStr = docElement.cdlAnnotation?.Documentation?.info ??
    docElement.documentationInfo
  // Remove enclosing double quotes: "simple_expression": "\"<html>...</html>\""
  htmlStr = htmlStr.replace(/^\\*"|\\*"$/g, '')
  // Convert inner escaped double quotes into non-escaped double quotes
  htmlStr = htmlStr.replace(/\\+"/g, '"')
  // Parse document: this will create boilerplate tags (<body>, <head>) if not present
  const $ = cheerio.load(htmlStr)

  // Process CDL visibility toggles
  processCdlToggle($, evalContext, docElement.instance?.name)

  // Add properties to create new heading based on component description string
  docElement.headingText =
    (docElement.instance?.descriptionString ?? docElement.descriptionString)
      ?.replace(/^\\*"|\\*"$/g, '')
  docElement.headingIdx = (docElement.section?.replace(/\.$/, '').match(/\./g) || []).length + 1
  docElement.headingNum = createHeadingNum(docElement.headingIdx, lastHeadingNum)
  lastHeadingNum = docElement.headingNum

  // Shift heading indices
  const headings = []
  $('h1, h2, h3, h4, h5, h6').map((_, el) =>
    headings.push(Number(el.name.replace('h', ''))))
  const minHeadingIdx = headings.length === 0 ? 1 : math.min(...headings)

  if (headings.length > 0 || blockAnchorIds?.[docElement.fullClassName]) {
    const headingOffset = docElement.headingIdx - minHeadingIdx + 1
    $('h1, h2, h3, h4, h5, h6').replaceWith((_, el) => {
      const headingIdx = Number(el.name.replace('h', '')) + headingOffset
      lastHeadingNum = createHeadingNum(headingIdx, lastHeadingNum)
      return createHeading(headingIdx, $(el).text(), lastHeadingNum)
    })
  }

  // Insert new heading and tag as section with anchor
  $('body').prepend(
    createHeading(
      docElement.headingIdx,
      docElement.headingText,
      docElement.headingNum
    )
  )

  // Modify each code element into: <code>expression</code> (value unit, adjustable)
  $('code').map(function () {
    const valueAndUnit = getValueAndUnit(
      $(this).text(), docElement.instance?.name, evalContext, unitContext, unitData, /* round= */ undefined
    )
    // We only modify the code element if the evaluation succeeded
    if (typeof valueAndUnit?.value === 'number') {
      $(this).after(
        `&nbsp;(${valueAndUnit.value}` +
        (valueAndUnit.unit != null && valueAndUnit.unit !== '1'
          ? `&nbsp;${valueAndUnit.unit}`
          : '') +
        ', adjustable)'
      )
    }
    return this
  })

  return { html: `${$('body').html()}`, lastHeadingNum }
}

/**
 * Builds the documentation for a given class object and writes it to an HTML file.
 *
 * @param {Object} classObj - The class object to document.
 * @param {Object} jsons - The JSON data of all used classes.
 * @param {Object} unitData - The data containing unit conversion information.
 * @param {string} outputDir - The directory where the documentation will be saved.
 * @param {boolean} [includeVariables=false] - Whether to include block variables in the documentation.
 * @param {string} [title='Sequence of Operation'] - The title of the documentation.
 *
 * @returns {void}
 */
function buildDoc (classObj, jsons, unitData, outputDir, includeVariables = false, title = 'Sequence of Operation') {
  // First extract parameters and documentation of all components
  const paramAndDoc = expressionEvaluation.getParametersAndBindings(
    classObj, jsons, /* fetchDoc= */ true, /* fetchVariables= */ includeVariables)
  const evalContext = paramAndDoc.parameters.reduce((a, v) =>
    ({ ...a, [v.name]: v.value }), {})
  const unitContext = paramAndDoc.parameters.reduce((a, v) =>
    ({ ...a, [v.name]: { unit: v.unit, displayUnit: v.displayUnit } }), {})
  const documentation = paramAndDoc.documentation
    .filter(docElement => shallBeDocumented(docElement, evalContext, paramAndDoc.documentation))

  // Add subsection with a link to the block variables
  const { blockAnchorIds, htmlBlockVars } = createSectionsBlockVars(paramAndDoc.variables)
  if (includeVariables) {
    documentation.forEach(el => {
      const newDoc = getDocWithSectionBlockVars(el, blockAnchorIds)
      if (el.cdlAnnotation?.Documentation?.info != null) {
        el.cdlAnnotation.Documentation.info = newDoc
      } else if (el.documentationInfo != null) {
        el.documentationInfo = newDoc
      }
    })
  }

  // Create temporary section numbers: final section numbers are created after sorting
  createSectionNum(documentation)
  // Sort the documentation sections
  documentation.sort(sortDocSections.bind(documentation))
  // Process elements annotated with `unique=true`
  processUniqueElements(documentation)

  // Modify the documentation information of each component and create the HTML file
  let lastHeadingNum = '0'
  const $ = cheerio.load(`<title>${title}</title>`)
  documentation.forEach(el => {
    const newInfo = modifyInfo(
      el, evalContext, unitContext, unitData, lastHeadingNum, blockAnchorIds)
    $('body').append(newInfo.html)
    lastHeadingNum = newInfo.lastHeadingNum
  })

  // Modify href attributes pointing to other sections of the documentation
  processHref($, documentation)

  // Include sections with block variables documentation
  $('body').append(htmlBlockVars)

  // Create output directory and 'img' subfolder if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  if (!fs.existsSync(path.join(outputDir, 'img'))) {
    fs.mkdirSync(path.join(outputDir, 'img'), { recursive: true })
  }

  // Copy the images and modify the paths in the HTML
  const paths = processImg($)
  for (const img in paths) {
    const destPath = path.join(outputDir, 'img', img)
    // Copy image if it doesn't exist
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(paths[img], destPath)
    }
  }

  // Write the HTML file to the output directory
  fs.writeFileSync(path.join(outputDir, `${title}.html`), $.html(), 'utf8')

  return documentation
}

module.exports.buildDoc = buildDoc
