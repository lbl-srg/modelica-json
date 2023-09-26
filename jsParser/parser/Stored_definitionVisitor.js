const modelicaVisitor = require('../antlrFiles/modelicaVisitor').modelicaVisitor
const Stored_definition = require('../domain/Stored_definition')
const Final_class_definition = require('../domain/Final_class_definition')
const Name = require('../domain/Name')
const Class_definition = require('../domain/Class_definition')

const NameVisitor = require('./NameVisitor')
const { modelicaParser } = require('../antlrFiles/modelicaParser')
const { TerminalNode } = require('antlr4/tree/Tree')
const Class_definitionVisitor = require('./Class_definitionVisitor')

const util = require('util')

class Stored_definitionVisitor {
  constructor () {
    modelicaVisitor.call(this)
    return this
  }

  visitStored_definition (ctx) {
    let within = ''
    const final_class_definitions = []

    if (ctx.name()) {
      const nameVisitor = new NameVisitor.NameVisitor()
      const name = nameVisitor.visitName(ctx.name())

      name.name_parts.forEach(name_part => {
        if (name_part.dot_op) {
          within = util.format('%s%s', within, '.')
        }

        if (name_part.identifier) {
          within = util.format('%s%s', within, name_part.identifier)
        }
      })
    }

    const class_definitionVisitor = new Class_definitionVisitor.Class_definitionVisitor()
    let prev_final = false
    ctx.children.forEach(child => {
      if (child instanceof modelicaParser.Class_definitionContext) {
        const class_definition = class_definitionVisitor.visitClass_definition(child)
        final_class_definitions.push(new Final_class_definition.Final_class_definition(prev_final, class_definition))
        prev_final = false
      } else if (child instanceof TerminalNode) {
        if (child.getText() == 'final') {
          prev_final = true
        }
      }
    })

    return new Stored_definition.Stored_definition(within, final_class_definitions)
  }
};

Stored_definitionVisitor.prototype = Object.create(modelicaVisitor.prototype)

exports.Stored_definitionVisitor = Stored_definitionVisitor
exports.visitStored_definition = this.visitStored_definition
