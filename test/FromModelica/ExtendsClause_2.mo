within FromModelica;
block ExtendsClause_2 "model with extends clause"
  extends Buildings.Controls.OBC.CDL.Continuous.LimPID(
    k=2,
    Ti=2);
  extends Buildings.Controls.OBC.CDL.Logical.TrueHoldWithReset(
    redeclare Buildings.Controls.OBC.CDL.Logical.TrueDelay onDelay(
      final delayTime=duration),
    final duration = 300);

  Buildings.Controls.OBC.CDL.Continuous.Gain gain(final k=k) "Constant gain"
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
end ExtendsClause_2;
