// const fs = require('fs')
const unique = require('array-unique')
const cheerio = require('cheerio')
var logger = require('winston')

/** Get the JSON property `p` from the json data `o`
  * If the property does not exist, the function returns null
  */
const getProperty = (p, o) =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o)

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
    const thisTab = getProperty(['annotation', 'dialog', 'tab'], par)
    if (thisTab !== tab) {
      return null
    } else {
      const thisGro = getProperty(['annotation', 'dialog', 'group'], par)
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
  var tabs = listOfPars.map(par => { return getProperty(['annotation', 'dialog', 'tab'], par) })

  // Remove dublicates and null
  const tabsUni = unique(tabs).filter(ele => ele !== null)

  const tabEntries = tabsUni.map(tab => {
    // Within each tab, group the parameters by their group
    const parOnTab = listOfPars.filter(par => getProperty(['annotation', 'dialog', 'tab'], par) === tab)
    var groups = parOnTab.map(par => { return getProperty(['annotation', 'dialog', 'group'], par) })
    // Remove dublicats and null
    const groUni = unique(groups).filter(ele => ele !== null)
    var parsInGroup = []
    groUni.forEach(gro => {
      parsInGroup.push({ 'name': gro, 'parameters': getParametersByTabAndGroup(listOfPars, tab, gro) })
    })
    return { 'name': tab, 'groups': parsInGroup }
  })

  return {'tabs': tabEntries}
}
/** Get the simplified json representation for the model
  */
