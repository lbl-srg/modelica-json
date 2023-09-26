'use strict'
// const pa = require('path')
// const pro = require('child_process')
const fs = require('bluebird').promisifyAll(require('fs'))
const logger = require('winston')
const ut = require('../lib/util.js')
const antlr4 = require('antlr4/index')
const modelicaParser = require('../jsParser/antlrFiles/modelicaParser')
const modelicaLexer = require('../jsParser/antlrFiles/modelicaLexer')
const Stored_definitionVisitor = require('../jsParser/parser/Stored_definitionVisitor')

/** Parses the modelica file and returns a promise.
  *
  *@param {String} modelicaFile full path of modelica file to be parsed
  *@return A JSON representation of the Modelica file.
  */
function toJSON (modelicaFile) {
  logger.debug('Invoking parser for ' + modelicaFile)
  const fileContents = fs.readFileSync(modelicaFile, 'utf8')

  const inputStream = new antlr4.InputStream(fileContents)
  const lexer = new modelicaLexer.modelicaLexer(inputStream)
  const commonTokenStream = new antlr4.CommonTokenStream(lexer)
  const parser = new modelicaParser.modelicaParser(commonTokenStream)
  const visitor = new Stored_definitionVisitor.Stored_definitionVisitor()
  const parseTree = parser.stored_definition()
  const op = visitor.visitStored_definition(parseTree)
  const jsonContent = JSON.stringify(op)
  logger.debug('Parsing output to json.')
  const res = JSON.parse(jsonContent)

  try {
    // Add the modelica file name, as this is needed to look up its instances
    if (!res) {
      throw new Error('Parser returned null instead of json structure. Did you install Java properly?')
    }
    Object.assign(res,
      { modelicaFile: ut.relativePath(modelicaFile) },
      { fullMoFilePath: modelicaFile }
    )
    return res
  } catch (error) {
    const em = error + '\n JSON structure is \n' + jr.stdout
    logger.error(em)
    throw new SyntaxError(em)
  }
}

module.exports.toJSON = toJSON
