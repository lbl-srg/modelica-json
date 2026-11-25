'use strict'

const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Argument_list = require('../domain/Argument_list')

const ArgumentVisitor = require('./ArgumentVisitor')

class Argument_listVisitor extends modelicaVisitor {
  visitArgument_list (ctx) {
    const args = [] // strict JS does not allow use of this keyword; leave as is for now.

    if (ctx.argument()) {
      const argumentVisitor = new ArgumentVisitor.ArgumentVisitor()
      ctx.argument().forEach(arg => {
        args.push(argumentVisitor.visitArgument(arg))
      })
    }

    return new Argument_list.Argument_list(args)
  }
};

exports.Argument_listVisitor = Argument_listVisitor
