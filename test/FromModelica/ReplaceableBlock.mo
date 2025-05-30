block ReplaceableBlock
replaceable Buildings.Controls.OBC.CDL.Reals.Sources.Constant con(k=1)
    constrainedby Buildings.Controls.OBC.CDL.Reals.Sources.CivilTime
    "Replaceable block, constrained by a block that imposes as a requirement 
    that the redeclaration provides a block with output y (but no parameter k is needed)";
end ReplaceableBlock;