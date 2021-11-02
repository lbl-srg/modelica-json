const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')
const Ajv = require('ajv')
const svgToImg = require('svg-to-img')
const base64Img = require('base64-img')
const pa = require('../lib/parser.js')

var logger = require('winston')

function writeFile (fileName, content, parseMode) {
  if (fileName.length === 1) {
    fs.writeFileAsync(fileName[0], content).then(
      function (res) {
        logger.debug('Wrote ', fileName[0])
        return true
      })
  } else {
    for (var i = 0; i < fileName.length; i++) {
      fs.writeFileAsync(fileName[i], content[i]).then(
        function (res) {
          logger.debug('Wrote ', fileName[i])
          return true
        })
    }
  }
}

/** Get the JSON data structure of the JSON file.
  *
  *@param jsonFile Name of the JSON file.
  *@return The JSON representation of the JSON file.
  */
function readJSON (jsonFile) {
  logger.debug('Entered getJSON for ', jsonFile)
  const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
  return Promise.resolve(json)
}

/** Return the MODELICAPATH, with the current directory being the first
  *  element. Elements are separated by ':'
  */
function getMODELICAPATH () {
  return (process.env.MODELICAPATH)
    ? (process.cwd() + ':' + process.env.MODELICAPATH).split(':')
    : [process.cwd()]
}

/** Return a string that points to the .mo file that contains
  * the class `className`. This function searches in the
  * current directory.
  * If the file is not found, it returns 'null'.
  *
  *@param within The withing clause.
  *@param className The class name that is used to instantiate the class (may be
  *                  a short or long class name)
  *@param declaringModelicaFileName The full path of the Modelica file that instantiates
  *                  a model of class `className`
  *@return The name of the model file that implements `className`, or `null` if not found.
  */
function getModelicaFileNameInCurrentLibrary (within, className, declaringModelicaFileName) {
  const declaringModelicaPath = path.dirname(declaringModelicaFileName)
  // For A.B, this is A/B.mo. For A, this is A.mo
  const patForClaNam = className.replace(/\./g, path.sep) + '.mo'
  if (within.length === 0) {
    // Top level class without a within.
    return fse.existsSync(patForClaNam) ? patForClaNam : null
  }
  // Walk up the directory until the directory has a subdirectory that is the full within clause
  const withinLength = within.split('.').length + 1
  const decModLength = declaringModelicaPath.split(path.sep).length + 1

  for (var i = 0; i < withinLength; i++) {
    var searchDir = declaringModelicaPath
      .split(path.sep)
      .slice(0, decModLength - i - 1)
      .join(path.sep)
    var fullName = path.join(searchDir, patForClaNam)

    if (fse.existsSync(fullName)) return fullName
  }
  // We did not find the class
  return null
}
/** Return a string that points to the .mo file that contains
  * the class `className`. This function searches in the
  * current directory and on the MODELICAPATH.
  * If the file is not found, it returns 'null'.
  *
  *@param within The withing clause.
  *@param className The class name that is used to instantiate the class (may be
  *                  a short or long class name)
  *@param declaringModelicaFileName The full path of the Modelica file that instantiates
  *                  a model of class `className`
  *@return The name of the model file that implements `className`, or `null` if not found.
  */
function getModelicaFileName (within, className, declaringModelicaFileName) {
  // First, look up in the current library.
  // Path where the file is that instantiates a model with class = className
  var retVal = getModelicaFileNameInCurrentLibrary(within, className, declaringModelicaFileName)
  if (retVal) return retVal

  // Did not find the name. Search on the MODELICAPATH
  const MODELICAPATH = getMODELICAPATH()
  // Search on the MODELICAPATH
  // Note that 'file:///Buildings/Resources' may be in the
  // directory 'file:///Buildings 5.0.1/Resources'
  // rather than only in Buildings
  var topLevel = className.substring(0, className.indexOf('.'))

  // When className is partial, it searches class in the potential paths joined
  // with within and className.
  // Note that within could be "A.B.C", and className could be "D.E". The potential
  // paths could be "A.B.C.D.E", "A.B.D.E", "A.D.E"
  var classNameWithoutTopLevel = []
  var fileName = []
  if (topLevel !== 'Buildings') {
    var splitWithin = within.split('.')
    var splitClassName = className.split('.')
    for (var i = splitWithin.length - 1; i > 0; i--) {
      var temp = splitWithin
      temp.splice(i + 1)
      Array.prototype.push.apply(temp, splitClassName)
      var temp2 = temp.join('.')
      var temp3 = temp2.substring(temp2.indexOf('.') + 1)
      classNameWithoutTopLevel.push(temp3)
      fileName.push(temp3.replace(/\./g, '/') + '.mo')
    }
    topLevel = 'Buildings'
  } else {
    var temp4 = className.substring(className.indexOf('.') + 1)
    fileName.push(temp4.replace(/\./g, '/') + '.mo')
  }
  for (var k = 0; k < MODELICAPATH.length; k++) {
    // Process the first element in the MODELICAPATH.
    // Search 'Buildings' and 'Buildings x' where x is any character.
    var dirs = (topLevel)
      ? glob.sync(path.join(MODELICAPATH[k], topLevel + '?( *)'))
      : [MODELICAPATH[k]]
    for (var d = 0; d < dirs.length; d++) {
      for (var j = 0; j < fileName.length; j++) {
        if (fse.existsSync(path.join(dirs[d], fileName[j]))) {
          return path.join(dirs[d], fileName[j])
        }
      }
    }
  }
  return null
}

