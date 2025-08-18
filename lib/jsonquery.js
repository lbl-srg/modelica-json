const ut = require('../lib/util.js')
const graPri = require('../lib/graphicalPrimitives.js')

/**
 * Retrieves the value of a nested property from an object.
 * If the object has dublicated properties, only the last one is returned.
 *
 * @param {Array<(number|string)>} p - An array of strings representing the path to the property.
 * @param {Object} o - The object from which to retrieve the property.
 * @returns {*} The value of the nested property, or null if any part of the path is not found.
 * @example
 * // returns 3
 * getProperty(['foo', 'foz', 2], { foo: { foz: [1, 2, 3] }});
 */
const getProperty = (p, o) => p.reduce((xs, x) => xs?.[x] ?? null, o)

/**
 * Finds and returns all nested objects within an entire object that contain a specific key-value pair.
 * If no value is provided, the function will return all objects (or values) for the given key.
 *
 * @param {Object} entireObj - The object to search within.
 * @param {string} keyToFind - The key to look for in the nested objects.
 * @param {*=} valToFind - The value that the key should have in the nested objects.
 * @returns {!Array<Object>} An array of objects that contain the specified key-value pair.
 * @example
 * // returns [ { foz: true } ]
 * findNestedObjects([{ foo: { foz: true  }}, {foo: { foz: false  }}], 'foz', true);
 * @example
 * // returns [ true, false ]
 * findNestedObjects([{ foo: { foz: true  }}, {foo: { foz: false  }}], 'foz')
 * @example
 * // returns [ [ { final: true } ] ]
 * jsonQuery.findNestedObjects({ foo: { element_list: [ { final: true } ] }}, 'element_list')
 */
function findNestedObjects (entireObj, keyToFind, valToFind = undefined) {
  const foundObjects = []
  JSON.stringify(entireObj, (key, val) => {
    if ((valToFind && val && val[keyToFind] === valToFind) ||
      (!valToFind && key === keyToFind)) {
      foundObjects.push(val)
    }
    return val
  })
  return foundObjects
};

/**
 * Get the simplified json (not raw) representation for the model
 *
 * @param model raw-json output from the Java-Antlr parsing
 */
function simplifyModelicaJSON (model) {
  const within = model.within ? model.within : ''
  const finalDef = model.final_class_definitions ? model.final_class_definitions : []
  const claDefArr = []
  for (let i = 0; i < finalDef.length; i++) {
    const obj = finalDef[i]
    const final = obj.is_final ? true : undefined
    const claDef = this.classDefinition(obj.class_definition)
    claDefArr.push(Object.assign({ final }, claDef))
  }
  return Object.assign(
    { within },
    { stored_class_definitions: claDefArr },
    { modelicaFile: model.modelicaFile },
    { fullMoFilePath: model.fullMoFilePath },
    { checksum: model.checksum })
}

function classDefinition (claDef) {
  const encapsulated = claDef.encapsulated
  const classPrefixes = claDef.class_prefixes
  const classSpecifierObj = this.classSpecifier(claDef.class_specifier)
  return Object.assign(
    { encapsulated: encapsulated || undefined },
    { class_prefixes: classPrefixes },
    { class_specifier: classSpecifierObj }
  )
}

/**
 * Get the simplified json representation for the class_specifier object
 *
 * @param claSpe class_specifier value
 */
function classSpecifier (claSpe) {
  const longClass = claSpe.long_class_specifier
  const shortClass = claSpe.short_class_specifier
  const derClass = claSpe.der_class_specifier
  if (longClass || shortClass || derClass) {
    return longClass
      ? (Object.assign({ long_class_specifier: this.longClassSpecifier(longClass) }))
      : (shortClass
          ? (Object.assign({ short_class_specifier: this.shortClassSpecifier(shortClass) }))
          : (Object.assign({ der_class_specifier: this.derClassSpecifier(derClass) })))
  }
  throw new Error('one of long_class_specifier or short_class_specifier or der_class_specifier must be present in class_specifier')
}

/**
 * Get the simplified json representation for the long_class_specifier object
 *
 * @param lonClaSpe long_class_specifier value
 */
function longClassSpecifier (lonClaSpe) {
  let ident = null
  if (lonClaSpe.identifier) {
    ident = lonClaSpe.identifier
  } else {
    throw new Error('missing identifier')
  }
  const desStr = this.trimDesString(lonClaSpe.string_comment)
  if (!desStr) {
    // console.warn('missing description string')
  }
  let comp = null
  if (lonClaSpe.composition) {
    comp = this.composition(lonClaSpe.composition)
  } else {
    throw new Error('missing composition')
  }
  const ext = lonClaSpe.is_extends
  const claMod = lonClaSpe.class_modification
  const claModObj = claMod ? this.classModification(claMod) : undefined
  return Object.assign(
    { identifier: ident },
    { description_string: desStr },
    { composition: !ut.isEmptyObject(comp) ? comp : undefined },
    { extends: ext || undefined },
    { class_modification: claModObj })
}

/**
 * Get the simplified json representation for the composition object
 *
 * @param com composition value
 */
function composition (com) {
  if (!com.element_list) {
    throw new Error('missing element_list')
  }
  const eleLisObj = com.element_list
  const eleLis = !ut.isEmptyObject(eleLisObj) ? this.elementList(com.element_list) : undefined
  const eleSecObj = com.element_sections
  const eleSec = (eleSecObj.length > 0) ? this.elementSections(com.element_sections) : undefined
  const extCom = com.external_composition
  const extComObj = extCom ? this.externalComposition(extCom) : undefined
  const ann = com.annotation ? com.annotation.class_modification : null
  const annObj = ann ? this.classModification(ann) : undefined
  return Object.assign(
    { element_list: eleLis },
    { element_sections: eleSec },
    { external_composition: extComObj },
    { annotation: (annObj === '()') ? undefined : annObj })
}

/**
 * Get the simplified json representation for the element_list object
 *
 * @param eleLis element_list value
 */
function elementList (eleLis) {
  const ele = eleLis.elements
  const eleArr = []
  for (let i = 0; i < ele.length; i++) {
    const obj = ele[i]
    const impCla = obj.import_clause
    const extCla = obj.extends_clause
    const redeclare = obj.redeclare
    const final = obj.is_final
    const inner = obj.inner
    const outer = obj.outer
    const replaceable = obj.replaceable
    const conCla = obj.constraining_clause
    if (!replaceable && conCla) {
      throw new Error('cannot have constraining_clause without replaceable')
    }
    const claDef = obj.class_definition
    const comCla = obj.component_clause
    const des = obj.comment
    const desObj = des ? this.description(des) : undefined
    eleArr.push(Object.assign(
      { import_clause: impCla ? this.importClause(impCla) : undefined },
      { extends_clause: extCla ? this.extendsClause(extCla) : undefined },
      { redeclare: redeclare || undefined },
      { final: final || undefined },
      { inner: inner || undefined },
      { outer: outer || undefined },
      { replaceable: replaceable || undefined },
      { constraining_clause: conCla ? this.constrainingClause(conCla) : undefined },
      { class_definition: claDef ? this.classDefinition(claDef) : undefined },
      { component_clause: comCla ? this.componentClause(comCla) : undefined },
      { description: !ut.isEmptyObject(desObj) ? desObj : undefined }))
  }
  return eleArr
}

/**
 * Get the simplified json representation for the import_clause object
 *
 * @param impCla import_clause value
 */
function importClause (impCla) {
  const identifier = impCla.identifier
  const name = impCla.name
  const dotSta = impCla.dot_star
  const impLis = impCla.import_list
  const comment = impCla.comment
  const desObj = comment ? this.description(comment) : undefined
  return Object.assign(
    { identifier },
    { name: name ? this.nameString(name) : undefined },
    { dot_star: dotSta ? '.*' : undefined },
    { import_list: impLis ? this.importList(impLis) : undefined },
    { description: !ut.isEmptyObject(desObj) ? desObj : undefined }
  )
}

