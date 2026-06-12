within ModelicaMode;
model VAVBoxCoolingOnlyOpenLoop
  "VAV terminal unit cooling only with an open loop controller"
  extends ModelicaMode.VAVBox(
    redeclare replaceable ModelicaMode.OpenLoopVAVBoxCoolingOnly ctl
      "Open loop controller for VAV terminal unit cooling only"
      annotation (__cdl(isControls=true)));

annotation (
  defaultComponentName="VAVBox",
  Documentation(info="<html>
<p>
This template is identical to
<a href=\"modelica://ModelicaMode.VAVBoxCoolingOnly\">ModelicaMode.VAVBoxCoolingOnly</a>
except that the control block <code>ctl</code> is redeclared in the
<code>extends</code> clause to a different controller
(<code>OpenLoopVAVBoxCoolingOnly</code>), again marked with
<code>__cdl(isControls=true)</code> so that its CXF can be exported with
<code>--mode modelica</code>.
</p>
</html>"));
end VAVBoxCoolingOnlyOpenLoop;
