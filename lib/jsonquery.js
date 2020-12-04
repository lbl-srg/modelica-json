// const fs = require('fs')
var logger = require('winston')
const pa = require('../lib/parser.js')

/** Get the JSON property `p` from the json data `o`
  * If the property does not exist, the function returns null
  */
const getProperty = (p, o) =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o)

/** Get the simplified json (not raw) representation for the model
  */
function simplifyModelicaJSON (model, parseMode) {
  // Validate the json structure
  const className = getClassName(model)
  if (this.validateClass(model) !== 0) {
    const msg = 'Error during validation of ' + className
    logger.error(msg)
    throw new Error(msg)
  }
  const within = model.within ? model.within[0] : ''
  const pubParameters = this.getParameters(model, 'public', parseMode)
  const proParameters = this.getParameters(model, 'protected', parseMode)

  const pubInputs = isElementaryCDL(className)
    ? getComponentsOfClass(model, parseMode, 'Interfaces.*Input', 'public')
    : getComponentsOfClass(model, parseMode, 'CDL.Interfaces.*Input', 'public')
  const proInputs = isElementaryCDL(className)
    ? getComponentsOfClass(model, parseMode, 'Interfaces.*Input', 'protected')
    : getComponentsOfClass(model, parseMode, 'CDL.Interfaces.*Input', 'protected')

  if ((proInputs && proInputs.length !== 0) && !isElementaryCDL(className) && parseMode === 'cdl') {
    const msg2 = 'Received protected input connectors, which is an invalid specification.' +
    ' Check ' + className
    logger.error(msg2)
    throw new Error(msg2)
  }

  const pubOutputs = isElementaryCDL(className)
    ? getComponentsOfClass(model, parseMode, 'Interfaces.*Output', 'public')
    : getComponentsOfClass(model, parseMode, 'CDL.Interfaces.*Output', 'public')
  const proOutputs = isElementaryCDL(className)
    ? getComponentsOfClass(model, parseMode, 'Interfaces.*Output', 'protected')
    : getComponentsOfClass(model, parseMode, 'CDL.Interfaces.*Output', 'protected')

  if ((proOutputs && proOutputs.length !== 0) && parseMode === 'cdl') {
    const msg3 = 'Received protected output connectors, which is an invalid specification.' +
    ' Check ' + className
    logger.error(msg3)
    throw new Error(msg3)
  }
  const pubModels = this.getModels(model, 'public')
  const proModels = this.getModels(model, 'protected')
  const extModels = this.getModels(model, 'extends')

  if (parseMode === 'cdl' && extModels.length !== 0) {
    const msg4 = 'Find extends statement in cdl models, which is not allowed.' +
    ' Check ' + className
    logger.error(msg4)
    throw new Error(msg4)
  }

  var shortClass = model.class_definition[0].class_specifier.short_class_specifier
  // Build a json object with all these data
  var info = (shortClass !== undefined) ? getProperty(
    ['class_definition', 0, 'class_specifier', 'short_class_specifier', 'comment', 'annotation', 'documentation', 'info'],
    model)
    : getProperty(
      ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'composition', 'comp_annotation', 'documentation', 'info'],
      model)

  if (info) {
    // Cut quotes
    info = info.slice(1, -1)
    info = this.updateImageLocations(info)
    // Replace the quotes, which are present in the image section
    info = info.replace(/\\"/g, '"')
  } else {
    logger.warn(className + ' has no info section, or the info section is misplaced.')
    pa.warnCounter = pa.warnCounter + 1
  }

  // Get default component name
  var defaultName = getProperty(
      ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'composition', 'comp_annotation', 'defaultName'],
      model)
  if ((parseMode === 'cdl' || className.includes('Buildings.Controls.OBC.')) &&
       !model.modelicaFile.endsWith('package.mo') &&
       !model.modelicaFile.endsWith('Constants.mo') &&
       !className.includes('.Interfaces.') &&
       !className.includes('.Types.') &&
       !className.includes('.Validation.') &&
       !className.includes('.Examples.')) {
    if (!defaultName) {
      logger.warn(className + ' does not have default component name.')
      pa.warnCounter = pa.warnCounter + 1
    }
  }

  // Get vendor annotation
  var venAnn = getProperty(
    ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'composition', 'comp_annotation', 'vendor_annotation'],
    model
  )
  var vendorAnnotation
  if (venAnn) {
    vendorAnnotation = parseVendorAnnotation(venAnn)
  }

  // Get Graphical parsing
  var icon = shortClass !== undefined ? getProperty(
    ['class_definition', 0, 'class_specifier', 'short_class_specifier', 'comment', 'annotation', 'icon'],
    model)
    : getProperty(
      ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'composition', 'comp_annotation', 'icon'],
      model)

  var diagram = shortClass !== undefined ? getProperty(
    ['class_definition', 0, 'class_specifier', 'short_class_specifier', 'comment', 'annotation', 'diagram'],
    model)
    : getProperty(
      ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'composition', 'comp_annotation', 'diagram'],
      model)

  // Get connections
  var connections = this.getConnections(model)
  const allModels = pubModels.concat(proModels).concat(extModels)
  // Add connector targets if there are connections
  if (connections) {
    addConnectorTargets(connections, allModels, className, parseMode)
  }
  var commentText = getComment(model)
  var data = {
    'modelicaFile': model.modelicaFile,
    'within': within,
    'topClassName': className,
    'comment': commentText === null ? null : commentText.replace(/"/g, ''),
    'defaultName': defaultName,
    'public': {
      'parameters': pubParameters,
      'models': pubModels,
      'inputs': pubInputs,
      'outputs': pubOutputs
    },
    'protected': {
      'parameters': proParameters,
      'models': proModels,
      'inputs': proInputs,
      'outputs': proOutputs
    },
    'extends': extModels,
    'vendorAnnotation': vendorAnnotation,
    'info': info,
    'icon': icon,
    'diagram': diagram,
    'connections': connections }
  cleanse(data)
  return data
}

