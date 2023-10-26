function parse (content, rawJson = false) {
  const assignmentEquationParser = require('./assignmentEquation')
  const ifEquationParser = require('./ifEquation')
  const forEquationParser = require('./forEquation')
  const connectClauseParser = require('./connectClause')
  const whenEquationParser = require('./whenEquation')
  const functionCallEquationParser = require('./functionCallEquation')
  const commentParser = require('./comment')

  let moOutput = ''
  if (content.assignment_equation != null) {
    moOutput += '\n'
    moOutput += assignmentEquationParser.parse(content.assignment_equation, rawJson)
  } else if (content.if_equation != null) {
    moOutput += '\n'
    moOutput += ifEquationParser.parse(content.if_equation, rawJson)
  } else if (content.for_equation != null) {
    moOutput += '\n'
    moOutput += forEquationParser.parse(content.for_equation, rawJson)
  } else if (content.connect_clause != null) {
    moOutput += '\n'
    moOutput += connectClauseParser.parse(content.connect_clause, rawJson)
  } else if (content.when_equation != null) {
    moOutput += '\n'
    moOutput += whenEquationParser.parse(content.when_equation, rawJson)
  } else if (content.function_call_equation != null) {
    moOutput += '\n'
    moOutput += functionCallEquationParser.parse(content.function_call_equation, rawJson)
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

module.exports = { parse }
