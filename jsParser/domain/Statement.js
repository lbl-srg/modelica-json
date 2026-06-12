class Statement {
  constructor (assignment_statement, function_call_statement, assignment_with_function_call_statement, is_break,
    is_return, if_statement, for_statement, while_statement, when_statement, comment) {
    assignment_statement != null ? this.assignment_statement = assignment_statement : ''
    function_call_statement != null ? this.function_call_statement = function_call_statement : ''
    assignment_with_function_call_statement != null ? this.assignment_with_function_call_statement = assignment_with_function_call_statement : ''
    is_break != null ? this.is_break = is_break : ''
    is_return != null ? this.is_return = is_return : ''
    if_statement != null ? this.if_statement = if_statement : ''
    for_statement != null ? this.for_statement = for_statement : ''
    while_statement != null ? this.while_statement = while_statement : ''
    when_statement != null ? this.when_statement = when_statement : ''
    comment != null ? this.comment = comment : ''
  }
}
exports.Statement = Statement