function cleanse (obj) {
  if (obj) {
    Object.keys(obj).forEach(function (key) {
      // Get this value and its type
      var value = obj[key]
      var type = typeof value
      if (type === null || value === null) {
        delete obj[key]
      } else if (type === 'object') {
        // Recurse...
        cleanse(value)
        // ...and remove if now "empty"
        if (value && !Object.keys(value).length) {
          delete obj[key]
        }
      } else if (type === 'undefined' || type === 'null') {
        // Undefined, remove it
        delete obj[key]
      }
    })
  }
}

/** Gets the top-level comment, or else returns 'undefined'
  */
function getComment (model) {
  var commentText
  if (model.class_definition[0].class_specifier.short_class_specifier) {
    commentText = getProperty(['class_definition', 0, 'class_specifier', 'short_class_specifier', 'comment', 'string_comment'], model)
  } else {
    commentText = getProperty(['class_definition', 0, 'class_specifier', 'long_class_specifier', 'comment'], model)
  }
  if (commentText === null) {
    logger.warn(getClassName(model) + ' has no class comment.')
  }
  return commentText
}

/** Returns true if the type specifier is a model
  */
function isModel (typeSpecifier) {
  const nonModels = ['Modelica.SIunits', 'Buildings.Controls.OBC.CDL.Interfaces.', 'Interfaces.', 'CDL.Interfaces.']
  const isNotModel = nonModels.some(function (ele) {
    return (typeSpecifier.indexOf(ele) === 0)
  })
  return (isNotModel === false)
}

/** Get the path to the elements that contain the parameters, class instances etc.
  * For model with short class, the element should be the one specified by
  * short_class_specifier
  */
