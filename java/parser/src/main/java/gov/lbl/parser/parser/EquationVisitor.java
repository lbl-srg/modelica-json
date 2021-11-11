package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaParser;
import gov.lbl.parser.domain.Assignment_equation;
import gov.lbl.parser.domain.Comment;
import gov.lbl.parser.domain.Connect_clause;
import gov.lbl.parser.domain.Equation;
import gov.lbl.parser.domain.Expression;
import gov.lbl.parser.domain.For_equation;
import gov.lbl.parser.domain.Function_call_args;
import gov.lbl.parser.domain.Function_call_equation;
import gov.lbl.parser.domain.If_equation;
import gov.lbl.parser.domain.Name;
import gov.lbl.parser.domain.Simple_expression;
import gov.lbl.parser.domain.When_equation;

public class EquationVisitor extends modelicaBaseVisitor<Equation> {
    @Override
    public Equation visitEquation(modelicaParser.EquationContext ctx) {

        Simple_expressionVisitor simple_expressionVisitor = new Simple_expressionVisitor();
        Simple_expression lhs = ctx.simple_expression() == null ? null : ctx.simple_expression().accept(simple_expressionVisitor); 

        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        Expression rhs = ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);

        Assignment_equation assignment_equation = null;
        if (lhs != null && rhs != null) {
            assignment_equation = new Assignment_equation(lhs, rhs);
        }

        If_equationVisitor if_equationVisitor = new If_equationVisitor();
        If_equation if_equation = ctx.if_equation() == null ? null : ctx.if_equation().accept(if_equationVisitor);

        For_equationVisitor for_equationVisitor = new For_equationVisitor();
        For_equation for_equation = ctx.for_equation() == null ? null : ctx.for_equation().accept(for_equationVisitor);

        Connect_clauseVisitor connect_clauseVisitor = new Connect_clauseVisitor();
        Connect_clause connect_clause = ctx.connect_clause() == null ? null : ctx.connect_clause().accept(connect_clauseVisitor);

        When_equationVisitor when_equationVisitor = new When_equationVisitor();
        When_equation when_equation = ctx.when_equation() == null ? null : ctx.when_equation().accept(when_equationVisitor);

        NameVisitor nameVisitor = new NameVisitor();
        Name function_name = ctx.name() == null ? null : ctx.name().accept(nameVisitor);

        Function_call_argsVisitor function_call_argsVisitor = new Function_call_argsVisitor();
        Function_call_args function_call_args = ctx.function_call_args() == null ? null : ctx.function_call_args().accept(function_call_argsVisitor);

        Function_call_equation function_call_equation = null;
        if (function_name != null && function_call_args != null) {
            function_call_equation = new Function_call_equation(function_name, function_call_args);
        }

        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);

        return new Equation(assignment_equation, if_equation, for_equation, connect_clause, when_equation, function_call_equation, comment);
    }
}