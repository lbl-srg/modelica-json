within FromModelica;
block TestEvaluation_2 "Example for real parameter evaluation"
  parameter Real uLow(min=0) = 0.5 "if y=true and u<uLow, switch to y=false";
  parameter Real uHigh = 2*uLow "if y=false and u>uHigh, switch to y=true";

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Real input signal"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
        iconTransformation(extent={{-118,-20},{-78,20}})));
  Buildings.Controls.OBC.CDL.Interfaces.BooleanOutput y
    "Boolean output signal"
    annotation (Placement(transformation(extent={{100,-20},{140,20}}),
        iconTransformation(extent={{80,-20},{120,20}})));

  Buildings.Controls.OBC.CDL.Reals.Hysteresis hys(
    final uLow=uLow,
    uHigh=uHigh)
    annotation (Placement(transformation(extent={{-10,-10},{10,10}})));

equation
  connect(hys.u, u)
    annotation (Line(points={{-12,0},{-120,0}}, color={0,0,127}));
  connect(hys.y, y)
    annotation (Line(points={{12,0},{120,0}}, color={255,0,255}));
annotation (
    Icon(coordinateSystem(preserveAspectRatio=false)),
    Diagram(coordinateSystem(preserveAspectRatio=false)),
    uses(Buildings(version="8.0.0")));
end TestEvaluation_2;
