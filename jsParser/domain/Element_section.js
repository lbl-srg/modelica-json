class Element_section {
  constructor (public_element_list, protected_element_list, equation_section, algorithm_section) {
    public_element_list != null ? this.public_element_list = public_element_list : ''
    protected_element_list != null ? this.protected_element_list = protected_element_list : ''
    equation_section != null ? this.equation_section = equation_section : ''
    algorithm_section != null ? this.algorithm_section = algorithm_section : ''
  }
}
exports.Element_section = Element_section
