/** Get the JSON property `p` from the json data `o`
  * If the property does not exist, the function returns null
  */
const getProperty = (p, o) =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o)

/**
 * Return true if it is graphical annotation
 *
 * @param nameStr name string
 */
function isGraphicAnnotation (nameStr) {
  const graEle = ['Line', 'Text', 'Rectangle', 'Polygon', 'Ellipse', 'Bitmap', 'Placement', 'coordinateSystem', 'graphics']
  const isGraAnn = graEle.some(function (ele) {
    return nameStr === ele
  })
  return isGraAnn
}

/**
 * Return graphical annotation object
 *
 * @param name name string
 * @param mod modification object
 */
function graphicAnnotationObj (name, mod) {
  if (name === 'Line') {
    return this.lineObj(mod)
  } else if (name === 'Text') {
    return this.textObj(mod)
  } else if (name === 'Rectangle') {
    return this.rectangleObj(mod)
  } else if (name === 'Polygon') {
    return this.polygonObj(mod)
  } else if (name === 'Ellipse') {
    return this.ellipseObj(mod)
  } else if (name === 'Bitmap') {
    return this.bitmapObj(mod)
  } else if (name === 'Placement') {
    return this.placementObj(mod)
  } else if (name === 'coordinateSystem') {
    return this.coordinateSystemObj(mod)
  } else {
    return this.graphicsObj(mod)
  }
}

/**
 * Return Line object
 *
 * @param mod modification object
 */
function lineObj (mod) {
  const claModArr = mod.class_modification
  const names = []
  const values = []
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    names.push(name)
    values.push(expression)
  }
  return this.lineAttribute(names, values)
}

/**
 * Return Text object
 *
 * @param mod modification object
 */
function textObj (mod) {
  const claModArr = mod.class_modification
  const names = []
  const values = []
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    names.push(name)
    values.push(expression)
  }
  return this.textAttribute(names, values)
}

/**
 * Return Rectangle object
 *
 * @param mod modification object
 */
function rectangleObj (mod) {
  const claModArr = mod.class_modification
  const names = []
  const values = []
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    names.push(name)
    values.push(expression)
  }
  return this.rectangleAttribute(names, values)
}

/**
 * Return Polygon object
 *
 * @param mod modification object
 */
function polygonObj (mod) {
  const claModArr = mod.class_modification
  const names = []
  const values = []
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    names.push(name)
    values.push(expression)
  }
  return this.polygonAttribute(names, values)
}

/**
 * Return Ellipse object
 *
 * @param mod modification object
 */
function ellipseObj (mod) {
  const claModArr = mod.class_modification
  const names = []
  const values = []
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    names.push(name)
    values.push(expression)
  }
  return this.ellipseAttribute(names, values)
}

/**
 * Return Bitmap object
 *
 * @param mod modification object
 */
function bitmapObj (mod) {
  const claModArr = mod.class_modification
  const names = []
  const values = []
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    names.push(name)
    values.push(expression)
  }
  return this.bitmapAttribute(names, values)
}

/**
 * Return Placement object
 *
 * @param mod modification object
 */
function placementObj (mod) {
  const claModArr = mod.class_modification
  let visible, iconVisible, transformation, iconTransformation
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const modification = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification'], ithEle)
    if (name === 'visible') { visible = modification.expression.simple_expression }
    if (name === 'iconVisible') { iconVisible = modification.expression.simple_expression }
    if (name === 'transformation') { transformation = this.transformationObj(modification) }
    if (name === 'iconTransformation') { iconTransformation = this.transformationObj(modification) }
  }
  return Object.assign(
    { visible },
    { iconVisible },
    { transformation },
    { iconTransformation }
  )
}

/**
 * Return coordinateSystem object
 *
 * @param mod modification object
 */
