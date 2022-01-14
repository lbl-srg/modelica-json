// Generated from modelica.g4 by ANTLR 4.5.3
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by modelicaParser.

function modelicaVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

modelicaVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
modelicaVisitor.prototype.constructor = modelicaVisitor;

// Visit a parse tree produced by modelicaParser#stored_definition.
modelicaVisitor.prototype.visitStored_definition = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#class_definition.
modelicaVisitor.prototype.visitClass_definition = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#class_specifier.
modelicaVisitor.prototype.visitClass_specifier = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#class_prefixes.
modelicaVisitor.prototype.visitClass_prefixes = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#long_class_specifier.
modelicaVisitor.prototype.visitLong_class_specifier = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#short_class_specifier.
modelicaVisitor.prototype.visitShort_class_specifier = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#der_class_specifier.
modelicaVisitor.prototype.visitDer_class_specifier = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#base_prefix.
modelicaVisitor.prototype.visitBase_prefix = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#enum_list.
modelicaVisitor.prototype.visitEnum_list = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#enumeration_literal.
modelicaVisitor.prototype.visitEnumeration_literal = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#composition.
modelicaVisitor.prototype.visitComposition = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#language_specification.
modelicaVisitor.prototype.visitLanguage_specification = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#external_function_call.
modelicaVisitor.prototype.visitExternal_function_call = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#element_list.
modelicaVisitor.prototype.visitElement_list = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#element.
modelicaVisitor.prototype.visitElement = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#import_clause.
modelicaVisitor.prototype.visitImport_clause = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#import_list.
modelicaVisitor.prototype.visitImport_list = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#extends_clause.
modelicaVisitor.prototype.visitExtends_clause = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#constraining_clause.
modelicaVisitor.prototype.visitConstraining_clause = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#component_clause.
modelicaVisitor.prototype.visitComponent_clause = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#type_prefix.
modelicaVisitor.prototype.visitType_prefix = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#type_specifier.
modelicaVisitor.prototype.visitType_specifier = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#component_list.
modelicaVisitor.prototype.visitComponent_list = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#component_declaration.
modelicaVisitor.prototype.visitComponent_declaration = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#condition_attribute.
modelicaVisitor.prototype.visitCondition_attribute = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#declaration.
modelicaVisitor.prototype.visitDeclaration = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#modification.
modelicaVisitor.prototype.visitModification = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#class_modification.
modelicaVisitor.prototype.visitClass_modification = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#argument_list.
modelicaVisitor.prototype.visitArgument_list = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#argument.
modelicaVisitor.prototype.visitArgument = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#element_modification_or_replaceable.
modelicaVisitor.prototype.visitElement_modification_or_replaceable = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#element_modification.
modelicaVisitor.prototype.visitElement_modification = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#element_redeclaration.
modelicaVisitor.prototype.visitElement_redeclaration = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#element_replaceable.
modelicaVisitor.prototype.visitElement_replaceable = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#component_clause1.
modelicaVisitor.prototype.visitComponent_clause1 = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#component_declaration1.
modelicaVisitor.prototype.visitComponent_declaration1 = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#short_class_definition.
modelicaVisitor.prototype.visitShort_class_definition = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#equation_section.
modelicaVisitor.prototype.visitEquation_section = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#algorithm_section.
modelicaVisitor.prototype.visitAlgorithm_section = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#equation.
modelicaVisitor.prototype.visitEquation = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#statement.
modelicaVisitor.prototype.visitStatement = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#if_equation.
modelicaVisitor.prototype.visitIf_equation = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#if_statement.
modelicaVisitor.prototype.visitIf_statement = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#for_equation.
modelicaVisitor.prototype.visitFor_equation = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#for_statement.
modelicaVisitor.prototype.visitFor_statement = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#for_indices.
modelicaVisitor.prototype.visitFor_indices = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#for_index.
modelicaVisitor.prototype.visitFor_index = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#while_statement.
modelicaVisitor.prototype.visitWhile_statement = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#when_equation.
modelicaVisitor.prototype.visitWhen_equation = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#when_statement.
modelicaVisitor.prototype.visitWhen_statement = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#connect_clause.
modelicaVisitor.prototype.visitConnect_clause = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#expression.
modelicaVisitor.prototype.visitExpression = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#simple_expression.
modelicaVisitor.prototype.visitSimple_expression = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#logical_expression.
modelicaVisitor.prototype.visitLogical_expression = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#logical_term.
modelicaVisitor.prototype.visitLogical_term = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#logical_factor.
modelicaVisitor.prototype.visitLogical_factor = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#relation.
modelicaVisitor.prototype.visitRelation = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#rel_op.
modelicaVisitor.prototype.visitRel_op = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#arithmetic_expression.
modelicaVisitor.prototype.visitArithmetic_expression = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#add_op.
modelicaVisitor.prototype.visitAdd_op = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#term.
modelicaVisitor.prototype.visitTerm = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#mul_op.
modelicaVisitor.prototype.visitMul_op = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#factor.
modelicaVisitor.prototype.visitFactor = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#primary.
modelicaVisitor.prototype.visitPrimary = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#name.
modelicaVisitor.prototype.visitName = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#component_reference.
modelicaVisitor.prototype.visitComponent_reference = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#function_call_args.
modelicaVisitor.prototype.visitFunction_call_args = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#function_arguments.
modelicaVisitor.prototype.visitFunction_arguments = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#named_arguments.
modelicaVisitor.prototype.visitNamed_arguments = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#named_argument.
modelicaVisitor.prototype.visitNamed_argument = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#function_argument.
modelicaVisitor.prototype.visitFunction_argument = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#output_expression_list.
modelicaVisitor.prototype.visitOutput_expression_list = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#expression_list.
modelicaVisitor.prototype.visitExpression_list = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#array_subscripts.
modelicaVisitor.prototype.visitArray_subscripts = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#subscript.
modelicaVisitor.prototype.visitSubscript = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#comment.
modelicaVisitor.prototype.visitComment = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#string_comment.
modelicaVisitor.prototype.visitString_comment = function(ctx) {
};


// Visit a parse tree produced by modelicaParser#annotation.
modelicaVisitor.prototype.visitAnnotation = function(ctx) {
};



exports.modelicaVisitor = modelicaVisitor;