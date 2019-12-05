'use strict'
const as = require('assert')
const mo = require('mocha')
const path = require('path')
const pa = require('../lib/parser')
const ht = require('../lib/htmlWriter')
const ut = require('../lib/util')
const js = require('../lib/jsonquery')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const glob = require('glob-promise')
var logger = require('winston')
var HtmlDocx = require('html-docx-js')
const cheerio = require('cheerio')

logger.configure({
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: 'tests.log' })
  ],
  handleExceptions: true,
  humanReadableUnhandledException: true
})
logger.cli()

logger.level = 'error'

/** Function to get all the Modelica files to be tested
  */
var getIntFiles = function (mode) {
  var pattern
  if (mode === 'cdl') {
    pattern = path.join(__dirname, 'FromModelica', '*.mo')
    return glob.sync(pattern)
  } else if (mode === 'modelica') {
    return path.join(__dirname, 'FromModelica')
  }
}

var checkwithinStatement = function (filelist) {
  var nowithin = []
  var within = []
  var iswithin = RegExp(/within/gm)
  var isemptywithin = RegExp(/within ;/gm)
  var ispackagemo = RegExp(/([\s\S]*?\/package\.mo)$/gm)
  for (var i = 0; i < filelist.length; i++) {
    var element = filelist[i]
    var file = fs.readFileSync(element).toString()
    var match1 = file.match(iswithin)
    var match2 = file.match(isemptywithin)
    var match3 = element.match(ispackagemo)
    if ((match1 === null | match2 !== null) && (match3 == null)) {
      nowithin.push(element)
    } else {
      within.push(element)
    }
  }
  return [nowithin, within]
}

/** Function that checks parsing from Modelica to JSON, in 'cdl' parsing mode
  */
var checkCdlJSON = function (outFormat, extension, message) {
  var mode = 'cdl'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files array to be tested.
    const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = testMoFilesTemp.filter(function (obj) {
      return !obj.includes('Extends')
    })
    // Name of subpackage to store json output files
    var subPackName = (outFormat === 'raw-json' ? 'raw-json' : 'json')
    // When parsing mode is 'cdl', the moFiles should feed into parser one-by-one
    var withinfiles = checkwithinStatement(testMoFiles)[1]
    var nowithinfiles = checkwithinStatement(testMoFiles)[0]
    withinfiles.map(fil => {
      // 'fil.split()' changes string 'fil' to be string array with single element
      // 'fil' is like '../test/FromModelica/***.mo'
      const jsonNewCDL = pa.getJSON(fil.split(), mode, outFormat)
      var idx = fil.lastIndexOf(path.sep)
      var packBase = fil.slice(0, idx)
      var tempName = packBase.split(path.sep)
      // Read the stored json representation from disk
      // It's like '../test/FromModelica/cdl/json/***.json'
      const oldFilCDL = path.join(packBase, mode, subPackName,
        tempName[tempName.length - 1] +
                                  '.' +
                                  fil.slice(idx + 1, -3) + extension)
      // Read the old json
      const jsonOldCDL = JSON.parse(fs.readFileSync(oldFilCDL, 'utf8'))

      const oldCDL = jsonOldCDL[0]
      const neCDL = jsonNewCDL[0]
      // Update the path to be relative to the project home.
      // This is needed for the regression tests to be portable.
      if (neCDL.modelicaFile) {
        neCDL['modelicaFile'] = neCDL['modelicaFile'].replace(path.join(__dirname, 'FromModelica'), '.')
      }
      const tempOld = JSON.stringify(oldCDL)
      const tempNew = JSON.stringify(neCDL)
      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFilCDL)
    })
    nowithinfiles.map(fil => {
      // 'fil.split()' changes string 'fil' to be string array with single element
      // 'fil' is like '../test/FromModelica/***.mo'
      const jsonNewCDL = pa.getJSON(fil.split(), mode, outFormat)
      var idx = fil.lastIndexOf(path.sep)
      var packBase = fil.slice(0, idx)
      var tempName = packBase.split(path.sep)
      // Read the stored json representation from disk
      // It's like '../test/FromModelica/cdl/json/***.json'
      const oldFilCDL = path.join(packBase, mode, subPackName,
        tempName[tempName.length - 1] +
                                  '.' +
                                  fil.slice(idx + 1, -3) + '-package' + extension)
      // Read the old json
      const jsonOldCDL = JSON.parse(fs.readFileSync(oldFilCDL, 'utf8'))

      const oldCDL = jsonOldCDL[0]
      const neCDL = jsonNewCDL[0]
      // Update the path to be relative to the project home.
      // This is needed for the regression tests to be portable.
      if (neCDL.modelicaFile) {
        neCDL['modelicaFile'] = neCDL['modelicaFile'].replace(path.join(__dirname, 'FromModelica'), '.')
      }
      const tempOld = JSON.stringify(oldCDL)
      const tempNew = JSON.stringify(neCDL)
      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFilCDL)
    })
  })
}

