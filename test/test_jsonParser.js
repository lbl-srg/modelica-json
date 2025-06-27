const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')
const algSV = require('../jsParser/parser/Algorithm_sectionVisitor.js').Algorithm_sectionVisitor
const sv = require('../jsParser/parser/StatementVisitor.js')
const annV = require('../jsParser/parser/AnnotationVisitor.js').AnnotationVisitor
const cmv = require('../jsParser/parser/Class_modificationVisitor.js')

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
        const argV = require('../jsParser/parser/ArgumentVisitor.js')
        const alv = require('../jsParser/parser/Argument_listVisitor.js').Argument_listVisitor
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