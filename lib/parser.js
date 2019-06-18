const jq = require('../lib/jsonquery.js')
const hw = require('../lib/htmlWriter.js')
const mj = require('../lib/modelicaToJSON.js')
const ut = require('../lib/util.js')
const si = require('../lib/svgIcon.js')
const sd = require('../lib/svgDiagram.js')
const cheerio = require('cheerio')
var HtmlDocx = require('html-docx-js')
var fs = require('fs')
const fsc = require("fs-cheerio");

var logger = require('winston')

function getNewData (topLevelWithin, jsonData, data, declaringModelicaFileName, parseMode, loop) {
  // Search for the blocks used in the block jsonData
  // so that they can also be parsed
  var publicClasses = []
  var protectedClasses = []
  var extendsClasses = []
  for (var i = 0; i < jsonData.length; i++) {
    if (jsonData[i].public && jsonData[i].public.models) {
      publicClasses = publicClasses.concat(jsonData[i].public.models)
    }
    if (jsonData[i].protected && jsonData[i].protected.models) {
      protectedClasses = protectedClasses.concat(jsonData[i].protected.models)
    }
    if (jsonData[i].extends) {
      extendsClasses = extendsClasses.concat(jsonData[i].extends)
    }
  }
  // const allClasses = new Set(publicClasses.concat(protectedClasses))
  var allClasses = publicClasses.concat(protectedClasses).concat(extendsClasses)
  // iteratively remove duplicate elements in allClasses
  allClasses = allClasses.filter(function (item, pos) { return allClasses.indexOf(item) === pos })
  // Remove a class from allClasses if it already exists in data
  // Build array with all classes in data
  const allPreviousData = []
  data.forEach(function (dat) {
    allPreviousData.push(dat.topClassName)
  })

  // In allClasses, delete these classes that are already in allPreviousData,
  // and delete the CDL classes
  // Delete elementary CDL classes after 1st loop
  // allClasses = allClasses.filter(cla => !(jq.isElementaryCDL(cla.className) && loop > 0))
  allClasses = allClasses.filter(cla => !jq.isElementaryType(cla.className))
  // Delete 'RealInput', 'RealOutput', etc. in Interfaces.*Input/*Output
  allClasses = allClasses.filter(cla => cla.basePrefix === undefined)
  // Only keep if it is not already in allPreviousData
  allClasses = allClasses.filter(cla => !allPreviousData.includes(cla.className))

  var publicInputs = []
  var publicOutputs = []
  for (var j = 0; j < jsonData.length; j++) {
    if (jsonData[j].public && jsonData[j].public.inputs) {
      publicInputs = publicInputs.concat(jsonData[j].public.inputs)
    }
    if (jsonData[j].public && jsonData[j].public.outputs) {
      publicOutputs = publicOutputs.concat(jsonData[j].public.outputs)
    }
  }

  var allPublicInterfaces = publicInputs.concat(publicOutputs)
  // iteratively remove duplicate elements in allPublicInterfaces
  allPublicInterfaces = allPublicInterfaces.filter(function (item, pos) {
    return allPublicInterfaces.indexOf(item) === pos
  })
  // Update the instance of interface like "Interfaces." and "CDL.Interfaces."
  allPublicInterfaces.forEach(function (obj) {
    var className = obj.className
    if (className.startsWith('Interfaces.')) {
      className = className.replace('Interfaces.', 'Buildings.Controls.OBC.CDL.Interfaces.')
    } else if (className.startsWith('CDL.Interfaces.')) {
      className = className.replace('CDL.Interfaces.', 'Buildings.Controls.OBC.CDL.Interfaces.')
    }
    obj.className = className
  })
  // Remove a class from allPublicInterfaces if it already exists in data
  // Build array with all interfaces in data
  const allPreviousInterfaces = []
  data.forEach(function (dat) {
    allPreviousInterfaces.push(dat.topClassName)
  })
  // Only keep if it is not already in allPreviousInterfaces
  allPublicInterfaces = allPublicInterfaces.filter(cla => !allPreviousInterfaces.includes(cla.className))

  const MODELICAPATH = process.env.MODELICAPATH

  var getData = function (topLevelWithin, cla, declaringModelicaFileName, parseMode) {
    const within = topLevelWithin
    const fileName = ut.getModelicaFileName(within, cla.className, declaringModelicaFileName)

    // A class may instantiate another class more than once.
    // Moreover, it could instantiate it with different full names,
    // such as A.B or simply B (if we are in A).
    // However, these will be in the same modelica file. Hence, we check if
    // we parsed this file already.
    if (fileName) {
      const jsonContent = mj.toJSON(fileName, parseMode, MODELICAPATH)
      return jq.simplifyModelicaJSON(jsonContent, parseMode)
    } else { // fileName is undefined
      logger.warn('Did not find Modelica file for class ' +
        cla + ' on MODELICAPATH. MODELICAPATH=' + MODELICAPATH)
      return null
    }
  }

  var all = allClasses.concat(allPublicInterfaces)
  var newJsonData = all.map(cla => {
    // Note that getData may return null
    return getData(topLevelWithin, cla, declaringModelicaFileName, parseMode)
  }).filter(ele => ele !== null)
  // Some json data may be dublicate, for example if a model contains
  // two instances of the same block.
  var newJsonData2 = []
  var parsedClasses = []
  newJsonData.forEach(ele => {
    const newKey = ele.modelicaFile + ';' + ele.topClassName
    if (parsedClasses.length === 0) {
      newJsonData2.push(ele)
      // Include the model name in the key. While currently each model
      // is in its own file, this allows in the future to have more than
      // one model in a modelica file.
      parsedClasses.push(newKey)
    } else {
      if (parsedClasses.indexOf(newKey) === -1) {
        newJsonData2.push(ele)
        parsedClasses.push(newKey)
      }
    }
  })
  return newJsonData2
}

