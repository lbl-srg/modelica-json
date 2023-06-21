const fs = require('fs');
const process = require('process');
const path = require('path');
const pa = require('./parser');
const ut = require('./util');

/*
{
    "instance_a": {
        "type": "element",
        "type_specifier": "...",
        "type_prefix": "...",
        "annotation": {},
        "class_modification": {},
        "long_class_specifier_identifier": "..."
    },
    "required_references": {
        "extends_clause": [
            {
                "name": ...,
                "long_class_specifier_identifier": ..
                "class_modification": {},
                "annotation": {}
            }
        ],
        "import_clause": [
            {
                ...
            }
        ],
    }
}

*/

function updateConnections(connections, new_connections) {
    if (new_connections!= null && new_connections != undefined) {
        for (var element in new_connections) {
            if (!(element in connections)) {
                connections[element] = new_connections[element].concat()
            }        
            else {
                new_connections[element].forEach(connected_element => {
                    if (!(connected_element  in connections[element])) {
                        connections[element] = connections[element].concat([connected_element])
                    }
                })
            }
        }
    }
    return connections
}


function extractInstances(jsonOutput) {
    var instances = {}
    var connections = {}

    var class_definitions = jsonOutput.class_definition
    for (let i=0; i<class_definitions.length; i++) {
        var long_class_specifier = null;
        var short_class_specifier = null;
        var der_class_specifier = null;

        var class_definition = class_definitions[i]
        var class_specifier = class_definition.class_specifier;
        if ('long_class_specifier' in class_specifier) {
            long_class_specifier = class_specifier.long_class_specifier;
            var [new_instances, new_connections] = extractFromLongClassSpecifier(long_class_specifier)
            instances = Object.assign({}, instances, new_instances)
            connections = updateConnections(connections, new_connections)
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
    }
    if ('required_references' in instances) {
        instances['required_references']['connections'] = connections
    } else {
        instances['required_references'] = {"connections": connections}
    }
    return instances
}

function extractFromLongClassSpecifier(long_class_specifier) {
    var instances = {}
    var connections = {}
    var identifier = null;
    var composition = null;
    var composition_instances = {}
    var composition_connections = {}
    var dict_identifier = {}

    if ('identifier' in long_class_specifier) {
        identifier = long_class_specifier.identifier
        dict_identifier['type']= "long_class_specifier"
    }

    if (long_class_specifier.extends != null) {
        dict_identifier['extends'] = true;
        var class_modification = null;
        if ('class_modification' in long_class_specifier) {
            class_modification = class_modification
            // TODO: handle later
        }
        
    } 
    if ('composition' in long_class_specifier) {
        composition = long_class_specifier.composition
        var [new_instances, new_connections] = extractFromComposition(composition, long_class_specifier_identifier=identifier)
        composition_instances = Object.assign({}, new_instances, composition_instances)
        composition_connections = updateConnections(composition_connections, new_connections)
    }
    if (identifier != null) {
        instances[identifier] = dict_identifier
    }
    if (composition_instances != {}) {
        instances = Object.assign({}, instances, composition_instances)
    }
    connections = updateConnections(connections, composition_connections)
    return [instances, connections]
}

function extractFromComposition(composition, long_class_specifier_identifier) {
    var element_list = null;
    var element_sections = null;
    var external_composition = null;
    var instances = {};
    var connections = {};

    if (composition == null || composition == undefined) {
        return [instances, connections]
    }

    if ('element_list' in composition && composition.element_list != undefined) {
        element_list = composition.element_list
        var [new_instances, new_connections] = extractFromElementList(element_list, long_class_specifier_identifier)
        instances = Object.assign({}, instances, new_instances)
        connections = updateConnections(connections, new_connections)
    }

    if ('element_sections' in composition && composition.element_sections != undefined) {
        element_sections = composition.element_sections
        for (let i=0; i<element_sections.length; i++) {
            var element_section = element_sections[i]
            if ('public_element_list' in element_section && element_section.public_element_list != undefined) {
                public_element_list = element_section.public_element_list
                var [new_instances, new_connections] = extractFromElementList(public_element_list, long_class_specifier_identifier)
                instances = Object.assign({}, instances, new_instances)
                connections = updateConnections(connections, new_connections)
            }
            if ('protected_element_list' in element_section && element_section.protected_element_list != undefined) {
                protected_element_list = element_section.protected_element_list
                var [new_instances, new_connections] = extractFromElementList(protected_element_list, long_class_specifier_identifier)
                instances = Object.assign({}, instances, new_instances)
                connections = updateConnections(connections, new_connections)
            }
            if ('equation_section' in element_section && element_section.equation_section != undefined) {
                var equation_section = element_section.equation_section
                var new_connections = extractConnectionsFromEquationSection(equation_section)
                connections = updateConnections(connections, new_connections)
            }
        }
    }

    if ('external_composition' in composition && composition.external_composition != undefined) {
        external_composition = composition.external_composition
        // TODO: 
    }
    return [instances, connections]
}

function extractFromElementList(element_list, long_class_specifier_identifier) {
    var instances = {}
    var connections = {}

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
            // connections = updateConnections(connections, new_connections)
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
    return [instances, connections]
}

function extractConnectionsFromEquationSection(equation_section) {
    var connections = {}
    var equations = null;
    if ('equation' in equation_section && equation_section.equation != undefined) {
        equations = equation_section.equation
        for (let i=0; i<equations.length; i++) {
            var equation = equations[i]
            var connect_clause = null;
    
            if ('connect_clause' in equation && equation.connect_clause != undefined) {
                var connect_clause = equation.connect_clause
                
                var from = parseComponentReference(connect_clause.from);
                var to = parseComponentReference(connect_clause.to);
                if (from in connections) {
                    if (!(to in connections[from])) {
                        connections[from] = connections[from].concat([to]);
                    }
                } else {
                    connections[from] = [to]
                }
            }
        }
    
    }
    return connections
}

function parseComponentReference(reference) {
    var name = "";
    reference.forEach(name_part => {
        if (name_part.dot_op == true) {
            name = name + "."
        }
        
        if (name_part.identifier != undefined) {
            name = name + name_part.identifier
        } 
        if (name_part.array_subscripts != undefined) {
            name = name + parseArraySubscripts(name_part.array_subscripts)
        } 
    });
    return name
}

function parseArraySubscripts(array_subscripts) {
    if (array_subscripts == undefined) {
        return ""
    } 
    if (array_subscripts.length == 0) {
        return ""
    }
    // TODO: fix better
    return "[" + array_subscripts[0].expression.simple_expression + "]"
}

module.exports.extractInstances = extractInstances;