function coordinateSystemObj (mod) {
  const claModArr = mod.class_modification
  let extent, preserveAspectRatio, initialScale
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    if (name === 'extent') { extent = this.pointsObj(expression) }
    if (name === 'preserveAspectRatio') { preserveAspectRatio = expression }
    if (name === 'initialScale') { initialScale = Number(expression) }
  }
  return Object.assign(
    { extent },
    { preserveAspectRatio },
    { initialScale }
  )
}

/**
 * Return graphics object
 *
 * @param mod modification object
 */
function graphicsObj (mod) {
  const graStr = mod.expression.simple_expression
  const graItes = ['Line', 'Text', 'Rectangle', 'Polygon', 'Ellipse', 'Bitmap']
  let linLoc, texLoc, recLoc, polLoc, ellLoc, bitLoc
  const tempLocs = []
  // find the location of each primitive
  for (let i = 0; i < graItes.length; i++) {
    const ithEle = graItes[i]
    const seaKey = ithEle + '('
    if (ithEle === 'Line') { linLoc = locations(seaKey, graStr) }
    if (ithEle === 'Text') { texLoc = locations(seaKey, graStr) }
    if (ithEle === 'Rectangle') { recLoc = locations(seaKey, graStr) }
    if (ithEle === 'Polygon') { polLoc = locations(seaKey, graStr) }
    if (ithEle === 'Ellipse') { ellLoc = locations(seaKey, graStr) }
    if (ithEle === 'Bitmap') { bitLoc = locations(seaKey, graStr) }
  }
  const allLocs = tempLocs.concat(linLoc || [])
    .concat(texLoc || [])
    .concat(recLoc || [])
    .concat(polLoc || [])
    .concat(ellLoc || [])
    .concat(bitLoc || [])
    .sort(function (a, b) { return (a - b) })
  const graArr = []
  let firstBra, lastBra, name, attStr
  if (allLocs.length > 1) {
    for (let j = 0; j < allLocs.length - 1; j++) {
      firstBra = graStr.indexOf('(', allLocs[j])
      lastBra = graStr.lastIndexOf(')', allLocs[j + 1])
      name = graStr.substring(allLocs[j], firstBra)
      attStr = graStr.substring(firstBra + 1, lastBra)
      graArr.push(Object.assign(
        { name },
        { attribute: this.graphicAttributeObj(name, attStr) }
      ))
    }
  }
  firstBra = graStr.indexOf('(', allLocs[allLocs.length - 1])
  lastBra = graStr.lastIndexOf(')')
  name = graStr.substring(allLocs[allLocs.length - 1], firstBra)
  attStr = graStr.substring(firstBra + 1, lastBra)
  graArr.push(Object.assign(
    { name },
    { attribute: this.graphicAttributeObj(name, attStr) }
  ))
  return graArr
}

/**
 * Return transformation object
 *
 * @param mod modification object
 */
function transformationObj (mod) {
  const claModArr = mod.class_modification
  let origin, extent, rotation
  for (let i = 0; i < claModArr.length; i++) {
    const ithEle = claModArr[i]
    const name = getProperty(['element_modification_or_replaceable', 'element_modification', 'name'], ithEle)
    const expression = getProperty(['element_modification_or_replaceable', 'element_modification', 'modification', 'expression', 'simple_expression'], ithEle)
    if (name === 'extent') { extent = this.pointsObj(expression) }
    if (name === 'origin') { origin = this.originObj(expression) }
    if (name === 'rotation') { rotation = Number(expression) }
  }
  return Object.assign(
    { origin },
    { extent },
    { rotation }
  )
}

/**
 * Return detailed graphicItems object
 *
 * @param graIteObj graphic items object
 */
function graphicItemsObj (graIteObj) {
  const names = graIteObj.names
  const expressions = graIteObj.expressions
  let visible, origin, rotation
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = expressions[i]
    if (name === 'visible') { visible = expression }
    if (name === 'origin') { origin = this.originObj(expression) }
    if (name === 'rotation') { rotation = Number(expression) }
  }
  return Object.assign(
    { visible },
    { origin },
    { rotation }
  )
}

