const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')

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

const algSV = require('../jsParser/parser/Algorithm_sectionVisitor.js') 
const { Algorithm_section } = require('../jsParser/domain/Algorithm_section.js')
mo.describe('testing Algorithm_sectionVisitor.js', function () {
    mo.it('testing initial = true', function () {
        sinon.stub(algSV, 'StatementVisitor').returns('mocked statementVisitor')
        sinon.stub(algSV, 'visitStatement').returns(stmt)
        const input = ctxMockTrue
        const output = algSV.visitAlgorithm_section(input)
        const referenceOutput = Algorithm_section(true, [1, 2, 3, 4 , 5])
        as.equal(output.initial, referenceOutput.initial, 'expected = ' + referenceOutput + '; actual = ' + output)
    })
})