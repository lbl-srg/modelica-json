within FromModelica;
block ParameterWithInvalidUnits "Block with invalid and unmapped units and quantity kinds"
  parameter Real dpDes(
    unit="Pa",
    quantity="PresureDifference") = 1 "Design pressure difference with typo in quantity";
  parameter Real customPar(
    unit="customUnit",
    displayUnit="customDisplayUnit",
    quantity="CustomQuantity") = 1 "Parameter with unmapped unit, displayUnit, and quantity";
  parameter Real unmappedUnitValidQuantity(
    unit="invalidUnit",
    quantity="Time") = 1 "Parameter with unmapped unit and valid quantity";

  annotation (Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end ParameterWithInvalidUnits;