function getElements (model, prefix) {
  var elements
  // In case of short_class_specifier
  if (model.class_definition[0].class_specifier.short_class_specifier) {
    elements = model.class_definition[0].class_specifier.short_class_specifier
  } else {
    if (prefix === 'public') {
      if (!model.class_definition[0].class_specifier.long_class_specifier.composition.element_list.element) {
        logger.debug(model.class_definition[0].class_specifier.long_class_specifier.name + ' has no equation section.')
        return undefined
      } else {
        elements = model.class_definition[0].class_specifier.long_class_specifier.composition.element_list.element.filter(function (obj) {
          if (obj.extends_clause) { return false } else { return true }
        })
      }
    } else if (prefix === 'protected') {
      if (model.class_definition[0].class_specifier.long_class_specifier.composition.prefixed_element) {
        elements = model.class_definition[0].class_specifier.long_class_specifier.composition.prefixed_element[0].element
      }
    } else if (prefix === 'extends') {
      if (!model.class_definition[0].class_specifier.long_class_specifier.composition.element_list.element) {
        logger.debug(model.class_definition[0].class_specifier.long_class_specifier.name + ' has no equation section.')
        return undefined
      } else {
        elements = model.class_definition[0].class_specifier.long_class_specifier.composition.element_list.element.filter(function (obj) {
          if (obj.extends_clause) { return true } else { return false }
        })
      }
    } else {
      const msg = 'Wrong argument value. Received "' + prefix + '". Check ' + getClassName(model)
      logger.error(msg)
      throw new Error(msg)
    }
  }
  return elements
}

/** Returns 'true' if the className is an elementary type of CDL.
  */
