block RedeclaredBlock "Composite block, with sou replaced by a Pulse with period=0.1"
    ReplaceableBlock repBlo(
      redeclare Buildings.Controls.OBC.CDL.Reals.Sources.Pulse con(period=0.1));
end RedeclaredBlock;