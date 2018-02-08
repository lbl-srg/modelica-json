package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;

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
    			Pattern pattern1 = Pattern.compile("\\)=");
    			Pattern pattern2 = Pattern.compile("\\) =");
    			Pattern pattern3 = Pattern.compile("\\)");
    			Matcher matcher1 = pattern1.matcher(modification);
    			Matcher matcher2 = pattern2.matcher(modification);
    			Matcher matcher3 = pattern3.matcher(modification);
    			String splitSym = "";
    			String tempClaStr = "";
    			String[] splitStr;
    			if (!matcher1.matches() || !matcher2.matches() || !matcher3.matches()) {
    				splitSym = (!matcher1.matches()) ? "\\)="
    					      : ((!matcher2.matches()) ? "\\) =" : "\\)");
    				splitStr = modification.split(splitSym);
    				tempClaStr = splitStr[0];
    				if (splitStr.length > 1) {
    					this.operator = null;
    					this.value = splitStr[1];
    				} else {
    					this.operator = null;
    					this.value = null;
    				}
    			}
    			ClassMod classMod = new ClassMod();
    			classMod.classMod(tempClaStr);
    			this.class_modification = classMod;
    		} else {
    			this.class_modification = null;
    			Pattern pattern1 = Pattern.compile("=");
    			Pattern pattern2 = Pattern.compile(":=");
    			Matcher matcher1 = pattern1.matcher(modification);
    			Matcher matcher2 = pattern2.matcher(modification);
    			if (!matcher1.matches()) {
    				this.operator = null;
    				this.value = modification.split("(?<==)")[1];
    			} else if (!matcher2.matches()) {
    				this.operator = modification.split("(?<=:=)")[0];
    				this.value = modification.split("(?<=:=)")[1];
    				}
    			}
    		}
    	}

    @Override
    public boolean equals(Object o) {
    	if (this == o) return true;
    	if (o == null || getClass() != o.getClass()) return false;

    	Declaration aDeclaration = (Declaration) o;
    	if (name != null ? !name.equals(aDeclaration.name) : aDeclaration.name != null) return false;
    	if (array_subscripts != null ? !array_subscripts.equals(aDeclaration.array_subscripts) : aDeclaration.array_subscripts != null) return false;
    	return value != null ? value.equals(aDeclaration.value) : aDeclaration.value == null;
    	}

    @Override
    public int hashCode() {
    	int result = name != null ? name.hashCode() : 0;
    	result = 31 * result + (array_subscripts != null ? array_subscripts.hashCode() : 0);
    	result = 31 * result + (class_modification != null ? class_modification.hashCode() : 0);
    	result = 31 * result + (operator != null ? operator.hashCode() : 0);
    	result = 31 * result + (value != null ? value.hashCode() : 0);
    	return result;
    	}

    @Override
    public String toString() {
    	return "Declaration{" +
              "\nname=" + name + '\'' +
              "\nclass_modification=" + class_modification + '\'' +
              "\noperator=" + operator + '\'' +
              "\narray_subscripts=" + array_subscripts + '\'' +
              "\nmodification=" + value + '\'' +
              '}';
    }

    private class ClassMod {
    	private Collection<ClassModList> modifications;
		private Mod classMod(String classModStr) {
    		String tempStr = classModStr.substring(1,classModStr.length()-1);
    		//String tempStr = classModStr.substring(1,classModStr.length()+1);
    		List<Integer> equSymbolTemp = new ArrayList<Integer>();
    		for (int i=1; i<tempStr.length()-2; i++) {
    			if ((tempStr.charAt(i) == '=')
    					&& (tempStr.charAt(i+1) != '=') && (tempStr.charAt(i-1) != '=')) {
    				equSymbolTemp.add(i);
    			}
    		}
    		if (tempStr.charAt(tempStr.length()-2) == '=') {
    			equSymbolTemp.add(tempStr.length()-2);
    		}
    		List<Integer> equSymbol = new ArrayList<Integer> ();
    		for (int i=0; i<equSymbolTemp.size(); i++) {
    			if (!ifEnclosed(tempStr, "{", "}", equSymbolTemp.get(i))
    					|| !ifEnclosed(tempStr, "(", ")", equSymbolTemp.get(i))
    					|| !ifEnclosed(tempStr, "[", "]", equSymbolTemp.get(i))) {
    				equSymbolTemp.set(i, 0);
    			}
    			if (equSymbolTemp.get(i) !=0) {
    				equSymbol.add(equSymbolTemp.get(i));
    			}
    		}

    		List<String> strSets = new ArrayList<String>();
    		if (equSymbol.size() == 1)   {
    			strSets.add(tempStr);
    		} else {
    			List<Integer> commaInd = new ArrayList<Integer>();
    			List<Integer> fullCommaInd = new ArrayList<Integer> ();
    			for (int i=0; i<tempStr.length(); i++) {
    				if (tempStr.charAt(i) == ',') {
    					fullCommaInd.add(i);
    				}
    			}
    			if (equSymbol.size() > fullCommaInd.size()) {
    				commaInd = fullCommaInd;
    			} else {
    				if (tempStr.contains("{") || tempStr.contains("[") || tempStr.contains("(") || tempStr.contains("\"")) {
    					List<Integer> cbCommaInd = new ArrayList<Integer> ();
    					List<Integer> sbCommaInd = new ArrayList<Integer> ();
    					List<Integer> rbCommaInd = new ArrayList<Integer> ();
    					List<Integer> quoCommaInd = new ArrayList<Integer> ();
    					for (int i=0; i<fullCommaInd.size(); i++) {
    						if (ifEnclosed(tempStr,"{","}",fullCommaInd.get(i))) {
    							cbCommaInd.add(fullCommaInd.get(i));
    						}
    						if (ifEnclosed(tempStr,"[","]",fullCommaInd.get(i))) {
    							sbCommaInd.add(fullCommaInd.get(i));
    						}
    						if (ifEnclosed(tempStr,"(",")",fullCommaInd.get(i))) {
    							rbCommaInd.add(fullCommaInd.get(i));
    						}
    						if (ifEnclosed(tempStr,"\"","\"",fullCommaInd.get(i))) {
    							quoCommaInd.add(fullCommaInd.get(i));
    						}
    					}
    					commaInd.addAll(searchComEle(cbCommaInd,sbCommaInd,rbCommaInd,quoCommaInd));
    				} else {
    					commaInd = fullCommaInd;
    				}
    			}

    			if (commaInd.size() == 0) {
    				strSets.add(tempStr);
    			} else if (commaInd.size() == 1) {
					strSets.add(tempStr.substring(0, commaInd.get(0)-1));
					if (tempStr.charAt(tempStr.length()-1) != ' ') {
						strSets.add(tempStr.substring(commaInd.get(0)+1, tempStr.length()));
					} else {
						strSets.add(tempStr.substring(commaInd.get(0)+1, tempStr.length()-1));
					}
				} else {
					strSets.add(tempStr.substring(0, commaInd.get(0)-1));
					if (commaInd.size() == 2) {
						strSets.add(tempStr.substring(commaInd.get(0)+1,commaInd.get(1)-1));
					} else {
						for (int i=0; i<commaInd.size()-1; i++) {
							strSets.add(tempStr.substring(commaInd.get(i)+1,commaInd.get(i+1)-1));
						}
					}
					if (tempStr.charAt(tempStr.length()-1) != ' ') {
						strSets.add(tempStr.substring(commaInd.get(commaInd.size()-1)+1, tempStr.length()));
					} else {
						strSets.add(tempStr.substring(commaInd.get(commaInd.size()-1)+1, tempStr.length()-1));
					}
				}
    		}

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
    				tempLeftStr = strSets.get(i).split("=")[0];
    				tempRightStr = strSets.get(i).split("=")[1];
    				String[] tempLeftSets = tempLeftStr.split(" ");
    				if (tempLeftSets.length > 1) {
    					String prefixTemp = "";
    					for (int j=0; j<tempLeftSets.length-1; j++) {
    						prefixTemp = prefixTemp + tempLeftSets[j] + " ";
    					}
    					prefix = prefixTemp.substring(0, prefixTemp.length()-1);
    					name = tempLeftSets[tempLeftSets.length-1];
    				} else {
    					prefix = null;
    					name = tempLeftSets[0];
    				}
    				if (tempRightStr.charAt(tempRightStr.length()-1) == ' ') {
    					tempRightStr = tempRightStr.substring(0, tempRightStr.length()-1);
    				}
    				value = tempRightStr;
    			} else if ((strSets.get(i).contains("(") && (strSets.get(i).indexOf('(')< strSets.get(i).indexOf('=')))) {
    				String variable = strSets.get(i).substring(0,strSets.get(i).indexOf('(')-1);
    				if (!variable.equals("per")) {
    					prefix = null;
    					name = variable;
    					value = null;
    					String tempStrInU = strSets.get(i).substring(strSets.get(i).indexOf('('), strSets.get(i).length());
    					VariableMod varMod = new VariableMod();
    					varMod.variableMod(tempStrInU);
    					variable_modification = varMod;
    					per_modification = null;
    				} else {
    					prefix = null;
    					//name = "per";
    					name = null;
    					value = null;
    					PerMod perMod = new PerMod();
    					perMod.perMod(strSets.get(i).substring(strSets.get(i).indexOf('('), strSets.get(i).length()));
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


    private static Boolean ifEnclosed(String str, String symbol1, String symbol2, Integer fromInd) {
    	Boolean ifEnclosed = false;
    	if (symbol1 == "\"") {
    		if (str.contains(symbol1)) {
    			int index = 0;
    			for (int j = fromInd; j>=0; j--) {
    				if (str.charAt(j) == symbol1.charAt(0)) {
    					index = index + 1;
    				}
    			}
    			if (index % 2 == 0) {
    				ifEnclosed = true;
    			}
    		} else {
    			ifEnclosed = true;
    		}
    	} else {
    		if (str.contains(symbol1)) {
    			int index = 0;
    			for (int j=fromInd; j>=0 ; j--) {
    				if (str.charAt(j) == symbol2.charAt(0)) {
    					index = index+1;
    				}
    				if (str.charAt(j) == symbol1.charAt(0)) {
    					index = index-1;
    				}
    			}
    			if (index == 0) {
    				ifEnclosed = true;
    			}
    		} else {
    			ifEnclosed = true;
    		}
    	}
    	return ifEnclosed;
    }

    private static Collection<Integer> searchComEle(Collection<Integer> list1,
    		                                        Collection<Integer> list2,
    		                                        Collection<Integer> list3,
    		                                        Collection<Integer> list4) {
    	List<Integer> comEle = new ArrayList<Integer> ();
    	if (list1.size()>0 && list2.size()>0 && list3.size()>0 && list4.size()>0) {
    		list2.retainAll(list1);
    		list3.retainAll(list2);
    		list4.retainAll(list3);
    		comEle.addAll(list4);
    	}
    	return comEle;
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