/**
 * Return origin object
 *
 * @param expStr expression string, like "{0, 0}"
 */
function originObj (expStr) {
  const subStr = expStr.substring(expStr.indexOf('{') + 1, expStr.lastIndexOf('}'))
  const subStrArr = subStr.split(',')
  return Object.assign(
    { x: Number(subStrArr[0]) },
    { y: Number(subStrArr[1]) }
  )
}

/**
 * Return detailed filledShape object
 *
 * @param filShaObj filled shape object
 */
function filledShapeObj (filShaObj) {
  const names = filShaObj.names
  const expressions = filShaObj.expressions
  let lineColor, fillColor, pattern, fillPattern, lineThickness
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = expressions[i]
    if (name === 'lineColor') { lineColor = this.colorObj(expression) }
    if (name === 'fillColor') { fillColor = this.colorObj(expression) }
    if (name === 'pattern') { pattern = expression }
    if (name === 'fillPattern') { fillPattern = expression }
    if (name === 'lineThickness') { lineThickness = Number(expression) }
  }
  return Object.assign(
    { lineColor },
    { fillColor },
    { pattern },
    { fillPattern },
    { lineThickness }
  )
}

function graIteFilShaObjs (graIteNams, graIteExps, filShaNams, filShaExps) {
  let graIteObjs, filShaObjs
  if (graIteNams && graIteNams.length > 0) {
    graIteObjs = this.graphicItemsObj(Object.assign(
      { names: graIteNams }, { expressions: graIteExps }
    ))
  }
  if (filShaNams && filShaNams.length > 0) {
    filShaObjs = this.filledShapeObj(Object.assign(
      { names: filShaNams }, { expressions: filShaExps }
    ))
  }
  return Object.assign(
    { graIteObjs },
    { filShaObjs }
  )
}

/**
 * Return points object
 *
 * @param expStr expression string, like "{{100,-280},{100,-268},{85,-268},{85,-210}}"
 */
function pointsObj (expStr) {
  const subStr = expStr.substring(expStr.indexOf('{') + 1, expStr.lastIndexOf('}'))
  const lefBraLocs = locations('{', subStr)
  const rigBraLocs = locations('}', subStr)
  let eleStr, eleStrArr
  const points = []
  for (let i = 0; i < lefBraLocs.length; i++) {
    eleStr = subStr.substring(lefBraLocs[i] + 1, rigBraLocs[i])
    eleStrArr = eleStr.split(',')
    points.push(Object.assign({ x: Number(eleStrArr[0]), y: Number(eleStrArr[1]) }))
  }
  return points
}

/**
 * Return color object
 *
 * @param expStr expression string, like "{0,127,255}"
 */
function colorObj (expStr) {
  const subStr = expStr.substring(expStr.indexOf('{') + 1, expStr.lastIndexOf('}'))
  const subStrArr = subStr.split(',')
  return Object.assign(
    { r: Number(subStrArr[0]) },
    { g: Number(subStrArr[1]) },
    { b: Number(subStrArr[2]) }
  )
}

/**
 * Return graphic attribute object
 *
 * @param keyNam primitive name
 * @param valStr string
 */
function graphicAttributeObj (keyNam, valStr) {
  if (keyNam === 'Line') { return this.lineAttributeObj(valStr) } else if (keyNam === 'Text') { return this.textAttributeObj(valStr) } else if (keyNam === 'Rectangle') { return this.rectangleAttributeObj(valStr) } else if (keyNam === 'Polygon') { return this.polygonAttributeObj(valStr) } else if (keyNam === 'Ellipse') { return this.ellipseAttributeObj(valStr) } else {
    return this.bitmapAttributeObj(valStr)
  }
}

/**
 * Return line attribute object
 *
 * @param valStr string
 */
function lineAttributeObj (valStr) {
  const nameVales = this.nameAttributePair(valStr)
  const names = nameVales.names
  const values = nameVales.values
  return this.lineAttribute(names, values)
}

