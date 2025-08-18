within FromModelica;
block TestEvaluation_3 "Example for boolean parameter evaluation"

  parameter Boolean k1=true "Constant output value";
  parameter Boolean k2=not k1 "Boolean parameter 2";
  Buildings.Controls.OBC.CDL.Logical.Sources.Constant con(final k=k2) if
       not k1
    "Constant"
    annotation (Placement(transformation(extent={{-10,10},{10,30}})));
  Buildings.Controls.OBC.CDL.Logical.Sources.Constant con1(final k=k1)
    "Constant"
    annotation (Placement(transformation(extent={{-8,-30},{12,-10}})));
annotation (
    Icon(coordinateSystem(preserveAspectRatio=false)),
    Diagram(coordinateSystem(preserveAspectRatio=false)));
end TestEvaluation_3;