function isElementaryType (className) {
  return ['Real', 'Integer', 'Boolean', 'String'].some(x => x === className) ||
         className.includes('Modelica.')
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

/** Returns a json array with all blocks (or models), but not
  * the connectors.
  */
function getModels (model, prefix) {
  const elements = getElements(model, prefix)
  const classes = []
  const currentClass = getClassName(model)
  if (elements) {
    // in case of short class
    if (model.class_definition[0].class_specifier.short_class_specifier) {
      if (prefix === 'public') {
        const declaration = parseComponentDeclaration(elements, currentClass)
        const shortEntry = Object.assign(
          { 'className': elements.className },
          { 'basePrefix': elements.base_prefix },
          { 'name': elements.inputName },
          { 'arraySubscripts': elements.array_subscripts },
          declaration
        )
        classes.push(shortEntry)
      }
    } else {
      // Filter for all classes of className
      const jsonClassNames = elements.filter(function (obj) {
        if (prefix === 'extends') {
          return isModel(obj.extends_clause.name)
        } else {
          if (obj.component_clause) {
            if (obj.component_clause.type_prefix === 'parameter') {
              return false
            } else {
              return isModel(obj.component_clause.type_specifier)
            }
          } else {
            return false
          }
        }
      })

      jsonClassNames.forEach(function (obj) {
        const declarations = (prefix === 'extends')
          ? parseExtendsClause(obj)
          : parseComponentDeclaration(obj.component_clause.component_list.component_declaration[0], currentClass)
        const condition = (prefix === 'extends')
          ? null
          : parseComponentCondition(obj.component_clause.component_list.component_declaration[0])
        const annotation = (prefix === 'extends')
          ? null
          : parseComponentAnnotation(obj.component_clause.component_list.component_declaration[0], currentClass)
        const entry = Object.assign(
          { 'className': (prefix === 'extends') ? obj.extends_clause.name
            : obj.component_clause.type_specifier }, declarations, condition, annotation)
        classes.push(entry)
      })
    }
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
  // if short class specification
  if (model.class_definition[0].class_specifier.short_class_specifier) {
    logger.debug('short class ' + model.class_definition[0].class_specifier.short_class_specifier.className +
                 ' has no equation section')
    return undefined
  } else {
    var equationSection = model.class_definition[0].class_specifier.long_class_specifier.composition.equation_section
    if (!equationSection) {
      // Class has no equation section
      logger.debug(className + ' has no equation section.')
      return undefined
    }
    var equations = equationSection.filter(function (obj) {
      return (obj.prefix === 'equation')
    })
    if (!equations || !equations.length || !equations[0].equation || !equations[0].equation.length) {
      // Class has empty equation section
      logger.warn(className + ' has empty equation section.')
      pa.warnCounter = pa.warnCounter + 1
      return undefined
    }
    const connections = []
    equations[0].equation.forEach(function (obj) {
      if (obj.comment && obj.comment.annotation && (obj.comment.annotation.diagram || obj.comment.annotation.icon || obj.comment.annotation.documentation)) {
        logger.warn(className + ' does not end the equation section properly with ";". The info section should not be in the equation section.')
        pa.warnCounter = pa.warnCounter + 1
      }
      // equation also has elements that are not a connect_clause.
      // Here, we process only connect_clause
      if (obj.connect_clause) {
        const connect = [
          {
            'instance': obj.connect_clause.component1[0],
            'connector': obj.connect_clause.component1[1]
          },
          {
            'instance': obj.connect_clause.component2[0],
            'connector': obj.connect_clause.component2[1]
          }]
        if (obj.comment && obj.comment.annotation.line) {
          connect.push(
            {
              'points': obj.comment.annotation.line.points,
              'color': obj.comment.annotation.line.color,
              'pattern': obj.comment.annotation.line.pattern,
              'thickness': obj.comment.annotation.line.thickness
            }
          )
        }
        connections.push(connect)
      }
    })
    return connections
  }
}

/** Return the class name
  */
function getClassName (model) {
  if (model === undefined) throw new Error('Argument to getClassName is undefined.')

  // First, check if there is a 'within xxxx;'
  const within = getProperty(['within', 0], model)
  // Get the model name
  var longClass = getProperty(
    ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'name'], model)
  var shortClass = getProperty(
    ['class_definition', 0, 'class_specifier', 'short_class_specifier', 'className'], model)
  var name = longClass !== null ? longClass : shortClass
  if (name) {
    return (within) ? within + '.' + name : name
  }

  const msg = 'Received wrong data structure for model ' + JSON.stringify(model, 2, null)
  logger.error(msg)
  throw new Error(msg)
}

/**
 * Returns a json array with all parameters and names
 */
function getParameters (model, prefix, parseMode) {
  const elements = getElements(model, prefix)
  const pars = []
  const currentClass = getClassName(model)
  if (elements) {
    if (model.class_definition[0].class_specifier.short_class_specifier) {
      return null
    } else {
      // Filter for all parameters
      const jsonPars = elements.filter(function (obj) {
        // const out = JSON.stringify(obj, null, 2)
        if (obj.extends_clause) {
          return false
        } else {
          return obj.component_clause &&
                 obj.component_clause.type_prefix === 'parameter'
        }
      })

      // Build the data structure for the parameters
      jsonPars.forEach(function (obj) {
        const declarations = parseComponentDeclaration(obj.component_clause.component_list.component_declaration[0], currentClass)
        const annotation = parseParameterAnnotation(obj.component_clause.component_list.component_declaration[0], currentClass)
        const className = obj.component_clause.type_specifier
        if ((parseMode === 'cdl' || currentClass.includes('Buildings.Controls.OBC.')) &&
            !currentClass.includes('.OBC.CDL.') &&
            className !== undefined && className.includes('Modelica.SIunits')) {
          logger.warn('In class ' + currentClass + ', parameter ' + declarations.name + ' is specified by Modelica.SIunits.')
          pa.warnCounter = pa.warnCounter + 1
        }
        const types = getParameterTypes(className)
        if (declarations.unit === undefined) {
          declarations.unit.value = types.unit
        }
        if (declarations.quantity === undefined) {
          declarations.quantity.value = types.quantity
        }
        if (declarations.displayUnit === undefined) {
          declarations.displayUnit.value = types.displayUnit
        }
        const entry = Object.assign(
          { 'className': className },
          { 'type': types.type === className ? null : types.type },
          declarations,
          { 'annotation': annotation })
        pars.push(entry)
      })
    }
    return pars
  }
}

/**
 * Return parameter atributes based on the class name
 */
function getParameterTypes (className) {
  const shortClassName = className.replace('Modelica.SIunits.', '')
  var ret
  // parameter.html.type = shortClassName
  switch (shortClassName) {
    case 'Frequency':
      ret = {
        'type': 'Real',
        'quantity': '"Frequency"',
        'unit': '"Hz"',
        'displayUnit': '"' + convertFromSIUnit('Hz') + '"'
      }
      break
    case 'Angle':
      ret = {
        'type': 'Real',
        'quantity': '"Angle"',
        'unit': '"rad"',
        'displayUnit': '"' + convertFromSIUnit('deg') + '"'
      }
      break
    case 'Temperature':
      ret = {
        'type': 'Real',
        'quantity': '"Temperature"',
        'unit': '"K"',
        'displayUnit': '"' + convertFromSIUnit('K') + '"'
      }
      break
    case 'TemperatureDifference':
      ret = {
        'type': 'Real',
        'quantity': '"TemperatureDifference"',
        'unit': '"K"',
        'displayUnit': '"' + convertFromSIUnit('K') + '"'
      }
      break
    case 'PressureDifference':
      ret = {
        'type': 'Real',
        'quantity': '"PressureDifference"',
        'unit': '"Pa"',
        'displayUnit': '"' + convertFromSIUnit('Pa') + '"'
      }
      break
    case 'AbsolutePressure':
      ret = {
        'type': 'Real',
        'quantity': '"AbsolutePressure"',
        'unit': '"Pa"',
        'displayUnit': '"' + convertFromSIUnit('Pa') + '"'
      }
      break
    case 'Pressure':
      ret = {
        'type': 'Real',
        'quantity': '"Pressure"',
        'unit': '"Pa"',
        'displayUnit': '"' + convertFromSIUnit('Pa') + '"'
      }
      break
    case 'MassFlowRate':
      ret = {
        'type': 'Real',
        'quantity': '"MassFlowRate"',
        'unit': '"kg/s"',
        'displayUnit': '"' + convertFromSIUnit('kg/s') + '"'
      }
      break
    case 'VolumeFlowRate':
      ret = {
        'type': 'Real',
        'quantity': '"VolumeFlowRate"',
        'unit': '"m3/s"',
        'displayUnit': '"' + convertFromSIUnit('m3/s') + '"'
      }
      break
    case 'Time':
      ret = {
        'type': 'Real',
        'quantity': '"Time"',
        'unit': '"s"',
        'displayUnit': '"s"'
      }
      break
    case 'Area':
      ret = {
        'type': 'Real',
        'quantity': '"Area"',
        'unit': '"m2"',
        'displayUnit': '"' + convertFromSIUnit('m2') + '"'
      }
      break
    case 'SpecificEnergy':
      ret = {
        'type': 'Real',
        'quantity': '"SpecificEnergy"',
        'unit': '"J/kg"',
        'displayUnit': '"' + convertFromSIUnit('J/kg') + '"'
      }
      break
    default:
      // It was none of the above. Hence, it probably is a CDL type,
      // such as Buildings.Controls.OBC.CDL.Types.SimpleController
      ret = {
        'type': className,
        'unit': '"1"',
        'displayUnit': '"1"'
      }
  }
  return ret
}

/**
 * Return 'true' if the variable name is the attribute name
 *
 * @param varNam Variable name
 */
function isAttributeName (varNam) {
  const attributes = [
    'quantity', 'start', 'fixed', 'min', 'max', 'unit', 'displayUnit', 'nominal', 'stateSelect']
  return attributes.some(x => varNam === x)
}

function parseParameterAssignments (classModification) {
  // There can be zero or multiple parameter assignments
  // have no modifications
  if (classModification === undefined) {
    return {}
  }
  var assignments = []
  const mod = classModification.modifications
  // Find the parameter assignment rather than attribute specification
  const parAssMod = mod.filter(function (obj) {
    return !isAttributeName(obj.name)
  })
  // Parse the parameter modifications, e.g., assignment of parameters in class instances
  // logger.debug('*** each is not handled ' + JSON.stringify(mod))
  if (parAssMod) {
    for (var k = 0; k < parAssMod.length; k++) {
      if (parAssMod[k].prefix) {
        assignments.push({ 'name': parAssMod[k].name, 'value': parAssMod[k].value, 'isFinal': ((parAssMod[k].prefix).indexOf('final') !== -1) })
      } else {
        assignments.push({ 'name': parAssMod[k].name, 'value': parAssMod[k].value, 'isFinal': false })
      }
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
      case 'm2':
        return 'ft2'
      case 'J/kg':
        return 'Btu/lb'
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
          const haveExtends = data[index].extends
          if (havePublic && haveProtected && haveExtends) {
            allModels = data[index].public.models.concat(data[index].protected.models)
              .concat(data[index].extends)
          } else if (havePublic && haveProtected && !haveExtends) {
            allModels = data[index].public.models.concat(data[index].protected.models)
          } else if (havePublic && haveExtends && !haveProtected) {
            allModels = data[index].public.models.concat(data[index].extends)
          } else if (haveProtected && haveExtends && !havePublic) {
            allModels = data[index].protected.models.concat(data[index].extends)
          } else if (havePublic && !haveProtected && !haveExtends) {
            allModels = data[index].public.models
          } else if (haveProtected && !havePublic && !haveExtends) {
            allModels = data[index].protected.models
          } else if (haveExtends && !havePublic && !haveProtected) {
            allModels = data[index].extends
          }
          // Instance that contains this connector
          const instance = allModels.find(item => {
            const connectorClass = removeTrailingArray(connector.instance.trim())
            var itemName = item.name
            if (itemName === undefined) {
              // logger.warn('extends class ' + item.className)
              return false
            } else {
              return itemName.trim() === connectorClass
            }
          })
          // Check if this connector is an output
          if (instance && instance.outputs) {
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
      var val = JSON.parse(JSON.stringify(mod[i]))
      delete val['name']
      // Add it to the return value
      ret = val
      break
    }
  }
  return ret
}

function parseParameterAnnotation (componentDeclaration, className) {
  if (getProperty(['comment', 'annotation', 'documentation'], componentDeclaration)) {
    logger.warn(className + ' places info section in parameter annotation.')
    pa.warnCounter = pa.warnCounter + 1
  }
  const dialog = getProperty(['comment', 'annotation', 'dialog'], componentDeclaration)
  const venPair = getProperty(['comment', 'annotation', 'vendor_annotation'], componentDeclaration)
  var entry = {}
  if (dialog) {
    // Build the data structure
    dialog.forEach(obj => { entry[obj.name] = obj.value.replace(/"/g, '') })
  }
  // Set default group to Parameters and default tab to General
  if (!entry.tab) entry.tab = 'General'
  if (!entry.group) entry.group = 'Parameters'

  var vendorAnnotation
  if (venPair) {
    vendorAnnotation = parseVendorAnnotation(venPair)
  }
  return Object.assign({ 'dialog': entry },
    vendorAnnotation)
}

function parseComponentAnnotation (componentAnnotation, className) {
  if (getProperty(['comment', 'annotation', 'documentation'], componentAnnotation)) {
    logger.warn(className + ' places info sections in component annotation.')
    pa.warnCounter = pa.warnCounter + 1
  }
  const vendorAnnotation = getProperty(['comment', 'annotation', 'vendor_annotation'], componentAnnotation)
  const placement = getProperty(['comment', 'annotation', 'placement'], componentAnnotation)
  const line = getProperty(['comment', 'annotation', 'line'], componentAnnotation)
  const text = getProperty(['comment', 'annotation', 'text'], componentAnnotation)
  return Object.assign(
    vendorAnnotation ? parseVendorAnnotation(vendorAnnotation) : {},
    { 'placement': placement },
    { 'line': line },
    { 'text': text }
  )
}

function parseComponentCondition (componentDeclaration) {
  // Get the condition attribute for enabling-disabling instance
  const enableCondition = (componentDeclaration.condition_attribute)
                          ? (componentDeclaration.condition_attribute).replace('if ', '')
                          : null
  return Object.assign({'enable': enableCondition})
}

function parseVendorAnnotation (vendorAnnotation) {
  var vendorEntry = {}
  const vendorName = vendorAnnotation.name
  vendorAnnotation.annotation.forEach(obj => {
    if (obj.name === 'haystack') {
      vendorEntry[obj.name] = haystackAnnotation(obj)
    } else if ((obj.name === 'brick')) {
      vendorEntry[obj.name] = obj.value.slice(1, -1)
    } else {
      vendorEntry[obj.name] = obj.value
    }
  })
  return { [vendorName]: vendorEntry }
}

function haystackAnnotation (obj) {
  var value = obj.value.slice(2, -2).trim().split(',\n')
  var haystackEntry = {}
  value.forEach(ele => {
    var temp = ele.split(':')
    if (!isNaN(temp[1].trim())) {
      haystackEntry[temp[0].trim().slice(2, -2)] = temp[1].trim()
    } else {
      haystackEntry[temp[0].trim().slice(2, -2)] = temp[1].trim().slice(2, -2)
    }
  })
  return haystackEntry
}

function parseComponentDeclaration (declaration, currentClass) {
  // Get the name, value, comment, unit, min, max, displayUnit
  var comment = getProperty(['comment', 'string_comment'], declaration)
  if (comment) {
    comment = comment.replace(/"/g, '')
  } else {
    logger.warn('Instance "' + declaration.declaration.name + '" has no comment. Check ' + currentClass)
    pa.warnCounter = pa.warnCounter + 1
  }
  var ret = (declaration.className)
    ? {
      'comment': comment,
      'modification': parseParameterAssignments(declaration.class_modification)
    }
    : {
      'name': declaration.declaration.name,
      'value': declaration.declaration.value,
      'comment': comment, // may be null, but will be removed later if it is null
      'unit': parseClassModification(declaration.declaration.class_modification, 'unit'),
      'displayUnit': parseClassModification(declaration.declaration.class_modification, 'displayUnit'),
      'quantity': parseClassModification(declaration.declaration.class_modification, 'quantity'),
      'min': parseClassModification(declaration.declaration.class_modification, 'min'),
      'max': parseClassModification(declaration.declaration.class_modification, 'max'),
      'nominal': parseClassModification(declaration.declaration.class_modification, 'nominal'),
      'start': parseClassModification(declaration.declaration.class_modification, 'start'),
      'variable_modification': parseVariableModification(declaration.declaration.class_modification),
      'modifications': parseParameterAssignments(declaration.declaration.class_modification)
    }
  // if (comment !== null) ret.comment = comment

  return ret
}

function parseVariableModification (classModification) {
  // There can be zero or no match with name, and some
  // have no modifications
  if (classModification === undefined) {
    return {}
  }
  var ret = []
  const mod = classModification.modifications
  for (var i = 0; i < mod.length; i++) {
    var varMod = mod[i].variable_modification
    if (varMod) {
      ret.push({'name': mod[i].name, 'modifications': varMod.modification.modifications})
      // remove the variable modifcation from the modification list
      delete mod[i]
    }
  }
  return ret
}

function parseExtendsClause (obj) {
  var ret = {
    'className': obj.extends_clause.name,
    'modifications': parseExtendsAssignments(obj.extends_clause.class_modification)
  }
  return ret
}

function parseExtendsAssignments (classModification) {
  if (classModification === undefined) {
    return null
  }
  var assignments = classModification.modifications.map(ele => {
    var temp
    if (ele.prefix) {
      if (ele.prefix === 'final') {
        temp = {
          'name': ele.name,
          'value': ele.value,
          'isFinal': (ele.prefix).indexOf('final') !== -1
        }
      } else if (ele.prefix.includes('redeclare')) {
        temp = {
          'prefix': ele.prefix,
          'className': ele.className,
          'name': ele.name,
          'modifications': parseParameterAssignments(ele.modification),
          'isFinal': (ele.prefix).indexOf('final') !== -1
        }
      }
    } else {
      temp = {
        'name': ele.name,
        'value': ele.value,
        'isFinal': false
      }
    }
    return temp
  })
  return assignments
}

/**
  * Returns a json array with all components that match
  * the regular expression 'className'.
  */
function getComponentsOfClass (model, parseMode, className, prefix) {
  const elements = getElements(model, prefix)
  const currentClass = getClassName(model)
  const classes = []
  if (elements) {
    if (model.class_definition[0].class_specifier.short_class_specifier) {
      return null
    } else {
      // Filter for all classes of className
      const jsonClassNames = elements.filter(function (obj) {
        if (obj.extends_clause) {
          return false
        } else {
          return obj.component_clause &&
                 obj.component_clause.type_specifier.match(className)
        }
      })

      jsonClassNames.forEach(function (obj) {
        const declarations = parseComponentDeclaration(obj.component_clause.component_list.component_declaration[0], currentClass)
        const condition = parseComponentCondition(obj.component_clause.component_list.component_declaration[0])
        const annotation = parseComponentAnnotation(obj.component_clause.component_list.component_declaration[0], currentClass)
        const cdlDefaultValues = setCDLdefaultValue(parseMode, condition, annotation, obj.component_clause.type_specifier, declarations, currentClass)
        const entry = Object.assign(
          { 'className': obj.component_clause.type_specifier }, declarations, condition, cdlDefaultValues, annotation)
        classes.push(entry)
      })
    }
    return classes
  }
}

/**
 * In CDL mode, assign default value to removable connector
 *
 * @param parseMode Parsing mode
 * @param condition Removable condition
 * @param annotation Annotation of the connector
 * @param type Connector type
 * @param declarations Connector declarations
 * @param currentClass Current class name
 */
function setCDLdefaultValue (parseMode, condition, annotation, type, declarations, currentClass) {
  // If it is not in CDL mode, or it is not removable input connector, or there is vendor annotation to specify the default value,
  // then do not need to specify the default value in this process
  if (parseMode !== 'cdl' || !condition.enable || (annotation.__cdl && annotation.__cdl.default) || type.includes('Output')) {
    return Object.assign({'__cdl': null})
  }
  // Removable Real input
  if (type.includes('RealInput')) {
    const unit = declarations.unit
    const quantity = declarations.quantity
    if (!unit && !quantity) {
      logger.warn('Connector "' + declarations.name + '" does not specify the quantity or unit. Check ' + currentClass)
      pa.warnCounter = pa.warnCounter + 1
      return Object.assign({'__cdl': null})
    }
    if (unit.value === '"K"' || quantity.value === '"ThermodynamicTemperature"') {
      return Object.assign({'__cdl': {'default': '293.15'}})
    } else if (quantity.value === '"Pressure"') {
      return Object.assign({'__cdl': {'default': '101325'}})
    } else if (quantity.value === '"PressureDifference"') {
      return Object.assign({'__cdl': {'default': '0'}})
    } else {
      return Object.assign({'__cdl': {'default': '0'}})
    }
  }
  // Removable Boolean input
  if (type.includes('BooleanInput')) {
    return Object.assign({'__cdl': {'default': 'false'}})
  }
  // Removable Inter input
  if (type.includes('IntegerInput')) {
    return Object.assign({'__cdl': {'default': '0'}})
  }
  // Removable DayType input
  if (type.includes('DayTypeInput')) {
    return Object.assign({'__cdl': {'default': 'WorkingDay'}})
  }
}

/**
  * Return the html_body, with the 'src' attribute of all 'img' elements
  * modified such that 'modelica://' is replaced with 'file:///'
  */
function updateImageLocations (htmlBody) {
  return htmlBody.replace(/modelica:\/\//g, '')
}

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
function addConnectorTargets (connectors, models, currentClass, parseMode) {
  function getPortLinkTarget (obj, currentClass) {
    const cla = removeTrailingArray(obj.instance)
    function equalsName (model) {
      return cla === model['name']
    }
    // Get the class name of the instance instanceName
    const i = models.findIndex(equalsName)
    if (i === -1) {
      // const msg = 'Did not find instance for connector ' + cla + ' in ' + currentClass + ', may find it in the base class.'
      // logger.warn(msg)
      // pa.warnCounter = pa.warnCounter + 1
      // return extModels[0].className
      return 'base_class'
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
        const porLinTar = getPortLinkTarget(obj, currentClass)
        if (porLinTar === 'base_class') {
          obj['portLinkTarget'] = porLinTar
        } else {
          if (!isElementaryCDL(porLinTar)) {
            obj['portLinkTarget'] = porLinTar + '.' + obj.connector
          }
        }
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
  if (model.within && model.within.includes('Buildings.Controls.OBC')) {
    if (!(model.class_definition[0].class_prefixes === 'block' ||
        model.class_definition[0].class_prefixes === 'package')) {
      msg.push('Can only parse a block or package, but not a ' +
          model.class_definition[0].class_prefixes +
          '. Check ' + getClassName(model))
    }
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
module.exports.getModels = getModels
module.exports.getConnections = getConnections
module.exports.updateImageLocations = updateImageLocations
module.exports.addConnectorTargets = addConnectorTargets
module.exports.validateClass = validateClass
module.exports.removeTrailingArray = removeTrailingArray
module.exports.convertFromSIUnit = convertFromSIUnit
