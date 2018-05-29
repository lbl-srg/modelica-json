const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const glob = require('glob')
const cheerio = require('cheerio')
const mu = require('mustache')
const unique = require('array-unique')

const js = require('../lib/jsonquery')
const ut = require('../lib/util')

var logger = require('winston')

/** Parse the json component description
  *  and return an html snippet
  */
function toHtml (fileName, component, parseType) {
  var template = `
  {{! This is a template for a Modelica block. }}

<h2>{{topClassName}}<a name="{{topClassName}}"></a></h2>

  <p>{{comment}}</p>

  {{#info}}
<h3>Functionality</h3>
  {{{info}}}
  {{/info}}

    {{#public.parameters}}
<h3>Parameters</h3>
    {{#public.parameters.tabs.length}}
    <p>
    It has the following parameters:
    </p>
    <table>
    <tr><th>Name    </th>
    <th class="description">Description</th>
    <th>Value    </th>
    <th>Unit     </th>
    <th>Display unit</th>
    <th class="type">Type        </th>
    <th>min    </th>
    <th>max    </th>
    </tr>
    {{#public.parameters.tabs}}
    <tr class="tab"><td colspan="8">{{name}}</td></tr>
    {{#groups}}
    <tr class="group"><td colspan="8">{{name}}</td></tr>
    {{#parameters}}
    <tr>
    <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
    <td>{{comment}}</td>
    <td>{{html.value}}</td>
    <td>{{html.unit}}</td>
    <td>{{html.displayUnit}}</td>
    <td class="type">{{{html.type}}}</td>
    <td>{{html.min}}</td>
    <td>{{html.max}}</td>
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
      <th>Name    </th>
      <th class="description">Description</th>
      <th>min    </th>
      <th>max    </th>
      <th>Unit     </th>
      <th>Display unit     </th>
      </tr>
    {{#public.inputs}}
    <tr>
      <td>
      <code>
      {{html.type}}
      </code>
      </td>
      <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      <td>{{html.min}}</td>
      <td>{{html.max}}</td>
      <td>{{html.unit}}</td>
      <td>{{html.displayUnit}}</td>
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
      <th>Name    </th>
      <th class="description">Description</th>
      <th>min    </th>
      <th>max    </th>
      <th>Unit     </th>
      <th>Display unit     </th>
      </tr>
    {{#public.outputs}}
    <tr>
      <td>
      <code>
      {{html.type}}
      </code>
      </td>
      <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      <td>{{html.min}}</td>
      <td>{{html.max}}</td>
      <td>{{html.unit}}</td>
      <td>{{html.displayUnit}}</td>
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
      <th>Parameter Assignments</th>
    </tr>
    {{#public.models}}
    <tr>
      <td class="type">
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </td>
      <td>
      <code>
      {{name}}
      </code>
      <a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      <td>
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
      </td>
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
    <tr><th>Name    </th>
    <th class="description">Description</th>
    <th>Value    </th>
    <th>Unit     </th>
    <th>Display unit</th>
    <th class="type">Type        </th>
    <th>min    </th>
    <th>max    </th>
    </tr>
    {{#protected.parameters.tabs}}
    <tr class="tab"><td colspan="8">{{name}}</td></tr>
    {{#groups}}
    <tr class="group"><td colspan="8">{{name}}</td></tr>
    {{#parameters}}
    <tr>
    <td><code>{{name}}</code><a name="{{html.anchor}}"></a></td>
    <td>{{comment}}</td>
    <td>{{html.value}}</td>
    <td>{{html.unit}}</td>
    <td>{{html.displayUnit}}</td>
    <td class="type">{{{html.type}}}</td>
    <td>{{html.min}}</td>
    <td>{{html.max}}</td>
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
      <th>Parameter Assignments</th>
    </tr>
    {{#protected.models}}
    <tr>
      <td class="type">
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </td>
      <td>
      <code>
      {{name}}
      </code>
      <a name="{{html.anchor}}"></a></td>
      <td>{{comment}}</td>
      <td>
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
      </td>
      </tr>
    {{/protected.models}}
    </table>
  {{/protected.models.length}}

  {{#extends.length}}
<h3>Extends Blocks</h3>
    <p>
    It has the following extends classes:
    </p>
    <table>
    <tr>
      <th class="type">Type</th>
      <th>Modification</th>
    </tr>
    {{#extends}}
    <tr>
      <td class="type">
      <code>
      <a href="{{html.target}}">{{className}}</a>
      </code>
      </td>
      <td>
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
      </td>
      </tr>
    {{/extends}}
    </table>
  {{/extends.length}}

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
    `

  // Add html elements to simplify output generation
  var comCop = addHtmlElements(fileName, component, parseType)

  // Not all blocks have an html section
  for (var i = 0; i < comCop.length; i++) {
    if (comCop[i].info) {
      // The parameters are in tabs and groups. Hence we need to iterate
      // through these data structures rather than simply concatenting it.
      const parameters = saveConcat('public.parameters', 'protected.parameters', comCop[i])

      comCop[i].info = addLinkToCode(comCop[i].info,
        saveConcat(
          'public.models', 'protected.models', comCop[i]),
        parameters,
        // (parameters.length === 0) ? null : parameters,
        saveConcat(
          'public.inputs', 'protected.inputs', comCop[i]),
        saveConcat(
          'public.outputs', 'protected.outputs', comCop[i])
        )
      comCop[i].info = comCop[i].info.replace('</html>', '').replace('<html>', '')
    }

    // Group all the parameters by tabs and groups
    if (comCop[i].public && comCop[i].public.parameters) {
      comCop[i].public.parameters = groupParameters(comCop[i].public.parameters)
    }
    if (comCop[i].protected && comCop[i].protected.parameters) {
      comCop[i].protected.parameters = groupParameters(comCop[i].protected.parameters)
    }
  }
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
  *@return A list with the parameters filtered by `tab` and `group`.
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

  return {'tabs': tabEntries}
}

