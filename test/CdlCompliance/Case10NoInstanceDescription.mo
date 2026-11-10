within CdlCompliance;
block Case10NoInstanceDescription "Class"
  parameter Real k=1;
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u;
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y;
  Buildings.Controls.OBC.CDL.Reals.MultiplyByParameter gai(k=k);
equation
  connect(u, gai.u) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  connect(gai.y, y) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  annotation (defaultComponentName="c", Documentation(info="<html><p>x</p></html>"));
end Case10NoInstanceDescription;
