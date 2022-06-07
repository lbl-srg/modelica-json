const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Function_call_args = require('../domain/Function_call_args');

const Function_argumentsVisitor = require('./Function_argumentsVisitor');

class Function_call_argsVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitFunction_call_args(ctx) {
        var function_arguments = null;

        if (ctx.function_arguments()) {
            var function_argumentsVisitor = new Function_argumentsVisitor.Function_argumentsVisitor();
            function_arguments = function_argumentsVisitor.visitFunction_arguments(ctx.function_arguments());
        }

        return new Function_call_args.Function_call_args(function_arguments);
    }
};

Function_call_argsVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitFunction_call_args = this.visitFunction_call_args;
exports.Function_call_argsVisitor = Function_call_argsVisitor;