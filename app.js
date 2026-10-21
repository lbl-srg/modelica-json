const fs = require('fs')
const pa = require('./lib/parser.js')
const ut = require('./lib/util.js')
const se = require('./lib/semanticExtractor.js')
const ce = require('./lib/cxfExtractor.js')
const dc = require('./lib/cdlDoc.js')

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
  ['--validateCdlSchema'],
  {
    help: 'Validate the JSON output against schema-cdl.json. The default is to use schema-modelica.json.',
    action: 'storeTrue'
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
parser.addArgument(
  ['--exportCxfFromModelica'],
  {
    help: 'Export CXF from Modelica models by parsing for the __cdl(isControls=true) annotation.',
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

if (args.output === 'modelica') {
  pa.convertToModelica(args.file, args.directory, false)
} else {
  // Validation for exportCxfFromModelica
  if (args.exportCxfFromModelica && args.output !== 'cxf') {
    throw new Error('The --exportCxfFromModelica flag can only be used when the output format (-o) is "cxf".')
  }

  // Get mo files array
  if (args.cxfCore) {
    if (args.output !== 'cxf') {
      throw new Error('In order to generate CXF-core.jsonld containing all elementary blocks, -o/--output should be cxf.')
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
  let jsons // Array of json representations of all mo files recursively instantiated by the top-level class
  const completedJsonGeneration = new Promise(
    function (resolve, reject) {
      const moFiles = ut.getMoFiles(args.file)
      // Parse the json representation for moFiles
      jsons = pa.getJsons(moFiles, args.output, args.directory, args.prettyPrint, args.elementary, args.cxfCore, args.validateCdlSchema, args.exportCxfFromModelica)
      resolve(0)
    }
  )
  completedJsonGeneration.then(function () {
    if (args.output === 'semantic') {
      se.getSemanticInformation(args.file, args.directory)
    }
    if (args.output === 'cxf' && args.cxfCore && args.elementary) {
      ce.getCxfCore(args.file, args.directory, args.prettyPrint)
    } else if (args.output === 'cxf' && !args.cxfCore && !args.elementary && args.exportCxfFromModelica) {
      const moFiles = ut.getMoFiles(args.file)
      moFiles.forEach(moFile => {
        ce.getCxfFromModelica(moFile, args.directory, args.prettyPrint)
      })
    }
    if (args.output === 'doc' || args.output === 'doc+') {
      const unitData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'units-si.json'), 'utf8'))
      const includeVariables = (args.output === 'doc+')
      dc.buildDoc(jsons[0], jsons, unitData, args.directory, includeVariables)
    }
  })
}

if (args.output === 'json' || args.output === 'cxf') {
  const jsonDir = (args.directory === 'current') ? process.cwd() : args.directory
  let jsonFiles = ut.findFilesInDir(path.join(jsonDir, 'json'), '.json')

  // exclude CDL folder and possibly Modelica folder
  const pathSep = path.sep
  const modelicaPath = path.join(pathSep, 'Modelica', pathSep)
  jsonFiles = jsonFiles.filter(obj => !obj.includes(modelicaPath))

  for (let i = 0; i < jsonFiles.length; i++) {
    const eachFile = jsonFiles[i]

    if (args.output === 'json') {
      ut.jsonSchemaValidation(false, eachFile, 'json', path.join(__dirname, 'schema-modelica.json'))
    }

    // Validation against schema-cdl.json is dependent on the --validateCdlSchema flag,
    // OR if output is CXF (because intermediate ASTs for CXF must be CDL compliant).
    // CDL elementary blocks are not validated against schema-cdl.json.
    if (args.validateCdlSchema || args.output === 'cxf') {
      const moFilePath = eachFile.replace('.json', '.mo')
      if (!ut.checkIfCdlElementaryBlockOrPackage(moFilePath, false)) {
        ut.jsonSchemaValidation(true, eachFile, 'json', path.join(__dirname, 'schema-cdl.json'))
      }
    }
  }
  if (args.validateCdlSchema && (ut.failingSchema > 0 || pa.warnCounter > 0)) {
    process.exit(1)
  }
}
