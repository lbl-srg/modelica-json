// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

const antlr4 = require('antlr4/index');
const modelicaParser = require('./antlrFiles/modelicaParser');
const modelicaLexer = require('./antlrFiles/modelicaLexer');
const Stored_definitionVisitor = require('./parser/Stored_definitionVisitor');
const fs = require('fs')

var file = '/Users/akprakash/Programming/modelica/modelica-json/test/FromModelica/Modulation.mo'
var fileContents = fs.readFileSync(file, 'utf8');

const inputStream = new antlr4.InputStream(fileContents);
const lexer = new modelicaLexer.modelicaLexer(inputStream);
const commonTokenStream = new antlr4.CommonTokenStream(lexer);
const parser = new modelicaParser.modelicaParser(commonTokenStream);
const visitor = new Stored_definitionVisitor.Stored_definitionVisitor();
const parseTree = parser.stored_definition()
op = visitor.visitStored_definition(parseTree);

console.log(op);
