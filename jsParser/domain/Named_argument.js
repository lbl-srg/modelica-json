class Named_argument {
  constructor (identifier, value) {
    identifier != null && identifier != '' ? this.identifier = identifier : ''
    value != null ? this.value = value : ''
  }
}
exports.Named_argument = Named_argument
