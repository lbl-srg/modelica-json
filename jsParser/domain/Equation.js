class Equation {
  constructor (assignment_equation, if_equation, for_equation, connect_clause, when_equation, function_call_equation, comment) {
    this.assignment_equation = assignment_equation
    this.if_equation = if_equation
    this.for_equation = for_equation
    this.connect_clause = connect_clause
    this.when_equation = when_equation
    this.function_call_equation = function_call_equation
    this.comment = comment
  }
}
exports.Equation = Equation
