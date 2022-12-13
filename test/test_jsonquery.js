const as = require('assert')
const mo = require('mocha')
const jq = require('../lib/jsonquery.js')
const sinon = require('sinon')

function equalObjects (dict, reference) {
  if (!dict && !reference) {
    return false
  }
  if (dict.constructor === Object && reference.constructor === Object) {
    if (Object.keys(dict).length !== Object.keys(reference).length) {
      return false
    }
    Object.keys(dict).sort().forEach(idx => {
      if (!(idx in reference)) {
        return false
      } else {
        return equalObjects(dict[idx], reference[idx])
      }
    })
    return true
  } else if ((dict.constructor === Array || reference.constructor === Array)) {
    if (dict.length !== reference.length) {
      return false
    } else {
      for (var i = 0; i < dict.length; i++) {
        if (!(equalObjects(dict[i], reference[i]))) {
          return false
        }
      }
      return true
    }
  } else {
    return dict === reference
  }
}

mo.afterEach(() => {
  sinon.restore()
})

mo.describe('jsonquery.js', function () {
  mo.describe('testing classDefinition', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'classSpecifier').returns('mocked class_specifier')
      var rawJson = {
        'encapsulated': true,
        'class_prefixes': 'partial',
        'class_specifier': 'test class_specifier'
      }
      var jsonOutput = jq.classDefinition(rawJson)
      var referenceJsonOutput = {
        'class_prefixes': 'partial',
        'class_specifier': 'mocked class_specifier',
        'encapsulated': true
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
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
  mo.describe('testing composition', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'elementList').returns({'element_list': 'mocked element_list'})
      sinon.stub(jq, 'elementSections').returns(['mocked element_section1', 'mocked element_section2'])
      sinon.stub(jq, 'classModification').returns({'class_modification': 'mocked class_modification'})
      sinon.stub(jq, 'externalComposition').returns({'external_composition': 'mocked external_omposition'})
      var rawJson = {
        'element_list': 'test element_list',
        'element_sections': ['test element_section1', 'test element_section2'],
        'annotation': {
          'class_modification': 'test class_modification'
        },
        'external_composition': 'test external_composition'
      }
      var jsonOutput = jq.composition(rawJson)
      var referenceJsonOutput = {
        'element_list': 'mocked element_list',
        'element_sections': ['mocked element_section1', 'mocked element_section2'],
        'annotation': 'mocked class_modification',
        'external_composition': 'mocked external_composition'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
    })
    mo.it('testing missing element_list', function () {
      sinon.stub(jq, 'elementList').returns({'element_list': 'mocked element_list'})
      sinon.stub(jq, 'elementSections').returns(['mocked element_section1', 'mocked element_section2'])
      sinon.stub(jq, 'classModification').returns({'class_modification': 'mocked class_modification'})
      sinon.stub(jq, 'externalComposition').returns({'external_composition': 'mocked external_omposition'})
      var rawJson = {
        'element_sections': ['test element_section1', 'test element_section2'],
        'annotation': 'test annotation',
        'external_composition': 'test external_composition'
      }
      try {
        jq.composition(rawJson)
        as.fail('no error raised for missing element_list')
      } catch (e) {
        as.equal(e.message, 'missing element_list')
      }
    })
  })
  mo.describe('testing classModification', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'elementModificationReplaceable').returns('mocked element_modification_or_replaceable')
      sinon.stub(jq, 'elementRedeclaration').returns('mocked element_redeclaration')
      var rawJson = {
        'argument_list': {
          'arguments': [
            {
              'element_modification_or_replaceable': 'test element_modification_or_replaceable'
            },
            {
              'element_redeclaration': 'test element_redeclaration'
            }
          ]
        }
      }
      var jsonOutput = jq.classModification(rawJson)
      var referenceJsonOutput = [
        {
          'element_modification_or_replaceable': 'mocked element_modification_or_replaceable',
          'element_redeclaration': undefined
        },
        {
          'element_modification_or_replaceable': undefined,
          'element_redeclaration': 'mocked element_redeclaration'
        }
      ]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
    })
    mo.it('testing empty arguments', function () {
      sinon.stub(jq, 'elementRedeclaration').returns({'element_redeclaration': 'mocked element_redeclaration'})
      sinon.stub(jq, 'elementModificationReplaceable').returns({'element_modification_or_replaceble': 'mocked element_modification_or_replaceable'})
      var rawJson = {}
      var jsonOutput = jq.classModification(rawJson)
      var referenceJsonOutput = '()'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
    })
  })
  mo.describe('testing elementList', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'importClause').returns('mocked import_clause')
      sinon.stub(jq, 'extendsClause').returns('mocked extends_clause')
      sinon.stub(jq, 'classDefinition').returns('mocked class_definition')
      sinon.stub(jq, 'componentClause').returns('mocked component_clause')
      sinon.stub(jq, 'constrainingClause').returns('mocked constraining_clause')
      var rawJson = {
        'elements': [
          {
            'import_clause': 'test import_clause'
          },
          {
            'extends_clause': 'test extends_clause'
          },
          {
            'redeclare': true,
            'is_final': true,
            'inner': true,
            'outer': true,
            'replaceable': true,
            'class_definition': 'test class_definition',
            'component_clause': 'test component_clause',
            'constraining_clause': 'test constraining_clause',
            'comment': {
              'string_comment': 'test comment'
            }
          },
          {
            'redeclare': true,
            'is_final': true,
            'inner': true,
            'outer': true,
            'replaceable': false,
            'class_definition': 'test class_definition',
            'component_clause': 'test component_clause'
          }
        ]
      }
      var jsonOutput = jq.elementList(rawJson)
      var referenceJsonOutput = [
        {
          'import_clause': 'mocked import_clause',
          'extends_clause': undefined,
          'redeclare': undefined,
          'final': undefined,
          'inner': undefined,
          'outer': undefined,
          'replaceable': undefined,
          'class_definition': undefined,
          'component_clause': undefined,
          'constraining_clause': undefined,
          'description': undefined
        }, {
          'import_clause': undefined,
          'extends_clause': 'mocked extends_clause',
          'redeclare': undefined,
          'final': undefined,
          'inner': undefined,
          'outer': undefined,
          'replaceable': undefined,
          'class_definition': undefined,
          'component_clause': undefined,
          'constraining_clause': undefined,
          'description': undefined
        }, {
          'import_clause': undefined,
          'extends_clause': undefined,
          'redeclare': true,
          'final': true,
          'inner': true,
          'outer': true,
          'replaceable': true,
          'class_definition': 'mocked class_definition',
          'component_clause': 'mocked component_clause',
          'constraining_clause': 'mocked constraining_clause',
          'description': {
            'description_string': 'test comment',
            'annotation': undefined
          }
        }, {
          'import_clause': undefined,
          'extends_clause': undefined,
          'redeclare': true,
          'final': true,
          'inner': true,
          'outer': true,
          'replaceable': false,
          'class_definition': 'mocked class_definition',
          'component_clause': 'mocked component_clause',
          'constraining_clause': undefined,
          'description': undefined
        }
      ]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
    })
    mo.it('testing constraining_clause without replaceable', function () {
      sinon.stub(jq, 'importClause').returns('mocked import_clause')
      sinon.stub(jq, 'extendsClause').returns('mocked extends_clause')
      sinon.stub(jq, 'classDefinition').returns('mocked class_definition')
      sinon.stub(jq, 'componentClause').returns('mocked component_clause')
      sinon.stub(jq, 'constrainingClause').returns('mocked constraining_clause')
      var rawJson = {
        'elements': [
          {
            'redeclare': true,
            'is_final': true,
            'inner': true,
            'outer': true,
            'replaceable': false,
            'class_definition': 'test class_definition',
            'component_clause': 'test component_clause',
            'constraining_clause': 'test constraining_clause',
            'comment': {
              'string_comment': 'test comment'
            }
          }
        ]
      }
      try {
        jq.elementList(rawJson)
      } catch (e) {
        as.equal(e.message, 'cannot have constraining_clause without replaceable')
      }
    })
  })
  mo.describe('testing element_sections', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'elementList').withArgs('test public_element_list').returns('mocked public_element_list')
        .withArgs('test protected_element_list').returns('mocked protected_element_list')
      sinon.stub(jq, 'algorithmSection').returns('mocked algorithm_section')
      sinon.stub(jq, 'equationSection').returns('mocked equation_section')

      var rawJson = [
        {
          'public_element_list': 'test public_element_list'
        }, {
          'protected_element_list': 'test protected_element_list'
        }, {
          'algorithm_section': 'test algorithm_section'
        }, {
          'equation_section': 'test equation_section'
        }
      ]
      var jsonOutput = jq.elementSections(rawJson)
      var referenceJsonOutput = [
        {
          'public_element_list': 'mocked public_element_list',
          'protected_element_list': undefined,
          'algorithm_section': undefined,
          'equation_section': undefined
        },
        {
          'public_element_list': undefined,
          'protected_element_list': 'mocked protected_element_list',
          'algorithm_section': undefined,
          'equation_section': undefined
        },
        {
          'public_element_list': undefined,
          'protected_element_list': undefined,
          'algorithm_section': 'mocked algorithm_section',
          'equation_section': undefined
        },
        {
          'public_element_list': undefined,
          'protected_element_list': undefined,
          'algorithm_section': undefined,
          'equation_section': 'mocked equation_section'
        }
      ]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true)
    })
  })
})
