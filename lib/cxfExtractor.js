const rdflib = require('rdflib')
const path = require('path')
const fs = require('fs')
const ut = require('./util.js')
const logger = require('winston') // This retrieves the default logger which is configured in app.js
const json2moExpression = require('../json2mo/expression.js')
const json2moGraphic = require('../json2mo/graphic.js')
const json2moComponentClause1 = require('../json2mo/componentClause1.js')
const json2moClassModification = require('../json2mo/classModification.js')

// function checkIfCdlElementaryBlock (name) {
//   if (name === undefined || name === null || name.length === 0) {
//     return false
//   }
//   if (name.includes('.')) {
//     if (name.split('.').length >= 3) {
//       const blockName = name.split('.').slice(-1)[0].toUpperCase()
//       const blockName2 = name.split('.').slice(-2, -1)[0].toUpperCase()
//       const blockName3 = name.split('.').slice(-3, -2)[0].toUpperCase()
//       if (blockName === 'SOURCES' && blockName3 === 'CDL') {
//         if (name.split('.').length >= 6) {
//           const blockName4 = name.split('.').slice(-4, -3)[0].toUpperCase()
//           const blockName5 = name.split('.').slice(-5, -4)[0].toUpperCase()
//           const blockName6 = name.split('.').slice(-6, -5)[0].toUpperCase()
//           if (blockName === 'SOURCES' && blockName3 === 'CDL' && blockName4 === 'OBC' && blockName5 === 'CONTROLS' && blockName6.startsWith('BUILDINGS')) {
//             return true
//           }
//         } else {
//           return true
//         }
//       } else if (blockName2 === 'CDL') {
//         if (name.split('.').length >= 5) {
//           const blockName4 = name.split('.').slice(-4, -3)[0].toUpperCase()
//           const blockName5 = name.split('.').slice(-5, -4)[0].toUpperCase()
//           if (blockName2 === 'CDL' && blockName3 === 'OBC' && blockName4 === 'CONTROLS' && blockName5.startsWith('BUILDINGS')) {
//             return true
//           }
//         } else {
//           return false
//         }
//       }
//     } else if (name.split('.').length === 2) {
//       const blockName2 = name.split('.').slice(-2, -1)[0].toUpperCase()
//       if (blockName2 === 'CDL') {
//         return true
//       }
//     } else {
//       return false
//     }
//   } else {
//     return false
//   }
// }

function checkValidCdl (instances, requiredReferences) {
  // TODO: check if its valid CDL
  if ('extends_clause' in requiredReferences && requiredReferences.extends_clause !== undefined && requiredReferences.extends_clause.length > 1) {
    return false
  }
  return true
}

