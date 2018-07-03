
// Add Icon layer SVG section to simplified Json
function addIconSVG (jsonDataSet) {
  var iconSVG = []
  // Update Json representation of interface class with icon layer svg
  const interfaceClasses = jsonDataSet.filter(dat => dat.within.endsWith('Interfaces'))
  interfaceIcon(interfaceClasses)

  // Update Json representation other than interface classes
  const regClass = jsonDataSet.filter(dat => interfaceClasses.indexOf(dat) === -1)
  regularClassIcon(regClass, interfaceClasses)

  // return interfaceClasses
}

// Add Diagram layer SVG section to simplified Json
function addDiagramSVG (jsonDataSet) {
  var diagramSVG

  return diagramSVG
}

// Create icon svg for interfaces class
function interfaceIcon (interfaceClasses) {
  var width = []
  var height = []
  var initialScale = []
  var preserveAspectRatio = []
  var points = []
  var lineColor = []
  var fillColor = []
  interfaceClasses.forEach(function (obj) {
    // original width and height of the svg
    var oriWidth
    var oriHeight
    if (obj.icon !== undefined && obj.icon.coordinateSystem !== undefined) {
      oriWidth = obj.icon.coordinateSystem.extent[1].x1 - obj.icon.coordinateSystem.extent[0].x1
      oriHeight = obj.icon.coordinateSystem.extent[1].x2 - obj.icon.coordinateSystem.extent[0].x2
    } else {
      oriWidth = 200
      oriHeight = 200
    }
    width.push(oriWidth)
    height.push(oriHeight)
    // initial scale
    if (obj.icon !== undefined &&
        obj.icon.coordinateSystem !== undefined &&
        obj.icon.coordinateSystem.initialScale !== undefined) {
      initialScale.push(obj.icon.coordinateSystem.initialScale)
    } else {
      initialScale.push(0.1)
    }
    // preserve aspect ratio
    if (obj.icon !== undefined &&
        obj.icon.coordinateSystem !== undefined &&
        obj.icon.coordinateSystem.preserveAspectRatio !== undefined) {
      preserveAspectRatio.push(obj.icon.coordinateSystem.preserveAspectRatio)
    } else {
      preserveAspectRatio.push(true)
    }
    // Polygon points
    var pointsOfEach = []
    for (var i = 0; i < obj.icon.graphics.polygon[0].points.length; i++) {
      pointsOfEach.push((obj.icon.graphics.polygon[0].points[i].x1 - obj.icon.coordinateSystem.extent[0].x1) +
                        ',' +
                        (oriHeight - (obj.icon.graphics.polygon[0].points[i].x2 - obj.icon.coordinateSystem.extent[0].x2)))
    }
    points.push(pointsOfEach.join(' '))
    // Polygon lines color
    if (obj.icon !== undefined && obj.icon.graphics.polygon[0].lineColor !== undefined) {
      var temp1 = 'rgb(' + obj.icon.graphics.polygon[0].lineColor.r + ',' +
                           obj.icon.graphics.polygon[0].lineColor.g + ',' +
                           obj.icon.graphics.polygon[0].lineColor.b + ')'
      lineColor.push(temp1)
    } else {
      lineColor.push('rgb(0,0,0)')
    }
    // Polygon fill color
    if (obj.icon !== undefined && obj.icon.graphics.polygon[0].fillColor !== undefined) {
      var temp2 = 'rgb(' + obj.icon.graphics.polygon[0].fillColor.r + ',' +
                           obj.icon.graphics.polygon[0].fillColor.g + ',' +
                           obj.icon.graphics.polygon[0].fillColor.b + ')'
      fillColor.push(temp2)
    } else {
      fillColor.push('rgb(0,0,0)')
    }
  })

  for (var i = 0; i < interfaceClasses.length; i++) {
    var temp = '<svg version="1.1" ' +
                     'baseProfile="full" ' +
                     'width="' + width[i] + '" ' +
                     'height="' + height[i] + '"\n' +
                     'xmlns="http://www.w3.org/2000/svg">\n\n' +
                     '<polygon points="' + points[i] + '" ' +
                     'fill="' + fillColor[i] + '" ' +
                     'stroke="' + lineColor[i] + '" />\n' +
                     '</svg>'
    const icon = Object.assign(
      {'drawing': temp},
      {'initialScale': initialScale[i]},
      {'preserveAspectRatio': preserveAspectRatio[i]}
    )
    Object.assign(interfaceClasses[i],
      {'svg': {
        'icon': icon
      }
      })
  }
}

