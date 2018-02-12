within FromModelica;
block ParameterWithInfo "Some class comment"
  parameter Real kP = 1 "Some comment";

  annotation (Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end ParameterWithInfo;
