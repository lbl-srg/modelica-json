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
    choices: ['html', 'raw-json', 'json', 'docx', 'svg'],
    defaultValue: 'html'
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
    defaultValue: 'cdl'
  }
)
parser.addArgument(
  [ '-f', '--file' ],
  {
    help: 'Filename or packagename that contains the top-level Modelica class.',
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
  '--strict',
  {
    help: 'Exit with code 1 if there is any warning.',
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

if (args.mode === 'modelica' && args.output === 'svg') {
  throw new Error('svg output option has not been enabled in modelica mode.')
}

// Get mo files array
var moFiles = ut.getMoFiles(args.mode, args.file)

// Parse the json representation for moFiles
var json = pa.getJSON(moFiles, args.mode, args.output)

// Get the name array of output files
var outFile = ut.getOutFile(args.mode, args.file, args.output, args.directory, moFiles, json)

pa.exportJSON(json, outFile, args.output, args.mode, args.directory)

var schema
if (args.mode === 'cdl') {
  schema = path.join(`${__dirname}`, 'schema-CDL.json')
} else {
  schema = path.join(`${__dirname}`, 'schema-modelica.json')
}

setTimeout(function () { ut.jsonSchemaValidate(args.mode, outFile[0], args.output, schema) }, 100)

if (args.strict === 'true' && pa.warnCounter > 0) {
  process.exit(1)
}
