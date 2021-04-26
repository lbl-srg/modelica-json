within FromModelica;
block PointList "Block demonstrating point list generation"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u1
    "Input one"
    annotation (Placement(transformation(extent={{-140,40},{-100,80}}),
        iconTransformation(extent={{-140,40},{-100,80}})),
        __cdl(connection(hardwired=true), trend(interval=60, enable=true)));

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u2
    "Input two"
    annotation (Placement(transformation(extent={{-140,-80},{-100,-40}}),
        iconTransformation(extent={{-140,-80},{-100,-40}})),
        __cdl(connection(hardwired=false), trend(interval=120, enable=true)));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y1
    "Output one"
    annotation (Placement(transformation(extent={{100,-80},{140,-40}}),
      iconTransformation(extent={{100,40},{140,80}})),
      __cdl(connection(hardwired=true), trend(interval=60, enable=true)));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y2
    "Output two"
    annotation (Placement(transformation(extent={{100,40},{140,80}}),
        iconTransformation(extent={{100,-80},{140,-40}})),
        __cdl(connection(hardwired=false), trend(interval=60, enable=true)));

  MyController con1
    "Subcontroller one"
    annotation (__cdl(propagate(instance="subCon1", generatePointlist=true),
                      propagate(instance="subCon2", generatePointlist=true),
                      propagate(instance="subCon2.u", connection(hardwired=true), trend(interval=120, enable=true))),
                Placement(transformation(extent={{-10,50},{10,70}})));

  MyController con2
   "Subcontroller two"
    annotation (__cdl(generatePointlist=true),
                Placement(transformation(extent={{-10,-70},{10,-50}})));

equation
  connect(u1, con1.u1) annotation (Line(points={{-120,60},{-80,60},{-80,66},{-12,
          66}}, color={0,0,127}));
  connect(u1, con2.u1) annotation (Line(points={{-120,60},{-80,60},{-80,-54},{-12,
          -54}}, color={0,0,127}));
  connect(u2, con1.u2) annotation (Line(points={{-120,-60},{-60,-60},{-60,54},{-12,
          54}}, color={0,0,127}));
  connect(u2, con2.u2) annotation (Line(points={{-120,-60},{-60,-60},{-60,-66},{
          -12,-66}}, color={0,0,127}));
  connect(con1.y, y2)
    annotation (Line(points={{12,60},{120,60}}, color={0,0,127}));
  connect(con2.y, y1)
    annotation (Line(points={{12,-60},{120,-60}}, color={0,0,127}));

annotation (
  __cdl(generatePointlist=true, controlledDevice="Test device"),
  defaultComponentName="poiLis",
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
end PointList;
