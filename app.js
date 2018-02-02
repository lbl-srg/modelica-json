const path = require('path')
const fs = require('fs')
const pa = require('./lib/parser.js')

const logger = require('winston')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'CDL parser'
})
parser.addArgument(
  [ '-f', '--file' ],
  {
    help: 'Filename that contains the top-level Modelica class.',
    required: true
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
  [ '-w', '--write' ],
  {
    help: 'Specify output format.',
    choices: ['html', 'json', 'json-simplified'],
    defaultValue: 'html'
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

// Parse the json representation for the model with file name args.file
pa.getJSON(args.file, args.write).then(function (json) {
  const idx = args.file.lastIndexOf(path.sep)
  const outputFileBase = args.file.slice(idx + 1, -3)
  var outFile
  if (args.write === 'json') {
    outFile = outputFileBase + '.json'
  } else if (args.write === 'json-simplified') {
    outFile = outputFileBase + '-simplified.json'
  } else {
    outFile = outputFileBase + '.html'
  }
  pa.exportJSON(json, outFile, args.write)
})
