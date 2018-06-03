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
		public TemCla classMod(String classModStr) {				
    		List<String> strSets = new ArrayList<String>();
    		strSets.addAll(Comment.splitAtComma(classModStr));  		   		
    		
    		List<ClassModList> modListEle = new ArrayList<ClassModList>();
    		for (String str : strSets) {	 			
    			String tempLeftStr = "";
        		String tempRightStr = "";
        		String prefix = "";
        		String className = "";
        		String packageName = "";
        		String name = "";
        		String value = "";
        		ClassMod modification = null;
    			VariableMod variable_modification = null;
        		PerMod per_modification = null;
        		if (str.startsWith("redeclare")) {
        			if (str.contains("(")) {
        				int indBR = str.indexOf('(');
        				String modStr = str.substring(indBR+1, str.lastIndexOf(')')).trim();
        				String lefStr = str.substring(0, indBR).trim();
        				String[] lefStrSet = lefStr.split(" ");
        				if (lefStrSet.length > 3) {
        					String[] temStr = Arrays.copyOfRange(lefStrSet, 0, lefStrSet.length-3);
        					prefix = String.join(" ", temStr);
        				} else {
        					prefix = lefStrSet[0];
        				}
        				className = lefStrSet[lefStrSet.length-2];
        				name = lefStrSet[lefStrSet.length-1];       			        				
        				
        				ClassMod classMod = new ClassMod();
            			classMod.classMod(modStr); 
            			modification = classMod;
            			modListEle.add(new ClassModList(prefix,name,null,null,null,className,null,modification));
        			} else {
        				if (str.contains("package")) {
        					String[] strSet = str.split("=");
        					String[] temStr1 = strSet[0].split(" "); 
        					String[] temStr2 = Arrays.copyOfRange(temStr1, 0, temStr1.length-1);
        					prefix = String.join(" ", temStr2);
        					packageName = temStr1[temStr1.length-1];
        					name = strSet[strSet.length-1];
        					modListEle.add(new ClassModList(prefix,name,null,null,null,null,packageName,null));
        				} else {
        					String[] strSet = str.split(" ");
        					if (strSet.length > 3) {
        						String[] temStr = Arrays.copyOfRange(strSet, 0, strSet.length-3);
        						prefix = String.join(" ", temStr);
        					} else {
        						prefix = strSet[0];
        					}
        					className = strSet[strSet.length-2];
        					name = strSet[strSet.length-1];  
        					modListEle.add(new ClassModList(prefix,name,null,null,null,className,null,null));
        				}
        			}      			
        		} else {
        			if (!str.contains("(")
    					|| (str.contains("(") && (str.indexOf('(')> str.indexOf('=')))) {
        				if (str.contains("=")) {
        					String[] temStr = str.split("=");
        					tempLeftStr = temStr[0];
        					tempRightStr = temStr[1];
        				} else {
        					tempLeftStr = str;
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
        			} else if ((str.contains("(") && (str.indexOf('(')< str.indexOf('=')))) {    				
        				String variable = str.substring(0,str.indexOf('(')-1).trim();
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
        				isoEquInd.addAll(isoEqu(str));
        				String temStr2 = "";
        				if (!isoEquInd.isEmpty()) {
        					value = str.substring(isoEquInd.get(0)+1,str.length()).trim();
        					int index = str.lastIndexOf(')',isoEquInd.get(0));
        					temStr2 = str.substring(str.indexOf('(')+1, index).trim();
        				} else {
        					value = null;
        					int index = str.lastIndexOf(')');
        					temStr2 = str.substring(str.indexOf('(')+1, index).trim();
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
        			modListEle.add(new ClassModList(prefix,name,value,variable_modification,per_modification, null,null,null));
        		}    			
    		}
    		this.modifications = modListEle;
    		return new TemCla(classModStr);
    	}
    }
    
    /** Check if the input string "str" contains isolated "=" that is not enclosed in bracket.
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
    	String className;
    	String packageName;
    	String name;
    	String value;
    	VariableMod variable_modification;
		PerMod per;		
		ClassMod modification;
    	private ClassModList(String prefix, String name, String value,
    			             VariableMod variable_modification,
    			             PerMod per_modification,
    			             String className, String packageName,
    			             ClassMod modification) {
    		this.prefix = prefix;
    		this.name = name;
    		this.value = value;
    		this.variable_modification = variable_modification;
    		this.per = per_modification;
    		this.className = className;
    		this.packageName = packageName;
    		this.modification = modification;
    	}
    }
 
    private class VariableMod {
    	ClassMod modification;
    	private TemCla variableMod(String str) {
    		ClassMod classMod = new ClassMod();
			classMod.classMod(str);
			this.modification = classMod;
    		return new TemCla(str);
    	}
    }

    private class PerMod {
    	ClassMod modification;
    	private TemCla perMod(String perModStr) {
    		ClassMod classMod = new ClassMod();
			classMod.classMod(perModStr);
			this.modification = classMod;
    		return new TemCla(perModStr);
    	}
    }

    public class TemCla {
    	private TemCla(String str) {
    	}
    }

}
