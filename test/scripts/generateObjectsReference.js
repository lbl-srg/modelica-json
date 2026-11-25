'use strict'

/*
 * Generates the reference files of the instances and connections ('objects') used by test/test_parser.js.
 * These files are intermediate files of the outputs 'semantic' and 'cxf' of app.js, which does not write them.
 *
 * Usage, from the root directory of the repository, as in 'make generate-reference-output':
 *   node test/scripts/generateObjectsReference.js <output directory> <Modelica file>...
 *
 * The objects of each Modelica file and of all its used classes are written to '<output directory>/objects/'.
 * The JSON files found in '<output directory>/json/' are used, rather than parsing the files again.
 */
const fs = require('fs')
const logger = require('winston')
const os = require('os')
const path = require('path')

const parser = require('../../lib/parser.js')
const ut = require('../../lib/util.js')

logger.level = 'error'

const [outputDir, ...moFiles] = process.argv.slice(2)
if (outputDir === undefined || moFiles.length === 0) {
  console.error('Usage: node test/scripts/generateObjectsReference.js <output directory> <Modelica file>...')
  process.exit(2)
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'objects-'))
try {
  // Each file is parsed on its own, as with one call of app.js per file.
  moFiles.forEach((moFile) => {
    parser.getJsons(ut.getMoFiles(moFile), { outputFormat: 'objects', directory: tmpDir, cacheDirectories: [outputDir], prettyPrint: true })
  })
  // Only the objects are written: the JSON files are generated with 'app.js -o json'.
  ut.copyFolderSync(path.join(tmpDir, 'objects'), path.join(outputDir, 'objects'))
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true })
}