/**
 * Get the string of the import_list object
 *
 * @param impLis import_list value
 */
function importList (impLis) {
  const ideLis = impLis.identifier_list
  return ideLis.join(',')
}

/**
 * Get the simplified json representation for the description object
 *
 * @param des description value
 */
function description (des) {
  const strDes = this.trimDesString(des.string_comment)
  if (!strDes) {
    // console.warn('missing description string')
    // throw new Error('missing description string')
  }
  const ann = des.annotation ? des.annotation.class_modification : null
  const annotation = ann ? this.classModification(ann) : undefined
  return Object.assign(
    { description_string: strDes },
    { annotation: (annotation === '()') ? undefined : annotation }
  )
}

function trimDesString (strCom) {
  const str = (strCom === '') ? undefined : strCom
  const triStr = str ? str.trim() : undefined
  if (triStr === undefined) {
    return undefined
  }
  if (triStr[0] === '"') {
    return triStr.substr(1, triStr.length - 2)
  }
  return triStr
}

/**
 * Get the simplified json representation for the extends_clause object
 *
 * @param extCla extends_clause value
 */
function extendsClause (extCla) {
  const name = extCla.name
  const claMod = extCla.class_modification
  const ann = extCla.annotation ? extCla.annotation.class_modification : null
  const annotation = ann ? this.classModification(ann) : undefined
  return Object.assign(
    { name: name ? this.nameString(name) : undefined },
    { class_modification: claMod ? this.classModification(claMod) : undefined },
    { annotation: (annotation === '()') ? undefined : annotation }
  )
}

/**
 * Get the simplified json representation for the constraining_clause object
 *
 * @param conCla constraining_clause value
 */
function constrainingClause (conCla) {
  const name = conCla.name
  const claMod = conCla.class_modification
  return Object.assign(
    { name: name ? this.nameString(name) : undefined },
    { class_modification: claMod ? this.classModification(claMod) : undefined }
  )
}

/**
 * Get the simplified json representation for the component_clause object
 *
 * @param comCla component_clause value
 */
function componentClause (comCla) {
  const prefix = comCla.type_prefix
  const typSpe = comCla.type_specifier
  const arrSub = comCla.array_subscripts
  const comLis = comCla.component_list
  return Object.assign(
    { type_prefix: prefix },
    { type_specifier: this.typeSpecifier(typSpe) },
    { array_subscripts: arrSub ? this.arraySubscripts(arrSub) : undefined },
    { component_list: comLis ? this.componentList(comLis) : undefined }
  )
}

/**
 * Get the simplified json representation for the type_specifier object
 *
 * @param typSpe type_specifier value
 */
function typeSpecifier (typSpe) {
  const name = typSpe.name
  return this.nameString(name)
}

/**
 * Get the simplified json representation for the array_subscripts object
 *
 * @param arrSub array_subscripts value
 */
function arraySubscripts (arrSub) {
  const eleArr = []
  const subscripts = arrSub.subscripts
  for (let i = 0; i < subscripts.length; i++) {
    const obj = subscripts[i]
    const exp = obj.expression
    const colOp = obj.colon_op
    eleArr.push(Object.assign(
      { colon_op: colOp || undefined },
      { expression: exp ? this.expression(exp) : undefined }
    ))
  }
  return eleArr
}

/**
 * Get the simplified json representation for the expression object
 *
 * @param expObj expression value
 */
function expression (expObj) {
  const simExp = expObj.simple_expression
  const ifExp = expObj.if_expression
  const ifExpObj = ifExp ? this.ifExpression(ifExp) : undefined
  return Object.assign(
    { simple_expression: simExp ? this.simpleExpression(simExp) : undefined },
    { if_expression: !ut.isEmptyObject(ifExpObj) ? ifExpObj : undefined }
  )
}

/**
 * Get the simplified json representation for the if_expression object
 *
 * @param ifExp if_expression value
 */
function ifExpression (ifExp) {
  const ifEls = ifExp.if_elseif
  const elsExp = ifExp.else_expression
  const ifElsArr = []
  for (let i = 0; i < ifEls.length; i++) {
    const obj = ifEls[i]
    const con = obj.condition
    const then = obj.then
    ifElsArr.push(Object.assign(
      { condition: con ? this.expression(con) : undefined },
      { then: then ? this.expression(then) : undefined }
    ))
  }
  return Object.assign(
    { if_elseif: (ifElsArr.length > 0) ? ifElsArr : undefined },
    { else_expression: elsExp ? this.expression(elsExp) : undefined }
  )
}

/**
 * Get the simplified json representation for the component_list object
 *
 * @param comLis component_list value
 */
function componentList (comLis) {
  const compList = comLis.component_declaration_list
  const decLisArr = []
  for (let i = 0; i < compList.length; i++) {
    const obj = compList[i]
    const dec = obj.declaration
    const conAtt = obj.condition_attribute
    const com = obj.comment
    const comObj = com ? this.description(com) : undefined
    decLisArr.push(Object.assign(
      { declaration: dec ? this.declaration(dec) : undefined },
      { condition_attribute: conAtt ? { expression: this.expression(conAtt.expression) } : undefined },
      { description: !ut.isEmptyObject(comObj) ? comObj : undefined }
    ))
  }
  return decLisArr
}

/**
 * Get the simplified json representation for the declaration object
 *
 * @param dec declaration value
 */
function declaration (dec) {
  const ident = dec.identifier
  const arrSub = dec.array_subscripts
  const mod = dec.modification
  return Object.assign(
    { identifier: ident },
    { array_subscripts: arrSub ? this.arraySubscripts(arrSub) : undefined },
    { modification: mod ? this.modification(mod) : undefined }
  )
}

/**
 * Get the simplified json representation for the modification object
 *
 * @param mod modification value
 */
function modification (mod) {
  const claMod = mod.class_modification
  const equ = mod.equal
  const colEqu = mod.colon_equal
  const exp = mod.expression
  return Object.assign(
    { class_modification: claMod ? this.classModification(claMod) : undefined },
    { equal: equ || undefined },
    { colon_equal: colEqu || undefined },
    { expression: exp ? this.expression(exp) : undefined }
  )
}

/**
 * Get the simplified json representation for the class_modification object
 *
 * @param claMod class_modification value
 */
function classModification (claMod) {
  const argLis = claMod.argument_list
  if (argLis) {
    const claModArr = []
    const args = argLis.arguments
    for (let i = 0; i < args.length; i++) {
      const ele = args[i]
      const eleModRep = ele.element_modification_or_replaceable
      const eleRed = ele.element_redeclaration
      // var eleModRepDict = {
      //   'element_modification_or_replaceable': eleModRep ? this.elementModificationReplaceable(eleModRep) : undefined
      // }
      // var eleRedDict = {
      //   'element_redeclaration': eleRed ? this.elementRedeclaration(eleRed) : undefined
      // }
      claModArr.push(Object.assign(
        { element_modification_or_replaceable: eleModRep ? this.elementModificationReplaceable(eleModRep) : undefined },
        { element_redeclaration: eleRed ? this.elementRedeclaration(eleRed) : undefined }
      ))
    }
    return claModArr
  } else {
    return '()'
  }
}

/**
 * Get the simplified json representation for the element_modification_or_replaceable object
 *
 * @param eleModRep element_modification_or_replaceable value
 */
function elementModificationReplaceable (eleModRep) {
  const each = eleModRep.each
  const final = eleModRep.is_final
  const eleMod = eleModRep.element_modification
  const eleRep = eleModRep.element_replaceable
  return Object.assign(
    { each: each || undefined },
    { final: final || undefined },
    { element_modification: eleMod ? this.elementModification(eleMod) : undefined },
    { element_replaceable: eleRep ? this.elementReplaceable(eleRep) : undefined }
  )
}

