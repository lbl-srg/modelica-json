const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Factor = require('../domain/Factor');

const PrimaryVisitor = require('./PrimaryVisitor');

class FactorVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitFactor(ctx) {
        var op = ctx.SYMBOL_CARET()? ctx.SYMBOL_CARET().getText(): (ctx.SYMBOL_DOTCARET()? ctx.SYMBOL_DOTCARET().getText(): "");
        var primarys = [];
        var primary1 = null;
        var primary2 = null;

        if (ctx.primary()) {
            var primaryVisitor = new PrimaryVisitor.PrimaryVisitor();
            ctx.primary().forEach(pri => {
                primarys.push(primaryVisitor.visitPrimary(pri));
            });
        }

        if (primarys.length > 0) {
            primary1 = primarys[0];
            if (primarys.length > 1) {
                primary2 = primarys[1];
            }
        }
        return new Factor.Factor(primary1, op, primary2);
    }
}

FactorVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitFactor = this.visitFactor;
exports.FactorVisitor = FactorVisitor;