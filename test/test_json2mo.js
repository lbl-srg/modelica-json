const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')
const path = require('path')
const glob = require('glob-promise')
const fs = require('fs')
const pa = require('../lib/parser.js')
const shortClassDefinition = require('../json2mo/shortClassDefinition.js')
const statement = require('../json2mo/statement.js')
const externalFunctionCall = require('../json2mo/externalFunctionCall.js')
const equation = require('../json2mo/equation.js')
const assignmentWithFunctionCallStatement = require('../json2mo/assignmentWithFunctionCallStatement.js')
const forIndices = require('../json2mo/forIndices.js')
const ifElseifExpression = require('../json2mo/ifElseifExpression.js')
const element = require('../json2mo/element.js')
const forEquation = require('../json2mo/forEquation.js')
const externalComposition = require('../json2mo/externalComposition.js')
const componentDeclaration1 = require('../json2mo/componentDeclaration1.js')
const functionCallObj = require('../json2mo/functionCallObj.js')
const forLoopObj = require('../json2mo/forLoopObj.js')
const declaration = require('../json2mo/declaration.js')
const logicalFactorObj = require('../json2mo/logicalFactorObj.js')
const equationSection = require('../json2mo/equationSection.js')
const importClause = require('../json2mo/importClause.js')
const functionCallStatement = require('../json2mo/functionCallStatement.js')
const functionCallArgsObj = require('../json2mo/functionCallArgsObj.js')
const extendsClause = require('../json2mo/extendsClause.js')
const logicalExpression = require('../json2mo/logicalExpression.js')
const logicalAnd = require('../json2mo/logicalAnd.js')
const connectClause = require('../json2mo/connectClause.js')
const annotation = require('../json2mo/annotation.js')
const importList = require('../json2mo/importList.js')
const argument = require('../json2mo/argument.js')
const componentClause1 = require('../json2mo/componentClause1.js')
const argumentList = require('../json2mo/argumentList.js')
const derClassSpecifierValue = require('../json2mo/derClassSpecifierValue.js')
const algorithmSection = require('../json2mo/algorithmSection.js')
const ifElseifEquation = require('../json2mo/ifElseifEquation.js')
const conditionAttribute = require('../json2mo/conditionAttribute.js')
const elementReplaceable = require('../json2mo/elementReplaceable.js')
const forStatement = require('../json2mo/forStatement.js')
const modification = require('../json2mo/modification.js')
const componentClause = require('../json2mo/componentClause.js')
const namedArgument = require('../json2mo/namedArgument.js')
const expressionList = require('../json2mo/expressionList.js')
const whileStatement = require('../json2mo/whileStatement.js')
const storedDefiniton = require('../json2mo/storedDefiniton.js')
const componentDeclaration = require('../json2mo/componentDeclaration.js')
const enumList = require('../json2mo/enumList.js')
const elementSection = require('../json2mo/elementSection.js')
const elementModification = require('../json2mo/elementModification.js')
const comment = require('../json2mo/comment.js')
const classSpecifier = require('../json2mo/classSpecifier.js')
const ifExpression = require('../json2mo/ifExpression.js')
const shortClassSpecifierValue = require('../json2mo/shortClassSpecifierValue.js')
const name = require('../json2mo/name.js')
const simpleExpression = require('../json2mo/simpleExpression.js')
const arraySubscripts = require('../json2mo/arraySubscripts.js')
const elementList = require('../json2mo/elementList.js')
const componentReferencePart = require('../json2mo/componentReferencePart.js')
const constrainingClause = require('../json2mo/constrainingClause.js')
const typeSpecifier = require('../json2mo/typeSpecifier.js')
const composition = require('../json2mo/composition.js')
const outputExpressionList = require('../json2mo/outputExpressionList.js')
const componentReference = require('../json2mo/componentReference.js')
const elementModificationOrReplaceable = require('../json2mo/elementModificationOrReplaceable.js')
const classDefinition = require('../json2mo/classDefinition.js')
const shortClassSpecifier = require('../json2mo/shortClassSpecifier.js')
const expression = require('../json2mo/expression.js')
const functionCallEquation = require('../json2mo/functionCallEquation.js')
const assignmentStatement = require('../json2mo/assignmentStatement.js')
const namePart = require('../json2mo/namePart.js')
const graphic = require('../json2mo/graphic.js')
const basePrefix = require('../json2mo/basePrefix.js')
const functionArgument = require('../json2mo/functionArgument.js')
const longClassSpecifier = require('../json2mo/longClassSpecifier.js')
const derClassSpecifier = require('../json2mo/derClassSpecifier.js')
const classModification = require('../json2mo/classModification.js')
const ifExpressionObj = require('../json2mo/ifExpressionObj.js')
const subscript = require('../json2mo/subscript.js')
const assignmentEquation = require('../json2mo/assignmentEquation.js')
const ifElseifStatement = require('../json2mo/ifElseifStatement.js')
const enumerationLiteral = require('../json2mo/enumerationLiteral.js')
const ifStatement = require('../json2mo/ifStatement.js')
const elementRedeclaration = require('../json2mo/elementRedeclaration.js')
const finalClassDefinition = require('../json2mo/finalClassDefinition.js')
const componentList = require('../json2mo/componentList.js')
const forIndicesObj = require('../json2mo/forIndicesObj.js')
const namedArguments = require('../json2mo/namedArguments.js')
const functionCallArgs = require('../json2mo/functionCallArgs.js')
const whenStatement = require('../json2mo/whenStatement.js')
const functionArguments = require('../json2mo/functionArguments.js')
const whenEquation = require('../json2mo/whenEquation.js')
const ifEquation = require('../json2mo/ifEquation.js')
const forIndex = require('../json2mo/forIndex.js')
const graPri = require('../lib/graphicalPrimitives.js')

