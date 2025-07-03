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
    constructor (boolean=null, testing=null) {
        this.boolean = boolean
        this.testing = testing
    }
    INITIAL () { return this.boolean }
    statement () { return [1,2,3,4,5] }
    argument () { return [1,2,3,4,5] }
    element_modification_or_replaceable () { return "mocked element_modification_or_replaceable" }
    element_redeclaration () { return "mocked element_redeclaration" }
    add_op () { return [new getTextClass(1),new getTextClass(2)] }
    term () { return [3,4,5] }
    subscript () { return [1,2,3,4,5] }
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
    component_declaration () { return [1,2,3,4,5] }
    expression () { return 'mocked expression' }
    component_reference () { return [1,2] }
    name () { return 'mocked name' }
    class_modification () { return 'mocked class_modification' }
    IDENT () { return new getTextClass('mocked identifier') }
    modification () { return 'mocked modification' }
    element () { return [1,2,3] }
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
    enumeration_literal () { return [1,2,3] }
    equation () { return [1,2,3] }
    simple_expression () { return 'mocked simple_expression' }
    if_equation () { return 'mocked if_equation' }
    for_equation () { return 'mocked for_equation' }
    connect_clause () { return 'mocked connect_clause' }
    when_equation () { return 'mocked when_equation' }
    function_call_args () { return 'mocked function_call_args' }
    PARTIAL () {
        return this.testing == 'partial_dec' ? new getTextClass('mocked partial_dec') : false
    }
    CLASS () {
        return this.testing == 'class_dec' ? new getTextClass('mocked class_dec') : false
    }
    MODEL () {
        return this.testing == 'model_dec' ? new getTextClass('mocked model_dec') : false
    }
    BLOCK () {
        return this.testing == 'block_dec' ? new getTextClass('mocked block_dec') : false
    }
    TYPE () {
        return this.testing == 'type_dec' ? new getTextClass('mocked type_dec') : false
    }
    PACKAGE () {
        return this.testing == 'package_dec' ? new getTextClass('mocked package_dec') : false
    }
    OPERATOR () {
        return (this.testing == 'operator_dec') || (this.testing == 'record_dec') || (this.testing == 'function_dec, operator_dec, pure_dec') || (this.testing == 'function_dec, operator_dec, impure_dec')
            ? new getTextClass('mocked operator_dec') : false
    }
    RECORD () {
        return this.testing == 'record_dec' ? new getTextClass('mocked record_dec') : false
    }
    EXPANDABLE () {
        return (this.testing == 'expandable_dec') || (this.testing == 'connector_dec') ? new getTextClass('mocked expandable_dec') : false
    }
    CONNECTOR () {
        return this.testing == 'connector_dec' ? new getTextClass('mocked connector_dec') : false
    }
    PURE () {
        return (this.testing == 'function_dec, pure_dec') || (this.testing == 'function_dec, operator_dec, pure_dec') ? new getTextClass('mocked pure_dec') : false
    }
    IMPURE () {
        return (this.testing == 'function_dec, impure_dec') || (this.testing == 'function_dec, operator_dec, impure_dec') ? new getTextClass('mocked impure_dec') : false
    }
    FUNCTION () {
        return (this.testing == 'function_dec, pure_dec') || (this.testing == 'function_dec, impure_dec') || (this.testing == 'function_dec, operator_dec, impure_dec') || (this.testing == 'function_dec, operator_dec, pure_dec') ? new getTextClass('mocked function_dec') : false
    }
    long_class_specifier () {
        return this.testing == 'long_class_specifier' ? 'mocked long_class_specifier' : null
    }
    short_class_specifier () {
        return this.testing == 'short_class_specifier' ? 'mocked short_class_specifier' : null
    }
    der_class_specifier () {
        return this.testing == 'der_class_specifier' ? 'mocked der_class_specifier' : null
    }
}

