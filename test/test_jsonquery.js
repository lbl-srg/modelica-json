const as = require('assert')
const mo = require('mocha')
const jq = require('../lib/jsonquery.js')
const sinon = require('sinon')

function equalDictionaries (dict, reference) {
  if (Object.keys(dict).length !== Object.keys(reference).length) {
    return false
  }

  Object.keys(dict).sort().forEach(idx => {
    if (!(idx in reference)) {
      return false
    } else {
      if (typeof (dict[idx]) === 'object') {
        if (!equalDictionaries(dict[idx], reference[idx])) {
          return false
        }
      } else {
        if (dict[idx] !== reference[idx]) {
          return false
        }
      }
    }
  })
  return true
}

afterEach(() => {
  // Restore the default sandbox here
  sinon.restore()
})
mo.describe('jsonquery.js', function () {
  mo.describe('testing classDefintion', function () {
    sinon.stub(jq, 'classSpecifier').returns({'class_specifier': 'mocked class_specifier'})
    mo.it('should return true', function () {
      var rawJson = {
        'class_definition': {
          'encapsulated': true,
          'class_prefixes': 'partial',
          'class_specifier': 'test-specifier'
        }
      }
      var jsonOutput = jq.classDefinition(rawJson)
      var referenceJsonOutput = {
        'class_prefixes': 'partial',
        'class_specifier': {
          'class_specifier': 'mocked class_specifier'
        },
        'encapsulated': true
      }
      as.equal(equalDictionaries(jsonOutput, referenceJsonOutput), true)
    })
  })
  mo.describe('testing classSpecifier', function () {
    mo.it('checking for empty class_specifier -> should return an error', function () {
      var rawJson = {}
      try {
        jq.classSpecifier(rawJson)
        as.fail('no error raised for missing all of long_class_specifier, short_class_specifier and der_class_specifier')
      } catch (e) {
        as.equal(e.message, 'one of long_class_specifier or short_class_specifier or der_class_specifier must be present in class_specifier')
      }
    })
    mo.it('checking with long_class_specifier', function () {
      sinon.stub(jq, 'longClassSpecifier').returns({'long_class_specifier': 'mocked long_class_specifier'})
      var rawJson = {
        'long_class_specifier': 'test long_class_specifier'
      }
      var jsonOutput = jq.classSpecifier(rawJson)
      var referenceJsonOutput = {
        'long_class_specifier': 'mocked long_class_specifier'
      }
      as.equal(equalDictionaries(jsonOutput, referenceJsonOutput), true)
    })
    mo.it('checking with short_class_specifier', function () {
      sinon.stub(jq, 'shortClassSpecifier').returns({'short_class_specifier': 'mocked short_class_specifier'})
      var rawJson = {
        'short_class_specifier': 'test short_class_specifier'
      }
      var jsonOutput = jq.classSpecifier(rawJson)
      var referenceJsonOutput = {
        'short_class_specifier': 'mocked short_class_specifier'
      }
      as.equal(equalDictionaries(jsonOutput, referenceJsonOutput), true)
    })
    mo.it('checking with der_class_specifier', function () {
      sinon.stub(jq, 'derClassSpecifier').returns({'der_class_specifier': 'mocked der_class_specifier'})
      var rawJson = {
        'der_class_specifier': 'test der_class_specifier'
      }
      var jsonOutput = jq.classSpecifier(rawJson)
      var referenceJsonOutput = {
        'der_class_specifier': 'mocked der_class_specifier'
      }
      as.equal(equalDictionaries(jsonOutput, referenceJsonOutput), true)
    })
  })

  mo.describe('testing longClassSpecifier', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'composition').returns({'composition': 'mocked composition'})
      sinon.stub(jq, 'classModification').returns({'class_modification': 'mocked class_modification'})
      var rawJson = {
        'identifier': 'test.identifier.a',
        'string_comment': 'string comment',
        'is_extends': false,
        'composition': 'test composition',
        'class_modification': 'test class_modification'
      }
      var jsonOutput = jq.longClassSpecifier(rawJson)
      var referenceJsonOutput = {
        'identifier': 'test.identifier.a',
        'description_string': 'string comment',
        'extends': false,
        'composition': 'mocked composition',
        'class_modification': 'mocked class_modification'
      }
      as.equal(equalDictionaries(jsonOutput, referenceJsonOutput), true)
    })
    mo.it('testing missing identifier', function () {
      sinon.stub(jq, 'composition').returns({'composition': 'mocked composition'})
      sinon.stub(jq, 'classModification').returns({'class_modification': 'mocked class_modification'})
      var rawJson = {
        'string_comment': 'string comment',
        'is_extends': false,
        'composition': 'test composition',
        'class_modification': 'test class_modification'
      }
      try {
        jq.longClassSpecifier(rawJson)
        as.fail('no error raised for missing identifier')
      } catch (e) {
        as.equal(e.message, 'missing identifier')
      }
    })
    mo.it('testing missing composition', function () {
      sinon.stub(jq, 'composition').returns({'composition': 'mocked composition'})
      sinon.stub(jq, 'classModification').returns({'class_modification': 'mocked class_modification'})
      var rawJson = {
        'identifier': 'test.identifier.a',
        'string_comment': 'string comment',
        'is_extends': false,
        'class_modification': 'test class_modification'
      }
      try {
        jq.longClassSpecifier(rawJson)
        as.fail('no error raised for missing composition')
      } catch (e) {
        as.equal(e.message, 'missing composition')
      }
    })
  })
})

// });

// mo.describe('jsonquery', function () {
//   mo.describe('updateImageLocations()', function () {
//     mo.it('should return', function () {
//       as.equal(jq.updateImageLocations(
//         'aa <img src='modelica://Buildings/Resources/Images/test.png' alt="altComment">'),
//       'aa <img src="Buildings/Resources/Images/test.png" alt="altComment">')
//       as.equal(jq.updateImageLocations(
//         'aa <img src="modelica://Buildings/Resources/Images/test.png">'),
//       'aa <img src="Buildings/Resources/Images/test.png">')
//       as.equal(jq.updateImageLocations(
//         'aa <img src="modelica://Buildings/Resources/Images/test.png">'),
//       'aa <img src="Buildings/Resources/Images/test.png">')
//       as.equal(jq.updateImageLocations(
//         'aa <img src="modelica://Buildings/Resources/Images/test.png"> bb <img src="modelica://Buildings/Resources/Images/test2.png">'),
//       'aa <img src="Buildings/Resources/Images/test.png"> bb <img src="Buildings/Resources/Images/test2.png">')
//     })
//   })
//   mo.describe('isType()', function () {
//     mo.it('should return true', function () {
//       as.equal(jq.isType('Real'), true)
//       as.equal(jq.isType('Integer'), true)
//       as.equal(jq.isType('String'), true)
//       as.equal(jq.isType('Boolean'), true)
//     })
//     mo.it('should return false', function () {
//       as.equal(jq.isType('Modelica.SIunit.Temperature'), false)
//       as.equal(jq.isType('Buildings.StringFunctions'), false)
//     })
//   })
//   mo.describe('removeTrailingArray()', function () {
//     mo.it('should return true', function () {
//       as.deepEqual(jq.removeTrailingArray('a[1]'), 'a')
//       as.deepEqual(jq.removeTrailingArray('a[1, 2]'), 'a')
//       as.deepEqual(jq.removeTrailingArray('a[1] '), 'a')
//     })
//   })
// })
