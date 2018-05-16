const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')

var logger = require('winston')

function writeFile (fileName, content) {
  fs.writeFileAsync(fileName, content).then(
    function (res) {
      logger.debug('Wrote ', fileName)
      return true
    }
  )
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
module.exports.writeFile = writeFile
module.exports.readJSON = readJSON
module.exports.getModelicaFileName = getModelicaFileName
module.exports.getMODELICAPATH = getMODELICAPATH
