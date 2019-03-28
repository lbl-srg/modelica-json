const Promise = require('bluebird')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')
var Ajv = require('ajv')

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
  const MOPA = getMODELICAPATH()
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
  for (var k = 0; k < MOPA.length; k++) {
    // Process the first element in the MODELICAPATH.
    // Search 'Buildings' and 'Buildings x' where x is any character.
    var dirs = (topLevel)
      ? glob.sync(path.join(MOPA[k], topLevel + '?( *)'))
      : [MOPA[k]]
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
  if (parseMode === 'modelica') {
    if (files.includes('.mo')) {
      throw new Error('Wrong file input, it should be a packagename.')
    }
    var fileList = getFiles(files)
    moFiles = fileList.filter(function (obj) {
      if (obj.endsWith('.mo')) { return true } else { return false }
    })
  } else {
    if (!files.includes('.mo')) {
      throw new Error('Wrong file input, it should be a single moFile.')
    }
    moFiles.push(files)
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
  * a folder named as 'json', 'simplified', or 'html' based on the output format.
  *
  *@param parseMode The parsing mode, 'cdl' or 'modelica'
  *@param files Input files, could be single mo file or a package name,
  *             depending on the parsing mode
  *@param outputFormat output file format, 'json', 'json-simplified', or 'html'
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

  // Create folder: '../json', '../simplified', or '../html'
  // save the files in current working folder
  dirCur = process.cwd()
  dirBase = (outputDir === 'current') ? dirCur : outputDir
  if (outputFormat === 'json') {
    dir = path.join(dirBase, 'json')
  } else if (outputFormat === 'json-simplified') {
    dir = path.join(dirBase, 'simplified')
  } else {
    dir = path.join(dirBase, 'html')
  }

  // Create an empty folder 'dir'
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

  // If parsing mode is 'cdl', there will be only one output file.
  var topClaNam
  var fileName
  if (parseMode === 'cdl') {
    var temp
    if (outputFormat === 'json') {
      fileName = getFileNameInJsonOutput(jsonDataSet[0])
      temp = path.join(dir, fileName)
    } else {
      topClaNam = jsonDataSet[0].topClassName
      if (jsonDataSet[0].modelicaFile.endsWith('package.mo')) {
        temp = (outputFormat === 'html')
          ? path.join(dir, topClaNam + '.package.html')
          : path.join(dir, topClaNam + '.package.json')
      } else {
        temp = (outputFormat === 'html')
          ? path.join(dir, topClaNam + '.html')
          : path.join(dir, topClaNam + '.json')
      }
    }
    outFile.push(temp)
  // If parsing mode is 'modelica', there will be one html file for each package,
  // one json file for each .mo file
  } else {
    if (outputFormat === 'html') {
      // Find out names of input package and sub-packages in it
      var tempPackName = []
      for (var i = 0; i < jsonDataSet.length; i++) {
        topClaNam = jsonDataSet[i][0].topClassName
        var idx2 = topClaNam.lastIndexOf('.')
        if (idx2 === -1) {
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
        if (outputFormat === 'json-simplified') {
          if (json.modelicaFile.endsWith('package.mo')) {
            fileName = json.topClassName + '.package.json'
          } else {
            fileName = json.topClassName + '.json'
          }
        } else if (outputFormat === 'json') {
          fileName = getFileNameInJsonOutput(json)
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
function jsonSchemaValidation (mode, userData, output = 'json-simplified') {
  if (output !== 'json-simplified') {
  } else {
    var ajv = new Ajv({ allErrors: true, schemaId: '$id' })
    var userSchema
    if (mode === 'cdl') {
      userSchema = 'schema-CDL.json'
    } else {
      userSchema = 'schema-modelica.json'
    }
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

module.exports.writeFile = writeFile
module.exports.readJSON = readJSON
module.exports.getModelicaFileName = getModelicaFileName
module.exports.getMODELICAPATH = getMODELICAPATH
module.exports.getMoFiles = getMoFiles
module.exports.getOutFile = getOutFile
module.exports.deleteFolderRecursive = deleteFolderRecursive
module.exports.createDir = createDir
module.exports.jsonSchemaValidate = jsonSchemaValidation
