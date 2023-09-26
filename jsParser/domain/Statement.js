class Statement {
  constructor (assignment_statement, function_call_statement, assignment_with_function_call_statement, is_break,
    is_return, if_statement, for_statement, while_statement, when_statement, comment) {
    this.assignment_statement = assignment_statement
    this.function_call_statement = function_call_statement
    this.assignment_with_function_call_statement = assignment_with_function_call_statement
    this.is_break = is_break
    this.is_return = is_return
    this.if_statement = if_statement
    this.for_statement = for_statement
    this.while_statement = while_statement
    this.when_statement = when_statement
    this.comment = comment
  }
}
exports.Statement = Statement