function simplifyModelicaJSON (model) {
  // Validate the json structure
  const className = getClassName(model)
  if (this.validateClass(model) !== 0) {
    const msg = 'Error during validation of ' + className
    logger.error(msg)
    throw new Error(msg)
  }
  const within = model.within ? model.within[0] : undefined
  const pubParameters = this.getParameters(model, 'public')
  const proParameters = this.getParameters(model, 'protected')

  const pubInputs = this.getComponentsOfClass(
    model, 'Buildings.Controls.OBC.CDL.Interfaces.*Input', 'public')
  const proInputs = this.getComponentsOfClass(
    model, 'Buildings.Controls.OBC.CDL.Interfaces.*Input', 'protected')
  if (proInputs.length !== 0 && !isElementaryCDL(className)) {
    const msg2 = 'Received protected input connectors, which is an invalid specification.' +
    ' Check ' + className
    logger.error(msg2)
    throw new Error(msg2)
  }

  const pubOutputs = this.getComponentsOfClass(
      model, 'Buildings.Controls.OBC.CDL.Interfaces.*Output', 'public')
  const proOutputs = this.getComponentsOfClass(
      model, 'Buildings.Controls.OBC.CDL.Interfaces.*Output', 'protected')
  if (proOutputs.length !== 0) {
    const msg3 = 'Received protected output connectors, which is an invalid specification.' +
    ' Check ' + className
    logger.error(msg3)
    throw new Error(msg3)
  }
  const pubModels = this.getModels(model, 'public')
  const proModels = this.getModels(model, 'protected')

  // Build a json object with all these data
  var info = getProperty(
    ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'composition', 'comp_annotation', 'documentation', 'info'],
    model)
  if (info) {
    // Cut quotes
    info = info.slice(1, -1)
    info = this.updateImageLocations(info)
    // Replace the quotes, which are present in the image section
    info = info.replace(/\\"/g, '"')
  } else {
    logger.warn(className + ' has no info section.')
  }

  var connections = this.getConnections(model)
  const allModels = pubModels.concat(proModels)

  if (info) { // Only run if info is not undefined. Otherwise, info gets a type 'string'
    info = addLinkToCode(info,
      allModels,
      pubParameters.concat(proParameters),
      pubInputs.concat(proInputs.concat(pubOutputs.concat(proOutputs))))
  }
  // Add connector targets if there are connections
  if (connections) {
    addConnectorTargets(connections, allModels)
  }
  // Group all the parameters by tabs and groups
  const pubParGrouped = groupParameters(pubParameters)
  const proParGrouped = groupParameters(proParameters)

  var data = {
    'modelicaFile': model.modelicaFile,
    'within': within,
    'topClassName': className,
    'comment': getComment(model).replace(/"/g, ''),
    'public': {'parameters': pubParGrouped, 'models': pubModels},
    'protected': {'parameters': proParGrouped, 'models': proModels},
    'inputs': pubInputs,
    'outputs': pubOutputs,
    'info': info,
    'connections': connections}
  data = updateHtml(data)
  cleanse(data)
  return data
}

function cleanse (obj) {
  if (obj) {
    Object.keys(obj).forEach(function (key) {
      // Get this value and its type
      var value = obj[key]
      var type = typeof value
      if (type === 'object') {
        // Recurse...
        cleanse(value)
        // ...and remove if now "empty"
        if (value && !Object.keys(value).length) {
          delete obj[key]
        }
      } else if (type === 'undefined') {
        // Undefined, remove it
        delete obj[key]
      }
    })
  }
}

/** Gets the top-level comment, or else returns 'undefined'
  */
function getComment (model) {
  return getProperty(['class_definition', 0, 'class_specifier', 'long_class_specifier', 'comment'], model)
}
/**
  * Returns true if the type specifier is a model
  */
function isModel (typeSpecifier) {
  const nonModels = ['Modelica.SIunits', 'Buildings.Controls.OBC.CDL.Interfaces.']
  const isNotModel = nonModels.some(function (ele) {
    return (typeSpecifier.indexOf(ele) === 0)
  })
  return (isNotModel === false)
}

/** Get the path to the elements that contain the parameters, class instances etc.
  */
function getElements (model, prefix) {
  var elements
  if (prefix === 'public') {
    elements = model.class_definition[0].class_specifier.long_class_specifier.composition.element_list.element
  } else if (prefix === 'protected') {
    if (model.class_definition[0].class_specifier.long_class_specifier.composition.prefixed_element) {
      elements = model.class_definition[0].class_specifier.long_class_specifier.composition.prefixed_element[0].element
    }
  } else {
    const msg = 'Wrong argument value. Received "' + prefix + '". Check ' + getClassName(model)
    logger.error(msg)
    throw new Error(msg)
  }
  return elements
}

/** Returns 'true' if the className is an elementary type of CDL.
  */
function isElementaryType (className) {
  return ['Real', 'Integer', 'Boolean', 'String'].some(x => x === className)
}

/** Returns 'true' if the className is an elementary block or connector of CDL.
  */
function isElementaryCDL (className) {
  const classes = [
    'OBC.CDL',
    'CDL.Continuous',
    'CDL.Conversions',
    'CDL.Discrete',
    'CDL.Integers',
    'CDL.Interfaces',
    'CDL.Logical',
    'CDL.Psychrometrics',
    'CDL.Routing',
    'CDL.SetPoints',
    'CDL.Types',
    'CDL.Utilities']
  return classes.some(x => className.includes(x))
}
/** Returns a string that has the hyperlink target name for the class `className`.
*/
function getTargetName (className) {
  if (isElementaryCDL(className)) {
    // This is a CDL block
    return getLibraryLink(className)
  } else {
    return '#' + className
  }
}
/** Returns the http address of the documentation of the class 'className'
 */
function getLibraryLink (className) {
  const lastInd = className.lastIndexOf('.')
  return 'http://simulationresearch.lbl.gov/modelica/releases/v5.0.1/help/' +
  className.substring(0, lastInd).replace(/\./g, '_') + '.html#' +
  className
//  Buildings_Controls_OBC_CDL_Integers.html#Buildings.Controls.OBC.CDL.Integers.Abs
}

/** Returns a json array with all blocks (or models), but not
  * the connectors.
  */
function getModels (model, prefix) {
  const elements = getElements(model, prefix)
  const classes = []
  if (elements) {
    // Filter for all classes of className
    const jsonClassNames = elements.filter(function (obj) {
      if (obj.component_clause.type_prefix === 'parameter') {
        return false
      } else {
        return isModel(obj.component_clause.type_specifier)
      }
    })
    const topLevelName = getClassName(model)
    jsonClassNames.forEach(function (obj) {
      const entry = parsecomponentDeclarations(obj.component_clause.component_list.component_declaration)
      entry['within'] = model.within ? model.within[0] : ''
      entry['className'] = obj.component_clause.type_specifier
      entry['html']['anchor'] = topLevelName + '.' + entry['name']
      entry['html']['target'] = getTargetName(entry['className'])
      classes.push(entry)
    })
  }
  return classes
}

/** Remove the trailing array descriptor. For example,
  * argument = abc[1] will return abc
  */
function removeTrailingArray (str) {
  const s = str.trim()
  if (s.endsWith(']')) {
    const idx = s.indexOf('[')
    if (idx === -1) {
      const msg = "Unexpected string '" + str + "'."
      logger.error(msg)
      throw new Error(msg)
    }
    return s.slice(0, idx)
  } else {
    return str
  }
}
/**
  * Returns a json array with all `connect` statements
  * the connectors
  */
function getConnections (model) {
  const className = getClassName(model)
  if (!model.class_definition[0].class_specifier.long_class_specifier.composition.equation_section) {
    // Class has no equation section
    logger.debug(className + ' has no equation section.')
    return undefined
  }
  const connections = []
  model.class_definition[0].class_specifier.long_class_specifier.composition.equation_section[0].equation.forEach(function (obj) {
    // equation also has elements that are not a connect_clause.
    // Here, we process only connect_clause
    if (obj.connect_clause) {
      connections.push(
        [
          {
            'instance': obj.connect_clause.component1[0],
            'connector': obj.connect_clause.component1[1],
            'instanceLinkTarget': className + (obj.connect_clause.component1[0] ? '.' + removeTrailingArray(obj.connect_clause.component1[0]) : '')
          },
          {
            'instance': obj.connect_clause.component2[0],
            'connector': obj.connect_clause.component2[1],
            'instanceLinkTarget': className + (obj.connect_clause.component2[0] ? '.' + removeTrailingArray(obj.connect_clause.component2[0]) : '')
          }
        ]
      )
    }
  })
  return connections
}
/** Return the class name
  */
function getClassName (model) {
  if (model === undefined) throw new Error('Argument to getClassName is undefined.')

  // First, check if there is a 'within xxxx;'
  const within = getProperty(['within', 0], model)
  // Get the model name
  const shortName = getProperty(
    ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'name'], model)
  if (shortName) {
    return (within) ? within + '.' + shortName : shortName
  }

  const msg = 'Received wrong data structure for model ' + JSON.stringify(model, 2, null)
  logger.error(msg)
  throw new Error(msg)
}

