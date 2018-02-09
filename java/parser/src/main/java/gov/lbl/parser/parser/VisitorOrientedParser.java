package gov.lbl.parser.parser;

import gov.lbl.antlr4.visitor.modelicaBaseVisitor;
import gov.lbl.antlr4.visitor.modelicaLexer;
import gov.lbl.antlr4.visitor.modelicaParser;

import gov.lbl.parser.domain.*;

import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.TokenStream;
import org.antlr.v4.runtime.misc.NotNull;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

import java.util.ArrayList;

public class VisitorOrientedParser implements Parser {

    public Stored_definition parse(String modelicaSourceCode) {
        CharStream charStream = new ANTLRInputStream(modelicaSourceCode);
        modelicaLexer lexer = new modelicaLexer(charStream);
        TokenStream tokens = new CommonTokenStream(lexer);
        modelicaParser parser = new modelicaParser(tokens);

        Stored_definitionVisitor stored_definitionVisitor = new Stored_definitionVisitor();
        Stored_definition traverseResult = stored_definitionVisitor.visit(parser.stored_definition());
        return traverseResult;
    }

    private static class Stored_definitionVisitor extends modelicaBaseVisitor<Stored_definition> {
      @Override
      public Stored_definition visitStored_definition(@NotNull modelicaParser.Stored_definitionContext ctx) {
        List<String> within_dec = ctx.WITHIN() == null ? null : ctx.WITHIN()           		
                .stream() 
                .map(WITHIN -> WITHIN.getText())
                .collect(toList());
        NameVisitor nameVisitor = new NameVisitor();
        List<String> names = ctx.name() == null ? null : ctx.name()
                .stream()
                .map(name -> name.accept(nameVisitor))
                .collect(toList());
        List<String> final_dec = ctx.FINAL() == null ? null : ctx.FINAL()
                .stream()
                .map(FINAL -> FINAL.getText())
                .collect(toList());
        Class_definitionVisitor class_definitionVisitor = new Class_definitionVisitor();
        List<Class_definition> class_definitions = ctx.class_definition()
                .stream()
                .map(class_definition -> class_definition.accept(class_definitionVisitor))
                .collect(toList());
        return new Stored_definition(within_dec, final_dec, names, class_definitions);
      }
    }

    private static class Class_definitionVisitor extends modelicaBaseVisitor<Class_definition> {
      @Override
      public Class_definition visitClass_definition(@NotNull modelicaParser.Class_definitionContext ctx) {
        String enca_dec = ctx.ENCAPSULATED() == null ? null : ctx.ENCAPSULATED().getText();       
        Class_prefixesVisitor class_prefixesVisitor = new Class_prefixesVisitor();
        String class_prefixes_1 = ctx.class_prefixes().accept(class_prefixesVisitor);
        Class_specifierVisitor class_specifierVisitor = new Class_specifierVisitor();
        Class_specifier class_specifier_1 = ctx.class_specifier().accept(class_specifierVisitor);
        return new Class_definition(enca_dec, class_prefixes_1, class_specifier_1);
      }
    }

    private static class Class_specifierVisitor extends modelicaBaseVisitor<Class_specifier> {
      @Override
      public Class_specifier visitClass_specifier(@NotNull modelicaParser.Class_specifierContext ctx) {
        Long_class_specifierVisitor long_class_specifierVisitor = new Long_class_specifierVisitor();
        Long_class_specifier long_class_specifier_1 = 
        		ctx.long_class_specifier() == null ? null : ctx.long_class_specifier().accept(long_class_specifierVisitor);
        Short_class_specifierVisitor short_class_specifierVisitor = new Short_class_specifierVisitor();
        Short_class_specifier short_class_specifier_1 = 
        		ctx.short_class_specifier() == null ? null : ctx.short_class_specifier().accept(short_class_specifierVisitor);
        Der_class_specifierVisitor der_class_specifierVisitor = new Der_class_specifierVisitor();
        Der_class_specifier der_class_specifier_1 = 
        		ctx.der_class_specifier() == null ? null : ctx.der_class_specifier().accept(der_class_specifierVisitor);
        return new Class_specifier(long_class_specifier_1, short_class_specifier_1, der_class_specifier_1);
      }
    }

