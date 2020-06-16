within FromModelica;
block MisplacedInfoWithParameter "A block that places info section in parameter annotation"
  parameter Real kP = 1 "Some comment"

  annotation (Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end MisplacedInfoWithParameter;
