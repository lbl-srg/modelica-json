const fs = require('fs');
const process = require('process');
const path = require('path');
const pa = require('./parser');
const ut = require('./util');

/*
{
    "instance_a": {
        "type": "Buildings.Controls.OBC.CDL.Contious.GreaterThan",
        "annotation": {},
        "class_modification": {}
    },
    "required_references": {
        "extends_clause": [
            {
                "name": ...,
                "class_modification": {},
                "annotation": {}
            }
        ]
    }
}

*/

function extractInstances(jsonOutput) {
    var instances = {}

    var class_definitions = jsonOutput.class_definition
    for (let i=0; i<class_definitions.length; i++) {
        var long_class_specifier = null;
        var short_class_specifier = null;
        var der_class_specifier = null;

        var class_definition = class_definitions[i]
        var class_specifier = class_definition.class_specifier;
        if ('long_class_specifier' in class_specifier) {
            long_class_specifier = class_specifier.long_class_specifier;
            var new_instances = extractFromLongClassSpecifier(long_class_specifier)
            instances = Object.assign({}, instances, new_instances)
        }
        if ('short_class_specifier' in class_specifier) {
            var short_class_specifier = class_specifier.short_class_specifier;
            var identifier = short_class_specifier.identifier;
            var value = short_class_specifier.value;
            var name = null;

            if ('name' in value && value.name != undefined) {
                name = value.name;
                instances[identifier] = {
                    "type": "short_class_specifier", 
                    "type_specifier": name,
                    "short_class_specifier_value": value
                }
            }
            else if ('enum_list' in value && value.enum_list != undefined) {
                var enum_list = value.enum_list

                for (let j=0; j<enum_list.length; j++) {
                    var enum_list_identifier = enum_list[j].identifier;
                    instances[enum_list_identifier] = {
                        "type": "enumeration",
                        "enumeration_literal": enum_list[j]
                    }
                }
            }
        }
        if ('der_class_specifier' in class_specifier != null) {
            der_class_specifier = class_specifier.der_class_specifier;
        }

        // console.log(short_class_specifier)
        // console.log(der_class_specifier)
    }
    console.log("instances = ", instances)
    return instances
}

function extractFromLongClassSpecifier(long_class_specifier) {
    var instances = {}
    var identifier = null;
    var composition = null;
    var composition_instances = {}
    var dict_identifier = {}

    if ('identifier' in long_class_specifier) {
        identifier = long_class_specifier.identifier
        dict_identifier['type']= "long_class_specifier"
    }

    if (long_class_specifier.extends != null) {
        // console.log("extends exist")
        dict_identifier['extends'] = true;
        var class_modification = null;
        if ('class_modification' in long_class_specifier) {
            class_modification = class_modification
            // TODO: handle later
        }
        
    } 
    if ('composition' in long_class_specifier) {
        composition = long_class_specifier.composition
        // console.log(composition)
        composition_instances = extractFromComposition(composition)
    }
    if (identifier != null) {
        instances[identifier] = dict_identifier
    }
    if (composition_instances != {}) {
        instances = Object.assign({}, instances, composition_instances)
    }
    return instances
}

function extractFromComposition(composition) {
    var element_list = null;
    var element_sections = null;
    var external_composition = null;
    var instances = {};

    if ('element_list' in composition) {
        element_list = composition.element_list
        var new_instances = extractFromElementList(element_list)
        instances = Object.assign({}, instances, new_instances)
        // console.log(instances)
    }

    if ('element_sections' in composition) {
        element_sections = composition.element_sections
        // TODO: handle later
    }

    if ('external_composition' in composition) {
        external_composition = composition.external_composition
        // TODO: 
    }
    return instances
    // const eleLisObj = com.element_list
    // const eleLis = !ut.isEmptyObject(eleLisObj) ? this.elementList(com.element_list) : undefined
    // const eleSecObj = com.element_sections
    // const eleSec = (eleSecObj.length > 0) ? this.elementSections(com.element_sections) : undefined
    // const extCom = com.external_composition
    // const extComObj = extCom ? this.externalComposition(extCom) : undefined
    // const ann = com.annotation ? com.annotation.class_modification : null
    // const annObj = ann ? this.classModification(ann) : undefined
}

