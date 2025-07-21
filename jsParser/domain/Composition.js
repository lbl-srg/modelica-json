class Composition {
  constructor (element_list, element_sections, external_composition, annotation) {
    element_list != null ? this.element_list = element_list: ''
    element_sections != null ? element_sections.length != 0 ? this.element_sections = element_sections : '' : ''
    external_composition != null ? this.external_composition = external_composition : ''
    annotation != null ? this.annotation = annotation : ''
  }
}
exports.Composition = Composition
