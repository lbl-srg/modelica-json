within evalAndArrays;

block Specialize "One sub sequence instantiated three times, once changing its structure"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input signal";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yKeep "Output of the instance that keeps the offset";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yDrop "Output of the instance that drops the offset";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yWide[2] "Output of the instance with two elements";

  Specialize_Unit uniKeep(
    final useOff=true,
    final p=2) "Same structure as the class, expect the class as its type";
  Specialize_Unit uniDrop(
    final useOff=false,
    final p=3) "Drops the conditional adder, expect the class as its type";
  Specialize_Unit uniWide(
    final n=2,
    final useOff=true,
    final p=4) "Two elements where the class has one, expect a class of its own";

equation
  connect(u, uniKeep.u[1]);
  connect(u, uniKeep.uOne);
  connect(u, uniDrop.u[1]);
  connect(u, uniDrop.uOne);
  connect(u, uniWide.u[1]);
  connect(u, uniWide.u[2]);
  connect(u, uniWide.uOne);
  connect(uniKeep.yOne, yKeep);
  connect(uniDrop.y[1], yDrop);
  connect(uniWide.y, yWide);

end Specialize;
