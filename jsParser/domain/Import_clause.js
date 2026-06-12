class Import_clause {
  constructor (identifier, name, dot_star, import_list, comment) {
    identifier != null && identifier != '' ? this.identifier = identifier : ''
    name != null ? this.name = name : ''
    dot_star != null ? this.dot_star = dot_star : ''
    import_list != null ? this.import_list = import_list : ''
    comment != null ? this.comment = comment : ''
  }
}
exports.Import_clause = Import_clause
