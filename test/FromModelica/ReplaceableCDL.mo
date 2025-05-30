block ReplaceableCDL "A composite block in a library"

   parameter Real k = 2 "Proportional gain";
   
   replaceable Buildings.Controls.OBC.CDL.Reals.PID conPID 
     constrainedby Buildings.Controls.OBC.CDL.Reals.PID(k=k)
     "PID controller"
     annotation(
    Placement(transformation(extent = {{-10, -10}, {10, 10}})));

  replaceable Buildings.Controls.OBC.CDL.Reals.PID conPID 2
     constrainedby Buildings.Controls.OBC.CDL.Reals.PID
     "PID controller"
     annotation(
    Placement(transformation(extent = {{-15, -15}, {15, 15}})));

   annotation(
    uses(Buildings(version = "12.0.0")));

end ReplaceableCDL;