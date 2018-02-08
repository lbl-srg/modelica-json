package gov.lbl.parser.domain;

public class Function_arguments {
    private Function_argument argument;
    private Function_arguments arguments;
    private For_indices for_indices;
    private Named_arguments named_arguments;

    public Function_arguments(Function_argument function_argument,
                              Function_arguments function_arguments,
                              String for_dec,
                              For_indices for_indices,
                              Named_arguments named_arguments) {
      this.argument = function_argument;
      this.arguments = function_arguments;
      this.for_indices = for_indices;
      this.named_arguments = named_arguments;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Function_arguments aFunction_arguments = (Function_arguments) o;
      return (argument != null ? argument.equals(aFunction_arguments.argument) : aFunction_arguments.argument == null)
           || (arguments != null ? arguments.equals(aFunction_arguments.arguments) : aFunction_arguments.arguments == null);
    }

    @Override
    public int hashCode() {
      int result = argument != null ? argument.hashCode() : 0;
      result = 31 * result + (arguments != null ? arguments.hashCode() : 0);
      result = 31 * result + (for_indices != null ? for_indices.hashCode() : 0);
      result = 31 * result + (named_arguments != null ? named_arguments.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	return "Function_arguments{" +
               "\nargument=" + argument + '\'' +
               "\narguments=" + arguments + '\'' +
               "\nfor_indices=" + for_indices + '\'' +
               "\nnamed_arguments=" + named_arguments + '\'' +
               '}';
    }
}
