package gov.lbl.parser.domain;

import gov.lbl.parser.domain.Declaration.ClassMod;

public class Extends_clause {
    private String name;
    private Declaration.ClassMod class_modification;
    private String annotation;

    public Extends_clause(String ext_dec,
    		              String name,
    		              String class_modification,
    		              String annotation) {
      this.name = name;
      this.annotation  = (annotation == null ? null : annotation);
      if (class_modification != null) {
    	  if (class_modification.charAt(0) == '(') {   		  
  			  Declaration test = new Declaration(null, null, class_modification);
  			  String tempStr = class_modification.substring(1,class_modification.length()-1);
  			  Declaration.ClassMod classMod = test.new ClassMod();
  			  classMod.classMod(tempStr);
  			  this.class_modification = classMod;
  		  }
      } else {
  			this.class_modification = null;
  	  }  
    }
}
