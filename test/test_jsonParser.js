const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')
const algSV = require('../jsParser/parser/Algorithm_sectionVisitor.js').Algorithm_sectionVisitor
const algSec = require('../jsParser/domain/Algorithm_section.js')
const sv = require('../jsParser/parser/StatementVisitor.js')

mo.afterEach(() => {
  sinon.restore()
})

class ctxMockTrue {
    INITIAL () {
        return true
    }
    statement () {
        return [1,2,3,4,5]
    }
}

mo.describe('testing Algorithm_sectionVisitor.js', function () {
    mo.it('testing initial = true', function () {
        class statementVisitorMock {
            visitStatement (stmt) {
                return stmt
            }
        }
        sinon.stub(sv, 'StatementVisitor').returns(new statementVisitorMock)
        const visitor = new algSV()
        const input = new ctxMockTrue()
        const output = visitor.visitAlgorithm_section(input)
        const referenceOutput = new algSec.Algorithm_section(true, [1,2,3,4,5])
        as.equal(output.initial, referenceOutput.initial, 'expected = ' + referenceOutput.initial + '; actual = ' + output.initial)
        as.deepEqual(output.statements, referenceOutput.statements, 'expected = ' + referenceOutput.statements+ '; actual = ' + output.statements)
    })
})