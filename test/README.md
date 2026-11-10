This directory contains various examples of Modelica (in `FromModelica`) and 
their corresponding detailed, intermediate raw-json (output=`raw-json`)
representation (in `reference/raw-json/FromModelica`) and a simplified 
JSON reprenstation (output=`json`) to a JSON representation 
(in `reference/json/FromModelica`).

The libraries in this directory, such as `FromModelica` and `ModelicaMode`, do
not need to be on `MODELICAPATH`: when a file of these libraries is parsed, the
root of its library (this directory) is derived from the directory of the file
and its `within` clause, and the classes of the library are then looked up
below this root. All files of these libraries must thus have a `within` clause
that matches their directory.
`NoWithin.mo` contains a top-level class: it has no `within` clause, so its
library root is also this directory.

The outputs are stored under `<format>/`, at the path given by the `within`
clause and the name of each file, such as `json/FromModelica/Enable.json`
and `json/NoWithin.json`.
