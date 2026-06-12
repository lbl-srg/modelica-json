class Declaration {
  constructor (identifier, array_subscripts, modification) {
    identifier != null && identifier != '' ? this.identifier = identifier : ''
    array_subscripts != null ? this.array_subscripts = array_subscripts : ''
    modification != null ? this.modification = modification : ''
  }
}
exports.Declaration = Declaration
