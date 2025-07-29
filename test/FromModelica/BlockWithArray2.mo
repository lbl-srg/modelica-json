within FromModelica;
block BlockWithArray2 "A block with an real array, value is an expression"
  parameter Real k[2,3] = {i*0.5+j for i in 1:2, j in 1:3};
end BlockWithArray2;
