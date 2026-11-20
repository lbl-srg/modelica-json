const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const os = require('os')
const fse = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const Ajv = require('ajv')

// Roots of the libraries of the parsed input files, by top-level class name, see 'addLibraryRoot'.
const libraryRoots = new Map()

/**
 * Retrieves the MODELICAPATH environment variable and splits it into an array of paths.
 * The current directory is added as the first element, and all entries are resolved to absolute paths.
 *
 * @returns {string[]} An array of paths derived from the MODELICAPATH environment variable
 *     and the current working directory as the first element.
 */
function getMODELICAPATH () {
  const sep = process.platform === 'win32' ? ';' : ':'
  return ((process.env.MODELICAPATH)
    ? (process.cwd() + sep + process.env.MODELICAPATH).split(sep)
    : [process.cwd()]).filter(Boolean).map(p => path.resolve(p))
}

/**
 * Get the directories in which classes are looked up: the entries of 'getMODELICAPATH',
 * followed by the library roots registered with 'addLibraryRoot'.
 * Use 'isLookedUpIn' to check in which of these directories a given class is looked up.
 *
 * @returns {string[]} array of absolute paths
 */
function getLookupPath () {
  const entries = getMODELICAPATH()
  return entries.concat([...new Set(libraryRoots.values())].filter(root => !entries.includes(root)))
}

/**
 * Check if a class is looked up in a directory returned by 'getLookupPath'.
 *
 * A class whose top-level class has been registered with 'addLibraryRoot' is only
 * looked up in the registered library root, which thus takes precedence over the
 * entries of MODELICAPATH, as when a Modelica tool opens a file.
 * Any other class is only looked up in the entries of MODELICAPATH.
 *
 * @param dir directory returned by 'getLookupPath'
 * @param relPath path of the class file or directory relative to 'dir',
 *     such as 'A/B/C.mo' for class A.B.C
 * @returns {boolean} true if the class is looked up in 'dir'
 */
function isLookedUpIn (dir, relPath) {
  const topLevelName = relPath.split(/[\\/]/).find(Boolean)?.replace(/\.mo$/, '')
  return libraryRoots.has(topLevelName)
    ? libraryRoots.get(topLevelName) === dir
    : getMODELICAPATH().includes(dir)
}

/**
 * Get the top-level class of the library of a Modelica file, and the root of the library,
 * that is the directory that contains this top-level class, as it would be listed in MODELICAPATH.
 *
 * These are derived from the directory of the file and its 'within' clause.
 * For instance, both '<root>/A/B/C.mo' and '<root>/A/B/C/package.mo' with 'within A.B;'
 * give the top-level class 'A' and the root '<root>'.
 * For 'package.mo', the directory is the package itself, so the 'within' clause
 * applies to its parent directory.
 * A file without 'within' clause, or with 'within ;', contains a top-level class:
 * '<root>/C.mo' and '<root>/C/package.mo' give the top-level class 'C' and the root '<root>'.
 *
 * @param moFile path of the Modelica file
 * @returns {{name: string, root: string}|null} name of the top-level class, and absolute
 *     path of the library root; null if the file does not exist, or if the 'within' clause
 *     does not match the names of the enclosing directories
 */
function getLibrary (moFile) {
  if (!fs.existsSync(moFile) || !fs.statSync(moFile).isFile()) {
    return null
  }
  const within = readWithin(moFile) ?? ''
  const fullPath = path.resolve(moFile)
  let dir = path.dirname(fullPath)
  let className = path.basename(fullPath, '.mo')
  if (path.basename(fullPath) === 'package.mo') {
    className = path.basename(dir)
    dir = path.dirname(dir)
  }
  const packages = within === '' ? [] : within.split('.')
  for (const name of packages.toReversed()) {
    if (path.basename(dir) !== name) {
      return null
    }
    dir = path.dirname(dir)
  }
  return { name: packages[0] ?? className, root: dir }
}

/**
 * Register the root of the library of a Modelica file, see 'getLibrary'.
 *
 * The classes of this library are then only looked up below this root,
 * see 'isLookedUpIn', as some Modelica tools do when opening a file.
 *
 * @param moFile path of the Modelica file
 * @returns {{name: string, root: string}|null} the top-level class and the library root,
 *     or null if they cannot be derived
 * @throws {Error} if another root is already registered for the same top-level class
 */