function removeHtmlTag (string, tag) {
  var regEx = new RegExp('</?' + tag + '>', 'ig')
  return string.replace(regEx, '')
}

function getHTMLType (className, topCLass, components, parseType, fileName) {
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
    return '<a href="' + getTargetName(className, topCLass, components, parseType, fileName) + '">' + className + '</a>'
  }
  return className
}

/** Returns a string that has the hyperlink target name for the class `className`.
*/
function getTargetName (className, topClassName, components, parseType, fileName) {
  if (js.isElementaryCDL(className)) {
    // This is a CDL block
    return getLibraryLink(className)
  } else {
    if (parseType === 'cdl') {
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
  const lastInd = className.lastIndexOf('.')
  return 'http://simulationresearch.lbl.gov/modelica/releases/v5.0.1/help/' +
  className.substring(0, lastInd).replace(/\./g, '_') + '.html#' +
  className
}

function addHtmlAnchorAndTargets (path, components, parseType, fileName) {
  for (var i = 0; i < components.length; i++) {
    var prop = js.getProperty(path, components[i])
    if (prop) {
      prop.forEach(mod => {
        mod['html'] = {
          'anchor': components[i].topClassName + '.' + mod['name'],
          'target': getTargetName(mod['className'], components[i].topClassName, components, parseType, fileName)}
      })
    }
  }
}

function addHtmlToConnectors (path, components) {
  for (var i = 0; i < components.length; i++) {
    var prop = js.getProperty(path, components[i])
    if (prop) {
      prop.forEach(obj => {
        obj = setConnectorHTMLDisplayUnit(obj)
        setConnectorHTMLType(obj)
      })
    }
  }
}

function addHtmlToParameters (path, components) {
  for (var i = 0; i < components.length; i++) {
    const prop = js.getProperty(path, components)
    if (prop !== null) {
      // Iterate over the tabs and groups
      prop.forEach(par => {
        setParameterHTMLAttributes(par)
        setHtmlToParameterModification(par)
      })
    }
  }
}

function setHtmlToParameterModification (parameterModification) {
  // Add versions that will be written to html
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

/** Add html elements to the component to simplify output rendering
  *
  *@param component The component to document
  *@return A copy of the component with the html elements added
  */
function addHtmlElements (fileName, components, parseType) {
  // Make a copy of the input argument so we can modify it.
  var comCop = components.map(com => JSON.parse(JSON.stringify(com)))
  // Add the anchor and target to the models
  addHtmlAnchorAndTargets(['public', 'parameters'], comCop, parseType, fileName)
  addHtmlAnchorAndTargets(['protected', 'parameters'], comCop, parseType, fileName)

  addHtmlAnchorAndTargets(['public', 'models'], comCop, parseType, fileName)
  addHtmlAnchorAndTargets(['protected', 'models'], comCop, parseType, fileName)
  addHtmlAnchorAndTargets(['extends'], comCop, parseType, fileName)

  addHtmlAnchorAndTargets(['public', 'inputs'], comCop, parseType, fileName)
  addHtmlAnchorAndTargets(['protected', 'inputs'], comCop, parseType, fileName)

  addHtmlAnchorAndTargets(['public', 'outputs'], comCop, parseType, fileName)
  addHtmlAnchorAndTargets(['protected', 'outputs'], comCop, parseType, fileName)

  addHtmlToConnectors(['public', 'inputs'], comCop)
  addHtmlToConnectors(['protected', 'inputs'], comCop)

  addHtmlToConnectors(['public', 'outputs'], comCop)
  addHtmlToConnectors(['protected', 'outputs'], comCop)

  addHtmlToParameters(['public', 'parameters'], comCop)
  addHtmlToParameters(['protected', 'parameters'], comCop)

  return comCop
}

function setConnectorHTMLDisplayUnit (connector) {
  if (!connector.html.displayUnit) {
    if (connector.html.unit) {
      connector.html.displayUnit = js.convertFromSIUnit(connector.html.unit)
    }
  }
  return connector
}

function setParameterHTMLAttributes (parameter) {
  const shortClassName = parameter.className.replace('Modelica.SIunits.', '')
  parameter.html.type = shortClassName
  switch (shortClassName) {
    case 'Temperature':
      parameter.html.unit = 'K'
      parameter.html.displayUnit = js.convertFromSIUnit('K')
      break
    case 'TemperatureDifference':
      parameter.html.unit = 'K'
      parameter.html.displayUnit = js.convertFromSIUnit('K')
      // Keep as 'K'
      if (parameter.html.displayUnit === 'degC') {
        parameter.html.displayUnit = 'K'
      }
      break
    case 'PressureDifference':
      parameter.html.unit = 'Pa'
      parameter.html.displayUnit = js.convertFromSIUnit('Pa')
      break
    case 'AbsolutePressure':
      parameter.html.unit = 'Pa'
      parameter.html.displayUnit = js.convertFromSIUnit('Pa')
      break
    case 'Pressure':
      parameter.html.unit = 'Pa'
      parameter.html.displayUnit = js.convertFromSIUnit('Pa')
      break
    case 'MassFlowRate':
      parameter.html.unit = 'kg/s'
      parameter.html.displayUnit = js.convertFromSIUnit('kg/s')
      break
    case 'VolumeFlowRate':
      parameter.html.unit = 'm3/s'
      parameter.html.displayUnit = js.convertFromSIUnit('m3/s')
      break
    case 'Time':
      parameter.html.unit = 's'
      break
    default:
      // It was none of the above. Hence, it probably is a CDL type,
      // such as Buildings.Controls.OBC.CDL.Types.SimpleController
      parameter.html.type = getHTMLType(parameter.className)
  }
  return parameter
}

/** Set the `html.type` attribute of `connector`, and
  * return `connector`
  */
function setConnectorHTMLType (connector) {
  connector.html.type = getHTMLType(connector.className)
  return connector
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
  $('code').each(function (index) {
    const entry = $(this).text().trim()
    if (ent[entry]) {
      // This is a name of parameter or input or output
      $(this).replaceWith('<code><a href="#' + ent[entry].anchor + '">' + entry + '</a></code>')
    }
  })
  // When there is content like:
  //   <a href=\"Buildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.SetPoints.VAVSupplyFan\">
  //   \nBuildings.Controls.OBC.ASHRAE.G36_PR1.AHUs.MultiZone.SetPoints.VAVSupplyFan</a>
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
  return mu.render(content, {'body': data})
}

/** Search the MODELICAPATH and copy all images with names in `fileNames`,
    unless they already exist
*/
function copyImages (fileNames) {
  const MOPA = ut.getMODELICAPATH()

  // Search each file on the Modelica path, and if found, copy it
  for (var i = 0; i < fileNames.length; i++) {
    const des = fileNames[i].replace('file:///', '')
    var src = null
    var mustCopy = false
    if (fs.existsSync(des)) {
      src = des
    } else {
      // Search on the MODELICAPATH
      // Note that 'file:///Buildings/Resources' may be in the
      // directory 'file:///Buildings 5.0.1/Resources'
      // rather than only in Buildings
      var fileWithoutPackage = des.substring(des.indexOf('/'))

      for (var k = 0; k < MOPA.length; k++) {
        // Process the first element in the MODELICAPATH
        // Search 'Buildings' and 'Buildings x' where x is any character
        var dirs = glob.sync(path.join(MOPA[k], 'Buildings?( *)'))
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
      logger.warn('Warning: Did not find image file for modelica://' + des + '\n' +
            '  Make sure your library is on the MODELICAPATH.\n' +
            '  Search directories are ' + MOPA)
    } else {
      if (mustCopy) {
        // Create directory if it does not exists
        const di = des.substring(0, des.lastIndexOf('/'))
        fse.ensureDirSync(di)
        try {
          fse.copySync(src, des)
        } catch (err) {
          logger.warn(err)
        }
      }
    }
  }
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

function write (fileName, data, parseType) {
  // Copy the images
  const files = []
  data.forEach(function (dat) {
    const f = getImageLocations(dat.info)
    f.forEach(function (obj) {
      files.push(obj)
    })
  })
  copyImages(files)

  // Get the html snippet of the component
  logger.debug('Compiling html for ' + data.length + ' components.')

  // Write the file
  const page = getHtmlPage(fileName, data, parseType)
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

/** Get a text representation of the html page.
  *
  *@param data The simplified JSON representation.
  *@return The text representation of the html page.
  */
var getHtmlPage = function (fileName, data, parseType) {
  // Convert each element of data to html
  // const dataWithHtml = data.map(dat => toHtml(dat))
  if (parseType === 'cdl') {
    const dataWithHtml = toHtml(fileName, data, parseType)
    // Write the file
    return getPage(dataWithHtml.join(''))
  } else {
    var newData = []
    for (var i = 0; i < data.length; i++) {
      newData.push(data[i][0])
    }
    var page = []
    for (var j = 0; j < fileName.length; j++) {
      var idx0 = fileName[j].lastIndexOf(path.sep)
      var packNameBase = fileName[j].slice(idx0 + 1, -5)
      var dataGroup = []
      for (var k = 0; k < newData.length; k++) {
        var topCla = newData[k].topClassName
        var idx1 = topCla.lastIndexOf('.')
        var packName = topCla.slice(0, idx1)
        if (packName === packNameBase) {
          dataGroup.push(newData[k])
        }
      }
      var withHtml = toHtml(fileName, dataGroup, parseType)
      page.push(getPage(withHtml.join('')))
    }
    return page
  }
}

module.exports.toHtml = toHtml
module.exports.getHtmlPage = getHtmlPage
module.exports.removeHtmlTag = removeHtmlTag
module.exports.getImageLocations = getImageLocations
module.exports.write = write
module.exports.getHTMLType = getHTMLType
