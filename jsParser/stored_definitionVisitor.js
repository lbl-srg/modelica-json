const modelicaVisitor = require('./antlrFiles/modelicaVisitor').modelicaVisitor;
const stored_definition = require('./domain/Stored_definition');
const nameVisitor = require('./nameVisitor');

class stored_definitionVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitStored_definition(ctx) {
        ctx.children.forEach(child => {
            console.log(child.getText())
        });
        

        return new stored_definition.Stored_definition(null, null);
    }
};

stored_definitionVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.stored_definitionVisitor = stored_definitionVisitor;
exports.visitStored_definition = this.visitStored_definition;