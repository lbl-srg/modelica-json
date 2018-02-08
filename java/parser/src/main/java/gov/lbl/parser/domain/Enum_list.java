package gov.lbl.parser.domain;

import java.util.Collection;

public class Enum_list {
    private Collection<Enumeration_literal> enumeration_literal;

    public Enum_list(Collection<Enumeration_literal> enumeration_literal) {
      this.enumeration_literal = enumeration_literal;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Enum_list aEnum_list = (Enum_list) o;
      return enumeration_literal != null ? enumeration_literal.equals(aEnum_list.enumeration_literal) : aEnum_list.enumeration_literal == null;
    }

    @Override
    public int hashCode() {
      int result = enumeration_literal != null ? enumeration_literal.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Enum_list{" +
              "\nenumeration_literal=" + enumeration_literal + '\'' +
              '}';
    }
}