/** Function that checks parsing from Modelica to JSON, in 'modelica' parsing mode
  */
var checkModJSON = function (outFormat, extension, message) {
  var mode = 'modelica'
  // process.env.MODELICAPATH = __dirname
  mo.it(message, () => {
    // mo files package to be tested
    const testMoFilesTemp = getIntFiles(mode)
    // mo files array in the package
    const moFiles = glob.sync(path.join(testMoFilesTemp, '*.mo'))
    var withinfiles = checkwithinStatement(moFiles)[1]
    var nowithinfiles = checkwithinStatement(moFiles)[0]

    const testMoFiles = ut.getMoFiles(mode, testMoFilesTemp)
    // Name of subpackage to store json output files
    var subPackName = (outFormat === 'raw-json' ? 'raw-json' : 'json')
    // When parsing mode is 'modelica', the moFiles should feed into parser in package
    const jsonNewMOD = pa.getJSON(testMoFiles, mode, outFormat)

    for (var i = 0; i < withinfiles.length; i++) {
      var idx2 = withinfiles[i].lastIndexOf(path.sep)
      var packBase2 = withinfiles[i].slice(0, idx2)
      var tempName2 = packBase2.split(path.sep)
      const fileNameMOD = tempName2[tempName2.length - 1] +
                          '.' + withinfiles[i].slice(idx2 + 1, -3) + extension
      // Read the stored json representation from disk
      const oldFileMOD = path.join(packBase2, mode, subPackName, fileNameMOD)
      // Read the old json
      const jsonOldMOD = JSON.parse(fs.readFileSync(oldFileMOD, 'utf8'))
      // Find the corresponded new json file
      const neMODTemp = jsonNewMOD.filter(function (obj) {
        var fileNameBase = fileNameMOD.slice(0, -5)
        const temp = obj[0].modelicaFile.slice(0, -3).split(path.sep)
        const tempName = [temp[temp.length - 2], temp[temp.length - 1]].join('.')
        return tempName === fileNameBase
      })
      var neMOD = neMODTemp[0]
      if (neMOD[0].modelicaFile) {
        neMOD[0]['modelicaFile'] = neMOD[0]['modelicaFile'].replace(path.join(__dirname, 'FromModelica'), 'FromModelica')
      }
      const tempOld = JSON.stringify(jsonOldMOD)
      const tempNew = JSON.stringify(neMOD)
      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFileMOD)
    }
    for (var j = 0; j < nowithinfiles.length; j++) {
      var idx3 = nowithinfiles[j].lastIndexOf(path.sep)
      var packBase3 = nowithinfiles[j].slice(0, idx3)
      var tempName3 = packBase3.split(path.sep)
      const fileNameMOD = tempName3[tempName3.length - 1] +
                          '.' + nowithinfiles[j].slice(idx3 + 1, -3) + '-package' + extension
      // Read the stored json representation from disk
      const oldFileMOD = path.join(packBase3, mode, subPackName, fileNameMOD)
      // Read the old json
      const jsonOldMOD = JSON.parse(fs.readFileSync(oldFileMOD, 'utf8'))
      // Find the corresponded new json file
      const neMODTemp = jsonNewMOD.filter(function (obj) {
        var fileNameBase = fileNameMOD.slice(0, -13)
        const temp = obj[0].modelicaFile.slice(0, -3).split(path.sep)
        const tempName = [temp[temp.length - 2], temp[temp.length - 1]].join('.')
        return tempName === fileNameBase
      })
      let neMOD = neMODTemp[0]
      if (neMOD[0].modelicaFile) {
        neMOD[0]['modelicaFile'] = neMOD[0]['modelicaFile'].replace(path.join(__dirname, 'FromModelica'), 'FromModelica')
      }
      const tempOld = JSON.stringify(jsonOldMOD)
      const tempNew = JSON.stringify(neMOD)
      as.notEqual(tempOld, undefined, 'JSON is undefined')
      as.deepEqual(tempNew, tempOld, 'JSON result differs for ' + oldFileMOD)
    }
  })
}

