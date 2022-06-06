const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const For_statement = require('../domain/For_statement');

const StatementVisitor = require('./StatementVisitor');
const For_indicesVisitor = require('./For_indicesVisitor');

class For_statementVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitFor_statement(ctx) {
        var for_indices = null;
        var loop_statements = [];

        if (ctx.for_indices()) {
            var for_indicesVisitor = new For_indicesVisitor.For_indicesVisitor();
            for_indices = for_indicesVisitor.visitFor_indices(ctx.for_indices());
        }

        if (ctx.statement()) {
            var statementVisitor = new StatementVisitor.StatementVisitor();
            ctx.statement().forEach(stmt => {
                loop_statements.push(statementVisitor.visitStatement(stmt));
            });
        }
        
        return new For_statement.For_statement(for_indices, loop_statements);
    }
};

For_statementVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitFor_statement = this.visitFor_statement;
exports.For_statementVisitor = For_statementVisitor;