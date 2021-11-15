package gov.lbl.parser.domain;

public class Statement {
    private Assignment_statement assignment_statement;
    private Function_call_statement function_call_statement;
    private Assignment_with_function_call_statement assignment_with_function_call_statement;
    private Boolean is_break;
    private Boolean is_return;
    private If_statement if_statement;
    private For_statement for_statement;
    private While_statement while_statement;
    private When_statement when_statement;
    private Comment comment; 

    public Statement(Assignment_statement assignment_statement, Function_call_statement function_call_statement, Assignment_with_function_call_statement assignment_with_function_call_statement, Boolean is_break, 
                    Boolean is_return, If_statement if_statement, For_statement for_statement, While_statement while_statement, When_statement when_statement, Comment comment) {
        this.assignment_statement = assignment_statement;
        this.function_call_statement = function_call_statement;
        this.assignment_with_function_call_statement = assignment_with_function_call_statement;
        this.is_break = is_break;
        this.is_return = is_return;
        this.if_statement = if_statement;
        this.for_statement = for_statement;
        this.while_statement = while_statement;
        this.when_statement = when_statement;
        this.comment = comment;
    }
}
