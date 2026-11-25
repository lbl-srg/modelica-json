'use strict'

const fs = require('fs')
const pa = require('./lib/parser.js')
const ut = require('./lib/util.js')
const se = require('./lib/semanticExtractor.js')
const ce = require('./lib/cxfExtractor.js')
const dc = require('./lib/cdlDoc.js')
const cc = require('./lib/cdlCompliance.js')

const logger = require('winston')
const path = require('path')

const ArgumentParser = require('argparse').ArgumentParser
/// ///////////////////////////////////////

// Output formats, and the directory of '<directory>' to which each one is written
const OUTPUT_FOLDERS = {
  'raw-json': 'raw-json',
  json: 'json',
  semantic: 'semantic',
  cxf: 'cxf',
  'cxf-core': 'cxf-core',
  doc: 'doc',
  'doc+': 'doc',
  modelica: 'modelica'
}
// Outputs for which the simplified JSON representations of the input classes and of all their used classes are needed
const FULL_PARSE_OUTPUTS = ['json', 'semantic', 'doc', 'doc+']
// Outputs that parse simplified JSON representations, which can be validated
const VALIDATED_OUTPUTS = [...FULL_PARSE_OUTPUTS, 'cxf', 'cxf-core']
// Schemas of the keywords of --validate
const SCHEMAS = {
  cdl: 'schema-cdl.json',
  'cdl-mbl': 'schema-cdl-mbl.json',
  modelica: 'schema-modelica.json',
  'modelica-mbl': 'schema-modelica-mbl.json'
}
// Schema used to decide what to export to CXF: the CDL specification only
const CDL_SCHEMA = path.join(__dirname, SCHEMAS.cdl)