mo.afterEach(() => {
  sinon.restore()
})

function getFiles (topFolder, fileType) {
  // get all test modelica files to convert to json
  const pattern = path.join(__dirname, topFolder, '*.' + fileType)
  return glob.sync(pattern)
}

// mo.describe('testing json2mo parsing', function () {
//   mo.describe('testing parsing test/reference/json folder', function () {
//     mo.it('testing structure', function () {
//       fs.rmSync(path.join('test', 'reverse'), { recursive: true, force: true })
//       fs.rmSync(path.join('test', 'reverse2'), { recursive: true, force: true })

//       // convert mo to json
//       const inputMoFiles = getFiles('FromModelica', 'mo').splice(3)
//       pa.getJsons(inputMoFiles, 'modelica', 'json', path.join('test', 'reverse'), 'false')

//       // convert json back to mo
//       const jsonOp1Files = getFiles(path.join('reverse', 'json', 'test', 'FromModelica'), 'json')
//       jsonOp1Files.forEach(json1FilePath => {
//         json1FilePath = path.join('test', json1FilePath.split(__dirname)[1])
//         pa.convertToModelica(json1FilePath, path.join('test', 'reverse'), false)
//       })

//       // convert modelica back to json
//       const generatedMoFiles = getFiles(path.join('reverse', 'modelica', 'test', 'reverse', 'json', 'test', 'FromModelica'), 'mo')
//       pa.getJsons(generatedMoFiles, 'modelica', 'json', path.join('test', 'reverse2'), 'false')

//       jsonOp1Files.forEach(file1 => {
//         const tokens = file1.split(path.sep)
//         const filename = tokens[tokens.length - 1]
//         console.log('checking for ', filename)

//         const originalJsonFilePath = path.join(__dirname, 'reverse', 'json', 'test', 'FromModelica', filename)
//         const originalJson = JSON.parse(fs.readFileSync(originalJsonFilePath), 'utf8')

//         const newJsonFilePath = path.join(__dirname, 'reverse2', 'json', 'test', 'reverse', 'modelica', 'test', 'reverse', 'json', 'test', 'FromModelica', filename)
//         const newJson = JSON.parse(fs.readFileSync(newJsonFilePath), 'utf8')

//         newJson.modelicaFile = originalJson.modelicaFile
//         newJson.fullMoFilePath = originalJson.fullMoFilePath
//         newJson.checksum = originalJson.checksum

//         const tempOld = JSON.stringify(originalJson).trim()
//         const tempNew = JSON.stringify(newJson).trim()

//         as.deepEqual(tempNew.length, tempOld.length, 'JSON result different')
//       })

//       fs.rmSync(path.join('test', 'reverse'), { recursive: true, force: true })
//       fs.rmSync(path.join('test', 'reverse2'), { recursive: true, force: true })
//     })
//   })
// })

