const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const glob = require('glob')
const cheerio = require('cheerio')
const mu = require('mustache')
const unique = require('array-unique')

const js = require('../lib/jsonquery')
const ut = require('../lib/util')
const pa = require('../lib/parser.js')

var logger = require('winston')

/** Parse the json component description
  *  and return an html snippet
  */
function toHtml (fileName, imgDir, component, parseMode) {
  var template = `
  {{! This is a template for a Modelica block. }}

<h2>{{topClassName}}<a name="{{topClassName}}"></a></h2>

  <span class="ModelicaDescription">{{comment}}</span><br>

  {{#info}}
<h3>Info</h3>
  {{{info}}}
  {{/info}}

  {{#extends.length}}
  <h3>Extends Classes</h3>
    <p>
    It extends from following classes:
    </p>
    <table>
    <tr>
      <th class="type">Type</th>
      <th>Modification</th>
    </tr>
    {{#extends}}
    <tr>
      <td class="type, text"><span>
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </span></td>
      <td class="text"><span>
      {{#modifications.length}}
      <ul class="list-parameter-assignments">
      {{#modifications}}
      <li>
      <code>
      {{#prefix}}
      {{prefix}} {{className}} {{name}}
      {{#modifications.length}}
      <ul class="list-parameter-assignments">
      {{#modifications}}
      <li>
      <code>
      {{#hasEach}} each {{/hasEach}}{{#isFinal}} final {{/isFinal}} {{name}} = {{value}}
      </code>
      </li>
      {{/modifications}}
      </ul>
      {{/modifications.length}}
      {{/prefix}}
      {{^prefix}}
      {{#hasEach}} each {{/hasEach}}{{#isFinal}} final {{/isFinal}} {{name}} = {{value}}
      {{/prefix}}
      </code>
      </li>
      {{/modifications}}
      </ul>
      {{/modifications.length}}
      </span></td>
      </tr>
    {{/extends}}
    </table>
  {{/extends.length}}

    {{#public.parameters}}
<h3>Parameters</h3>
    {{#public.parameters.tabs.length}}
    <p>
    It has the following parameters:
    </p>
    <table>
    <tr>
    <th class="mode">Type        </th>
    <th>Quantity  </th>
    <th>Name    </th>
    <th>Default    </th>
    <th>Unit     </th>
    <th>Display unit</th>
    <th>min    </th>
    <th>max    </th>
    <th class="description">Description</th>
    </tr>
    {{#public.parameters.tabs}}
    <tr class="tab ModelicaParameterTab"><td colspan="9">{{name}}</td></tr>
    {{#groups}}
    <tr class="group ModelicaParameterGroup"><td colspan="9">{{name}}</td></tr>
    {{#parameters}}
    <tr>
    <td class="type, text"><span>{{{html.type}}}</span></td>
    <td>{{html.quantity}}</td>
    <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
    <td>{{html.value}}</td>
    <td>{{html.unit}}</td>
    <td>{{html.displayUnit}}</td>
    <td>{{html.min}}</td>
    <td>{{html.max}}</td>
    <td>{{comment}}</td>
    </tr>
    {{/parameters}}
    {{/groups}}
    {{/public.parameters.tabs}}
    </table>
    {{/public.parameters.tabs.length}}
    {{/public.parameters}}

  {{#public.inputs.length}}
<h3>Inputs</h3>
    <p>
    It has the following inputs:
    </p>
    <table>
    <tr>
      <th class="type">Type        </th>
      <th>Quantity  </th>
      <th>Name    </th>
      <th class="description">Description</th>
      <th>min    </th>
      <th>max    </th>
      <th>Unit     </th>
      <th>Display unit     </th>
      {{#conditionalInput}}
      <th>Enable    </th>
      {{/conditionalInput}}
      </tr>
    {{#public.inputs}}
    <tr>
      <td>
      <code>
      {{html.type}}
      </code>
      </td>
      <td>{{html.quantity}}</td>
      <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      <td>{{html.min}}</td>
      <td>{{html.max}}</td>
      <td>{{html.unit}}</td>
      <td>{{html.displayUnit}}</td>
      {{#conditionalInput}}
      <td>{{enable}}</td>
      {{/conditionalInput}}
      </tr>
    {{/public.inputs}}
    </table>
  {{/public.inputs.length}}

  {{#public.outputs.length}}
<h3>Outputs</h3>
    <p>
    It has the following outputs:
    </p>
    <table>
    <tr>
      <th class="type">Type        </th>
      <th>Quantity  </th>
      <th>Name    </th>
      <th class="description">Description</th>
      <th>min    </th>
      <th>max    </th>
      <th>Unit     </th>
      <th>Display unit     </th>
      {{#conditionalOutput}}
      <th>Enable    </th>
      {{/conditionalOutput}}
      </tr>
    {{#public.outputs}}
    <tr>
      <td>
      <code>
      {{html.type}}
      </code>
      </td>
      <td>{{html.quantity}}</td>
      <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      <td>{{html.min}}</td>
      <td>{{html.max}}</td>
      <td>{{html.unit}}</td>
      <td>{{html.displayUnit}}</td>
      {{#conditionalOutput}}
      <td>{{enable}}</td>
      {{/conditionalOutput}}
      </tr>
    {{/public.outputs}}
    </table>
  {{/public.outputs.length}}

  {{#public.models.length}}
<h3>Blocks</h3>
    <p>
    It has the following blocks:
    </p>
    <table>
    <tr>
      <th class="type">Type</th>
      <th>Name</th>
      <th class="description">Description</th>
      {{#pubConditionalBlock}}
      <th>Enable    </th>
      {{/pubConditionalBlock}}
      <th>Parameter Assignments</th>
    </tr>
    {{#public.models}}
    <tr>
      <td class="type, text"><span>
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </span></td>
      <td>
      <code>
      {{name}}
      </code>
      <a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      {{#pubConditionalBlock}}
      <td>{{enable}}</td>
      {{/pubConditionalBlock}}
      <td class="text"><span>
      {{#modifications.length}}
      <ul class="list-parameter-assignments">
      {{#modifications}}
      <li>
      <code>
      {{#hasEach}} each {{/hasEach}}{{#isFinal}} final {{/isFinal}} {{name}} = {{value}}
      </code>
      </li>
      {{/modifications}}
      </ul>
      {{/modifications.length}}
      </span></td>
      </tr>
    {{/public.models}}
    </table>
  {{/public.models.length}}

  {{#protected.parameters}}
<h3>Protected Parameters</h3>
    {{#protected.parameters.tabs.length}}
    <p>
    It has the following protected parameters:
    </p>
    <table>
    <tr>
    <th class="type">Type        </th>
    <th>Quantity  </th>
    <th>Name    </th>
    <th>Default    </th>
    <th>Unit     </th>
    <th>Display unit</th>
    <th>min    </th>
    <th>max    </th>
    <th class="description">Description</th>
    </tr>
    {{#protected.parameters.tabs}}
    <tr class="tab ModelicaParameterTab"><td colspan="9">{{name}}</td></tr>
    {{#groups}}
    <tr class="group ModelicaParameterGroup"><td colspan="9">{{name}}</td></tr>
    {{#parameters}}
    <tr>
    <td class="type, text"><span>{{{html.type}}}</span></td>
    <td>{{html.quantity}}</td>
    <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
    <td>{{html.value}}</td>
    <td>{{html.unit}}</td>
    <td>{{html.displayUnit}}</td>
    <td>{{html.min}}</td>
    <td>{{html.max}}</td>
    <td>{{comment}}</td>
    </tr>
    {{/parameters}}
    {{/groups}}
    {{/protected.parameters.tabs}}
    </table>
    {{/protected.parameters.tabs.length}}
  {{/protected.parameters}}

  {{#protected.models.length}}
<h3>Protected Blocks</h3>
    <p>
    It has the following protected blocks:
    </p>
    <table>
    <tr>
      <th class="type">Type</th>
      <th>Name</th>
      <th class="description">Description</th>
      {{#proConditionalBlock}}
      <th>Enable    </th>
      {{/proConditionalBlock}}
      <th>Parameter Assignments</th>
    </tr>
    {{#protected.models}}
    <tr>
      <td class="type, text"><span>
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </span></td>
      <td>
      <code>
      {{name}}
      </code>
      <a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      {{#proConditionalBlock}}
      <td>{{enable}}</td>
      {{/proConditionalBlock}}
      <td class="text"><span>
      {{#modifications.length}}
      <ul class="list-parameter-assignments">
      {{#modifications}}
      <li>
      <code>
      {{#hasEach}} each {{/hasEach}}{{#isFinal}} final {{/isFinal}} {{name}} = {{value}}
      </code>
      </li>
      {{/modifications}}
      </ul>
      {{/modifications.length}}
      </span></td>
      </tr>
    {{/protected.models}}
    </table>
  {{/protected.models.length}}

  {{#connections.length}}
    <h3>Connections</h3>
    <p>
    The inputs of the internal blocks are connected to the following outputs:
    </p>
    <ol>
    {{#connections}}
    <li>
    <code><a href="#{{topClassName}}.{{0.instance}}">{{0.instance}}</a>{{#0.connector}}.{{#0.portLinkTarget}}<a href="#{{0.portLinkTarget}}">{{/0.portLinkTarget}}{{0.connector}}
    {{#0.portLinkTarget}}</a>{{/0.portLinkTarget}}{{/0.connector}}</code>
    &rarr;
    <code><a href="#{{topClassName}}.{{1.instance}}">{{1.instance}}</a>{{#1.connector}}.{{#1.portLinkTarget}}<a href="#{{1.portLinkTarget}}">{{/1.portLinkTarget}}{{1.connector}}
    {{#1.portLinkTarget}}</a>{{/1.portLinkTarget}}{{/1.connector}}</code>
    </li>
    {{/connections}}
    </ol>
  {{/connections.length}}

  {{#hasDiagramSVG}}
  <p align="center">
  <img alt="Diagram layer" src="img/{{svgName}}">
  </p>
  {{/hasDiagramSVG}}
    `

  // Add html elements to simplify output generation
  var comCop = addHtmlElements(fileName, component, parseMode)
  // Not all blocks have an html section
  var hasDiagramSVG = false
  var diagramSVG
  var svgName
  var svgFile
  comCop.forEach(ele => {
    if (ele.info) {
      // The parameters are in tabs and groups. Hence we need to iterate
      // through these data structures rather than simply concatenting it.
      const parameters = saveConcat('public.parameters', 'protected.parameters', ele)
      ele.info = addLinkToCode(ele.info,
        saveConcat(
          'public.models', 'protected.models', ele),
        parameters,
        // (parameters.length === 0) ? null : parameters,
        saveConcat(
          'public.inputs', 'protected.inputs', ele),
        saveConcat(
          'public.outputs', 'protected.outputs', ele)
      )
      ele.info = updateImageSrc(ele.info)
      ele.info = ele.info.replace('</html>', '').replace('<html>', '')
    }

    const checkCondition = checkConditionAttribute(ele)
    Object.assign(ele,
      { 'conditionalInput': checkCondition.conditionalInput },
      { 'conditionalOutput': checkCondition.conditionalOutput },
      { 'pubConditionalBlock': checkCondition.pubConditionalBlock },
      { 'proConditionalBlock': checkCondition.proConditionalBlock })

    // Group all the parameters by tabs and groups
    if (ele.public && ele.public.parameters) {
      ele.public.parameters = groupParameters(ele.public.parameters)
    }
    if (ele.protected && ele.protected.parameters) {
      ele.protected.parameters = groupParameters(ele.protected.parameters)
    }
    if (ele.svg && ele.svg.diagram && ele.svg.diagram.drawing) {
      hasDiagramSVG = true
      diagramSVG = ele.svg.diagram.drawing
      svgName = ele.topClassName + '.svg'
      svgFile = path.join(imgDir, svgName)
      // Create an empty folder 'dir'
      ut.createDir(imgDir)
      fs.writeFile(svgFile, diagramSVG, function (err) {
        if (err) throw err
      })
      Object.assign(ele,
        { 'hasDiagramSVG': hasDiagramSVG },
        { 'svgName': svgName })
    }
  })
  // return mu.render(template, comCop).trim()
  var htmlData = comCop.map(dat => mu.render(template, dat).trim())
  return htmlData
}

