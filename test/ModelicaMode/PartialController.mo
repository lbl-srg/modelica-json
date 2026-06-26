within ModelicaMode;
partial block PartialController
  "Interface (constraining type) for a VAV terminal unit controller"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u
    "Measured zone temperature"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
        iconTransformation(extent={{-140,-20},{-100,20}})));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y
    "Damper position setpoint"
    annotation (Placement(transformation(extent={{100,-20},{140,20}}),
        iconTransformation(extent={{100,-20},{140,20}})));

annotation (
  defaultComponentName="ctl",
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
    Diagram(coordinateSystem(preserveAspectRatio=false)));
end PartialController;
