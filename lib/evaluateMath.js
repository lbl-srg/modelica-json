/**
 * Further simplify the json representation through evaluating the parameter assignment
 *
 * @param data data set of simplified json representation
 * @param evaExp flag to check if evaluate expression
 * @return json output with evaluated parameters and expressions
 */
function evaluateParExp (data, evaExp) {
  // create a working data set
  var workDataSet = JSON.parse(JSON.stringify(data))
  // ----------- Evaluate entry model -----------
  var entData = workDataSet[0]
  var pubPar = (entData.public && entData.public.parameters) ? entData.public.parameters : null
  var proPar = (entData.protected && entData.protected.parameters) ? entData.protected.parameters : null
  // evaluate the protected parameter that has assigned value
  var filProPar = proPar ? proPar.filter(function (obj) { return obj.value }) : null
  // all classes
  var pubMod = (entData.public && entData.public.models) ? entData.public.models : null
  var proMod = (entData.protected && entData.protected.models) ? entData.protected.models : null
  // all interfaces
  var inpCla = (entData.public && entData.public.inputs) ? entData.public.inputs : null
  var outCla = (entData.public && entData.public.outputs) ? entData.public.outputs : null
  // evaluate parameter sections
  var allPar = [].concat(pubPar).concat(filProPar).filter(function (obj) { return obj })
  var newPar = (allPar.length > 0) ? evaluatePar(allPar) : null
  // evaluate class instantiations
  var allMod = [].concat(pubMod).concat(proMod).filter(function (obj) { return obj })
  var newCla = (allMod.length > 0) ? evaluateCla(allMod, newPar, workDataSet, evaExp) : null

  // evaluate interface classes
  var allInt = [].concat(inpCla).concat(outCla).filter(function (obj) { return obj })
  var newInt = (allInt.length > 0) ? evaluateCla(allInt, newPar, workDataSet, evaExp) : null

  // remove parameters as they have been propagated to the classes
  if (workDataSet[0].public && workDataSet[0].public.parameters) {
    delete workDataSet[0].public.parameters
  }
  if (workDataSet[0].protected && workDataSet[0].protected.parameters) {
    delete workDataSet[0].protected.parameters
  }
  // data[0] = workDataSet[0]
  // --------------------------------------------
  // ----------- Find parameters value of the sub classes -----------
  var valueList = {}
  propagateValue(newCla, data[0].topClassName, undefined, data, valueList)
  propagateValue(newInt, data[0].topClassName, undefined, data, valueList)
  data[0] = workDataSet[0]
  data[0]['value_propagation'] = valueList
}

/**
 * Find the list of the propagated values
 *
 * @param classSet set of the classes with the modifications that the parameter values have been evaluated
 * @param className path of the class that instantiates the classes in the classSet
 * @param insName the name when the className being instantiated
 * @param data original simplified json data set
 * @param valueList existing list of the parameters value
 */
function propagateValue (classSet, className, insName, data, valueList) {
  if (classSet === null || (classSet !== null && classSet.length === 0)) {
    return null
  }
  // create a working data set
  var workDataSet = JSON.parse(JSON.stringify(data))
  for (var i = 0; i < classSet.length; i++) {
    var tempSet = classSet[i]
    if (tempSet.className.startsWith('Modelica.')) {
      continue
    }
    var temBoo = {}
    var newInsNam = (insName === undefined) ? tempSet.name : (insName + '.' + tempSet.name)
    // add enable condition
    if (tempSet.instantiate) {
      var enableParName = newInsNam + '.' + 'instantiate'
      temBoo['name'] = enableParName
      temBoo['value'] = tempSet.instantiate
      addBooParameter(valueList, temBoo)
      if (tempSet.instantiate === 'false') {
        continue
      }
    }
    if (tempSet.className.includes('CDL.Interfaces')) { continue }
    // find the corresponded class object
    var curCla = data.filter(function (obj) { return tempSet.className === obj.topClassName })
    // create working set
    var workSet = JSON.parse(JSON.stringify(curCla))[0]
    // evaluate the parameters value
    var newPar
    if (tempSet.modifications) {
      var modVal = tempSet.modifications.filter(function (obj) { return obj.value })
      // propagate the values
      newPar = (modVal.length === 0) ? null : passValue(tempSet.modifications, workSet)
    } else {
      // evaluate the default values
      var pubPar = (workSet.public && workSet.public.parameters) ? workSet.public.parameters : null
      var proPar = (workSet.protected && workSet.protected.parameters) ? workSet.protected.parameters : null
      // evaluate the protected parameter that has assigned value
      var filProPar = proPar ? proPar.filter(function (obj) { return obj.value }) : null
      // evaluate parameter sections
      var allPar = [].concat(pubPar).concat(filProPar).filter(function (obj) { return obj })
      newPar = (allPar.length > 0) ? evaluatePar(allPar) : null
    }
    // add the evaluted parameters value to list
    if (newPar) {
      newPar.forEach(function (obj) {
        var newObj = JSON.parse(JSON.stringify(obj))
        var proParNam = newInsNam + '.' + newObj.name
        newObj.name = proParNam
        var parType = newObj.type ? newObj.type : newObj.className
        if (parType === 'Real') {
          addRealParameter (valueList, newObj)
        }  else if (parType === 'Boolean') {
          addBooParameter (valueList, newObj)
        } else {
          addEnumParameter (valueList, parType, newObj)
        }
      })
    }
    // evaluate class instantiations
    if (workSet.topClassName.includes('OBC.CDL')) { continue }
    var pubMod = (workSet.public && workSet.public.models) ? workSet.public.models : null
    var proMod = (workSet.protected && workSet.protected.models) ? workSet.protected.models : null
    var allMod = [].concat(pubMod).concat(proMod).filter(function (obj) { return obj })
    if (allMod.length > 0) {
      var newCla = evaluateCla(allMod, newPar, workDataSet, true)
      propagateValue(newCla, tempSet.className, newInsNam, data, valueList)
    }
  }
}

