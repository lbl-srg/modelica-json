package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

import gov.lbl.parser.domain.Comment;

public class Declaration {
    private String name;
    private String array_subscripts;
    private ClassMod class_modification;

    private String operator;
    private String value;

    public Declaration(String ident,
    		           String array_subscripts,
    		           String modification) {
    	this.name = ident;
    	this.array_subscripts = (array_subscripts == null ? null : array_subscripts);
    	if (modification != null) {
    		if (modification.charAt(0) == '(') {    		
    			List<Integer> equSymbol = new ArrayList<Integer> ();
        		equSymbol.addAll(isoEqu(modification));
        		
        		String temStrL = "";
        		String temStrR = "";        		
    			if (!equSymbol.isEmpty()) {
    				temStrL = modification.substring(1, equSymbol.get(0)-1);
    				temStrR = modification.substring(equSymbol.get(0)+1,modification.length());
    			} else {
    				temStrL = modification.substring(1,modification.length()-1);
    			}
    			temStrL.trim();  			
        		this.operator = null;
        		this.value = temStrR.isEmpty() ? null : temStrR.trim();
        		ClassMod classMod = new ClassMod();
    			classMod.classMod(temStrL);
    			this.class_modification = classMod; 			
    		} else {
    			this.class_modification = null;
    			if (modification.contains(":=")) {
    				this.operator = ":=";
    				int ind = modification.indexOf(":=");   				
    				this.value = modification.substring(ind+2,modification.length()).trim();
    			} else {
    				this.operator = null;
    				int equInd = modification.indexOf("=");
    				this.value = modification.substring(equInd+1,modification.length()).trim();
    			}		
    		}
    	}
    }

    public class ClassMod {
    	private Collection<ClassModList> modifications;
		public Mod classMod(String classModStr) {			
    		List<String> strSets = new ArrayList<String>();
    		strSets.addAll(Comment.splitAtComma(classModStr));  		   		
    		
    		List<ClassModList> modListEle = new ArrayList<ClassModList>();
    		for (int i=0; i<strSets.size(); i++) {
    			String tempLeftStr = "";
        		String tempRightStr = "";
        		String prefix = "";
        		String name = "";
        		String value = "";
    			VariableMod variable_modification = null;
        		PerMod per_modification = null;
    			if (!strSets.get(i).contains("(")
    					|| (strSets.get(i).contains("(") && (strSets.get(i).indexOf('(')> strSets.get(i).indexOf('=')))) {
    				if (strSets.get(i).contains("=")) {
    					String[] temStr = strSets.get(i).split("=");
    					tempLeftStr = temStr[0];
    					tempRightStr = temStr[1];
    				} else {
    					tempLeftStr = strSets.get(i);
    					tempRightStr = " ";
    				}
    				String[] tempLeftSets = tempLeftStr.split(" ");
    				if (tempLeftSets.length > 1) {
    					String[] temStr = Arrays.copyOfRange(tempLeftSets,0,tempLeftSets.length-1);    					
    					prefix = String.join(" ", temStr);
    					name = tempLeftSets[tempLeftSets.length-1];
    				} else {
    					prefix = null;
    					name = tempLeftSets[0];
    				}   				
    				tempRightStr.trim();
    				value = tempRightStr.isEmpty() ? null : tempRightStr.trim();
    			} else if ((strSets.get(i).contains("(") && (strSets.get(i).indexOf('(')< strSets.get(i).indexOf('=')))) {    				
    				String variable = strSets.get(i).substring(0,strSets.get(i).indexOf('(')-1).trim();
    				String[] temStr = variable.split(" ");  				
    				if (temStr.length > 1) {   					
    					String[] temStr2 = Arrays.copyOfRange(temStr, 0, temStr.length-1);
    					prefix = String.join(" ", temStr2);
    					name = temStr[temStr.length-1];
    				} else {
    					prefix = null;
    					name = (temStr[0] != "per") ? temStr[0] : null;
    				}   				   				
    				List<Integer> isoEquInd = new ArrayList<Integer>();
    				isoEquInd.addAll(isoEqu(strSets.get(i)));
    				String temStr2 = "";
    				if (!isoEquInd.isEmpty()) {
    					value = strSets.get(i).substring(isoEquInd.get(0)+1,strSets.get(i).length()).trim();
    					int index = strSets.get(i).lastIndexOf(')',isoEquInd.get(0));
    					temStr2 = strSets.get(i).substring(strSets.get(i).indexOf('(')+1, index).trim();
    				} else {
    					value = null;
    					int index = strSets.get(i).lastIndexOf(')');
    					temStr2 = strSets.get(i).substring(strSets.get(i).indexOf('(')+1, index).trim();
    				}    				 				    				
    				if (!name.equals("per")) {
    					VariableMod varMod = new VariableMod();
    					varMod.variableMod(temStr2);
    					variable_modification = varMod;
    					per_modification = null;
    				} else {
    					PerMod perMod = new PerMod();
    					perMod.perMod(temStr2);
    					per_modification = perMod;
    					variable_modification = null;
    				}
    			}
    			modListEle.add(new ClassModList(prefix,name,value,variable_modification,per_modification));
    		}
    		this.modifications = modListEle;
    		return new Mod(classModStr);
    	}
    }
    
    /* Check if the input string "str" contains isolated "=" that is not enclosed in bracket.
     * If it has, then return their positions "equSymbol" in the string.*/
    private static Collection<Integer> isoEqu(String str) {
    	List<Integer> equSymbolTemp = new ArrayList<Integer>();
		for (int i=1; i<str.length()-2; i++) {
			if ((str.charAt(i) == '=')
					&& (str.charAt(i+1) != '=') && (str.charAt(i-1) != '=')) {
				equSymbolTemp.add(i);
			}
		}
		if (str.charAt(str.length()-2) == '=') {
			equSymbolTemp.add(str.length()-2);
		}
		List<Integer> equSymbol = new ArrayList<Integer> ();
		for (int i=0; i<equSymbolTemp.size(); i++) {
			if (!Comment.ifEnclosed(str, "(", ")", equSymbolTemp.get(i))) {
				equSymbolTemp.set(i, 0);
			}
			if (equSymbolTemp.get(i) !=0) {
				equSymbol.add(equSymbolTemp.get(i));
			}
		}
		return equSymbol;
    }

    private class ClassModList {
    	String prefix;
    	String name;
    	String value;
    	VariableMod variable_modification;
		PerMod per;
    	private ClassModList(String prefix, String name, String value,
    			             VariableMod variable_modification,
    			             PerMod per_modification) {
    		this.prefix = prefix;
    		this.name = name;
    		this.value = value;
    		this.variable_modification = variable_modification;
    		this.per = per_modification;
    	}
    }

    private class VariableMod {
    	ClassMod modification;
    	private VarMod variableMod(String str) {
    		ClassMod classMod = new ClassMod();
			classMod.classMod(str);
			this.modification = classMod;
    		return new VarMod(str);
    	}
    }

    private class PerMod {
    	ClassMod modification;
    	private Per_mod perMod(String perModStr) {
    		ClassMod classMod = new ClassMod();
			classMod.classMod(perModStr);
			this.modification = classMod;
    		return new Per_mod(perModStr);
    	}
    }

    public class Mod {
    	private Mod(String classModStr) {
    	}
    }

    public class VarMod {
    	private VarMod(String strSets) {
    	}
    }

    public class Per_mod {
    	private Per_mod(String perModStr) {
    	}
    }

}