mo.describe('testing Algorithm_sectionVisitor.js', function () {
    mo.describe('testing visitAlgorithm_section(ctx)', function () {
        mo.it('testing initial = true', function () {
            sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
            const visitor = new algSV()
            const input = new ctxMock(true)
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [true, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + '; actual value for "initial": ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected value for "statements": ' + referenceOutput[1] + '; actual value for "statements": ' + output.statements)
        })
        mo.it('testing initial = false', function () {
            sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
            const visitor = new algSV()
            const input = new ctxMock(false)
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [false, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + '; actual value for "initial": ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected value for "statements": ' + referenceOutput[1] + '; actual value for "statements": ' + output.statements)
        })
        mo.it('testing initial = null', function () {
            sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
            const visitor = new algSV()
            const input = new ctxMock(null)
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [false, [1,2,3,4,5]]
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
        const referenceOutput = [1,2,3,4,5]
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
        mo.it('testing when add_ops.length == (terms.length -1)', function () {
            sinon.stub(tv.prototype, 'visitTerm').callsFake((t) => t)
            const visitor = new vae()
            const input = new ctxMock()
            const output = visitor.visitArithmetic_expression(input)
            referenceOutput = [[null, 3], [1, 4], [2,5]]
            as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected value for first term: ' + referenceOutput[0] + ' ; actual value for first term: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
            as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected value for second term: ' + referenceOutput[1] + ' ; actual value for second term: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
            as.deepEqual([output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term], referenceOutput[2], 'expected value for third term: ' + referenceOutput[2] + ' ; actual value for third term: ' + [output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term]) 
        })
        mo.it('testing when add_ops.length != (terms.length -1)', function () {
            sinon.stub(tv.prototype, 'visitTerm').callsFake((t) => t)
            sinon.stub(ctxMock.prototype,'term').returns([3,4])
            const visitor = new vae()
            const input = new ctxMock()
            const output = visitor.visitArithmetic_expression(input)
            referenceOutput = [[1, 3], [2,4]]
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
        const referenceOutput = [1,2,3,4,5]
        as.deepEqual(output.subscripts,referenceOutput,'expected value for "subscripts": ' + referenceOutput + ' ; actual value for "subscripts": ' + output.subscripts)
    })
})
mo.describe('testing Base_prefixVisitor.js', function () {
    mo.it('testing visitBase_prefix(ctx)', function () {
        sinon.stub(tpv.prototype, 'visitType_prefix').callsFake((type_prefix) => type_prefix)
        const visitor = new bpv()
        const input = new ctxMock()
        const output = visitor.visitBase_prefix(input)
        const referenceOutput = 'mocked type_prefix'
        as.deepEqual(output.type_prefix,referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output.type_prefix)
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
        as.deepEqual(output.encapsulated, referenceOutput[0],'expected value for "encapsulated": ' + referenceOutput[0] + ' ; actual value for "encapsulated": ' + output.encapsulated)
        as.deepEqual(output.class_prefixes, referenceOutput[1],'expected: ' + referenceOutput[1] + ' ; actual: ' + output.class_prefixes)
        as.deepEqual(output.class_specifier, referenceOutput[2],'expected: ' + referenceOutput[2] + ' ; actual: ' + output.class_specifier)
    })
})
mo.describe('testing Class_modificationVisitor.js', function () {
    mo.it('testing visitClass_modification', function () {
        sinon.stub(alv.prototype,'visitArgument_list').callsFake((argument_list) => argument_list)
        const visitor = new cmv()
        const input = new ctxMock()
        const output = visitor.visitClass_modification(input)
        const referenceOutput = 'mocked argument_list'
        as.deepEqual(output.argument_list, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output.argument_list)
    })
})
mo.describe('testing Class_prefixesVisitor.js', function () {
    mo.describe('testing visitClass_prefixes(ctx)', function () {
        mo.it('testing partial_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'partial_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = 'mocked partial_dec '
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing class_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'class_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked class_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing model_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'model_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked model_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing record_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'record_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked operator_dec mocked record_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing block_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'block_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked block_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing connector_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'connector_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked expandable_dec mocked connector_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing type_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'type_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked type_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing package_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'package_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked package_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.describe('testing function_dec', function () {
            mo.it('testing pure_dec', function () {
                const visitor = new cpv()
                const input = new ctxMock(null, 'function_dec, pure_dec')
                const output = visitor.visitClass_prefixes(input)
                const referenceOutput = ' mocked pure_dec mocked function_dec'
                as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
            })
            mo.it('testing impure_dec', function () {
                const visitor = new cpv()
                const input = new ctxMock(null, 'function_dec, impure_dec')
                const output = visitor.visitClass_prefixes(input)
                const referenceOutput = ' mocked impure_dec mocked function_dec'
                as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
            })
            mo.it('testing with operator_dec', function () {
                const visitor = new cpv()
                const input = new ctxMock(null, 'function_dec, operator_dec, impure_dec')
                const output = visitor.visitClass_prefixes(input)
                const referenceOutput = ' mocked impure_dec mocked operator_dec mocked function_dec'
                as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
            })
        })
        mo.it('testing operator_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock(null, 'operator_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked operator_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
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
        const referenceOutput = ['mocked type_prefix','mocked type_specifier','mocked array_subscripts','mocked component_list']
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
        const referenceOutput = [1,2,3,4,5]
        as.deepEqual(output.component_declaration_list, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.component_declaration_list)
    })
})
/* Anand will write these tests
mo.describe('testing Component_referenceVisitor.js', function () {
    mo.describe('testing visitComponent_reference(ctx)', function () {
        const tn = require('antlr4/tree/Tree.js').TerminalNodeImpl
        const crp = require('../jsParser/domain/Component_reference_part.js').Component_reference_part
        mo.it('testing ', function () {
            class ctxMock {
                constructor () {
                    this.children = [new tn('')]
                }
            }
            sinon.stub(tn.prototype,'getText').returns('.')
            sinon.stub(crp, 'constructor').callsFake((dot_op, identifier, array_subscripts) => 'mocked')
            const visitor = new crv()
            const input = new ctxMock()
            const output = visitor.visitComponent_reference(input)
            const referenceOutput = new crp(true, null, null)
            as.deepEqual(output.component_reference_parts[0], referenceOutput, 'expected: ' + referenceOutput.dot_op + ' ; actual: ' + output)
        })
    })
}) */
/* Anand will write these tests
mo.describe('testing CompositionVisitor.js', function () {
    mo.describe('testing visitComposition(ctx)', function () {
        mo.it('testing ', function () {
            as.deepEqual(true, false)
        })
        
    })
}) */
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
        const referenceOutput = [1,2]
        as.deepEqual(output.from, referenceOutput[0], 'expected value for "from": ' + referenceOutput[0] + ' ; actual value for "from": ' + output.from)
        as.deepEqual(output.to, referenceOutput[1], 'expected value for "to": ' + referenceOutput[1] + ' ; actual value for "to": ' + output.to)
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
    mo.it('testing visitDer_clas_specifier(ctx)', function () {
        class ctxMockUnique {
            IDENT (x = 1) {
                if (x == 0) {
                    return new getTextClass(0)
                }
                else {
                    return [new getTextClass(0), new getTextClass(1), new getTextClass(2)]
                } 
            }
            name () {
                return 'mocked name'
            }
            comment () {
                return 'mocked comment'
            }
        }
        sinon.stub(nv.prototype,'visitName').callsFake((name) => name)
        sinon.stub(cv.prototype, 'visitComment').callsFake((comment) => comment)
        const visitor = new dcsv()
        const input = new ctxMockUnique()
        const output = visitor.visitDer_class_specifier(input)
        const referenceOutput = [0, 'mocked name', [1,2], 'mocked comment']
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
        const referenceOutput = [1,2,3]
        as.deepEqual(output.elements, referenceOutput, 'expected value for "elements": ' + referenceOutput + ' ; actual value for "elements": ' + output.elements)
    })
})
mo.describe('testing Element_modification_or_replaceableVisitor.js', function () {
    mo.describe('testing visitElement_modification_or_replaceable(ctx)', function () {
        mo.it('testing EACH & FINAL = true', function () {
            sinon.stub(emv.prototype, 'visitElement_modification').callsFake((element_modification) => element_modification)
            sinon.stub(eleRepV.prototype,'visitElement_replaceable').callsFake((element_replaceable) => element_replaceable)
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
            sinon.stub(eleRepV.prototype,'visitElement_replaceable').callsFake((element_replaceable) => element_replaceable)
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
            sinon.stub(eleRepV.prototype,'visitElement_replaceable').callsFake((element_replaceable) => element_replaceable)
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
        sinon.stub(scv.prototype,'visitString_comment').callsFake((string) => string)
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
                sinon.stub(eleRepV.prototype,'visitElement_replaceable').callsFake((element) => element)
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
                sinon.stub(eleRepV.prototype,'visitElement_replaceable').callsFake((element) => element)
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
                sinon.stub(eleRepV.prototype,'visitElement_replaceable').callsFake((element) => element)
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
                sinon.stub(cdv.prototype,'visitClass_definition').callsFake((class_definition) => class_definition)
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
        })
    })
})
mo.describe('testing Enum_listVisitor.js', function () {
    mo.it('testing visitEnum_list(ctx)', function () {
        sinon.stub(enumLitV.prototype,'visitEnumeration_literal').callsFake((enumeration_literal) => enumeration_literal)
        const visitor = new enumListV()
        const input = new ctxMock()
        const output = visitor.visitEnum_list(input)
        const referenceOutput = [1,2,3]
        as.deepEqual(output.enumeration_literal_list, referenceOutput, 'expected value for "enumeration_literal_list": ' + referenceOutput + ' ; actual value for "enumeration_literal_list": ' + output.enumeration_literal_list)
    })
})
mo.describe('testing Enumeration_literalVisitor.js', function () {
    mo.it('testing visitEnumeration_literal(ctx)', function () {
        sinon.stub(cv.prototype,'visitComment').callsFake((comment) => comment)
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
                const referenceOutput = [true, [1,2,3]]
                as.deepEqual(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + ' ; actual value for "initial": ' + output.initial)
                as.deepEqual(output.equations, referenceOutput[1], 'expected value for "equations": ' + referenceOutput[1] + ' ; actual value for "equations": ' + output.equations)
            })
            mo.it('testing when false', function () {
                sinon.stub(eqV.prototype, 'visitEquation').callsFake((eqn) => eqn)
                const visitor = new esv()
                const input = new ctxMock(false)
                const output = visitor.visitEquation_section(input)
                const referenceOutput = [false, [1,2,3]]
                as.deepEqual(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + ' ; actual value for "initial": ' + output.initial)
                as.deepEqual(output.equations, referenceOutput[1], 'expected value for "equations": ' + referenceOutput[1] + ' ; actual value for "equations": ' + output.equations)
            })
            mo.it('testing when null', function () {
                sinon.stub(eqV.prototype, 'visitEquation').callsFake((eqn) => eqn)
                const visitor = new esv()
                const input = new ctxMock(null)
                const output = visitor.visitEquation_section(input)
                const referenceOutput = [false, [1,2,3]]
                as.deepEqual(output.initial, referenceOutput[0], 'expected value for "initial": ' + referenceOutput[0] + ' ; actual value for "initial": ' + output.initial)
                as.deepEqual(output.equations, referenceOutput[1], 'expected value for "equations": ' + referenceOutput[1] + ' ; actual value for "equations": ' + output.equations)
            })
        })
    })
})
mo.describe('testing EquationVisitor.js', function () {
    mo.it('testing visitEquation(ctx)', function () {
        sinon.stub(sev.prototype,'visitSimple_expression').callsFake((exp) => exp)
        sinon.stub(ev.prototype,'visitExpression').callsFake((exp) => exp)
        sinon.stub(iev.prototype,'visitIf_equation').callsFake((eqn) => eqn)
        sinon.stub(fev.prototype,'visitFor_equation').callsFake((eqn) => eqn)
        sinon.stub(connCV.prototype,'visitConnect_clause').callsFake((clause) => clause)
        sinon.stub(wev.prototype,'visitWhen_equation').callsFake((eqn) => eqn)
        sinon.stub(nv.prototype,'visitName').callsFake((name) => name)
        sinon.stub(fcav.prototype,'visitFunction_call_args').callsFake((args) => args)
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