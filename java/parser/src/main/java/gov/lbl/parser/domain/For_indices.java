package gov.lbl.parser.domain;

import java.util.Collection;

public class For_indices {
    private Collection<For_index> for_index;

    public For_indices(Collection<For_index> for_index) {
      this.for_index = (for_index.size()>0 ? for_index : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      For_indices aFor_indices = (For_indices) o;
      return for_index != null ? for_index.equals(aFor_indices.for_index) : aFor_indices.for_index == null;
    }

    @Override
    public int hashCode() {
      int result = for_index != null ? for_index.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "For_indices{" +
              "\nfor_index=" + for_index + '\'' +
              '}';
    }
}
