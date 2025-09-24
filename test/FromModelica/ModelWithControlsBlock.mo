within FromModelica;
model ModelWithControlsBlock "Modelica model with a composite Block"

  Buildings.Fluid.Movers.SpeedControlled_y fan
    "Fan";

  SubController subCon1 "Sub controller"
    annotation (Placement(transformation(extent={{-10,-50},{10,-30}})),
        __cdl(isControls=True));

end ModelWithControlsBlock;
