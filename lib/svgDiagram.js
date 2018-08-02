const si = require('../lib/svgIcon.js')

// Add Diagram layer SVG section to simplified Json
function addDiagramSVG (jsonDataSet) {
  // Update Json representation of interface class with diagram layer svg
  const interfaceClasses = jsonDataSet.filter(dat => dat.within.endsWith('Interfaces'))
  interfaceDiagram(interfaceClasses)

  // Update Json representation other than interface classes
  const regClass = jsonDataSet.filter(dat => interfaceClasses.indexOf(dat) === -1)
  regularClassDiagram(regClass, interfaceClasses)
}

// Create diagram svg for interfaces class
function interfaceDiagram (interfaceClasses) {
  var width = []
  var height = []
  var initialScale = []
  var preserveAspectRatio = []
  var points = []
  var lineColor = []
  var fillColor = []
  interfaceClasses.forEach(function (obj) {
    var svg = si.interfaceSVG(obj, 'diagram')
    width.push(svg.width)
    height.push(svg.height)
    initialScale.push(svg.initialScale)
    preserveAspectRatio.push(svg.preserveAspectRatio)
    points.push(svg.points)
    lineColor.push(svg.lineColor)
    fillColor.push(svg.fillColor)
  })

  for (var i = 0; i < interfaceClasses.length; i++) {
    var temp = '<svg version="1.1" ' +
                     'baseProfile="full" ' +
                     'width="' + width[i] + 'mm" ' +
                     'height="' + height[i] + 'mm" ' +
                     'viewBox="0 0 ' + width[i] + ' ' + height[i] + '"\n' +
                     'xmlns="http://www.w3.org/2000/svg">\n\n' +
                     '<polygon points="' + points[i] + '" ' +
                     'fill="' + fillColor[i] + '" ' +
                     'stroke="' + lineColor[i] + '" ' +
                     'stroke-width="0.25" />\n' +
                     '</svg>'
    const diagram = Object.assign(
      {'drawing': temp}
    )
    interfaceClasses[i].svg.diagram = diagram
  }
}

// Create diagram svg for regular class
function regularClassDiagram (regClass, interfaceClasses) {
  var drawing = []
  var initialScale = []
  var preserveAspectRatio = []
  regClass.forEach(function (obj) {
    if (obj.diagram !== undefined) {
      // In case there is no coordinate system specification in simplied json,
      // set it to default coordinate
      si.checkCoordinateSystem(obj.diagram)
      si.checkLine(obj.diagram)
      si.checkPolygon(obj.diagram)
      si.checkRectangle(obj.diagram)
      si.checkEllipse(obj.diagram)
      si.checkText(obj.diagram)
      si.checkBitmap(obj.diagram)
    } else {
      return null
    }

    var minMaxValue = si.minMaxSVG(obj, 'diagram')
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

    var temp = '<svg version="1.1" ' +
                     'baseProfile="full" ' +
                     'width="' + width + 'mm" ' +
                     'height="' + height + 'mm" ' +
                     'viewBox="0 0 ' + width + ' ' + height + '"\n' +
                     'xmlns="http://www.w3.org/2000/svg">\n\n'

    // ----------------- Rectangle in diagram layer -------------------
    if (obj.diagram.graphics !== undefined &&
        obj.diagram.graphics.rectangle !== undefined) {
      for (var i = 0; i < obj.diagram.graphics.rectangle.length; i++) {
        var tempRectangle = si.rectangleSVG(obj.diagram.graphics.rectangle[i], minX, maxY)
        temp = temp + tempRectangle + '\n'
      }
    }
    // -----------------------------------------------------------

    // ----------------- Polygon in diagram layer -------------------
    if (obj.diagram.graphics !== undefined &&
        obj.diagram.graphics.polygon !== undefined) {
      for (var j = 0; j < obj.diagram.graphics.polygon.length; j++) {
        var tempPolygon = si.polygonSVG(obj.diagram.graphics.polygon[j], minX, maxY)
        temp = temp + tempPolygon + '\n'
      }
    }
    // -----------------------------------------------------------

    // ------------- Polygons of the interfaces diagram -------------
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
        // Retrieve diagram.svg parsed information of the interface classes
        tempValues = si.interfacePolygon(interfaces[k], interfaceClasses, 'diagram')
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
        var instPointsStr = si.instantiatePointsString(instPoints)

        var updatedDrawing = originDrawing.replace(originPointsString, instPointsStr)
        var polygonBegin = updatedDrawing.indexOf('<polygon')
        var polygonEnd = updatedDrawing.indexOf('/>', polygonBegin) + 2
        var tempInterfacePolygon = updatedDrawing.substring(polygonBegin, polygonEnd)
        temp = temp + tempInterfacePolygon + '\n'
      }
    }
    // -----------------------------------------------------------

    // ----------------- Ellipse in diagram layer -------------------
    if (obj.diagram.graphics !== undefined &&
        obj.diagram.graphics.ellipse !== undefined) {
      for (var m = 0; m < obj.diagram.graphics.ellipse.length; m++) {
        var tempEllipse = si.ellipseSVG(obj.diagram.graphics.ellipse[m], minX, maxY)
        temp = temp + tempEllipse + '\n'
      }
    }
    // -----------------------------------------------------------

    // ------------------ Lines in diagram layer --------------------
    if (obj.diagram.graphics !== undefined &&
        obj.diagram.graphics.line !== undefined) {
      for (var n = 0; n < obj.diagram.graphics.line.length; n++) {
        var tempLine = si.lineSVG(obj.diagram.graphics.line[n], minX, maxY)
        temp = temp + tempLine + '\n'
      }
    }
    // -----------------------------------------------------------

    // ------------------ Text in diagram layer --------------------
    if (obj.diagram.graphics !== undefined &&
        obj.diagram.graphics.text !== undefined) {
      for (var p = 0; p < obj.diagram.graphics.text.length; p++) {
        var tempText = si.textSVG(obj.diagram.graphics.text[p], minX, maxY)
        temp = temp + tempText + '\n'
      }
    }
    // ----------------------------------------------------------

    // ----------- Connection lines in diagram layer -------------
    if (obj.connections !== undefined) {
      for (var q = 0; q < obj.connections.length; q++) {
        var connection = obj.connections[q]
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
          var lines = si.lineSVG(connection[2], minX, maxY)
          temp = temp + lines + '\n'
        }
      }
    }
    // -----------------------------------------------------------

    drawing.push(temp + '</svg>')
    preserveAspectRatio.push(obj.diagram.coordinateSystem.preserveAspectRatio)
    initialScale.push(obj.diagram.coordinateSystem.initialScale)
  })

  for (var i = 0; i < regClass.length; i++) {
    if (regClass[i].diagram !== undefined) {
      const diagram = Object.assign(
        {'drawing': drawing[i]}
      )
      regClass[i].svg.diagram = diagram
    }
  }
}

module.exports.addDiagramSVG = addDiagramSVG
