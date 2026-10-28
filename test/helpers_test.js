'use strict'

// shared helpers for the test suite
// everything here is about the *objects json* layer

const fs = require('fs')
const path = require('path')

const ut = require('../lib/util')

// for repeating or extended decimal values, the comparison precision is calculated to 3 decimal places

/**
 * Every .json file in a directory (no extension included)
 *
 * @param {string} dir - directory to list
 * @returns {string[]} the base names, e.g. ['ExpEval', 'Threepeat_Unit.uni1']
 */
function jsonBaseNames (dir) {
  return fs.readdirSync(dir)
    .filter(function (file) { return file.endsWith('.json') })
    .map(function (file) { return file.slice(0, -5) })
}

/**
 * path of the objects json for a class or instance inside a directory
 *
 * A sub-sequence file is named after the class it came from and the instance
 * path it was resolved at (`Threepeat_Unit.uni1`), joined with `.`
 *
 * @param {string} dir - directory holding the objects json
 * @param {string} name - class name or instance path
 * @returns {string} the full path
 */
function objectsJsonPath (dir, name) {
  return path.join(dir, name + '.json')
}

/**
 * current working directory for creating object json files
 *
 * This should be called from the project root and should pass in a relative Modelica directory,
 * which will be adjacent to the generated object directory
 *
 * @param {string} moDirRel - Modelica package dir, relative to the project root
 * @returns {string} the full path of the generated objects directory
 */
function generatedObjectsDir (moDirRel) {
  return path.join(process.cwd(), 'objects', moDirRel)
}

/**
 * recursively return the modelica path with a normalized constant
 *
 * @param {*} node - any node of a parsed objects json
 * @returns {*} the same node potentially altered
 */
function normalizeMoFilePaths (node) {
  if (Array.isArray(node)) {
    node.forEach(normalizeMoFilePaths)
  } else if (node !== null && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      if ((key === 'fullMoFilePath' || key === 'modelicaFile') && typeof node[key] === 'string') { // check typing
        node[key] = 'samMoFile'
      } else {
        normalizeMoFilePaths(node[key])
      }
    }
  }
  return node
}

/**
 * read an object while normalizing
 *
 * @param {string} filePath - path of the objects json
 * @returns {Object} the parsed, normalized content
 */
function readNormalizedObjects (filePath) {
  return normalizeMoFilePaths(JSON.parse(fs.readFileSync(filePath, 'utf8')))
}

/**
 * parsing value as a number that and to account for numerical precision
 *
 * handles different types of values, including numbers, strings, and Modelica array literals,
 * and returns an array of numbers if the value is numeric, or null if it is not
 *
 * @param {*} value - a value taken from the objects json
 * @returns {number[]|null} the numbers it holds, or null if it is not numeric
 */
function asNumbers (value) {
  if (typeof value === 'number') {
    return [value]
  }

  if (typeof value !== 'string') {
    return null
  }

  // remove the surrounding braces for Modelica array literals, if applicable
  const body = /^\{.*\}$/.test(value.trim()) ? value.trim().slice(1, -1) : value //
  if (body.trim() === '') {
    return null
  }

  // turn an array
  const parts = body.split(',').map(function (part) { return part.trim() })
  const numbers = parts.map(Number)
  if (numbers.some(function (n) { return !Number.isFinite(n) })) return null
  return numbers
}

/**
 * Deep compare two objects json, comparing anything numeric with a precision
 * and everything else exactly.
 *
 * Differences are collected rather than thrown, so one failing test reports
 * every mismatch with the path it sits at instead of stopping at the first.
 *
 * Note that the numeric branch runs before the array and object branches, so
 * two values that both parse as numbers compare numerically whatever their
 * json types are: "3" and 3 are equal here. That is deliberate, since the
 * parser emits values as strings while references are written by hand, but it
 * does mean a change of type alone is invisible to this comparison.
 *
 * @param {*} actual - what the parser produced
 * @param {*} expected - the hand written target
 * @param {string} where - path of the current node, for the failure message
 * @param {string[]} differences - collected mismatches, appended to in place
 * @param {number} [precision] - absolute precision for Reals
 */
