package gov.lbl.parser.domain;

import java.util.Collection;

public class Stored_definition {
    private Collection<String> within;
    private Collection<String> prefix;
    private Collection<Class_definition> class_definition;

    public Stored_definition(Collection<String> within_dec,
                             Collection<String> final_dec,
                             Collection<String> name,
                             Collection<Class_definition> class_definition) {
      this.within = (name.size()>0 ? name : null);
      this.prefix = (final_dec.size() > 0 ? final_dec : null);
      this.class_definition = (class_definition.size() > 0 ? class_definition : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Stored_definition aStored_definition = (Stored_definition) o;
//      if (final_dec != null ? !final_dec.equals(aStored_definition.final_dec) : aStored_definition.final_dec != null) return false;
//      return name != null ? name.equals(aStored_definition.name) : aStored_definition.name == null;
      if (within != null ? !within.equals(aStored_definition.within) : aStored_definition.within != null) return false;
      return class_definition != null ? class_definition.equals(aStored_definition.class_definition) : aStored_definition.class_definition == null;
    }

    @Override
    public int hashCode() {
      int result =within != null ? within.hashCode() : 0;
      result = 31 * result + (prefix != null ? prefix.hashCode() : 0);
      result = 31 * result + (class_definition != null ? class_definition.hashCode() : 0);
      return result;
    }


    @Override
    public String toString() {
      return "Stored_definition{" +
              "\nwithin=" + within + '\'' +
              "\nprefix=" + prefix + '\'' +
              "\nclass_definition=" + class_definition + '\'' +
              '}';
    }
}
