/*
 * Generates the reference files used by test/test_expressionEvaluation.js and test/test_cdlDoc.js.
 *
 * Usage, from the root directory of the repository:
 *   make generate-reference-output-doc
 *
 * The Modelica Buildings Library must be on MODELICAPATH, with the version used in .travis.yml.
 */
const fs = require('fs')
const logger = require('winston')
const os = require('os')
const path = require('path')

const cdlDoc = require('../../lib/cdlDoc.js')
const expressionEvaluation = require('../../lib/expressionEvaluation.js')
const parser = require('../../lib/parser.js')
const ut = require('../../lib/util.js')

logger.level = 'error'

const rootDir = path.join(__dirname, '..', '..')
const expressionDir = path.join(rootDir, 'test', 'expressionEvaluation')
const cdlDocDir = path.join(rootDir, 'test', 'cdlDoc')
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdlDoc-'))

/**
 * Returns the JSON representations of a Modelica file and of all its used classes,
 * as they are passed to cdlDoc.buildDoc by app.js with `-o doc`.
 *
 * @param {string} moFile - The class name or the path of the Modelica file.
 * @returns {Array} The JSON representations.
 */
function getJsons (moFile) {
  return parser.getJsons(ut.getMoFiles(moFile), 'doc', tmpDir, /* prettyPrint= */ false)
}

function write (dir, fileName, data, prettyPrint) {
  fs.writeFileSync(path.join(dir, fileName), JSON.stringify(data, null, prettyPrint ? 2 : undefined))
}

try {
  // Reference files for test/test_expressionEvaluation.js
  const expressionJsons = getJsons(path.join(expressionDir, 'Expression.mo'))
  write(expressionDir, 'Expression.json', expressionJsons, true)
  write(expressionDir, 'ExpressionParam.json',
    expressionEvaluation.getParametersAndBindings(expressionJsons[0], expressionJsons).parameters, true)

  const enableJsons = getJsons(path.join(rootDir, 'test', 'FromModelica', 'Enable.mo'))
  write(expressionDir, 'Enable.json', enableJsons, false)
  write(expressionDir, 'EnableParam.json',
    expressionEvaluation.getParametersAndBindings(enableJsons[0], enableJsons).parameters, false)
  write(expressionDir, 'EnableComponents.json', expressionEvaluation.getComponents(enableJsons[0]), true)

  // Reference files for test/test_cdlDoc.js
  const multiZoneVavJsons = getJsons('Buildings/Controls/OBC/ASHRAE/G36/AHUs/MultiZone/VAV/Controller.mo')
  write(cdlDocDir, 'MultiZoneVav.json', multiZoneVavJsons, false)
  write(cdlDocDir, 'MultiZoneVavParamAndDoc.json',
    expressionEvaluation.getParametersAndBindings(
      multiZoneVavJsons[0], multiZoneVavJsons, /* fetchDoc= */ true, /* fetchVariables= */ true),
    true)
  cdlDoc.buildDoc(multiZoneVavJsons[0], multiZoneVavJsons, JSON.parse(
    fs.readFileSync(path.join(rootDir, 'units-si.json'), 'utf8')),
  tmpDir, /* includeVariables= */ true, 'MultiZoneVavDoc')
  fs.copyFileSync(path.join(tmpDir, 'MultiZoneVavDoc.html'), path.join(cdlDocDir, 'MultiZoneVavDoc.html'))
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true })
}
