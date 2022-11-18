package gov.lbl.parser.domain;

public class Arithmetic_term {
    private String add_op;        //'+' | '-' | '.+' | '.-'
    private Term term;

    public Arithmetic_term(String add_op, Term term) {
        this.add_op = add_op;
        this.term = term;
    }
}
