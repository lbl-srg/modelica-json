const jq = require('../lib/jsonquery.js')
const si = require('../lib/svgIcon.js')

// Add Diagram layer SVG section to Json (not raw)
function addDiagramSVG (jsonDataSet) {
  // Update Json representation: add diagram layer svg to interface class
  const interfaceClass = jsonDataSet.filter(dat => dat.within !== undefined && dat.within.endsWith('Interfaces'))
  const updatedInterface = interfaceClass.map(cla => si.interfaceItems(cla, 'diagram'))
  updatedInterface.forEach(ele => {
    var interfaceDiagItems = ele.svg.diagram.items
    var interfaceSvgDrawing = si.toSVG(interfaceDiagItems)
    Object.assign(ele.svg.diagram,
      { 'drawing': interfaceSvgDrawing })
  })
  // ---------------------------------------------------------------------------
  // Update Json representation: other than interface classes
  const regClass = jsonDataSet.filter(dat => interfaceClass.indexOf(dat) === -1)
  // Create diagram SVG for classes other than CDL elementary models
  const claWithDia = regClass.filter(cla => cla.topClassName !== undefined && !jq.isElementaryCDL(cla.topClassName))
  const updatedRegclass = claWithDia.map(cla => regularClassDiagram(cla, updatedInterface, regClass, jsonDataSet))
  updatedRegclass.forEach(ele => {
    var regClassDiagItems = ele.svg.diagram.items
    var regClassSvgDrawing = si.toSVG(regClassDiagItems)
    Object.assign(ele.svg.diagram,
      { 'drawing': regClassSvgDrawing })
  })
  // ---------------------------------------------------------------------------
}