function parseClassAnnotations (classAnnotations, keyword) {
  let outputStr = ''
  for (let i = 0; i < classAnnotations.length; i++) {
    const annotation = classAnnotations[i]
    if ('element_modification_or_replaceable' in annotation && annotation.element_modification_or_replaceable !== undefined &&
          annotation.element_modification_or_replaceable !== null) {
      const eleModRep = annotation.element_modification_or_replaceable
      if ('element_modification' in eleModRep && eleModRep.element_modification !== undefined && eleModRep.element_modification !== null) {
        const eleMod = eleModRep.element_modification
        if ('name' in eleMod && eleMod.name !== undefined && eleMod.name !== null) {
          const eleModName = eleMod.name
          const valueAttributes = ['generatePointlist', 'controlledDevice', 'propagate']
          if (eleModName === keyword) {
            if (keyword === '__cdl') {
              return parseModification(eleMod.modification, null, valueAttributes)
            }
            if ('modification' in eleMod && eleMod.modification !== undefined && eleMod.modification !== null) {
              const keyModification = eleMod.modification
              if ('class_modification' in keyModification && keyModification.class_modification !== undefined && keyModification.class_modification !== null) {
                const keyClassMods = keyModification.class_modification
                keyClassMods.forEach(keyClassMod => {
                  if ('element_modification_or_replaceable' in keyClassMod && keyClassMod.element_modification_or_replaceable !== undefined &&
                  keyClassMod.element_modification_or_replaceable !== null) {
                    const keyEleModRep = keyClassMod.element_modification_or_replaceable
                    if ('element_modification' in keyEleModRep && keyEleModRep.element_modification !== undefined && keyEleModRep.element_modification !== null) {
                      const keyEleMod = keyEleModRep.element_modification
                      if ('coordinateSystem' in keyEleMod) {
                        const coordinateSystemStr = json2moGraphic.parse(keyEleMod)
                        if (coordinateSystemStr !== undefined && coordinateSystemStr !== null && coordinateSystemStr.length > 0) {
                          outputStr += coordinateSystemStr
                        }
                      }
                      if ('graphics' in keyEleMod) {
                        const graphicsStr = json2moGraphic.parse(keyEleMod)
                        if (graphicsStr !== undefined && graphicsStr !== null && graphicsStr.length > 0) {
                          if (outputStr.length === 0) {
                            outputStr += graphicsStr
                          } else {
                            outputStr += ',' + graphicsStr
                          }
                        }
                      }
                      if (keyword === 'Documentation') {
                        if ('name' in keyEleMod && keyEleMod.name !== undefined && keyEleMod.name !== null && keyEleMod.name.length > 0) {
                          const docName = keyEleMod.name
                          const docModification = parseModification(keyEleMod.modification)
                          if (docModification !== undefined && docModification !== null && Object.keys(docModification).length > 0) {
                            if ('value' in docModification) {
                              const docValue = docModification.value
                              if (docValue !== undefined && docValue !== null && docValue.length > 0) {
                                if (outputStr.length === 0) {
                                  outputStr += docName + '=' + docValue
                                } else {
                                  outputStr += ',' + docName + '=' + docValue
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                })
              }
            }
          }
        }
      }
    }
  }
  return outputStr
}

function parsePropagateAnnotations (propagateObjects, instanceNode, graph, s231Ns, cxfPrefix, isElementaryBlock, blockNameWithPackage) {
  if (propagateObjects !== undefined && propagateObjects !== null && propagateObjects.length > 0) {
    propagateObjects.forEach(propagateObj => {
      let instance
      let generatePointlistFlag
      let subInstanceNode

      if ('instance' in propagateObj && propagateObj.instance !== undefined && propagateObj.instance !== null) {
        if ('value' in propagateObj.instance && propagateObj.instance.value !== undefined && propagateObj.instance.value !== null) {
          instance = propagateObj.instance.value
        }
        if ('generatePointlist' in propagateObj && propagateObj.generatePointlist !== undefined && propagateObj.generatePointlist !== null) {
          if ('value' in propagateObj.generatePointlist && propagateObj.generatePointlist.value !== undefined && propagateObj.generatePointlist.value !== null) {
            generatePointlistFlag = propagateObj.generatePointlist.value
            // if (generatePointlistFlag !== undefined && generatePointlistFlag !== null) {
            // graph.add(instanceNode, s231Ns('generatePointlist'), generatePointlistFlag)
            // }
          }
        }
      }
      if (instance !== undefined && instance !== null && generatePointlistFlag !== undefined && generatePointlistFlag !== null) {
        if (isElementaryBlock) {
          subInstanceNode = s231Ns(`${blockNameWithPackage}.${instance}`)
        } else {
          subInstanceNode = cxfPrefix(`${blockNameWithPackage}.${instance}`)
        }
        graph.add(subInstanceNode, s231Ns('generatePointlist'), generatePointlistFlag)
      }
    })
  }
}

function getCxfGraph (instances, requiredReferences, blockName, generateElementary, generateCxfCore) {
  let instancesList = []

  if (instances !== null || instances.length > 0) {
    instancesList = Object.keys(instances)
  }

  if (!checkValidCdl(instances, requiredReferences)) {
    return null
  }

  const graph = rdflib.graph()
  // TODO:  what is prefix
  const cxfPrefix = rdflib.Namespace('http://example.org#')
  const s231Ns = rdflib.Namespace('https://data.ashrae.org/S231P#')
  const rdfNs = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

  const uri = blockName + '.jsonld'

  const newInstances = {}
  let isElementaryBlock = false
  let blockNode = null

  instancesList.forEach(instance => {
    const instanceDict = instances[instance]
    const newInstanceDict = {}

    let instanceType = null
    let instanceNode
    let prefix
    let within = instanceDict.within
    let blockNameWithPackage
    if (within === undefined || within === null) {
      within = ''
      blockNameWithPackage = blockName
    } else {
      blockNameWithPackage = within + '.' + blockName
    }
    if (instanceDict === null || instanceDict === undefined) {
      // TODO: handle later
    }
    instanceType = instanceDict.type
    if (instanceType === 'long_class_specifier') {
      // check if CDL elementary block
      if (ut.checkIfCdlElementaryBlockOrPackage(within, false)) {
        isElementaryBlock = true
      }
      let blockTypeNode

      // TODO: check if package
      if (isElementaryBlock) {
        // blockName = 'CDL' + blockNameWithPackage.split('CDL')[1]
        instanceNode = s231Ns(blockNameWithPackage)
        blockTypeNode = s231Ns('ElementaryBlock')
        blockNode = instanceNode
      } else {
        instanceNode = cxfPrefix(blockNameWithPackage)
        blockTypeNode = s231Ns('Block')
        blockNode = instanceNode
      }
      // TODO: how to separate composite block v/s extension block
      if (((isElementaryBlock && (generateElementary || generateCxfCore))) || !(isElementaryBlock)) {
        graph.add(instanceNode, rdfNs('type'), blockTypeNode)
        graph.add(instanceNode, s231Ns('label'), instance)
        if ('description' in instanceDict) {
          if ('description_string' in instanceDict.description) {
            const descriptionString = instanceDict.description.description_string
            graph.add(instanceNode, s231Ns('description'), descriptionString)
          }
        }
      }
      if ('annotation' in instanceDict && instanceDict.annotation !== null && instanceDict.annotation !== undefined) {
        const classAnnotations = instanceDict.annotation
        const cdlAnnotations = parseClassAnnotations(classAnnotations, '__cdl')
        const generatePointlistFlag = cdlAnnotations.generatePointlist ? cdlAnnotations.generatePointlist.value : null
        const controlledDeviceStr = cdlAnnotations.controlledDevice ? cdlAnnotations.controlledDevice.value : ''
        const propagateObjects = cdlAnnotations.propagate ? cdlAnnotations.propagate : null
        parsePropagateAnnotations(propagateObjects, instanceNode, graph, s231Ns, cxfPrefix, isElementaryBlock, blockNameWithPackage)
        const iconStr = parseClassAnnotations(classAnnotations, 'Icon')
        const diagramStr = parseClassAnnotations(classAnnotations, 'Diagram')
        const documentationStr = parseClassAnnotations(classAnnotations, 'Documentation')
        if (generatePointlistFlag !== null && generatePointlistFlag !== undefined) {
          graph.add(instanceNode, s231Ns('generatePointlist'), generatePointlistFlag)
        }
        if (generatePointlistFlag !== null && generatePointlistFlag !== undefined && controlledDeviceStr.length > 0) {
          graph.add(instanceNode, s231Ns('controlledDevice'), controlledDeviceStr)
        }
        if (iconStr.length > 0) {
          graph.add(instanceNode, s231Ns('icon'), iconStr)
        }
        if (diagramStr.length > 0) {
          graph.add(instanceNode, s231Ns('diagram'), diagramStr)
        }
        if (documentationStr.length > 0) {
          graph.add(instanceNode, s231Ns('documentation'), documentationStr)
        }
      }
      newInstanceDict.cxfNode = instanceNode
    } else if (instanceType === 'short_class_specifier') {
      // TODO: handle later
    } else if (instanceType === 'enumeration_class') {
      if (ut.checkIfCdlElementaryBlockOrPackage(within, false)) {
        prefix = 's231'
        isElementaryBlock = true
      } else {
        prefix = 'seq'
      }

      newInstanceDict.prefix = prefix
      if (isElementaryBlock) {
        // blockName = 'CDL' + blockNameWithPackage.split('CDL')[1]
        instanceNode = s231Ns(blockNameWithPackage)
      } else {
        instanceNode = cxfPrefix(blockNameWithPackage)
      }

      if ((isElementaryBlock && (generateElementary || generateCxfCore)) || (!isElementaryBlock)) {
        graph.add(instanceNode, rdfNs('type'), s231Ns('EnumerationType'))
        graph.add(instanceNode, s231Ns('label'), instance)
        graph.add(instanceNode, s231Ns('value'), instance)
        if ('description' in instanceDict) {
          if ('description_string' in instanceDict.description) {
            const descriptionString = instanceDict.description.description_string
            graph.add(instanceNode, s231Ns('description'), descriptionString)
          }
        }
      }
      newInstanceDict.cxfNode = instanceNode
    } else if (instanceType === 'enumeration') {
      const enumerationKind = instanceDict.enumeration_kind

      let enumerationKindPrefix = cxfPrefix
      let enumerationKindNode
      if (enumerationKind in newInstances) {
        enumerationKindPrefix = newInstances[enumerationKind].prefix
        enumerationKindNode = newInstances[enumerationKind].cxfNode
      }
      if (enumerationKindPrefix === 's231') {
        instanceNode = s231Ns(`${enumerationKind}.${instance}`)
      } else {
        instanceNode = cxfPrefix(`${enumerationKind}.${instance}`)
      }

      if ((isElementaryBlock && (generateElementary || generateCxfCore)) || (!isElementaryBlock)) {
        graph.add(instanceNode, rdfNs('type'), enumerationKindNode)
        graph.add(instanceNode, s231Ns('label'), instance)
        graph.add(instanceNode, s231Ns('value'), instance)
        if ('description' in instanceDict) {
          if ('description_string' in instanceDict.description) {
            const descriptionString = instanceDict.description.description_string
            graph.add(instanceNode, s231Ns('description'), descriptionString)
          }
        }
      }

      newInstanceDict.cxfNode = instanceNode
    } else if (instanceType === 'element') {
      const instanceAccessSpecifier = instanceDict.compositionSpecifier
      if (isElementaryBlock) {
        instanceNode = s231Ns(`${blockNameWithPackage}.${instance}`)
        prefix = 's231'
      } else {
        instanceNode = cxfPrefix(`${blockNameWithPackage}.${instance}`)
        prefix = 'seq'
      }
      newInstanceDict.prefix = prefix

      if ((isElementaryBlock && generateElementary && instanceAccessSpecifier === 'public') || (isElementaryBlock && generateCxfCore && instanceAccessSpecifier === 'public') || !isElementaryBlock) {
        let blockNode
        if (prefix === 's231') {
          blockNode = s231Ns(`${blockNameWithPackage}`)
        } else {
          blockNode = cxfPrefix(`${blockNameWithPackage}`)
        }
        const typeSpecifier = instanceDict.type_specifier
        if (instanceDict.isVector) {
          const arraySubscript = instanceDict.arraySubscripts
          graph.add(instanceNode, s231Ns('label'), instance + arraySubscript)
          graph.add(instanceNode, s231Ns('isArray'), true)
          if (!arraySubscript.includes('if') && !arraySubscript.includes('for') &&
              !arraySubscript.includes('while') && !arraySubscript.includes('when') &&
              !arraySubscript.includes('function')) {
            const numDim = arraySubscript.replace(/[^,]/g, '').length + 1 // count number of commas + 1
            graph.add(instanceNode, s231Ns('numberDimensions'), numDim)
            // arraySubscript.slice(1,-1).substring(1,-1).split(',').forEach(
            let sizeOfDimensions = ''
            for (let i = 0; i < numDim; i++) {
              const subscript = arraySubscript.slice(1, -1).split(',')[i]
              if (subscript !== undefined && subscript !== null && subscript.length > 0 && subscript !== ':') {
                sizeOfDimensions += subscript + ','
              }
            }
            if (sizeOfDimensions !== '') {
              sizeOfDimensions = sizeOfDimensions.slice(0, -1)
              sizeOfDimensions = '(' + sizeOfDimensions + ')'
              graph.add(instanceNode, s231Ns('sizeOfDimensions'), sizeOfDimensions)
            }
          } else { // if array subscript during declaration is an expression
            graph.add(instanceNode, s231Ns('sizeOfDimensions'), arraySubscript.slice(1, -1))
          }
        } else {
          graph.add(instanceNode, s231Ns('label'), instance)
        }

        if (instanceDict.type_prefix === 'parameter') {
          graph.add(blockNode, s231Ns('hasParameter'), instanceNode)
          // TODO: check if enumeration should be here
          if (typeSpecifier !== undefined && ['Real', 'Integer', 'Boolean', 'String'].includes(typeSpecifier)) {
            graph.add(instanceNode, s231Ns('isOfDataType'), s231Ns(typeSpecifier))
            graph.add(instanceNode, rdfNs('type'), s231Ns('Parameter'))
          }
        } else if (instanceDict.type_prefix === 'constant') {
          graph.add(blockNode, s231Ns('hasConstant'), instanceNode)
          // TODO: check if enumeration should be here
          if (typeSpecifier !== undefined && ['Real', 'Integer', 'Boolean', 'String'].includes(typeSpecifier)) {
            graph.add(instanceNode, s231Ns('isOfDataType'), s231Ns(typeSpecifier))
          }
          graph.add(instanceNode, rdfNs('type'), s231Ns('Constant'))
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
          } else if (typeSpecifier.split('.').length > 0 && ut.checkIfCdlElementaryBlockOrPackage(typeSpecifier)) {
            // is it elementary block
            graph.add(blockNode, s231Ns('containsBlock'), instanceNode)
            graph.add(instanceNode, rdfNs('type'), s231Ns(typeSpecifier))
          } else {
            // TODO: how to distinguish between control sequences and models?
            graph.add(blockNode, s231Ns('containsBlock'), instanceNode)
            graph.add(instanceNode, rdfNs('type'), cxfPrefix(typeSpecifier))
          }
        }
        if ('constraining_clause' in instanceDict && instanceDict.constraining_clause !== undefined && instanceDict.constraining_clause !== null) {
          const constrainingClause = instanceDict.constraining_clause
          let constrainedBy = null
          if ('name' in constrainingClause && constrainingClause.name !== undefined && constrainingClause.name !== null &&
                  constrainingClause.name.length > 0) {
            constrainedBy = constrainingClause.name
          }
          if ('class_modification' in constrainingClause && constrainingClause.class_modification !== undefined) {
            const constrainedByModification = parseClassModification(constrainingClause.class_modification, null, ['value'])
            let constrainedByModificationStr = ''
            if (Object.keys(constrainedByModification).length > 0) {
              for (const key in constrainedByModification) {
                if (constrainedByModificationStr !== '') {
                  constrainedByModificationStr += ','
                }
                constrainedByModificationStr += key + '=' + constrainedByModification[key].value
              }
            }
            constrainedByModificationStr = '(' + constrainedByModificationStr + ')'
            constrainedBy = constrainedBy + constrainedByModificationStr
          }
          graph.add(instanceNode, s231Ns('constrainedBy'), constrainedBy)
        }
        if ('replaceable' in instanceDict && instanceDict.replaceable !== undefined && instanceDict.replaceable !== null) {
          graph.add(instanceNode, s231Ns('isReplaceable'), instanceDict.replaceable)
        }
        if ('single_component_list' in instanceDict) {
          if ('description' in instanceDict.single_component_list) {
            if (instanceDict.single_component_list.description !== undefined && 'description_string' in instanceDict.single_component_list.description) {
              if (instanceDict.single_component_list.description.description_string !== undefined && instanceDict.single_component_list.description.description_string !== null &&
                instanceDict.single_component_list.description.description_string.length > 0) {
                const descriptionString = instanceDict.single_component_list.description.description_string
                graph.add(instanceNode, s231Ns('description'), descriptionString)
              }
            }
          }
          if ('condition_attribute' in instanceDict.single_component_list) {
            const conditionAttribute = instanceDict.single_component_list.condition_attribute
            if (conditionAttribute !== undefined && conditionAttribute !== null) {
              graph.add(instanceNode, s231Ns('isConditionalComponent'), true)
              const conditionalExpression = json2moExpression.parse(conditionAttribute.expression)
              if (conditionalExpression !== undefined && conditionalExpression !== null && conditionalExpression.length > 0) {
                graph.add(instanceNode, s231Ns('conditionalExpression'), conditionalExpression)
              }
            }
          }
          if ('declaration' in instanceDict.single_component_list) {
            if ('modification' in instanceDict.single_component_list.declaration) {
              const attributeList = ['start', 'nominal', 'fixed', 'instantiate', 'min', 'max', 'unit', 'quantity', 'value', 'displayUnit']
              const mod = instanceDict.single_component_list.declaration.modification
              const modDict = parseModification(mod, instance, attributeList, typeSpecifier)
              Object.keys(modDict).forEach(key => {
                if (attributeList.includes(key)) {
                  addAttributesToNode(graph, s231Ns, key, modDict, instanceNode)
                } else {
                  if (key === 'redeclarationModification') {
                    const redeclarations = modDict[key]
                    if (redeclarations !== undefined) {
                      redeclarations.forEach(redeclaration => {
                        graph.add(instanceNode, s231Ns('redeclare'), redeclaration)
                      })
                    }
                  }
                  if (key.includes('.')) {
                    Object.keys(modDict[key]).forEach(key2 => {
                      let subInstanceNode
                      if (prefix === 's231') {
                        subInstanceNode = s231Ns(`${blockNameWithPackage}.${key}`)
                      } else {
                        subInstanceNode = cxfPrefix(`${blockNameWithPackage}.${key}`)
                      }
                      addAttributesToNode(graph, s231Ns, key2, Object.assign({}, modDict[key]), subInstanceNode)
                      graph.add(instanceNode, s231Ns('hasInstance'), subInstanceNode)
                    })
                  }
                }
              })
            }
          }
        }
        if ('compositionSpecifier' in instanceDict) {
          const compositionSpecifier = instanceDict.compositionSpecifier
          if (compositionSpecifier === 'public' || compositionSpecifier === 'protected') {
            graph.add(instanceNode, s231Ns('accessSpecifier'), compositionSpecifier)
          }
        }
        if ('annotation' in instanceDict && instanceDict.annotation !== null && instanceDict.annotation !== undefined && instanceDict.annotation.length > 0) {
          instanceDict.annotation.forEach(eleModRep => {
            if ('element_modification_or_replaceable' in eleModRep) {
              if ('element_modification' in eleModRep.element_modification_or_replaceable) {
                const annotationObj = eleModRep.element_modification_or_replaceable.element_modification
                // allowed graphical annotations = ['Line', 'Text', 'Rectangle', 'Polygon', 'Ellipse', 'Bitmap', 'Placement', 'coordinateSystem', 'graphics']
                if (!('name' in annotationObj) && ('Line' in annotationObj || 'Text' in annotationObj ||
                    'Rectangle' in annotationObj || 'Polygon' in annotationObj || 'Ellipse' in annotationObj ||
                    'Bitmap' in annotationObj || 'Placement' in annotationObj || 'coordinateSystem' in annotationObj)) {
                  const graphicalObjStr = json2moGraphic.parse(annotationObj)
                  graph.add(instanceNode, s231Ns('graphics'), graphicalObjStr)
                } else if ('name' in annotationObj && annotationObj.name !== undefined &&
                          annotationObj.name !== null && annotationObj.name.length > 0) {
                  if (annotationObj.name === '__cdl') {
                    const attributeList = ['default', 'generatePointlist', 'controlledDevice', 'extensionBlock', 'hasFmuPath']
                    const modification = parseModification(annotationObj.modification, instance, attributeList)
                    if ('default' in modification && modification.default !== undefined && modification.default !== null) {
                      const defaultObj = modification.default
                      if ('value' in defaultObj && defaultObj.value !== undefined && defaultObj.value !== null) {
                        graph.add(instanceNode, s231Ns('defaultValue'), defaultObj.value)
                      }
                    }
                    if ('generatePointlist' in modification && modification.generatePointlist !== undefined && modification.generatePointlist !== null) {
                      const generatePointlistFlag = modification.generatePointlist
                      if ('value' in generatePointlistFlag && generatePointlistFlag.value !== undefined && generatePointlistFlag.value !== null) {
                        graph.add(instanceNode, s231Ns('generatePointlist'), generatePointlistFlag.value)
                      }
                    }
                    if ('controlledDevice' in modification && modification.controlledDevice !== undefined && modification.controlledDevice !== null) {
                      const controlledDeviceStr = modification.controlledDevice
                      if ('value' in controlledDeviceStr && controlledDeviceStr.value !== undefined && controlledDeviceStr.value !== null) {
                        graph.add(instanceNode, s231Ns('controlledDevice'), controlledDeviceStr.value)
                      }
                    }
                    if ('extensionBlock' in modification && modification.extensionBlock !== undefined && modification.extensionBlock !== null) {
                      const extensionBlock = modification.extensionBlock
                      if ('value' in extensionBlock && extensionBlock.value !== undefined && extensionBlock.value !== null) {
                        if (extensionBlock.value === true) {
                          graph.add(instanceNode, rdfNs('type'), s231Ns('ExtensionBlock'))
                        }
                      }
                    }
                    if ('hasFmuPath' in modification && modification.hasFmuPath !== undefined && modification.hasFmuPath !== null) {
                      const hasFmuPathStr = modification.hasFmuPath
                      if ('value' in hasFmuPathStr && hasFmuPathStr.value !== undefined && hasFmuPathStr.value !== null) {
                        graph.add(instanceNode, s231Ns('hasFmuPath'), hasFmuPathStr.value)
                      }
                    }
                  }
                }
              }
            }
          })
        }
      }
      newInstanceDict.cxfNode = instanceNode
    }
    newInstances[instance] = newInstanceDict
  })

  if (!isElementaryBlock || (isElementaryBlock && (generateElementary || generateCxfCore))) {
    const connections = requiredReferences.connections
    const extendsClauses = requiredReferences.extends_clause
    if (connections !== undefined && connections !== null) {
      Object.keys(connections).forEach(fromElement => {
        const fromNode = getInstanceNode(graph, fromElement, newInstances, s231Ns, cxfPrefix)
        const toElements = connections[fromElement]
        toElements.forEach(toElement => {
          const toNode = getInstanceNode(graph, toElement, newInstances, s231Ns, cxfPrefix)
          if (fromNode !== null && toNode !== null) {
            graph.add(fromNode, s231Ns('isConnectedTo'), toNode)
          }
        })
      })
    }
    if (extendsClauses !== undefined && extendsClauses !== null) {
      let extendsClausesStr = ''
      extendsClauses.forEach(extendsClause => {
        if ('name' in extendsClause && extendsClause.name !== undefined && extendsClause.name !== null && extendsClause.name.length > 0) {
          extendsClausesStr += extendsClause.name
        }
        if ('class_modification' in extendsClause && extendsClause.class_modification !== undefined && extendsClause.class_modification !== null) {
          let extendsClassModification = ''
          extendsClassModification = json2moClassModification.parse(extendsClause.class_modification, null, true)
          if (extendsClassModification.length > 0) {
            extendsClausesStr += extendsClassModification
          }
        }
        if (extendsClausesStr.length > 0) {
          graph.add(blockNode, s231Ns('extends'), extendsClausesStr)
        }
      })
    }
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

function getInstanceNode (graph, element, newInstances, s231Ns, cxfPrefix) {
  let node = null
  // TODO: uncomment to translate flatten vectors [] to _
  // while (element.includes('[')) {
  //   let startIdx = element.indexOf('[')
  //   let endIdx = element.indexOf(']')
  //   let arraySubscript = element.slice(startIdx+1, endIdx)
  //   element = element.slice(0, startIdx) + '_' + arraySubscript + element.slice(endIdx+1)
  // }

  if (element.includes('.')) {
    let instance = element
    let subInstance
    // TODO: handle vector connections

    while (!(instance in newInstances) && instance.includes('.')) {
      subInstance = instance.split('.').slice(-1)[0]
      instance = instance.split('.').slice(0, -1)[0]
    }
    if (instance in newInstances) {
      const instanceNode = newInstances[instance].cxfNode
      const instancePackage = instanceNode.value.split('.').slice(0, -1).join('.').split('#')[1]
      const instanceName = instanceNode.value.split('.').slice(-1)[0]
      const prefix = instanceNode.prefix
      if (prefix === 's231') {
        node = s231Ns(`${instancePackage}.${instanceName}.${subInstance}`)
        // node = s231Ns(`${instanceName}.${subInstance}`)
      } else {
        node = cxfPrefix(`${instancePackage}.${instanceName}.${subInstance}`)
        // node = cxfPrefix(`${instanceName}.${subInstance}`)
      }
      graph.add(instanceNode, s231Ns('hasInstance'), node)
    } else {
      throw new Error(`Cannot find instance ${element}. Please check your code and instance names used in connect statements.`)
    }
  } else if (element in newInstances) {
    node = newInstances[element].cxfNode
  } else {
    throw new Error(`Cannot find instance ${element}. Please check your code and instance names used in connect statements.`)
  }
  return node
}

function addAttributesToNode (graph, s231Ns, key, modDict, instanceNode) {
  const qudtNs = rdflib.Namespace('http://qudt.org/schema/qudt#')
  const unitNs = rdflib.Namespace('http://qudt.org/vocab/unit#')
  const qudtqkNs = rdflib.Namespace('http://qudt.org/vocab/quantitykind#')

  if (key === 'value') {
    graph.add(instanceNode, s231Ns('value'), modDict.value)
  } else {
    if (!(typeof (modDict[key].value) === 'string' && modDict[key].value.startsWith('fill')) || (typeof (modDict[key].value) === 'number')) {
      if (key === 'final') {
        graph.add(instanceNode, s231Ns('isFinal'), true)
      }
      const value = modDict[key].value
      if (['start', 'nominal', 'fixed', 'instantiate', 'min', 'max'].includes(key)) {
        graph.add(instanceNode, s231Ns(key), value)
      } else if (key === 'unit') {
        // TODO: check qudt class name
        if (!modDict[key].value.startsWith('fill')) {
          const qu = getQudtUnit(value, unitNs, s231Ns)
          if (qu !== null) {
            graph.add(instanceNode, qudtNs('hasUnit'), qu)
          }
        } else {
          // TODO: handle fill function for vectors
          // TODO: handle vectors

        }
      } else if (key === 'displayUnit') {
        const qu = getQudtUnit(value, unitNs, s231Ns)
        if (qu !== null) {
          graph.add(instanceNode, s231Ns('hasDisplayUnit'), qu)
        }
      } else if (key === 'quantity') {
        const qk = getQudtQuanityKind(value, qudtqkNs)
        if (qk !== null) {
          graph.add(instanceNode, qudtNs('hasQuantityKind'), qk)
        }
      }
    } else {
      // TODO: handle functions for vectors like fill
    }
  }
}

function parseModification (mod, instance, attributeList, typeSpecifier = '') {
  let res = {}
  if (mod !== undefined && 'equal' in mod && mod.equal) {
    if (mod.expression !== undefined && mod.expression !== null) {
      if ('simple_expression' in mod.expression && mod.expression.simple_expression !== undefined) {
        let value = mod.expression.simple_expression
        if (typeof value === 'string') {
          if (isNaN(Number(value))) {
            value = value.replace(/"/g, '')
            value = value.replace(/'/g, '')
            if (value === 'true') {
              res.value = true
            } else if (value === 'false') {
              res.value = false
            } else {
              res.value = value
            }
          } else {
            res.value = Number(value)
          }
        } else {
          res.value = json2moExpression.parse(mod.expression)
        }
      } else {
        // stringify if expresion and other expressions
        res.value = json2moExpression.parse(mod.expression)
      }
    }
  }
  let res2
  if (mod !== undefined && 'class_modification' in mod) {
    res2 = parseClassModification(mod.class_modification, instance, attributeList)
  }
  res = Object.assign({}, res, res2)
  return res
}

function parseClassModification (classMod, instance, attributeList) {
  const res = {}
  if (classMod !== undefined) {
    classMod.forEach(eleModRep => {
      if ('element_redeclaration' in eleModRep && eleModRep.element_redeclaration !== undefined) {
        const eleRed = eleModRep.element_redeclaration

        if ('component_clause1' in eleRed && eleRed.component_clause1 !== undefined) {
          const componentClause1 = eleRed.component_clause1
          const redeclarationStr = json2moComponentClause1.parse(componentClause1)
          if (redeclarationStr !== undefined && redeclarationStr !== null && redeclarationStr.length > 0) {
            if ('redeclarationModification' in res) {
              res.redeclarationModification.push(redeclarationStr)
            } else {
              res.redeclarationModification = [redeclarationStr]
            }
          }
        }
      }
      if ('element_modification_or_replaceable' in eleModRep && eleModRep.element_modification_or_replaceable !== undefined) {
        if ('element_modification' in eleModRep.element_modification_or_replaceable && eleModRep.element_modification_or_replaceable.element_modification !== undefined) {
          let eleModName = eleModRep.element_modification_or_replaceable.element_modification.name
          if (!attributeList.includes(eleModName)) {
            if (instance !== null && instance !== undefined && instance.length > 0) {
              eleModName = instance + '.' + eleModName
            }
          }
          let modDict
          if ('modification' in eleModRep.element_modification_or_replaceable.element_modification) {
            modDict = parseModification(eleModRep.element_modification_or_replaceable.element_modification.modification, instance, attributeList)
          }
          if (eleModName in res) {
            if (Array.isArray(res[eleModName])) {
              res[eleModName] = [...res[eleModName], modDict]
            } else {
              res[eleModName] = [res[eleModName], modDict]
            }
          } else {
            res[eleModName] = modDict
          }

          if ('final' in eleModRep.element_modification_or_replaceable && eleModRep.element_modification_or_replaceable.final) {
            res[eleModName].final = true
          }
        }
      }
    })
  }
  return res
}

function getQudtUnit (value, unitNs, s231Ns) {
  const qudtMap = {
    Btu: unitNs('BTU_IT'),
    BtuPerHour: unitNs('BTU_IT-PER-HR'),
    W: unitNs('W'),
    J: unitNs('J'),
    bar: unitNs('BAR'),
    Pa: unitNs('PA'),
    cfm: unitNs('M3-PER-MIN'),
    'm3/s': unitNs('M3-PER-SEC'),
    degC: unitNs('DEG_C'),
    degF: unitNs('DEG_F'),
    K: unitNs('K'),
    gal: unitNs('GAL_US'),
    hp: unitNs('HP'),
    m2: unitNs('M2'),
    m3: unitNs('M3'),
    s: unitNs('SEC'),
    'kJ/kg': unitNs('KiloJ-PER-KiloGM'),
    inH2O: unitNs('IN_H2O_60DEG_F'),
    psi: unitNs('PSI'),
    quad: unitNs('QUAD'),
    ton: unitNs('TON_FG'),
    deg: unitNs('DEG'),
    rad: unitNs('RAD'),
    1: unitNs('UNITLESS'),
    h: unitNs('HR'),
    'J/kg': unitNs('J-PER-KiloGM'),
    Hz: unitNs('HZ')
  }
  if (value === undefined || value === null || value === '') {
    return null
  } else if (Object.keys(qudtMap).includes(value)) {
    return qudtMap[value]
  } else {
    logger.warn('Unit ' + value + ' not found in qudt. Using S231:' + value + '')
    return s231Ns(value)
  }
}

function getQudtQuanityKind (value, qudtQkNs) {
  if (value === undefined || value === null || value === '') {
    return null
  } else if (value === 'Angle') {
    return qudtQkNs('Angle')
  } else if (value === 'Area') {
    return qudtQkNs('Area')
  } else if (value === 'Energy') {
    return qudtQkNs('Energy')
  } else if (value === 'Frequency') {
    return qudtQkNs('Frequency')
  } else if (value === 'Illuminance') {
    return qudtQkNs('Illuminance')
  } else if (value === 'Irradiance') {
    return qudtQkNs('Irradiance')
  } else if (value === 'MassFlowRate') {
    return qudtQkNs('MassFlowRate')
  } else if (value === 'MassFraction') {
    return qudtQkNs('MassFraction')
  } else if (value === 'Power') {
    return qudtQkNs('Power')
  } else if (value === 'PowerFactor') {
    return qudtQkNs('PowerFactor')
  } else if (value === 'Pressure') {
    return qudtQkNs('Pressure')
  } else if (value === 'PressureDifference') {
    return qudtQkNs('Pressure')
  } else if (value === 'SpecificEnergy') {
    return qudtQkNs('SpecificEnergy')
  } else if (value === 'TemperatureDifference') {
    return qudtQkNs('TemperatureDifference')
  } else if (value === 'Time') {
    return qudtQkNs('Time')
  } else if (value === 'ThermodynamicTemperature') {
    return qudtQkNs('ThermodynamicTemperature')
  } else if (value === 'Velocity') {
    return qudtQkNs('Velocity')
  } else if (value === 'VolumeFlowRate') {
    return qudtQkNs('VolumeFlowRate')
  } else {
    logger.warn('Quantity kind ' + value + ' not allowed in CDL. ')
    return null
  }
}

function getCxfCore (cdlFolder, directory, prettyPrint = false) {
  if (directory === 'current') {
    directory = process.cwd()
  }
  const cxfFolder = ut.getOutputFile(cdlFolder, 'cxf', directory)
  // TODO: fix this
  let graphContext = {}
  const graph = { '@graph': [] }
  function parseDirectory (folder, graphContext, graph) {
    const filesAndFolders = fs.readdirSync(folder)
    filesAndFolders.forEach(fileAndFolder => {
      const newPath = path.join(folder, fileAndFolder)
      const stat = fs.statSync(newPath)
      if (stat && stat.isDirectory()) {
        parseDirectory(newPath, graphContext, graph)
      } else {
        const cxfGraph = JSON.parse(fs.readFileSync(newPath, 'utf-8'))
        graphContext = Object.assign(graphContext, cxfGraph['@context'] ? cxfGraph['@context'] : {})
        graph['@graph'] = graph['@graph'].concat(cxfGraph['@graph'] ? cxfGraph['@graph'] : [])
      }
    })
  }
  parseDirectory(cxfFolder, graphContext, graph)

  const s231ClassesPropertiesJson = getCxfClassesProperties()
  graphContext = Object.assign(graphContext, s231ClassesPropertiesJson['@context'] ? s231ClassesPropertiesJson['@context'] : {})
  graph['@graph'] = graph['@graph'].concat(s231ClassesPropertiesJson['@graph'] ? s231ClassesPropertiesJson['@graph'] : [])

  const cxfCoreJsonld = {
    '@context': graphContext,
    '@graph': graph['@graph']
  }
  const out = prettyPrint ? JSON.stringify(cxfCoreJsonld, null, 2) : JSON.stringify(cxfCoreJsonld)
  ut.writeFile(path.join(directory, 'cxf', 'CXF-Core.jsonld'), out)
}

function getCxfClassesProperties () {
  const uri = 'https://data.ashrae.org/s231.ttl'
  const body = fs.readFileSync(path.join('lib', 's231ClassesProperties.ttl'), 'utf-8')
  const mimeType = 'text/turtle'
  const s231ClassesProperties = rdflib.graph()

  try {
    rdflib.parse(body, s231ClassesProperties, uri, mimeType)
  } catch (err) {
    logger.error(err)
  }

  let s231ClassesPropertiesJson = null
  rdflib.serialize(null, s231ClassesProperties, uri, 'application/ld+json', (err, jsonldData) => {
    if (err) {
      throw err
    }
    s231ClassesPropertiesJson = JSON.parse(jsonldData)
  })
  return s231ClassesPropertiesJson
}

module.exports.getCxfGraph = getCxfGraph
module.exports.getCxfCore = getCxfCore
module.exports.parseModification = parseModification
