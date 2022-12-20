# [Modelica to JSON parser](https://github.com/lbl-srg/modelica-json)

## Content
1. [General Description](##1.-general-escription)
2. [Installation and help](##2.-installation-and-help)
3. [How to use the parser](##3.-how-to-use-the-parser)
4. [JSON Schemas](##4.-json-schemas)
5. [Useful Links](##5.-useful-links)

[![Build Status](https://api.travis-ci.com/lbl-srg/modelica-json.svg?branch=issue150_mblLink)](https://app.travis-ci.com/github/lbl-srg/modelica-json)


## 1. General Description

__modelica-json__ is a translator that parses the Modelica language to JSON, HTML and docx. Two translation modes have been implemented :
The first mode aims to parse Modelica packages and takes into input a directory of .mo files. The other mode aims to parse CDL files and takes a single .mo file compliant with the CDL language as input. For more information on the CDL Language, please refer to the [OpenBuildingControl ](http://obc.lbl.gov/specification/cdl.html) project website.

See the directory `test/FromModelica` from __modelica-json__ for simple examples from Modelica and CDL to detailed and simplified JSON formats and HTML.

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

- First, make sure that both the `modelica-json` directory and the `Modelica Buildings Library` directory are in the folders that do not require administrator access. 
  By saving the directories in driver other than `C:\` would typical avoid the administrator access issue.

- Then, create the `MODELICAPATH` environment variable and set the value as the path of Modelica Buildings Library, like `E:\modelica-buildings` or `E:\modelica-buildings-master`.

- Install [Java SE Development Kit (64-bit version)](https://www.oracle.com/java/technologies/javase-downloads.html), [Java Runtime Environment (64-bit version)](https://java.com/en/download/manual.jsp) and [Node.js](https://nodejs.org/en/download/).

- In batch file `InstallOnWindows.bat`, update `JAVA_HOME` path in line `set JAVA_HOME=path\to\your\jdk`.

- Finally, to install dependencies and compile the Java files, run `InstallOnWindows.bat`.

To test the installation, from the `\modelica-json` directory, run the parser on Command Prompt:
```
node app.js -f test\FromModelica\Enable.mo
```

Now the `\modelica-json` directory should have a new folder `html` and in the folder, there is a file `FromModelica.Enable.html` and a sub-folder `img`. 

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
- **json**: simplified JSON format, easier to read and interpret
- **html** (default): transcription from json with links for documentation
- **docx** : transcription of the HTML documentation to an editable format
- **svg** : SVG diagram of the control sequence model in cdl model

##### --mode / -m

We offer two different modes of translation that can be chosen with the argument -m :

- **modelica** : Parses a Modelica package (must be a directory)
- **cdl** (default) : Parses a CDL file.

##### --log / -l

Logging level. The choices are 'error', 'warn', 'info' (default), 'verbose', 'debug'.

##### --directory / -d

Specify the output directory. The default option is the current directory.

##### --evaluatePropagatedParameters / -p

Evaluate the propagated parameters. It would be needed for exporting CDL sequences to product lines. 'false' is the default.

##### --evaluateExpressions / -e

Evaluate the mathematical expressions used in parameter assignment and class instantiation. It would be needed for exporting CDL sequences to product lines. 'false' is the default.

##### --strict

Exit with code 1 if there is any warning. 'false' is the default.

## 4. JSON Schemas

The JSON representation of Modelica and CDL models must be compliant with the corresponding JSON Schema. This is applicable for the JSON output, not for the raw-json one.

JSON Schemas describe the data format and file structure to ensure the quality of the JSON files.

Two schemas are available (links to the raw files) :
- [Schema-CDL.json](schema-CDL.json) validates the JSON files parsed from CDL
- [Schema-modelica.json](schema-modelica.json) validates the JSON files parsed from Modelica models

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
