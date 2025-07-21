class Stored_definition {
  constructor (within, final_class_definitions) {
    within != null && within != '' ? this.within = within : ''
    final_class_definitions != null ? final_class_definitions.length != 0 ? this.final_class_definitions = final_class_definitions : '' : ''
  }
}
exports.Stored_definition = Stored_definition
