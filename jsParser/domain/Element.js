class Element {
  constructor (import_clause, extends_clause, redeclare, is_final, inner, outer, replaceable, constraining_clause, class_definition, component_clause, comment) {
    this.import_clause = import_clause
    this.extends_clause = extends_clause
    this.redeclare = redeclare
    this.is_final = is_final
    this.inner = inner
    this.outer = outer
    this.replaceable = replaceable
    this.constraining_clause = constraining_clause
    this.class_definition = class_definition
    this.component_clause = component_clause
    this.comment = comment
  }
}
exports.Element = Element