/** Return a list with the elements of `listOfPars` that are
  * in the tab `tab` and in the group `group`.
  *
  *@param listOfPars A list of parameters.
  *@param tab A string with the tab name.
  *@param group A string with the group name.
  *@returns A list with the parameters filtered by `tab` and `group`.
  *        If there is no match, then `null` is returned.
  */
var getParametersByTabAndGroup = function (listOfPars, tab, group) {
  return listOfPars.filter(par => {
    const thisTab = js.getProperty(['annotation', 'dialog', 'tab'], par)
    if (thisTab !== tab) {
      return null
    } else {
      const thisGro = js.getProperty(['annotation', 'dialog', 'group'], par)
      return (thisGro === group)
    }
  })
}

/** Return a json structure of the parameters, grouped by
  * tab and group as received from their annotation.
  *
  *@param listOfPars A list of parameters.
  *@return A json structure with the parameters grouped by `tab` and `group`.
  */
function groupParameters (listOfPars) {
  var tabs = listOfPars.map(par => { return js.getProperty(['annotation', 'dialog', 'tab'], par) })

  // Remove dublicates and null
  const tabsUni = unique(tabs).filter(ele => ele !== null)

  const tabEntries = tabsUni.map(tab => {
    // Within each tab, group the parameters by their group
    const parOnTab = listOfPars.filter(par => js.getProperty(['annotation', 'dialog', 'tab'], par) === tab)
    var groups = parOnTab.map(par => { return js.getProperty(['annotation', 'dialog', 'group'], par) })
    // Remove dublicates and null
    const groUni = unique(groups).filter(ele => ele !== null)
    var parsInGroup = []
    groUni.forEach(gro => {
      parsInGroup.push({ 'name': gro, 'parameters': getParametersByTabAndGroup(listOfPars, tab, gro) })
    })
    return { 'name': tab, 'groups': parsInGroup }
  })

  return { 'tabs': tabEntries }
}

