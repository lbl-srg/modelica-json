const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Named_arguments = require('../domain/Named_arguments');

const Named_argumentVisitor = require('./Named_argumentVisitor');

class Named_argumentsVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitNamed_arguments(ctx) {
        var named_argument = null;
        var named_arguments = null;

        if (ctx.named_arguments()) {
            named_arguments = this.visitNamed_arguments(ctx.named_arguments());
        }
        if (ctx.named_argument()) {
            var named_argumentVisitor = new Named_argumentVisitor.Named_argumentVisitor();
            named_argument = named_argumentVisitor.visitNamed_argument(ctx.named_argument());
        }

        return new Named_arguments.Named_arguments(named_argument, named_arguments);
    }
};

Named_argumentsVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitNamed_arguments = this.visitNamed_arguments;
exports.Named_argumentsVisitor = Named_argumentsVisitor;