const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Equation = require('../domain/Equation');
const Assignment_equation = require('../domain/Assignment_equation');
const Function_call_equation = require('../domain/Function_call_equation');

const Simple_expressionVisitor = require('./Simple_expressionVisitor');
const ExpressionVisitor = require('./ExpressionVisitor');
const If_equationVisitor = require('./If_equationVisitor');
const For_equationVisitor = require('./For_equationVisitor');
const Connect_clauseVisitor = require('./Connect_clauseVisitor');
const When_equationVisitor = require('./When_equationVisitor');
const NameVisitor = require('./NameVisitor');
const Function_call_argsVisitor = require('./Function_call_argsVisitor');

class EquationVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitEquation(ctx) {
        var assignment_equation = null;
        var lhs = null;
        var rhs = null;
        var if_equation = null;
        var for_equation = null;
        var connect_clause = null;
        var when_equation = null;
        var function_call_equation = null;
        var function_name = null;
        var function_call_args = null;
        var comment = null;

        if (ctx.simple_expression()) {
            var simple_expressionVisitor = new Simple_expressionVisitor.Simple_expressionVisitor();
            lhs = simple_expressionVisitor.visitSimple_expression(ctx.simple_expression());
        }
        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            rhs = expressionVisitor.visitExpression(ctx.expression());
        }
        if (lhs != null && rhs != null) {
            assignment_equation = new Assignment_equation.Assignment_equation(lhs, rhs);
        }

        if (ctx.if_equation()) {
            var if_equationVisitor = new If_equationVisitor.If_equationVisitor();
            if_equation = if_equationVisitor.visitIf_equation(ctx.if_equation());
        }
        if (ctx.for_equation()) {
            var for_equationVisitor = new For_equationVisitor.For_equationVisitor();
            for_equation = for_equationVisitor.visitFor_equation(ctx.for_equation());
        }
        if (ctx.connect_clause()) {
            var connect_clauseVisitor = new Connect_clauseVisitor.Connect_clauseVisitor();
            connect_clause = connect_clauseVisitor.visitConnect_clause(ctx.connect_clause());
        }
        if (ctx.when_equation()) {
            var when_equationVisitor = new When_equationVisitor.When_equationVisitor();
            when_equation = when_equationVisitor.visitWhen_equationVisitor(ctx.when_equation());
        }
        if (ctx.name()) {
            var nameVisitor = new NameVisitor.NameVisitor();
            function_name = nameVisitor.visitName(ctx.name());
        }
        if (ctx.function_call_args()) {
            var function_call_argsVisitor = new Function_call_argsVisitor.Function_call_argsVisitor();
            function_call_args = function_call_argsVisitor.visitFunction_call_args(ctx.function_call_args());
        }
        if (function_name != null && function_call_args != null) {
            function_call_equation = new Function_call_equation.Function_call_equation(function_name, function_call_args);
        }
        if (ctx.comment()) {
            var commentVisitor = new CommentVisitor.CommentVisitor();
            comment = commentVisitor.visitComment(ctx.comment());
        }

        return new Equation.Equation(assignment_equation, if_equation, for_equation, connect_clause, when_equation, function_call_equation, comment);
    }
};

Equation_sectionVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitEquation = this.visitEquation;
exports.EquationVisitor = EquationVisitor;