const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')

var logger = require('winston')

function writeFile (fileName, content) {
  if (fileName.length === 1) {
    fs.writeFileAsync(fileName[0], content).then(
      function (res) {
        logger.debug('Wrote ', fileName[0])
        return true
      })
  } else {
    for (var i = 0; i < fileName.length; i++) {
      fs.writeFileAsync(fileName[i], content[i]).then(
        function (res) {
          logger.debug('Wrote ', fileName[i])
          return true
        })
    }
  }
}

/** Get the JSON data structure of the JSON file.
  *
  *@param jsonFile Name of the JSON file.
  *@return The JSON representation of the JSON file.
  */
function readJSON (jsonFile) {
  logger.debug('Entered getJSON for ', jsonFile)
  const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
  return Promise.resolve(json)
}

/** Return the MODELICAPATH, with the current directory being the first
  *  element. Elements are separated by ':'
  */
function getMODELICAPATH () {
  return (process.env.MODELICAPATH)
    ? (process.cwd() + ':' + process.env.MODELICAPATH).split(':')
    : [process.cwd()]
}

/** Return a string that points to the .mo file that contains
  * the class `className`. This function searches in the
  * current directory.
  * If the file is not found, it returns 'null'.
  *
  *@param within The withing clause.
  *@param className The class name that is used to instantiate the class (may be
  *                  a short or long class name)
  *@param declaringModelicaFileName The full path of the Modelica file that instantiates
  *                  a model of class `className`
  *@return The name of the model file that implements `className`, or `null` if not found.
  */
function getModelicaFileNameInCurrentLibrary (within, className, declaringModelicaFileName) {
  const declaringModelicaPath = path.dirname(declaringModelicaFileName)
  // For A.B, this is A/B.mo. For A, this is A.mo
  const patForClaNam = className.replace(/\./g, path.sep) + '.mo'
  if (within.length === 0) {
    // Top level class without a within.
    return fse.existsSync(patForClaNam) ? patForClaNam : null
  }
  // Walk up the directory until the directory has a subdirectory that is the full within clause
  const withinLength = within.split('.').length + 1
  const decModLength = declaringModelicaPath.split(path.sep).length + 1

  for (var i = 0; i < withinLength; i++) {
    var searchDir = declaringModelicaPath
      .split(path.sep)
      .slice(0, decModLength - i - 1)
      .join(path.sep)
    var fullName = path.join(searchDir, patForClaNam)

    if (fse.existsSync(fullName)) return fullName
  }
  // We did not find the class
  return null
}
/** Return a string that points to the .mo file that contains
  * the class `className`. This function searches in the
  * current directory and on the MODELICAPATH.
  * If the file is not found, it returns 'null'.
  *
  *@param within The withing clause.
  *@param className The class name that is used to instantiate the class (may be
  *                  a short or long class name)
  *@param declaringModelicaFileName The full path of the Modelica file that instantiates
  *                  a model of class `className`
  *@return The name of the model file that implements `className`, or `null` if not found.
  */
function getModelicaFileName (within, className, declaringModelicaFileName) {
  // First, look up in the current library.
  // Path where the file is that instantiates a model with class = className
  var retVal = getModelicaFileNameInCurrentLibrary(within, className, declaringModelicaFileName)
  if (retVal) return retVal

  // Did not find the name. Search on the MODELICAPATH
  const MOPA = getMODELICAPATH()
  // Search on the MODELICAPATH
  // Note that 'file:///Buildings/Resources' may be in the
  // directory 'file:///Buildings 5.0.1/Resources'
  // rather than only in Buildings
  var topLevel = className.substring(0, className.indexOf('.'))

  // When className is partial, it searches class in the potential paths joined
  // with within and className.
  // Note that within could be "A.B.C", and className could be "D.E". The potential
  // paths could be "A.B.C.D.E", "A.B.D.E", "A.D.E"
  var classNameWithoutTopLevel = []
  var fileName = []
  if (topLevel !== 'Buildings') {
    var splitWithin = within.split('.')
    var splitClassName = className.split('.')
    for (var i = splitWithin.length - 1; i > 0; i--) {
      var temp = splitWithin
      temp.splice(i + 1)
      Array.prototype.push.apply(temp, splitClassName)
      var temp2 = temp.join('.')
      var temp3 = temp2.substring(temp2.indexOf('.') + 1)
      classNameWithoutTopLevel.push(temp3)
      fileName.push(temp3.replace(/\./g, '/') + '.mo')
    }
    topLevel = 'Buildings'
  } else {
    var temp4 = className.substring(className.indexOf('.') + 1)
    fileName.push(temp4.replace(/\./g, '/') + '.mo')
  }

  for (var k = 0; k < MOPA.length; k++) {
    // Process the first element in the MODELICAPATH.
    // Search 'Buildings' and 'Buildings x' where x is any character.
    var dirs = (topLevel)
      ? glob.sync(path.join(MOPA[k], topLevel + '?( *)'))
      : [MOPA[k]]
    for (var d = 0; d < dirs.length; d++) {
      for (var j = 0; j < fileName.length; j++) {
        if (fse.existsSync(path.join(dirs[d], fileName[j]))) {
          return path.join(dirs[d], fileName[j])
        }
      }
    }
  }
  return null
}

