const as = require('assert')
const mo = require('mocha')
const gp = require('../lib/graphicalPrimitives.js')
const sinon = require('sinon')

function equalObjects (dict, reference) {
  if (dict === undefined && reference === undefined) {
    return true
  } else if ((dict === undefined) || (reference === undefined)) {
    return false
  }
  if (typeof (dict) !== typeof (reference)) {
    return false
  }
  if (dict.constructor === Object && reference.constructor === Object) {
    if (Object.keys(dict).length !== Object.keys(reference).length) {
      return false
    }
    const keys = Object.keys(dict).sort()
    for (let i = 0; i < keys.length; i++) {
      const idx = keys[i]
      if (!(idx in reference)) {
        return false
      }
    }
    for (let i = 0; i < keys.length; i++) {
      const idx = keys[i]
      if (idx in reference) {
        return equalObjects(dict[idx], reference[idx])
      }
    }
    return true
  } else if ((dict.constructor === Array && reference.constructor === Array)) {
    if (dict.length !== reference.length) {
      return false
    } else {
      for (let j = 0; j < dict.length; j++) {
        if (!(equalObjects(dict[j], reference[j]))) {
          return false
        }
      }
      return true
    }
  } else {
    return dict === reference
  }
}

mo.afterEach(() => {
  sinon.restore()
})

