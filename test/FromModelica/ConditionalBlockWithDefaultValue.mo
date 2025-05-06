within FromModelica;
block ConditionalBlockWithDefaultValue "A block with a flag for disabling instances, with default input value"
  parameter Boolean enaBlo = true "Flag for enabling instance";

  Buildings.Controls.OBC.CDL.Interfaces.IntegerInput u if enaBlo
    "Input connector"
    annotation (__cdl(default=0), Placement(transformation(extent={{-140,-20},{-100,20}}),
      iconTransformation(extent={{-140,-20},{-100,20}})));
  Buildings.Controls.OBC.CDL.Interfaces.IntegerOutput y "Output connector"
    annotation (Placement(transformation(extent={{100,-10},{120,10}})));

  Buildings.Controls.OBC.CDL.Integers.Abs abs if not enaBlo
    "Instance could be conditional disabled"
    annotation (Placement(transformation(extent={{-8,-10},{12,10}})));

end ConditionalBlockWithDefaultValue;
