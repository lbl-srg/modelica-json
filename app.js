const fs = require('fs')
const pa = require('./lib/parser.js')
const ut = require('./lib/util.js')
const se = require('./lib/semanticExtractor.js')
const ce = require('./lib/cxfExtractor.js')
const dc = require('./lib/cdlDoc.js')
const cc = require('./lib/cdlCompliance.js')

const logger = require('winston')
const path = require('path')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Modelica parser'
})
parser.addArgument(
  ['-o', '--output'],
  {
    help: 'Specify output format.',
    choices: ['raw-json', 'json', 'modelica', 'semantic', 'cxf', 'doc', 'doc+'],
    defaultValue: 'json'
  }
)
parser.addArgument(
  ['-l', '--log'],
  {
    help: "Logging level, 'info' is the default.",
    choices: ['error', 'warn', 'info', 'verbose', 'debug'],
    defaultValue: 'info'
  }
)
parser.addArgument(
  ['-m', '--mode'],
  {
    help: "Parsing mode: 'cdl' (default) or 'modelica' with the 'cxf' output. 'modelica' mode should be used if translating a CDL instance within a Modelica model into CXF.",
    choices: ['cdl', 'modelica'],
    defaultValue: 'cdl'
  }
)
parser.addArgument(
  ['--exclude'],
  {
    help: "Pattern of the names of the classes given by -f/--file that are neither parsed, validated nor written, such as '**.Validation'. The classes used by the other classes are always parsed and validated, whatever their name. '*' matches within one component of the class name, '**' matches across components, and '|' separates alternatives, at the top level or in parentheses. A pattern that matches a package also excludes the classes in this package. This option can be repeated.",
    action: 'append',
    defaultValue: []
  }
)
parser.addArgument(
  ['-f', '--file'],
  {
    help: "Filename or packagename that contains the top-level Modelica class, or a json file when the output format is 'modelica'.",
    required: true
  }
)
parser.addArgument(
  ['-d', '--directory'],
  {
    help: 'Specify output directory, with the default being the current.',
    defaultValue: 'current'
  }
)
parser.addArgument(
  ['-p', '--prettyPrint'],
  {
    help: 'Pretty print JSON output. The -o/--output should be raw-json/json/cxf.',
    action: 'storeTrue'
  }
)
parser.addArgument(
  ['--elementary'],
  {
    help: 'If this flag is present, generate CXF of elementary blocks in addition to composite blocks. -o/--output should be cxf.',
    action: 'storeTrue'
  }
)
parser.addArgument(
  ['--cxfCore'],
  {
    help: 'If this flag is present, generate CXF-core.jsonld. -o/--output should be cxf, -f/--file should be path/to/CDL and --elementary flag must be used.',
    action: 'storeTrue'
  }
)

const args = parser.parseArgs()

const logFile = 'modelica-json.log'
try {
  fs.unlinkSync(logFile)
} catch (ex) {}

logger.configure({
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: logFile })
  ],
  handleExceptions: true,
  humanReadableUnhandledException: true
})
logger.cli()

logger.level = args.log

if (args.output === 'modelica' && !args.file.endsWith('.json')) {
  throw new Error('Modelica output requires the input file (-f) to be a json file.')
}

if (args.output !== 'modelica' && args.file.endsWith('.json')) {
  throw new Error("The json input file required only when the output format (-o) is 'modelica'.")
}

if (args.output === 'modelica' && args.exclude.length > 0) {
  throw new Error('The option --exclude only applies to outputs that read .mo files.')
}

const isExcluded = ut.getExcludeFilter(args.exclude)
let jsons = [] // Array of json representations of all mo files recursively instantiated by the top-level class
let moFiles = [] // Modelica files given by --file

if (args.output === 'modelica') {
  pa.convertToModelica(args.file, args.directory, false)
} else {
  // Get mo files array
  if (args.elementary || args.cxfCore) {
    if (!args.output === 'cxf') {
      throw new Error('In order to generate CXF (jsonld) of elementary blocks, -o/--output should be cxf.')
    }
  }
  if (args.cxfCore) {
    if (!args.file.endsWith('CDL') && !args.file.endsWith('cdl')) {
      throw new Error('In order to generate CXF-core.jsonld containing all elementary blocks, -f/--file should be path/to/CDL.')
    }
    if (!args.elementary) {
      throw new Error('In order to generate CXF-core.jsonld containing all elementary blocks, --elementary flag must be used.')
    }
  }
  moFiles = ut.getMoFiles(args.file)
  if (moFiles.length === 0) {
    throw new Error(`Cannot find the Modelica file, package or class ${args.file}.`)
  }
  // Parse the json representation for moFiles.
  // This is synchronous, so that an error stops the program before the outputs are processed below.
  jsons = pa.getJsons(moFiles, args.output, args.directory, args.prettyPrint, args.elementary, args.cxfCore, args.mode, isExcluded)
  if (args.output === 'semantic') {
    se.getSemanticInformation(args.file, args.directory)
  }
  if (args.output === 'cxf' && args.cxfCore && args.elementary) {
    ce.getCxfCore(args.file, args.directory, args.prettyPrint)
  } else if (args.output === 'cxf' && !args.cxfCore && !args.elementary && args.mode === 'modelica') {
    ce.getCxfFromModelica(args.file, args.directory, args.prettyPrint)
  }
  if (args.output === 'doc' || args.output === 'doc+') {
    const unitData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'units-si.json'), 'utf8'))
    const includeVariables = (args.output === 'doc+')
    dc.buildDoc(jsons[0], jsons, unitData, args.directory, includeVariables)
  }
}

if (args.output === 'json') {
  const errors = (args.mode === 'cdl')
    ? cc.checkCdlCompliance(moFiles.filter(moFile => !isExcluded(ut.getClassName(moFile))), jsons,
      { schema: path.join(__dirname, 'schema-cdl-mbl.json') })
    : getModelicaErrors(jsons)
  errors.forEach(({ className, message }) => {
    console.log('--------------------------')
    console.log(`Class ${className} is not valid:`)
    console.log(message)
    console.log('--------------------------')
  })
  if (errors.length > 0) {
    process.exit(1)
  }
}

/**
 * Validate classes against schema-modelica-mbl.json.
 * The Modelica Standard Library is left out, as it does not follow the project rules.
 * This cannot be done with '--exclude', which only applies to the classes given by '--file':
 * the classes they use are always validated.
 *
 * @param {Array<Object>} jsons simplified JSON representations of the classes
 * @returns {Array<{className: string, message: string}>} errors, empty if all classes are valid
 */
function getModelicaErrors (jsons) {
  const schema = path.join(__dirname, 'schema-modelica-mbl.json')
  return jsons.flatMap((json) => {
    const className = ut.getClassNameFromJson(json)
    const message = (className === 'Modelica' || className.startsWith('Modelica.')) ? null : ut.getSchemaErrors(json, schema)
    return message === null ? [] : [{ className, message }]
  })
}
