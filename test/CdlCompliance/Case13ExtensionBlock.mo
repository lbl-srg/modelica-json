within CdlCompliance;
block Case13ExtensionBlock "Class"
  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output";
equation
  y = 2 * u;
  annotation (__cdl(extensionBlock=true), defaultComponentName="c", Documentation(info="<html><p>x</p></html>"));
end Case13ExtensionBlock;