/** Get input mo file array.
  * If the parsing mode is 'cdl', the array will have only one element which
  * is the giving input 'files'.
  * If the parsing mode is 'modelica', the array will include all mo files in
  * the giving package 'files' and its sub-packages.
  *
  *@param parseMode The parsing mode, 'cdl' or 'modelica'
  *@param files Input files, could be single mo file or a package name
  *@return mo files array
  */
function getMoFiles (parseMode, files) {
  var moFiles = []
  if (parseMode === 'modelica') {
    if (files.includes('.mo')) {
      throw new Error('Wrong file input, it should be a packagename.')
    }
    var fileList = getFiles(files)
    moFiles = fileList.filter(function (obj) {
      if (obj.endsWith('.mo')) { return true } else { return false }
    })
  } else {
    if (!files.includes('.mo')) {
      throw new Error('Wrong file input, it should be a single moFile.')
    }
    moFiles.push(files)
  }
  return moFiles
}

/** Get the JSON property `p` from the json data `o`
  * If the property does not exist, the function returns null
  */
const getProperty = (p, o) =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o)

/** Get the output file name array. In folder as the input files, it will create
  * a folder named as 'json', 'simplified', or 'html' based on the output format.
  *
  *@param parseMode The parsing mode, 'cdl' or 'modelica'
  *@param files Input files, could be single mo file or a package name,
  *              depending on the parsing mode
  *@param outputFormat output file format, 'json', 'json-simplified', or 'html'
  *@param outputDir output directory
  *@param moFiles mo files array
  *@param jsonDataSet json output data
  *@return Output file names array
  */