function compare (actual, expected, where, differences, precision) {
  // Numeric first: catches scalars and Modelica array literals alike.
  const actualNumbers = asNumbers(actual)
  const expectedNumbers = asNumbers(expected)
  if (actualNumbers !== null && expectedNumbers !== null) {
    if (actualNumbers.length !== expectedNumbers.length ||
        actualNumbers.some(function (n, i) { return Math.abs(n - expectedNumbers[i]) > precision })) {
      differences.push(where + ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(expected))
    }
    return
  }
  // Arrays: a length or type mismatch is one difference, not one per element.
  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual) || actual.length !== expected.length) {
      differences.push(where + ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(expected))
      return
    }
    expected.forEach(function (value, i) {
      compare(actual[i], value, where + '[' + i + ']', differences, precision)
    })
    return
  }
  // Objects: walk the union of the keys, so a key present on only one side is
  // reported as missing or unexpected rather than silently skipped.
  if (expected !== null && typeof expected === 'object' && actual !== null && typeof actual === 'object') {
    const keys = new Set(Object.keys(expected).concat(Object.keys(actual)))
    keys.forEach(function (key) {
      if (!(key in actual)) {
        differences.push(where + '.' + key + ': missing, expected ' + JSON.stringify(expected[key]))
      } else if (!(key in expected)) {
        differences.push(where + '.' + key + ': unexpected ' + JSON.stringify(actual[key]))
      } else {
        compare(actual[key], expected[key], where + '.' + key, differences, precision)
      }
    })
    return
  }
  // Everything else (strings, booleans, null) compares exactly.
  if (actual !== expected) {
    differences.push(where + ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(expected))
  }
}

/**
 * The literal value a parameter carries, or undefined if it has none.
 *
 * Only a modification of the form `= <expression>` counts; a redeclaration or a
 * constraining clause is not a value.
 *
 * @param {Object} instance - one entry of an objects json `instances` map
 * @returns {*} the simple_expression it holds, or undefined
 */
function parameterValue (instance) {
  const declaration = instance.single_component_list && instance.single_component_list.declaration
  const modification = declaration && declaration.modification
  if (!modification || modification.equal !== true) return undefined
  return modification.expression && modification.expression.simple_expression
}

/**
 * The value a component's declaration gives one parameter of the class it instantiates.
 *
 * @param {Object} instance - the component, as the objects json holds it
 * @param {string} name - the parameter, `inpVal` for `uni1(inpVal=1)`
 * @returns {string|undefined} the value, or undefined when the declaration gives none
 */
function modificationValue (instance, name) {
  const declaration = instance.single_component_list && instance.single_component_list.declaration
  const classModification = (declaration && declaration.modification &&
    declaration.modification.class_modification) || []
  const found = classModification
    .map(function (modification) {
      return modification.element_modification_or_replaceable &&
        modification.element_modification_or_replaceable.element_modification
    })
    .find(function (element) { return element && element.name === name })
  return found && found.modification && found.modification.expression &&
    found.modification.expression.simple_expression
}

/**
 * Directory the failing comparisons dump their artifacts into.
 *
 * It sits outside the package so a parser run, which wipes `objects/`, cannot
 * take the dumps with it. It is git ignored and rewritten on every run.
 *
 * @param {*} value - any parsed objects json node
 * @returns {string} the full path
 */
function diffDir () {
  return path.join(process.cwd(), 'test', 'diffs')
}

/**
 * Serialize with the keys of every object in sorted order.
 *
 * compare() walks the union of the keys, so the order they sit in is invisible
 * to it. A plain JSON.stringify keeps insertion order, which differs between a
 * generated file and a hand written one, and a line diff of the two would then
 * report every key as moved. Sorting first leaves only the real differences.
 *
 * @param {*} value - any parsed objects json node
 * @returns {string} the pretty printed json
 */
function stableStringify (value) {
  const sort = function (node) {
    if (Array.isArray(node)) return node.map(sort)
    if (node === null || typeof node !== 'object') return node

    const sorted = {}
    Object.keys(node).sort().forEach(function (key) { sorted[key] = sort(node[key]) })
    return sorted
  }
  return JSON.stringify(sort(value), null, 2) + '\n'
}

/**
 * Dump both sides of a failed comparison so the difference can be looked at
 * with a normal diff tool.
 *
 * Three files are written per failing test case:
 *   <name>.generated.json -- what the parser produced
 *   <name>.expected.json  -- the reference it was compared against
 *   <name>.diff.txt       -- the list compare() collected, one per line
 *
 * Both json files go through the same normalization the comparison uses, so
 * what is on disk is exactly what was compared: host specific paths are already
 * folded away and the keys are sorted on both sides.
 *
 * @param {string} name - class name or instance path of the test case
 * @param {*} generated - the normalized objects json the parser produced
 * @param {*} reference - the normalized reference objects json
 * @param {string[]} differences - what compare() collected
 * @returns {string} the directory the dumps were written to
 */
function writeDiffArtifacts (name, generated, reference, differences) {
  const dir = diffDir()
  fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(path.join(dir, name + '.generated.json'), stableStringify(generated))
  fs.writeFileSync(path.join(dir, name + '.expected.json'), stableStringify(reference))
  fs.writeFileSync(path.join(dir, name + '.diff.txt'),
    differences.length + ' difference(s) for ' + name + '\n\n' + differences.join('\n') + '\n')

  return dir
}

/**
 * Remove the output folders a parser run writes into the project root.
 *
 * @param {string[]} folName - output folder names, e.g. ['objects', 'json']
 */
function removeOutputDirs (folName) {
  folName.forEach(function (format) {
    const dir = path.join(process.cwd(), format)
    if (fs.existsSync(dir)) ut.removeDir(dir)
  })
}

