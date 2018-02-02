package gov.lbl.parser.domain;

import java.util.Collection;

public class When_statement {
    private String when;
    private Collection<Statement> when_then;
    private Collection<String> else_when;
    private Collection<Statement> else_then;

    public When_statement(String expression1,
                          Collection<Statement> statement1,
                          Collection<String> expression2,
                          Collection<Statement> statement2) {
      this.when = expression1;
      this.when_then = (statement1 != null ? statement1 : null);
      this.else_when = (expression2 != null ? expression2 : null);
      this.else_then = (statement2 != null ? statement2 : null);
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      When_statement aWhen_statement = (When_statement) o;
      if (when != null ? !when.equals(aWhen_statement.when) : aWhen_statement.when != null) return false;
      if (when_then != null ? !when_then.equals(aWhen_statement.when_then) : aWhen_statement.when_then != null) return false;
      if (else_when != null ? !else_when.equals(aWhen_statement.else_when) : aWhen_statement.else_when != null) return false;
      return else_then != null ? else_then.equals(aWhen_statement.else_then) : aWhen_statement.else_then == null;
    }

    @Override
    public int hashCode() {
      int result = when != null ? when.hashCode() : 0;
      result = 31 * result + (when_then != null ? when_then.hashCode() : 0);
      result = 31 * result + (else_when != null ? else_when.hashCode() : 0);
      result = 31 * result + (else_then != null ? else_then.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "When_statement{" +
              "\nwhen=" + when + '\'' +
              "\nthen=" + when_then + '\'' +
              "\nelsewhen=" + else_when + '\'' +
              "\nthen=" + else_then + '\'' +
              '}';
    }
}
