package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.List;
import java.util.ArrayList;

public class Comment {
    public String string_comment;
    public AnnotationClass annotation;

    public Comment(String string_comment,
                   String annotation) {
    	this.string_comment = string_comment.isEmpty() ? null : string_comment;
    	String annTemp = "";
    	if (annotation == null) {
    		this.annotation = null;
    	} else {
    		/** access text string in "annotation (annTemp)" **/
    		annTemp = annotation.substring(1,annotation.length()-2);
    		AnnotationClass annCla = new AnnotationClass();
    		annCla.annClass(annTemp);
    		this.annotation = annCla;
    	}
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;

      Comment aComment = (Comment) o;
      if (string_comment != null ? !string_comment.equals(aComment.string_comment) : aComment.string_comment != null) return false;
      return annotation != null ? annotation.equals(aComment.annotation) : aComment.annotation == null;
    }

    @Override
    public int hashCode() {
      int result = string_comment != null ? string_comment.hashCode() : 0;
      result = 31 * result + (annotation != null ? annotation.hashCode() : 0);
      return result;
    }

    @Override
    public String toString() {
      return "Comment{" +
              "\nstring_comment=" + string_comment + '\'' +
              "\nannotation=" + annotation + '\'' +
              '}';
    }

    public class AnnotationClass {
       	String defaultName;
    	String diagram;
    	String icon;
    	Collection<StrPair> dialog;
    	String placement;
    	String line;
    	String text;
    	Documentation documentation;
    	VendorAnnotation vendor_annotation;
    	Collection<StrPair> others;

