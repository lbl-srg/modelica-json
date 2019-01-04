const jq = require('../lib/jsonquery.js')
const si = require('../lib/svgIcon.js')

// Add Diagram layer SVG section to simplified Json
function addDiagramSVG (jsonDataSet) {
  // Update Json representation: interface class with diagram layer svg
  const interfaceClass = jsonDataSet.filter(dat => dat.within.endsWith('Interfaces'))
  const updatedInterface = interfaceClass.map(cla => si.interfaceItems(cla, 'diagram'))
  updatedInterface.forEach(ele => {
    var interfaceDiagItems = ele.svg.diagram.items
    var interfaceSvgDrawing = si.toSVG(interfaceDiagItems)
    Object.assign(ele.svg.diagram,
      {'drawing': interfaceSvgDrawing})
  })
  // ---------------------------------------------------------------------------
  // Update Json representation: other than interface classes
  const regClass = jsonDataSet.filter(dat => interfaceClass.indexOf(dat) === -1)
  // Create diagram SVG for classes other than CDL elementary models
  const claWithDia = regClass.filter(cla => !jq.isElementaryCDL(cla.topClassName))
  const updatedRegclass = claWithDia.map(cla => regularClassDiagram(cla, updatedInterface, regClass))
  updatedRegclass.forEach(ele => {
    var regClassDiagItems = ele.svg.diagram.items
    var regClassSvgDrawing = si.toSVG(regClassDiagItems)
    Object.assign(ele.svg.diagram,
      {'drawing': regClassSvgDrawing})
  })
  // ---------------------------------------------------------------------------
}