/**
 * Read a reference objects json by name, leaving it exactly as written.
 *
 * The fields testCaseNames() looks at are structural and host independent, so
 * none of the rewriting readNormalizedObjects() does is wanted here.
 *
 * @param {string} dir - directory holding the objects json
 * @param {string} name - class name or instance path
 * @returns {Object} the parsed content
 */
function readObjects (dir, name) {
  return JSON.parse(fs.readFileSync(objectsJsonPath(dir, name), 'utf8'))
}

/**
 * The entry an objects json carries for the class it describes, as opposed to
 * the components that class declares.
 *
 * @param {Object} objectsJson - a parsed objects json
 * @returns {Object} that entry, or an empty object if the file has none
 */
function ownClass (objectsJson) {
  return Object.values(objectsJson.instances || {})
    .find(function (instance) { return instance.type === 'long_class_specifier' }) || {}
}

/**
 * Split the references of a package into the sequences worth testing and the
 * rest, deriving the split from the references themselves.
 *
 * Two fields carry everything needed:
 *   * `class_prefixes`, on the entry a file holds for its own class, separates
 *     a sequence from the package file, which is not a sequence at all.
 *   * `instanceOf`, which only the per instantiation files carry, and the
 *     `type_specifier` of a component name the class an instantiation came
 *     from. The union of those names over the package is exactly its set of
 *     sub-sequence classes.
 *
 * The class file of a sub-sequence is deliberately not a test case: its
 * parameters take their values at the point of instantiation, so it still holds
 * unresolved expressions, and the per instantiation files hold the resolved
 * ones. Adding a sequence to a package therefore needs no edit here.
 *
 * @param {string} dir - directory holding the reference objects json
 * @returns {{mainCases: string[], instanceCases: string[], testCases: string[]}}
 *   the top level sequences, the instantiations of sub-sequences, and the two
 *   concatenated, each in the order the directory lists them
 */
function testCaseNames (dir) {
  const names = jsonBaseNames(dir)
  const objectsJsons = new Map(names.map(function (name) {
    return [name, readObjects(dir, name)]
  }))

  // Every class that some instantiation in this package came from, whether it
  // got a file of its own or kept the class as its type.
  const subSequenceClasses = new Set()
  objectsJsons.forEach(function (objectsJson) {
    Object.values(objectsJson.instances || {}).forEach(function (instance) {
      if (instance.instanceOf !== undefined) subSequenceClasses.add(instance.instanceOf)
      if (instance.type === 'element') subSequenceClasses.add(instance.type_specifier)
    })
  })

  const mainCases = []
  const instanceCases = []
  names.forEach(function (name) {
    const self = ownClass(objectsJsons.get(name))
    // Drops the package file, whose class_prefixes is 'package'.
    if (self.class_prefixes !== 'block') {
      return
    }

    // Drops the class file of a sub-sequence, which still holds expressions.
    if (subSequenceClasses.has(self.within + '.' + name)) {
      return
    }

    if (self.instanceOf === undefined) {
      mainCases.push(name)
    } else {
      instanceCases.push(name)
    }
  })

  return { mainCases, instanceCases, testCases: mainCases.concat(instanceCases) }
}

/**
 * The sub-sequence files one sequence pulls in, transitively.
 *
 * @param {string} dir - directory holding the objects json
 * @param {string} name - base name of the sequence to start from
 * @returns {string[]} the base names of the files reached, in the order found
 */
function subSequenceFiles (dir, name) {
  const found = []
  const pending = [name]

  while (pending.length > 0) {
    const objectsJson = readObjects(dir, pending.shift())
    Object.values(objectsJson.instances || {}).forEach(function (instance) {
      if (instance.subInstanceDefinition === undefined) return

      const within = ownClass(objectsJson).within
      const file = (within === undefined || within === null || within === '')
        ? instance.subInstanceDefinition
        : instance.subInstanceDefinition.slice(within.length + 1)

      if (found.includes(file)) return
      found.push(file)
      pending.push(file)
    })
  }
  return found
}

module.exports.jsonBaseNames = jsonBaseNames
module.exports.objectsJsonPath = objectsJsonPath
module.exports.generatedObjectsDir = generatedObjectsDir
module.exports.normalizeMoFilePaths = normalizeMoFilePaths
module.exports.readNormalizedObjects = readNormalizedObjects
module.exports.asNumbers = asNumbers
module.exports.compare = compare
module.exports.parameterValue = parameterValue
module.exports.modificationValue = modificationValue
module.exports.removeOutputDirs = removeOutputDirs
module.exports.diffDir = diffDir
module.exports.stableStringify = stableStringify
module.exports.writeDiffArtifacts = writeDiffArtifacts
module.exports.readObjects = readObjects
module.exports.ownClass = ownClass
module.exports.testCaseNames = testCaseNames
module.exports.subSequenceFiles = subSequenceFiles
