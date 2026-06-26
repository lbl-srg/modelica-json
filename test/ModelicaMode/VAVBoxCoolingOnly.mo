within ModelicaMode;
model VAVBoxCoolingOnly "VAV terminal unit cooling only"
  extends ModelicaMode.VAVBox(
    redeclare replaceable ModelicaMode.G36VAVBoxCoolingOnly ctl
      "Guideline 36 controller for VAV terminal unit cooling only"
      annotation (__cdl(isControls=true)));

annotation (
  defaultComponentName="VAVBox",
  Documentation(info="<html>
<p>
This template represents a cooling-only VAV terminal unit. The control block
<code>ctl</code> is redeclared in the <code>extends</code> clause and marked
with <code>__cdl(isControls=true)</code> so that its CXF can be exported with
<code>--mode modelica</code>.
</p>
</html>"));
end VAVBoxCoolingOnly;
