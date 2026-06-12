class Expression {
  constructor (simple_expression, if_expression) {
    simple_expression != null ? this.simple_expression = simple_expression : ''
    if_expression != null ? this.if_expression = if_expression : ''
  }
}
exports.Expression = Expression