const parser = new ArgumentParser({
  version: require('./package.json').version,
  addHelp: true,
  description: 'Modelica parser'
})
parser.addArgument(
  ['-i', '--input'],
  {
    help: "Modelica file, package directory or class name, such as 'Buildings.Controls.OBC.CDL.Reals.Add'. " +
      "With the output 'modelica', a JSON file or a directory of JSON files."
  }
)
parser.addArgument(
  ['-f', '--file'],
  {
    help: 'Deprecated alias of -i/--input.'
  }
)
parser.addArgument(
  ['-o', '--output'],
  {
    help: 'Comma-separated list of the output formats, among ' + Object.keys(OUTPUT_FOLDERS).join(', ') +
      ". Only these outputs are written, each to '<directory>/<format>/', at the path of the class, " +
      "except 'doc+', which is written to '<directory>/doc/'. " +
      "'raw-json' and 'modelica' read the input only, the other outputs parse the input classes and all their used classes. " +
      "'cxf' exports the input class and its used classes if the input class is CDL-compliant, otherwise the instances " +
      "annotated with __cdl(isControls=true), otherwise this is an error. 'cxf-core' writes 'CXF-Core.jsonld', " +
      "with the CXF of the input classes, except the classes of the Validation packages, but not of the classes they use. The default is 'modelica' " +
      "for a JSON file or a directory that only contains JSON files, and 'json' otherwise.",
    defaultValue: null
  }
)
parser.addArgument(
  ['-d', '--directory'],
  {
    help: 'Output directory, with the default being the current directory.',
    defaultValue: '.'
  }
)
parser.addArgument(
  ['--validate'],
  {
    help: "Validate the parsed classes: 'cdl' checks the CDL compliance with the CDL specification only, " +
      "'cdl-mbl' adds the project rules of the Modelica Buildings Library, 'modelica' validates the classes " +
      "against schema-modelica.json, and 'modelica-mbl' adds the project rules. Any other value is the path to " +
      "a self-contained JSON schema. With 'cdl' and 'cdl-mbl', the input classes and all their used classes are " +
      'checked, except the CDL elementary blocks and the extension blocks. Otherwise, the input classes and all ' +
      "their used classes are validated, but with 'modelica-mbl', only the classes of the Modelica Buildings Library. " +
      'With the output cxf, the exported classes are validated. ' +
      'If a class is not valid, all errors are printed, the output files are written, and the run fails. ' +
      'Without this option, nothing is validated, except for the output cxf, which always checks the CDL compliance ' +
      'of the exported classes with the CDL specification.'
  }
)
parser.addArgument(
  ['--exclude'],
  {
    help: "Pattern of the names of the input classes that are neither parsed, validated nor written, such as '**.Validation'. " +
      'The input classes are the class given by -i/--input or, for a package or a directory, all the classes stored in it ' +
      'and in its subdirectories. The classes used by the other classes are always parsed and validated, whatever their name, ' +
      "even if they are input classes that match a pattern. '*' matches within one component of the class name, '**' matches " +
      "across components, and '|' separates alternatives, at the top level or in parentheses. A pattern that matches a package " +
      'also excludes the classes in this package. Patterns must be quoted. This option can be repeated.',
    action: 'append',
    defaultValue: []
  }
)
parser.addArgument(
  ['--elementary'],
  {
    help: 'With the output cxf, also write the CXF of the CDL elementary blocks used by the exported classes.',
    action: 'storeTrue'
  }
)
parser.addArgument(
  ['-p', '--pretty-print', '--prettyPrint'],
  {
    help: 'Pretty print the JSON outputs.',
    action: 'storeTrue',
    dest: 'prettyPrint'
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
  ['-m', '--mode'],
  {
    help: "Deprecated: '-m cdl' with the output json is replaced with '--validate cdl-mbl', and is otherwise ignored, " +
      "as is '-m modelica'.",
    choices: ['cdl', 'modelica'],
    defaultValue: null
  }
)
parser.addArgument(
  ['--cxfCore'],
  {
    help: "Deprecated: replaces the output cxf with the output cxf-core. '--elementary', which this option required, is not needed, " +
      'as cxf-core contains the CXF of the input classes, whether they are elementary blocks or not.',
    action: 'storeTrue'
  }
)

const logFile = 'modelica-json.log'

/**
 * Check if the input is a JSON file, or a directory that contains JSON files and no Modelica file.
 * This selects the default output.
 *
 * @param {string} input value of -i/--input
 * @returns {boolean} true for a JSON input
 */
function isJsonInput (input) {
  if (input.endsWith('.json')) {
    return true
  }
  if (!fs.existsSync(input) || !fs.statSync(input).isDirectory()) {
    return false
  }
  const files = fs.readdirSync(input, { recursive: true }).map(String)
  return files.some(file => file.endsWith('.json')) && !files.some(file => file.endsWith('.mo'))
}

/**
 * Parse and check the arguments.
 *
 * @returns {{args: Object, warnings: string[]}} arguments, completed with 'outputs', 'files', 'schema'
 *     and 'isExcluded', and the deprecation warnings
 */
function getArguments () {
  const args = parser.parseArgs()
  const warnings = []

  // Deprecated options
  if (args.file !== null) {
    if (args.input !== null) {
      parser.error('-f/--file is a deprecated alias of -i/--input, so only one of them can be used.')
    }
    warnings.push('-f/--file is deprecated: use -i/--input.')
    args.input = args.file
  }
  if (args.input === null) {
    parser.error('the following arguments are required: -i/--input')
  }
  if (args.output === null) {
    args.output = isJsonInput(args.input) ? 'modelica' : 'json'
  }
  args.outputs = [...new Set(args.output.split(',').map(obj => obj.trim()).filter(Boolean))]
  const unknown = args.outputs.filter(obj => !(obj in OUTPUT_FOLDERS))
  if (unknown.length > 0 || args.outputs.length === 0) {
    parser.error(`argument "-o/--output": invalid choice: '${args.output}' (choose from ${Object.keys(OUTPUT_FOLDERS).join(', ')}, separated by commas)`)
  }
  if (args.cxfCore) {
    warnings.push('--cxfCore is deprecated: use -o cxf-core, which does not need --elementary.')
    args.outputs = [...new Set(args.outputs.map(obj => obj === 'cxf' ? 'cxf-core' : obj).concat('cxf-core'))]
    args.elementary = args.elementary && args.outputs.includes('cxf')
  }
  if (args.mode !== null) {
    if (args.mode === 'cdl' && args.outputs.includes('json') && args.validate === null) {
      warnings.push('-m/--mode is deprecated: -m cdl is replaced with --validate cdl-mbl.')
      args.validate = 'cdl-mbl'
    } else {
      warnings.push('-m/--mode is deprecated and ignored: use --validate to validate the classes.')
    }
  }

  // The options must apply to the requested outputs.
  if (args.validate !== null && !args.outputs.some(obj => VALIDATED_OUTPUTS.includes(obj))) {
    parser.error(`--validate does not apply to the output ${args.outputs.join(',')}, which has nothing to validate.`)
  }
  if (args.elementary && !args.outputs.includes('cxf')) {
    parser.error('--elementary only applies to the output cxf.')
  }
  if (args.exclude.length > 0 && args.outputs.includes('modelica')) {
    parser.error('--exclude does not apply to the output modelica, which reads JSON files.')
  }
  if (args.outputs.includes('doc') && args.outputs.includes('doc+')) {
    parser.error('The outputs doc and doc+ are written to the same files, so only one of them can be requested.')
  }

  // The output must match the type of the input.
  const isModelica = args.outputs.includes('modelica')
  if (isModelica && args.outputs.length > 1) {
    parser.error('The output modelica reads JSON files, so it cannot be combined with the other outputs, which read Modelica files.')
  }
  if (args.input.endsWith('.json') && !isModelica) {
    parser.error('A JSON input requires the output modelica.')
  }
  if (isModelica) {
    if (fs.existsSync(args.input) && fs.statSync(args.input).isDirectory()) {
      args.files = ut.findFilesInDir(args.input, '.json').filter(obj => obj.endsWith('.json'))
    } else if (args.input.endsWith('.json') && fs.existsSync(args.input)) {
      args.files = [args.input]
    } else {
      parser.error(`The output modelica requires a JSON file or a directory as input, and ${args.input} is neither.`)
    }
    if (args.files.length === 0) {
      parser.error(`The directory ${args.input} contains no JSON file.`)
    }
  } else {
    args.files = ut.getMoFiles(args.input)
    if (args.files.length === 0) {
      parser.error(`Cannot find the Modelica file, package or class ${args.input}.`)
    }
  }

  // A schema passed with --validate must exist.
  args.schema = null
  if (args.validate !== null) {
    args.schema = (args.validate in SCHEMAS) ? path.join(__dirname, SCHEMAS[args.validate]) : path.resolve(args.validate)
    if (!fs.existsSync(args.schema) || !fs.statSync(args.schema).isFile()) {
      parser.error(`--validate ${args.validate} is neither one of ${Object.keys(SCHEMAS).join(', ')}, nor the path of a file.`)
    }
    try {
      ut.getCompiledSchemaValidator(args.schema)
    } catch (e) {
      parser.error(`The schema ${args.schema} cannot be compiled: ${e.message}`)
    }
  }

  // A pattern passed with --exclude must be valid.
  try {
    args.isExcluded = ut.getExcludeFilter(args.exclude)
  } catch (e) {
    parser.error(e.message)
  }
  return { args, warnings }
}

/**
 * Generate the outputs in a working directory.
 *
 * @param {Object} args arguments, see 'getArguments'
 * @param {string} workDir working directory, to which all files are written, including the intermediate files
 * @param {string} outDir output directory, in which the simplified JSON representations of earlier runs are looked up
 * @returns {Array<{className: string, message: string}>} errors
 */
function run (args, workDir, outDir) {
  const { outputs, prettyPrint } = args
  const parse = (moFiles, options) => pa.getJsons(moFiles, { directory: workDir, cacheDirectories: [outDir], prettyPrint, ...options })
  // Classes given by -i/--input, except those excluded
  const inputs = args.files.filter(moFile => !args.isExcluded(ut.getClassName(moFile)))
  if (inputs.length === 0) {
    logger.warn(`All the classes of ${args.input} are excluded.`)
  }
  // Register the library roots of all input files, see 'ut.addLibraryRoot'.
  args.files.forEach(moFile => ut.addLibraryRoot(moFile))

  const errors = []
  const allJsons = [] // Simplified JSON representations of all parsed classes
  const validated = new Set() // Classes to validate with --validate

  if (outputs.includes('raw-json')) {
    parse(inputs, { outputFormat: 'raw-json' })
  }

  // Input classes and all their used classes, except, for the output cxf only,
  // the library classes that are not needed for the export of controls instances.
  const isFullParse = outputs.some(obj => FULL_PARSE_OUTPUTS.includes(obj))
  let jsons = []
  if (isFullParse || outputs.includes('cxf')) {
    jsons = parse(inputs, {
      outputFormat: outputs.some(obj => ['semantic', 'cxf'].includes(obj)) ? 'objects' : 'json',
      isFollowed: isFullParse ? () => true : pa.isFollowedForControlsExport
    })
    allJsons.push(...jsons)
  }
  if (isFullParse) {
    inputs.forEach(moFile => validated.add(moFile))
  }

  if (outputs.includes('semantic')) {
    inputs.forEach(moFile => se.getSemanticInformation(ut.getClassName(moFile), workDir, path.join(workDir, 'semantic')))
  }

  if (outputs.includes('doc') || outputs.includes('doc+')) {
    const unitData = JSON.parse(fs.readFileSync(path.join(__dirname, 'units-si.json'), 'utf8'))
    inputs.forEach((moFile) => {
      const json = jsons.find(obj => path.resolve(obj.fullMoFilePath) === path.resolve(moFile))
      if (json === undefined || /\bpackage\b/.test(json.stored_class_definitions[0].class_prefixes)) {
        return
      }
      const htmlFile = path.join(workDir, 'doc', ut.getClassPath(moFile).replace(/\.mo$/, '.html'))
      dc.buildDoc(json, jsons, unitData, path.dirname(htmlFile), outputs.includes('doc+'), undefined, path.basename(htmlFile))
    })
  }

  if (outputs.includes('cxf')) {
    // The input classes that are CDL-compliant are exported, with their used classes.
    const compliance = cc.checkCdlComplianceOfEachFile(inputs, jsons, { schema: CDL_SCHEMA })
    const compliant = inputs.filter(moFile => compliance.get(moFile).length === 0)
    // Otherwise, the instances annotated with __cdl(isControls=true) are exported.
    const controlFiles = []
    inputs.filter(moFile => compliance.get(moFile).length > 0).forEach((moFile) => {
      const controlFile = ce.getCxfFromModelica(moFile, workDir, prettyPrint)
      if (controlFile === null) {
        errors.push(...compliance.get(moFile), {
          className: ut.getClassName(moFile),
          message: 'The class is not CDL-compliant, and it has no instance annotated with __cdl(isControls=true), so it cannot be exported to CXF.'
        })
      } else {
        controlFiles.push(controlFile)
      }
    })
    const exported = [...new Set(compliant.concat(controlFiles))]
    if (exported.length > 0) {
      const cxfJsons = parse(exported, { outputFormat: 'cxf', elementary: args.elementary })
      allJsons.push(...cxfJsons)
      // The classes of the controls instances must also be CDL-compliant.
      errors.push(...cc.checkCdlCompliance(controlFiles, cxfJsons, { schema: CDL_SCHEMA }))
    }
    exported.forEach(moFile => validated.add(moFile))
  }

  if (outputs.includes('cxf-core')) {
    const isValidation = ut.getExcludeFilter(['**.Validation'])
    const coreInputs = inputs.filter(moFile => !isValidation(ut.getClassName(moFile)))
    // The CXF of the input classes is generated in another directory, as it includes
    // the elementary blocks, which are not written with the output cxf without --elementary.
    const coreDir = path.join(workDir, '.cxf-core')
    allJsons.push(...pa.getJsons(coreInputs, { outputFormat: 'cxf', directory: coreDir, cacheDirectories: [workDir, outDir], prettyPrint }))
    const cxfFiles = coreInputs.map(moFile => ut.getOutputFile(moFile, 'cxf', coreDir)).filter(obj => fs.existsSync(obj))
    ce.getCxfCore(cxfFiles, path.join(workDir, 'cxf-core', 'CXF-Core.jsonld'), prettyPrint)
    coreInputs.forEach(moFile => validated.add(moFile))
  }

  if (args.schema !== null && validated.size > 0) {
    const moFiles = [...validated]
    if (['cdl', 'cdl-mbl'].includes(args.validate)) {
      errors.push(...cc.checkCdlCompliance(moFiles, allJsons, { schema: args.schema }))
    } else {
      // The project rules only apply to the Modelica Buildings Library.
      const isValidated = (args.validate === 'modelica-mbl')
        ? className => className === 'Buildings' || className.startsWith('Buildings.')
        : () => true
      errors.push(...cc.checkSchema(moFiles, allJsons, { schema: args.schema, isValidated }))
    }
  }

  // An error may be found by several checks.
  const keys = errors.map(({ className, message }) => `${className}\n${message}`)
  return errors.filter((obj, i) => keys.indexOf(keys[i]) === i)
}

/**
 * Run the program.
 */
function main () {
  const { args, warnings } = getArguments()

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

  const outDir = path.resolve(args.directory)
  if (args.outputs.includes('modelica')) {
    args.files.forEach(jsonFile => pa.convertToModelica(jsonFile, outDir, false))
    return
  }

  const workDir = ut.createTempDir('modelica-json-')
  let errors
  try {
    errors = run(args, workDir, outDir)
    // Only the requested outputs are written, even if a class is not valid.
    args.outputs.map(obj => OUTPUT_FOLDERS[obj]).forEach((folder) => {
      if (fs.existsSync(path.join(workDir, folder))) {
        ut.copyFolderSync(path.join(workDir, folder), path.join(outDir, folder))
      }
    })
  } finally {
    ut.removeDir(workDir)
  }

  errors.forEach(({ className, message }) => {
    console.log('--------------------------')
    console.log(`Class ${className} is not valid:`)
    console.log(message)
    console.log('--------------------------')
  })
  if (errors.length > 0) {
    process.exitCode = 1
  }
}

main()
