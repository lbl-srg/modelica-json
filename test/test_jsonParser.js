const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')
const algSV = require('../jsParser/parser/Algorithm_sectionVisitor.js').Algorithm_sectionVisitor
const sv = require('../jsParser/parser/StatementVisitor.js')
const annV = require('../jsParser/parser/AnnotationVisitor.js').AnnotationVisitor
const cmv = require('../jsParser/parser/Class_modificationVisitor.js')
const argV = require('../jsParser/parser/ArgumentVisitor.js')
const alv = require('../jsParser/parser/Argument_listVisitor.js').Argument_listVisitor
const emorv = require('../jsParser/parser/Element_modification_or_replaceableVisitor.js')
const erv = require('../jsParser/parser/Element_redeclarationVisitor.js')
const argv = require('../jsParser/parser/ArgumentVisitor.js').ArgumentVisitor
const tv = require('../jsParser/parser/TermVisitor.js')
const vae = require('../jsParser/parser/Arithmetic_expressionVisitor.js').Arithmetic_expressionVisitor

mo.afterEach(() => {
  sinon.restore()
})

mo.describe('testing Algorithm_sectionVisitor.js', function () {
    mo.describe('testing visitAlgorithm_section(ctx)', function () {
        mo.it('testing initial = true', function () {
            class ctxMockTrue {
                INITIAL () {
                    return true
                }
                statement () {
                    return [1,2,3,4,5]
                }
            }
            class statementVisitorMock {
                visitStatement (stmt) {
                    return stmt
                }
            }
            sinon.stub(sv, 'StatementVisitor').returns(new statementVisitorMock)
            const visitor = new algSV()
            const input = new ctxMockTrue()
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [true, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected = ' + referenceOutput[0] + '; actual = ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected = ' + referenceOutput[1] + '; actual = ' + output.statements)
        })
        mo.it('testing initial = false', function () {
            class ctxMockFalse {
                INITIAL () {
                    return false
                }
                statement () {
                    return [1,2,3,4,5]
                }
            }
            class statementVisitorMock {
                visitStatement (stmt) {
                    return stmt
                }
            }
            sinon.stub(sv, 'StatementVisitor').returns(new statementVisitorMock)
            const visitor = new algSV()
            const input = new ctxMockFalse()
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [false, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected = ' + referenceOutput[0] + '; actual = ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected = ' + referenceOutput[1] + '; actual = ' + output.statements)
        })
        mo.it('testing initial = null', function () {
                class ctxMockNull {
                INITIAL () {
                    return null
                }
                statement () {
                    return [1,2,3,4,5]
                }
            }
            class statementVisitorMock {
                visitStatement (stmt) {
                    return stmt
                }
            }
            sinon.stub(sv, 'StatementVisitor').returns(new statementVisitorMock)
            const visitor = new algSV()
            const input = new ctxMockNull()
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [false, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected = ' + referenceOutput[0] + '; actual = ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected = ' + referenceOutput[1] + '; actual = ' + output.statements)
        })
    })

})
mo.describe('testing AnnotationVisitor.js', function () {
    mo.it('testing visitAnnotation(ctx)', function () {
        class ctxMock {
            class_modification () {
                return 'mocked class modifier'
            }
        }
        class class_modificationVisitorMock {
            visitClass_modification (class_modification) {
                return class_modification
            }
        }
        sinon.stub(cmv, 'Class_modificationVisitor').returns(new class_modificationVisitorMock)
        const visitor = new annV()
        const input = new ctxMock()
        const output = visitor.visitAnnotation(input)
        const referenceOutput = 'mocked class modifier'
        as.deepEqual(output.class_modification, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.class_modification)
    })
})
mo.describe('testing Argument_listVisitor.js', function () {
    mo.it('testing visitArgument_list(ctx)', function () {
        class ctxMock {
            argument () {
                return [1,2,3,4,5]
            }
        }
        class ArgumentVisitorMock {
            visitArgument (arg) {
                return arg
            }
        }
        sinon.stub(argV, 'ArgumentVisitor').returns(new ArgumentVisitorMock)
        const visitor = new alv()
        const input = new ctxMock()
        const output = visitor.visitArgument_list(input)
        const referenceOutput = [1,2,3,4,5]
        as.deepEqual(output.args, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.args)
    })
})
mo.describe('testing ArgumentVisitor.js', function () {
    mo.it('testing visitArgument(ctx)', function () {
        class ctxMock {
            element_modification_or_replaceable () {
                return "mocked element_modification_or_replaceable"
            }
            element_redeclaration () {
                return "mocked element_redeclaration"
            }
        }
        class Element_modification_or_replaceableVisitorMocked {
            visitElement_modification_or_replaceable (element_modification_or_replaceable) {
                return element_modification_or_replaceable
            }
        }
        class Element_redeclarationVisitorMocked {
            visitElement_redeclaration (element_redeclaration) {
                return element_redeclaration
            }
        }
        sinon.stub(emorv, 'Element_modification_or_replaceableVisitor').returns(new Element_modification_or_replaceableVisitorMocked)
        sinon.stub(erv, 'Element_redeclarationVisitor').returns(new Element_redeclarationVisitorMocked)
        const visitor = new argv()
        const input = new ctxMock()
        const output = visitor.visitArgument(input)
        const referenceOutput = ['mocked element_modification_or_replaceable', 'mocked element_redeclaration']
        as.deepEqual(output.element_modification_or_replaceable, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.element_modification_or_replaceable)
        as.deepEqual(output.element_redeclaration, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.element_redeclaration)
    })
})
// Need 1 test for if (app_opps.length == (terms.length - 1)) and one where it's not
mo.describe('testing Arithmetic_expressionVisitor.js', function () {
    mo.describe('visitArithmetic_expression(ctx)', function () {
        class addMock {
            constructor (n) {
                this.n = n
            }
            getText () {
                return this.n
            }
        }
        class TermVisitorMocked {
            visitTerm (t) {
                return t
            }
        }
        mo.it('testing when add_ops.length == (terms.length -1)', function () {
            class ctxMock {
                add_op () {
                    return [new addMock(1),new addMock(2)]
                }
                term () {
                    return [3,4,5]
                }
            }
            sinon.stub(tv, 'TermVisitor').returns(new TermVisitorMocked())
            const visitor = new vae()
            const input = new ctxMock()
            const output = visitor.visitArithmetic_expression(input)
            referenceOutput = [[null, 3], [1, 4], [2,5]]
            as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
            as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
            as.deepEqual([output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term], referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + [output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term]) 
        })
        mo.it('testing when add_ops.length != (terms.length -1)', function () {
            class ctxMock {
                add_op () {
                    return [new addMock(1),new addMock(2)]
                }
                term () {
                    return [3,4]
                }
            }
            sinon.stub(tv, 'TermVisitor').returns(new TermVisitorMocked())
            const visitor = new vae()
            const input = new ctxMock()
            const output = visitor.visitArithmetic_expression(input)
            referenceOutput = [[1, 3], [2,4]]
            as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
            as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
        })
    })
})