mo.describe('graphicalPrimitives.js', function () {
  mo.describe('testing is_graphic_annotation', function () {
    mo.it('testing is a graphical annotation', function () {
      const rawJson = 'Line'
      const jsonOutput = gp.isGraphicAnnotation(rawJson)
      const referenceJsonOutput = true
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing not a graphical annotation', function () {
      const rawJson = 'Lines'
      const jsonOutput = gp.isGraphicAnnotation(rawJson)
      const referenceJsonOutput = false
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing graphic_annotation_obj', function () {
    mo.it('testing line', function () {
      sinon.stub(gp, 'lineObj').returns('mocked line')
      const rawJson = 'Line'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked line'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing text', function () {
      sinon.stub(gp, 'textObj').returns('mocked text')
      const rawJson = 'Text'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked text'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing rectangle', function () {
      sinon.stub(gp, 'rectangleObj').returns('mocked rectangle')
      const rawJson = 'Rectangle'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked rectangle'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing polygon', function () {
      sinon.stub(gp, 'polygonObj').returns('mocked polygon')
      const rawJson = 'Polygon'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked polygon'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing ellipse', function () {
      sinon.stub(gp, 'ellipseObj').returns('mocked ellipse')
      const rawJson = 'Ellipse'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked ellipse'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing bitmap', function () {
      sinon.stub(gp, 'bitmapObj').returns('mocked bitmap')
      const rawJson = 'Bitmap'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked bitmap'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing placement', function () {
      sinon.stub(gp, 'placementObj').returns('mocked placement')
      const rawJson = 'Placement'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked placement'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing coordinate_system', function () {
      sinon.stub(gp, 'coordinateSystemObj').returns('mocked coordinate_system')
      const rawJson = 'coordinateSystem'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked coordinate_system'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing line', function () {
      sinon.stub(gp, 'graphicsObj').returns('mocked graphic')
      const rawJson = 'graphic'
      const jsonOutput = gp.graphicAnnotationObj(rawJson)
      const referenceJsonOutput = 'mocked graphic'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing line_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'lineAttribute').returns(['names', 'values'])
      const rawJson = {
        class_modification: ['class_modification1', 'class_modification2', 'class_modification3']
      }
      const jsonOutput = gp.lineObj(rawJson)
      const referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing text_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'textAttribute').returns(['names', 'values'])
      const rawJson = {
        class_modification: ['class_modification1', 'class_modification2', 'class_modification3']
      }
      const jsonOutput = gp.textObj(rawJson)
      const referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing rectangle_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'rectangleAttribute').returns(['names', 'values'])
      const rawJson = {
        class_modification: ['class_modification1', 'class_modification2', 'class_modification3']
      }
      const jsonOutput = gp.rectangleObj(rawJson)
      const referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing polygon_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'polygonAttribute').returns(['names', 'values'])
      const rawJson = {
        class_modification: ['class_modification1', 'class_modification2', 'class_modification3']
      }
      const jsonOutput = gp.polygonObj(rawJson)
      const referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing ellipse_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'ellipseAttribute').returns(['names', 'values'])
      const rawJson = {
        class_modification: ['class_modification1', 'class_modification2', 'class_modification3']
      }
      const jsonOutput = gp.ellipseObj(rawJson)
      const referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing bitmap_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'bitmapAttribute').returns(['names', 'values'])
      const rawJson = {
        class_modification: ['class_modification1', 'class_modification2', 'class_modification3']
      }
      const jsonOutput = gp.bitmapObj(rawJson)
      const referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing placement_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'transformationObj').returns('mocked transformation')
      const rawJson = {
        class_modification: [{
          element_modification_or_replaceable: {
            element_modification: {
              name: 'visible',
              modification: {
                expression: {
                  simple_expression: 'test expression1'
                }
              }
            }
          }
        }, {
          element_modification_or_replaceable: {
            element_modification: {
              name: 'iconVisible',
              modification: {
                expression: {
                  simple_expression: 'test expression2'
                }
              }
            }
          }
        }, {
          element_modification_or_replaceable: {
            element_modification: {
              name: 'transformation',
              modification: {
                expression: {
                  simple_expression: 'test expression3'
                }
              }
            }
          }
        }, {
          element_modification_or_replaceable: {
            element_modification: {
              name: 'iconTransformation',
              modification: {
                expression: {
                  simple_expression: 'test expression4'
                }
              }
            }
          }
        }
        ]
      }
      const jsonOutput = gp.placementObj(rawJson)
      const referenceJsonOutput = {
        visible: 'test expression1',
        iconVisible: 'test expression2',
        transformation: 'mocked transformation',
        iconTransformation: 'mocked transformation'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing coordinate_system_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked transformation')
      const rawJson = {
        class_modification: [{
          element_modification_or_replaceable: {
            element_modification: {
              name: 'extent',
              modification: {
                expression: {
                  simple_expression: 'test expression1'
                }
              }
            }
          }
        }, {
          element_modification_or_replaceable: {
            element_modification: {
              name: 'preserveAspectRatio',
              modification: {
                expression: {
                  simple_expression: 'test expression2'
                }
              }
            }
          }
        }, {
          element_modification_or_replaceable: {
            element_modification: {
              name: 'initialScale',
              modification: {
                expression: {
                  simple_expression: 'test expression3'
                }
              }
            }
          }
        }
        ]
      }
      const jsonOutput = gp.coordinateSystemObj(rawJson)
      const referenceJsonOutput = {
        extent: 'mocked transformation',
        preserveAspectRatio: 'test expression2',
        initialScale: 'test expression3'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('transformation_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'originObj').returns('mocked origin transformation')
      sinon.stub(gp, 'pointsObj').returns('mocked points transformation')
      const rawJson = {
        class_modification: [{
          element_modification_or_replaceable: {
            element_modification: {
              name: 'origin',
              modification: {
                expression: {
                  simple_expression: 'test expression1'
                }
              }
            }
          }
        }, {
          element_modification_or_replaceable: {
            element_modification: {
              name: 'extent',
              modification: {
                expression: {
                  simple_expression: 'test expression2'
                }
              }
            }
          }
        }, {
          element_modification_or_replaceable: {
            element_modification: {
              name: 'rotation',
              modification: {
                expression: {
                  simple_expression: 3
                }
              }
            }
          }
        }
        ]
      }
      const jsonOutput = gp.transformationObj(rawJson)
      const referenceJsonOutput = {
        origin: 'mocked origin transformation',
        extent: 'mocked points transformation',
        rotation: 3
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing graphic_items_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'originObj').returns('mocked origin')
      const rawJson = {
        names: ['visible', 'origin', 'rotation'],
        expressions: ['expression1', 'expression2', '3']
      }
      const jsonOutput = gp.graphicItemsObj(rawJson)
      const referenceJsonOutput = {
        visible: 'expression1',
        origin: 'mocked origin',
        rotation: 3
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing origin_obj', function () {
    mo.it('testing with expression string', function () {
      const rawJson = '{0, 0}'
      const jsonOutput = gp.originObj(rawJson)
      const referenceJsonOutput = {
        x: 0,
        y: 0
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing filled_shape_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'colorObj').withArgs('expression1').returns('mocked line_color')
        .withArgs('expression2').returns('mocked fill_color')
      const rawJson = {
        names: ['lineColor', 'fillColor', 'pattern', 'fillPattern', 'lineThickness'],
        expressions: ['expression1', 'expression2', 'expression3', 'expression4', 5]
      }
      const jsonOutput = gp.filledShapeObj(rawJson)
      const referenceJsonOutput = {
        lineColor: 'mocked line_color',
        fillColor: 'mocked fill_color',
        pattern: 'expression3',
        fillPattern: 'expression4',
        lineThickness: 5
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing gra_ite_fil_sha_objs', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'graphicItemsObj').returns('mocked graphic_items_obj')
      sinon.stub(gp, 'filledShapeObj').returns('mocked filled_shape_obj')
      const graIteNams = ['test gra_ite_nams']
      const graIteExps = []
      const filShaNams = ['test fil_sha_nams']
      const filShaExps = []
      const jsonOutput = gp.graIteFilShaObjs(graIteNams, graIteExps, filShaNams, filShaExps)
      const referenceJsonOutput = {
        graIteObjs: 'mocked graphic_items_obj',
        filShaObjs: 'mocked filled_shape_obj'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing points_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'colorObj').withArgs('locations').returns([0, 10, 20, 30])
        .withArgs('locations').returns([9, 19, 29, 37])
      const rawJson = '{{100,-280},{100,-268},{85,-268},{85,-210}}'
      const jsonOutput = gp.pointsObj(rawJson)
      const referenceJsonOutput = [
        { x: 100, y: -280 },
        { x: 100, y: -268 },
        { x: 85, y: -268 },
        { x: 85, y: -210 }
      ]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing color_obj', function () {
    mo.it('testing structure', function () {
      const rawJson = '{0,127,255}'
      const jsonOutput = gp.colorObj(rawJson)
      const referenceJsonOutput = {
        r: 0,
        g: 127,
        b: 255
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing graphic_attribute_obj', function () {
    mo.it('testing if key_nam is line', function () {
      sinon.stub(gp, 'lineAttributeObj').returns('mocked attribute')
      const keyNam = 'Line'
      const valStr = 'val_str'
      const jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
      const referenceJsonOutput = 'mocked attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing if key_nam is text', function () {
      sinon.stub(gp, 'textAttributeObj').returns('mocked attribute')
      const keyNam = 'Text'
      const valStr = 'val_str'
      const jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
      const referenceJsonOutput = 'mocked attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing if key_nam is rectangle', function () {
      sinon.stub(gp, 'rectangleAttributeObj').returns('mocked attribute')
      const keyNam = 'Rectangle'
      const valStr = 'val_str'
      const jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
      const referenceJsonOutput = 'mocked attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing if key_nam is polygon', function () {
      sinon.stub(gp, 'polygonAttributeObj').returns('mocked attribute')
      const keyNam = 'Polygon'
      const valStr = 'val_str'
      const jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
      const referenceJsonOutput = 'mocked attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing if key_nam is ellipse', function () {
      sinon.stub(gp, 'ellipseAttributeObj').returns('mocked attribute')
      const keyNam = 'Ellipse'
      const valStr = 'val_str'
      const jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
      const referenceJsonOutput = 'mocked attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing else statement', function () {
      sinon.stub(gp, 'bitmapAttributeObj').returns('mocked attribute')
      const keyNam = 'bitmap'
      const valStr = 'val_str'
      const jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
      const referenceJsonOutput = 'mocked attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing line_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'lineAttribute').returns('mocked line_attribute')
      const rawJson = {
        names: 'test name',
        values: 'test values'
      }
      const jsonOutput = gp.lineAttributeObj(rawJson)
      const referenceJsonOutput = 'mocked line_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing text_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'textAttribute').returns('mocked text_attribute')
      const rawJson = {
        names: 'test name',
        values: 'test values'
      }
      const jsonOutput = gp.textAttributeObj(rawJson)
      const referenceJsonOutput = 'mocked text_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing rectangle_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'rectangleAttribute').returns('mocked rectangle_attribute')
      const rawJson = {
        names: 'test name',
        values: 'test values'
      }
      const jsonOutput = gp.rectangleAttributeObj(rawJson)
      const referenceJsonOutput = 'mocked rectangle_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing polygon_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'polygonAttribute').returns('mocked polygon_attribute')
      const rawJson = {
        names: 'test name',
        values: 'test values'
      }
      const jsonOutput = gp.polygonAttributeObj(rawJson)
      const referenceJsonOutput = 'mocked polygon_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing ellipse_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'ellipseAttribute').returns('mocked ellipse_attribute')
      const rawJson = {
        names: 'test name',
        values: 'test values'
      }
      const jsonOutput = gp.ellipseAttributeObj(rawJson)
      const referenceJsonOutput = 'mocked ellipse_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing bitmap_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'bitmapAttribute').returns('mocked bitmap_attribute')
      const rawJson = {
        names: 'test name',
        values: 'test values'
      }
      const jsonOutput = gp.bitmapAttributeObj(rawJson)
      const referenceJsonOutput = 'mocked bitmap_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing line_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'colorObj').returns('mocked color')
      const names = ['pattern', 'thickness', 'arrowSize', 'smooth', 'visible', 'point']
      const values = ['expression1', 2, 3, 'expression4', 'expression5', 'expression6', 'expression7']
      const jsonOutput = gp.lineAttribute(names, values)
      const referenceJsonOutput = {
        points: 'mocked points',
        color: 'mocked color',
        pattern: 'expression1',
        thickness: 2,
        arrowSize: 3,
        smooth: 'expression4',
        visible: 'expression5'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing text_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'colorObj').returns('mocked color')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      const names = ['extent', 'textString', 'fontSize', 'fontName', 'textColor', 'horizontalAlignment', 'string', 'index']
      const values = ['expression1', 'expression2', 3, 'expression4', 'expression5', 'expression6', 'expression7', 8]
      const jsonOutput = gp.textAttribute(names, values)
      const referenceJsonOutput = {
        extent: 'mocked points',
        textString: 'expression2',
        fontSize: 3,
        fontName: 'expression4',
        textColor: 'mocked color',
        horizontalAlignment: 'expression6',
        string: 'expression7',
        index: 8
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing rectangle_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      const names = ['extent', 'radius', 'borderPattern']
      const values = ['expression1', 2, 'expression3']
      const jsonOutput = gp.rectangleAttribute(names, values)
      const referenceJsonOutput = {
        extent: 'mocked points',
        radius: 2,
        borderPattern: 'expression3'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing polygon_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      const names = ['points', 'smooth']
      const values = ['expression1', 'expression2']
      const jsonOutput = gp.polygonAttribute(names, values)
      const referenceJsonOutput = {
        points: 'mocked points',
        smooth: 'expression2'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing ellipse_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      const names = ['extent', 'startAngle', 'endAngle', 'closure']
      const values = ['expression1', 2, 3, 'expression4']
      const jsonOutput = gp.ellipseAttribute(names, values)
      const referenceJsonOutput = {
        extent: 'mocked points',
        startAngle: 2,
        endAngle: 3,
        closure: 'expression4'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing bitmap_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      const names = ['extent', 'fileName', 'imageSource']
      const values = ['expression1', 'expression2', 'expression3']
      const jsonOutput = gp.bitmapAttribute(names, values)
      const referenceJsonOutput = {
        extent: 'mocked points',
        fileName: 'expression2',
        imageSource: 'expression3'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing name_attribute_pair', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'ellipseAttribute').returns('mocked ellipse_attribute')
      const rawJson = 'name1=value1,name2=value2,name3=value3'
      const jsonOutput = gp.nameAttributePair(rawJson)
      const referenceJsonOutput = {
        names: ['name1', 'name2', 'name3'],
        values: ['value1', 'value2', 'value3']
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
})