/** Get input mo file array.
  * If the parsing mode is 'cdl', the array will have only one element which
  * is the giving input 'files'.
  * If the parsing mode is 'modelica', the array will include all mo files in
  * the giving package 'files' and its sub-packages.
  *
  *@param parseMode The parsing mode, 'cdl' or 'modelica'
  *@param files Input files, could be single mo file or a package name
  *@return mo files array
  */
function getMoFiles (parseMode, files) {
  var moFiles = []
  const MODELICAPATH = getMODELICAPATH()
  if (parseMode === 'modelica') {
    if (files.includes('.mo')) {
      throw new Error('Wrong file input, it should be a packagename.')
    }
    var tempFolder = files
    if (!fse.existsSync(tempFolder)) {
      for (var i = 0; i < MODELICAPATH.length; i++) {
        tempFolder = path.join(MODELICAPATH[i], files)
        if (fse.existsSync(tempFolder)) break
      }
    }
    if (!fse.existsSync(tempFolder)) {
      moFiles.push(files)
    } else {
      var fileList = getFiles(tempFolder)
      moFiles = fileList.filter(function (obj) {
        if (obj.endsWith('.mo')) { return true } else { return false }
      })
    }
  } else {
    if (!files.includes('.mo')) {
      throw new Error('Wrong file input, it should be a single moFile.')
    }
    if (fse.existsSync(files)) {
      moFiles.push(files)
    } else {
      var tempPath
      for (var j = 0; j < MODELICAPATH.length; j++) {
        tempPath = path.join(MODELICAPATH[j], files)
        if (fse.existsSync(tempPath)) {
          moFiles.push(tempPath)
          break
        }
      }
      if (!fse.existsSync(tempPath)) {
        moFiles.push(files)
      }
    }
  }
  return moFiles
}

/** Get the JSON property `p` from the json data `o`
  * If the property does not exist, the function returns null
  */
const getProperty = (p, o) =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o)

/** Get the output file name array. In folder as the input files, it will create
  * a folder named as 'raw-json', 'json', 'html' or 'docx' based on the output format.
  *
  *@param parseMode The parsing mode, 'cdl' or 'modelica'
  *@param files Input files, could be single mo file or a package name,
  *             depending on the parsing mode
  *@param outputFormat output file format, 'raw-json', 'json', 'html' or 'docx'
  *@param outputDir output directory
  *@param moFiles mo files array
  *@param jsonDataSet json output data
  *@return Output file names array
  */
