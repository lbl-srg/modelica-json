const path = require('path')

const jq = require('../lib/jsonquery.js')
const hw = require('../lib/htmlWriter.js')
const mj = require('../lib/modelicaToJSON.js')
const ut = require('../lib/util.js')

var logger = require('winston')

function getNewData (jsonData, data) {
  // Search for the blocks used in the block so that they can also be parsed
  var publicClasses = []
  var protectedClasses = []
  for (var i = 0; i < jsonData.length; i++) {
    if (jsonData[i].public && jsonData[i].public.models) {
      publicClasses = publicClasses.concat(jsonData[i].public.models.map(a => a.className))
    }
    if (jsonData[i].protected && jsonData[i].protected.models) {
      protectedClasses = protectedClasses.concat(jsonData[i].protected.models.map(a => a.className))
    }
  }
  const allClasses = new Set(publicClasses.concat(protectedClasses))

  // Remove a class from allClasses if it already exists in data
  // Build array with all classes in data
  const allClaInData = []
  data.forEach(function (dat) {
    if (dat.public && dat.public.models) {
      allClaInData.push(dat.public.models.map(a => a.className))
    }
    if (dat.protected && dat.protected.models) {
      allClaInData.push(dat.protected.models.map(a => a.className))
    }
  })

  // In allClasses, delete these classes that are already in data,
  // and delete the CDL classes
  allClasses.forEach(function (cla) {
    if (allClaInData.indexOf(cla) > -1 || jq.isElementaryCDL(cla) || jq.isElementaryType()) {
      allClasses.delete(cla)
    }
  })

  const newJsonData = []
  allClasses.forEach(function (obj) {
    logger.debug('Parsing ' + JSON.stringify(obj, null, 2))
    const fileName = hw.getModelicaFileName(obj)
    if (fileName) {
      const jsonContent = mj.toJSON(fileName)
      const jsonSimp = jq.simplifyModelicaJSON(jsonContent)
      newJsonData.push(jsonSimp)
    } else {
      logger.warn('Did not find Modelica file for class ' + obj + ' on MODELICAPATH.')
    }
  })

  return newJsonData
}

/** Run the parser for the top-level `modelicaFile`,
  * and produce output in the format `outputFormat`
  */
function run (modelicaFile, outputFormat) {
  const idx = modelicaFile.lastIndexOf(path.sep)
  const outputFileBase = modelicaFile.slice(idx + 1, -3)
  console.log('aaaa ' + outputFileBase)
  var data = []
  const jsonContent = mj.toJSON(modelicaFile)
  if (outputFormat === 'json-simplified' || outputFormat === 'html') {
    data.push(jq.simplifyModelicaJSON(jsonContent))

    // Build array with the new files that need to be parsed.
    var newData = []
    newData[0] = data[0]
    while (true) {
      logger.log('Getting next data')
      // Only search on newData, but pass data as an argument
      // as getNewData need to check whether it has been parsed already
      newData = getNewData(newData, data)
      if (newData.length !== 0) {
        data = data.concat(newData)
      } else {
        // We received no new data that need to be parsed
        break
      }
    }
    // Order the input and output connectors.
    // This needs to be done on the whole data structure
    data = jq.orderConnections(data)

    if (outputFormat === 'html') {
      hw.write(outputFileBase + '.html', data)
    } else if (outputFormat === 'json-simplified') {
      ut.writeFile(outputFileBase + '-simplified.json', JSON.stringify(data, null, 2))
    }
  } else if (outputFormat === 'json') {
    ut.writeFile(outputFileBase + '.json', JSON.stringify(jsonContent, null, 2))
  }
}

module.exports.run = run
