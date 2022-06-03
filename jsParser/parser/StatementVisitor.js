const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Statement = require('../domain/Statement');
const Assignment_statement = require('../domain/Assignment_statement');
const Assignment_with_function_call_statement = require('../domain/Assignment_with_function_call_statement');
const Function_call_statement = require('../domain/Function_call_statement');

const ExpressionVisitor = require('./ExpressionVisitor');
const Component_referenceVisitor = require('./Component_referenceVisitor');
const Function_call_argsVisitor = require('./Function_call_argsVisitor');
const Output_expression_listVisitor = require('./Output_expression_listVisitor');
const If_statementVisitor = require('./If_statementVisitor');
const For_statementVisitor = require('./For_statementVisitor');
const While_statementVisitor = require('./While_statementVisitor');
const When_statementVisitor = require('./When_statementVisitor');
const CommentVisitor = require('./CommentVisitor');

class StatementVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitStatement(ctx) {
        var assignment_statement = null;
        var assignment_with_function_call_statement = null;
        var component_reference = null;
        var value = null;
        var function_call_statement = null;
        var function_call_args = null;
        var is_break = ctx.BREAK()? true: false;
        var is_return = ctx.RETURN()? true: false;
        var if_statement = null;
        var for_statement = null;
        var while_statement = null;
        var when_statement = nulll        
        var comment = null;
        
        if (ctx.component_reference()) {
            var component_referenceVisitor = new Component_referenceVisitor.Component_referenceVisitor();
            component_reference = component_referenceVisitor.visitComponent_reference(ctx.component_reference());
        }
        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            value = expressionVisitor.visitExpression(ctx.expression());
        }
        if (ctx.function_call_args()) {
            var function_call_argsVisitor = new Function_call_argsVisitor.Function_call_argsVisitor();
            function_call_args = function_call_argsVisitor.visitFunction_call_args(ctx.function_call_args());
        }
        if (ctx.output_expression_list()) {
            var output_expression_listVisitor = Output_expression_listVisitor.Output_expression_listVisitor();
            output_expression_list = output_expression_listVisitor.visitOutput_expression_list(ctx.output_expression_list());
        }

        if (component_reference != null && value != null) {
            assignment_statement = new Assignment_statement(component_reference, value);
        }
        else if (component_reference != null && function_call_args != null && output_expression_list != null) {
            assignment_with_function_call_statement = new Assignment_with_function_call_statement(output_expression_list, component_reference, function_call_args);
        }
        else if (component_reference != null && function_call_args != null) {
            function_call_statement = new Function_call_statement(component_reference, function_call_args);
        }
        if (ctx.if_statement()) {
            var if_statementVisitor = new If_statementVisitor.If_statementVisitor();
            if_statement = if_statementVisitor.visitIf_statement(ctx.if_statement());
        }
        if (ctx.for_statement()) {
            var for_statementVisitor = new For_statementVisitor.For_statementVisitor();
            for_statement = for_statementVisitor.visitFor_statement(ctx.for_statement());
        }
        if (ctx.while_equation()) {
            var while_statementVisitor = new While_statementVisitor.While_statementVisitor();
            while_equation = while_statementVisitor.visitWhile_statement(ctx.while_equation());
        }
        if (ctx.when_equation()) {
            var when_statementVisitor = new When_statementVisitor.When_statementVisitor();
            when_equation = when_statementVisitor.visitWhen_statement(ctx.when_equation());
        }
        if (ctx.comment()) {
            var commentVisitor = new CommentVisitor.CommentVisitor();
            comment = commentVisitor.visitComment(ctx.comment());
        }

        return new Statement.Statement(assignment_statement, function_call_statement, assignment_with_function_call_statement, is_break, 
                                        is_return, if_statement, for_statement, while_statement, when_statement, comment);
    }
};

StatementVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitStatement = this.visitStatement;
exports.StatementVisitor = StatementVisitor;