function removeHtmlTag (string, tag) {
  var regEx = new RegExp('</?' + tag + '>', 'ig')
  return string.replace(regEx, '')
}

function getHTMLType (className, topCLass, components, parseMode, fileName) {
  var cla = className
  // Add the fully qualified name to cla
  const packages = ['Interfaces', 'Types']
  packages.forEach(function (ele) {
    if (cla.startsWith('CDL.' + ele)) {
      cla = 'Buildings.Controls.OBC.' + cla
    } else if (cla.startsWith('OBC.CDL.' + ele)) {
      cla = 'Buildings.Controls.' + cla
    } else if (cla.startsWith('Controls.OBC.CDL.' + ele)) {
      cla = 'Buildings.' + cla
    }
  })
  // Return the className as it should appear in html
  switch (cla) {
    case 'Buildings.Controls.OBC.CDL.Interfaces.RealInput':
      return 'Real'
    case 'Buildings.Controls.OBC.CDL.Interfaces.IntegerInput':
      return 'Integer'
    case 'Buildings.Controls.OBC.CDL.Interfaces.BooleanInput':
      return 'Boolean'
    case 'Buildings.Controls.OBC.CDL.Interfaces.DayTypeInput':
      return 'DayType'
    case 'Buildings.Controls.OBC.CDL.Interfaces.RealOutput':
      return 'Real'
    case 'Buildings.Controls.OBC.CDL.Interfaces.IntegerOutput':
      return 'Integer'
    case 'Buildings.Controls.OBC.CDL.Interfaces.BooleanOutput':
      return 'Boolean'
    case 'Buildings.Controls.OBC.CDL.Interfaces.DayTypeOutput':
      return 'DayType'
  }
  if (!js.isType(className) && !className.startsWith('Modelica.SIunits')) {
    return '<a href="' + getTargetName(className, topCLass, components, parseMode, fileName) + '">' + className + '</a>'
  }
  return className
}

