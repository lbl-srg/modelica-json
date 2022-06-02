const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Import_clause = require('../domain/Import_clause');

const NameVisitor = require('./NameVisitor');
const Import_listVisitor = require('./Import_listVisitor');
const CommentVisitor = require('./CommentVisitor');

class Import_clauseVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitImport_clause(ctx) {
        var identifier = ctx.IDENT()? ctx.IDENT().getText(): "";
        var name = null;
        var dot_star = ctx.IDENT()? true: false;
        var import_list = null;
        var comment = null;
        
        if (ctx.name()) {
            var nameVisitor = new NameVisitor.NameVisitor();
            name = nameVisitor.visitName(ctx.name());
        }

        if (ctx.import_list()) {
            var import_listVisitor = new Import_listVisitor.Import_listVisitor();
            import_list = import_listVisitor.visitImport_list(ctx.import_list());
        }

        if (ctx.comment()) {
            var commentVisitor = new CommentVisitor.CommentVisitor();
            comment = commentVisitor.visitComment(ctx.comment());
        }

        return new Import_clause.Import_clause(identifier, name, dot_star, import_list, comment);
    }
};

Import_clauseVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitImport_clause = this.visitImport_clause;
exports.Import_clauseVisitor = Import_clauseVisitor;