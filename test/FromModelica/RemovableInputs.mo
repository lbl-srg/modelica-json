within FromModelica;
block RemovableInputs "A block with a flag for disabling instances"
  parameter Boolean enaBlo = true "Flag for enabling instance";
  parameter Boolean have_winSen "True: there is window status sensor";
  parameter Boolean have_occSen "True: there is occupancy sensor";

  Buildings.Controls.OBC.CDL.Interfaces.RealInput u if enaBlo
    "Input connector"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
      iconTransformation(extent={{-140,-40},{-100,0}})));

  Buildings.Controls.OBC.CDL.Interfaces.RealInput TOut(
    unit="K",
    quantity="ThermodynamicTemperature") if enaBlo
    "Temperature input"
    annotation (Placement(transformation(extent={{-140,20},{-100,60}}),
      iconTransformation(extent={{-140,20},{-100,60}})));

  Buildings.Controls.OBC.CDL.Interfaces.RealInput TOutWitDef(
    unit="K",
    quantity="ThermodynamicTemperature") if enaBlo
    "Temperature input with specified default value"
    annotation (Placement(transformation(extent={{-140,-70},{-100,-30}}),
      iconTransformation(extent={{-140,-80},{-100,-40}})),  __cdl(default=300.15));

  Buildings.Controls.OBC.CDL.Interfaces.BooleanInput uWin if have_winSen
    "Window opening status"
    annotation (Placement(transformation(extent={{-140,-100},{-100,-60}}),
      iconTransformation(extent={{-140,-110},{-100,-70}})));

  Buildings.Controls.OBC.CDL.Interfaces.IntegerInput nOcc if have_occSen
    "Occupancy"
    annotation (Placement(transformation(extent={{-140,60},{-100,100}}),
      iconTransformation(extent={{-140,60},{-100,100}})));

  Buildings.Controls.OBC.CDL.Interfaces.RealOutput y "Output connector"
    annotation (Placement(transformation(extent={{100,-10},{120,10}})));

  Buildings.Controls.OBC.CDL.Continuous.Abs abs if not enaBlo
    "Instance could be conditional disabled"
    annotation (Placement(transformation(extent={{-8,-10},{12,10}})));
end RemovableInputs;
