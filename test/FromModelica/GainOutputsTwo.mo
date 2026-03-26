within FromModelica;
block GainOutputsTwo
  Buildings.Controls.OBC.CDL.Reals.MultiplyByParameter gain(final k=1)
    "Gain"
    annotation (Placement(transformation(extent={{-18,-12},{2,8}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u2
    "Real input"
    annotation (Placement(transformation(extent={{-122,-38},{-82,2}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y2
    "Output 2"
    annotation (Placement(transformation(extent={{64,-56},{104,-16}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y1
    "Output 1"
    annotation (Placement(transformation(extent={{64,14},{104,54}})));
equation
  connect(u2, gain.u) annotation (Line(points={{-102,-18},{-30,-18},{-30,-2},{
          -20,-2}},color={0,0,127}));
  connect(gain.y, y1)
    annotation (Line(points={{4,-2},{84,-2},{84,34}}, color={0,0,127}));
  connect(gain.y, y2)
    annotation (Line(points={{4,-2},{84,-2},{84,-36}}, color={0,0,127}));
  annotation (Icon(coordinateSystem(preserveAspectRatio=false)), Diagram(
        coordinateSystem(preserveAspectRatio=false)));
end GainOutputsTwo;
