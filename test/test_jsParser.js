/* eslint-disable new-cap, camelcase */
const as = require('assert')
const mo = require('mocha')
const sinon = require('sinon')
const algSV = require('../jsParser/parser/Algorithm_sectionVisitor.js').Algorithm_sectionVisitor
const sv = require('../jsParser/parser/StatementVisitor.js').StatementVisitor
const annV = require('../jsParser/parser/AnnotationVisitor.js').AnnotationVisitor
const cmv = require('../jsParser/parser/Class_modificationVisitor.js').Class_modificationVisitor
const argV = require('../jsParser/parser/ArgumentVisitor.js').ArgumentVisitor
const alv = require('../jsParser/parser/Argument_listVisitor.js').Argument_listVisitor
const emorv = require('../jsParser/parser/Element_modification_or_replaceableVisitor.js').Element_modification_or_replaceableVisitor
const erv = require('../jsParser/parser/Element_redeclarationVisitor.js').Element_redeclarationVisitor
const tv = require('../jsParser/parser/TermVisitor.js').TermVisitor
const vae = require('../jsParser/parser/Arithmetic_expressionVisitor.js').Arithmetic_expressionVisitor
const asv = require('../jsParser/parser/Array_subscriptsVisitor.js').Array_subscriptsVisitor
const subV = require('../jsParser/parser/SubscriptVisitor.js').SubscriptVisitor
const tpv = require('../jsParser/parser/Type_prefixVisitor.js').Type_prefixVisitor
const bpv = require('../jsParser/parser/Base_prefixVisitor.js').Base_prefixVisitor
const cpv = require('../jsParser/parser/Class_prefixesVisitor.js').Class_prefixesVisitor
const csv = require('../jsParser/parser/Class_specifierVisitor.js').Class_specifierVisitor
const cdv = require('../jsParser/parser/Class_definitionVisitor.js').Class_definitionVisitor
const scv = require('../jsParser/parser/String_commentVisitor.js').String_commentVisitor
const cv = require('../jsParser/parser/CommentVisitor.js').CommentVisitor
const tsv = require('../jsParser/parser/Type_specifierVisitor.js').Type_specifierVisitor
const cd1v = require('../jsParser/parser/Component_declaration1Visitor.js').Component_declaration1Visitor
const cc1v = require('../jsParser/parser/Component_clause1Visitor.js').Component_clause1Visitor
const clv = require('../jsParser/parser/Component_listVisitor.js').Component_listVisitor
const ccv = require('../jsParser/parser/Component_clauseVisitor.js').Component_clauseVisitor
const dv = require('../jsParser/parser/DeclarationVisitor.js').DeclarationVisitor
const cav = require('../jsParser/parser/Condition_attributeVisitor.js').Condition_attributeVisitor
const comDecV = require('../jsParser/parser/Component_declarationVisitor.js').Component_declarationVisitor
const ev = require('../jsParser/parser/ExpressionVisitor.js').ExpressionVisitor
const crv = require('../jsParser/parser/Component_referenceVisitor.js').Component_referenceVisitor
const connCV = require('../jsParser/parser/Connect_clauseVisitor.js').Connect_clauseVisitor
const nv = require('../jsParser/parser/NameVisitor.js').NameVisitor
const consCV = require('../jsParser/parser/Constraining_clauseVisitor.js').Constraining_clauseVisitor
const mv = require('../jsParser/parser/ModificationVisitor.js').ModificationVisitor
const lcsv = require('../jsParser/parser/Long_class_specifierVisitor.js').Long_class_specifierVisitor
const scsv = require('../jsParser/parser/Short_class_specifierVisitor.js').Short_class_specifierVisitor
const dcsv = require('../jsParser/parser/Der_class_specifierVisitor.js').Der_class_specifierVisitor
const eleV = require('../jsParser/parser/ElementVisitor.js').ElementVisitor
const elv = require('../jsParser/parser/Element_listVisitor.js').Element_listVisitor
const emv = require('../jsParser/parser/Element_modificationVisitor.js').Element_modificationVisitor
const eleRepV = require('../jsParser/parser/Element_replaceableVisitor.js').Element_replaceableVisitor
const scdv = require('../jsParser/parser/Short_class_definitionVisitor.js').Short_class_definitionVisitor
const icv = require('../jsParser/parser/Import_clauseVisitor.js').Import_clauseVisitor
const ecv = require('../jsParser/parser/Extends_clauseVisitor.js').Extends_clauseVisitor
const enumLitV = require('../jsParser/parser/Enumeration_literalVisitor.js').Enumeration_literalVisitor
const enumListV = require('../jsParser/parser/Enum_listVisitor.js').Enum_listVisitor
const eqV = require('../jsParser/parser/EquationVisitor.js').EquationVisitor
const esv = require('../jsParser/parser/Equation_sectionVisitor.js').Equation_sectionVisitor
const sev = require('../jsParser/parser/Simple_expressionVisitor.js').Simple_expressionVisitor
const iev = require('../jsParser/parser/If_equationVisitor.js').If_equationVisitor
const fev = require('../jsParser/parser/For_equationVisitor.js').For_equationVisitor
const wev = require('../jsParser/parser/When_equationVisitor.js').When_equationVisitor
const fcav = require('../jsParser/parser/Function_call_argsVisitor.js').Function_call_argsVisitor
const expLV = require('../jsParser/parser/Expression_listVisitor.js').Expression_listVisitor
const efcv = require('../jsParser/parser/External_function_callVisitor.js').External_function_callVisitor
const pv = require('../jsParser/parser/PrimaryVisitor.js').PrimaryVisitor
const fv = require('../jsParser/parser/FactorVisitor.js').FactorVisitor
const fiv = require('../jsParser/parser/For_indicesVisitor.js').For_indicesVisitor
const forIndexV = require('../jsParser/parser/For_indexVisitor.js').For_indexVisitor
const fsv = require('../jsParser/parser/For_statementVisitor.js').For_statementVisitor
const funcArgsV = require('../jsParser/parser/Function_argumentsVisitor.js').Function_argumentsVisitor
const funcAV = require('../jsParser/parser/Function_argumentVisitor.js').Function_argumentVisitor
const namedArgsV = require('../jsParser/parser/Named_argumentsVisitor.js').Named_argumentsVisitor
const ilv = require('../jsParser/parser/Import_listVisitor.js').Import_listVisitor
const ifsv = require('../jsParser/parser/If_statementVisitor.js').If_statementVisitor
const wsv = require('../jsParser/parser/When_statementVisitor.js').When_statementVisitor
const whlV = require('../jsParser/parser/While_statementVisitor.js').While_statementVisitor
const oelv = require('../jsParser/parser/Output_expression_listVisitor.js').Output_expression_listVisitor
const compV = require('../jsParser/parser/CompositionVisitor.js').CompositionVisitor
const lev = require('../jsParser/parser/Logical_expressionVisitor.js').Logical_expressionVisitor
const lfv = require('../jsParser/parser/Logical_factorVisitor.js').Logical_factorVisitor
const ltv = require('../jsParser/parser/Logical_termVisitor.js').Logical_termVisitor
const navV = require('../jsParser/parser/Named_argumentVisitor.js').Named_argumentVisitor
const ropv = require('../jsParser/parser/Rel_opVisitor.js').Rel_opVisitor
const relV = require('../jsParser/parser/RelationVisitor.js').RelationVisitor
const sdv = require('../jsParser/parser/Stored_definitionVisitor.js').Stored_definitionVisitor

mo.afterEach(() => {
  sinon.restore()
})

class getTextClass {
  constructor (text) {
    this.text = text
  }

  getText () {
    return this.text
  }
}
class ctxMock {
  constructor (boolean = null, testing = null) {
    this.boolean = boolean
    this.testing = testing
  }

  INITIAL () { return this.boolean }
  statement () { return [1, 2, 3, 4, 5] }
  argument () { return [1, 2, 3, 4, 5] }
  element_modification_or_replaceable () { return 'mocked element_modification_or_replaceable' }
  element_redeclaration () { return 'mocked element_redeclaration' }
  add_op () { return [new getTextClass(1), new getTextClass(2)] }
  term () { return [3, 4, 5] }
  subscript () { return [1, 2, 3, 4, 5] }
  type_prefix () { return 'mocked type_prefix' }
  ENCAPSULATED () { return true }
  class_prefixes () { return 'mocked class_prefixes' }
  class_specifier () { return 'mocked class_specifier' }
  argument_list () { return 'mocked argument_list' }
  annotation () { return 'mocked annotation' }
  string_comment () { return 'mocked string_comment' }
  type_specifier () { return 'mocked type_specifier' }
  component_declaration1 () { return 'mocked component_declaration' }
  array_subscripts () { return 'mocked array_subscripts' }
  component_list () { return 'mocked component_list' }
  declaration () { return 'mocked declaration' }
  comment () { return 'mocked comment' }
  condition_attribute () { return 'mocked condition_attribute' }
  component_declaration () { return [1, 2, 3, 4, 5] }
  expression () { return 'mocked expression' }
  component_reference () { return [1, 2] }
  name () { return 'mocked name' }
  class_modification () { return 'mocked class_modification' }
  IDENT () { return new getTextClass('mocked identifier') }
  modification () { return 'mocked modification' }
  element () { return [1, 2, 3] }
  EACH () { return this.boolean }
  FINAL () { return this.boolean }
  element_modification () { return 'mocked element_modification' }
  element_replaceable () { return 'mocked element_replaceable' }
  short_class_definition () { return 'mocked short_class_definition' }
  component_clause1 () { return 'mocked component_clause1' }
  constraining_clause () { return 'mocked constraining_clause' }
  import_clause () { return 'mocked import_clause' }
  extends_clause () { return 'mocked extends_clause' }
  REDECLARE () { return this.boolean }
  INNER () { return this.boolean }
  OUTER () { return this.boolean }
  REPLACEABLE () { return this.boolean }
  class_definition () { return 'mocked class_definition' }
  component_clause () { return 'mocked component_clause' }
  enumeration_literal () { return [1, 2, 3] }
  equation () { return [1, 2, 3] }
  simple_expression () { return 'mocked simple_expression' }
  if_equation () { return 'mocked if_equation' }
  for_equation () { return 'mocked for_equation' }
  connect_clause () { return 'mocked connect_clause' }
  when_equation () { return 'mocked when_equation' }
  function_call_args () { return 'mocked function_call_args' }
  expression_list () { return 'mocked expression_list' }
  primary () { return [1, 2] }
  SYMBOL_CARET () { return new getTextClass('mocked symbol_caret') }
  SYMBOL_DOTCARET () { return new getTextClass('mocked symbol_dotcaret') }
  for_indices () { return 'mocked for_indices' }
  for_index () { return [1, 2, 3] }
  named_arguments () { return 'mocked named_arguments' }
  function_argument () { return 'mocked function_argument' }
  function_arguments () { return 'mocked function_arguments' }
  import_list () { return 'mocked import_list' }
  output_expression_list () { return null }
  getChildCount () { return 0 }
  getChild () { return null }
  BREAK () { return null }
  RETURN () { return null }
  if_statement () { return null }
  for_statement () { return null }
  while_statement () { return null }
  when_statement () { return null }
  NOT () { return null }
  relation () { return null }
  logical_factor () { return null }
  logical_term () { return null }
  logical_expression () { return null }
  EXTENDS () { return null }
  SYMBOL_EQUAL () { return null }
  SYMBOL_COLONEQUAL () { return null }
  SYMBOL_COLON () { return null }
  mul_op () { return [] }
  factor () { return [] }
  arithmetic_expression () { return [] }
  rel_op () { return null }
  UNSIGNED_NUMBER () { return null }
  STRING () { return null }
  FALSE () { return null }
  TRUE () { return null }
  DER () { return null }
  END () { return null }
  FLOW () { return null }
  STREAM () { return null }
  DISCRETE () { return null }
  PARAMETER () { return null }
  CONSTANT () { return null }
  INPUT () { return null }
  OUTPUT () { return null }
  composition () { return 'mocked composition' }
  named_argument () { return 'mocked named_argument' }
  base_prefix () { return 'mocked base_prefix' }
  enum_list () { return null }
  get children () { return [] }
  PARTIAL () {
    return this.testing === 'partial_dec' || this.testing === 'partial_dec class_dec' ? new getTextClass('mocked partial_dec') : false
  }

  CLASS () {
    return this.testing === 'class_dec' || this.testing === 'partial_dec class_dec' ? new getTextClass('mocked class_dec') : false
  }

  MODEL () {
    return this.testing === 'model_dec' ? new getTextClass('mocked model_dec') : false
  }

  BLOCK () {
    return this.testing === 'block_dec' ? new getTextClass('mocked block_dec') : false
  }

  TYPE () {
    return this.testing === 'type_dec' ? new getTextClass('mocked type_dec') : false
  }

  PACKAGE () {
    return this.testing === 'package_dec' ? new getTextClass('mocked package_dec') : false
  }

  OPERATOR () {
    return (this.testing === 'operator_dec') || (this.testing === 'record_dec') || (this.testing === 'function_dec operator_dec pure_dec') || (this.testing === 'function_dec operator_dec impure_dec')
      ? new getTextClass('mocked operator_dec')
      : false
  }

  RECORD () {
    return this.testing === 'record_dec' ? new getTextClass('mocked record_dec') : false
  }

  EXPANDABLE () {
    return (this.testing === 'expandable_dec') || (this.testing === 'connector_dec') ? new getTextClass('mocked expandable_dec') : false
  }

  CONNECTOR () {
    return this.testing === 'connector_dec' ? new getTextClass('mocked connector_dec') : false
  }

  PURE () {
    return (this.testing === 'function_dec pure_dec') || (this.testing === 'function_dec operator_dec pure_dec') ? new getTextClass('mocked pure_dec') : false
  }

  IMPURE () {
    return (this.testing === 'function_dec impure_dec') || (this.testing === 'function_dec operator_dec impure_dec') ? new getTextClass('mocked impure_dec') : false
  }

  FUNCTION () {
    return (this.testing === 'function_dec pure_dec') || (this.testing === 'function_dec impure_dec') || (this.testing === 'function_dec operator_dec impure_dec') || (this.testing === 'function_dec operator_dec pure_dec') ? new getTextClass('mocked function_dec') : false
  }

  long_class_specifier () {
    return this.testing === 'long_class_specifier' ? 'mocked long_class_specifier' : null
  }

  short_class_specifier () {
    return this.testing === 'short_class_specifier' ? 'mocked short_class_specifier' : null
  }