/**
 * Add boolean object to propagation list
 * 
 * @param valueList value propagation list
 * @param temBoo object of boolean parameter
 */
function addBooParameter (valueList, temBoo) {
  var sortBoo = {}
  sortBoo['name'] = temBoo['name']
  sortBoo['value'] = temBoo['value']
  if (valueList.Boolean) {
    valueList.Boolean.push(sortBoo)
  } else {
    var temp = []
    temp.push(sortBoo)
    valueList['Boolean'] = temp
  }
}

/**
 * Add real object to propagation list
 * 
 * @param valueList value propagation list
 * @param tempReal object of real parameter
 */
function addRealParameter (valueList, tempReal) {
  var sortReal = {}
  sortReal['name'] = tempReal['name']
  sortReal['value'] = Number(tempReal['value'])
  // sortReal['min'] = tempReal['min'] ? Number(tempReal['min']['value']) : undefined
  sortReal['min'] = tempReal['min'] ? tempReal['min']['value'] : undefined
  sortReal['max'] = tempReal['max'] ? Number(tempReal['max']['value']) : undefined
  sortReal['quantity'] = tempReal['quantity']
  sortReal['unit'] = tempReal['unit']
  sortReal['displayUnit'] = tempReal['displayUnit']
  sortReal['fixed'] = tempReal['fixed']
  sortReal['start'] = tempReal['start']
  if (valueList.Real) {
    valueList.Real.push(sortReal)
  } else {
    var temp = []
    temp.push(sortReal)
    valueList['Real'] = temp
  }
}

/**
 * Add enumeration object to propagation list
 * 
 * @param valueList value propagation list
 * @param parType enumeration type
 * @param tempEnum object of enumeration parameter
 */
function addEnumParameter (valueList, parType, tempEnum) {
  var sortEnum = {}
  sortEnum['name'] = tempEnum['name']
  sortEnum['type'] = parType
  sortEnum['value'] = tempEnum['value']
  if (valueList.Enumeration) {
    valueList.Enumeration.push(sortEnum)
  } else {
    var temp = []
    temp.push(sortEnum)
    valueList['Enumeration'] = temp
  }
}


/**
 * Pass the parameters value from top class to sub class
 *
 * @param modificatons parameter values passing from top class
 * @param workSet json object of the class
 */
function passValue (modificatons, workSet) {
  // update the parameter values which can only happen to the public one
  var pubPar = workSet.public.parameters
  var proPar = (workSet.protected && workSet.protected.parameters) ? workSet.protected.parameters : null
  // evaluate the protected parameter that has assigned value
  var filProPar = proPar ? proPar.filter(function (obj) { return obj.value }) : null
  for (var i = 0; i < modificatons.length; i++) {
    var tempMod = modificatons[i]
    var tempPar = pubPar.filter(function (obj) { return tempMod.name === obj.name })[0]
    if (tempPar.value) {
      tempPar.value = tempMod.value
    } else {
      tempPar['value'] = tempMod.value
    }
  }
  // evaluate parameter sections
  var allPar = [].concat(pubPar).concat(filProPar).filter(function (obj) { return obj })
  var newPar = (allPar.length > 0) ? evaluatePar(allPar) : null
  return newPar
}

