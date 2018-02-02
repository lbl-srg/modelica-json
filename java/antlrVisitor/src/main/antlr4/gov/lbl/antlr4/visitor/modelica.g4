/*
[The "BSD licence"]
Copyright (c) 2012 Tom Everett
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
3. The name of the author may not be used to endorse or promote products
derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

grammar modelica;

stored_definition
   : (WITHIN (name)? SYMBOL_SEMICOLON)* ((FINAL)? class_definition SYMBOL_SEMICOLON)*
   ;

class_definition
   : (ENCAPSULATED)? class_prefixes class_specifier
   ;

class_specifier
   : long_class_specifier
   | short_class_specifier
   | der_class_specifier
   ;

class_prefixes
   : (PARTIAL)? (CLASS | MODEL | (OPERATOR)? RECORD | BLOCK | (EXPANDABLE)? CONNECTOR | TYPE | PACKAGE | ((PURE | IMPURE))? (OPERATOR)? FUNCTION | OPERATOR)
   ;

long_class_specifier
   : IDENT string_comment composition END IDENT
   | EXTENDS IDENT (class_modification)? string_comment composition END IDENT
   ;

short_class_specifier
   : IDENT SYMBOL_EQUAL base_prefix name (array_subscripts)? (class_modification)? comment
   | IDENT SYMBOL_EQUAL ENUMERATION SYMBOL_LRBRACKET ((enum_list)? | SYMBOL_COLON) SYMBOL_RRBRACKET comment
   ;

der_class_specifier
   : IDENT SYMBOL_EQUAL DER SYMBOL_LRBRACKET name SYMBOL_COMMA IDENT (SYMBOL_COMMA IDENT)* SYMBOL_LRBRACKET comment
   ;

base_prefix
   : type_prefix
   ;

enum_list
   : enumeration_literal (SYMBOL_COMMA enumeration_literal)*
   ;

enumeration_literal
   : IDENT comment
   ;

composition
   : element_list (PUBLIC element_list | PROTECTED element_list | equation_section | algorithm_section)* (EXTERNAL (language_specification)? (external_function_call)? (annotation)? SYMBOL_SEMICOLON)? (annotation SYMBOL_SEMICOLON)?
   ;

language_specification
   : STRING
   ;

external_function_call
   : (component_reference SYMBOL_EQUAL)? IDENT SYMBOL_LRBRACKET (expression_list)? SYMBOL_RRBRACKET
   ;

element_list
   : (element SYMBOL_SEMICOLON)*
   ;

element
   : import_clause
   | extends_clause
   | (REDECLARE)? (FINAL)? (INNER)? (OUTER)? ((class_definition | component_clause) | REPLACEABLE (class_definition | component_clause) (constraining_clause comment)?)
   ;

import_clause
   : IMPORT (IDENT SYMBOL_EQUAL name | name SYMBOL_DOTSTAR | name SYMBOL_DOTLCBRACKET import_list SYMBOL_RCBRACKET | name ) comment
   ;

import_list
   : IDENT (SYMBOL_COMMA IDENT)*
   ;

extends_clause
   : EXTENDS name (class_modification)? (annotation)?
   ;

constraining_clause
   : CONSTRAINEDBY name (class_modification)?
   ;

component_clause
   : type_prefix type_specifier (array_subscripts)? component_list
   ;

type_prefix
   : (FLOW | STREAM)? (DISCRETE | PARAMETER | CONSTANT)? (INPUT | OUTPUT)?
   ;

type_specifier
   : name
   ;

component_list
   : component_declaration (SYMBOL_COMMA component_declaration)*
   ;

component_declaration
   : declaration (condition_attribute)? comment
   ;

condition_attribute
   : IF expression
   ;


declaration
   : IDENT (array_subscripts)? (modification)?
   ;

modification
   : class_modification (SYMBOL_EQUAL expression)?
   | SYMBOL_EQUAL expression
   | SYMBOL_COLONEQUAL expression
   ;

class_modification
   : SYMBOL_LRBRACKET (argument_list)? SYMBOL_RRBRACKET
   ;

argument_list
   : argument (SYMBOL_COMMA argument)*
   ;

argument
   : element_modification_or_replaceable
   | element_redeclaration
   ;

element_modification_or_replaceable
   : (EACH)? (FINAL)? (element_modification | element_replaceable)
   ;

element_modification
   : name (modification)? string_comment
   ;

element_redeclaration
   : REDECLARE (EACH)? (FINAL)? ((short_class_definition | component_clause1) | element_replaceable)
   ;

element_replaceable
   : REPLACEABLE (short_class_definition | component_clause1) (constraining_clause)?
   ;

component_clause1
   : type_prefix type_specifier component_declaration1
   ;

component_declaration1
   : declaration comment
   ;

short_class_definition
   : class_prefixes short_class_specifier
   ;

equation_section
   : (INITIAL)? EQUATION (equation SYMBOL_SEMICOLON)*
   ;

algorithm_section
   : (INITIAL)? ALGORITHM (statement SYMBOL_SEMICOLON)*
   ;

equation
   : (simple_expression SYMBOL_EQUAL expression | if_equation | for_equation | connect_clause | when_equation | name function_call_args) comment
   ;

statement
   : (component_reference (SYMBOL_COLONEQUAL expression | function_call_args) | SYMBOL_LRBRACKET output_expression_list SYMBOL_RRBRACKET SYMBOL_COLONEQUAL component_reference function_call_args | BREAK | RETURN | if_statement | for_statement | while_statement | when_statement) comment
   ;

if_equation
   : IF expression THEN (equation SYMBOL_SEMICOLON)* (ELSEIF expression THEN (equation SYMBOL_SEMICOLON)*)* (ELSE (equation SYMBOL_SEMICOLON)*)? END IF
   ;

if_statement
   : IF expression THEN (statement SYMBOL_SEMICOLON)* (ELSEIF expression THEN (statement SYMBOL_SEMICOLON)*)* (ELSE (statement SYMBOL_SEMICOLON)*)? END IF
   ;

for_equation
   : FOR for_indices LOOP (equation SYMBOL_SEMICOLON)* END FOR
   ;

for_statement
   : FOR for_indices LOOP (statement SYMBOL_SEMICOLON)* END FOR
   ;

for_indices
   : for_index (SYMBOL_COMMA for_index)*
   ;

for_index
   : IDENT (IN expression)?
   ;

while_statement
   : WHILE expression LOOP (statement SYMBOL_SEMICOLON)* END WHILE
   ;

when_equation
   : WHEN expression THEN (equation SYMBOL_SEMICOLON)* (ELSEWHEN expression THEN (equation SYMBOL_SEMICOLON)*)* END WHEN
   ;

when_statement
   : WHEN expression THEN (statement SYMBOL_SEMICOLON)* (ELSEWHEN expression THEN (statement SYMBOL_SEMICOLON)*)* END WHEN
   ;

connect_clause
   : CONNECT SYMBOL_LRBRACKET component_reference SYMBOL_COMMA component_reference SYMBOL_RRBRACKET
   ;

expression
   : simple_expression
   | IF expression THEN expression (ELSEIF expression THEN expression)* ELSE expression
   ;

simple_expression
   : logical_expression (SYMBOL_COLON logical_expression (SYMBOL_COLON logical_expression)?)?
   ;

logical_expression
   : logical_term (OR logical_term)*
   ;

logical_term
   : logical_factor (AND logical_factor)*
   ;

logical_factor
   : (NOT)? relation
   ;

relation
   : arithmetic_expression (rel_op arithmetic_expression)?
   ;

rel_op
   : '<'
   | '<='
   | '>'
   | '>='
   | '=='
   | '<>'
   ;

arithmetic_expression
   : (add_op)? term (add_op term)*
   ;

add_op
   : '+'
   | '-'
   | '.+'
   | '.-'
   ;

term
   : factor (mul_op factor)*
   ;

mul_op
   : '*'
   | '/'
   | '.*'
   | './'
   ;

factor
   : primary ((SYMBOL_CARET | SYMBOL_DOTCARET) primary)?
   ;

primary
   : UNSIGNED_NUMBER
   | STRING
   | FALSE
   | TRUE
   | (name | DER | INITIAL) function_call_args
   | component_reference
   | SYMBOL_LRBRACKET output_expression_list SYMBOL_RRBRACKET
   | SYMBOL_LSBRACKET expression_list (SYMBOL_SEMICOLON expression_list)* SYMBOL_RSBRACKET
   | SYMBOL_LCBRACKET function_arguments SYMBOL_RCBRACKET
   | END
   ;

name
   : (SYMBOL_DOT)? IDENT (SYMBOL_DOT IDENT)*
   ;

component_reference
   : (SYMBOL_DOT)? IDENT (array_subscripts)? (SYMBOL_DOT IDENT (array_subscripts)?)*
   ;

function_call_args
   : SYMBOL_LRBRACKET (function_arguments)? SYMBOL_RRBRACKET
   ;

function_arguments
   : function_argument (SYMBOL_COMMA function_arguments | FOR for_indices)?
   | named_arguments
   ;

named_arguments
   : named_argument (SYMBOL_COMMA named_arguments)?
   ;

named_argument
   : IDENT SYMBOL_EQUAL function_argument
   ;

function_argument
   : FUNCTION name SYMBOL_LRBRACKET (named_arguments)? SYMBOL_RRBRACKET
   | expression
   ;

output_expression_list
   : (expression)? (SYMBOL_COMMA (expression)?)*
   ;

expression_list
   : expression (SYMBOL_COMMA expression)*
   ;

array_subscripts
   : SYMBOL_LSBRACKET subscript (SYMBOL_COMMA subscript)* SYMBOL_RSBRACKET
   ;

subscript
   : SYMBOL_COLON
   | expression
   ;

comment
   : string_comment (annotation)?
   ;

string_comment
   : (STRING (SYMBOL_PLUS STRING)*)?
   ;

annotation
   : ANNOTATION class_modification
   ;

ALGORITHM : 'algorithm';
AND : 'and';
ANNOTATION : 'annotation';
BLOCK : 'block';
BREAK : 'break';
CLASS : 'class';
CONNECT : 'connect';
CONNECTOR : 'connector';
CONSTANT : 'constant';
CONSTRAINEDBY : 'constrainedby';
DER : 'der';
DISCRETE : 'discrete';
EACH : 'each';
ELSE : 'else';
ELSEIF : 'elseif';
ELSEWHEN : 'elsewhen';
ENCAPSULATED : 'encapsulated';
END : 'end';
ENUMERATION : 'enumeration';
EQUATION : 'equation';
EXPANDABLE : 'expandable';
EXTENDS : 'extends';
EXTERNAL : 'external';
FALSE : 'false';
FINAL : 'final';
FLOW : 'flow';
FOR : 'for';
FUNCTION : 'function';
IF : 'if';
IMPORT : 'import';
IMPURE : 'impure';
IN : 'in';
INITIAL : 'initial';
INNER : 'inner';
INPUT : 'input';
LOOP : 'loop';
MODEL : 'model';
NOT : 'not';
OPERATOR : 'operator';
OR : 'or';
OUTER : 'outer';
OUTPUT : 'output';
PACKAGE : 'package';
PARAMETER : 'parameter';
PARTIAL : 'partial';
PROTECTED : 'protected';
PUBLIC : 'public';
PURE : 'pure';
RECORD : 'record';
REDECLARE : 'redeclare';
REPLACEABLE : 'replaceable';
RETURN : 'return';
STREAM : 'stream';
THEN : 'then';
TRUE : 'true';
TYPE : 'type';
WHEN : 'when';
WHILE : 'while';
WITHIN : 'within';

SYMBOL_SEMICOLON : ';' ;
SYMBOL_EQUAL : '=' ;
SYMBOL_COLON : ':' ;
SYMBOL_COMMA : ',' ;
SYMBOL_DOTSTAR : '.*' ;
SYMBOL_LRBRACKET : '(' ;
SYMBOL_RRBRACKET : ')' ;
SYMBOL_DOTLCBRACKET : '.{' ;
SYMBOL_LCBRACKET : '{' ;
SYMBOL_RCBRACKET : '}' ;
SYMBOL_LSBRACKET : '[' ;
SYMBOL_RSBRACKET : ']' ;
SYMBOL_COLONEQUAL : ':=' ;
SYMBOL_CARET : '^' ;
SYMBOL_DOTCARET : '.^' ;
SYMBOL_DOT : '.' ;
SYMBOL_PLUS : '+' ;

IDENT
   : NONDIGIT (DIGIT | NONDIGIT)* | Q_IDENT
   ;


fragment Q_IDENT
   : '\'' (Q_CHAR | S_ESCAPE) (Q_CHAR | S_ESCAPE)* '\''
   ;


fragment S_CHAR
   : ~ ["\\]
   ;


fragment NONDIGIT
   : '_' | 'a' .. 'z' | 'A' .. 'Z'
   ;


STRING
   : '"' ( S_CHAR | S_ESCAPE )* '"'
   ;


fragment Q_CHAR
   : NONDIGIT | DIGIT | '!' | '#' | '$' | '%' | '&' | '(' | ')' | '*' | '+' | ',' | '-' | '.' | '/' | ':' | ';' | '<' | '>' | '=' | '?' | '@' | '[' | ']' | '^' | '{' | '}' | '|' | '~'
   ;


fragment S_ESCAPE
   : '\\' ('’' | '\'' | '"' | '?' | '\\' | 'a' | 'b' | 'f' | 'n' | 'r' | 't' | 'v')
   ;


fragment DIGIT
   : '0' .. '9'
   ;

fragment UNSIGNED_INTEGER
   : DIGIT (DIGIT)*
   ;


UNSIGNED_NUMBER
   : UNSIGNED_INTEGER ('.' (UNSIGNED_INTEGER)?)? (('e' | 'E') ('+' | '-')? UNSIGNED_INTEGER)?
   ;

WS
   : [ \r\n\t] + -> channel (HIDDEN)
   ;

COMMENT
    :   '/*' .*? '*/' -> channel (HIDDEN)
    ;

LINE_COMMENT
    :   '//' ~[\r\n]* -> channel (HIDDEN)
    ;
