within FromModelica;
block ConditionalBlock "A block with a flag for disabling instances"
  parameter Boolean enaBlo = true "Flag for enabling instance";

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u if enaBlo
    "Input connector"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
      iconTransformation(extent={{-140,-20},{-100,20}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output connector"
    annotation (Placement(transformation(extent={{100,-10},{120,10}})));

  Buildings.Controls.OBC.CDL.Continuous.Abs abs if not enaBlo
    "Instance could be conditional disabled"
    annotation (Placement(transformation(extent={{-8,-10},{12,10}})));
end ConditionalBlock;