/**
 * Evaluate value of the string expression
 *
 * @param expression
 */
function evaluate (expression) {
  var func = new Function('"use strict"; return ' + expression)
  return func()
}

/**
 * Evaluate the instantiated classes
 *
 * @param allMod json objects of classes, including public and protected classes
 * @param allPar parameters that have been evaluated
 * @param data entire simplified json data
 * @param evaExp flag to check if evaluate expression
 */
function evaluateCla (allMod, allPar, data, evaExp) {
  const evaMod = []
  // remove the Boolean, Real and Integer class
  var filMod = allMod.filter(function (obj) {
    var className = obj.className
    return !(className === 'Boolean' || className === 'Real' || className === 'Integer')
  })
  filMod.forEach(function (obj) {
    var claNam = obj.className
    if (!claNam.includes('CDL.Interfaces')) {
      if (obj.modifications) {
        var valueMod = obj.modifications.filter(function (subObj) { return subObj.value })
        if (valueMod.length > 0 && !claNam.startsWith('Modelica.')) {
          var addTypMod = addParameterType(valueMod, claNam, data)
          evaluateClassPar(addTypMod, allPar, evaExp)
        }
      }
    }
    // evaluate boolean expression for enabling instance
    if (obj.instantiate) {
      obj.instantiate = expressionValue('Boolean', obj.instantiate, allPar, evaExp)
    }
    evaMod.push(obj)
  })
  return evaMod
}

/**
 * Add the types of the specified parameters
 *
 * @param classModification list of the parameters being specified
 * @param claNam class name
 * @param allData entire simplified json data
 * @return new list of specified parametere with the type being added
 */
function addParameterType (classModification, claNam, allData) { 
  // find the model object of the instance
  var modObj = allData.filter(function (obj) { return claNam === obj.topClassName })
  var pubPar = modObj[0].public.parameters
  var newMod = []
  for (var i = 0; i < classModification.length; i++) {
    var tempMod = classModification[i]
    var parNam = tempMod.name
    for (var j = 0; j < pubPar.length; j++) {
      if (parNam === pubPar[j].name) {
        tempMod['type'] = pubPar[j].type ? pubPar[j].type : pubPar[j].className
      }
    }
    newMod.push(tempMod)
  }
  return newMod
}

/**
 * Evaluate parameters of the instantiated classes
 *
 * @param classModification list of the parameters being specified
 * @param allPar parameters that have been evaluated
 * @param evaExp flag to check if evaluate expression
 */
function evaluateClassPar (classModification, allPar, evaExp) {
  classModification.forEach(function (obj) {
    var type = obj.type ? obj.type : obj.className
    if (!checkType(type, obj.value)) {
      var newVal = expressionValue(type, obj.value, allPar, evaExp)
      obj.value = newVal
    // check if the parameter type is enumerator
    } else if (type.includes('.')) {
      // if the class parameter is propagated
      if (!obj.value.includes('.')) {
        var enuPar = allPar.filter(function (par) {
          return obj.value === par.name
        })
        obj.value = enuPar[0].value
      }
    }
  })
}

/**
 * Evaluate the parameters that are specified by expression
 *
 * @param allPar json objects of parameters, including public and protected parameters
 */
function evaluatePar (allPar) {
  const evaPar = []
  allPar.forEach(function (obj) {
    // note that the parameter may not have default value so that obj.value will be undefined
    var type = obj.type ? obj.type : obj.className
    if (!checkType(type, obj.value)) {
      // find the new value expression that do not refer to any parameter names but only their values
      var newVal = expressionValue(type, obj.value, allPar, true)
      obj.value = newVal
    }
    evaPar.push(obj)
  })
  return evaPar
}

/**
 * Find expression value or the new expression
 *
 * @param type parameter type, e.g. Real, Integer, Boolean
 * @param valExp value expression
 * @param allPar list of all parameters
 * @param evaExp flag to check if evaluate expression
 * @return evaluated value or the new expression
 */
function expressionValue (type, valExp, allPar, evaExp) {
  var noLineBreak = valExp.replace(/\n/g, ' ')
  var newValExp = findNewExpression(type, noLineBreak, allPar)
  if (evaExp) {
    var newVal
    if (newValExp.includes('if ') && newValExp.includes('then ')) {
      newVal = evaluateCondition(newValExp, type)
    } else {
      if (type === 'Boolean') {
        newVal = evaluateBoolean(newValExp)
      } else if (type === 'Integer') {
        newVal = evaluate(newValExp).toFixed(0)
      } else if (type === 'Real') {
        newVal = Number(evaluate(newValExp).toFixed(4)).toString()
      } else {
        newVal = newValExp
      }
    }
    return newVal
  } else {
    return newValExp
  }
}

