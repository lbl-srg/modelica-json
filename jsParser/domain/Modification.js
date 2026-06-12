class Modification {
  constructor (class_modification, equal, colon_equal, expression) {
    class_modification != null ? this.class_modification = class_modification : ''
    equal != null ? this.equal = equal : ''
    colon_equal != null ? this.colon_equal = colon_equal : ''
    expression != null ? this.expression = expression : ''
  }
}
exports.Modification = Modification
