within FromModelica;
block ExtendsClause_4 "model with extends clause"
  extends Buildings.Controls.OBC.CDL.Reals.PID(
    k=2,
    Ti=2);

  Buildings.Controls.OBC.CDL.Reals.MultiplyByParameter gain(final k=k) "Constant gain"
    annotation (Placement(transformation(extent={{-60,-50},{-40,-30}})));
  parameter Modelica.SIunits.Length length "Length of the pipe";

end ExtendsClause_4;
