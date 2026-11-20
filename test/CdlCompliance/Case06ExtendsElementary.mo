within CdlCompliance;
block Case06ExtendsElementary "Class"
  extends Buildings.Controls.OBC.CDL.Reals.Abs;
  parameter Real k=1 "Gain";
  Buildings.Controls.OBC.CDL.Reals.MultiplyByParameter gai(k=k) "Gain";
equation
  connect(u, gai.u) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  annotation (defaultComponentName="c", Documentation(info="<html><p>x</p></html>"));
end Case06ExtendsElementary;