/** Function that return html data array
  */
var getHtml = function (files, mode) {
  // If it is 'cdl' mode, the input 'files' will be a single file. With 'file.split()'.
  // the 'moFiles' will be an array with only one element in it.
  // If it is 'modelica' mode, the input 'files' will be a package name. With
  // 'getMoFiles', the 'moFiles' will be an array and the elements are the
  // mo files in the package.
  const moFiles = (mode === 'cdl') ? files.split()
    : ut.getMoFiles(mode, files)
  const json = pa.getJSON(moFiles, mode, 'html')
  const outFile = ut.getOutFile(mode, files, 'html', 'current', moFiles, json)
  var nonCDLJson = []
  if (mode === 'modelica') {
    json.forEach(function (ele) {
      if (ele[0].topClassName !== undefined && !js.isElementaryCDL(ele[0].topClassName)) {
        nonCDLJson.push(ele[0])
      }
    })
  } else {
    nonCDLJson = json.filter(ele => ele.topClassName !== undefined && !js.isElementaryCDL(ele.topClassName))
  }
  var basDir = outFile[0].substring(0, outFile[0].lastIndexOf('/'))
  var imgDir = path.join(basDir, 'img')
  // Copy the images
  const imgfiles = []
  nonCDLJson.forEach(function (dat) {
    const f = ht.getImageLocations(dat.info)
    f.forEach(function (obj) {
      imgfiles.push(obj)
    })
  })
  ht.copyImages(imgfiles, imgDir)
  const html = ht.getHtmlPage(outFile, imgDir, nonCDLJson, mode)
  return html
}

/** Function that return docx data array
    */
var getDocx = function (files, mode) {
  var docx
  // If it is 'cdl' mode, the input 'files' will be a single file. With 'file.split()'.
  // the 'moFiles' will be an array with only one element in it.
  // If it is 'modelica' mode, the input 'files' will be a package name. With
  // 'getMoFiles', the 'moFiles' will be an array and the elements are the
  // mo files in the package.
  if (mode === 'cdl') {
    const htmldoc = getHtml(files, mode)
    // const docxBlob = HtmlDocx.asBlob(htmldoc)
    const directory = './test/FromModelica/cdl'
    var imgpath = path.join(directory, 'docx/img')
    var imgPathList = fs.readdirSync(imgpath)
    var FullimgPathList = imgPathList.map(function (e) { return directory + '/docx/img/' + e })
    return ut.converttobase64(FullimgPathList, directory).then(function (valuesdict) {
      var dicttobase64 = ut.toObject(valuesdict)
      // Create  new html data that replaces img path with base64code
      var result = []
      var $ = cheerio.load(htmldoc.toString())
      $('img').each(function () {
        var oldSrc = $(this).attr('src')
        var newSrc = dicttobase64[oldSrc]
        $(this).attr('src', newSrc)
        // Converts new html to docx
        var docxBlob = HtmlDocx.asBlob($.html())
        const rawDocx = docxBlob.toString()
        const rawDocxText = rawDocx.replace(/<img[^>]+>/gm, '')
        const re = RegExp(/<body\b[^>]*>([\s\S]*?)<\/footer>/gm)
        docx = re.exec(rawDocxText)[1]
        result.push(docx)
      })
      return result
    })
  } else {
    const htmldoc = getHtml(files, mode)[0]
    const docxBlob = HtmlDocx.asBlob(htmldoc)
    const rawDocx = docxBlob.toString()
    const rawDocxText = rawDocx.replace(/<img[^>]+>/gm, '')
    const re = RegExp(/<body\b[^>]*>([\s\S]*?)<\/footer>/gm)
    docx = re.exec(rawDocxText)[1]
    return docx
  }
}

/** Function that check parsing from Modelica to html, in 'cdl' mode
  */
