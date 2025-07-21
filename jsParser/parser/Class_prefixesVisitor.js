const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const util = require('util')

class Class_prefixesVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitClass_prefixes (ctx) {
    let class_prefixes = ''

    const partial_dec = ctx.PARTIAL() ? ctx.PARTIAL().getText() : ''
    const class_dec = ctx.CLASS() ? ctx.CLASS().getText() : ''
    const model_dec = ctx.MODEL() ? ctx.MODEL().getText() : ''
    const block_dec = ctx.BLOCK() ? ctx.BLOCK().getText() : ''
    const type_dec = ctx.TYPE() ? ctx.TYPE().getText() : ''
    const package_dec = ctx.PACKAGE() ? ctx.PACKAGE().getText() : ''
    const operator_dec = ctx.OPERATOR() ? ctx.OPERATOR().getText() : ''
    const record_dec = ctx.RECORD() ? ctx.RECORD().getText() : ''
    const expandable_dec = ctx.EXPANDABLE() ? ctx.EXPANDABLE().getText() : ''
    const connector_dec = ctx.CONNECTOR() ? ctx.CONNECTOR().getText() : ''
    const pure_dec = ctx.PURE() ? ctx.PURE().getText() : ''
    const impure_dec = ctx.IMPURE() ? ctx.IMPURE().getText() : ''
    const function_dec = ctx.FUNCTION() ? ctx.FUNCTION().getText() : ''

    class_prefixes = (partial_dec.length == 0) ? '' : util.format('%s', partial_dec)
    if (class_dec.length > 0) {
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, class_dec) : class_dec
    } else if (model_dec.length > 0) {
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, model_dec) : model_dec
    } else if (record_dec.length > 0) {
      class_prefixes = (operator_dec.length > 0) ? class_prefixes != '' ? util.format('%s %s', class_prefixes, operator_dec) : operator_dec : class_prefixes
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, record_dec) : record_dec
    } else if (block_dec.length > 0) {
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, block_dec) : block_dec
    } else if (connector_dec.length > 0) {
      class_prefixes = (expandable_dec.length > 0) ? class_prefixes != '' ? util.format('%s %s', class_prefixes, expandable_dec) : expandable_dec : class_prefixes
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, connector_dec) : connector_dec
    } else if (type_dec.length > 0) {
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, type_dec) : type_dec
    } else if (package_dec.length > 0) {
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, package_dec) : package_dec
    } else if (function_dec.length > 0) {
      if (pure_dec.length > 0) {
        class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, pure_dec) : pure_dec
      } else if (impure_dec.length > 0) {
        class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, impure_dec) : impure_dec
      }

      if (operator_dec.length > 0) {
        class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, operator_dec) : operator_dec
      }
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, function_dec) : function_dec
    } else if (operator_dec.length > 0) {
      class_prefixes = class_prefixes != '' ? util.format('%s %s', class_prefixes, operator_dec) : operator_dec
    }

    return class_prefixes
  }
};

Class_prefixesVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitClass_prefixes = this.visitClass_prefixes
exports.Class_prefixesVisitor = Class_prefixesVisitor