function getOutFile (parseMode, files, outputFormat, outputDir, moFiles, jsonDataSet) {
  var outFile = []
  var dirCur
  var dirBase
  var dir

  // Create folder: '../json', '../simplified', or '../html'
  if (parseMode === 'modelica') {
    var idx0 = files.lastIndexOf(path.sep)
    if (idx0 !== -1) {
      dirCur = files.slice(0, idx0)
    } else {
      dirCur = files
    }
  } else {
    var idx1 = moFiles[0].lastIndexOf(path.sep)
    dirCur = moFiles[0].slice(0, idx1)
  }
  dirBase = (outputDir === 'current') ? dirCur : outputDir
  if (outputFormat === 'json') {
    dir = path.join(dirBase, 'json')
  } else if (outputFormat === 'json-simplified') {
    dir = path.join(dirBase, 'simplified')
  } else {
    dir = path.join(dirBase, 'html')
  }

  // Create an empty folder 'dir'
  if (!fs.existsSync(dir)) {
    try {
      dir
       .split(path.sep)
       .reduce((currentPath, folder) => {
         currentPath += folder + path.sep
         if (!fs.existsSync(currentPath)) {
           fs.mkdirSync(currentPath)
         }
         return currentPath
       }, '')
    } catch (err) {
      console.log(err)
    }
  }

  // If parsing mode is 'cdl' and the output is 'html',
  // there will be only one .html file.
  if (outputFormat === 'html' && parseMode === 'cdl') {
    if (jsonDataSet[0].modelicaFile.endsWith('package.mo')) {
      outFile.push(path.join(dir, jsonDataSet[0].topClassName + '.package.html'))
    } else {
      outFile.push(path.join(dir, jsonDataSet[0].topClassName + '.html'))
    }
    // If parsing mode is 'modelica' and output is 'html',
    // there will be one .html file for each package (it may have sub-packages)
  } else if (outputFormat === 'html' && parseMode === 'modelica') {
    // Find out names of input package and sub-packages in it
    var tempPackName = []
    for (var i = 0; i < jsonDataSet.length; i++) {
      var topCla = jsonDataSet[i][0].topClassName
      var idx2 = topCla.lastIndexOf('.')
      if (idx2 === -1) {
        tempPackName.push(topCla)
      } else {
        tempPackName.push(topCla.slice(0, idx2))
      }
    }
    // Clean up to find the unique names
    var packName = tempPackName.filter(function (item, pos) {
      return tempPackName.indexOf(item) === pos
    })
    // Create one single html file for each package
    for (var j = 0; j < packName.length; j++) {
      outFile.push(path.join(dir, packName[j] + '.html'))
    }
  } else {
    for (var k = 0; k < jsonDataSet.length; k++) {
      // Retrieve Json data
      var json = (parseMode === 'modelica') ? jsonDataSet[k][0] : jsonDataSet[k]
      var fileName
      if (outputFormat === 'json-simplified') {
        if (json.modelicaFile.endsWith('package.mo')) {
          fileName = json.topClassName + '.package.json'
        } else {
          fileName = json.topClassName + '.json'
        }
      } else if (outputFormat === 'json') {
        var className
        // First, check if there is a 'within xxxx;'
        var within = getProperty(['within', 0], json)
        // Get the model name
        var shortClass = getProperty(
          ['class_definition', 0, 'class_specifier', 'short_class_specifier', 'className'], json)
        var shortName = shortClass !== null ? shortClass
            : getProperty(
              ['class_definition', 0, 'class_specifier', 'long_class_specifier', 'name'], json)
        if (shortName) {
          className = (within) ? within + '.' + shortName : shortName
        }
        if (json.modelicaFile.endsWith('package.mo')) {
          fileName = className + '.package.json'
        } else {
          fileName = className + '.json'
        }
      }
      outFile.push(path.join(dir, fileName))
    }
  }
  return outFile
}

/** Recursively remove existing folder
  */
function deleteFolderRecursive (dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function (file, index) {
      var curPath = path.join(dir, file)
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dir)
  }
}

