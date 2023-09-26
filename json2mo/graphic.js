const util = require('util')

function parse (content, rawJson = false) {
  // "keys" will be a one element array, could be
  // ['Line', 'Text', 'Rectangle', 'Polygon', 'Ellipse', 'Bitmap', 'Placement', 'coordinateSystem', 'graphics']
  const graKeys = Object.keys(content)
  const graKey = graKeys[0]

  let moOutput = ''
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
  const graComIte = commonGraphicItems(obj)
  return 'Line(' + graComIte.join(',') + ')'
}

function textParse (obj) {
  const graComIte = commonGraphicItems(obj)
  return 'Text(' + graComIte.join(',') + ')'
}

function rectangleParse (obj) {
  const graComIte = commonGraphicItems(obj)
  return 'Rectangle(' + graComIte.join(',') + ')'
}

function polygonParse (obj) {
  const graComIte = commonGraphicItems(obj)
  return 'Polygon(' + graComIte.join(',') + ')'
}

function ellipseParse (obj) {
  const graComIte = commonGraphicItems(obj)
  return 'Ellipse(' + graComIte.join(',') + ')'
}

function bitmapParse (obj) {
  const graComIte = commonGraphicItems(obj)
  return 'Bitmap(' + graComIte.join(',') + ')'
}