function extractFromElementList(element_list) {
    var instances = {}
    for(let i=0; i<element_list.length; i++) {
        var element = element_list[i]
        
        if ('extends_clause' in element && element.extends_clause != undefined) {
            var extends_clause = element.extends_clause

            if ('required_references' in instances) {
                if ('extends_clause' in instances['required_references']) {
                    instances['required_references']['extends_clause'].concat([extends_clause])
                } else {
                    instances['required_references']['extends_clause'] = [extends_clause]
                }
            } else {
                instances['required_references'] = {
                    "extends_clause": [extends_clause]
                }
            }
        }
        if ('import_clause' in element && element.import_clause != undefined) {
            var import_clause = element.import_clause
            if ('required_references' in instances) {
                if ('import_clause' in instances['required_references']) {
                    instances['required_references']['import_clause'].concat([import_clause])
                } else {
                    instances['required_references']['import_clause'] = [import_clause]
                }
            } else {
                instances['required_references'] = {
                    "import_clause": [import_clause]
                }
            }
        }
        if ('class_definition' in element && element.class_definition != undefined) {
            var jsonOp = {"class_definition": [element.class_definition]}
            var new_instances = extractInstances(jsonOp)
            instances = Object.assign({}, instances, new_instances)
        }
        if ('component_clause' in element && element.component_clause != undefined) {
            var component_clause = element.component_clause
            var type_prefix = null;
            var type_specifier = null;
            var array_subscripts = null;

            var component_list = component_clause.component_list
            type_prefix = component_clause.type_prefix
            type_specifier = component_clause.type_specifier
            array_subscripts = component_clause.array_subscripts

            for (let i=0; i<component_list.length; i++) {
                var single_component_list = component_list[i]
                var identifier = single_component_list.declaration.identifier
                instances[identifier] = {
                    "type_prefix": type_prefix,
                    "type_specifier": type_specifier,
                    "array_subscripts": array_subscripts,
                    "type": "element",
                    "single_component_list": single_component_list
                }
            }
        }
        // if 'component_clause' in single_element:
        //     """
        //         "component_clause": {
        //             "type_prefix": type_prefix,x
        //             "type_specifier": type_specifier,
        //             "array_subscripts": array_subscripts, //nullable
        //             "component_list": component_list
        //         }
        //     """
        //     component_clause = single_element.get('component_clause')
        //     type_prefix = component_clause.get('type_prefix', None)
        //     type_specifier = component_clause.get('type_specifier', None)
        //     og_type_specifier = type_specifier

        //     ## check if type specifier is in import, if yes, change type_specifier to imported class
        //     extended_type_specifier = self.parent_element_name+type_specifier
        //     if extended_type_specifier in elements:
        //         if elements.get(extended_type_specifier, {}).get("type_specifier", "") == "import_clause":
        //             type_specifier = elements.get(extended_type_specifier, {}).get("name", None)
        //         else: 
        //             type_specifier = extended_type_specifier

        //     component_list = component_clause.get('component_list', [])
            
        //     new_elements = {}
        //     new_relationships = {}
        //     for single_component_list in component_list:
        //         """
        //             "component_list": list({
        //                 "declaration": declaration,
        //                 "condition_attribute": condition_attribute,
        //                 "comment": comment
        //             })
        //         """
        //         identifier = single_component_list.get('declaration', {}).get('identifier', None)
        //         identifier=self.parent_element_name+identifier
        //         annotations = single_component_list.get('description', {}).get('annotation', [])
        //         semantic_info = ""

        //         for annotation in annotations:
        //             annotation_name = annotation.get('element_modification_or_replaceable', {}).get('element_modification', {}).get('name', None)
        //             if annotation_name == "__semantic":
        //                 semantic_info = self.parse_semantic_annotation(annotation, standard='brick')

        //         if identifier not in new_elements:
        //             # print("previous semantic = " + new_elements[identifier.rsplit('.', 1)[0]])
        //             new_elements[identifier] = {
        //                 'type_specifier': type_specifier,
        //                 'type_prefix': type_prefix,
        //                 'semantic': semantic_info
        //             }
        //         else:
        //             pass
        //             # print("{} already exists! ".format(identifier))
        //             # print("exising element: ", model_all_elements[identifier])
        //             # print("existing models_to_parse: ", models_to_parse[current_mo_file])
        //             # print("new type: ", type_specifier)
        //             # print("new file: ", current_mo_file)

        //         new_elements2, new_relationships2 = self.parse_single_component_list(type_specifier=type_specifier, type_prefix=type_prefix, identifier=identifier, og_type_specifier=og_type_specifier)
        //         new_elements.update(new_elements2)
        //         new_relationships = self.update_relationships(new_relationships, new_relationships2)
    }
    return instances
}

module.exports.extractInstances = extractInstances;
