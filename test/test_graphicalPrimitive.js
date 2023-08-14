const as = require('assert')
const mo = require('mocha')
const gp = require('../lib/graphicalPrimitives.js')
const graPri = require('../lib/graphicalPrimitives.js')
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
    var keys = Object.keys(dict).sort()
    for (var i = 0; i < keys.length; i++) {
      var idx = keys[i]
      if (!(idx in reference)) {
        return false
      } else {
        return equalObjects(dict[idx], reference[idx])
      }
    }
    return true
  } else if ((dict.constructor === Array && reference.constructor === Array)) {
    if (dict.length !== reference.length) {
      return false
    } else {
      for (var j = 0; j < dict.length; j++) {
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
      var rawJson = 'Line'
      var jsonOutput = gp.isGraphicAnnotation(rawJson)
      var referenceJsonOutput = true
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing not a graphical annotation', function () {
      var rawJson = 'Lines'
      var jsonOutput = gp.isGraphicAnnotation(rawJson)
      var referenceJsonOutput = false
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing graphic_annotation_obj', function () {
    mo.it('testing line', function () {
      sinon.stub(gp, 'lineObj').returns('mocked line')
      var rawJson = 'Line'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked line'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing text', function () {
      sinon.stub(gp, 'textObj').returns('mocked text')
      var rawJson = 'Text'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked text'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing rectangle', function () {
      sinon.stub(gp, 'rectangleObj').returns('mocked rectangle')
      var rawJson = 'Rectangle'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked rectangle'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing polygon', function () {
      sinon.stub(gp, 'polygonObj').returns('mocked polygon')
      var rawJson = 'Polygon'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked polygon'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing ellipse', function () {
      sinon.stub(gp, 'ellipseObj').returns('mocked ellipse')
      var rawJson = 'Ellipse'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked ellipse'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing bitmap', function () {
      sinon.stub(gp, 'bitmapObj').returns('mocked bitmap')
      var rawJson = 'Bitmap'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked bitmap'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing placement', function () {
      sinon.stub(gp, 'placementObj').returns('mocked placement')
      var rawJson = 'Placement'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked placement'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing coordinate_system', function () {
      sinon.stub(gp, 'coordinateSystemObj').returns('mocked coordinate_system')
      var rawJson = 'coordinateSystem'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked coordinate_system'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
    mo.it('testing line', function () {
      sinon.stub(gp, 'graphicsObj').returns('mocked graphic')
      var rawJson = 'graphic'
      var jsonOutput = gp.graphicAnnotationObj(rawJson)
      var referenceJsonOutput = 'mocked graphic'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing line_obj', function () {
	  mo.it('testing structure', function () {
	    sinon.stub(gp, 'lineAttribute').returns(['names', 'values'])
	    var rawJson = {
	      'class_modification': ['class_modification1', 'class_modification2', 'class_modification3']
	    }
	    var jsonOutput = gp.lineObj(rawJson)
	    var referenceJsonOutput = ['names', 'values']
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
  })
  mo.describe('testing text_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'textAttribute').returns(['names', 'values'])
      var rawJson = {
        'class_modification': ['class_modification1', 'class_modification2', 'class_modification3']
      }
      var jsonOutput = gp.textObj(rawJson)
      var referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing rectangle_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'rectangleAttribute').returns(['names', 'values'])
      var rawJson = {
        'class_modification': ['class_modification1', 'class_modification2', 'class_modification3']
      }
      var jsonOutput = gp.rectangleObj(rawJson)
      var referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing polygon_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'polygonAttribute').returns(['names', 'values'])
      var rawJson = {
        'class_modification': ['class_modification1', 'class_modification2', 'class_modification3']
      }
      var jsonOutput = gp.polygonObj(rawJson)
      var referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing ellipse_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'ellipseAttribute').returns(['names', 'values'])
      var rawJson = {
        'class_modification': ['class_modification1', 'class_modification2', 'class_modification3']
      }
      var jsonOutput = gp.ellipseObj(rawJson)
      var referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing bitmap_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'bitmapAttribute').returns(['names', 'values'])
      var rawJson = {
        'class_modification': ['class_modification1', 'class_modification2', 'class_modification3']
      }
      var jsonOutput = gp.bitmapObj(rawJson)
      var referenceJsonOutput = ['names', 'values']
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing placement_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'transformationObj').returns('mocked transformation')
      var rawJson = {
        'class_modification': [{
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'visible',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression1'
                }
              }
            }
          }
        }, {
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'iconVisible',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression2'
                }
              }
            }
          }
        }, {
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'transformation',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression3'
                }
              }
            }
          }
        }, {
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'iconTransformation',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression4'
                }
              }
            }
          }
        }
        ]
      }
      var jsonOutput = gp.placementObj(rawJson)
      var referenceJsonOutput = {
        'visible': 'test expression1',
        'iconVisible': 'test expression2',
        'transformation': 'mocked transformation',
        'iconTransformation': 'mocked transformation'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing coordinate_system_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked transformation')
      var rawJson = {
        'class_modification': [{
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'extent',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression1'
                }
              }
            }
          }
        }, {
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'preserveAspectRatio',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression2'
                }
              }
            }
          }
        }, {
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'initialScale',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression3'
                }
              }
            }
          }
        }
        ]
      }
      var jsonOutput = gp.coordinateSystemObj(rawJson)
      var referenceJsonOutput = {
        'extent': 'mocked transformation',
        'preserveAspectRatio': 'test expression2',
        'initialScale': 'test expression3'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('transformation_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'originObj').returns('mocked transformation')
      sinon.stub(gp, 'pointsObj').returns('mocked transformation')
      var rawJson = {
        'class_modification': [{
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'origin',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression1'
                }
              }
            }
          }
        }, {
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'extent',
              'modification': {
                'expression': {
                  'simple_expression': 'test expression2'
                }
              }
            }
          }
        }, {
          'element_modification_or_replaceable': {
            'element_modification': {
              'name': 'rotation',
              'modification': {
                'expression': {
                  'simple_expression': 3
                }
              }
            }
          }
        }
        ]
      }
      var jsonOutput = gp.transformationObj(rawJson)
      var referenceJsonOutput = {
        'origin': 'mocked transformation',
        'extent': 'mocked transformation',
        'rotation': 3
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing graphic_items_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'originObj').returns('mocked origin')
      var rawJson = {
        'names': ['visible', 'origin', 'rotation'],
        'expressions': ['expression1', 'expression2', '3']
      }
      var jsonOutput = gp.graphicItemsObj(rawJson)
      var referenceJsonOutput = {
        'visible': 'expression1',
        'origin': 'mocked origin',
        'rotation': 3
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing origin_obj', function () {
    mo.it('testing with expression string', function () {
      var rawJson = '{0, 0}'
      var jsonOutput = gp.originObj(rawJson)
      var referenceJsonOutput = {
        'x': 0,
        'y': 0
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing filled_shape_obj', function () {
	  mo.it('testing structure', function () {
	    sinon.stub(gp, 'colorObj').withArgs('expression1').returns('mocked line_color')
	                              .withArgs('expression2').returns('mocked fill_color')
	    var rawJson = {
	      'names': ['lineColor', 'fillColor', 'pattern', 'fillPattern', 'lineThickness'],
	      'expressions': ['expression1', 'expression2', 'expression3', 'expression4', 5]
	    }
	    var jsonOutput = gp.filledShapeObj(rawJson)
	    var referenceJsonOutput = {
	      'lineColor': 'mocked line_color',
	      'fillColor': 'mocked fill_color',
	      'pattern': 'expression3',
	      'fillPattern': 'expression4',
	      'lineThickness': 5
	    }
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
  })
  mo.describe('testing gra_ite_fil_sha_objs', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'graphicItemsObj').returns('mocked graphic_items_obj')
      sinon.stub(gp, 'filledShapeObj').returns('mocked filled_shape_obj')
      var graIteNams = ['test gra_ite_nams']
      var graIteExps = []
      var filShaNams = ['test fil_sha_nams']
      var filShaExps = []
      var jsonOutput = gp.graIteFilShaObjs(graIteNams, graIteExps, filShaNams, filShaExps)
      var referenceJsonOutput = {
        'graIteObjs': 'mocked graphic_items_obj',
        'filShaObjs': 'mocked filled_shape_obj'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing points_obj', function () {
	  mo.it('testing structure', function () {
	    sinon.stub(gp, 'colorObj').withArgs('locations').returns([0, 10, 20, 30])
	                              .withArgs('locations').returns([9, 19, 29, 37])
	    var rawJson = '{{100,-280},{100,-268},{85,-268},{85,-210}}'
	    var jsonOutput = gp.pointsObj(rawJson)
	    var referenceJsonOutput = [
	      {'x': 100, 'y': -280},
	      {'x': 100, 'y': -268},
	      {'x': 85, 'y': -268},
	      {'x': 85, 'y': -210}
    ]
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
  })
  mo.describe('testing color_obj', function () {
	  mo.it('testing structure', function () {
	    var rawJson = '{0,127,255}'
	    var jsonOutput = gp.colorObj(rawJson)
	    var referenceJsonOutput = {
	      'r': 0,
	      'g': 127,
	      'b': 255
	    }
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
  })
  mo.describe('testing graphic_attribute_obj', function () {
	  mo.it('testing if key_nam is line', function () {
	    sinon.stub(gp, 'lineAttributeObj').returns('mocked attribute')
	    var keyNam = 'Line'
	    var valStr = 'val_str'
	    var jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
	    var referenceJsonOutput = 'mocked attribute'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
	  mo.it('testing if key_nam is text', function () {
	    sinon.stub(gp, 'textAttributeObj').returns('mocked attribute')
	    var keyNam = 'Text'
	    var valStr = 'val_str'
	    var jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
	    var referenceJsonOutput = 'mocked attribute'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
	  mo.it('testing if key_nam is rectangle', function () {
	    sinon.stub(gp, 'rectangleAttributeObj').returns('mocked attribute')
	    var keyNam = 'Rectangle'
	    var valStr = 'val_str'
	    var jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
	    var referenceJsonOutput = 'mocked attribute'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
	  mo.it('testing if key_nam is polygon', function () {
	    sinon.stub(gp, 'polygonAttributeObj').returns('mocked attribute')
	    var keyNam = 'Polygon'
	    var valStr = 'val_str'
	    var jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
	    var referenceJsonOutput = 'mocked attribute'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
	  mo.it('testing if key_nam is ellipse', function () {
	    sinon.stub(gp, 'ellipseAttributeObj').returns('mocked attribute')
	    var keyNam = 'Ellipse'
	    var valStr = 'val_str'
	    var jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
	    var referenceJsonOutput = 'mocked attribute'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
	  mo.it('testing else statement', function () {
	    sinon.stub(gp, 'bitmapAttributeObj').returns('mocked attribute')
	    var keyNam = 'bitmap'
	    var valStr = 'val_str'
	    var jsonOutput = gp.graphicAttributeObj(keyNam, valStr)
	    var referenceJsonOutput = 'mocked attribute'
	    as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
	  })
  })
  mo.describe('testing line_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'lineAttribute').returns('mocked line_attribute')
      var rawJson = {
        'names': 'test name',
        'values': 'test values'
      }
      var jsonOutput = gp.lineAttributeObj(rawJson)
      var referenceJsonOutput = 'mocked line_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing text_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'textAttribute').returns('mocked text_attribute')
      var rawJson = {
        'names': 'test name',
        'values': 'test values'
      }
      var jsonOutput = gp.textAttributeObj(rawJson)
      var referenceJsonOutput = 'mocked text_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing rectangle_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'rectangleAttribute').returns('mocked rectangle_attribute')
      var rawJson = {
        'names': 'test name',
        'values': 'test values'
      }
      var jsonOutput = gp.rectangleAttributeObj(rawJson)
      var referenceJsonOutput = 'mocked rectangle_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing polygon_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'polygonAttribute').returns('mocked polygon_attribute')
      var rawJson = {
        'names': 'test name',
        'values': 'test values'
      }
      var jsonOutput = gp.polygonAttributeObj(rawJson)
      var referenceJsonOutput = 'mocked polygon_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing ellipse_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'ellipseAttribute').returns('mocked ellipse_attribute')
      var rawJson = {
        'names': 'test name',
        'values': 'test values'
      }
      var jsonOutput = gp.ellipseAttributeObj(rawJson)
      var referenceJsonOutput = 'mocked ellipse_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing bitmap_attribute_obj', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'nameAttributePair').returns('mocked name_attribute')
      sinon.stub(gp, 'bitmapAttribute').returns('mocked bitmap_attribute')
      var rawJson = {
        'names': 'test name',
        'values': 'test values'
      }
      var jsonOutput = gp.bitmapAttributeObj(rawJson)
      var referenceJsonOutput = 'mocked bitmap_attribute'
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing line_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'colorObj').returns('mocked color')
      var names = ['pattern', 'thickness', 'arrowSize', 'smooth', 'visible', 'point']
      var values = ['expression1', 2, 3, 'expression4', 'expression5', 'expression6', 'expression7']
      var jsonOutput = gp.lineAttribute(names, values)
      var referenceJsonOutput = {
        'points': 'mocked points',
        'color': 'mocked color',
        'pattern': 'expression1',
        'thickness': 2,
        'arrowSize': 3,
        'smooth': 'expression4',
        'visible': 'expression5'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing text_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'colorObj').returns('mocked color')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      var names = ['extent', 'textString', 'fontSize', 'fontName', 'textColor', 'horizontalAlignment', 'string', 'index']
      var values = ['expression1', 'expression2', 3, 'expression4', 'expression5', 'expression6', 'expression7', 8]
      var jsonOutput = gp.textAttribute(names, values)
      var referenceJsonOutput = {
        'extent': 'mocked points',
        'textString': 'expression2',
        'fontSize': 3,
        'fontName': 'expression4',
        'textColor': 'mocked color',
        'horizontalAlignment': 'expression6',
        'string': 'expression7',
        'index': 8
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing rectangle_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      var names = ['extent', 'radius', 'borderPattern']
      var values = ['expression1', 2, 'expression3']
      var jsonOutput = gp.rectangleAttribute(names, values)
      var referenceJsonOutput = {
        'extent': 'mocked points',
        'radius': 2,
        'borderPattern': 'expression3'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing polygon_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      var names = ['points', 'smooth']
      var values = ['expression1', 'expression2']
      var jsonOutput = gp.polygonAttribute(names, values)
      var referenceJsonOutput = {
        'points': 'mocked points',
        'smooth': 'expression2'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing ellipse_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      var names = ['extent', 'startAngle', 'endAngle', 'closure']
      var values = ['expression1', 2, 3, 'expression4']
      var jsonOutput = gp.ellipseAttribute(names, values)
      var referenceJsonOutput = {
        'extent': 'mocked points',
        'startAngle': 2,
        'endAngle': 3,
        'closure': 'expression4'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing bitmap_attribute', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'pointsObj').returns('mocked points')
      sinon.stub(gp, 'graIteFilShaObjs').returns('mocked gra_ite_fil_sha_obj')
      var names = ['extent', 'fileName', 'imageSource']
      var values = ['expression1', 'expression2', 'expression3']
      var jsonOutput = gp.bitmapAttribute(names, values)
      var referenceJsonOutput = {
        'extent': 'mocked points',
        'fileName': 'expression2',
        'imageSource': 'expression3'
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing name_attribute_pair', function () {
    mo.it('testing structure', function () {
      sinon.stub(gp, 'locations').returns([5, 18, 31])
      sinon.stub(gp, 'ellipseAttribute').returns('mocked ellipse_attribute')
      var rawJson = 'name1=value1,name2=value2,name3=value3'
      var jsonOutput = gp.nameAttributePair(rawJson)
      var referenceJsonOutput = {
        'names': ['name1', 'name2', 'name3'],
        'values': ['value1', 'value2', 'value3']
      }
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
  mo.describe('testing locations', function () {
    mo.it('testing structure', function () {
      var substr = '='
      var str = 'name1=value1,name2=value2,name3=value3'
      var jsonOutput = gp.locations(substr, str)
      var referenceJsonOutput = [5, 18, 31]
      as.equal(equalObjects(jsonOutput, referenceJsonOutput), true, 'expected =' + JSON.stringify(referenceJsonOutput) + '; actual =' + JSON.stringify(jsonOutput))
    })
  })
})
