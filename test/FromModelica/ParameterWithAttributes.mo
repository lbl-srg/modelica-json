within FromModelica;
block ParameterWithAttributes "Some class comment"
  parameter Real kP(
    start=0.2,
    fixed=false,
    min=0,
    max=2,
    quantity="PressureDifference", 
    unit="Pa",
    nominal=0.5,
    stateSelect=StateSelect.default) = 1 "Some comment";

  annotation (Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end ParameterWithAttributes;
