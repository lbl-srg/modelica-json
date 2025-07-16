class Component_reference_part {
  constructor (dot_op, identifier, array_subscripts) {
    dot_op != null ? this.dot_op = dot_op : ''
    identifier != null ? this.identifier = identifier : ''
    array_subscripts != null ? this.array_subscripts = array_subscripts : ''
  }

  get_dot_op () {
    return this.dot_op
  }

  get_identifier () {
    return this.identifier
  }

  get_array_subscripts () {
    return this.array_subscripts
  }

  set_dot_op (dot_op) {
    this.dot_op = dot_op
  }

  set_identifier (identifier) {
    this.identifier = identifier
  }

  set_array_subscripts (array_subscripts) {
    this.array_subscripts = array_subscripts
  }
}
exports.Component_reference_part = Component_reference_part
