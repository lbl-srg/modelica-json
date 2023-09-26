const ut = require('./lib/util.js')
const logger = require('winston')
const fs = require('fs')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

const validation = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Json file validation against schema'
})

validation.addArgument(
  ['-m', '--mode'],
  {
    help: "Parsing mode, single CDL model or buildings modelica library package, 'cdl' is the default.",
    choices: ['cdl', 'modelica'],
    defaultValue: 'cdl'
  }
)

validation.addArgument(
  ['-f', '--file'],
  {
    help: 'JSON file to test against schema',
    required: true
  }
)

const args = validation.parseArgs()

const logFile = 'validation.log'
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

// Validation
ut.jsonSchemaValidate(args.mode, args.file)
