const fs = require('fs')
const pa = require('./lib/parser.js')
const ut = require('./lib/util.js')

const logger = require('winston')
const path = require('path')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Modelica parser'
})
parser.addArgument(
  [ '-o', '--output' ],
  {
    help: 'Specify output format.',
    choices: ['raw-json', 'json', 'modelica'],
    defaultValue: 'json'
  }
)
parser.addArgument(
  [ '-l', '--log' ],
  {
    help: "Logging level, 'info' is the default.",
    choices: ['error', 'warn', 'info', 'verbose', 'debug'],
    defaultValue: 'info'
  }
)
parser.addArgument(
  [ '-m', '--mode' ],
  {
    help: "Parsing mode, CDL model or a package of the Modelica Buildings library, 'cdl' is the default.",
    choices: ['cdl', 'modelica'],
    defaultValue: 'modelica'
  }
)
parser.addArgument(
  [ '-f', '--file' ],
  {
    help: "Filename or packagename that contains the top-level Modelica class, or a json file when the output format is 'modelica'.",
    required: true
  }
)
parser.addArgument(
  [ '-d', '--directory' ],
  {
    help: 'Specify output directory, with the default being the current.',
    defaultValue: 'current'
  }
)

parser.addArgument(

  [ '-p', '--prettyPrint' ],
  {
    help: 'Pretty print JSON output.',
    defaultValue: 'false'
  }
)

var args = parser.parseArgs()

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
  // Get mo files array
  var moFiles = ut.getMoFiles(args.file)
  // Parse the json representation for moFiles
  pa.getJsons(moFiles, args.mode, args.output, args.directory, args.prettyPrint)
}

if (args.output === 'json') {
  var schema
  if (args.mode === 'cdl') {
    schema = path.join(`${__dirname}`, 'schema-cdl.json')
  } else {
    schema = path.join(`${__dirname}`, 'schema-modelica.json')
  }
  var jsonFiles = ut.findFilesInDir(path.join(args.directory, 'json'), '.json')
  // exclude CDL folder and possibly Modelica folder
  var pathSep = path.sep
  var cdlPath = path.join(pathSep, 'CDL', pathSep)
  var modelicaPath = path.join('Modelica', pathSep)
  jsonFiles = jsonFiles.filter(obj => !(obj.includes(cdlPath) || obj.includes(modelicaPath)))
  // validate json schema
  // for (var i = 0; i < jsonFiles.length; i++) {
  //   var eachFile = jsonFiles[i]
  //   setTimeout(function () { ut.jsonSchemaValidation(args.mode, eachFile, 'json', schema) }, 100)
  // }
}