/**
 * Get the simplified json representation for the element_modification object
 *
 * @param eleMod element_modification value
 */
function elementModification (eleMod) {
  const name = eleMod.name ? this.nameString(eleMod.name) : undefined
  const isGraAnn = name ? graPri.isGraphicAnnotation(name) : undefined
  const mod = eleMod.modification
  const desStr = this.trimDesString(eleMod.string_comment)
  if (!desStr) {
    // console.warn('missing description string')
    // throw new Error('missing description string')
  }
  if (isGraAnn) {
    const graMod = mod ? graPri.graphicAnnotationObj(name, this.modification(mod)) : undefined
    return Object.assign(
      { [name]: graMod }
    )
  } else {
    // the 'name' could be string, or an object for the graphical annotation
    return Object.assign(
      { name },
      { modification: mod ? this.modification(mod) : undefined },
      { description_string: desStr }
    )
  }
}

/**
 * Get the simplified json representation for the element_replaceable object
 *
 * @param eleRep element_replaceable value
 */
function elementReplaceable (eleRep) {
  const shoClaDef = eleRep.short_class_definition
  const comCla1 = eleRep.component_clause1
  const conCla = eleRep.constraining_clause
  return Object.assign(
    { short_class_definition: shoClaDef ? this.shortClassDefinition(shoClaDef) : undefined },
    { component_clause1: comCla1 ? this.componentClause1(comCla1) : undefined },
    { constraining_clause: conCla ? this.constrainingClause(conCla) : undefined }
  )
}

/**
 * Get the simplified json representation for the short_class_definition object
 *
 * @param shoClaDef short_class_definition value
 */
function shortClassDefinition (shoClaDef) {
  const claPre = shoClaDef.class_prefixes
  const shoClaSpe = shoClaDef.short_class_specifier
  return Object.assign(
    { class_prefixes: claPre },
    { short_class_specifier: this.shortClassSpecifier(shoClaSpe) }
  )
}

/**
 * Get the simplified json representation for the component_clause1 object
 *
 * @param comCla1 component_clause1 value
 */
function componentClause1 (comCla1) {
  const typPre = comCla1.type_prefix
  const typSpe = comCla1.type_specifier
  const comDec1 = comCla1.component_declaration1
  return Object.assign(
    { type_prefix: typPre },
    { type_specifier: this.typeSpecifier(typSpe) },
    { component_declaration1: this.componentDeclaration1(comDec1) }
  )
}

/**
 * Get the simplified json representation for the component_declaration1 object
 *
 * @param comDec1 component_declaration1 value
 */
function componentDeclaration1 (comDec1) {
  const dec = comDec1.declaration
  const des = comDec1.comment
  const desObj = des ? this.description(des) : undefined
  return Object.assign(
    { declaration: this.declaration(dec) },
    { description: !ut.isEmptyObject(desObj) ? desObj : undefined }
  )
}

/**
 * Get the simplified json representation for the component_declaration1 object
 *
 * @param comDec1 component_declaration1 value
 */
function elementRedeclaration (eleRed) {
  const each = eleRed.each
  const final = eleRed.is_final
  const shoClaDef = eleRed.short_class_definition
  const comCla1 = eleRed.component_clause1
  const eleRep = eleRed.element_replaceable
  return Object.assign(
    { each: each || undefined },
    { final: final || undefined },
    { short_class_definition: shoClaDef ? this.shortClassDefinition(shoClaDef) : undefined },
    { component_clause1: comCla1 ? this.componentClause1(comCla1) : undefined },
    { element_replaceable: eleRep ? this.elementReplaceable(eleRep) : undefined }
  )
}

/**
 * Get the simplified json representation for the element_sections object
 *
 * @param eleSec element_sections value
 */
function elementSections (eleSec) {
  const secArr = []
  for (let i = 0; i < eleSec.length; i++) {
    const obj = eleSec[i]
    const pubEle = obj.public_element_list
    const proEle = obj.protected_element_list
    const equSec = obj.equation_section
    const algSec = obj.algorithm_section
    secArr.push(Object.assign(
      { public_element_list: pubEle ? this.elementList(pubEle) : undefined },
      { protected_element_list: proEle ? this.elementList(proEle) : undefined },
      { equation_section: equSec ? this.equationSection(equSec) : undefined },
      { algorithm_section: algSec ? this.algorithmSection(algSec) : undefined }
    ))
  }
  return secArr
}

/**
 * Get the simplified json representation for the element_section object
 *
 * @param eleSec element_section value
 */
function equationSection (equSec) {
  const ini = equSec.initial
  const equLis = equSec.equations
  const equArr = []
  for (let i = 0; i < equLis.length; i++) {
    const obj = equLis[i]
    equArr.push(this.equation(obj))
  }
  return Object.assign(
    { initial: ini || undefined },
    { equation: equArr }
  )
}

/**
 * Get the simplified json representation for the equation object
 *
 * @param equ equation value
 */
function equation (equ) {
  const assEqu = equ.assignment_equation
  const ifEqu = equ.if_equation
  const forEqu = equ.for_equation
  const conCla = equ.connect_clause
  const wheEqu = equ.when_equation
  const funCalEqu = equ.function_call_equation
  const des = equ.comment
  const desObj = des ? this.description(des) : undefined
  return Object.assign(
    { assignment_equation: (assEqu && !ut.isEmptyObject(assEqu)) ? this.assignmentEquation(assEqu) : undefined },
    { if_equation: ifEqu ? this.ifEquation(ifEqu) : undefined },
    { for_equation: forEqu ? this.forEquation(forEqu) : undefined },
    { connect_clause: conCla ? this.connectClause(conCla) : undefined },
    { when_equation: wheEqu ? this.whenEquation(wheEqu) : undefined },
    { function_call_equation: (funCalEqu && !ut.isEmptyObject(funCalEqu)) ? this.functionCallEquation(funCalEqu) : undefined },
    { description: !ut.isEmptyObject(desObj) ? desObj : undefined }
  )
}

/**
 * Get the simplified json representation for the assignment_equation object
 *
 * @param assEqu assignment_equation value
 */
function assignmentEquation (assEqu) {
  const simExp = assEqu.lhs
  const exp = assEqu.rhs
  return Object.assign(
    { lhs: simExp ? this.simpleExpression(simExp) : undefined },
    { rhs: exp ? this.expression(exp) : undefined }
  )
}

/**
 * Get the simplified json representation for the if_equation object
 *
 * @param ifEqu if_equation value
 */
function ifEquation (ifEqu) {
  const ifEls = ifEqu.if_elseif
  const elsEqu = ifEqu.else_equation
  const ifElsArr = []
  for (let i = 0; i < ifEls.length; i++) {
    const obj = ifEls[i]
    const theEquArr = []
    const theEqu = obj.then
    for (let j = 0; j < theEqu.length; j++) {
      const ele = theEqu[j]
      theEquArr.push(Object.assign(
        { equation: this.equation(ele) }
      ))
    }
    ifElsArr.push(Object.assign(
      { condition: obj.condition ? this.expression(obj.condition) : undefined },
      { then: theEquArr }
    ))
  }
  const elsArr = []
  if (elsEqu) {
    for (let k = 0; k < elsEqu.length; k++) {
      const obj2 = elsEqu[k]
      elsArr.push(this.equation(obj2))
    }
  }
  return Object.assign(
    { if_elseif: ifElsArr },
    { else_equation: elsEqu ? elsArr : undefined }
  )
}

/**
 * Get the simplified json representation for the for_equation object
 *
 * @param forEqu for_equation value
 */
function forEquation (forEqu) {
  const forInd = forEqu.for_indices
  const looEqu = forEqu.loop_equations
  const looEquArr = []
  for (let i = 0; i < looEqu.length; i++) {
    const obj = looEqu[i]
    looEquArr.push(this.equation(obj))
  }
  return Object.assign(
    { for_indices: this.forIndices(forInd) },
    { loop_equations: looEquArr }
  )
}

