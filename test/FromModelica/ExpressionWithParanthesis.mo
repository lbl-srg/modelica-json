within FromModelica;
block ExpressionWithParanthesis
  parameter Integer a = 2;
  parameter Integer b = 5;
  parameter Integer notexp = if not a < b then 1 else 2;
  parameter Integer andnotexp = if a < b and not a < b then 1 else 2;
  parameter Integer notexppar = if not (a < b) then 1 else 2;
  parameter Integer andnotexppar = if (a < b) and not (a < b) then 1 else 2;
end ExpressionWithParanthesis;
