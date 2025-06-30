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
const asv = require('../jsParser/parser/Array_subscriptsVisitor.js').Array_subscriptsVisitor
const subV = require('../jsParser/parser/SubscriptVisitor.js')
const tpv = require('../jsParser/parser/Type_prefixVisitor.js') 
const bpv = require('../jsParser/parser/Base_prefixVisitor.js').Base_prefixVisitor

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
            sinon.stub(sv.StatementVisitor.prototype, 'visitStatement').callsFake((stmt) => stmt)
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
            statementVisitorStub = sinon.stub(sv.StatementVisitor.prototype, 'visitStatement').callsFake((stmt) => stmt)
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
            statementVisitorStub = sinon.stub(sv.StatementVisitor.prototype, 'visitStatement').callsFake((stmt) => stmt)
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
        sinon.stub(cmv.Class_modificationVisitor.prototype, 'visitClass_modification').callsFake((class_modification) => class_modification)
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
        sinon.stub(argV.ArgumentVisitor.prototype, 'visitArgument').callsFake((arg) => arg)
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
        sinon.stub(emorv.Element_modification_or_replaceableVisitor.prototype, 'visitElement_modification_or_replaceable').callsFake((input) => input)
        sinon.stub(erv.Element_redeclarationVisitor.prototype, 'visitElement_redeclaration').callsFake((input) => input)
        const visitor = new argv()
        const input = new ctxMock()
        const output = visitor.visitArgument(input)
        const referenceOutput = ['mocked element_modification_or_replaceable', 'mocked element_redeclaration']
        as.deepEqual(output.element_modification_or_replaceable, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.element_modification_or_replaceable)
        as.deepEqual(output.element_redeclaration, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.element_redeclaration)
    })
})
mo.describe('testing Arithmetic_expressionVisitor.js', function () {
    mo.describe('testing visitArithmetic_expression(ctx)', function () {
        class addMock {
            constructor (n) {
                this.n = n
            }
            getText () {
                return this.n
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
            sinon.stub(tv.TermVisitor.prototype, 'visitTerm').callsFake((t) => t)
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
            sinon.stub(tv.TermVisitor.prototype, 'visitTerm').callsFake((t) => t)
            const visitor = new vae()
            const input = new ctxMock()
            const output = visitor.visitArithmetic_expression(input)
            referenceOutput = [[1, 3], [2,4]]
            as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
            as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
        })
    })
})
mo.describe('testing Array_subscriptsVisitor.js', function () {
    mo.it('testing visitArray_subscripts(ctx)', function () {
        class ctxMock {
            subscript () {
                return [1,2,3,4,5]
            }
        }
        sinon.stub(subV.SubscriptVisitor.prototype, 'visitSubscript').callsFake((sub) => sub)
        const visitor = new asv()
        const input = new ctxMock()
        const output = visitor.visitArray_subscripts(input)
        const referenceOutput = [1,2,3,4,5]
        as.deepEqual(output.subscripts,referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output.subscripts)
    })
})
mo.describe('testing Base_prefixVisitor.js', function () {
    mo.it('testing visitBase_prefix(ctx)', function () {
        class ctxMock {
            type_prefix () {
                return 'mocked type_prefix'
            }
        }
        sinon.stub(tpv.Type_prefixVisitor.prototype, 'visitType_prefix').callsFake((type_prefix) => type_prefix)
        const visitor = new bpv()
        const input = new ctxMock()
        const output = visitor.visitBase_prefix(input)
        const referenceOutput = 'mocked type_prefix'
        as.deepEqual(output.type_prefix,referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output.type_prefix)
    })
})