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
      return "Composition{" +
             "\nelement_list=" + element_list + '\'' +
             "\npublic=" + prefix_public + '\'' +
             "\nprotect=" + prefix_protect + '\'' +
             "\nprefixed_element=" + prefixed_element + '\'' +
             "\nequation_section=" + equation_section + '\'' +
             "\nalgorithm_section=" + algorithm_section + '\'' +
             "\nexternal=" + external + '\'' +
             "\nlanguage_specification=" + language_specification + '\'' +
             "\nexternal_function_call=" + external_function_call + '\'' +
             "\next_annotation=" + ext_annotation + '\'' +
             "\ncomp_annotation=" + comp_annotation + '\'' +
             '}';
    }

    private class AnnotationClass {
    	String defaultName;
    	String diagram;
    	String icon;
    	String text;
    	Documentation documentation;
    	String othAnns;

    	private AnnBlo annClass(String annStr) {
    		String nameStr;
    		String docStr = findSubStr(annStr, "Documentation ");
    		String diagramStr = findSubStr(annStr, "Diagram ");
    		String iconStr = findSubStr(annStr, "Icon ");
    		String textStr = findSubStr(annStr, "Text ");

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
    			this.defaultName = "Fixme: default name is missing!";
    		}
    		List<String> strListToBeRem = new ArrayList<String>();
    		if (docStr != null) {
    			strListToBeRem.add("Documentation" + " (" + docStr + " )");
    		}
    		if (diagramStr != null) {
    			strListToBeRem.add("Diagram" + " (" + diagramStr + " )");
    		}
    		if (iconStr != null) {
    			strListToBeRem.add("Icon" + " (" + iconStr + " )");
    		}
    		if (textStr != null) {
    			strListToBeRem.add("Text" + " (" + textStr + " )");
    		}
    		if (nameStr != null) {
    			strListToBeRem.add("defaultComponentName =" + nameStr);
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
    		return new AnnBlo(annStr);
    	}
    }

    private static String findSubStr(String str, String keyStr) {
    	String subStr;
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
    	return subStr;
    }

    private class AnnBlo {
    	private AnnBlo(String annString) {
    	}
    }

    private class Documentation {
    	String info;
    	String revisions;
    	private Documentation(String info, String revisions) {
    		this.info = (info == null) ? "Fixme: info section is missing!" : info;
    		this.revisions = (revisions == null) ? "Fixme: revision record is missing!" : revisions;
    	}
    }
}