// Create diagram svg for regular class
function regularClassDiagram (indClass, interfaceClasses, regClasses, jsonDataSet) {
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
    si.defaultLayer(indClass, 'diagram')
    // return null
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

  var hasDots = false
  var layerRectangles = []
  var layerPolygons = []
  var layerEllipses = []
  var layerPolylines = []
  var intPolygons = []
  var connectionPolylines = []
  var connectionLineDots = []
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
    for (var k = 0; k < indClass.diagram.graphics.ellipse.length; k++) {
      layerEllipses.push(si.ellipseSVG(indClass.diagram.graphics.ellipse[k], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ------------------ Lines in diagram layer --------------------
  if (indClass.diagram.graphics !== undefined &&
      indClass.diagram.graphics.line !== undefined) {
    for (var l = 0; l < indClass.diagram.graphics.line.length; l++) {
      layerPolylines.push(si.lineSVG(indClass.diagram.graphics.line[l], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ------------------ Text in diagram layer ---------------------
  if (indClass.diagram.graphics !== undefined &&
      indClass.diagram.graphics.text !== undefined) {
    for (var m = 0; m < indClass.diagram.graphics.text.length; m++) {
      layerTexts.push(si.textSVG(indClass.diagram.graphics.text[m], minX, maxY, 'diagram'))
    }
  }
  // --------------------------------------------------------------
  // ----------- Connection lines in diagram layer ----------------
  if (indClass.connections !== undefined) {
    for (var n = 0; n < indClass.connections.length; n++) {
      var connection = indClass.connections[n]
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
        var tempConnections = connectionLine(connection[2], minX, maxY)
        tempConnections.forEach(ele => connectionPolylines.push(ele))
      }
    }
  }
  // --------------------------------------------------------------
  // ------------ dots points on connection lines -----------------
  if (connectionPolylines.length > 2) {
    var jointDots = lineJoints(connectionPolylines)
    if (jointDots.length !== 0) {
      hasDots = true
      jointDots.forEach(ele => connectionLineDots.push(ele))
    }
  }
  // --------------------------------------------------------------
  // ------------- Polygons of the interface classes in diagram -------------
  var interfaces = []
  if (indClass.public !== undefined && indClass.public.inputs !== undefined) {
    interfaces = indClass.public.inputs
  }
  if (indClass.public !== undefined && indClass.public.outputs !== undefined) {
    interfaces = interfaces.concat(indClass.public.outputs)
  }
  if (interfaces.length > 0) {
    for (var p = 0; p < interfaces.length; p++) {
      // Retrieve diagram.svg parsed information of the interface classes
      var tempValues = si.interfacePolygon(interfaces[p], interfaceClasses, minX, maxY, 'diagram')
      // Retrieve interface instantiate graphical information in Dymola
      var originPoints = tempValues.points
      var svgItems = tempValues.svgItems
      // Transfer the Dymola graphical information to the one in SVG
      var xIns = []
      var yIns = []
      for (var q = 0; q < originPoints.x.length; q++) {
        xIns.push(originPoints.x[q] - minX)
        yIns.push(maxY - originPoints.y[q])
      }
      var instPoints = Object.assign(
        { 'x': xIns }, { 'y': yIns }
      )
      // Write the points to string like 'x1,y1 x2,y2 x3,y3 ...', which is
      // the format used in svg

      var instPointsStr = si.instantiatePointsString(instPoints)
      intPolygons.push(Object.assign(
        { 'points': instPointsStr },
        { 'hasFill': svgItems.layerPolygons[0].hasFill },
        { 'fill': svgItems.layerPolygons[0].fill },
        { 'stroke': svgItems.layerPolygons[0].stroke },
        { 'strokeDasharray': svgItems.layerPolygons[0].strokeDasharray },
        { 'strokeWidth': svgItems.layerPolygons[0].strokeWidth }
      ))
      if (svgItems.layerTexts !== undefined) {
        for (var qq = 0; qq < svgItems.layerTexts.length; qq++) {
          classTexts.push(updateText(svgItems.layerTexts[qq], interfaces[p], tempValues.iconDim,
            tempValues.insDim, tempValues.insTopleft, jsonDataSet))
        }
      }
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
      var classIns = classInstance(classIcon, classes[t], minX, maxY, jsonDataSet)
      classRectangles = classRectangles.concat(classIns.classRectangles)
      classPolygons = classPolygons.concat(classIns.classPolygons)
      classEllipses = classEllipses.concat(classIns.classEllipses)
      classPolylines = classPolylines.concat(classIns.classPolylines)
      classTexts = classTexts.concat(classIns.classTexts)
    }
  }
  // --------------------------------------------------------------
  const items = Object.assign(
    { 'width': width },
    { 'height': height },
    { 'layerRectangles': (layerRectangles.length === 0 ? undefined : layerRectangles) },
    { 'layerPolygons': (layerPolygons.length === 0 ? undefined : layerPolygons) },
    { 'layerEllipses': (layerEllipses.length === 0 ? undefined : layerEllipses) },
    { 'layerPolylines': (layerPolylines.length === 0 ? undefined : layerPolylines) },
    { 'intPolygons': (intPolygons.length === 0 ? undefined : intPolygons) },
    { 'connectionPolylines': (connectionPolylines.length === 0 ? undefined : connectionPolylines) },
    { 'hasDots': hasDots },
    { 'connectionLineDots': (connectionLineDots.length === 0 ? undefined : connectionLineDots) },
    { 'layerTexts': (layerTexts.length === 0 ? undefined : layerTexts) },
    { 'classRectangles': (classRectangles.length === 0 ? undefined : classRectangles) },
    { 'classPolygons': (classPolygons.length === 0 ? undefined : classPolygons) },
    { 'classEllipses': (classEllipses.length === 0 ? undefined : classEllipses) },
    { 'classPolylines': (classPolylines.length === 0 ? undefined : classPolylines) },
    { 'classTexts': (classTexts.length === 0 ? undefined : classTexts) }
  )
  const diagram = Object.assign(
    { 'items': items },
    { 'initialScale': indClass.diagram.coordinateSystem.initialScale },
    { 'preserveAspectRatio': indClass.diagram.coordinateSystem.preserveAspectRatio }
  )
  const updatedSVG = Object.assign(indClass.svg, { 'diagram': diagram })
  return Object.assign(indClass, { 'svg': updatedSVG })
}

// Find the updated SVG properties when class being instantiated
function classInstance (classIcon, insClass, minX, maxY, jsonDataSet) {
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
  var widthRatio = Math.abs(classExtent[1].x - classExtent[0].x) /
                   Math.abs(iconCoordinate[1].x - iconCoordinate[0].x)
  var heightRatio = Math.abs(classExtent[1].y - classExtent[0].y) /
                    Math.abs(iconCoordinate[1].y - iconCoordinate[0].y)
  // Find out the icon's dimenion when it is instantiated
  var insWidth = widthRatio * iconWidth
  var insHeight = heightRatio * iconHeight
  // Find out coordinate position of top left corner of the instantiate class
  var topLeftX = (Math.min(classExtent[0].x, classExtent[1].x) -
                  widthRatio * Math.min(iconCoordinate[1].x, iconCoordinate[0].x)) -
                 minX
  var topLeftY = maxY -
                 (Math.max(classExtent[0].y, classExtent[1].y) +
                  Math.min(iconCoordinate[0].y, iconCoordinate[1].y) * heightRatio)

  var iconDim = Object.assign({ 'width': iconWidth }, { 'height': iconHeight })
  var insDim = Object.assign({ 'width': insWidth }, { 'height': insHeight })
  var insTopleft = Object.assign({ 'x': topLeftX }, { 'y': topLeftY })

  // Find the updated rectangle properties after the class being instantiated
  if (iconItems.layerRectangles !== undefined) {
    for (var i = 0; i < iconItems.layerRectangles.length; i++) {
      classRectangles.push(updateRectangle(iconItems.layerRectangles[i], iconDim, insDim, insTopleft))
    }
  }
  // ---------------------------------------------------------------------------
  // Find the updated polygon properties after the class being instantiated
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
  // Find the updated polyline properties after the class being instantiated
  if (iconItems.layerPolylines !== undefined) {
    for (var k = 0; k < iconItems.layerPolylines.length; k++) {
      classPolylines.push(updatePoly(iconItems.layerPolylines[k], iconDim, insDim,
        insTopleft, 'polyline'))
    }
  }
  // ---------------------------------------------------------------------------
  // Find the updated ellipse properties after the class being instantiated
  if (iconItems.layerEllipses !== undefined) {
    for (var l = 0; l < iconItems.layerEllipses.length; l++) {
      classEllipses.push(updateEllipse(iconItems.layerEllipses[l], iconDim, insDim, insTopleft))
    }
  }
  // ---------------------------------------------------------------------------
  // Find the updated text properties after the class being instantiated
  if (iconItems.layerTexts !== undefined) {
    for (var m = 0; m < iconItems.layerTexts.length; m++) {
      classTexts.push(updateText(iconItems.layerTexts[m], insClass, iconDim, insDim, insTopleft, jsonDataSet))
    }
  }
  // ---------------------------------------------------------------------------
  return Object.assign(
    { 'classRectangles': classRectangles },
    { 'classPolygons': classPolygons },
    { 'classEllipses': classEllipses },
    { 'classPolylines': classPolylines },
    { 'classTexts': classTexts }
  )
}

// Update items for text element in SVG of instantiated class
function updateText (iconText, insClass, iconDim, insDim, insTopleft, jsonDataSet) {
  var textAnchor = iconText.textAnchor
  var iconFont = iconText.fontSize
  var iconX = iconText.xStart
  var iconY = iconText.yStart
  var iconFontRatio = iconFont / iconDim.width
  var iconXRatio = iconX / iconDim.width
  var iconYRatio = iconY / iconDim.height
  var fontSize = Math.floor(iconFontRatio * insDim.width * 100) / 100
  var xStart = iconXRatio * insDim.width + insTopleft.x
  var yStart = iconYRatio * insDim.height + insTopleft.y
  var oldTSpan = iconText.tSpan
  var newTSpan = []
  var dy = []
  for (var i = 0; i < oldTSpan.length; i++) {
    var tempDy = i > 0 ? fontSize : 0
    dy.push(tempDy)
  }
  for (var j = 0; j < oldTSpan.length; j++) {
    var oldxSpan = oldTSpan[j].xSpan
    var oldText = oldTSpan[j].textString
    var scaledxSpan = (oldxSpan / iconDim.width) * insDim.width + insTopleft.x
    var newText = oldText
    var newTextPos = scaledxSpan
    if (oldTSpan[j].textString.includes('%')) {
      newText = updateTextString(oldTSpan[j].textString, insClass, jsonDataSet)
      newTextPos = (textAnchor === 'middle') ? xStart : updateTextPos(scaledxSpan, oldText.length, newText.length, fontSize, iconText.font)
    }
    var obj = Object.assign(
      { 'xSpan': newTextPos },
      { 'dy': dy[j] },
      { 'textString': newText }
    )
    newTSpan.push(obj)
  }
  return Object.assign(
    { 'font': iconText.font },
    { 'fontSize': fontSize },
    { 'xStart': xStart },
    { 'yStart': yStart },
    { 'textAnchor': textAnchor },
    { 'fill': iconText.fill },
    { 'moreLines': iconText.moreLines },
    { 'oneLine': iconText.oneLine },
    { 'tSpan': newTSpan }
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
    { 'cx': cx },
    { 'cy': cy },
    { 'rx': rx },
    { 'ry': ry },
    { 'hasFill': iconEll.hasFill },
    { 'fill': iconEll.fill },
    { 'hasPattern': iconEll.hasPattern },
    { 'stroke': iconEll.stroke },
    { 'strokeDasharray': iconEll.strokeDasharray },
    { 'strokeWidth': iconEll.strokeWidth }
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
  var pointsPair = Object.assign({ 'x': x }, { 'y': y })
  var points = si.instantiatePointsString(pointsPair)
  if (poly === 'polygon') {
    return Object.assign(
      { 'points': points },
      { 'hasFill': iconPoly.hasFill },
      { 'fill': iconPoly.fill },
      { 'stroke': iconPoly.stroke },
      { 'strokeDasharray': iconPoly.strokeDasharray },
      { 'strokeWidth': iconPoly.strokeWidth }
    )
  } else {
    return Object.assign(
      { 'points': points },
      { 'fill': iconPoly.fill },
      { 'stroke': iconPoly.stroke },
      { 'strokeDasharray': iconPoly.strokeDasharray },
      { 'strokeWidth': iconPoly.strokeWidth }
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
  var startPoint = Object.assign({ 'x': x }, { 'y': y })
  var ratio = si.pointsPairRatio(startPoint, iconDim.width, iconDim.height)
  var xDis = insDim.width * ratio.x
  var yDis = insDim.height * ratio.y
  var newX = xDis + insTopLeft.x
  var newY = yDis + insTopLeft.y
  var newWidth = widthStr * insDim.width / iconDim.width
  var newHeight = heightStr * insDim.height / iconDim.height
  var newStrokeWidth = Math.floor(iconRect.strokeWidth * ratio.x * 100) / 100
  return Object.assign(
    { 'x': newX },
    { 'y': newY },
    { 'width': newWidth },
    { 'height': newHeight },
    { 'hasFill': iconRect.hasFill },
    { 'fill': iconRect.fill },
    { 'stroke': iconRect.stroke },
    { 'hasStroke': iconRect.hasStroke },
    { 'strokeDasharray': iconRect.strokeDasharray },
    { 'strokeWidth': newStrokeWidth }
  )
}

// Create connection line svg based on line text: connection line and its white background
function connectionLine (obj, minX, maxY) {
  var output = []
  var lines = si.lineSVG(obj, minX, maxY)
  var backGround = Object.assign(
    { 'points': lines.points },
    { 'fill': lines.fill },
    { 'stroke': 'rgb(255,255,255)' },
    { 'strokeDasharray': lines.strokeDasharray },
    { 'strokeWidth': 1.25 }
  )
  output.push(backGround)
  output.push(lines)
  return output
}

// Create connection line joint dots
function lineJoints (linesWithBackground) {
  var dots = []
  var lines = []
  for (var i = 0; i < linesWithBackground.length / 2; i++) {
    lines.push(linesWithBackground[2 * i + 1])
  }
  if (lines.length > 1) {
    // each line has a set of points (x, y)
    var linePoints = []
    lines.forEach(line => linePoints.push(si.pointsPair(line.points)))
    for (var j = 1; j < linePoints.length; j++) {
      for (var k = 0; k < j; k++) {
        // Total number of points on line K
        var pointsNumberJ = linePoints[j].x.length
        var pointsNumberK = linePoints[k].x.length
        var lessPoint = Math.min(pointsNumberJ, pointsNumberK)
        // search if any two lines have the same ending point
        var sameOrder1 = linePoints[j].x[0] === linePoints[k].x[0] && linePoints[j].y[0] === linePoints[k].y[0]
        var sameOrder2 = linePoints[j].x[pointsNumberJ - 1] === linePoints[k].x[pointsNumberK - 1] && linePoints[j].y[pointsNumberJ - 1] === linePoints[k].y[pointsNumberK - 1]
        var reverseOrder1 = linePoints[j].x[0] === linePoints[k].x[pointsNumberK - 1] && linePoints[j].y[0] === linePoints[k].y[pointsNumberK - 1]
        var reverseOrder2 = linePoints[j].x[pointsNumberJ - 1] === linePoints[k].x[0] && linePoints[j].y[pointsNumberJ - 1] === linePoints[k].y[0]

        if (sameOrder1) {
          for (var l = 0; l < lessPoint; l++) {
            if (linePoints[j].x[l] !== linePoints[k].x[l] ||
                linePoints[j].y[l] !== linePoints[k].y[l]) {
              break
            }
          }
          const temp = findDots(linePoints[j], linePoints[k], l, l, false)
          if (temp) {
            dots.push(temp)
          }
        }
        if (sameOrder2) {
          for (var m = 0; m < lessPoint; m++) {
            if (linePoints[j].x[pointsNumberJ - 1 - m] !== linePoints[k].x[pointsNumberK - 1 - m] ||
                linePoints[j].y[pointsNumberJ - 1 - m] !== linePoints[k].y[pointsNumberK - 1 - m]) {
              break
            }
          }
          const temp = findDots(linePoints[j], linePoints[k], pointsNumberJ - 1 - m, pointsNumberK - 1 - m, true)
          if (temp) {
            dots.push(temp)
          }
        }
        if (reverseOrder1) {
          for (var n = 0; n < lessPoint; n++) {
            if (linePoints[j].x[n] !== linePoints[k].x[pointsNumberK - 1 - n] ||
                linePoints[j].y[n] !== linePoints[k].y[pointsNumberK - 1 - n]) {
              break
            }
          }
          const temp = findDots(linePoints[j], linePoints[k], n, pointsNumberK - 1 - n, false)
          if (temp) {
            dots.push(temp)
          }
        }
        if (reverseOrder2) {
          for (var p = 0; p < lessPoint; p++) {
            if (linePoints[j].x[pointsNumberJ - 1 - p] !== linePoints[k].x[p] ||
                linePoints[j].y[pointsNumberJ - 1 - p] !== linePoints[k].y[p]) {
              break
            }
          }
          const temp = findDots(linePoints[k], linePoints[j], p, pointsNumberJ - 1 - p, false)
          if (temp) {
            dots.push(temp)
          }
        }
      }
    }
  }
  return dots
}

// Find dots
function findDots (JPoints, KPoints, indexJ, indexK, reverse) {
  var temp
  var eclipseCx
  var eclipseCy
  var shift = reverse ? -1 : 1
  if (JPoints.x[indexJ] === KPoints.x[indexK]) {
    temp = [JPoints.y[indexJ - shift], JPoints.y[indexJ], KPoints.y[indexK]]
    temp.sort(function (a, b) { return a - b })
    eclipseCx = JPoints.x[indexJ]
    eclipseCy = temp[1]
  } else if (JPoints.y[indexJ] === KPoints.y[indexK]) {
    temp = [JPoints.x[indexJ - shift], JPoints.x[indexJ], KPoints.x[indexK]]
    temp.sort(function (a, b) { return a - b })
    eclipseCx = temp[1]
    eclipseCy = JPoints.y[indexJ]
  } else {
    eclipseCx = JPoints.x[indexJ - shift]
    eclipseCy = JPoints.y[indexJ - shift]
  }
  if (!eclipseCx || !eclipseCy) {
    return null
  } else {
    return Object.assign(
      { 'cx': eclipseCx },
      { 'cy': eclipseCy },
      { 'rx': 1 },
      { 'ry': 1 },
      { 'hasFill': true },
      { 'fill': 'rgb(0,0,127)' },
      { 'hasPattern': false },
      { 'stroke': 'rgb(0,0,127)' },
      { 'strokeDasharray': '1,0' },
      { 'strokeWidth': 0.25 })
  }
}

// Update text string: %name to the instantiated name
function updateTextString (textString, insClass, jsonDataSet) {
  var output
  if (textString === '%name') {
    output = insClass.name
  } else {
    // for example, textString like "k1 = %k1 and k2 = %k2"
    var indices1 = [] // index of '%'
    for (var i = 0; i < textString.length; i++) {
      if (textString[i] === '%') indices1.push(i)
    }
    var indices2 = [] // index of first empty space after '%'
    for (var j = 0; j < indices1.length; j++) {
      indices2.push(textString.indexOf(' ', indices1[j]))
    }
    if (indices2[indices2.length - 1] === -1) {
      indices2[indices2.length - 1] = textString.length
    }
    var parameters = []
    for (var k = 0; k < indices1.length; k++) {
      parameters.push(textString.substring(indices1[k] + 1, indices2[k]))
    }
    var values = []
    for (var l = 0; l < parameters.length; l++) {
      if (insClass.modifications === undefined) {
        // search the default parameter value from original class
        var default1 = defaultParameter(parameters[l], insClass.className, jsonDataSet)
        values.push(default1)
      } else {
        for (var m = 0; m < insClass.modifications.length; m++) {
          var mod = insClass.modifications[m]
          if (mod.name === parameters[l]) {
            values.push(Object.assign(
              { 'origin': '%' + parameters[l] },
              { 'value': mod.value }
            ))
            break
          }
        }
        // searched the entire modification section but cannot find the parameter,
        // then find the default value
        if (m === insClass.modifications.length - 1 && mod.name !== parameters[l]) {
          var default2 = defaultParameter(parameters[l], insClass.className, jsonDataSet)
          values.push(default2)
        }
      }
    }
    var tempString = textString
    for (var n = 0; n < values.length; n++) {
      tempString = tempString.replace(values[n].origin, values[n].value)
    }
    output = tempString
  }
  return output
}

// when class is instantiated, the instanitated name will be shown,
// like using "retDamMaxLimSig" instead of "%name". In the svg, when instantiating
// one class, the text position should also be updated.
function updateTextPos (oldXSpan, oldLength, newLength, fontSize, font) {
  var newPos
  var fontWidth = fontSize * si.fontAspectRatio(font)
  var oldStringWidth = oldLength * fontWidth
  var newStringWidth = newLength * fontWidth
  newPos = oldXSpan - (newStringWidth - oldStringWidth) / 2
  return newPos
}

// find default parameter value
function defaultParameter (name, indCla, jsonDataSet) {
  var objJas = jsonDataSet.filter(dat => dat.topClassName === indCla ||
                                         dat.topClassName.includes(indCla))
  var pubPar = objJas[0].public.parameters
  var parObj = pubPar.filter(par => par.name === name)
  var value = parObj[0].value
  return Object.assign(
    { 'origin': '%' + name },
    { 'value': value }
  )
}

module.exports.addDiagramSVG = addDiagramSVG
