const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const os = require('os')
const fse = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const Ajv = require('ajv')

/**
 * Retrieves the MODELICAPATH environment variable and splits it into an array of paths.
 * The current directory is added as the first element.
 *
 * @returns {string[]} An array of paths derived from the MODELICAPATH environment variable
 *     and the current working directory as the first element.
 */
function getMODELICAPATH () {
  const spe = process.platform.includes('win') ? ';' : ':'
  return (process.env.MODELICAPATH)
    ? (process.cwd() + spe + process.env.MODELICAPATH).split(spe)
    : [process.cwd()]
}

/**
 * Create temp directory to host the simplified json output before adding svg contents
 *
 * @param outputFormat output format, 'json'
 */
function createTempDir (outputFormat) {
  let tmpDir
  try {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), outputFormat))
  } catch (e) {
    console.error(`An error has occurred while creating the temp folder. Error: ${e}`)
  }
  return tmpDir
}

/**
 * Remove a directory
 *
 * @param directoryPath path of the folder to be removed
 */
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
      fs.rmdirSync(directoryPath)
    }
  } catch (e) {
    console.error(`An error has occurred while removing the temp folder at ${directoryPath}. Please remove it manually. Error: ${e}`)
  }
}

/**
 * Get input mo file array.
 * If the parsing mode is 'cdl', the array will have only one element which
 * is the given input 'files'.
 * If the parsing mode is 'modelica', the array will include all mo files in
 * the given package 'files' and its sub-packages.
 *
 * @param files Input files, could be single mo file or a package name
 * @return array of the full path of the modelica file or the package
  */
function getMoFiles (files) {
  let moFiles = []
  const MODELICAPATH = getMODELICAPATH()
  if (files.endsWith('.mo')) {
    let tempPath
    for (let j = 0; j < MODELICAPATH.length; j++) {
      tempPath = path.join(MODELICAPATH[j], files)
      if (fse.existsSync(tempPath)) {
        moFiles.push(tempPath)
        break
      }
    }
    if (!fse.existsSync(tempPath)) {
      moFiles.push(files)
    }
  } else {
    // it is a package of mo files
    let tempFolder = files
    if (!fse.existsSync(tempFolder)) {
      for (let i = 0; i < MODELICAPATH.length; i++) {
        tempFolder = path.join(MODELICAPATH[i], files)
        if (fse.existsSync(tempFolder)) break
      }
    }
    if (!fse.existsSync(tempFolder)) {
      // the package is not on the MODELICAPATH, so it is a user specified package
      tempFolder = files
    }
    const fileList = getFiles(tempFolder)
    moFiles = fileList.filter(function (obj) {
      return obj.endsWith('.mo')
    })
  }
  return moFiles
}

/**
 * Get all files list in folder dir
 *
 * @param dir directory path
 */
function getFiles (dir, fileList) {
  fileList = fileList || []
  const files = fs.readdirSync(dir)
  for (const i in files) {
    // if (!files.hasOwnProperty(i)) continue
    if (!Object.hasOwn(files, i)) continue
    const name = dir + path.sep + files[i]
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList)
    } else {
      fileList.push(name)
    }
  }
  return fileList
}

/**
 * Computes the relative path of a given file path with respect to the Modelica paths.
 * Note that `getMODELICAPATH` prepends the environment variable MODELICAPATH with the current directory.
 * Complex example to solve, considering that MODELICAPATH contains "$(pwd)/modelica-buildings/Buildings":
 * ./
 * └── modelica-buildings/Buildings
 * getRelativePath("$(pwd)/modelica-buildings/Buildings") must return 'Buildings', not 'modelica-buildings/Buildings'
 *
 * @param {string} filePath - The absolute path of the file.
 * @returns {string} The relative path if the file is within any of the Modelica paths,
 *     otherwise the original file path.
 */
function getRelativePath (filePath) {
  const candidates = []
  for (const p of getMODELICAPATH()) {
    const rel = path.relative(p, filePath)
    if (!rel.startsWith('..')) {
      candidates.push(rel)
    }
  }
  // The shortest path is the best candidate, see complex example above.
  return candidates.toSorted()[0] ?? filePath
}

/**
 * Get the output file path
 *
 * @param inputFile full path of the modelica file
 * @param outputFormat output format
 * @param dir directory that stores the output
 */