/** Returns a string that has the hyperlink target name for the class `className`.
*/
function getTargetName (className, topClassName, components, parseMode, fileName) {
  if (js.isElementaryCDL(className)) {
    // This is a CDL block
    return getLibraryLink(className)
  } else {
    if (parseMode === 'cdl') {
      return '#' + className
    } else {
      // If 'className' and 'topClassName' indicate that the class is in same
      // package as top class, search the target in current package.html file;
      // Otherwise, search target in other package.html files whose name 'fileName'
      // (is also package names) should be same as package name indicated in
      // 'className'
      var idx0 = className.lastIndexOf('.')
      var classPack = className.slice(0, idx0)
      var idx1 = topClassName.lastIndexOf('.')
      var topClassPack = topClassName.slice(0, idx1)
      if (classPack === topClassPack) {
        return '#' + className
      } else {
        for (var i = 0; i < fileName.length; i++) {
          var idx2 = fileName[i].lastIndexOf(path.sep)
          var filePack = fileName[i].slice(idx2 + 1, -5)
          if (filePack === classPack) {
            break
          }
        }
        return filePack + '.html#' + className
      }
    }
  }
}

/** Returns the http address of the documentation of the class 'className'
 */
function getLibraryLink (className) {
  const libPre = 'Buildings.Controls.OBC'
  if (!className.includes(libPre)) {
    var classEle = className.split('.')
    var libPreEle = libPre.split('.')
    className = mergeTwoArray(libPreEle, classEle)
  }
  const lastInd = className.lastIndexOf('.')
  return 'http://simulationresearch.lbl.gov/modelica/releases/v5.0.1/help/' +
  className.substring(0, lastInd).replace(/\./g, '_') + '.html#' +
  className
}

