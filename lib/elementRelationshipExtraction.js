const fs = require('fs');
const process = require('process');
const path = require('path');
const pa = require('./parser');
const ut = require('./util');

class ElementRelationshipExtractor {
    constructor(moFile, parentElementName, parsedFiles={}, outputDir=null) {
        if (parentElementName != null) {
            this.parentElementName = parentElementName;
        } else { 
            this.parentElementName = "";
        }

        this.model = moFile;
        if (outputDir == null) {
            this.outputDir = path.join(process.cwd(), 'output');
        } else {
            this.outputDir = outputDir;
        }
        this.elements = {};
        this.relationships = {};
        this.within = null;
        this.parsedFiles = parsedFiles;
    }

    runModelicaJson() { 
        var jsonOp = null;
        if (this.model in this.parsedFiles) {
            jsonOp = this.parsedFiles.get(this.model);
            this.within = jsonOp.get("within", null);
        } else {
            var modelPath = this.model

            /*
             * Changing A.B.C to A/B/C
             */
            if (!modelPath.endsWith(".mo")) {
                modelPath = modelPath.replace(/\./g, path.sep)
                modelPath+=".mo"
            } else {
                modelPath = modelPath.replace(/\./g, path.sep)
                modelPath = modelPath.replace(path.sep+"mo", ".mo")
            }

            var moFiles = ut.getMoFiles(modelPath);
            
            var topLevel = true;
            if (moFiles[0] == modelPath) {
                while ( moFiles[0] == modelPath && modelPath!=".mo") {
                    modelPath =  modelPath.split(path.sep).slice(0,-1).join(path.sep) + ".mo"
                    moFiles = ut.getMoFiles(modelPath)
                    topLevel = false;
                }
            }
            if (modelPath == ".mo") {
                return null
            }
            /*
             * Running modelica-json
             */
            pa.getJsons(moFiles, 'mo', 'json', this.outputDir, false);
            var jsonModelPath = path.join(this.outputDir, 'json', modelPath.replace(".mo", ".json"));
            
            if (fs.existsSync(jsonModelPath)) {
                jsonOp = JSON.parse(fs.readFileSync(jsonModelPath));                
                this.within = jsonOp["within"];
            }
            this.parsedFiles[this.model] = jsonOp
        }
        return jsonOp
    }

    extractClassDefinition(jsonOp, elements=null, relationships=null) {
        /*
        function to extract elements and relationships from "class_definition" Modelica token
        "class_definition": {
            "final": bool,
            "encapsulated": bool,
            "class_prefixes": class_prefixes,
            "class_specifier": class_specifier
        }
        json_op: dict
                json translation of the model
        elements: dict
                dictionary of elements and their type in the form: {ele: {"type_specifier": type, "..."}}
        relationships: dict
                dictionary of elements and the elements they are connected to in the form of {ele: [ele1, ele2...], ele1: [ele, el3, ..]}
        */

        if (elements == null) {
            elements = {}
        }
        if (relationships == null) {
            relationships = {}
        }
        
        if (jsonOp == null) {
            jsonOp = this.runModelicaJson()
            if (jsonOp == null) {
                return {"elements": {}, "relationships": {}}
            }
        }

        if ("class_definition" in jsonOp) {
            jsonOp["class_definition"].forEach(singleClassDefinition => {
                // TODO: handle replaceable
                var classSpecifier = singleClassDefinition["class_specifier"];
                var classPrefixes = singleClassDefinition["class_prefixes"];

                if ("short_class_specifier" in classSpecifier) {
                    var shortClassSpecifier = classSpecifier["short_class_specifier"]
                    var identifier = shortClassSpecifier["identifier"]
                    var value = shortClassSpecifier["value"]

                    var name = value["name"]
                    var newElement = null;

                    if (name != null) {
                        identifier = this.parentElementName+identifier;
                        newElement = {identifier: {"type_specifier": name}};
                    }

                    var enumList = value["enul_list"]
                    if (enumList != null && enumList.length > 0) {
                        var enumerations = [];

                        enumList.forEach(item => {
                            enumerations.push(item["identifier"] ? item["identifier"]: "");
                        });

                        identifier = this.parentElementName + identifier;
                        newElement = {identifier: {'type_specifier': 'Enumeration', 'values': enumerations}}
                    }
                    elements = {...elements, ...newElement}; 
                    // TODO: handle name[array_subscripts]
                }

                if ("der_class_specifier" in classSpecifier) {
                    // TODO
                }

                if ("long_class_specifier" in classSpecifier) {
                    var longClassSpecifier = classSpecifier["long_class_specifier"];
                    var identifier = longClassSpecifier["identifier"] ? longClassSpecifier["identifier"] : "";
                    var composition = longClassSpecifier["composition"] ? longClassSpecifier["composition"] : {};
                    var element_list = longClassSpecifier["element_list"] ? longClassSpecifier["element_list"] : [];

                    newElementsRelationships = this.parseElementList(element_list, elements=elements, relationships=relationships);
                    var newElements = newElementsRelationships["elements"]; 
                    var newRelationships = newElementsRelationships["relationships"]; 
                    elements = {...elements, ...newElements}; 
                    relationships = this.updateRelationships(relationships, newRelationships);

                    var elementSections = composition["element_sections"] ? composition["element_sections"]: [];

                    elementSections.forEach(elementSection => {
                        // Each element section only has 1 of public_element_list, protected_element_list, equation_section or algorithm_section

                        var publicElementList = elementSection["public_element_list"]? elementSection["public_element_list"]: [];
                        newElementsRelationships = this.parseElementList(publicElementList, elements=elements, relationships=relationships);
                        var newElements = newElementsRelationships["elements"]; 
                        var newRelationships = newElementsRelationships["relationships"]; 
                        elements = {...elements, ...newElements}; 
                        relationships = this.updateRelationships(relationships, newRelationships);

                        var protectedElementList = elementSection["protected_element_list"]? elementSection["protected_element_list"]: [];
                        newElementsRelationships = this.parseElementList(protectedElementList, elements=elements, relationships=relationships);
                        var newElements = newElementsRelationships["elements"]; 
                        var newRelationships = newElementsRelationships["relationships"]; 
                        elements = {...elements, ...newElements}; 
                        relationships = this.newRelationships(relationships, newRelationships);

                        var equationSection = elementSection["equation_section"]? elementSection["equation_section"]: {};
                        var newRelationships = this.parseEquationSection(equationSection);
                        relationships = this.newRelationships(relationships, newRelationships);
                    });
                }
            });
        }
        return {"elements": elements, "relationships": relationships};
    }
}

