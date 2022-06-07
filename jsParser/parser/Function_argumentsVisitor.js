const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Function_arguments = require('../domain/Function_arguments');

const Named_argumentsVisitor = require('./Named_argumentsVisitor');
const For_indicesVisitor = require('./For_indicesVisitor');
const Function_argumentVisitor = require('./Function_argumentVisitor');

class Function_argumentsVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitFunction_arguments(ctx) {
        var named_arguments = null;
        var function_argument = null;
        var for_indices = null;
        var function_arguments = null;

        if (ctx.named_arguments()) {
            var named_argumentsVisitor = new Named_argumentsVisitor.Named_argumentsVisitor();
            named_arguments = named_argumentsVisitor.visitNamed_arguments(ctx.named_arguments());
        }
        if (ctx.function_argument()) {
            var function_argumentVisitor = new Function_argumentVisitor.Function_argumentVisitor();
            function_argument = function_argumentVisitor.visitFunction_argument(ctx.function_argument());
        }
        if (ctx.function_arguments()) {
            var function_argumentsVisitor = new Function_argumentsVisitor();
            function_arguments = function_argumentsVisitor.visitFunction_arguments(ctx.function_arguments());
        }
        if (ctx.for_indices()) {
            var for_indicesVisitor = new For_indicesVisitor.For_indicesVisitor();
            for_indices = for_indicesVisitor.visitFor_indices(ctx.for_indices());
        }

        return new Function_arguments.Function_arguments(named_arguments, function_argument, for_indices, function_arguments);
    }
};

Function_argumentsVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitFunction_arguments = this.visitFunction_arguments;
exports.Function_argumentsVisitor = Function_argumentsVisitor;