const assert = require('assert')
const fs = require('bluebird').promisifyAll(require('fs'))
const jsonQuery = require('../lib/jsonquery')
const mocha = require('mocha')
const path = require('path')
const rewire = require('rewire')

// We use rewire to access private functions and test them
const cdlDoc = rewire('../lib/cdlDoc.js')

mocha.describe('cdlDoc', function () {
  mocha.describe('#sortDocSections()', function () {
    const sortDocSections = cdlDoc.__get__('sortDocSections');
    const doc = [
      {doc: "1", section: undefined},
      {doc: "2", section: "1.1"},
      {doc: "3", section: "1"},
      {doc: "8", section: "2.1.b"},
      {doc: "4", section: "1.1.b"},
      {doc: "5", section: undefined},
      {doc: "6", section: null},
      {doc: "7", section: "1.1.a"},
      {doc: "9", section: "2."},
    ];
    const orderedDoc = [
      { doc: "1", section: undefined },
      { doc: "5", section: undefined },
      { doc: "6", section: null },
      { doc: "3", section: "1" },
      { doc: "2", section: "1.1" },
      { doc: "7", section: "1.1.a" },
      { doc: "4", section: "1.1.b" },
      { doc: "9", section: "2." },
      { doc: "8", section: "2.1.b" }
    ];
    mocha.it('should return the given ordered array', function () {
      assert.deepStrictEqual(
        doc.sort(sortDocSections.bind(doc)),
        orderedDoc)
    })
  })
})