    	private AnnBlo annClass(String annStr) {
    		String nameStr;
    		String dialogStr = findSubStr(annStr, "Dialog ");
    		String placementStr = findSubStr(annStr, "Placement ");
    		String lineStr = findSubStr(annStr, "Line ");
    		String docStr = findSubStr(annStr, "Documentation ");
    		String diagramStr = findSubStr(annStr, "Diagram ");
    		String iconStr = findSubStr(annStr, "Icon ");
    		String textStr = findSubStr(annStr, "Text ");
    		String venAnnStr = findSubStr(annStr, "__");

    		this.placement = placementStr;
    		this.line = lineStr;
    		this.diagram = diagramStr;
    		this.icon = iconStr;
    		this.text = textStr;
    		
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
    		
    		/** find "defaultComponentName" **/
    		if (annStr.contains("defaultComponentName")) {
    			int beginInd = annStr.indexOf("\"", annStr.indexOf("defaultComponentName")+"defaultComponentName".length()-1);
    			int endInd = annStr.indexOf("\"", beginInd+1);
    			nameStr = annStr.substring(beginInd, endInd+1);
    		} else {
    			nameStr = null;
    		}

    		/** created a list of String that will be removed from annotation string "annStr",
    		    so to find out "others" **/
    		List<String> strListToBeRem = new ArrayList<String>();
    		if (dialogStr != null) {
    			strListToBeRem.add("Dialog" + " (" + dialogStr + " )");
    		}
    		if (placementStr != null) {
    			strListToBeRem.add("Placement" + " (" + placementStr + " )");
    		}
    		if (lineStr != null) {
    			strListToBeRem.add("Line" + " (" + lineStr + " )");
    		}
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
    		if (venAnnStr != null) {
    			strListToBeRem.add(venAnnName + "("+venAnnStr+" )");
    		}

    		/** find out "others" **/
    		String otherAnnStr = annStr;
    		String tempStrInList;
    		if (strListToBeRem.size()>0) {
    			for (int i=0; i<strListToBeRem.size(); i++) {
    				tempStrInList = strListToBeRem.get(i);
    				otherAnnStr = otherAnnStr.replace(tempStrInList, "");
    				}
    			otherAnnStr = otherAnnStr.isEmpty() ? null : otherAnnStr;
    		} else {
    			otherAnnStr = annStr;
    		}

    		/** find defaultName **/
    		if (nameStr != null) {
    			this.defaultName = nameStr;
    		} else {
    			/* "defaultName" should be null when it is not model annotation. */
    			if (lineStr != null || dialogStr != null || placementStr != null || (otherAnnStr != null && otherAnnStr.contains("="))) {
    				this.defaultName = null;
    			/* "defaultName" should have value when it is model annotation. */
    			} else {
    				this.defaultName = "Fixme: default name is missing!";
    			}
    		}

    		/** find out element in Dialog (...) **/
    		List<StrPair> diaEle = new ArrayList<StrPair>();
    		if (dialogStr == null) {
    			this.dialog = null;
    		} else {
    			String name;
    			String value;
    			List<String> strSets = new ArrayList<String>();
    			strSets.addAll(splitAtComma(dialogStr));
    			for (int i=0; i<strSets.size(); i++) {
    				int equInd = strSets.get(i).indexOf("=");
    				name = strSets.get(i).substring(0,equInd-1);
    				value = strSets.get(i).substring(equInd+1, strSets.get(i).length());
    				diaEle.add(new StrPair(name,value));
    			}
    			this.dialog = diaEle;
    		}

    		/** find out other elements in Annotation (...) **/
    		List<StrPair> othEle = new ArrayList<StrPair>();   		
    		if (otherAnnStr == null || !otherAnnStr.contains("=")) {
    			this.others = null;
    		} else {    			
    			String name;
    			String value;
    			List<String> othSetTemp = new ArrayList<String>();
    			othSetTemp.addAll(splitAtComma(otherAnnStr));
    			List<String> othSet = new ArrayList<String>();
    			for (int i=0; i<othSetTemp.size(); i++) {
    				if (!othSetTemp.get(i).trim().isEmpty()) {
    					othSet.add(othSetTemp.get(i));
    				}
    			}
    			for (int i=0; i<othSet.size(); i++) {
    				int equInd = othSet.get(i).indexOf("=");
    				name = othSet.get(i).substring(0, equInd-1);
    				value = othSet.get(i).substring(equInd+1, othSet.get(i).length());
    				othEle.add(new StrPair(name,value));
    			}
    			this.others = othEle;
    		}    		
    		
    		
    		/** find out elements in documentation (info = , revisions = ) **/
    		if (docStr == null) {
    			this.documentation = null;
    		} else {
    			String infoStr;
    			String revStr;
    			if (docStr.contains("info")) {
    				int beginInd = docStr.indexOf("<html>", docStr.indexOf("info")) - 1;
    				int endIndTemp = docStr.indexOf("</html>", docStr.indexOf("info"));
    				int endInd = endIndTemp + "</html>".length() + 1;
    				infoStr = docStr.substring(beginInd, endInd);
    			} else {
    				infoStr = null;
    			}
    			if (docStr.contains("revisions =")) {
    				int beginInd = docStr.indexOf("<html>", docStr.indexOf("revisions =")) - 1;
    				int endIndTemp = docStr.indexOf("</html>", docStr.indexOf("revisions ="));
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

    private class VendorAnnotation{
    	private String name;
    	private Collection<StrPair> annotation;
    	private VenAnnMod vendorAnnotation(String venAnnName, String venAnnStr) {
    		this.name = venAnnName.replaceAll("\\s+", "");
    		List<StrPair> venAnnEle = new ArrayList<StrPair>();
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
    				venAnnEle.add(new StrPair(name,value));
    			}
    			this.annotation = venAnnEle;
    		}    		
    		return new VenAnnMod(venAnnStr);
    	}
    }
    
    /** access sub-string "subStr" in string "str" with syntax of "keyStr (subStr)" **/
    private static String findSubStr(String str, String keyStr) {
    	String subStr;
    	if (str.contains(keyStr)) {
			int leftRBcount = 0;
			int beginInd = str.indexOf("(",str.indexOf(keyStr)+keyStr.length()-2);
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

    /** check if index "fromInd" is enclosed in a completed "symbol1" and "symbol2",
        such as ( ), [ ], { }, " ". 
        If it is not enclosed and the symbols is completed, then return true, 
        otherwise, return false. **/
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

    private class AnnBlo {
    	private AnnBlo(String annString) {
    	}
    }

    public class VenAnnMod {
    	private VenAnnMod(String venAnnStr) {
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

    private class Documentation {
    	String info;
    	String revisions;
    	private Documentation(String info, String revisions) {
    		this.info = (info == null) ? "Fixme: info section is missing!" : info;
    		this.revisions = (revisions == null) ? "Fixme: revision record is missing!" : revisions;
    	}
    }

}
