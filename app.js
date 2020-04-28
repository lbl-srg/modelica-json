const fs = require('fs')
const pa = require('./lib/parser.js')
const ut = require('./lib/util.js')

const logger = require('winston')

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
    choices: ['html', 'raw-json', 'json', 'docx'],
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
var moFiles = ut.getMoFiles(args.mode, args.file)

// Parse the json representation for moFiles
//var json = pa.getJSON(moFiles, args.mode, args.output)
var jsonOp = pa.getJSON(moFiles, args.mode, args.output)
// Get the name array of output files
var outFile = ut.getOutFile(args.mode, args.file, args.output, args.directory, moFiles, jsonOp)
pa.exportJSON(jsonOp, outFile, args.output, args.mode, args.directory)
setTimeout(function () { ut.jsonSchemaValidate(args.mode, outFile[0], args.output) }, 100)

if (args.mode === "cdl"){
  json = [jsonOp]
}
else {
  json = jsonOp
}

var extendedMoFiles = []
for (var jsonDataIndex in json) {
  var jsonData = json[jsonDataIndex]
  for (var singleJsonIndex in jsonData) {
    var singleJsonData = jsonData[singleJsonIndex]
    if ('class_definition' in singleJsonData) {
      var classDefinitionArray = singleJsonData.class_definition
      for (classDefinitionArrayIndex in classDefinitionArray) {
        var classDefinitionObject = classDefinitionArray[classDefinitionArrayIndex]
        if ('class_specifier' in classDefinitionObject) {
          var classSpecifierObject = classDefinitionObject.class_specifier
          if ('long_class_specifier' in classSpecifierObject) {
            longClassSpecifierObject = classSpecifierObject.long_class_specifier
            if ('composition' in longClassSpecifierObject) {
              var compositionObject = longClassSpecifierObject.composition
              if ('element_list' in compositionObject) {
                var elementListObject = compositionObject.element_list
                if ('element' in elementListObject) {
                  var elementArray = elementListObject.element
                  for (elementIndex in elementArray) {
                    var elementObject = elementArray[elementIndex]
                    if ('extends_clause' in elementObject){
                      var extendsClauseObject = elementObject.extends_clause
                      if ('name' in extendsClauseObject) {
                        var name = extendsClauseObject.name
                        if (name.startsWith("Buildings")){
                          name = name.replace(/\./g,'/')
                          name = name.substring(10)
                          if (args.mode === "modelica") {
                            name = name.substring(0, name.lastIndexOf('/'))
                            extendedMoFiles = extendedMoFiles.concat(ut.getMoFiles(args.mode, name))
                          }
                          else {
                            name = name+".mo"
			    extendedMoFiles = extendedMoFiles.concat(ut.getMoFiles(args.mode, name))
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
console.log(extendedMoFiles)
var extendedJsonOutput = []
for (var extendedFileIndex in extendedMoFiles) {
  var extendedFilename = extendedMoFiles[extendedFileIndex]
  extendedJsonOutput.push(pa.getJsons(extendedFilename, args.mode, args.output))
}


if (args.mode === 'cdl') {
  for (var singleExtendedJsonOutputIndex in extendedJsonOutput) { 
    var singleExtendedMoFile = extendedMoFiles[singleExtendedJsonOutputIndex]
    var singleExtendedJsonOutput = extendedJsonOutput[singleExtendedJsonOutputIndex]
    var outFile2 = ut.getOutFile(args.mode, args.file, args.output, args.directory, singleExtendedMoFile, singleExtendedJsonOutput)
    pa.exportJSON(singleExtendedJsonOutput, outFile2, args.output, args.mode, args.directory)
  }
}
else{
  var outFile2 = ut.getOutFile(args.mode, args.file, args.output, args.directory, extendedMoFiles, extendedJsonOutput)
  pa.exportJSON(extendedJsonOutput, outFile, args.output, args.mode, args.directory)
}
