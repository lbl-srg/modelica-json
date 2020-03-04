---
layout: page
title: Modelica JSON
permalink: /index.html
---


# [Modelica to JSON parser](https://github.com/lbl-srg/modelica-json)

## Content
1. [General Description](## 1. General Description)
2. [Installation and help](## 2. Installation and help)
3. [How to use the parser](## 3. How to use the parser)
4. [JSON Schemas](## 4. JSON Schemas)
5. [Useful Links](## 5. Useful Links)

[![Build Status](https://travis-ci.org/lbl-srg/modelica-json.svg?branch=master)](https://travis-ci.org/lbl-srg/modelica-json)

## 1. General Description

[Modelica-json](https://github.com/lbl-srg/modelica-json) is a translator that parses the Modelica language to JSON, HTML and docx. Two translation modes have been implemented :
The first mode aims to parse Modelica packages and takes into input a directory of .mo files. The other mode aims to parse CDL files and takes a single .mo file compliant with the CDL language as input. For more information on the CDL Language, please refer to the [OpenBuildingControl ](http://obc.lbl.gov/specification/cdl.html) project website.

See the directory `test/FromModelica` from [Modelica-json](https://github.com/lbl-srg/modelica-json) for simple examples from Modelica and CDL to detailed and simplified JSON formats and HTML.

## 2. Installation and help

### Linux

First, set the MODELICAPATH environment variable by adding the following line to your ~/.bashrc file:
```
export MODELICAPATH=${MODELICAPATH}:/usr/local/Modelica/Library/
```

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

### Windows

- First, make sure that both the `modelica-json` directory and the `Modelica Buildings Library` directory are in the folders that do not require adminstrator access. 
  By saving the directories in driver other than `C:\` would typical avoid the adminstrator access issue.

- Then, create the `MODELICAPATH` environment variable and set the value as the path of Modelica Buildings Library, like `E:\modelica-buildings` or `E:\modelica-buildings-master`.

- Install [Java SE Development Kit (64-bit version)](https://www.oracle.com/java/technologies/javase-downloads.html), [Java Runtime Environment (64-bit version)](https://java.com/en/download/manual.jsp) and [Node.js](https://nodejs.org/en/download/).

- Finally, to install dependencies and compile the Java files, run batch file `InstallOnWindows.bat`.

To test the installation, from the `\modelica-json` directory, run the parser on Command Prompt:
```
node app.js -f test\FromModelica\Modulation.mo
```


## 3. How to use the parser

The parser can be run with the app.js file as follows:
```
node app.js -f <path of the file to parse>
```

#### Arguments :

##### --file / -f
The only required input is the path of the file or package to be parsed.

##### --output / -o

This parser takes a .mo file in input and has three possible outputs, that can be specified with the argument -o :

- **raw-json** : detailed transcription of a Modelica file in JSON
- **json**: simplified JSON format, easier to read an interpret
- **html** (default): transcription from json with links for documentation
- **docx** : transcription of the HTML documentation to an editable format

##### --mode / -m

We offer two different modes of translation that can be chosen with the argument -m :

- **modelica** : Parses a Modelica package (must be a directory)
- **cdl** (default) : Parses a CDL file.

##### --log / -l

Logging level. The choices are 'error', 'warn', 'info' (default), 'verbose', 'debug'.

##### --directory / -d

Specify the output directory. The default option is the current directory.


## 4. JSON Schemas

The JSON representation of Modelica and CDL models must be compliant with the corresponding JSON Schema. This is applicable for the JSON output, not for the raw-json one.

JSON Schemas describe the data format and file structure to ensure the quality of the JSON files.

Two schemas are available (links to the raw files) :
- [Schema-CDL.json](https://raw.githubusercontent.com/lbl-srg/modelica-json/master/schema-CDL.json) validates the JSON files parsed from CDL
- [Schema-modelica.json](https://raw.githubusercontent.com/lbl-srg/modelica-json/master/schema-modelica.json) validates the JSON files parsed from Modelica models

Graphical viewers are available (please use right click + open in a new tab or refresh the page if necessary - this is not optimized for Firefox) :
- [CDL Schema viewer](CDL.html)
- [Modelica Schema viewer](modelica.html)

When parsing a file using `app.js`, the schema is chosen according to the mode.

To validate an existing JSON file against the schema, run

```
node validation.js -f <path to the json file>
```
The default schema is CDL. To chose the Modelica schema, run:

```
node validation.js -f <path to the json file> -m modelica
```

## 5. Useful Links

- [Modelica-json GitHub page](https://github.com/lbl-srg/modelica-json)
- [The Modelica Association](https://www.modelica.org)
- [Control Description Language](http://obc.lbl.gov/specification/cdl.html)
- [JSON Schema](https://json-schema.org)


# License

Modified 3-clause BSD, see [LICENSE.md](LICENSE.md).

# Copyright

See [copyright notice](COPYRIGHT.md).
