const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Stored_definition = require('../domain/Stored_definition');
const Final_class_definition = require('../domain/Final_class_definition');
const Name = require('../domain/Name');

const NameVisitor = require('./NameVisitor');
// const Class_definitionVisitor = require('./Class_definitionVisitor');

class Stored_definitionVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitStored_definition(ctx) {
        // ctx.children.forEach(child => {
        //     console.log(child.getText())
        // });
        // Name name = nameVisitor.visitName(ctx.Name);
        const nameVisitor = new NameVisitor.NameVisitor();
        // console.log(ctx.name());
        nameVisitor.visitName(ctx.name());
        

        return new Stored_definition.Stored_definition(null, null);
    }
};

Stored_definitionVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.Stored_definitionVisitor = Stored_definitionVisitor;
exports.visitStored_definition = this.visitStored_definition;
