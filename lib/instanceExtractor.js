/*
{
    "instance_a": {
        "type": "element",
        "type_specifier": "...",
        "type_prefix": "...",
        "annotation": {},
        "class_modification": {},
        "long_class_specifier_identifier": "..."
    },
    "required_references": {
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
    }
}

*/

function updateConnections (connections, newConnections) {
  if (newConnections !== null && newConnections !== undefined) {
    for (var element in newConnections) {
      if (!(element in connections)) {
        connections[element] = newConnections[element].concat()
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

function extractInstances (jsonOutput) {
  var instances = {}
  var connections = {}

  var classDefinitions = jsonOutput.class_definition
  for (let i = 0; i < classDefinitions.length; i++) {
    var longClassSpecifier = null
    var shortClassSpecifier = null
    var derClassSpecifier = null
    var identifier = null

    var classDefinition = classDefinitions[i]
    var classSpecifier = classDefinition.class_specifier
    if ('long_class_specifier' in classSpecifier) {
      longClassSpecifier = classSpecifier.long_class_specifier
      var [newInstances, newConnections] = extractFromLongClassSpecifier(longClassSpecifier)
      instances = Object.assign({}, instances, newInstances)
      connections = updateConnections(connections, newConnections)
    }
    if ('short_class_specifier' in classSpecifier) {
      shortClassSpecifier = classSpecifier.short_class_specifier
      identifier = shortClassSpecifier.identifier
      var shortClassSpeciiferValue = shortClassSpecifier.value
      var name = null

      if ('name' in shortClassSpeciiferValue && shortClassSpeciiferValue.name !== undefined) {
        name = shortClassSpeciiferValue.name
        instances[identifier] = {
          'type': 'short_class_specifier',
          'type_specifier': name,
          'short_class_specifier_value': shortClassSpeciiferValue
        }
      } else if ('enum_list' in shortClassSpeciiferValue && shortClassSpeciiferValue.enum_list !== undefined) {
        var enumList = shortClassSpeciiferValue.enum_list

        for (let j = 0; j < enumList.length; j++) {
          var enumListIdentifier = enumList[j].identifier
          instances[enumListIdentifier] = {
            'type': 'enumeration',
            'enumeration_literal': enumList[j]
          }
        }
      }
    }
    if ('der_class_specifier' in classSpecifier && classSpecifier.der_class_specifier !== undefined) {
      derClassSpecifier = classSpecifier.der_class_specifier
      identifier = derClassSpecifier.identifier
      var derClassSpeciiferValue = derClassSpecifier.value
      instances[identifier] = {
        'type': 'der_class_specifier',
        'value': derClassSpeciiferValue
      }
    }
  }
  if ('required_references' in instances) {
    instances['required_references']['connections'] = connections
  } else {
    instances['required_references'] = {'connections': connections}
  }
  return instances
}

function extractFromLongClassSpecifier (longClassSpecifier) {
  var instances = {}
  var connections = {}
  var identifier = null
  var composition = null
  var compositionInstances = {}
  var compositionConnections = {}
  var dictIdentifier = {}

  if ('identifier' in longClassSpecifier) {
    identifier = longClassSpecifier.identifier
    dictIdentifier['type'] = 'long_class_specifier'
  }

  if (longClassSpecifier.extends !== null && longClassSpecifier.extends !== undefined) {
    dictIdentifier['extends'] = true
    if ('class_modification' in longClassSpecifier && longClassSpecifier.class_modification !== undefined) {
        // classModification = longClassSpecifier.classModification
        // TODO: handle later
    }
  }
  if ('composition' in longClassSpecifier && longClassSpecifier.composition !== undefined) {
    composition = longClassSpecifier.composition
    var [newInstances, newConnections] = extractFromComposition(composition, identifier)
    compositionInstances = Object.assign({}, newInstances, compositionInstances)
    compositionConnections = updateConnections(compositionConnections, newConnections)
    if ('annotation' in composition && composition.annotation !== undefined) {
      dictIdentifier['annotation'] = composition.annotation
      dictIdentifier['semantics'] = extractSemanticsFromAnnotations(composition.annotation, identifier)
    }
  }
  if (identifier !== null) {
    instances[identifier] = dictIdentifier
  }
  if (compositionInstances !== {}) {
    instances = Object.assign({}, instances, compositionInstances)
  }
  connections = updateConnections(connections, compositionConnections)
  return [instances, connections]
}

function extractFromComposition (composition, longClassSpecifierIdentifier) {
  var elementSections = null
  var instances = {}
  var connections = {}
  var newInstances = {}
  var newConnections = {}

  if (composition === null || composition === undefined) {
    return [instances, connections]
  }

  if ('element_list' in composition && composition.element_list !== undefined) {
    var elementList = composition.element_list
    ;[newInstances, newConnections] = extractFromElementList(elementList, longClassSpecifierIdentifier)
    instances = Object.assign({}, instances, newInstances)
    connections = updateConnections(connections, newConnections)
  }

  if ('element_sections' in composition && composition.element_sections !== undefined) {
    elementSections = composition.element_sections
    for (let i = 0; i < elementSections.length; i++) {
      var elementSection = elementSections[i]
      if ('public_element_list' in elementSection && elementSection.public_element_list !== undefined) {
        var publicElementList = elementSection.public_element_list
        ;[newInstances, newConnections] = extractFromElementList(publicElementList, longClassSpecifierIdentifier)
        instances = Object.assign({}, instances, newInstances)
        connections = updateConnections(connections, newConnections)
      }
      if ('protected_element_list' in elementSection && elementSection.protected_element_list !== undefined) {
        var protectedElementList = elementSection.protected_element_list
        ;[newInstances, newConnections] = extractFromElementList(protectedElementList, longClassSpecifierIdentifier)
        instances = Object.assign({}, instances, newInstances)
        connections = updateConnections(connections, newConnections)
      }
      if ('equation_section' in elementSection && elementSection.equation_section !== undefined) {
        var equationSection = elementSection.equation_section
        newConnections = extractConnectionsFromEquationSection(equationSection)
        connections = updateConnections(connections, newConnections)
      }
    }
  }

  if ('external_composition' in composition && composition.external_composition !== undefined) {
    // TODO:
  }
  return [instances, connections]
}

function extractFromElementList (elementList, longClassSpecifierIdentifier) {
  var instances = {}
  var connections = {}

  for (let i = 0; i < elementList.length; i++) {
    var element = elementList[i]

    if ('extends_clause' in element && element.extends_clause !== undefined) {
      var extendsClause = element.extends_clause
      if (longClassSpecifierIdentifier !== null) {
        extendsClause['long_class_specifier_identifier'] = longClassSpecifierIdentifier
      }

      if ('required_references' in instances) {
        if ('extends_clause' in instances.required_references) {
          instances['required_references']['extends_clause'] = instances['required_references']['extends_clause'].concat([extendsClause])
        } else {
          instances['required_references']['extends_clause'] = [extendsClause]
        }
      } else {
        instances['required_references'] = {
          'extends_clause': [extendsClause]
        }
      }
    }
    if ('import_clause' in element && element.import_clause !== undefined) {
      var importClause = element.import_clause
      if (longClassSpecifierIdentifier !== null) {
        importClause['long_class_specifier_identifier'] = longClassSpecifierIdentifier
      }
      if ('required_references' in instances) {
        if ('import_clause' in instances['required_references']) {
          instances['required_references']['import_clause'].concat([importClause])
        } else {
          instances['required_references']['import_clause'] = [importClause]
        }
      } else {
        instances['required_references'] = {
          'import_clause': [importClause]
        }
      }
    }
    if ('class_definition' in element && element.class_definition !== undefined) {
      var jsonOp = {'class_definition': [element.class_definition]}
      var newInstances = extractInstances(jsonOp)
      instances = Object.assign({}, instances, newInstances)
            // connections = updateConnections(connections, new_connections)
    }
    if ('component_clause' in element && element.component_clause !== undefined) {
      var componentClause = element.component_clause
      var typePrefix = null
      var typeSpecifier = null
      var arraySubscripts = null
      var componentList = componentClause.component_list

      typePrefix = componentClause.type_prefix
      typeSpecifier = componentClause.type_specifier
      arraySubscripts = componentClause.array_subscripts

      for (let i = 0; i < componentList.length; i++) {
        var singleComponentList = componentList[i]
        var identifier = singleComponentList.declaration.identifier
        var annotation = null

        if ('description' in singleComponentList && singleComponentList.description !== undefined) {
          if ('annotation' in singleComponentList.description && singleComponentList.description.annotation !== undefined) {
            annotation = singleComponentList.description.annotation
          }
        }
        instances[identifier] = {
          'type_prefix': typePrefix,
          'type_specifier': typeSpecifier,
          'array_subscripts': arraySubscripts,
          'type': 'element',
          'long_class_specifier_identifier': longClassSpecifierIdentifier,
          'single_component_list': singleComponentList,
          'annotation': annotation,
          'semantics': extractSemanticsFromAnnotations(annotation, identifier)
        }
      }
    }
  }
  return [instances, connections]
}

function extractConnectionsFromEquationSection (equationSection) {
  var connections = {}
  var equations = null
  if ('equation' in equationSection && equationSection.equation !== undefined) {
    equations = equationSection.equation
    for (let i = 0; i < equations.length; i++) {
      var equation = equations[i]
      var connectClause = null

      if ('connect_clause' in equation && equation.connect_clause !== undefined) {
        connectClause = equation.connect_clause

        var from = parseComponentReference(connectClause.from)
        var to = parseComponentReference(connectClause.to)
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
  var name = ''
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

function extractSemanticsFromAnnotations (annotation, instanceIdentifier) {
  var semantics = {}
  if (annotation !== null && annotation !== undefined) {
    annotation.forEach(singleAnnotation => {
      var annotationName = singleAnnotation.element_modification_or_replaceable.element_modification.name
      if (annotationName === '__cdl' || annotationName === '__Buildings') {
        var classModifications = singleAnnotation.element_modification_or_replaceable.element_modification.modification.class_modification
        classModifications.forEach(classModification => {
          var keyName = classModification.element_modification_or_replaceable.element_modification.name
          if (keyName === 'semantic') {
            var semanticClassModifications = classModification.element_modification_or_replaceable.element_modification.modification.class_modification
            semanticClassModifications.forEach(semanticClassModification => {
              var semanticLanguageKey = semanticClassModification.element_modification_or_replaceable.element_modification.name
              var semanticLanguage = semanticClassModification.element_modification_or_replaceable.element_modification.modification.expression.simple_expression
              var semanticLanguageContent = semanticClassModification.element_modification_or_replaceable.element_modification.description_string
              semanticLanguage = semanticLanguage.split('"')[1]
              semanticLanguageContent = semanticLanguageContent.replaceAll('<cdl_instance_name>', instanceIdentifier)
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

module.exports.extractInstances = extractInstances
