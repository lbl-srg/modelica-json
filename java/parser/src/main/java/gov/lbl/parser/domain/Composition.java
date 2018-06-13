package gov.lbl.parser.domain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import gov.lbl.parser.domain.Comment;

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
    		String docStr = Comment.findSubStr(annStr, "Documentation ");
    		String diagramStr = Comment.findSubStr(annStr, "Diagram ");
    		String iconStr = Comment.findSubStr(annStr, "Icon ");
    		String textStr = Comment.findSubStr(annStr, "Text ");
    		String venAnnStr = Comment.findSubStr(annStr, "__");

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
    			venSetTemp.addAll(Comment.splitAtComma(venAnnStr));
    			List<String> venSet = new ArrayList<String>();
    			for (int i=0; i<venSetTemp.size(); i++) {
    				if (!venSetTemp.get(i).trim().isEmpty()) {
    					venSet.add(venSetTemp.get(i));
    				}
    			}
    			for (int i=0; i<venSet.size(); i++) {
    				int equInd = venSet.get(i).indexOf("=");
    				name = venSet.get(i).substring(0, equInd).trim();
    				value = venSet.get(i).substring(equInd+1, venSet.get(i).length()).trim();
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
    		String annStrTem = annStr.substring(1, annStr.length()-1).trim();
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(annStrTem));
    		List<AnnotationString> annStrSet = new ArrayList<AnnotationString>();

    		String strEle;
    		String namTem;
    		String annTem;
    		for (int i=0; i<strSet.size(); i++) {
    			strEle = strSet.get(i);
    			namTem = strEle.substring(0, strEle.indexOf("(")).trim();
    			annTem = strEle.substring(strEle.indexOf("(")+1, strEle.lastIndexOf(")")).trim();
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
    		strSet.addAll(Comment.splitAtComma(str));
    		List<StrPair> strPair = new ArrayList<StrPair>();
    		String name;
    		String value;
    		int equInd;
    		String temStr;
    		for (int i=0; i<strSet.size(); i++) {
    			temStr = strSet.get(i);
    			equInd = temStr.indexOf("=");
    			name = temStr.substring(0, equInd).trim();
    			value = temStr.substring(equInd+1,temStr.length()).trim();
    			strPair.add(new StrPair(name,value));
    		}
    		this.annotation = strPair;
    		return new TemCla(str);
    	}
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
