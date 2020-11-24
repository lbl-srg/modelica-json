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
    	GraphicLayers diagram;
    	GraphicLayers icon;
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

    		this.text = textStr;

    		if (diagramStr != null) {
    			GraphicLayers temp = new GraphicLayers();
    			temp.graphicLayers(diagramStr);
    			this.diagram = temp;
    		} else {
    			this.diagram = null;
    		}

    		if (iconStr != null) {
    			GraphicLayers temp = new GraphicLayers();
    			temp.graphicLayers(iconStr);
    			this.icon = temp;
    		} else {
    			this.icon = null;
    		}

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
				int venAnnStrEndInd = annStr.indexOf(venAnnStr) + venAnnStr.length();
				String endBra = annStr.substring(venAnnStrEndInd, annStr.indexOf(")", venAnnStrEndInd)+1);
    			strListToBeRem.add(temStr.append(venAnnName).append("(")
						                 .append(venAnnStr).append(endBra)
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
    		this.othAnns = otherAnnStr.replaceAll(" ,", "").isEmpty() ? null : otherAnnStr;

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
    		String name, value;
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


    /** Parse graphical contents in Icon and Diagram layers:
     * Icon(coordinateSystem(extent={....}),
     *      graphics={Rectangle(extent={....}),Text(extent={...}, textString="...")}));
     * Diagram(coordinateSystem(extent={....}),
     *         graphics={Rectangle(extent={....}),Text(extent={...}, textString="...")}));
     **/
    public class GraphicLayers {
    	private Coordinate coordinateSystem;
    	private Graphics graphics;
    	public TemCla graphicLayers(String layStr) {
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(layStr));
    		String coorSysStr = "";
    		String grapStr = "";
    		for (String str : strSet) {
    			if (str.contains("coordinateSystem (")) {
    				coorSysStr = str.substring(str.indexOf('(')+1,str.lastIndexOf(')')).trim();
    				Coordinate temp = new Coordinate();
        		    temp.coordinate(coorSysStr);
        		    this.coordinateSystem = temp;
    			} else if (str.contains("graphics =")) {
    				grapStr = str.substring(str.indexOf('{')+1, str.lastIndexOf('}')).trim();
    				Graphics temp = new Graphics();
        			temp.graphics(grapStr);
        			this.graphics = temp;
    			}
    		}
    		return new TemCla(layStr);
    	}
    }

    /** parse coordinateSystem(extent={....}, preserveAspectRatio=..., initialScale=...)
     */
    private class Coordinate {
    	private Collection<Comment.Points> extent;
    	private Boolean preserveAspectRatio;
    	private Double initialScale;
    	private TemCla coordinate(String coorSysStr) {
    		List<String> strSet = new ArrayList<String>();
		    strSet.addAll(Comment.splitAtComma(coorSysStr));
		    List<Comment.Points> extPoints = new ArrayList<Comment.Points>();
		    Double iniScaStr = null;
			Boolean preAspRatStr = null;

		    for (String str : strSet) {
		    	int indEq = str.indexOf('=');
		    	String name = str.substring(0, indEq).trim();
		    	String value = str.substring(indEq+1, str.length()).trim();
		    	if (name.contains("extent")) {
		    		String temp = value.substring(value.indexOf('{') + 1, value.lastIndexOf('}')).trim();
		    		List<String> pointsSet = new ArrayList<String>();
		    		pointsSet.addAll(Comment.splitAtComma(temp));
		    		for (String p : pointsSet) {
		    			Comment test = new Comment("", null);
		    			Comment.Points point = test.new Points();
		    			point.points(p);
		    			extPoints.add(point);
		    		}
		    	} else if (name.contains("initialScale")) {
		    		iniScaStr = Double.valueOf(value);
		    	} else if (name.contains("preserveAspectRatio")) {
		    		preAspRatStr = Boolean.valueOf(value);
		    	}
		    }
		    this.extent = extPoints.isEmpty() ? null : extPoints;
	    	this.initialScale = iniScaStr;
	    	this.preserveAspectRatio = preAspRatStr;
    		return new TemCla(coorSysStr);
    	}
    }


    /** Parse graphical contents in Icon(), Diagram():
     * graphics={Rectangle(extent={....}),Text(extent={...}, textString="...")}));
     **/
    private class Graphics {
    	private Collection<Comment.LineBlock> line;
    	private Collection<Polygon> polygon;
    	private Collection<Rectangle> rectangle;
    	private Collection<Ellipse> ellipse;
    	private Collection<Text> text;
    	private Collection<Bitmap> bitmap;
    	private TemCla graphics(String graStr) {
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(graStr));
    		Comment test = new Comment("", null);

    		List<Comment.LineBlock> lines = new ArrayList<Comment.LineBlock>();
    		List<Polygon> polygons = new ArrayList<Polygon>();
    		List<Rectangle> rectangles = new ArrayList<Rectangle>();
    		List<Ellipse> ellipses = new ArrayList<Ellipse>();
    		List<Text> texts = new ArrayList<Text>();
    		List<Bitmap> bitmaps = new ArrayList<Bitmap>();

    		for (String str : strSet) {
    			int indBr = str.indexOf('(');
        		String primitive = str.substring(0, indBr).trim();
        		String specification = str.substring(indBr+1, str.lastIndexOf(')')).trim();
        		if (primitive.contains("Line")) {
        			Comment.LineBlock line = test.new LineBlock();
        			line.lineBlock(specification);
        			lines.add(line);
        		} else if (primitive.contains("Polygon")) {
        			Polygon polygon = new Polygon();
        			polygon.polygon(specification);
        			polygons.add(polygon);
        		} else if (primitive.contains("Rectangle")) {
        			Rectangle rectangle = new Rectangle();
        			rectangle.rectangle(specification);
        			rectangles.add(rectangle);
        		} else if (primitive.contains("Ellipse")) {
        			Ellipse ellipse = new Ellipse();
        			ellipse.ellipse(specification);
        			ellipses.add(ellipse);
        		} else if (primitive.contains("Text")) {
        			Text text = new Text();
        			text.text(specification);
        			texts.add(text);
        		} else if (primitive.contains("Bitmap")) {
        			Bitmap bitmap = new Bitmap();
        			bitmap.bitmap(specification);
        			bitmaps.add(bitmap);
        		}
    		}
    		this.line = lines.isEmpty() ? null : lines;
    		this.polygon = polygons.isEmpty() ? null : polygons;
    		this.rectangle = rectangles.isEmpty() ? null : rectangles;
    		this.ellipse = ellipses.isEmpty() ? null : ellipses;
    		this.text = texts.isEmpty() ? null : texts;
    		this.bitmap = bitmaps.isEmpty() ? null : bitmaps;
    		return new TemCla(graStr);
    	}
    }


    private class Polygon {
    	private Boolean visible;
    	private Comment.Points origin;
    	private Double rotation;
    	private Comment.Color lineColor;
		private Comment.DynamicColor dynLineColor;
    	private Comment.Color fillColor;
		private Comment.DynamicColor dynFillColor;
    	private String pattern;
    	private String fillPattern;
		private Comment.DynamicSelect dynFillPattern;
    	private Double lineThickness;
    	private Collection<Comment.Points> points;
    	private String smooth;
    	private TemCla polygon(String polStr) {
    		Comment test = new Comment("", null);
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(polStr));
    		for (String str : strSet) {
    			int indEq = str.indexOf('=');
		    	String name = str.substring(0, indEq).trim();
		    	String value = str.substring(indEq+1, str.length()).trim();
		    	if (name.contains("visible")) {
		    		this.visible = Boolean.valueOf(value);
		    	} else if (name.contains("origin")) {
		    		Comment.Points origin = test.new Points();
		    		origin.points(value);
		    		this.origin = origin;
		    	} else if (name.contains("rotation")) {
		    		this.rotation = Double.valueOf(value);
		    	} else if (name.contains("lineColor")) {
					if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynLinCol = test.new DynamicColor();
						dynLinCol.dynamicColor(value);
						this.dynLineColor = dynLinCol;
						this.lineColor = null;
					} else {
						Comment.Color lineColor = test.new Color();
		    			lineColor.color(value);
		    			this.lineColor = lineColor;
						this.dynLineColor = null;
					}
		    	} else if (name.contains("fillColor")) {
					if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynFilCol = test.new DynamicColor();
						dynFilCol.dynamicColor(value);
						this.dynFillColor = dynFilCol;
						this.fillColor = null;
					} else {
						Comment.Color fillColor = test.new Color();
		    			fillColor.color(value);
		    			this.fillColor = fillColor;
						this.dynFillColor = null;
					}
		    	} else if (name.contains("fillPattern")) {
					if (value.contains("DynamicSelect")) {
						Comment.DynamicSelect dynFilPat = test.new DynamicSelect();
						dynFilPat.dynamicSelect(value);
						this.fillPattern = null;
						this.dynFillPattern = dynFilPat;
					} else {
						this.fillPattern = value;
						this.dynFillPattern = null;
					}
		    	} else if (name.contains("pattern")) {
		    		this.pattern = value;
		    	} else if (name.contains("lineThickness")) {
		    		this.lineThickness = Double.valueOf(value);
		    	} else if (name.contains("smooth")) {
		    		this.smooth = value;
		    	} else if (name.contains("points")) {
		    		int indRB= value.indexOf('{');
		    		String temp = value.substring(indRB+1, value.lastIndexOf('}')).trim();
    				List<String> pointsSet = new ArrayList<String>();
    				pointsSet.addAll(Comment.splitAtComma(temp));
    				List<Comment.Points> points = new ArrayList<Comment.Points>();
    				for (String p : pointsSet) {
    					Comment.Points point = test.new Points();
    					point.points(p);
    					points.add(point);
    				}
    				this.points = points;
		    	}
    		}

    		return new TemCla(polStr);
    	}
    }


    private class Rectangle {
    	private Boolean visible;
    	private Comment.Points origin;
    	private Double rotation;
    	private Comment.Color lineColor;
		private Comment.DynamicColor dynLineColor;
    	private Comment.Color fillColor;
		private Comment.DynamicColor dynFillColor;
    	private String pattern;
    	private String fillPattern;
		private Comment.DynamicSelect dynFillPattern;
    	private Double lineThickness;
    	private String borderPattern;
    	private Collection<Comment.Points> extent;
		private Comment.DynamicPoints dynExtent;
    	private Double radius;
    	private TemCla rectangle(String recStr) {
    		Comment test = new Comment("", null);
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(recStr));
    		for (String str : strSet) {
    			int indEq = str.indexOf('=');
		    	String name = str.substring(0, indEq).trim();
		    	String value = str.substring(indEq+1, str.length()).trim();
		    	if (name.contains("visible")) {
		    		this.visible = Boolean.valueOf(value);
		    	} else if (name.contains("origin")) {
		    		Comment.Points origin = test.new Points();
		    		origin.points(value);
		    		this.origin = origin;
		    	} else if (name.contains("rotation")) {
		    		this.rotation = Double.valueOf(value);
		    	} else if (name.contains("lineColor")) {
					if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynLinCol = test.new DynamicColor();
						dynLinCol.dynamicColor(value);
						this.dynLineColor = dynLinCol;
						this.lineColor = null;
					} else {
						Comment.Color lineColor = test.new Color();
		    			lineColor.color(value);
		    			this.lineColor = lineColor;
						this.dynLineColor = null;
					}
		    	} else if (name.contains("fillColor")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynFilCol = test.new DynamicColor();
						dynFilCol.dynamicColor(value);
						this.dynFillColor = dynFilCol;
						this.fillColor = null;
					} else {
						Comment.Color fillColor = test.new Color();
		    			fillColor.color(value);
		    			this.fillColor = fillColor;
						this.dynFillColor = null;
					}
		    	} else if (name.contains("fillPattern")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicSelect dynFilPat = test.new DynamicSelect();
						dynFilPat.dynamicSelect(value);
						this.fillPattern = null;
						this.dynFillPattern = dynFilPat;
					} else {
						this.fillPattern = value;
						this.dynFillPattern = null;
					}
		    	} else if (name.contains("pattern")) {
		    		this.pattern = value;
		    	} else if (name.contains("lineThickness")) {
		    		this.lineThickness = Double.valueOf(value);
		    	} else if (name.contains("borderPattern")) {
		    		this.borderPattern = value;
		    	} else if (name.contains("radius")) {
		    		this.radius = Double.valueOf(value);
		    	} else if (name.contains("extent")) {
					if (value.contains("DynamicSelect")) {
						Comment.DynamicPoints dynExtPoi = test.new DynamicPoints();
						dynExtPoi.dynamicPoints(value);
						this.extent = null;
						this.dynExtent = dynExtPoi;
					} else {
						int indRB= value.indexOf('{');
		    			String temp = value.substring(indRB+1, value.lastIndexOf('}')).trim();
    					List<String> pointsSet = new ArrayList<String>();
    					pointsSet.addAll(Comment.splitAtComma(temp));
    					List<Comment.Points> extent = new ArrayList<Comment.Points>();
    					for (String p : pointsSet) {
    						Comment.Points point = test.new Points();
    						point.points(p);
    						extent.add(point);
    					}
    					this.extent = extent;
						this.dynExtent = null;
					}
		    	}
    		}
    		return new TemCla(recStr);
    	}
    }


    private class Text {
    	private Boolean visible;
    	private Comment.Points origin;
    	private Double rotation;
    	private Comment.Color lineColor;
		private Comment.DynamicColor dynLineColor;
    	private Comment.Color fillColor;
		private Comment.DynamicColor dynFillColor;
    	private String pattern;
    	private String fillPattern;
		private Comment.DynamicSelect dynFillPattern;
    	private Double lineThickness;
    	private Collection<Comment.Points> extent;
		private Comment.DynamicPoints dynExtent;
    	private String textString;
		private Comment.DynamicSelect dynTextString;
    	private Double fontSize;
    	private String fontName;
    	private String textStyle;
    	private Comment.Color textColor;
    	private String horizontalAlignment;
    	private TemCla text(String texStr) {
    		Comment test = new Comment("", null);
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(texStr));
    		for (String str : strSet) {
    			int indEq = str.indexOf('=');
		    	String name = str.substring(0, indEq).trim();
		    	String value = str.substring(indEq+1, str.length()).trim();
		    	if (name.contains("visible")) {
		    		this.visible = Boolean.valueOf(value);
		    	} else if (name.contains("origin")) {
		    		Comment.Points origin = test.new Points();
		    		origin.points(value);
		    		this.origin = origin;
		    	} else if (name.contains("rotation")) {
		    		this.rotation = Double.valueOf(value);
		    	} else if (name.contains("lineColor")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynLinCol = test.new DynamicColor();
						dynLinCol.dynamicColor(value);
						this.dynLineColor = dynLinCol;
						this.lineColor = null;
					} else {
						Comment.Color lineColor = test.new Color();
		    			lineColor.color(value);
		    			this.lineColor = lineColor;
						this.dynLineColor = null;
					}
		    	} else if (name.contains("fillColor")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynFilCol = test.new DynamicColor();
						dynFilCol.dynamicColor(value);
						this.dynFillColor = dynFilCol;
						this.fillColor = null;
					} else {
						Comment.Color fillColor = test.new Color();
		    			fillColor.color(value);
		    			this.fillColor = fillColor;
						this.dynFillColor = null;
					}
		    	} else if (name.contains("fillPattern")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicSelect dynFilPat = test.new DynamicSelect();
						dynFilPat.dynamicSelect(value);
						this.fillPattern = null;
						this.dynFillPattern = dynFilPat;
					} else {
						this.fillPattern = value;
						this.dynFillPattern = null;
					}
		    	} else if (name.contains("pattern")) {
		    		this.pattern = value;
		    	} else if (name.contains("lineThickness")) {
		    		this.lineThickness = Double.valueOf(value);
		    	} else if (name.contains("extent")) {
					if (value.contains("DynamicSelect")) {
						Comment.DynamicPoints dynExtPoi = test.new DynamicPoints();
						dynExtPoi.dynamicPoints(value);
						this.extent = null;
						this.dynExtent = dynExtPoi;
					} else {
						int indRB= value.indexOf('{');
		    			String temp = value.substring(indRB+1, value.lastIndexOf('}')).trim();
    					List<String> pointsSet = new ArrayList<String>();
    					pointsSet.addAll(Comment.splitAtComma(temp));
    					List<Comment.Points> extent = new ArrayList<Comment.Points>();
    					for (String p : pointsSet) {
    						Comment.Points point = test.new Points();
    						point.points(p);
    						extent.add(point);
    					}
    					this.extent = extent;
						this.dynExtent = null;
					}
		    	} else if (name.contains("textString")) {
					if (value.contains("DynamicSelect")) {
						Comment.DynamicSelect dynTexStr = test.new DynamicSelect();
						dynTexStr.dynamicSelect(value);
						this.textString = null;
						this.dynTextString = dynTexStr;
					} else {
						this.textString = value;
						this.dynTextString = null;
					}
		    	} else if (name.contains("fontSize")) {
		    		this.fontSize = Double.valueOf(value);
		    	} else if (name.contains("fontName")) {
		    		this.fontName = value;
		    	} else if (name.contains("textStyle")) {
		    		this.textStyle = value;
		    	} else if (name.contains("textColor")) {
		    		Comment.Color textColor = test.new Color();
		    		textColor.color(value);
		    		this.textColor = textColor;
		    	} else if (name.contains("horizontalAlignment")) {
		    		this.horizontalAlignment = value;
		    	}
    		}
    		return new TemCla(texStr);
    	}
    }


    private class Bitmap {
    	private Boolean visible;
    	private Comment.Points origin;
    	private Double rotation;
    	private Collection<Comment.Points> extent;
    	private String fileName;
    	private String imageSource;
    	private TemCla bitmap(String bitStr) {
    		Comment test = new Comment("", null);
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(bitStr));
    		for (String str : strSet) {
    			int indEq = str.indexOf('=');
		    	String name = str.substring(0, indEq).trim();
		    	String value = str.substring(indEq+1, str.length()).trim();
		    	if (name.contains("visible")) {
		    		this.visible = Boolean.valueOf(value);
		    	} else if (name.contains("origin")) {
		    		Comment.Points origin = test.new Points();
		    		origin.points(value);
		    		this.origin = origin;
		    	} else if (name.contains("rotation")) {
		    		this.rotation = Double.valueOf(value);
		    	} else if (name.contains("extent")) {
		    		int indRB= value.indexOf('{');
		    		String temp = value.substring(indRB+1, value.lastIndexOf('}')).trim();
    				List<String> pointsSet = new ArrayList<String>();
    				pointsSet.addAll(Comment.splitAtComma(temp));
    				List<Comment.Points> extent = new ArrayList<Comment.Points>();
    				for (String p : pointsSet) {
    					Comment.Points point = test.new Points();
    					point.points(p);
    					extent.add(point);
    				}
    				this.extent = extent;
		    	} else if (name.contains("fileName")) {
		    		this.fileName = value;
		    	} else if (name.contains("imageSource")) {
		    		this.imageSource = value;
		    	}
    		}
    		return new TemCla(bitStr);
    	}
    }


    private class Ellipse {
    	private Boolean visible;
    	private Comment.Points origin;
    	private Double rotation;
    	private Comment.Color lineColor;
		private Comment.DynamicColor dynLineColor;
    	private Comment.Color fillColor;
		private Comment.DynamicColor dynFillColor;
    	private String pattern;
    	private String fillPattern;
		private Comment.DynamicSelect dynFillPattern;
    	private Double lineThickness;
    	private Collection<Comment.Points> extent;
		private Comment.DynamicPoints dynExtent;
    	private Double startAngle;
    	private Double endAngle;
    	private String closure;
    	private TemCla ellipse(String ellStr) {
    		Comment test = new Comment("", null);
    		List<String> strSet = new ArrayList<String>();
    		strSet.addAll(Comment.splitAtComma(ellStr));
    		for (String str : strSet) {
    			int indEq = str.indexOf('=');
		    	String name = str.substring(0, indEq).trim();
		    	String value = str.substring(indEq+1, str.length()).trim();
		    	if (name.contains("visible")) {
		    		this.visible = Boolean.valueOf(value);
		    	} else if (name.contains("origin")) {
		    		Comment.Points origin = test.new Points();
		    		origin.points(value);
		    		this.origin = origin;
		    	} else if (name.contains("rotation")) {
		    		this.rotation = Double.valueOf(value);
		    	} else if (name.contains("lineColor")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynLinCol = test.new DynamicColor();
						dynLinCol.dynamicColor(value);
						this.dynLineColor = dynLinCol;
						this.lineColor = null;
					} else {
						Comment.Color lineColor = test.new Color();
		    			lineColor.color(value);
		    			this.lineColor = lineColor;
						this.dynLineColor = null;
					}
		    	} else if (name.contains("fillColor")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicColor dynFilCol = test.new DynamicColor();
						dynFilCol.dynamicColor(value);
						this.dynFillColor = dynFilCol;
						this.fillColor = null;
					} else {
						Comment.Color fillColor = test.new Color();
		    			fillColor.color(value);
		    			this.fillColor = fillColor;
						this.dynFillColor = null;
					}
		    	} else if (name.contains("fillPattern")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicSelect dynFilPat = test.new DynamicSelect();
						dynFilPat.dynamicSelect(value);
						this.fillPattern = null;
						this.dynFillPattern = dynFilPat;
					} else {
						this.fillPattern = value;
						this.dynFillPattern = null;
					}
		    	} else if (name.contains("pattern")) {
		    		this.pattern = value;
		    	} else if (name.contains("lineThickness")) {
		    		this.lineThickness = Double.valueOf(value);
		    	} else if (name.contains("closure")) {
		    		this.closure = value;
		    	} else if (name.contains("startAngle")) {
		    		this.startAngle = Double.valueOf(value);
		    	} else if (name.contains("endAngle")) {
		    		this.endAngle = Double.valueOf(value);
		    	} else if (name.contains("extent")) {
		    		if (value.contains("DynamicSelect")) {
						Comment.DynamicPoints dynExtPoi = test.new DynamicPoints();
						dynExtPoi.dynamicPoints(value);
						this.extent = null;
						this.dynExtent = dynExtPoi;
					} else {
						int indRB= value.indexOf('{');
		    			String temp = value.substring(indRB+1, value.lastIndexOf('}')).trim();
    					List<String> pointsSet = new ArrayList<String>();
    					pointsSet.addAll(Comment.splitAtComma(temp));
    					List<Comment.Points> extent = new ArrayList<Comment.Points>();
    					for (String p : pointsSet) {
    						Comment.Points point = test.new Points();
    						point.points(p);
    						extent.add(point);
    					}
    					this.extent = extent;
						this.dynExtent = null;
					}
		    	}
    		}
    		return new TemCla(ellStr);
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
