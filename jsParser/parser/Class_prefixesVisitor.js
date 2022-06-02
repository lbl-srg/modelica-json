const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor;
const util = require('util');

class Class_prefixesVisitor {
    constructor() {
        modelicaVisitor.call(this);
        return this;
    }
    visitClass_prefixes(ctx) {
        var class_prefixes = "";

        var partial_dec = ctx.PARTIAL() ? ctx.PARTIAL().getText() : "";
        var class_dec = ctx.CLASS() ? ctx.CLASS().getText() : "";
        var model_dec = ctx.MODEL() ? ctx.MODEL().getText() : "";
        var block_dec = ctx.BLOCK() ? ctx.BLOCK().getText() : "";
        var type_dec = ctx.TYPE() ? ctx.TYPE().getText() : "";
        var package_dec = ctx.PACKAGE() ? ctx.PACKAGE().getText() : "";
        var operator_dec = ctx.OPERATOR() ? ctx.OPERATOR().getText() : "";
        var record_dec = ctx.RECORD() ? ctx.RECORD().getText() : "";
        var expandable_dec = ctx.EXPANDABLE() ? ctx.EXPANDABLE().getText() : "";
        var connector_dec = ctx.CONNECTOR() ? ctx.CONNECTOR().getText() : "";
        var pure_dec = ctx.PURE() ? ctx.PURE().getText() : "";
        var impure_dec = ctx.IMPURE() ? ctx.IMPURE().getText() : "";
        var function_dec = ctx.FUNCTION() ? ctx.FUNCTION().getText() : "";

        class_prefixes = (partial_dec.length == 0) ? "" : util.format("%s ", partial_dec);
        if (class_dec.length > 0) {
            class_prefixes = util.format("%s %s", class_prefixes, class_dec);
        } else if (model_dec.length > 0) {
            class_prefixes = util.format("%s %s", class_prefixes, model_dec);
        } else if (record_dec.length > 0) {
            class_prefixes = (operator_dec.length > 0) ? util.format("%s %s", class_prefixes, operator_dec) : class_prefixes;
            class_prefixes = util.format("%s %s", class_prefixes, record_dec);
        } else if (block_dec.length > 0) {
            class_prefixes = util.format("%s %s", class_prefixes, block_dec);
        } else if (connector_dec.length > 0) {
            class_prefixes = (expandable_dec.length > 0) ? util.format("%s %s", class_prefixes, expandable_dec) : class_prefixes;
            class_prefixes = util.format("%s %s", class_prefixes, connector_dec);
        } else if (type_dec.length > 0) {
            class_prefixes = util.format("%s %s", class_prefixes, type_dec);
        } else if (package_dec.length > 0) {
            class_prefixes = util.format("%s %s", class_prefixes, package_dec);
        } else if (function_dec.length > 0) {
            if (pure_dec.length > 0) {
                class_prefixes = util.format("%s %s", class_prefixes, pure_dec);
            } else if (impure_dec.length > 0) {
                class_prefixes = util.format("%s %s", class_prefixes, impure_dec);
            }

            if (operator_dec.length > 0) {
                class_prefixes = util.format("%s %s", class_prefixes, operator_dec);
            }
            class_prefixes = util.format("%s %s", class_prefixes, function_dec);
        } else if (operator_dec.length > 0) {
            class_prefixes = util.format("%s %s", class_prefixes, operator_dec);
        }

        return class_prefixes;
    }
};

Class_prefixesVisitor.prototype = Object.create(modelicaVisitor.prototype);

exports.visitClass_prefixes = this.visitClass_prefixes;
exports.Class_prefixesVisitor = Class_prefixesVisitor;