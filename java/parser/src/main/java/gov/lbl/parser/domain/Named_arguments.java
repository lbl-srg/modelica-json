package gov.lbl.parser.domain;

public class Named_arguments {
    private Named_argument argument;
    private Named_arguments arguments;

    public Named_arguments(Named_argument named_argument,
    		               Named_arguments named_arguments) {
      this.argument = named_argument;
      this.arguments = named_arguments;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Named_arguments aNamed_arguments = (Named_arguments) o;
      return argument != null ? argument.equals(aNamed_arguments.argument) : aNamed_arguments.argument == null;
    }

    @Override
    public int hashCode() {
      int result = argument != null ? argument.hashCode() : 0;
      result = 31 * result + (arguments != null ? arguments.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Named_arguments{" +
              "\nargument=" + argument + '\'' +
              "\narguments=" + arguments + '\'' +
              '}';
    }
}
