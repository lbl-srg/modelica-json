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
  var graComIte = commonGraphicItems(obj)
  return 'Line(' + graComIte.join(',') + ')'
}

function textParse (obj) {
  var graComIte = commonGraphicItems(obj)
  return 'Text(' + graComIte.join(',') + ')'
}

function rectangleParse (obj) {
  var graComIte = commonGraphicItems(obj)
  return 'Rectangle(' + graComIte.join(',') + ')'
}

function polygonParse (obj) {
  var graComIte = commonGraphicItems(obj)
  return 'Polygon(' + graComIte.join(',') + ')'
}

function ellipseParse (obj) {
  var graComIte = commonGraphicItems(obj)
  return 'Ellipse(' + graComIte.join(',') + ')'
}

function bitmapParse (obj) {
  var graComIte = commonGraphicItems(obj)
  return 'Bitmap(' + graComIte.join(',') + ')'
}

function placementParse (obj) {
  var visible = obj.visible
  var iconVisible = obj.iconVisible
  var transformation = obj.transformation
  var iconTransformation = obj.iconTransformation
  var strArr = []
  if (visible != null) {
    strArr.push('visible=' + util.format("%s", visible))
  }
  if (iconVisible != null) {
    strArr.push('iconVisible=' + util.format("%s", iconVisible))
  }
  if (transformation != null) {
    strArr.push('transformation' + transformationParse(transformation) + ')')
  }
  if (iconTransformation != null) {
    strArr.push('iconTransformation' + transformationParse(iconTransformation) + ')')
  }
  return 'Placement(' + strArr.join(',') + ')'
}

function coordinateSystemParse (obj) {
  var extent = obj.extent
  var preserveAspectRatio = obj.preserveAspectRatio
  var initialScale = obj.initialScale
  var strArr = []
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (preserveAspectRatio != null) {
    strArr.push('preserveAspectRatio=' + util.format("%s", preserveAspectRatio))
  }
  if (initialScale != null) {
    strArr.push('initialScale=' + util.format("%s", initialScale))
  }
  return 'coordinateSystem(' + strArr.join(',') + ')'
}

function graphicsParse (obj) {
  var strArr = []
  for (var i = 0; i < obj.length; i++) {
    var ithEle = obj[i]
    var name = ithEle.name
    var attibutes = ithEle.attribute
    var graComIte = commonGraphicItems(attibutes)
    strArr.push(name + '(' + graComIte.join(',') + ')')
  }
  return 'graphics=' + '{' + strArr.join(',') + '}'
}

function transformationParse (obj) {
  var origin = obj.origin
  var extent = obj.extent
  var rotation = obj.rotation
  var strArr = []
  if (origin != null) {
    strArr.push('origin=' + originParse(origin))
  }
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (rotation != null) {
    strArr.push('rotation=' + util.format("%s", rotation))
  }
  return '(' + strArr.join(',') + ')'
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

function commonGraphicItems (obj) {
  var color = obj.color
  var thickness = obj.thickness
  var arrowSize = obj.arrowSize
  var extent = obj.extent
  var textString = obj.textString
  var fontSize = obj.fontSize
  var fontName = obj.fontName
  var textColor = obj.textColor
  var horizontalAlignment = obj.horizontalAlignment
  var string = obj.string
  var index = obj.index
  var radius = obj.radius
  var borderPattern = obj.borderPattern
  var points = obj.points
  var smooth = obj.smooth
  var startAngle = obj.startAngle
  var endAngle = obj.endAngle
  var closure = obj.closure
  var fileName = obj.fileName
  var imageSource = obj.imageSource
  var visible = obj.visible
  var origin = obj.origin
  var rotation = obj.rotation
  var lineColor = obj.lineColor
  var fillColor = obj.fillColor
  var pattern = obj.pattern
  var fillPattern = obj.fillPattern
  var lineThickness = obj.lineThickness
  var strArr = []
  if (fileName != null) {
    strArr.push('fileName=' + util.format("%s", fileName))
  }
  if (imageSource != null) {
    strArr.push('imageSource=' + util.format("%s", imageSource))
  }
  if (startAngle != null) {
    strArr.push('startAngle=' + util.format("%s", startAngle))
  }
  if (endAngle != null) {
    strArr.push('endAngle=' + util.format("%s", endAngle))
  }
  if (closure != null) {
    strArr.push('closure=' + util.format("%s", closure))
  }
  if (color != null) {
    strArr.push('color=' + colorParse(color))
  }
  if (thickness != null) {
    strArr.push('thickness=' + util.format("%s", thickness))
  }
  if (arrowSize != null) {
    strArr.push('arrowSize=' + util.format("%s", arrowSize))
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
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (radius != null) {
    strArr.push('radius=' + util.format("%s", radius))
  }
  if (borderPattern != null) {
    strArr.push('borderPattern=' + util.format("%s", borderPattern))
  }
  if (points != null) {
    strArr.push('points=' + pointsParse(points))
  }
  if (smooth != null) {
    strArr.push('smooth=' + util.format("%s", smooth))
  }
  if (visible != null) {
    strArr.push('visible=' + util.format("%s", visible))
  }
  if (origin != null) {
    strArr.push('origin=' + originParse(origin))
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
