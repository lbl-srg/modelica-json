within evalAndArrays;

block Specialize_Unit "The sub sequence that Specialize instantiates with different structures"

  parameter Integer n = 1 "Size of the array, different per instance";
  parameter Boolean useOff "Whether the offset is applied, different per instance";
  parameter Real p "Offset, different per instance";

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u[n] "Input of each element";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y[n] "Output of each element";
  Buildings.Controls.OBC.CDL.Interfaces.RealInput uOne "Input of the offset";
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yOne "Output of the offset";

  Buildings.Controls.OBC.CDL.Reals.Abs abs[n] "Array of elementary blocks, sized by n";
  Buildings.Controls.OBC.CDL.Reals.AddParameter adder(
    final p=p) if useOff "Offset, only present when useOff is true";

equation
  connect(u, abs.u);
  connect(abs.y, y);
  connect(uOne, adder.u);
  connect(adder.y, yOne);

end Specialize_Unit;
