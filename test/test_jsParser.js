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

mo.afterEach(() => {
  sinon.restore()
})

mo.describe('testing Algorithm_sectionVisitor.js', function () {
    mo.describe('testing visitAlgorithm_section(ctx)', function () {
        mo.it('testing initial = true', function () {
            class ctxMockTrue {
                INITIAL () {
                    return true
                }
                statement () {
                    return [1,2,3,4,5]
                }
            }
            sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
            const visitor = new algSV()
            const input = new ctxMockTrue()
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [true, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected initial value: ' + referenceOutput[0] + '; actual initial value: ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected statements value: ' + referenceOutput[1] + '; actual statements value: ' + output.statements)
        })
        mo.it('testing initial = false', function () {
            class ctxMockFalse {
                INITIAL () {
                    return false
                }
                statement () {
                    return [1,2,3,4,5]
                }
            }
            sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
            const visitor = new algSV()
            const input = new ctxMockFalse()
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [false, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected initial value: ' + referenceOutput[0] + '; actual initial value: ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected statements value: ' + referenceOutput[1] + '; actual statement value: ' + output.statements)
        })
        mo.it('testing initial = null', function () {
                class ctxMockNull {
                INITIAL () {
                    return null
                }
                statement () {
                    return [1,2,3,4,5]
                }
            }
            sinon.stub(sv.prototype, 'visitStatement').callsFake((stmt) => stmt)
            const visitor = new algSV()
            const input = new ctxMockNull()
            const output = visitor.visitAlgorithm_section(input)
            const referenceOutput = [false, [1,2,3,4,5]]
            as.equal(output.initial, referenceOutput[0], 'expected initial value: ' + referenceOutput[0] + '; actual initial value: ' + output.initial)
            as.deepEqual(output.statements, referenceOutput[1], 'expected statements value: ' + referenceOutput[1] + '; actual statements value: ' + output.statements)
        })
    })

})
mo.describe('testing AnnotationVisitor.js', function () {
    mo.it('testing visitAnnotation(ctx)', function () {
        class ctxMock {
            class_modification () {
                return 'mocked class modifier'
            }
        }
        sinon.stub(cmv.prototype, 'visitClass_modification').callsFake((class_modification) => class_modification)
        const visitor = new annV()
        const input = new ctxMock()
        const output = visitor.visitAnnotation(input)
        const referenceOutput = 'mocked class modifier'
        as.deepEqual(output.class_modification, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.class_modification)
    })
})
mo.describe('testing Argument_listVisitor.js', function () {
    mo.it('testing visitArgument_list(ctx)', function () {
        class ctxMock {
            argument () {
                return [1,2,3,4,5]
            }
        }
        sinon.stub(argV.prototype, 'visitArgument').callsFake((arg) => arg)
        const visitor = new alv()
        const input = new ctxMock()
        const output = visitor.visitArgument_list(input)
        const referenceOutput = [1,2,3,4,5]
        as.deepEqual(output.args, referenceOutput, 'expected args value: ' + referenceOutput + ' ; actual args value: ' + output.args)
    })
})
mo.describe('testing ArgumentVisitor.js', function () {
    mo.it('testing visitArgument(ctx)', function () {
        class ctxMock {
            element_modification_or_replaceable () {
                return "mocked element_modification_or_replaceable"
            }
            element_redeclaration () {
                return "mocked element_redeclaration"
            }
        }
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
        class addMock {
            constructor (n) {
                this.n = n
            }
            getText () {
                return this.n
            }
        }
        mo.it('testing when add_ops.length == (terms.length -1)', function () {
            class ctxMock {
                add_op () {
                    return [new addMock(1),new addMock(2)]
                }
                term () {
                    return [3,4,5]
                }
            }
            sinon.stub(tv.prototype, 'visitTerm').callsFake((t) => t)
            const visitor = new vae()
            const input = new ctxMock()
            const output = visitor.visitArithmetic_expression(input)
            referenceOutput = [[null, 3], [1, 4], [2,5]]
            as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected first term value: ' + referenceOutput[0] + ' ; actual first term value: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
            as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected second term value: ' + referenceOutput[1] + ' ; actual second term value: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
            as.deepEqual([output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term], referenceOutput[2], 'expected third term value: ' + referenceOutput[2] + ' ; actual third term value: ' + [output.arithmetic_term_list[2].add_op, output.arithmetic_term_list[2].term]) 
        })
        mo.it('testing when add_ops.length != (terms.length -1)', function () {
            class ctxMock {
                add_op () {
                    return [new addMock(1),new addMock(2)]
                }
                term () {
                    return [3,4]
                }
            }
            sinon.stub(tv.prototype, 'visitTerm').callsFake((t) => t)
            const visitor = new vae()
            const input = new ctxMock()
            const output = visitor.visitArithmetic_expression(input)
            referenceOutput = [[1, 3], [2,4]]
            as.deepEqual([output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term], referenceOutput[0], 'expected first term value: ' + referenceOutput[0] + ' ; actual first term value: ' + [output.arithmetic_term_list[0].add_op, output.arithmetic_term_list[0].term])
            as.deepEqual([output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term], referenceOutput[1], 'expected second term value: ' + referenceOutput[1] + ' ; actual second term value: ' + [output.arithmetic_term_list[1].add_op, output.arithmetic_term_list[1].term])
        })
    })
})
mo.describe('testing Array_subscriptsVisitor.js', function () {
    mo.it('testing visitArray_subscripts(ctx)', function () {
        class ctxMock {
            subscript () {
                return [1,2,3,4,5]
            }
        }
        sinon.stub(subV.prototype, 'visitSubscript').callsFake((sub) => sub)
        const visitor = new asv()
        const input = new ctxMock()
        const output = visitor.visitArray_subscripts(input)
        const referenceOutput = [1,2,3,4,5]
        as.deepEqual(output.subscripts,referenceOutput,'expected subscripts value: ' + referenceOutput + ' ; actual subscripts value: ' + output.subscripts)
    })
})
mo.describe('testing Base_prefixVisitor.js', function () {
    mo.it('testing visitBase_prefix(ctx)', function () {
        class ctxMock {
            type_prefix () {
                return 'mocked type_prefix'
            }
        }
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
        class ctxMock {
            ENCAPSULATED () {
                return true
            }
            class_prefixes () {
                return 'mocked class_prefixes'
            }
            class_specifier () {
                return 'mocked class_specifier'
            }
        }
        sinon.stub(cpv.prototype, 'visitClass_prefixes').callsFake((class_prefixes) => class_prefixes)
        sinon.stub(csv.prototype, 'visitClass_specifier').callsFake((class_specifier) => class_specifier)
        const visitor = new cdv()
        const input = new ctxMock()
        const output = visitor.visitClass_definition(input)
        const referenceOutput = [true, 'mocked class_prefixes', 'mocked class_specifier']
        as.deepEqual(output.encapsulated, referenceOutput[0],'expected encapsulated value: ' + referenceOutput[0] + ' ; actual encapsulated value: ' + output.encapsulated)
        as.deepEqual(output.class_prefixes, referenceOutput[1],'expected: ' + referenceOutput[1] + ' ; actual: ' + output.class_prefixes)
        as.deepEqual(output.class_specifier, referenceOutput[2],'expected: ' + referenceOutput[2] + ' ; actual: ' + output.class_specifier)
    })
})
mo.describe('testing Class_modificationVisitor.js', function () {
    mo.it('testing visitClass_modification', function () {
        class ctxMock {
            argument_list () {
                return 'mocked argument_list'
            }
        }
        sinon.stub(alv.prototype,'visitArgument_list').callsFake((argument_list) => argument_list)
        const visitor = new cmv()
        const input = new ctxMock()
        const output = visitor.visitClass_modification(input)
        const referenceOutput = 'mocked argument_list'
        as.deepEqual(output.argument_list, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output.argument_list)
    })
})
mo.describe('testing Class_prefixesVisitor.js', function () {
    class getTextClass {
        constructor (mockedObject) {
            this.mockedObject = mockedObject
        }
        getText () {
            return 'mocked ' + this.mockedObject
        }
    }
    class ctxMock {
        constructor (testing) {
            this.testing = testing
        }
        PARTIAL () {
            return this.testing == 'partial_dec' ? new getTextClass('partial_dec') : false
        }
        CLASS () {
            return this.testing == 'class_dec' ? new getTextClass('class_dec') : false
        }
        MODEL () {
            return this.testing == 'model_dec' ? new getTextClass('model_dec') : false
        }
        BLOCK () {
            return this.testing == 'block_dec' ? new getTextClass('block_dec') : false
        }
        TYPE () {
            return this.testing == 'type_dec' ? new getTextClass('type_dec') : false
        }
        PACKAGE () {
            return this.testing == 'package_dec' ? new getTextClass('package_dec') : false
        }
        OPERATOR () {
            return (this.testing == 'operator_dec') || (this.testing == 'record_dec') || (this.testing == 'function_dec, pure_dec') || (this.testing == 'function_dec, impure_dec')
             ? new getTextClass('operator_dec') : false
        }
        RECORD () {
            return this.testing == 'record_dec' ? new getTextClass('record_dec') : false
        }
        EXPANDABLE () {
            return (this.testing == 'expandable_dec') || (this.testing == 'connector_dec') ? new getTextClass('expandable_dec') : false
        }
        CONNECTOR () {
            return this.testing == 'connector_dec' ? new getTextClass('connector_dec') : false
        }
        PURE () {
            return this.testing == 'function_dec, pure_dec' ? new getTextClass('pure_dec') : false
        }
        IMPURE () {
            return this.testing == 'function_dec, impure_dec' ? new getTextClass('impure_dec') : false
        }
        FUNCTION () {
            return (this.testing == 'function_dec, pure_dec') || (this.testing == 'function_dec, impure_dec') ? new getTextClass('function_dec') : false
        }
    }
    mo.describe('testing visitClass_prefixes(ctx)', function () {
        mo.it('testing partial_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('partial_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = 'mocked partial_dec '
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing class_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('class_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked class_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing model_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('model_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked model_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing record_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('record_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked operator_dec mocked record_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing block_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('block_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked block_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing connector_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('connector_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked expandable_dec mocked connector_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing type_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('type_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked type_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.it('testing package_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('package_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked package_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
        mo.describe('testing function_dec', function () {
            mo.it('testing pure_dec', function () {
                const visitor = new cpv()
                const input = new ctxMock('function_dec, pure_dec')
                const output = visitor.visitClass_prefixes(input)
                const referenceOutput = ' mocked pure_dec mocked operator_dec mocked function_dec'
                as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
            })
            mo.it('testing impure_dec', function () {
                const visitor = new cpv()
                const input = new ctxMock('function_dec, impure_dec')
                const output = visitor.visitClass_prefixes(input)
                const referenceOutput = ' mocked impure_dec mocked operator_dec mocked function_dec'
                as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
            })
        })
        mo.it('testing operator_dec', function () {
            const visitor = new cpv()
            const input = new ctxMock('operator_dec')
            const output = visitor.visitClass_prefixes(input)
            const referenceOutput = ' mocked operator_dec'
            as.deepEqual(output, referenceOutput,'expected: ' + referenceOutput + ' ; actual: ' + output)
        })
    })
})
mo.describe('testing Class_specifierVisitor.js', function () {
    mo.describe('testing visitClass_specifier(ctx)', function () {
        class ctxMock {
            constructor (testing) {
                this.testing = testing
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
        mo.it('testing long_class_specifier', function () {
            sinon.stub(lcsv.prototype, 'visitLong_class_specifier').callsFake((class_specifier) => class_specifier)
            const visitor = new csv()
            const input = new ctxMock('long_class_specifier')
            const output = visitor.visitClass_specifier(input)
            const referenceOutput = 'mocked long_class_specifier'
            as.deepEqual(output.long_class_specifier, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.long_class_specifier)
        })
        
        mo.it('testing short_class_specifier', function () {
            sinon.stub(scsv.prototype, 'visitShort_class_specifier').callsFake((class_specifier) => class_specifier)
            const visitor = new csv()
            const input = new ctxMock('short_class_specifier')
            const output = visitor.visitClass_specifier(input)
            const referenceOutput = 'mocked short_class_specifier'
            as.deepEqual(output.short_class_specifier, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.short_class_specifier)
        }) 
        
        mo.it('testing der_class_specifier', function () {
            sinon.stub(dcsv.prototype, 'visitDer_class_specifier').callsFake((class_specifier) => class_specifier)
            const visitor = new csv()
            const input = new ctxMock('der_class_specifier')
            const output = visitor.visitClass_specifier(input)
            const referenceOutput = 'mocked der_class_specifier'
            as.deepEqual(output.der_class_specifier, referenceOutput, 'expected: ' + referenceOutput + ' ; actual: ' + output.der_class_specifier)
        })
    })
})
mo.describe('testing CommentVisitor.js', function () {
    mo.it('testing visitComment(ctx)', function () {
        class ctxMock {
            annotation () {
                return 'mocked annotation'
            }
            string_comment () {
                return 'mocked string_comment'
            }
        }
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
        class ctxMock {
            type_prefix () {
                return 'mocked type_prefix'
            }
            type_specifier () {
                return 'mocked type_specifier'
            }
            component_declaration1 () {
                return 'mocked component_declaration'
            }
        }
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
        class ctxMock {
            type_prefix () {
                return 'mocked type_prefix'
            }
            type_specifier () {
                return 'mocked type_specifier'
            }
            array_subscripts () {
                return 'mocked array_subscripts'
            }
            component_list () {
                return 'mocked component_list'
            }
        }
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
        class ctxMock {
            declaration () {
                return 'mocked declaration'
            }
            comment () {
                return 'mocked comment'
            }
        }
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
        class ctxMock {
            declaration () {
                return 'mocked declaration'
            }
            condition_attribute () {
                return 'mocked condition_attribute'
            }
            comment () {
                return 'mocked comment'
            }
        }
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
        class ctxMock {
            component_declaration () {
                return [1,2,3,4,5]
            }
        }
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
        class ctxMock {
            expression () {
                return 'mocked expression'
            }
        }
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
        class ctxMock {
            component_reference () {
                return [1,2]
            }
        }
        sinon.stub(crv.prototype, 'visitComponent_reference').callsFake((comp_ref) => comp_ref)
        const visitor = new connCV()
        const input = new ctxMock()
        const output = visitor.visitConnect_clause(input)
        const referenceOutput = [1,2]
        as.deepEqual(output.from, referenceOutput[0], 'expected "from" value: ' + referenceOutput[0] + ' ; actual "from" value: ' + output.from)
        as.deepEqual(output.to, referenceOutput[1], 'expected "to" value: ' + referenceOutput[1] + ' ; actual "to" value: ' + output.to)
    })
})
mo.describe('testing Constraining_clauseVisitor.js', function () {
    mo.it('testing visitConstraining_clause(ctx)', function () {
        class ctxMock {
            name () {
                return 'mocked name'
            }
            class_modification () {
                return 'mocked class_modification'
            }
        }
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
        class getTextClass {
            constructor (text) {
                this.text = text
            }
            getText () {
                return this.text
            }
        }
        class ctxMock {
            IDENT () {
                return new getTextClass('mocked identifier')
            }
            array_subscripts () {
                return 'mocked array_subscripts'
            }
            modification () {
                return 'mocked modification'
            }
        }
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
        class getTextClass {
            constructor (text) {
                this.text = text
            }
            getText () {
                return this.text
            }
        }
        class ctxMock {
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
        const input = new ctxMock()
        const output = visitor.visitDer_class_specifier(input)
        const referenceOutput = [0, 'mocked name', [1,2], 'mocked comment']
        as.deepEqual(output.identifier, referenceOutput[0], 'expected identifier value: ' + referenceOutput[0] + ' ; actual identifier value: ' + output.identifier)
        as.deepEqual(output.der_class_specifier_value.type_specifier, referenceOutput[1], 'expected: ' + referenceOutput[1] + ' ; actual: ' + output.der_class_specifier_value.type_specifier)
        as.deepEqual(output.der_class_specifier_value.identifiers, referenceOutput[2], 'expected identifiers: ' + referenceOutput[2] + ' ; actual identifiers: ' + output.der_class_specifier_value.identifiers)
        as.deepEqual(output.der_class_specifier_value.comment, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.der_class_specifier_value.comment)
    })
}) 
mo.describe('testing Element_listVisitor.js', function () {
    mo.it('testing visitElement_list(ctx)', function () {
        class ctxMock {
            element () {
                return [1,2,3]
            }
        }
        sinon.stub(eleV.prototype, 'visitElement').callsFake((element) => element)
        const visitor = new elv()
        const input = new ctxMock()
        const output = visitor.visitElement_list(input)
        const referenceOutput = [1,2,3]
        as.deepEqual(output.elements, referenceOutput, 'expected elements value: ' + referenceOutput + ' ; actual elements value: ' + output.elements)
    })
})
mo.describe('testing Element_modification_or_replaceableVisitor.js', function () {
    mo.describe('testing visitElement_modification_or_replaceable(ctx)', function () {
        class ctxMock {
            constructor (boolean) {
                this.boolean = boolean
            }
            EACH () {
                return this.boolean
            }
            FINAL () {
                return this.boolean
            }
            element_modification () {
                return 'mocked element_modification'
            }
            element_replaceable () {
                return 'mocked element_replaceable'
            }
        }
        mo.it('testing EACH & FINAL = true', function () {
            sinon.stub(emv.prototype, 'visitElement_modification').callsFake((element_modification) => element_modification)
            sinon.stub(eleRepV.prototype,'visitElement_replaceable').callsFake((element_replaceable) => element_replaceable)
            const visitor = new emorv()
            const input = new ctxMock(true)
            const output = visitor.visitElement_modification_or_replaceable(input)
            const referenceOutput = [true, true, 'mocked element_modification', 'mocked element_replaceable']
            as.deepEqual(output.each, referenceOutput[0], 'expected "each" value: ' + referenceOutput[0] + ' ; actual "each value: ' + output.each)
            as.deepEqual(output.is_final, referenceOutput[1], 'expected is_final value: ' + referenceOutput[1] + ' ; actual is_final value: ' + output.is_final)
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
            as.deepEqual(output.each, referenceOutput[0], 'expected "each" value: ' + referenceOutput[0] + ' ; actual "each" value: ' + output.each)
            as.deepEqual(output.is_final, referenceOutput[1], 'expected is_final value: ' + referenceOutput[1] + ' ; actual is_final value: ' + output.is_final)
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
            as.deepEqual(output.each, referenceOutput[0], 'expected "each" value: ' + referenceOutput[0] + ' ; actual "each" value: ' + output.each)
            as.deepEqual(output.is_final, referenceOutput[1], 'expected is_final value: ' + referenceOutput[1] + ' ; actual is_final value: ' + output.is_final)
            as.deepEqual(output.element_modification, referenceOutput[2], 'expected: ' + referenceOutput[2] + ' ; actual: ' + output.element_modification)
            as.deepEqual(output.element_replaceable, referenceOutput[3], 'expected: ' + referenceOutput[3] + ' ; actual: ' + output.element_replaceable)
        }) 
    })
})
mo.describe('testing Element_modificationVisitor.js', function () {
    mo.it('testing visitElement_modification', function () {
        class ctxMock {
            name () {
                return 'mocked name'
            }
            modification () {
                return 'mocked modification'
            }
            string_comment () {
                return 'mocked string_comment'
            }
        }
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