var compareCdlHtml = function () {
  var mode = 'cdl'
  // process.env.MODELICAPATH = __dirname
  mo.it('Testing html for equality', () => {
    // Array of mo files to be tested.
    const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = testMoFilesTemp.filter(function (obj) {
      return !obj.includes('Extends')
    })
    let withinfiles = checkwithinStatement(testMoFiles)[1]
    let nowithinfiles = checkwithinStatement(testMoFiles)[0]
    // When parsing mode is 'cdl', there will be one html for each mo file
    withinfiles.map(fil => {
      const htmlCDL = getHtml(fil, mode)
      // Get stored html files
      let idx = fil.lastIndexOf(path.sep)
      let packBase = fil.slice(0, idx)
      let tempNames = packBase.split(path.sep)
      const htmlFil = path.join(packBase, mode, 'html',
        tempNames[tempNames.length - 1] +
                                '.' + fil.slice(idx + 1, -3) + '.html')
      const oldHtml = fs.readFileSync(htmlFil, 'utf8')
      as.equal(htmlCDL, oldHtml, 'html representation differs for ' + htmlFil)
    })
    nowithinfiles.map(fil => {
      const htmlCDL = getHtml(fil, mode)
      // Get stored html files
      let idx = fil.lastIndexOf(path.sep)
      let packBase = fil.slice(0, idx)
      let tempNames = packBase.split(path.sep)
      const htmlFil = path.join(packBase, mode, 'html',
        tempNames[tempNames.length - 1] +
                                '.' + fil.slice(idx + 1, -3) + '-package.html')
      const oldHtml = fs.readFileSync(htmlFil, 'utf8')
      as.equal(htmlCDL, oldHtml, 'html representation differs for ' + htmlFil)
    })
    ut.deleteFolderRecursive(path.join(__dirname, 'FromModelica', 'html'))
    let projectfile = path.join(__dirname, '../')
    ut.deleteFolderRecursive(path.join(projectfile, 'html'))
  })
}

/** Function that check parsing from Modelica to docx, in 'cdl' mode
  */
var compareCdlDocx = function () {
  var mode = 'cdl'
  // process.env.MODELICAPATH = __dirname
  mo.it('Testing Docx for equality', (done) => {
    // Array of mo files to be tested.
    const testMoFilesTemp = getIntFiles(mode)
    const testMoFiles = testMoFilesTemp.filter(function (obj) {
      return !obj.includes('Extends')
    })
    // When parsing mode is 'cdl', there will be one Docx for each mo file
    var nowithinfiles = checkwithinStatement(testMoFiles)[0]
    var withinfiles = checkwithinStatement(testMoFiles)[1]
    var withinfilespromises = withinfiles.map(function (fil) {
      return getDocx(fil, mode).then(function (docxCDL) {
        // Get stored docx files
        var idx = fil.lastIndexOf(path.sep)
        var packBase = fil.slice(0, idx)
        var tempNames = packBase.split(path.sep)
        const docxFil = path.join(packBase, mode, 'docx',
          tempNames[tempNames.length - 1] +
                                  '.' + fil.slice(idx + 1, -3) + '.docx')
        const rawOldDocx = fs.readFileSync(docxFil, 'utf8')
        const rawOldDocxText = rawOldDocx.replace(/<img[^>]+>/gm, '')
        const re = RegExp(/<body\b[^>]*>([\s\S]*?)<\/footer>/gm)
        const oldDocx = re.exec(rawOldDocxText)[1]
        return [docxCDL[0], oldDocx, docxFil]
      })
    })
    Promise.all(withinfilespromises).then(function (results) {
      for (var i = 0; i < results.length; i++) {
        as.equal(results[i][0], results[i][1], 'Docxrepresentation differs for ' + results[i][2])
      }
    }).catch(function (err) {
      console.error('Handling Promise rejection', err)
    })
    var nowithinfilespromises = nowithinfiles.map(function (fil) {
      return getDocx(fil, mode).then(function (docxCDL) {
        // Get stored docx files
        var idx = fil.lastIndexOf(path.sep)
        var packBase = fil.slice(0, idx)
        var tempNames = packBase.split(path.sep)
        const docxFil = path.join(packBase, mode, 'docx',
          tempNames[tempNames.length - 1] +
                                    '.' + fil.slice(idx + 1, -3) + '-package.docx')
        const rawOldDocx = fs.readFileSync(docxFil, 'utf8')
        const rawOldDocxText = rawOldDocx.replace(/<img[^>]+>/gm, '')
        const re = RegExp(/<body\b[^>]*>([\s\S]*?)<\/footer>/gm)
        const oldDocx = re.exec(rawOldDocxText)[1]
        return [docxCDL[0], oldDocx, docxFil]
      })
    })
    Promise.all(nowithinfilespromises).then(function (results) {
      for (var i = 0; i < results.length; i++) {
        as.equal(results[i][0], results[i][1], 'Docxrepresentation differs for ' + results[i][2])
      }
      done()
    }).catch(function (err) {
      console.error('Handling Promise rejection', err)
    }).then(function () {
      ut.deleteFolderRecursive(path.join(__dirname, 'FromModelica', 'docx'))
      let projectfile = path.join(__dirname, '../')
      ut.deleteFolderRecursive(path.join(projectfile, 'html'))
    })
  })
}

