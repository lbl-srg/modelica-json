within FromModelica;
block TestEvaluation_4 "Example for enumerate parameter evaluation"

  parameter Buildings.Controls.OBC.CDL.Types.SimpleController
    controllerTypeCooCoi=Buildings.Controls.OBC.CDL.Types.SimpleController.PI
    "Type of controller";
  parameter Real kCooCoi=0.1 "Gain for cooling coil control loop signal";
  parameter Real TiCooCoi=900
    "Time constant of integrator block for cooling coil control loop signal";

  Buildings.Controls.OBC.CDL.Interfaces.RealInput TSupCooSet
    "Cooling supply air temperature setpoint"
    annotation (Placement(transformation(extent={{-140,40},{-100,80}}),
        iconTransformation(extent={{-140,60},{-100,100}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealInput TAirSup
    "Supply air temperature measurement"
    annotation (Placement(transformation(extent={{-140,0},{-100,40}}),
        iconTransformation(extent={{-140,20},{-100,60}})));
  Buildings.Controls.OBC.CDL.Interfaces.IntegerInput uZonSta "Zone state"
    annotation (Placement(transformation(extent={{-140,-40},{-100,0}}),
        iconTransformation(extent={{-140,-60},{-100,-20}})));
  Buildings.Controls.OBC.CDL.Interfaces.BooleanInput u1SupFan
    "Supply fan proven on"
    annotation (Placement(transformation(extent={{-140,-80},{-100,-40}}),
        iconTransformation(extent={{-140,-98},{-100,-58}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yCooCoi
    "Cooling coil position"
    annotation (Placement(transformation(extent={{100,-20},{140,20}}),
        iconTransformation(extent={{100,-20},{140,20}})));

  Buildings.Controls.OBC.ASHRAE.G36.AHUs.SingleZone.VAV.SetPoints.CoolingCoil cooCoi(
    controllerTypeCooCoi=controllerTypeCooCoi,
    kCooCoi=kCooCoi,
    TiCooCoi=TiCooCoi) "Cooling coil control"
    annotation (Placement(transformation(extent={{-10,-10},{10,10}})));

equation
  connect(cooCoi.TSupCooSet, TSupCooSet) annotation (Line(points={{-12,8},{-40,8},
          {-40,60},{-120,60}}, color={0,0,127}));
  connect(cooCoi.TAirSup, TAirSup) annotation (Line(points={{-12,4},{-60,4},{-60,
          20},{-120,20}}, color={0,0,127}));
  connect(cooCoi.uZonSta, uZonSta) annotation (Line(points={{-12,-4},{-60,-4},{-60,
          -20},{-120,-20}}, color={255,127,0}));
  connect(cooCoi.u1SupFan, u1SupFan) annotation (Line(points={{-12,-8},{-40,-8},
          {-40,-60},{-120,-60}}, color={255,0,255}));
  connect(cooCoi.yCooCoi, yCooCoi)
    annotation (Line(points={{12,0},{58,0},{58,0},{120,0}}, color={0,0,127}));
annotation (
    Icon(coordinateSystem(preserveAspectRatio=false)),
    Diagram(coordinateSystem(preserveAspectRatio=false)));
end TestEvaluation_4;