/**
 * Returns a json array with all parameters and names
 */
function getParameters (model, prefix) {
  const elements = getElements(model, prefix)

  const pars = []
  if (elements) {
    // Filter for all parameters
    const jsonPars = elements.filter(function (obj) {
      return obj.component_clause.type_prefix === 'parameter'
    })

    // Build the data structure for the parameters
    jsonPars.forEach(function (obj) {
      const entry = parsecomponentDeclarations(obj.component_clause.component_list.component_declaration)
      entry['className'] = obj.component_clause.type_specifier
      pars.push(entry)
    })
  }
  return pars
}

function parseParameterAssignments (classModification) {
  // There can be zero or multiple parameter assignments
  // have no modifications
  if (classModification === undefined) {
    return {}
  }
  var assignments = []
  const mod = classModification.modifications
  // Parse the parameter modifications, e.g., assignment of parameters in class instances
  // logger.debug('*** each is not handled ' + JSON.stringify(mod))
  for (var k = 0; k < mod.length; k++) {
    if (mod[k].prefix) {
      assignments.push({'name': mod[k].name, 'value': mod[k].value, 'isFinal': ((mod[k].prefix).indexOf('final') !== -1)})
    } else {
      assignments.push({'name': mod[k].name, 'value': mod[k].value, 'isFinal': false})
    }
  }
  return assignments
}

/** Return the argument converted to IP units
 */
function convertFromSIUnit (SIUnit) {
  const useIPUnit = true
  if (useIPUnit) {
    switch (SIUnit) {
      case 'K':
        return 'F'
      case 'Pa':
        return 'psi'
      case 'kg/s':
        return 'kg/s'
      case 'm3/s':
        return 'cfm'
      case 'm/s':
        return 'ft/s'
      default:
        return SIUnit
    }
  } else {
    switch (SIUnit) {
      case 'K':
        return 'degC'
      default:
        return SIUnit
    }
  }
}