function getOutFile (parseMode, files, outputFormat, outputDir, moFiles, jsonDataSet) {
  var outFile = []
  var dirCur
  var dirBase
  var dir

  // Create folder: '../raw-json', '../json', '../html' or '../docx'
  // save the files in current working folder
  dirCur = process.cwd()
  dirBase = (outputDir === 'current') ? dirCur : outputDir
  if (outputFormat === 'raw-json') {
    dir = path.join(dirBase, 'raw-json')
  } else if (outputFormat === 'json') {
    dir = path.join(dirBase, 'json')
  } else if (outputFormat === 'html') {
    dir = path.join(dirBase, 'html')
  } else if (outputFormat === 'svg') {
    dir = path.join(dirBase, 'svg')
  } else {
    dir = path.join(dirBase, 'docx')
  }

  // Create an empty folder 'dir'
  createDir(dir)

  // If parsing mode is 'cdl', there will be only one output file.
  var topClaNam
  var newTopClaNam
  var fileName
  if (parseMode === 'cdl') {
    var temp
    if (outputFormat === 'raw-json') {
      if (jsonDataSet[0].within === undefined) {
        // If the modelica file has no 'within' statement, it means it is a top package.
        // The name of the output file will be the name of the mo file + '-package.<ext>'
        // If the name of the modelica file is already 'package.mo' then call it package.<ext>
        var moName = /[^/]*$/.exec(jsonDataSet[0].modelicaFile)[0].split('.')[0]
        topClaNam = (jsonDataSet[0].modelicaFile).split('/')[(jsonDataSet[0].modelicaFile).split('/').length - 2]
        if (topClaNam === '.') {
          newTopClaNam = dirCur.split('/')[dirCur.split('/').length - 1]
        } else {
          newTopClaNam = topClaNam
        }
        if (moName === 'package') {
          temp = path.join(dir, newTopClaNam + '.' + moName + '.json')
        } else {
          temp = path.join(dir, newTopClaNam + '.' + moName + '-package.json')
        }
      } else {
        fileName = getFileNameInJsonOutput(jsonDataSet[0])
        temp = path.join(dir, fileName)
      }
    } else {
      topClaNam = jsonDataSet[0].topClassName
      if (jsonDataSet[0].within === '') {
        // If the modelica file has no 'within' statement, it means it is a top package.
        // The name of the output file will be the name of the mo file + '-package.<ext>'
        // If the name of the modelica file is already 'package.mo' then call it package.<ext>
        moName = /[^/]*$/.exec(jsonDataSet[0].modelicaFile)[0].split('.')[0]
        if (jsonDataSet[0].modelicaFile.endsWith('package.mo')) {
          temp = (outputFormat === 'html' | outputFormat === 'docx')
            ? path.join(dir, topClaNam + '.package.html')
            : (outputFormat === 'svg'
               ? path.join(dir, topClaNam + '.package.svg')
               : path.join(dir, topClaNam + '.package.json'))
        } else {
          temp = (outputFormat === 'html' | outputFormat === 'docx')
            ? path.join(dir, topClaNam + '.' + moName + '-package.html')
            : (outputFormat === 'svg'
               ? path.join(dir, topClaNam + '.' + moName + '-package.svg')
               : path.join(dir, topClaNam + '.' + moName + '-package.json'))
        }
      } else {
        temp = (outputFormat === 'html' | outputFormat === 'docx')
          ? path.join(dir, topClaNam + '.html')
          : (outputFormat === 'svg'
             ? path.join(dir, topClaNam + '.svg')
             : path.join(dir, topClaNam + '.json'))
      }
    }
    outFile.push(temp)
  // If parsing mode is 'modelica', there will be one html file for each package,
  // one json file for each .mo file
  } else {
    if (outputFormat === 'html' || outputFormat === 'docx') {
      // Find out names of input package and sub-packages in it
      var tempPackName = []
      for (var i = 0; i < jsonDataSet.length; i++) {
        topClaNam = jsonDataSet[i][0].topClassName
        var idx2 = topClaNam.lastIndexOf('.')
        if (idx2 === -1 || jsonDataSet[i][0].modelicaFile.endsWith('package.mo')) {
          tempPackName.push(topClaNam)
        } else {
          tempPackName.push(topClaNam.slice(0, idx2))
        }
      }
      // Clean up to find the unique names
      var packName = tempPackName.filter(function (item, pos) {
        return tempPackName.indexOf(item) === pos
      })
      // Create one single html file for each package
      for (var j = 0; j < packName.length; j++) {
        outFile.push(path.join(dir, packName[j] + '.html'))
      }
    } else {
      for (var k = 0; k < jsonDataSet.length; k++) {
        // Retrieve Json data
        var json = jsonDataSet[k][0]
        if (outputFormat === 'json') {
          if (json.within === '') {
            moName = /[^/]*$/.exec(json.modelicaFile)[0].split('.')[0]
            if (json.modelicaFile.endsWith('package.mo')) {
              fileName = json.topClassName + '.package.json'
            } else {
              fileName = json.topClassName + '.' + moName + '-package.json'
            }
          } else {
            fileName = json.topClassName + '.json'
          }
        } else if (outputFormat === 'raw-json') {
          if (json.within === undefined) {
            // If the modelica file has no 'within' statement, it means it is a top package.
            // The name of the output file will be the name of the mo file + '-package.<ext>'
            // If the name of the modelica file is already 'package.mo' then call it package.<ext>
            moName = /[^/]*$/.exec(json.modelicaFile)[0].split('.')[0]
            topClaNam = json.modelicaFile.split('/')[(json.modelicaFile).split('/').length - 2]
            if (moName === 'package') {
              fileName = topClaNam + '.' + moName + '.json'
            } else {
              fileName = topClaNam + '.' + moName + '-package.json'
            }
          } else {
            fileName = getFileNameInJsonOutput(json)
          }
        }
        outFile.push(path.join(dir, fileName))
      }
    }
  }
  return outFile
}

