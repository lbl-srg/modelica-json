const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Function_argument = require('../domain/Function_argument');

const NameVisitor = require('./NameVisitor');
const Named_argumentsVisitor = require('./Named_argumentsVisitor');
const ExpressionVisitor = require('./ExpressionVisitor');

class Function_argumentVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitFunction_argument(ctx) {
        var function_name = null;
        var named_arguments = null;
        var expression = null;

        if (ctx.name()) {
            var nameVisitor = new NameVisitor.NameVisitor();
            function_name = nameVisitor.visitName(ctx.name());
        }
        if (ctx.named_arguments()) {
            var named_argumentsVisitor = new Named_argumentsVisitor.Named_argumentsVisitor();
            named_arguments = named_argumentsVisitor.visitNamed_arguments(ctx.named_arguments());
        }
        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            expression = expressionVisitor.visitExpression(ctx.expression());
        }

        return new Function_argument.Function_argument(function_name, named_arguments, expression);
    }
};

Function_argumentVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitFunction_argument = this.visitFunction_argument;
exports.Function_argumentVisitor = Function_argumentVisitor;