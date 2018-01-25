const as = require('assert')
const mo = require('mocha')
const path = require('path')
const pa = require('../lib/parser')
const ut = require('../lib/util')
const fs = require('fs')
const glob = require('glob-promise')
var logger = require('winston')

logger.configure({
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: 'tests.log' })
  ],
  handleExceptions: true,
  humanReadableUnhandledException: true
})
logger.cli()

logger.level = 'debug'

mo.describe('parser.js', function () {
  mo.describe('parse from Modelica', function () {
    mo.it('json files should be equal', () => {
      const pattern = path.join(__dirname, 'FromModelica', '*.mo')
      const testMoFiles = glob(pattern)
      Promise.all(testMoFiles).then(files => {
        // files are all .mo files to be parsed
        return Promise.all(files.map(fil => pa.getJSON(fil, 'json-simplified')))
      }) // end of then
      // .catch(as.equal(false, true, 'Error in parsing json.'))
      .then(function (jsonSimple) {
        // Read the stored json representation from disk
        return Promise.all(jsonSimple.map((entry) => {
          const oldFil = path.join(__dirname, (entry[0].topClassName.replace(/\./g, path.sep) + '-simplified.json'))

          // Read the old json
          ut.readJSON(oldFil).then(function (jsonOld) {
            console.log('Read old file', jsonOld)
            return as.deepEqual(jsonOld, {'abc': 'www'}, 'JSON representations are not equal.')
            // return jsonOld
          })
          .catch(function (error) {
            console.log(error)
            return Promise.reject(error)
          })
        })
      )
        //console.log('p ==== ' + JSON.stringify(jsonSimple, null, 2))
      })
    }) // end of it
  }) // end of describe
})
        // files is an array of filenames.
        // If the `nonull` option is set, and nothing
        // was found, then files is ["**/*.js"]
        // er is an error object or null.
        // See https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
//        console.log('****** parsing ' + files)
//        files.forEach(function (fil) {
//          // readFileSync throws an error if a file does not exist.
//          try {
//            console.log('Parsing .... ' + fil)
//            const jsonFileOld = fil.slice(0, -3) + 'simplified.json'
//            console.log('parsing to simplified 1')
//            const fOld = fs.readFileSync(jsonFileOld, 'utf8')
//            console.log('parsing to simplified 2')
//            const jOld = JSON.parse(fOld)
//            console.log('parsing to simplified 3')
//            pa.run(fil, 'json-simplified')
//            const jsonFileNew = 'AAAAAAAParameter1-simplified.json'
//            console.log('parsing ' + jsonFileNew)
//            const jNew = JSON.parse(fs.readFileSync(jsonFileNew, 'utf8'))
//            console.log('aaaa' + jNew)
//            as.deepEqual(jNew, jOld, 'JSON representations differ.')
//          } catch (err) {
//            console.log('****** have an exception' + err)
//            mo.equal(false, true, 'Have an exception')
