const ut = require('./lib/util.js')
const logger = require('winston')
const fs = require('fs')
const path = require('path')

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
    help: "Schema to validate against: 'cdl' (default) and 'modelica' check the specifications only, 'cdl-mbl' and 'modelica-mbl' add the project rules of the Modelica Buildings Library.",
    choices: ['cdl', 'cdl-mbl', 'modelica', 'modelica-mbl'],
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
const schema = path.join(__dirname, `schema-${args.mode}.json`)
const errors = ut.getSchemaErrors(JSON.parse(fs.readFileSync(args.file, 'utf8')), schema)
if (errors !== null) {
  console.log(`Json file ${args.file} is not valid:`)
  console.log(errors)
  process.exit(1)
}
