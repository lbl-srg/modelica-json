package gov.lbl.parser.domain;

import java.util.Collection;

public class For_equation {
    private String loop_indices;
    private Collection<Equation> loop_equations;

    public For_equation(String for_indices,
                        Collection<Equation> equation) {
      this.loop_indices = for_indices;
      this.loop_equations = (equation.size()>0 ? equation : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      For_equation aFor_equation = (For_equation) o;

      if (loop_indices != null ? !loop_indices.equals(aFor_equation.loop_indices) : aFor_equation.loop_indices != null) return false;
      return loop_equations != null ? loop_equations.equals(aFor_equation.loop_equations) : aFor_equation.loop_equations == null;
    }

    @Override
    public int hashCode() {
      int result = loop_indices != null ? loop_indices.hashCode() : 0;
      result = 31 * result + (loop_equations != null ? loop_equations.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "For_equation{" +
              "\nloop_indices=" + loop_indices + '\'' +
              "\nloop_equations=" + loop_equations + '\'' +
              '}';
    }
}
