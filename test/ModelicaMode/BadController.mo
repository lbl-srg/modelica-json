within ModelicaMode;
block BadController
  "Controller that does NOT satisfy the PartialController interface (negative test fixture)"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u
    "Measured zone temperature"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
        iconTransformation(extent={{-140,-20},{-100,20}})));

  // Intentionally missing the RealOutput 'y' required by PartialController, so
  // this block is NOT a structural subtype of PartialController and therefore
  // must fail `constrainedby` validation when redeclared as 'ctl'.

annotation (
  defaultComponentName="ctl",
  Icon(coordinateSystem(preserveAspectRatio=false), graphics={
        Rectangle(
        extent={{-100,-100},{100,100}},
        lineColor={0,0,127},
        fillColor={255,255,255},
        fillPattern=FillPattern.Solid)}),
    Diagram(coordinateSystem(preserveAspectRatio=false)));
end BadController;
