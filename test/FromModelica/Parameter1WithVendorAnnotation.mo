within FromModelica;
block Parameter1WithVendorAnnotation "Some class comment"
  parameter Real kP = 1 "Some comment"
    annotation(__cdl(haystack="{ \"dis\": \"site\",
       \"area\": 400 }", brick="xxxxx",
       point=digital));
end Parameter1WithVendorAnnotation;
