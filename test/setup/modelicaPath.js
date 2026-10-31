/*
 * Appends the test directory to MODELICAPATH before the tests are loaded.
 *
 * The test directory contains the test libraries (such as FromModelica and ModelicaMode):
 * according to Modelica semantics, their classes can only be looked up if this directory
 * is on MODELICAPATH. The outputs are then written to <format>/<library>/, for instance
 * test/reference/json/FromModelica/.
 *
 * This file is loaded with the 'require' option of mocha, see package.json.
 */
const path = require('path')

const testDir = path.join(__dirname, '..')
const entries = (process.env.MODELICAPATH ?? '').split(path.delimiter).filter(Boolean)
if (!entries.map(p => path.resolve(p)).includes(testDir)) {
  process.env.MODELICAPATH = [...entries, testDir].join(path.delimiter)
}
