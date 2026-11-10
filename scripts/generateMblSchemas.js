#!/usr/bin/env node
/**
 * Generate schema-cdl-mbl.json and schema-modelica-mbl.json.
 *
 * schema-cdl.json and schema-modelica.json check the rules of the specifications only.
 * The conventions of the Modelica Buildings Library are held here as data, and added to
 * a copy of these schemas. Each generated schema is thus complete, and can be used alone.
 *
 * Do not edit the generated files: edit the base schemas or the rules below,
 * and run 'npm run generate-schema-mbl'.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

// Files that have no 'Documentation' or 'defaultComponentName' rule.
const NOT_DOCUMENTED = '(^|[\\\\/])(package\\.mo|Modelica)([\\\\/]|$)'
// Further files that have no 'defaultComponentName' rule.
const NOT_INSTANTIATED = '(^|[\\\\/])(Validation|Examples)([\\\\/]|$)'

// Properties that are required, as [definition, path of the object in this definition, property, schemas].
// A class without composition has no class annotation. In Modelica, this is valid for
// 'redeclare record extends', which has none, so this is not a rule for these classes.
const REQUIRED_PROPERTIES = [
  ['long_class_specifier', [], 'composition', ['cdl']], // Class annotation of an empty class
  ['long_class_specifier', [], 'description_string', ['cdl', 'modelica']], // Class description string
  ['composition', [], 'annotation', ['cdl', 'modelica']], // Class annotation
  ['enum_list', ['items'], 'description', ['cdl', 'modelica']], // Description of enumeration literals
  ['descriptionSchema', [], 'description_string', ['cdl', 'modelica']] // A description has a description string
]

// Class annotations that are required, with the schemas they apply to and the patterns of the files that are exempt.
const REQUIRED_ANNOTATIONS = [
  { name: 'Documentation', schemas: ['cdl', 'modelica'], except: [NOT_DOCUMENTED] },
  { name: 'defaultComponentName', schemas: ['cdl'], except: [NOT_DOCUMENTED, NOT_INSTANTIATED] }
]

/**
 * Rule on the description of instances, added to the items of 'element_list'.
 * The description of a replaceable instance with a constraining clause
 * is stored with the element rather than with the component.
 */
const INSTANCE_DESCRIPTION = [
  {
    if: { required: ['component_clause'], not: { required: ['constraining_clause'] } },
    then: {
      properties: {
        component_clause: {
          properties: { component_list: { items: { required: ['description'] } } }
        }
      }
    }
  },
  {
    if: { required: ['component_clause', 'constraining_clause'] },
    then: { required: ['description'] }
  }
]

/**
 * Rule that the annotation of the class stored in a file has a given entry.
 * Only long class specifiers have a class annotation.
 *
 * @param {Object} rule entry of REQUIRED_ANNOTATIONS
 * @returns {Object} JSON schema
 */
function annotationRule (rule) {
  return {
    if: {
      required: ['fullMoFilePath'],
      properties: {
        fullMoFilePath: { allOf: rule.except.map(pattern => ({ not: { pattern } })) }
      }
    },
    then: {
      properties: {
        stored_class_definitions: {
          items: [{
            properties: {
              class_specifier: {
                properties: {
                  long_class_specifier: {
                    properties: {
                      composition: {
                        properties: {
                          annotation: {
                            contains: {
                              required: ['element_modification_or_replaceable'],
                              properties: {
                                element_modification_or_replaceable: {
                                  required: ['element_modification'],
                                  properties: {
                                    element_modification: {
                                      required: ['name'],
                                      properties: { name: { const: rule.name } }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }]
        }
      }
    }
  }
}

/**
 * Add a property to the 'required' list of an object.
 *
 * @param {Object} object object of a JSON schema
 * @param {string} property name of the property
 */
function addRequired (object, property) {
  object.required = [...(object.required ?? []), property].filter((v, i, a) => a.indexOf(v) === i)
}

/**
 * Generate a schema with the project rules.
 *
 * @param {string} name 'cdl' or 'modelica'
 * @returns {string} content of the generated file
 */
function generate (name) {
  const baseFile = `schema-${name}.json`
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, baseFile), 'utf8'))

  schema.$id = `schema-${name}-mbl.json`
  schema.title = `${schema.title}, with the project rules of the Modelica Buildings Library`
  schema.$comment = `Generated from ${baseFile} by scripts/generateMblSchemas.js. Do not edit.`

  REQUIRED_PROPERTIES.filter(rule => rule[3].includes(name)).forEach(([definition, objectPath, property]) => {
    addRequired(objectPath.reduce((o, key) => o[key], schema.definitions[definition]), property)
  })
  schema.definitions.element_list.items.allOf = INSTANCE_DESCRIPTION
  schema.allOf = REQUIRED_ANNOTATIONS.filter(rule => rule.schemas.includes(name)).map(annotationRule)

  return JSON.stringify(schema, null, 2) + '\n'
}

if (require.main === module) {
  ['cdl', 'modelica'].forEach(name => {
    const file = `schema-${name}-mbl.json`
    fs.writeFileSync(path.join(ROOT, file), generate(name))
    console.log(`Generated ${file}`)
  })
}

module.exports.generate = generate