function getOutputFile (inputFile, outputFormat, dir) {
  // get the modelica file path from the Json output, it is relative path
  const relPat = getRelativePath(inputFile)
  let outFile
  if (outputFormat === 'json' || outputFormat === 'raw-json' || outputFormat === 'objects') {
    outFile = relPat.replace('.mo', '.json')
  } else if (outputFormat === 'html') {
    outFile = relPat.replace('.mo', '.html')
  } else if (outputFormat === 'docx') {
    outFile = relPat.replace('.mo', '.docx')
  } else if (outputFormat === 'cxf') {
    outFile = relPat.replace('.mo', '.jsonld')
  } else if (outputFormat === 'modelica') {
    outFile = inputFile.replace('.json', '.mo')
  }
  return path.join(dir, outputFormat, outFile)
}

// Get the full file path of the instantiated classes
function searchPath (claLis, within, sourceMoFile) {
  const MODELICAPATH = getMODELICAPATH()

  const filePath = []
  for (let i = 0; i < claLis.length; i++) {
    const ithCla = claLis[i]
    const claRelPath = joinedPathes(ithCla.split('.'))
    const fulPat = searchFullPath(claRelPath.reverse(), MODELICAPATH, within)
    if (fulPat) {
      filePath.push(fulPat)
    } else {
      // check if its in the same folders as original moFile
      if (sourceMoFile !== undefined && sourceMoFile !== null) {
        const folders = sourceMoFile.split('.mo')[0].split(path.sep)
        let j = folders.length - 1
        while (j > 0) {
          const possiblePath = path.join(folders.slice(0, j).join(path.sep), ithCla + '.mo')
          if (fs.existsSync(possiblePath)) {
            filePath.push(possiblePath)
          }
          j = j - 1
        }
      }
    }
  }
  return filePath
}
// Get array of potential paths
function joinedPathes (eleArr) {
  const pathes = []
  const joinedPat = []
  const pathSep = path.sep
  for (let i = 0; i < eleArr.length; i++) {
    pathes.push(eleArr[i])
    joinedPat.push(pathes.join(pathSep))
  }
  return joinedPat
}

// Search the full path
function searchFullPath (claRelPath, MODELICAPATH, within) {
  const withEle = within ? within.split('.') : null
  let fullPath = pathSearch(claRelPath, MODELICAPATH, withEle, false)
  if (!fullPath) {
    fullPath = pathSearch(claRelPath, MODELICAPATH, withEle, true)
  }
  return fullPath
}

/**
 * Search full path of the modelica file that contains the instantiated class,
 * it could be in the package.mo file
 *
 * @param claRelPath potential paths formulated by the instantiated class path
 * @param MODELICAPATH array of Modelica paths
 * @param withEle array of the potential paths formulated by the within elements
 * @param checkPackage flag to check if should check package.mo file
 */
function pathSearch (claRelPath, MODELICAPATH, withEle, checkPackage) {
  let fullPath
  for (let i = 0; i < MODELICAPATH.length; i++) {
    const moPath = MODELICAPATH[i]
    const tempPathes = withEle ? joinWithinPath(moPath, withEle) : [moPath]
    let tempPath
    for (let j = 0; j < tempPathes.length; j++) {
      for (let k = 0; k < claRelPath.length; k++) {
        const relPath = !checkPackage ? (claRelPath[k] + '.mo') : claRelPath[k]
        tempPath = path.join(tempPathes[j], relPath)
        if (!checkPackage) {
          if (fse.existsSync(tempPath)) {
            // check if the class has corresponed modelica file,
            // or if it is a subclass of class which has the corresponded modelica file.
            // except the package.mo file. For example, a class C might be subclass which
            // is defined in the A.B.package.mo file, but when instantiating class C, it will be A.B.C
            fullPath = tempPath
            break
          }
        } else {
          if (fse.existsSync(tempPath) && (tempPath !== process.cwd()) && (tempPath !== '.')) {
            // the instantiated class is subclass in the package.mo
            fullPath = path.join(tempPath, 'package.mo')
            break
          }
        }
      }
      if (fullPath) { break }
    }
    if (fullPath) { break }
  }
  return fullPath
}

// Find all possible pathes with within path
function joinWithinPath (moPath, withEle) {
  const joiPat = ['']
  const withPathes = joinedPathes(withEle)
  Array.prototype.push.apply(joiPat, withPathes)
  const withMoPath = []
  joiPat.forEach(function (ele) {
    withMoPath.push(path.join(moPath, ele))
  })
  return withMoPath.reverse()
}

// Write content to file
function writeFile (fileName, content) {
  const dirNam = path.dirname(fileName)
  createDir(dirNam)
  fs.writeFileSync(fileName, content)
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
function copyFolderSync (from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to)
  }
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element))
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element))
    }
  })
}

