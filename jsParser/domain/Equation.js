class Equation {
  constructor (assignment_equation, if_equation, for_equation, connect_clause, when_equation, function_call_equation, comment) {
    assignment_equation != null ? this.assignment_equation = assignment_equation : ''
    if_equation != null ? this.if_equation = if_equation : ''
    for_equation != null ? this.for_equation = for_equation : ''
    connect_clause != null ? this.connect_clause = connect_clause : ''
    when_equation != null ? this.when_equation = when_equation : ''
    function_call_equation != null ? this.function_call_equation = function_call_equation : ''
    comment != null ? this.comment = comment : ''
  }
}
exports.Equation = Equation
