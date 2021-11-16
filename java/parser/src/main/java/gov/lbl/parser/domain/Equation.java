package gov.lbl.parser.domain;

public class Equation {
    private Assignment_equation assignment_equation;
    private If_equation if_equation;
    private For_equation for_equation;
    private Connect_clause connect_clause;
    private When_equation when_equation;
    private Function_call_equation function_call_equation;
    private Comment comment;

    public Equation(Assignment_equation assignment_equation, If_equation if_equation, For_equation for_equation, Connect_clause connect_clause, When_equation when_equation, Function_call_equation function_call_equation, Comment comment) {
        this.assignment_equation = assignment_equation;
        this.if_equation = if_equation;
        this.for_equation = for_equation;
        this.connect_clause = connect_clause;
        this.when_equation = when_equation;
        this.function_call_equation = function_call_equation;
        this.comment = comment;
    }
}

