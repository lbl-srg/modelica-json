package gov.lbl.parser.domain;

import java.util.Collection;

public class Primary {
    private String simple_primary;
    private String name;
    private String der;
    private String initial;
    private Function_call_args function_call_args;
    private Component_reference component_reference;
    private Output_expression_list output_expression_list;
    private Collection<Expression_list> expression_list;
    private Function_arguments function_arguments;

    public Primary(String num_dec,
                   String str_dec,
                   String false_dec,
                   String true_dec,
                   String name,
                   String der_dec,
                   String init_dec,
                   Function_call_args function_call_args,
                   Component_reference component_reference,
                   Output_expression_list output_expression_list,
                   Collection<Expression_list> expression_list,
                   Function_arguments function_arguments,
                   String end_dec) {
        this.simple_primary = (num_dec != null) ? num_dec
				  : (str_dec != null ? str_dec
				  : (false_dec != null ? false_dec
				  : (true_dec != null ? true_dec
				  : (end_dec != null ? end_dec : null))));
        this.name = name;
        this.der = der_dec;
        this.initial = init_dec;
        this.function_call_args = function_call_args;
        this.component_reference = component_reference;
        this.output_expression_list = output_expression_list;
        this.expression_list = (expression_list.size()>0 ? expression_list : null);
        this.function_arguments = function_arguments;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Primary aPrimary = (Primary) o;
      return (simple_primary != null ? simple_primary.equals(aPrimary.simple_primary) : aPrimary.simple_primary == null)
           || (function_call_args != null ? function_call_args.equals(aPrimary.function_call_args) : aPrimary.function_call_args == null)
           || (component_reference != null ? component_reference.equals(aPrimary.component_reference) : aPrimary.component_reference == null)
           || (output_expression_list != null ? output_expression_list.equals(aPrimary.output_expression_list) : aPrimary.output_expression_list == null)
           || (expression_list != null ? expression_list.equals(aPrimary.expression_list) : aPrimary.expression_list == null)
           || (function_arguments != null ? function_arguments.equals(aPrimary.function_arguments) : aPrimary.function_arguments == null);
    }

    @Override
    public int hashCode() {
      int result = simple_primary != null ? simple_primary.hashCode() : 0;
      result = 31 * result + (name != null ? name.hashCode() : 0);
      result = 31 * result + (der != null ? der.hashCode() : 0);
      result = 31 * result + (initial != null ? initial.hashCode() : 0);
      result = 31 * result + (function_call_args != null ? function_call_args.hashCode() : 0);
      result = 31 * result + (component_reference != null ? component_reference.hashCode() : 0);
      result = 31 * result + (output_expression_list != null ? output_expression_list.hashCode() : 0);
      result = 31 * result + (expression_list != null ? expression_list.hashCode() : 0);
      result = 31 * result + (function_arguments != null ? function_arguments.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	  return "Primary{" +
    			  "\nsimple_primary=" + simple_primary + '\'' +
                  "\nname=" + name + '\'' +
                  "\nder=" + der + '\'' +
                  "\ninitial=" + initial + '\'' +
                  "\nfunction_call_args=" + function_call_args + '\'' +
    			  "\ncomponent_reference=" + component_reference + '\'' +
    			  "\noutput_expression_list=" + output_expression_list + '\'' +
    			  "\nexpression_list=" + expression_list + '\'' +
    			  "\nfunction_arguments=" + function_arguments + '\'' +
                  '}';
    }
}
