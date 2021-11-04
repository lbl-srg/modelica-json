const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const os = require('os')
const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')
const Ajv = require('ajv')
const svgToImg = require('svg-to-img')
const base64Img = require('base64-img')
const pa = require('../lib/parser.js')

var logger = require('winston')

/** Return the MODELICAPATH, with the current directory being the first
  *  element. Elements are separated by ':'
  */
function getMODELICAPATH () {
  return (process.env.MODELICAPATH)
    ? (process.cwd() + ':' + process.env.MODELICAPATH).split(':')
    : [process.cwd()]
}

/** Create temp directory to host the simplified json output before adding svg contents
  */
function createTempDir (outputFormat) {
  var tmpDir
  try {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), outputFormat))
  }
  catch(e) {
    console.error(`An error has occurred while creating the temp folder. Error: ${e}`)
  }
  return tmpDir
}

/** Remove temp directory that hosting the simplified json output
  */
// function removeTempDir (tmpDir) {
//   try {
//     if (tmpDir) {
//       fs.rmSync(tmpDir, { recursive: true, force: true })
//     }
//   }
//   catch (e) {
//     console.error(`An error has occurred while removing the temp folder at ${tmpDir}. Please remove it manually. Error: ${e}`)
//   }
// }


function removeDir (directoryPath) {
  try {
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file, index) => {
        const curPath = path.join(directoryPath, file)
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          removeDir(curPath)
        } else {
          // delete file
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(directoryPath);
    }
  }
  catch (e) {
    console.error(`An error has occurred while removing the temp folder at ${directoryPath}. Please remove it manually. Error: ${e}`)
  }
}



/** Get input mo file array.
  * If the parsing mode is 'cdl', the array will have only one element which
  * is the giving input 'files'.
  * If the parsing mode is 'modelica', the array will include all mo files in
  * the giving package 'files' and its sub-packages.
  *
  *@param files Input files, could be single mo file or a package name
  *@return mo files array
  */
 function getMoFiles (files) {
  var moFiles = []
  const MODELICAPATH = getMODELICAPATH()
  if (files.endsWith('.mo')) {
    // it is a single mo file
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
  } else {
    // it is a package of mo files
    var tempFolder = files
    if (!fse.existsSync(tempFolder)) {
      for (var i = 0; i < MODELICAPATH.length; i++) {
        tempFolder = path.join(MODELICAPATH[i], files)
        if (fse.existsSync(tempFolder)) break
      }
    }
    if (!fse.existsSync(tempFolder)) {
      // the package is not on the MODELICAPATH, so it is a user specified package
      tempFolder = files
    }
    var fileList = getFiles(tempFolder)
    moFiles = fileList.filter(function (obj) {
      return obj.endsWith('.mo')
    })
  }
  return moFiles
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

// Get the output file path
function getOutputFile (simJson, outputFormat, dir) {
  // get the modelica file path from the Json output, it is relative path
  var moFile = simJson.modelicaFile
  var outFile
  if (outputFormat === 'json' || outputFormat === 'raw-json') {
    outFile = moFile.replace('.mo', '.json')
  } else if (outputFormat === 'html') {
    outFile = moFile.replace('.mo', '.html')
  } else if (outputFormat === 'docx') {
    outFile = moFile.replace('.mo', '.docx')
  }
  return path.join(dir, outputFormat, outFile)
}

// Get the full file path of the instantiated classes
function searchPath (claLis, within) {
  const MODELICAPATH = getMODELICAPATH()
  const pathSep = path.sep
  const filePath = []
  for (var i = 0; i < claLis.length; i++) {
    const ithCla = claLis[i]
    const claRelPath = ithCla.replace(/\./g, pathSep)
    filePath.push(searchFullPath(claRelPath, MODELICAPATH, within))
  }
  return filePath
}

// Search the full path
function searchFullPath (claRelPath, MODELICAPATH, within) {
  const withEle = within ? within.split('.') : null
  var fullPath
  for (var i = 0; i < MODELICAPATH.length; i++) {
    var moPath = MODELICAPATH[i]
    const tempPathes = withEle ? joinWithinPath(moPath, withEle) : [moPath]
    var tempPath
    for (var j = 0; j < tempPathes.length; j++) {
      var relPathWithMo = claRelPath + '.mo'
      tempPath = path.join(tempPathes[j], relPathWithMo)
      if (fse.existsSync(tempPath)) {
        fullPath = tempPath
        break
      }
    }
    if (fullPath) { break }
  }
  return fullPath
}

// Find all possible pathes with within path
function joinWithinPath (moPath, withEle) {
  const pathes = []
  const joinedPathes = ['']
  const withMoPath = []
  const pathSep = path.sep
  for (var i = 0; i < withEle.length; i++) {
    pathes.push(withEle[i])
    joinedPathes.push(pathes.join(pathSep))
  }
  joinedPathes.forEach(function (ele) {
    withMoPath.push(path.join(moPath, ele))
  })
  return withMoPath.reverse()
}

// Write content to file
function writeFile (fileName, content) {
  // console.log(content)
  const dirNam = path.dirname(fileName)
  createDir(dirNam)
  fs.writeFileSync(fileName, content)
  // fs.writeFileAsync(fileName, content).then(
  //   function (res) {
  //     logger.debug('Wrote ', fileName)
  //     return true
  //   })
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

// Check if an object is empty
function isEmptyObject (obj) {
  if (obj) {
    return JSON.stringify(obj) === '{}'
  } else {
    return true
  }
}


// Copy contents in one folder to another
function copyFolderSync(from, to) {
  if ( !fs.existsSync( to ) ) {
    fs.mkdirSync( to )
  }
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element))
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element))
    }
  })
}

module.exports.getMODELICAPATH = getMODELICAPATH
module.exports.getMoFiles = getMoFiles
module.exports.getOutputFile = getOutputFile
module.exports.createTempDir = createTempDir
module.exports.removeDir = removeDir
module.exports.searchPath = searchPath
module.exports.writeFile = writeFile
module.exports.isEmptyObject = isEmptyObject
module.exports.copyFolderSync = copyFolderSync
