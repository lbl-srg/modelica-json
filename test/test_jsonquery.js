const as = require('assert')
const mo = require('mocha')
const jq = require('../lib/jsonquery.js')
const graPri = require('../lib/graphicalPrimitives.js')
const sinon = require('sinon')

function equalObjects (dict, reference) {
  if (dict === undefined && reference === undefined) {
    return true
  } else if ((dict === undefined) || (reference === undefined)) {
    return false
  }
  if (typeof (dict) !== typeof (reference)) {
    return false
  }
  if (dict.constructor === Object && reference.constructor === Object) {
    if (Object.keys(dict).length !== Object.keys(reference).length) {
      return false
    }
    var keys = Object.keys(dict).sort()
    for (var i = 0; i < keys.length; i++) {
      var idx = keys[i]
      if (!(idx in reference)) {
        return false
      } else {
        return equalObjects(dict[idx], reference[idx])
      }
    }
    return true
  } else if ((dict.constructor === Array && reference.constructor === Array)) {
    if (dict.length !== reference.length) {
      return false
    } else {
      for (var j = 0; j < dict.length; j++) {
        if (!(equalObjects(dict[j], reference[j]))) {
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
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
      sinon.stub(jq, 'longClassSpecifier').returns('mocked long_class_specifier')
      var rawJson = {
        'long_class_specifier': 'test long_class_specifier'
      }
      var jsonOutput = jq.classSpecifier(rawJson)
      var referenceJsonOutput = {
        'long_class_specifier': 'mocked long_class_specifier'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('checking with short_class_specifier', function () {
      sinon.stub(jq, 'shortClassSpecifier').returns('mocked short_class_specifier')
      var rawJson = {
        'short_class_specifier': 'test short_class_specifier'
      }
      var jsonOutput = jq.classSpecifier(rawJson)
      var referenceJsonOutput = {
        'short_class_specifier': 'mocked short_class_specifier'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('checking with der_class_specifier', function () {
      sinon.stub(jq, 'derClassSpecifier').returns('mocked der_class_specifier')
      var rawJson = {
        'der_class_specifier': 'test der_class_specifier'
      }
      var jsonOutput = jq.classSpecifier(rawJson)
      var referenceJsonOutput = {
        'der_class_specifier': 'mocked der_class_specifier'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })

  mo.describe('testing longClassSpecifier', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'composition').returns('mocked composition')
      sinon.stub(jq, 'classModification').returns('mocked class_modification')
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing missing identifier', function () {
      sinon.stub(jq, 'composition').returns('mocked composition')
      sinon.stub(jq, 'classModification').returns('mocked class_modification')
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
      sinon.stub(jq, 'elementList').returns('mocked element_list')
      sinon.stub(jq, 'elementSections').returns(['mocked element_section1', 'mocked element_section2'])
      sinon.stub(jq, 'classModification').returns('mocked class_modification')
      sinon.stub(jq, 'externalComposition').returns('mocked external_omposition')
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing empty arguments', function () {
      sinon.stub(jq, 'elementRedeclaration').returns({'element_redeclaration': 'mocked element_redeclaration'})
      sinon.stub(jq, 'elementModificationReplaceable').returns({'element_modification_or_replaceble': 'mocked element_modification_or_replaceable'})
      var rawJson = {}
      var jsonOutput = jq.classModification(rawJson)
      var referenceJsonOutput = '()'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
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
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing external_function_call', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'componentReference').returns('mocked component_reference')
      sinon.stub(jq, 'expression').withArgs('test expression1').returns('mocked expression1').withArgs('test expression2').returns('mocked expression2')

      var rawJson = {
        'component_reference': 'test component_reference',
        'identifier': 'test.identifier.a',
        'expression_list': {
          'expressions': [
            'test expression1',
            'test expression2'
          ]
        }
      }
      var jsonOutput = jq.externalFunctionCall(rawJson)
      var referenceJsonOutput = {
        'component_reference': 'mocked component_reference',
        'identifier': 'test.identifier.a',
        'expression_list': [
          'mocked expression1',
          'mocked expression2'
        ]
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing external_composition', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'externalFunctionCall').withArgs('test external_function_call').returns('mocked external_function_call')
      sinon.stub(jq, 'classModification').withArgs('test class_modification').returns('mocked class_modification')
      var rawJson = {
        'language_specification': 'test language_specification',
        'external_function_call': 'test external_function_call',
        'external_annotation': {
          'class_modification': 'test class_modification'
        }
      }
      var jsonOutput = jq.externalComposition(rawJson)
      var referenceJsonOutput = {
        'language_specification': 'test language_specification',
        'external_function_call': 'mocked external_function_call',
        'external_annotation': 'mocked class_modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing component_clause', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'typeSpecifier').withArgs('test type_specifier').returns('mocked type_specifier')
      sinon.stub(jq, 'arraySubscripts').withArgs('test array_subscripts').returns('mocked array_subscripts')
      sinon.stub(jq, 'componentList').withArgs('test component_list').returns('mocked component_list')
      var rawJson = {
        'type_prefix': 'test type_prefix',
        'type_specifier': 'test type_specifier',
        'array_subscripts': 'test array_subscripts',
        'component_list': 'test component_list'
      }
      var jsonOutput = jq.componentClause(rawJson)
      var referenceJsonOutput = {
        'type_prefix': 'test type_prefix',
        'type_specifier': 'mocked type_specifier',
        'array_subscripts': 'mocked array_subscripts',
        'component_list': 'mocked component_list'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing extends_clause', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'nameString').withArgs('test name').returns('mocked name')
      sinon.stub(jq, 'classModification').withArgs('test class_modification').returns('mocked class_modification').withArgs('test annotation.class_modification').returns('mocked annotation.class_modification')
      var rawJson = {
        'name': 'test name',
        'class_modification': 'test class_modification',
        'annotation': {
          'class_modification': 'test annotation.class_modification'
        }
      }
      var jsonOutput = jq.extendsClause(rawJson)
      var referenceJsonOutput = {
        'name': 'mocked name',
        'class_modification': 'mocked class_modification',
        'annotation': 'mocked annotation.class_modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing import_clause', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'nameString').withArgs('test name').returns('mocked name')
      sinon.stub(jq, 'importList').withArgs('test import_list').returns('mocked import_list')
      sinon.stub(jq, 'description').withArgs('test comment').returns('mocked comment').withArgs('test comment').returns('mocked comment')
      var rawJson = {
        'identifier': 'test identifier',
        'name': 'test name',
        'dot_star': true,
        'import_list': 'test import_list',
        'comment': 'test comment'
      }
      var jsonOutput = jq.importClause(rawJson)
      var referenceJsonOutput = {
        'identifier': 'test identifier',
        'name': 'mocked name',
        'dot_star': '.*',
        'import_list': 'mocked import_list',
        'description': 'mocked comment'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing component_list', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'declaration').withArgs('test declaration').returns('mocked declaration')
      sinon.stub(jq, 'expression').withArgs('test condition_attribute.expression').returns('mocked condition_attribute.expression')
      sinon.stub(jq, 'description').withArgs('test comment').returns('mocked comment').withArgs('test comment').returns('mocked comment')
      var rawJson = {
        'component_declaration_list': [
          {
            'declaration': 'test declaration',
            'condition_attribute': {
              'expression': 'test condition_attribute.expression'
            },
            'comment': 'test comment'
          }
        ]
      }
      var jsonOutput = jq.componentList(rawJson)
      var referenceJsonOutput = [{
        'declaration': 'mocked declaration',
        'condition_attribute': {
          'expression': 'mocked condition_attribute.expression'
        },
        'description': 'mocked comment'
      }]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing declaration', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'arraySubscripts').withArgs('test array_subscripts').returns('mocked array_subscripts')
      sinon.stub(jq, 'modification').withArgs('test modification').returns('mocked modification')
      var rawJson = {
        'identifier': 'test.identifier.a',
        'array_subscripts': 'test array_subscripts',
        'modification': 'test modification'
      }
      var jsonOutput = jq.declaration(rawJson)
      var referenceJsonOutput = {
        'identifier': 'test.identifier.a',
        'array_subscripts': 'mocked array_subscripts',
        'modification': 'mocked modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing element_modification', function () {
    mo.it('testing structure: element_modification', function () {
      sinon.stub(jq, 'nameString').withArgs('test name').returns('mocked name')
      sinon.stub(jq, 'modification').withArgs('test modification').returns('mocked modification')
      sinon.stub(graPri, 'graphicAnnotationObj').withArgs('test name', 'test modification').returns('mocked graphicAnnotationObj')
      var rawJson = {
        'name': 'test name',
        'string_comment': 'test string_comment',
        'modification': 'test modification'
      }
      var jsonOutput = jq.elementModification(rawJson)
      var referenceJsonOutput = {
        'name': 'mocked name',
        'description_string': 'test string_comment',
        'modification': 'mocked modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure: graphicAnnotationObj', function () {
      sinon.stub(jq, 'nameString').withArgs('Line').returns('Line')
      sinon.stub(jq, 'modification').withArgs('test modification').returns('mocked modification')
      sinon.stub(graPri, 'graphicAnnotationObj').withArgs('Line', 'mocked modification').returns('mocked graphicAnnotationObj')
      var rawJson = {
        'name': 'Line',
        'string_comment': 'test string_comment',
        'modification': 'test modification'
      }
      var jsonOutput = jq.elementModification(rawJson)
      var referenceJsonOutput = {
        'Line': 'mocked graphicAnnotationObj'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing element_modification_or_replaceable', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'elementModification').withArgs('test element_modification').returns('mocked element_modification')
      sinon.stub(jq, 'elementReplaceable').withArgs('test element_replaceable').returns('mocked element_replaceable')
      var rawJson = {
        'each': true,
        'is_final': true,
        'element_modification': 'test element_modification',
        'element_replaceable': 'test element_replaceable'
      }
      var jsonOutput = jq.elementModificationReplaceable(rawJson)
      var referenceJsonOutput = {
        'each': true,
        'final': true,
        'element_modification': 'mocked element_modification',
        'element_replaceable': 'mocked element_replaceable'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing element_redeclaration', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'shortClassDefinition').withArgs('test short_class_definition').returns('mocked short_class_definition')
      sinon.stub(jq, 'componentClause1').withArgs('test component_clause1').returns('mocked component_clause1')
      sinon.stub(jq, 'elementReplaceable').withArgs('test element_replaceable').returns('mocked element_replaceable')
      var rawJson = {
        'each': true,
        'is_final': true,
        'short_class_definition': 'test short_class_definition',
        'component_clause1': 'test component_clause1',
        'element_replaceable': 'test element_replaceable'
      }
      var jsonOutput = jq.elementRedeclaration(rawJson)
      var referenceJsonOutput = {
        'each': true,
        'final': true,
        'short_class_definition': 'mocked short_class_definition',
        'component_clause1': 'mocked component_clause1',
        'element_replaceable': 'mocked element_replaceable'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing expression_list', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1').withArgs('test simple_expression2').returns('mocked simple_expression2')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      var rawJson = [
        {
          'expressions': [
            {
              'simple_expression': 'test simple_expression1'
            }, {
              'if_expression': 'test if_expression1'
            }
          ]
        }, {
          'expressions': [
            {
              'simple_expression': 'test simple_expression2'
            }, {
              'if_expression': 'test if_expression2'
            }
          ]
        }
      ]
      var jsonOutput = jq.expLisString(rawJson)
      var referenceJsonOutput = 'mocked simple_expression1,mocked if_expression1;mocked simple_expression2,mocked if_expression2'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing expression', function () {
    mo.it('testing only simple_expression structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      var rawJson = {
        'simple_expression': 'test simple_expression1'
      }
      var jsonOutput = jq.expressionString(rawJson)
      var referenceJsonOutput = 'mocked simple_expression1'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing only if_expression structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      var rawJson = {
        'if_expression': 'test if_expression1'
      }
      var jsonOutput = jq.expressionString(rawJson)
      var referenceJsonOutput = 'mocked if_expression1'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing only simple_expression structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      var rawJson = {
        'simple_expression': 'test simple_expression1',
        'if_expression': 'test if_expression1'
      }
      var jsonOutput = jq.expressionString(rawJson)
      var referenceJsonOutput = 'mocked simple_expression1'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing simple_expression', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs('test logical_expression2')
              .returns('mocked logical_expression2').withArgs('test logical_expression3').returns('mocked logical_expression3')
      var rawJson = {
        'logical_expression1': 'test logical_expression1',
        'logical_expression2': 'test logical_expression2',
        'logical_expression3': 'test logical_expression3'
      }
      var jsonOutput = jq.simpleExpression(rawJson)
      var referenceJsonOutput = 'mocked logical_expression1:mocked logical_expression2:mocked logical_expression3'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing null logical_expression1', function () {
      var rawJson = {
        'logical_expression2': 'test logical_expression2'
      }
      try {
        jq.simpleExpression(rawJson)
        as.fail('no error raised for missing logical_expression1')
      } catch (e) {
        as.equal(e.message, 'simple_expression must contain logical_expression1')
      }
    })
    mo.it('testing function call logical_expression1', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs(undefined).returns(undefined)
      sinon.stub(jq, 'checkPri').withArgs('test logical_expression1').returns('mocked primary')
      sinon.stub(jq, 'functionCallObj').withArgs('mocked primary').returns('mocked function_call_primary')
      sinon.stub(jq, 'forLoopObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'ifExpressionObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'logicalExpressionObj').withArgs('test logical_expression1').returns(undefined)

      var rawJson = {
        'logical_expression1': 'test logical_expression1'
      }
      var jsonOutput = jq.simpleExpression(rawJson)
      console.log(jsonOutput)
      var referenceJsonOutput = {'function_call': 'mocked function_call_primary', 'for_loop': undefined, 'logical_expression': undefined, 'if_expression': undefined}
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing for_loop logical_expression1', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs(undefined).returns(undefined)
      sinon.stub(jq, 'checkPri').withArgs('test logical_expression1').returns('mocked primary')
      sinon.stub(jq, 'functionCallObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'forLoopObj').withArgs('mocked primary').returns('mocked for_loop')
      sinon.stub(jq, 'ifExpressionObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'logicalExpressionObj').withArgs('test logical_expression1').returns(undefined)

      var rawJson = {
        'logical_expression1': 'test logical_expression1'
      }
      var jsonOutput = jq.simpleExpression(rawJson)
      console.log(jsonOutput)
      var referenceJsonOutput = {'function_call': undefined, 'for_loop': 'mocked for_loop', 'logical_expression': undefined, 'if_expression': undefined}
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing ifExpressionObj logical_expression1', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs(undefined).returns(undefined)
      sinon.stub(jq, 'checkPri').withArgs('test logical_expression1').returns('mocked primary')
      sinon.stub(jq, 'functionCallObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'forLoopObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'ifExpressionObj').withArgs('mocked primary').returns('mocked if_expression')
      sinon.stub(jq, 'logicalExpressionObj').withArgs('test logical_expression1').returns(undefined)

      var rawJson = {
        'logical_expression1': 'test logical_expression1'
      }
      var jsonOutput = jq.simpleExpression(rawJson)
      console.log(jsonOutput)
      var referenceJsonOutput = {'function_call': undefined, 'for_loop': undefined, 'logical_expression': undefined, 'if_expression': 'mocked if_expression'}
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing logical_expression logical_expression1', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs(undefined).returns(undefined)
      sinon.stub(jq, 'checkPri').withArgs('test logical_expression1').returns(undefined)
      sinon.stub(jq, 'logicalExpressionObj').withArgs('test logical_expression1').returns('mocked logical_expression')

      var rawJson = {
        'logical_expression1': 'test logical_expression1'
      }
      var jsonOutput = jq.simpleExpression(rawJson)
      console.log(jsonOutput)
      var referenceJsonOutput = {'function_call': undefined, 'for_loop': undefined, 'logical_expression': 'mocked logical_expression', 'if_expression': undefined}
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
	mo.describe('testing if_expression', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs('test logical_expression2')
              .returns('mocked logical_expression2').withArgs('test logical_expression3').returns('mocked logical_expression3')
      var rawJson = {
        'logical_expression1': 'test logical_expression1',
        'logical_expression2': 'test logical_expression2',
        'logical_expression3': 'test logical_expression3'
      }
      var jsonOutput = jq.simpleExpression(rawJson)
      var referenceJsonOutput = 'mocked logical_expression1:mocked logical_expression2:mocked logical_expression3'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing primary', function () {
    mo.it('testing structure with unsigned_number 0', function () {
			var rawJson = {
			                "unsigned_number": 0,
			              }
			var jsonOutput = jq.primary(rawJson)
			var referenceJsonOutput = '0'
			as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
		})
    mo.it('testing structure with unsigned_number != 0', function () {
			var rawJson = {
			                "unsigned_number": 1.0,
			              }
			var jsonOutput = jq.primary(rawJson)
			var referenceJsonOutput = '1'
			as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
		})
    mo.it('testing structure if primary_string', function () {
      var rawJson = {
                      "primary_string": 'test primary_string'
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = 'test primary_string'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure if false', function () {
      var rawJson = {
                      "is_false": true
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = 'false'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure if function_call_primary & function_call_args', function () {
      sinon.stub(jq, 'funCalPriString').returns('mocked fun_cal_pri_string')
      var rawJson = {
                      "is_false": false,
                      "is_true": false,
                      "function_call_primary": {
                        "function_call_args": 'test function_call_args'
                        }
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = 'mocked fun_cal_pri_string'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure if component_reference', function () {
      sinon.stub(jq, 'comRefString').returns('mocked com_ref_string')
      var rawJson = {
                      "is_false": false,
                      "is_true": false,
                      "component_reference": 'test component_reference'
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = 'mocked com_ref_string'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure if output_expression_list', function () {
      sinon.stub(jq, 'outExpLisString').returns('mocked out_exp_lis_string')
      var rawJson = {
                      "is_false": false,
                      "is_true": false,
                      "output_expression_list": 'test output_expression_list'
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = '(mocked out_exp_lis_string)'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure if output_expression_list', function () {
      sinon.stub(jq, 'expLisString').returns('mocked exp_lis_string')
      var rawJson = {
                      "is_false": false,
                      "is_true": false,
                      "expression_lists": [{
                                            "expressions": 'test expressions'
                                          }]
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = '[mocked exp_lis_string]'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure if function_arguments', function () {
      sinon.stub(jq, 'funArgsString').returns('mocked fun_args_string')
      var rawJson = {
                      "is_false": false,
                      "is_true": false,
                      "function_arguments": 'test function_arguments'
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = '{mocked fun_args_string}'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure if function_arguments', function () {
      var rawJson = {
                      "is_false": false,
                      "is_true": false,
                      'end': true
                    }
      var jsonOutput = jq.primary(rawJson)
      var referenceJsonOutput = 'end'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
})
  mo.describe('testing fun_cal_pri_string', function () {
		mo.it('testing structure with function_name', function () {
		 sinon.stub(jq, 'nameString').returns('mocked name_string')
		 sinon.stub(jq, 'funCalArgString').returns('mocked fun_cal_arg_string')
		 var rawJson = {
		                "function_name": 'test name',
		                "der": true,
		                "initial": true,
		                "function_call_args": 'test function_call_args'
		               }
		 var jsonOutput = jq.funCalPriString(rawJson)
		 var referenceJsonOutput = 'mocked name_stringmocked fun_cal_arg_string'
		 as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
		})
		mo.it('testing structure with der true', function () {
			sinon.stub(jq, 'funCalArgString').returns('mocked fun_cal_arg_string')
			var rawJson = {
			                "der": true,
			                "initial": true,
			                "function_call_args": 'test function_call_args'
			              }
			var jsonOutput = jq.funCalPriString(rawJson)
			var referenceJsonOutput = 'dermocked fun_cal_arg_string'
			as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
		})
    mo.it('testing structure with initial true', function () {
	    sinon.stub(jq, 'funCalArgString').returns('mocked fun_cal_arg_string')
	    var rawJson = {
	                    "der": false,
	                    "initial": true,
	                    "function_call_args": 'test function_call_args'
	                  }
	    var jsonOutput = jq.funCalPriString(rawJson)
	    var referenceJsonOutput = 'initialmocked fun_cal_arg_string'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
  })
  mo.describe('testing name_string', function () {
   mo.it('testing structure', function () {
     var rawJson = {
                    "name_parts": [
                                    { "dot_op": true,
                                      "identifier": 'test identifier1',
                                    },
                                    { "dot_op": false,
                                      "identifier": 'test identifier2'
                                    },
                                    { "dot_op": true,
                                    }
	                                ]
                   }
     var jsonOutput = jq.nameString(rawJson)
     var referenceJsonOutput = '.test identifier1test identifier2.'
     as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
   })
  })
	mo.describe('testing fun_cal_arg_string', function () {
	 mo.it('testing structure with function_arguments', function () {
	   sinon.stub(jq, 'funArgsString').withArgs('test function_arguments').returns('mocked function_arguments')
	   var rawJson = {
                   	"function_arguments": 'test function_arguments'
                   }
	   var jsonOutput = jq.funCalArgString(rawJson)
	   var referenceJsonOutput = '(mocked function_arguments)'
	   as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	 })
	 mo.it('testing empty object', function () {
     var rawJson = {}
     var jsonOutput = jq.funCalArgString(rawJson)
     var referenceJsonOutput = '()'
     as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
   })
	})
  mo.describe('testing com_ref_string', function () {
   mo.it('testing structure', function () {
     sinon.stub(jq, 'arrSubString').withArgs('test array_subscripts1').returns('mocked array_subscripts1')
     var rawJson = {
                    "component_reference_parts": [
						                                        { "dot_op": true,
						                                          "identifier": 'test identifier1',
						                                          "array_subscripts": 'test array_subscripts1'
						                                        },
						                                        { "dot_op": false,
						                                        }
                                                 ]
                   }
     var jsonOutput = jq.comRefString(rawJson)
     var referenceJsonOutput = '.test identifier1mocked array_subscripts1'
     as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
   })
 })
  mo.describe('testing arr_sub_string', function () {
   mo.it('testing structure', function () {
     sinon.stub(jq, 'expressionString').withArgs('test expression1').returns('mocked expression1')
                                       .withArgs('test expression2').returns('mocked expression2')
     var rawJson = {
                    "subscripts": [
                                    { "expression": 'test expression1',
                                      "colon_op": true
                                    },
                                    { "expression": 'test expression2',
                                      "colon_op": false
                                    }
                                  ]
                   }
     var jsonOutput = jq.arrSubString(rawJson)
     var referenceJsonOutput = '[:,mocked expression2]'
     as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
   })
 })
   mo.describe('testing fun_args_string', function () {
    mo.it('testing structure - if named_arguments true', function () {
      sinon.stub(jq, 'namedArgsString').returns('mocked named_arguments')
      var rawJson = {
        "named_arguments": 'test named_arguments',
        "function_argument": 'test function_argument',
        "for_indices": 'test for_indices',
        "function_arguments": 'test function_arguments'
      }
      var jsonOutput = jq.funArgsString(rawJson)
      var referenceJsonOutput = 'mocked named_arguments'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure - if function_argument true', function () {
      sinon.stub(jq, 'funArgString').returns('mocked function_argument')
      sinon.stub(jq, 'funArgsString').returns('mocked function_arguments')
      var rawJson = {
        "function_argument": 'test function_argument',
        "for_indices": 'test for_indices',
        "function_arguments": 'test function_arguments'
      }
      var jsonOutput = jq.funArgsString(rawJson)
      var referenceJsonOutput = 'mocked function_argument,mocked function_arguments'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure - if for_indices true', function () {
      sinon.stub(jq, 'funArgString').returns('mocked function_argument')
      sinon.stub(jq, 'forIndString').returns('mocked for_indices')
      var rawJson = {
        "function_argument": 'test function_argument',
        "for_indices": 'test for_indices',
      }
      var jsonOutput = jq.funArgsString(rawJson)
      var referenceJsonOutput = 'mocked function_argument for mocked for_indices'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure - if function_argument true', function () {
      sinon.stub(jq, 'funArgString').returns('mocked function_argument')
      var rawJson = {
        "function_argument": 'test function_argument',
      }
      var jsonOutput = jq.funArgsString(rawJson)
      var referenceJsonOutput = 'mocked function_argument'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing fun_arg_string', function () {
    mo.it('testing structure - if has function_name and named_arguments', function () {
      sinon.stub(jq, 'namedArgsString').returns('mocked named_arguments')
      sinon.stub(jq, 'nameString').returns('mocked function_name')
      var rawJson = {
        "function_name": 'test function_name',
        "named_arguments": 'test named_arguments',
        "expression": 'test expression'
      }
      var jsonOutput = jq.funArgString(rawJson)
      var referenceJsonOutput = 'function mocked function_name(mocked named_arguments)'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure - if has function_name and no named_arguments', function () {
      sinon.stub(jq, 'namedArgsString').returns('mocked named_arguments')
      sinon.stub(jq, 'nameString').returns('mocked function_name')
      var rawJson = {
        "function_name": 'test function_name',
        "expression": 'test expression'
      }
      var jsonOutput = jq.funArgString(rawJson)
      var referenceJsonOutput = 'function mocked function_name()'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure - if no function_name', function () {
      sinon.stub(jq, 'expressionString').returns('mocked expression')
      var rawJson = {
        "expression": 'test expression'
      }
      var jsonOutput = jq.funArgString(rawJson)
      var referenceJsonOutput = 'mocked expression'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
	mo.describe('testing named_args_string', function () {
    mo.it('testing structure with array length 1', function () {
      sinon.stub(jq, 'namedArgsArray').returns([{
                                                "identifier": "mocked identifier1",
                                                "value": 'mocked value1'
                                               }])
      sinon.stub(jq, 'funArgString').withArgs('mocked value1').returns('mocked expression1')
      var rawJson = {
        "test named_argument1": {
                            "identifier": "test identifier1",
                            "value": 'test value1'
                           }}
      var jsonOutput = jq.namedArgsString(rawJson)
      var referenceJsonOutput = 'mocked identifier1=mocked expression1'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure with array length 2', function () {
      sinon.stub(jq, 'namedArgsArray').returns([{
	                                               "identifier": "mocked identifier1",
	                                               "value": 'mocked value1'
	                                              },
	                                              {
	                                               "identifier": "mocked identifier2",
	                                               "value": 'mocked value2'
	                                              }
                                                ])
      sinon.stub(jq, 'funArgString').withArgs('mocked value1').returns('mocked expression1')
															      .withArgs('mocked value2').returns('mocked expression2')
      var rawJson = {
        "test named_argument1": {
                           	"identifier": "test identifier1",
                           	"value": 'test value1'
                           },
        "test named_arguments1":{
                            "identifier": "test identifier2",
                            "value": 'test value2'
                           }}
      var jsonOutput = jq.namedArgsString(rawJson)
      var referenceJsonOutput = 'mocked identifier1=mocked expression1,mocked identifier2=mocked expression2'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing named_args_array', function () {
    mo.it('testing structure without named arguments', function () {
      var rawJson = {
        "named_argument": 'test named_argument',
      }
      var jsonOutput = jq.namedArgsArray(rawJson)
      var referenceJsonOutput = ['test named_argument']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure with named arguments', function () {
      sinon.stub(jq, 'namedArgsArray').withArgs({
                                               "named_argument": 'test named_argument2',
                                             }).returns('mocked named_arguments')
      var rawJson = {
        "named_argument": 'test named_argument1',
        "named_arguments": {
                             "named_argument": 'test named_argument2',
                           }
      }
      var jsonOutput = jq.namedArgsArray(rawJson)
      var referenceJsonOutput = ['test named_argument1', 'mocked named_arguments']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
	mo.describe('testing out_exp_lis_string', function () {
    mo.it('testing empty object --> should return error', function () {
      var rawJson = {}
      try {
              jq.outExpLisString(rawJson)
              as.fail('no error raised for missing out_exp_lis')
            } catch (e) {
              as.equal(e.message, 'missing out_exp_lis')
            }
          })
    mo.it('testing structure', function () {
      sinon.stub(jq, 'expressionString').withArgs('test expression_string1').returns('mocked expression_string1')
                                        .withArgs('test expression_string2').returns('mocked expression_string2')
      var rawJson = {
        "output_expressions": [
          'test expression_string1',
          'test expression_string2'
        ]
      }
      var jsonOutput = jq.outExpLisString(rawJson)
      var referenceJsonOutput = 'mocked expression_string1,mocked expression_string2'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing exp_lis_string', function () {
    mo.it('testing empty object --> should return empty string', function () {
      var rawJson = []
      var jsonOutput = jq.expLisString(rawJson)
      var referenceJsonOutput = ''
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure', function () {
      sinon.stub(jq, 'expressionListString').withArgs('test expression_list_string1').returns('mocked expression_list_string1')
                                            .withArgs('test expression_list_string2').returns('mocked expression_list_string2')
      var rawJson = [
		      'test expression_list_string1',
		      'test expression_list_string2'
        ]
      var jsonOutput = jq.expLisString(rawJson)
      var referenceJsonOutput = 'mocked expression_list_string1;mocked expression_list_string2'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing expression_list_string', function () {
    mo.it('testing empty object --> should return undefined', function () {
      var rawJson = {}
      var jsonOutput = jq.expressionListString(rawJson)
      var referenceJsonOutput = undefined
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure', function () {
	    sinon.stub(jq, 'expressionString').withArgs('test expression_string1').returns('mocked expression_string1')
	                                      .withArgs('test expression_string2').returns('mocked expression_string2')
	    var rawJson = {
        "expressions": [
          'test expression_string1',
          'test expression_string2'
        ]
      }
	    var jsonOutput = jq.expressionListString(rawJson)
	    var referenceJsonOutput = 'mocked expression_string1,mocked expression_string2'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
  })
  mo.describe('testing for_ind_string', function () {
    mo.it('testing structure - if expression is true', function () {
      sinon.stub(jq, 'expressionString').withArgs('test expression_string1').returns('mocked expression_string1')
                                        .withArgs('test expression_string2').returns('mocked expression_string2')
      var rawJson = {
        "indices": [
        {
            "identifier": 'test identifier1',
            "expression": 'test expression_string1'
        },
        {
            "identifier": 'test identifier2',
            "expression": 'test expression_string2'
        }]
      }
      var jsonOutput = jq.forIndString(rawJson)
      var referenceJsonOutput = 'test identifier1 in mocked expression_string1,test identifier2 in mocked expression_string2'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure - if expression is false', function () {
      sinon.stub(jq, 'expressionString').withArgs('test expression_string1').returns('mocked expression_string1')
                                       .withArgs('test expression_string2').returns('mocked expression_string2')
      var rawJson = {
        "indices": [
        {
           "identifier": 'test identifier1',
           "expression": 'test expression_string1'
       },
       {
           "identifier": 'test identifier2',
       }]
     }
     var jsonOutput = jq.forIndString(rawJson)
     var referenceJsonOutput = 'test identifier1 in mocked expression_string1,test identifier2'
     as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing if_expression_string', function () {
    mo.it('checking with simple_expression', function () {
      sinon.stub(jq, 'simpleExpression').returns('mocked simple_expression')
      var rawJson = {
        'simple_expression': 'test simple_expression'
      }
      var jsonOutput = jq.expressionString(rawJson)
      var referenceJsonOutput = 'mocked simple_expression'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('checking with if_expression', function () {
      sinon.stub(jq, 'ifExpString').returns('mocked if_expression')
        var rawJson = {
          'if_expression': 'test if_expression'
        }
        var jsonOutput = jq.expressionString(rawJson)
        var referenceJsonOutput = 'mocked if_expression'
        as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing if_exp_string', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'expressionString').withArgs('test if_condition1').returns('mocked if_condition1').withArgs('test then_expression1')
              .returns('mocked then_expression1').withArgs('test if_condition_i').returns('mocked if_condition_i')
              .withArgs('test then_expression_i').returns('mocked then_expression_i').withArgs('test else_expression').returns('mocked else_expression')
      var rawJson = {
      "if_elseif": [
        {
          "condition": "test if_condition1",
          "then": "test then_expression1"
        },
        {
          "condition": "test if_condition_i",
          "then": "test then_expression_i"
        }],
      "else_expression" : "test else_expression"
      }
      var jsonOutput = jq.ifExpString(rawJson)
      var referenceJsonOutput = 'if mocked if_condition1 then mocked then_expression1 elseif mocked if_condition_i then mocked then_expression_i else mocked else_expression'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('checking for empty expression -> should return an error', function () {
      var rawJson = {
      "if_elseif": [
              {
                "condition": "test if_condition1",
                "then": "test then_expression1"
              },
              {
                "condition": "test if_condition_i",
                "then": "test then_expression_i"
              }]
            }
      try {
        jq.ifExpString(rawJson)
        as.fail('no error raised for empty expression')
      } catch (e) {
        as.equal(e.message, 'if_expression object must contain at least one condition, then and else expression')
      }
     })
  })
})
