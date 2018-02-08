package gov.lbl.parser.domain;

public class Rel_op {
    private String rel_op;

    public Rel_op(String ope_dec) {
      this.rel_op = ope_dec;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Rel_op aRel_op = (Rel_op) o;
      return rel_op != null ? rel_op.equals(aRel_op.rel_op) : aRel_op.rel_op == null;
    }

    @Override
    public int hashCode() {
      int result = rel_op != null ? rel_op.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
      return "Rel_op{" +
              "\nrel_op=" + rel_op + '\'' +
              '}';
    }
}
