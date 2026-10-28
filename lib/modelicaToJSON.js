'use strict'
const pa = require('path')
// const pro = require('child_process')
const fs = require('bluebird').promisifyAll(require('fs'))
const logger = require('winston')
const ut = require('../lib/util.js')
const antlr4 = require('antlr4/index')
const ModelicaParser = require('../jsParser/antlrFiles/modelicaParser').modelicaParser
const ModelicaLexer = require('../jsParser/antlrFiles/modelicaLexer').modelicaLexer
const storedDefinitionVisitor = require('../jsParser/parser/Stored_definitionVisitor')

/** Parses the modelica file and returns a promise.
  *
  *@param {String} modelicaFile full path of modelica file to be parsed
  *@return A JSON representation of the Modelica file.
  */
function toJSON (modelicaFile) {
  logger.debug('Invoking parser for ' + modelicaFile)
  // A checkout with CRLF line endings parses to the same json as one with LF
  const fileContents = fs.readFileSync(modelicaFile, 'utf8').replace(/\r\n/g, '\n')

  const inputStream = new antlr4.InputStream(fileContents)
  const lexer = new ModelicaLexer(inputStream)
  const commonTokenStream = new antlr4.CommonTokenStream(lexer)
  const parser = new ModelicaParser(commonTokenStream)
  const visitor = new storedDefinitionVisitor.Stored_definitionVisitor()
  const parseTree = parser.stored_definition()
  const op = visitor.visitStored_definition(parseTree)
  const jsonContent = JSON.stringify(op).replace(/"args":/g, '"arguments":')
  logger.debug('Parsing output to json.')
  const res = JSON.parse(jsonContent)

  try {
    // Add the modelica file name, as this is needed to look up its instances
    if (!res) {
      throw new Error('Parser returned null instead of json structure. Did you install Java properly?')
    }
    Object.assign(res,
      // written with '/' whatever the platform, so the json is the same on every one
      { modelicaFile: ut.getRelativePath(modelicaFile).split(pa.sep).join('/') },
      { fullMoFilePath: modelicaFile }
    )
    return res
  } catch (error) {
    const em = error
    logger.error(em)
    throw new SyntaxError(em)
  }
}

module.exports.toJSON = toJSON
