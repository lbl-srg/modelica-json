within FromModelica;
block ParameterWithEnumeration "Block with enumeration-typed parameters"
  parameter Enumeration1 eNoDefault
    "Enumeration parameter without a default";
  parameter Enumeration1 eWithDefault=FromModelica.Enumeration1.e2
    "Enumeration parameter with a default";
  parameter Buildings.Controls.OBC.CDL.Types.SimpleController conTyp=
    Buildings.Controls.OBC.CDL.Types.SimpleController.PI
    "Enumeration parameter of a CDL type";
end ParameterWithEnumeration;
