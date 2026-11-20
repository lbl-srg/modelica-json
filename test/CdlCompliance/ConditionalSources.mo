within CdlCompliance;
block ConditionalSources "Class"
  parameter Boolean have_u2=false "True if u2 is used";
  parameter Real k=1 "Gain";
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output";
  Buildings.Controls.OBC.CDL.Reals.MultiplyByParameter gai(k=k) "Gain";
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u2 if have_u2 "Input";
equation
  connect(u, gai.u) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  connect(gai.y, y) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  connect(u2, gai.u) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  annotation (defaultComponentName="c", Documentation(info="<html><p>x</p></html>"));
end ConditionalSources;