/** Function that check parsing from Modelica to html, in 'modelica' mode
  */
var compareModHtml = function () {
  var mode = 'modelica'
  // process.env.MODELICAPATH = __dirname
  mo.it('Testing html for equality', () => {
    // mo files package to be tested
    const testMoFiles = getIntFiles(mode)
    const htmlMOD = getHtml(testMoFiles, mode)
    // Get stored html files
    const pattern = path.join(__dirname, 'FromModelica', 'modelica', 'html', '*.html')
    const oldHtmlMODPath = glob.sync(pattern)
    if (htmlMOD.length === oldHtmlMODPath.length) {
      for (var i = 0; i < oldHtmlMODPath.length; i++) {
        const oldHtmlMOD = fs.readFileSync(oldHtmlMODPath[i], 'utf8')
        as.equal(htmlMOD[i], oldHtmlMOD, 'html representation differs for ' + oldHtmlMODPath[i])
      }
    }
    ut.deleteFolderRecursive(path.join(__dirname, 'html'))
    let projectfile = path.join(__dirname, '../')
    ut.deleteFolderRecursive(path.join(projectfile, 'html'))
  })
}

/** Function that check parsing from Modelica to docx, in 'modelica' mode
*/
var compareModDocx = function () {
  var mode = 'modelica'
  // process.env.MODELICAPATH = __dirname
  mo.it('Testing docx for equality', () => {
    // mo files package to be tested
    const testMoFiles = getIntFiles(mode)
    const docxMOD = getDocx(testMoFiles, mode)
    // Get stored docx files
    const pattern = path.join(__dirname, 'FromModelica', 'modelica', 'docx', '*.docx')
    const oldDocxMODPath = glob.sync(pattern)
    const re = RegExp(/<body\b[^>]*>([\s\S]*?)<\/footer>/gm)
    if (docxMOD.length === oldDocxMODPath.length) {
      for (var i = 0; i < oldDocxMODPath.length; i++) {
        const rawOldDocxMOD = fs.readFileSync(oldDocxMODPath[i], 'utf8')
        const OldDocxMOD = re.exec(rawOldDocxMOD)[1]
        as.equal(docxMOD[i], OldDocxMOD, 'docx representation differs for ' + oldDocxMODPath[i])
      }
    }
    ut.deleteFolderRecursive(path.join(__dirname, 'docx'))
    let projectfile = path.join(__dirname, '../')
    ut.deleteFolderRecursive(path.join(projectfile, 'html'))
  })
}

mo.describe('parser.js', function () {
  mo.describe('Testing parse from Modelica to raw Json, in "cdl" parsing mode', function () {
    checkCdlJSON('raw-json', '.json', 'Testing unmodified json for equality, "cdl" mode')
  })
  mo.describe('Testing parse from Modelica to raw Json, in "modelica" parsing mode', function () {
    checkModJSON('raw-json', '.json', 'Testing unmodified json for equality, "modelica" mode')
  })
  mo.describe('Testing parse from Modelica to Json, in "cdl" parsing mode', function () {
    checkCdlJSON('json', '.json', 'Testing json for equality, "cdl" mode')
  })
  mo.describe('Testing parse from Modelica to Json, in "modelica" parsing mode', function () {
    checkModJSON('json', '.json', 'Testing json for equality, "modelica" mode')
  })
  mo.describe('Testing html generation from Modelica, in "cdl" parsing mode', compareCdlHtml)
  mo.describe('Testing html generation from Modelica, in "modelica" parsing mode', compareModHtml)
  mo.describe('Testing docx generation from Modelica, in "cdl" parsing mode', compareCdlDocx)
  mo.describe('Testing docx generation from Modelica, in "modelica" parsing mode', compareModDocx)
})
