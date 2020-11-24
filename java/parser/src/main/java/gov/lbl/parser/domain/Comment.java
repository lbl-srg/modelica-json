package gov.lbl.parser.domain;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import gov.lbl.parser.domain.Composition.GraphicLayers;

import java.util.ArrayList;
import gov.lbl.parser.domain.Composition;

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

    /**
     * AnnotationClass --- program to parse
     *                     annotation(defaultComponentName = ...,
     *                                Diagram (...),
     *                                Icon (...),
     *                                Dialog (..., ..., ...),
     *                                Placement (..., ..., ...),
     *                                Line (...),
     *                                Text (...),
     *                                Documentation (...),
     *                                __Annotation (...))
     *
     */
    public class AnnotationClass {
       	String defaultName;
       	Composition.GraphicLayers diagram;
       	Composition.GraphicLayers icon;
    	Collection<StrPair> dialog;
    	PlacementBlock placement;
    	LineBlock line;
    	String text;
    	Documentation documentation;
    	VendorAnnotation vendor_annotation;
    	Collection<StrPair> others;

    	private TemCla annClass(String annStr) {
    		String nameStr;
    		String dialogStr = findSubStr(annStr, "Dialog ");
    		String placementStr = findSubStr(annStr, "Placement ");
    		String lineStr = findSubStr(annStr, "Line ");
    		String docStr = findSubStr(annStr, "Documentation ");
    		String diagramStr = findSubStr(annStr, "Diagram ");
    		String iconStr = findSubStr(annStr, "Icon ");
    		String textStr = findSubStr(annStr, "Text ");
    		String venAnnStr = findSubStr(annStr, "__");

    		if (placementStr != null) {
    			PlacementBlock placement = new PlacementBlock();
    			placement.placementBlock(placementStr);
    			this.placement = placement;
    		} else {
    			this.placement = null;
    		}

    		if (lineStr != null) {
    			LineBlock linBlo = new LineBlock();
    			linBlo.lineBlock(lineStr);
    			this.line = linBlo;
    		} else {
    			this.line = null;
    		}

    		Composition comp = new Composition(null, Collections.emptyList(),
    										   Collections.emptyList(),null,
    										   Collections.emptyList(),
    										   Collections.emptyList(),
    										   Collections.emptyList(),
    										   null,null,null,null);
    		if (diagramStr != null) {
    			Composition.GraphicLayers temp = comp.new GraphicLayers();
    			temp.graphicLayers(diagramStr);
    			this.diagram = temp;
    		} else {
    			this.diagram = null;
    		}

    		if (iconStr != null) {
    			Composition.GraphicLayers temp = comp.new GraphicLayers();
    			temp.graphicLayers(iconStr);
    			this.icon = temp;
    		} else {
    			this.icon = null;
    		}

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
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Dialog (")
    					                 .append(dialogStr)
    					                 .append(" )")
    					                 .toString());
    		}
    		if (placementStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Placement (")
    					                 .append(placementStr)
    					                 .append(" )")
    					                 .toString());
    		}
    		if (lineStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Line (")
    					                 .append(lineStr)
    					                 .append(" )")
    					                 .toString());
    		}
    		if (docStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Documentation (")
    					                 .append(docStr)
    					                 .append(" )")
    					                 .toString());
    		}
    		if (diagramStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Diagram (")
    					                 .append(diagramStr)
    					                 .append(" )")
    					                 .toString());
    		}
    		if (iconStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Icon (")
    					                 .append(iconStr)
    					                 .append(" )")
    					                 .toString());
    		}
    		if (textStr != null) {
    			StringBuilder temStr = new StringBuilder();
    			strListToBeRem.add(temStr.append("Text (")
    					                 .append(textStr)
    					                 .append(" )")
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
				int venAnnStrEndInd = annStr.indexOf(venAnnStr) + venAnnStr.length();
				String endBra = annStr.substring(venAnnStrEndInd, annStr.indexOf(")", venAnnStrEndInd)+1);
    			strListToBeRem.add(temStr.append(venAnnName).append("(")
				                         .append(venAnnStr).append(endBra)
    					                 .toString());
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
    			this.defaultName = null;
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
    				name = strSets.get(i).substring(0,equInd).trim();
    				value = strSets.get(i).substring(equInd+1, strSets.get(i).length()).trim();
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
    				String othSetEle = othSet.get(i);
    				int equInd;
    				if (othSetEle.contains("(")) {
    					if (othSetEle.indexOf("=") < othSetEle.indexOf("(")) {
    						equInd = othSetEle.indexOf("=");
    						name = othSetEle.substring(0, equInd).trim();
    	    				value = othSetEle.substring(equInd+1, othSet.get(i).length()).trim();
    	    				othEle.add(new StrPair(name,value));
    					} else {
    						int braInd = othSetEle.indexOf("(");
    						name = othSetEle.substring(0,braInd).trim();
    						value = othSetEle.substring(braInd+1,othSetEle.length()-2).trim();
    						othEle.add(new StrPair(name,value));
    					}
    				} else {
    					equInd = othSetEle.indexOf("=");
						name = othSetEle.substring(0, equInd).trim();
	    				value = othSetEle.substring(equInd+1, othSet.get(i).length()).trim();
	    				othEle.add(new StrPair(name,value));
    				}
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
    		return new TemCla(annStr);
    	}
    }

    private class VendorAnnotation{
    	private String name;
    	private Collection<StrPair> annotation;
    	private TemCla vendorAnnotation(String venAnnName, String venAnnStr) {
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
    				name = venSet.get(i).substring(0, equInd).trim();
    				value = venSet.get(i).substring(equInd+1, venSet.get(i).length()).trim();
    				venAnnEle.add(new StrPair(name,value));
    			}
    			this.annotation = venAnnEle;
    		}
    		return new TemCla(venAnnStr);
    	}
    }


    public class PlacementBlock{
    	private Boolean visible;
    	private Transformation transformation;
    	private Transformation iconTransformation;

    	public TemCla placementBlock(String placementStr) {
    		List<String> strSets = new ArrayList<String>();
			strSets.addAll(splitAtComma(placementStr));
			Boolean visible = null;
			Transformation transformation = null;
			Transformation iconTransformation = null;
			String name = null;
			String lefStr = null;
    		for (String str : strSets) {
    			if (str.contains("visible")) {
    				visible = Boolean.valueOf(str.substring(str.indexOf('=')+1, str.length()).trim());
    			} else {
    				name = str.substring(0, str.indexOf('(')).trim();
    				lefStr = str.substring(str.indexOf('(')+1, str.lastIndexOf(')')).trim();
				Transformation temp = new Transformation();
    				temp.transformation(lefStr);
    				if (name.contains("transformation")) {
        				transformation = temp;
        			} else if (name.contains("iconTransformation")) {
        				iconTransformation = temp;
        			}
    			}
    		}

    		this.visible = visible;
			this.transformation = transformation;
			this.iconTransformation = iconTransformation;
    		return new TemCla(placementStr);
    	}
    }

    public class Transformation{
    	private Collection<Points> extent;
    	private Double rotation;
    	private Points origin;
    	public TemCla transformation(String traStr) {
    		List<String> strSets = new ArrayList<String>();
			strSets.addAll(splitAtComma(traStr));
			String extStr = null;
			List<Points> extPoints = new ArrayList<Points>();
			Double rotStr = null;
			String oriStr = null;
			Points oriPoint = new Points();
			for (String str : strSets) {
				if (str.contains("extent")) {
					int temInd = str.indexOf('=');
					extStr = str.substring(temInd+1,str.length()).trim();
					String temp = extStr.substring(extStr.indexOf('{') + 1, extStr.lastIndexOf('}')).trim();

    				List<String> pointsSet = new ArrayList<String>();
    				pointsSet.addAll(splitAtComma(temp));
    				for (String p : pointsSet) {
    					Points point = new Points();
    					point.points(p);
    					extPoints.add(point);
    				}
				}
				if (str.contains("rotation")) {
					rotStr = Double.valueOf(str.substring(str.indexOf('=')+1, str.length()).trim());
				}
				if (str.contains("origin")) {
					oriStr = str.substring(str.indexOf('=')+1, str.length()).trim();
					oriPoint.points(oriStr);
				}
			}
			this.extent = extStr == null ? null : extPoints;
			this.rotation = rotStr;
			this.origin = oriStr == null ? null : oriPoint;
    		return new TemCla(traStr);
    	}

    }

    public class LineBlock{
    	private Boolean visible;
    	private Points origin;
    	private Double rotation;
    	private Collection<Points> points;
		private DynamicPoints dynPoints;
    	private Color color;
		private DynamicColor dynColor;
    	private String pattern;
    	private Double thickness;
    	private String arrow;
    	private Double arrowSize;
    	private String smooth;
    	public TemCla lineBlock(String lineStr) {
    		List<String> strSets = new ArrayList<String>();
    		strSets.addAll(splitAtComma(lineStr));
    		for (String str : strSets) {
    			int indEq = str.indexOf('=');
		    	String name = str.substring(0, indEq).trim();
		    	String value = str.substring(indEq+1, str.length()).trim();
    			if (name.contains("points")) {
					if (value.contains("DynamicSelect")) {
						DynamicPoints dynPoi = new DynamicPoints();
						dynPoi.dynamicPoints(value);
						this.dynPoints = dynPoi;
						this.points = null;
					} else {
						int indRB= value.indexOf('{');
    					String temp = value.substring(indRB+1, value.lastIndexOf('}')).trim();
    					List<Points> linePoints = new ArrayList<Points>();
    					List<String> pointsSet = new ArrayList<String>();
    					pointsSet.addAll(splitAtComma(temp));
    					for (String p : pointsSet) {
    						Points point = new Points();
    						point.points(p);
    						linePoints.add(point);
    					}
						this.points = linePoints;
						this.dynPoints = null;
					}
    			} else if (name.contains("color")) {
					if (value.contains("DynamicSelect")) {
						DynamicColor dynCol = new DynamicColor();
						dynCol.dynamicColor(value);
						this.dynColor = dynCol;
						this.color = null;
					} else {
						Color color = new Color();
    					color.color(value);
    					this.color = color;
						this.dynColor = null;
					}
    			} else if (name.contains("pattern")) {
    				this.pattern = value;
    			} else if (name.contains("thickness")) {
    				this.thickness = Double.valueOf(value);
    			} else if (name.contains("arrow")) {
    				this.arrow = value;
    			} else if (name.contains("arrowSize")) {
    				this.arrowSize = Double.valueOf(value);
    			} else if (name.contains("smooth")) {
    				this.smooth = value;
    			} else if (name.contains("visible")) {
    				this.visible = Boolean.valueOf(value);
    			} else if (name.contains("origin")) {
    				Points origin = new Points();
    				origin.points(value);
    				this.origin = origin;
    			} else if (name.contains("rotation")) {
    				this.rotation = Double.valueOf(value);
    			}
    		}
    		return new TemCla(lineStr);
    	}
    }

	public class DynamicSelect{
		private String firstOpt;
		private String secondOpt;
		public TemCla dynamicSelect(String optStr) {
			int lefBra = optStr.indexOf('(');
			int rigBra = optStr.lastIndexOf(')');
			String temStr = optStr.substring(lefBra+1, rigBra).trim();
			List<String> strSets = new ArrayList<String>();
    		strSets.addAll(splitAtComma(temStr));
    		this.firstOpt = strSets.get(0);
    		this.secondOpt = strSets.get(1);
    		return new TemCla(optStr);
		}
	}

    public class Points{
    	private Double x;
    	private Double y;
    	public TemCla points(String pointStr) {
    		int lefBra = pointStr.indexOf('{');
    		int rigBra = pointStr.indexOf('}');
    		String temStr = pointStr.substring(lefBra + 1, rigBra).trim();
    		List<String> strSets = new ArrayList<String>();
    		strSets.addAll(splitAtComma(temStr));
    		this.x = Double.valueOf(strSets.get(0));
    		this.y = Double.valueOf(strSets.get(1));
    		return new TemCla(pointStr);
    	}
    }

	public class DynamicPoints{
		private Collection<Points> points;
		private String dynPoints;
		public TemCla dynamicPoints(String poiStr) {
			DynamicSelect poiOpts = new DynamicSelect();
			poiOpts.dynamicSelect(poiStr);
			String firstOpt = poiOpts.firstOpt;
			int lefBra = firstOpt.indexOf('{');
			int rigBra = firstOpt.lastIndexOf('}');
			String temStr = firstOpt.substring(lefBra + 1, rigBra).trim();
			List<Points> points = new ArrayList<Points>();
    		List<String> pointsSet = new ArrayList<String>();
    		pointsSet.addAll(splitAtComma(temStr));
    		for (String p : pointsSet) {
				Points point = new Points();
    			point.points(p);
    			points.add(point);
    		}
			this.points = points;
			this.dynPoints = poiOpts.secondOpt;
			return new TemCla(poiStr);
		}
	}

    public class Color{
    	private Double r;
    	private Double g;
    	private Double b;
    	public TemCla color(String colorStr) {
    		int lefBra = colorStr.indexOf('{');
    		int rigBra = colorStr.indexOf('}');
    		String temStr = colorStr.substring(lefBra  + 1, rigBra).trim();
    		List<String> strSets = new ArrayList<String>();
    		strSets.addAll(splitAtComma(temStr));
    		this.r = Double.valueOf(strSets.get(0));
    		this.g = Double.valueOf(strSets.get(1));
    		this.b = Double.valueOf(strSets.get(2));
    		return new TemCla(colorStr);
    	}
    }

	public class DynamicColor{
		private Color color;
		private String dynColor;
		public TemCla dynamicColor(String colStr) {
			DynamicSelect colOpts = new DynamicSelect();
			colOpts.dynamicSelect(colStr);
			Color color = new Color();
			color.color(colOpts.firstOpt);
    		this.color = color;
			this.dynColor = colOpts.secondOpt;
			return new TemCla(colStr);
		}
	}

    /** access sub-string "subStr" in string "str" with syntax of "keyStr (subStr)" **/
    public static String findSubStr(String str, String keyStr) {
    	String subStr;
    	if (!ifEnclosed(str, "(", ")", str.indexOf(keyStr))
    			|| !ifEnclosed(str, "\"", "\"", str.indexOf(keyStr))) {
    		subStr = null;
    	} else {
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
				subStr = str.substring(beginInd+1, endInd).trim();
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
    public static Collection<String> splitAtComma(String str) {
    	str.trim();
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
    			strSets.add(str.substring(0, commaInd.get(0)).trim());
    			strSets.add(str.substring(commaInd.get(0)+1, str.length()).trim());
    		} else {
    			strSets.add(str.substring(0, commaInd.get(0)));
    			for (int i=0; i<commaInd.size()-1; i++) {
					strSets.add(str.substring(commaInd.get(i)+1,commaInd.get(i+1)).trim());
				}
    			strSets.add(str.substring(commaInd.get(commaInd.size()-1)+1, str.length()).trim());
    		}
    		if (strSets.get(strSets.size()-1).isEmpty()) {
    			strSets.remove(strSets.size()-1);
    		}
    	}
    	return strSets;
    }


    public static Collection<Integer> searchComEle(Collection<Integer> list1,
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

    private class TemCla {
    	private TemCla(String str) {
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
    		this.info = info;
    		this.revisions = revisions;
    	}
    }

}
