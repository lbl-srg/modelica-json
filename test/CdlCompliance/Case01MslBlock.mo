within CdlCompliance;
block Case01MslBlock "Class"
  parameter Real k=1 "Gain";
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output";
  Modelica.Blocks.Math.Gain gai(k=k) "Gain";
equation
  connect(u, gai.u) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  connect(gai.y, y) annotation (Line(points={{0,0},{1,1}}, color={0,0,127}));
  annotation (defaultComponentName="c", Documentation(info="<html><p>x</p></html>"));
end Case01MslBlock;
