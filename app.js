const path = require('path')
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
  [ '-f', '--file' ],
  {
    help: 'Filename or packagename that contains the top-level Modelica class.',
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
  [ '-t', '--type' ],
  {
    help: "Specify if it is parsing single CDL model or buildings modelica library package, 'cdl' is the default",
    choices: ['cdl', 'modelica'],
    defaultValue: 'cdl'
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

var moFiles = []
if (args.type === 'modelica') {
  if (args.file.includes('.mo')) {
    throw new Error('Wrong file input, it should be a packagename.')
  }
  var fileList = ut.getFiles(args.file)
  moFiles = fileList.filter(function (obj) {
    // Don't parse 'package.mo' file
    if (obj.endsWith('.mo') && !obj.includes('package.mo')) { return true } else { return false }
  })
} else {
  if (!args.file.includes('.mo')) {
    throw new Error('Wrong file input, it should be a single moFile.')
  }
  moFiles.push(args.file)
}

// Parse the json representation for the model with file moFiles
var json = pa.getJSON(moFiles, args.type, args.output)

var outFile = []
var dirBase
var dir
// Create folder: '../Json', '../Simplified', or '../Html'
if (args.type === 'modelica') {
  var idx0 = args.file.lastIndexOf(path.sep)
  if (idx0 !== -1) {
    dirBase = args.file.slice(0, idx0)
  } else {
    dirBase = args.file
  }
} else {
  var idx1 = moFiles[0].lastIndexOf(path.sep)
  dirBase = moFiles[0].slice(0, idx1)
}
if (args.output === 'json') {
  dir = path.join(dirBase, 'Json')
} else if (args.output === 'json-simplified') {
  dir = path.join(dirBase, 'Simplified')
} else {
  dir = path.join(dirBase, 'Html')
}
// Remove the existing folder
if (fs.existsSync(dir)) {
  deleteFolderRecursive(dir)
}
// Create an empty folder 'dir'
try {
  fs.mkdirSync(dir)
} catch (err) {
  console.log(err)
}

/** Get the JSON property `p` from the json data `o`
  * If the property does not exist, the function returns null
  */
const getProperty = (p, o) =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o)

// If parse type is 'cdl' and the output is 'html',
// there will be only one .html file.
if (args.output === 'html' && args.type === 'cdl') {
  outFile.push(path.join(dir, json[0].topClassName + '.html'))
// If parse type is 'modelica' and output is 'html',
// there will be one .html file for each package (it may have sub-packages)
} else if (args.output === 'html' && args.type === 'modelica') {
  // Find out names of input package and sub-packages in it
  var tempPackName = []
  for (var i = 0; i < json.length; i++) {
    var topCla = json[i][0].topClassName
    var idx2 = topCla.lastIndexOf('.')
    tempPackName.push(topCla.slice(0, idx2))
  }
  // Clean up to find the unique names
  var packName = tempPackName.filter(function (item, pos) {
    return tempPackName.indexOf(item) === pos
  })
  // Create one single html file for each package
  for (var j = 0; j < packName.length; j++) {
    outFile.push(path.join(dir, packName[j] + '.html'))
  }
} else {
  for (var k = 0; k < json.length; k++) {
    // Retrieve Json data
    var jsonData = (args.type === 'modelica') ? json[k][0] : json[k]
    var fileName
    if (args.output === 'json-simplified') {
      fileName = jsonData.topClassName + '.json'
    } else if (args.output === 'json') {
      var className
      // First, check if there is a 'within xxxx;'
      var within = getProperty(['within', 0], jsonData)
      // Get the model name
      var shortName = getProperty(
        ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'name'], jsonData)
      if (shortName) {
        className = (within) ? within + '.' + shortName : shortName
      }
      fileName = className + '.json'
    }
    outFile.push(path.join(dir, fileName))
  }
}

/** Recursively remove existing folder
  */
function deleteFolderRecursive (dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function (file, index) {
      var curPath = path.join(dir, file)
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dir)
  }
}
pa.exportJSON(json, outFile, args.output, args.type)
