within FromModelica;
block SubController "Subsequence"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u
    "Real input"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
        iconTransformation(extent={{-140,-20},{-100,20}})),
        __cdl(connection(hardwired=true), trend(interval=60, enable=true)));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y
    "Real output"
    annotation (Placement(transformation(extent={{100,-20},{140,20}}),
        iconTransformation(extent={{100,-20},{140,20}})),
        __cdl(connection(hardwired=true), trend(interval=60, enable=true)));

annotation (
  __cdl(generatePointlist=true, controlledDevice="Sub Device"),
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
    Diagram(coordinateSystem(preserveAspectRatio=false)));
end SubController;