function regularClassIcon (regClass, interfaceClasses) {
  var drawing = []
  var initialScale = []
  var preserveAspectRatio = []
  regClass.forEach(function (obj) {
    // In case there is no coordinate system specification in simplied json,
    // set it to default coordinate
    checkCoordinateSystem(obj)
    if (obj.icon !== undefined) {
      checkLine(obj.icon)
      checkPolygon(obj.icon)
      checkRectangle(obj.icon)
      checkEllipse(obj.icon)
      checkText(obj.icon)
      checkBitmap(obj.icon)
    }

    /* ------------ Find width and height of the svg ------------ */
    // Find minimum 'extent from' of input interfaces, could be svg left end
    var inputsExtentFrom = []
    if (obj.public !== undefined && obj.public.inputs !== undefined) {
      obj.public.inputs.forEach(function (dat) {
        if (dat.placement.iconTransformation !== undefined) {
          inputsExtentFrom.push(Math.min(dat.placement.iconTransformation.extent[0].x1,
                                         dat.placement.iconTransformation.extent[1].x1))
        } else {
          inputsExtentFrom.push(Math.min(dat.placement.transformation.extent[0].x1,
                                         dat.placement.transformation.extent[1].x1))
        }
      })
    }
    var minInputsExtentFrom = Math.min.apply(null, inputsExtentFrom)
    // Find maximum 'extent to' of output interfaces, could be svg right end
    var outputsExtentTo = []
    if (obj.public !== undefined && obj.public.outputs !== undefined) {
      obj.public.outputs.forEach(function (dat) {
        if (dat.placement.iconTransformation !== undefined) {
          outputsExtentTo.push(Math.max(dat.placement.iconTransformation.extent[0].x1,
                                        dat.placement.iconTransformation.extent[1].x1))
        } else {
          outputsExtentTo.push(Math.max(dat.placement.transformation.extent[0].x1,
                                        dat.placement.transformation.extent[1].x1))
        }
      })
    }
    var maxOutputsExtentTo = Math.max.apply(null, outputsExtentTo)
    // Find minimum 'extent from' of the text, could be svg left end
    // Find maximum 'extent to' of the text, could be svg right end
    // Find lowest 'extent from' of the text, could be svg bottom end
    // Find highest 'extent to' of the text, could be svg top end
    var textExtentFrom = []
    var textExtentTo = []
    var textExtentLow = []
    var textExtentUp = []
    if (obj.icon !== undefined &&
        obj.icon.graphics !== undefined &&
        obj.icon.graphics.text !== undefined) {
      obj.icon.graphics.text.forEach(function (dat) {
        textExtentFrom.push(Math.min(dat.extent[0].x1, dat.extent[1].x1))
        textExtentTo.push(Math.max(dat.extent[0].x1, dat.extent[1].x1))
        textExtentLow.push(Math.min(dat.extent[0].x2, dat.extent[1].x2))
        textExtentUp.push(Math.max(dat.extent[0].x2, dat.extent[1].x2))
      })
    }
    var minTextExtentFrom = Math.min.apply(null, textExtentFrom)
    var maxTextExtentTo = Math.max.apply(null, textExtentTo)
    var minTextExtentLow = Math.min.apply(null, textExtentLow)
    var maxTextExtentUp = Math.max.apply(null, textExtentUp)

    // Bottom left corner (in modelica model)
    var minX = Math.min(Math.min(obj.icon.coordinateSystem.extent[0].x1,
                                 obj.icon.coordinateSystem.extent[1].x1),
                        Math.min(minInputsExtentFrom, minTextExtentFrom))
    var minY = Math.min(Math.min(obj.icon.coordinateSystem.extent[0].x2,
                                 obj.icon.coordinateSystem.extent[1].x2),
                        minTextExtentLow)
    // Top right corner (in modelica model)
    var maxX = Math.max(Math.max(obj.icon.coordinateSystem.extent[0].x1,
                                 obj.icon.coordinateSystem.extent[1].x1),
                        Math.max(maxOutputsExtentTo, maxTextExtentTo))
    var maxY = Math.max(Math.max(obj.icon.coordinateSystem.extent[0].x2,
                                 obj.icon.coordinateSystem.extent[1].x2),
                        maxTextExtentUp)
    // Width and height of the svg
    var width = maxX - minX
    var height = maxY - minY
    // in SVG, the Y axis is start from top to bottom, so
    // the origin point should be (minX, maxY), to the righ bottom (maxX, minY)
    /* ---------------------------------------------------------- */

    var temp = '<svg version="1.1" ' +
                     'baseProfile="full" ' +
                     'width="' + width + 'mm" ' +
                     'height="' + height + 'mm" ' +
                     'viewBox="0 0 ' + width + ' ' + height + '"\n' +
                     'xmlns="http://www.w3.org/2000/svg">\n\n'

    // ----------------- Rectangle in icon layer -------------------
    if (obj.icon !== undefined &&
        obj.icon.graphics !== undefined &&
        obj.icon.graphics.rectangle !== undefined) {
      for (var i = 0; i < obj.icon.graphics.rectangle.length; i++) {
        var tempRectangle = rectangleSVG(obj.icon.graphics.rectangle[i], minX, maxY)
        temp = temp + tempRectangle + '\n'
      }
    }
    // -----------------------------------------------------------

    // ----------------- Polygon in icon layer -------------------
    if (obj.icon !== undefined &&
        obj.icon.graphics !== undefined &&
        obj.icon.graphics.polygon !== undefined) {
      for (var j = 0; j < obj.icon.graphics.polygon.length; j++) {
        var tempPolygon = polygonSVG(obj.icon.graphics.polygon[j], minX, maxY)
        temp = temp + tempPolygon + '\n'
      }
    }
    // -----------------------------------------------------------

    // ------------- Polygons of the interfaces icon -------------
    var interfaces = []
    if (obj.public !== undefined && obj.public.inputs !== undefined) {
      interfaces = obj.public.inputs
    }
    if (obj.public !== undefined && obj.public.outputs !== undefined) {
      interfaces = interfaces.concat(obj.public.outputs)
    }
    if (interfaces.length > 0) {
      for (var k = 0; k < interfaces.length; k++) {
        var tempValues
        // Retrieve icon.svg parsed information of the interface classes
        tempValues = interfacePolygon(interfaces[k], interfaceClasses)
        var originDrawing = tempValues.originClass
        var originPoints = tempValues.points
        var originPointsString = tempValues.originPointsString
        var xIns = []
        var yIns = []
        for (var l = 0; l < originPoints.x.length; l++) {
          xIns.push(originPoints.x[l] - minX)
          yIns.push(maxY - originPoints.y[l])
        }
        var instPoints = Object.assign(
          {'x': xIns}, {'y': yIns}
        )
        // write the points to string like 'x1,y1 x2,y2 x3,y3 ...', which is
        // the format used in svg
        var instPointsStr = instantiatePointsString(instPoints)

        var updatedDrawing = originDrawing.replace(originPointsString, instPointsStr)
        var polygonBegin = updatedDrawing.indexOf('<polygon')
        var polygonEnd = updatedDrawing.indexOf('/>', polygonBegin) + 2
        var tempInterfacePolygon = updatedDrawing.substring(polygonBegin, polygonEnd)
        temp = temp + tempInterfacePolygon + '\n'
      }
    }
    // -----------------------------------------------------------

    // ----------------- Ellipse in icon layer -------------------
    if (obj.icon !== undefined &&
        obj.icon.graphics !== undefined &&
        obj.icon.graphics.ellipse !== undefined) {
      for (var m = 0; m < obj.icon.graphics.ellipse.length; m++) {
        var tempEllipse = ellipseSVG(obj.icon.graphics.ellipse[m], minX, maxY)
        temp = temp + tempEllipse + '\n'
      }
    }
    // -----------------------------------------------------------

    // ------------------ Lines in icon layer --------------------
    if (obj.icon !== undefined &&
        obj.icon.graphics !== undefined &&
        obj.icon.graphics.line !== undefined) {
      for (var n = 0; n < obj.icon.graphics.line.length; n++) {
        var tempLine = lineSVG(obj.icon.graphics.line[n], minX, maxY)
        temp = temp + tempLine + '\n'
      }
    }
    // -----------------------------------------------------------

    // ------------------ Text in icon layer --------------------
    if (obj.icon !== undefined &&
        obj.icon.graphics !== undefined &&
        obj.icon.graphics.text !== undefined) {
      for (var p = 0; p < obj.icon.graphics.text.length; p++) {
        var tempText = textSVG(obj.icon.graphics.text[p], minX, maxY)
        temp = temp + tempText + '\n'
      }
    }
    // ----------------------------------------------------------

    drawing.push(temp + '</svg>')
    preserveAspectRatio.push(obj.icon.coordinateSystem.preserveAspectRatio)
    initialScale.push(obj.icon.coordinateSystem.initialScale)
  })

  for (var i = 0; i < regClass.length; i++) {
    const icon = Object.assign(
      {'drawing': drawing[i]},
      {'initialScale': initialScale[i]},
      {'preserveAspectRatio': preserveAspectRatio[i]}
    )
    Object.assign(regClass[i],
      {'svg': {
        'icon': icon
      }
      })
  }
}