/**
 * Find the conditional expression value
 *
 * @param valExp conditional value expression, in the form as "if ... then ... else ..."
 * @param type output value type, Real, Boolean, Integer, String, Enumerator
 */
function evaluateCondition (valExp, type) {
  var thenInd = valExp.indexOf(' then ')
  var elseInd = valExp.indexOf(' else ', thenInd)
  var conditionStr = valExp.substring(3, thenInd).trim()
  var condition
  if (conditionStr.includes('==') || conditionStr.includes('<>')) {
    condition = evaluate(evaluateBoolean(conditionStr))
  } else {
    condition = evaluate(conditionStr)
  }
  var trueVale = valExp.substring(thenInd + 6, elseInd).trim()
  var falseValue = valExp.substring(elseInd + 6).trim()
  var finVal
  if (type === 'Boolean') {
    finVal = (condition ? evaluate(trueVale) : evaluate(falseValue)).toString()
  } else if (type === 'Integer') {
    finVal = (condition ? evaluate(trueVale) : evaluate(falseValue)).toFixed(0)
  } else if (type === 'Real') {
    finVal = (condition ? Number(evaluate(trueVale)).toString() : Number(evaluate(falseValue)).toFixed(4)).toString()
  } else {
    finVal = condition ? trueVale : falseValue
  }
  return finVal
}

/**
 * Check if the parameter value is specified by mathematic expresson. This function can only check the Real, Integer and Boolean
 * parameter, not the types like "Buildings.Controls.OBC.CDL.Types.xxx", "Buildings.Controls.OBC.ASHRAE.G36_PR1.Types.xxx".
 *
 * @param parType specified parameter type
 * @param parVal specified parameter value
 * @return boolean to indicate if the value is not specified as expression
 */
function checkType (parType, parVal) {
  if (parType === 'Real') {
    // check if the value is only composed by number
    return /^\d+\.\d+$/.test(parVal)
  } else if (parType === 'Integer') {
    return (/^\d+\.\d+$/.test(parVal)) || parVal.includes('.')
  } else if (parType === 'Boolean') {
    return parVal === 'true' || parVal === 'false'
  } else if (parType.includes('.')) {
    return parVal.includes('.') && !parVal.includes('if ')
  } else {
    return true
  }
}

/**
 * Find new value expression that do not refer to any parameter names
 *
 * @param valType parameter type, e.g. Real, Integer, Boolean
 * @param valExp the value expression
 * @param allPar entire set of the parameter
 * @return updated expression
 */