/**
 * Get the simplified json representation for the connect_clause object
 *
 * @param conCla connect_clause value
 */
function connectClause (conCla) {
  return Object.assign(
    { from: this.componentReference(conCla.from) },
    { to: this.componentReference(conCla.to) }
  )
}

/**
 * Get the simplified json representation for the component_reference object
 *
 * @param comRef component_reference value
 */
function componentReference (comRef) {
  const comPar = comRef.component_reference_parts
  const parArr = []
  for (let i = 0; i < comPar.length; i++) {
    const obj = comPar[i]
    const arrSub = obj.array_subscripts
    parArr.push(Object.assign(
      { dot_op: obj.dot_op },
      { identifier: obj.identifier },
      { array_subscripts: arrSub ? this.arraySubscripts(arrSub) : undefined }
    ))
  }
  return parArr
}

/**
 * Get the simplified json representation for the when_equation object
 *
 * @param wheEqus when_equation value
 */
function whenEquation (wheEqus) {
  const wheEqu = wheEqus.when_elsewhen
  const wheEquArr = []
  for (let i = 0; i < wheEqu.length; i++) {
    const obj = wheEqu[i]
    const con = obj.condition
    const the = obj.then
    const theArr = []
    for (let j = 0; j < the.length; j++) {
      const ele = the[j]
      theArr.push(this.equation(ele))
    }
    wheEquArr.push(Object.assign(
      { condition: con ? this.expression(con) : undefined },
      { then: theArr }
    ))
  }
  return wheEquArr
}

/**
 * Get the simplified json representation for the function_call_equation object
 *
 * @param funCalEqu function_call_equation value
 */
function functionCallEquation (funCalEqu) {
  const name = funCalEqu.function_name
  const funCalArg = funCalEqu.function_call_args
  return Object.assign(
    { function_name: name ? this.nameString(name) : undefined },
    { function_call_args: funCalArg ? this.functionCallArgs(funCalArg) : undefined }
  )
}

/**
 * Get the simplified json representation for the function_call_args object
 *
 * @param funCalArg function_call_args value
 */
function functionCallArgs (funCalArg) {
  const funArgs = funCalArg.function_arguments
  return funArgs ? this.functionArguments(funArgs) : undefined
}

/**
 * Get the simplified json representation for the function_arguments object
 *
 * @param funArgs function_arguments value
 */
function functionArguments (funArgs) {
  const namArg = funArgs.named_arguments
  const funArg = funArgs.function_argument
  const forInd = funArgs.for_indices
  const intFunArgs = funArgs.function_arguments
  return Object.assign(
    { named_arguments: namArg ? this.namedArguments(namArg) : undefined },
    { function_argument: funArg ? this.functionArgument(funArg) : undefined },
    { for_indices: forInd ? this.forIndices(forInd) : undefined },
    { function_arguments: intFunArgs ? this.functionArguments(intFunArgs) : undefined }
  )
}

/**
 * Get the simplified json representation for the named_arguments object
 *
 * @param namArg named_arguments value
 */
function namedArguments (namArg) {
  const args = this.namedArgsArray(namArg)
  const namArgArr = []
  for (let i = 0; i < args.length; i++) {
    const obj = args[i]
    const ident = obj.identifier
    const val = obj.value
    namArgArr.push(Object.assign(
      { identifier: ident },
      { value: val ? this.functionArgument(val) : undefined }
    ))
  }
  return namArgArr
}

/**
 * Get the simplified json representation for the function_argument object
 *
 * @param funArg function_argument value
 */
function functionArgument (funArg) {
  const name = funArg.function_name
  const namArg = funArg.named_arguments
  const exp = funArg.expression
  return Object.assign(
    { function_name: name ? this.nameString(name) : undefined },
    { named_arguments: namArg ? this.namedArguments(namArg) : undefined },
    { expression: exp ? this.expression(exp) : undefined }
  )
}

/**
 * Get the simplified json representation for the for_indices object
 *
 * @param forInd for_indices value
 */
function forIndices (forInd) {
  const indLis = forInd.indices
  const indArr = []
  for (let i = 0; i < indLis.length; i++) {
    const obj = indLis[i]
    const exp = obj.expression
    indArr.push(Object.assign(
      { identifier: obj.identifier },
      { expression: exp ? this.expression(exp) : undefined }
    ))
  }
  return indArr
}

/**
 * Get the simplified json representation for the algorithm_section object
 *
 * @param algSec algorithm_section value
 */
function algorithmSection (algSec) {
  const ini = algSec.initial
  const staLis = algSec.statements
  const staArr = []
  for (let i = 0; i < staLis.length; i++) {
    const obj = staLis[i]
    staArr.push(this.statement(obj))
  }
  return Object.assign(
    { initial: ini || undefined },
    { statement: staArr }
  )
}

/**
 * Get the simplified json representation for the statement object
 *
 * @param sta statement value
 */
function statement (sta) {
  const assSta = sta.assignment_statement
  const funCalSta = sta.Function_call_statement
  const assWithFunCalSta = sta.b ? sta.b.assignment_with_function_call_statement : undefined
  const ifSta = sta.if_statement
  const forSta = sta.for_statement
  const wheSta = sta.when_statement
  const whiSta = sta.while_statement
  const des = sta.comment
  const desObj = des ? this.description(des) : undefined
  const isBreak = sta.is_break
  const isReturn = sta.is_return
  return Object.assign(
    { assignment_statement: assSta ? this.assignmentStatement(assSta) : undefined },
    { Function_call_statement: funCalSta ? this.functionCallStatement(funCalSta) : undefined },
    { assignment_with_function_call_statement: assWithFunCalSta ? this.assignmentWithFunctionCallStatement(assWithFunCalSta) : undefined },
    { break: isBreak || undefined },
    { return: isReturn || undefined },
    { if_statement: ifSta ? this.ifStatement(ifSta) : undefined },
    { for_statement: forSta ? this.forStatement(forSta) : undefined },
    { while_statement: whiSta ? this.whileStatement(whiSta) : undefined },
    { when_statement: wheSta ? this.whenStatement(wheSta) : undefined },
    { description: !ut.isEmptyObject(desObj) ? desObj : undefined }
  )
}

/**
 * Get the simplified json representation for the assignment_statement object
 *
 * @param assSta assignment_statement value
 */
function assignmentStatement (assSta) {
  const ident = assSta.identifier
  const val = assSta.value
  return Object.assign(
    { identifier: ident ? this.componentReference(ident) : undefined },
    { value: val ? this.expression(val) : undefined }
  )
}

/**
 * Get the simplified json representation for the Function_call_statement object
 *
 * @param funCalSta Function_call_statement value
 */
function functionCallStatement (funCalSta) {
  const name = funCalSta.function_name
  const funCalArg = funCalSta.function_call_args
  return Object.assign(
    { function_name: name ? this.componentReference(name) : undefined },
    { function_call_args: funCalArg ? this.functionCallArgs(funCalArg) : undefined }
  )
}

/**
 * Get the simplified json representation for the assignment_with_function_call_statement object
 *
 * @param assWithFunCalSta assignment_with_function_call_statement value
 */