function addHtmlAnchorAndTargets (path, components, parseMode, fileName) {
  components.forEach(component => {
    var prop = js.getProperty(path, component)
    if (prop) {
      prop.forEach(mod => {
        mod['html'] = {
          'anchor': mod['name'] ? (component.topClassName + '.' + mod['name']) : (component.topClassName),
          'target': getTargetName(mod['className'], component.topClassName, components, parseMode, fileName) }
      })
    }
  })
}

function addHtmlToConnectors (path, components) {
  components.forEach(component => {
    var prop = js.getProperty(path, component)
    if (prop) {
      prop.forEach(obj => {
        setConnectorHTMLAttributes(obj)
        setConnectorHTMLType(obj)
      })
    }
  })
}

function addHtmlToParameters (path, components) {
  components.forEach(component => {
    const prop = js.getProperty(path, component)
    if (prop !== null) {
      // Iterate over the tabs and groups
      prop.forEach(par => {
        setParameterHTMLAttributes(par)
        setHtmlToParameterModification(par)
      })
    }
  })
}

function removeQuotes (s) {
  if (s) {
    return s.slice(1, -1)
  } else {
    return s
  }
}

function addAdjustable (s) {
  if (s.prefix !== undefined && s.prefix.match('final')) {
    return s.value + ' (adjustable)'
  } else {
    return s.value
  }
}

function setHtmlToParameterModification (parameterModification) {
  // Format for html output
  if (parameterModification.value !== null) {
    parameterModification.html.value = addAdjustable(parameterModification)
  }
  if (parameterModification.unit) {
    parameterModification.html.unit = removeQuotes(parameterModification.unit.value)
  }
  if (parameterModification.displayUnit) {
    parameterModification.html.displayUnit = removeQuotes(parameterModification.displayUnit.value)
  }
  if (parameterModification.quantity) {
    parameterModification.html.quantity = removeQuotes(parameterModification.quantity.value)
  }
  if (parameterModification.min) {
    parameterModification.html.min = addAdjustable(parameterModification.min)
  }
  if (parameterModification.max) {
    parameterModification.html.max = addAdjustable(parameterModification.max)
  }
  return parameterModification
}

/** Set the `html` attribute of `connector`
 */
function setConnectorHTMLAttributes (connector) {
  if (connector.unit) {
    connector.html.unit = removeQuotes(connector.unit.value)
  }
  if (connector.displayUnit) {
    connector.html.displayUnit = js.convertFromSIUnit(removeQuotes(connector.displayUnit.value))
  } else {
    if (connector.unit) {
      connector.html.displayUnit = js.convertFromSIUnit(removeQuotes(connector.unit.value))
    }
  }
  if (connector.quantity) {
    connector.html.quantity = removeQuotes(connector.quantity.value)
  }
  if (connector.min) {
    connector.html.min = addAdjustable(connector.min)
  }
  if (connector.max) {
    connector.html.max = addAdjustable(connector.max)
  }
  if (connector.enable) {
    connector.html.enable = removeQuotes(connector.enable)
  }
}

/** Add html elements to parameter
 *
 *@param parameter parameter component
 *@return updated parameter component with html object
 */
function setParameterHTMLAttributes (parameter) {
  parameter.html.type = parameter.className
  parameter.html.quantity = parameter.quantity
  parameter.html.unit = parameter.unit
  parameter.html.displayUnit = parameter.displayUnit
  return parameter
}

/** Set the `html.type` attribute of `connector`, and
  * return `connector`
  */
function setConnectorHTMLType (connector) {
  connector.html.type = getHTMLType(connector.className)
  return connector
}

