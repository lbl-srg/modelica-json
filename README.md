# [Modelica to JSON parser](https://github.com/lbl-srg/modelica-json)

[![Build Status](https://api.travis-ci.com/lbl-srg/modelica-json.svg?branch=master)](https://app.travis-ci.com/github/lbl-srg/modelica-json)

## 1. General Description

__modelica-json__ is a translator that parses the Modelica and Control Description Language (CDL) models to JSON (and other formats from JSON).
For more information on the CDL Language, please refer to the [OpenBuildingControl](http://obc.lbl.gov/specification/cdl.html) project website.
CDL has been published as ASHRAE Standard 231.

See the directory `test/FromModelica` from __modelica-json__ for simple examples from Modelica and CDL to the different output formats.

## 2. Installation and help

### Linux

First, set the MODELICAPATH environment variable by adding the following line to your ~/.bashrc file:
```
export MODELICAPATH=${MODELICAPATH}:/usr/local/Modelica/Library/
```

Notes:
- The MODELICAPATH should point to all Modelica libraries you use in the models you want to convert, e.g. Modelica Standard Library, Modelica Buildings Library etc.
- The library roots in MODELICAPATH shall exactly match the library names and shall not be suffixed by the library version number.
- You do not need to have any Modelica-IDE installed on your device (e.g. OpenModelica).

The parser requires node.js. The node version should be >= 20 and you can use [Node Version Manager](https://nodejs.org/en/download/package-manager) to set it up. Following is using 0.40.3 version:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

To install dependencies of the parser, run
```
make install
```
To run the test cases, run
```
npm test
```
To get more help, run
```
node app.js -h
```
To clean the current installation, run
```
make clean-installation
```

### Windows

- First, make sure that both the `modelica-json` directory and the `Modelica Buildings Library` directory are in the folders that do not require administrator access.
  By saving the directories in driver other than `C:\` would typical avoid the administrator access issue.

- Then, create the `MODELICAPATH` environment variable and set the value as the path of Modelica Buildings Library, like `E:\modelica-buildings` or `E:\modelica-buildings-master`.

- Add `path\to\your\nodejs` to the `Path` environment.

- Finally, to install dependencies, run `InstallOnWindows.bat`.

To test the installation, from the `\modelica-json` directory, run the parser on Command Prompt:
```
node app.js -i test\FromModelica\Enable.mo
```

Now the `\modelica-json` directory should have a new folder `json` and in the folder, there should be a file in the path `FromModelica\Enable.json`.

## 3. How to use the parser

The parser can be run with the app.js file as follows:
```
node app.js -i <path of the file to parse>
```
You can use the parser from a different directory by setting the `MODELICAJSONPATH` environment variable to the location of the `modelica-json` directory.

The parser can then be run with the app.js file as follows:

### Linux
```
node $MODELICAJSONPATH/app.js -i <path of the file to parse>
```

### Windows
```
node %MODELICAJSONPATH%\app.js -i <path of the file to parse>
```

The command line is

```
node app.js -i PATH [-o FORMAT[,FORMAT...]] [-d DIR] [--validate cdl|cdl-mbl|modelica|modelica-mbl|SCHEMA] [--exclude PATTERN]... [--elementary] [-p]
```

Each option answers one question: `-i` gives the input, `-o` the outputs to write, `--validate` the schema against which the classes are validated, and `--exclude` the input classes to leave out.

#### Arguments :

##### --input / -i
The only required input: a Modelica file, a package directory, or a class name such as `Buildings.Controls.OBC.CDL.Reals.Add`, which is looked up in `MODELICAPATH`. With the output `modelica`, a JSON file, or a directory that contains JSON files.

`-f` / `--file` is a deprecated alias of `-i` / `--input`.

##### --output / -o

Comma-separated list of the outputs to write, such as `-o json,cxf`. The default is `modelica` for a JSON file, or a directory that contains JSON files and no Modelica file, and `json` otherwise, that is for a Modelica file, a package directory or a class name. Only the requested outputs are written: the intermediate files, such as the `json` files used to generate the `cxf` files, are only written if they are requested. Each output is written to `<directory>/<format>/`, at the path of the class given by its `within` clause and its name, such as `json/Buildings/Controls/OBC/CDL/Reals/Add.json`.

- **raw-json** : detailed transcription of a Modelica file in JSON. Only the input is read.
- **json**: simplified JSON format, easier to read and interpret, for the input classes and all their used classes, including the CDL elementary blocks.
- **semantic**: generate semantic model from semantic information included within `annotation` in the Modelica file, written to `semantic/<language>/`.
- **cxf**: generate CXF representation in `.jsonld` of a CDL sequence complying with ASHRAE S231, see [Exporting to CXF](#exporting-to-cxf).
- **cxf-core**: generate `cxf-core/CXF-Core.jsonld`, which merges the CXF of the input classes, except the classes of the `Validation` packages, with the classes and properties of S231, see [CXF-Core.jsonld](#5-cxf-corejsonld). The classes used by the input classes are not added, so the CDL elementary blocks are only included if they are input classes, as with `-i .../CDL`.
- **doc**: create the documentation of the sequence of operation in an HTML document, written to `doc/<class path>.html`, with the images in the subdirectory `img`.
- **doc+**: create the documentation of the sequence of operation and the list of all variables in an HTML document, written as `doc`.
- **modelica**: convert the JSON files given by `-i`, in the simplified JSON format, to Modelica. Only the input is read, so this output cannot be combined with the other ones.

##### --validate

Validate the parsed classes:

- `cdl` checks the CDL compliance with the CDL specification only: `schema-cdl.json`, and the rules that a schema cannot express, see [CDL compliance](#cdl-compliance).
- `cdl-mbl` adds the project rules of the Modelica Buildings Library: `schema-cdl-mbl.json`, which includes all of `schema-cdl.json`, and the same rules.
- `modelica` validates the classes against `schema-modelica.json`. The parser already enforces the grammar, so this only checks that the JSON has the expected structure.
- `modelica-mbl` adds the project rules: `schema-modelica-mbl.json`, which includes all of `schema-modelica.json`.
- Any other value is the path to a JSON schema, which must be self-contained: a `$ref` to another file is not resolved.

The keywords find their schema in the modelica-json installation, whatever the current directory.

With `cdl` and `cdl-mbl`, the input classes and all their used classes, including the classes they extend, are checked, except the CDL elementary blocks and the extension blocks, whose used classes are not followed either. Otherwise, the schema is applied to the input classes and to all their used classes, including the classes they extend, without exception. With `modelica-mbl`, all these classes are followed, but only the classes of the Modelica Buildings Library are validated, as the project rules only apply to this library. With the output `cxf`, the exported classes are validated.

If a class is not valid, all errors of all classes are printed, the output files are written, and the run exits with an error.

Without `--validate`, nothing is validated, except for the output `cxf`: the exported classes are always checked with `cdl`, as the CXF of a class that is not CDL-compliant is meaningless. A value passed with `--validate` is checked in addition, and never changes what is exported. `--validate` is rejected for the outputs `raw-json` and `modelica`, which have nothing to validate.

##### --exclude

Pattern of the names of the input classes that are neither parsed, validated nor written. The option can be repeated, which is the same as joining the patterns with `|`.

The input classes are the class given by `--input`, or, if `--input` is a package or a directory, all the classes stored in it and in its subdirectories, at any depth. Each pattern is tested against the full name of each of these classes.

- `*` matches within one component of the class name: `Buildings.*.Foo` matches `Buildings.Bar.Foo`, but not `Buildings.Bar.Baz.Foo`.
- `**` matches across components: `**.Validation` matches `Buildings.Controls.Validation`.
- `|` separates alternatives, at the top level or in parentheses: `'**.Validation|Modelica.Icons'`, `'**.(Validation|Examples)'`.
- A pattern must match the whole name of a class. A pattern that matches a package also excludes all the classes in this package.

This only applies to the input classes, so a class that is only reached through an excluded class is not parsed either. A class used by a class that is not excluded is always parsed and validated, whatever its name, even if it is an input class that matches a pattern: if it is not compliant, the class that uses it is not compliant either. The option is rejected for the output `modelica`.

Patterns must be quoted, as `*` and `|` are special characters for the shell. For instance, validation models are `model` classes, which are not CDL-compliant. To check a package without them, use:

```
node app.js -i Buildings/Controls/OBC -o json --validate cdl-mbl --exclude '**.Validation'
```

##### --elementary

With the output `cxf`, also write the CXF of the CDL elementary blocks used by the exported classes. The input classes are always exported, even if they are elementary blocks. This option is rejected for the other outputs.

##### --log / -l

Logging level. The choices are `error`, `warn`, `info` (default), `verbose`, `debug`.

##### --directory / -d

Specify the output directory. The default option is the current directory, for all outputs.

##### --pretty-print / -p

If `-p` flag is specified, the JSON output conforms to prettyprint. The default option is `false`. `--prettyPrint` is an alias.

##### Deprecated options

- `-f` / `--file` is an alias of `-i` / `--input`.
- `--cxfCore` replaces the output `cxf` with `cxf-core`: use `-o cxf-core`. `--elementary`, which `--cxfCore` required, is not needed, as `cxf-core` contains the CXF of the input classes, whether they are elementary blocks or not.
- `-m cdl` with the output `json` is replaced with `--validate cdl-mbl`. Otherwise, `-m` is ignored. Without `-m`, the output `json` is not validated.

A warning is printed when these options are used.

| Former command | Command |
| :--- | :--- |
| `-f X.mo -o json` | `-i X.mo -o json --validate cdl-mbl`, now with the elementary blocks |
| `-f X.mo -o json -m modelica` | `-i X.mo -o json --validate modelica-mbl`, now with all used classes |
| `-f X.mo -o cxf -m modelica` | `-i X.mo -o cxf` |
| `-f .../CDL -o cxf --cxfCore --elementary` | `-i .../CDL -o cxf-core` |
| `-f Buildings/Controls/OBC -o json -m cdl` | `-i Buildings/Controls/OBC -o json --validate cdl-mbl --exclude '**.Validation'` |

#### Exporting to CXF

With `-o cxf`, the part of each input class to export is found in this order:

1. If the input class is CDL-compliant, with the CDL specification only, the input class and its used classes are exported, except the classes of the Modelica Standard Library, and the CDL elementary blocks unless `--elementary` is passed.
2. Otherwise, the instance annotated with `__cdl(isControls=true)` is exported, see below.
3. Otherwise, this is an error.

A control sequence is often instantiated within a larger Modelica model that is not itself CDL compliant, such as a Buildings library template. To translate only the control sequence to CXF, mark the control block with a `__cdl(isControls=true)` annotation:

```
node app.js -i <path of the Modelica model> -o cxf
```

The parser then exports the CXF representation of the control block, with its used classes, and of the model that instantiates it. The control block must be CDL-compliant. If the model is itself CDL-compliant, the whole model is exported, and the annotation is ignored.

The annotated control block is found in one of two ways:
- as a component instance declared directly in the model, for example `SubControllerForControlsExport subCon1 annotation(__cdl(isControls=true))`,
- or as a component redeclared in an extends clause, which is how the Buildings library templates select a controller, for example `extends Interfaces.VAVBox(redeclare replaceable Controls.G36VAVBoxCoolingOnly ctl annotation(__cdl(isControls=true)))`.

The search also descends into sub-models, so a control block nested inside an instantiated sub-model is found as well.

When the control block is redeclared in an extends clause, the redeclared type must satisfy the constrainedby constraint of the replaceable declaration it overrides, that is, it must be a subtype of the constraining type. If it is not, the parser stops with an error that names the redeclared type and the constraining type.

To keep the translation focused on the control sequence, the parser does not instantiate the whole dependency tree of the Modelica model with the output `cxf` alone. Classes from the Buildings library or the Modelica Standard Library are skipped unless they belong to a Templates, Examples or Controls package, so non-control components such as a fan from Buildings.Fluid are not parsed. User defined classes are always parsed.

Examples of models that can be exported this way are provided in test/ModelicaMode. They include templates that redeclare their controller in an extends clause (VAVBoxCoolingOnly and VAVBoxCoolingOnlyOpenLoop) and models that instantiate a control block directly or through a sub-model (ModelWithControlsBlock and ModelWithControlsBlock2).

## 4. JSON Schemas

The JSON representation of Modelica models must be compliant with the following JSON Schema. This is applicable for the JSON output.

JSON Schemas describe the data format and file structure to ensure the quality of the JSON files.

The following schemas check the rules of the specifications only:
- [schema-modelica.json](schema-modelica.json) checks that the JSON files have the expected structure. As the parser already enforces the Modelica grammar, a failure points to a bug in modelica-json rather than in the model.
- [schema-cdl.json](schema-cdl.json) checks the rules of the [CDL specification](https://obc.lbl.gov/specification/cdl.html) that apply to a single class.

The following schemas add the project rules of the Modelica Buildings Library, such as required description strings and class annotations. They are generated from the schemas above by `npm run generate-schema-mbl`, with the rules held in `scripts/generateMblSchemas.js`, and must not be edited:
- [schema-modelica-mbl.json](schema-modelica-mbl.json)
- [schema-cdl-mbl.json](schema-cdl-mbl.json)

When parsing a file using `app.js`, the classes are validated against these schemas with `--validate`, see [--validate](#--validate). Any error makes the run fail. A single JSON file can also be validated with `validation.js`, see below.

### CDL compliance

Passing `schema-cdl.json` does not make a class CDL-compliant, as a schema validates one class at a time. `checkCdlCompliance` in `lib/cdlCompliance.js` is the only definition of CDL compliance: it returns the errors, and `isCdlCompliant` returns the verdict, for code that takes a decision based on it. It checks the given classes and, recursively, the composite blocks they use or extend, and adds the rules that a schema cannot express:
- A parameter (7.4.2) and a constant (7.4.3) are instances of a native data type: `Real`, `Integer`, `Boolean`, `String` or an enumeration (7.4.1).
- Any other instance of a block is a connector of the CDL package, an elementary block, a composite block (7.12), or an extension block (7.13). A composite block must be stored in its own file (7.12), and is checked in turn. The classes are checked by their content, not by their name: for instance, a block of the Modelica Standard Library is rejected because its connectors are not CDL connectors and its equations are not connections.
- A block can only extend a composite block (7.15).
- Connectors are in a public section (7.8), and their value is not set in their declaration (7.10).
- Expressions only call the functions of table 7.2 of the specification. Some expressions are stored as strings, in which case the check relies on the text of the expression.
- Two input connectors of instances cannot be connected together, and an input connector is connected to exactly one output connector. Connections to conditional instances are not counted for the latter. Connecting an input connector of the class to an input connector of an instance is standard.

CDL elementary blocks and extension blocks, that is the classes annotated with `__cdl(extensionBlock=true)`, are exempt from these checks, and the classes they use are not followed. The specification has no rule on the content of packages, so only the schema and the functions are checked for packages.

Graphical viewers are available (please use right click + open in a new tab or refresh the page if necessary - this is not optimized for Firefox) :
- [Modelica Schema viewer](https://lbl-srg.github.io/modelica-json/modelica-viz.html)
- [CDL Schema viewer](https://lbl-srg.github.io/modelica-json/cdl-viz.html)


## 5. CXF-Core.jsonld

[CXF-Core.jsonld](CXF-Core.jsonld) contains the CXF representation of all CDL elementary blocks, classes and relationships.

To generate the `CXF-Core.jsonld`, use:

```
node app.js -i <path/to/modelica-buildings>/Buildings/Controls/OBC/CDL -o cxf-core
```

The `CXF-Core.jsonld` file will be generated in `cxf-core` folder. It only contains the CXF of the classes parsed in this run, not of the files left in the output directory by earlier runs.

To validate an existing JSON file against a schema, run

```
node validation.js -i <path to the json file>
```
The default schema is `schema-cdl.json`. To choose another schema, use `--validate` with `cdl-mbl`, `modelica`, `modelica-mbl`, or the path of a schema:

```
node validation.js -i <path to the json file> --validate modelica
```

This only applies the schema to the JSON file: unlike `app.js -o json --validate cdl`, it does not check the rules of CDL compliance that a schema cannot express. `-f` is a deprecated alias of `-i`. The deprecated `-m cdl` and `-m modelica` are replaced with `--validate cdl-mbl` and `--validate modelica-mbl`, as the schemas included the project rules when this option was introduced.

## 6. Updating Grammar

This tool uses antlr4 to parse Modelica syntax. The grammar can be found
at `jsParser/antlrFiles/modelica.g4`. If you update the grammar file, you can run
the following command to regenerate the tokens, lexers and parsers that are used
by the classes in `jsParser/parser/`:

```
make update-grammar
```

## 7. Glossary

- **AST (Abstract Syntax Tree)**: A structural representation of the Modelica code.
  - `raw-json`: The parse tree of the Modelica file, transcribed as is. See [raw-json vs. json](#raw-json-vs-json).
  - `json`: A simplified version of `raw-json`, designed to be read and processed by downstream tools. See [raw-json vs. json](#raw-json-vs-json).
- **CXF (Control eXchange Format)**: The format defined by ASHRAE Standard 231 to exchange a sequence of operation described with CDL, written in JSON-LD. It describes the control logic and the components involved, see [Exporting to CXF](#exporting-to-cxf).
- **CDL-Compliant**: A Modelica class that follows the CDL specification of ASHRAE Standard 231, together with the composite blocks it uses. modelica-json checks it with `schema-cdl.json` and the rules that a schema cannot express, see [CDL compliance](#cdl-compliance).
- **CDL Elementary Block**: A block provided by the CDL library (`Buildings.Controls.OBC.CDL`), as opposed to a composite block, which is built by connecting instances of other blocks. The parser does not inspect the class: it decides from the full class name only, given by the `within` clause and the name of the file (`isCdlElementaryClass` in `lib/util.js`). A class is treated as an elementary block if its name starts with `Buildings.Controls.OBC.CDL.` and it is not in a `Validation` package. The definition therefore also covers connectors (`Interfaces`), types (`Types`), `Constants`, and the packages of the CDL library, but not `Buildings.Controls.OBC.CDL` itself. Elementary blocks are exempt from the check of CDL compliance, and their CXF is only written when they are input classes, or, with the output `cxf` and `--elementary`, when they are used by the exported classes.
- **Input Class**: A class given by `-i`: the class of a Modelica file, or, for a package or a directory, each class stored in it and in its subdirectories, except those matched by `--exclude`.
- **Used Class**: A class that another class depends on through a declaration. This covers the type of a component (`CDL.Reals.Add add`), the base class of an `extends` clause, the name in an `import` clause, a constraining class (`constrainedby ...`), and a type given in a `redeclare` or `replaceable` modification. Used classes are followed recursively: the classes used by a used class are also used classes. Classes that appear only inside equations or algorithms, such as functions, are not followed, nor are the classes referred to through a name made visible by an `import` clause, which is not resolved. With `-o cxf` alone, classes from the `Buildings` and `Modelica` libraries are not followed, unless their path contains a `Templates`, `Examples` or `Controls` package, see [Exporting to CXF](#exporting-to-cxf).

### raw-json vs. json

Both formats describe the same Modelica code, but they serve different purposes.

- **`raw-json`** mirrors the Modelica grammar one-to-one: each grammar rule produces a JSON object, even when it has a single child, and every optional keyword is written out with its default value (for example `"is_final": false`, `"inner": false`, `"encapsulated": false`). The result is verbose and deeply nested, so use it only if you need the exact grammar structure, for instance to develop or debug the parser.
- **`json`** is computed from `raw-json` and is the format that the `semantic` and `cxf` outputs are built from, through the `objects` files. It is the recommended format for most uses. Compared to `raw-json`, it:
  - removes the wrapper objects that have a single child, and the keywords left at their default value;
  - writes type and component names as dotted strings (`"Modelica.Units.SI.Temperature"` rather than a list of `name_parts`);
  - expands an expression into a `simple_expression` object only if it is a single function call (`abs(k)`), a relational or logical expression (`k > 1 and k < 3`), an `if` expression, or a `for` iterator, or if it contains a parenthesized sub-expression (`(k + 1)*k`). Arithmetic expressions that contain no parentheses, including those that contain function calls, are written as Modelica strings (`k*2 + 1` gives `"k*2 +1"`, `sin(k) + 1` gives `"sin(k) +1"`). The same applies at every nesting level, so the sub-expression `k + 1` in `(k + 1)*k` is written as `"k +1"`;
  - removes the escaped quotes around description strings, and stores them under `description_string` instead of `string_comment`;
  - can be validated against `schema-modelica.json` and, for CDL-compliant classes, `schema-cdl.json`, see [--validate](#--validate);
  - is generated for the input classes and for all their used classes, whereas `raw-json` covers only the input classes, see [--output](#--output---o).

**Example.** For the following Modelica file (`test/FromModelica/Parameter1.mo`):

```modelica
within FromModelica;
block Parameter1 "Some class comment"
  parameter Real kP = 1 "Some comment";
end Parameter1;
```

`raw-json` gives (formatted for readability; the actual output is on one line):

```json
{
  "within": "FromModelica",
  "final_class_definitions": [{
    "is_final": false,
    "class_definition": {
      "encapsulated": false,
      "class_prefixes": "block",
      "class_specifier": {
        "long_class_specifier": {
          "identifier": "Parameter1",
          "string_comment": "\"Some class comment\"",
          "composition": {
            "element_list": {
              "elements": [{
                "redeclare": false, "is_final": false, "inner": false, "outer": false, "replaceable": false,
                "component_clause": {
                  "type_prefix": "parameter",
                  "type_specifier": {"name": {"name_parts": [{"dot_op": false, "identifier": "Real"}]}},
                  "component_list": {
                    "component_declaration_list": [{
                      "declaration": {
                        "identifier": "kP",
                        "modification": {
                          "equal": true, "colon_equal": false,
                          "expression": {"simple_expression": {"logical_expression1": {"logical_term_list": [{
                            "logical_factor_list": [{"not": false, "relation": {"arithmetic_expression1": {
                              "arithmetic_term_list": [{"term": {"factors": [{"primary1": {
                                "unsigned_number": 1, "is_false": false, "is_true": false,
                                "function_call_primary": {"der": false, "initial": false}, "end": false
                              }}]}}]
                            }}}]
                          }]}}}
                        }
                      },
                      "comment": {"string_comment": "\"Some comment\""}
                    }]
                  }
                }
              }]
            },
            "element_sections": []
          },
          "is_extends": false
        }
      }
    }
  }],
  "modelicaFile": "FromModelica/Parameter1.mo",
  "checksum": "0e923225decf43f3a5d2909de067020a"
}
```

whereas `json` gives:

```json
{
  "within": "FromModelica",
  "stored_class_definitions": [{
    "class_prefixes": "block",
    "class_specifier": {
      "long_class_specifier": {
        "identifier": "Parameter1",
        "description_string": "Some class comment",
        "composition": {
          "element_list": [{
            "component_clause": {
              "type_prefix": "parameter",
              "type_specifier": "Real",
              "component_list": [{
                "declaration": {
                  "identifier": "kP",
                  "modification": {"equal": true, "expression": {"simple_expression": "1"}}
                },
                "description": {"description_string": "Some comment"}
              }]
            }
          }]
        }
      }
    }
  }],
  "modelicaFile": "FromModelica/Parameter1.mo",
  "fullMoFilePath": "/path/to/modelica-json/test/FromModelica/Parameter1.mo",
  "checksum": "0e923225decf43f3a5d2909de067020a"
}
```

In `raw-json`, the value `1` of `kP` is reached through `simple_expression` → `logical_expression1` → `logical_term_list` → `logical_factor_list` → `relation` → `arithmetic_expression1` → `arithmetic_term_list` → `term` → `factors` → `primary1` → `unsigned_number`. In `json`, it is simply `"simple_expression": "1"`.

## 8. Useful Links

- [Modelica-json GitHub page](https://github.com/lbl-srg/modelica-json)
- [The Modelica Association](https://www.modelica.org)
- [Control Description Language](http://obc.lbl.gov/specification/cdl.html)
- [JSON Schema](https://json-schema.org)

# Citation
To cite this software, use:

Wetter, M., Hu, J., Prakash, A., Ehrlich, P., Fierro, G., Grahovac, M., Pritoni, M., Rivalin, L. and Robin, D (2021). “Modelica-json:Transforming energy models to digitize the control deliveryprocess”. In:17-th IBPSA Conference. Intern. Building Per-formance Simulation Assoc. Brugge, Belgium, pp. 1–8. DOI:10.26868/25222708.2021.30141. URL: https://doi.org/10.26868/25222708.2021.30141.

```
@InProceedings{WetterHuPrakashEtAl2021,
  author = "Michael Wetter and Jianjun Hu and Anand Prakash and Paul Ehrlich and Gabe Fierro and Milica Grahovac and Marco Pritoni and Lisa Rivalin and Dave Robin",
  title = "Modelica-json: Transforming energy models to digitize the control delivery process",
  Booktitle = {17-th IBPSA Conference},
  Location = {Brugge, Belgium},
  Organization = {International Building Performance Simulation Association},
  pages = {1--8},
  month = sep,
  year = "2021",
  doi = {10.26868/25222708.2021.30141},
  url = {https://doi.org/10.26868/25222708.2021.30141}
}
```

# License

Modified 3-clause BSD, see [LICENSE.md](LICENSE.md).

# Copyright

See [copyright notice](COPYRIGHT.md).