function assignmentWithFunctionCallStatement (assWithFunCalSta) {
  const outExpLis = assWithFunCalSta.output_expression_list
  let outExp
  const name = assWithFunCalSta.function_name
  const funCalArg = assWithFunCalSta.function_call_args
  if (outExpLis) {
    outExp = outExpLis.output_expressions
  }
  if (outExp) {
    const outExpArr = []
    for (let i = 0; i < outExpLis.length; i++) {
      const obj = outExpLis[i]
      const objExp = obj.expression
      if (objExp) { outExpArr.push(this.expression(objExp)) }
    }
    return Object.assign(
      { output_expression_list: outExpArr },
      { function_name: name ? this.componentReference(name) : undefined },
      { function_call_args: funCalArg ? this.functionCallArgs(funCalArg) : undefined }
    )
  } else {
    return Object.assign(
      { function_name: name ? this.componentReference(name) : undefined },
      { function_call_args: funCalArg ? this.functionCallArgs(funCalArg) : undefined }
    )
  }
  // output_expression_list check if output_expression exists
  // if doesnt exist, only return function_name and function_call_args
}

/**
 * Get the simplified json representation for the if_statement object
 *
 * @param ifSta if_statement value
 */
function ifStatement (ifSta) {
  const ifEls = ifSta.if_elseif
  const elsSta = ifSta.else_statement
  const ifElsArr = []
  for (let i = 0; i < ifEls.length; i++) {
    const obj = ifEls[i]
    const theStaArr = []
    const theSta = obj.then
    for (let j = 0; j < theSta.length; j++) {
      const ele = theSta[j]
      theStaArr.push(this.statement(ele))
    }
    ifElsArr.push(Object.assign(
      { condition: obj.condition ? this.expression(obj.condition) : undefined },
      { then: theStaArr }
    ))
  }
  const elsArr = []
  if (elsSta && (elsSta.length > 0)) {
    for (let k = 0; k < elsSta.length; k++) {
      const obj2 = elsSta[k]
      elsArr.push(this.statement(obj2))
    }
  }
  return Object.assign(
    { if_elseif: ifElsArr },
    { else_statement: (elsArr.length > 0) ? elsArr : undefined }
  )
}

/**
 * Get the simplified json representation for the for_statement object
 *
 * @param forSta for_statement value
 */
function forStatement (forSta) {
  const forInd = forSta.for_indices
  const looSta = forSta.loop_statements
  const looStaArr = []
  for (let i = 0; i < looSta.length; i++) {
    const obj = looSta[i]
    looStaArr.push(this.statement(obj))
  }
  return Object.assign(
    { for_indices: this.forIndices(forInd) },
    { loop_statements: looStaArr }
  )
}

/**
 * Get the simplified json representation for the while_statement object
 *
 * @param whiStas while_statement value
 */
function whileStatement (whiSta) {
  const con = whiSta.expression
  const looSta = whiSta.loop_statements
  const staArr = []
  for (let i = 0; i < looSta.length; i++) {
    const obj = looSta[i]
    staArr.push(this.statement(obj))
  }
  return Object.assign(
    { expression: con ? this.expression(con) : undefined },
    { loop_statement: staArr }
  )
}

/**
 * Get the simplified json representation for the when_statement object
 *
 * @param wheStas when_statement value
 */
function whenStatement (wheStas) {
  const wheSta = wheStas.when_elsewhen
  const wheStaArr = []
  for (let i = 0; i < wheSta.length; i++) {
    const obj = wheSta[i]
    const con = obj.condition
    const the = obj.then
    const theArr = []
    for (let j = 0; j < the.length; j++) {
      const ele = the[j]
      theArr.push(this.statement(ele))
    }
    wheStaArr.push(Object.assign(
      { condition: con ? this.expression(con) : undefined },
      { then: theArr }
    ))
  }
  return wheStaArr
}

/**
 * Get the simplified json representation for the external_composition object
 *
 * @param extCom external_composition value
 */
function externalComposition (extCom) {
  const lanSpe = extCom.language_specification
  const extFunCal = extCom.external_function_call
  const extAnn = extCom.external_annotation ? extCom.external_annotation.class_modification : null
  const annotation = extAnn ? this.classModification(extAnn) : undefined
  return Object.assign(
    { language_specification: lanSpe },
    { external_function_call: extFunCal ? this.externalFunctionCall(extFunCal) : undefined },
    { external_annotation: (annotation === '()') ? undefined : annotation }
  )
}

/**
 * Get the simplified json representation for the external_function_call object
 *
 * @param extFunCal external_function_call value
 */
function externalFunctionCall (extFunCal) {
  const comRef = extFunCal.component_reference
  const ident = extFunCal.identifier
  const expLis = extFunCal.expression_list
  const exps = expLis ? expLis.expressions : undefined
  const expArr = []
  if (exps) {
    for (let i = 0; i < exps.length; i++) {
      const ele = exps[i]
      expArr.push(this.expression(ele))
    }
  }
  return Object.assign(
    { component_reference: comRef ? this.componentReference(comRef) : undefined },
    { identifier: ident },
    { expression_list: exps ? expArr : undefined }
  )
}

/**
 * Get the simplified json representation for the short_class_specifier object
 *
 * @param shoClaSpe short_class_specifier value
 */
function shortClassSpecifier (shoClaSpe) {
  const ident = shoClaSpe.identifier
  const val = shoClaSpe.short_class_specifier_value
  return Object.assign(
    { identifier: ident },
    { value: val ? this.shortClassSpecifierValue(val) : undefined }
  )
}

/**
 * Get the simplified json representation for the short_class_specifier_value object
 *
 * @param val short_class_specifier_value value
 */
function shortClassSpecifierValue (val) {
  const basPre = val.base_prefix
  const pre = basPre ? basPre.type_prefix : undefined
  const name = val.name
  const arrSub = val.array_subscripts
  const claMod = val.class_modification
  const des = val.comment
  const desObjEx = des ? this.description(des) : undefined
  const enuLis = val.enum_list ? val.enum_list.enumeration_literal_list : undefined
  const enuArr = []
  if (enuLis && (enuLis.length > 0)) {
    const enumLite = enuLis
    for (let i = 0; i < enumLite.length; i++) {
      const obj = enumLite[i]
      const ident = obj.identifier
      const desCri = obj.comment
      const desObj = desCri ? this.description(desCri) : undefined
      enuArr.push(Object.assign(
        { identifier: ident },
        { description: !ut.isEmptyObject(desObj) ? desObj : undefined }
      ))
    }
  }
  return Object.assign(
    { base_prefix: pre },
    { name: name ? this.nameString(name) : undefined },
    { array_subscripts: arrSub ? this.arraySubscripts(arrSub) : undefined },
    { class_modification: claMod ? this.classModification(claMod) : undefined },
    { description: !ut.isEmptyObject(desObjEx) ? desObjEx : undefined },
    { enum_list: (enuArr.length > 0) ? enuArr : undefined }
  )
}

/**
 * Get the simplified json representation for the der_class_specifier object
 *
 * @param derClaSpe der_class_specifier value
 */
function derClassSpecifier (derClaSpe) {
  const ident = derClaSpe.identifier
  const val = derClaSpe.der_class_specifier_value
  let typSpe, typIden, typDes, valObj
  if (val) {
    typSpe = val.type_specifier
    typIden = val.identifiers
    typDes = val.comment ? this.description(val.comment) : undefined
    valObj = Object.assign(
      { type_specifier: typSpe },
      { identifier: typIden },
      { description: !ut.isEmptyObject(typDes) ? typDes : undefined }
    )
  }
  return Object.assign(
    { identifier: ident },
    { value: val ? valObj : undefined }
  )
}

/**
 * Get the string of simple expression
 *
 * @param simExp simple expression object
 */