/** Add html elements to the component to simplify output rendering
  *
  *@param fileName output file name array
  *@param components The component to document
  *@param parseMode parsing mode, `cdl` or `modelica`
  *@return A copy of the component with the html elements added
  */
function addHtmlElements (fileName, components, parseMode) {
  // Make a copy of the input argument so we can modify it.
  var comCop = components.map(com => JSON.parse(JSON.stringify(com)))
  // Add the anchor and target to the models
  addHtmlAnchorAndTargets(['public', 'parameters'], comCop, parseMode, fileName)
  addHtmlAnchorAndTargets(['protected', 'parameters'], comCop, parseMode, fileName)

  addHtmlAnchorAndTargets(['public', 'models'], comCop, parseMode, fileName)
  addHtmlAnchorAndTargets(['protected', 'models'], comCop, parseMode, fileName)
  addHtmlAnchorAndTargets(['extends'], comCop, parseMode, fileName)

  addHtmlAnchorAndTargets(['public', 'inputs'], comCop, parseMode, fileName)
  addHtmlAnchorAndTargets(['protected', 'inputs'], comCop, parseMode, fileName)

  addHtmlAnchorAndTargets(['public', 'outputs'], comCop, parseMode, fileName)
  addHtmlAnchorAndTargets(['protected', 'outputs'], comCop, parseMode, fileName)

  addHtmlToConnectors(['public', 'inputs'], comCop)
  addHtmlToConnectors(['protected', 'inputs'], comCop)

  addHtmlToConnectors(['public', 'outputs'], comCop)
  addHtmlToConnectors(['protected', 'outputs'], comCop)

  addHtmlToParameters(['public', 'parameters'], comCop)
  addHtmlToParameters(['protected', 'parameters'], comCop)

  return comCop
}

/** Add hyperlinks to the html body and return the html body.
  */
function addLinkToCode (
  htmlBody,
  allModels,
  allParameters,
  allInputs,
  allOutputs) {
  // Create an array with 'name': html entries.
  var ent = {}
  if (allModels) {
    allModels.forEach(obj => {
      ent[obj.name] = obj.html
    })
  }
  // Iterate over the tabs and groups
  if (allParameters) {
    allParameters.forEach(par => {
      ent[par.name] = par.html
    })
  }
  if (allInputs) allInputs.forEach(obj => { ent[obj.name] = obj.html })
  if (allOutputs) allOutputs.forEach(obj => { ent[obj.name] = obj.html })
  var $ = cheerio.load('<html><head></head><body>' + htmlBody + '</body></html>')
  // When there is content like:
  //   <a href=\"Buildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.SetPoints.VAVSupplyFan\">
  //   \nBuildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.SetPoints.VAVSupplyFan</a>
  if (allModels) {
    $('a').each(function (index) {
      const entry2 = $(this).text().trim()
      var targetMod = allModels.filter(function (model) {
        return model.className === entry2
      })
      if (targetMod[0]) {
        var name = targetMod[0].name
        if (name && ent[name]) {
          $(this).replaceWith('<code><a href="#' + ent[name].anchor + '">' + entry2 + '</a></code>')
        }
      } else {
        $(this).replaceWith('<code>' + entry2 + '</code>')
      }
    })
  }
  // Add hyperlink to the parameter, input, output
  $('code').each(function (index) {
    const entry = $(this).text().trim()
    if (ent[entry]) {
      // This is a name of parameter or input or output
      $(this).replaceWith('<code><a href="#' + ent[entry].anchor + '">' + entry + '</a></code>')
    }
  })
  return $('body').html()
}

/** Return the content of page.html.

    The content is a complete html page, returned as a string.
*/
function getPage (data) {
  var fileName = path.join(__dirname, 'page.html')
  var content = fs.readFileSync(fileName, 'utf8')
  return mu.render(content, { 'body': data })
}

/** Search the MODELICAPATH and copy all images with names in `fileNames`,
    unless they already exist
  *@param fileNames name of the image files.
  *@param imgDir full path of folder to save img files, e.g. ../html/img.
  */
