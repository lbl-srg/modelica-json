const mu = require('mustache')

function toSVG (svgItems) {
  var template = `
{{! This is a template for generating SVG file. }}

<svg version="1.1" baseProfile="full" width="{{width}}mm" height="{{height}}mm"
     viewBox="0 0 {{width}} {{height}}" xmlns="http://www.w3.org/2000/svg">

{{#layerRectangles.length}}
{{#layerRectangles}}
<rect x="{{x}}" y="{{y}}" width="{{width}}" height="{{height}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}stroke="{{stroke}}" {{#hasStroke}} stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" {{/hasStroke}} />
{{/layerRectangles}}
{{/layerRectangles.length}}

{{#layerPolygons.length}}
{{#layerPolygons}}
<polygon points="{{points}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" />
{{/layerPolygons}}
{{/layerPolygons.length}}

{{#layerEllipses.length}}
{{#layerEllipses}}
<ellipse cx="{{cx}}" cy="{{cy}}" rx="{{rx}}" ry="{{ry}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}{{#hasPattern}} stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" {{/hasPattern}} />
{{/layerEllipses}}
{{/layerEllipses.length}}

{{#layerPolylines.length}}
{{#layerPolylines}}
<polyline fill="{{fill}}" points="{{points}}" stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" />
{{/layerPolylines}}
{{/layerPolylines.length}}

{{#layerTexts.length}}
{{#layerTexts}}
<text font-family="{{font}}" font-size="{{fontSize}}" x="{{xStart}}" y="{{yStart}}" fill="{{fill}}" text-anchor="{{textAnchor}}" dominant-baseline="central" alignment-baseline="middle">
{{#tSpan.length}}
{{#tSpan}}
<tspan x="{{xSpan}}" {{#moreLines}} dy="{{dy}}" {{/moreLines}}>{{textString}}</tspan>
{{/tSpan}}
{{/tSpan.length}}
</text>
{{/layerTexts}}
{{/layerTexts.length}}

{{#connectionPolylines.length}}
{{#connectionPolylines}}
<polyline fill="{{fill}}" points="{{points}}" stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" />
{{/connectionPolylines}}
{{/connectionPolylines.length}}

{{#hasDots}}
{{#connectionLineDots.length}}
{{#connectionLineDots}}
<ellipse cx="{{cx}}" cy="{{cy}}" rx="{{rx}}" ry="{{ry}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}{{#hasPattern}} stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" {{/hasPattern}} />
{{/connectionLineDots}}
{{/connectionLineDots.length}}
{{/hasDots}}

{{#intPolygons.length}}
{{#intPolygons}}
<polygon points="{{points}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" />
{{/intPolygons}}
{{/intPolygons.length}}

{{#classRectangles.length}}
{{#classRectangles}}
<rect x="{{x}}" y="{{y}}" width="{{width}}" height="{{height}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}stroke="{{stroke}}" {{#hasStroke}} stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" {{/hasStroke}} />
{{/classRectangles}}
{{/classRectangles.length}}

{{#classEllipses.length}}
{{#classEllipses}}
<ellipse cx="{{cx}}" cy="{{cy}}" rx="{{rx}}" ry="{{ry}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}{{#hasPattern}} stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" {{/hasPattern}} />
{{/classEllipses}}
{{/classEllipses.length}}

{{#classPolylines.length}}
{{#classPolylines}}
<polyline fill="{{fill}}" points="{{points}}" stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" />
{{/classPolylines}}
{{/classPolylines.length}}

{{#classPolygons.length}}
{{#classPolygons}}
<polygon points="{{points}}" {{#hasFill}} fill="{{fill}}" {{/hasFill}}stroke="{{stroke}}" stroke-dasharray="{{strokeDasharray}}" stroke-width="{{strokeWidth}}" />
{{/classPolygons}}
{{/classPolygons.length}}

{{#classTexts.length}}
{{#classTexts}}
<text font-family="{{font}}" font-size="{{fontSize}}" x="{{xStart}}" y="{{yStart}}" fill="{{fill}}" text-anchor="{{textAnchor}}" dominant-baseline="central" alignment-baseline="middle">
{{#tSpan.length}}
{{#tSpan}}
<tspan x="{{xSpan}}" {{#moreLines}} dy="{{dy}}" {{/moreLines}}>{{textString}}</tspan>
{{/tSpan}}
{{/tSpan.length}}
</text>
{{/classTexts}}
{{/classTexts.length}}

</svg>
`
  var htmlData = mu.render(template, svgItems).trim()
  return htmlData
}

// Add Icon layer SVG section to simplified Json (not raw)
function addIconSVG (jsonDataSet) {
  // Update Json representation: interface class with icon layer svg
  const interfaceClass = jsonDataSet.filter(dat => dat.within !== undefined && dat.within.endsWith('Interfaces'))
  const updatedInterface = interfaceClass.map(cla => interfaceItems(cla, 'icon'))
  updatedInterface.forEach(ele => {
    var interfaceIconItems = ele.svg.icon.items
    var interfaceSvgDrawing = toSVG(interfaceIconItems)
    Object.assign(ele.svg.icon,
      { 'drawing': interfaceSvgDrawing })
  })
  // ---------------------------------------------------------------------------
  // Update Json representation: other than interface classes
  const regClass = jsonDataSet.filter(dat => interfaceClass.indexOf(dat) === -1)
  const updatedRegclass = regClass.map(cla => regularClassIcon(cla, updatedInterface))
  updatedRegclass.forEach(ele => {
    var regClassIconItems = ele.svg.icon.items
    var regClassSvgDrawing = toSVG(regClassIconItems)
    Object.assign(ele.svg.icon,
      { 'drawing': regClassSvgDrawing })
  })
  // ---------------------------------------------------------------------------
}

// Create svg items for interface class
function interfaceItems (cla, layer) {
  var svg = layer === 'icon' ? interfaceSVG(cla, 'icon')
    : interfaceSVG(cla, 'diagram')
  var layerPolygons = []
  const polygon = Object.assign(
    { 'points': svg.points },
    { 'hasFill': true },
    { 'fill': svg.fillColor },
    { 'stroke': svg.lineColor },
    { 'strokeWidth': 0.25 },
    { 'strokeDasharray': '1,0' }
  )
  layerPolygons.push(polygon)
  const svgItems = Object.assign(
    { 'layerPolygons': layerPolygons },
    { 'width': svg.width },
    { 'height': svg.height },
    { 'layerTexts': svg.layerTexts }
  )
  const itemInputs = Object.assign(
    { 'items': svgItems },
    { 'initialScale': svg.initialScale },
    { 'preserveAspectRatio': svg.preserveAspectRatio }
  )
  if (layer === 'icon') {
    return Object.assign(cla,
      { 'svg': { 'icon': itemInputs } })
  } else {
    var updatedSVG = Object.assign(cla.svg,
      { 'diagram': itemInputs })
    return Object.assign(cla, { 'svg': updatedSVG })
  }
}

