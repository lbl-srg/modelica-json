const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const e = require('express');
const Name = require('../domain/Name');
const Name_part = require('../domain/Name_part');

const Name_partVisitor = require('./NameVisitor');

class NameVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitName(ctx) {
        var dots = []; 
        var idents = [];
        
        for (const dot of ctx.SYMBOL_DOT()) {
            dots.push(dot.getText());
        }
        
        for (const ident of ctx.IDENT()) {
            idents.push(ident.getText());
        }

        var name_parts = []
        if (idents.length == dots.length + 1) {
            name_parts.push(new Name_part.Name_part(false, idents[0]));
        } else if (idents.length == dots.length) {
            name_parts.push(new Name_part.Name_part(true, idents[0]));
        }

        for (let i = 1; i<idents.length; i++) {
            name_parts.push(new Name_part.Name_part(dots[i-1] == ".", idents[i]));
        }
        
        return new Name.Name(null);
    }
};

NameVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitName = this.visitName;
exports.NameVisitor = NameVisitor;