function copyImages (fileNames, imgDir) {
  const MODELICAPATH = ut.getMODELICAPATH()

  // Search each file on the Modelica path, and if found, copy it
  fileNames.forEach(fileName => {
    const temp = fileName.replace('file:///', '')
    var imgNam = temp.substring(temp.lastIndexOf('/') + 1)
    var des = path.join(imgDir, imgNam)
    var src = null
    var mustCopy = false
    if (fs.existsSync(des)) {
      src = des
    } else {
      // Search on the MODELICAPATH
      // Note that 'file:///Buildings/Resources' may be in the
      // directory 'file:///Buildings 5.0.1/Resources'
      // rather than only in Buildings
      var fileWithoutPackage = temp.substring(temp.indexOf('/'))

      for (var k = 0; k < MODELICAPATH.length; k++) {
        // Process the first element in the MODELICAPATH
        // Search 'Buildings' and 'Buildings x' where x is any character
        var dirs = glob.sync(path.join(MODELICAPATH[k], 'Buildings?( *)'))
        for (var d = 0; d < dirs.length; d++) {
          const can = path.join(dirs[d], fileWithoutPackage)
          if (fs.existsSync(can)) {
            src = can
            mustCopy = true
            break
          }
        }
      }
    }
    if (src == null) {
      logger.warn('Warning: Did not find image file for modelica://' + temp + '\n' +
            '  Make sure your library is on the MODELICAPATH.\n' +
            '  Search directories are ' + MODELICAPATH)
      pa.warnCounter = pa.warnCounter + 1
    } else {
      if (mustCopy) {
        // Create directory if it does not exists
        const di = des.substring(0, des.lastIndexOf('/'))
        fse.ensureDirSync(di)
        try {
          fse.copySync(src, des)
        } catch (err) {
          logger.warn(err)
          pa.warnCounter = pa.warnCounter + 1
        }
      }
    }
  })
}

/**
  * Search the html_body for the 'src' attribute of all 'img' elements,
  * and return them as an array.
  */
function getImageLocations (htmlBody) {
  const src = []
  var $ = cheerio.load('<html><head></head><body>' + htmlBody + '</body></html>')
  $('img').each(function (i, elem) {
    src[i] = $(this).attr('src')
    // If there is a trailing /, remove it. It could be from ..pSet.png\"/>
    if (src[i].endsWith('/')) {
      src[i] = src[i].slice(0, -1)
    }
    // Remove trailing \"
    if (src[i].startsWith('\\"') && src[i].endsWith('\\"')) {
      src[i] = src[i].slice(2, -2)
    }
  })
  return src
}

/** Undate images' reference address 'src', after they have been copied to
  * folder "/html/img"
  */
function updateImageSrc (htmlBody) {
  var srcOld
  var alt
  var newSrc
  var imgNam
  var $ = cheerio.load('<html><head></head><body>' + htmlBody + '</body></html>')
  $('img').each(function (index) {
    srcOld = $(this).attr('src')
    imgNam = srcOld.substring(srcOld.lastIndexOf('/') + 1)
    alt = $(this).attr('alt')
    newSrc = '<img alt="' + alt + '" src="' + path.join('img/', imgNam) + '">'
    $(this).replaceWith(newSrc)
  })
  return $('body').html()
}

function write (fileName, data, parseMode) {
  var nonCDLData = []
  if (parseMode === 'modelica') {
    data.forEach(function (ele) {
      if (ele[0].topClassName !== undefined && !js.isElementaryCDL(ele[0].topClassName)) {
        nonCDLData.push(ele[0])
      }
    })
  } else {
    nonCDLData = data.filter(ele => ele.topClassName !== undefined && !js.isElementaryCDL(ele.topClassName))
  }

  // Copy the images
  const files = []
  nonCDLData.forEach(function (dat) {
    const f = getImageLocations(dat.info)
    f.forEach(function (obj) {
      files.push(obj)
    })
  })

  var basDir = fileName[0].substring(0, fileName[0].lastIndexOf(path.sep))
  var imgDir = path.join(basDir, 'img')
  copyImages(files, imgDir)

  // Get the html snippet of the component
  logger.debug('Compiling html for ' + nonCDLData.length + ' components.')
  // Write the file
  const page = getHtmlPage(fileName, imgDir, nonCDLData, parseMode)
  return ut.writeFile(fileName, page)
}

/** Returns the concatenation of the json objects
  * at path1 and path2. The path may not exists.
  * If path1 and path2 both do not exist, the function
  * returns null
  */
