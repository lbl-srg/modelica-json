const util = require('util')

function parse (content, rawJson = false) {
  // "keys" will be a one element array, could be 
  // ['Line', 'Text', 'Rectangle', 'Polygon', 'Ellipse', 'Bitmap', 'Placement', 'coordinateSystem', 'graphics']
  var graKeys = Object.keys(content)
  var graKey = graKeys[0]

  var moOutput = ''
  if (graKey === 'Line') {
    moOutput += lineParse(content.Line)
  } else if (graKey === 'Text') {
    moOutput += textParse(content.Text)
  } else if (graKey === 'Rectangle') {
    moOutput += rectangleParse(content.Rectangle)
  } else if (graKey === 'Polygon') {
    moOutput += polygonParse(content.Polygon)
  } else if (graKey === 'Ellipse') {
    moOutput += ellipseParse(content.Ellipse)
  } else if (graKey === 'Bitmap') {
    moOutput += bitmapParse(content.Bitmap)
  } else if (graKey === 'Placement') {
    moOutput += placementParse(content.Placement)
  } else if (graKey === 'coordinateSystem') {
    moOutput += coordinateSystemParse(content.coordinateSystem)
  } else {
    moOutput += graphicsParse(content.graphics)
  }

  return moOutput
}

function lineParse (obj) {
  var points = obj.points
  var color = obj.color
  var pattern = obj.pattern
  var thickness = obj.thickness
  var arrowSize = obj.arrowSize
  var smooth = obj.smooth
  var visible = obj.visible
  var strArr = []
  if (points != null) {
    strArr.push('points=' + pointsParse(points))
  }
  if (color != null) {
    strArr.push('color=' + colorParse(color))
  }
  if (pattern != null) {
    strArr.push('pattern=' + util.format("%s", pattern))
  }
  if (thickness != null) {
    strArr.push('thickness=' + util.format("%s", thickness))
  }
  if (arrowSize != null) {
    strArr.push('arrowSize=' + util.format("%s", arrowSize))
  }
  if (smooth != null) {
    strArr.push('smooth=' + util.format("%s", smooth))
  }
  if (visible != null) {
    strArr.push('visible=' + util.format("%s", visible))
  }
  return 'Line(' + strArr.join(', ') + ')'
}

function textParse (obj) {
  var extent = obj.extent
  var textString = obj.textString
  var fontSize = obj.fontSize
  var fontName = obj.fontName
  var textColor = obj.textColor
  var horizontalAlignment = obj.horizontalAlignment
  var string = obj.string
  var index = obj.index
  var visible = obj.visible
  var origin = obj.origin
  var rotation = obj.rotation
  var lineColor = obj.lineColor
  var fillColor = obj.fillColor
  var pattern = obj.pattern
  var fillPattern = obj.fillPattern
  var lineThickness = obj.lineThickness
  var strArr = []
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (textString != null) {
    strArr.push('textString=' + util.format("%s", textString))
  }
  if (fontSize != null) {
    strArr.push('fontSize=' + util.format("%s", fontSize))
  }
  if (fontName != null) {
    strArr.push('fontName=' + util.format("%s", fontName))
  }
  if (fontSize != null) {
    strArr.push('fontSize=' + util.format("%s", fontSize))
  }
  if (textColor != null) {
    strArr.push('textColor=' + colorParse(extent))
  }
  if (horizontalAlignment != null) {
    strArr.push('horizontalAlignment=' + util.format("%s", horizontalAlignment))
  }
  if (string != null) {
    strArr.push('string=' + util.format("%s", string))
  }
  if (index != null) {
    strArr.push('index=' + util.format("%s", index))
  }
  var graComIte = commonGraphicItems(visible, origin, rotation, lineColor, fillColor, pattern, fillPattern, lineThickness)
  var fullArr = strArr.concat(graComIte)
  return 'Text(' + fullArr.join(', ') + ')'
}

function rectangleParse (obj) {
  var extent = obj.extent
  var radius = obj.radius
  var borderPattern = obj.borderPattern
  var visible = obj.visible
  var origin = obj.origin
  var rotation = obj.rotation
  var lineColor = obj.lineColor
  var fillColor = obj.fillColor
  var pattern = obj.pattern
  var fillPattern = obj.fillPattern
  var lineThickness = obj.lineThickness
  var strArr = []
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (radius != null) {
    strArr.push('radius=' + util.format("%s", radius))
  }
  if (fontSize != null) {
    strArr.push('borderPattern=' + util.format("%s", borderPattern))
  }
  var graComIte = commonGraphicItems(visible, origin, rotation, lineColor, fillColor, pattern, fillPattern, lineThickness)
  var fullArr = strArr.concat(graComIte)
  return 'Rectangle(' + fullArr.join(', ') + ')'
}


function polygonParse (obj) {
  var points = obj.points
  var smooth = obj.smooth
  var visible = obj.visible
  var origin = obj.origin
  var rotation = obj.rotation
  var lineColor = obj.lineColor
  var fillColor = obj.fillColor
  var pattern = obj.pattern
  var fillPattern = obj.fillPattern
  var lineThickness = obj.lineThickness
  var strArr = []
  if (points != null) {
    strArr.push('points=' + pointsParse(points))
  }
  if (smooth != null) {
    strArr.push('smooth=' + util.format("%s", smooth))
  }
  var graComIte = commonGraphicItems(visible, origin, rotation, lineColor, fillColor, pattern, fillPattern, lineThickness)
  var fullArr = strArr.concat(graComIte)
  return 'Polygon(' + fullArr.join(', ') + ')'
}


function ellipseParse (obj) {
  
}


function bitmapParse (obj) {
  
}


function placementParse (obj) {
  
}


function coordinateSystemParse (obj) {
  
}


function graphicsParse (obj) {
  
}



function pointsParse (obj) {
  var pointsArr = []
  for (var i = 0; i < obj.length; i++) {
    var ithPoint = obj[i]
    var pointStr = '{'
    pointStr += util.format("%s", ithPoint.x)
    pointStr += ','
    pointStr += util.format("%s", ithPoint.y)
    pointStr += '}'
    pointsArr.push(pointStr)
  }
  return '{' + pointsArr.join(',') + '}'
}

function colorParse (obj) {
  var colEle = '{'
  colEle += util.format("%s", obj.r)
  colEle += ','
  colEle += util.format("%s", obj.g)
  colEle += ','
  colEle += util.format("%s", obj.b)
  colEle += '}'
  return colEle
}

function originParse (obj) {
  var ori = '{'
  ori += util.format("%s", obj.x)
  ori += ','
  ori += util.format("%s", obj.y)
  ori += '}'
  return ori
}

function commonGraphicItems (visible, origin, rotation, lineColor, fillColor, pattern, fillPattern, lineThickness) {
  var strArr = []
  if (visible != null) {
    strArr.push('visible=' + util.format("%s", visible))
  }
  if (origin != null) {
    strArr.push('origin=' + originParse(extent))
  }
  if (rotation != null) {
    strArr.push('rotation=' + util.format("%s", rotation))
  }
  if (lineColor != null) {
    strArr.push('lineColor=' + colorParse(lineColor))
  }
  if (fillColor != null) {
    strArr.push('fillColor=' + colorParse(fillColor))
  }
  if (pattern != null) {
    strArr.push('pattern=' + util.format("%s", pattern))
  }
  if (fillPattern != null) {
    strArr.push('fillPattern=' + util.format("%s", fillPattern))
  }
  if (lineThickness != null) {
    strArr.push('lineThickness=' + util.format("%s", lineThickness))
  }
  return strArr
}


module.exports = {parse}
