within CdlCompliance;
block RejectedEquation "Class"
  parameter Real k=1 "Gain";
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output";
  Buildings.Controls.OBC.CDL.Reals.MultiplyByParameter gai(k=k) "Gain";
equation
  connect(u, gai.u) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  connect(gai.y, y) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  y = u;
  annotation (defaultComponentName="c", Documentation(info="<html><p>x</p></html>"));
end RejectedEquation;