function setConnectorHTMLDisplayUnit (connector) {
  if (!connector.html.displayUnit) {
    if (connector.html.unit) {
      connector.html.displayUnit = convertFromSIUnit(connector.html.unit)
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
      parameter.html.displayUnit = convertFromSIUnit('K')
      break
    case 'TemperatureDifference':
      parameter.html.unit = 'K'
      parameter.html.displayUnit = convertFromSIUnit('K')
      // Keep as 'K'
      if (parameter.html.displayUnit === 'degC') {
        parameter.html.displayUnit = 'K'
      }
      break
    case 'PressureDifference':
      parameter.html.unit = 'Pa'
      parameter.html.displayUnit = convertFromSIUnit('Pa')
      break
    case 'AbsolutePressure':
      parameter.html.unit = 'Pa'
      parameter.html.displayUnit = convertFromSIUnit('Pa')
      break
    case 'Pressure':
      parameter.html.unit = 'Pa'
      parameter.html.displayUnit = convertFromSIUnit('Pa')
      break
    case 'MassFlowRate':
      parameter.html.unit = 'kg/s'
      parameter.html.displayUnit = convertFromSIUnit('kg/s')
      break
    case 'VolumeFlowRate':
      parameter.html.unit = 'm3/s'
      parameter.html.displayUnit = convertFromSIUnit('m3/s')
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

function getHTMLType (className) {
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
  if (!isType(className) && !className.startsWith('Modelica.SIunits')) {
    return '<a href="' + getTargetName(className) + '">' + className + '</a>'
  }
  return className
}

/** Set the `html.type` attribute of `connector`, and
  * return `connector`
  */
function setConnectorHTMLType (connector) {
  connector.html.type = getHTMLType(connector.className)
  return connector
}

/** Order the connections so that the first element is an input,
    and the second element is an output,
    and then return `data`.
    The argument `data` must be an array with all the data.
  */
function orderConnections (data) {
  // Check if portLinkTarget is an input
  function hasName (element, index, array) {
    // Return true if this element has the same name as the class of the connector
    // Use .trim() to make sure we compare for equal value
    return element.name.trim() === array[index].name.trim()
  }

  data.forEach(function (dataElement, index) {
    if (data[index].connections) {
      // data[index] has connections
      data[index].connections.forEach(function (connectStatement, idx) {
        const connector = data[index].connections[idx][0]
        var foundOutput = false
        // ////////////////////////////////////////////////////////////
        if (connector.connector === undefined) {
          // This is an input or an output of this class, rather than of
          // an instance of this class.
          if (data[index].outputs) {
            // Instance has outputs
            foundOutput = data[index].outputs.some(hasName, connector.class)
          }
        } else {
          // ////////////////////////////////////////////////////////////
          // This is a connector of an instance of this class.
          var allModels = null
          const havePublic = data[index].public && data[index].public.models
          const haveProtected = data[index].protected && data[index].protected.models
          if (havePublic && haveProtected) {
            allModels = data[index].public.models.concat(data[index].protected.models)
          } else if (havePublic) {
            allModels = data[index].public.models
          } else if (haveProtected) {
            allModels = data[index].protected.models
          }
          // Instance that contains this connector
          const instance = allModels.find(item => {
            const connectorClass = removeTrailingArray(connector.instance.trim())
            return item.name.trim() === connectorClass
          })
          // Check if this connector is an output
          if (instance.outputs) {
            foundOutput = instance.outputs.some(item => {
              return item.name.trim() === connector.connector.trim()
            })
          }
        }
        // Swap input and output if we found an output in the 0-th element
        // of the connector
        if (foundOutput) {
          const a = data[index].connections[idx][0]
          data[index].connections[idx][0] = data[index].connections[idx][1]
          data[index].connections[idx][1] = a
        }
      })
    }
  })
  return data
}
/** Get the unit for the type 'className'.
  * If no unit has been specified, then value should be set to 'undefined'
  */
function updateHtml (data) {
  if (data.inputs) {
    data.inputs.forEach(function (obj) {
      obj = setConnectorHTMLDisplayUnit(obj)
      obj = setConnectorHTMLType(obj)
    })
  }
  if (data.outputs) {
    data.outputs.forEach(function (obj) {
      obj = setConnectorHTMLDisplayUnit(obj)
      obj = setConnectorHTMLType(obj)
    })
  }
  if (data.public && data.public.parameters) {
    data.public.parameters.tabs.forEach(tab => {
      tab.groups.forEach(group => {
        group.parameters.forEach(function (obj) {
          obj = setParameterHTMLAttributes(obj)
        })
      })
    })
  }
  if (data.protected && data.protected.parameters) {
    data.protected.parameters.tabs.forEach(tab => {
      tab.groups.forEach(group => {
        group.parameters.forEach(function (obj) {
          obj = setParameterHTMLAttributes(obj)
        })
      })
    })
  }

  return data
}

function parseClassModification (classModification, name) {
  // There can be zero or no match with name, and some
  // have no modifications
  if (classModification === undefined) {
    return {}
  }
  var ret = {}
  const mod = classModification.modifications
  for (var i = 0; i < mod.length; i++) {
    if (mod[i].name === name) {
      // Remove the name, as this will be the key of the new object
      var val = mod[i]
      delete val['name']
      // Add it to the return value
      ret = val
      break
    }
  }
  return ret
}

function parseParameterAnnotation (componentDeclaration) {
  const dialog = getProperty(['comment', 'annotation', 'dialog'], componentDeclaration)
  var entry = {}
  if (dialog) {
    // Build the data structure
    dialog.forEach(obj => { entry[obj.name] = obj.value.replace(/"/g, '') })
  }
  // Set default group to Parameters and default tab to General
  if (!entry.tab) entry.tab = 'General'
  if (!entry.group) entry.group = 'Parameters'
  return {'dialog': entry}
}

function parsecomponentDeclarations (componentDeclarations) {
  const ret = {}

  componentDeclarations.forEach(function (obj) {
    // Get the name, value, comment, unit, min, max, displayUnit
    var comment
    comment = getProperty(['comment', 'string_comment'], obj)
    if (comment) {
      comment = comment.replace(/"/g, '')
    } else {
      logger.warn('Instance "' + obj.declaration.name + '" has no comment.')
    }

    const lis = {
      'name': obj.declaration.name,
      'value': obj.declaration.value,
      'comment': comment, // may be null, but will be removed later if it is null
      'unit': parseClassModification(obj.declaration.class_modification, 'unit'),
      'displayUnit': parseClassModification(obj.declaration.class_modification, 'displayUnit'),
      'quantity': parseClassModification(obj.declaration.class_modification, 'quantity'),
      'min': parseClassModification(obj.declaration.class_modification, 'min'),
      'max': parseClassModification(obj.declaration.class_modification, 'max'),
      'nominal': parseClassModification(obj.declaration.class_modification, 'nominal'),
      'start': parseClassModification(obj.declaration.class_modification, 'start'),
      'modifications': parseParameterAssignments(obj.declaration.class_modification),
      'annotation': parseParameterAnnotation(obj)
    }

    // Add versions that will be written to html
    function removeQuotes (s) {
      if (s) {
        return s.slice(1, -1)
      } else {
        return s
      }
    }

    function addAdjustable (s) {
      if (s === undefined) {
        return s
      } else if (s.prefix !== undefined && s.prefix.match('final')) {
        return s.value + ' (adjustable)'
      } else {
        return s.value
      }
    }

    // Format for html output
    lis['html'] = {
      'value': addAdjustable(lis.value),
      'unit': removeQuotes(lis.unit.value),
      'displayUnit': removeQuotes(lis.displayUnit.value),
      'quantity': removeQuotes(lis.quantity.value),
      'min': addAdjustable(lis.min),
      'max': addAdjustable(lis.max)
    }

    for (var prop in lis) {
      ret[prop] = lis[prop]
    }
  })
  return ret
}

/**
  * Returns a json array with all components that match
  * the regular expression 'className'.
  */
function getComponentsOfClass (model, className, prefix) {
  const elements = getElements(model, prefix)
  const classes = []
  if (elements) {
    // Filter for all classes of className
    const jsonClassNames = elements.filter(function (obj) {
      return obj.component_clause.type_specifier.match(className)
    })
    const topLevelClassName = getClassName(model)

    jsonClassNames.forEach(function (obj) {
      var entry = parsecomponentDeclarations(obj.component_clause.component_list.component_declaration)
      entry['className'] = obj.component_clause.type_specifier
      entry['html']['anchor'] = topLevelClassName + '.' + entry.name
      entry['html']['targetName'] = getTargetName(entry['className'])
      // Set unit and displayUnit, and resolve Modelica.SIunits
      classes.push(entry)
    })
  }
  return classes
}

/**
  * Return the html_body, with the 'src' attribute of all 'img' elements
  * modified such that 'modelica://' is replaced with 'file:///'
  */
function updateImageLocations (htmlBody) {
  return htmlBody.replace(/modelica:\/\//g, '')
}

function addLinkToCode (htmlBody, allModels, allParameters, allInputsOutputs) {
  // Create an array with 'name': html entries.
  // ******************************
  // ******* Add anchor to parameters when parsing it
  var ent = {}
  allModels.forEach(obj => { ent[obj.name] = obj.html })
  allParameters.forEach(obj => { ent[obj.name] = obj.html })
  allInputsOutputs.forEach(obj => { ent[obj.name] = obj.html })
  var $ = cheerio.load('<html><head></head><body>' + htmlBody + '</body></html>')
  $('code').each(function (index) {
    const entry = $(this).text().trim()
    if (ent[entry]) {
      // This is a name of parameter or input or output
      $(this).replaceWith('<code><a href="#' + ent[entry].anchor + '">' + entry + '</a></code>')
    }
    // console.log('Index : ' + index + ':' + $(this).text())
  })
  return $('body').html()
}
/*
  var $ = cheerio.load('<html><head></head><body>' + htmlBody + '</body></html>')
  $('img').each(function (i, elem) {
    var rep = $(this).attr('src').replace('modelica://', '')
    $(this).attr('src', rep)
  })
  return $('body').html()
  */

/*
 * Returns true if the class is a connector
function isConnector (className) {
  var lisCon = [
    'Modelica.Blocks.Interfaces.RealInput',
    'Modelica.Blocks.Interfaces.RealOutput'
  ]
  var pat = lisCon.join('|')
  return className.match(pat)
}
*/
/**
 * Returns true if the class is a type

 * Currently, only Real, Boolean etc return true,
   but not user-defined types
 */
function isType (className) {
  const lisCon = ['Real', 'Integer', 'Boolean', 'String']
  return (lisCon.indexOf(className) >= 0)
}

/** Return 'connectors' with the element `linkTarget` added to all
    ports
*/
function addConnectorTargets (connectors, models) {
  function getPortLinkTarget (obj) {
    const cla = removeTrailingArray(obj.instance)
    function equalsName (model) {
      // console.log('checking ' + model['name'] + ' ' + cla + ' ' + (cla === model['name']))
      return cla === model['name']
    }
    // Get the class name of the instance instanceName
    const i = models.findIndex(equalsName)
    if (i === -1) {
      const msg = 'Did not find model for connector ' + cla
      logger.warn(msg)
      return
      // throw new Error(msg)
    }
    const className = models[i]['className']
    return className
  }

  connectors.forEach(function (connect) {
    // Connectors have two elements (the two arguments of the connect statement)
    connect.forEach(function (obj) {
      // Only add a target to the connectors that connect to a model instance,
      // but not to those that connect to an input, an output,
      // or an elementary CDL block (as for these, no documentation is generated)
      // const instanceName = obj.instance
      if (obj.connector) {
        obj['portLinkTarget'] = getPortLinkTarget(obj) + '.' + obj.connector
      }
    })
  })
}

/** Validates the json structure of a Modelica class
  */
function validateClass (model) {
  var msg = []
  if (model.within && model.within.length !== 1) {
    msg.push('Require exactly zero or one within element, received ' + model.within.length +
    ' . Check ' + getClassName(model))
  }
  if (!(model.class_definition[0].class_prefixes === 'block' ||
      model.class_definition[0].class_prefixes === 'package')) {
    msg.push('Can only parse a block or package, but not a ' +
      model.class_definition[0].class_prefixes +
      '. Check ' + getClassName(model))
  }
  if (model.class_definition.length !== 1) {
    msg.push('Must have exactly one class per Modelica file. Received ' +
        model.class_definition.length + ' classes. Check ' + getClassName(model))
  }
  for (var i = 0; i < msg.length; i++) {
    logger.error(msg[i])
    throw new Error('Error during validation of ' + getClassName(model))
  }
  return msg.length
}

module.exports.getProperty = getProperty
module.exports.orderConnections = orderConnections
module.exports.simplifyModelicaJSON = simplifyModelicaJSON
module.exports.isType = isType
module.exports.isElementaryCDL = isElementaryCDL
module.exports.isElementaryType = isElementaryType
module.exports.getClassName = getClassName
module.exports.getParameters = getParameters
module.exports.getComponentsOfClass = getComponentsOfClass
module.exports.getModels = getModels
module.exports.getConnections = getConnections
module.exports.updateImageLocations = updateImageLocations
module.exports.addConnectorTargets = addConnectorTargets
module.exports.validateClass = validateClass
module.exports.removeTrailingArray = removeTrailingArray
