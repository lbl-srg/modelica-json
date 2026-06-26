within ModelicaMode;
model VAVBoxCoolingOnlyInvalid
  "INVALID template: redeclares ctl to a type that violates constrainedby (negative test fixture)"
  extends ModelicaMode.VAVBox(
    redeclare replaceable ModelicaMode.BadController ctl
      "Controller that does not satisfy the PartialController interface"
      annotation (__cdl(isControls=true)));

annotation (
  defaultComponentName="VAVBox",
  Documentation(info="<html>
<p>
This model is intentionally invalid: it redeclares the control block
<code>ctl</code> in the <code>extends</code> clause to
<code>BadController</code>, which is not a subtype of the constraining type
<code>PartialController</code> declared in <code>VAVBox</code>. It is used to
verify that <code>constrainedby</code> validation raises an exception.
</p>
</html>"));
end VAVBoxCoolingOnlyInvalid;