    private static class Class_prefixesVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitClass_prefixes(@NotNull modelicaParser.Class_prefixesContext ctx) {
        String partial_dec = 
        		ctx.PARTIAL() == null ? "" : ctx.PARTIAL().getText();
        String class_dec = 
        		ctx.CLASS() == null ? "" : ctx.CLASS().getText();
        String model_dec = 
        		ctx.MODEL() == null ? "" : ctx.MODEL().getText();
        String block_dec = 
        		ctx.BLOCK() == null ? "" : ctx.BLOCK().getText();
        String type_dec = 
        		ctx.TYPE() == null ? "" : ctx.TYPE().getText();
        String package_dec = 
        		ctx.PACKAGE() == null ? "" : ctx.PACKAGE().getText();
        String operator_dec = 
        		ctx.OPERATOR() == null ? "" : ctx.OPERATOR().getText();
        String record_dec = 
        		ctx.RECORD() == null ? "" : ctx.RECORD().getText();
        String expandable_dec = 
        		ctx.EXPANDABLE() == null ? "" : ctx.EXPANDABLE().getText();
        String connector_dec = 
        		ctx.CONNECTOR() == null ? "" : ctx.CONNECTOR().getText();
        String pure_dec = 
        		ctx.PURE() == null ? "" : ctx.PURE().getText();
        String impure_dec = 
        		ctx.IMPURE() == null ? "" : ctx.IMPURE().getText();
        String function_dec = 
        		ctx.FUNCTION() == null ? "" : ctx.FUNCTION().getText();
        String other_dec;
        if ((!function_dec.isEmpty()) && (connector_dec.isEmpty()) && (record_dec.isEmpty())) {
        	String tempStr;
        	if (operator_dec.isEmpty()) {
        		tempStr = function_dec;
    		} else {
    			tempStr = operator_dec + " " + function_dec;
    		}     	
        	if (pure_dec.isEmpty() && impure_dec.isEmpty()) {
        		other_dec = tempStr;        		       		
        	} else {
        		other_dec = pure_dec + impure_dec + " " + tempStr;
        	}         
        } else if ((!connector_dec.isEmpty()) && (function_dec.isEmpty()) && (record_dec.isEmpty())) {
          other_dec = (expandable_dec.isEmpty()) ? connector_dec : (expandable_dec + " " + connector_dec);
        } else if ((!record_dec.isEmpty()) && (function_dec.isEmpty()) && (connector_dec.isEmpty())) {
          other_dec = (operator_dec.isEmpty()) ? record_dec : (operator_dec + " " + record_dec);
        } else {
          other_dec = (class_dec != null ? class_dec : "");
          other_dec = other_dec + (model_dec != null ? model_dec : "");
          other_dec = other_dec + (block_dec != null ? block_dec : "");
          other_dec = other_dec + (type_dec != null ? type_dec : "");
          other_dec = other_dec + (package_dec != null ? package_dec : "");
          other_dec = other_dec + (operator_dec != null ? operator_dec : "");
        }
        String claPreStr = 
        		(!partial_dec.isEmpty()) ? (partial_dec + " " + other_dec) : other_dec;
        return claPreStr;       
        // return new Class_prefixes(partial_dec, other_dec);
      }
    }

    private static class Long_class_specifierVisitor extends modelicaBaseVisitor<Long_class_specifier> {
      @Override
      public Long_class_specifier visitLong_class_specifier(@NotNull modelicaParser.Long_class_specifierContext ctx) {
        List<String> ident = ctx.IDENT()
        		.stream()
        		.map(IDENT -> IDENT.getText())
        		.collect(toList());
        String extends_dec = 
        		ctx.EXTENDS() == null ? null : ctx.EXTENDS().getText();
        String_commentVisitor string_commentVisitor = new String_commentVisitor();
        String string_comment_1 = ctx.string_comment().accept(string_commentVisitor);
        CompositionVisitor compositionVisitor = new CompositionVisitor();
        Composition composition_1 = ctx.composition().accept(compositionVisitor);
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        String class_modification_1 = 
        		ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        return new Long_class_specifier(extends_dec, ident.get(0), string_comment_1, composition_1, class_modification_1);
      }
    }

    private static class Short_class_specifierVisitor extends modelicaBaseVisitor<Short_class_specifier> {
      @Override
      public Short_class_specifier visitShort_class_specifier(@NotNull modelicaParser.Short_class_specifierContext ctx) {
        String enum_dec = 
        		ctx.ENUMERATION() == null ? null : ctx.ENUMERATION().getText();
        String ident = ctx.IDENT().getText();
        Base_prefixVisitor base_prefixVisitor = new Base_prefixVisitor();
        String base_prefix_1 = 
        		ctx.base_prefix() == null ? null : ctx.base_prefix().accept(base_prefixVisitor);
        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        String array_subscripts_1 = 
        		ctx.array_subscripts() == null ? null : ctx.array_subscripts().accept(array_subscriptsVisitor);
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        String class_modification_1 = 
        		ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment = 
        		ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        
        /*String comment;
        if (strComment != null) {
        	if (strComment.string_comment == null && strComment.annotation == null) {
        		comment = "";
        	} else if (strComment.string_comment == null && strComment.annotation != null) {
        		comment = "annotation (" + strComment.annotation.toString() + ")";
        	} else if (strComment.string_comment != null && strComment.annotation == null) {
        		comment = strComment.string_comment;
        	} else {
        		comment = strComment.string_comment + " " 
        			  + "annotation (" + strComment.annotation.toString() + ")";
        	}
        } else {
        	comment = "";
        }*/            
        
        
        Enum_listVisitor enum_listVisitor = new Enum_listVisitor();
        Enum_list enum_list_1 = 
        		ctx.enum_list() == null ? null : ctx.enum_list().accept(enum_listVisitor);       		       
        //String enum_list = enum_list_1 == null ? "" : String.valueOf(enum_list_1);
        NameVisitor nameVisitor = new NameVisitor();
        String name_1 = 
        		ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        String symCol = 
        		ctx.SYMBOL_COLON() == null ? null : ctx.SYMBOL_COLON().getText();
        
        /*String shoClaSpe;      
        System.out.printf("%nstrComment: '%s'", strComment); 
        if (base_prefix_1 != null || name_1 != null) {
        	shoClaSpe = ident + " =" + (base_prefix_1 == null ? "" : base_prefix_1)
        			    + " " + name_1 + " " + array_subscripts_1 + class_modification_1 + " " + comment;
        } else {
        	if (symCol != null) {
        		shoClaSpe = ident + " =" + enum_dec + "(" + symCol + ")" + " " + comment;
        	} else {
        		shoClaSpe = ident + " =" + enum_dec + "(" + enum_list + ")" + " " + comment;
        	}
        }
        return shoClaSpe;*/
        return new Short_class_specifier(enum_dec, ident, base_prefix_1, name_1, array_subscripts_1,
                                         class_modification_1, comment, enum_list_1);
      }
    }

    private static class Der_class_specifierVisitor extends modelicaBaseVisitor<Der_class_specifier> {
      @Override
      public Der_class_specifier visitDer_class_specifier(@NotNull modelicaParser.Der_class_specifierContext ctx) {
    	List<String> idents = ctx.IDENT()
    			.stream()
    			.map(IDENT -> IDENT.getText())
    			.collect(toList());
        String ident1 = idents.get(0);
        List<String> ident2 = idents.subList(1, idents.size());    
        List<String> comma = ctx.SYMBOL_COMMA() == null ? null : ctx.SYMBOL_COMMA()
        		.stream()
        		.map(SYMBOL_COMMA -> SYMBOL_COMMA.getText())
        		.collect(toList());      
        NameVisitor nameVisitor = new NameVisitor();
        String name_1 = ctx.name().accept(nameVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = ctx.comment().accept(commentVisitor);
        return new Der_class_specifier(ident1, comma, ident2, name_1, comment_1);
      }
    }

    private static class Base_prefixVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitBase_prefix(@NotNull modelicaParser.Base_prefixContext ctx) {
        Type_prefixVisitor type_prefixVisitor = new Type_prefixVisitor();
        String basPreStr = ctx.type_prefix().accept(type_prefixVisitor);
        return basPreStr;
        //return new Base_prefix(type_prefix_1);
      }
    }

    private static class Enum_listVisitor extends modelicaBaseVisitor<Enum_list> {
      @Override
      public Enum_list visitEnum_list(@NotNull modelicaParser.Enum_listContext ctx) {
        Enumeration_literalVisitor enumeration_literalVisitor = new Enumeration_literalVisitor();
        List<Enumeration_literal> enumeration_literal_1 = ctx.enumeration_literal()
                .stream()
                .map(enumeration_literal -> enumeration_literal.accept(enumeration_literalVisitor))
                .collect(toList());
        return new Enum_list(enumeration_literal_1);
      }
    }

    private static class Enumeration_literalVisitor extends modelicaBaseVisitor<Enumeration_literal> {
      @Override
      public Enumeration_literal visitEnumeration_literal(@NotNull modelicaParser.Enumeration_literalContext ctx) {
        String ident = ctx.IDENT().getText();
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = ctx.comment().accept(commentVisitor);
        return new Enumeration_literal(ident, comment_1);
      }
    }

    private static class CompositionVisitor extends modelicaBaseVisitor<Composition> {
      @Override
      public Composition visitComposition(@NotNull modelicaParser.CompositionContext ctx) {
        List<String> public_dec = ctx.PUBLIC() == null ? null : ctx.PUBLIC()
        		.stream()
        		.map(PUBLIC -> PUBLIC.getText())
        		.collect(toList());
        List<String> protected_dec = ctx.PROTECTED() == null ? null : ctx.PROTECTED()
        		.stream()
        		.map(PROTECTED -> PROTECTED.getText())
        		.collect(toList());
        String external_dec = 
        		ctx.EXTERNAL() == null ? null : ctx.EXTERNAL().getText();
        Element_listVisitor element_listVisitor = new Element_listVisitor();
        List<Element_list> element_lists = ctx.element_list()
                .stream()
                .map(element_list -> element_list.accept(element_listVisitor))
                .collect(toList());
        Element_list element_list1 = element_lists.get(0);        
        List<Element_list> element_list2 = 
        		element_lists.size() < 2 ? null : element_lists.subList(1,element_lists.size()); 
        Equation_sectionVisitor equation_sectionVisitor = new Equation_sectionVisitor();
        List<Equation_section> equation_section_1 = ctx.equation_section() == null ? null : ctx.equation_section()
                .stream()
                .map(equation_section -> equation_section.accept(equation_sectionVisitor))
                .collect(toList());
        Algorithm_sectionVisitor algorithm_sectionVisitor = new Algorithm_sectionVisitor();
        List<String> algorithm_section_1 = ctx.algorithm_section() == null ? null : ctx.algorithm_section()
                .stream()
                .map(algorithm_section -> algorithm_section.accept(algorithm_sectionVisitor))
                .collect(toList());
        Language_specificationVisitor language_specificationVisitor = new Language_specificationVisitor();
        String language_specification_1 = 
        		ctx.language_specification() == null ? null : ctx.language_specification().accept(language_specificationVisitor);
        External_function_callVisitor external_function_callVisitor = new External_function_callVisitor();
        String external_function_call_1 = 
        		ctx.external_function_call() == null ? null : ctx.external_function_call().accept(external_function_callVisitor);
        AnnotationVisitor annotationVisitor = new AnnotationVisitor();
        List<String> annotations = ctx.annotation() == null ? null : ctx.annotation()
                .stream()
                .map(annotation -> annotation.accept(annotationVisitor))
                .collect(toList());
        String annotation1 = null;
        String annotation2 = null;
        if (annotations.size() == 2) {
        	annotation1 = annotations.get(0);
        	annotation2 = annotations.get(1);
        } else if (annotations.size() == 1 && external_dec != null) {
        	annotation1 = annotations.get(0);
        } else if (annotations.size() == 1 && external_dec == null) {
        	annotation2 = annotations.get(0);
        } else {
        	annotation1 = null;
            annotation2 = null;
        }
        return new Composition(external_dec, public_dec, protected_dec, element_list1, element_list2,
                               equation_section_1, algorithm_section_1, language_specification_1, external_function_call_1,
                               annotation1, annotation2);
      }
    }

    private static class Language_specificationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitLanguage_specification(@NotNull modelicaParser.Language_specificationContext ctx) {
        String string = ctx.STRING().getText();
        return string;
        //return new Language_specification(ident);
      }
    }

    private static class External_function_callVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitExternal_function_call(@NotNull modelicaParser.External_function_callContext ctx) {
    	  String ident = ctx.IDENT().getText();
    	  Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
    	  String component_reference_1 = 
    			  ctx.component_reference() == null ? null : ctx.component_reference().accept(component_referenceVisitor);
    	  Expression_listVisitor expression_listVisitor = new Expression_listVisitor();
    	  String expression_list_1 = 
    			  ctx.expression_list() == null ? "" : ctx.expression_list().accept(expression_listVisitor);
    	  String extFunCalStr = (component_reference_1 != null) ? 
    			  (component_reference_1 + "=" + ident + "(" + expression_list_1 + ")")
    			  : (ident + "(" + expression_list_1 + ")");
    	  return extFunCalStr;   
    	  //return new External_function_call(ident, component_reference_1, expression_list_1);
      }
    }

    private static class Element_listVisitor extends modelicaBaseVisitor<Element_list> {
      @Override
      public Element_list visitElement_list(@NotNull modelicaParser.Element_listContext ctx) {
        ElementVisitor elementVisitor = new ElementVisitor();
        List<Element> element_1 = ctx.element() == null ? null : ctx.element()
                .stream()
                .map(element -> element.accept(elementVisitor))
                .collect(toList());
        return new Element_list(element_1);
      }
    }

    private static class ElementVisitor extends modelicaBaseVisitor<Element> {
      @Override
      public Element visitElement(@NotNull modelicaParser.ElementContext ctx) {
        String red_dec = 
        		ctx.REDECLARE() == null ? null : ctx.REDECLARE().getText();
        String final_dec = 
        		ctx.FINAL() == null ? null : ctx.FINAL().getText();
        String inner_dec = 
        		ctx.INNER() == null ? null : ctx.INNER().getText();
        String outer_der = 
        		ctx.OUTER() == null ? null : ctx.OUTER().getText();
        String rep_dec = 
        		ctx.REPLACEABLE() == null ? null : ctx.REPLACEABLE().getText();
        Class_definition class_definition1;
        Class_definition class_definition2;
        Component_clause component_clause1;
        Component_clause component_clause2;
        if (rep_dec != null) {
          Class_definitionVisitor class_definitionVisitor = new Class_definitionVisitor();
          class_definition2 = 
        		  ctx.class_definition() == null ? null : ctx.class_definition().accept(class_definitionVisitor);
          Component_clauseVisitor component_clauseVisitor = new Component_clauseVisitor();
          component_clause2 = 
        		  ctx.component_clause() == null ? null : ctx.component_clause().accept(component_clauseVisitor);
          class_definition1 = null;
          component_clause1 = null;
        } else {
          Class_definitionVisitor class_definitionVisitor = new Class_definitionVisitor();
          class_definition1 = 
        		  ctx.class_definition() == null ? null : ctx.class_definition().accept(class_definitionVisitor);
          Component_clauseVisitor component_clauseVisitor = new Component_clauseVisitor();
          component_clause1 = 
        		  ctx.component_clause() == null ? null : ctx.component_clause().accept(component_clauseVisitor);
          class_definition2 = null;
          component_clause2 = null;
        }
        Import_clauseVisitor import_clauseVisitor = new Import_clauseVisitor();
        Import_clause import_clause_1 = 
        		ctx.import_clause() == null ? null : ctx.import_clause().accept(import_clauseVisitor);
        Extends_clauseVisitor extends_clauseVisitor = new Extends_clauseVisitor();
        Extends_clause extends_clause_1 = 
        		ctx.extends_clause() == null ? null : ctx.extends_clause().accept(extends_clauseVisitor);
        Constraining_clauseVisitor constraining_clauseVisitor = new Constraining_clauseVisitor();
        String constraining_clause_1 = 
        		ctx.constraining_clause() == null ? null : ctx.constraining_clause().accept(constraining_clauseVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = 
        		ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        return new Element(red_dec, final_dec, inner_dec, outer_der, rep_dec, import_clause_1,
                           extends_clause_1, class_definition1, class_definition2,
                           component_clause1, component_clause2, constraining_clause_1, comment_1);
      }
    }

    private static class Import_clauseVisitor extends modelicaBaseVisitor<Import_clause> {
      @Override
      public Import_clause visitImport_clause(@NotNull modelicaParser.Import_clauseContext ctx) {
        String import_dec = ctx.IMPORT().getText();
        String ident = 
        		ctx.IDENT() == null ? null : ctx.IDENT().getText();
        String dotStar = 
        		ctx.SYMBOL_DOTSTAR() == null ? null : ctx.SYMBOL_DOTSTAR().getText();
        Import_listVisitor import_listVisitor = new Import_listVisitor();
        String import_list_1 = 
        		ctx.import_list() == null ? null : ctx.import_list().accept(import_listVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = ctx.comment().accept(commentVisitor);
        NameVisitor nameVisitor = new NameVisitor();
        String name_1 = ctx.name().accept(nameVisitor);
        return new Import_clause(import_dec, ident, dotStar, name_1, import_list_1, comment_1);
      }
    }

    private static class Import_listVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitImport_list(@NotNull modelicaParser.Import_listContext ctx) {
    	  List<String> ident = ctx.IDENT()
    			  .stream()
    			  .map(IDENT -> IDENT.getText())
    			  .collect(toList());
    	  String impLisStr = ident.get(0);
    	  if (ident.size()>1) {
    		  for (int i=1; i<ident.size(); i++) {
    			  impLisStr = impLisStr + "," + ident.get(i);
    		  }
    	  }
    	  return impLisStr;
    	  //return new Import_list(ident);
      }
    }

    private static class Extends_clauseVisitor extends modelicaBaseVisitor<Extends_clause> {
      @Override
      public Extends_clause visitExtends_clause(@NotNull modelicaParser.Extends_clauseContext ctx) {
        String ext_dec = ctx.EXTENDS().getText();
        NameVisitor nameVisitor = new NameVisitor();
        String name_1 = ctx.name().accept(nameVisitor);
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        String class_modification_1 = 
        		ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        AnnotationVisitor annotationVisitor = new AnnotationVisitor();
        String annotation_1 = 
        		ctx.annotation() == null ? null : ctx.annotation().accept(annotationVisitor);
        return new Extends_clause(ext_dec, name_1, class_modification_1, annotation_1);
      }
    }

    private static class Constraining_clauseVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitConstraining_clause(@NotNull modelicaParser.Constraining_clauseContext ctx) {
        String constrain_dec = ctx.CONSTRAINEDBY().getText();
        NameVisitor nameVisitor = new NameVisitor();
        String name_1 = ctx.name().accept(nameVisitor);
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        String class_modification_1 = 
        		ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        String conClaStr = constrain_dec + " " + name_1;
        if (class_modification_1 != null) {conClaStr = conClaStr + " " +class_modification_1; }
        return conClaStr;
        //return new Constraining_clause(constrain_dec, name_1, class_modification_1);
      }
    }

    private static class Component_clauseVisitor extends modelicaBaseVisitor<Component_clause> {
      @Override
      public Component_clause visitComponent_clause(@NotNull modelicaParser.Component_clauseContext ctx) {
        Type_prefixVisitor type_prefixVisitor = new Type_prefixVisitor();
        String type_prefix_1 = 
        		ctx.type_prefix() == null ? null : ctx.type_prefix().accept(type_prefixVisitor);
        Type_specifierVisitor type_specifierVisitor = new Type_specifierVisitor();
        String type_specifier_1 = ctx.type_specifier().accept(type_specifierVisitor);
        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        String array_subscripts_1 = 
        		ctx.array_subscripts() == null ? null : ctx.array_subscripts().accept(array_subscriptsVisitor);
        Component_listVisitor component_listVisitor = new Component_listVisitor();
        Component_list component_list_1 = ctx.component_list().accept(component_listVisitor);
        return new Component_clause(type_prefix_1, type_specifier_1, array_subscripts_1, component_list_1);
      }
    }

    private static class Type_prefixVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitType_prefix(@NotNull modelicaParser.Type_prefixContext ctx) {
    	  String flow_dec = 
    			  ctx.FLOW() == null ? null : ctx.FLOW().getText();
    	  String stream_dec = 
    			  ctx.STREAM() == null ? null : ctx.STREAM().getText();
    	  String disc_dec = 
    			  ctx.DISCRETE() == null ? null : ctx.DISCRETE().getText();
    	  String par_dec = 
    			  ctx.PARAMETER() == null ? null : ctx.PARAMETER().getText();
    	  String con_dec = 
    			  ctx.CONSTANT() == null ? null : ctx.CONSTANT().getText();
    	  String in_dec = 
    			  ctx.INPUT() == null ? null : ctx.INPUT().getText();
    	  String out_dec = 
    			  ctx.OUTPUT() == null ? null : ctx.OUTPUT().getText();
    	  String prefix = (flow_dec != null) ? flow_dec 
        		        	: (stream_dec != null ? stream_dec
        		        			: (disc_dec != null ? disc_dec 
        		        					: (par_dec != null ? par_dec 
        		        							: (con_dec != null ? con_dec
        		        									: (in_dec != null ? in_dec
        		        											: out_dec)))));
    	  return prefix;        
    	  //return new Type_prefix(flow_dec, stream_dec, disc_dec, par_dec,
    	  //                       con_dec, in_dec, out_dec);
      }
    }

    private static class Type_specifierVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitType_specifier(@NotNull modelicaParser.Type_specifierContext ctx) {
        NameVisitor nameVisitor = new NameVisitor();
        String specifier = ctx.name().accept(nameVisitor);
        return specifier;
        //return new Type_specifier(name_1);
      }
    }

    private static class Component_listVisitor extends modelicaBaseVisitor<Component_list> {
      @Override
      public Component_list visitComponent_list(@NotNull modelicaParser.Component_listContext ctx) {
        Component_declarationVisitor component_declarationVisitor = new Component_declarationVisitor();
        List<Component_declaration> component_declaration_1 = ctx.component_declaration()
                .stream()
                .map(component_declaration -> component_declaration.accept(component_declarationVisitor))
                .collect(toList());
        return new Component_list(component_declaration_1);
      }
    }

    private static class Component_declarationVisitor extends modelicaBaseVisitor<Component_declaration> {
      @Override
      public Component_declaration visitComponent_declaration(@NotNull modelicaParser.Component_declarationContext ctx) {
        DeclarationVisitor declarationVisitor = new DeclarationVisitor();
        Declaration declaration_1 = ctx.declaration().accept(declarationVisitor);
        Condition_attributeVisitor condition_attributeVisitor = new Condition_attributeVisitor();
        String condition_attribute_1 = 
        		ctx.condition_attribute() == null ? null : ctx.condition_attribute().accept(condition_attributeVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = 
        		ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        return new Component_declaration(declaration_1, condition_attribute_1, comment_1);
      }
    }

    private static class Condition_attributeVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitCondition_attribute(@NotNull modelicaParser.Condition_attributeContext ctx) {
        String if_dec = ctx.IF().getText();
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        String expression_1 = ctx.expression().accept(expressionVisitor);
        String conAttStr = if_dec + " " + expression_1;
        return conAttStr;
        // return new Condition_attribute(if_dec, expression_1);
      }
    }

    private static class DeclarationVisitor extends modelicaBaseVisitor<Declaration> {
      @Override
      public Declaration visitDeclaration(@NotNull modelicaParser.DeclarationContext ctx) {
        String ident = ctx.IDENT().getText();
        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        String array_subscripts_1 = 
        		ctx.array_subscripts() == null ? null : ctx.array_subscripts().accept(array_subscriptsVisitor);
        ModificationVisitor modificationVisitor = new ModificationVisitor();
        String modification_1 = 
        		ctx.modification() == null ? null : ctx.modification().accept(modificationVisitor);
        return new Declaration(ident, array_subscripts_1, modification_1);
      }
    }

    private static class ModificationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitModification(@NotNull modelicaParser.ModificationContext ctx) {
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        String class_modification_1 = 
        		ctx.class_modification() == null ? null : ctx.class_modification().accept(class_modificationVisitor);
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        String expression_1 = 
        		ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
        String eqSymb = ctx.SYMBOL_EQUAL() == null ? null : ctx.SYMBOL_EQUAL().getText();
        String colEqSymb = ctx.SYMBOL_COLONEQUAL() == null ? null : ctx.SYMBOL_COLONEQUAL().getText();
        String modStr = "";
        if (class_modification_1 != null) {
        	if (expression_1 != null) {
        		modStr = class_modification_1 + "=" + expression_1;
        	} else {
        		modStr = class_modification_1;
        	}
        } else if (eqSymb != null && expression_1 != null) {
        	modStr = eqSymb + expression_1;
        } else if (colEqSymb != null && expression_1 != null) {
        	modStr = colEqSymb + expression_1;
        }
        
        return modStr;       
        // return new Modification(class_modification_1, eqSymb, colEqSymb, expression_1);
      }
    }

    private static class Class_modificationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitClass_modification(@NotNull modelicaParser.Class_modificationContext ctx) {
        Argument_listVisitor argument_listVisitor = new Argument_listVisitor();
        String argument_list_1 = 
        		ctx.argument_list() == null ? null : ctx.argument_list().accept(argument_listVisitor);
        String claModStr = "(" + argument_list_1 + ")";
        return claModStr;
        //return new Class_modification(argument_list_1);
      }
    }

    private static class Argument_listVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitArgument_list(@NotNull modelicaParser.Argument_listContext ctx) {
        ArgumentVisitor argumentVisitor = new ArgumentVisitor();
        List<String> argument_1 = ctx.argument()
                .stream()
                .map(argument -> argument.accept(argumentVisitor))
                .collect(toList());
        String argLisStr = argument_1.get(0);
        if (argument_1.size()>1) {
        	for (int i=1; i<argument_1.size(); i++) {
        		argLisStr = argLisStr + "," + argument_1.get(i);
        	}
        }        
        return argLisStr;
        //return new Argument_list(argument_1);
      }
    }

    private static class ArgumentVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitArgument(@NotNull modelicaParser.ArgumentContext ctx) {
        Element_modification_or_replaceableVisitor element_modification_or_replaceableVisitor = new Element_modification_or_replaceableVisitor();
        String element_modification_or_replaceable_1 = 
        		ctx.element_modification_or_replaceable() == null ? null : ctx.element_modification_or_replaceable().accept(element_modification_or_replaceableVisitor);
        Element_redeclarationVisitor element_redeclarationVisitor = new Element_redeclarationVisitor();
        String element_redeclaration_1 = 
        		ctx.element_redeclaration() == null ? null : ctx.element_redeclaration().accept(element_redeclarationVisitor);
        String argStr = (element_redeclaration_1 != null) ? element_redeclaration_1 : element_modification_or_replaceable_1;      
        return argStr;
        //return new Argument(element_modification_or_replaceable_1, element_redeclaration_1);
      }
    }

    private static class Element_modification_or_replaceableVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitElement_modification_or_replaceable(@NotNull modelicaParser.Element_modification_or_replaceableContext ctx) {
        String each_dec = 
        		ctx.EACH() == null ? null : ctx.EACH().getText();
        String final_dec = 
        		ctx.FINAL() == null ? null : ctx.FINAL().getText();
        Element_modificationVisitor element_modificationVisitor = new Element_modificationVisitor();
        String element_modification_1 = 
        		ctx.element_modification() == null ? null : ctx.element_modification().accept(element_modificationVisitor);
        Element_replaceableVisitor element_replaceableVisitor = new Element_replaceableVisitor();
        String element_replaceable_1 = 
        		ctx.element_replaceable() == null ? null : ctx.element_replaceable().accept(element_replaceableVisitor);
        String eleModRep = "";
        if (each_dec != null) {eleModRep = eleModRep + each_dec + " ";}
        if (final_dec != null) {eleModRep = eleModRep + final_dec + " ";}
        if (element_modification_1 != null) {
        	eleModRep = eleModRep + element_modification_1;      	
        } else {
        	eleModRep = eleModRep + element_replaceable_1;
        }
        
        return eleModRep;
        //return new Element_modification_or_replaceable(each_dec, final_dec, element_modification_1, element_replaceable_1);
      }
    }

    private static class Element_modificationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitElement_modification(@NotNull modelicaParser.Element_modificationContext ctx) {
        NameVisitor nameVisitor = new NameVisitor();
        String name_1 = ctx.name().accept(nameVisitor);
        ModificationVisitor modificationVisitor = new ModificationVisitor();
        String modification_1 = 
        		ctx.modification() == null ? null : ctx.modification().accept(modificationVisitor);        
        //String modStr = String.valueOf(modification_1);
        String_commentVisitor string_commentVisitor = new String_commentVisitor();
        String string_comment_1 = ctx.string_comment().accept(string_commentVisitor);
        String eleModStr = (modification_1 == null) 
        		           ? (name_1 + " " + string_comment_1)
        		           : (name_1 + " " + modification_1 + " " + string_comment_1);
        return eleModStr;		    
        //return new Element_modification(name_1, modification_1, string_comment_1);
      }
    }

    private static class Element_redeclarationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitElement_redeclaration(@NotNull modelicaParser.Element_redeclarationContext ctx) {
        String red_dec = ctx.REDECLARE().getText();
        String each_dec = 
        		ctx.EACH() == null ? null : ctx.EACH().getText();
        String final_dec = 
        		ctx.FINAL() == null ? null : ctx.FINAL().getText();
        Short_class_definitionVisitor short_class_definitionVisitor = new Short_class_definitionVisitor();
        String shoClaDefStr = 
        		ctx.short_class_definition() == null ? null : ctx.short_class_definition().accept(short_class_definitionVisitor);
        //String shoClaDefStr = String.valueOf(short_class_definition_1);
        Component_clause1Visitor component_clause1Visitor = new Component_clause1Visitor();       
        String component_clause1_1 = 
        		ctx.component_clause1() == null ? null : ctx.component_clause1().accept(component_clause1Visitor);
        Element_replaceableVisitor element_replaceableVisitor = new Element_replaceableVisitor();
        String element_replaceable_1 = 
        		ctx.element_replaceable() == null ? null : ctx.element_replaceable().accept(element_replaceableVisitor);
        String eleRedStr = red_dec + " ";
        if (each_dec != null) {eleRedStr = eleRedStr + each_dec + " ";}
        if (final_dec != null) {eleRedStr = eleRedStr + final_dec + " ";}
        if (element_replaceable_1 != null) {
        	eleRedStr = eleRedStr + element_replaceable_1;
        } else {
        	if (shoClaDefStr != null) {
        		eleRedStr = eleRedStr + shoClaDefStr;
        	} else {
        		eleRedStr = eleRedStr + component_clause1_1;
        	}
        }
        return eleRedStr;      
        //return new Element_redeclaration(red_dec, each_dec, final_dec, short_class_definition_1, component_clause1_1, element_replaceable_1);
      }
    }

    private static class Element_replaceableVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitElement_replaceable(@NotNull modelicaParser.Element_replaceableContext ctx) {
        String rep_dec = ctx.REPLACEABLE().getText();
        Short_class_definitionVisitor short_class_definitionVisitor = new Short_class_definitionVisitor();
        String shoClaDefStr = 
        		ctx.short_class_definition() == null ? null : ctx.short_class_definition().accept(short_class_definitionVisitor);
        //String shoClaDefStr = String.valueOf(short_class_definition_1);
        Component_clause1Visitor component_clause1Visitor = new Component_clause1Visitor();
        String component_clause1_1 = 
        		ctx.component_clause1() == null ? null : ctx.component_clause1().accept(component_clause1Visitor);
        Constraining_clauseVisitor constraining_clauseVisitor = new Constraining_clauseVisitor();
        String constraining_clause_1 = 
        		ctx.constraining_clause() == null ? null : ctx.constraining_clause().accept(constraining_clauseVisitor);
        String eleRepStr = rep_dec + " ";
        if (component_clause1_1 == null) {
        	eleRepStr = eleRepStr + shoClaDefStr;
        } else {
        	eleRepStr = eleRepStr + component_clause1_1;
        }
        if (constraining_clause_1 != null) {
        	eleRepStr = eleRepStr + constraining_clause_1;
        }
        return eleRepStr;
        //return new Element_replaceable(rep_dec, short_class_definition_1, component_clause1_1, constraining_clause_1);
      }
    }

    private static class Component_clause1Visitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitComponent_clause1(@NotNull modelicaParser.Component_clause1Context ctx) {
        Type_prefixVisitor type_prefixVisitor = new Type_prefixVisitor();
        String type_prefix_1 = ctx.type_prefix().accept(type_prefixVisitor);
        Type_specifierVisitor type_specifierVisitor = new Type_specifierVisitor();
        String type_specifier_1 = ctx.type_specifier().accept(type_specifierVisitor);
        Component_declaration1Visitor component_declaration1Visitor = new Component_declaration1Visitor();
        String component_declaration1_1 = ctx.component_declaration1().accept(component_declaration1Visitor);
        String comCla1Str = type_prefix_1 + " " + type_specifier_1 + " " + component_declaration1_1;
        return comCla1Str;
        //return new Component_clause1(type_prefix_1, type_specifier_1, component_declaration1_1);
      }
    }

    private static class Component_declaration1Visitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitComponent_declaration1(@NotNull modelicaParser.Component_declaration1Context ctx) {
        DeclarationVisitor declarationVisitor = new DeclarationVisitor();
        Declaration declaration_1 = ctx.declaration().accept(declarationVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = ctx.comment().accept(commentVisitor);        
        String comStr = String.valueOf(comment_1);
        String comDec1Str = declaration_1 + " " + comStr;
        return comDec1Str;
        //return new Component_declaration1(declaration_1, comment_1);
      }
    }

    private static class Short_class_definitionVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitShort_class_definition(@NotNull modelicaParser.Short_class_definitionContext ctx) {
        Class_prefixesVisitor class_prefixesVisitor = new Class_prefixesVisitor();
        String class_prefixes_1 
        	= ctx.class_prefixes().accept(class_prefixesVisitor);
        Short_class_specifierVisitor short_class_specifierVisitor = new Short_class_specifierVisitor();
        Short_class_specifier shortClaSpe = ctx.short_class_specifier().accept(short_class_specifierVisitor);
        String shortClaSpeStr;
        String comeStr;
    	if (shortClaSpe.comment != null) {
    		if (shortClaSpe.comment.string_comment == null && shortClaSpe.comment.annotation == null) {
    			comeStr = "";
    		} else if (shortClaSpe.comment.string_comment == null && shortClaSpe.comment.annotation != null) {
    			comeStr = "annotation (" + shortClaSpe.comment.annotation.toString() + ")";
    		} else if (shortClaSpe.comment.string_comment != null && shortClaSpe.comment.annotation == null) {
    			comeStr = shortClaSpe.comment.string_comment;
    		} else {
    			comeStr = shortClaSpe.comment.string_comment + " " 
    					+ "annotation (" + shortClaSpe.comment.annotation.toString() + ")";
    		}
    	} else {
    		comeStr = "";
    	}
        if (shortClaSpe.base_prefix != null || shortClaSpe.inputName != null) {       	
        	shortClaSpeStr = shortClaSpe.className + " =" + (shortClaSpe.base_prefix == null ? "" : (shortClaSpe.base_prefix+ " ")) 
        			+ (shortClaSpe.inputName == null ? "" : (shortClaSpe.inputName+" ")) 
        			+ (shortClaSpe.array_subscripts == null ? "" : (shortClaSpe.array_subscripts+" ")) 
        			+ (shortClaSpe.class_modification == null ? "" : (shortClaSpe.class_modification+" ")) 
        			+ comeStr;      	
        } else {
        	String listStr;
        	if (shortClaSpe.list_colon == null) {
        		listStr = shortClaSpe.enum_list == null ? "" : shortClaSpe.enum_list.toString();        	
        	} else {
        		listStr = shortClaSpe.list_colon;
        	}
        	shortClaSpeStr = shortClaSpe.className + " =" + shortClaSpe.prefix + "(" + listStr + ")" + comeStr;
        }                           
        String shoClaDef = class_prefixes_1 + " " + shortClaSpeStr;     
        return shoClaDef;
        //return new Short_class_definition(class_prefixes_1, short_class_specifier_1);
      }
    }

    private static class Equation_sectionVisitor extends modelicaBaseVisitor<Equation_section> {
      @Override
      public Equation_section visitEquation_section(@NotNull modelicaParser.Equation_sectionContext ctx) {
        String init_dec = 
        		ctx.INITIAL() == null ? null : ctx.INITIAL().getText();
        String equ_dec = ctx.EQUATION().getText();
        EquationVisitor equationVisitor = new EquationVisitor();
        List<Equation> equation_1 = ctx.equation() == null ? null : ctx.equation()
                .stream()
                .map(equation -> equation.accept(equationVisitor))
                .collect(toList());
        return new Equation_section(init_dec, equ_dec, equation_1);
      }
    }

    private static class Algorithm_sectionVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitAlgorithm_section(@NotNull modelicaParser.Algorithm_sectionContext ctx) {
        String init_dec = 
        		ctx.INITIAL() == null ? null : ctx.INITIAL().getText();
        String alg_dec = ctx.ALGORITHM().getText();
        StatementVisitor statementVisitor = new StatementVisitor();
        List<String> statement_1 = ctx.statement() == null ? null : ctx.statement()
                .stream()
                .map(statement -> statement.accept(statementVisitor))
                .collect(toList());
        String algSecStr = (init_dec != null) ? (init_dec + " " + alg_dec) : alg_dec;
        if (statement_1.size()>0) {
        	algSecStr = algSecStr + "\n";
        	for (int i=0; i<statement_1.size(); i++) {
        		algSecStr = algSecStr + statement_1 + ";" + "\n";
        	}
        }
        return algSecStr;
        //return new Algorithm_section(init_dec, alg_dec, statement_1);
      }
    }

    private static class EquationVisitor extends modelicaBaseVisitor<Equation> {
      @Override
      public Equation visitEquation(@NotNull modelicaParser.EquationContext ctx) {
        Simple_expressionVisitor simple_expressionVisitor = new Simple_expressionVisitor();
        String simple_expression_1 = 
        		ctx.simple_expression() == null ? null : ctx.simple_expression().accept(simple_expressionVisitor);
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        String expression_1 = 
        		ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
        If_equationVisitor if_equationVisitor = new If_equationVisitor();
        String if_equation_1 = 
        		ctx.if_equation() == null ? null : ctx.if_equation().accept(if_equationVisitor);
        For_equationVisitor for_equationVisitor = new For_equationVisitor();
        String for_equation_1 = 
        		ctx.for_equation() == null ? null : ctx.for_equation().accept(for_equationVisitor);
        Connect_clauseVisitor connect_clauseVisitor = new Connect_clauseVisitor();
        Connect_clause connect_clause_1 = 
        		ctx.connect_clause() == null ? null : ctx.connect_clause().accept(connect_clauseVisitor);
        When_equationVisitor when_equationVisitor = new When_equationVisitor();
        String when_equation_1 = 
        		ctx.when_equation() == null ? null : ctx.when_equation().accept(when_equationVisitor);
        NameVisitor nameVisitor = new NameVisitor();
        String name_1 = 
        		ctx.name() == null ? null : ctx.name().accept(nameVisitor);
        Function_call_argsVisitor function_call_argsVisitor = new Function_call_argsVisitor();
        String function_call_args_1 = 
        		ctx.function_call_args() == null ? null : ctx.function_call_args().accept(function_call_argsVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = 
        		ctx.comment() == null ? null : ctx.comment().accept(commentVisitor);
        //String comStr = String.valueOf(comment_1);
        return new Equation(simple_expression_1, expression_1, if_equation_1, for_equation_1, connect_clause_1,
                            when_equation_1, name_1, function_call_args_1, comment_1);
      }
    }

    private static class StatementVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitStatement(@NotNull modelicaParser.StatementContext ctx) {
        String bre_dec = 
        		ctx.BREAK() == null ? "" : ctx.BREAK().getText();
        String ret_dec = 
        		ctx.RETURN() == null ? "" : ctx.RETURN().getText();
        Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
        String component_reference_1 = 
        		ctx.component_reference() == null ? "" : ctx.component_reference().accept(component_referenceVisitor);
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        String expression_1 = 
        		ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
        Function_call_argsVisitor function_call_argsVisitor = new Function_call_argsVisitor();
        String function_call_args_1 = 
        		ctx.function_call_args() == null ? "" : ctx.function_call_args().accept(function_call_argsVisitor);
        Output_expression_listVisitor output_expression_listVisitor = new Output_expression_listVisitor();
        String output_expression_list_1 = 
        		ctx.output_expression_list() == null ? null : ctx.output_expression_list().accept(output_expression_listVisitor);
        If_statementVisitor if_statementVisitor = new If_statementVisitor();
        String if_statement_1 = 
        		ctx.if_statement() == null ? "" : ctx.if_statement().accept(if_statementVisitor);
        For_statementVisitor for_statementVisitor = new For_statementVisitor();
        String for_statement_1 = 
        		ctx.for_statement() == null ? "" : ctx.for_statement().accept(for_statementVisitor);
        While_statementVisitor while_statementVisitor = new While_statementVisitor();
        String while_statement_1 = 
        		ctx.while_statement() == null ? "" : ctx.while_statement().accept(while_statementVisitor);
        When_statementVisitor when_statementVisitor = new When_statementVisitor();
        String when_statement_1 = 
        		ctx.when_statement() == null ? "" : ctx.when_statement().accept(when_statementVisitor);
        CommentVisitor commentVisitor = new CommentVisitor();
        Comment comment_1 = ctx.comment().accept(commentVisitor);
        String comStr = String.valueOf(comment_1);       
        String temp1 = (expression_1 == null) ? "" : ("=" + expression_1);
        String temp2 = (output_expression_list_1 == null) ? "" 
        		       : ("(" + output_expression_list_1 + ")" + ":=" + component_reference_1 + " " + function_call_args_1);
        String staStr = component_reference_1 + temp1 + function_call_args_1 
        		        + temp2 + bre_dec + ret_dec + if_statement_1 + for_statement_1 + while_statement_1 + when_statement_1 
        		        + comStr;      
        return staStr;
        //return new Statement(bre_dec, ret_dec, component_reference_1, expression_1, function_call_args_1,
        //                    output_expression_list_1, if_statement_1, for_statement_1, while_statement_1, when_statement_1, comment_1);
      }
    }

    // ========= need further refinements =========
    private static class If_equationVisitor extends modelicaBaseVisitor<String> {   	
      @SuppressWarnings("unused")
	@Override
      public String visitIf_equation(@NotNull modelicaParser.If_equationContext ctx) {
        List<String> if_dec = ctx.IF()
        		.stream()
        		.map(IF -> IF.getText())
        		.collect(toList());
        List<String> elseif_dec = ctx.ELSEIF() == null ? null : ctx.ELSEIF()
        		.stream()
        		.map(ELSEIF -> ELSEIF.getText())
        		.collect(toList());
        String else_dec = 
        		ctx.ELSE() == null ? null : ctx.ELSE().getText();
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<String> expressions = ctx.expression()
                .stream()
                .map(expression -> expression.accept(expressionVisitor))
                .collect(toList());
        String expression1 = expressions.get(0);
        List<String> expression2 = null;
        if (elseif_dec.size() > 0) {
        	expression2 = expressions.subList(1, expressions.size());
        }       
        List<Equation> equation1 = null;
        List<Equation> equation2 = null;
        List<Equation> equation3 = null;
        if (if_dec.size() > 0) {
          EquationVisitor equationVisitor = new EquationVisitor();
          equation1 = ctx.equation() == null ? null : ctx.equation()
                  .stream()
                  .map(equation -> equation.accept(equationVisitor))
                  .collect(toList());
        } else if (elseif_dec.size() > 0) {
          EquationVisitor equationVisitor = new EquationVisitor();
          equation2 = ctx.equation() == null ? null : ctx.equation()
                  .stream()
                  .map(equation -> equation.accept(equationVisitor))
                  .collect(toList());
        } else if (else_dec != null) {
          EquationVisitor equationVisitor = new EquationVisitor();
          equation3 = ctx.equation() == null ? null : ctx.equation()
                  .stream()
                  .map(equation -> equation.accept(equationVisitor))
                  .collect(toList());
        }
        List<String> equ1Str = equation1 == null ? null : equation1.stream()
        		                        .map(Equation::toString)
        		                        .collect(Collectors.toList());
        List<String> equ2Str = equation2 == null ? null : equation2.stream()
                						.map(Equation::toString)
                						.collect(Collectors.toList());
        List<String> equ3Str = equation3 == null ? null : equation3.stream()
                						.map(Equation::toString)
                						.collect(Collectors.toList());
        String ifEquStr = "if " + expression1 + " " + "then" + "\n";
        for (int i=0; i<equ1Str.size(); i++) {
        	ifEquStr = ifEquStr + equ1Str.get(i) + ";" + "\n";
        }      
        if (elseif_dec != null) {
        	for (int i=0; i<elseif_dec.size(); i++) {
        		ifEquStr = ifEquStr + elseif_dec.get(i) + " " + expression2.get(i) + " " + "then" + "\n";
        	}
        	if (equ2Str != null) {
        		for (int i=0; i<equ2Str.size(); i++) {
        			ifEquStr = ifEquStr + equ2Str.get(i) + ";" + "\n";
        		}
        	}
        }
        if (else_dec != null) {
        	if (equ3Str != null) {
        		for (int i=0; i<equ3Str.size(); i++) {
        			ifEquStr = ifEquStr + equ3Str.get(i) + ";" + "\n";
        		}
        	}
        }
        ifEquStr = ifEquStr + "end if";
        return ifEquStr;
        //return new If_equation(expression1, equation1, expression2, equation2, equation3);
      }
    }

    // ========= need further refinements =========
    private static class If_statementVisitor extends modelicaBaseVisitor<String> {
       @SuppressWarnings("unused")
	@Override
      public String visitIf_statement(@NotNull modelicaParser.If_statementContext ctx) {
    	   //System.out.printf("token for if_expression 633: %n '%s' %n",ctx.getTokens(633));
        List<String> if_dec = ctx.IF()
        		.stream()
        		.map(IF -> IF.getText())
        		.collect(toList());
        List<String> elseif_dec = ctx.ELSEIF() == null ? null : ctx.ELSEIF()
        		.stream()
        		.map(ELSEIF -> ELSEIF.getText())
        		.collect(toList());        
        String else_dec = 
        		ctx.ELSE() == null ? null : ctx.ELSE().getText();
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<String> expressions = ctx.expression()
                .stream()
                .map(expression -> expression.accept(expressionVisitor))
                .collect(toList());
        String expression1 = expressions.get(0);
        List<String> expression2 = null;
        if (elseif_dec != null) {
        	expression2 = expressions.subList(1, expressions.size());
        }
        List<String> statement1 = null;
        List<String> statement2 = null;
        List<String> statement3 = null;      
        if (if_dec.size()>0) {
          StatementVisitor statementVisitor = new StatementVisitor();
          statement1 = ctx.statement() == null ? null : ctx.statement()
                  .stream()
                  .map(statement -> statement.accept(statementVisitor))
                  .collect(toList());
        } else if (elseif_dec != null) {
          StatementVisitor statementVisitor = new StatementVisitor();
          statement2 = ctx.statement() == null ? null : ctx.statement()
                  .stream()
                  .map(statement -> statement.accept(statementVisitor))
                  .collect(toList());
        } else if (else_dec != null) {
          StatementVisitor statementVisitor = new StatementVisitor();
          statement3 = ctx.statement() == null ? null : ctx.statement()
                  .stream()
                  .map(statement -> statement.accept(statementVisitor))
                  .collect(toList());
        }
        String ifStaStr = "if " + expression1 + " " + "then" + "\n";
        for (int i=0; i<statement1.size(); i++) {
        	ifStaStr = ifStaStr + statement1.get(i) + ";" + "\n";
        }      
        if (elseif_dec != null) {
        	for (int i=0; i<elseif_dec.size(); i++) {
        		ifStaStr = ifStaStr + elseif_dec.get(i) + " " + expression2.get(i) + " " + "then" + "\n";
        	}
        	if (statement2 != null) {
        		for (int i=0; i<statement2.size(); i++) {
        			ifStaStr = ifStaStr + statement2.get(i) + ";" + "\n";
        		}
        	}
        }
        if (else_dec != null) {
        	if (statement3 != null) {
        		for (int i=0; i<statement3.size(); i++) {
        			ifStaStr = ifStaStr + statement3.get(i) + ";" + "\n";
        		}
        	}
        }
        ifStaStr = ifStaStr + "end if";
        return ifStaStr;
        //return new If_statement(expression1, statement1, expression2, statement2, statement3);
      }
    }

    private static class For_equationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFor_equation(@NotNull modelicaParser.For_equationContext ctx) {
        For_indicesVisitor for_indicesVisitor = new For_indicesVisitor();
        String for_indices_1 = ctx.for_indices().accept(for_indicesVisitor);
        EquationVisitor equationVisitor = new EquationVisitor();
        List<Equation> equation_1 = ctx.equation() == null ? null : ctx.equation()
                .stream()
                .map(equation -> equation.accept(equationVisitor))
                .collect(toList());
        List<String> equStrList = equation_1.stream()
        		                            .map(Equation::toString)
        		                            .collect(Collectors.toList());
        String forEquStr = "for" + " " + for_indices_1 + "loop" + "\n";
        String tempStr = "";
        for (int i=0; i<equStrList.size(); i++) {
        	tempStr = tempStr + equStrList.get(i) + ";" + "\n";
        }
        forEquStr = forEquStr + tempStr + "end for";
        return forEquStr;       
        //return new For_equation(for_indices_1, equation_1);
      }
    }

    private static class For_statementVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFor_statement(@NotNull modelicaParser.For_statementContext ctx) {
        For_indicesVisitor for_indicesVisitor = new For_indicesVisitor();
        String for_indices_1 = ctx.for_indices().accept(for_indicesVisitor);
        StatementVisitor statementVisitor = new StatementVisitor();
        List<String> statement_1 = ctx.statement() == null ? null : ctx.statement()
                .stream()
                .map(statement -> statement.accept(statementVisitor))
                .collect(toList());
        String forStaStr = "for" + " " + for_indices_1 + "loop" + "\n";
        String tempStr = "";
        for (int i=0; i<statement_1.size(); i++) {
        	tempStr = tempStr + statement_1.get(i) + ";" + "\n";
        }
        forStaStr = forStaStr + tempStr + "end for";
        return forStaStr;
        //return new For_statement(for_indices_1, statement_1);
      }
    }

    private static class For_indicesVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFor_indices(@NotNull modelicaParser.For_indicesContext ctx) {
    	  For_indexVisitor for_indexVisitor = new For_indexVisitor();
    	  List<String> for_index_1 = ctx.for_index()
    			  .stream()
    			  .map(for_index -> for_index.accept(for_indexVisitor))
    			  .collect(toList());
    	  String forIndicesStr = for_index_1.get(0);
    	  if (for_index_1.size() > 1) {
    		  for (int i=1; i<for_index_1.size(); i++) {
    			  forIndicesStr = forIndicesStr + "," + for_index_1.get(i);
    		  }
    	  }
    	  return forIndicesStr;
    	  //return new For_indices(for_index_1);
      }
    }

    private static class For_indexVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFor_index(@NotNull modelicaParser.For_indexContext ctx) {
        String ident = ctx.IDENT().getText();
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        String expression_1 = 
        		ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
        String forIndexStr = ident;
        if (expression_1 != null) {
        	forIndexStr = forIndexStr + " in " + expression_1;
        }
        return forIndexStr;
        //return new For_index(ident, expression_1);
      }
    }

    private static class While_statementVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitWhile_statement(@NotNull modelicaParser.While_statementContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        String expression_1 = ctx.expression().accept(expressionVisitor);
        StatementVisitor statementVisitor = new StatementVisitor();
        List<String> statement_1 = ctx.statement() == null ? null : ctx.statement()
                .stream()
                .map(statement -> statement.accept(statementVisitor))
                .collect(toList());
        String whiStaStr = "while " + expression_1 + "loop" + "\n";
        String tempStr = "";
        for (int i=0; i<statement_1.size(); i++) {
        	tempStr = tempStr + statement_1.get(i) + ";" + "\n";
        }
        whiStaStr = whiStaStr + tempStr + "end while";
        return whiStaStr;
        //return new While_statement(expression_1, statement_1);
      }
    }

    // ========= need further refinements =========
    private static class When_equationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitWhen_equation(@NotNull modelicaParser.When_equationContext ctx) {    	  
    	  //System.out.printf("token for When: %n '%s' %n",ctx.getTokens(728)); 	  
        List<String> when_dec = ctx.WHEN()
        		.stream()
        		.map(WHEN -> WHEN.getText())
        		.collect(toList());
        List<String> elsewhen_dec = ctx.ELSEWHEN() == null ? null : ctx.ELSEWHEN()
        		.stream()
        		.map(ELSEWHEN -> ELSEWHEN.getText())
        		.collect(toList());
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<String> expressions = ctx.expression()
                .stream()
                .map(expression -> expression.accept(expressionVisitor))
                .collect(toList());
        String expression1 = expressions.get(0);
        List<String> expression2 = 
        		elsewhen_dec.size() == 0 ? null : expressions.subList(1, expressions.size());
        List<Equation> equation1 = null;
        List<Equation> equation2 = null;       
        if (when_dec.size()>0) {    
        	EquationVisitor equationVisitor = new EquationVisitor();
        	equation1 = ctx.equation() == null ? null : ctx.equation()
        			.stream()
        			.map(equation -> equation.accept(equationVisitor))
        			.collect(toList());
        	equation2 = null;
        } else {
        	EquationVisitor equationVisitor = new EquationVisitor();
        	equation1 = null;
        	equation2 = ctx.equation() == null ? null : ctx.equation()
        			.stream()
        			.map(equation -> equation.accept(equationVisitor))
        			.collect(toList());
        }        
        List<String> equ1Str = equation1==null? null : equation1.stream()
        		                        .map(Equation::toString)
        		                        .collect(Collectors.toList());
        List<String> equ2Str = equation2==null? null : equation2.stream()
                						.map(Equation::toString)
                						.collect(Collectors.toList());
        String wheEquStr = "when " + expression1 + " then" + "\n";
        if (equ1Str != null) {
        	String tempStr = "";
        	for (int i=0; i<equ1Str.size(); i++) {
        		tempStr = tempStr + equ1Str.get(i) + ";" + "\n";
        	}
        	wheEquStr = wheEquStr + tempStr;
        }
        if (expression2 != null) {
        	for (int i=0; i<expression2.size(); i++) {
        		wheEquStr = wheEquStr + "elsewhen " + expression2.get(i) +  " then" + "\n";
        	}
        }
        if (equ2Str != null) {
        	String tempStr = "";
        	for (int i=0; i<equ2Str.size(); i++) {
        		tempStr = tempStr + equ2Str.get(i) + ";" + "\n";
        	}
        	wheEquStr = wheEquStr + tempStr;
        }
        wheEquStr = wheEquStr + "end when";
        return wheEquStr;        
        //return new When_equation(expression1, equation1, expression2, equation2);
      }
    }

    // ========= need further refinements =========
    private static class When_statementVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitWhen_statement(@NotNull modelicaParser.When_statementContext ctx) {
        List<String> when_dec = ctx.WHEN()
        		.stream()
        		.map(WHEN -> WHEN.getText())
        		.collect(toList());
        List<String> elsewhen_dec = ctx.ELSEWHEN() == null ? null : ctx.ELSEWHEN()
        		.stream()
        		.map(ELSEWHEN -> ELSEWHEN.getText())
        		.collect(toList());
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<String> expressions = ctx.expression()
                .stream()
                .map(expression -> expression.accept(expressionVisitor))
                .collect(toList());
        String expression1 = expressions.get(0);
        List<String> expression2 = null;
        if (elsewhen_dec != null) {
        	expression2 = expressions.subList(1, expressions.size());
        }
        List<String> statement1 = null;
        List<String> statement2 = null;
        if (when_dec != null) {     
          StatementVisitor statementVisitor = new StatementVisitor();
          statement1 = ctx.statement() == null ? null : ctx.statement()
                  .stream()
                  .map(statement -> statement.accept(statementVisitor))
                  .collect(toList());
        } else if (elsewhen_dec != null) {
          StatementVisitor statementVisitor = new StatementVisitor();
          statement2 = ctx.statement() == null ? null : ctx.statement()
                  .stream()
                  .map(statement -> statement.accept(statementVisitor))
                  .collect(toList());
        }
        
        String wheStaStr = "when " + expression1 + " then" + "\n";
        if (statement1 != null) {
        	String tempStr = "";
        	for (int i=0; i<statement1.size(); i++) {
        		tempStr = tempStr + statement1.get(i) + ";" + "\n";
        	}
        	wheStaStr = wheStaStr + tempStr;
        }
        if (expression2 != null) {
        	for (int i=0; i<expression2.size(); i++) {
        		wheStaStr = wheStaStr + "elsewhen " + expression2.get(i) +  " then" + "\n";
        	}
        }
        if (statement2 != null) {
        	String tempStr = "";
        	for (int i=0; i<statement2.size(); i++) {
        		tempStr = tempStr + statement2.get(i) + ";" + "\n";
        	}
        	wheStaStr = wheStaStr + tempStr;
        }
        wheStaStr = wheStaStr + "end when";
        return wheStaStr;                  
        //return new When_statement(expression1, statement1, expression2, statement2);
      }
    }

    private static class Connect_clauseVisitor extends modelicaBaseVisitor<Connect_clause> {
      @Override
      public Connect_clause visitConnect_clause(@NotNull modelicaParser.Connect_clauseContext ctx) {
        Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
        List<String> component_reference_1 = ctx.component_reference()
                .stream()
                .map(component_reference -> component_reference.accept(component_referenceVisitor))
                .collect(toList());
        return new Connect_clause(component_reference_1.get(0), component_reference_1.get(1));
      }
    }

    // ========= need further refinements to specify the expression3 and expression4 =========
    // ========= should be aware of using ".add" function =========
    private static class ExpressionVisitor extends modelicaBaseVisitor<String> {
	@Override
      public String visitExpression(@NotNull modelicaParser.ExpressionContext ctx) {
        Simple_expressionVisitor simple_expressionVisitor = new Simple_expressionVisitor();
        String simple_expression_1 = 
        		ctx.simple_expression() == null ? null : ctx.simple_expression().accept(simple_expressionVisitor);
    	List<String> elseif_dec = ctx.ELSEIF() == null ? null : ctx.ELSEIF()
          		.stream()
          		.map(ELSEIF -> ELSEIF.getText())
          		.collect(toList());
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<String> expressions = ctx.expression() == null ? null : ctx.expression()
        		.stream()
        		.map(expression -> expression.accept(expressionVisitor))
        		.collect(toList());       
        String expression1 = 
        		expressions.size()>0 ? expressions.get(0) : null;
        String expression2 = 
        		expressions.size()>0 ? expressions.get(1) : null;
        List<String> expression3 = new ArrayList<>(); 
        List<String> expression4 = new ArrayList<>(); 
        if (elseif_dec.size() == 0) {
        	expression3 = null;
        	expression4 = null;
        } else if (elseif_dec.size() == 1) {
        	expression3 = expressions.subList(2,3);
        	expression4 = expressions.subList(3,4);
        } else {

        	for (int i=1; i<((expressions.size()-3)/2+1); i++) {
        		expression3.add(expressions.get(2*i));
        		expression4.add(expressions.get(2*i+1));
        	}       	
        }
        String expression5 = 
        		expressions.size()>0 ? expressions.get(expressions.size()-1) : null;
        String expStr = simple_expression_1;
        if (simple_expression_1 == null) {
        	if (elseif_dec.size() == 0) {
        		expStr = "if " + expression1 + "\n" 
        				  + "then " + expression2 + "\n" 
        				  + "else " + expression5;
        	} else {
        		String tempStr = "";
        		for (int i=0; i<expression3.size(); i++) {
        			tempStr = tempStr + "elseif " + expression3 + "\n"
        					  + "then " + expression4 + "\n";
        		}
        		expStr = "if " + expression1 + "\n" 
      				     + "then " + expression2 + "\n" 
      				     + tempStr
      				     + "else " + expression5;
        	}
        }
        return expStr;		       		
        //return new Expression(simple_expression_1, expression1, expression2,
        //                      expression3, expression4, expression5);
      }
    }

    private static class Simple_expressionVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitSimple_expression(@NotNull modelicaParser.Simple_expressionContext ctx) {
        Logical_expressionVisitor logical_expressionVisitor = new Logical_expressionVisitor();
        List<String> logical_expressions = ctx.logical_expression()
        		.stream()
        		.map(logical_expression -> logical_expression.accept(logical_expressionVisitor))
        		.collect(toList());
        /*
        Logical_expression logical_expression1 = logical_expressions.get(0);
        Logical_expression logical_expression2 = 
        		logical_expressions.size() > 1 ? logical_expressions.get(1) : null;
        Logical_expression logical_expression3 = 
        		logical_expressions.size() > 2 ? logical_expressions.get(2) : null;
        */
        List<String> colon = ctx.SYMBOL_COLON()==null ? null : ctx.SYMBOL_COLON()
        		.stream()
        		.map(SYMBOL_COLON -> SYMBOL_COLON.getText())
        		.collect(toList());
        String simExpStr = logical_expressions.get(0);
        if (colon != null) {
        	for (int i=0; i<colon.size(); i++) {
        		simExpStr = simExpStr + colon.get(i) + logical_expressions.get(i+1);        		
        	}
        }
        return simExpStr;
        //return new Simple_expression(logical_expression1, logical_expression2, logical_expression3);
      }
    }

    private static class Logical_expressionVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitLogical_expression(@NotNull modelicaParser.Logical_expressionContext ctx) {
    	  List<String> or_decs = ctx.OR() == null ? null : ctx.OR()
    			  .stream()
    			  .map(OR -> OR.getText())
    			  .collect(toList());
    	  Logical_termVisitor logical_termVisitor = new Logical_termVisitor();
    	  List<String> logical_terms = ctx.logical_term()
    			  .stream()
    			  .map(logical_term -> logical_term.accept(logical_termVisitor))
    			  .collect(toList());
        /*
        Logical_term logical_term_1 = logical_terms.get(0);
        List<Logical_term> logical_term_2 = 
        		logical_terms.size()>1 ? logical_terms.subList(1, logical_terms.size()) : null;
        */
    	  String logExpStr = logical_terms.get(0);
    	  if (or_decs != null) {
    		  for (int i=0; i<or_decs.size(); i++) {
    			  logExpStr = logExpStr + " " + or_decs.get(i) + " " + logical_terms.get(i+1);   			  
    		  }
    	  }
    	  return logExpStr;       		
    	  //return new Logical_expression(logical_term_1, or_decs, logical_term_2);
      }
    }

    private static class Logical_termVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitLogical_term(@NotNull modelicaParser.Logical_termContext ctx) {
    	  List<String> and_decs = ctx.AND() == null ? null : ctx.AND()
    			  .stream()
    			  .map(AND -> AND.getText())
    			  .collect(toList());
    	  Logical_factorVisitor logical_factorVisitor = new Logical_factorVisitor();
    	  List<String> logical_factors = ctx.logical_factor()
    			  .stream()
    			  .map(logical_factor -> logical_factor.accept(logical_factorVisitor))
    			  .collect(toList());
        /*
        Logical_factor logical_factor_1 = logical_factors.get(0);
        List<Logical_factor> logical_factor_2 = 
        		logical_factors.size()>1 ? logical_factors.subList(1, logical_factors.size()) : null;
        */
    	  String logTerStr = logical_factors.get(0);
    	  if (and_decs != null) {
    		  for (int i=0; i<and_decs.size(); i++) {
    			  logTerStr = logTerStr + " " + and_decs.get(i) + " " + logical_factors.get(i+1);   			  
    		  }
    	  }
    	  return logTerStr;
        // return new Logical_term(logical_factor_1, and_decs, logical_factor_2);
      }
    }

    private static class Logical_factorVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitLogical_factor(@NotNull modelicaParser.Logical_factorContext ctx) {
        String not_dec = 
        		ctx.NOT() == null ? null : ctx.NOT().getText();
        RelationVisitor relationVisitor = new RelationVisitor();
        String relation = ctx.relation().accept(relationVisitor);
        String logFacStr = 
        		(not_dec != null) ? (not_dec + " " + relation) : (relation);        	
        return logFacStr;
        //return new Logical_factor(not_dec, relation);
      }
    }

    private static class RelationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitRelation(@NotNull modelicaParser.RelationContext ctx) {
    	  Arithmetic_expressionVisitor arithmetic_expressionVisitor = new Arithmetic_expressionVisitor();
    	  List<String> arithmetic_expressions = ctx.arithmetic_expression()
    			  .stream()
    			  .map(arithmetic_expression -> arithmetic_expression.accept(arithmetic_expressionVisitor))
    			  .collect(toList()); 
        /*
        Arithmetic_expression arithmetic_expression1 = arithmetic_expressions.get(0);
        Arithmetic_expression arithmetic_expression2 = 
        		arithmetic_expressions.size()>1 ? arithmetic_expressions.get(1) : null;
        */
    	  Rel_opVisitor rel_opVisitor = new Rel_opVisitor();
    	  String rel_op1 = 
    			  ctx.rel_op() == null ? null : ctx.rel_op().accept(rel_opVisitor);      
    	  String relStr = arithmetic_expressions.get(0);
    	  if (rel_op1 != null) {
    		  relStr = relStr + rel_op1 + arithmetic_expressions.get(1);
    	  }
    	  return relStr;       
        // return new Relation(arithmetic_expression1, rel_op1, arithmetic_expression2);
      }
    }

    private static class Rel_opVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitRel_op(@NotNull modelicaParser.Rel_opContext ctx) {
    	//Rel_opVisitor rel_opVisitor = new Rel_opVisitor();   	
    	//Rel_op ope_dec = ctx.accept(rel_opVisitor);
    	String relOpe = ctx.getText();  
    	return relOpe;
        //return new Rel_op(ope_dec);
      }
    }

    private static class Arithmetic_expressionVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitArithmetic_expression(@NotNull modelicaParser.Arithmetic_expressionContext ctx) {
    	  Add_opVisitor add_opVisitor = new Add_opVisitor();
    	  List<String> add_ops = ctx.add_op() == null ? null : ctx.add_op()
    			  .stream()
    			  .map(add_op -> add_op.accept(add_opVisitor))
    			  .collect(toList());  
    	  TermVisitor termVisitor = new TermVisitor();
    	  List<String> terms = ctx.term()
    			  .stream()
    			  .map(term -> term.accept(termVisitor))
    			  .collect(toList());
        /*
        String add_op1 = null;
        List<String> add_op2 = null; // new ArrayList<>();
        if (terms.size()>1) {
        	if (terms.size() == add_ops.size()) {
        		add_op1 = add_ops.get(0);
            	add_op2 = add_ops.subList(1, add_ops.size());
        	} else {
        		add_op2 = add_ops;
        	}
        } else {
        	if (terms.size() == add_ops.size()) {
        		add_op1 = add_ops.get(0); 
        		add_op2 = null;
        	} 
        }  
        */   	  
    	  String ariExpStr = "";
    	  if (add_ops.size() == terms.size()) {
    		  for (int i=0; i<terms.size(); i++) {
    			  ariExpStr = ariExpStr + add_ops.get(i) + terms.get(i);
    		  }
    	  } else {
    		  ariExpStr = terms.get(0);
    		  for (int i=1; i<terms.size(); i++) {
    			  ariExpStr = ariExpStr + add_ops.get(i-1) + terms.get(i);
    		  }
    	  }
          return ariExpStr;       
        //return new Arithmetic_expression(add_op1, terms, add_op2);
      }
    }

    private static class Add_opVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitAdd_op(@NotNull modelicaParser.Add_opContext ctx) {
    	//Add_opVisitor add_opVisitor = new Add_opVisitor();   	
      	//Add_op add_dec = ctx.accept(add_opVisitor);
    	String addOpe = ctx.getText(); 
    	return addOpe;
        //return new Add_op(add_dec);
      }
    }

    private static class TermVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitTerm(@NotNull modelicaParser.TermContext ctx) {
        Mul_opVisitor mul_opVisitor = new Mul_opVisitor();
        List<String> mul_op_1 = ctx.mul_op() == null ? null : ctx.mul_op()
                .stream()
                .map(mul_op -> mul_op.accept(mul_opVisitor))
                .collect(toList());
        FactorVisitor factorVisitor = new FactorVisitor();
        List<String> factors = ctx.factor()
              .stream()
              .map(factor -> factor.accept(factorVisitor))
              .collect(toList());
        //String factor_1 = factors.get(0);
        //List<String> factor_2 = 
        //		factors.size()>1 ? factors.subList(1, factors.size()) : null;
        String terStr = factors.get(0);
        if (mul_op_1 != null) {
        	for (int i=0; i<mul_op_1.size(); i++) {
        		terStr = terStr + mul_op_1.get(0) + factors.get(i+1);
        	}
        }
        return terStr;		
        //return new Term(factor_1, mul_op_1, factor_2);
      }
    }

    private static class Mul_opVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitMul_op(@NotNull modelicaParser.Mul_opContext ctx) {  			
    	//Mul_opVisitor mul_opVisitor = new Mul_opVisitor();   	
        String mulOpe = ctx.getText(); 
        return mulOpe;
        //return new Mul_op(mul_dec);
      }
    }

    private static class FactorVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFactor(@NotNull modelicaParser.FactorContext ctx) {
    	  PrimaryVisitor primaryVisitor = new PrimaryVisitor();
    	  List<String> primarys = ctx.primary()
    			  .stream()
    			  .map(primary -> primary.accept(primaryVisitor))
    			  .collect(toList());
    	  String caret = 
    			  ctx.SYMBOL_CARET()==null ? null : ctx.SYMBOL_CARET().getText();
    	  String dotCaret = 
    			  ctx.SYMBOL_DOTCARET()==null ? null : ctx.SYMBOL_DOTCARET().getText();
    	  String facStr = primarys.get(0);
    	  if (primarys.size()>1) {
    		  if (caret != null) {
    			  facStr = primarys.get(0) + caret + primarys.get(1);
    		  } else {
    			  facStr = primarys.get(0) + dotCaret + primarys.get(1);
    		  }
    	  }
    	  return facStr;       		
        // return new Factor(primarys, caret, dotCaret);
      }
    }

    private static class PrimaryVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitPrimary(@NotNull modelicaParser.PrimaryContext ctx) {
        String num_dec = 
        		ctx.UNSIGNED_NUMBER() == null ? null : ctx.UNSIGNED_NUMBER().getText();
        String str_dec = 
        		ctx.STRING() == null ? null : ctx.STRING().getText();
        String false_dec = 
        		ctx.FALSE() == null ? null : ctx.FALSE().getText();
        String true_dec = 
        		ctx.TRUE() == null ? null : ctx.TRUE().getText();
        String der_der = 
        		ctx.DER() == null ? null : ctx.DER().getText();
        String init_dec = 
        		ctx.INITIAL() == null ? null : ctx.INITIAL().getText();
        String end_dec = 
        		ctx.END() == null ? null : ctx.END().getText();       
        NameVisitor nameVisitor = new NameVisitor();
        String name1 = 
        		ctx.name() == null ? null : ctx.name().accept(nameVisitor);        
        Function_call_argsVisitor function_call_argsVisitor = new Function_call_argsVisitor();
        String function_call_args1 = 
        		ctx.function_call_args() == null ? null : ctx.function_call_args().accept(function_call_argsVisitor);
        Component_referenceVisitor component_referenceVisitor = new Component_referenceVisitor();
        String component_reference1 = 
        		ctx.component_reference() == null ? null : ctx.component_reference().accept(component_referenceVisitor);
        Output_expression_listVisitor output_expression_listVisitor = new Output_expression_listVisitor();
        String output_expression_list1 = 
        		ctx.output_expression_list() == null ? null : ctx.output_expression_list().accept(output_expression_listVisitor);
        Expression_listVisitor expression_listVisitor = new Expression_listVisitor();
        List<String> expression_list_1 = ctx.expression_list() == null ? null : ctx.expression_list()
              .stream()
              .map(expression_list -> expression_list.accept(expression_listVisitor))
              .collect(toList());
        List<String> semiColon = ctx.SYMBOL_SEMICOLON() == null ? null : ctx.SYMBOL_SEMICOLON()
        		.stream()
        		.map(SYMBOL_SEMICOLON -> SYMBOL_SEMICOLON.getText())
        		.collect(toList());
        Function_argumentsVisitor function_argumentsVisitor = new Function_argumentsVisitor();
        String function_arguments1 = 
        		ctx.function_arguments() == null ? null : ctx.function_arguments().accept(function_argumentsVisitor);
        
        String priStr = num_dec;
        if (str_dec != null) {priStr = str_dec;}
        else if (false_dec != null) {priStr = false_dec;}
        else if (true_dec != null) {priStr = true_dec;}
        else if (function_call_args1 != null) {
        	if (name1 != null) {priStr = name1 + " " + function_call_args1;}
        	else if (der_der != null) {priStr = der_der + " " + function_call_args1;}
        	else {priStr = init_dec + " " + function_call_args1;}} 
        else if (component_reference1 != null) {priStr = component_reference1;}
        else if (output_expression_list1 != null) {priStr = "(" + output_expression_list1 + ")";}
        else if (expression_list_1.size() > 0 ) {
        	String tempStr = expression_list_1.get(0);
        	if (semiColon != null) {
        		for (int i=0; i<semiColon.size(); i++) {
        			tempStr = tempStr + semiColon.get(i) + expression_list_1.get(i+1);
        		}
        	}
        	priStr = "[" + tempStr + "]"; } 
        else if (function_arguments1 != null) {
        	priStr = "{" + function_arguments1 + "}"; } 
        else if (end_dec != null) {priStr = end_dec;}
        return priStr;      
        //return new Primary(num_dec, str_dec, false_dec, true_dec, name1, der_der, init_dec,
        //                   function_call_args1, component_reference1, output_expression_list1,
        //                   expression_list_1, function_arguments1, end_dec);
      }
    }

    private static class NameVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitName(@NotNull modelicaParser.NameContext ctx) {
    	List<String> dots = ctx.SYMBOL_DOT()==null ? null : ctx.SYMBOL_DOT()
    			.stream()
    			.map(SYMBOL_DOT -> SYMBOL_DOT.getText())
    			.collect(toList());
        List<String> ident = ctx.IDENT()
        		.stream()
        		.map(IDENT -> IDENT.getText())
        		.collect(toList());
        String NameStr = "";
        if (dots == null) {
        	NameStr = ident.get(0);
        } else {
        	if (dots.size() == ident.size()) {
        		for (int i=0; i<ident.size(); i++) {
        			NameStr = NameStr + dots.get(i) + ident.get(i);
        		}
        	} else {
        		NameStr = ident.get(0);
        		for (int i=1; i<ident.size(); i++) {
        			NameStr = NameStr + dots.get(i-1) + ident.get(i);
        		}
        	}
        }              
        return NameStr;
        //return new Name(dots, ident);
      }
    }

    private static class Component_referenceVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitComponent_reference(@NotNull modelicaParser.Component_referenceContext ctx) {
    	List<String> dots = ctx.SYMBOL_DOT()==null ? null : ctx.SYMBOL_DOT()
    			.stream()
    			.map(SYMBOL_DOT -> SYMBOL_DOT.getText())
    			.collect(toList());
    	List<String> ident = ctx.IDENT()
          		.stream()
          		.map(IDENT -> IDENT.getText())
          		.collect(toList());
        Array_subscriptsVisitor array_subscriptsVisitor = new Array_subscriptsVisitor();
        List<String> array_subscripts_1 = ctx.array_subscripts() == null ? null : ctx.array_subscripts()
              .stream()
              .map(array_subscripts -> array_subscripts.accept(array_subscriptsVisitor))
              .collect(toList());
        String comRefStr = "";
        if (ident.size()==1) {
        	if (dots.size() >0 && array_subscripts_1.size() == 0) {
        		comRefStr = dots.get(0) + ident.get(0);
        	} else if (dots.size() == 0 && array_subscripts_1.size() > 0) {
        		comRefStr = ident.get(0) + array_subscripts_1.get(0);
        	} else if (dots.size() == 0 && array_subscripts_1.size() == 0) {
        		comRefStr = ident.get(0);
        	} else {
        		comRefStr = dots.get(0) + ident.get(0) + array_subscripts_1.get(0);
        	}
        } else {
        	int i;
        	if (ident.size() == dots.size()) {
        		for (i=0; i<ident.size(); i++) {
        			if (i<array_subscripts_1.size()) {
        				comRefStr = dots.get(i) + ident.get(i) + array_subscripts_1.get(i);
        			} else {
        				comRefStr = dots.get(i) + ident.get(i);
        			}
        		}       		
        	} else {
        		if (array_subscripts_1.size() >0) {
        			comRefStr = ident.get(0) + array_subscripts_1.get(0);
        			for (i=1; i<ident.size(); i++) {
        				if (i<array_subscripts_1.size()) {
        					comRefStr = comRefStr + dots.get(i-1) + ident.get(i) + array_subscripts_1.get(i);
        				} else {
        					comRefStr = comRefStr + dots.get(i-1) + ident.get(i);
        				}
        			}
        		} else {
        			comRefStr = ident.get(0);
        			for (i=1; i<ident.size(); i++) {
        				comRefStr = comRefStr + dots.get(i-1) + ident.get(i);       				
        			}
        		}       		
        	}
        }
        return comRefStr;
        // return new Component_reference(ident, dots, array_subscripts_1);
      }
    }

    private static class Function_call_argsVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFunction_call_args(@NotNull modelicaParser.Function_call_argsContext ctx) {
        Function_argumentsVisitor function_argumentsVisitor = new Function_argumentsVisitor();
        String function_arguments = 
        		ctx.function_arguments() == null ? "" : ctx.function_arguments().accept(function_argumentsVisitor);
        String funCalArgs = "(" + function_arguments + ")";
        return funCalArgs;
        //return new Function_call_args(function_arguments);
      }
    }

    private static class Function_argumentsVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFunction_arguments(@NotNull modelicaParser.Function_argumentsContext ctx) {
        Function_argumentVisitor function_argumentVisitor = new Function_argumentVisitor();
        String function_argument = 
        		ctx.function_argument() == null ? null : ctx.function_argument().accept(function_argumentVisitor);
        Function_argumentsVisitor function_argumentsVisitor = new Function_argumentsVisitor();
        String function_arguments = 
        		ctx.function_arguments() == null ? null : ctx.function_arguments().accept(function_argumentsVisitor);
        String for_dec = 
        		ctx.FOR() == null ? null : ctx.FOR().getText();
        For_indicesVisitor for_indicesVisitor = new For_indicesVisitor();
        String for_indices = 
        		ctx.for_indices() == null ? null : ctx.for_indices().accept(for_indicesVisitor);
        Named_argumentsVisitor named_argumentsVisitor = new Named_argumentsVisitor();
        String named_arguments = 
        		ctx.named_arguments() == null ? null : ctx.named_arguments().accept(named_argumentsVisitor);
        String funArgsStr = named_arguments;
        String tempStr = "";
        if (function_argument != null) {
        	if (function_arguments != null) {
        		tempStr = "," + function_arguments;
        	} else if (for_indices != null) {
        		tempStr = "for " + for_indices;       		
        	}        	
        	funArgsStr = function_argument + tempStr;
        }
        return funArgsStr;    
        //return new Function_arguments(function_argument, function_arguments, for_dec, for_indices, named_arguments);
      }
    }

    private static class Named_argumentsVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitNamed_arguments(@NotNull modelicaParser.Named_argumentsContext ctx) {
        Named_argumentVisitor named_argumentVisitor = new Named_argumentVisitor();
        String named_argument = 
        		ctx.named_argument().accept(named_argumentVisitor);
        Named_argumentsVisitor named_argumentsVisitor = new Named_argumentsVisitor();
        String named_arguments = 
        		ctx.named_arguments() == null ? null : ctx.named_arguments().accept(named_argumentsVisitor);
        String comma = 
        		ctx.SYMBOL_COMMA()==null ? null : ctx.SYMBOL_COMMA().getText();
        String namedArgsStr = named_argument;
        if (comma != null) {
        	namedArgsStr = namedArgsStr + "," + named_arguments;       	
        }
        return namedArgsStr;
        //return new Named_arguments(named_argument,named_arguments);
      }
    }

    private static class Named_argumentVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitNamed_argument(@NotNull modelicaParser.Named_argumentContext ctx) {
    	  String ident = ctx.IDENT().getText();
    	  Function_argumentVisitor function_argumentVisitor = new Function_argumentVisitor();
    	  String function_argument = 
    			  ctx.function_argument().accept(function_argumentVisitor);
    	  String namedArgStr = 
    			  ident + "=" + function_argument;
    	  return namedArgStr;
        //return new Named_argument(ident, function_argument);
      }
    }

    private static class Function_argumentVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitFunction_argument(@NotNull modelicaParser.Function_argumentContext ctx) {
    	  String fun_dec = 
    			  ctx.FUNCTION() == null ? null : ctx.FUNCTION().getText();
    	  NameVisitor nameVisitor = new NameVisitor();
    	  String name = 
    			  ctx.name() == null ? null : ctx.name().accept(nameVisitor);
    	  Named_argumentsVisitor named_argumentsVisitor = new Named_argumentsVisitor();
    	  String named_arguments = 
    			  ctx.named_arguments() == null ? "" : ctx.named_arguments().accept(named_argumentsVisitor);
    	  ExpressionVisitor expressionVisitor = new ExpressionVisitor();
    	  String expression = 
    			  ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
    	  String funArgStr = expression;
    	  if (fun_dec != null) {
    		  funArgStr = fun_dec + " " + name 
        			    	+ "(" + named_arguments + ")";
    	  } 
    	  return funArgStr;
        //return new Function_argument(fun_dec, name, named_arguments, expression);
      }
    }

    private static class Output_expression_listVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitOutput_expression_list(@NotNull modelicaParser.Output_expression_listContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<String> expression_1 = ctx.expression() == null ? null : ctx.expression()
              .stream()
              .map(expression -> expression.accept(expressionVisitor))
              .collect(toList());
        List<String> comma = ctx.SYMBOL_COMMA() == null ? null : ctx.SYMBOL_COMMA()
          		.stream()
          		.map(SYMBOL_COMMA -> SYMBOL_COMMA.getText())
          		.collect(toList());        
        String listStr = "";
        int i=0;
        if (comma != null) {
        	if (expression_1.size()==comma.size()) {
        		for (i=0; i<comma.size(); i++) {
        			listStr = listStr + comma.get(i) + expression_1.get(i);
        		}       		
        	} else {
        		listStr = expression_1.get(0);
        		for (i=0; i<comma.size(); i++) {
        			if (i<expression_1.size()) {
        				listStr = listStr + comma.get(i) + expression_1.get(i);
        			} else {
        				listStr = listStr + comma.get(i);
        			}
        		}
        	}
        }
        return listStr;      
        //return new Output_expression_list(expression_1);
      }
    }

    private static class Expression_listVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitExpression_list(@NotNull modelicaParser.Expression_listContext ctx) {
        ExpressionVisitor expressionVisitor = new ExpressionVisitor();
        List<String> expression_1 = ctx.expression()
              .stream()
              .map(expression -> expression.accept(expressionVisitor))
              .collect(toList());
        String listStr = expression_1.get(0);
        if (expression_1.size()>1) {
        	for (int i=1; i<expression_1.size(); i++) {
        		listStr = listStr + "," + expression_1.get(i);
        	}       	
        }
        return listStr;
        //return new Expression_list(expression_1);
      }
    }

    private static class Array_subscriptsVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitArray_subscripts(@NotNull modelicaParser.Array_subscriptsContext ctx) {
    	  SubscriptVisitor subscriptVisitor = new SubscriptVisitor();
    	  List<String> subscript_1 = ctx.subscript()
    			  .stream()
    			  .map(subscript -> subscript.accept(subscriptVisitor))
    			  .collect(toList());
    	  String arraySubStr = "[" + subscript_1.get(0) + "]";
    	  if (subscript_1.size() > 1) {
        	  String tempStr = subscript_1.get(0);
    		  for (int i=1; i<subscript_1.size(); i++) {
    			  tempStr = tempStr + "," + subscript_1.get(i);
    		  }
    		  arraySubStr = "[" + tempStr + "]";
    	  } 
    	  return arraySubStr;       
    	  //return new Array_subscripts(subscript_1);
      }
    }

    private static class SubscriptVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitSubscript(@NotNull modelicaParser.SubscriptContext ctx) {
    	  String colon = 
    			  ctx.SYMBOL_COLON() == null ? null : ctx.SYMBOL_COLON().getText();
    	  ExpressionVisitor expressionVisitor = new ExpressionVisitor();
    	  String expression = 
    			  ctx.expression() == null ? null : ctx.expression().accept(expressionVisitor);
    	  String subStr = 
    			  colon != null ? colon : expression;
    	  return subStr;    	  
    	  //return new Subscript(expression);
      }
    }

    public static class CommentVisitor extends modelicaBaseVisitor<Comment> {
    	String string_comment1;
    	String annotation1;
      @Override
      public Comment visitComment(@NotNull modelicaParser.CommentContext ctx) {
        String_commentVisitor string_commentVisitor = new String_commentVisitor();
        String string_comment1 = 
        		ctx.string_comment() == null ? null : ctx.string_comment().accept(string_commentVisitor);
        AnnotationVisitor annotationVisitor = new AnnotationVisitor();
        String annotation1 = 
        		ctx.annotation() == null ? null : ctx.annotation().accept(annotationVisitor);
        this.string_comment1 = string_comment1;
        this.annotation1 = annotation1;
        return new Comment(string_comment1, annotation1);
      }
    }

    public static class String_commentVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitString_comment(@NotNull modelicaParser.String_commentContext ctx) {
        List<String> str_dec = ctx.STRING() == null ? null : ctx.STRING()
        		.stream()
        		.map(STRING -> STRING.getText())
        		.collect(toList());
        String strCom = "";
        if (str_dec.size() == 1) {
        	strCom = str_dec.get(0);
        } else if (str_dec.size() > 1) {
        	strCom = str_dec.get(0);
        	String temp = "";
        	for (int i=1; i<str_dec.size(); i++) {
        		temp = temp + "+" + str_dec.get(i);
        	}
        	strCom = strCom + temp;
        }
        return strCom;
        //return new String_comment(str_dec);
      }
    }

    public static class AnnotationVisitor extends modelicaBaseVisitor<String> {
      @Override
      public String visitAnnotation(@NotNull modelicaParser.AnnotationContext ctx) {
    	String ann_dec = ctx.ANNOTATION().getText();
        Class_modificationVisitor class_modificationVisitor = new Class_modificationVisitor();
        String class_modification = ctx.class_modification().accept(class_modificationVisitor);
        return class_modification;
        //return new Annotation(ann_dec, class_modification);
      }
    }
}