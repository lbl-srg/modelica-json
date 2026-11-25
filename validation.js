'use strict'

const ut = require('./lib/util.js')
const logger = require('winston')
const fs = require('fs')
const path = require('path')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

const validation = new ArgumentParser({
  version: require('./package.json').version,
  addHelp: true,
  description: 'Json file validation against schema'
})

validation.addArgument(
  ['-i', '--input'],
  {
    help: 'JSON file to test against schema'
  }
)
validation.addArgument(
  ['-f', '--file'],
  {
    help: 'Deprecated alias of -i/--input.'
  }
)
validation.addArgument(
  ['--validate'],
  {
    help: "Schema to validate against: 'cdl' (default) and 'modelica' check the specifications only, " +
      "'cdl-mbl' and 'modelica-mbl' add the project rules of the Modelica Buildings Library. " +
      'Any other value is the path to a self-contained JSON schema.'
  }
)
validation.addArgument(
  ['-m', '--mode'],
  {
    help: "Deprecated: '-m cdl' and '-m modelica' are replaced with '--validate cdl-mbl' and '--validate modelica-mbl', " +
      'as the schemas included the project rules of the Modelica Buildings Library when this option was introduced.',
    choices: ['cdl', 'modelica']
  }
)
validation.addArgument(
  ['-l', '--log'],
  {
    help: "Logging level, 'info' is the default.",
    choices: ['error', 'warn', 'info', 'verbose', 'debug'],
    defaultValue: 'info'
  }
)

const args = validation.parseArgs()
const warnings = []
if (args.file !== null) {
  if (args.input !== null) {
    validation.error('-f/--file is a deprecated alias of -i/--input, so only one of them can be used.')
  }
  warnings.push('-f/--file is deprecated: use -i/--input.')
  args.input = args.file
}
if (args.input === null) {
  validation.error('the following arguments are required: -i/--input')
}
if (args.mode !== null) {
  if (args.validate !== null) {
    validation.error('-m/--mode is deprecated and replaced with --validate, so only one of them can be used.')
  }
  args.validate = `${args.mode}-mbl`
  warnings.push(`-m/--mode is deprecated: -m ${args.mode} is replaced with --validate ${args.validate}.`)
}
const keywords = ['cdl', 'cdl-mbl', 'modelica', 'modelica-mbl']
const validate = args.validate ?? 'cdl'
const schema = keywords.includes(validate) ? path.join(__dirname, `schema-${validate}.json`) : path.resolve(validate)
if (!fs.existsSync(schema)) {
  validation.error(`--validate ${validate} is neither one of ${keywords.join(', ')}, nor the path of a file.`)
}

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
warnings.forEach(warning => logger.warn(warning))

// Validation
const errors = ut.getSchemaErrors(JSON.parse(fs.readFileSync(args.input, 'utf8')), schema)
if (errors !== null) {
  console.log(`Json file ${args.input} is not valid:`)
  console.log(errors)
  process.exit(1)
}
