within FromModelica;
block ParameterWithDefaultName "Some class comment"
  parameter Real kP = 1 "Some comment";

  annotation (
defaultComponentName="testName",
Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end ParameterWithDefaultName;
