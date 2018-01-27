within FromModelica;
block Parameter2 "Some class comment"

  parameter Real myPar1 = 1 "Some comment";
  parameter Real myParNoValue "Some comment";
  parameter Real myParMin(min=0) "Some comment";
  parameter Real myParMax(max=0) "Some comment";
  parameter Real myParUnit(unit="K") "Some comment";

  parameter Real myParInGroup "Some comment" annotation(Dialog(group="Gains"));
  parameter Real myParInTab "Some comment" annotation(Dialog(tab="Initialization tab"));

  parameter Real myParInTabInGroup "Some comment" annotation(Dialog(tab="Initialization tab", group="Gains"));
end Parameter2;
