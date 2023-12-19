const rdflib = require('rdflib')

// TODO: change structure to put all instances in "defined_instances" keyword

/*
{
    "instances": {
      "instance_a": {
        "type": "element",
        "type_specifier": "...",
        "type_prefix": "...",
        "annotation": {},
        "class_modification": {},
        "long_class_specifier_identifier": "..."
      },
      ...
    },
    "requiredReferences": {
        "extends_clause": [
            {
                "name": ...,
                "long_class_specifier_identifier": ..
                "class_modification": {},
                "annotation": {}
            }
        ],
        "import_clause": [
            {
                ...
            }
        ],
        "connections": {
          "instance_a": ["instance_b", "instance_c", ...],
          "instance_b": [...]
        }
    }
}

*/
function updateRequiredReferences (requiredReferences, newRequiredReferences) {
  if (newRequiredReferences !== null && newRequiredReferences !== undefined) {
    if ('extends_clause' in newRequiredReferences) {
      if ('extends_clause' in requiredReferences) {
        requiredReferences.extends_clause = requiredReferences.extends_clause.concat(newRequiredReferences.extends_clause)
      } else {
        requiredReferences.extends_clause = newRequiredReferences.extends_clause.concat([])
      }
    }
    if ('import_clause' in newRequiredReferences) {
      if ('import_clause' in requiredReferences) {
        requiredReferences.import_clause = requiredReferences.import_clause.concat(newRequiredReferences.import_clause)
      } else {
        requiredReferences.import_clause = newRequiredReferences.import_clause.concat([])
      }
    }
    if ('connections' in newRequiredReferences) {
      if ('connections' in requiredReferences) {
        requiredReferences.connections = updateConnections(requiredReferences.connections, newRequiredReferences.connections)
      } else {
        requiredReferences.connections = Object.assign({}, newRequiredReferences.connections)
      }
    }
  }
  return requiredReferences
}

function updateConnections (connections, newConnections) {
  if (newConnections !== null && newConnections !== undefined) {
    for (const element in newConnections) {
      if (!(element in connections)) {
        connections[element] = newConnections[element].concat([])
      } else {
        newConnections[element].forEach(connectedElement => {
          if (!(connectedElement in connections[element])) {
            connections[element] = connections[element].concat([connectedElement])
          }
        })
      }
    }
  }
  return connections
}

