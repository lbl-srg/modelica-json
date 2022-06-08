const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const When_equation = require('../domain/When_equation');
const When_elsewhen_equation = require('../domain/When_elsewhen_equation');

const EquationVisitor = require('./EquationVisitor');
const ExpressionVisitor = require('./ExpressionVisitor');

class When_equationVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitWhen_equation(ctx) {
        var when_elsewhen = []
        var expressions = [];
        var equations = [];

        if (ctx.expression()) {
            var expressionVisitor = new ExpressionVisitor.ExpressionVisitor();
            ctx.expression().forEach(expr => {
                expressions.push(expressionVisitor.visitExpression(expr));
            });
        }
        if (ctx.equation()) {
            var equationVisitor = new EquationVisitor.EquationVisitor();
            ctx.equation().forEach(eqn => {
                equations.push(equationVisitor.visitEquation(eqn));
            });
        }

        var i = 0;
        var expression_idx = 0;
        var equation_idx = 0;

        while (i<ctx.getChildCount() && !ctx.getChild(i).getText().toLowerCase() == "end") {
            if (ctx.getChild(i).getText().toLowerCase() == "when" || ctx.getChild(i).getText().toLowerCase() == "elsewhen") {
                var condition = expressions.get(expression_idx);
                expression_idx+=1;
                let start_idx = i+3; //start after then (when/elswhen[0] <expr>[1] then[2] <eqn>[3])
                let end_idx = start_idx;
                for (let j=start_idx; j<ctx.getChildCount(); j++) {
                    if (!ctx.getChild(j).getText() == ";" && !(ctx.getChild(j) instanceof modelicaParser.EquationContext)) {
                        end_idx = j;
                        break;
                    }
                }
                
                var then = equations.slice(equation_idx, equation_idx + parseInt((end_idx-start_idx)/2)); //why (end-start)/2?
                when_elsewhen.push(new When_elsewhen_equation.When_elsewhen_equation(condition, then));
                equation_idx = equation_idx + parseInt((end_idx-start_idx)/2);
                i=end_idx;
            } else {
                i = i+1;
            }
        }
        return new When_equation.When_equation(when_elsewhen);
    }
};

When_equationVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitWhen_equation = this.visitWhen_equation;
exports.When_equationVisitor = When_equationVisitor;