// Create icon layer svg items for regular class
function regularClassIcon (regClass, interfaceClasses) {
  if (regClass.icon !== undefined) {
    // In case there is no coordinate system specification in simplied json,
    // set it to default coordinate
    checkCoordinateSystem(regClass.icon)
    checkLine(regClass.icon)
    checkPolygon(regClass.icon)
    checkRectangle(regClass.icon)
    checkEllipse(regClass.icon)
    checkText(regClass.icon)
    checkBitmap(regClass.icon)
  } else {
    defaultLayer(regClass, 'icon')
    // return null
  }
  var minMaxValue = minMaxSVG(regClass, 'icon')
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
  var fromX = regClass.icon.coordinateSystem.extent[0].x - minX
  var fromY = maxY - regClass.icon.coordinateSystem.extent[0].y

  var toX = regClass.icon.coordinateSystem.extent[1].x - minX
  var toY = maxY - regClass.icon.coordinateSystem.extent[1].y
  var coordinateExtent = []
  coordinateExtent.push(Object.assign({ 'x': fromX, 'y': fromY }))
  coordinateExtent.push(Object.assign({ 'x': toX, 'y': toY }))

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

  // ----------------- Rectangle in icon layer --------------------
  if (regClass.icon.graphics !== undefined &&
      regClass.icon.graphics.rectangle !== undefined) {
    for (var i = 0; i < regClass.icon.graphics.rectangle.length; i++) {
      if (regClass.icon.graphics.rectangle[i].borderPattern !== undefined &&
          regClass.icon.graphics.rectangle[i].borderPattern === 'BorderPattern.Raised') {
        var raisedRects = raisedRectangleSVG(regClass.icon.graphics.rectangle[i], minX, maxY)
        raisedRects.forEach(ele => layerRectangles.push(ele))
      } else {
        layerRectangles.push(rectangleSVG(regClass.icon.graphics.rectangle[i], minX, maxY))
      }
    }
  }
  // --------------------------------------------------------------
  // ----------------- Polygon in icon layer ----------------------
  if (regClass.icon.graphics !== undefined &&
      regClass.icon.graphics.polygon !== undefined) {
    for (var j = 0; j < regClass.icon.graphics.polygon.length; j++) {
      layerPolygons.push(polygonSVG(regClass.icon.graphics.polygon[j], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ------------- Polygons of the interfaces icon ----------------
  var interfaces = []
  if (regClass.public !== undefined && regClass.public.inputs !== undefined) {
    interfaces = regClass.public.inputs
  }
  if (regClass.public !== undefined && regClass.public.outputs !== undefined) {
    interfaces = interfaces.concat(regClass.public.outputs)
  }
  if (interfaces.length > 0) {
    for (var k = 0; k < interfaces.length; k++) {
      // Retrieve icon.svg parsed information of the interface classes
      var tempValues = interfacePolygon(interfaces[k], interfaceClasses, minX, maxY, 'icon')
      // Retrieve interface instantiated graphical information in Dymola
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
        { 'x': xIns }, { 'y': yIns }
      )
      // Write the points to string like 'x1,y1 x2,y2 x3,y3 ...', which is
      // the format used in svg

      var instPointsStr = instantiatePointsString(instPoints)
      intPolygons.push(Object.assign(
        { 'points': instPointsStr },
        { 'hasFill': svgItems.layerPolygons[0].hasFill },
        { 'fill': svgItems.layerPolygons[0].fill },
        { 'stroke': svgItems.layerPolygons[0].stroke },
        { 'strokeDasharray': svgItems.layerPolygons[0].strokeDasharray },
        { 'strokeWidth': svgItems.layerPolygons[0].strokeWidth }
      ))
    }
  }
  // --------------------------------------------------------------
  // ----------------- Ellipse in icon layer ----------------------
  if (regClass.icon.graphics !== undefined &&
      regClass.icon.graphics.ellipse !== undefined) {
    for (var m = 0; m < regClass.icon.graphics.ellipse.length; m++) {
      layerEllipses.push(ellipseSVG(regClass.icon.graphics.ellipse[m], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ------------------ Lines in icon layer -----------------------
  if (regClass.icon.graphics !== undefined &&
      regClass.icon.graphics.line !== undefined) {
    for (var n = 0; n < regClass.icon.graphics.line.length; n++) {
      layerPolylines.push(lineSVG(regClass.icon.graphics.line[n], minX, maxY))
    }
  }
  // --------------------------------------------------------------
  // ------------------ Text in icon layer ------------------------
  if (regClass.icon.graphics !== undefined &&
      regClass.icon.graphics.text !== undefined) {
    for (var p = 0; p < regClass.icon.graphics.text.length; p++) {
      layerTexts.push(textSVG(regClass.icon.graphics.text[p], minX, maxY, 'icon'))
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
    { 'hasDots': false },
    { 'connectionLineDots': undefined },
    { 'layerTexts': (layerTexts.length === 0 ? undefined : layerTexts) },
    { 'classRectangles': (classRectangles.length === 0 ? undefined : classRectangles) },
    { 'classPolygons': (classPolygons.length === 0 ? undefined : classPolygons) },
    { 'classEllipses': (classEllipses.length === 0 ? undefined : classEllipses) },
    { 'classPolylines': (classPolylines.length === 0 ? undefined : classPolylines) },
    { 'classTexts': (classTexts.length === 0 ? undefined : classTexts) }
  )
  const icon = Object.assign(
    { 'items': items },
    { 'coordinate': coordinateExtent },
    { 'initialScale': regClass.icon.coordinateSystem.initialScale },
    { 'preserveAspectRatio': regClass.icon.coordinateSystem.preserveAspectRatio }
  )

  return Object.assign(regClass,
    { 'svg': { 'icon': icon } })
}

// In case there is no layer shown in the model, created one
// and include default coordinate system
function defaultLayer (obj, layer) {
  const defaultCoordinate = Object.assign(
    { 'extent': [
      { 'x': -100, 'y': -100 },
      { 'x': 100, 'y': 100 }
    ] },
    { 'preserveAspectRatio': true },
    { 'initialScale': 0.1 }
  )
  if (layer === 'icon') {
    return Object.assign(obj, { 'icon': { 'coordinateSystem': defaultCoordinate } })
  } else {
    return Object.assign(obj, { 'diagram': { 'coordinateSystem': defaultCoordinate } })
  }
}

// In case the coordinate system specifification is not shown, or it is not
// completed, set its specifications to default values
function checkCoordinateSystem (obj) {
  const defaultCoordinate = Object.assign(
    { 'extent': [
      { 'x': -100, 'y': -100 },
      { 'x': 100, 'y': 100 }
    ] },
    { 'preserveAspectRatio': true },
    { 'initialScale': 0.1 }
  )
  if (obj.coordinateSystem === undefined) {
    obj.coordinateSystem = defaultCoordinate
  } else {
    if (obj.coordinateSystem.extent === undefined) {
      obj.coordinateSystem.extent = [
        { 'x': -100, 'y': -100 },
        { 'x': 100, 'y': 100 }
      ]
    }
    if (obj.coordinateSystem.preserveAspectRatio === undefined) {
      obj.coordinateSystem.preserveAspectRatio = true
    }
    if (obj.coordinateSystem.initialScale === undefined) {
      obj.coordinateSystem.initialScale = 0.1
    }
  }
}

// Check line settings
function checkLine (obj) {
  if (obj.graphics !== undefined && obj.graphics.line !== undefined) {
    for (var i = 0; i < obj.graphics.line.length; i++) {
      specifyGraphicItem(obj.graphics.line[i])
      if (obj.graphics.line[i].color === undefined && obj.graphics.line[i].dynColor === undefined) {
        obj.graphics.line[i].color = { 'r': 0, 'g': 0, 'b': 0 }
      }
      if (obj.graphics.line[i].pattern === undefined) {
        obj.graphics.line[i].pattern = 'LinePattern.Solid'
      }
      if (obj.graphics.line[i].thickness === undefined) {
        obj.graphics.line[i].thickness = 0.25
      }
    }
  }
}

// Check polygon settings
function checkPolygon (obj) {
  if (obj.graphics !== undefined && obj.graphics.polygon !== undefined) {
    for (var i = 0; i < obj.graphics.polygon.length; i++) {
      specifyGraphicItem(obj.graphics.polygon[i])
      specifyFilledShape(obj.graphics.polygon[i])
    }
  }
}

// Check rectangle settings
function checkRectangle (obj) {
  if (obj.graphics !== undefined && obj.graphics.rectangle !== undefined) {
    for (var i = 0; i < obj.graphics.rectangle.length; i++) {
      specifyGraphicItem(obj.graphics.rectangle[i])
      specifyFilledShape(obj.graphics.rectangle[i])
      if (obj.graphics.rectangle[i].borderPattern === undefined) {
        obj.graphics.rectangle[i].borderPattern = 'BorderPattern.None'
      }
    }
  }
}

// Check ellipse settings
function checkEllipse (obj) {
  if (obj.graphics !== undefined && obj.graphics.ellipse !== undefined) {
    for (var i = 0; i < obj.graphics.ellipse.length; i++) {
      specifyGraphicItem(obj.graphics.ellipse[i])
      specifyFilledShape(obj.graphics.ellipse[i])
      if (obj.graphics.ellipse[i].startAngle === undefined) {
        obj.graphics.ellipse[i].startAngle = 0
      }
      if (obj.graphics.ellipse[i].endAngle === undefined) {
        obj.graphics.ellipse[i].endAngle = 360
      }
    }
  }
}

// Check text settings
function checkText (obj) {
  if (obj.graphics !== undefined && obj.graphics.text !== undefined) {
    for (var i = 0; i < obj.graphics.text.length; i++) {
      specifyGraphicItem(obj.graphics.text[i])
      specifyFilledShape(obj.graphics.text[i])
      if (obj.graphics.text[i].fontSize === undefined) {
        obj.graphics.text[i].fontSize = 0
      }
      if (obj.graphics.text[i].fontName === undefined) {
        obj.graphics.text[i].fontName = 'Arial'
      }
      if (obj.graphics.text[i].textColor === undefined) {
        obj.graphics.text[i].textColor = obj.graphics.text[i].dynLineColor ? obj.graphics.text[i].dynLineColor.color
                                                                           : obj.graphics.text[i].lineColor
      }
      if (obj.graphics.text[i].horizontalAlignment === undefined) {
        obj.graphics.text[i].horizontalAlignment = 'TextAlignment.Center'
      }
    }
  }
}

// Check Bitmap settings
function checkBitmap (obj) {
  if (obj.graphics && obj.graphics.bitmap) {
    for (var i = 0; i < obj.graphics.bitmap.length; i++) {
      specifyGraphicItem(obj.graphics.bitmap[i])
    }
  }
}

// Specify default graphic item settings
function specifyGraphicItem (obj) {
  if (obj.visible === undefined) { obj.visible = true }
  if (obj.origin === undefined) { obj.origin = { 'x': 0, 'y': 0 } }
  if (obj.rotation === undefined) { obj.rotation = 0 }
}

// Specify default filled shape settings
function specifyFilledShape (obj) {
  if (obj.lineColor === undefined && obj.dynLineColor === undefined) { obj.lineColor = { 'r': 0, 'g': 0, 'b': 0 } }
  if (obj.fillColor === undefined && obj.dynFillColor === undefined) { obj.fillColor = { 'r': 0, 'g': 0, 'b': 0 } }
  if (obj.pattern === undefined) { obj.pattern = 'LinePattern.Solid' }
  if (obj.fillPattern === undefined && obj.dynFillPattern) { obj.fillPattern = 'FillPattern.None' }
  if (obj.lineThickness === undefined) { obj.lineThickness = 0.25 }
}

// Find interfaces polygon specification for svg
function interfacePolygon (interfaceClass, interfaceClasses, minX, maxY, layerName) {
  var temp = interfaceClasses.filter(cla => cla.topClassName === interfaceClass.className)
  var objectiveClass = temp[0]
  var svgItems = (layerName === 'icon') ? objectiveClass.svg.icon.items
    : objectiveClass.svg.diagram.items
  var instantiateWidth
  var instantiateHeight
  var iconTra
  if (layerName === 'icon' && interfaceClass.placement.iconTransformation !== undefined) {
    iconTra = interfaceClass.placement.iconTransformation
  } else {
    iconTra = interfaceClass.placement.transformation
  }
  // Find out the dimension of interface icon when used in other class's icon layer
  instantiateWidth = Math.abs(iconTra.extent[1].x - iconTra.extent[0].x)
  instantiateHeight = Math.abs(iconTra.extent[1].y - iconTra.extent[0].y)
  // Original interface icon dimension when it is not being used
  var originWidth = svgItems.width
  var originHeight = svgItems.height
  // Original points string in interface icon when it is not being used
  var originPointsString = svgItems.layerPolygons[0].points

  var originPoints = pointsPair(originPointsString)
  // Find the ratio of the point (x, y) to the dimension: (x/width, y/height)
  var originPointsRatio = pointsPairRatio(originPoints, originWidth, originHeight)
  // Find points position of interface icon when instantiated, the coordinate's
  // origin is still at center
  var instPoints = instantiatePoints(originPointsRatio, instantiateWidth, instantiateHeight,
    interfaceClass, layerName)
  // Original interface icon dimensions
  var iconDim = Object.assign({ 'width': originWidth }, { 'height': originHeight })
  // Instantiated dimensions
  var insDim = Object.assign({ 'width': instantiateWidth }, { 'height': instantiateHeight })
  var topLeftX, topLeftY
  if (iconTra.origin !== undefined) {
    topLeftX = Math.min(iconTra.extent[1].x, iconTra.extent[0].x) + iconTra.origin.x - minX
    topLeftY = maxY - (Math.max(iconTra.extent[0].y, iconTra.extent[1].y) + iconTra.origin.y)
  } else {
    topLeftX = Math.min(iconTra.extent[1].x, iconTra.extent[0].x) - minX
    topLeftY = maxY - Math.max(iconTra.extent[0].y, iconTra.extent[1].y)
  }

  var insTopleft = Object.assign({ 'x': topLeftX }, { 'y': topLeftY })
  return Object.assign(
    { 'points': instPoints },
    { 'svgItems': svgItems },
    { 'iconDim': iconDim },
    { 'insDim': insDim },
    { 'insTopleft': insTopleft }
  )
}

// Extract points x, y values from the string, e.g. '0,200 200,100 0,0'
function pointsPair (pointsString) {
  var pairString = pointsString.split(' ')
  var xDim = []
  var yDim = []
  for (var i = 0; i < pairString.length; i++) {
    var temp = pairString[i].split(',')
    xDim.push(Number(temp[0]))
    yDim.push(Number(temp[1]))
  }
  return Object.assign(
    { 'x': xDim },
    { 'y': yDim }
  )
}

// Find out the ratio of each point's position (x, y) to the width and height
function pointsPairRatio (pointsValue, width, height) {
  var xRatio = []
  var yRatio = []
  for (var i = 0; i < pointsValue.x.length; i++) {
    xRatio.push(pointsValue.x[i] / width)
    yRatio.push(pointsValue.y[i] / height)
  }
  return Object.assign(
    { 'x': xRatio },
    { 'y': yRatio }
  )
}

// Find out points position (in original modelica model) after the interfaces
// being instantiated, so the returned (x, y) position is still based on the
// coordinate with the (0, 0) at center
function instantiatePoints (pointsRatio, width, height, interfaceClass, layer) {
  var x = []
  var y = []
  var minX, minY
  var transformation
  var angle, oriX, oriY, x1, x2, x3, y1, y2, y3
  if (layer === 'icon') {
    if (interfaceClass.placement.iconTransformation !== undefined) {
      transformation = interfaceClass.placement.iconTransformation
    } else {
      transformation = interfaceClass.placement.transformation
    }
    if (transformation.rotation === undefined ||
        transformation.rotation === 0) {
      if (transformation.origin !== undefined) {
        minX = Math.min(transformation.extent[0].x, transformation.extent[1].x) +
               transformation.origin.x
        minY = Math.min(transformation.extent[0].y, transformation.extent[1].y) +
               transformation.origin.y
      } else {
        minX = Math.min(transformation.extent[0].x, transformation.extent[1].x)
        minY = Math.min(transformation.extent[0].y, transformation.extent[1].y)
      }
      for (var i = 0; i < pointsRatio.x.length; i++) {
        x.push(pointsRatio.x[i] * width + minX)
        y.push(pointsRatio.y[i] * height + minY)
      }
    } else {
      // Rotate points
      angle = (transformation.rotation) * 3.1416 / 180.0
      oriX = transformation.origin.x
      oriY = transformation.origin.y
      x1 = transformation.extent[0].x
      y1 = transformation.extent[0].y
      x2 = transformation.extent[1].x
      y2 = transformation.extent[0].y +
           (transformation.extent[1].y - transformation.extent[0].y) / 2
      x3 = transformation.extent[0].x
      y3 = transformation.extent[1].y

      x.push(x1 * Math.cos(angle) - y1 * Math.sin(angle) + oriX)
      y.push(x1 * Math.sin(angle) + y1 * Math.cos(angle) + oriY)
      x.push(x2 * Math.cos(angle) - y2 * Math.sin(angle) + oriX)
      y.push(x2 * Math.sin(angle) + y2 * Math.cos(angle) + oriY)
      x.push(x3 * Math.cos(angle) - y3 * Math.sin(angle) + oriX)
      y.push(x3 * Math.sin(angle) + y3 * Math.cos(angle) + oriY)
    }
  } else {
    transformation = interfaceClass.placement.transformation
    if (transformation.rotation === undefined ||
        transformation.rotation === 0) {
      if (transformation.origin !== undefined) {
        minX = transformation.extent[0].x + transformation.origin.x
        minY = transformation.extent[0].y + transformation.origin.y
      } else {
        minX = transformation.extent[0].x
        minY = transformation.extent[0].y
      }
      for (var j = 0; j < pointsRatio.x.length; j++) {
        x.push(pointsRatio.x[j] * width + minX)
        y.push(pointsRatio.y[j] * height + minY)
      }
    } else {
      // Rotate points
      angle = (transformation.rotation) * 3.1416 / 180.0
      oriX = transformation.origin.x
      oriY = transformation.origin.y
      var startPoint = transformation.extent[0]
      var endPoint = transformation.extent[1]
      x1 = startPoint.x + (endPoint.x - startPoint.x) / 2
      y1 = startPoint.y + (endPoint.y - startPoint.y) / 4
      x2 = endPoint.x
      y2 = startPoint.y + (endPoint.y - startPoint.y) / 2
      x3 = x1
      y3 = y1 + (endPoint.y - startPoint.y) / 2

      x.push(x1 * Math.cos(angle) - y1 * Math.sin(angle) + oriX)
      y.push(x1 * Math.sin(angle) + y1 * Math.cos(angle) + oriY)
      x.push(x2 * Math.cos(angle) - y2 * Math.sin(angle) + oriX)
      y.push(x2 * Math.sin(angle) + y2 * Math.cos(angle) + oriY)
      x.push(x3 * Math.cos(angle) - y3 * Math.sin(angle) + oriX)
      y.push(x3 * Math.sin(angle) + y3 * Math.cos(angle) + oriY)
    }
  }

  return Object.assign(
    { 'x': x },
    { 'y': y }
  )
}

// Assembly points to points string
function instantiatePointsString (pointsValue) {
  var temp = []
  for (var i = 0; i < pointsValue.x.length; i++) {
    temp.push(pointsValue.x[i] + ',' + pointsValue.y[i])
  }
  return temp.join(' ')
}

// Create line svg based on line text
function lineSVG (obj, minX, maxY) {
  var fill = 'none'
  var tempPoints = (obj.dynPoints !== undefined) ? obj.dynPoints.points : obj.points
  var points = stringfyPoints(tempPoints, minX, maxY)
  var lineColor = (obj.dynColor !== undefined) ? obj.dynColor.color : obj.color
  var stroke = stringfyColor(lineColor)
  var strokeDasharray = linePattern(obj.pattern)
  var strokeWidth = Math.floor(obj.thickness * 100) / 100

  return Object.assign(
    { 'points': points },
    { 'fill': fill },
    { 'stroke': stroke },
    { 'strokeDasharray': strokeDasharray },
    { 'strokeWidth': strokeWidth }
  )
}

// Create polygon svg based on polygon text
function polygonSVG (obj, minX, maxY) {
  var points = stringfyPoints(obj.points, minX, maxY)
  var fill = null
  var hasFill = false
  if (obj.fillPattern !== 'FillPattern.None') {
    var fillColor = (obj.dynFillColor !== undefined) ? obj.dynFillColor.color : obj.fillColor
    fill = stringfyColor(fillColor)
    hasFill = true
  }
  var lineColor = (obj.dynLineColor !== undefined) ? obj.dynLineColor.color : obj.lineColor
  var stroke = stringfyColor(lineColor)
  var strokeDasharray = linePattern(obj.pattern)
  var strokeWidth = Math.floor(obj.lineThickness * 100) / 100

  return Object.assign(
    { 'points': points },
    { 'hasFill': hasFill },
    { 'fill': fill },
    { 'stroke': stroke },
    { 'strokeDasharray': strokeDasharray },
    { 'strokeWidth': strokeWidth }
  )
}

// Create rectangle svg based on rectangle text
function rectangleSVG (obj, minX, maxY) {
  var tempExtend = (obj.dynExtent !== undefined) ? obj.dynExtent.points : obj.extent
  obj.extent = tempExtend
  var x = Math.min(obj.extent[0].x, obj.extent[1].x) - minX
  var y = maxY - Math.max(obj.extent[0].y, obj.extent[1].y)
  var width = Math.abs(obj.extent[1].x - obj.extent[0].x)
  var height = Math.abs(obj.extent[1].y - obj.extent[0].y)
  var fill = null
  var hasFill = false
  if (obj.fillPattern !== 'FillPattern.None') {
    var fillColor = (obj.dynFillColor !== undefined) ? obj.dynFillColor.color : obj.fillColor
    fill = stringfyColor(fillColor)
    hasFill = true
  }
  var lineColor = (obj.dynLineColor !== undefined) ? obj.dynLineColor.color : obj.lineColor
  var stroke = stringfyColor(lineColor)
  var strokeDasharray = linePattern(obj.pattern)
  var strokeWidth = Math.floor(obj.lineThickness * 100) / 100

  return Object.assign(
    { 'x': x },
    { 'y': y },
    { 'width': width },
    { 'height': height },
    { 'hasFill': hasFill },
    { 'fill': fill },
    { 'stroke': stroke },
    { 'hasStroke': true },
    { 'strokeDasharray': strokeDasharray },
    { 'strokeWidth': strokeWidth }
  )
}

// Create rectangles SVG when the rectangle has raised border pattern
function raisedRectangleSVG (obj, minX, maxY) {
  var rects = []
  var oriRect = rectangleSVG(obj, minX, maxY)
  var x = oriRect.x
  var y = oriRect.y
  var width = oriRect.width
  var height = oriRect.height
  var mainRect = Object.assign(
    { 'x': x },
    { 'y': y },
    { 'width': width },
    { 'height': height },
    { 'hasFill': oriRect.hasFill },
    { 'fill': oriRect.fill },
    { 'stroke': oriRect.stroke },
    { 'hasStroke': true },
    { 'strokeDasharray': '1,0' },
    { 'strokeWidth': 0.25 }
  )
  rects.push(mainRect)
  // Out left boundary rectangle
  rects.push(simpleRect(x - 0.92, y - 0.92, 0.92, height + 0.92, 'rgb(172,168,153)'))
  // Out bottom boundary rectangle
  rects.push(simpleRect(x - 0.92, y + height, width + 0.92, 0.92, 'rgb(172,168,153)'))
  // Out right boundary rectangle
  rects.push(simpleRect(x + width, y, 0.92, height + 0.92, 'rgb(172,168,153)'))
  // Out top boundary rectangle
  rects.push(simpleRect(x, y - 0.92, width + 0.92, 0.92, 'rgb(172,168,153)'))
  // inner left boundary rectangle
  rects.push(simpleRect(x, y, 1.38, height, 'rgb(255,255,255)'))
  // inner top boundary rectangle
  rects.push(simpleRect(x, y, width, 1.38, 'rgb(255,255,255)'))
  // inner right boundary rectangle 1
  rects.push(simpleRect(x + width - 0.92, y, 0.92, height, 'rgb(113,111,100)'))
  // inner bottom boundary rectangle 1
  rects.push(simpleRect(x, y + height - 0.92, width, 0.92, 'rgb(113,111,100)'))
  // inner right boundary rectangle 2
  rects.push(simpleRect(x + width - 0.92 - 0.92, y + 0.92, 0.92, height - 2 * 0.92, 'rgb(172,168,153)'))
  // inner bottom boundary rectangle 2
  rects.push(simpleRect(x + 0.92, y + height - 0.92 - 0.92, width - 2 * 0.92, 0.92, 'rgb(172,168,153)'))
  return rects
}

// Items for generating simple rectangle
function simpleRect (x, y, width, height, fill) {
  return Object.assign(
    { 'x': x },
    { 'y': y },
    { 'width': width },
    { 'height': height },
    { 'hasFill': true },
    { 'fill': fill },
    { 'stroke': 'none' },
    { 'hasStroke': false },
    { 'strokeDasharray': '1,0' },
    { 'strokeWidth': 0.25 }
  )
}

// Create text svg based on the text
function textSVG (obj, minX, maxY, layer) {
  var tempExtend = (obj.dynExtent !== undefined) ? obj.dynExtent.points : obj.extent
  obj.extent = tempExtend
  var boxWidth = Math.abs(obj.extent[1].x - obj.extent[0].x)
  var boxHeight = Math.abs(obj.extent[1].y - obj.extent[0].y)
  var font = 'helvetica'
  var horizontalAlign = obj.horizontalAlignment !== undefined
    ? obj.horizontalAlignment
    : 'middle'
  var temTextStr = (obj.dynTextString !== undefined) ? obj.dynTextString.firstOpt : obj.textString
  var tempString = temTextStr.substring(1, temTextStr.length - 1)
  var textString = tempString.split('\n')
  var fontSizes = sizeOfFont(font, textString, boxHeight, boxWidth, obj, layer)
  var fontSize = Math.floor(fontSizes.fontSize * 100) / 100
  var stringLength = fontSizes.textWidth
  var xStart
  var textAnchor = 'middle'
  if (boxWidth > 0) {
    if (boxWidth > stringLength) {
      if (horizontalAlign === 'TextAlignment.Left') {
        xStart = Math.min(obj.extent[0].x, obj.extent[1].x) - minX
        textAnchor = 'start'
      } else if (horizontalAlign === 'TextAlignment.Right') {
        xStart = Math.max(obj.extent[0].x, obj.extent[1].x) - minX
        textAnchor = 'end'
      } else {
        xStart = (obj.extent[0].x + obj.extent[1].x) / 2 - minX
        textAnchor = 'middle'
      }
    } else {
      xStart = (obj.extent[0].x + obj.extent[1].x) / 2 - minX
      textAnchor = 'middle'
    }
  } else {
    xStart = obj.extent[0].x - minX - stringLength / 2
    textAnchor = 'middle'
  }
  var yStart = maxY - (Math.max(obj.extent[0].y, obj.extent[1].y) -
                       (boxHeight - fontSize * textString.length) / 2) +
                       fontSize / 2
  var fill = stringfyColor(obj.textColor)
  var xSpan = xStart
  var dy = []
  for (var i = 0; i < textString.length; i++) {
    var tempDy = i > 0 ? fontSize : 0
    dy.push(tempDy)
  }

  var moreLines = textString.length > 1
  var tSpan = []
  for (var j = 0; j < textString.length; j++) {
    var temp = Object.assign(
      { 'xSpan': xSpan },
      { 'dy': dy[j] },
      { 'textString': textString[j] }
    )
    tSpan.push(temp)
  }
  return Object.assign(
    { 'font': font },
    { 'fontSize': fontSize },
    { 'xStart': xStart },
    { 'yStart': yStart },
    { 'textAnchor': textAnchor },
    { 'fill': fill },
    { 'moreLines': moreLines },
    { 'tSpan': tSpan }
  )
}

// Create ellipse svg based on ellipse text
function ellipseSVG (obj, minX, maxY) {
  var temExtent = (obj.dynExtent !== undefined) ? obj.dynExtent.points : obj.extent
  obj.extent = temExtent
  var extentWidth = Math.abs(obj.extent[1].x - obj.extent[0].x)
  var extentHeight = Math.abs(obj.extent[1].y - obj.extent[0].y)
  var cx = (Math.max(obj.extent[0].x, obj.extent[1].x) -
            Math.min(obj.extent[0].x, obj.extent[1].x)) / 2 +
           Math.min(obj.extent[0].x, obj.extent[1].x) -
           minX
  var cy = maxY -
           ((Math.max(obj.extent[0].y, obj.extent[1].y) -
             Math.min(obj.extent[0].y, obj.extent[1].y)) / 2 +
            Math.min(obj.extent[0].y, obj.extent[1].y))
  var rx = extentWidth / 2
  var ry = extentHeight / 2
  var fill = null
  var hasFill = false
  if (obj.fillPattern !== 'FillPattern.None') {
    var fillColor = (obj.dynFillColor !== undefined) ? obj.dynFillColor.color : obj.fillColor
    fill = stringfyColor(fillColor)
    hasFill = true
  }
  var stroke = null
  var strokeDasharray = null
  var strokeWidth = null
  var hasPattern = false
  if (obj.pattern !== 'LinePattern.None') {
    hasPattern = true
    var lineColor = (obj.dynLineColor !== undefined) ? obj.dynLineColor.color : obj.lineColor
    stroke = stringfyColor(lineColor)
    strokeDasharray = linePattern(obj.pattern)
    strokeWidth = Math.floor(obj.lineThickness * 100) / 100
  }
  return Object.assign(
    { 'cx': cx },
    { 'cy': cy },
    { 'rx': rx },
    { 'ry': ry },
    { 'hasFill': hasFill },
    { 'fill': fill },
    { 'hasPattern': hasPattern },
    { 'stroke': stroke },
    { 'strokeDasharray': strokeDasharray },
    { 'strokeWidth': strokeWidth }
  )
}

// Convert points value pair to points string
function stringfyPoints (obj, minX, maxY) {
  var x = []
  var y = []
  for (var i = 0; i < obj.length; i++) {
    x.push(obj[i].x - minX)
    y.push(maxY - obj[i].y)
  }
  return instantiatePointsString(Object.assign({ 'x': x }, { 'y': y }))
}

// Convert color to color string
function stringfyColor (color) {
  var temp = 'rgb(' + color.r + ',' +
                      color.g + ',' +
                      color.b + ')'
  return temp
}

// Interpret line pattern to line dash array
function linePattern (pattern) {
  var temp
  if (pattern !== 'LinePattern.Solid') {
    if (pattern === 'LinePattern.Dash') {
      temp = '2,2'
    } else if (pattern === 'LinePattern.Dot') {
      temp = '1,2'
    } else if (pattern === 'LinePattern.DashDot') {
      temp = '2,1,1,1'
    } else if (pattern === 'LinePattern.DashDotDot') {
      temp = '2,1,1,1,1,1'
    }
  } else {
    temp = '1,0'
  }
  return temp
}

// Font aspect ratio: Width / Height,
// refer from: https://dbaron.org/css/fonts/aspect_results
function fontAspectRatio (font) {
  var ratio
  if (font === 'arial') {
    ratio = 0.46
  } else if (font === 'avant garde') {
    ratio = 0.45
  } else if (font === 'bookman') {
    ratio = 0.40
  } else if (font === 'calibri') {
    ratio = 0.47
  } else if (font === 'courier') {
    ratio = 0.39
  } else if (font === 'garamond') {
    ratio = 0.33
  } else if (font === 'helvetica') {
    ratio = 0.46
  } else if (font === 'times new roman') {
    ratio = 0.39
  }
  return ratio
}

function sizeOfFont (font, textString, boxHeight, boxWidth, obj, layer) {
  var fontSize
  var textWidth
  var ratio = 0.65
  var jointString = textString.join(' ')
  var strLen = jointString.length
  while (true) {
    fontSize = ratio * boxHeight
    if (layer === 'diagram' && obj.fontSize !== 0) {
      fontSize = obj.fontSize / 3
    }
    textWidth = (fontSize * fontAspectRatio(font)) * (strLen)
    if (layer === 'diagram' && obj.fontSize !== 0) { break }
    if (boxWidth === 0) { break }
    if (textWidth < boxWidth) {
      break
    } else {
      ratio = ratio - 0.01
    }
  }
  return Object.assign(
    { 'fontSize': fontSize },
    { 'textWidth': textWidth }
  )
}

// Information for creating interface class svg
function interfaceSVG (obj, layerName) {
  // original width and height of the svg
  var oriWidth
  var oriHeight
  var initialScale
  var preserveAspectRatio
  var pointsString
  var lineColor
  var fillColor
  var layerTexts = []
  var layer = layerName === 'icon' ? obj.icon : obj.diagram
  if (layer !== undefined && layer.coordinateSystem !== undefined) {
    oriWidth = layer.coordinateSystem.extent[1].x - layer.coordinateSystem.extent[0].x
    oriHeight = layer.coordinateSystem.extent[1].y - layer.coordinateSystem.extent[0].y
  } else {
    oriWidth = 200
    oriHeight = 200
  }
  // initial scale
  if (layer !== undefined &&
      layer.coordinateSystem !== undefined &&
      layer.coordinateSystem.initialScale !== undefined) {
    initialScale = layer.coordinateSystem.initialScale
  } else {
    if (obj.topClassName.endsWith('Input')) {
      initialScale = 0.2
    } else {
      initialScale = 0.1
    }
  }
  // preserve aspect ratio
  if (layer !== undefined &&
      layer.coordinateSystem !== undefined &&
      layer.coordinateSystem.preserveAspectRatio !== undefined) {
    preserveAspectRatio = layer.coordinateSystem.preserveAspectRatio
  } else {
    preserveAspectRatio = true
  }
  // Polygon points
  var pointsOfEach = []
  for (var i = 0; i < layer.graphics.polygon[0].points.length; i++) {
    pointsOfEach.push((layer.graphics.polygon[0].points[i].x - layer.coordinateSystem.extent[0].x) +
                      ',' +
                      (oriHeight - (layer.graphics.polygon[0].points[i].y - layer.coordinateSystem.extent[0].y)))
  }
  pointsString = pointsOfEach.join(' ')
  // Polygon lines color
  if (layer !== undefined && layer.graphics.polygon[0].lineColor !== undefined) {
    var temp1 = 'rgb(' + layer.graphics.polygon[0].lineColor.r + ',' +
                         layer.graphics.polygon[0].lineColor.g + ',' +
                         layer.graphics.polygon[0].lineColor.b + ')'
    lineColor = temp1
  } else if (layer !== undefined && layer.graphics.polygon[0].dynLineColor !== undefined) {
    var temp2 = 'rgb(' + layer.graphics.polygon[0].dynLineColor.color.r + ',' +
                         layer.graphics.polygon[0].dynLineColor.color.g + ',' +
                         layer.graphics.polygon[0].dynLineColor.color.b + ')'
    lineColor = temp2
  } else {
    lineColor = 'rgb(0,0,0)'
  }
  // Polygon fill color
  if (layer !== undefined && layer.graphics.polygon[0].fillColor !== undefined) {
    var temp3 = 'rgb(' + layer.graphics.polygon[0].fillColor.r + ',' +
                         layer.graphics.polygon[0].fillColor.g + ',' +
                         layer.graphics.polygon[0].fillColor.b + ')'
    fillColor = temp3
  } else if (layer !== undefined && layer.graphics.polygon[0].dynFillColor !== undefined) {
    var temp4 = 'rgb(' + layer.graphics.polygon[0].dynFillColor.color.r + ',' +
                         layer.graphics.polygon[0].dynFillColor.color.g + ',' +
                         layer.graphics.polygon[0].dynFillColor.color.b + ')'
    fillColor = temp4
  } else {
    fillColor = 'rgb(0,0,0)'
  }
  // add text in diagram layer, like %name
  if (layerName === 'diagram' && layer !== undefined &&
      layer.graphics.text !== undefined) {
    checkText(layer)
    layerTexts.push(textSVG(layer.graphics.text[0], Math.min(layer.coordinateSystem.extent[1].x, layer.coordinateSystem.extent[0].x),
      Math.max(layer.coordinateSystem.extent[1].y, layer.coordinateSystem.extent[0].y), layerName))
  }
  var svg = Object.assign(
    { 'width': oriWidth },
    { 'height': oriHeight },
    { 'initialScale': initialScale },
    { 'preserveAspectRatio': preserveAspectRatio },
    { 'points': pointsString },
    { 'lineColor': lineColor },
    { 'fillColor': fillColor },
    { 'layerTexts': layerTexts.length === 0 ? undefined : layerTexts }
  )
  return svg
}

/* -------- Find width and height of the svg of regular class -------- */
function minMaxSVG (obj, layerName) {
  // Find minimum 'extent from' of input interfaces, could be svg left end
  var inputsExtentFrom = []
  var inputsExtentLow = []
  var layer = layerName === 'icon' ? obj.icon : obj.diagram
  if (obj.public !== undefined && obj.public.inputs !== undefined) {
    obj.public.inputs.forEach(function (dat) {
      if (layerName === 'icon' && dat.placement.iconTransformation !== undefined) {
        inputsExtentFrom.push(Math.min(dat.placement.iconTransformation.extent[0].x,
          dat.placement.iconTransformation.extent[1].x))
        if (dat.placement.iconTransformation.rotation !== undefined) {
          inputsExtentLow.push(dat.placement.iconTransformation.origin.y -
                               Math.abs(dat.placement.iconTransformation.extent[0].x))
        }
      } else {
        inputsExtentFrom.push(Math.min(dat.placement.transformation.extent[0].x,
          dat.placement.transformation.extent[1].x))
        if (dat.placement.transformation.rotation !== undefined) {
          inputsExtentLow.push(dat.placement.transformation.origin.y -
                               Math.abs(dat.placement.transformation.extent[0].y))
        }
      }
    })
  }
  var minInputsExtentFrom = Math.min.apply(null, inputsExtentFrom)
  var minInputsExtentLow = Math.min.apply(null, inputsExtentLow)
  // Find maximum 'extent to' of output interfaces, could be svg right end
  var outputsExtentTo = []
  var outputsExtentUp = []
  if (obj.public !== undefined && obj.public.outputs !== undefined) {
    obj.public.outputs.forEach(function (dat) {
      if (layerName === 'icon' && dat.placement.iconTransformation !== undefined) {
        outputsExtentTo.push(Math.max(dat.placement.iconTransformation.extent[0].x,
          dat.placement.iconTransformation.extent[1].x))
        if (dat.placement.iconTransformation.rotation !== undefined) {
          outputsExtentUp.push(dat.placement.iconTransformation.origin.y +
                               Math.abs(dat.placement.iconTransformation.extent[0].x))
        }
      } else {
        outputsExtentTo.push(Math.max(dat.placement.transformation.extent[0].x,
          dat.placement.transformation.extent[1].x))
        if (dat.placement.transformation.rotation !== undefined) {
          outputsExtentUp.push(dat.placement.transformation.origin.y +
                               Math.abs(dat.placement.transformation.extent[0].y))
        }
      }
    })
  }
  var maxOutputsExtentTo = Math.max.apply(null, outputsExtentTo)
  var maxOutputsExtentUp = Math.max.apply(null, outputsExtentUp)
  // Find minimum 'extent from' of the text, could be svg left end
  // Find maximum 'extent to' of the text, could be svg right end
  // Find lowest 'extent from' of the text, could be svg bottom end
  // Find highest 'extent to' of the text, could be svg top end
  var textExtentFrom = []
  var textExtentTo = []
  var textExtentLow = []
  var textExtentUp = []
  if (layer !== undefined &&
      layer.graphics !== undefined &&
      layer.graphics.text !== undefined) {
    layer.graphics.text.forEach(function (dat) {
      textExtentFrom.push(Math.min(dat.extent[0].x, dat.extent[1].x))
      textExtentTo.push(Math.max(dat.extent[0].x, dat.extent[1].x))
      textExtentLow.push(Math.min(dat.extent[0].y, dat.extent[1].y))
      textExtentUp.push(Math.max(dat.extent[0].y, dat.extent[1].y))
    })
  }

  var minTextExtentFrom = Math.min.apply(null, textExtentFrom)
  var maxTextExtentTo = Math.max.apply(null, textExtentTo)
  var minTextExtentLow = Math.min.apply(null, textExtentLow)
  var maxTextExtentUp = Math.max.apply(null, textExtentUp)

  // Bottom left corner (in modelica model)
  var minX = Math.min(Math.min(layer.coordinateSystem.extent[0].x,
    layer.coordinateSystem.extent[1].x),
  Math.min(minInputsExtentFrom, minTextExtentFrom))
  var minY = Math.min(Math.min(layer.coordinateSystem.extent[0].y,
    layer.coordinateSystem.extent[1].y),
  Math.min(minTextExtentLow, minInputsExtentLow))
  // Top right corner (in modelica model)
  var maxX = Math.max(Math.max(layer.coordinateSystem.extent[0].x,
    layer.coordinateSystem.extent[1].x),
  Math.max(maxOutputsExtentTo, maxTextExtentTo))
  var maxY = Math.max(Math.max(layer.coordinateSystem.extent[0].y,
    layer.coordinateSystem.extent[1].y),
  Math.max(maxTextExtentUp, maxOutputsExtentUp))
  var minMax = Object.assign(
    { 'minX': minX },
    { 'minY': minY },
    { 'maxX': maxX },
    { 'maxY': maxY }
  )
  return minMax
}

module.exports.interfaceItems = interfaceItems
module.exports.toSVG = toSVG
module.exports.addIconSVG = addIconSVG
module.exports.defaultLayer = defaultLayer
module.exports.checkCoordinateSystem = checkCoordinateSystem
module.exports.checkLine = checkLine
module.exports.checkPolygon = checkPolygon
module.exports.checkRectangle = checkRectangle
module.exports.checkEllipse = checkEllipse
module.exports.checkText = checkText
module.exports.checkBitmap = checkBitmap
module.exports.specifyGraphicItem = specifyGraphicItem
module.exports.specifyFilledShape = specifyFilledShape
module.exports.interfacePolygon = interfacePolygon
module.exports.lineSVG = lineSVG
module.exports.polygonSVG = polygonSVG
module.exports.rectangleSVG = rectangleSVG
module.exports.textSVG = textSVG
module.exports.ellipseSVG = ellipseSVG
module.exports.fontAspectRatio = fontAspectRatio
module.exports.interfaceSVG = interfaceSVG
module.exports.minMaxSVG = minMaxSVG
module.exports.pointsPair = pointsPair
module.exports.pointsPairRatio = pointsPairRatio
module.exports.instantiatePoints = instantiatePoints
module.exports.instantiatePointsString = instantiatePointsString
module.exports.stringfyPoints = stringfyPoints
module.exports.linePattern = linePattern
