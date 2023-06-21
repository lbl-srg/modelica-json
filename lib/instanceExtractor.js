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
        composition_instances = extractFromComposition(composition, long_class_specifier_identifier=identifier)
    }
    if (identifier != null) {
        instances[identifier] = dict_identifier
    }
    if (composition_instances != {}) {
        instances = Object.assign({}, instances, composition_instances)
    }
    return instances
}

function extractFromComposition(composition, long_class_specifier_identifier) {
    var element_list = null;
    var element_sections = null;
    var external_composition = null;
    var instances = {};

    if ('element_list' in composition && composition.element_list != undefined) {
        element_list = composition.element_list
        var new_instances = extractFromElementList(element_list, long_class_specifier_identifier)
        instances = Object.assign({}, instances, new_instances)
        // console.log(instances)
    }

    if ('element_sections' in composition && composition.element_sections != undefined) {
        element_sections = composition.element_sections
        for (let i=0; i<element_sections.length; i++) {
            var element_section = element_sections[i]
            if ('public_element_list' in element_section && element_section.public_element_list != undefined) {
                public_element_list = element_section.public_element_list
                var new_instances = extractFromElementList(public_element_list, long_class_specifier_identifier)
                instances = Object.assign({}, instances, new_instances)
            }
            if ('protected_element_list' in element_section && element_section.protected_element_list != undefined) {
                protected_element_list = element_section.protected_element_list
                var new_instances = extractFromElementList(protected_element_list, long_class_specifier_identifier)
                instances = Object.assign({}, instances, new_instances)
            }
        }
    }

    if ('external_composition' in composition && composition.external_composition != undefined) {
        external_composition = composition.external_composition
        // TODO: 
    }
    return instances
}

function extractFromElementList(element_list, long_class_specifier_identifier) {
    var instances = {}
    for(let i=0; i<element_list.length; i++) {
        var element = element_list[i]
        
        if ('extends_clause' in element && element.extends_clause != undefined) {
            var extends_clause = element.extends_clause
            if (long_class_specifier_identifier != null) {
                extends_clause['long_class_specifier_identifier'] = long_class_specifier_identifier
            }

            if ('required_references' in instances) {
                if ('extends_clause' in instances.required_references) {
                    instances['required_references']['extends_clause'] = instances['required_references']['extends_clause'].concat([extends_clause])
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
            if (long_class_specifier_identifier != null) {
                import_clause['long_class_specifier_identifier'] = long_class_specifier_identifier
            }
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
                    "long_class_specifier_identifier": long_class_specifier_identifier,
                    "single_component_list": single_component_list
                }
            }
        }
    }
    return instances
}

module.exports.extractInstances = extractInstances;
