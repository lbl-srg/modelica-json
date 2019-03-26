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

# JSON Schema

# License

Modified 3-clause BSD, see [LICENSE.md](LICENSE.md).

# Copyright

See [copyright notice](COPYRIGHT.md).
