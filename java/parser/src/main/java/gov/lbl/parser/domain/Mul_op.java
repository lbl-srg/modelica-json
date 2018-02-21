package gov.lbl.parser.domain;

public class Mul_op {
    private String mul_op;

    public Mul_op(String ope_dec) {
      this.mul_op = ope_dec;
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Mul_op aMul_op = (Mul_op) o;
      return mul_op != null ? mul_op.equals(aMul_op.mul_op) : aMul_op.mul_op == null;
    }

    @Override
    public int hashCode() {
      int result = mul_op != null ? mul_op.hashCode() : 0;
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Mul_op{")
    		         .append("\nmul_op=").append(mul_op)
    		         .append('\'').append('}')
    		         .toString();
    }
}
