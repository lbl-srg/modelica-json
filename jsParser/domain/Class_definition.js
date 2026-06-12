class Class_definition {
  constructor (encapsulated, class_prefixes, class_specifier) {
    encapsulated != null ? this.encapsulated = encapsulated : ''
    class_prefixes != null && class_prefixes != '' ? this.class_prefixes = class_prefixes : ''
    class_specifier != null ? this.class_specifier = class_specifier : ''
  }
}
exports.Class_definition = Class_definition