// In case the coordinate system specifification is not shown, or it is not
// completed, set its specifications to default values
function checkCoordinateSystem (obj) {
  const defaultCoordinate = Object.assign(
    {'extent': [
      { 'x1': -100, 'x2': -100 },
      { 'x1': 100, 'x2': 100 }
    ]},
    {'preserveAspectedRatio': true},
    {'initialScale': 0.1}
  )
  if (obj.icon.coordinateSystem === undefined) {
    obj.icon.coordinateSystem = defaultCoordinate
  } else {
    if (obj.icon.coordinateSystem.extent === undefined) {
      obj.icon.coordinateSystem.extent = [
        { 'x1': -100, 'x2': -100 },
        { 'x1': 100, 'x2': 100 }
      ]
    }
    if (obj.icon.coordinateSystem.preserveAspectRatio === undefined) {
      obj.icon.coordinateSystem.preserveAspectRatio = true
    }
    if (obj.icon.coordinateSystem.initialScale === undefined) {
      obj.icon.coordinateSystem.initialScale = 0.1
    }
  }
}

// Check line settings
function checkLine (obj) {
  if (obj.graphics !== undefined && obj.graphics.line !== undefined) {
    for (var i = 0; i < obj.graphics.line.length; i++) {
      specifyGraphicItem(obj.graphics.line[i])
      if (obj.graphics.line[i].color === undefined) {
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
        obj.graphics.text[i].textColor = obj.graphics.text[i].lineColor
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
  if (obj.origin === undefined) { obj.origin = { 'x1': 0, 'x2': 0 } }
  if (obj.rotation === undefined) { obj.rotation = 0 }
}

// Specify default filled shape settings
function specifyFilledShape (obj) {
  if (obj.lineColor === undefined) { obj.lineColor = { 'r': 0, 'g': 0, 'b': 0 } }
  if (obj.fillColor === undefined) { obj.fillColor = { 'r': 0, 'g': 0, 'b': 0 } }
  if (obj.pattern === undefined) { obj.pattern = 'LinePattern.Solid' }
  if (obj.fillPattern === undefined) { obj.fillPattern = 'FillPattern.None' }
  if (obj.lineThickness === undefined) { obj.lineThickness = 0.25 }
}

// Find interfaces polygon specification for svg
function interfacePolygon (interfaceClass, interfaceClasses) {
  var temp = interfaceClasses.filter(cla => cla.topClassName === interfaceClass.className)
  var objectiveClass = temp[0]
  var svg = objectiveClass.svg.icon  // svg section in interface json
  var instantiateWidth
  var instantiateHeight
  var iconTra
  if (interfaceClass.placement.iconTransformation !== undefined) {
    iconTra = interfaceClass.placement.iconTransformation
  } else {
    iconTra = interfaceClass.placement.transformation
  }
  instantiateWidth = iconTra.extent[1].x1 - iconTra.extent[0].x1
  instantiateHeight = iconTra.extent[1].x2 - iconTra.extent[0].x2

  const drawing = svg.drawing
  var originWidth = Number(findNumberString(drawing, 'width='))
  var originHeight = Number(findNumberString(drawing, 'height='))
  var originPointsString = findNumberString(drawing, 'points=')
  var originPoints = pointsPair(originPointsString)
  var originPointsRatio = pointsPairRatio(originPoints, originWidth, originHeight)

  var instPoints = instantiatePoints(originPointsRatio, instantiateWidth, instantiateHeight, iconTra)

  var interfaceInstance = Object.assign(
    {'points': instPoints},
    {'originClass': drawing},
    {'originPointsString': originPointsString}
  )
  return interfaceInstance
}

// Extract number from string
function findNumberString (string, key) {
  var beginIndex = string.indexOf('"', string.indexOf(key)) + 1
  var endIndex = string.indexOf('"', beginIndex)
  return string.substring(beginIndex, endIndex)
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
    {'x': xDim},
    {'y': yDim}
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
    {'x': xRatio},
    {'y': yRatio}
  )
}

// Find out points position after the interfaces being instantiated
function instantiatePoints (pointsRatio, width, height, transformation) {
  var x = []
  var y = []
  for (var i = 0; i < pointsRatio.x.length; i++) {
    x.push(pointsRatio.x[i] * width + transformation.extent[0].x1)
    y.push(pointsRatio.y[i] * height + transformation.extent[0].x2)
  }
  return Object.assign(
    {'x': x},
    {'y': y}
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
  var temp = []
  temp.push('<polyline fill="none"')
  temp.push('points="' + stringfyPoints(obj.points, minX, maxY) + '"')
  temp.push('stroke="' + stringfyColor(obj.color) + '"')
  temp.push('stroke-dasharray="' + linePattern(obj.pattern) + '"')
  temp.push('stroke-width="' + obj.thickness + '"')
  temp.push('/>')
  return temp.join(' ')
}

// Create polygon svg based on polygon text
function polygonSVG (obj, minX, maxY) {
  var temp = []
  temp.push('<polygon')
  temp.push('points="' + stringfyPoints(obj.points, minX, maxY) + '"')
  if (obj.fillPattern !== 'FillPattern.None') {
    temp.push('fill="' + stringfyColor(obj.fillColor) + '"')
  }
  temp.push('stroke="' + stringfyColor(obj.lineColor) + '"')
  temp.push('stroke-dasharray="' + linePattern(obj.pattern) + '"')
  temp.push('stroke-width="' + obj.lineThickness + '"')
  temp.push('/>')
  return temp.join(' ')
}

// Create rectangle svg based on rectangle text
function rectangleSVG (obj, minX, maxY) {
  var temp = []
  temp.push('<rect')
  temp.push('x="' + (Math.min(obj.extent[0].x1, obj.extent[1].x1) - minX) + '"')
  temp.push('y="' + (maxY - Math.max(obj.extent[0].x2, obj.extent[1].x2)) + '"')
  var width = Math.abs(obj.extent[1].x1 - obj.extent[0].x1)
  var height = Math.abs(obj.extent[1].x2 - obj.extent[0].x2)
  temp.push('width="' + width + '"')
  temp.push('height="' + height + '"')
  if (obj.fillPattern !== 'FillPattern.None') {
    temp.push('fill="' + stringfyColor(obj.fillColor) + '"')
  }
  temp.push('stroke="' + stringfyColor(obj.lineColor) + '"')
  temp.push('stroke-dasharray="' + linePattern(obj.pattern) + '"')
  temp.push('stroke-width="' + obj.lineThickness + '"')
  temp.push('/>')
  return temp.join(' ')
}

// Create text svg based on the text
function textSVG (obj, minX, maxY) {
  var temp = []
  var boxWidth = Math.abs(obj.extent[1].x1 - obj.extent[0].x1)
  var boxHeight = Math.abs(obj.extent[1].x2 - obj.extent[0].x2)
  var font = 'helvetica'
  var fontSize = 0.5 * boxHeight
  var textString = obj.textString.substring(1, obj.textString.length - 1)
  var stringLength = (fontSize * fontAspectRatio(font)) * (textString.length)
  temp.push('<text')
  temp.push('font-family="' + font + '"')
  temp.push('font-size="' + fontSize + '"')
  temp.push('x="' +
            (Math.min(obj.extent[0].x1, obj.extent[1].x1) - minX + (boxWidth - stringLength) / 2) +
            '"')
  temp.push('y="' + (maxY - Math.min(obj.extent[0].x2, obj.extent[1].x2)) + '"')
  temp.push('fill="' + stringfyColor(obj.textColor) + '"')
  temp.push('dominant-baseline="central"')
  temp.push('text-anchor="middle">')
  temp.push(textString)
  temp.push('</text>')
  return temp.join(' ')
}

// Create ellipse svg based on ellipse text
function ellipseSVG (obj, minX, maxY) {
  var temp = []
  var extentWidth = Math.abs(obj.extent[1].x1 - obj.extent[0].x1)
  var extentHeight = Math.abs(obj.extent[1].x2 - obj.extent[0].x2)
  var cx = (Math.max(obj.extent[0].x1, obj.extent[1].x1) -
            Math.min(obj.extent[0].x1, obj.extent[1].x1)) / 2 +
           Math.min(obj.extent[0].x1, obj.extent[1].x1) -
           minX
  var cy = maxY -
           ((Math.max(obj.extent[0].x2, obj.extent[1].x2) -
            Math.min(obj.extent[0].x2, obj.extent[1].x2)) / 2 +
           Math.min(obj.extent[0].x2, obj.extent[1].x2))
  temp.push('<ellipse')
  temp.push('cx="' + cx + '"')
  temp.push('cy="' + cy + '"')
  temp.push('rx="' + (extentWidth / 2) + '"')
  temp.push('ry="' + (extentHeight / 2) + '"')
  if (obj.fillPattern !== 'FillPattern.None') {
    temp.push('fill="' + stringfyColor(obj.fillColor) + '"')
  }
  if (obj.pattern !== 'LinePattern.None') {
    temp.push('stroke="' + stringfyColor(obj.lineColor) + '"')
    temp.push('stroke-dasharray="' + linePattern(obj.pattern) + '"')
    temp.push('stroke-width="' + obj.lineThickness + '"')
  }
  temp.push('/>')
  return temp.join(' ')
}

// Convert points value pair to points string
function stringfyPoints (obj, minX, maxY) {
  var x = []
  var y = []
  for (var i = 0; i < obj.length; i++) {
    x.push(obj[i].x1 - minX)
    y.push(maxY - obj[i].x2)
  }
  var points = Object.assign({'x': x}, {'y': y})
  return instantiatePointsString(points)
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
// refer from: https://www.lifewire.com/aspect-ratio-table-common-fonts-3467385
function fontAspectRatio (font) {
  var ratio
  if (font === 'arial') {
    ratio = 0.52
  } else if (font === 'avant garde') {
    ratio = 0.45
  } else if (font === 'bookman') {
    ratio = 0.40
  } else if (font === 'calibri') {
    ratio = 0.47
  } else if (font === 'courier') {
    ratio = 0.43
  } else if (font === 'garamond') {
    ratio = 0.38
  } else if (font === 'helvetica') {
    ratio = 0.52
  } else if (font === 'times new roman') {
    ratio = 0.45
  }
  return ratio
}

module.exports.addIconSVG = addIconSVG
module.exports.addDiagramSVG = addDiagramSVG
