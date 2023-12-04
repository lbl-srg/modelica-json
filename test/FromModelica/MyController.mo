within FromModelica;
block MyController "My controller"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u1
    "Real input 1"
    annotation (Placement(transformation(extent={{-140,20},{-100,60}}),
        iconTransformation(extent={{-140,40},{-100,80}})),
        __cdl(connection(hardwired=true), trend(interval=60, enable=true)));

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u2
    "Real input 2"
    annotation (Placement(transformation(extent={{-140,-60},{-100,-20}}),
        iconTransformation(extent={{-140,-80},{-100,-40}})),
        __cdl(connection(hardwired=true), trend(interval=60, enable=true)));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y
    "Real output"
    annotation (Placement(transformation(extent={{100,-20},{140,20}}),
        iconTransformation(extent={{100,-20},{140,20}})),
        __cdl(connection(hardwired=true), trend(interval=60, enable=true)));

  Buildings.Controls.OBC.CDL.Reals.Add add2
    "Add two real inputs"
    annotation (Placement(transformation(extent={{-10,-10},{10,10}})));

  SubController subCon1 "Sub controller"
    annotation (Placement(transformation(extent={{-10,-50},{10,-30}})),
        __cdl(generatePointlist=true));

  SubController subCon2 "Sub controller"
    annotation (Placement(transformation(extent={{-10,-90},{10,-70}})));
equation
  connect(u1, add2.u1) annotation (Line(points={{-120,40},{-60,40},{-60,6},{-12,
          6}}, color={0,0,127}));
  connect(u2, add2.u2) annotation (Line(points={{-120,-40},{-60,-40},{-60,-6},{-12,
          -6}}, color={0,0,127}));
  connect(add2.y, y)
    annotation (Line(points={{12,0},{120,0}}, color={0,0,127}));
  connect(u2, subCon1.u)
    annotation (Line(points={{-120,-40},{-12,-40}}, color={0,0,127}));
  connect(u2, subCon2.u) annotation (Line(points={{-120,-40},{-60,-40},{-60,-80},
          {-12,-80}}, color={0,0,127}));

annotation (
  __cdl(generatePointlist=true, controlledDevice="My Device"),
  defaultComponentName="myCon",
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
end MyController;