// obj = new ElementRelationshipExtractor(moFile="Buildings/Controls/OBC/ASHRAE/G36_PR1/TerminalUnits/Controller.mo", parentElementName=null)
// obj = new ElementRelationshipExtractor(moFile="Buildings.Controls.OBC.ASHRAE.G36_PR1.TerminalUnits.Controller", parentElementName=null)
obj = new ElementRelationshipExtractor(moFile="Buildings.Fluid.Types.CvTypes", parentElementName=null)
obj.runModelicaJson()

    /*   
    

    def parse_element_list(self, element_list, elements=None, relationships=None):
        """
            element_list: list(element)

            "element": {
            "import_clause": import_clause,
            "extends_clause": extends_clause,
            "redeclare": bool,
            "final": bool,
            "inner": bool,
            "outer": bool,
            "replaceable": bool,
            "constraining_clause": constraining_clause,
            "class_definition": class_definition,
            "component_clause": component_clause,
            "comment": comment
        }
        """ 
        if elements is None:
            elements = {}
        if relationships is None: 
            relationships = {}

        for single_element in element_list:
            if 'extends_clause' in single_element:
                extended_from_model = single_element.get('extends_clause').get('name')

                if (extended_from_model.startswith("Buildings")):
                    extends_mo = Element_Relationship_Extractor(mo_file = extended_from_model, parent_element_name=self.parent_element_name)
                    new_elements, new_relationships = extends_mo.extract_class_definition()
                    elements.update(new_elements)
                    relationships = self.update_relationships(relationships, new_relationships)
                elif not extended_from_model.startswith("Modelica"):
                    # if it is not buildings and not Modelica, should be within Buildings library
                    within = ""
                    new_elements = {}
                    new_relationships = {}
                    i = 1
                    while new_elements == {} and new_relationships == {} and within != self.within: 
                        within = '.'.join(self.within.split('.',i)[:i])
                        new_extended_from_model = within+"."+extended_from_model
                        extends_mo = Element_Relationship_Extractor(mo_file = new_extended_from_model, parent_element_name=self.parent_element_name)
                        new_elements, new_relationships = extends_mo.extract_class_definition()
                        i+=1
                    if new_elements == {} and new_relationships == {}:
                        new_extended_from_model = self.within+"."+extended_from_model
                        extends_mo = Element_Relationship_Extractor(mo_file = new_extended_from_model, parent_element_name=self.parent_element_name)
                        new_elements, new_relationships = extends_mo.extract_class_definition()

                    if new_elements != {} or new_relationships != {}:
                        # print("found new extends = {}".format(new_extended_from_model))
                        pass
                    else: 
                        # print("did not find extends = {} model={} parent = {}".format(extended_from_model, self.model, self.parent_element_name))
                        pass
                    elements.update(new_elements)
                    relationships = self.update_relationships(relationships, new_relationships)

                # handle redeclaration
                class_modifications = single_element.get("extends_clause").get("class_modification", [])
                for class_modification in class_modifications:
                    if class_modification.get("element_redeclaration", None) is not None:
                        type_specifier = class_modification.get("element_redeclaration",{}).get("component_clause1", {}).get("type_specifier", None)
                        identifier = class_modification.get("element_redeclaration",{}).get("component_clause1", {}).get("component_declaration1", {}).get("declaration", {}).get("identifier", None)
                        annotations = class_modification.get("element_redeclaration",{}).get("component_clause1", {}).get("component_declaration1", {}).get("description", {}).get('annotation', [])

                        semantic_info = ""

                        for annotation in annotations:
                            annotation_name = annotation.get('element_modification_or_replaceable', {}).get('element_modification', {}).get('name', None)
                            if annotation_name == "__semantic":
                                semantic_info = self.parse_semantic_annotation(annotation, standard='brick')

                        if type_specifier is not None and identifier is not None:
                            print("redeclaration element: {} of type {}".format(identifier, type_specifier))
                            identifier = self.parent_element_name+identifier
                            current_elements = elements.copy()
                            for item in current_elements:
                                # remove all items from the class that was redeclared
                                if item.startswith(identifier): 
                                    del elements[item]
                            new_elements, new_relationships = self.parse_single_component_list(type_specifier=type_specifier, type_prefix="", identifier=identifier, og_type_specifier="")
                            new_elements[identifier] = {"type_specifier": type_specifier, 
                                                        "type_prefix": class_modification.get("element_redeclaration",{}).get("component_clause1", {}).get("type_prefix", ""),
                                                        "semantic": semantic_info}
                            elements.update(new_elements)
                            relationships = self.update_relationships(relationships, new_relationships)

            if 'import_clause' in single_element:
                import_clause = single_element.get("import_clause", {})
                identifier = import_clause.get("identifier", None)
                name = import_clause.get("name", None)
                identifier = self.parent_element_name+identifier

                new_elements = {identifier: {"type_specifier": "import_clause", "name": name}}
                elements.update(new_elements)

            if 'class_definition' in single_element:
                if type(single_element.get("class_definition")) != list:
                    single_element["class_definition"] = [single_element.get("class_definition")]
                new_elements, new_relationships = self.extract_class_definition(json_op=single_element)
                elements.update(new_elements)
                relationships = self.update_relationships(relationships, new_relationships)

            if 'component_clause' in single_element:
                """
                    "component_clause": {
                        "type_prefix": type_prefix,x
                        "type_specifier": type_specifier,
                        "array_subscripts": array_subscripts, //nullable
                        "component_list": component_list
                    }
                """
                component_clause = single_element.get('component_clause')
                type_prefix = component_clause.get('type_prefix', None)
                type_specifier = component_clause.get('type_specifier', None)
                og_type_specifier = type_specifier

                ## check if type specifier is in import, if yes, change type_specifier to imported class
                extended_type_specifier = self.parent_element_name+type_specifier
                if extended_type_specifier in elements:
                    if elements.get(extended_type_specifier, {}).get("type_specifier", "") == "import_clause":
                        type_specifier = elements.get(extended_type_specifier, {}).get("name", None)
                    else: 
                        type_specifier = extended_type_specifier

                component_list = component_clause.get('component_list', [])
                
                new_elements = {}
                new_relationships = {}
                for single_component_list in component_list:
                    """
                        "component_list": list({
                            "declaration": declaration,
                            "condition_attribute": condition_attribute,
                            "comment": comment
                        })
                    """
                    identifier = single_component_list.get('declaration', {}).get('identifier', None)
                    identifier=self.parent_element_name+identifier
                    annotations = single_component_list.get('description', {}).get('annotation', [])
                    semantic_info = ""

                    for annotation in annotations:
                        annotation_name = annotation.get('element_modification_or_replaceable', {}).get('element_modification', {}).get('name', None)
                        if annotation_name == "__semantic":
                            semantic_info = self.parse_semantic_annotation(annotation, standard='brick')

                    if identifier not in new_elements:
                        # print("previous semantic = " + new_elements[identifier.rsplit('.', 1)[0]])
                        new_elements[identifier] = {
                            'type_specifier': type_specifier,
                            'type_prefix': type_prefix,
                            'semantic': semantic_info
                        }
                    else:
                        pass
                        # print("{} already exists! ".format(identifier))
                        # print("exising element: ", model_all_elements[identifier])
                        # print("existing models_to_parse: ", models_to_parse[current_mo_file])
                        # print("new type: ", type_specifier)
                        # print("new file: ", current_mo_file)

                    new_elements2, new_relationships2 = self.parse_single_component_list(type_specifier=type_specifier, type_prefix=type_prefix, identifier=identifier, og_type_specifier=og_type_specifier)
                    new_elements.update(new_elements2)
                    new_relationships = self.update_relationships(new_relationships, new_relationships2)
                        
                elements.update(new_elements)
                relationships = self.update_relationships(relationships, new_relationships)

        return elements, relationships

    def parse_single_component_list(self, type_specifier, type_prefix, identifier, og_type_specifier=None):
        new_elements2 = {}
        new_relationships2 = {}

        if self.parent_element_name != "" and type_specifier.startswith(self.parent_element_name):
            ## if type_specifier has been created in the same mo file (checked used same parent_element_name), then no need to parse model
            new_elements2 = {identifier: {"type_specifier": type_specifier}}
            ## TODO: what about relationships?
            new_relationships2 = {}
        elif type_specifier.startswith("Buildings.Examples"):
            # TODO: if parsed already, don't parse again
            single_component_mo = Element_Relationship_Extractor(mo_file=type_specifier, parent_element_name=identifier)
            new_elements2, new_relationships2 = single_component_mo.extract_class_definition()
        elif not type_specifier.startswith("Buildings") and not type_specifier.startswith("Modelica.") and type_specifier not in ["Real", "Integer", "Boolean", "String"] and not type_specifier.startswith("Medium"):
            ## assume type_specifier is in local package
            within = ""
            new_elements2 = {}
            new_relationships2 = {}
            i = 1
            while new_elements2 == {} and new_relationships2 == {} and within != self.within: 
                within = '.'.join(self.within.split('.',i)[:i])
                new_type_specifier = within+"."+type_specifier
                single_component_mo = Element_Relationship_Extractor(mo_file = new_type_specifier, parent_element_name=identifier)
                new_elements2, new_relationships2 = single_component_mo.extract_class_definition()
                i+=1
            if new_elements2 == {} and new_relationships2 == {}:
                new_type_specifier = self.within+"."+type_specifier
                single_component_mo = Element_Relationship_Extractor(mo_file = new_type_specifier, parent_element_name=identifier)
                new_elements2, new_relationships2 = single_component_mo.extract_class_definition()

            if new_elements2!={} or new_relationships2 != {}:
                # print("found new type_specifier = {} identifier = {} ".format(new_type_specifier, identifier))
                pass
            else: 
                print("did not find og_type_specifier={} type_specifier={} model={} parent={}".format(og_type_specifier, type_specifier, self.model, self.parent_element_name))
        return new_elements2, new_relationships2

    def update_relationships(self, relationships, new_relationships):
        for element in new_relationships:
            if element not in relationships:
                relationships[element] = new_relationships.get(element)
            else:
                for connected_element in new_relationships[element]:
                    if connected_element not in relationships[element]:
                        relationships[element].append(connected_element)
        return relationships
    
    def parse_equation_section(self, equation_section):
        equations = equation_section.get('equation', [])
        relationships = {}
        for equation in equations:
            connect_clause = equation.get('connect_clause', None)
            if connect_clause is not None:
                from_id = self.parse_component_reference(connect_clause.get("from"))
                to_id = self.parse_component_reference(connect_clause.get("to"))
                if self.parent_element_name is not None:
                    from_id = self.parent_element_name+ from_id
                    to_id = self.parent_element_name+ to_id
                
                if from_id in relationships:
                    if to_id not in relationships[from_id]:
                        relationships[from_id].append(to_id)
                else: 
                    relationships[from_id] = [to_id]
                
                # if to_id in relationships:
                #     if from_id not in relationships[to_id]:
                #         relationships[to_id].append(from_id)
                # else: 
                #     relationships[to_id] = [from_id]
                
        return relationships
    
    def parse_component_reference(self, component_reference):
        identifier = ""
        for item in component_reference:
            if item.get("dot_op", False):
                identifier+="."
            if item.get("identifier", None) is not None:
                identifier+=item.get("identifier")
            if item.get("array_subscripts") is not None:
                identifier+='[' + item.get("array_subscripts")[0].get("expression", {}).get("simple_expression") + ']'
        return identifier

    def parse_semantic_annotation(self, annotation, standard='brick'):
        class_modifications = annotation.get('element_modification_or_replaceable', {}).get('element_modification', {}).get('modification', {}).get('class_modification', [])
        semantic_data = ""
        for class_modification in class_modifications:
            element_modification = class_modification.get('element_modification_or_replaceable', {}).get('element_modification', {})
            standard_name = element_modification.get('modification', {}).get('expression', {}).get('simple_expression', None)
            standard_name = standard_name.replace('"', '')
            if standard_name is not None and standard_name == standard:
                semantic_data = element_modification.get('description_string', '')
        return semantic_data


def get_brick_type(semantic_info):
    if semantic_info != "":
        return BRICK[semantic_info.split(" ")[-1].split(":")[1]]
    return ""
    */