/** Run the parser for the top-level `moFiles`,
  * and returns the JSON representations
  *
  *@param moFiles Array of mo files to be parsed
  *@param parseMode Paring mode, 'cdl' or 'modelica'
  *@param outputFormat Output format, 'raw-json', 'json', 'html' or 'docx'
  *@return parsed json data array
  */
function getJSON (moFiles, parseMode, outputFormat) {
  var jsonData = []
  if (parseMode === 'modelica') {
    for (var i = 0; i < moFiles.length; i++) {
      jsonData.push(getJsons(moFiles[i], parseMode, outputFormat))
    }
  } else {
    jsonData = getJsons(moFiles[0], parseMode, outputFormat)
  }
  return jsonData
}

/** Run the parser for each `moFile`,
  * if `parseMode` is `modelica`, returns one single JSON representation of the `moFile`
  * if 'parseMode' is `cdl`, returns multiple JSON represetations of giving 'moFile' and
  * the instantiated classes
  *
  *@param moFile Single mo file to be parsed
  *@param parseMode Paring mode, 'cdl' or 'modelica'
  *@param outputFormat Output format, 'raw-json', 'json', 'html' or 'docx'
  *@return parsed json data array. It could be one-element array (parseMode = 'modelica'),
  *        or multiple-elements array (parseMode = 'cdl')
  */
function getJsons (moFile, parseMode, outputFormat) {
  logger.debug('Entered parser.getJSON for ' + moFile)
  const MODELICAPATH = process.env.MODELICAPATH

  const jsonContent = mj.toJSON(moFile, parseMode, MODELICAPATH)
  const topLevelWithin = jsonContent.within ? jsonContent.within[0] : null

  var data = []
  if (outputFormat === 'raw-json') {
    data.push(jsonContent)
    return data
  }

  if (outputFormat === 'json' || outputFormat === 'html' || outputFormat === 'docx') {
    const da = jq.simplifyModelicaJSON(jsonContent, parseMode)
    data.push(da)
    if (parseMode === 'cdl') {
      // Build array with the new files that need to be parsed.
      var newData = []
      var loop = 0
      newData[0] = data[0]
      while (true) {
        // if it's just short-class
        if (jsonContent.class_definition[0].class_specifier.short_class_specifier) {
          break
        }

        logger.log('Getting next data')
        // Only search on newData, but pass data as an argument
        // as getNewData need to check whether it has been parsed already
        newData = getNewData(topLevelWithin, newData, data, moFile, parseMode, loop)
        if (newData.length !== 0) {
          data = data.concat(newData)
        } else {
          // We received no new data that need to be parsed
          break
        }
        loop = loop + 1
      }
      // Include .svg for icon layers in all classes and interfaces, .svg for diagram layer
      // in parsing class
      si.addIconSVG(data)
      sd.addDiagramSVG(data)
    }
    // Order the input and output connectors.
    // This needs to be done on the whole data structure
    // return Promise.resolve(jq.orderConnections(data))
    return jq.orderConnections(data)
  } else {
    throw new Error('Wrong output format: ' + outputFormat)
  }
}

/** Export the JSON data and write to a file using
  * the format `outputFormat`
  *
  *@param data Json data set to be export
  *@param outputFileName Output file name array
  *@param outputFormat Output format, 'raw-json', 'json', 'html' or 'docx'
  *@param parseMode Paring mode, 'cdl' or 'modelica'
  */
async function exportJSON (data, outputFileName, outputFormat, parseMode) {
  if (outputFormat === 'html' || outputFormat === 'docx') {
    hw.write(outputFileName, data, parseMode)
    if (outputFormat === 'html') {
      return data
    } else if (outputFormat === 'docx') {
      var imgPathList = fs.readdirSync('./docx/img');
      FullimgPathList = imgPathList.map(function(e) {return 'docx/img/' + e});
      await ut.convertbase64(FullimgPathList)
      var valuesdict =  ut.valuestoreplace(FullimgPathList)
      outputFileName.forEach(function (element) {
        var input = element
        var docxoutput = element.replace('html', 'docx')
        var newhtml = element.replace('.html', '-docx.html')
        fs.readFile(input, 'utf-8', function (err, html) {
          if (err) throw err
          // Create a new html file that replaces img path with base64code
          var $ = cheerio.load(html.toString())
          $("img").each(function() {
            var old_src=$(this).attr("src");
            var new_src = valuesdict[old_src]
            $(this).attr("src", new_src);
            //var docx = HtmlDocx.asBlob($.html() )
            (async function(){

              await fsc.writeFile(newhtml, $);

            })();
          //  fs.writeFile(docxoutput, docx, function (err) {
            //  if (err) throw err
           //})
          })
        })
      })
      return data
    }
  } else if (outputFormat === 'json' || outputFormat === 'raw-json') {
    var out = []
    if (parseMode === 'cdl') {
      out = JSON.stringify(data, null, 2)
    } else {
      for (var i = 0; i < data.length; i++) {
        out.push(JSON.stringify(data[i], null, 2))
      }
    }
    return ut.writeFile(outputFileName, out, parseMode)
  } else {
    throw new Error('Wrong output format')
  }
}

module.exports.exportJSON = exportJSON
module.exports.getJSON = getJSON
