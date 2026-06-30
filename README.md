# [Modelica to JSON parser](https://github.com/lbl-srg/modelica-json)

[![Build Status](https://api.travis-ci.com/lbl-srg/modelica-json.svg?branch=master)](https://app.travis-ci.com/github/lbl-srg/modelica-json)

## 1. General Description

__modelica-json__ is a translator that parses the Modelica and Control Description Language (CDL) models to JSON (and other formats from JSON). 
For more information on the CDL Language, please refer to the [OpenBuildingControl ](http://obc.lbl.gov/specification/cdl.html) project website.
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
node app.js -f test\FromModelica\Enable.mo
```

Now the `\modelica-json` directory should have a new folder `json` and in the folder, there should be a file in the path `test\FromModelica\Enable.json`.

## 3. How to use the parser

The parser can be run with the app.js file as follows:
```
node app.js -f <path of the file to parse>
```
You can use the parser from a different directory by setting the `MODELICAJSONPATH` environment variable to the location of the `modelica-json` directory.

The parser can then be run with the app.js file as follows:

### Linux
```
node $MODELICAJSONPATH/app.js -f <path of the file to parse>
```

### Windows
```
node %MODELICAJSONPATH%\app.js -f <path of the file to parse>
```

#### Arguments :

##### --file / -f
The only required input is the path of the file or package to be parsed.

##### --output / -o

This parser takes a .mo file in input and has three possible outputs, that can be specified with the argument `-o`:

- **raw-json** : detailed transcription of a Modelica file in JSON
- **json**: simplified JSON format, easier to read and interpret
- **semantic**: generate semantic model from semantic information included within `annotation` in the Modelica file
- **cxf**: generate CXF representation in `.jsonld` of a CDL sequence complying with ASHRAE S231
- **doc**: create the documentation of the sequence of operation in an HTML document
- **doc+**: create the documentation of the sequence of operation and the list of all variables in an HTML document

##### --mode / -m

This argument is used to specify two parsing modes when generating a `cxf` output. We offer two different modes of translation that can be chosen with the argument -m :

- **cdl** (default) : Parses a CDL file to generate a CXF translation. 
- **modelica** : This mode is chosen when you want to parse a Modelica file and translate the CDL instances within the file (using `__cdl(isControls=true))` annotation) to CXF. 

##### --log / -l

Logging level. The choices are `error`, `warn`, `info` (default), `verbose`, `debug`.

##### --directory / -d

Specify the output directory. The default option is the current directory.

##### --prettyPrint / -p

If `-p` flag is specified, the JSON output conforms to prettyprint. The default option is `false`.

##### --elementary

If `--elementary` flag is specified, the CXF (jsonld) files for the elementary blocks are also generated. Else, they are ignored. The default option is `false`.
`-o`/`--output` should be `cxf`.

##### --cxfCore

If `--cxfCore` flag is specified, generate the  CXF-core.jsonld files for all the elementary blocks. The default option is `false`.
`-o`/`--output` should be `cxf`, `-f`/`--file` should be `path/to/CDL` and `--elementary` flag must be used.

#### Exporting controls from a Modelica model

A control sequence is often instantiated within a larger Modelica model that is not itself CDL compliant, such as a Buildings library template. To translate only the control sequence to CXF, parse the model with the modelica mode and mark the control block with a __cdl(isControls=true) annotation:

```
node app.js -f <path of the Modelica model> -o cxf -m modelica
```

The parser then exports the CXF representation of the control block and of the model that instantiates it. This export only happens when the mode is modelica and a control block carries the `__cdl(isControls=true)` annotation. In the default cdl mode the annotation is ignored.

The annotated control block is found in one of two ways:
- as a component instance declared directly in the model, for example `SubControllerForControlsExport subCon1 annotation(__cdl(isControls=true))`,
- or as a component redeclared in an extends clause, which is how the Buildings library templates select a controller, for example `extends Interfaces.VAVBox(redeclare replaceable Controls.G36VAVBoxCoolingOnly ctl annotation(__cdl(isControls=true)))`.

The search also descends into sub-models, so a control block nested inside an instantiated sub-model is found as well.

When the control block is redeclared in an extends clause, the redeclared type must satisfy the constrainedby constraint of the replaceable declaration it overrides, that is, it must be a subtype of the constraining type. If it is not, the parser stops with an error that names the redeclared type and the constraining type.

To keep the translation focused on the control sequence, the parser does not instantiate the whole dependency tree of the Modelica model in modelica mode. Classes from the Buildings library or the Modelica Standard Library are skipped unless they belong to a Templates, Examples or Controls package, so non-control components such as a fan from Buildings.Fluid are not parsed. User defined classes are always parsed.

Examples of models that can be exported this way are provided in test/ModelicaMode. They include templates that redeclare their controller in an extends clause (VAVBoxCoolingOnly and VAVBoxCoolingOnlyOpenLoop) and models that instantiate a control block directly or through a sub-model (ModelWithControlsBlock and ModelWithControlsBlock2).

## 4. JSON Schemas

The JSON representation of Modelica models must be compliant with the following JSON Schema. This is applicable for the JSON output.

JSON Schemas describe the data format and file structure to ensure the quality of the JSON files.

Following is the schema for the JSON translation (link to the raw file):
- [schema-modelica.json](schema-modelica.json) validates the JSON files parsed from Modelica models

Following is the schema for the JSON translation of the CDL-compliant sequences:
- [schema-cdl.json](schema-cdl.json) validates the JSON files parsed from CDL-compliant classes

Graphical viewers are available (please use right click + open in a new tab or refresh the page if necessary - this is not optimized for Firefox) :
- [Modelica Schema viewer](https://htmlpreview.github.io/?https://github.com/lbl-srg/modelica-json/blob/issue306_cdlSchema/schemaVisualization/modelica-viz.html)
- [CDL Schema viewer](https://htmlpreview.github.io/?https://github.com/lbl-srg/modelica-json/blob/issue306_cdlSchema/schemaVisualization/cdl-viz.html)


## 5. CXF-Core.jsonld

[CXF-Core.jsonld](CXF-Core.jsonld) contains the CXF representation of all CDL elementary blocks, classes and relationships.

To generate the `CXF-Core.jsonld`, use:

```
node app.js -f <path/to/modelica-buildings>/Buildings/Controls/OBC/CDL -o cxf --elementary --cxfCore
```

The `CXF-Core.jsonld` file will be generated in `cxf` folder.

When parsing a file using `app.js`, the schema is chosen according to the mode.

To validate an existing JSON file against the schema, run

```
node validation.js -f <path to the json file>
```
The default schema is CDL. To chose the Modelica schema, run:

```
node validation.js -f <path to the json file> -m modelica
```

## 6. Updating Grammar

This tool uses antlr4 to parse Modelica syntax. The grammar can be found 
at `jsParser/antlrFiles/modelica.g4`. If you update the grammar file, you can run 
the following command to regenerate the tokens, lexers and parsers that are used
by the classes in `jsParser/parser/`:

```
make update-grammar
```

## 7. Useful Links

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
