package gov.lbl.parser.domain;

public class Class_modification {
    private Argument_list argument_list;

    public Class_modification(Argument_list argument_list) {
      this.argument_list = (argument_list == null ? null : argument_list);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Class_modification aClass_modification = (Class_modification) o;
      return argument_list != null ? argument_list.equals(aClass_modification.argument_list) : aClass_modification.argument_list == null;
    }

    @Override
    public int hashCode() {
      int result = argument_list != null ? argument_list.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
      return temStr.append("Class_modification{")
    		       .append("\nargument_list=").append(argument_list)
    		       .append('\'').append('}')
    		       .toString();
    }
}
