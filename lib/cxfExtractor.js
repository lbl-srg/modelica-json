const rdflib = require('rdflib')
const path = require('path')
const fs = require('fs')
const ut = require('./util.js')

function checkIfCdlElementaryBlock (name) {
  if (name !== undefined && name !== null && name.length > 0 && (name.split('.').includes('CDL') || (name.split('.').includes('cdl')))) {
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
      if (checkIfCdlElementaryBlock(within)) {
        isElementaryBlock = true
      }
      let blockTypeNode

      // TODO: check if package
      if (isElementaryBlock) {
        // blockName = 'CDL' + blockNameWithPackage.split('CDL')[1]
        instanceNode = s231Ns(blockNameWithPackage)
        blockTypeNode = s231Ns('ElementaryBlock')
      } else {
        instanceNode = cxfPrefix(blockNameWithPackage)
        blockTypeNode = s231Ns('Block')
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
      newInstanceDict.cxfNode = instanceNode
    } else if (instanceType === 'short_class_specifier') {
      // TODO: handle later
    } else if (instanceType === 'enumeration_class') {
      if (checkIfCdlElementaryBlock(within)) {
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
          } else if (typeSpecifier.split('.').length > 0 && checkIfCdlElementaryBlock(typeSpecifier)) {
            // is it elementary block
            graph.add(blockNode, s231Ns('containsBlock'), instanceNode)
            graph.add(instanceNode, rdfNs('type'), s231Ns(typeSpecifier))
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
                  addAttributesToNode(graph, s231Ns, key, modDict, instanceNode)
                } else {
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

  if (!isElementaryBlock) {
    const connections = requiredReferences.connections
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
  const qudt = rdflib.Namespace('http://qudt.org/schema/qudt#')
  const unit = rdflib.Namespace('http://qudt.org/vocab/unit#')
  const qudtqk = rdflib.Namespace('http://qudt.org/vocab/quantitykind#')

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
      graph.add(instanceNode, qudt('hasUnit'), getQudtUnit(value, unit, s231Ns))
    } else if (key === 'displayUnit') {
      // TODO: check qudt class name
      graph.add(instanceNode, qudt('hasDisplayUnit'), getQudtUnit(value, unit, s231Ns))
    } else if (key === 'quantity') {
      // TODO: check qudt class name
      graph.add(instanceNode, qudt('hasQuantityKind'), getQudtQuanityKind(value, qudtqk, s231Ns))
    }
  }
}

function parseModification (mod, instance, attributeList, typeSpecifier = '') {
  let res = {}
  if (mod !== undefined && 'equal' in mod && mod.equal) {
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
        if ('function_call' in value && value.function_call !== undefined) {
          if ('name' in value.function_call && value.function_call.name !== undefined) {
            res.value = value.function_call.name + '('
          }

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
  }
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

function getQudtUnit (value, unitNs, s231Ns) {
  // TODO: finish this
  if (value === 'degK') {
    return unitNs('K')
  } else if (value === 'degC') {
    return unitNs('DEG_C')
  } else if (value === 'degF') {
    return unitNs('DEG_F')
  } else {
    return s231Ns(value)
  }
}

function getQudtQuanityKind (value, qudtQkNs, s231Ns) {
  // TODO: finish this
  return s231Ns(value)
}

function getCxfCore (moFiles, directory, prettyPrint = false) {
  if (directory === 'current') {
    directory = process.cwd()
  }
  console.log(moFiles[0], ut.getOutputFile(moFiles[0], 'cxf', directory))
  const cxfFolder = path.join(directory, 'cxf', cdlFolder)
////// TODO: fix this
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
  parseDirectory(moFiles, graphContext, graph)

  const s231ClassesPropertiesJson = getCxfClassesProperties()
  graphContext = Object.assign(graphContext, s231ClassesPropertiesJson['@context'] ? s231ClassesPropertiesJson['@context'] : {})
  graph['@graph'] = graph['@graph'].concat(s231ClassesPropertiesJson['@graph'] ? s231ClassesPropertiesJson['@graph'] : [])

  const cxfCoreJsonld = {
    '@context': graphContext,
    '@graph': graph['@graph']
  }
  const out = (prettyPrint) ? JSON.stringify(cxfCoreJsonld, null, 2) : JSON.stringify(cxfCoreJsonld)
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
    console.log(err)
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