// Create diagram svg for regular class
function regularClassDiagram (indClass, interfaceClasses, regClasses) {
  if (indClass.diagram !== undefined) {
    // In case there is no coordinate system specification in simplied json,
    // set it to default coordinate
    si.checkCoordinateSystem(indClass.diagram)
    si.checkLine(indClass.diagram)
    si.checkPolygon(indClass.diagram)
    si.checkRectangle(indClass.diagram)
    si.checkEllipse(indClass.diagram)
    si.checkText(indClass.diagram)
    si.checkBitmap(indClass.diagram)
  } else {
    return null
  }

  var minMaxValue = si.minMaxSVG(indClass, 'diagram')
  var minX = minMaxValue.minX
  var maxX = minMaxValue.maxX
  var minY = minMaxValue.minY
  var maxY = minMaxValue.maxY

  // Width and height of the svg
  var width = maxX - minX
  var height = maxY - minY
  // in SVG, the Y axis is start from top to bottom, so
  // the origin point should be (minX, maxY), to the righ bottom (maxX, minY)
  /* ---------------------------------------------------------- */

  var layerRectangles = []
  var layerPolygons = []
  var layerEllipses = []
  var layerPolylines = []
  var intPolygons = []
  var connectionPolylines = []
  var layerTexts = []
  var classRectangles = []
  var classPolygons = []
  var classEllipses = []
  var classPolylines = []
  var classTexts = []
  // ----------------- Rectangle in diagram layer -------------------
  if (indClass.diagram.graphics !== undefined &&
      indClass.diagram.graphics.rectangle !== undefined) {
    for (var i = 0; i < indClass.diagram.graphics.rectangle.length; i++) {
      layerRectangles.push(si.rectangleSVG(indClass.diagram.graphics.rectangle[i], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ----------------- Polygon in diagram layer -------------------
  if (indClass.diagram.graphics !== undefined &&
      indClass.diagram.graphics.polygon !== undefined) {
    for (var j = 0; j < indClass.diagram.graphics.polygon.length; j++) {
      layerPolygons.push(si.polygonSVG(indClass.diagram.graphics.polygon[j], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ----------------- Ellipse in diagram layer -------------------
  if (indClass.diagram.graphics !== undefined &&
      indClass.diagram.graphics.ellipse !== undefined) {
    for (var m = 0; m < indClass.diagram.graphics.ellipse.length; m++) {
      layerEllipses.push(si.ellipseSVG(indClass.diagram.graphics.ellipse[m], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ------------------ Lines in diagram layer --------------------
  if (indClass.diagram.graphics !== undefined &&
      indClass.diagram.graphics.line !== undefined) {
    for (var n = 0; n < indClass.diagram.graphics.line.length; n++) {
      layerPolylines.push(si.lineSVG(indClass.diagram.graphics.line[n], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ------------------ Text in diagram layer ---------------------
  if (indClass.diagram.graphics !== undefined &&
      indClass.diagram.graphics.text !== undefined) {
    for (var p = 0; p < indClass.diagram.graphics.text.length; p++) {
      layerTexts.push(si.textSVG(indClass.diagram.graphics.text[p], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ----------- Connection lines in diagram layer ----------------
  if (indClass.connections !== undefined) {
    for (var q = 0; q < indClass.connections.length; q++) {
      var connection = indClass.connections[q]
      if (connection.length > 2) {
        if (connection[2].color === undefined) {
          connection[2].color = { 'r': 0, 'g': 0, 'b': 0 }
        }
        if (connection[2].pattern === undefined) {
          connection[2].pattern = 'LinePattern.Solid'
        }
        if (connection[2].thickness === undefined) {
          connection[2].thickness = 0.25
        }
        connectionPolylines.push(si.lineSVG(connection[2], minX, maxY))
      }
    }
  }
  // --------------------------------------------------------------
  // ------------- Polygons of the interfaces diagram -------------
  var interfaces = []
  if (indClass.public !== undefined && indClass.public.inputs !== undefined) {
    interfaces = indClass.public.inputs
  }
  if (indClass.public !== undefined && indClass.public.outputs !== undefined) {
    interfaces = interfaces.concat(indClass.public.outputs)
  }
  if (interfaces.length > 0) {
    for (var k = 0; k < interfaces.length; k++) {
      // Retrieve diagram.svg parsed information of the interface classes
      var tempValues = si.interfacePolygon(interfaces[k], interfaceClasses, 'diagram')
      // Retrieve interface instantiate graphical information in Dymola
      var originPoints = tempValues.points
      var svgItems = tempValues.svgItems
      // Transfer the Dymola graphical information to the one in SVG
      var xIns = []
      var yIns = []
      for (var l = 0; l < originPoints.x.length; l++) {
        xIns.push(originPoints.x[l] - minX)
        yIns.push(maxY - originPoints.y[l])
      }
      var instPoints = Object.assign(
        {'x': xIns}, {'y': yIns}
      )
      // Write the points to string like 'x1,y1 x2,y2 x3,y3 ...', which is
      // the format used in svg
      var instPointsStr = si.instantiatePointsString(instPoints)
      intPolygons.push(Object.assign(
        {'points': instPointsStr},
        {'hasFill': svgItems.layerPolygons[0].hasFill},
        {'fill': svgItems.layerPolygons[0].fill},
        {'stroke': svgItems.layerPolygons[0].stroke},
        {'strokeDasharray': svgItems.layerPolygons[0].strokeDasharray},
        {'strokeWidth': svgItems.layerPolygons[0].strokeWidth}
      ))
    }
  }
  // --------------------------------------------------------------
  // ------------------- Classes instance -------------------------
  var classes = []
  if (indClass.public !== undefined && indClass.public.models !== undefined) {
    for (var r = 0; r < indClass.public.models.length; r++) {
      classes.push(indClass.public.models[r])
    }
  }
  if (indClass.protected !== undefined && indClass.protected.models !== undefined) {
    for (var s = 0; s < indClass.protected.models.length; s++) {
      classes.push(indClass.protected.models[s])
    }
  }
  classes = classes.filter(cla => cla.placement !== undefined)

  if (classes.length > 0) {
    for (var t = 0; t < classes.length; t++) {
      var temp2 = regClasses.filter(cla => (cla.topClassName === classes[t].className ||
                                            cla.topClassName.includes(classes[t].className)))
      var classIcon = temp2[0].svg.icon
      var classIns = classInstance(classIcon, classes[t], minX, maxY)
      classRectangles = classRectangles.concat(classIns.classRectangles)
      classPolygons = classPolygons.concat(classIns.classPolygons)
      classEllipses = classEllipses.concat(classIns.classEllipses)
      classPolylines = classPolylines.concat(classIns.classPolylines)
      classTexts = classTexts.concat(classIns.classTexts)
      /*
      if (classIns.classRectangles.length !== 0) {
        for (var ti = 0; ti < classIns.classRectangles.length; ti++) {
          classRectangles.push(classIns.classRectangles[ti])
        }
      }
      if (classIns.classPolygons.length !== 0) {
        for (var tj = 0; tj < classIns.classPolygons.length; tj++) {
          classPolygons.push(classIns.classPolygons[tj])
        }
      }
      if (classIns.classEllipses.length !== 0) {
        for (var tk = 0; tk < classIns.classEllipses.length; tk++) {
          classEllipses.push(classIns.classEllipses[tk])
        }
      }
      if (classIns.classPolylines.length !== 0) {
        for (var tl = 0; tl < classIns.classPolylines.length; tl++) {
          classPolylines.push(classIns.classPolylines[tl])
        }
      }
      if (classIns.classTexts.length !== 0) {
        for (var tm = 0; tm < classIns.classTexts.length; tm++) {
          classTexts.push(classIns.classTexts[tm])
        }
      }
      */
    }
  }
  // --------------------------------------------------------------
  const items = Object.assign(
    {'width': width},
    {'height': height},
    {'layerRectangles': (layerRectangles.length === 0 ? undefined : layerRectangles)},
    {'layerPolygons': (layerPolygons.length === 0 ? undefined : layerPolygons)},
    {'layerEllipses': (layerEllipses.length === 0 ? undefined : layerEllipses)},
    {'layerPolylines': (layerPolylines.length === 0 ? undefined : layerPolylines)},
    {'intPolygons': (intPolygons.length === 0 ? undefined : intPolygons)},
    {'connectionPolylines': (connectionPolylines.length === 0 ? undefined : connectionPolylines)},
    {'layerTexts': (layerTexts.length === 0 ? undefined : layerTexts)},
    {'classRectangles': (classRectangles.length === 0 ? undefined : classRectangles)},
    {'classPolygons': (classPolygons.length === 0 ? undefined : classPolygons)},
    {'classEllipses': (classEllipses.length === 0 ? undefined : classEllipses)},
    {'classPolylines': (classPolylines.length === 0 ? undefined : classPolylines)},
    {'classTexts': (classTexts.length === 0 ? undefined : classTexts)}
  )
  const diagram = Object.assign(
    {'items': items},
    {'initialScale': indClass.diagram.coordinateSystem.initialScale},
    {'preserveAspectRatio': indClass.diagram.coordinateSystem.preserveAspectRatio}
  )
  const updatedSVG = Object.assign(indClass.svg, {'diagram': diagram})
  return Object.assign(indClass, {'svg': updatedSVG})
}

// Find the updated SVG properties when class being instantiated
function classInstance (classIcon, insClass, minX, maxY) {
  var classRectangles = []
  var classPolygons = []
  var classEllipses = []
  var classPolylines = []
  var classTexts = []
  // Items in its own icon layer of the  instantiated class
  var iconCoordinate = classIcon.coordinate
  var iconItems = classIcon.items
  var iconWidth = iconItems.width
  var iconHeight = iconItems.height
  // Extent of the class being instantiated in current class
  var classExtent = insClass.placement.transformation.extent
  // Find out decreased ratio of the icon's dimension when it is instantiated
  var widthRatio = Math.abs(classExtent[1].x1 - classExtent[0].x1) /
                   Math.abs(iconCoordinate[1].x1 - iconCoordinate[0].x1)
  var heightRatio = Math.abs(classExtent[1].x2 - classExtent[0].x2) /
                    Math.abs(iconCoordinate[1].x2 - iconCoordinate[0].x2)
  // Find out the icon's dimenion when it is instantiated
  var insWidth = widthRatio * iconWidth
  var insHeight = heightRatio * iconHeight
  // Find out coordinate position of top left corner of the instantiate class
  var topLeftX = (Math.min(classExtent[0].x1, classExtent[1].x1) -
                  widthRatio * Math.min(iconCoordinate[1].x1, iconCoordinate[0].x1)) -
                 minX
  var topLeftY = maxY -
                 (Math.max(classExtent[0].x2, classExtent[1].x2) +
                  Math.min(iconCoordinate[0].x2, iconCoordinate[1].x2) * heightRatio)

  var iconDim = Object.assign({'width': iconWidth}, {'height': iconHeight})
  var insDim = Object.assign({'width': insWidth}, {'height': insHeight})
  var insTopleft = Object.assign({'x': topLeftX}, {'y': topLeftY})

  // console.log(iconItems)

  // Find the updated the rectangle properties after the class being instantiated
  if (iconItems.layerRectangles !== undefined) {
    for (var i = 0; i < iconItems.layerRectangles.length; i++) {
      classRectangles.push(updateRectangle(iconItems.layerRectangles[i], iconDim, insDim, insTopleft))
    }
  }
  // ---------------------------------------------------------------------------
  // Find the updated the polygon properties after the class being instantiated
  // Note that the polygon could be regular polygon, or the polygons of interfaces,
  // like inputs and outputs
  var polygons = []
  if (iconItems.layerPolygons !== undefined) {
    polygons = iconItems.layerPolygons
  }
  if (iconItems.intPolygons !== undefined) {
    polygons = polygons.concat(iconItems.intPolygons)
  }
  if (polygons.length !== 0) {
    for (var j = 0; j < polygons.length; j++) {
      classPolygons.push(updatePoly(polygons[j], iconDim, insDim,
                                    insTopleft, 'polygon'))
    }
  }
  // ---------------------------------------------------------------------------
  // Find the updated the polyline properties after the class being instantiated
  if (iconItems.layerPolylines !== undefined) {
    for (var k = 0; k < iconItems.layerPolylines.length; k++) {
      classPolylines.push(updatePoly(iconItems.layerPolylines[k], iconDim, insDim,
                                     insTopleft, 'polyline'))
    }
  }
  // ---------------------------------------------------------------------------
  // Find the updated the ellipse properties after the class being instantiated
  if (iconItems.layerEllipses !== undefined) {
    for (var l = 0; l < iconItems.layerEllipses.length; l++) {
      classEllipses.push(updateEllipse(iconItems.layerEllipses[l], iconDim, insDim, insTopleft))
    }
  }
  // ---------------------------------------------------------------------------
  // Find the updated the text properties after the class being instantiated
  if (iconItems.layerTexts !== undefined) {
    for (var m = 0; m < iconItems.layerTexts.length; m++) {
      classTexts.push(updateText(iconItems.layerTexts[m], iconDim, insDim, insTopleft))
    }
  }
  // ---------------------------------------------------------------------------
  return Object.assign(
    {'classRectangles': classRectangles},
    {'classPolygons': classPolygons},
    {'classEllipses': classEllipses},
    {'classPolylines': classPolylines},
    {'classTexts': classTexts}
  )
}

// Update items for text element in SVG of instantiated class
function updateText (iconText, iconDim, insDim, insTopleft) {
  var iconFont = iconText.fontSize
  var iconX = iconText.xStart
  var iconY = iconText.yStart
  var iconFontRatio = iconFont / iconDim.width
  var iconXRatio = iconX / iconDim.width
  var iconYRatio = iconY / iconDim.height
  var fontSize = iconFontRatio * insDim.width
  var xStart = iconXRatio * insDim.width + insTopleft.x
  var yStart = iconYRatio * insDim.height + insTopleft.y
  return Object.assign(
    {'font': iconText.font},
    {'fontSize': fontSize},
    {'xStart': xStart},
    {'yStart': yStart},
    {'fill': iconText.fill},
    {'moreLines': iconText.moreLines},
    {'oneLine': iconText.oneLine},
    {'tSpan': iconText.tSpan}
  )
}

// Update items for ellipse element in SVG of instantiated class
function updateEllipse (iconEll, iconDim, insDim, insTopleft) {
  var iconCx = iconEll.cx
  var iconCy = iconEll.cy
  var iconRx = iconEll.rx
  var iconRy = iconEll.ry
  var iconCxRatio = iconCx / iconDim.width
  var iconCyRatio = iconCy / iconDim.height
  var iconRxRatio = iconRx / iconDim.width
  var iconRyRatio = iconRy / iconDim.height
  var cx = iconCxRatio * insDim.width + insTopleft.x
  var cy = iconCyRatio * insDim.height + insTopleft.y
  var rx = iconRxRatio * insDim.width
  var ry = iconRyRatio * insDim.height
  return Object.assign(
    {'cx': cx},
    {'cy': cy},
    {'rx': rx},
    {'ry': ry},
    {'hasFill': iconEll.hasFill},
    {'fill': iconEll.fill},
    {'hasPattern': iconEll.hasPattern},
    {'stroke': iconEll.stroke},
    {'strokeDasharray': iconEll.strokeDasharray},
    {'strokeWidth': iconEll.strokeWidth}
  )
}

// Update items for polygon or polyline element in SVG of instantiated class
function updatePoly (iconPoly, iconDim, insDim, insTopleft, poly) {
  var pointsStr = iconPoly.points
  var iconPoints = si.pointsPair(pointsStr)
  var iconPointsRatio = si.pointsPairRatio(iconPoints, iconDim.width, iconDim.height)
  var x = []
  var y = []
  for (var i = 0; i < iconPointsRatio.x.length; i++) {
    x.push(iconPointsRatio.x[i] * insDim.width + insTopleft.x)
    y.push(iconPointsRatio.y[i] * insDim.height + insTopleft.y)
  }
  var pointsPair = Object.assign({'x': x}, {'y': y})
  var points = si.instantiatePointsString(pointsPair)
  if (poly === 'polygon') {
    return Object.assign(
      {'points': points},
      {'hasFill': iconPoly.hasFill},
      {'fill': iconPoly.fill},
      {'stroke': iconPoly.stroke},
      {'strokeDasharray': iconPoly.strokeDasharray},
      {'strokeWidth': iconPoly.strokeWidth}
    )
  } else {
    return Object.assign(
      {'points': points},
      {'fill': iconPoly.fill},
      {'stroke': iconPoly.stroke},
      {'strokeDasharray': iconPoly.strokeDasharray},
      {'strokeWidth': iconPoly.strokeWidth}
    )
  }
}

// Update items for rectangle element in SVG of instantiated class
function updateRectangle (iconRect, iconDim, insDim, insTopLeft) {
  var widthStr = iconRect.width
  var heightStr = iconRect.height
  var xStr = iconRect.x
  var yStr = iconRect.y
  var x = []; x.push(xStr)
  var y = []; y.push(yStr)
  var startPoint = Object.assign({'x': x}, {'y': y})
  var ratio = si.pointsPairRatio(startPoint, iconDim.width, iconDim.height)
  var xDis = insDim.width * ratio.x
  var yDis = insDim.height * ratio.y
  var newX = xDis + insTopLeft.x
  var newY = yDis + insTopLeft.y
  var newWidth = widthStr * insDim.width / iconDim.width
  var newHeight = heightStr * insDim.height / iconDim.height
  return Object.assign(
    {'x': newX},
    {'y': newY},
    {'width': newWidth},
    {'height': newHeight},
    {'hasFill': iconRect.hasFill},
    {'fill': iconRect.fill},
    {'stroke': iconRect.stroke},
    {'strokeDasharray': iconRect.strokeDasharray},
    {'strokeWidth': iconRect.strokeWidth}
  )
}

module.exports.addDiagramSVG = addDiagramSVG
