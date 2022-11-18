function parse (content, rawJson) {
  const assignmentStatementParser = require('./assignmentStatement')
  const functionCallStatementParser = require('./functionCallStatement')
  const assignmentWithFunctionCallStatementParser = require('./assignmentWithFunctionCallStatement')
  const ifStatementParser = require('./ifStatement')
  const forStatementParser = require('./forStatement')
  const whileStatementParser = require('./whileStatement')
  const whenStatementParser = require('./whenStatement')
  const commentParser = require('./comment')

  var moOutput = ''
  if (content.assignment_statement != null) {
    moOutput += '\n'
    moOutput += assignmentStatementParser.parse(content.assignment_statement, rawJson)
  } else if (content.function_call_statement != null) {
    moOutput += '\n'
    moOutput += functionCallStatementParser.parse(content.function_call_statement, rawJson)
  } else if (content.assignment_with_function_call_statement != null) {
    moOutput += '\n'
    moOutput += assignmentWithFunctionCallStatementParser.parse(content.assignment_with_function_call_statement, rawJson)
  } else if (content.is_break != null) {
    if (content.is_break) {
      moOutput += '\nbreak\n'
    }
  } else if (content.is_return != null) {
    if (content.is_return) {
      moOutput += '\nreturn\n'
    }
  } else if (content.if_statement != null) {
    moOutput += '\n'
    moOutput += ifStatementParser.parse(content.if_statement, rawJson)
  } else if (content.for_statement != null) {
    moOutput += '\n'
    moOutput += forStatementParser.parse(content.for_statement, rawJson)
  } else if (content.while_statement != null) {
    moOutput += '\n'
    moOutput += whileStatementParser.parse(content.while_statement, rawJson)
  } else if (content.when_statement != null) {
    moOutput += '\n'
    moOutput += whenStatementParser.parse(content.when_statement, rawJson)
  }

  if (rawJson) {
    if (content.comment != null) {
      moOutput += commentParser.parse(content.comment, rawJson)
    }
  } else {
    if (content.description != null) {
      moOutput += commentParser.parse(content.description, rawJson)
    }
  }
  return moOutput
}

module.exports = {parse}