function placementParse (obj) {
  const visible = obj.visible
  const iconVisible = obj.iconVisible
  const transformation = obj.transformation
  const iconTransformation = obj.iconTransformation
  const strArr = []
  if (visible != null) {
    strArr.push('visible=' + util.format('%s', visible))
  }
  if (iconVisible != null) {
    strArr.push('iconVisible=' + util.format('%s', iconVisible))
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
  const extent = obj.extent
  const preserveAspectRatio = obj.preserveAspectRatio
  const initialScale = obj.initialScale
  const strArr = []
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (preserveAspectRatio != null) {
    strArr.push('preserveAspectRatio=' + util.format('%s', preserveAspectRatio))
  }
  if (initialScale != null) {
    strArr.push('initialScale=' + util.format('%s', initialScale))
  }
  return 'coordinateSystem(' + strArr.join(',') + ')'
}

function graphicsParse (obj) {
  const strArr = []
  for (let i = 0; i < obj.length; i++) {
    const ithEle = obj[i]
    const name = ithEle.name
    const attibutes = ithEle.attribute
    const graComIte = commonGraphicItems(attibutes)
    strArr.push(name + '(' + graComIte.join(',') + ')')
  }
  return 'graphics=' + '{' + strArr.join(',') + '}'
}

function transformationParse (obj) {
  const origin = obj.origin
  const extent = obj.extent
  const rotation = obj.rotation
  const strArr = []
  if (origin != null) {
    strArr.push('origin=' + originParse(origin))
  }
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (rotation != null) {
    strArr.push('rotation=' + util.format('%s', rotation))
  }
  return '(' + strArr.join(',') + ')'
}

function pointsParse (obj) {
  const pointsArr = []
  for (let i = 0; i < obj.length; i++) {
    const ithPoint = obj[i]
    let pointStr = '{'
    pointStr += util.format('%s', ithPoint.x)
    pointStr += ','
    pointStr += util.format('%s', ithPoint.y)
    pointStr += '}'
    pointsArr.push(pointStr)
  }
  return '{' + pointsArr.join(',') + '}'
}

function colorParse (obj) {
  let colEle = '{'
  colEle += util.format('%s', obj.r)
  colEle += ','
  colEle += util.format('%s', obj.g)
  colEle += ','
  colEle += util.format('%s', obj.b)
  colEle += '}'
  return colEle
}

function originParse (obj) {
  let ori = '{'
  ori += util.format('%s', obj.x)
  ori += ','
  ori += util.format('%s', obj.y)
  ori += '}'
  return ori
}

function commonGraphicItems (obj) {
  const color = obj.color
  const thickness = obj.thickness
  const arrowSize = obj.arrowSize
  const extent = obj.extent
  const textString = obj.textString
  const fontSize = obj.fontSize
  const fontName = obj.fontName
  const textColor = obj.textColor
  const horizontalAlignment = obj.horizontalAlignment
  const string = obj.string
  const index = obj.index
  const radius = obj.radius
  const borderPattern = obj.borderPattern
  const points = obj.points
  const smooth = obj.smooth
  const startAngle = obj.startAngle
  const endAngle = obj.endAngle
  const closure = obj.closure
  const fileName = obj.fileName
  const imageSource = obj.imageSource
  const visible = obj.visible
  const origin = obj.origin
  const rotation = obj.rotation
  const lineColor = obj.lineColor
  const fillColor = obj.fillColor
  const pattern = obj.pattern
  const fillPattern = obj.fillPattern
  const lineThickness = obj.lineThickness
  const strArr = []
  if (fileName != null) {
    strArr.push('fileName=' + util.format('%s', fileName))
  }
  if (imageSource != null) {
    strArr.push('imageSource=' + util.format('%s', imageSource))
  }
  if (startAngle != null) {
    strArr.push('startAngle=' + util.format('%s', startAngle))
  }
  if (endAngle != null) {
    strArr.push('endAngle=' + util.format('%s', endAngle))
  }
  if (closure != null) {
    strArr.push('closure=' + util.format('%s', closure))
  }
  if (color != null) {
    strArr.push('color=' + colorParse(color))
  }
  if (thickness != null) {
    strArr.push('thickness=' + util.format('%s', thickness))
  }
  if (arrowSize != null) {
    strArr.push('arrowSize=' + util.format('%s', arrowSize))
  }
  if (textString != null) {
    strArr.push('textString=' + util.format('%s', textString))
  }
  if (fontSize != null) {
    strArr.push('fontSize=' + util.format('%s', fontSize))
  }
  if (fontName != null) {
    strArr.push('fontName=' + util.format('%s', fontName))
  }
  if (fontSize != null) {
    strArr.push('fontSize=' + util.format('%s', fontSize))
  }
  if (textColor != null) {
    strArr.push('textColor=' + colorParse(extent))
  }
  if (horizontalAlignment != null) {
    strArr.push('horizontalAlignment=' + util.format('%s', horizontalAlignment))
  }
  if (string != null) {
    strArr.push('string=' + util.format('%s', string))
  }
  if (index != null) {
    strArr.push('index=' + util.format('%s', index))
  }
  if (extent != null) {
    strArr.push('extent=' + pointsParse(extent))
  }
  if (radius != null) {
    strArr.push('radius=' + util.format('%s', radius))
  }
  if (borderPattern != null) {
    strArr.push('borderPattern=' + util.format('%s', borderPattern))
  }
  if (points != null) {
    strArr.push('points=' + pointsParse(points))
  }
  if (smooth != null) {
    strArr.push('smooth=' + util.format('%s', smooth))
  }
  if (visible != null) {
    strArr.push('visible=' + util.format('%s', visible))
  }
  if (origin != null) {
    strArr.push('origin=' + originParse(origin))
  }
  if (rotation != null) {
    strArr.push('rotation=' + util.format('%s', rotation))
  }
  if (lineColor != null) {
    strArr.push('lineColor=' + colorParse(lineColor))
  }
  if (fillColor != null) {
    strArr.push('fillColor=' + colorParse(fillColor))
  }
  if (pattern != null) {
    strArr.push('pattern=' + util.format('%s', pattern))
  }
  if (fillPattern != null) {
    strArr.push('fillPattern=' + util.format('%s', fillPattern))
  }
  if (lineThickness != null) {
    strArr.push('lineThickness=' + util.format('%s', lineThickness))
  }
  return strArr
}

module.exports = { parse }
