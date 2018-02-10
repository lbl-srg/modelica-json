const jq = require('../lib/jsonquery.js')
const hw = require('../lib/htmlWriter.js')
const mj = require('../lib/modelicaToJSON.js')
const ut = require('../lib/util.js')

var logger = require('winston')

function getNewData (jsonData, data, declaringModelicaFileName) {
  // Search for the blocks used in the block jsonData
  // so that they can also be parsed
  var publicClasses = []
  var protectedClasses = []
  for (var i = 0; i < jsonData.length; i++) {
    if (jsonData[i].public && jsonData[i].public.models) {
      publicClasses = publicClasses.concat(jsonData[i].public.models)
    }
    if (jsonData[i].protected && jsonData[i].protected.models) {
      protectedClasses = protectedClasses.concat(jsonData[i].protected.models)
    }
  }
  // const allClasses = new Set(publicClasses.concat(protectedClasses))
  var allClasses = publicClasses.concat(protectedClasses)
  allClasses = allClasses.filter(function (item, pos) { return allClasses.indexOf(item) === pos })
  // Remove a class from allClasses if it already exists in data
  // Build array with all classes in data
  const allPreviousData = []
  data.forEach(function (dat) {
    if (dat.public && dat.public.models) {
      allPreviousData.push(dat.public.models)
    }
    if (dat.protected && dat.protected.models) {
      allPreviousData.push(dat.protected.models)
    }
  })

  // In allClasses, delete these classes that are already in allPreviousData,
  // and delete the CDL classes
  // Delete elementary CDL
  allClasses = allClasses.filter(cla => !jq.isElementaryCDL(cla.className))
  allClasses = allClasses.filter(cla => !jq.isElementaryType(cla.className))
  // Only keep if it is not already in allPreviousData
  allClasses = allClasses.filter(cla => allPreviousData.indexOf(cla) === -1)

  const parsedMoFiles = []
  const newJsonData = []
  allClasses.forEach(function (obj) {
    // console.log('**** checking file name for ' + JSON.stringify(obj))
    const fileName = ut.getModelicaFileName(obj.within, obj.className, declaringModelicaFileName)
    // A class may instantiate another class more than once.
    // Moreover, it could instantiate it with different full names,
    // such as A.B or simply B (if we are in A).
    // However, these will be in the same modelica file. Hence, we check if
    // we parsed this file already.
    if (parsedMoFiles.indexOf(fileName) === -1) {
      // This has not been parsed.
      if (fileName) {
        mj.toJSON(fileName)
        .then(jsonContent => jq.simplifyModelicaJSON(jsonContent))
        .then(jsonSimp => newJsonData.push(jsonSimp))
        .then(parsedMoFiles.push(fileName))
        .catch(err => {
          logger.error(err)
          throw err
        })
      } else {
        logger.warn('Did not find Modelica file for class ' + obj + ' on MODELICAPATH. MODELICAPATH=' + process.env.MODELICAPATH)
      }
    }
  })
  // console.log('**** newJsonData = ', JSON.stringify(newJsonData, null, 2))
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
      // logger.debug('jsonContent = ' + JSON.stringify(jsonContent, null, 2))
      const da = jq.simplifyModelicaJSON(jsonContent)
      // logger.debug('jsonContent = ' + JSON.stringify(da, null, 2))
      data.push(da)

      // Build array with the new files that need to be parsed.
      var newData = []
      newData[0] = data[0]
      while (true) {
        logger.log('Getting next data')
        // Only search on newData, but pass data as an argument
        // as getNewData need to check whether it has been parsed already
        newData = getNewData(newData, data, modelicaFile)
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
