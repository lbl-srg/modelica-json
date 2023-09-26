const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor

class Type_prefixVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitType_prefix (ctx) {
    const flow_dec = ctx.FLOW() ? ctx.FLOW().getText() : ''
    const stream_dec = ctx.STREAM() ? ctx.STREAM().getText() : ''
    const disc_dec = ctx.DISCRETE() ? ctx.DISCRETE().getText() : ''
    const par_dec = ctx.PARAMETER() ? ctx.PARAMETER().getText() : ''
    const con_dec = ctx.CONSTANT() ? ctx.CONSTANT().getText() : ''
    const in_dec = ctx.INPUT() ? ctx.INPUT().getText() : ''
    const out_dec = ctx.OUTPUT() ? ctx.OUTPUT().getText() : ''

    let type_prefix = ''

    if (flow_dec.length > 0 || stream_dec.length > 0) {
      if (flow_dec.length > 0) {
        type_prefix = flow_dec
      } else {
        type_prefix = stream_dec
      }
    }
    if (disc_dec.length > 0 || par_dec.length > 0 || con_dec.length > 0) {
      if (disc_dec.length > 0) {
        type_prefix = (type_prefix.length > 0) ? type_prefix + ' ' + disc_dec : disc_dec
      } else if (par_dec.length > 0) {
        type_prefix = (type_prefix.length > 0) ? type_prefix + ' ' + par_dec : par_dec
      } else if (con_dec.length > 0) {
        type_prefix = (type_prefix.length > 0) ? type_prefix + ' ' + con_dec : con_dec
      }
    }
    if (in_dec.length > 0 || out_dec.length > 0) {
      if (in_dec.length > 0) {
        type_prefix = (type_prefix.length > 0) ? type_prefix + ' ' + in_dec : in_dec
      } else if (out_dec.length > 0) {
        type_prefix = (type_prefix.length > 0) ? type_prefix + ' ' + out_dec : out_dec
      }
    }
    return type_prefix
  }
};

Type_prefixVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.visitType_prefix = this.visitType_prefix
exports.Type_prefixVisitor = Type_prefixVisitor