function addLibraryRoot (moFile) {
  const library = getLibrary(moFile)
  if (library === null) {
    return null
  }
  const registered = libraryRoots.get(library.name)
  if (registered !== undefined && registered !== library.root) {
    throw new Error(`The library ${library.name} of ${moFile} is located in ${library.root}, ` +
      `but it has already been loaded from ${registered}.`)
  }
  libraryRoots.set(library.name, library.root)
  return library
}

/**
 * Remove all library roots registered with 'addLibraryRoot'.
 */
function resetLibraryRoots () {
  libraryRoots.clear()
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
 *
 * 'files' is looked up as follows, and the first file or directory found is used.
 * - As a path, absolute or relative to the current directory.
 * - Unless it is absolute or starts with './' or '../', as a path relative to each
 *   entry of MODELICAPATH, such as 'Buildings/Controls/OBC/CDL', or relative to the
 *   library root registered for its top-level class, see 'isLookedUpIn'.
 *   If 'files' contains no path separator, it is a class name, such as
 *   'Buildings.Controls.OBC.CDL.Reals.Add' (optionally followed by '.mo'), and its dots
 *   are converted into path separators.
 * In each case, the '.mo' extension is appended if no file or directory is found without it.
 *
 * @param files path of a Modelica file or package directory, or class name
 * @return array of the paths of the Modelica file, or of all Modelica files in the
 *     package directory and its sub-packages; empty array if 'files' is not found
 */
function getMoFiles (files) {
  const candidates = [files]
  if (!path.isAbsolute(files) && !/^\.\.?([\\/]|$)/.test(files)) {
    const relativePath = /[\\/]/.test(files)
      ? files
      : files.replace(/\.mo$/, '').replaceAll('.', path.sep)
    candidates.push(...getLookupPath()
      .filter(p => isLookedUpIn(p, relativePath))
      .map(p => path.join(p, relativePath)))
  }
  for (const candidate of candidates.flatMap(c => [c, c + '.mo'])) {
    if (!fs.existsSync(candidate)) continue
    const fullPath = path.resolve(candidate)
    if (fs.statSync(fullPath).isDirectory()) {
      return getFiles(fullPath).filter((obj) => obj.endsWith('.mo'))
    }
    if (fullPath.endsWith('.mo')) {
      return [fullPath]
    }
  }
  return []
}

/**
 * Get all files list in folder dir
 *
 * @param dir directory path
 * @param fileList already retrieved list of files
 */
function getFiles (dir, fileList) {
  fileList = fileList || []
  let files = []
  if (fs.existsSync(dir)) {
    files = fs.readdirSync(dir)
  }
  for (const i in files) {
    // if (!files.hasOwnProperty(i)) continue
    if (!Object.hasOwn(files, i)) continue
    const name = path.join(dir, files[i])
    if (fs.existsSync(name) && fs.statSync(name).isDirectory()) {
      getFiles(name, fileList)
    } else {
      fileList.push(name)
    }
  }
  return fileList
}

/**
 * Get the path of a Modelica file relative to the root of its library, derived from
 * its 'within' clause and its name, wherever the file is located.
 * For instance, 'A/B/C.mo' for 'C.mo' with 'within A.B;', 'A/B/C/package.mo' for
 * 'C/package.mo' with 'within A.B;', and 'C.mo' for 'C.mo' without 'within' clause.
 *
 * @param {string} moFile - The path of the Modelica file.
 * @returns {string} The relative path.
 */
function getClassPath (moFile) {
  const within = readWithin(moFile) ?? ''
  const packages = within === '' ? [] : within.split('.')
  const fullPath = path.resolve(moFile)
  if (path.basename(fullPath) === 'package.mo') {
    packages.push(path.basename(path.dirname(fullPath)))
  }
  return path.join(...packages, path.basename(fullPath))
}

/**
 * Computes the relative path of a given file path, which is used to store the output files.
 *
 * For an existing Modelica file, this is the path relative to the root of its library,
 * derived from its 'within' clause, see 'getClassPath'.
 * Otherwise, such as for a directory, this is the path relative to the Modelica paths.
 * Note that `getMODELICAPATH` prepends the environment variable MODELICAPATH with the current directory.
 * Complex example to solve, considering that MODELICAPATH contains "$(pwd)/modelica-buildings/Buildings":
 * ./
 * └── modelica-buildings/Buildings
 * getRelativePath("$(pwd)/modelica-buildings/Buildings") must return 'Buildings', not 'modelica-buildings/Buildings'
 *
 * @param {string} filePath - The absolute path of the file.
 * @returns {string} The relative path if the file is a Modelica file or is within any
 *     of the Modelica paths, otherwise the original file path.
 */
function getRelativePath (filePath) {
  if (filePath.endsWith('.mo') && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return getClassPath(filePath)
  }
  const candidates = []
  for (const p of getMODELICAPATH()) {
    const rel = path.relative(p, filePath)
    if (!rel.startsWith('..')) {
      candidates.push(rel)
    }
  }
  // The shortest path is the best candidate, see complex example above.
  return candidates.toSorted((a, b) => a.length - b.length)[0] ?? filePath
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
    outFile = relPat.replace(/\.mo$/, '.json')
  } else if (outputFormat === 'html') {
    outFile = relPat.replace(/\.mo$/, '.html')
  } else if (outputFormat === 'docx') {
    outFile = relPat.replace(/\.mo$/, '.docx')
  } else if (outputFormat === 'cxf') {
    outFile = relPat.replace(/\.mo$/, '.jsonld')
  } else if (outputFormat === 'modelica') {
    outFile = inputFile.replace('.json', '.mo')
  }
  return path.join(dir, outputFormat, outFile)
}

