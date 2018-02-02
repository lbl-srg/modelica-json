package gov.lbl.parser.domain;

import java.util.Collection;

public class Component_list {
    private Collection<Component_declaration> component_declaration;

    public Component_list(Collection<Component_declaration> component_declaration) {
      this.component_declaration = (component_declaration.size() > 0 ? component_declaration : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Component_list aComponent_list = (Component_list) o;
      return component_declaration != null ? component_declaration.equals(aComponent_list.component_declaration) : aComponent_list.component_declaration == null;
    }

    @Override
    public int hashCode() {
      int result = component_declaration != null ? component_declaration.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Component_list{" +
              "\ncomponent_declaration=" + component_declaration + '\'' +
              '}';
    }
}
