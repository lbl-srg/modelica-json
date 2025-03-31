within FromModelica;
block BlockWithArray1 "A block with integer arrays"

  parameter Integer a[5] = {1, 2, 3, 4, 5};
  parameter Integer b[:] = {1, 2};
  parameter Integer c[3,2] = {{1, 2}, {3, 4}, {5, 6}};
end BlockWithArray1;
