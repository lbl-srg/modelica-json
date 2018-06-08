within FromModelica;
block ParameterWithVendorAnnotationInInfo "Some class comment"
  parameter Real kP = 1 "Some comment";

  annotation (__cdl(haystack="{ \"dis\": \"site\",
   \"area\": 400 }", brick="xxxxx", point=digital),
  Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end ParameterWithVendorAnnotationInInfo;
