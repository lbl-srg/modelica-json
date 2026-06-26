within ModelicaMode;
partial model VAVBox
  "Interface for a VAV terminal unit with a replaceable controller"

  replaceable ModelicaMode.OpenLoopVAVBoxCoolingOnly ctl
    constrainedby ModelicaMode.PartialController
    "Replaceable controller"
    annotation (Placement(transformation(extent={{-10,-10},{10,10}})));

annotation (
  defaultComponentName="VAVBox",
  Documentation(info="<html>
<p>
Interface that a VAV terminal unit template extends from. It declares a
replaceable controller <code>ctl</code> that concrete templates redeclare.
</p>
</html>"));
end VAVBox;
