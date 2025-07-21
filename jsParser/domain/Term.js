class Term {
  constructor (factors, mul_ops) {
    factors != null ? factors.length != 0 ? this.factors = factors : '' : ''
    mul_ops != null ? mul_ops.length != 0 ? this.mul_ops = mul_ops : '' : ''
  }
}
exports.Term = Term
