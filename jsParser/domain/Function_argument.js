class Function_argument {
  constructor (function_name, named_arguments, expression) {
    function_name != null ? this.function_name = function_name : ''
    named_arguments != null ? this.named_arguments = named_arguments : ''
    expression != null ? this.expression = expression : ''
  }
}
exports.Function_argument = Function_argument
