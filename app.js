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
    choices: ['raw-json', 'json'],
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

// Get mo files array
var moFiles = ut.getMoFiles(args.file)

// Parse the json representation for moFiles
var json = pa.getJsons(moFiles, args.mode, args.output, args.directory)
