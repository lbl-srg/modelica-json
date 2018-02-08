package gov.lbl.parser.domain;

public class Function_call_args {
    private Function_arguments arguments;

    public Function_call_args(Function_arguments function_arguments) {
      this.arguments = (function_arguments == null ? null : function_arguments);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Function_call_args aFunction_call_args = (Function_call_args) o;
      return arguments != null ? arguments.equals(aFunction_call_args.arguments) : aFunction_call_args.arguments == null;
    }

    @Override
    public int hashCode() {
      int result = arguments != null ? arguments.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Function_call_args{" +
              "\narguments=" + arguments + '\'' +
              '}';
    }
}
