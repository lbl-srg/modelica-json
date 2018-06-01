const fs = require('fs')
const pa = require('./lib/parser.js')
const ut = require('./lib/util.js')

const logger = require('winston')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Buildings modelica parser'
})
parser.addArgument(
  [ '-o', '--output' ],
  {
    help: 'Specify output format.',
    choices: ['html', 'json', 'json-simplified'],
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
    help: "Specify if it is parsing single CDL model or buildings modelica library package, 'cdl' is the default.",
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

// if (args.obc === 'true' && !args.file.includes('Controls/OBC')) {
//  throw new Error('Wrong OBC input model: ' + args.file)
// }

// Get mo files array
var moFiles = ut.getMoFiles(args.mode, args.file)

// Parse the json representation for  moFiles
var json = pa.getJSON(moFiles, args.mode, args.output)

// Get the name array of output files
var outFile = ut.getOutFile(args.mode, args.file, args.output, moFiles, json)

pa.exportJSON(json, outFile, args.output, args.mode)
