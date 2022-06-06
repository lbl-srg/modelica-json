const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const While_statement = require('../domain/While_statement');

const StatementVisitor = require('./StatementVisitor');
const ExpressionVisitor = require('./ExpressionVisitor');

class While_statementVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitWhile_statement(ctx) {
        var expression = null;
        var loop_statements = [];

        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            expression = expressionVisitor.visitExpression(ctx.expression());
        }

        if (ctx.statement()) {
            var statementVisitor = new StatementVisitor.StatementVisitor();
            ctx.statement().forEach(stmt => {
                loop_statements.push(statementVisitor.visitStatement(stmt));
            });
        }
        
        return new While_statement.While_statement(expression, loop_statements);
    }
};

While_statementVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitWhile_statement = this.visitWhile_statement;
exports.While_statementVisitor = While_statementVisitor;