var saveConcat = function (path1, path2, jsonObject) {
  const p1 = js.getProperty(path1.split('.'), jsonObject)
  const p2 = js.getProperty(path2.split('.'), jsonObject)
  if (p1 === null) {
    if (p2 === null) {
      return null
    } else {
      return p2
    }
  } else { // p1 is not null
    if (p2 === null) {
      return p1
    } else {
      return p1.concat(p2)
    }
  }
}

/** Check if any connector or block has condition attribute
  *
  *@param obj Simplified Json structure of a model
  *@returns A json structure with flag to indicate the existence of condition attribute
  */
function checkConditionAttribute (obj) {
  var conditionalInput = false
  var conditionalOutput = false
  var pubConditionalBlock = false
  var proConditionalBlock = false
  if (obj.public && obj.public.inputs) {
    conditionalInput = conditionAttribute(obj.public.inputs)
  }
  if (obj.public && obj.public.outputs) {
    conditionalOutput = conditionAttribute(obj.public.outputs)
  }
  if (obj.public && obj.public.models) {
    pubConditionalBlock = conditionAttribute(obj.public.models)
  }
  if (obj.protected && obj.protected.models) {
    proConditionalBlock = conditionAttribute(obj.protected.models)
  }
  return Object.assign(
    {'conditionalInput': conditionalInput},
    {'conditionalOutput': conditionalOutput},
    {'pubConditionalBlock': pubConditionalBlock},
    {'proConditionalBlock': proConditionalBlock}
  )
}

/** Check if the connector or block has condition attribute
 *
 *@param obj A Json structure of connector or block in a model
 *@returns A flag to indicate if the component has condition attribute
*/
function conditionAttribute (obj) {
  var hasConditionAttribute = false
  obj.some(function (ele) {
    if (ele.enable) {
      hasConditionAttribute = true
    }
    return hasConditionAttribute
  })
  return hasConditionAttribute
}

/** Get a text representation of the html page.
  *
  *@param fileName output file name array
  *@param imgDir folder to save image files
  *@param data The simplified JSON representation (not raw).
  *@param parseMode parsing mode, 'cdl' or 'modelica'
  *@return The text representation of the html page.
  */
var getHtmlPage = function (fileName, imgDir, data, parseMode) {
  // Convert each element of data to html
  // const dataWithHtml = data.map(dat => toHtml(dat))
  if (parseMode === 'cdl') {
    const dataWithHtml = toHtml(fileName, imgDir, data, parseMode)
    // Write the file
    return getPage(dataWithHtml.join(''))
  } else {
    var page = []
    fileName.forEach(name => {
      var idx0 = name.lastIndexOf(path.sep)
      var packNameBase = name.slice(idx0 + 1, -5)
      // Group the data according to their belongings to the packages
      var dataGroupTemp = []
      var dataGroup
      data.forEach(ele => {
        var topCla = ele.topClassName
        var idx1 = topCla.lastIndexOf('.')
        var packName
        if (ele.modelicaFile.endsWith('package.mo')) {
          packName = topCla
        } else {
          packName = topCla.slice(0, idx1)
        }
        if (packName === packNameBase) {
          dataGroupTemp.push(ele)
        }
      })
      dataGroup = movePack(dataGroupTemp)
      var withHtml = toHtml(fileName, imgDir, dataGroup, parseMode)
      page.push(getPage(withHtml.join('')))
    })
    return page
  }
}

// Move the package information model to be at beginning of each package html
var movePack = function (data) {
  var idx = 0
  var packageData
  for (var i = 0; i < data.length; i++) {
    if (data[i].modelicaFile.endsWith('package.mo')) {
      idx = i
      packageData = data[i]
    }
  }
  if (idx !== 0) {
    data.splice(idx, 1)
    data.splice(0, 0, packageData)
  }
  return data
}

/** Concate two array and remove the duplicate elements, then join the new array
    elements with '.'
 */
function mergeTwoArray (arr1, arr2) {
  var temp = arr1.concat(arr2)
  // remove duplicate elements
  temp = temp.filter(function (item, pos) { return temp.indexOf(item) === pos })
  return temp.join('.')
}

module.exports.toHtml = toHtml
module.exports.getHtmlPage = getHtmlPage
module.exports.removeHtmlTag = removeHtmlTag
module.exports.getImageLocations = getImageLocations
module.exports.copyImages = copyImages
module.exports.write = write
module.exports.getHTMLType = getHTMLType
