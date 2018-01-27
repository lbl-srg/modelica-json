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
    // logger.debug('Parsing ' + JSON.stringify(obj, null, 2))
    const fileName = ut.getModelicaFileName(obj)
    if (fileName) {
      mj.toJSON(fileName)
      .then(jsonContent => jq.simplifyModelicaJSON(jsonContent))
      .then(jsonSimp => newJsonData.push(jsonSimp))
      .catch(err => {
        logger.error(err)
        throw err
      })
    } else {
      logger.warn('Did not find Modelica file for class ' + obj + ' on MODELICAPATH. MODELICAPATH=' + process.env.MODELICAPATH)
    }
  })

  return newJsonData
}

/** Run the parser for the top-level `modelicaFile`,
  * and returns its JSON representation
  */
function getJSON (modelicaFile, outputFormat) {
  logger.debug('Entered parser.getJSON for ' + modelicaFile)

  return mj.toJSON(modelicaFile)
  .then(function (jsonContent) {
    if (outputFormat === 'json') { return jsonContent }

    var data = []
    if (outputFormat === 'json-simplified' || outputFormat === 'html') {
     //  logger.debug('jsonContent = ' + JSON.stringify(jsonContent, null, 2))
      const da = jq.simplifyModelicaJSON(jsonContent)
      data.push(da)

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
      return Promise.resolve(jq.orderConnections(data))
    } else {
      throw new Error('Wrong output format: ' + outputFormat)
    }
  })
  .catch(err => {
    logger.error(err)
    return Promise.reject(err)
  })
}

/** Export the JSON data and write to a file using
  * the format `outputFormat`
  */
function exportJSON (data, outputFileName, outputFormat) {
  if (outputFormat === 'html') {
    hw.write(outputFileName, data)
    return data
  } else if (outputFormat === 'json-simplified' || outputFormat === 'json') {
    const out = JSON.stringify(data, null, 2)
    return ut.writeFile(outputFileName, out)
  } else {
    throw new Error('Wrong output format')
  }
}

module.exports.exportJSON = exportJSON
module.exports.getJSON = getJSON