function findNewExpression (valType, valExp, allPar) {
  const newSet = []
  var re
  var splitSet
  var noSubExpression = true
  var inLineBoo = valExp.includes('abs(') || valExp.includes('<') || valExp.includes('>')
  if (valType === 'Real' || valType === 'Integer') {
    re = /(\s*[+-/*[\]()\s]\s*)/g
  } else if (valType === 'Boolean' && inLineBoo) {
    re = /(abs|\(|\)|<|>|\s)/g
  } else {
    re = /(<>|==|\sor\s|\sand\s|not\s|\s)/g
  }
  splitSet = valExp.split(re)
  // find the parameters used in the value expression
  for (var i = 0; i < splitSet.length; i++) {
    var tmpStr = splitSet[i]
    var newValue = tmpStr
    for (var j = 0; j < allPar.length; j++) {
      var tmpPar = allPar[j]
      if (tmpStr === tmpPar.name) {
        // check if the used parameter itself is specified by expression
        var type = tmpPar.type ? tmpPar.type : tmpPar.className
        noSubExpression = checkType(type, tmpPar.value)
        newValue = tmpPar.value
      }
    }
    newSet.push(newValue)
  }
  // new expression that the used parameters are replaced by their values
  var newExpression = newSet.join('')
  // if the new expression still refers other parameters, then recursively to find the expression that don't refer to any parameter name
  if (!noSubExpression) {
    newExpression = findNewExpression(valType, newExpression, allPar)
  }
  return newExpression
}

/**
 * Evaluate Modelica boolean expression
 *
 * @param moBooExp Boolean expression in modelica
 */
function evaluateBoolean (moBooExp) {
  var moBooOp = ['==', '<>', ' or ', ' and ', 'not ']
  var jsBooOp = [' === ', ' !== ', ' || ', ' && ', ' !']
  var revStr = moBooExp
  var re
  var reTemp = new RegExp('ttttt', 'g')
  // replace the modelica logical operators with the JavaScript logical operators
  for (var i = 0; i < moBooOp.length; i++) {
    re = new RegExp(moBooOp[i], 'g')
    var tempStr = revStr.replace(re, 'ttttt')
    var newStr = tempStr.replace(reTemp, jsBooOp[i])
    revStr = newStr
  }
  // make left and right side of the '===' and '!==' to be string
  var addQuoteStr = stringifyEqu(revStr)
  var absRe = new RegExp('abs\\(', 'g')
  var addMath = addQuoteStr.replace(absRe, 'Math.abs(')
  return evaluate(addMath).toString()
}

/**
 * Add quote to the right and left element of the '===' and '!=='
 *
 * @param inString input string
 */
function stringifyEqu (inString) {
  var equNot = ['===', '!==']
  var spaInd = indexOfAll(inString, ' ')
  var newStr = inString
  for (var l = 0; l < 2; l++) {
    if (newStr.includes(equNot[l])) {
      // find position index of '===' or '!=='
      var subString = []
      var posInd = indexOfAll(newStr, equNot[l])
      for (var i = 0; i < posInd.length; i++) {
        var curInd = posInd[i]
        // find the space position indices front and after the note
        var frontSpace = []
        var afterSpace = []
        for (var j = 0; j < spaInd.length; j++) {
          var curSpaInd = spaInd[j]
          if (curSpaInd < curInd) {
            frontSpace.push(curSpaInd)
          } else {
            afterSpace.push(curSpaInd)
          }
        }
        var front = findString(curInd, frontSpace, newStr, 'front')
        var after = findString(curInd, afterSpace, newStr, 'after')
        subString.push(front)
        subString.push(after)
      }
      // remove duplicate items
      subString = subString.filter(function (item, pos) { return subString.indexOf(item) === pos })
      // add quote to the strings
      var quoteString = addQuote(subString)
      newStr = createNewString(subString, quoteString, newStr)
    }
  }
  return newStr
}

/**
 * Find all index of substring in a string
 *
 * @param inStr string
 * @param subStr substring
 * @return array of index of the occurance of substring in string
 */
function indexOfAll (inStr, subStr) {
  var startIndex = 0
  var posInd = []
  while (1) {
    var pos = inStr.indexOf(subStr, startIndex)
    if (pos < 0) {
      break
    }
    posInd.push(pos)
    startIndex = pos + 1
  }
  return posInd
}

/**
 *
 * @param noteInd position index of '===' or '!=='
 * @param spaceIndex position indices array of space
 * @param inString full string
 * @param position flag to check substring that is in front of or after note
 */
function findString (noteInd, spaceIndex, inString, position) {
  var res
  var updInd = (position === 'front') ? noteInd : (noteInd + 3)
  var endInd = (position === 'front') ? 0 : inString.length
  var checkSpaInd = (position === 'front') ? spaceIndex.reverse() : spaceIndex
  for (var i = 0; i < checkSpaInd.length; i++) {
    var curSpaInd = checkSpaInd[i]
    if (curSpaInd === updInd) { continue }
    res = inString.substring(curSpaInd, updInd).trim()
    if (res.length > 0) {
      break
    }
  }
  if (res === undefined || res.length === 0) {
    res = inString.substring(endInd, updInd).trim()
  }
  return res
}

/**
 * Add quote to string
 *
 * @param strArr array of string
 */
function addQuote (strArr) {
  var newArr = []
  strArr.forEach(function (obj) {
    var lasInd = obj.length - 1
    if (obj[0] === '"' && obj[lasInd] === '"') {
      newArr.push(obj)
    } else {
      newArr.push('"' + obj + '"')
    }
  })
  return newArr
}

/**
 *
 * @param oldSub array of substrings existing in inStr
 * @param newSub array of the new substrings
 * @param inStr string in which the old substring will be replaced by the new substring
 */
function createNewString (oldSub, newSub, inStr) {
  // sort the array according to the length of element, in decending order
  oldSub.sort(function (a, b) { return b.length - a.length })
  newSub.sort(function (a, b) { return b.length - a.length })
  var numSubStr = oldSub.length
  var radStr = []
  for (var i = 0; i < numSubStr; i++) {
    radStr.push('-' + Math.random().toString(36).substr(2, 5) + '-')
  }
  for (var j = 0; j < numSubStr; j++) {
    var re1 = new RegExp(oldSub[j], 'g')
    inStr = inStr.replace(re1, radStr[j])
  }
  for (var k = 0; k < numSubStr; k++) {
    var re2 = new RegExp(radStr[k], 'g')
    inStr = inStr.replace(re2, newSub[k])
  }
  return inStr
}

module.exports.evaluateParExp = evaluateParExp