/**
 * Return text attribute object
 *
 * @param valStr string
 */
function textAttributeObj (valStr) {
  const nameVales = this.nameAttributePair(valStr)
  const names = nameVales.names
  const values = nameVales.values
  return this.textAttribute(names, values)
}

/**
 * Return Rectangle attribute object
 *
 * @param valStr string
 */
function rectangleAttributeObj (valStr) {
  const nameVales = this.nameAttributePair(valStr)
  const names = nameVales.names
  const values = nameVales.values
  return this.rectangleAttribute(names, values)
}

/**
 * Return Polygon attribute object
 *
 * @param valStr string
 */
function polygonAttributeObj (valStr) {
  const nameVales = this.nameAttributePair(valStr)
  const names = nameVales.names
  const values = nameVales.values
  return this.polygonAttribute(names, values)
}

/**
 * Return Ellipse attribute object
 *
 * @param valStr string
 */
function ellipseAttributeObj (valStr) {
  const nameVales = this.nameAttributePair(valStr)
  const names = nameVales.names
  const values = nameVales.values
  return this.ellipseAttribute(names, values)
}

/**
 * Return Bitmap attribute object
 *
 * @param valStr string
 */
function bitmapAttributeObj (valStr) {
  const nameVales = this.nameAttributePair(valStr)
  const names = nameVales.names
  const values = nameVales.values
  return this.bitmapAttribute(names, values)
}

/**
 * Return Line attributes
 *
 * @param names name array
 * @param values value string array
 */
function lineAttribute (names, values) {
  let points, color, pattern, thickness, arrowSize, smooth, visible
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = values[i]
    if (name === 'pattern') { pattern = expression }
    if (name === 'thickness') { thickness = Number(expression) }
    if (name === 'arrowSize') { arrowSize = Number(expression) }
    if (name === 'smooth') { smooth = expression }
    if (name === 'visible') { visible = expression }
    if (name === 'points') {
      points = this.pointsObj(expression)
    }
    if (name === 'color') { color = this.colorObj(expression) }
  }
  return Object.assign(
    { points },
    { color },
    { pattern },
    { thickness },
    { arrowSize },
    { smooth },
    { visible }
  )
}

/**
 * Return Text attribute
 *
 * @param names name array
 * @param values value string array
 */
function textAttribute (names, values) {
  const graItes = ['visible', 'origin', 'rotation']
  const filledShape = ['lineColor', 'fillColor', 'pattern', 'fillPattern', 'lineThickness']
  const graIteNams = []
  const graIteExps = []
  const filShaNams = []
  const filShaExps = []
  let extent, textString, fontSize, fontName, textColor
  let horizontalAlignment, string, index
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = values[i]
    if (name === 'extent') { extent = this.pointsObj(expression) }
    if (name === 'textString') { textString = expression }
    if (name === 'fontSize') { fontSize = Number(expression) }
    if (name === 'fontName') { fontName = expression }
    if (name === 'textColor') { textColor = this.colorObj(expression) }
    if (name === 'horizontalAlignment') { horizontalAlignment = expression }
    if (name === 'string') { string = expression }
    if (name === 'index') { index = Number(expression) }
    // Check if it is the graphicItems
    if (graItes.indexOf(name) > -1) {
      graIteNams.push(name)
      graIteExps.push(expression)
    }
    // Check if it is the filledShape items
    if (filledShape.indexOf(name) > -1) {
      filShaNams.push(name)
      filShaExps.push(expression)
    }
  }
  const graIteFilShaObj = this.graIteFilShaObjs(graIteNams, graIteExps, filShaNams, filShaExps)
  return Object.assign(
    { extent },
    { textString },
    { fontSize },
    { fontName },
    { textColor },
    { horizontalAlignment },
    { string },
    { index },
    graIteFilShaObj ? graIteFilShaObj.graIteObjs : undefined,
    graIteFilShaObj ? graIteFilShaObj.filShaObjs : undefined
  )
}