  der_class_specifier () {
    return this.testing === 'der_class_specifier' ? 'mocked der_class_specifier' : null
  }
}

mo.describe('testing Algorithm_sectionVisitor.js', function () {
  mo.describe('testing visitAlgorithm_section(ctx)', function () {
    mo.it('testing initial = true', function () {
      sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
      const visitor = new algSV()
      const input = new ctxMock(true)
      const output = visitor.visitAlgorithm_section(input)
      const referenceOutput = [true, [1, 2, 3, 4, 5]]
      as.equal(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + '; actual value for "initial": ' + output.initial)
      as.deepEqual(output.statements, referenceOutput[1], 'expected value for "statements": ' + referenceOutput[1] + '; actual value for "statements": ' + output.statements)
    })
    mo.it('testing initial = false', function () {
      sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
      const visitor = new algSV()
      const input = new ctxMock(false)
      const output = visitor.visitAlgorithm_section(input)
      const referenceOutput = [false, [1, 2, 3, 4, 5]]
      as.equal(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + '; actual value for "initial": ' + output.initial)
      as.deepEqual(output.statements, referenceOutput[1], 'expected value for "statements": ' + referenceOutput[1] + '; actual value for "statements": ' + output.statements)
    })
    mo.it('testing initial = null', function () {
      sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
      const visitor = new algSV()
      const input = new ctxMock(null)
      const output = visitor.visitAlgorithm_section(input)
      const referenceOutput = [false, [1, 2, 3, 4, 5]]
      as.equal(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + '; actual value for "initial": ' + output.initial)
      as.deepEqual(output.statements, referenceOutput[1], 'expected value for "statements": ' + referenceOutput[1] + '; actual value for "statements": ' + output.statements)
    })
  })
})
mo.describe('testing AnnotationVisitor.js', function () {
  mo.it('testing visitAnnotation(ctx)', function () {
    sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((class_modification) => class_modification)
    const visitor = new annV()
    const input = new ctxMock()
    const output = visitor.visitAnnotation(input)
    const referenceOutput = 'mocked class_modification'
    as.deepEqual(output.class_modification, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.class_modification)
  })
})
mo.describe('testing Argument_listVisitor.js', function () {
  mo.it('testing visitArgument_list(ctx)', function () {
    sinon.stub(argV.prototype, 'visitArgument').callsFake((arg) => arg)
    const visitor = new alv()
    const input = new ctxMock()
    const output = visitor.visitArgument_list(input)
    const referenceOutput = [1, 2, 3, 4, 5]
    as.deepEqual(output.args, referenceOutput, 'expected value for "args": ' + referenceOutput + ' ; actual value for "args: ' + output.args)
  })
})
mo.describe('testing ArgumentVisitor.js', function () {
  mo.it('testing visitArgument(ctx)', function () {
    sinon.stub(emorv.prototype, 'visitElement_modification_or_replaceable').callsFake((input) => input)
    sinon.stub(erv.prototype, 'visitElement_redeclaration').callsFake((input) => input)
    const visitor = new argV()
    const input = new ctxMock()
    const output = visitor.visitArgument(input)
    const referenceOutput = ['mocked element_modification_or_replaceable', 'mocked element_redeclaration']
    as.deepEqual(output.element_modification_or_replaceable, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.element_modification_or_replaceable)
    as.deepEqual(output.element_redeclaration, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.element_redeclaration)
  })
})
mo.describe('testing Arithmetic_expressionVisitor.js', function () {
  mo.describe('testing visitArithmetic_expression(ctx)', function () {
    mo.it('testing when add_ops.length == (terms.length - 1)', function () {
      sinon.stub(tv.prototype, 'visitTerm').callsFake((t) => t)
      const visitor = new vae()
      const input = new ctxMock()
      const output = visitor.visitArithmetic_expression(input)
      const referenceOutput = [[undefined, 3], [1, 4], [2, 5]]
      as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected value for first term: ' + referenceOutput[0] + ' ; actual value for first term: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
      as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected value for second term: ' + referenceOutput[1] + ' ; actual value for second term: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
      as.deepEqual([output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term], referenceOutput[2], 'expected value for third term: ' + referenceOutput[2] + ' ; actual value for third term: ' + [output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term])
    })
    mo.it('testing when add_ops.length != (terms.length - 1)', function () {
      sinon.stub(tv.prototype, 'visitTerm').callsFake((t) => t)
      sinon.stub(ctxMock.prototype, 'term').returns([3, 4])
      const visitor = new vae()
      const input = new ctxMock()
      const output = visitor.visitArithmetic_expression(input)
      const referenceOutput = [[1, 3], [2, 4]]
      as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected value for first term: ' + referenceOutput[0] + ' ; actual value for first term: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
      as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected value for second term: ' + referenceOutput[1] + ' ; actual value for second term: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
    })
  })
})
mo.describe('testing Array_subscriptsVisitor.js', function () {
  mo.it('testing visitArray_subscripts(ctx)', function () {
    sinon.stub(subV.prototype, 'visitSubscript').callsFake((sub) => sub)
    const visitor = new asv()
    const input = new ctxMock()
    const output = visitor.visitArray_subscripts(input)
    const referenceOutput = [1, 2, 3, 4, 5]
    as.deepEqual(output.subscripts, referenceOutput, 'expected value for "subscripts": ' + referenceOutput + ' ; actual value for "subscripts": ' + output.subscripts)
  })
})
mo.describe('testing Base_prefixVisitor.js', function () {
  mo.it('testing visitBase_prefix(ctx)', function () {
    sinon.stub(tpv.prototype, 'visitType_prefix').callsFake((type_prefix) => type_prefix)
    const visitor = new bpv()
    const input = new ctxMock()
    const output = visitor.visitBase_prefix(input)
    const referenceOutput = 'mocked type_prefix'
    as.deepEqual(output.type_prefix, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.type_prefix)
  })
})
mo.describe('testing Class_definitionVisitor.js', function () {
  mo.it('testing visitClass_definition', function () {
    sinon.stub(cpv.prototype, 'visitClass_prefixes').callsFake((class_prefixes) => class_prefixes)
    sinon.stub(csv.prototype, 'visitClass_specifier').callsFake((class_specifier) => class_specifier)
    const visitor = new cdv()
    const input = new ctxMock()
    const output = visitor.visitClass_definition(input)
    const referenceOutput = [true, 'mocked class_prefixes', 'mocked class_specifier']
    as.deepEqual(output.encapsulated, referenceOutput[0], 'expected value for "encapsulated": ' + referenceOutput[0] + ' ; actual value for "encapsulated": ' + output.encapsulated)
    as.deepEqual(output.class_prefixes, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.class_prefixes)
    as.deepEqual(output.class_specifier, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.class_specifier)
  })
})
mo.describe('testing Class_modificationVisitor.js', function () {
  mo.it('testing visitClass_modification', function () {
    sinon.stub(alv.prototype, 'visitArgument_list').callsFake((argument_list) => argument_list)
    const visitor = new cmv()
    const input = new ctxMock()
    const output = visitor.visitClass_modification(input)
    const referenceOutput = 'mocked argument_list'
    as.deepEqual(output.argument_list, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.argument_list)
  })
})
mo.describe('testing Class_prefixesVisitor.js', function () {
  mo.describe('testing visitClass_prefixes(ctx)', function () {
    mo.describe('testing partial_dec', function () {
      mo.it('testing partial_dec alone', function () {
        const visitor = new cpv()
        const input = new ctxMock(null, 'partial_dec')
        const output = visitor.visitClass_prefixes(input)
        const referenceOutput = 'mocked partial_dec'
        as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
      })
      mo.it('testing partial_dec with another string (class_dec)', function () {
        const visitor = new cpv()
        const input = new ctxMock(null, 'partial_dec class_dec')
        const output = visitor.visitClass_prefixes(input)
        const referenceOutput = 'mocked partial_dec mocked class_dec'
        as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
      })
    })
    mo.it('testing class_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'class_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked class_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
    mo.it('testing model_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'model_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked model_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
    mo.it('testing record_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'record_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked operator_dec mocked record_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
    mo.it('testing block_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'block_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked block_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
    mo.it('testing connector_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'connector_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked expandable_dec mocked connector_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
    mo.it('testing type_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'type_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked type_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
    mo.it('testing package_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'package_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked package_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
    mo.describe('testing function_dec', function () {
      mo.it('testing pure_dec', function () {
        const visitor = new cpv()
        const input = new ctxMock(null, 'function_dec pure_dec')
        const output = visitor.visitClass_prefixes(input)
        const referenceOutput = 'mocked pure_dec mocked function_dec'
        as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
      })
      mo.it('testing impure_dec', function () {
        const visitor = new cpv()
        const input = new ctxMock(null, 'function_dec impure_dec')
        const output = visitor.visitClass_prefixes(input)
        const referenceOutput = 'mocked impure_dec mocked function_dec'
        as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
      })
      mo.it('testing with operator_dec', function () {
        const visitor = new cpv()
        const input = new ctxMock(null, 'function_dec operator_dec impure_dec')
        const output = visitor.visitClass_prefixes(input)
        const referenceOutput = 'mocked impure_dec mocked operator_dec mocked function_dec'
        as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
      })
    })
    mo.it('testing operator_dec', function () {
      const visitor = new cpv()
      const input = new ctxMock(null, 'operator_dec')
      const output = visitor.visitClass_prefixes(input)
      const referenceOutput = 'mocked operator_dec'
      as.deepEqual(output, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output)
    })
  })
})
mo.describe('testing Class_specifierVisitor.js', function () {
  mo.describe('testing visitClass_specifier(ctx)', function () {
    mo.it('testing long_class_specifier', function () {
      sinon.stub(lcsv.prototype, 'visitLong_class_specifier').callsFake((class_specifier) => class_specifier)
      const visitor = new csv()
      const input = new ctxMock(null, 'long_class_specifier')
      const output = visitor.visitClass_specifier(input)
      const referenceOutput = 'mocked long_class_specifier'
      as.deepEqual(output.long_class_specifier, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.long_class_specifier)
    })
    mo.it('testing short_class_specifier', function () {
      sinon.stub(scsv.prototype, 'visitShort_class_specifier').callsFake((class_specifier) => class_specifier)
      const visitor = new csv()
      const input = new ctxMock(null, 'short_class_specifier')
      const output = visitor.visitClass_specifier(input)
      const referenceOutput = 'mocked short_class_specifier'
      as.deepEqual(output.short_class_specifier, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.short_class_specifier)
    })
    mo.it('testing der_class_specifier', function () {
      sinon.stub(dcsv.prototype, 'visitDer_class_specifier').callsFake((class_specifier) => class_specifier)
      const visitor = new csv()
      const input = new ctxMock(null, 'der_class_specifier')
      const output = visitor.visitClass_specifier(input)
      const referenceOutput = 'mocked der_class_specifier'
      as.deepEqual(output.der_class_specifier, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.der_class_specifier)
    })
  })
})
mo.describe('testing CommentVisitor.js', function () {
  mo.it('testing visitComment(ctx)', function () {
    sinon.stub(annV.prototype, 'visitAnnotation').callsFake((annotation) => annotation)
    sinon.stub(scv.prototype, 'visitString_comment').callsFake((string_comment) => string_comment)
    const visitor = new cv()
    const input = new ctxMock()
    const output = visitor.visitComment(input)
    const referenceOutput = ['mocked annotation', 'mocked string_comment']
    as.deepEqual(output.annotation, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.annotation)
    as.deepEqual(output.string_comment, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.string_comment)
  })
})
mo.describe('testing Component_clause1Visitor.js', function () {
  mo.it('testing visitComponent_clause1(ctx)', function () {
    sinon.stub(tpv.prototype, 'visitType_prefix').callsFake((type_prefix) => type_prefix)
    sinon.stub(tsv.prototype, 'visitType_specifier').callsFake((type_specifier) => type_specifier)
    sinon.stub(cd1v.prototype, 'visitComponent_declaration1').callsFake((component_declaration1) => component_declaration1)
    const visitor = new cc1v()
    const input = new ctxMock()
    const output = visitor.visitComponent_clause1(input)
    const referenceOutput = ['mocked type_prefix', 'mocked type_specifier', 'mocked component_declaration']
    as.deepEqual(output.type_prefix, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.type_prefix)
    as.deepEqual(output.type_specifier, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.type_specifier)
    as.deepEqual(output.component_declaration1, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.Component_declaration1)
  })
})
mo.describe('testing Component_clauseVisitor.js', function () {
  mo.it('testing visitComponent_clause(ctx)', function () {
    sinon.stub(tpv.prototype, 'visitType_prefix').callsFake((type_prefix) => type_prefix)
    sinon.stub(tsv.prototype, 'visitType_specifier').callsFake((type_specifier) => type_specifier)
    sinon.stub(asv.prototype, 'visitArray_subscripts').callsFake((array_subscripts) => array_subscripts)
    sinon.stub(clv.prototype, 'visitComponent_list').callsFake((component_list) => component_list)
    const visitor = new ccv()
    const input = new ctxMock()
    const output = visitor.visitComponent_clause(input)
    const referenceOutput = ['mocked type_prefix', 'mocked type_specifier', 'mocked array_subscripts', 'mocked component_list']
    as.deepEqual(output.type_prefix, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.type_prefix)
    as.deepEqual(output.type_specifier, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.type_specifier)
    as.deepEqual(output.array_subscripts, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.array_subscripts)
    as.deepEqual(output.component_list, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.component_list)
  })
})
mo.describe('testing Component_declaration1Visitor.js', function () {
  mo.it('testing visitComponent_declaration1(ctx)', function () {
    sinon.stub(dv.prototype, 'visitDeclaration').callsFake((declaration) => declaration)
    sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
    const visitor = new cd1v()
    const input = new ctxMock()
    const output = visitor.visitComponent_declaration1(input)
    const referenceOutput = ['mocked declaration', 'mocked comment']
    as.deepEqual(output.declaration, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.declaration)
    as.deepEqual(output.comment, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.comment)
  })
})
mo.describe('testing Component_declarationVisitor.js', function () {
  mo.it('testing visitComponent_declaration(ctx)', function () {
    sinon.stub(dv.prototype, 'visitDeclaration').callsFake((declaration) => declaration)
    sinon.stub(cav.prototype, 'visitCondition_attribute').callsFake((condition_attribute) => condition_attribute)
    sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
    const visitor = new comDecV()
    const input = new ctxMock()
    const output = visitor.visitComponent_declaration(input)
    const referenceOutput = ['mocked declaration', 'mocked condition_attribute', 'mocked comment']
    as.deepEqual(output.declaration, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.declaration)
    as.deepEqual(output.condition_attribute, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.condition_attribute)
    as.deepEqual(output.comment, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.comment)
  })
})
mo.describe('testing Component_listVisitor.js', function () {
  mo.it('testing visitComponent_list(ctx)', function () {
    sinon.stub(comDecV.prototype, 'visitComponent_declaration').callsFake((component_dec) => component_dec)
    const visitor = new clv()
    const input = new ctxMock()
    const output = visitor.visitComponent_list(input)
    const referenceOutput = [1, 2, 3, 4, 5]
    as.deepEqual(output.component_declaration_list, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.component_declaration_list)
  })
})
mo.describe('testing Component_referenceVisitor.js', function () {
  mo.describe('testing visitComponent_reference(ctx)', function () {
    const tn = require('antlr4/tree/Tree.js').TerminalNodeImpl
    mo.it('testing single identifier (no dot)', function () {
      const node = new tn('')
      sinon.stub(node, 'getText').returns('myId')
      const ctx = { children: [node] }
      const visitor = new crv()
      const output = visitor.visitComponent_reference(ctx)
      as.deepEqual(output.component_reference_parts.length, 1, 'expected 1 part ; actual: ' + output.component_reference_parts.length)
      as.deepEqual(output.component_reference_parts[0].dot_op, false, 'expected dot_op false ; actual: ' + output.component_reference_parts[0].dot_op)
      as.deepEqual(output.component_reference_parts[0].identifier, 'myId', 'expected identifier myId ; actual: ' + output.component_reference_parts[0].identifier)
    })
    mo.it('testing leading dot then identifier', function () {
      const dotNode = new tn('')
      sinon.stub(dotNode, 'getText').returns('.')
      const idNode = new tn('')
      sinon.stub(idNode, 'getText').returns('foo')
      const ctx = { children: [dotNode, idNode] }
      const visitor = new crv()
      const output = visitor.visitComponent_reference(ctx)
      as.deepEqual(output.component_reference_parts.length, 2, 'expected 2 parts ; actual: ' + output.component_reference_parts.length)
      as.deepEqual(output.component_reference_parts[0].dot_op, true, 'expected first part dot_op true ; actual: ' + output.component_reference_parts[0].dot_op)
      as.deepEqual(output.component_reference_parts[1].identifier, 'foo', 'expected second part identifier foo ; actual: ' + output.component_reference_parts[1].identifier)
    })
    mo.it('testing identifier dot identifier', function () {
      const id1Node = new tn('')
      sinon.stub(id1Node, 'getText').returns('a')
      const dotNode = new tn('')
      sinon.stub(dotNode, 'getText').returns('.')
      const id2Node = new tn('')
      sinon.stub(id2Node, 'getText').returns('b')
      const ctx = { children: [id1Node, dotNode, id2Node] }
      const visitor = new crv()
      const output = visitor.visitComponent_reference(ctx)
      as.deepEqual(output.component_reference_parts.length, 3, 'expected 3 parts ; actual: ' + output.component_reference_parts.length)
      as.deepEqual(output.component_reference_parts[0].identifier, 'a', 'expected first identifier a ; actual: ' + output.component_reference_parts[0].identifier)
      as.deepEqual(output.component_reference_parts[0].dot_op, false, 'expected first dot_op false ; actual: ' + output.component_reference_parts[0].dot_op)
      as.deepEqual(output.component_reference_parts[2].identifier, 'b', 'expected third identifier b ; actual: ' + output.component_reference_parts[2].identifier)
    })
    mo.it('testing array subscripts child sets array_subscripts', function () {
      const { modelicaParser } = require('../jsParser/antlrFiles/modelicaParser')
      const idNode = new tn('')
      sinon.stub(idNode, 'getText').returns('myId')
      const asChild = Object.create(modelicaParser.Array_subscriptsContext.prototype)
      sinon.stub(asv.prototype, 'visitArray_subscripts').callsFake((c) => 'mocked array_subscripts')
      const ctx = { children: [idNode, asChild] }
      const visitor = new crv()
      const output = visitor.visitComponent_reference(ctx)
      as.deepEqual(output.component_reference_parts.length, 1, 'expected 1 part ; actual: ' + output.component_reference_parts.length)
      as.deepEqual(output.component_reference_parts[0].array_subscripts, 'mocked array_subscripts', 'expected array_subscripts ; actual: ' + output.component_reference_parts[0].array_subscripts)
    })
  })
})
mo.describe('testing CompositionVisitor.js', function () {
  mo.describe('testing visitComposition(ctx)', function () {
    const { modelicaParser } = require('../jsParser/antlrFiles/modelicaParser')
    mo.it('testing Element_listContext child sets element_list', function () {
      const elmChild = Object.create(modelicaParser.Element_listContext.prototype)
      sinon.stub(elv.prototype, 'visitElement_list').callsFake((c) => 'mocked element_list')
      sinon.stub(annV.prototype, 'visitAnnotation').callsFake((a) => a)
      const ctx = { children: [elmChild], annotation: () => null, EXTERNAL: () => null }
      const visitor = new compV()
      const output = visitor.visitComposition(ctx)
      as.deepEqual(output.element_list, 'mocked element_list', 'expected mocked element_list ; actual: ' + output.element_list)
    })
    mo.it('testing protected modifier + Element_listContext adds element_section', function () {
      const tn = require('antlr4/tree/Tree.js').TerminalNodeImpl
      const tnProtected = new tn('')
      sinon.stub(tnProtected, 'getText').returns('protected')
      const elmChild = Object.create(modelicaParser.Element_listContext.prototype)
      sinon.stub(elv.prototype, 'visitElement_list').callsFake((c) => 'mocked protected_element_list')
      sinon.stub(annV.prototype, 'visitAnnotation').callsFake((a) => a)
      const ctx = { children: [tnProtected, elmChild], annotation: () => null, EXTERNAL: () => null }
      const visitor = new compV()
      const output = visitor.visitComposition(ctx)
      as.deepEqual(output.element_sections.length, 1, 'expected 1 element_section ; actual: ' + output.element_sections.length)
      as.deepEqual(output.element_sections[0].protected_element_list, 'mocked protected_element_list', 'expected mocked protected_element_list ; actual: ' + output.element_sections[0].protected_element_list)
    })
    mo.it('testing public modifier + Element_listContext adds element_section', function () {
      const tn = require('antlr4/tree/Tree.js').TerminalNodeImpl
      const tnPublic = new tn('')
      sinon.stub(tnPublic, 'getText').returns('public')
      const elmChild = Object.create(modelicaParser.Element_listContext.prototype)
      sinon.stub(elv.prototype, 'visitElement_list').callsFake((c) => 'mocked public_element_list')
      sinon.stub(annV.prototype, 'visitAnnotation').callsFake((a) => a)
      const ctx = { children: [tnPublic, elmChild], annotation: () => null, EXTERNAL: () => null }
      const visitor = new compV()
      const output = visitor.visitComposition(ctx)
      as.deepEqual(output.element_sections.length, 1, 'expected 1 element_section ; actual: ' + output.element_sections.length)
      as.deepEqual(output.element_sections[0].public_element_list, 'mocked public_element_list', 'expected mocked public_element_list ; actual: ' + output.element_sections[0].public_element_list)
    })
    mo.it('testing Equation_sectionContext child adds element_section', function () {
      const eqsChild = Object.create(modelicaParser.Equation_sectionContext.prototype)
      sinon.stub(esv.prototype, 'visitEquation_section').callsFake((c) => 'mocked equation_section')
      sinon.stub(annV.prototype, 'visitAnnotation').callsFake((a) => a)
      const ctx = { children: [eqsChild], annotation: () => null, EXTERNAL: () => null }
      const visitor = new compV()
      const output = visitor.visitComposition(ctx)
      as.deepEqual(output.element_sections.length, 1, 'expected 1 element_section ; actual: ' + output.element_sections.length)
      as.deepEqual(output.element_sections[0].equation_section, 'mocked equation_section', 'expected mocked equation_section ; actual: ' + output.element_sections[0].equation_section)
    })
    mo.it('testing Algorithm_sectionContext child adds element_section', function () {
      const algsChild = Object.create(modelicaParser.Algorithm_sectionContext.prototype)
      sinon.stub(algSV.prototype, 'visitAlgorithm_section').callsFake((c) => 'mocked algorithm_section')
      sinon.stub(annV.prototype, 'visitAnnotation').callsFake((a) => a)
      const ctx = { children: [algsChild], annotation: () => null, EXTERNAL: () => null }
      const visitor = new compV()
      const output = visitor.visitComposition(ctx)
      as.deepEqual(output.element_sections.length, 1, 'expected 1 element_section ; actual: ' + output.element_sections.length)
      as.deepEqual(output.element_sections[0].algorithm_section, 'mocked algorithm_section', 'expected mocked algorithm_section ; actual: ' + output.element_sections[0].algorithm_section)
    })
    mo.it('testing single annotation (external=false) sets annotation', function () {
      sinon.stub(annV.prototype, 'visitAnnotation').callsFake((a) => a)
      const ctx = { children: [], annotation: () => ['mocked_ann1'], EXTERNAL: () => null }
      const visitor = new compV()
      const output = visitor.visitComposition(ctx)
      as.deepEqual(output.annotation, 'mocked_ann1', 'expected mocked_ann1 ; actual: ' + output.annotation)
    })
    mo.it('testing two annotations sets external_annotation (first) and annotation (second)', function () {
      sinon.stub(annV.prototype, 'visitAnnotation').callsFake((a) => a)
      const ctx = { children: [], annotation: () => ['mocked_ann1', 'mocked_ann2'], EXTERNAL: () => null }
      const visitor = new compV()
      const output = visitor.visitComposition(ctx)
      as.deepEqual(output.annotation, 'mocked_ann2', 'expected mocked_ann2 for annotation ; actual: ' + output.annotation)
    })
  })
})
mo.describe('testing Condition_attributeVisitor.js', function () {
  mo.it('testing visitCondition_attribute(ctx)', function () {
    sinon.stub(ev.prototype, 'visitExpression').callsFake((expression) => expression)
    const visitor = new cav()
    const input = new ctxMock()
    const output = visitor.visitCondition_attribute(input)
    const referenceOutput = 'mocked expression'
    as.deepEqual(output.expression, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.expression)
  })
})
mo.describe('testing Connect_clauseVisitor.js', function () {
  mo.it('testing visitConnect_clause(ctx)', function () {
    sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((comp_ref) => comp_ref)
    const visitor = new connCV()
    const input = new ctxMock()
    const output = visitor.visitConnect_clause(input)
    const referenceOutput = [1, 2]
    as.deepEqual(output.from, referenceOutput[0], 'expected value for "from": ' + referenceOutput[0] + ' ; actual value for "from": ' + output.from)
    as.deepEqual(output.to, referenceOutput[1], 'expected value for "to": ' + referenceOutput[1] + ' ; actual value for "to": ' + output.to)
  })
  mo.it('testing visitConnect_clause(ctx) when comp_refs.length !== 2', function () {
    sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((comp_ref) => comp_ref)
    sinon.stub(ctxMock.prototype, 'component_reference').returns([1])
    const visitor = new connCV()
    const input = new ctxMock()
    const output = visitor.visitConnect_clause(input)
    as.deepEqual(output.from, null, 'expected from to be null ; actual: ' + output.from)
    as.deepEqual(output.to, null, 'expected to to be null ; actual: ' + output.to)
  })
})
mo.describe('testing Constraining_clauseVisitor.js', function () {
  mo.it('testing visitConstraining_clause(ctx)', function () {
    sinon.stub(nv.prototype, 'visitName').callsFake((name) => name)
    sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((cm) => cm)
    const visitor = new consCV()
    const input = new ctxMock()
    const output = visitor.visitConstraining_clause(input)
    const referenceOutput = ['mocked name', 'mocked class_modification']
    as.deepEqual(output.name, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.name)
    as.deepEqual(output.class_modification, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.class_modification)
  })
})
mo.describe('testing DeclarationVisitor.js', function () {
  mo.it('testing visitDeclaration', function () {
    sinon.stub(asv.prototype, 'visitArray_subscripts').callsFake((array_subscripts) => array_subscripts)
    sinon.stub(mv.prototype, 'visitModification').callsFake((modification) => modification)
    const visitor = new dv()
    const input = new ctxMock()
    const output = visitor.visitDeclaration(input)
    const referenceOutput = ['mocked identifier', 'mocked array_subscripts', 'mocked modification']
    as.deepEqual(output.identifier, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.identifier)
    as.deepEqual(output.array_subscripts, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.array_subscripts)
    as.deepEqual(output.modification, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.modification)
  })
})
mo.describe('testing Der_class_specifierVisitor.js', function () {
  mo.it('testing visitDer_class_specifier(ctx)', function () {
    class ctxMockUnique {
      IDENT (x = 1) {
        if (x === 0) {
          return new getTextClass(1)
        } else {
          return [new getTextClass(1), new getTextClass(2), new getTextClass(3)]
        }
      }

      name () {
        return 'mocked name'
      }

      comment () {
        return 'mocked comment'
      }
    }
    sinon.stub(nv.prototype, 'visitName').callsFake((name) => name)
    sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
    const visitor = new dcsv()
    const input = new ctxMockUnique()
    const output = visitor.visitDer_class_specifier(input)
    const referenceOutput = [1, 'mocked name', [2, 3], 'mocked comment']
    as.deepEqual(output.identifier, referenceOutput[0], 'expected value for "identifier": ' + referenceOutput[0] + ' ; actual value for "identifier": ' + output.identifier)
    as.deepEqual(output.der_class_specifier_value.type_specifier, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.der_class_specifier_value.type_specifier)
    as.deepEqual(output.der_class_specifier_value.identifiers, referenceOutput[2], 'expected value for "identifiers": ' + referenceOutput[2] + ' ; actual value for "identifiers": ' + output.der_class_specifier_value.identifiers)
    as.deepEqual(output.der_class_specifier_value.comment, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.der_class_specifier_value.comment)
  })
})
mo.describe('testing Element_listVisitor.js', function () {
  mo.it('testing visitElement_list(ctx)', function () {
    sinon.stub(eleV.prototype, 'visitElement').callsFake((element) => element)
    const visitor = new elv()
    const input = new ctxMock()
    const output = visitor.visitElement_list(input)
    const referenceOutput = [1, 2, 3]
    as.deepEqual(output.elements, referenceOutput, 'expected value for "elements": ' + referenceOutput + ' ; actual value for "elements": ' + output.elements)
  })
})
mo.describe('testing Element_modification_or_replaceableVisitor.js', function () {
  mo.describe('testing visitElement_modification_or_replaceable(ctx)', function () {
    mo.it('testing EACH & FINAL = true', function () {
      sinon.stub(emv.prototype, 'visitElement_modification').callsFake((element_modification) => element_modification)
      sinon.stub(eleRepV.prototype, 'visitElement_replaceable').callsFake((element_replaceable) => element_replaceable)
      const visitor = new emorv()
      const input = new ctxMock(true)
      const output = visitor.visitElement_modification_or_replaceable(input)
      const referenceOutput = [true, true, 'mocked element_modification', 'mocked element_replaceable']
      as.deepEqual(output.each, referenceOutput[0], 'expected value for "each": ' + referenceOutput[0] + ' ; actual value for "each": ' + output.each)
      as.deepEqual(output.is_final, referenceOutput[1], 'expected value for "is_final": ' + referenceOutput[1] + ' ; actual value for "is_final": ' + output.is_final)
      as.deepEqual(output.element_modification, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.element_modification)
      as.deepEqual(output.element_replaceable, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.element_replaceable)
    })
    mo.it('testing EACH & FINAL = false', function () {
      sinon.stub(emv.prototype, 'visitElement_modification').callsFake((element_modification) => element_modification)
      sinon.stub(eleRepV.prototype, 'visitElement_replaceable').callsFake((element_replaceable) => element_replaceable)
      const visitor = new emorv()
      const input = new ctxMock(false)
      const output = visitor.visitElement_modification_or_replaceable(input)
      const referenceOutput = [false, false, 'mocked element_modification', 'mocked element_replaceable']
      as.deepEqual(output.each, referenceOutput[0], 'expected value for "each": ' + referenceOutput[0] + ' ; actual value for "each": ' + output.each)
      as.deepEqual(output.is_final, referenceOutput[1], 'expected value for "is_final": ' + referenceOutput[1] + ' ; actual value for "is_final": ' + output.is_final)
      as.deepEqual(output.element_modification, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.element_modification)
      as.deepEqual(output.element_replaceable, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.element_replaceable)
    })
    mo.it('testing EACH & FINAL = null', function () {
      sinon.stub(emv.prototype, 'visitElement_modification').callsFake((element_modification) => element_modification)
      sinon.stub(eleRepV.prototype, 'visitElement_replaceable').callsFake((element_replaceable) => element_replaceable)
      const visitor = new emorv()
      const input = new ctxMock(null)
      const output = visitor.visitElement_modification_or_replaceable(input)
      const referenceOutput = [false, false, 'mocked element_modification', 'mocked element_replaceable']
      as.deepEqual(output.each, referenceOutput[0], 'expected value for "each": ' + referenceOutput[0] + ' ; actual value for "each": ' + output.each)
      as.deepEqual(output.is_final, referenceOutput[1], 'expected value for "is_final": ' + referenceOutput[1] + ' ; actual value for "is_final": ' + output.is_final)
      as.deepEqual(output.element_modification, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.element_modification)
      as.deepEqual(output.element_replaceable, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.element_replaceable)
    })
  })
})
mo.describe('testing Element_modificationVisitor.js', function () {
  mo.it('testing visitElement_modification', function () {
    sinon.stub(nv.prototype, 'visitName').callsFake((input) => input)
    sinon.stub(mv.prototype, 'visitModification').callsFake((modification) => modification)
    sinon.stub(scv.prototype, 'visitString_comment').callsFake((string) => string)
    const visitor = new emv()
    const input = new ctxMock()
    const output = visitor.visitElement_modification(input)
    const referenceOutput = ['mocked name', 'mocked modification', 'mocked string_comment']
    as.deepEqual(output.name, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.name)
    as.deepEqual(output.modification, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.modification)
    as.deepEqual(output.string_comment, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.string_comment)
  })
})
mo.describe('testing Element_redeclarationVisitor.js', function () {
  mo.describe('testing visitElement_redeclaration(ctx)', function () {
    mo.describe('testing ctx.EACH() and ctx.FINAL()', function () {
      mo.it('testing when true', function () {
        sinon.stub(scdv.prototype, 'visitShort_class_definition').callsFake((scd) => scd)
        sinon.stub(cc1v.prototype, 'visitComponent_clause1').callsFake((clause) => clause)
        sinon.stub(eleRepV.prototype, 'visitElement_replaceable').callsFake((element) => element)
        const visitor = new erv()
        const input = new ctxMock(true)
        const output = visitor.visitElement_redeclaration(input)
        const referenceOutput = [true, true, 'mocked short_class_definition', 'mocked component_clause1', 'mocked element_replaceable']
        as.deepEqual(output.each, referenceOutput[0], 'expected value for "each": ' + referenceOutput[0] + ' ; actual value for "each": ' + output.each)
        as.deepEqual(output.is_final, referenceOutput[1], 'expected value for "is_final": ' + referenceOutput[1] + ' ; actual value for "is_final": ' + output.is_final)
        as.deepEqual(output.short_class_definition, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.short_class_definition)
        as.deepEqual(output.component_clause1, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.component_clause1)
        as.deepEqual(output.element_replaceable, referenceOutput[4], 'expected: ' + referenceOutput[4] + ' ; actual: ' + output.element_replaceable)
      })
      mo.it('testing when false', function () {
        sinon.stub(scdv.prototype, 'visitShort_class_definition').callsFake((scd) => scd)
        sinon.stub(cc1v.prototype, 'visitComponent_clause1').callsFake((clause) => clause)
        sinon.stub(eleRepV.prototype, 'visitElement_replaceable').callsFake((element) => element)
        const visitor = new erv()
        const input = new ctxMock(false)
        const output = visitor.visitElement_redeclaration(input)
        const referenceOutput = [false, false, 'mocked short_class_definition', 'mocked component_clause1', 'mocked element_replaceable']
        as.deepEqual(output.each, referenceOutput[0], 'expected value for "each": ' + referenceOutput[0] + ' ; actual value for "each": ' + output.each)
        as.deepEqual(output.is_final, referenceOutput[1], 'expected value for "is_final": ' + referenceOutput[1] + ' ; actual value for "is_final": ' + output.is_final)
        as.deepEqual(output.short_class_definition, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.short_class_definition)
        as.deepEqual(output.component_clause1, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.component_clause1)
        as.deepEqual(output.element_replaceable, referenceOutput[4], 'expected: ' + referenceOutput[4] + ' ; actual: ' + output.element_replaceable)
      })
      mo.it('testing when null', function () {
        sinon.stub(scdv.prototype, 'visitShort_class_definition').callsFake((scd) => scd)
        sinon.stub(cc1v.prototype, 'visitComponent_clause1').callsFake((clause) => clause)
        sinon.stub(eleRepV.prototype, 'visitElement_replaceable').callsFake((element) => element)
        const visitor = new erv()
        const input = new ctxMock(null)
        const output = visitor.visitElement_redeclaration(input)
        const referenceOutput = [false, false, 'mocked short_class_definition', 'mocked component_clause1', 'mocked element_replaceable']
        as.deepEqual(output.each, referenceOutput[0], 'expected value for "each": ' + referenceOutput[0] + ' ; actual value for "each": ' + output.each)
        as.deepEqual(output.is_final, referenceOutput[1], 'expected value for "is_final": ' + referenceOutput[1] + ' ; actual value for "is_final": ' + output.is_final)
        as.deepEqual(output.short_class_definition, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.short_class_definition)
        as.deepEqual(output.component_clause1, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.component_clause1)
        as.deepEqual(output.element_replaceable, referenceOutput[4], 'expected: ' + referenceOutput[4] + ' ; actual: ' + output.element_replaceable)
      })
    })
  })
})
mo.describe('testing Element_replaceableVisitor.js', function () {
  mo.it('testing visitElement_replaceable', function () {
    sinon.stub(scdv.prototype, 'visitShort_class_definition').callsFake((definition) => definition)
    sinon.stub(cc1v.prototype, 'visitComponent_clause1').callsFake((clause) => clause)
    sinon.stub(consCV.prototype, 'visitConstraining_clause').callsFake((clause) => clause)
    const visitor = new eleRepV()
    const input = new ctxMock()
    const output = visitor.visitElement_replaceable(input)
    const referenceOutput = ['mocked short_class_definition', 'mocked component_clause1', 'mocked constraining_clause']
    as.deepEqual(output.short_class_definition, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.short_class_definition)
    as.deepEqual(output.component_clause1, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.component_clause1)
    as.deepEqual(output.constraining_clause, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.constraining_clause)
  })
})
mo.describe('testing ElementVisitor.js', function () {
  mo.describe('testing visitElement(ctx)', function () {
    mo.describe('testing ctx.REDECLARE(), ctx.FINAL(), ctx.INNER(), ctx.OUTER(), ctx.REPLACEABLE()', function () {
      mo.it('testing when true', function () {
        sinon.stub(icv.prototype, 'visitImport_clause').callsFake((clause) => clause)
        sinon.stub(ecv.prototype, 'visitExtends_clause').callsFake((clause) => clause)
        sinon.stub(consCV.prototype, 'visitConstraining_clause').callsFake((clause) => clause)
        sinon.stub(cdv.prototype, 'visitClass_definition').callsFake((class_definition) => class_definition)
        sinon.stub(ccv.prototype, 'visitComponent_clause').callsFake((clause) => clause)
        sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
        const visitor = new eleV()
        const input = new ctxMock(true)
        const output = visitor.visitElement(input)
        const referenceOutput = ['mocked import_clause', 'mocked extends_clause', true, true, true, true, true, 'mocked constraining_clause', 'mocked class_definition', 'mocked component_clause', 'mocked comment']
        as.deepEqual(output.import_clause, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.import_clause)
        as.deepEqual(output.extends_clause, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.extends_clause)
        as.deepEqual(output.redeclare, referenceOutput[2], 'expected value for "redeclare": ' + referenceOutput[2] + ' ; actual value for "redeclare": ' + output.redeclare)
        as.deepEqual(output.is_final, referenceOutput[3], 'expected value for "is_final": ' + referenceOutput[3] + ' ; actual value for "is_final": ' + output.is_final)
        as.deepEqual(output.inner, referenceOutput[4], 'expected value for "inner": ' + referenceOutput[4] + ' ; actual value for "inner": ' + output.inner)
        as.deepEqual(output.outer, referenceOutput[5], 'expected value for "outer": ' + referenceOutput[5] + ' ; actual value for "outer": ' + output.outer)
        as.deepEqual(output.replaceable, referenceOutput[6], 'expected value for "replaceable": ' + referenceOutput[6] + ' ; actual value for "replaceable": ' + output.replaceable)
        as.deepEqual(output.constraining_clause, referenceOutput[7], 'expected: ' + referenceOutput[7] + ' ; actual: ' + output.constraining_clause)
        as.deepEqual(output.class_definition, referenceOutput[8], 'expected: ' + referenceOutput[8] + ' ; actual: ' + output.class_definition)
        as.deepEqual(output.component_clause, referenceOutput[9], 'expected: ' + referenceOutput[9] + ' ; actual: ' + output.component_clause)
        as.deepEqual(output.comment, referenceOutput[10], 'expected: ' + referenceOutput[10] + ' ; actual: ' + output.comment)
      })
      mo.it('testing when false (all boolean flags are null)', function () {
        sinon.stub(icv.prototype, 'visitImport_clause').callsFake((clause) => clause)
        sinon.stub(ecv.prototype, 'visitExtends_clause').callsFake((clause) => clause)
        sinon.stub(consCV.prototype, 'visitConstraining_clause').callsFake((clause) => clause)
        sinon.stub(cdv.prototype, 'visitClass_definition').callsFake((class_definition) => class_definition)
        sinon.stub(ccv.prototype, 'visitComponent_clause').callsFake((clause) => clause)
        sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
        const visitor = new eleV()
        const input = new ctxMock(null)
        const output = visitor.visitElement(input)
        as.deepEqual(output.redeclare, false, 'expected value for "redeclare": false ; actual: ' + output.redeclare)
        as.deepEqual(output.is_final, false, 'expected value for "is_final": false ; actual: ' + output.is_final)
        as.deepEqual(output.inner, false, 'expected value for "inner": false ; actual: ' + output.inner)
        as.deepEqual(output.outer, false, 'expected value for "outer": false ; actual: ' + output.outer)
        as.deepEqual(output.replaceable, false, 'expected value for "replaceable": false ; actual: ' + output.replaceable)
      })
    })
  })
})
mo.describe('testing Enum_listVisitor.js', function () {
  mo.it('testing visitEnum_list(ctx)', function () {
    sinon.stub(enumLitV.prototype, 'visitEnumeration_literal').callsFake((enumeration_literal) => enumeration_literal)
    const visitor = new enumListV()
    const input = new ctxMock()
    const output = visitor.visitEnum_list(input)
    const referenceOutput = [1, 2, 3]
    as.deepEqual(output.enumeration_literal_list, referenceOutput, 'expected value for "enumeration_literal_list": ' + referenceOutput + ' ; actual value for "enumeration_literal_list": ' + output.enumeration_literal_list)
  })
})
mo.describe('testing Enumeration_literalVisitor.js', function () {
  mo.it('testing visitEnumeration_literal(ctx)', function () {
    sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
    const visitor = new enumLitV()
    const input = new ctxMock()
    const output = visitor.visitEnumeration_literal(input)
    const referenceOutput = ['mocked identifier', 'mocked comment']
    as.deepEqual(output.identifier, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.identifier)
    as.deepEqual(output.comment, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.comment)
  })
})
mo.describe('testing Equation_sectionVisitor.js', function () {
  mo.describe('testing visitEquation_section(ctx)', function () {
    mo.describe('testing ctx.INITIAL()', function () {
      mo.it('testing when true', function () {
        sinon.stub(eqV.prototype, 'visitEquation').callsFake((eqn) => eqn)
        const visitor = new esv()
        const input = new ctxMock(true)
        const output = visitor.visitEquation_section(input)
        const referenceOutput = [true, [1, 2, 3]]
        as.deepEqual(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + ' ; actual value for "initial": ' + output.initial)
        as.deepEqual(output.equations, referenceOutput[1], 'expected value for "equations": ' + referenceOutput[1] + ' ; actual value for "equations": ' + output.equations)
      })
      mo.it('testing when false', function () {
        sinon.stub(eqV.prototype, 'visitEquation').callsFake((eqn) => eqn)
        const visitor = new esv()
        const input = new ctxMock(false)
        const output = visitor.visitEquation_section(input)
        const referenceOutput = [false, [1, 2, 3]]
        as.deepEqual(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + ' ; actual value for "initial": ' + output.initial)
        as.deepEqual(output.equations, referenceOutput[1], 'expected value for "equations": ' + referenceOutput[1] + ' ; actual value for "equations": ' + output.equations)
      })
      mo.it('testing when null', function () {
        sinon.stub(eqV.prototype, 'visitEquation').callsFake((eqn) => eqn)
        const visitor = new esv()
        const input = new ctxMock(null)
        const output = visitor.visitEquation_section(input)
        const referenceOutput = [false, [1, 2, 3]]
        as.deepEqual(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + ' ; actual value for "initial": ' + output.initial)
        as.deepEqual(output.equations, referenceOutput[1], 'expected value for "equations": ' + referenceOutput[1] + ' ; actual value for "equations": ' + output.equations)
      })
    })
  })
})
mo.describe('testing EquationVisitor.js', function () {
  mo.it('testing visitEquation(ctx)', function () {
    sinon.stub(sev.prototype, 'visitSimple_expression').callsFake((exp) => exp)
    sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
    sinon.stub(iev.prototype, 'visitIf_equation').callsFake((eqn) => eqn)
    sinon.stub(fev.prototype, 'visitFor_equation').callsFake((eqn) => eqn)
    sinon.stub(connCV.prototype, 'visitConnect_clause').callsFake((clause) => clause)
    sinon.stub(wev.prototype, 'visitWhen_equation').callsFake((eqn) => eqn)
    sinon.stub(nv.prototype, 'visitName').callsFake((name) => name)
    sinon.stub(fcav.prototype, 'visitFunction_call_args').callsFake((args) => args)
    sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
    const visitor = new eqV()
    const input = new ctxMock()
    const output = visitor.visitEquation(input)
    const referenceOutput = ['mocked simple_expression', 'mocked expression', 'mocked if_equation', 'mocked for_equation', 'mocked connect_clause', 'mocked when_equation', 'mocked name', 'mocked function_call_args', 'mocked comment']
    as.deepEqual(output.assignment_equation.lhs, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.assignment_equation.lhs)
    as.deepEqual(output.assignment_equation.rhs, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.assignment_equation.rhs)
    as.deepEqual(output.if_equation, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.if_equation)
    as.deepEqual(output.for_equation, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.for_equation)
    as.deepEqual(output.connect_clause, referenceOutput[4], 'expected: ' + referenceOutput[4] + ' ; actual: ' + output.connect_clause)
    as.deepEqual(output.when_equation, referenceOutput[5], 'expected: ' + referenceOutput[5] + ' ; actual: ' + output.when_equation)
    as.deepEqual(output.function_call_equation.function_name, referenceOutput[6], 'expected: ' + referenceOutput[6] + ' ; actual: ' + output.function_call_equation.function_name)
    as.deepEqual(output.function_call_equation.function_call_args, referenceOutput[7], 'expected: ' + referenceOutput[7] + ' ; actual: ' + output.function_call_equation.function_call_args)
    as.deepEqual(output.comment, referenceOutput[8], 'expected: ' + referenceOutput[8] + ' ; actual: ' + output.comment)
  })
})
mo.describe('testing Expression_listVisitor.js', function () {
  mo.it('testing visitExpression_list(ctx)', function () {
    sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
    sinon.stub(ctxMock.prototype, 'expression').returns([1, 2, 3])
    const visitor = new expLV()
    const input = new ctxMock()
    const output = visitor.visitExpression_list(input)
    const referenceOutput = [1, 2, 3]
    as.deepEqual(output.expressions, referenceOutput, 'expected value for "expressions": ' + referenceOutput + ' ; actual value for "expressions": ' + output.expressions)
  })
})
mo.describe('testing ExpressionVisitor.js', function () {
  mo.describe('testing visitExpression', function () {
    mo.it('testing when ctx.expression() is null (simple_expression only)', function () {
      sinon.stub(sev.prototype, 'visitSimple_expression').callsFake((exp) => exp)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      const visitor = new ev()
      const input = new ctxMock()
      const output = visitor.visitExpression(input)
      as.deepEqual(output.simple_expression, 'mocked simple_expression', 'expected: mocked simple_expression ; actual: ' + output.simple_expression)
      as.deepEqual(output.if_expression, undefined, 'expected: undefined ; actual: ' + output.if_expression)
    })
    mo.it('testing when ctx.expression() returns 2 items (if without else)', function () {
      class simpleExprCtx {
        simple_expression () { return null }
        expression () { return null }
      }
      sinon.stub(sev.prototype, 'visitSimple_expression').callsFake((exp) => exp)
      sinon.stub(ctxMock.prototype, 'expression').returns([new simpleExprCtx(), new simpleExprCtx()])
      const visitor = new ev()
      const input = new ctxMock()
      const output = visitor.visitExpression(input)
      as.deepEqual(output.if_expression.if_elseif.length, 1, 'expected 1 if_elseif entry ; actual: ' + output.if_expression.if_elseif.length)
      as.deepEqual(output.if_expression.else_expression, undefined, 'expected: undefined ; actual: ' + output.if_expression.else_expression)
    })
    mo.it('testing when ctx.expression() returns 4 items (if with else)', function () {
      class simpleExprCtx {
        simple_expression () { return null }
        expression () { return null }
      }
      sinon.stub(sev.prototype, 'visitSimple_expression').callsFake((exp) => exp)
      sinon.stub(ctxMock.prototype, 'expression').returns([new simpleExprCtx(), new simpleExprCtx(), new simpleExprCtx(), new simpleExprCtx()])
      const visitor = new ev()
      const input = new ctxMock()
      const output = visitor.visitExpression(input)
      as.deepEqual(output.if_expression.if_elseif.length, 2, 'expected 2 if_elseif entries ; actual: ' + output.if_expression.if_elseif.length)
      as.notDeepEqual(output.if_expression.else_expression, undefined, 'expected else_expression to be set')
    })
  })
})
mo.describe('testing Extends_clauseVisitor.js', function () {
  mo.it('testing visitExtends_clause(ctx)', function () {
    sinon.stub(nv.prototype, 'visitName').callsFake((name) => name)
    sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((cm) => cm)
    sinon.stub(annV.prototype, 'visitAnnotation').callsFake((ann) => ann)
    const visitor = new ecv()
    const input = new ctxMock()
    const output = visitor.visitExtends_clause(input)
    const referenceOutput = ['mocked name', 'mocked class_modification', 'mocked annotation']
    as.deepEqual(output.name, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.name)
    as.deepEqual(output.class_modification, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.class_modification)
    as.deepEqual(output.annotation, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.annotation)
  })
})
mo.describe('testing External_function_callVisitor.js', function () {
  mo.it('testing visitExternal_function_call(ctx)', function () {
    sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((comRef) => comRef)
    sinon.stub(expLV.prototype, 'visitExpression_list').callsFake((exp) => exp)
    sinon.stub(ctxMock.prototype, 'component_reference').returns('mocked component_reference')
    const visitor = new efcv()
    const input = new ctxMock()
    const output = visitor.visitExternal_function_call(input)
    const referenceOutput = ['mocked component_reference', 'mocked identifier', 'mocked expression_list']
    as.deepEqual(output.component_reference, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.component_reference)
    as.deepEqual(output.identifier, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.identifier)
    as.deepEqual(output.expression_list, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.expression_list)
  })
})
mo.describe('testing FactorVisitor.js', function () {
  mo.describe('testing visitFactor(ctx)', function () {
    mo.it('testing ctx.SYMBOL_CARET()', function () {
      sinon.stub(pv.prototype, 'visitPrimary').callsFake((pri) => pri)
      const visitor = new fv()
      const input = new ctxMock()
      const output = visitor.visitFactor(input)
      const referenceOutput = [1, 'mocked symbol_caret', 2]
      as.deepEqual(output.primary1, referenceOutput[0], 'expected value for "primary1": ' + referenceOutput[0] + ' ; actual value for "primary1": ' + output.primary1)
      as.deepEqual(output.op, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.op)
      as.deepEqual(output.primary2, referenceOutput[2], 'expected value for "primary2": ' + referenceOutput[2] + ' ; actual value for "primary2": ' + output.primary2)
    })
    mo.it('testing ctx.SYMBOL_DOTCARET()', function () {
      sinon.stub(pv.prototype, 'visitPrimary').callsFake((pri) => pri)
      sinon.stub(ctxMock.prototype, 'SYMBOL_CARET').returns(false)
      const visitor = new fv()
      const input = new ctxMock()
      const output = visitor.visitFactor(input)
      const referenceOutput = [1, 'mocked symbol_dotcaret', 2]
      as.deepEqual(output.primary1, referenceOutput[0], 'expected value for "primary1": ' + referenceOutput[0] + ' ; actual value for "primary1": ' + output.primary1)
      as.deepEqual(output.op, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.op)
      as.deepEqual(output.primary2, referenceOutput[2], 'expected value for "primary2": ' + referenceOutput[2] + ' ; actual value for "primary2": ' + output.primary2)
    })
    mo.it('testing when primarys = 1', function () {
      sinon.stub(pv.prototype, 'visitPrimary').callsFake((pri) => pri)
      sinon.stub(ctxMock.prototype, 'primary').returns([1])
      const visitor = new fv()
      const input = new ctxMock()
      const output = visitor.visitFactor(input)
      const referenceOutput = [1, 'mocked symbol_caret', null]
      as.deepEqual(output.primary1, referenceOutput[0], 'expected value for "primary1": ' + referenceOutput[0] + ' ; actual value for "primary1": ' + output.primary1)
      as.deepEqual(output.op, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.op)
      as.deepEqual(output.primary2, referenceOutput[2], 'expected value for "primary2": ' + referenceOutput[2] + ' ; actual value for "primary2": ' + output.primary2)
    })
    mo.it('testing when primarys = 0', function () {
      sinon.stub(pv.prototype, 'visitPrimary').callsFake((pri) => pri)
      sinon.stub(ctxMock.prototype, 'primary').returns([])
      const visitor = new fv()
      const input = new ctxMock()
      const output = visitor.visitFactor(input)
      as.deepEqual(output.primary1, null, 'expected value for "primary1": null ; actual value for "primary1": ' + output.primary1)
      as.deepEqual(output.primary2, null, 'expected value for "primary2": null ; actual value for "primary2": ' + output.primary2)
    })
  })
})
mo.describe('testing For_equationVisitor.js', function () {
  mo.it('testing visitFor_equation(ctx)', function () {
    sinon.stub(fiv.prototype, 'visitFor_indices').callsFake((fi) => fi)
    sinon.stub(eqV.prototype, 'visitEquation').callsFake((eq) => eq)
    const visitor = new fev()
    const input = new ctxMock()
    const output = visitor.visitFor_equation(input)
    const referenceOutput = ['mocked for_indices', [1, 2, 3]]
    as.deepEqual(output.for_indices, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.for_indices)
    as.deepEqual(output.loop_equations, referenceOutput[1], 'expected value for "loop_equations": ' + referenceOutput[1] + ' ; actual value for "loop equations": ' + output.loop_equations)
  })
})
mo.describe('testing For_indexVisitor.js', function () {
  mo.it('testing For_indexVisitor.js', function () {
    sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
    const visitor = new forIndexV()
    const input = new ctxMock()
    const output = visitor.visitFor_index(input)
    const referenceOutput = ['mocked identifier', 'mocked expression']
    as.deepEqual(output.identifier, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.identifier)
    as.deepEqual(output.expression, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.expression)
  })
})
mo.describe('testing For_indicesVisitor.js', function () {
  mo.it('testing visitFor_indices(ctx)', function () {
    sinon.stub(forIndexV.prototype, 'visitFor_index').callsFake((index) => index)
    const visitor = new fiv()
    const input = new ctxMock()
    const output = visitor.visitFor_indices(input)
    const referenceOutput = [1, 2, 3]
    as.deepEqual(output.indices, referenceOutput, 'expected value for "indices": ' + referenceOutput + ' ; actual value for "indices": ' + output.indices)
  })
})
mo.describe('testing For_statementVisitor.js', function () {
  mo.it('testing visitFor_statement(ctx)', function () {
    sinon.stub(fiv.prototype, 'visitFor_indices').callsFake((fi) => fi)
    sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
    const visitor = new fsv()
    const input = new ctxMock()
    const output = visitor.visitFor_statement(input)
    const referenceOutput = ['mocked for_indices', [1, 2, 3, 4, 5]]
    as.deepEqual(output.for_indices, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.for_indices)
    as.deepEqual(output.loop_statements, referenceOutput[1], 'expected value for "loop_statements": ' + referenceOutput[1] + ' ; actual value for "loop_statements": ' + output.loop_statements)
  })
})
mo.describe('testing Function_argumentsVisitor.js', function () {
  mo.describe('testing visitFunction_arguments', function () {
    mo.it('testing without ctx.function_arguments()', function () {
      sinon.stub(namedArgsV.prototype, 'visitNamed_arguments').callsFake((args) => args)
      sinon.stub(funcAV.prototype, 'visitFunction_argument').callsFake((arg) => arg)
      sinon.stub(ctxMock.prototype, 'function_arguments').returns(false)
      sinon.stub(fiv.prototype, 'visitFor_indices').callsFake((fi) => fi)
      const visitor = new funcArgsV()
      const input = new ctxMock()
      const output = visitor.visitFunction_arguments(input)
      const referenceOutput = ['mocked named_arguments', 'mocked function_argument', 'mocked for_indices', null]
      as.deepEqual(output.named_arguments, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.named_arguments)
      as.deepEqual(output.function_argument, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.function_argument)
      as.deepEqual(output.for_indices, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.for_indices)
      as.deepEqual(output.function_arguments, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.function_arguments)
    })
    mo.it('testing with ctx.function_arguments() set', function () {
      sinon.stub(namedArgsV.prototype, 'visitNamed_arguments').callsFake((args) => args)
      sinon.stub(funcAV.prototype, 'visitFunction_argument').callsFake((arg) => arg)
      sinon.stub(fiv.prototype, 'visitFor_indices').callsFake((fi) => fi)
      // function_arguments() returns a ctx that funcArgsV can recursively visit
      class funcArgsCtx {
        named_arguments () { return null }
        function_argument () { return null }
        function_arguments () { return null }
        for_indices () { return null }
      }
      sinon.stub(ctxMock.prototype, 'function_arguments').returns(new funcArgsCtx())
      const visitor = new funcArgsV()
      const input = new ctxMock()
      const output = visitor.visitFunction_arguments(input)
      as.notDeepEqual(output.function_arguments, null, 'expected function_arguments to be set ; actual: ' + output.function_arguments)
    })
  })
})
mo.describe('testing Function_argumentVisitor.js', function () {
  mo.it('testing visitFunction_argument(ctx)', function () {
    sinon.stub(nv.prototype, 'visitName').callsFake((name) => name)
    sinon.stub(namedArgsV.prototype, 'visitNamed_arguments').callsFake((args) => args)
    sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
    const visitor = new funcAV()
    const input = new ctxMock()
    const output = visitor.visitFunction_argument(input)
    const referenceOutput = ['mocked name', 'mocked named_arguments', 'mocked expression']
    as.deepEqual(output.function_name, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.function_name)
    as.deepEqual(output.named_arguments, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.named_arguments)
    as.deepEqual(output.expression, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.expression)
  })
})
mo.describe('testing Function_call_argsVisitor.js', function () {
  mo.it('testing visitFunction_call_args(ctx)', function () {
    sinon.stub(funcArgsV.prototype, 'visitFunction_arguments').callsFake((args) => args)
    const visitor = new fcav()
    const input = new ctxMock()
    const output = visitor.visitFunction_call_args(input)
    const referenceOutput = 'mocked function_arguments'
    as.deepEqual(output.function_arguments, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.function_arguments)
  })
})
mo.describe('testing If_equationVisitor.js', function () {
  mo.describe('testing visitIf_equation(ctx)', function () {
    mo.it('testing when ctx.expression() and ctx.equation() are null', function () {
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'equation').returns(null)
      sinon.stub(ctxMock.prototype, 'getChildCount').returns(0)
      const visitor = new iev()
      const input = new ctxMock()
      const output = visitor.visitIf_equation(input)
      as.deepEqual(output.if_elseif, [], 'expected empty if_elseif ; actual: ' + output.if_elseif)
      as.deepEqual(output.else_equation, [], 'expected empty else_equation ; actual: ' + output.else_equation)
    })
    mo.it('testing when ctx.expression() and ctx.equation() return arrays', function () {
      sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
      sinon.stub(eqV.prototype, 'visitEquation').callsFake((eqn) => eqn)
      sinon.stub(ctxMock.prototype, 'expression').returns(['expr1', 'expr2'])
      sinon.stub(ctxMock.prototype, 'equation').returns(['eqn1', 'eqn2'])
      sinon.stub(ctxMock.prototype, 'getChildCount').returns(0)
      const visitor = new iev()
      const input = new ctxMock()
      const output = visitor.visitIf_equation(input)
      as.deepEqual(output.if_elseif, [], 'expected empty if_elseif ; actual: ' + output.if_elseif)
      as.deepEqual(output.else_equation, [], 'expected empty else_equation ; actual: ' + output.else_equation)
    })
  })
})
mo.describe('testing If_statementVisitor.js', function () {
  mo.describe('testing visitIf_statement(ctx)', function () {
    mo.it('testing when ctx.expression() and ctx.statement() are null', function () {
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'statement').returns(null)
      sinon.stub(ctxMock.prototype, 'getChildCount').returns(0)
      const visitor = new ifsv()
      const input = new ctxMock()
      const output = visitor.visitIf_statement(input)
      as.deepEqual(output.if_elseif, [], 'expected empty if_elseif ; actual: ' + output.if_elseif)
      as.deepEqual(output.else_statement, [], 'expected empty else_statement ; actual: ' + output.else_statement)
    })
    mo.it('testing when ctx.expression() and ctx.statement() return arrays', function () {
      sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
      sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
      sinon.stub(ctxMock.prototype, 'expression').returns(['expr1', 'expr2'])
      sinon.stub(ctxMock.prototype, 'statement').returns(['stmt1', 'stmt2'])
      sinon.stub(ctxMock.prototype, 'getChildCount').returns(0)
      const visitor = new ifsv()
      const input = new ctxMock()
      const output = visitor.visitIf_statement(input)
      as.deepEqual(output.if_elseif, [], 'expected empty if_elseif ; actual: ' + output.if_elseif)
      as.deepEqual(output.else_statement, [], 'expected empty else_statement ; actual: ' + output.else_statement)
    })
  })
})
mo.describe('testing Import_clauseVisitor.js', function () {
  mo.describe('testing visitImport_clause(ctx)', function () {
    mo.it('testing when ctx.IDENT() exists', function () {
      sinon.stub(nv.prototype, 'visitName').callsFake((name) => name)
      sinon.stub(ilv.prototype, 'visitImport_list').callsFake((list) => list)
      sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
      const visitor = new icv()
      const input = new ctxMock()
      const output = visitor.visitImport_clause(input)
      const referenceOutput = ['mocked identifier', 'mocked name', true, 'mocked import_list', 'mocked comment']
      as.deepEqual(output.identifier, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.identifier)
      as.deepEqual(output.name, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.name)
      as.deepEqual(output.dot_star, referenceOutput[2], 'expected value for "dot_star": ' + referenceOutput[2] + ' ; actual value for "dot_star": ' + output.dot_star)
      as.deepEqual(output.import_list, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.import_list)
      as.deepEqual(output.comment, referenceOutput[4], 'expected: ' + referenceOutput[4] + ' ; actual: ' + output.comment)
    })
    mo.it('testing when ctx.IDENT() does not exists', function () {
      sinon.stub(nv.prototype, 'visitName').callsFake((name) => name)
      sinon.stub(ilv.prototype, 'visitImport_list').callsFake((list) => list)
      sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
      sinon.stub(ctxMock.prototype, 'IDENT').returns(null)
      const visitor = new icv()
      const input = new ctxMock()
      const output = visitor.visitImport_clause(input)
      const referenceOutput = [undefined, 'mocked name', false, 'mocked import_list', 'mocked comment']
      as.deepEqual(output.identifier, referenceOutput[0], 'expected: ' + referenceOutput[0] + ' ; actual: ' + output.identifier)
      as.deepEqual(output.name, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.name)
      as.deepEqual(output.dot_star, referenceOutput[2], 'expected value for "dot_star": ' + referenceOutput[2] + ' ; actual value for "dot_star": ' + output.dot_star)
      as.deepEqual(output.import_list, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.import_list)
      as.deepEqual(output.comment, referenceOutput[4], 'expected: ' + referenceOutput[4] + ' ; actual: ' + output.comment)
    })
  })
})
mo.describe('testing Import_listVisitor.js', function () {
  mo.it('testing visitImport_list(ctx)', function () {
    sinon.stub(ctxMock.prototype, 'IDENT').returns([1, 2, 3])
    const visitor = new ilv()
    const input = new ctxMock()
    const output = visitor.visitImport_list(input)
    const referenceOutput = [1, 2, 3]
    as.deepEqual(output.identifier_list, referenceOutput, 'expected value for "identifier_list: ' + referenceOutput + ' ; actual value for "identifier_list": ' + output.identifier_list)
  })
})
mo.describe('testing StatementVisitor.js', function () {
  mo.describe('testing visitStatement(ctx)', function () {
    mo.it('testing assignment_statement (component_reference + value)', function () {
      sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((c) => c)
      sinon.stub(ev.prototype, 'visitExpression').callsFake((e) => e)
      sinon.stub(fcav.prototype, 'visitFunction_call_args').callsFake((a) => a)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      const visitor = new sv()
      const input = new ctxMock()
      const output = visitor.visitStatement(input)
      as.notDeepEqual(output.assignment_statement, null, 'expected assignment_statement to be set ; actual: ' + output.assignment_statement)
      as.deepEqual(output.function_call_statement, null, 'expected function_call_statement null ; actual: ' + output.function_call_statement)
      as.deepEqual(output.assignment_with_function_call_statement, null, 'expected assignment_with_function_call_statement null ; actual: ' + output.assignment_with_function_call_statement)
    })
    mo.it('testing assignment_with_function_call_statement (component_reference + function_call_args + output_expression_list)', function () {
      sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((c) => c)
      sinon.stub(fcav.prototype, 'visitFunction_call_args').callsFake((a) => a)
      sinon.stub(oelv.prototype, 'visitOutput_expression_list').callsFake((o) => o)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'output_expression_list').returns('mocked output_expression_list')
      const visitor = new sv()
      const input = new ctxMock()
      const output = visitor.visitStatement(input)
      as.notDeepEqual(output.assignment_with_function_call_statement, null, 'expected assignment_with_function_call_statement to be set ; actual: ' + output.assignment_with_function_call_statement)
      as.deepEqual(output.assignment_statement, null, 'expected assignment_statement null ; actual: ' + output.assignment_statement)
      as.deepEqual(output.function_call_statement, null, 'expected function_call_statement null ; actual: ' + output.function_call_statement)
    })
    mo.it('testing function_call_statement (component_reference + function_call_args, no value)', function () {
      sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((c) => c)
      sinon.stub(fcav.prototype, 'visitFunction_call_args').callsFake((a) => a)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      const visitor = new sv()
      const input = new ctxMock()
      const output = visitor.visitStatement(input)
      as.notDeepEqual(output.function_call_statement, null, 'expected function_call_statement to be set ; actual: ' + output.function_call_statement)
      as.deepEqual(output.assignment_statement, null, 'expected assignment_statement null ; actual: ' + output.assignment_statement)
      as.deepEqual(output.assignment_with_function_call_statement, null, 'expected assignment_with_function_call_statement null ; actual: ' + output.assignment_with_function_call_statement)
    })
    mo.it('testing if_statement branch', function () {
      sinon.stub(ctxMock.prototype, 'component_reference').returns(null)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'function_call_args').returns(null)
      sinon.stub(ctxMock.prototype, 'if_statement').returns('mocked if_statement')
      sinon.stub(ifsv.prototype, 'visitIf_statement').callsFake((s) => s)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      const visitor = new sv()
      const input = new ctxMock()
      const output = visitor.visitStatement(input)
      as.deepEqual(output.if_statement, 'mocked if_statement', 'expected: mocked if_statement ; actual: ' + output.if_statement)
    })
    mo.it('testing for_statement branch', function () {
      sinon.stub(ctxMock.prototype, 'component_reference').returns(null)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'function_call_args').returns(null)
      sinon.stub(ctxMock.prototype, 'for_statement').returns('mocked for_statement')
      sinon.stub(fsv.prototype, 'visitFor_statement').callsFake((s) => s)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      const visitor = new sv()
      const input = new ctxMock()
      const output = visitor.visitStatement(input)
      as.deepEqual(output.for_statement, 'mocked for_statement', 'expected: mocked for_statement ; actual: ' + output.for_statement)
    })
    mo.it('testing while_statement branch', function () {
      sinon.stub(ctxMock.prototype, 'component_reference').returns(null)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'function_call_args').returns(null)
      sinon.stub(ctxMock.prototype, 'while_statement').returns('mocked while_statement')
      sinon.stub(whlV.prototype, 'visitWhile_statement').callsFake((s) => s)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      const visitor = new sv()
      const input = new ctxMock()
      const output = visitor.visitStatement(input)
      as.deepEqual(output.while_statement, 'mocked while_statement', 'expected: mocked while_statement ; actual: ' + output.while_statement)
    })
    mo.it('testing when_statement branch', function () {
      sinon.stub(ctxMock.prototype, 'component_reference').returns(null)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'function_call_args').returns(null)
      sinon.stub(ctxMock.prototype, 'when_statement').returns('mocked when_statement')
      sinon.stub(wsv.prototype, 'visitWhen_statement').callsFake((s) => s)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      const visitor = new sv()
      const input = new ctxMock()
      const output = visitor.visitStatement(input)
      as.deepEqual(output.when_statement, 'mocked when_statement', 'expected: mocked when_statement ; actual: ' + output.when_statement)
    })
    mo.it('testing is_break and is_return flags', function () {
      class ctxMockBreakReturn extends ctxMock {
        BREAK () { return true }
        RETURN () { return true }
      }
      sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((c) => c)
      sinon.stub(ev.prototype, 'visitExpression').callsFake((e) => e)
      sinon.stub(fcav.prototype, 'visitFunction_call_args').callsFake((a) => a)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      const visitor = new sv()
      const input = new ctxMockBreakReturn()
      const output = visitor.visitStatement(input)
      as.deepEqual(output.is_break, true, 'expected is_break true ; actual: ' + output.is_break)
      as.deepEqual(output.is_return, true, 'expected is_return true ; actual: ' + output.is_return)
    })
  })
})
mo.describe('testing When_equationVisitor.js', function () {
  mo.describe('testing visitWhen_equation(ctx)', function () {
    mo.it('testing when ctx.expression() and ctx.equation() are null', function () {
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'equation').returns(null)
      const visitor = new wev()
      const input = new ctxMock()
      const output = visitor.visitWhen_equation(input)
      as.deepEqual(output.when_elsewhen, undefined, 'expected when_elsewhen undefined (empty array not stored) ; actual: ' + output.when_elsewhen)
    })
    mo.it('testing when ctx.expression() and ctx.equation() return arrays', function () {
      sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
      sinon.stub(eqV.prototype, 'visitEquation').callsFake((eqn) => eqn)
      sinon.stub(ctxMock.prototype, 'expression').returns(['expr1', 'expr2'])
      sinon.stub(ctxMock.prototype, 'equation').returns(['eqn1', 'eqn2'])
      const visitor = new wev()
      const input = new ctxMock()
      const output = visitor.visitWhen_equation(input)
      as.deepEqual(output.when_elsewhen, undefined, 'expected when_elsewhen undefined (while loop does not run) ; actual: ' + output.when_elsewhen)
    })
  })
})
mo.describe('testing When_statementVisitor.js', function () {
  mo.describe('testing visitWhen_statement(ctx)', function () {
    mo.it('testing when ctx.expression() and ctx.statement() are null', function () {
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'statement').returns(null)
      const visitor = new wsv()
      const input = new ctxMock()
      const output = visitor.visitWhen_statement(input)
      as.deepEqual(output.when_elsewhen, undefined, 'expected when_elsewhen undefined (empty array not stored) ; actual: ' + output.when_elsewhen)
    })
    mo.it('testing when ctx.expression() and ctx.statement() return arrays', function () {
      sinon.stub(ev.prototype, 'visitExpression').callsFake((exp) => exp)
      sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
      sinon.stub(ctxMock.prototype, 'expression').returns(['expr1', 'expr2'])
      sinon.stub(ctxMock.prototype, 'statement').returns(['stmt1', 'stmt2'])
      const visitor = new wsv()
      const input = new ctxMock()
      const output = visitor.visitWhen_statement(input)
      as.deepEqual(output.when_elsewhen, undefined, 'expected when_elsewhen undefined (while loop does not run) ; actual: ' + output.when_elsewhen)
    })
  })
})
mo.describe('testing Logical_expressionVisitor.js', function () {
  mo.describe('testing visitLogical_expression(ctx)', function () {
    mo.it('testing when ctx.logical_term() is null', function () {
      sinon.stub(ctxMock.prototype, 'logical_term').returns(null)
      const visitor = new lev()
      const input = new ctxMock()
      const output = visitor.visitLogical_expression(input)
      as.equal(output.logical_term_list, undefined, 'expected undefined (empty list not stored) ; actual: ' + output.logical_term_list)
    })
    mo.it('testing when ctx.logical_term() returns array', function () {
      sinon.stub(ctxMock.prototype, 'logical_term').returns([1, 2])
      sinon.stub(ltv.prototype, 'visitLogical_term').callsFake((t) => t)
      const visitor = new lev()
      const input = new ctxMock()
      const output = visitor.visitLogical_expression(input)
      as.deepEqual(output.logical_term_list, [1, 2], 'expected [1,2] ; actual: ' + output.logical_term_list)
    })
  })
})
mo.describe('testing Logical_factorVisitor.js', function () {
  mo.describe('testing visitLogical_factor(ctx)', function () {
    mo.it('testing when NOT=null, relation=null', function () {
      const visitor = new lfv()
      const input = new ctxMock()
      const output = visitor.visitLogical_factor(input)
      as.equal(output.not, false, 'expected not=false ; actual: ' + output.not)
      as.equal(output.relation, undefined, 'expected relation=undefined (null not stored) ; actual: ' + output.relation)
    })
    mo.it('testing when NOT=true, relation present', function () {
      sinon.stub(ctxMock.prototype, 'NOT').returns(true)
      sinon.stub(ctxMock.prototype, 'relation').returns('mocked relation')
      sinon.stub(relV.prototype, 'visitRelation').callsFake((r) => r)
      const visitor = new lfv()
      const input = new ctxMock()
      const output = visitor.visitLogical_factor(input)
      as.equal(output.not, true, 'expected not=true ; actual: ' + output.not)
      as.equal(output.relation, 'mocked relation', 'expected relation=mocked relation ; actual: ' + output.relation)
    })
  })
})
mo.describe('testing Logical_termVisitor.js', function () {
  mo.describe('testing visitLogical_term(ctx)', function () {
    mo.it('testing when ctx.logical_factor() is null', function () {
      const visitor = new ltv()
      const input = new ctxMock()
      const output = visitor.visitLogical_term(input)
      as.equal(output.logical_factor_list, undefined, 'expected undefined (empty list not stored) ; actual: ' + output.logical_factor_list)
    })
    mo.it('testing when ctx.logical_factor() returns array', function () {
      sinon.stub(ctxMock.prototype, 'logical_factor').returns([1, 2])
      sinon.stub(lfv.prototype, 'visitLogical_factor').callsFake((f) => f)
      const visitor = new ltv()
      const input = new ctxMock()
      const output = visitor.visitLogical_term(input)
      as.deepEqual(output.logical_factor_list, [1, 2], 'expected [1,2] ; actual: ' + output.logical_factor_list)
    })
  })
})
mo.describe('testing Long_class_specifierVisitor.js', function () {
  mo.describe('testing visitLong_class_specifier(ctx)', function () {
    mo.it('testing basic case without EXTENDS', function () {
      sinon.stub(scv.prototype, 'visitString_comment').callsFake((s) => s)
      sinon.stub(compV.prototype, 'visitComposition').callsFake((c) => c)
      sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((c) => c)
      const visitor = new lcsv()
      const input = new ctxMock()
      const output = visitor.visitLong_class_specifier(input)
      as.equal(output.identifier, 'mocked identifier', 'expected mocked identifier ; actual: ' + output.identifier)
      as.equal(output.is_extends, false, 'expected is_extends=false ; actual: ' + output.is_extends)
    })
    mo.it('testing with EXTENDS=true', function () {
      sinon.stub(ctxMock.prototype, 'EXTENDS').returns(true)
      sinon.stub(scv.prototype, 'visitString_comment').callsFake((s) => s)
      sinon.stub(compV.prototype, 'visitComposition').callsFake((c) => c)
      sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((c) => c)
      const visitor = new lcsv()
      const input = new ctxMock()
      const output = visitor.visitLong_class_specifier(input)
      as.equal(output.is_extends, true, 'expected is_extends=true ; actual: ' + output.is_extends)
    })
  })
})
mo.describe('testing ModificationVisitor.js', function () {
  mo.describe('testing visitModification(ctx)', function () {
    mo.it('testing with SYMBOL_EQUAL=true', function () {
      sinon.stub(ctxMock.prototype, 'SYMBOL_EQUAL').returns(true)
      sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((c) => c)
      sinon.stub(ev.prototype, 'visitExpression').callsFake((e) => e)
      const visitor = new mv()
      const input = new ctxMock()
      const output = visitor.visitModification(input)
      as.equal(output.equal, true, 'expected equal=true ; actual: ' + output.equal)
      as.equal(output.colon_equal, false, 'expected colon_equal=false ; actual: ' + output.colon_equal)
    })
    mo.it('testing with SYMBOL_COLONEQUAL=true', function () {
      sinon.stub(ctxMock.prototype, 'SYMBOL_COLONEQUAL').returns(true)
      sinon.stub(ctxMock.prototype, 'class_modification').returns(null)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      const visitor = new mv()
      const input = new ctxMock()
      const output = visitor.visitModification(input)
      as.equal(output.equal, false, 'expected equal=false ; actual: ' + output.equal)
      as.equal(output.colon_equal, true, 'expected colon_equal=true ; actual: ' + output.colon_equal)
    })
  })
})
mo.describe('testing NameVisitor.js', function () {
  mo.describe('testing visitName(ctx)', function () {
    mo.it('testing single identifier (no dot)', function () {
      class nameCtxMock {
        SYMBOL_DOT () { return [] }
        IDENT () { return [new getTextClass('foo')] }
      }
      const visitor = new nv()
      const output = visitor.visitName(new nameCtxMock())
      as.equal(output.name_parts.length, 1, 'expected 1 name_part ; actual: ' + output.name_parts.length)
      as.equal(output.name_parts[0].dot_op, false, 'expected dot_op=false ; actual: ' + output.name_parts[0].dot_op)
      as.equal(output.name_parts[0].identifier, 'foo', 'expected foo ; actual: ' + output.name_parts[0].identifier)
    })
    mo.it('testing leading dot (dot count equals ident count)', function () {
      class nameCtxMock {
        SYMBOL_DOT () { return [new getTextClass('.')] }
        IDENT () { return [new getTextClass('foo')] }
      }
      const visitor = new nv()
      const output = visitor.visitName(new nameCtxMock())
      as.equal(output.name_parts[0].dot_op, true, 'expected dot_op=true ; actual: ' + output.name_parts[0].dot_op)
    })
    mo.it('testing dotted path (foo.bar)', function () {
      class nameCtxMock {
        SYMBOL_DOT () { return [new getTextClass('.')] }
        IDENT () { return [new getTextClass('foo'), new getTextClass('bar')] }
      }
      const visitor = new nv()
      const output = visitor.visitName(new nameCtxMock())
      as.equal(output.name_parts.length, 2, 'expected 2 name_parts ; actual: ' + output.name_parts.length)
      as.equal(output.name_parts[0].identifier, 'foo', 'expected foo ; actual: ' + output.name_parts[0].identifier)
      as.equal(output.name_parts[1].identifier, 'bar', 'expected bar ; actual: ' + output.name_parts[1].identifier)
    })
  })
})
mo.describe('testing Named_argumentVisitor.js', function () {
  mo.describe('testing visitNamed_argument(ctx)', function () {
    mo.it('testing with IDENT and function_argument', function () {
      sinon.stub(funcAV.prototype, 'visitFunction_argument').callsFake((a) => a)
      const visitor = new navV()
      const input = new ctxMock()
      const output = visitor.visitNamed_argument(input)
      as.equal(output.identifier, 'mocked identifier', 'expected mocked identifier ; actual: ' + output.identifier)
      as.equal(output.value, 'mocked function_argument', 'expected mocked function_argument ; actual: ' + output.value)
    })
    mo.it('testing with IDENT=null, function_argument=null', function () {
      sinon.stub(ctxMock.prototype, 'IDENT').returns(null)
      sinon.stub(ctxMock.prototype, 'function_argument').returns(null)
      const visitor = new navV()
      const input = new ctxMock()
      const output = visitor.visitNamed_argument(input)
      as.equal(output.identifier, undefined, 'expected undefined (empty string not stored) ; actual: ' + output.identifier)
      as.equal(output.value, undefined, 'expected undefined (null not stored) ; actual: ' + output.value)
    })
  })
})
mo.describe('testing Named_argumentsVisitor.js', function () {
  mo.describe('testing visitNamed_arguments(ctx)', function () {
    mo.it('testing without recursion', function () {
      sinon.stub(ctxMock.prototype, 'named_arguments').returns(null)
      sinon.stub(navV.prototype, 'visitNamed_argument').callsFake((a) => a)
      const visitor = new namedArgsV()
      const input = new ctxMock()
      const output = visitor.visitNamed_arguments(input)
      as.equal(output.named_argument, 'mocked named_argument', 'expected mocked named_argument ; actual: ' + output.named_argument)
      as.equal(output.named_arguments, undefined, 'expected undefined (null not stored) ; actual: ' + output.named_arguments)
    })
    mo.it('testing with recursive named_arguments', function () {
      class namedArgsCtx {
        named_arguments () { return null }
        named_argument () { return null }
      }
      sinon.stub(ctxMock.prototype, 'named_arguments').returns(new namedArgsCtx())
      sinon.stub(navV.prototype, 'visitNamed_argument').callsFake((a) => a)
      const visitor = new namedArgsV()
      const input = new ctxMock()
      const output = visitor.visitNamed_arguments(input)
      as.notEqual(output.named_arguments, null, 'expected nested named_arguments to be set')
    })
  })
})
mo.describe('testing Output_expression_listVisitor.js', function () {
  mo.describe('testing visitOutput_expression_list(ctx)', function () {
    mo.it('testing with null expression', function () {
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      const visitor = new oelv()
      const input = new ctxMock()
      const output = visitor.visitOutput_expression_list(input)
      as.equal(output.output_expressions, undefined, 'expected undefined (empty array not stored) ; actual: ' + output.output_expressions)
    })
    mo.it('testing with expression array', function () {
      sinon.stub(ctxMock.prototype, 'expression').returns(['e1', 'e2'])
      sinon.stub(ev.prototype, 'visitExpression').callsFake((e) => e)
      const visitor = new oelv()
      const input = new ctxMock()
      const output = visitor.visitOutput_expression_list(input)
      as.deepEqual(output.output_expressions, ['e1', 'e2'], 'expected [e1,e2] ; actual: ' + output.output_expressions)
    })
  })
})
mo.describe('testing PrimaryVisitor.js', function () {
  mo.describe('testing visitPrimary(ctx)', function () {
    mo.it('testing minimal primary (all null)', function () {
      sinon.stub(ctxMock.prototype, 'name').returns(null)
      sinon.stub(ctxMock.prototype, 'function_call_args').returns(null)
      sinon.stub(ctxMock.prototype, 'component_reference').returns(null)
      sinon.stub(ctxMock.prototype, 'expression_list').returns(null)
      sinon.stub(ctxMock.prototype, 'function_arguments').returns(null)
      const visitor = new pv()
      const input = new ctxMock()
      const output = visitor.visitPrimary(input)
      as.equal(output.unsigned_number, null, 'expected null ; actual: ' + output.unsigned_number)
      as.equal(output.is_false, false, 'expected false ; actual: ' + output.is_false)
      as.equal(output.is_true, false, 'expected false ; actual: ' + output.is_true)
      as.equal(output.component_reference, null, 'expected null ; actual: ' + output.component_reference)
    })
    mo.it('testing with UNSIGNED_NUMBER and is_true', function () {
      sinon.stub(ctxMock.prototype, 'UNSIGNED_NUMBER').returns(new getTextClass('3.14'))
      sinon.stub(ctxMock.prototype, 'TRUE').returns(true)
      sinon.stub(ctxMock.prototype, 'name').returns(null)
      sinon.stub(ctxMock.prototype, 'function_call_args').returns(null)
      sinon.stub(ctxMock.prototype, 'component_reference').returns(null)
      sinon.stub(ctxMock.prototype, 'expression_list').returns(null)
      sinon.stub(ctxMock.prototype, 'function_arguments').returns(null)
      const visitor = new pv()
      const input = new ctxMock()
      const output = visitor.visitPrimary(input)
      as.equal(output.unsigned_number, 3.14, 'expected 3.14 ; actual: ' + output.unsigned_number)
      as.equal(output.is_true, true, 'expected true ; actual: ' + output.is_true)
    })
    mo.it('testing with component_reference', function () {
      sinon.stub(ctxMock.prototype, 'name').returns(null)
      sinon.stub(ctxMock.prototype, 'function_call_args').returns(null)
      sinon.stub(ctxMock.prototype, 'component_reference').returns('mocked_cref')
      sinon.stub(ctxMock.prototype, 'expression_list').returns(null)
      sinon.stub(ctxMock.prototype, 'function_arguments').returns(null)
      sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((c) => c)
      const visitor = new pv()
      const input = new ctxMock()
      const output = visitor.visitPrimary(input)
      as.equal(output.component_reference, 'mocked_cref', 'expected mocked_cref ; actual: ' + output.component_reference)
    })
  })
})
mo.describe('testing Rel_opVisitor.js', function () {
  mo.describe('testing visitRel_op(ctx)', function () {
    mo.it('testing with ctx', function () {
      const visitor = new ropv()
      const output = visitor.visitRel_op(new getTextClass('<'))
      as.equal(output, '<', 'expected < ; actual: ' + output)
    })
    mo.it('testing with null ctx', function () {
      const visitor = new ropv()
      const output = visitor.visitRel_op(null)
      as.equal(output, '', 'expected empty string ; actual: ' + output)
    })
  })
})
mo.describe('testing RelationVisitor.js', function () {
  mo.describe('testing visitRelation(ctx)', function () {
    mo.it('testing with 0 arithmetic_expressions', function () {
      const visitor = new relV()
      const input = new ctxMock()
      const output = visitor.visitRelation(input)
      as.equal(output.arithmetic_expression1, null, 'expected null ; actual: ' + output.arithmetic_expression1)
      as.equal(output.arithmetic_expression2, null, 'expected null ; actual: ' + output.arithmetic_expression2)
    })
    mo.it('testing with 1 arithmetic_expression', function () {
      sinon.stub(ctxMock.prototype, 'arithmetic_expression').returns(['ae1'])
      sinon.stub(vae.prototype, 'visitArithmetic_expression').callsFake((e) => e)
      const visitor = new relV()
      const input = new ctxMock()
      const output = visitor.visitRelation(input)
      as.equal(output.arithmetic_expression1, 'ae1', 'expected ae1 ; actual: ' + output.arithmetic_expression1)
      as.equal(output.arithmetic_expression2, null, 'expected null ; actual: ' + output.arithmetic_expression2)
    })
    mo.it('testing with 2 arithmetic_expressions and rel_op', function () {
      sinon.stub(ctxMock.prototype, 'arithmetic_expression').returns(['ae1', 'ae2'])
      sinon.stub(vae.prototype, 'visitArithmetic_expression').callsFake((e) => e)
      sinon.stub(ctxMock.prototype, 'rel_op').returns(new getTextClass('<'))
      sinon.stub(ropv.prototype, 'visitRel_op').callsFake((r) => r.getText())
      const visitor = new relV()
      const input = new ctxMock()
      const output = visitor.visitRelation(input)
      as.equal(output.arithmetic_expression1, 'ae1', 'expected ae1 ; actual: ' + output.arithmetic_expression1)
      as.equal(output.arithmetic_expression2, 'ae2', 'expected ae2 ; actual: ' + output.arithmetic_expression2)
      as.equal(output.rel_op, '<', 'expected < ; actual: ' + output.rel_op)
    })
  })
})
mo.describe('testing Short_class_definitionVisitor.js', function () {
  mo.describe('testing visitShort_class_definition(ctx)', function () {
    mo.it('testing with class_prefixes and short_class_specifier', function () {
      sinon.stub(ctxMock.prototype, 'short_class_specifier').returns('mocked short_class_specifier')
      sinon.stub(cpv.prototype, 'visitClass_prefixes').callsFake((c) => c)
      sinon.stub(scsv.prototype, 'visitShort_class_specifier').callsFake((s) => s)
      const visitor = new scdv()
      const input = new ctxMock()
      const output = visitor.visitShort_class_definition(input)
      as.equal(output.class_prefixes, 'mocked class_prefixes', 'expected mocked class_prefixes ; actual: ' + output.class_prefixes)
      as.equal(output.short_class_specifier, 'mocked short_class_specifier', 'expected mocked short_class_specifier ; actual: ' + output.short_class_specifier)
    })
  })
})
mo.describe('testing Short_class_specifierVisitor.js', function () {
  mo.describe('testing visitShort_class_specifier(ctx)', function () {
    mo.it('testing basic case with IDENT and name', function () {
      sinon.stub(bpv.prototype, 'visitBase_prefix').callsFake((b) => b)
      sinon.stub(nv.prototype, 'visitName').callsFake((n) => n)
      sinon.stub(asv.prototype, 'visitArray_subscripts').callsFake((a) => a)
      sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((c) => c)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      sinon.stub(enumListV.prototype, 'visitEnum_list').callsFake((e) => e)
      const visitor = new scsv()
      const input = new ctxMock()
      const output = visitor.visitShort_class_specifier(input)
      as.equal(output.identifier, 'mocked identifier', 'expected mocked identifier ; actual: ' + output.identifier)
      as.notEqual(output.short_class_specifier_value, null, 'expected short_class_specifier_value to be set')
    })
    mo.it('testing with null IDENT', function () {
      sinon.stub(ctxMock.prototype, 'IDENT').returns(null)
      sinon.stub(bpv.prototype, 'visitBase_prefix').callsFake((b) => b)
      sinon.stub(nv.prototype, 'visitName').callsFake((n) => n)
      sinon.stub(asv.prototype, 'visitArray_subscripts').callsFake((a) => a)
      sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((c) => c)
      sinon.stub(cv.prototype, 'visitComment').callsFake((c) => c)
      sinon.stub(enumListV.prototype, 'visitEnum_list').callsFake((e) => e)
      const visitor = new scsv()
      const input = new ctxMock()
      const output = visitor.visitShort_class_specifier(input)
      as.equal(output.identifier, undefined, 'expected undefined (empty string not stored) ; actual: ' + output.identifier)
    })
  })
})
mo.describe('testing Simple_expressionVisitor.js', function () {
  mo.describe('testing visitSimple_expression(ctx)', function () {
    mo.it('testing with 1 logical_expression', function () {
      sinon.stub(ctxMock.prototype, 'logical_expression').returns(['le1'])
      sinon.stub(lev.prototype, 'visitLogical_expression').callsFake((e) => e)
      const visitor = new sev()
      const input = new ctxMock()
      const output = visitor.visitSimple_expression(input)
      as.equal(output.logical_expression1, 'le1', 'expected le1 ; actual: ' + output.logical_expression1)
      as.equal(output.logical_expression2, null, 'expected null ; actual: ' + output.logical_expression2)
      as.equal(output.logical_expression3, null, 'expected null ; actual: ' + output.logical_expression3)
    })
    mo.it('testing with 3 logical_expressions', function () {
      sinon.stub(ctxMock.prototype, 'logical_expression').returns(['le1', 'le2', 'le3'])
      sinon.stub(lev.prototype, 'visitLogical_expression').callsFake((e) => e)
      const visitor = new sev()
      const input = new ctxMock()
      const output = visitor.visitSimple_expression(input)
      as.equal(output.logical_expression1, 'le1', 'expected le1 ; actual: ' + output.logical_expression1)
      as.equal(output.logical_expression2, 'le2', 'expected le2 ; actual: ' + output.logical_expression2)
      as.equal(output.logical_expression3, 'le3', 'expected le3 ; actual: ' + output.logical_expression3)
    })
  })
})
mo.describe('testing Stored_definitionVisitor.js', function () {
  mo.describe('testing visitStored_definition(ctx)', function () {
    mo.it('testing with no name and no children', function () {
      sinon.stub(ctxMock.prototype, 'name').returns(null)
      const visitor = new sdv()
      const input = new ctxMock()
      const output = visitor.visitStored_definition(input)
      as.equal(output.within, undefined, 'expected undefined (empty string not stored) ; actual: ' + output.within)
      as.equal(output.final_class_definitions, undefined, 'expected undefined (empty array not stored)')
    })
    mo.it('testing with Class_definitionContext child', function () {
      const { modelicaParser } = require('../jsParser/antlrFiles/modelicaParser')
      const cdChild = Object.create(modelicaParser.Class_definitionContext.prototype)
      sinon.stub(ctxMock.prototype, 'name').returns(null)
      sinon.stub(ctxMock.prototype, 'children').get(() => [cdChild])
      sinon.stub(cdv.prototype, 'visitClass_definition').callsFake((c) => c)
      const visitor = new sdv()
      const input = new ctxMock()
      const output = visitor.visitStored_definition(input)
      as.equal(output.final_class_definitions.length, 1, 'expected 1 entry ; actual: ' + output.final_class_definitions.length)
      as.equal(output.final_class_definitions[0].is_final, false, 'expected is_final=false ; actual: ' + output.final_class_definitions[0].is_final)
    })
  })
})
mo.describe('testing String_commentVisitor.js', function () {
  mo.describe('testing visitString_comment(ctx)', function () {
    mo.it('testing with null STRING', function () {
      const visitor = new scv()
      const input = new ctxMock()
      const output = visitor.visitString_comment(input)
      as.equal(output, '', 'expected empty string ; actual: ' + output)
    })
    mo.it('testing with single STRING', function () {
      sinon.stub(ctxMock.prototype, 'STRING').returns([new getTextClass('"hello"')])
      const visitor = new scv()
      const input = new ctxMock()
      const output = visitor.visitString_comment(input)
      as.equal(output, '"hello"', 'expected "hello" ; actual: ' + output)
    })
    mo.it('testing with multiple STRINGs', function () {
      sinon.stub(ctxMock.prototype, 'STRING').returns([new getTextClass('"a"'), new getTextClass('"b"')])
      const visitor = new scv()
      const input = new ctxMock()
      const output = visitor.visitString_comment(input)
      as.equal(output, '"a"+"b"', 'expected "a"+"b" ; actual: ' + output)
    })
  })
})
mo.describe('testing SubscriptVisitor.js', function () {
  mo.describe('testing visitSubscript(ctx)', function () {
    mo.it('testing with SYMBOL_COLON (range operator)', function () {
      sinon.stub(ctxMock.prototype, 'SYMBOL_COLON').returns(true)
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      const visitor = new subV()
      const input = new ctxMock()
      const output = visitor.visitSubscript(input)
      as.equal(output.colon_op, true, 'expected color_op=true ; actual: ' + output.colon_op)
      as.equal(output.expression, null, 'expected null ; actual: ' + output.expression)
    })
    mo.it('testing with expression, no SYMBOL_COLON', function () {
      sinon.stub(ev.prototype, 'visitExpression').callsFake((e) => e)
      const visitor = new subV()
      const input = new ctxMock()
      const output = visitor.visitSubscript(input)
      as.equal(output.colon_op, false, 'expected color_op=false ; actual: ' + output.colon_op)
      as.equal(output.expression, 'mocked expression', 'expected mocked expression ; actual: ' + output.expression)
    })
  })
})
mo.describe('testing TermVisitor.js', function () {
  mo.describe('testing visitTerm(ctx)', function () {
    mo.it('testing with mul_ops and factors', function () {
      sinon.stub(ctxMock.prototype, 'mul_op').returns([new getTextClass('*'), new getTextClass('/.')])
      sinon.stub(ctxMock.prototype, 'factor').returns([1, 2, 3])
      sinon.stub(fv.prototype, 'visitFactor').callsFake((f) => f)
      const visitor = new tv()
      const input = new ctxMock()
      const output = visitor.visitTerm(input)
      as.deepEqual(output.mul_ops, ['*', '/.'], 'expected [*,/.] ; actual: ' + output.mul_ops)
      as.deepEqual(output.factors, [1, 2, 3], 'expected [1,2,3] ; actual: ' + output.factors)
    })
    mo.it('testing with empty mul_op and factor', function () {
      const visitor = new tv()
      const input = new ctxMock()
      const output = visitor.visitTerm(input)
      as.equal(output.mul_ops, undefined, 'expected undefined (empty array not stored) ; actual: ' + output.mul_ops)
      as.equal(output.factors, undefined, 'expected undefined (empty array not stored) ; actual: ' + output.factors)
    })
  })
})
mo.describe('testing Type_prefixVisitor.js', function () {
  mo.describe('testing visitType_prefix(ctx)', function () {
    mo.it('testing all null returns empty string', function () {
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, '', 'expected empty string ; actual: ' + output)
    })
    mo.it('testing FLOW only', function () {
      sinon.stub(ctxMock.prototype, 'FLOW').returns(new getTextClass('flow'))
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, 'flow', 'expected flow ; actual: ' + output)
    })
    mo.it('testing STREAM only', function () {
      sinon.stub(ctxMock.prototype, 'STREAM').returns(new getTextClass('stream'))
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, 'stream', 'expected stream ; actual: ' + output)
    })
    mo.it('testing PARAMETER only', function () {
      sinon.stub(ctxMock.prototype, 'PARAMETER').returns(new getTextClass('parameter'))
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, 'parameter', 'expected parameter ; actual: ' + output)
    })
    mo.it('testing INPUT only', function () {
      sinon.stub(ctxMock.prototype, 'INPUT').returns(new getTextClass('input'))
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, 'input', 'expected input ; actual: ' + output)
    })
    mo.it('testing FLOW + INPUT', function () {
      sinon.stub(ctxMock.prototype, 'FLOW').returns(new getTextClass('flow'))
      sinon.stub(ctxMock.prototype, 'INPUT').returns(new getTextClass('input'))
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, 'flow input', 'expected flow input ; actual: ' + output)
    })
    mo.it('testing DISCRETE only', function () {
      sinon.stub(ctxMock.prototype, 'DISCRETE').returns(new getTextClass('discrete'))
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, 'discrete', 'expected discrete ; actual: ' + output)
    })
    mo.it('testing OUTPUT only', function () {
      sinon.stub(ctxMock.prototype, 'OUTPUT').returns(new getTextClass('output'))
      const visitor = new tpv()
      const input = new ctxMock()
      const output = visitor.visitType_prefix(input)
      as.equal(output, 'output', 'expected output ; actual: ' + output)
    })
  })
})
mo.describe('testing Type_specifierVisitor.js', function () {
  mo.describe('testing visitType_specifier(ctx)', function () {
    mo.it('testing with name', function () {
      sinon.stub(nv.prototype, 'visitName').callsFake((n) => n)
      const visitor = new tsv()
      const input = new ctxMock()
      const output = visitor.visitType_specifier(input)
      as.equal(output.name, 'mocked name', 'expected mocked name ; actual: ' + output.name)
    })
    mo.it('testing with null name', function () {
      sinon.stub(ctxMock.prototype, 'name').returns(null)
      const visitor = new tsv()
      const input = new ctxMock()
      const output = visitor.visitType_specifier(input)
      as.equal(output.name, null, 'expected null ; actual: ' + output.name)
    })
  })
})
mo.describe('testing While_statementVisitor.js', function () {
  mo.describe('testing visitWhile_statement(ctx)', function () {
    mo.it('testing with null expression and null statements', function () {
      sinon.stub(ctxMock.prototype, 'expression').returns(null)
      sinon.stub(ctxMock.prototype, 'statement').returns(null)
      const visitor = new whlV()
      const input = new ctxMock()
      const output = visitor.visitWhile_statement(input)
      as.equal(output.expression, undefined, 'expected undefined (null not stored) ; actual: ' + output.expression)
      as.equal(output.loop_statements, undefined, 'expected undefined (empty array not stored) ; actual: ' + output.loop_statements)
    })
    mo.it('testing with expression and statements', function () {
      sinon.stub(ev.prototype, 'visitExpression').callsFake((e) => e)
      sinon.stub(sv.prototype, 'visitStatement').callsFake((s) => s)
      const visitor = new whlV()
      const input = new ctxMock()
      const output = visitor.visitWhile_statement(input)
      as.equal(output.expression, 'mocked expression', 'expected mocked expression ; actual: ' + output.expression)
      as.deepEqual(output.loop_statements, [1, 2, 3, 4, 5], 'expected [1,2,3,4,5] ; actual: ' + output.loop_statements)
    })
  })
})
