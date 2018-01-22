const fs = require('fs')
const logger = require('winston')

const ArgumentParser = require('argparse').ArgumentParser
// const mi = require('minimist')
const mj = require('./lib/modelicaToJSON.js')
const jq = require('./lib/jsonquery.js')
const hw = require('./lib/htmlWriter.js')

/*
 fixme: (1) process the model top-down, search for instances
        that are blocks, and whose class is in
        a package that contains 'Controls'.
        Save these in a list.
        Go through the list, starting with these
        elements whose outputs are connected to
        actuators, and when processed, remove them from the list.
        For each instance,
        describe its class name, short class description,
        parameters values (indicating what is default and what is
        overwritten), input and outputs, info section and link to the
        class description.
        If not in Buildings, put the class in a set S
        (that has no dublicate classes) so it can be described later.
        Next, describe what their inputs are connected to.
        If an input or output is connected to a class
        in *Fluid*, or *Utilities*, store it in
        a point list.

        When visting an instance, put its class name into the set S.

        (2) Loop through the set S.
        If the instance is not in Buildings, then it must be
        a custom class. Hence, go to (1).

        (3) If the instance is in Buildings, emit its
        name, short description,
        parameters, input, outputs, and info section,
        with a link to the html help.
*/

function getNewData (jsonData, data) {
  // Search for the blocks used in the block so that they can also be parsed
  var publicClasses = []
  var protectedClasses = []
  for (var i = 0; i < jsonData.length; i++) {
    if (jsonData[i].public && jsonData[i].public.models) {
      publicClasses = publicClasses.concat(jsonData[i].public.models.map(a => a.className))
    }
    if (jsonData[i].protected && jsonData[i].protected.models) {
      protectedClasses = protectedClasses.concat(jsonData[i].protected.models.map(a => a.className))
    }
  }
  const allClasses = new Set(publicClasses.concat(protectedClasses))

  // Remove a class from allClasses if it already exists in data
  // Build array with all classes in data
  const allClaInData = []
  data.forEach(function (dat) {
    if (dat.public && dat.public.models) {
      allClaInData.push(dat.public.models.map(a => a.className))
    }
    if (dat.protected && dat.protected.models) {
      allClaInData.push(dat.protected.models.map(a => a.className))
    }
  })

  // In allClasses, delete these classes that are already in data,
  // and delete the CDL classes
  allClasses.forEach(function (cla) {
    if (allClaInData.indexOf(cla) > -1 || jq.isElementaryCDL(cla) || jq.isElementaryType()) {
      allClasses.delete(cla)
    }
  })

  const newJsonData = []
  allClasses.forEach(function (obj) {
    logger.debug('Parsing ' + JSON.stringify(obj, null, 2))
    const fileName = hw.getModelicaFileName(obj)
    if (fileName) {
      const jsonContent = mj.toJSON(fileName)
      const jsonSimp = jq.simplifyModelicaJSON(jsonContent)
      newJsonData.push(jsonSimp)
    } else {
      logger.warn('Did not find Modelica file for class ' + obj + ' on MODELICAPATH.')
    }
  })

  return newJsonData
}
/// ///////////////////////////////////////

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'CDL parser'
})
parser.addArgument(
  [ '-f', '--file' ],
  {
    help: 'Filename of the top-level Modelica class.'
  }
)
parser.addArgument(
  [ '-l', '--log' ],
  {
    help: "Logging level, 'info' is the default.",
    choices: ['warn', 'info', 'verbose', 'debug'],
    defaultValue: 'info'
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

// Get the json representation for the model with file name args.file
var data = []
const jsonContent = mj.toJSON(args.file)
data.push(jq.simplifyModelicaJSON(jsonContent))

// Build array with the new files that need to be parsed.
var newData = []
newData[0] = data[0]
while (true) {
  logger.log('Getting next data')
  // Only search on newData, but pass data as an argument
  // as getNewData need to check whether it has been parsed already
  newData = getNewData(newData, data)
  if (newData.length !== 0) {
    data = data.concat(newData)
  } else {
    // We received no new data that need to be parsed
    break
  }
}
// Order the input and output connectors.
// This needs to be done on the whole data structure
data = jq.orderConnections(data)

// Get the html snippet of the component
const htmlComp = []
data.forEach(function (dat) {
  htmlComp.push(hw.toHtml(dat))
})

const page = hw.getPage(htmlComp.join(''))
hw.writePage('test.html', page)

// Copy the images
const files = []
data.forEach(function (dat) {
  const f = jq.getImageLocations(dat.info)
  f.forEach(function (obj) {
    files.push(obj)
  })
})
hw.copyImages(files)
