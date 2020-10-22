within FromModelica;
block WithCDLElementary
  "Block that instantiates CDL elementary block that there is inside class"
  Buildings.Controls.OBC.CDL.Continuous.Greater gre
    "CDL elementary block with inside class"
    annotation (Placement(transformation(extent={{-8,-10},{12,10}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Real input"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
      iconTransformation(extent={{-212,-12},{-172,28}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Real output"
    annotation (Placement(transformation(extent={{100,-20},{140,20}}),
      iconTransformation(extent={{-184,-4},{-144,36}})));
  annotation (Icon(coordinateSystem(preserveAspectRatio=false)), Diagram(
        coordinateSystem(preserveAspectRatio=false)));
end WithCDLElementary;