/**
 * Return Rectangle attributes
 *
 * @param names name array
 * @param values value string array
 */
function rectangleAttribute (names, values) {
  const graItes = ['visible', 'origin', 'rotation']
  const filledShape = ['lineColor', 'fillColor', 'pattern', 'fillPattern', 'lineThickness']
  const graIteNams = []
  const graIteExps = []
  const filShaNams = []
  const filShaExps = []
  let extent, radius, borderPattern
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = values[i]
    if (name === 'extent') { extent = this.pointsObj(expression) }
    if (name === 'radius') { radius = Number(expression) }
    if (name === 'borderPattern') { borderPattern = expression }
    // Check if it is the graphicItems
    if (graItes.indexOf(name) > -1) {
      graIteNams.push(name)
      graIteExps.push(expression)
    }
    // Check if it is the filledShape items
    if (filledShape.indexOf(name) > -1) {
      filShaNams.push(name)
      filShaExps.push(expression)
    }
  }
  const graIteFilShaObj = this.graIteFilShaObjs(graIteNams, graIteExps, filShaNams, filShaExps)
  return Object.assign(
    { extent },
    { radius },
    { borderPattern },
    graIteFilShaObj ? graIteFilShaObj.graIteObjs : undefined,
    graIteFilShaObj ? graIteFilShaObj.filShaObjs : undefined
  )
}

/**
 * Return Rectangle attributes
 *
 * @param names name array
 * @param values value string array
 */
function polygonAttribute (names, values) {
  const graItes = ['visible', 'origin', 'rotation']
  const filledShape = ['lineColor', 'fillColor', 'pattern', 'fillPattern', 'lineThickness']
  const graIteNams = []
  const graIteExps = []
  const filShaNams = []
  const filShaExps = []
  let points, smooth
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = values[i]
    if (name === 'points') { points = this.pointsObj(expression) }
    if (name === 'smooth') { smooth = expression }
    // Check if it is the graphicItems
    if (graItes.indexOf(name) > -1) {
      graIteNams.push(name)
      graIteExps.push(expression)
    }
    // Check if it is the filledShape items
    if (filledShape.indexOf(name) > -1) {
      filShaNams.push(name)
      filShaExps.push(expression)
    }
  }
  const graIteFilShaObj = this.graIteFilShaObjs(graIteNams, graIteExps, filShaNams, filShaExps)
  return Object.assign(
    { points },
    { smooth },
    graIteFilShaObj ? graIteFilShaObj.graIteObjs : undefined,
    graIteFilShaObj ? graIteFilShaObj.filShaObjs : undefined
  )
}

/**
 * Return Ellipse attributes
 *
 * @param names name array
 * @param values value string array
 */
function ellipseAttribute (names, values) {
  const graItes = ['visible', 'origin', 'rotation']
  const filledShape = ['lineColor', 'fillColor', 'pattern', 'fillPattern', 'lineThickness']
  const graIteNams = []
  const graIteExps = []
  const filShaNams = []
  const filShaExps = []
  let extent, startAngle, endAngle, closure
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = values[i]
    if (name === 'extent') { extent = this.pointsObj(expression) }
    if (name === 'startAngle') { startAngle = Number(expression) }
    if (name === 'endAngle') { endAngle = Number(expression) }
    if (name === 'closure') { closure = expression }
    // Check if it is the graphicItems
    if (graItes.indexOf(name) > -1) {
      graIteNams.push(name)
      graIteExps.push(expression)
    }
    // Check if it is the filledShape items
    if (filledShape.indexOf(name) > -1) {
      filShaNams.push(name)
      filShaExps.push(expression)
    }
  }
  const graIteFilShaObj = this.graIteFilShaObjs(graIteNams, graIteExps, filShaNams, filShaExps)
  return Object.assign(
    { extent },
    { startAngle },
    { endAngle },
    { closure },
    graIteFilShaObj ? graIteFilShaObj.graIteObjs : undefined,
    graIteFilShaObj ? graIteFilShaObj.filShaObjs : undefined
  )
}

