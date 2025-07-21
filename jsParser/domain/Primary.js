class Primary {
  constructor (unsigned_number, primary_string, is_false, is_true, function_call_primary, component_reference, output_expression_list, expression_lists, function_arguments, end) {
    unsigned_number != null ? this.unsigned_number = unsigned_number : ''
    primary_string != null && primary_string != '' ? this.primary_string = primary_string : ''
    is_false != null ? this.is_false = is_false : ''
    is_true != null ? this.is_true = is_true : ''
    function_call_primary != null ? this.function_call_primary = function_call_primary : ''
    component_reference != null ? this.component_reference = component_reference : ''
    output_expression_list != null ? this.output_expression_list = output_expression_list : ''
    expression_lists != null ? expression_lists.length != 0 ? this.expression_lists = expression_lists : '' : ''
    function_arguments != null ? this.function_arguments = function_arguments : ''
    end != null ? this.end = end : ''
  }
}
exports.Primary = Primary
