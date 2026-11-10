within CdlCompliance;
block ExtensionBlockWithNonCdlClass "Class"
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output";
  Buildings.Controls.SetPoints.Table tab(table=[0,0;1,1]) "Table";
equation
  connect(u, tab.u);
  connect(tab.y, y);
  annotation (__cdl(extensionBlock=true), defaultComponentName="c", Documentation(info="<html><p>x</p></html>"));
end ExtensionBlockWithNonCdlClass;