function simpleExpression (simExp, outStr = false) {
  if (!simExp.logical_expression1) {
    throw new Error('simple_expression must contain logical_expression1')
  }
  const logExp1 = this.logicalExpression(simExp.logical_expression1)

  const logExp2 = simExp.logical_expression2
    ? (':' + this.logicalExpression(simExp.logical_expression2))
    : ''
  const logExp3 = simExp.logical_expression3
    ? (':' + this.logicalExpression(simExp.logical_expression3))
    : ''
  let funCal, forLoo, logExp, ifExp
  if (!(logExp2 || logExp3)) {
    const pri = this.checkPri(simExp.logical_expression1)
    if (pri) {
      funCal = this.functionCallObj(pri)
      forLoo = this.forLoopObj(pri)
      ifExp = this.ifExpressionObj(pri)
    }
    logExp = this.logicalExpressionObj(simExp.logical_expression1)
  }
  if ((funCal || forLoo || logExp || ifExp) && !outStr) {
    return Object.assign(
      { function_call: funCal },
      { for_loop: forLoo },
      { logical_expression: logExp },
      { if_expression: ifExp }
    )
  } else {
    return (logExp1 + logExp2 + logExp3)
  }
}

/**
 * Get the if expression object
 *
 * @param pri primary object
 */
function ifExpressionObj (pri) {
  const outExpLis = pri.output_expression_list
  if (!outExpLis) { return undefined }
  const expLis = outExpLis.output_expressions
  const expArray = []
  for (let i = 0; i < expLis.length; i++) {
    const ithExp = expLis[i]
    if (ithExp.simple_expression) {
      return undefined
    }
    const ifExp = ithExp.if_expression
    const ifEls = ifExp.if_elseif
    const ifElsArray = []
    for (let j = 0; j < ifEls.length; j++) {
      const jthEle = ifEls[j]
      const condition = this.expressionString(jthEle.condition)
      const then = this.expressionString(jthEle.then)
      ifElsArray.push(Object.assign(
        { condition },
        { then }
      ))
    }
    const elsExp = ifExp.else_expression
    expArray.push(Object.assign(
      { if_elseif: ifElsArray },
      { else: this.expressionString(elsExp) }
    ))
  }
  return (expArray.length > 0 ? expArray : undefined)
}

/** Get the for loop object
 *
 * @param pri primary object
 */
function forLoopObj (pri) {
  const funArgs = pri.function_arguments
  if (!funArgs) { return undefined }
  const funArg = funArgs.function_argument
  const forInd = funArgs.for_indices
  if (!forInd) { return undefined }
  const exp = this.funArgObj(funArg)
  const forObj = Object.assign({ expression: exp }, this.forIndObj(forInd))
  return forObj
}

/** Get the simplified logical expression object
 *
 * @param logExp logical_expression object
 */
function logicalExpressionObj (logExp) {
  const termList = logExp.logical_term_list
  const orArray = []
  for (let i = 0; i < termList.length; i++) {
    const ithTerm = termList[i]
    const factorList = ithTerm.logical_factor_list
    const andArray = []
    for (let j = 0; j < factorList.length; j++) {
      const jthFactor = factorList[j]
      const jthFactorObj = this.logicalFactorObj(jthFactor)
      if (jthFactorObj) {
        andArray.push(jthFactorObj)
      }
    }
    if (andArray.length > 0) {
      orArray.push(Object.assign({ logical_and: andArray }))
    }
  }
  if (orArray.length > 0) {
    return Object.assign({ logical_or: orArray })
  }
}

/** Get the simplified logical factor object
 *
 * @param fac logical_factor object
 */
function logicalFactorObj (fac) {
  const notOpe = fac.not
  const rel = fac.relation
  const relOp = rel.rel_op
  const ariExp1 = this.arithmeticExpression(rel.arithmetic_expression1)
  if (!relOp) { return undefined }
  const ariExp2 = this.arithmeticExpression(rel.arithmetic_expression2)
  const ariExpArray = []
  ariExpArray.push(Object.assign({ name: ariExp1 }))
  ariExpArray.push(Object.assign({ name: ariExp2 }))
  return Object.assign(
    { not: notOpe || undefined },
    { arithmetic_expressions: ariExpArray },
    { relation_operator: relOp }
  )
}

/** Get the primary object
 *
 * @param logExp logical_expression object
 */
function checkPri (logExp) {
  const termList = logExp.logical_term_list
  // check if there is only 1 term, otherwise, it is not applicable for output function call object
  if (termList.length > 1) { return undefined }
  const factorList = termList[0].logical_factor_list
  if (factorList.length > 1) { return undefined }
  const logFac = factorList[0]
  // check if it does not have "not" operator, otherwise, it is not applicable for output function call object
  if (logFac.not) { return undefined }
  const relation = logFac.relation
  // check if it does not have any logical operator, otherwise, it is not applicable for output function call object
  if (relation.rel_op) { return undefined }
  const ariExp = relation.arithmetic_expression1
  const ariTermList = ariExp.arithmetic_term_list
  // check if there is only 1 arithmetic term, otherwise, it is not applicable for output function call object
  if (ariTermList.length > 1) { return undefined }
  const termOne = ariTermList[0]
  // check if it does not have "plus" operator, otherwise, it is not applicable for output function call object
  if (termOne.add_op) { return undefined }
  // check if it does not have "*" operator, otherwise, it is not applicable for output function call object
  if (termOne.mul_ops) { return undefined }
  const factors = termOne.term.factors
  // check if there is only 1 factor, otherwise, it is not applicable for output function call object
  if (factors.length > 1) { return undefined }
  const factor = factors[0]
  // check if it does not have any operator, otherwise, it is not applicable for output function call object
  if (factor.op) { return undefined }
  return factor.primary1
}

/** Get the function call object
 *
 * @param pri pri object
 */
function functionCallObj (pri) {
  const unsNum = pri.unsigned_number
  const priStr = pri.primary_string
  const isFalse = pri.is_false
  const isTrue = pri.is_true
  const funCalPri = pri.function_call_primary
  const comRef = pri.component_reference
  const outExpLis = pri.output_expression_list
  const expLis = pri.expression_lists
  const funArg = pri.function_arguments
  const end = pri.end
  // check if it only has the function call primary, otherwise, it is not applicable for output function call object
  if (unsNum || priStr || isFalse || isTrue || comRef || (outExpLis && outExpLis.length > 0) || (expLis && expLis.length > 0) || funArg || end) {
    return undefined
  }
  if (funCalPri) {
    const funCalArg = funCalPri.function_call_args ? funCalPri.function_call_args : undefined
    const name = funCalPri.function_name
    const der = funCalPri.der
    const initial = funCalPri.initial
    if (der || initial || !name) {
      return undefined
    }
    return Object.assign(
      { name: this.nameString(name) },
      { arguments: funCalArg ? this.funCalArgObj(funCalArg) : undefined }
    )
  }
}

/** Get the function call arguments object
 *
 * @param funCalArg function_call_args object
 */
function funCalArgObj (funCalArg) {
  let funArg
  if (funCalArg) {
    funArg = funCalArg.function_arguments
  }

  return funArg ? this.funArgsObj(funArg) : undefined
}

/** Get the function arguments object
 *
 * @param argObj function_arguments object
 */
function funArgsObj (argObj) {
  const namedArg = argObj.named_arguments
  const funArg = argObj.function_argument
  const forInd = argObj.for_indices
  const funArgs = argObj.function_arguments
  const argArray = []
  if (namedArg) {
    argArray.push(Object.assign({ name: this.namedArgsString(namedArg) }))
  } else {
    if (funArgs) {
      argArray.push(Object.assign({ name: this.funArgString(funArg) }))
      argArray.push(Object.assign({ name: this.funArgsString(funArgs) }))
    } else if (forInd) {
      const exp = this.funArgObj(funArg)
      const forObj = Object.assign({ expression: exp }, this.forIndObj(forInd))
      argArray.push(forObj)
    } else {
      argArray.push(Object.assign({ name: this.funArgString(funArg) }))
    }
  }
  return argArray
}

/** Get the for indices object
 *
 * @param forIndObject for_indices object
 */
function forIndObj (forIndObject) {
  const ind = forIndObject.indices
  const indices = []
  for (let i = 0; i < ind.length; i++) {
    const ithInd = ind[i]
    const ident = ithInd.identifier
    const exp = ithInd.expression
    const expString = exp ? this.expressionString(exp, false) : undefined
    indices.push(Object.assign({ name: ident }, { range: expString }))
  }
  return Object.assign({ for_loop: indices })
}

