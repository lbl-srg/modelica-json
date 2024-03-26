const rdflib = require('rdflib')

function checkIfCdlElementaryBlock (name, newInstances) {
  if (name in newInstances) {
    return newInstances[name].isElementaryBlock
  }
  if (name !== undefined && name !== null && name.length > 0 && name.split('.').slice(-2, -1)[0] !== undefined && name.split('.').slice(-2, -1)[0].toUpperCase() === 'CDL') {
    return true
  }
  return false
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
    let isElementaryBlock = false
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
      if (checkIfCdlElementaryBlock(within, newInstances)) {
        isElementaryBlock = true
        if (generateCxfCore) {
          // TODO: handle cxf-core
          graph.add(s231Ns(blockName), rdfNs('type'), s231Ns('ElementaryBlock'))
          newInstanceDict.cxfNode = s231Ns(blockName)
          newInstanceDict.isElementaryBlock = true
          newInstanceDict.generateCxfCore = true
        } else {
          newInstanceDict.cxfNode = s231Ns(blockName)
          newInstanceDict.isElementaryBlock = true
          newInstanceDict.generateCxfCore = false
        }
      } else {
        // TODO: how to separate composite block v/s extension block
        graph.add(cxfPrefix(blockName), rdfNs('type'), s231Ns('Block'))
        newInstanceDict.cxfNode = cxfPrefix(blockName)
        newInstanceDict.isElementaryBlock = false
        newInstanceDict.generateCxfCore = false
      }
    } else if (instanceType === 'element') {
      const className = instanceDict.long_class_specifier_identifier === undefined ? blockName : instanceDict.long_class_specifier_identifier
      let instanceNode
      let prefix
      if (checkIfCdlElementaryBlock(className, newInstances)) {
        instanceNode = s231Ns(`${className}#${instance}`)
        isElementaryBlock = true
        newInstanceDict.isElementaryBlock = isElementaryBlock
        newInstanceDict.generateCxfCore = generateCxfCore
        prefix = 's231'
        newInstanceDict.prefix = prefix
      } else {
        instanceNode = cxfPrefix(`${className}#${instance}`)
        newInstanceDict.isElementaryBlock = false
        newInstanceDict.generateCxfCore = generateCxfCore
        prefix = 'seq'
        newInstanceDict.prefix = prefix
      }

      if ((isElementaryBlock && generateCxfCore) || !isElementaryBlock) {
        let blockNode
        if (prefix === 's231') {
          blockNode = s231Ns(`${className}`)
        } else {
          blockNode = cxfPrefix(`${className}`)
        }
        const typeSpecifier = instanceDict.type_specifier
        // TODO: handle vectors & array subscript expression
        //   const isVector = instanceDict.isVector
        // let arraySubscripts = instanceDict.arraySubscripts
        graph.add(instanceNode, s231Ns('label'), instance)

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
        if ('single_component_list' in instanceDict) {
          if ('description' in instanceDict.single_component_list) {
            if ('description_string' in instanceDict.single_component_list.description) {
              const descriptionString = instanceDict.single_component_list.description.description_string
              graph.add(instanceNode, s231Ns('description'), descriptionString)
            }
          }
          if ('declaration' in instanceDict.single_component_list) {
            if ('modification' in instanceDict.single_component_list.declaration) {
              const attributeList = ['start', 'nominal', 'fixed', 'instantiate', 'min', 'max', 'unit', 'quantity', 'value', 'displayUnit']
              const mod = instanceDict.single_component_list.declaration.modification
              const modDict = parseModification(mod, instance, attributeList, typeSpecifier)
              Object.keys(modDict).forEach(key => {
                if (attributeList.includes(key)) {
                  addAttributesToNode(graph, s231Ns, cxfPrefix, className, key, modDict, instanceNode)
                } else {
                  if (key.includes('.')) {
                    Object.keys(modDict[key]).forEach(key2 => {
                      if (prefix === 's231') {
                        addAttributesToNode(graph, s231Ns, cxfPrefix, className, key2, Object.assign({}, modDict[key]), s231Ns(`${className}#${key}`))
                      } else {
                        addAttributesToNode(graph, s231Ns, cxfPrefix, className, key2, Object.assign({}, modDict[key]), cxfPrefix(`${className}#${key}`))
                      }
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
                const graphicalObj = eleModRep.element_modification_or_replaceable.element_modification
                const graphicalObjStr = JSON.stringify(graphicalObj)
                graph.add(instanceNode, s231Ns('graphics'), graphicalObjStr)
              }
            }
          })
        }
      }
      newInstanceDict.cxfNode = instanceNode
    }
    newInstances[instance] = newInstanceDict
  })

  const connections = requiredReferences.connections
  if (connections !== undefined && connections !== null) {
    Object.keys(connections).forEach(fromElement => {
      const fromNode = getInstanceNode(fromElement, newInstances, s231Ns, cxfPrefix)

      const toElements = connections[fromElement]
      toElements.forEach(toElement => {
        console.log(toElement)
        const toNode = getInstanceNode(toElement, newInstances, s231Ns, cxfPrefix)
        console.log(toNode)
        if (fromNode !== null && toNode !== null) {
          graph.add(fromNode, s231Ns('isConnectedTo'), toNode)
        }
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

function getInstanceNode (element, newInstances, s231Ns, cxfPrefix) {
  let node = null
  // TODO: uncomment to translate flatten vectors [] to _
  // while (element.includes('[')) {
  //   let startIdx = element.indexOf('[')
  //   let endIdx = element.indexOf(']')
  //   let arraySubscript = element.slice(startIdx+1, endIdx)
  //   element = element.slice(0, startIdx) + '_' + arraySubscript + element.slice(endIdx+1)
  // }

  
  if (element.split('.').length > 1) {
    let instance = element.split('.').slice(0, 1)[0]
    while (!(instance in newInstances)) {
      instance = instance.split('.').slice(0, 1)[0]
    }
    if (instance in newInstances) {
      const instanceNode = newInstances[instance].cxfNode
      const className = instanceNode.value.split('#')[0].split(':').slice(-1)[0]
      const prefix = instanceNode.prefix
      if (prefix === 's231') {
        node = s231Ns(`${className}#${element}`)
      } else {
        node = cxfPrefix(`${className}#${element}`)
      }
    }
  } else {
    node = newInstances[element].cxfNode
  }
  return node
}

function addAttributesToNode (graph, s231Ns, cxfPrefix, className, key, modDict, instanceNode) {
  const qudt = rdflib.Namespace('http://qudt.org/schema/qudt#')
  if (key === 'value') {
    graph.add(instanceNode, s231Ns('value'), modDict.value)
  } else {
    if (key === 'final') {
      graph.add(instanceNode, s231Ns('isFinal'), true)
    }
    const value = modDict[key].value
    if (['start', 'nominal', 'fixed', 'instantiate', 'min', 'max'].includes(key)) {
      graph.add(instanceNode, s231Ns(key), value)
    } else if (key === 'unit') {
      // TODO: check qudt class name
      graph.add(instanceNode, qudt('hasUnit'), qudt(value))
    } else if (key === 'displayUnit') {
      // TODO: check qudt class name
      graph.add(instanceNode, qudt('hasDisplayUnit'), qudt(value))
    } else if (key === 'quantity') {
      // TODO: check qudt class name
      graph.add(instanceNode, qudt('hasQuantityKind'), qudt(value))
    }
  }
}

function parseModification (mod, instance, attributeList, typeSpecifier = '') {
  let res = {}
  if ('equal' in mod && mod.equal) {
    if ('simple_expression' in mod.expression) {
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
        if ('function_call' in value) {
          res.value = value.function_call.name + '('
          value.function_call.arguments.forEach(arg => {
            if ('name' in arg) {
              if (!res.value.endsWith('(')) {
                res.value += ', '
              }
              res.value += arg.name
            } else if ('expression' in arg) {
              if ('simple_expression' in arg.expression) {
                res.value += arg.expression.simple_expression
              }
            } else if ('for_loop' in arg) {
              const forLoop = arg.for_loop
              res.value += parseForLoop(forLoop)
            }
          })
          res.value += ')'
        }
      }
    } else if ('if_expression' in mod.expression) {
      // TODO: handle
      console.log('if expressions not well handled right now')
      res.value = JSON.stringify(mod.expression.if_expression)
    }
  }
  let res2
  if ('class_modification' in mod) {
    res2 = parseClassModification(mod.class_modification, instance, attributeList)
  }
  res = Object.assign({}, res, res2)
  return res
}

function parseClassModification (classMod, instance, attributeList) {
  const res = {}
  classMod.forEach(eleModRep => {
    if ('element_modification_or_replaceable' in eleModRep) {
      if ('element_modification' in eleModRep.element_modification_or_replaceable) {
        let eleModName = eleModRep.element_modification_or_replaceable.element_modification.name
        if (!attributeList.includes(eleModName)) {
          eleModName = instance + '.' + eleModName
        }
        let modDict
        if ('modification' in eleModRep.element_modification_or_replaceable.element_modification) {
          modDict = parseModification(eleModRep.element_modification_or_replaceable.element_modification.modification, instance, attributeList)
        }
        res[eleModName] = modDict
        if ('final' in eleModRep.element_modification_or_replaceable && eleModRep.element_modification_or_replaceable.final) {
          res[eleModName].final = true
        }
      }
    }
  })
  return res
}

function parseForLoop (forLoop) {
  // TODO
  if (forLoop === undefined || forLoop === null) {
    return ''
  } else {
    return JSON.stringify(forLoop)
  }
}

module.exports.getCxfGraph = getCxfGraph
