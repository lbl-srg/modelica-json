within FromModelica;
block BlockWithArray1 "A block with integer arrays"

  parameter Integer a[5] = {1, 2, 3, 4, 5};
  parameter Integer b[:] = {1, 2};
  parameter Integer c[3,2] = {{1, 2}, {3, 4}, {5, 6}};

  parameter Real k1[3] = {1, 2, 3};
  parameter Real k2[3] = {i for i in 1:3};
  parameter Real k3[3] = k1;
  parameter Real k4[3] = fill(1, 3) + {0, 1, 2};
  parameter Real k5[3] = cat(1, {1}, {2}, {3});
end BlockWithArray1;
