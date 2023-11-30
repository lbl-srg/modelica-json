within FromModelica;
block TestEvaluation_1 "Example for real parameter evaluation"
  parameter Real k1=1.0 "Constant output value";
  Buildings.Controls.OBC.CDL.Reals.Sources.Constant con(final k=k1)
    annotation (Placement(transformation(extent={{-20,10},{0,30}})));
annotation (
    Icon(coordinateSystem(preserveAspectRatio=false)),
    Diagram(coordinateSystem(preserveAspectRatio=false)),
    uses(Buildings(version="8.0.0")));
end TestEvaluation_1;
