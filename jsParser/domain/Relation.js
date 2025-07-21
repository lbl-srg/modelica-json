class Relation {
  constructor (arithmetic_expression1, rel_op, arithmetic_expression2) {
    arithmetic_expression1 != null ? this.arithmetic_expression1 = arithmetic_expression1 : ''
    rel_op != null && rel_op != '' ? this.rel_op = rel_op : ''
    arithmetic_expression2 != null ? this.arithmetic_expression2 = arithmetic_expression2 : ''
  }
}
exports.Relation = Relation
