const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Argument_list = require('../domain/Argument_list');

const ArgumentVisitor = require('./ArgumentVisitor');

class Argument_listVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitArgument_list(ctx) {
        var args = []; //strict JS does not allow use of this keyword; leave as is for now.

        if (ctx.arugment()) {
            var argumentVisitor = new ArgumentVisitor.ArgumentVisitor();
            ctx.arugment().forEach(arg => {
                args.push(argumentVisitor.visitArgument(arg));
            });
        }
        
        return new Argument_list.Argument_list(args);
    }
};

Argument_listVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitArgument_list = this.visitArgument_list;
exports.Argument_listVisitor = Argument_listVisitor;