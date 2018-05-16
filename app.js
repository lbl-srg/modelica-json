const path = require('path')
const fs = require('fs')
const pa = require('./lib/parser.js')

const logger = require('winston')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Buildings modelica parser'
})
parser.addArgument(
  [ '-f', '--file' ],
  {
    help: 'Filename that contains the top-level Modelica class.',
    required: true
  }
)
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
  [ '-obc', '--obc' ],
  {
    help: "Only parse models in Buildings.OBC, 'true' is the default",
    choices: ['true', 'false'],
    defaultValue: 'true'
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

if (args.obc === 'true' && !args.file.includes('Controls/OBC')) {
  throw new Error('Wrong OBC input model: ' + args.file)
}

// Parse the json representation for the model with file name args.file
const json = pa.getJSON(args.file, args.obc, args.output)
const idx = args.file.lastIndexOf(path.sep)
const outputFileBase = args.file.slice(idx + 1, -3)
var outFile
if (args.output === 'json') {
  outFile = outputFileBase + '.json'
} else if (args.output === 'json-simplified') {
  outFile = outputFileBase + '-simplified.json'
} else {
  outFile = outputFileBase + '.html'
}
pa.exportJSON(json, outFile, args.output)
