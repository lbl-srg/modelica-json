# Modelica to JSON parser

[![Build Status](https://travis-ci.org/lbl-srg/modelica-json.svg?branch=master)](https://travis-ci.org/lbl-srg/modelica-json)

This is a parser that parses Modelica to JSON,
and from JSON to different output formats.

See the directory `test/FromModelica` for simple examples.

The parser requires Java and node, which can be installed on Ubuntu using
```
sudo apt-get install nodejs npm default-jdk
```

To install dependencies of the parser, run
```
make install
```
To compile the Java files, run
```
make compile
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

# JSON Schemas

The simplified JSON representation of Modelica and CDL models must be compliant with the corresponding JSON Schema.

JSON Schemas describe the data format and file structure to ensure the quality of the JSON files.

Two schemas are available :
- [Schema-CDL.json](https://raw.githubusercontent.com/lbl-srg/modelica-json/issue55_JSONSchema/schema-CDL.json) validates the JSON files parsed from CDL
- [Schema-modelica.json](https://raw.githubusercontent.com/lbl-srg/modelica-json/issue55_JSONSchema/schema-modelica.json) validates the JSON files parsed from Modelica models

When parsing a file using `app.js`, the schema is chosen according to the mode.

To validate an existing JSON file against the schema, run

```
node validation.js -f <path to the json file>
```
The default schema is CDL. To chose the Modelica schema, run:

```
node validation.js -f <path to the json file> -m modelica
```
# License

Modified 3-clause BSD, see [LICENSE.md](LICENSE.md).

# Copyright

See [copyright notice](COPYRIGHT.md).
