const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;

class String_commentVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitString_comment(ctx) {
        var str_list = [];
        var string_comment = "";

        if (ctx.STRING()) {
            ctx.STRING().forEach(s => {
                str_list.push(ctx.STRING().getText());
            });
        }

        if (str_list.length > 0) {
            if (str_list.length == 1) {
                string_comment = str_list[0]
            } else if (str_list.length > 1) {
                string_comment = str_list.join('+');
            }
        }
        return string_comment;
    }
};

String_commentVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitString_comment = this.visitString_comment;
exports.String_commentVisitor = String_commentVisitor;