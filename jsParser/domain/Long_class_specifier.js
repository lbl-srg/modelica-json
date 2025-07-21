class Long_class_specifier {
  constructor (identifier, string_comment, composition, is_extends, class_modification) {
    identifier != null && identifier != '' ? this.identifier = identifier : ''
    string_comment != null ? this.string_comment = string_comment : ''
    composition != null ? this.composition = composition : ''
    is_extends != null ? this.is_extends = is_extends : ''
    class_modification != null ? this.class_modification = class_modification : ''
  }
}
exports.Long_class_specifier = Long_class_specifier
