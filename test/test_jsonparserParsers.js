const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')

mo.afterEach(() => {
  sinon.restore()
})

class ctxTrue {
    INITIAL () {
        return true
    }
    statement () {
        return [1,2,3,4,5]
    }
}

const algSV = require('../jsParser/parser/Algorithm_sectionVisitor.js') 
mo.describe('testing Algorithm_sectionVisitor.js', function () {
    mo.it('testing initial = true', function () {
        sinon.stub(algSV, '')
    })
})