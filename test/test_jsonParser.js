const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')
const algSV = require('../jsParser/parser/Algorithm_sectionVisitor.js').Algorithm_sectionVisitor
const algSec = require('../jsParser/domain/Algorithm_section.js')
const sv = require('../jsParser/parser/StatementVisitor.js')

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