/** Get the for function argument object
 *
 * @param funArg function_argument object
 */
function funArgObj (funArg) {
  const exp = funArg.expression
  if (exp) {
    // const simExp = exp.simple_expression
    return this.expression(exp)
  } else {
    return undefined
  }
}

/** Get the string of logical epxression
  *
  * @param logExp logical_expression object
  */
function logicalExpression (logExp) {
  const termList = logExp.logical_term_list
  const termArray = []
  for (let i = 0; i < termList.length; i++) {
    const factorList = termList[i].logical_factor_list
    const factor = []
    for (let j = 0; j < factorList.length; j++) {
      factor.push(this.logicalFactor(factorList[j]))
    }
    termArray.push(factor.join(' and '))
  }
  return termArray.join(' or ')
}

/**
 * Get the string of logical factor
 *
 * @param logFac logical_factor object
 */
function logicalFactor (logFac) {
  const relStr = this.relation(logFac.relation)
  return (logFac.not) ? ('not ' + relStr) : relStr
}

/**
 * Get the string of relation
 *
 * @param rel relation object
 */
function relation (rel) {
  const ariExp1 = this.arithmeticExpression(rel.arithmetic_expression1)
  const relOp = rel.rel_op
  if (relOp) {
    const ariExp2 = this.arithmeticExpression(rel.arithmetic_expression2)
    return (ariExp1 + ' ' + relOp + ' ' + ariExp2)
  } else {
    return ariExp1
  }
}

/**
 * Get the string of arithmetic_expression
 *
 * @param ariExp arithmetic_expression object
 */
function arithmeticExpression (ariExp) {
  const termList = ariExp.arithmetic_term_list
  const termArray = []
  for (let i = 0; i < termList.length; i++) {
    const addOp = termList[i].add_op
    const term = this.termString(termList[i].term)
    const termEle = addOp ? (addOp + term) : term
    termArray.push(termEle)
  }
  return termArray.join(' ')
}

/**
 * Get the string of term
 *
 * @param ter term object
 */
function termString (ter) {
  const factor = ter.factors
  const mulOps = ter.mul_ops
  let temp
  if (mulOps) {
    temp = this.factorString(factor[0])
    for (let i = 0; i < mulOps.length; i++) {
      temp = temp + mulOps[i] + this.factorString(factor[i + 1])
    }
  }
  return temp
}

/**
 * Get the string of factor
 *
 * @param fac factor object
 */
function factorString (fac) {
  const pri1Str = this.primary(fac.primary1)
  const op = fac.op
  if (op && op !== '') {
    return (pri1Str + op + this.primary(fac.primary2))
  } else {
    return pri1Str
  }
}

/**
 * Get the string of primary
 *
 * @param pri primary object
 */
function primary (pri) {
  const unsNum = pri.unsigned_number
  const priStr = pri.primary_string
  const isFalse = pri.is_false
  const isTrue = pri.is_true
  const funCalPri = pri.function_call_primary
  const comRef = pri.component_reference
  const outExpLis = pri.output_expression_list
  const expLis = pri.expression_lists
  const funArg = pri.function_arguments
  const end = pri.end
  if (unsNum === 0) {
    return '0'
  } else if (unsNum) {
    return unsNum.toString()
  } else if (priStr) {
    return priStr
  } else if (isFalse) {
    return 'false'
  } else if (isTrue) {
    return 'true'
  } else if (funCalPri && funCalPri.function_call_args) {
    return this.funCalPriString(funCalPri)
  } else if (comRef) {
    return this.comRefString(comRef)
  } else if (outExpLis) {
    return ('(' + this.outExpLisString(outExpLis) + ')')
  } else if (expLis && (expLis.length > 0)) {
    return ('[' + this.expLisString(expLis) + ']')
  } else if (funArg) {
    return ('{' + this.funArgsString(funArg) + '}')
  } else if (end) {
    return 'end'
  }
}

/**
 * Get the string of function_call_primary
 *
 * @param funCalPri function_call_primary object
 */
function funCalPriString (funCalPri) {
  const funCalArg = funCalPri.function_call_args
  const name = funCalPri.function_name
  const der = funCalPri.der
  const initial = funCalPri.initial
  let pre
  if (name) {
    pre = this.nameString(name)
  } else if (der) {
    pre = 'der'
  } else if (initial) {
    pre = 'initial'
  }
  return (pre + this.funCalArgString(funCalArg))
}

/**
 * Get the string of name
 *
 * @param name name object
 */
function nameString (name) {
  const nameList = name.name_parts
  let nameString = ''
  for (let i = 0; i < nameList.length; i++) {
    const dotOp = nameList[i].dot_op
    const dot = dotOp ? '.' : ''
    if (nameList[i].identifier !== undefined && nameList[i].identifier !== null) {
      const ident = nameList[i].identifier
      nameString = nameString + dot + ident
    }
  }
  return nameString
}

/**
 * Get the string of function_call_args
 *
 * @param funCalArg function_call_args object
 */
function funCalArgString (funCalArg) {
  const funArg = funCalArg.function_arguments
  return funArg ? ('(' + this.funArgsString(funArg) + ')') : '()'
}

/**
 * Get the string of component_reference
 *
 * @param comRef component_reference object
 */
function comRefString (comRef) {
  const comRefPar = comRef.component_reference_parts
  let comString = ''
  for (let i = 0; i < comRefPar.length; i++) {
    const ithCom = comRefPar[i]
    const dotOp = ithCom.dot_op ? '.' : ''
    const ident = ithCom.identifier
    const identStr = ident || ''
    const arrSub = ithCom.array_subscripts
    const arrSubStr = arrSub ? this.arrSubString(arrSub) : ''
    comString += (dotOp + identStr + arrSubStr)
  }
  return comString
}

/**
 * Get the string of array_subscripts
 *
 * @param arrSub array_subscripts object
 */
function arrSubString (arrSub) {
  const sub = arrSub.subscripts
  const subEle = []
  for (let i = 0; i < sub.length; i++) {
    const ithSub = sub[i]
    const exp = ithSub.expression
    const colOp = ithSub.colon_op
    const ithSubString = colOp ? ':' : this.expressionString(exp)
    subEle.push(ithSubString)
  }
  return ('[' + subEle.join(',') + ']')
}

/**
 * Get the string of function_arguments
 *
 * @param funArgObj function_arguments object
 */
function funArgsString (funArgObj) {
  const namedArg = funArgObj.named_arguments
  const funArg = funArgObj.function_argument
  const forInd = funArgObj.for_indices
  const funArgs = funArgObj.function_arguments
  if (namedArg) {
    return this.namedArgsString(namedArg)
  } else {
    if (funArgs) {
      return (this.funArgString(funArg) + ',' + this.funArgsString(funArgs))
    } else if (forInd) {
      return (this.funArgString(funArg) + ' for ' + this.forIndString(forInd))
    } else {
      return this.funArgString(funArg)
    }
  }
}

/**
 * Get the string of function_argument
 *
 * @param funArgObj function_argument object
 */
function funArgString (funArgObj) {
  const funName = funArgObj.function_name
  const namArgs = funArgObj.named_arguments
  const expStr = funArgObj.expression
  if (funName) {
    const namedArgString = namArgs ? ('(' + this.namedArgsString(namArgs) + ')') : '()'
    return 'function ' + this.nameString(funName) + namedArgString
  } else {
    const funcArg = this.expressionString(expStr, true)
    return funcArg
  }
}

/**
 * Get the string of named_arguments
 *
 * @param namArgs named_arguments object
 */
