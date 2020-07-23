within FromModelica;
block TestEvaluation_4 "Example for enumerate parameter evaluation"

  parameter Buildings.Controls.OBC.CDL.Types.SimpleController controllerType=
      Buildings.Controls.OBC.CDL.Types.SimpleController.PI "Type of controller";
  parameter Real k=0.1 "Gain";

  Buildings.Controls.OBC.CDL.Interfaces.RealInput TMix
    "Mixed air temperature measurement"
    annotation (Placement(transformation(extent={{-140,-20},{-100,20}}),
      iconTransformation(extent={{-124,-20},{-84,20}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yFreProInv
    "Inverse freeze protection control signal, 1 if no frost, 0 if TMix below TFreSet"
    annotation (Placement(transformation(extent={{100,0},{140,40}}),
        iconTransformation(extent={{78,0},{118,40}})));
  Buildings.Controls.OBC.CDL.Interfaces.RealOutput yFrePro
    "Freeze protection control signal, 0 if no frost, 1 if TMix below TFreSet"
    annotation (Placement(transformation(extent={{100,-40},{140,0}}),
        iconTransformation(extent={{78,-40},{118,0}})));

  Buildings.Controls.OBC.ASHRAE.G36_PR1.Generic.FreezeProtectionMixedAir
    freProTMix(
    final controllerType=controllerType,
    k=k)
    annotation (Placement(transformation(extent={{-10,-10},{10,10}})));

equation
  connect(freProTMix.TMix, TMix)
    annotation (Line(points={{-12,0},{-120,0}}, color={0,0,127}));
  connect(freProTMix.yFreProInv, yFreProInv) annotation (Line(points={{12,3},{60,
          3},{60,20},{120,20}}, color={0,0,127}));
  connect(freProTMix.yFrePro, yFrePro) annotation (Line(points={{12,-3},{60,-3},
          {60,-20},{120,-20}}, color={0,0,127}));
annotation (
    Icon(coordinateSystem(preserveAspectRatio=false)),
    Diagram(coordinateSystem(preserveAspectRatio=false)));
end TestEvaluation_4;
