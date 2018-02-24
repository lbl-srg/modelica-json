package gov.lbl.parser.domain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class Composition {
    private Element_list element_list;
    private Collection<String> prefix_public;
    private Collection<String> prefix_protect;
    private Collection<Element_list> prefixed_element;
    private Collection<Equation_section> equation_section;
    private Collection<String> algorithm_section;
    private String external;
    private String language_specification;
    private String external_function_call;
    private String ext_annotation;
    private AnnotationClass comp_annotation;

    public Composition(String ext_dec,
                       Collection<String> public_dec,
                       Collection<String> protected_dec,
                       Element_list element_list1,
                       Collection<Element_list> element_list2,
                       Collection<Equation_section> equation_section,
                       Collection<String> algorithm_section,
                       String language_specification,
                       String external_function_call,
                       String annotation1,
                       String annotation2) {
    	this.element_list = element_list1;
    	this.prefix_public = (public_dec.size()==0 ? null : public_dec);
    	this.prefix_protect = (protected_dec.size()==0 ? null : protected_dec);
    	this.prefixed_element = (element_list2==null ? null : element_list2);
    	this.equation_section = (equation_section.size()==0 ? null : equation_section);
    	this.algorithm_section = (algorithm_section.size()==0 ? null : algorithm_section);
    	this.external = ext_dec;
    	this.language_specification = language_specification;
        this.external_function_call = external_function_call;
        this.ext_annotation = annotation1;
        String annTemp = "";
        if (annotation2 == null) {
        	this.comp_annotation = null;
        } else {
        	annTemp = annotation2.substring(1,annotation2.length()-2);
        	AnnotationClass annCla = new AnnotationClass();
    		annCla.annClass(annTemp);
    		this.comp_annotation = annCla;
        }
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Composition aComposition = (Composition) o;
      return element_list != null ? element_list.equals(aComposition.element_list) : aComposition.element_list == null;
    }

    @Override
    public int hashCode() {
      int result = element_list != null ? element_list.hashCode() : 0;
      result = 31 * result + (prefix_public != null ? prefix_public.hashCode() : 0);
      result = 31 * result + (prefix_protect != null ? prefix_protect.hashCode() : 0);
      result = 31 * result + (prefixed_element != null ? prefixed_element.hashCode() : 0);
      result = 31 * result + (equation_section != null ? equation_section.hashCode() : 0);
      result = 31 * result + (algorithm_section != null ? algorithm_section.hashCode() : 0);
      result = 31 * result + (external != null ? external.hashCode() : 0);
      result = 31 * result + (language_specification != null ? language_specification.hashCode() : 0);
      result = 31 * result + (external_function_call != null ? external_function_call.hashCode() : 0);
      result = 31 * result + (ext_annotation != null ? ext_annotation.hashCode() : 0);
      result = 31 * result + (comp_annotation != null ? comp_annotation.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
    	StringBuilder temStr = new StringBuilder();
    	return temStr.append("Composition{")
    			     .append("\nelement_list=").append(element_list).append('\'')
    			     .append("\npublic=").append(prefix_public).append('\'')
    			     .append("\nprotect=").append(prefix_protect).append('\'')
    			     .append("\nprefixed_element=").append(prefixed_element).append('\'')
    			     .append("\nequation_section=").append(equation_section).append('\'')
    			     .append("\nalgorithm_section=").append(algorithm_section).append('\'')
    			     .append("\nexternal=").append(external).append('\'')
    			     .append("\nlanguage_specification=").append(language_specification).append('\'')
    			     .append("\nexternal_function_call=").append(external_function_call).append('\'')
    			     .append("\next_annotation=").append(ext_annotation).append('\'')
    			     .append("\ncomp_annotation=").append(comp_annotation)
    			     .append('\'').append('}')
    			     .toString();
    }

    private class AnnotationClass {
    	String defaultName;
    	String diagram;
    	String icon;
    	String text;
    	Documentation documentation;
    	VendorAnnotation vendor_annotation;
    	String othAnns;

    	private TemCla annClass(String annStr) {
    		String nameStr;
    		String docStr = findSubStr(annStr, "Documentation ");
    		String diagramStr = findSubStr(annStr, "Diagram ");
    		String iconStr = findSubStr(annStr, "Icon ");
    		String textStr = findSubStr(annStr, "Text ");
    		String venAnnStr = findSubStr(annStr, "__");

    		this.diagram = diagramStr;
    		this.icon = iconStr;
    		this.text = textStr;
    		
    		
    		if (annStr.contains("defaultComponentName")) {
    			int beginInd = annStr.indexOf("\"", annStr.indexOf("defaultComponentName")+"defaultComponentName".length()-1);
    			int endInd = annStr.indexOf("\"", beginInd+1);
    			nameStr = annStr.substring(beginInd, endInd+1);
    			this.defaultName = nameStr;
    		} else {
    			nameStr = null;
    			this.defaultName = null;
    		}
    		
    		/** find vendor annotation **/
    		String venAnnName = "";
    		if (venAnnStr != null) {
    			venAnnName = annStr.substring(annStr.indexOf("__"), annStr.indexOf("(",annStr.indexOf("__")));    			
    			VendorAnnotation venAnn = new VendorAnnotation();
    			venAnn.vendorAnnotation(venAnnName,venAnnStr);
        		this.vendor_annotation = venAnn;
    		} else {
    			this.vendor_annotation = null;
    		}
    		
    		List<String> strListToBeRem = new ArrayList<String>();
    		if (docStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Documentation (")
    					                 .append(docStr).append(" )")
    					                 .toString());
    		}
    		if (diagramStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Diagram (")
    					                 .append(diagramStr).append(" )")
    					                 .toString());
    		}
    		if (iconStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Icon (")
    					                 .append(iconStr).append(" )")
    					                 .toString());
    		}
    		if (textStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Text (")
    					                 .append(textStr).append(" )")
    					                 .toString());
    		}
    		if (nameStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("defaultComponentName =")
    					                 .append(nameStr)
    					                 .toString());
    		}
    		if (venAnnStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append(venAnnName).append("(")
    					                 .append(venAnnStr).append(" )")
    					                 .toString());
    		}

    		String otherAnnStr = annStr;
    		String tempStrInList;
    		if (strListToBeRem.size()>0) {
    			for (int i=0; i<strListToBeRem.size(); i++) {
    				tempStrInList = strListToBeRem.get(i);
    				otherAnnStr = otherAnnStr.replace(tempStrInList, "");
    				}
    		} else {
    			otherAnnStr = annStr;
    		}
    		this.othAnns = otherAnnStr.isEmpty() ? null : otherAnnStr;

    		if (docStr == null) {
    			this.documentation = null;
    		} else {
    			String infoStr;
    			String revStr;
    			if (docStr.contains("info")) {
    				int beginInd = docStr.indexOf("<html>", docStr.indexOf("info =")) - 1;
    				int endIndTemp = docStr.indexOf("</html>", beginInd);
    				int endInd = endIndTemp + "</html>".length() + 1;
    				infoStr = docStr.substring(beginInd, endInd);
    			} else {
    				infoStr = null;
    			}
    			if (docStr.contains("revisions =")) {
    				docStr = docStr.toString();
    				int beginInd = docStr.indexOf("<html>", docStr.indexOf("revisions =")) - 1;
    				int endIndTemp = docStr.indexOf("</html>", beginInd);
    				int endInd = endIndTemp + "</html>".length() + 1;
    				revStr = docStr.substring(beginInd, endInd);
    			} else {
    				revStr = null;
    			}
    			this.documentation = new Documentation(infoStr, revStr);
    		}
    		return new TemCla(annStr);
    	}
    }

    private class VendorAnnotation{
    	private String name;
    	private Collection<StrPair> annotation;
    	private Collection<SimAnnotation> innerAnnotation;
    	private TemCla vendorAnnotation(String venAnnName, String venAnnStr) {
    		this.name = venAnnName.replaceAll("\\s+", "");
    		List<StrPair> venAnnEle = new ArrayList<StrPair>();
    		List<SimAnnotation> simAnnEle = new ArrayList<SimAnnotation>();
    		if (venAnnStr == null || !venAnnStr.contains("=")) {
    			this.annotation = null;      			
    		} else { 
    			String name;
    			String value;
    			List<String> venSetTemp = new ArrayList<String>();
    			venSetTemp.addAll(splitAtComma(venAnnStr));    			
    			List<String> venSet = new ArrayList<String>();
    			for (int i=0; i<venSetTemp.size(); i++) {
    				if (!venSetTemp.get(i).trim().isEmpty()) {
    					venSet.add(venSetTemp.get(i));
    				}
    			}    			
    			for (int i=0; i<venSet.size(); i++) {
    				int equInd = venSet.get(i).indexOf("=");
    				name = venSet.get(i).substring(0, equInd-1);   				
    				value = venSet.get(i).substring(equInd+1, venSet.get(i).length());  
    				if (!(value.charAt(0) == '{') || !value.contains("=")) {
    					venAnnEle.add(new StrPair(name,value));
    				} else {    					
    					SimAnnotation tem = new SimAnnotation();   					
    					tem.simAnnotation(name, value);
    					simAnnEle.add(tem);
    				}
    			}
    			this.annotation = venAnnEle.isEmpty()? null : venAnnEle;
    			this.innerAnnotation = simAnnEle.isEmpty()? null : simAnnEle;
    		}    		
    		return new TemCla(venAnnStr);
    	}
    }
    
    private class SimAnnotation{   	    	
    	private String name;
    	private Collection<AnnotationString> annotation;
    	private TemCla simAnnotation(String name, String annStr) {
    		this.name = name;
    		String annStrTem = annStr.substring(1, annStr.length()-1);
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(splitAtComma(annStrTem));
    		
    		List<AnnotationString> annStrSet = new ArrayList<AnnotationString>();
    		
    		String strEle;
    		String namTem;
    		String annTem;
    		for (int i=0; i<strSet.size(); i++) {
    			strEle = strSet.get(i);
    			namTem = strEle.substring(0, strEle.indexOf("(")).trim();
    			annTem = strEle.substring(strEle.indexOf("(")+1, strEle.length());
    			AnnotationString temCla = new AnnotationString();
    			temCla.annStr(namTem, annTem);
    			annStrSet.add(temCla);
    		}
    		this.annotation = annStrSet;
    		return new TemCla(annStr);
    	}
    }    
    
    private class AnnotationString{
    	private String name;
    	private Collection<StrPair> annotation;
    	private TemCla annStr(String annName, String str) {
    		this.name = annName;
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(splitAtComma(str));
    		List<StrPair> strPair = new ArrayList<StrPair>();
    		String name;
    		String value;
    		int equInd;
    		String temStr;
    		for (int i=0; i<strSet.size(); i++) {
    			temStr = strSet.get(i);
    			equInd = temStr.indexOf("=");
    			name = temStr.substring(0, equInd);
    			value = temStr.substring(equInd+1,temStr.length());
    			strPair.add(new StrPair(name,value));
    		}
    		this.annotation = strPair;   		
    		return new TemCla(str);
    	}
    }
       
    private static String findSubStr(String str, String keyStr) {
    	String subStr;
    	if (!ifEnclosed(str, "(", ")", str.indexOf(keyStr))
    			|| !ifEnclosed(str, "\"", "\"", str.indexOf(keyStr))) {
    		subStr = null;
    	} else {
    	if (str.contains(keyStr)) {
			int leftRBcount = 0;
			int beginInd = str.indexOf("(",str.indexOf(keyStr)+keyStr.length()-1);
			int endInd = 0;
			for (int i = beginInd; i < str.length(); i++) {
				if (str.charAt(i) == '(') {
					leftRBcount = leftRBcount+1;
					}
				if (str.charAt(i) == ')') {
					leftRBcount = leftRBcount-1;
					if (leftRBcount == 0) {
						endInd = i;
						break;
						}
					}
				}
			subStr = str.substring(beginInd+1, endInd-1);
		} else {
			subStr = null;
		}
    	}
    	return subStr;
    }

    /** check if index "fromInd" is enclosed in a completed "symbol1" and "symbol2",
    such as ( ), [ ], { }, " ". 
    If it is not enclosed and the symbols is completed, then return true, 
    otherwise, return false. **/
    public static Boolean ifEnclosed(String str, String symbol1, String symbol2, Integer fromInd) {
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
    
    /** Split string with commas. These commas are independent and not included in
    brackets. **/
    private static Collection<String> splitAtComma(String str) {
    	List<String> strSets = new ArrayList<String>();
    	if (!str.contains(",")) {
    		strSets.add(str);
    	} else {
    		List<Integer> commaInd = new ArrayList<Integer>();
    		List<Integer> fullCommaInd = new ArrayList<Integer> ();

    		for (int i=0; i<str.length(); i++) {
    			if (str.charAt(i) == ',') {
    				fullCommaInd.add(i);
    			}
    		}
    		if (str.contains("{") || str.contains("[") || str.contains("(") || str.contains("\"")) {
    			List<Integer> cbCommaInd = new ArrayList<Integer> ();
    			List<Integer> sbCommaInd = new ArrayList<Integer> ();
    			List<Integer> rbCommaInd = new ArrayList<Integer> ();
    			List<Integer> quoCommaInd = new ArrayList<Integer> ();

    			for (int i=0; i<fullCommaInd.size(); i++) {
    				if (ifEnclosed(str,"{","}",fullCommaInd.get(i))) {
    					cbCommaInd.add(fullCommaInd.get(i));
    				}
    				if (ifEnclosed(str,"[","]",fullCommaInd.get(i))) {
    					sbCommaInd.add(fullCommaInd.get(i));
    				}
    				if (ifEnclosed(str,"(",")",fullCommaInd.get(i))) {
    					rbCommaInd.add(fullCommaInd.get(i));
    				}
    				if (ifEnclosed(str,"\"","\"",fullCommaInd.get(i))) {
    					quoCommaInd.add(fullCommaInd.get(i));
    				}
    			}
    			commaInd.addAll(searchComEle(cbCommaInd,sbCommaInd,rbCommaInd,quoCommaInd));
    		} else {
    			commaInd = fullCommaInd;
    		}
    		if (commaInd.size() == 0) {
    			strSets.add(str);
    		} else if (commaInd.size() == 1) {
    			strSets.add(str.substring(0, commaInd.get(0)-1));
    			if (str.charAt(str.length()-1) != ' ') {
    				strSets.add(str.substring(commaInd.get(0)+1, str.length()));
    			} else {
    				strSets.add(str.substring(commaInd.get(0)+1, str.length()-1));
    			}
    		} else {
    			strSets.add(str.substring(0, commaInd.get(0)-1));
    			if (commaInd.size() == 2) {
    				strSets.add(str.substring(commaInd.get(0)+1,commaInd.get(1)-1));
    			} else {
    				for (int i=0; i<commaInd.size()-1; i++) {
    					strSets.add(str.substring(commaInd.get(i)+1,commaInd.get(i+1)-1));
    				}
    			}
    			if (str.charAt(str.length()-1) != ' ') {
    				strSets.add(str.substring(commaInd.get(commaInd.size()-1)+1, str.length()));
    			} else {
    				strSets.add(str.substring(commaInd.get(commaInd.size()-1)+1, str.length()-1));
    			}
    		}
    	}
    	return strSets;
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

    public class TemCla {
    	private TemCla(String str) {
    	}
    }
    
    private class Documentation {
    	String info;
    	String revisions;
    	private Documentation(String info, String revisions) {
    		this.info = info;
    		this.revisions = revisions;
    	}
    }
    
    private class StrPair {
    	String name;
    	String value;
    	private StrPair(String name, String value) {
    		this.name = name;
    		this.value = value;
    	}
    }
}