function extractAllObjects (jsonOutput, within = null) {
  let instances = {}
  let requiredReferences = {}
  if (within === null) {
    if (jsonOutput.within === null || jsonOutput.within === undefined) {
      within = null
    } else {
      within = jsonOutput.within
    }
  }
  const fullMoFilePath = jsonOutput.fullMoFilePath

  const classDefinitions = jsonOutput.class_definition
  for (let i = 0; i < classDefinitions.length; i++) {
    let longClassSpecifier = null
    let shortClassSpecifier = null
    let derClassSpecifier = null
    let identifier = null

    const classDefinition = classDefinitions[i]
    const classSpecifier = classDefinition.class_specifier
    if ('long_class_specifier' in classSpecifier) {
      longClassSpecifier = classSpecifier.long_class_specifier
      const newAllObjects = extractFromLongClassSpecifier(longClassSpecifier, fullMoFilePath, within)
      instances = Object.assign({}, instances, newAllObjects.instances)
      requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
    }
    if ('short_class_specifier' in classSpecifier) {
      shortClassSpecifier = classSpecifier.short_class_specifier
      identifier = shortClassSpecifier.identifier
      const shortClassSpeciiferValue = shortClassSpecifier.value
      let name = null

      if ('name' in shortClassSpeciiferValue && shortClassSpeciiferValue.name !== undefined) {
        name = shortClassSpeciiferValue.name
        instances[identifier] = {
          type: 'short_class_specifier',
          type_specifier: name,
          short_class_specifier_value: shortClassSpeciiferValue,
          within,
          fullMoFilePath
        }
      } else if ('enum_list' in shortClassSpeciiferValue && shortClassSpeciiferValue.enum_list !== undefined) {
        const enumList = shortClassSpeciiferValue.enum_list

        for (let j = 0; j < enumList.length; j++) {
          const enumListIdentifier = enumList[j].identifier
          instances[enumListIdentifier] = {
            type: 'enumeration',
            enumeration_literal: enumList[j],
            within,
            fullMoFilePath
          }
        }
      }
    }
    if ('der_class_specifier' in classSpecifier && classSpecifier.der_class_specifier !== undefined) {
      derClassSpecifier = classSpecifier.der_class_specifier
      identifier = derClassSpecifier.identifier
      const derClassSpeciiferValue = derClassSpecifier.value
      instances[identifier] = {
        type: 'der_class_specifier',
        value: derClassSpeciiferValue,
        within,
        fullMoFilePath
      }
    }
  }
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractFromLongClassSpecifier (longClassSpecifier, fullMoFilePath, within = null) {
  let instances = {}
  let requiredReferences = {}
  let identifier = null
  let composition = null
  let compositionInstances = {}
  let compositionRequiredReferences = {}
  const dictIdentifier = {}
  dictIdentifier.within = within
  dictIdentifier.fullMoFilePath = fullMoFilePath

  if ('identifier' in longClassSpecifier) {
    identifier = longClassSpecifier.identifier
    dictIdentifier.type = 'long_class_specifier'
  }

  if (longClassSpecifier.extends !== null && longClassSpecifier.extends !== undefined) {
    dictIdentifier.extends = true
    if ('class_modification' in longClassSpecifier && longClassSpecifier.class_modification !== undefined) {
      // classModification = longClassSpecifier.classModification
      // TODO: handle later
    }
  }
  if ('composition' in longClassSpecifier && longClassSpecifier.composition !== undefined) {
    composition = longClassSpecifier.composition
    const newAllObjects = extractFromComposition(composition, identifier, fullMoFilePath, within)
    compositionInstances = Object.assign({}, compositionInstances, newAllObjects.instances)
    compositionRequiredReferences = updateRequiredReferences(compositionRequiredReferences, newAllObjects.requiredReferences)

    if ('annotation' in composition && composition.annotation !== undefined) {
      dictIdentifier.annotation = composition.annotation
      dictIdentifier.semantics = extractSemanticsFromAnnotations(composition.annotation, identifier)
      dictIdentifier.cdl_annotations = extractCdlAnnotations(composition.annotation)
    }
  }
  if (identifier !== null) {
    instances[identifier] = dictIdentifier
  }
  if (compositionInstances.length !== 0) {
    instances = Object.assign({}, instances, compositionInstances)
  }
  requiredReferences = updateRequiredReferences(requiredReferences, compositionRequiredReferences)
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractFromComposition (composition, longClassSpecifierIdentifier, fullMoFilePath, within) {
  let elementSections = null
  let instances = {}
  let requiredReferences = {}
  let newAllObjects = null

  if (composition === null || composition === undefined) {
    return { instances: {}, requiredReferences: {} }
  }

  if ('element_list' in composition && composition.element_list !== undefined) {
    const elementList = composition.element_list
    // TODO: check with jianjun
    newAllObjects = extractFromElementList(elementList, longClassSpecifierIdentifier, fullMoFilePath, within, 'public')
    instances = Object.assign({}, instances, newAllObjects.instances)
    requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
  }

  if ('element_sections' in composition && composition.element_sections !== undefined) {
    elementSections = composition.element_sections
    for (let i = 0; i < elementSections.length; i++) {
      const elementSection = elementSections[i]
      if ('public_element_list' in elementSection && elementSection.public_element_list !== undefined) {
        const publicElementList = elementSection.public_element_list
        newAllObjects = extractFromElementList(publicElementList, longClassSpecifierIdentifier, fullMoFilePath, within, 'public')
        instances = Object.assign({}, instances, newAllObjects.instances)
        requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
      }
      if ('protected_element_list' in elementSection && elementSection.protected_element_list !== undefined) {
        const protectedElementList = elementSection.protected_element_list
        newAllObjects = extractFromElementList(protectedElementList, longClassSpecifierIdentifier, fullMoFilePath, within, 'protected')
        instances = Object.assign({}, instances, newAllObjects.instances)
        requiredReferences = updateRequiredReferences(requiredReferences, newAllObjects.requiredReferences)
      }
      if ('equation_section' in elementSection && elementSection.equation_section !== undefined) {
        const equationSection = elementSection.equation_section
        const newConnections = extractConnectionsFromEquationSection(equationSection)
        const newRequiredReferences = { connections: newConnections }
        requiredReferences = updateRequiredReferences(requiredReferences, newRequiredReferences)
      }
    }
  }

  if ('external_composition' in composition && composition.external_composition !== undefined) {
    // TODO:
  }
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractFromElementList (elementList, longClassSpecifierIdentifier, fullMoFilePath, within, compositionSpecifier) {
  let instances = {}
  let requiredReferences = {}

  for (let i = 0; i < elementList.length; i++) {
    const element = elementList[i]

    if ('extends_clause' in element && element.extends_clause !== undefined) {
      const extendsClause = element.extends_clause
      if (longClassSpecifierIdentifier !== null) {
        extendsClause.long_class_specifier_identifier = longClassSpecifierIdentifier
        extendsClause.within = within
        extendsClause.compositionSpecifier = compositionSpecifier
      }

      if ('extends_clause' in requiredReferences) {
        requiredReferences.extends_clause = requiredReferences.extends_clause.concat([extendsClause])
      } else {
        requiredReferences.extends_clause = [extendsClause]
      }
    }
    if ('import_clause' in element && element.import_clause !== undefined) {
      const importClause = element.import_clause
      if (longClassSpecifierIdentifier !== null) {
        importClause.long_class_specifier_identifier = longClassSpecifierIdentifier
        importClause.within = within
        importClause.compositionSpecifier = compositionSpecifier
      }
      if ('import_clause' in requiredReferences) {
        requiredReferences.import_clause = requiredReferences.import_clause.concat([importClause])
      } else {
        requiredReferences.import_clause = [importClause]
      }
    }
    if ('class_definition' in element && element.class_definition !== undefined) {
      const classDefinitionInstance = {}
      const classSpecifier = element.class_definition.class_specifier
      const classPrefixes = element.class_definition.class_prefixes
      let identifier2 = null
      const dict = {
        within,
        fullMoFilePath,
        classPrefixes,
        compositionSpecifier
      }
      if ('long_class_specifier' in classSpecifier) {
        dict.type = 'long_class_specifier'
        identifier2 = classSpecifier.long_class_specifier.identifier
        dict.annotation = classSpecifier.long_class_specifier.composition.annotation
        dict.semantics = extractSemanticsFromAnnotations(dict.annotation, identifier2)
        dictIdentifier.cdl_annotations = extractCdlAnnotations(dict.annotation)

        classDefinitionInstance[identifier2] = dict
      } else if ('short_class_specifier' in classSpecifier) {
        // TODO: handle
      }
      // var jsonOp = {'class_definition': [element.class_definition], 'within': within, 'fullMoFilePath': fullMoFilePath}
      // var newAllObjects = extractAllObjects(jsonOp, within=within)
      instances = Object.assign({}, instances, classDefinitionInstance)
      requiredReferences = updateRequiredReferences(requiredReferences, {})
    }
    if ('component_clause' in element && element.component_clause !== undefined) {
      const componentClause = element.component_clause
      let typePrefix = null
      let typeSpecifier = null
      let arraySubscripts = null
      const componentList = componentClause.component_list

      typePrefix = componentClause.type_prefix
      typeSpecifier = componentClause.type_specifier
      arraySubscripts = componentClause.array_subscripts

      for (let i = 0; i < componentList.length; i++) {
        const singleComponentList = componentList[i]
        const identifier = singleComponentList.declaration.identifier
        let annotation = null

        if ('description' in singleComponentList && singleComponentList.description !== undefined) {
          if ('annotation' in singleComponentList.description && singleComponentList.description.annotation !== undefined) {
            annotation = singleComponentList.description.annotation
          }
        }
        instances[identifier] = {
          type_prefix: typePrefix,
          type_specifier: typeSpecifier,
          array_subscripts: arraySubscripts,
          type: 'element',
          compositionSpecifier,
          long_class_specifier_identifier: longClassSpecifierIdentifier,
          single_component_list: singleComponentList,
          annotation,
          semantics: extractSemanticsFromAnnotations(annotation, identifier),
          cdl_annotations: extractCdlAnnotations(annotation),
          within,
          fullMoFilePath
        }
      }
    }
  }
  const allObjects = { instances, requiredReferences }
  return allObjects
}

function extractConnectionsFromEquationSection (equationSection) {
  const connections = {}
  let equations = null
  if ('equation' in equationSection && equationSection.equation !== undefined) {
    equations = equationSection.equation
    for (let i = 0; i < equations.length; i++) {
      const equation = equations[i]
      let connectClause = null

      if ('connect_clause' in equation && equation.connect_clause !== undefined) {
        connectClause = equation.connect_clause

        const from = parseComponentReference(connectClause.from)
        const to = parseComponentReference(connectClause.to)
        if (from in connections) {
          if (!(to in connections[from])) {
            connections[from] = connections[from].concat([to])
          }
        } else {
          connections[from] = [to]
        }
      }
    }
  }
  return connections
}

function parseComponentReference (reference) {
  let name = ''
  reference.forEach(namePart => {
    if (namePart.dot_op === true) {
      name = name + '.'
    }

    if (namePart.identifier !== undefined) {
      name = name + namePart.identifier
    }
    if (namePart.array_subscripts !== undefined) {
      name = name + parseArraySubscripts(namePart.array_subscripts)
    }
  })
  return name
}

function parseArraySubscripts (arraySubscripts) {
  if (arraySubscripts === undefined) {
    return ''
  }
  if (arraySubscripts.length === 0) {
    return ''
  }
  // TODO: fix better
  return '[' + arraySubscripts[0].expression.simple_expression + ']'
}

function parseModifications(modifications) {
  var outputDict = {}
  if (Object.keys(modifications).length > 0) {
    Object.keys(modifications).forEach(modificationKey => {
      const classModifications = modifications[modificationKey]
      if (classModifications.length > 0) {
        classModifications.forEach(classModification => {
          const eleMod = classModification.element_modification_or_replaceable.element_modification
          const eleKey = eleMod.name
          const eleDict = {}
          const mod = eleMod.modification
          if (mod.expression !== undefined) {
            eleDict[eleKey] = mod.expression.simple_expression
          } else {
            eleDict[eleKey] = parseModifications(mod)
          }   
          if (eleKey !== 'propagate') {
            outputDict = Object.assign({}, outputDict, eleDict)
          } else { 
            if (outputDict.propagate === undefined) {
              outputDict['propagate'] = [eleDict[eleKey]]
            } else {
              const existingPropagateList = outputDict.propagate
              existingPropagateList.push(eleDict[eleKey])
              outputDict['propagate'] = existingPropagateList
            }
          }
        })
      }
    })
  }
  return outputDict
}

function extractCdlAnnotations(annotation) {
  var cdlAnnotations = {}
  if (annotation !== null && annotation !== undefined) {
    annotation.forEach(singleAnnotation => {
      const annotationName = singleAnnotation.element_modification_or_replaceable.element_modification.name
      if (annotationName === '__cdl' || annotationName === '__Buildings') {
        const modifications = singleAnnotation.element_modification_or_replaceable.element_modification.modification
        cdlAnnotations = parseModifications(modifications)
      }
    })
  }
  return cdlAnnotations
}

function extractSemanticsFromAnnotations (annotation, instanceIdentifier) {
  const semantics = {}
  if (annotation !== null && annotation !== undefined) {
    annotation.forEach(singleAnnotation => {
      const annotationName = singleAnnotation.element_modification_or_replaceable.element_modification.name
      if (annotationName === '__cdl' || annotationName === '__Buildings') {
        const classModifications = singleAnnotation.element_modification_or_replaceable.element_modification.modification.class_modification
        classModifications.forEach(classModification => {
          const keyName = classModification.element_modification_or_replaceable.element_modification.name
          if (keyName === 'semantic') {
            const semanticClassModifications = classModification.element_modification_or_replaceable.element_modification.modification.class_modification
            semanticClassModifications.forEach(semanticClassModification => {
              const semanticLanguageKey = semanticClassModification.element_modification_or_replaceable.element_modification.name
              let semanticLanguage = semanticClassModification.element_modification_or_replaceable.element_modification.modification.expression.simple_expression
              const semanticLanguageContent = semanticClassModification.element_modification_or_replaceable.element_modification.description_string
              semanticLanguage = semanticLanguage.split('"')[1]
              // semanticLanguageContent = semanticLanguageContent.replaceAll('<cdl_instance_name>', instanceIdentifier)
              if (semanticLanguageKey === 'metadataLanguageDefinition' || semanticLanguageKey === 'naturalLanguageDefinition') {
                if (!(semanticLanguage in semantics)) {
                  semantics[semanticLanguage] = ''
                }
              } else if (semanticLanguageKey === 'metadataLanguage' || semanticLanguageKey === 'naturalLanguage') {
                if (semanticLanguage in semantics) {
                  semantics[semanticLanguage] = semantics[semanticLanguage] + semanticLanguageContent + '\n'
                } else {
                  semantics[semanticLanguage] = semanticLanguageContent + '\n'
                }
              }
            })
          }
        })
      }
    })
  }

  return semantics
}

function checkValidCdl (instances, requiredReferences) {
  // TODO: check if its valid CDL
  if ('extends_clause' in requiredReferences) {
    return false
  }
  return true
}

function getCxfGraph (instances, requiredReferences, blockName, generateCxfCore = false) {
  let instancesList = []

  if (instances !== null || instances.length > 0) {
    instancesList = Object.keys(instances)
  }

  if (!checkValidCdl(instances, requiredReferences)) {
    return null
  }

  const graph = rdflib.graph()
  const cxfPrefix = rdflib.Namespace('seq:')
  const s231Ns = rdflib.Namespace('https://data.ashrae.org/S231P#')
  const rdfNs = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

  const uri = blockName + '.jsonld'

  const newInstances = {}

  instancesList.forEach(instance => {
    const instanceDict = instances[instance]
    const newInstanceDict = {}
    // Object.assign(newInstanceDict, instances[instance]);
    let instanceType = null
    const within = instanceDict.within

    if (instanceDict === null) {
      // TODO: handle later
    }
    instanceType = instanceDict.type
    if (instanceType === 'long_class_specifier') {
      // check if CDL elementary block
      // TODO: check if we should include package name within sequence
      if (within !== undefined && within !== null && within.length > 0 && within.split('.').slice(-2, -1)[0] !== undefined && within.split('.').slice(-2, -1)[0].toUpperCase() === 'CDL') {
        if (generateCxfCore) {
          // TODO: handle cxf-core
          graph.add(s231Ns(blockName), rdfNs('type'), s231Ns('ElementaryBlock'))
        }
      } else {
        // TODO: how to separate composite block v/s extension block
        graph.add(cxfPrefix(blockName), rdfNs('type'), s231Ns('Block'))
        newInstanceDict.cxfNode = cxfPrefix(blockName)
      }
    } else if (instanceType === 'element') {
      const className = instanceDict.long_class_specifier_identifier === undefined ? blockName : instanceDict.long_class_specifier_identifier
      const instanceNode = cxfPrefix(`${className}#${instance}`)
      const blockNode = cxfPrefix(`${className}`)
      const typeSpecifier = instanceDict.type_specifier

      if (instanceDict.type_prefix === 'parameter') {
        graph.add(blockNode, s231Ns('hasParameter'), instanceNode)
        // TODO: check if enumeration should be here
        if (typeSpecifier !== undefined && ['Real', 'Integer', 'Boolean', 'String'].includes(typeSpecifier)) {
          graph.add(instanceNode, s231Ns('isOfDataType'), s231Ns(typeSpecifier))
        }
      } else if (instanceDict.type_prefix === 'constant') {
        graph.add(blockNode, s231Ns('hasConstant'), instanceNode)
        // TODO: check if enumeration should be here
        if (typeSpecifier !== undefined && ['Real', 'Integer', 'Boolean', 'String'].includes(typeSpecifier)) {
          graph.add(instanceNode, s231Ns('isOfDataType'), s231Ns(typeSpecifier))
        }
      } else if (instanceDict.type_prefix === '' || instanceDict.type_prefix === undefined) {
        if (typeSpecifier.endsWith('IntegerInput') || typeSpecifier.endsWith('BooleanInput') || typeSpecifier.endsWith('RealInput')) {
          // is it inputConnector
          graph.add(blockNode, s231Ns('hasInput'), instanceNode)
          const inputConnectorType = typeSpecifier.split('.').slice(-1)[0]
          graph.add(instanceNode, rdfNs('type'), s231Ns(inputConnectorType))
        } else if (typeSpecifier.endsWith('IntegerOutput') || typeSpecifier.endsWith('BooleanOutput') || typeSpecifier.endsWith('RealOutput')) {
          // is it outputConnector
          graph.add(blockNode, s231Ns('hasOutput'), instanceNode)
          const outputConnectorType = typeSpecifier.split('.').slice(-1)[0]
          graph.add(instanceNode, rdfNs('type'), s231Ns(outputConnectorType))
        } else if (typeSpecifier.split('.').slice(-3, -2)[0] !== undefined && typeSpecifier.split('.').slice(-3, -2)[0].toUpperCase() === 'CDL') {
          // is it elementary block
          graph.add(blockNode, s231Ns('containsBlock'), instanceNode)
          const cxfElementaryBlockName = ['CXF'].concat(typeSpecifier.split('.').slice(-2)).join('.')
          graph.add(instanceNode, rdfNs('type'), s231Ns(cxfElementaryBlockName))
        } else {
          // TODO: how to distinguish between control sequences and models?
          graph.add(blockNode, s231Ns('containsBlock'), instanceNode)
          graph.add(instanceNode, rdfNs('type'), cxfPrefix(typeSpecifier))
        }
      }
      newInstanceDict.cxfNode = instanceNode
    }
    newInstances[instance] = newInstanceDict
  })

  const connections = requiredReferences.connections
  if (connections !== undefined && connections !== null) {
    Object.keys(connections).forEach(fromElement => {
      const fromNode = getInstanceNode(fromElement, cxfPrefix, newInstances)

      const toElements = connections[fromElement]
      toElements.forEach(toElement => {
        const toNode = getInstanceNode(toElement, cxfPrefix, newInstances)
        graph.add(fromNode, s231Ns('isConnectedTo'), toNode)
      })
    })
  }

  let cxfJson = null
  rdflib.serialize(null, graph, uri, 'application/ld+json', (err, jsonldData) => {
    if (err) {
      throw err
    }
    cxfJson = JSON.parse(jsonldData)
  })
  return cxfJson
}

function getInstanceNode (element, cxfPrefix, newInstances) {
  let node = null
  if (element.split('.').length > 1) {
    const instance = element.split('.').slice(0, 1)[0]
    const instanceNode = newInstances[instance].cxfNode
    const className = instanceNode.value.split('#')[0].split(':').slice(-1)[0]
    node = cxfPrefix(`${className}#${element}`)
  } else {
    node = newInstances[element].cxfNode
  }
  return node
}

module.exports.extractAllObjects = extractAllObjects
module.exports.updateConnections = updateConnections
module.exports.updateRequiredReferences = updateRequiredReferences
module.exports.extractSemanticsFromAnnotations = extractSemanticsFromAnnotations
module.exports.getCxfGraph = getCxfGraph
