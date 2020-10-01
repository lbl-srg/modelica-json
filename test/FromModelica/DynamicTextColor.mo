within FromModelica;
block DynamicTextColor "Some class comment"
  Buildings.Controls.OBC.CDL.Interfaces.Boolean u "Input connector" 
    annotation (Placement(
        transformation(extent={{-140,-20},{-100,20}}), iconTransformation(
          extent={{-140,-20},{-100,20}})));

  annotation (Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"),
Icon(coordinateSystem(
        preserveAspectRatio=true,
        extent={{-100,-100},{100,100}}), graphics={
        Text(
          extent={{-90,80},{-46,54}},
          lineColor=DynamicSelect({0,0,0},
                    if u then {0,0,0} else {235,235,235}),
          textString="true"),
        Text(
          extent={{-150,150},{150,110}},
          lineColor={0,0,255},
          textString="%name")}));
end DynamicTextColor;
