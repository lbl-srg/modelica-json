within FromModelica;
model ModelWithControlsBlock2 "Modelica model with a composite Block"

  Buildings.Fluid.Movers.SpeedControlled_y fan "Fan";

  ModelWithControlsBlock subModel "Parent model";

end ModelWithControlsBlock2;