// Get output file name when the output format is detailed Json
function getFileNameInJsonOutput (json) {
  var className
  var fileName
  // First, check if there is a 'within xxxx;'
  var within = getProperty(['within', 0], json)
  // Get the model name
  var shortClass = getProperty(
    ['class_definition', 0, 'class_specifier', 'short_class_specifier', 'className'], json)
  var shortName = shortClass !== null ? shortClass
    : getProperty(
      ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'name'], json)
  if (shortName) {
    className = (within) ? within + '.' + shortName : shortName
  }
  if (json.modelicaFile.endsWith('package.mo')) {
    fileName = className + '.package.json'
  } else {
    fileName = className + '.json'
  }

  return fileName
}

/** Recursively remove existing folder
  */
function deleteFolderRecursive (dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function (file, index) {
      var curPath = path.join(dir, file)
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dir)
  }
}

// Get all files list in folder dir
function getFiles (dir, fileList) {
  fileList = fileList || []
  var files = fs.readdirSync(dir)
  for (var i in files) {
    if (!files.hasOwnProperty(i)) continue
    var name = dir + path.sep + files[i]
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList)
    } else {
      fileList.push(name)
    }
  }
  return fileList
}

// Validation of a json file against a schema
function jsonSchemaValidation (mode, userData, output = 'json', userSchema) {
  if (output !== 'json') {
  } else {
    var ajv = new Ajv({ allErrors: true, schemaId: '$id' })
    var schema = JSON.parse(fs.readFileSync(userSchema, 'utf8'))
    var data = JSON.parse(fs.readFileSync(userData, 'utf8'))
    var valid = ajv.validate(schema, data)
    if (valid) {
      console.log('Json file is valid')
      return valid
    } else {
      console.log('Json file not valid, see errors below')
      console.log(ajv.errorsText())
    }
  }
}

// Create a folder if it doesn't exist.
function createDir (dir) {
  if (!fs.existsSync(dir)) {
    try {
      dir
        .split(path.sep)
        .reduce((currentPath, folder) => {
          currentPath += folder + path.sep
          if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath)
          }
          return currentPath
        }, '')
    } catch (err) {
      console.log(err)
    }
  }
}

// Transforms an array into an object. The keys are the even index and values the odd ones.
function toObject (arr) {
  var rv = {}
  for (var j = 0; j < arr.length - 1; j += 2) { rv[arr[j]] = arr[j + 1] }
  return rv
}

// Converts an svg file to a base64png.
function convertsvg (svgfile) {
  var image = svgToImg.from(svgfile).toPng({
    encoding: 'base64' })
  return Promise.resolve(image)
}

// Creates a base64 png usable in a html file.
async function fullconvertedsvg (svgfilepath) {
  var svgfile = await fs.readFileAsync(svgfilepath, 'utf8')
  try {
    var convertedsvg = await convertsvg(svgfile)
  } catch (e) {
    logger.warn(svgfilepath + ' is malformed and cannot be converted to png for docx')
    pa.warnCounter = pa.warnCounter + 1
  }
  var base64graphicsvg = 'data:image/png;base64,' + convertedsvg
  return base64graphicsvg
}

// Add the pngbase64 conversion of each image into an array of image paths
function converttobase64 (listofimg, directory) {
  var result = []
  for (var i = 0; i < listofimg.length; i++) {
    var element = listofimg[i]
    if (directory === 'current') {
      var lenDir = 0
    } else {
      lenDir = directory.length + 1
    }
    var srcelement = element.substring(5 + lenDir)
    result.push(srcelement)
    var format = element.substr(element.length - 3)
    if (format === 'svg') {
      var base64graphicsvg = fullconvertedsvg(element)
      result.push(base64graphicsvg)
    }
    if (format === 'png') {
      var base64graphicpng = base64Img.base64Sync(element)
      result.push(base64graphicpng)
    }
  }
  return Promise.all(result)
}

module.exports.writeFile = writeFile
module.exports.readJSON = readJSON
module.exports.getModelicaFileName = getModelicaFileName
module.exports.getMODELICAPATH = getMODELICAPATH
module.exports.getMoFiles = getMoFiles
module.exports.getOutFile = getOutFile
module.exports.deleteFolderRecursive = deleteFolderRecursive
module.exports.createDir = createDir
module.exports.jsonSchemaValidate = jsonSchemaValidation
module.exports.toObject = toObject
module.exports.converttobase64 = converttobase64
