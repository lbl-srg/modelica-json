package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Assignment_statement;
import gov.lbl.parser.domain.Assignment_with_function_call_statement;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Component_reference;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.For_statement;
import gov.lbl.parser.domain.Function_call_args;
import gov.lbl.parser.domain.Function_call_statement;
import gov.lbl.parser.domain.If_statement;
import gov.lbl.parser.domain.Output_expression_list;
import gov.lbl.parser.domain.Statement;
import gov.lbl.parser.domain.When_statement;
import gov.lbl.parser.domain.While_statement;

public class StatementVisitor extends modelicaBaseVisitor<Statement> {
    @Override
    public Statement visitStatement(modelicaParser.StatementContext ctx) {
        Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
        Component_reference component_reference = ctx.component_reference() == null ? null : ctx.component_reference().accept(component_referenceVisitor);

        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        Expression value = ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);

        Function_call_argsVisitor function_call_argsVisitor = new Function_call_argsVisitor();
        Function_call_args function_call_args = ctx.function_call_args() == null ? null : ctx.function_call_args().accept(function_call_argsVisitor);
        
        Output_expression_listVisitor output_expression_listVisitor = new Output_expression_listVisitor();
        Output_expression_list output_expression_list = ctx.output_expression_list() == null ? null : ctx.output_expression_list().accept(output_expression_listVisitor);

        Assignment_statement assignment_statement = null;
        Function_call_statement function_call_statement = null;
        Assignment_with_function_call_statement assignment_with_function_call_statement = null;
        if (component_reference != null && value != null) {
            assignment_statement = new Assignment_statement(component_reference, value);
        }
        else if (component_reference != null && function_call_args != null && output_expression_list != null) {
            assignment_with_function_call_statement = new Assignment_with_function_call_statement(output_expression_list, component_reference, function_call_args);
        }
        else if (component_reference != null && function_call_args != null) {
            function_call_statement = new Function_call_statement(component_reference, function_call_args);
        }

        Boolean is_break = ctx.BREAK() == null ? false : true;
        Boolean is_return = ctx.RETURN() == null ? false : true;
    
        If_statementVisitor if_statementVisitor = new If_statementVisitor();
        If_statement if_statement = ctx.if_statement() == null ? null : ctx.if_statement().accept(if_statementVisitor);

        For_statementVisitor for_statementVisitor = new For_statementVisitor();
        For_statement for_statement = ctx.for_statement() == null ? null : ctx.for_statement().accept(for_statementVisitor);
        
        While_statementVisitor while_statementVisitor = new While_statementVisitor();
        While_statement while_statement = ctx.while_statement() == null ? null : ctx.while_statement().accept(while_statementVisitor);
        
        When_statementVisitor when_statementVisitor = new When_statementVisitor();
        When_statement when_statement = ctx.when_statement() == null ? null : ctx.when_statement().accept(when_statementVisitor);
        
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        
        return new Statement(assignment_statement, function_call_statement, assignment_with_function_call_statement, is_break, is_return, if_statement, for_statement, while_statement, when_statement, comment);
    }
}