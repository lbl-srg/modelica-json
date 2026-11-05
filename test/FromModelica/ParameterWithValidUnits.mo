within FromModelica;
block ParameterWithValidUnits "Block with valid CDL and QUDT units and quantity kinds"
  parameter Real kCooCoi(
    unit="1/K",
    quantity="LinearTemperatureCoefficient") = 1 "Gain for cooling coil control loop signal";
  parameter Real slewRate(
    unit="1/s",
    quantity="TemperatureSlope") = 1 "Maximum speed with which to increase the output";
  parameter Real cp(
    unit="J/(kg.K)",
    quantity="SpecificHeatCapacity") = 1 "Specific heat capacity";
  parameter Real TSet(
    unit="K",
    displayUnit="degC",
    quantity="ThermodynamicTemperature") = 1 "Setpoint temperature";
  parameter Real VFlow(
    unit="m3/s",
    displayUnit="cfm",
    quantity="VolumeFlowRate") = 1 "Volume flow rate";

  annotation (Documentation(info="<html>
<p>
This is the info section.
</p>
</html>"));
end ParameterWithValidUnits;
