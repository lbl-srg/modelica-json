This directory contains various examples of Modelica (in `FromModelica`) and 
their corresponding detailed, intermediate raw-json (output=`raw-json`)
representation (in `reference/raw-json/FromModelica`) and a simplified 
JSON reprenstation (output=`json`) to a JSON representation 
(in `reference/json/FromModelica`).

The libraries in this directory, such as `FromModelica` and `ModelicaMode`, are
looked up through `MODELICAPATH`, as in any Modelica tool: this directory is
appended to `MODELICAPATH` by `setup/modelicaPath.js` when running the tests,
and by the Makefile when generating the reference results. The outputs are
therefore stored under `<format>/<library>/`.