mo.describe('testing individual json2mo parsers', function() {
  mo.describe('testing algorithmSection', function() {
    mo.it('testing structure', function() {
      sinon.stub(statement, 'parse').withArgs('test1').returns('mocked statement1').withArgs('test2').returns('mocked statement2')
      const json = {
        'initial': true,
        'statement': [
          'test1',
          'test2'
        ]
      }
      const moOutput = algorithmSection.parse(json, false)
      const referenceMoOutput = "initial algorithmmocked statement1;mocked statement2;"
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      sinon.stub(statement, 'parse').withArgs('test1').returns('mocked statement1').withArgs('test2').returns('mocked statement2')
      const json = {
        'initial': true,
        'statements': [
          'test1',
          'test2'
        ]
      }
      const moOutput = algorithmSection.parse(json, true)
      const referenceMoOutput = "initial algorithmmocked statement1;mocked statement2;"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing annotation', function() {
    mo.it('testing structure', function() {
      sinon.stub(classModification, 'parse').withArgs('test classModification', false).returns('mocked classModification')
      const json = 'test classModification'
      const moOutput = annotation.parse(json, false)
      const referenceMoOutput = "\n\tannotation mocked classModification"
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      sinon.stub(classModification, 'parse').returns('mocked classModification with rawJson')
      const json = {
        'class_modification': 'test classModification'
      }
      const moOutput = annotation.parse(json, true)
      const referenceMoOutput = "\n\tannotation mocked classModification with rawJson"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing argument', function() {
    mo.it('testing structure', function() {
      sinon.stub(elementModificationOrReplaceable, 'parse').returns('mocked elementModificationOrReplaceable')
      sinon.stub(elementRedeclaration, 'parse').returns('mocked elementRedeclaration')

      const json = {
        'element_modification_or_replaceable': 'test elementModificationOrReplaceable'
      }
      const moOutput = argument.parse(json, false)
      const referenceMoOutput = "mocked elementModificationOrReplaceable"
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure element with redeclaration', function() {
      sinon.stub(elementModificationOrReplaceable, 'parse').returns('mocked elementModificationOrReplaceable')
      sinon.stub(elementRedeclaration, 'parse').returns('mocked elementRedeclaration')

      const json = {
        'element_redeclaration': 'test redeclaration'
      }
      const moOutput = argument.parse(json, true)
      const referenceMoOutput = "mocked elementRedeclaration"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing argument', function() {
    mo.it('empty for simplified json', function() {
      sinon.stub(argument, 'parse').returns('mocked argument')
      const json={
        'arguments': [
          'test arg1',
          'test arg2'
        ]
      }
      const moOutput = argumentList.parse(json, false)
      const referenceMoOutput = ''
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      sinon.stub(argument, 'parse').withArgs('test arg1').returns('mocked arg1').withArgs('test arg2').returns('mocked arg2')

      const json={
        'arguments': [
          'test arg1',
          'test arg2'
        ]
      }
      const moOutput = argumentList.parse(json, true)
      const referenceMoOutput = "mocked arg1, mocked arg2"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing arraySubscript', function() {
    mo.it('testing structure', function() {
      sinon.stub(expression, 'parse').withArgs('test exp1').returns('mocked exp1').withArgs('test exp2').returns('mocked exp2')
      sinon.stub(subscript, 'parse').returns('mocked subscript')

      const json = [
        {
          'expression': 'test exp1'
        },
        {
          'colon_op': true
        },
        {
          'expression': 'test exp2'
        }
      ]
      const moOutput = arraySubscripts.parse(json, false)
      const referenceMoOutput = "[mocked exp1: mocked exp2] "
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure element with redeclaration', function() {
      sinon.stub(subscript, 'parse').withArgs('test subscript1').returns('mocked subscript1').withArgs('test subscript2').returns('mocked subscript2')

      const json = {
        'subscripts': [
          'test subscript1',
          'test subscript2'
        ]
      }
        
      const moOutput = arraySubscripts.parse(json, true)
      const referenceMoOutput = "[mocked subscript1, mocked subscript2] "
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing assignmentEquation', function() {
    mo.it('testing structure', function() {
      sinon.stub(expression, 'parse').withArgs('test exp1').returns('mocked exp1')
      sinon.stub(simpleExpression, 'parse').withArgs('test simpleExp1').returns('mocked simpleExp1')

      const json = {
        'lhs': 'test simpleExp1',
        'rhs': 'test exp1'
      }
      const moOutput = assignmentEquation.parse(json, false)
      const referenceMoOutput = "mocked simpleExp1=mocked exp1"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing assignmentStatement', function() {
    mo.it('testing structure', function() {
      sinon.stub(expression, 'parse').withArgs('test exp1').returns('mocked exp1')
      sinon.stub(componentReference, 'parse').withArgs('test compRef').returns('mocked compRef')

      const json = {
        'identifier': 'test compRef',
        'value': 'test exp1'
      }
      const moOutput = assignmentStatement.parse(json, false)
      const referenceMoOutput = "mocked compRef:=mocked exp1"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing assignmentWithFunctionCallStatement', function() {
    mo.it('testing structure', function() {
      sinon.stub(outputExpressionList, 'parse').returns('mocked outputExpressionList')
      sinon.stub(componentReference, 'parse').returns('mocked compRef')
      sinon.stub(functionCallArgs, 'parse').returns('(mocked functionCallArgs)')

      const json = {
        'output_expression_list': 'test expression_list',
        'function_name': 'test compRef',
        'function_call_args': 'test function_call_args'
      }
      const moOutput = assignmentWithFunctionCallStatement.parse(json, false)

      const referenceMoOutput = "(mocked outputExpressionList):=mocked compRef(mocked functionCallArgs)"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing basePrefix', function() {
    mo.it('testing structure', function() {
      const json = 'test basePrefix'
      const moOutput = basePrefix.parse(json, false)

      const referenceMoOutput = "test basePrefix "
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      const json = {
        'type_prefix': 'test basePrefix'
      }
      const moOutput = basePrefix.parse(json, true)

      const referenceMoOutput = "test basePrefix "
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing classDefinition', function() {
    mo.it('testing structure', function() {
      sinon.stub(classSpecifier, 'parse').returns('mocked classSpecifier')

      const json = {
        'encapsulated': true,
        'class_prefixes': 'prefix1 prefix2',
        'class_specifier': 'test classSpecifier'
      }
      const moOutput = classDefinition.parse(json, false)

      const referenceMoOutput = "encapsulated prefix1 prefix2 mocked classSpecifier"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing classModification', function() {
    mo.it('testing structure', function() {
      sinon.stub(argumentList, 'parse').returns('mocked argumentList')
      sinon.stub(argument, 'parse').withArgs('test arg1').returns('mocked arg1').withArgs('test arg2').returns('mocked arg2')

      const json = [
        'test arg1',
        'test arg2'
      ]
      const moOutput = classModification.parse(json, false)

      const referenceMoOutput = "(\n\tmocked arg1,\n\tmocked arg2)\n"
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      sinon.stub(argumentList, 'parse').returns('mocked argumentList')
      sinon.stub(argument, 'parse').withArgs('test arg1').returns('mocked arg1').withArgs('test arg2').returns('mocked arg2')

      const json = {
        'argument_list': 'test argumentList'
      }
      const moOutput = classModification.parse(json, true)

      const referenceMoOutput = "(\n\tmocked argumentList)\n"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing classSpecifier', function() {
    mo.it('testing structure', function() {
      sinon.stub(longClassSpecifier, 'parse').returns('mocked longClassSpecifier')
      sinon.stub(shortClassSpecifier, 'parse').returns('mocked shortClassSpecifier')
      sinon.stub(derClassSpecifier, 'parse').returns('mocked derClassSpecifier')

      const json = {
        'long_class_specifier': 'test long',
        'short_class_specifier': 'test short',
        'der_class_specifier': 'test der',
      }
      const moOutput = classSpecifier.parse(json, false)

      const referenceMoOutput = "mocked longClassSpecifiermocked shortClassSpecifiermocked derClassSpecifier"
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing comment', function() {
    mo.it('testing structure', function() {
      sinon.stub(annotation, 'parse').returns('mocked annotation')

      const json = {
        'description_string': 'test description',
        'annotation': 'test annotation'
      }
      const moOutput = comment.parse(json, false)

      const referenceMoOutput = '\n\t"test description"mocked annotation'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      sinon.stub(annotation, 'parse').returns('mocked annotation')

      const json = {
        'string_comment': 'test description',
        'annotation': 'test annotation'
      }
      const moOutput = comment.parse(json, true)

      const referenceMoOutput = '\n\t"test description"mocked annotation'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing componentClause', function() {
    mo.it('testing structure', function() {
      sinon.stub(arraySubscripts, 'parse').returns('mocked arraySubscripts')
      sinon.stub(componentList, 'parse').returns('mocked componentList')

      const json = {
        'type_prefix': 'test type_prefix',
        'type_specifier': 'test type_specifier',
        'array_subscripts': 'test array_subscripts',
        'component_list': 'test component_list'
      }
      const moOutput = componentClause.parse(json, false)

      const referenceMoOutput = 'test type_prefix test type_specifier mocked arraySubscriptsmocked componentList'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      sinon.stub(typeSpecifier, 'parse').returns('mocked typeSpecifier')
      sinon.stub(arraySubscripts, 'parse').returns('mocked arraySubscripts')
      sinon.stub(componentList, 'parse').returns('mocked componentList')

      const json = {
        'type_prefix': 'test type_prefix',
        'type_specifier': 'test type_specifier',
        'array_subscripts': 'test array_subscripts',
        'component_list': 'test component_list'
      }
      const moOutput = componentClause.parse(json, true)

      const referenceMoOutput = 'test type_prefix mocked typeSpecifiermocked arraySubscriptsmocked componentList'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing componentClause1', function() {
    mo.it('testing structure', function() {
      sinon.stub(typeSpecifier, 'parse').returns('mocked typeSpecifier')
      sinon.stub(componentDeclaration1, 'parse').returns('mocked componentDeclaration1')

      const json = {
        'type_prefix': 'test type_prefix',
        'type_specifier': 'test type_specifier',
        'component_declaration1': 'test component_declaration1',
      }
      const moOutput = componentClause1.parse(json, false)

      const referenceMoOutput = 'test type_prefix test type_specifier mocked componentDeclaration1'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure rawJson', function() {
      sinon.stub(typeSpecifier, 'parse').returns('mocked typeSpecifier')
      sinon.stub(componentDeclaration1, 'parse').returns('mocked componentDeclaration1')

      const json = {
        'type_prefix': 'test type_prefix',
        'type_specifier': 'test type_specifier',
        'component_declaration1': 'test component_declaration1',
      }
      const moOutput = componentClause1.parse(json, true)

      const referenceMoOutput = 'test type_prefix mocked typeSpecifiermocked componentDeclaration1'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing componentDeclaration', function() {
    mo.it('testing structure', function() {
      sinon.stub(declaration, 'parse').returns('mocked declaration')
      sinon.stub(conditionAttribute, 'parse').returns('mocked conditionAttribute')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'declaration': 'test declaration',
        'condition_attribute': 'test condition_attribute',
        'comment': 'test comment',
      }
      const moOutput = componentDeclaration.parse(json, false)

      const referenceMoOutput = 'mocked declarationmocked conditionAttributemocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing componentDeclaration1', function() {
    mo.it('testing structure', function() {
      sinon.stub(declaration, 'parse').returns('mocked declaration')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'declaration': 'test declaration',
        'description': 'test comment',
      }
      const moOutput = componentDeclaration1.parse(json, false)

      const referenceMoOutput = 'mocked declarationmocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(declaration, 'parse').returns('mocked declaration')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'declaration': 'test declaration',
        'comment': 'test comment',
      }
      const moOutput = componentDeclaration1.parse(json, true)

      const referenceMoOutput = 'mocked declarationmocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing componentList', function() {
    mo.it('testing structure', function() {
      sinon.stub(componentDeclaration, 'parse').returns('mocked componentDeclaration')
      sinon.stub(declaration, 'parse').returns('mocked declaration')
      sinon.stub(conditionAttribute, 'parse').returns('mocked conditionAttribute')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = [
        {
          'declaration': 'test declaration',
          'condition_attribute': 'test condition_attribute',
          'description': 'test description'
        }        
      ]
      const moOutput = componentList.parse(json, false)

      const referenceMoOutput = 'mocked declarationmocked conditionAttributemocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(componentDeclaration, 'parse').returns('mocked componentDeclaration')
      sinon.stub(declaration, 'parse').returns('mocked declaration')
      sinon.stub(conditionAttribute, 'parse').returns('mocked conditionAttribute')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'component_declaration_list': [
          'test componentDeclaration'
        ]
      }
      const moOutput = componentList.parse(json, true)

      const referenceMoOutput = 'mocked componentDeclaration'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing componentReference', function() {
    mo.it('testing structure', function() {
      sinon.stub(arraySubscripts, 'parse').returns('mocked arraySubscripts')
      sinon.stub(componentReferencePart, 'parse').returns('mocked componentReferencePart')

      const json = [
        {
          'dot_op': 'test dot_op',
          'identifier': 'test identifier',
          'array_subscripts': 'test array_subscripts'
        }        
      ]
      const moOutput = componentReference.parse(json, false)

      const referenceMoOutput = '.test identifiermocked arraySubscripts'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(arraySubscripts, 'parse').returns('mocked arraySubscripts')
      sinon.stub(componentReferencePart, 'parse').returns('mocked componentReferencePart')

      const json = {
        'component_reference_parts': [
          'test component_reference_parts'
        ]
      }
      const moOutput = componentReference.parse(json, true)

      const referenceMoOutput = 'mocked componentReferencePart'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing componentReferencePart', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(arraySubscripts, 'parse').returns('mocked arraySubscripts')

      const json = []
      const moOutput = componentReferencePart.parse(json, false)

      const referenceMoOutput = ''
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(arraySubscripts, 'parse').returns('mocked arraySubscripts')

      const json = {
          'dot_op': 'test dot_op',
          'identifier': 'test identifier',
          'array_subscripts': 'test array_subscripts'
        }        
      const moOutput = componentReferencePart.parse(json, true)

      const referenceMoOutput = '.test identifiermocked arraySubscripts'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing composition', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(elementList, 'parse').returns('mocked elementList')
      sinon.stub(elementSection, 'parse').returns('mocked elementSection')
      sinon.stub(externalComposition, 'parse').returns('mocked externalComposition')
      sinon.stub(annotation, 'parse').returns('mocked annotation')

      const json = {
        'element_list': 'test element_list',
        'element_sections': ['test element_sections'],
        'external_composition': 'test external_composition',
        'annotation': 'test annotation'
      }        
      const moOutput = composition.parse(json, false)

      const referenceMoOutput = 'mocked elementListmocked elementSectionmocked externalCompositionmocked annotation;\n'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing conditionAttribute', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(expression, 'parse').returns('mocked expression')

      const json = {
        'expression': ['test expression']
      }        
      const moOutput = conditionAttribute.parse(json, false)
      const referenceMoOutput = '\n\tif mocked expression'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(expression, 'parse').returns('mocked expression')

      const json = {
          'expression': 'test expression'
        }        
      const moOutput = conditionAttribute.parse(json, true)

      const referenceMoOutput = '\n\tif mocked expression'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing connectClause', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(componentReference, 'parse').returns('mocked componentReference')

      const json = {
        'from': 'test from',
        'to': 'test to'
      }        
      const moOutput = connectClause.parse(json, false)

      const referenceMoOutput = 'connect(mocked componentReference, mocked componentReference)'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing constrainingClause', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(name, 'parse').returns('mocked name')
      sinon.stub(classModification, 'parse').returns('mocked classModification')

      const json = {
        'name': 'test name',
        'class_modification': 'test class_modification'
      }        
      const moOutput = constrainingClause.parse(json, false)

      const referenceMoOutput = 'constrainedby mocked namemocked classModification'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing declaration', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(arraySubscripts, 'parse').returns('mocked arraySubscripts')
      sinon.stub(modification, 'parse').returns('mocked modification')

      const json = {
        'identifier': 'test identifier',
        'array_subscripts': 'test array_subscripts',
        'modification': 'test modification'
      }        
      const moOutput = declaration.parse(json, false)

      const referenceMoOutput = 'test identifiermocked arraySubscriptsmocked modification'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing derClassSpecifier', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(derClassSpecifierValue, 'parse').returns('mocked derClassSpecifierValue')

      const json = {
        'identifier': 'test identifier',
        'der_class_specifier_value': "test der_class_specifier_value",
        'value': 'test value'
      }        
      const moOutput = derClassSpecifier.parse(json, false)

      const referenceMoOutput = 'test identifier= mocked derClassSpecifierValue'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(derClassSpecifierValue, 'parse').returns('mocked derClassSpecifierValue')

      const json = {
        'identifier': 'test identifier',
        'der_class_specifier_value': "test der_class_specifier_value",
        'value': 'test value'
      }           
      const moOutput = derClassSpecifier.parse(json, true)

      const referenceMoOutput = 'test identifier= mocked derClassSpecifierValue'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing derClassSpecifierValue', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(name, 'parse').returns('mocked name')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'type_specifier': 'test type_specifier',
        'identifiers': ['test identifiers1', 'test identifiers2'],
        'identifier': ['test identifier1', 'test identifier2'],
        'description': 'test description'
      }        
      const moOutput = derClassSpecifierValue.parse(json, false)

      const referenceMoOutput = 'der(mocked nametest identifier1, test identifier2) mocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(name, 'parse').returns('mocked name')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'type_specifier': 'test type_specifier',
        'identifiers': ['test identifiers1', 'test identifiers2'],
        'identifier': ['test identifier1', 'test identifier2'],
        'comment': 'test comment'
      }   
      const moOutput = derClassSpecifierValue.parse(json, true)

      const referenceMoOutput = 'der(mocked nametest identifiers1, test identifiers2) mocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing element', function() {
    mo.it('testing import clause', function() {
      sinon.stub(importClause, 'parse').returns('mocked importClause')

      const json = {
        'import_clause': 'test import_clause',
      }        
      
      const moOutput = element.parse(json, false)
      const referenceMoOutput = 'mocked importClause;\n'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing extends clause', function() {
      sinon.stub(extendsClause, 'parse').returns('mocked extendsClause')

      const json = {
        'extends_clause': 'test extends_clause'
      }        
      const moOutput = element.parse(json, false)

      const referenceMoOutput = 'mocked extendsClause;\n'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - false', function() {
      sinon.stub(classDefinition, 'parse').returns('mocked classDefinition')
      sinon.stub(constrainingClause, 'parse').returns('mocked constrainingClause')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'redeclare': 'test redeclare',
        'final': 'test final',
        'inner': 'test inner',
        'outer': 'test outer',
        'replaceable': 'test replaceable',
        'class_definition': 'test class_definition',
        'constraining_clause': 'test constraining_clause',
        'description': 'test description'
      }        
      const moOutput = element.parse(json, false)

      const referenceMoOutput = 'redeclare final inner outer replaceable mocked classDefinition\nmocked constrainingClausemocked comment;\n' 
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(componentClause, 'parse').returns('mocked componentClause')
      sinon.stub(constrainingClause, 'parse').returns('mocked constrainingClause')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'redeclare': 'test redeclare',
        'is_final': 'test is_final',
        'inner': 'test inner',
        'outer': 'test outer',
        'replaceable': 'test replaceable',
        'component_clause': 'test component_clause',
        'constraining_clause': 'test constraining_clause',
        'comment': 'test comment'
      }        
      const moOutput = element.parse(json, true)

      const referenceMoOutput = 'redeclare final inner outer replaceable mocked componentClause\nmocked constrainingClausemocked comment;\n' 
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing replaceable false - class definition', function() {
      sinon.stub(classDefinition, 'parse').returns('mocked classDefinition')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'redeclare': 'test redeclare',
        'is_final': 'test is_final',
        'inner': 'test inner',
        'outer': 'test outer',
        'replaceable': false,
        'class_definition': 'test class_definition',
        'constraining_clause': 'test constraining_clause',
        'comment': 'test comment'
      }        
      const moOutput = element.parse(json, true)

      const referenceMoOutput = 'redeclare final inner outer mocked classDefinition' 
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing replaceable false - component clause', function() {
      sinon.stub(componentClause, 'parse').returns('mocked componentClause')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'redeclare': 'test redeclare',
        'is_final': 'test is_final',
        'inner': 'test inner',
        'outer': 'test outer',
        'replaceable': false,
        'component_clause': 'test component_clause',
        'constraining_clause': 'test constraining_clause',
        'comment': 'test comment'
      }        
      const moOutput = element.parse(json, true)

      const referenceMoOutput = 'redeclare final inner outer mocked componentClause' 
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing replaceable null - class definition', function() {
      sinon.stub(classDefinition, 'parse').returns('mocked classDefinition')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'redeclare': 'test redeclare',
        'is_final': 'test is_final',
        'inner': 'test inner',
        'outer': 'test outer',
        'class_definition': 'test class_definition',
        'constraining_clause': 'test constraining_clause',
        'comment': 'test comment'
      }        
      const moOutput = element.parse(json, true)

      const referenceMoOutput = 'redeclare final inner outer mocked classDefinition;\n' 
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing replaceable null - component clause', function() {
      sinon.stub(componentClause, 'parse').returns('mocked componentClause')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'redeclare': 'test redeclare',
        'is_final': 'test is_final',
        'inner': 'test inner',
        'outer': 'test outer',
        'component_clause': 'test component_clause',
        'constraining_clause': 'test constraining_clause',
        'comment': 'test comment'
      }        
      const moOutput = element.parse(json, true)

      const referenceMoOutput = 'redeclare final inner outer mocked componentClause;\n' 
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing elementList', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(element, 'parse').returns('mocked element')

      const json = ['test element']     
      const moOutput = elementList.parse(json, false)

      const referenceMoOutput = 'mocked element'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(element, 'parse').returns('mocked element')

      const json = {
        'elements': ['test element'] 
      }   
      const moOutput = elementList.parse(json, true)

      const referenceMoOutput = 'mocked element'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing elementModification', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(name, 'parse').returns('mocked name')
      sinon.stub(modification, 'parse').returns('mocked modification')
      sinon.stub(graphic, 'parse').returns('mocked graphic')
      sinon.stub(graPri, 'isGraphicAnnotation').returns(true)

      const json = {
        'name': 'test name',
        'modification': 'test modification',
        'description_string': 'test description_string'
      }   
      const moOutput = elementModification.parse(json, false)

      const referenceMoOutput = 'mocked graphic'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing elementModificationOrReplaceable', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(elementModification, 'parse').returns('mocked elementModification')
      sinon.stub(elementReplaceable, 'parse').returns('mocked elementReplaceable')
      
      const json = {
        'each': true,
        'final': true,
        'element_replaceable': 'test element_replaceable'
      }
      const moOutput = elementModificationOrReplaceable.parse(json, false)

      const referenceMoOutput = 'each final mocked elementReplaceable'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(elementModification, 'parse').returns('mocked elementModification')
      sinon.stub(elementReplaceable, 'parse').returns('mocked elementReplaceable')

      const json = {
        'each': true,
        'is_final': true,
        'element_modification': 'test element_modification'
      }       
      const moOutput = elementModificationOrReplaceable.parse(json, true)

      const referenceMoOutput = 'each final mocked elementModification'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing elementRedeclaration', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(elementReplaceable, 'parse').returns('mocked elementReplaceable')
      
      const json = {
        'each': true,
        'final': true,
        'element_replaceable': 'test element_replaceable'
      }       
      const moOutput = elementRedeclaration.parse(json, false)

      const referenceMoOutput = 'redeclare each final mocked elementReplaceable'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - false', function() {
      sinon.stub(shortClassDefinition, 'parse').returns('mocked shortClassDefinition')
      
      const json = {
        'each': true,
        'final': true,
        'short_class_definition': 'test short_class_definition'
      }       
      const moOutput = elementRedeclaration.parse(json, false)

      const referenceMoOutput = 'redeclare each final mocked shortClassDefinition'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(componentClause1, 'parse').returns('mocked componentClause1')

      const json = {
        'each': true,
        'is_final': true,
        'component_clause1': 'test component_clause1'
      }       
      const moOutput = elementRedeclaration.parse(json, true)

      const referenceMoOutput = 'redeclare each final mocked componentClause1'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing elementRedeclaration', function() {
    mo.it('testing structure - false', function() {
      sinon.stub(elementReplaceable, 'parse').returns('mocked elementReplaceable')
      
      const json = {
        'each': true,
        'final': true,
        'element_replaceable': 'test element_replaceable'
      }       
      const moOutput = elementRedeclaration.parse(json, false)

      const referenceMoOutput = 'redeclare each final mocked elementReplaceable'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - false', function() {
      sinon.stub(shortClassDefinition, 'parse').returns('mocked shortClassDefinition')
      
      const json = {
        'each': true,
        'final': true,
        'short_class_definition': 'test short_class_definition'
      }       
      const moOutput = elementRedeclaration.parse(json, false)

      const referenceMoOutput = 'redeclare each final mocked shortClassDefinition'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - true', function() {
      sinon.stub(componentClause1, 'parse').returns('mocked componentClause1')

      const json = {
        'each': true,
        'is_final': true,
        'component_clause1': 'test component_clause1'
      }       
      const moOutput = elementRedeclaration.parse(json, true)

      const referenceMoOutput = 'redeclare each final mocked componentClause1'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing elementReplaceable', function() {
    mo.it('testing structure - short_class_definition', function() {
      sinon.stub(shortClassDefinition, 'parse').returns('mocked shortClassDefinition')
      sinon.stub(componentClause1, 'parse').returns('mocked componentClause1')
      sinon.stub(constrainingClause, 'parse').returns('mocked constrainingClause')

      const json = {
        'short_class_definition': 'test short_class_definition',
        'constraining_clause': 'test constraining_clause'
      }       
      const moOutput = elementReplaceable.parse(json, false)

      const referenceMoOutput = 'replaceable mocked shortClassDefinitionmocked constrainingClause'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - component_clause1', function() {
      sinon.stub(shortClassDefinition, 'parse').returns('mocked shortClassDefinition')
      sinon.stub(componentClause1, 'parse').returns('mocked componentClause1')
      sinon.stub(constrainingClause, 'parse').returns('mocked constrainingClause')

      const json = {
        'component_clause1': 'test component_clause1',
        'constraining_clause': 'test constraining_clause'
      }       
      const moOutput = elementReplaceable.parse(json, false)

      const referenceMoOutput = 'replaceable mocked componentClause1mocked constrainingClause'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing elementSection', function() {
    mo.it('testing structure - public_element_list', function() {
      sinon.stub(elementList, 'parse').returns('mocked elementList')
      sinon.stub(equationSection, 'parse').returns('mocked equationSection')
      sinon.stub(algorithmSection, 'parse').returns('mocked algorithmSection')

      const json = {
        'public_element_list': 'test public_element_list',
      }       
      const moOutput = elementSection.parse(json, false)

      const referenceMoOutput = 'public\nmocked elementList'
    })
    mo.it('testing structure - protected_element_list', function() {
      sinon.stub(elementList, 'parse').returns('mocked elementList')
      sinon.stub(equationSection, 'parse').returns('mocked equationSection')
      sinon.stub(algorithmSection, 'parse').returns('mocked algorithmSection')

      const json = {
        'protected_element_list': 'test protected_element_list',
      }       
      const moOutput = elementSection.parse(json, false)

      const referenceMoOutput = 'protected\nmocked elementList'
    })
    mo.it('testing structure - equation_section', function() {
      sinon.stub(elementList, 'parse').returns('mocked elementList')
      sinon.stub(equationSection, 'parse').returns('mocked equationSection')
      sinon.stub(algorithmSection, 'parse').returns('mocked algorithmSection')

      const json = {
        'equation_section': 'test equation_section',
      }       
      const moOutput = elementSection.parse(json, false)

      const referenceMoOutput = 'mocked equationSection'
    })
    mo.it('testing structure - algorithm_section', function() {
      sinon.stub(elementList, 'parse').returns('mocked elementList')
      sinon.stub(equationSection, 'parse').returns('mocked equationSection')
      sinon.stub(algorithmSection, 'parse').returns('mocked algorithmSection')

      const json = {
        'algorithm_section': 'test algorithm_section',
      }       
      const moOutput = elementSection.parse(json, false)

      const referenceMoOutput = 'mocked algorithmSection'
    })
  })
  mo.describe('testing enumList', function() {
    mo.it('testing structure - true', function() {
      sinon.stub(enumerationLiteral, 'parse').returns('mocked enumerationLiteral')
      
      const json = {
        'enumeration_literal': ['test enumeration_literal1', 
        'test enumeration_literal2']
      }       
      const moOutput = enumList.parse(json, true)

      const referenceMoOutput = 'mocked enumerationLiteral, mocked enumerationLiteral'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - false', function() {
      sinon.stub(enumerationLiteral, 'parse').returns('mocked enumerationLiteral')
      
      const json = {
        'content': 'test content',
        'content2': 'test content2'
      }       
      const moOutput = enumList.parse(json, false)

      const referenceMoOutput = 'mocked enumerationLiteral, mocked enumerationLiteral'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing enumerationLiteral', function() {
    mo.it('testing structure - true', function() {
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'identifier': 'test identifier',
        'comment': 'test comment'
      }       
      const moOutput = enumerationLiteral.parse(json, true)

      const referenceMoOutput = 'test identifier mocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure - false', function() {
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'description': 'test description',
      }       
      const moOutput = enumerationLiteral.parse(json, false)

      const referenceMoOutput = 'mocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  mo.describe('testing equation', function() {
    mo.it('testing structure', function() {
      sinon.stub(assignmentEquation, 'parse').returns('mocked assignmentEquation')

      const json = {
        'assignment_equation': 'test assignment_equation'
      }       
      const moOutput = equation.parse(json, false)

      const referenceMoOutput = '\nmocked assignmentEquation'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(assignmentEquation, 'parse').returns('mocked assignmentEquation')
      sinon.stub(ifEquation, 'parse').returns('mocked ifEquation')

      const json = {
        'if_equation': 'test if_equation',
      }       
      const moOutput = equation.parse(json, false)

      const referenceMoOutput = '\nmocked ifEquation'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(assignmentEquation, 'parse').returns('mocked assignmentEquation')
      sinon.stub(ifEquation, 'parse').returns('mocked ifEquation')
      sinon.stub(forEquation, 'parse').returns('mocked forEquation')

      const json = {
        'for_equation': 'test for_equation',
      }       
      const moOutput = equation.parse(json, false)

      const referenceMoOutput = '\nmocked forEquation'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(assignmentEquation, 'parse').returns('mocked assignmentEquation')
      sinon.stub(ifEquation, 'parse').returns('mocked ifEquation')
      sinon.stub(forEquation, 'parse').returns('mocked forEquation')
      sinon.stub(connectClause, 'parse').returns('mocked connectClause')

      const json = {
        'connect_clause': 'test connect_clause',
      }       
      const moOutput = equation.parse(json, false)

      const referenceMoOutput = '\nmocked connectClause'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(assignmentEquation, 'parse').returns('mocked assignmentEquation')
      sinon.stub(ifEquation, 'parse').returns('mocked ifEquation')
      sinon.stub(forEquation, 'parse').returns('mocked forEquation')
      sinon.stub(connectClause, 'parse').returns('mocked connectClause')
      sinon.stub(whenEquation, 'parse').returns('mocked whenEquation')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'when_equation': 'test when_equation',
        'description': 'test description'
      }       
      const moOutput = equation.parse(json, false)

      const referenceMoOutput = '\nmocked whenEquationmocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
    mo.it('testing structure', function() {
      sinon.stub(assignmentEquation, 'parse').returns('mocked assignmentEquation')
      sinon.stub(ifEquation, 'parse').returns('mocked ifEquation')
      sinon.stub(forEquation, 'parse').returns('mocked forEquation')
      sinon.stub(connectClause, 'parse').returns('mocked connectClause')
      sinon.stub(whenEquation, 'parse').returns('mocked whenEquation')
      sinon.stub(functionCallEquation, 'parse').returns('mocked functionCallEquation')
      sinon.stub(comment, 'parse').returns('mocked comment')

      const json = {
        'function_call_equation': 'test function_call_equation',
        'comment': 'test comment'
      }       
      const moOutput = equation.parse(json, true)

      const referenceMoOutput = '\nmocked functionCallEquationmocked comment'
      as.deepEqual(referenceMoOutput, moOutput)
    })
  })
  // mo.describe('testing test', function() {
  //   mo.it('testing structure - public_element_list', function() {
  //     sinon.stub(elementList, 'parse').returns('mocked elementList')
  //     sinon.stub(equationSection, 'parse').returns('mocked equationSection')
  //     sinon.stub(algorithmSection, 'parse').returns('mocked algorithmSection')

  //     const json = {
  //       'public_element_list': 'public_element_list',
  //       'constraining_clause': 'test constraining_clause'
  //     }       
  //     const moOutput = elementSection.parse(json, false)

  //     const referenceMoOutput = 'test'
  //     as.deepEqual(referenceMoOutput, moOutput)
  //   })
  // })
})
