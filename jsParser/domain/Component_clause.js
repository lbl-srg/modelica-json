class Component_clause {
  constructor (type_prefix, type_specifier, array_subscripts, component_list) {
    type_prefix != null ? this.type_prefix = type_prefix : ''
    type_specifier != null ? this.type_specifier = type_specifier : ''
    array_subscripts != null ? this.array_subscripts = array_subscripts : ''
    component_list != null ? this.component_list = component_list : ''
  }
}
exports.Component_clause = Component_clause