// Get all files list in folder dir
function getFiles (dir, fileList) {
  fileList = fileList || []
  var files = fs.readdirSync(dir)
  for (var i in files) {
    if (!files.hasOwnProperty(i)) continue
    var name = dir + path.sep + files[i]
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList)
    } else {
      fileList.push(name)
    }
  }
  return fileList
}

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
    if (obj.icon && obj.icon.coordinateSystem) {
      width.push(obj.icon.coordinateSystem.extent[1].x1 - obj.icon.coordinateSystem.extent[0].x1)
      height.push(obj.icon.coordinateSystem.extent[1].x2 - obj.icon.coordinateSystem.extent[0].x2)
    } else {
      width.push(200)
      height.push(200)
    }
    // initial scale
    if (obj.icon && obj.icon.coordinateSystem && obj.icon.coordinateSystem.initialScale) {
      initialScale.push(obj.icon.coordinateSystem.initialScale)
    } else {
      initialScale.push(0.1)
    }
    // preserve aspect ratio
    if (obj.icon && obj.icon.coordinateSystem && obj.icon.coordinateSystem.preserveAspectRatio) {
      preserveAspectRatio.push(obj.icon.coordinateSystem.preserveAspectRatio)
    } else {
      preserveAspectRatio.push(true)
    }
    // Polygon points
    var pointsOfEach = []
    for (var i = 0; i < obj.icon.graphics.polygon[0].points.length; i++) {
      pointsOfEach.push((obj.icon.graphics.polygon[0].points[i].x1 - obj.icon.coordinateSystem.extent[0].x1) +
                        ',' +
                        (obj.icon.graphics.polygon[0].points[i].x2 - obj.icon.coordinateSystem.extent[0].x2))
    }
    points.push(pointsOfEach.join(' '))
    // Polygon lines color
    if (obj.icon && obj.icon.graphics.polygon[0].lineColor) {
      var temp1 = 'rgb(' + obj.icon.graphics.polygon[0].lineColor.r + ',' +
                           obj.icon.graphics.polygon[0].lineColor.g + ',' +
                           obj.icon.graphics.polygon[0].lineColor.b + ')'
      lineColor.push(temp1)
    } else {
      lineColor.push('rgb(0,0,0)')
    }
    // Polygon fill color
    if (obj.icon && obj.icon.graphics.polygon[0].fillColor) {
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
    if (obj.icon) {
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
    if (obj.public && obj.public.inputs) {
      obj.public.inputs.forEach(function (dat) {
        if (dat.placement.iconTransformation) {
          inputsExtentFrom.push(dat.placement.iconTransformation.extent[0].x1)
        } else {
          inputsExtentFrom.push(dat.placement.transformation.extent[0].x1)
        }
      })
    }
    var minInputsExtentFrom = Math.min.apply(null, inputsExtentFrom)
    // Find maximum 'extent to' of output interfaces, could be svg right end
    var outputsExtentTo = []
    if (obj.public && obj.public.outputs) {
      obj.public.outputs.forEach(function (dat) {
        if (dat.placement.iconTransformation) {
          outputsExtentTo.push(dat.placement.iconTransformation.extent[1].x1)
        } else {
          outputsExtentTo.push(dat.placement.transformation.extent[1].x1)
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
    if (obj.icon && obj.icon.graphics && obj.icon.graphics.text) {
      obj.icon.graphics.text.forEach(function (dat) {
        textExtentFrom.push(dat.extent[0].x1)
        textExtentTo.push(dat.extent[1].x1)
        textExtentLow.push(dat.extent[0].x2)
        textExtentUp.push(dat.extent[1].x2)
      })
    }
    var minTextExtentFrom = Math.min.apply(null, textExtentFrom)
    var maxTextExtentTo = Math.max.apply(null, textExtentTo)
    var minTextExtentLow = Math.min.apply(null, textExtentLow)
    var maxTextExtentUp = Math.max.apply(null, textExtentUp)

    // Bottom left corner
    var minX = Math.min(obj.icon.coordinateSystem.extent[0].x1,
                        Math.min(minInputsExtentFrom, minTextExtentFrom))
    var minY = Math.min(obj.icon.coordinateSystem.extent[0].x2,
                        minTextExtentLow)
    // Top right corner
    var maxX = Math.max(obj.icon.coordinateSystem.extent[1].x1,
                        Math.max(maxOutputsExtentTo, maxTextExtentTo))
    var maxY = Math.max(obj.icon.coordinateSystem.extent[1].x2,
                        maxTextExtentUp)
    // Width and height of the svg
    var width = maxX - minX
    var height = maxY - minY
    /* ---------------------------------------------------------- */

    var temp = '<svg version="1.1" ' +
                     'baseProfile="full" ' +
                     'width="' + width + '" ' +
                     'height="' + height + '"\n' +
                     'xmlns="http://www.w3.org/2000/svg">\n\n'
    // Polygons of the interfaces icon
    var interfaces = []
    if (obj.public && obj.public.inputs) { interfaces = obj.public.inputs }
    if (obj.public && obj.public.outputs) { interfaces = interfaces.concat(obj.public.outputs) }
    if (interfaces.length > 0) {
      for (var i = 0; i < interfaces.length; i++) {
        var tempValues
        tempValues = interfacePolygon(interfaces[i], interfaceClasses)
        var originDrawing = tempValues.originClass
        var originPoints = tempValues.points
        var originPointsString = tempValues.originPointsString
        var xIns = []
        var yIns = []
        for (var j = 0; j < originPoints.x.length; j++) {
          xIns.push(originPoints.x[j] - minX)
          yIns.push(originPoints.y[j] - minY)
        }
        var instPoints = Object.assign(
          {'x': xIns}, {'y': yIns}
        )
        var instPointsStr = instantiatePointsString(instPoints)

        var updatedDrawing = originDrawing.replace(originPointsString, instPointsStr)
        var polygonBegin = updatedDrawing.indexOf('<polygon')
        var polygonEnd = updatedDrawing.indexOf('/>', polygonBegin) + 2
        var tempInterfacePolygon = updatedDrawing.substring(polygonBegin, polygonEnd)
        temp = temp + tempInterfacePolygon + '\n'
      }
    }
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
  if (obj.graphics && obj.graphics.line) {
    for (var i = 0; i < obj.graphics.line.length; i++) {
      specifyGraphicItem(obj.graphics.line[i])
      if (obj.graphics.line[i].color === undefined) { obj.graphics.line[i].color = { 'r': 0, 'g': 0, 'b': 0 } }
      if (obj.graphics.line[i].pattern === undefined) { obj.graphics.line[i].pattern = 'LinePattern.Solid' }
      if (obj.graphics.line[i].thickness === undefined) { obj.graphics.line[i].thickness = 0.25 }
    }
  }
}

// Check polygon settings
function checkPolygon (obj) {
  if (obj.graphics && obj.graphics.polygon) {
    for (var i = 0; i < obj.graphics.polygon.length; i++) {
      specifyGraphicItem(obj.graphics.polygon[i])
      specifyFilledShape(obj.graphics.polygon[i])
    }
  }
}

// Check rectangle settings
function checkRectangle (obj) {
  if (obj.graphics && obj.graphics.rectangle) {
    for (var i = 0; i < obj.graphics.rectangle.length; i++) {
      specifyGraphicItem(obj.graphics.rectangle[i])
      specifyFilledShape(obj.graphics.rectangle[i])
      if (obj.graphics.rectangle[i].borderPattern === undefined) { obj.graphics.rectangle[i].borderPattern = 'BorderPattern.None' }
    }
  }
}

// Check ellipse settings
function checkEllipse (obj) {
  if (obj.grahics && obj.graphics.ellipse) {
    for (var i = 0; i < obj.graphics.ellipse.length; i++) {
      specifyGraphicItem(obj.graphics.ellipse[i])
      specifyFilledShape(obj.graphics.ellipse[i])
      if (obj.graphics.ellipse[i].startAngle === undefined) { obj.graphics.ellipse[i].startAngle = 0 }
      if (obj.graphics.ellipse[i].endAngle === undefined) { obj.graphics.ellipse[i].endAngle = 360 }
    }
  }
}

// Check text settings
function checkText (obj) {
  if (obj.grahics && obj.graphics.text) {
    for (var i = 0; i < obj.graphics.text.length; i++) {
      specifyGraphicItem(obj.graphics.text[i])
      specifyFilledShape(obj.graphics.text[i])
      if (obj.graphics.text[i].fontSize === undefined) { obj.graphics.text[i].fontSize = 0 }
      if (obj.graphics.text[i].fontName === undefined) { obj.graphics.text[i].fontName = 'Arial' }
      if (obj.graphics.text[i].textColor === undefined) { obj.graphics.text[i].textColor = obj.graphics.text[i].lineColor }
      if (obj.graphics.text[i].horizontalAlignment === undefined) { obj.graphics.text[i].horizontalAlignment = 'TextAlignment.Center' }
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

  /*
  var instPointsStr = instantiatePointsString(instPoints)

  var updatedDrawing = drawing.replace(originPointsString, instPointsStr)
  var polygonBegin = updatedDrawing.indexOf('<polygon')
  var polygonEnd = updatedDrawing.indexOf('/>', polygonBegin) + 2
  return updatedDrawing.substring(polygonBegin, polygonEnd)
  */
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

// Resember the points to points string
function instantiatePointsString (pointsValue) {
  var temp = []
  for (var i = 0; i < pointsValue.x.length; i++) {
    temp.push(pointsValue.x[i] + ',' + pointsValue.y[i])
  }
  return temp.join(' ')
}

module.exports.writeFile = writeFile
module.exports.readJSON = readJSON
module.exports.getModelicaFileName = getModelicaFileName
module.exports.getMODELICAPATH = getMODELICAPATH
module.exports.getMoFiles = getMoFiles
module.exports.getOutFile = getOutFile
module.exports.deleteFolderRecursive = deleteFolderRecursive
module.exports.addIconSVG = addIconSVG
module.exports.addDiagramSVG = addDiagramSVG
