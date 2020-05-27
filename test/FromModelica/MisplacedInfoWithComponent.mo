within FromModelica;
block MisplacedInfoWithComponent "A block that places info section in component annotation"
  Block1 bloPub "A public block"

  annotation (Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end MisplacedInfoWithComponent;
