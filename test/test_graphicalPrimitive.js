const sinon = require('sinon')
const assert = require('assert')
const mo = require('mocha')
const gp = require('../lib/graphicalPrimitives.js')

describe('isGraphicAnnotation', () => {
  it('should return true when name is a graphical annotation', () => {
    const name = 'Line'
    const result = gp.isGraphicAnnotation(name)
    assert.strictEqual(result, true)
  })

  it('should return false when name is not a graphical annotation', () => {
    const name = 'Circle'
    const result = gp.isGraphicAnnotation(name)
    assert.strictEqual(result, false)
  })

  it('should call some() with correct arguments', () => {
    const name = 'Rectangle'
    const someSpy = sinon.spy(Array.prototype, 'some')
    gp.isGraphicAnnotation(name)
    assert.strictEqual(someSpy.calledWith(sinon.match.func), true)
    someSpy.restore()
  })
})

describe('graphicAnnotationObj', () => {
  it('should call lineObj with correct argument when name is "Line"', () => {
    const name = 'Line'
    const mod = { class_modification: [] }
    const lineObjStub = sinon.stub().returns({})
    const originalLineObj = gp.lineObj
    gp.lineObj = lineObjStub
    gp.graphicAnnotationObj(name, mod)
    assert.strictEqual(lineObjStub.calledWith(mod), true)
    gp.lineObj = originalLineObj
  })

  it('should call textObj with correct argument when name is "Text"', () => {
    const name = 'Text'
    const mod = { class_modification: [] }
    const textObjStub = sinon.stub().returns({})
    const originalTextObj = gp.textObj
    gp.textObj = textObjStub
    gp.graphicAnnotationObj(name, mod)
    assert.strictEqual(textObjStub.calledWith(mod), true)
    gp.textObj = originalTextObj
  })

  // Add more tests for other cases
})

describe('lineObj', () => {
    it('should return a Line object', () => {
      const mod = {
        class_modification: [
          {
            element_modification_or_replaceable: {
              element_modification: {
                name: ['foo', 'bar'],
                modification: {
                  expression: {
                    simple_expression: 'baz'
                  }
                }
              }
            }
          }
        ]
      }
      const lineAttributeStub = sinon.stub().returns({ type: 'Line', name: 'foo', value: 'baz' })
      const result = gp.lineObj.call({ lineAttribute: lineAttributeStub }, mod)
      sinon.assert.calledWith(lineAttributeStub, [['foo', 'bar']], ['baz']);
      assert.deepStrictEqual(result, { type: 'Line', name: 'foo', value: 'baz' });
    })
  })
