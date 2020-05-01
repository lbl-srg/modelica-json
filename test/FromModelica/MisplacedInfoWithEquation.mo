within FromModelica;
block MisplacedInfoWithEquation
  "A block that places info section in equation section"

  parameter Real k = 2 "Constant gain";

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input signal"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
        iconTransformation(extent={{-140,20},{-100,60}})));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y1 "Output signal"
    annotation (Placement(transformation(extent={{100,-10},{120,10}})));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y2 "Output signal"
    annotation (Placement(transformation(extent={{100,-10},{120,10}})));

  Buildings.Controls.OBC.CDL.Continuous.Gain gain(final k=k) "Constant gain"
    annotation (Placement(transformation(extent={{0,-10},{20,10}})));

equation
  connect(u, gain.u) annotation (
    Line(points={{-120,0},{-2,0}},color={0,0,127}));
  connect(gain.y, y) annotation (
    Line(points={{22,0},{110,0}},color={0,0,127}));
   y2 = k * u
  annotation (Documentation(info="<html>
<p>
Block that outputs <code>y = 2 * u</code>.
</p>
</html>"));

end MisplacedInfoWithEquation;
