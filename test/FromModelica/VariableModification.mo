within FromModelica;
block VariableModification "Block with instantiated class that the connector attribute being specified"

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u
    "Input connector"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
      iconTransformation(extent={{-140,-40},{-100,0}})));

  Buildings.Controls.OBC.CDL.Interfaces.RealInput TOut(
    final unit="K",
    quantity="ThermodynamicTemperature")
    "Temperature input"
    annotation (Placement(transformation(extent={{-140,20},{-100,60}}),
      iconTransformation(extent={{-140,20},{-100,60}})));

  Buildings.Controls.OBC.CDL.Continuous.Abs abs(
    u(final unit="K", displayUnit="degC"),
    y(unit="K", displayUnit="degC"))
    "Instance with modified input and output attributes"
    annotation (Placement(transformation(extent={{-8,-10},{12,10}})));
end VariableModification;
