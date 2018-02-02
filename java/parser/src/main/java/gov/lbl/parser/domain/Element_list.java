package gov.lbl.parser.domain;

import java.util.Collection;

public class Element_list {
    private Collection<Element> element;

    public Element_list(Collection<Element> element) {
      this.element = (element.size() > 0 ? element : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Element_list aElement_list = (Element_list) o;
      return element != null ? element.equals(aElement_list.element) : aElement_list.element == null;
    }

    @Override
    public int hashCode() {
      int result = element != null ? element.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Element_list{" +
              "\nelement=" + element + '\'' +
              '}';
    }
}
