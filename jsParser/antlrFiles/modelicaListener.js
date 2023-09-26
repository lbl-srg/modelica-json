// Generated from modelica.g4 by ANTLR 4.7.2
// jshint ignore: start
const antlr4 = require('antlr4/index')

// This class defines a complete listener for a parse tree produced by modelicaParser.
function modelicaListener () {
  antlr4.tree.ParseTreeListener.call(this)
  return this
}

modelicaListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype)
modelicaListener.prototype.constructor = modelicaListener

// Enter a parse tree produced by modelicaParser#stored_definition.
modelicaListener.prototype.enterStored_definition = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#stored_definition.
modelicaListener.prototype.exitStored_definition = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#class_definition.
modelicaListener.prototype.enterClass_definition = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#class_definition.
modelicaListener.prototype.exitClass_definition = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#class_specifier.
modelicaListener.prototype.enterClass_specifier = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#class_specifier.
modelicaListener.prototype.exitClass_specifier = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#class_prefixes.
modelicaListener.prototype.enterClass_prefixes = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#class_prefixes.
modelicaListener.prototype.exitClass_prefixes = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#long_class_specifier.
modelicaListener.prototype.enterLong_class_specifier = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#long_class_specifier.
modelicaListener.prototype.exitLong_class_specifier = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#short_class_specifier.
modelicaListener.prototype.enterShort_class_specifier = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#short_class_specifier.
modelicaListener.prototype.exitShort_class_specifier = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#der_class_specifier.
modelicaListener.prototype.enterDer_class_specifier = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#der_class_specifier.
modelicaListener.prototype.exitDer_class_specifier = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#base_prefix.
modelicaListener.prototype.enterBase_prefix = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#base_prefix.
modelicaListener.prototype.exitBase_prefix = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#enum_list.
modelicaListener.prototype.enterEnum_list = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#enum_list.
modelicaListener.prototype.exitEnum_list = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#enumeration_literal.
modelicaListener.prototype.enterEnumeration_literal = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#enumeration_literal.
modelicaListener.prototype.exitEnumeration_literal = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#composition.
modelicaListener.prototype.enterComposition = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#composition.
modelicaListener.prototype.exitComposition = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#language_specification.
modelicaListener.prototype.enterLanguage_specification = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#language_specification.
modelicaListener.prototype.exitLanguage_specification = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#external_function_call.
modelicaListener.prototype.enterExternal_function_call = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#external_function_call.
modelicaListener.prototype.exitExternal_function_call = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#element_list.
modelicaListener.prototype.enterElement_list = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#element_list.
modelicaListener.prototype.exitElement_list = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#element.
modelicaListener.prototype.enterElement = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#element.
modelicaListener.prototype.exitElement = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#import_clause.
modelicaListener.prototype.enterImport_clause = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#import_clause.
modelicaListener.prototype.exitImport_clause = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#import_list.
modelicaListener.prototype.enterImport_list = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#import_list.
modelicaListener.prototype.exitImport_list = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#extends_clause.
modelicaListener.prototype.enterExtends_clause = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#extends_clause.
modelicaListener.prototype.exitExtends_clause = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#constraining_clause.
modelicaListener.prototype.enterConstraining_clause = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#constraining_clause.
modelicaListener.prototype.exitConstraining_clause = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#component_clause.
modelicaListener.prototype.enterComponent_clause = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#component_clause.
modelicaListener.prototype.exitComponent_clause = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#type_prefix.
modelicaListener.prototype.enterType_prefix = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#type_prefix.
modelicaListener.prototype.exitType_prefix = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#type_specifier.
modelicaListener.prototype.enterType_specifier = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#type_specifier.
modelicaListener.prototype.exitType_specifier = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#component_list.
modelicaListener.prototype.enterComponent_list = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#component_list.
modelicaListener.prototype.exitComponent_list = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#component_declaration.
modelicaListener.prototype.enterComponent_declaration = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#component_declaration.
modelicaListener.prototype.exitComponent_declaration = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#condition_attribute.
modelicaListener.prototype.enterCondition_attribute = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#condition_attribute.
modelicaListener.prototype.exitCondition_attribute = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#declaration.
modelicaListener.prototype.enterDeclaration = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#declaration.
modelicaListener.prototype.exitDeclaration = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#modification.
modelicaListener.prototype.enterModification = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#modification.
modelicaListener.prototype.exitModification = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#class_modification.
modelicaListener.prototype.enterClass_modification = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#class_modification.
modelicaListener.prototype.exitClass_modification = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#argument_list.
modelicaListener.prototype.enterArgument_list = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#argument_list.
modelicaListener.prototype.exitArgument_list = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#argument.
modelicaListener.prototype.enterArgument = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#argument.
modelicaListener.prototype.exitArgument = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#element_modification_or_replaceable.
modelicaListener.prototype.enterElement_modification_or_replaceable = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#element_modification_or_replaceable.
modelicaListener.prototype.exitElement_modification_or_replaceable = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#element_modification.
modelicaListener.prototype.enterElement_modification = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#element_modification.
modelicaListener.prototype.exitElement_modification = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#element_redeclaration.
modelicaListener.prototype.enterElement_redeclaration = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#element_redeclaration.
modelicaListener.prototype.exitElement_redeclaration = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#element_replaceable.
modelicaListener.prototype.enterElement_replaceable = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#element_replaceable.
modelicaListener.prototype.exitElement_replaceable = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#component_clause1.
modelicaListener.prototype.enterComponent_clause1 = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#component_clause1.
modelicaListener.prototype.exitComponent_clause1 = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#component_declaration1.
modelicaListener.prototype.enterComponent_declaration1 = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#component_declaration1.
modelicaListener.prototype.exitComponent_declaration1 = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#short_class_definition.
modelicaListener.prototype.enterShort_class_definition = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#short_class_definition.
modelicaListener.prototype.exitShort_class_definition = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#equation_section.
modelicaListener.prototype.enterEquation_section = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#equation_section.
modelicaListener.prototype.exitEquation_section = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#algorithm_section.
modelicaListener.prototype.enterAlgorithm_section = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#algorithm_section.
modelicaListener.prototype.exitAlgorithm_section = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#equation.
modelicaListener.prototype.enterEquation = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#equation.
modelicaListener.prototype.exitEquation = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#statement.
modelicaListener.prototype.enterStatement = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#statement.
modelicaListener.prototype.exitStatement = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#if_equation.
modelicaListener.prototype.enterIf_equation = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#if_equation.
modelicaListener.prototype.exitIf_equation = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#if_statement.
modelicaListener.prototype.enterIf_statement = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#if_statement.
modelicaListener.prototype.exitIf_statement = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#for_equation.
modelicaListener.prototype.enterFor_equation = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#for_equation.
modelicaListener.prototype.exitFor_equation = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#for_statement.
modelicaListener.prototype.enterFor_statement = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#for_statement.
modelicaListener.prototype.exitFor_statement = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#for_indices.
modelicaListener.prototype.enterFor_indices = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#for_indices.
modelicaListener.prototype.exitFor_indices = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#for_index.
modelicaListener.prototype.enterFor_index = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#for_index.
modelicaListener.prototype.exitFor_index = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#while_statement.
modelicaListener.prototype.enterWhile_statement = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#while_statement.
modelicaListener.prototype.exitWhile_statement = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#when_equation.
modelicaListener.prototype.enterWhen_equation = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#when_equation.
modelicaListener.prototype.exitWhen_equation = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#when_statement.
modelicaListener.prototype.enterWhen_statement = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#when_statement.
modelicaListener.prototype.exitWhen_statement = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#connect_clause.
modelicaListener.prototype.enterConnect_clause = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#connect_clause.
modelicaListener.prototype.exitConnect_clause = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#expression.
modelicaListener.prototype.enterExpression = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#expression.
modelicaListener.prototype.exitExpression = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#simple_expression.
modelicaListener.prototype.enterSimple_expression = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#simple_expression.
modelicaListener.prototype.exitSimple_expression = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#logical_expression.
modelicaListener.prototype.enterLogical_expression = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#logical_expression.
modelicaListener.prototype.exitLogical_expression = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#logical_term.
modelicaListener.prototype.enterLogical_term = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#logical_term.
modelicaListener.prototype.exitLogical_term = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#logical_factor.
modelicaListener.prototype.enterLogical_factor = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#logical_factor.
modelicaListener.prototype.exitLogical_factor = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#relation.
modelicaListener.prototype.enterRelation = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#relation.
modelicaListener.prototype.exitRelation = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#rel_op.
modelicaListener.prototype.enterRel_op = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#rel_op.
modelicaListener.prototype.exitRel_op = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#arithmetic_expression.
modelicaListener.prototype.enterArithmetic_expression = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#arithmetic_expression.
modelicaListener.prototype.exitArithmetic_expression = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#add_op.
modelicaListener.prototype.enterAdd_op = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#add_op.
modelicaListener.prototype.exitAdd_op = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#term.
modelicaListener.prototype.enterTerm = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#term.
modelicaListener.prototype.exitTerm = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#mul_op.
modelicaListener.prototype.enterMul_op = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#mul_op.
modelicaListener.prototype.exitMul_op = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#factor.
modelicaListener.prototype.enterFactor = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#factor.
modelicaListener.prototype.exitFactor = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#primary.
modelicaListener.prototype.enterPrimary = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#primary.
modelicaListener.prototype.exitPrimary = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#name.
modelicaListener.prototype.enterName = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#name.
modelicaListener.prototype.exitName = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#component_reference.
modelicaListener.prototype.enterComponent_reference = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#component_reference.
modelicaListener.prototype.exitComponent_reference = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#function_call_args.
modelicaListener.prototype.enterFunction_call_args = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#function_call_args.
modelicaListener.prototype.exitFunction_call_args = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#function_arguments.
modelicaListener.prototype.enterFunction_arguments = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#function_arguments.
modelicaListener.prototype.exitFunction_arguments = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#named_arguments.
modelicaListener.prototype.enterNamed_arguments = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#named_arguments.
modelicaListener.prototype.exitNamed_arguments = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#named_argument.
modelicaListener.prototype.enterNamed_argument = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#named_argument.
modelicaListener.prototype.exitNamed_argument = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#function_argument.
modelicaListener.prototype.enterFunction_argument = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#function_argument.
modelicaListener.prototype.exitFunction_argument = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#output_expression_list.
modelicaListener.prototype.enterOutput_expression_list = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#output_expression_list.
modelicaListener.prototype.exitOutput_expression_list = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#expression_list.
modelicaListener.prototype.enterExpression_list = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#expression_list.
modelicaListener.prototype.exitExpression_list = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#array_subscripts.
modelicaListener.prototype.enterArray_subscripts = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#array_subscripts.
modelicaListener.prototype.exitArray_subscripts = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#subscript.
modelicaListener.prototype.enterSubscript = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#subscript.
modelicaListener.prototype.exitSubscript = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#comment.
modelicaListener.prototype.enterComment = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#comment.
modelicaListener.prototype.exitComment = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#string_comment.
modelicaListener.prototype.enterString_comment = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#string_comment.
modelicaListener.prototype.exitString_comment = function (ctx) {
}

// Enter a parse tree produced by modelicaParser#annotation.
modelicaListener.prototype.enterAnnotation = function (ctx) {
}

// Exit a parse tree produced by modelicaParser#annotation.
modelicaListener.prototype.exitAnnotation = function (ctx) {
}

exports.modelicaListener = modelicaListener
