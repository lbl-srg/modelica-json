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
    const keys = Object.keys(dict).sort()
    for (let i = 0; i < keys.length; i++) {
      const idx = keys[i]
      if (!(idx in reference)) {
        return false
      }
    }
    for (let i = 0; i < keys.length; i++) {
      const idx = keys[i]
      if (idx in reference) {
        return equalObjects(dict[idx], reference[idx])
      }
    }

    return true
  } else if ((dict.constructor === Array && reference.constructor === Array)) {
    if (dict.length !== reference.length) {
      return false
    } else {
      for (let j = 0; j < dict.length; j++) {
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
      const rawJson = {
        encapsulated: true,
        class_prefixes: 'partial',
        class_specifier: 'test class_specifier'
      }
      const jsonOutput = jq.classDefinition(rawJson)
      const referenceJsonOutput = {
        class_prefixes: 'partial',
        class_specifier: 'mocked class_specifier',
        encapsulated: true
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing classSpecifier', function () {
    mo.it('checking for empty class_specifier -> should return an error', function () {
      const rawJson = {}
      try {
        jq.classSpecifier(rawJson)
        as.fail('no error raised for missing all of long_class_specifier, short_class_specifier and der_class_specifier')
      } catch (e) {
        as.equal(e.message, 'one of long_class_specifier or short_class_specifier or der_class_specifier must be present in class_specifier')
      }
    })
    mo.it('checking with long_class_specifier', function () {
      sinon.stub(jq, 'longClassSpecifier').returns('mocked long_class_specifier')
      const rawJson = {
        long_class_specifier: 'test long_class_specifier'
      }
      const jsonOutput = jq.classSpecifier(rawJson)
      const referenceJsonOutput = {
        long_class_specifier: 'mocked long_class_specifier'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('checking with short_class_specifier', function () {
      sinon.stub(jq, 'shortClassSpecifier').returns('mocked short_class_specifier')
      const rawJson = {
        short_class_specifier: 'test short_class_specifier'
      }
      const jsonOutput = jq.classSpecifier(rawJson)
      const referenceJsonOutput = {
        short_class_specifier: 'mocked short_class_specifier'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('checking with der_class_specifier', function () {
      sinon.stub(jq, 'derClassSpecifier').returns('mocked der_class_specifier')
      const rawJson = {
        der_class_specifier: 'test der_class_specifier'
      }
      const jsonOutput = jq.classSpecifier(rawJson)
      const referenceJsonOutput = {
        der_class_specifier: 'mocked der_class_specifier'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })

  mo.describe('testing longClassSpecifier', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'composition').returns('mocked composition')
      sinon.stub(jq, 'classModification').returns('mocked class_modification')
      const rawJson = {
        identifier: 'test.identifier.a',
        string_comment: 'string comment',
        is_extends: false,
        composition: 'test composition',
        class_modification: 'test class_modification'
      }
      const jsonOutput = jq.longClassSpecifier(rawJson)
      const referenceJsonOutput = {
        identifier: 'test.identifier.a',
        description_string: 'string comment',
        extends: false,
        composition: 'mocked composition',
        class_modification: 'mocked class_modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing missing identifier', function () {
      sinon.stub(jq, 'composition').returns('mocked composition')
      sinon.stub(jq, 'classModification').returns('mocked class_modification')
      const rawJson = {
        string_comment: 'string comment',
        is_extends: false,
        composition: 'test composition',
        class_modification: 'test class_modification'
      }
      try {
        jq.longClassSpecifier(rawJson)
        as.fail('no error raised for missing identifier')
      } catch (e) {
        as.equal(e.message, 'missing identifier')
      }
    })
    mo.it('testing missing composition', function () {
      sinon.stub(jq, 'composition').returns({ composition: 'mocked composition' })
      sinon.stub(jq, 'classModification').returns({ class_modification: 'mocked class_modification' })
      const rawJson = {
        identifier: 'test.identifier.a',
        string_comment: 'string comment',
        is_extends: false,
        class_modification: 'test class_modification'
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
      const rawJson = {
        element_list: 'test element_list',
        element_sections: ['test element_section1', 'test element_section2'],
        annotation: {
          class_modification: 'test class_modification'
        },
        external_composition: 'test external_composition'
      }
      const jsonOutput = jq.composition(rawJson)
      const referenceJsonOutput = {
        element_list: 'mocked element_list',
        element_sections: ['mocked element_section1', 'mocked element_section2'],
        annotation: 'mocked class_modification',
        external_composition: 'mocked external_composition'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing missing element_list', function () {
      sinon.stub(jq, 'elementList').returns({ element_list: 'mocked element_list' })
      sinon.stub(jq, 'elementSections').returns(['mocked element_section1', 'mocked element_section2'])
      sinon.stub(jq, 'classModification').returns({ class_modification: 'mocked class_modification' })
      sinon.stub(jq, 'externalComposition').returns({ external_composition: 'mocked external_omposition' })
      const rawJson = {
        element_sections: ['test element_section1', 'test element_section2'],
        annotation: 'test annotation',
        external_composition: 'test external_composition'
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
      const rawJson = {
        argument_list: {
          arguments: [
            {
              element_modification_or_replaceable: 'test element_modification_or_replaceable'
            },
            {
              element_redeclaration: 'test element_redeclaration'
            }
          ]
        }
      }
      const jsonOutput = jq.classModification(rawJson)
      const referenceJsonOutput = [
        {
          element_modification_or_replaceable: 'mocked element_modification_or_replaceable',
          element_redeclaration: undefined
        },
        {
          element_modification_or_replaceable: undefined,
          element_redeclaration: 'mocked element_redeclaration'
        }
      ]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing empty arguments', function () {
      sinon.stub(jq, 'elementRedeclaration').returns({ element_redeclaration: 'mocked element_redeclaration' })
      sinon.stub(jq, 'elementModificationReplaceable').returns({ element_modification_or_replaceble: 'mocked element_modification_or_replaceable' })
      const rawJson = {}
      const jsonOutput = jq.classModification(rawJson)
      const referenceJsonOutput = '()'
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
      const rawJson = {
        elements: [
          {
            import_clause: 'test import_clause'
          },
          {
            extends_clause: 'test extends_clause'
          },
          {
            redeclare: true,
            is_final: true,
            inner: true,
            outer: true,
            replaceable: true,
            class_definition: 'test class_definition',
            component_clause: 'test component_clause',
            constraining_clause: 'test constraining_clause',
            comment: {
              string_comment: 'test comment'
            }
          },
          {
            redeclare: true,
            is_final: true,
            inner: true,
            outer: true,
            replaceable: false,
            class_definition: 'test class_definition',
            component_clause: 'test component_clause'
          }
        ]
      }
      const jsonOutput = jq.elementList(rawJson)
      const referenceJsonOutput = [
        {
          import_clause: 'mocked import_clause',
          extends_clause: undefined,
          redeclare: undefined,
          final: undefined,
          inner: undefined,
          outer: undefined,
          replaceable: undefined,
          class_definition: undefined,
          component_clause: undefined,
          constraining_clause: undefined,
          description: undefined
        }, {
          import_clause: undefined,
          extends_clause: 'mocked extends_clause',
          redeclare: undefined,
          final: undefined,
          inner: undefined,
          outer: undefined,
          replaceable: undefined,
          class_definition: undefined,
          component_clause: undefined,
          constraining_clause: undefined,
          description: undefined
        }, {
          import_clause: undefined,
          extends_clause: undefined,
          redeclare: true,
          final: true,
          inner: true,
          outer: true,
          replaceable: true,
          class_definition: 'mocked class_definition',
          component_clause: 'mocked component_clause',
          constraining_clause: 'mocked constraining_clause',
          description: {
            description_string: 'test comment',
            annotation: undefined
          }
        }, {
          import_clause: undefined,
          extends_clause: undefined,
          redeclare: true,
          final: true,
          inner: true,
          outer: true,
          replaceable: false,
          class_definition: 'mocked class_definition',
          component_clause: 'mocked component_clause',
          constraining_clause: undefined,
          description: undefined
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
      const rawJson = {
        elements: [
          {
            redeclare: true,
            is_final: true,
            inner: true,
            outer: true,
            replaceable: false,
            class_definition: 'test class_definition',
            component_clause: 'test component_clause',
            constraining_clause: 'test constraining_clause',
            comment: {
              string_comment: 'test comment'
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

      const rawJson = [
        {
          public_element_list: 'test public_element_list'
        }, {
          protected_element_list: 'test protected_element_list'
        }, {
          algorithm_section: 'test algorithm_section'
        }, {
          equation_section: 'test equation_section'
        }
      ]
      const jsonOutput = jq.elementSections(rawJson)
      const referenceJsonOutput = [
        {
          public_element_list: 'mocked public_element_list',
          protected_element_list: undefined,
          algorithm_section: undefined,
          equation_section: undefined
        },
        {
          public_element_list: undefined,
          protected_element_list: 'mocked protected_element_list',
          algorithm_section: undefined,
          equation_section: undefined
        },
        {
          public_element_list: undefined,
          protected_element_list: undefined,
          algorithm_section: 'mocked algorithm_section',
          equation_section: undefined
        },
        {
          public_element_list: undefined,
          protected_element_list: undefined,
          algorithm_section: undefined,
          equation_section: 'mocked equation_section'
        }
      ]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing external_function_call', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'componentReference').returns('mocked component_reference')
      sinon.stub(jq, 'expression').withArgs('test expression1').returns('mocked expression1').withArgs('test expression2').returns('mocked expression2')

      const rawJson = {
        component_reference: 'test component_reference',
        identifier: 'test.identifier.a',
        expression_list: {
          expressions: [
            'test expression1',
            'test expression2'
          ]
        }
      }
      const jsonOutput = jq.externalFunctionCall(rawJson)
      const referenceJsonOutput = {
        component_reference: 'mocked component_reference',
        identifier: 'test.identifier.a',
        expression_list: [
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
      const rawJson = {
        language_specification: 'test language_specification',
        external_function_call: 'test external_function_call',
        external_annotation: {
          class_modification: 'test class_modification'
        }
      }
      const jsonOutput = jq.externalComposition(rawJson)
      const referenceJsonOutput = {
        language_specification: 'test language_specification',
        external_function_call: 'mocked external_function_call',
        external_annotation: 'mocked class_modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing component_clause', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'typeSpecifier').withArgs('test type_specifier').returns('mocked type_specifier')
      sinon.stub(jq, 'arraySubscripts').withArgs('test array_subscripts').returns('mocked array_subscripts')
      sinon.stub(jq, 'componentList').withArgs('test component_list').returns('mocked component_list')
      const rawJson = {
        type_prefix: 'test type_prefix',
        type_specifier: 'test type_specifier',
        array_subscripts: 'test array_subscripts',
        component_list: 'test component_list'
      }
      const jsonOutput = jq.componentClause(rawJson)
      const referenceJsonOutput = {
        type_prefix: 'test type_prefix',
        type_specifier: 'mocked type_specifier',
        array_subscripts: 'mocked array_subscripts',
        component_list: 'mocked component_list'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing extends_clause', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'nameString').withArgs('test name').returns('mocked name')
      sinon.stub(jq, 'classModification').withArgs('test class_modification').returns('mocked class_modification').withArgs('test annotation.class_modification').returns('mocked annotation.class_modification')
      const rawJson = {
        name: 'test name',
        class_modification: 'test class_modification',
        annotation: {
          class_modification: 'test annotation.class_modification'
        }
      }
      const jsonOutput = jq.extendsClause(rawJson)
      const referenceJsonOutput = {
        name: 'mocked name',
        class_modification: 'mocked class_modification',
        annotation: 'mocked annotation.class_modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing import_clause', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'nameString').withArgs('test name').returns('mocked name')
      sinon.stub(jq, 'importList').withArgs('test import_list').returns('mocked import_list')
      sinon.stub(jq, 'description').withArgs('test comment').returns('mocked comment').withArgs('test comment').returns('mocked comment')
      const rawJson = {
        identifier: 'test identifier',
        name: 'test name',
        dot_star: true,
        import_list: 'test import_list',
        comment: 'test comment'
      }
      const jsonOutput = jq.importClause(rawJson)
      const referenceJsonOutput = {
        identifier: 'test identifier',
        name: 'mocked name',
        dot_star: '.*',
        import_list: 'mocked import_list',
        description: 'mocked comment'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing component_list', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'declaration').withArgs('test declaration').returns('mocked declaration')
      sinon.stub(jq, 'expression').withArgs('test condition_attribute.expression').returns('mocked condition_attribute.expression')
      sinon.stub(jq, 'description').withArgs('test comment').returns('mocked comment').withArgs('test comment').returns('mocked comment')
      const rawJson = {
        component_declaration_list: [
          {
            declaration: 'test declaration',
            condition_attribute: {
              expression: 'test condition_attribute.expression'
            },
            comment: 'test comment'
          }
        ]
      }
      const jsonOutput = jq.componentList(rawJson)
      const referenceJsonOutput = [{
        declaration: 'mocked declaration',
        condition_attribute: {
          expression: 'mocked condition_attribute.expression'
        },
        description: 'mocked comment'
      }]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing declaration', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'arraySubscripts').withArgs('test array_subscripts').returns('mocked array_subscripts')
      sinon.stub(jq, 'modification').withArgs('test modification').returns('mocked modification')
      const rawJson = {
        identifier: 'test.identifier.a',
        array_subscripts: 'test array_subscripts',
        modification: 'test modification'
      }
      const jsonOutput = jq.declaration(rawJson)
      const referenceJsonOutput = {
        identifier: 'test.identifier.a',
        array_subscripts: 'mocked array_subscripts',
        modification: 'mocked modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing element_modification', function () {
    mo.it('testing structure: element_modification', function () {
      sinon.stub(jq, 'nameString').withArgs('test name').returns('mocked name')
      sinon.stub(jq, 'modification').withArgs('test modification').returns('mocked modification')
      sinon.stub(graPri, 'graphicAnnotationObj').withArgs('test name', 'test modification').returns('mocked graphicAnnotationObj')
      const rawJson = {
        name: 'test name',
        string_comment: 'test string_comment',
        modification: 'test modification'
      }
      const jsonOutput = jq.elementModification(rawJson)
      const referenceJsonOutput = {
        name: 'mocked name',
        description_string: 'test string_comment',
        modification: 'mocked modification'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing structure: graphicAnnotationObj', function () {
      sinon.stub(jq, 'nameString').withArgs('Line').returns('Line')
      sinon.stub(jq, 'modification').withArgs('test modification').returns('mocked modification')
      sinon.stub(graPri, 'graphicAnnotationObj').withArgs('Line', 'mocked modification').returns('mocked graphicAnnotationObj')
      const rawJson = {
        name: 'Line',
        string_comment: 'test string_comment',
        modification: 'test modification'
      }
      const jsonOutput = jq.elementModification(rawJson)
      const referenceJsonOutput = {
        Line: 'mocked graphicAnnotationObj'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing element_modification_or_replaceable', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'elementModification').withArgs('test element_modification').returns('mocked element_modification')
      sinon.stub(jq, 'elementReplaceable').withArgs('test element_replaceable').returns('mocked element_replaceable')
      const rawJson = {
        each: true,
        is_final: true,
        element_modification: 'test element_modification',
        element_replaceable: 'test element_replaceable'
      }
      const jsonOutput = jq.elementModificationReplaceable(rawJson)
      const referenceJsonOutput = {
        each: true,
        final: true,
        element_modification: 'mocked element_modification',
        element_replaceable: 'mocked element_replaceable'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing element_redeclaration', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'shortClassDefinition').withArgs('test short_class_definition').returns('mocked short_class_definition')
      sinon.stub(jq, 'componentClause1').withArgs('test component_clause1').returns('mocked component_clause1')
      sinon.stub(jq, 'elementReplaceable').withArgs('test element_replaceable').returns('mocked element_replaceable')
      const rawJson = {
        each: true,
        is_final: true,
        short_class_definition: 'test short_class_definition',
        component_clause1: 'test component_clause1',
        element_replaceable: 'test element_replaceable'
      }
      const jsonOutput = jq.elementRedeclaration(rawJson)
      const referenceJsonOutput = {
        each: true,
        final: true,
        short_class_definition: 'mocked short_class_definition',
        component_clause1: 'mocked component_clause1',
        element_replaceable: 'mocked element_replaceable'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing expression_list', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1').withArgs('test simple_expression2').returns('mocked simple_expression2')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      const rawJson = [
        {
          expressions: [
            {
              simple_expression: 'test simple_expression1'
            }, {
              if_expression: 'test if_expression1'
            }
          ]
        }, {
          expressions: [
            {
              simple_expression: 'test simple_expression2'
            }, {
              if_expression: 'test if_expression2'
            }
          ]
        }
      ]
      const jsonOutput = jq.expLisString(rawJson)
      const referenceJsonOutput = 'mocked simple_expression1,mocked if_expression1;mocked simple_expression2,mocked if_expression2'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing expression', function () {
    mo.it('testing only simple_expression structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      const rawJson = {
        simple_expression: 'test simple_expression1'
      }
      const jsonOutput = jq.expressionString(rawJson)
      const referenceJsonOutput = 'mocked simple_expression1'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing only if_expression structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      const rawJson = {
        if_expression: 'test if_expression1'
      }
      const jsonOutput = jq.expressionString(rawJson)
      const referenceJsonOutput = 'mocked if_expression1'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing only simple_expression structure', function () {
      sinon.stub(jq, 'simpleExpression').withArgs('test simple_expression1').returns('mocked simple_expression1')
      sinon.stub(jq, 'ifExpString').withArgs('test if_expression1').returns('mocked if_expression1').withArgs('test if_expression2').returns('mocked if_expression2')
      const rawJson = {
        simple_expression: 'test simple_expression1',
        if_expression: 'test if_expression1'
      }
      const jsonOutput = jq.expressionString(rawJson)
      const referenceJsonOutput = 'mocked simple_expression1'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing simple_expression', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs('test logical_expression2')
        .returns('mocked logical_expression2').withArgs('test logical_expression3').returns('mocked logical_expression3')
      const rawJson = {
        logical_expression1: 'test logical_expression1',
        logical_expression2: 'test logical_expression2',
        logical_expression3: 'test logical_expression3'
      }
      const jsonOutput = jq.simpleExpression(rawJson)
      const referenceJsonOutput = 'mocked logical_expression1:mocked logical_expression2:mocked logical_expression3'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing null logical_expression1', function () {
      const rawJson = {
        logical_expression2: 'test logical_expression2'
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

      const rawJson = {
        logical_expression1: 'test logical_expression1'
      }
      const jsonOutput = jq.simpleExpression(rawJson)
      const referenceJsonOutput = { function_call: 'mocked function_call_primary', for_loop: undefined, logical_expression: undefined, if_expression: undefined }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing for_loop logical_expression1', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs(undefined).returns(undefined)
      sinon.stub(jq, 'checkPri').withArgs('test logical_expression1').returns('mocked primary')
      sinon.stub(jq, 'functionCallObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'forLoopObj').withArgs('mocked primary').returns('mocked for_loop')
      sinon.stub(jq, 'ifExpressionObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'logicalExpressionObj').withArgs('test logical_expression1').returns(undefined)

      const rawJson = {
        logical_expression1: 'test logical_expression1'
      }
      const jsonOutput = jq.simpleExpression(rawJson)
      const referenceJsonOutput = { function_call: undefined, for_loop: 'mocked for_loop', logical_expression: undefined, if_expression: undefined }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing ifExpressionObj logical_expression1', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs(undefined).returns(undefined)
      sinon.stub(jq, 'checkPri').withArgs('test logical_expression1').returns('mocked primary')
      sinon.stub(jq, 'functionCallObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'forLoopObj').withArgs('mocked primary').returns(undefined)
      sinon.stub(jq, 'ifExpressionObj').withArgs('mocked primary').returns('mocked if_expression')
      sinon.stub(jq, 'logicalExpressionObj').withArgs('test logical_expression1').returns(undefined)

      const rawJson = {
        logical_expression1: 'test logical_expression1'
      }
      const jsonOutput = jq.simpleExpression(rawJson)
      const referenceJsonOutput = { function_call: undefined, for_loop: undefined, logical_expression: undefined, if_expression: 'mocked if_expression' }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing logical_expression logical_expression1', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs(undefined).returns(undefined)
      sinon.stub(jq, 'checkPri').withArgs('test logical_expression1').returns(undefined)
      sinon.stub(jq, 'logicalExpressionObj').withArgs('test logical_expression1').returns('mocked logical_expression')

      const rawJson = {
        logical_expression1: 'test logical_expression1'
      }
      const jsonOutput = jq.simpleExpression(rawJson)
      const referenceJsonOutput = { function_call: undefined, for_loop: undefined, logical_expression: 'mocked logical_expression', if_expression: undefined }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing if_expression', function () {
    mo.it('testing structure', function () {
      sinon.stub(jq, 'logicalExpression').withArgs('test logical_expression1').returns('mocked logical_expression1').withArgs('test logical_expression2')
        .returns('mocked logical_expression2').withArgs('test logical_expression3').returns('mocked logical_expression3')
      const rawJson = {
        logical_expression1: 'test logical_expression1',
        logical_expression2: 'test logical_expression2',
        logical_expression3: 'test logical_expression3'
      }
      const jsonOutput = jq.simpleExpression(rawJson)
      const referenceJsonOutput = 'mocked logical_expression1:mocked logical_expression2:mocked logical_expression3'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
})