/**
 * Checks if the modelica file needs to be parsed.
 * A file needs to be parsed if:
 * - The outputFile does not exist, or
 * - The outputFile exists but the stored checksum does not match the provided checksum.
 * @param {string} outputFile - The path to the output file.
 * @param {string} checksum - The checksum value to compare with the stored checksum.
 * @param {string} moFile - The path to the modelica file.
 * @returns {boolean} - Returns true if the modelica file needs to be parsed, otherwise false.
 */
function checkIfParse (outputFile, checksum, moFile) {
  let parseMo = false
  if (!fs.existsSync(outputFile)) {
    parseMo = true
  } else {
    const checksumInJson = getChecksumFromJson(outputFile)
    if (!checksumInJson || (checksumInJson !== checksum)) {
      if (checksumInJson !== checksum) {
        console.log('There is change in: "' + moFile + '", regenerating the json output.')
      }
      if (!checksumInJson) {
        console.log('No checksum in json file: "' + outputFile + '", the checksum will be added now.')
      }
      parseMo = true
    }
  }
  return parseMo
}

// Get the checksum of the Modelica file
function getMoChecksum (moFile) {
  if (fs.existsSync(moFile)) {
    const input = fs.readFileSync(moFile)
    const hash = crypto.createHash('md5')
    hash.update(input)
    return hash.digest('hex')
  } else {
    return 0
  }
}

// Get the checksum from the stored json file
function getChecksumFromJson (jsPath) {
  let jsonChecksum = null
  try {
    const fileContent = fs.readFileSync(jsPath, 'utf8')
    const jsonOutput = JSON.parse(fileContent)
    jsonChecksum = jsonOutput.checksum
    if (jsonChecksum == null) {
      return null
    }
  } catch (err) {
    console.log('Error parsing json file: ', err)
    throw ('Error reading file: ', err)
  }
  return jsonChecksum
}

// Validation of a json file against a schema
function jsonSchemaValidation (mode, userData, output = 'json', userSchema) {
  if (output !== 'json') {
    console.log('Json file will be validated against schema only when the output format is json.')
  } else {
    const ajv = new Ajv({ allErrors: true, schemaId: '$id', strict: false })
    const schema = JSON.parse(fs.readFileSync(userSchema, 'utf8'))
    const data = JSON.parse(fs.readFileSync(userData, 'utf8'))
    const valid = ajv.validate(schema, data)
    if (valid) {
      console.log('Json file is valid')
      return valid
    } else {
      console.log('Json file not valid, see errors below in ', userData)
      console.log(ajv.errorsText())
    }
  }
}

/**
 * Find all files recursively in specific folder with specific extension, e.g:
 * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
 * @param startPath    Path relative to this file or other file which requires this files
 * @param filter       Extension name, e.g: '.html'
 * @return             Result files with path string in an array
 */
function findFilesInDir (startPath, filter) {
  let results = []
  if (!fs.existsSync(startPath)) {
    console.log('no dir ', startPath)
    return
  }
  const files = fs.readdirSync(startPath)
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i])
    const stat = fs.lstatSync(filename)
    if (stat.isDirectory()) {
      results = results.concat(findFilesInDir(filename, filter)) // recurse
    } else if (filename.indexOf(filter) >= 0) {
      results.push(filename)
    }
  }
  return results
}

/**
 * Returns an array containing unique objects from the input array.
 * - Preserves order of objects.
 * - *But* uses JSON.stringify to compare objects, so objects with same properties
 *   but different order will be considered different.
 *
 * @param {Array} array - The input array.
 * @returns {Array} - An array containing unique objects from the input array.
 */
function getUniqueObjectsFromArray (array) {
  const uniqueArray = []
  array.forEach(function (item) {
    const i = uniqueArray.findIndex(x => JSON.stringify(x) === JSON.stringify(item))
    if (i <= -1) {
      uniqueArray.push(item)
    }
  })
  return uniqueArray
}

module.exports.getMODELICAPATH = getMODELICAPATH
module.exports.getMoFiles = getMoFiles
module.exports.getOutputFile = getOutputFile
module.exports.getUniqueObjectsFromArray = getUniqueObjectsFromArray
module.exports.createTempDir = createTempDir
module.exports.removeDir = removeDir
module.exports.searchPath = searchPath
module.exports.writeFile = writeFile
module.exports.isEmptyObject = isEmptyObject
module.exports.copyFolderSync = copyFolderSync
module.exports.getRelativePath = getRelativePath
module.exports.getMoChecksum = getMoChecksum
module.exports.checkIfParse = checkIfParse
module.exports.jsonSchemaValidation = jsonSchemaValidation
module.exports.findFilesInDir = findFilesInDir
