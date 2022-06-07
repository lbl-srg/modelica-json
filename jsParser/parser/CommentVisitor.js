const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const Comment = require('../domain/Comment');

const String_commentVisitor = require('./String_commentVisitor');
const AnnotationVisitor = require('./AnnotationVisitor');

class CommentVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitComment(ctx) {
        var string_comment = "";
        var annotation = null;

        if (ctx.annotation()) {
            var annotationVisitor = new AnnotationVisitor.AnnotationVisitor();
            annotation = annotationVisitor.visitAnnotation(ctx.annotation());
        }
        if (ctx.string_comment()) {
            var string_commentVisitor = new String_commentVisitor.String_commentVisitor();
            string_comment = string_commentVisitor.visitString_comment(ctx.string_comment());
        }
        return new Comment.Comment(string_comment, annotation);
    }
};

CommentVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitComment = this.visitComment;
exports.CommentVisitor = CommentVisitor;