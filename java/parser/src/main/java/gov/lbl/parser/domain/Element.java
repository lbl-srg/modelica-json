package gov.lbl.parser.domain;

public class Element {
    private String prefix;
    private String replaceable;
    private Import_clause import_clause;
    private Extends_clause extends_clause;
    private Class_definition class_definition;
    private Class_definition replaceable_class_definition;
    private Component_clause component_clause;
    private Component_clause replaceable_component_clause;
    private String constraining_clause;
    private Comment comment;

    public Element(String red_dec,
                   String final_dec,
                   String inner_dec,
                   String outer_dec,
                   String rep_dec,
                   Import_clause import_clause,
                   Extends_clause extends_clause,
                   Class_definition class_definition1,
                   Class_definition class_definition2,
                   Component_clause component_clause1,
                   Component_clause component_clause2,
                   String constraining_clause,
                   Comment comment) {
    	this.import_clause = import_clause;
    	this.extends_clause = extends_clause;
    	this.prefix = (red_dec==null && final_dec==null && inner_dec==null && outer_dec==null) ? null
    			      : ((red_dec==null ? "" : (red_dec + " ")) + (final_dec==null ? "" : (final_dec + " "))
    			         + (inner_dec==null ? "" : (inner_dec + " ")) + (outer_dec==null ? "" : outer_dec));
    	this.class_definition = class_definition1;
    	this.component_clause = component_clause1;
    	this.replaceable = rep_dec;
    	this.replaceable_class_definition = class_definition2;
    	this.replaceable_component_clause = component_clause2;
    	this.constraining_clause = constraining_clause;
    	this.comment = comment;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Element aElement = (Element) o;
//      if (final_dec != null ? !final_dec.equals(aStored_definition.final_dec) : aStored_definition.final_dec != null) return false;
//      return name != null ? name.equals(aStored_definition.name) : aStored_definition.name == null;
      return (import_clause != null ? import_clause.equals(aElement.import_clause) : aElement.import_clause == null)
             ||(extends_clause != null ? extends_clause.equals(aElement.extends_clause) : aElement.extends_clause == null);
    }

    @Override
    public int hashCode() {
      int result = prefix != null ? prefix.hashCode() : 0;
      result = 31 * result + (replaceable != null ? replaceable.hashCode() : 0);
      result = 31 * result + (import_clause != null ? import_clause.hashCode() : 0);
      result = 31 * result + (extends_clause != null ? extends_clause.hashCode() : 0);
      result = 31 * result + (class_definition != null ? class_definition.hashCode() : 0);
      result = 31 * result + (replaceable_class_definition != null ? replaceable_class_definition.hashCode() : 0);
      result = 31 * result + (component_clause != null ? component_clause.hashCode() : 0);
      result = 31 * result + (replaceable_component_clause != null ? replaceable_component_clause.hashCode() : 0);
      result = 31 * result + (constraining_clause != null ? constraining_clause.hashCode() : 0);
      result = 31 * result + (comment != null ? comment.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
        return "Element{" +
               "\nimport_clause=" + import_clause + '\'' +
               "\nextends_clause=" + extends_clause + '\'' +
               "\nprefix=" + prefix + '\'' +
               "\nclass_definition=" + class_definition + '\'' +
               "\ncomponent_clause=" + component_clause + '\'' +
               "\nreplaceable=" + replaceable + '\'' +
               "\nreplaceable_class_definition=" + replaceable_class_definition + '\'' +
               "\nreplaceable_component_clause=" + replaceable_component_clause + '\'' +
               "\nconstraining_clause=" + constraining_clause + '\'' +
               "\ncomment=" + comment + '\'' +
               '}';
    }
}
