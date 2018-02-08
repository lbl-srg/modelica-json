package gov.lbl.parser.domain;

import java.util.Collection;

public class Algorithm_section {
	private String initial;
	private String algorithm;
	private Collection<Statement> statement;

    public Algorithm_section(String init_dec,
                             String alg_dec,
                             Collection<Statement> statement) {
      this.initial = init_dec;
      this.algorithm = alg_dec;
      this.statement = (statement.size()>0 ? statement : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Algorithm_section aAlgorithm_section = (Algorithm_section) o;
      if (algorithm != null ? !algorithm.equals(aAlgorithm_section.algorithm) : aAlgorithm_section.algorithm != null) return false;
      if (statement != null ? !statement.equals(aAlgorithm_section.statement) : aAlgorithm_section.statement != null) return false;
      return initial != null ? initial.equals(aAlgorithm_section.initial) : aAlgorithm_section.initial == null;
    }

    @Override
    public int hashCode() {
      int result = initial != null ? initial.hashCode() : 0;
      result = 31 * result + (algorithm != null ? algorithm.hashCode() : 0);
      result = 31 * result + (statement != null ? statement.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	return "Algorithm_section{" +
               "\ninitial=" + initial + '\'' +
               "\nalgorithmDec=" + algorithm + '\'' +
               "\nstatement=" + statement + '\'' +
               '}';


    }
}