function namedArgsString (namArgs) {
  const namArgsArr = this.namedArgsArray(namArgs)
  if (namArgsArr.length > 1) {
    const namArr = []
    for (let i = 0; i < namArgsArr.length; i++) {
      const ident = namArgsArr[i].identifier
      const value = this.funArgString(namArgsArr[i].value)
      namArr.push(ident + '=' + value)
    }
    return namArr.join(',')
  } else {
    return (namArgsArr[0].identifier + '=' + this.funArgString(namArgsArr[0].value))
  }
}

/**
 * Recursively get the array of named_arguments
 *
 * @param namArgs named_arguments object
 */
function namedArgsArray (namArgs) {
  const out = []
  out.push(namArgs.named_argument)
  const namArgsInt = namArgs.named_arguments
  if (namArgsInt) {
    const intArr = this.namedArgsArray(namArgsInt)
    Array.prototype.push.apply(out, intArr)
  }
  return out
}

/**
 * Get the string of output_expression_list
 *
 * @param outExpLis output_expression_list object
 */
function outExpLisString (outExpLis) {
  const expList = outExpLis.output_expressions
  const arr = []
  try {
    for (let i = 0; i < expList.length; i++) {
      arr.push(this.expressionString(expList[i]))
    }
    return arr.join(',')
  } catch (e) {
    throw new Error('missing out_exp_lis')
  }
}

/**
 * Get the string of expression_lists
 *
 * @param expLists expression_lists object
 */
function expLisString (expLists) {
  const expString = []
  for (let i = 0; i < expLists.length; i++) {
    const expList = expLists[i]
    expString.push(this.expressionListString(expList))
  }
  return expString.join(';')
}

/**
 * Get the string of expression_list
 *
 * @param expList expression_list object
 */
function expressionListString (expList) {
  const ithListEle = expList.expressions
  const arr = []
  if (ithListEle) {
    for (let j = 0; j < ithListEle.length; j++) {
      arr.push(this.expressionString(ithListEle[j]))
    }
    const ithListString = arr.join(',')
    return ithListString
  }
  return undefined
}

/**
 * Get the string of for_indices
 *
 * @param forInd for_indices object
 */
function forIndString (forInd) {
  const ind = forInd.indices
  const indEle = []
  for (let i = 0; i < ind.length; i++) {
    const ithInd = ind[i]
    const ident = ithInd.identifier
    const exp = ithInd.expression
    const ithIndString = exp ? (ident + ' in ' + this.expressionString(exp)) : ident
    indEle.push(ithIndString)
  }
  return indEle.join(',')
}

/**
 * Get the string of expression
 *
 * @param exp expression object
 */
function expressionString (exp, outStr = false) {
  const simExp = exp.simple_expression
  const ifExp = exp.if_expression
  return simExp ? this.simpleExpression(simExp, outStr) : this.ifExpString(ifExp)
}

/**
 * Get the string of if_expression
 *
 * @param ifExp if_expression object
 */
function ifExpString (ifExp) {
  let ifElse = ''
  if (ifExp.if_elseif !== undefined) {
    ifElse = ifExp.if_elseif
  }
  let elsExp = ''
  if (ifExp.else_expression !== undefined) {
    elsExp = ifExp.else_expression
  }
  if (ifElse === '' || elsExp === '') {
    throw new Error('if_expression object must contain at least one condition, then and else expression')
  }
  let ifExpString = 'if ' + this.expressionString(ifElse[0].condition) + ' then ' + this.expressionString(ifElse[0].then)
  if (ifElse.length > 1) {
    for (let i = 1; i < ifElse.length; i++) {
      const ithEle = ifElse[i]
      const elseifString = ' elseif ' + this.expressionString(ithEle.condition) + ' then ' + this.expressionString(ithEle.then)
      ifExpString = ifExpString + elseifString
    }
  }
  return (ifExpString + ' else ' + this.expressionString(elsExp))
}

module.exports.getProperty = getProperty
module.exports.findNestedObjects = findNestedObjects
module.exports.simplifyModelicaJSON = simplifyModelicaJSON
module.exports.classDefinition = classDefinition
module.exports.classSpecifier = classSpecifier
module.exports.longClassSpecifier = longClassSpecifier
module.exports.composition = composition
module.exports.elementList = elementList
module.exports.importClause = importClause
module.exports.importList = importList
module.exports.description = description
module.exports.trimDesString = trimDesString
module.exports.extendsClause = extendsClause
module.exports.constrainingClause = constrainingClause
module.exports.componentClause = componentClause
module.exports.typeSpecifier = typeSpecifier
module.exports.arraySubscripts = arraySubscripts
module.exports.expression = expression
module.exports.ifExpression = ifExpression
module.exports.componentList = componentList
module.exports.declaration = declaration
module.exports.modification = modification
module.exports.classModification = classModification
module.exports.elementModificationReplaceable = elementModificationReplaceable
module.exports.elementModification = elementModification
module.exports.elementReplaceable = elementReplaceable
module.exports.shortClassDefinition = shortClassDefinition
module.exports.componentClause1 = componentClause1
module.exports.componentDeclaration1 = componentDeclaration1
module.exports.elementRedeclaration = elementRedeclaration
module.exports.elementSections = elementSections
module.exports.equationSection = equationSection
module.exports.equation = equation
module.exports.assignmentEquation = assignmentEquation
module.exports.ifEquation = ifEquation
module.exports.forEquation = forEquation
module.exports.connectClause = connectClause
module.exports.componentReference = componentReference
module.exports.whenEquation = whenEquation
module.exports.functionCallEquation = functionCallEquation
module.exports.functionCallArgs = functionCallArgs
module.exports.functionArguments = functionArguments
module.exports.namedArguments = namedArguments
module.exports.functionArgument = functionArgument
module.exports.forIndices = forIndices
module.exports.algorithmSection = algorithmSection
module.exports.statement = statement
module.exports.assignmentStatement = assignmentStatement
module.exports.functionCallStatement = functionCallStatement
module.exports.assignmentWithFunctionCallStatement = assignmentWithFunctionCallStatement
module.exports.ifStatement = ifStatement
module.exports.forStatement = forStatement
module.exports.whileStatement = whileStatement
module.exports.whenStatement = whenStatement
module.exports.externalComposition = externalComposition
module.exports.externalFunctionCall = externalFunctionCall
module.exports.shortClassSpecifier = shortClassSpecifier
module.exports.shortClassSpecifierValue = shortClassSpecifierValue
module.exports.derClassSpecifier = derClassSpecifier
module.exports.simpleExpression = simpleExpression
module.exports.ifExpressionObj = ifExpressionObj
module.exports.forLoopObj = forLoopObj
module.exports.logicalExpressionObj = logicalExpressionObj
module.exports.logicalFactorObj = logicalFactorObj
module.exports.checkPri = checkPri
module.exports.functionCallObj = functionCallObj
module.exports.funCalArgObj = funCalArgObj
module.exports.funArgsObj = funArgsObj
module.exports.forIndObj = forIndObj
module.exports.funArgObj = funArgObj
module.exports.logicalExpression = logicalExpression
module.exports.logicalFactor = logicalFactor
module.exports.relation = relation
module.exports.arithmeticExpression = arithmeticExpression
module.exports.termString = termString
module.exports.factorString = factorString
module.exports.primary = primary
module.exports.funCalPriString = funCalPriString
module.exports.nameString = nameString
module.exports.funCalArgString = funCalArgString
module.exports.comRefString = comRefString
module.exports.arrSubString = arrSubString
module.exports.funArgsString = funArgsString
module.exports.funArgString = funArgString
module.exports.namedArgsString = namedArgsString
module.exports.namedArgsArray = namedArgsArray
module.exports.outExpLisString = outExpLisString
module.exports.expLisString = expLisString
module.exports.forIndString = forIndString
module.exports.expressionString = expressionString
module.exports.ifExpString = ifExpString
module.exports.expressionListString = expressionListString
