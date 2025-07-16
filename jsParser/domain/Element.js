class Element {
  constructor (import_clause, extends_clause, redeclare, is_final, inner, outer, replaceable, constraining_clause, class_definition, component_clause, comment) {
    import_clause != null ? this.import_clause = import_clause : ''
    extends_clause != null ? this.extends_clause = extends_clause : ''
    redeclare != null ? this.redeclare = redeclare : ''
    is_final != null ? this.is_final = is_final : ''
    inner != null ? this.inner = inner : ''
    outer != null ? this.outer = outer : ''
    replaceable != null ? this.replaceable = replaceable : ''
    constraining_clause != null ? this.constraining_clause = constraining_clause : ''
    class_definition != null ? this.class_definition = class_definition : ''
    component_clause != null ? this.component_clause = component_clause : ''
    comment != null ? this.comment = comment : ''
  }
}
exports.Element = Element