// Get the full file path of the instantiated classes
function searchPath (claLis, within, sourceMoFile) {
  const MODELICAPATH = getLookupPath()

  const filePath = []
  for (let i = 0; i < claLis.length; i++) {
    const ithCla = claLis[i].replaceAll('.', path.sep)
    // const moFiles = getMoFiles(ithCla)
    // if (moFiles.length === 1 && moFiles[0] !== ithCla) {
    //   return moFiles
    // }
    const claRelPath = joinedPathes(ithCla.split(path.sep))
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

// Cache resolved fully-qualified type names to avoid repeated file lookups.
const typeFqnCache = {}

/**
 * Read the `within` clause of a Modelica file.
 *
 * The file is scanned as text, without being parsed. As the `within` clause can only be
 * preceded by white space and comments, a `within` clause inside a comment, or after
 * the first class definition, is ignored.
 *
 * @param moFile path to the .mo file
 * @returns {string|null} the name of the enclosing package, '' for `within ;`,
 *     or null if the file has no `within` clause or cannot be read
 */
function readWithin (moFile) {
  let content
  try {
    content = fs.readFileSync(moFile, 'utf-8')
  } catch (e) {
    return null
  }
  // Skip the byte order mark, white space and comments.
  const header = content.match(/^\uFEFF?(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/)[0]
  const match = content.slice(header.length).match(/^within(?:\s+([A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*)*))?\s*;/)
  if (match === null) {
    return null
  }
  return match[1]?.replace(/\s+/g, '') ?? ''
}

/**
 * Resolve an unqualified Modelica type specifier (as written in a component
 * declaration) to its fully-qualified name `<within>.<class>`.
 *
 * Within a package a sibling class is referenced by its short name, but
 * downstream consumers (e.g. CXF, which builds a flat RDF graph keyed by
 * fully-qualified IRIs) need the qualified name so a component's type matches
 * the class's own identity. The declaring file's `within` scope plus the class
 * file located via `searchPath` give the qualified name. Names already
 * qualified (containing a '.'), names that cannot be resolved, and classes
 * defined inside a `package.mo` are returned unchanged.
 *
 * @param typeSpecifier type name as written in the declaration
 * @param within within scope of the declaring file
 * @param sourceMoFile absolute path of the declaring .mo file
 * @returns {string} fully-qualified name, or the original if unresolved
 */
function resolveTypeSpecifier (typeSpecifier, within, sourceMoFile) {
  if (typeSpecifier === undefined || typeSpecifier === null || typeSpecifier.includes('.')) {
    return typeSpecifier
  }
  const cacheKey = `${within}|${typeSpecifier}`
  if (cacheKey in typeFqnCache) {
    return typeFqnCache[cacheKey]
  }
  let resolved = typeSpecifier
  const moFiles = searchPath([typeSpecifier], within, sourceMoFile)
  if (moFiles !== undefined && moFiles !== null && moFiles.length > 0 &&
      !moFiles[0].endsWith(`${path.sep}package.mo`)) {
    const classWithin = readWithin(moFiles[0])
    if (classWithin !== null && classWithin.length > 0) {
      resolved = `${classWithin}.${typeSpecifier}`
    }
  }
  typeFqnCache[cacheKey] = resolved
  return resolved
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
 * @param MODELICAPATH array of Modelica paths, see 'getLookupPath'
 * @param withEle array of the potential paths formulated by the within elements
 * @param checkPackage flag to check if should check package.mo file
 */
function pathSearch (claRelPath, MODELICAPATH, withEle, checkPackage) {
  let fullPath
  // Whether a candidate is looked up in a directory only depends on its top-level class:
  // the first 'within' element, except for the last entry of 'joinWithinPath', which has no
  // 'within' prefix, and for which this is the first component of the class name.
  // Check it once per directory and prefix, rather than for each candidate path, as this is costly.
  const withinTopLevel = withEle ? withEle[0] : undefined
  const classTopLevel = claRelPath.length > 0 ? claRelPath[0].split(/[\\/]/)[0] : undefined
  for (let i = 0; i < MODELICAPATH.length; i++) {
    const moPath = MODELICAPATH[i]
    const tempPathes = withEle ? joinWithinPath(moPath, withEle) : [moPath]
    const lookedUpWithWithin = withEle ? isLookedUpIn(moPath, withinTopLevel) : false
    const lookedUpWithoutWithin = classTopLevel !== undefined && isLookedUpIn(moPath, classTopLevel)
    let tempPath
    for (let j = 0; j < tempPathes.length; j++) {
      const hasWithinPrefix = withEle && j < tempPathes.length - 1
      if (!(hasWithinPrefix ? lookedUpWithWithin : lookedUpWithoutWithin)) {
        continue
      }
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
  if (!withEle) {
    return [moPath]
  }
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
function getMoChecksum (file) {
  if (fs.existsSync(file)) {
    const input = fs.readFileSync(file)
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

// ajv instance reused across calls, only for formatting error messages.
const ajvErrorFormatter = new Ajv({ allErrors: true, schemaId: '$id', strict: false })

// Cache of compiled ajv validators, keyed by schema file path, so that
// repeated calls to jsonSchemaValidation (e.g. once per output json file)
// do not re-parse and re-compile the same schema every time.
const compiledSchemaValidators = new Map()

function getCompiledSchemaValidator (userSchema) {
  let validate = compiledSchemaValidators.get(userSchema)
  if (!validate) {
    const ajv = new Ajv({ allErrors: true, schemaId: '$id', strict: false })
    const schema = JSON.parse(fs.readFileSync(userSchema, 'utf8'))
    validate = ajv.compile(schema)
    compiledSchemaValidators.set(userSchema, validate)
  }
  return validate
}

/**
 * Validate a JSON representation against a schema.
 *
 * @param {Object} json simplified JSON representation of a Modelica file
 * @param {string} userSchema path of the schema
 * @returns {string|null} text of the errors, or null if the JSON representation is valid
 */
function getSchemaErrors (json, userSchema) {
  const validate = getCompiledSchemaValidator(userSchema)
  // Validate the content of the JSON file: the properties that are undefined are not written to it.
  const content = JSON.parse(JSON.stringify(json))
  return validate(content) ? null : ajvErrorFormatter.errorsText(validate.errors)
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
  const seen = new Set()
  array.forEach(function (item) {
    const key = JSON.stringify(item)
    if (!seen.has(key)) {
      seen.add(key)
      uniqueArray.push(item)
    }
  })
  return uniqueArray
}

/**
 * Get the full name of the class stored in a Modelica file, derived from its
 * 'within' clause and its name, without parsing the file.
 * For instance, 'A.B.C' for 'C.mo' or 'C/package.mo' with 'within A.B;'.
 *
 * @param {string} moFile path of the Modelica file
 * @returns {string} full class name
 */
function getClassName (moFile) {
  return getClassPath(moFile).replace(/([\\/]package)?\.mo$/, '').split(/[\\/]/).join('.')
}

/**
 * Get the full name of the class stored in a simplified JSON representation.
 *
 * @param {Object} json simplified JSON representation of a Modelica file
 * @returns {string} full class name
 */
function getClassNameFromJson (json) {
  const specifier = json.stored_class_definitions[0].class_specifier
  const identifier = (specifier.long_class_specifier ?? specifier.short_class_specifier).identifier
  return json.within ? `${json.within}.${identifier}` : identifier
}

/**
 * Check if a class is a CDL elementary block.
 * This is the definition used for the check of CDL compliance. The classes of
 * the 'CDL' package are elementary blocks, except for validation models.
 *
 * @param {string} className full class name
 * @returns {boolean} true if the class is an elementary block
 */
function isCdlElementaryClass (className) {
  return className.startsWith('Buildings.Controls.OBC.CDL.') &&
    !`${className}.`.includes('.Validation.')
}

/**
 * Check if a class is an extension block, that is annotated with
 * '__cdl(extensionBlock=true)' (see section 7.13 of the CDL specification).
 *
 * @param {Object} json simplified JSON representation of a Modelica file
 * @returns {boolean} true if the class is an extension block
 */
function isExtensionBlock (json) {
  return hasExtensionBlockAnnotation(json.stored_class_definitions[0].class_specifier
    .long_class_specifier?.composition?.annotation)
}

/**
 * Check if an annotation contains '__cdl(extensionBlock=true)'.
 *
 * @param {Array|string|undefined} annotation annotation of a class or of an instance
 * @returns {boolean} true if the annotation contains '__cdl(extensionBlock=true)'
 */
function hasExtensionBlockAnnotation (annotation) {
  const getModification = (list, name) => (Array.isArray(list) ? list : [])
    .map(obj => obj.element_modification_or_replaceable?.element_modification)
    .find(obj => obj?.name === name)?.modification
  const cdl = getModification(annotation, '__cdl')
  return getModification(cdl?.class_modification, 'extensionBlock')?.expression?.simple_expression === 'true'
}

/**
 * Get a function that checks if a class is excluded by class name patterns.
 *
 * In a pattern, '*' matches within one component of the class name, '**' matches across
 * components, and '|' separates alternatives, at the top level or in parentheses.
 * A pattern must match the whole name of a class, and a pattern that
 * matches a package also excludes all the classes in this package.
 *
 * @param {string[]} patterns class name patterns
 * @returns {function(string): boolean} function that returns true if a class name is excluded
 * @throws {Error} if a pattern is invalid
 */
function getExcludeFilter (patterns = []) {
  const expressions = patterns.map((pattern) => {
    const invalid = new Error(`Invalid class name pattern: '${pattern}'.`)
    if (!/^[\w.*|()]+$/.test(pattern)) {
      throw invalid
    }
    const source = pattern.replaceAll('.', '\\.').replace(/\*\*?/g, m => m === '**' ? '.*' : '[^.]*')
    try {
      return new RegExp(`^(?:${source})(?:\\..*)?$`)
    } catch (e) {
      throw invalid
    }
  })
  return className => expressions.some(expression => expression.test(className))
}

/**
 * check if name (could be a.b.c or a/b/c.mo) is an elementary block in CDL.
 * Currently it is elementary block if file is in:
 * Buildings.Controls.OBC.CDL.Sources or Buildings.Controls.OBC.CDL
 * @param {string} filePath
 * @param {boolean} singleFile
 * @returns {boolean} - true if it is an elementary block, false otherwise
 */
function checkIfCdlElementaryBlockOrPackage (filePath, singleFile = false) {
  if (filePath === undefined || filePath === null || filePath.length === 0) {
    return false
  }
  let isElementaryBlockOrPackage = false

  let name = filePath
  if (name.endsWith('.mo')) {
    name = name.split('.mo')[0]
  }
  let namePath = null
  name = name.toUpperCase()
  if (name.includes(path.sep)) {
    namePath = name
  } else {
    namePath = name.replaceAll('.', path.sep)
  }
  const nameTokens = namePath.split(path.sep)

  if (singleFile && nameTokens[nameTokens.length - 1] === 'CONSTANTS' && nameTokens[nameTokens.length - 2] === 'CDL') {
    return true
  } else {
    if ((singleFile && nameTokens.length < 3) || (!singleFile && nameTokens.length < 2)) {
      return false
    }
  }

  let blockName = null
  let blockName2 = null
  let blockName3 = null
  let blockName4 = null
  let blockName5 = null
  let blockName6 = null
  let blockName7 = null

  const cdlPackages = ['CONVERSIONS', 'DISCRETE', 'INTEGERS', 'INTERFACES', 'LOGICAL', 'PSYCHROMETRICS', 'REALS', 'ROUTING', 'TYPES', 'UTILITIES']
  const cdlPackagesWithSources = ['INTEGERS', 'LOGICAL', 'REALS']
  if (!singleFile && nameTokens.length === 2) {
    blockName = nameTokens.slice(-1)[0]
    blockName2 = nameTokens.slice(-2, -1)[0]
    if (blockName2 === 'CDL' && cdlPackages.includes(blockName2)) {
      isElementaryBlockOrPackage = true
    } else {
      return false
    }
  }
  if (nameTokens.length >= 3) {
    if (nameTokens.length === 3) {
      blockName = nameTokens.slice(-1)[0]
      blockName2 = nameTokens.slice(-2, -1)[0]
      blockName3 = nameTokens.slice(-3, -2)[0]
      if ((singleFile && blockName3 === 'CDL' && cdlPackages.includes(blockName2)) ||
        (!singleFile && blockName3 === 'OBC' && blockName2 === 'CDL' && cdlPackages.includes(blockName))) {
        isElementaryBlockOrPackage = true
      } else if ((cdlPackagesWithSources.includes(blockName3) && blockName2 === 'SOURCES') ||
        (!singleFile && blockName3 === 'CDL' && cdlPackagesWithSources.includes(blockName2) && blockName === 'SOURCES')) {
        isElementaryBlockOrPackage = true
      } else {
        return false
      }
    }
    if (nameTokens.length === 4) {
      blockName = nameTokens.slice(-1)[0]
      blockName2 = nameTokens.slice(-2, -1)[0]
      blockName3 = nameTokens.slice(-3, -2)[0]
      blockName4 = nameTokens.slice(-4, -3)[0]
      if ((singleFile && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackages.includes(blockName2)) ||
        (!singleFile && blockName4 === 'CONTROLS' && blockName3 === 'OBC' && blockName2 === 'CDL' && cdlPackages.includes(blockName))) {
        isElementaryBlockOrPackage = true
      } else if ((singleFile && blockName4 === 'CDL' && cdlPackagesWithSources.includes(blockName3) && blockName2 === 'SOURCES') ||
        (!singleFile && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackagesWithSources.includes(blockName2) && blockName === 'SOURCES')) {
        isElementaryBlockOrPackage = true
      } else {
        return false
      }
    }
    if (nameTokens.length === 5) {
      blockName = nameTokens.slice(-1)[0]
      blockName2 = nameTokens.slice(-2, -1)[0]
      blockName3 = nameTokens.slice(-3, -2)[0]
      blockName4 = nameTokens.slice(-4, -3)[0]
      blockName5 = nameTokens.slice(-5, -4)[0]
      if ((singleFile && blockName5 === 'CONTROLS' && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackages.includes(blockName2)) ||
        (!singleFile && blockName5.includes('BUILDINGS') && blockName4 === 'CONTROLS' && blockName3 === 'OBC' && blockName2 === 'CDL' && cdlPackages.includes(blockName))) {
        isElementaryBlockOrPackage = true
      } else if ((singleFile && blockName5 === 'OBC' && blockName4 === 'CDL' && cdlPackagesWithSources.includes(blockName3) && blockName2 === 'SOURCES') ||
        (!singleFile && blockName5 === 'CONTROLS' && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackagesWithSources.includes(blockName2) && blockName === 'SOURCES')) {
        isElementaryBlockOrPackage = true
      } else {
        return false
      }
    }
    if (nameTokens.length === 6) {
      blockName = nameTokens.slice(-1)[0]
      blockName2 = nameTokens.slice(-2, -1)[0]
      blockName3 = nameTokens.slice(-3, -2)[0]
      blockName4 = nameTokens.slice(-4, -3)[0]
      blockName5 = nameTokens.slice(-5, -4)[0]
      blockName6 = nameTokens.slice(-6, -5)[0]
      if ((singleFile && blockName6.includes('BUILDINGS') && blockName5 === 'CONTROLS' && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackages.includes(blockName2)) ||
        (!singleFile && blockName5.includes('BUILDINGS') && blockName4 === 'CONTROLS' && blockName3 === 'OBC' && blockName2 === 'CDL' && cdlPackages.includes(blockName))) {
        isElementaryBlockOrPackage = true
      } else if ((singleFile && blockName6 === 'CONTROLS' && blockName5 === 'OBC' && blockName4 === 'CDL' && cdlPackagesWithSources.includes(blockName3) && blockName2 === 'SOURCES') ||
        (!singleFile && blockName6.includes('BUILDINGS') && blockName5 === 'CONTROLS' && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackagesWithSources.includes(blockName2) && blockName === 'SOURCES')) {
        isElementaryBlockOrPackage = true
      } else {
        return false
      }
    }
    if (nameTokens.length >= 7) {
      blockName = nameTokens.slice(-1)[0]
      blockName2 = nameTokens.slice(-2, -1)[0]
      blockName3 = nameTokens.slice(-3, -2)[0]
      blockName4 = nameTokens.slice(-4, -3)[0]
      blockName5 = nameTokens.slice(-5, -4)[0]
      blockName6 = nameTokens.slice(-6, -5)[0]
      blockName7 = nameTokens.slice(-7, -6)[0]
      if ((singleFile && blockName6.includes('BUILDINGS') && blockName5 === 'CONTROLS' && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackages.includes(blockName2)) ||
        (!singleFile && blockName5.includes('BUILDINGS') && blockName4 === 'CONTROLS' && blockName3 === 'OBC' && blockName2 === 'CDL' && cdlPackages.includes(blockName))) {
        isElementaryBlockOrPackage = true
      } else if ((singleFile && blockName7.includes('BUILDINGS') && blockName6 === 'CONTROLS' && blockName5 === 'OBC' && blockName4 === 'CDL' && cdlPackagesWithSources.includes(blockName3) && blockName2 === 'SOURCES') ||
        (!singleFile && blockName6.includes('BUILDINGS') && blockName5 === 'CONTROLS' && blockName4 === 'OBC' && blockName3 === 'CDL' && cdlPackagesWithSources.includes(blockName2) && blockName === 'SOURCES')) {
        isElementaryBlockOrPackage = true
      } else {
        return false
      }
    }
  }
  return isElementaryBlockOrPackage
}

/**
 * Get the content in package.order file
 * @param {String} moFile The path to the Modelica file pacakge.mo
 * @returns {Array} - An array of the class names in the package
 */
function getPackageOrder (moFile) {
  const sysSep = path.sep
  const pathSections = moFile.split(sysSep)
  const length = pathSections.length
  if (pathSections[length - 1] === 'package.mo') {
    pathSections[length - 1] = 'package.order'
    // package.order file path
    const orderPath = pathSections.join(sysSep)
    if (fs.existsSync(orderPath)) {
      const classNames = fs.readFileSync(orderPath, 'utf-8').split(/\r?\n/)
      const names = classNames.filter(name => name.trim().length !== 0)
      return names
    }
  }
}

module.exports.getMODELICAPATH = getMODELICAPATH
module.exports.getLookupPath = getLookupPath
module.exports.isLookedUpIn = isLookedUpIn
module.exports.getLibrary = getLibrary
module.exports.getClassPath = getClassPath
module.exports.addLibraryRoot = addLibraryRoot
module.exports.resetLibraryRoots = resetLibraryRoots
module.exports.getMoFiles = getMoFiles
module.exports.getOutputFile = getOutputFile
module.exports.getUniqueObjectsFromArray = getUniqueObjectsFromArray
module.exports.createTempDir = createTempDir
module.exports.removeDir = removeDir
module.exports.searchPath = searchPath
module.exports.readWithin = readWithin
module.exports.resolveTypeSpecifier = resolveTypeSpecifier
module.exports.writeFile = writeFile
module.exports.isEmptyObject = isEmptyObject
module.exports.copyFolderSync = copyFolderSync
module.exports.getRelativePath = getRelativePath
module.exports.getMoChecksum = getMoChecksum
module.exports.checkIfParse = checkIfParse
module.exports.getSchemaErrors = getSchemaErrors
module.exports.getClassName = getClassName
module.exports.getClassNameFromJson = getClassNameFromJson
module.exports.isCdlElementaryClass = isCdlElementaryClass
module.exports.isExtensionBlock = isExtensionBlock
module.exports.hasExtensionBlockAnnotation = hasExtensionBlockAnnotation
module.exports.getExcludeFilter = getExcludeFilter
module.exports.findFilesInDir = findFilesInDir
module.exports.joinWithinPath = joinWithinPath
module.exports.checkIfCdlElementaryBlockOrPackage = checkIfCdlElementaryBlockOrPackage
module.exports.getPackageOrder = getPackageOrder