/**
 * Return Bitmap attributes
 *
 * @param names name array
 * @param values value string array
 */
function bitmapAttribute (names, values) {
  const graItes = ['visible', 'origin', 'rotation']
  const graIteNams = []
  const graIteExps = []
  let extent, fileName, imageSource
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const expression = values[i]
    if (name === 'extent') { extent = this.pointsObj(expression) }
    if (name === 'fileName') { fileName = expression }
    if (name === 'imageSource') { imageSource = expression }
    // Check if it is the graphicItems
    if (graItes.indexOf(name) > -1) {
      graIteNams.push(name)
      graIteExps.push(expression)
    }
  }
  const graIteObj = this.graIteFilShaObjs(graIteNams, graIteExps)
  return Object.assign(
    { extent },
    { fileName },
    { imageSource },
    graIteObj ? graIteObj.graIteObjs : undefined
  )
}

/**
 * Return name and its attribute pairs
 *
 * @param valStr string
 */
function nameAttributePair (valStr) {
  // search for '=' locations
  const equLocs = locations('=', valStr)
  // search for ',' locations
  const comLocs = []
  for (let i = 0; i < equLocs.length; i++) {
    const comLoc = valStr.lastIndexOf(',', equLocs[i])
    if (comLoc > -1) { comLocs.push(comLoc) }
  }
  const keyNam = []
  const val = []
  keyNam.push(valStr.substring(0, equLocs[0]))
  if (comLocs.length > 0) {
    for (let j = 0; j < comLocs.length; j++) {
      keyNam.push(valStr.substring(comLocs[j] + 1, equLocs[j + 1]))
      val.push(valStr.substring(equLocs[j] + 1, comLocs[j]))
    }
  }
  val.push(valStr.substring(equLocs[equLocs.length - 1] + 1))
  return Object.assign(
    { names: keyNam },
    { values: val }
  )
}

/**
 * Return location array of an substring in string
 *
 * @param substr substring
 * @param str string
 */
function locations (substr, str) {
  const a = []
  let i = -1
  while ((i = str.indexOf(substr, i + 1)) >= 0) { a.push(i) }
  return a
}

module.exports.isGraphicAnnotation = isGraphicAnnotation
module.exports.graphicAnnotationObj = graphicAnnotationObj
module.exports.lineObj = lineObj
module.exports.textObj = textObj
module.exports.rectangleObj = rectangleObj
module.exports.polygonObj = polygonObj
module.exports.ellipseObj = ellipseObj
module.exports.bitmapObj = bitmapObj
module.exports.placementObj = placementObj
module.exports.coordinateSystemObj = coordinateSystemObj
module.exports.graphicsObj = graphicsObj
module.exports.transformationObj = transformationObj
module.exports.graphicItemsObj = graphicItemsObj
module.exports.originObj = originObj
module.exports.filledShapeObj = filledShapeObj
module.exports.graIteFilShaObjs = graIteFilShaObjs
module.exports.pointsObj = pointsObj
module.exports.colorObj = colorObj
module.exports.graphicAttributeObj = graphicAttributeObj
module.exports.lineAttributeObj = lineAttributeObj
module.exports.textAttributeObj = textAttributeObj
module.exports.rectangleAttributeObj = rectangleAttributeObj
module.exports.polygonAttributeObj = polygonAttributeObj
module.exports.ellipseAttributeObj = ellipseAttributeObj
module.exports.bitmapAttributeObj = bitmapAttributeObj
module.exports.lineAttribute = lineAttribute
module.exports.textAttribute = textAttribute
module.exports.rectangleAttribute = rectangleAttribute
module.exports.polygonAttribute = polygonAttribute
module.exports.ellipseAttribute = ellipseAttribute
module.exports.bitmapAttribute = bitmapAttribute
module.exports.nameAttributePair = nameAttributePair
