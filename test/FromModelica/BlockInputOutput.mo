within FromModelica;
block BlockInputOutput "A block with an input and an output signal"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u "Input connector" annotation (Placement(
        transformation(extent={{-140,-20},{-100,20}}), iconTransformation(
          extent={{-140,-20},{-100,20}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output connector"
    annotation (Placement(transformation(extent={{100,-10},{120,10}})));
end BlockInputOutput;
