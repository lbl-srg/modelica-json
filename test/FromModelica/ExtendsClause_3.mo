within FromModelica;
block ExtendsClause_3 "model with extends clause"
  extends Buildings.Controls.OBC.CDL.Constants;
  extends Buildings.Controls.OBC.CDL.Logical.TrueHoldWithReset(
    final duration=300);

  Buildings.Controls.OBC.CDL.Reals.MultiplyByParameter gain(final k=k) "Constant gain"
    annotation (Placement(transformation(extent={{-60,-50},{-40,-30}})));
  parameter Modelica.SIunits.Length length "Length of the pipe";

protected
  parameter Modelica.SIunits.Area ARound = dh^2*Modelica.Constants.pi/4
     "Cross sectional area (assuming a round cross section area)";

annotation (defaultComponentName="res",
Documentation(info="<html>
test...test...test...test...test...
</html>", revisions="<html>
test...test...test...
</html>"));
end ExtendsClause_3;
