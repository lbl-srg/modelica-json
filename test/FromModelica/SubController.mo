within FromModelica;
block SubController "Subsequence"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u1
    "Real input 1"
    annotation (Placement(transformation(extent={{-140,20},{-100,60}}),
        iconTransformation(extent={{-140,40},{-100,80}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u2
    "Real input 2"
    annotation (Placement(transformation(extent={{-140,-60},{-100,-20}}),
        iconTransformation(extent={{-140,-80},{-100,-40}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y
    "Real output"
    annotation (Placement(transformation(extent={{100,-20},{140,20}}),
        iconTransformation(extent={{100,-20},{140,20}})));

  Buildings.Controls.OBC.CDL.Continuous.Add add2
    "Add two real inputs"
    annotation (Placement(transformation(extent={{-10,-10},{10,10}})));

equation
  connect(u1, add2.u1) annotation (Line(points={{-120,40},{-60,40},{-60,6},{-12,
          6}}, color={0,0,127}));
  connect(u2, add2.u2) annotation (Line(points={{-120,-40},{-60,-40},{-60,-6},{-12,
          -6}}, color={0,0,127}));
  connect(add2.y, y)
    annotation (Line(points={{12,0},{120,0}}, color={0,0,127}));

annotation (
    defaultComponentName="subCon",
    Icon(coordinateSystem(preserveAspectRatio=false), graphics={
        Rectangle(
        extent={{-100,-100},{100,100}},
        lineColor={0,0,127},
        fillColor={255,255,255},
        fillPattern=FillPattern.Solid),
        Text(
          lineColor={0,0,255},
          extent={{-100,100},{100,140}},
          textString="%name")}),
    Diagram(coordinateSystem(preserveAspectRatio=false)),
    uses(Buildings(version="8.0.0")));
end SubController;
