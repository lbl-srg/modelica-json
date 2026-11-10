within FromModelica;
block ConditionalBlockWithCompoundGuard
  "A block whose instances are guarded by compound conditions"
  parameter Boolean have_a = true "First flag";
  parameter Boolean have_b = false "Second flag";
  parameter Boolean have_c = true "Third flag";
  parameter Integer k = 1 "Threshold";

  Buildings.Controls.OBC.CDL.Reals.Abs absNot if not have_a
    "Guarded by a negation"
    annotation (Placement(transformation(extent={{-8,50},{12,70}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absAnd if have_a and have_b
    "Guarded by a conjunction"
    annotation (Placement(transformation(extent={{-8,20},{12,40}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absCmp if k > 0
    "Guarded by a comparison"
    annotation (Placement(transformation(extent={{-8,-10},{12,10}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absGrouped if (have_a or have_b) and have_c
    "Guarded by a parenthesised disjunction; without the parentheses and binds tighter and the meaning changes"
    annotation (Placement(transformation(extent={{-8,-40},{12,-20}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absGroupedOr if (have_a and have_b) or have_c
    "Guarded by a parenthesised conjunction under a disjunction"
    annotation (Placement(transformation(extent={{-8,-70},{12,-50}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absProduct if (k + 1)*k > 0
    "Guarded by a group inside a product"
    annotation (Placement(transformation(extent={{-8,-100},{12,-80}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absPower if (k + 1)^2 > k
    "Guarded by a group raised to a power"
    annotation (Placement(transformation(extent={{-8,-130},{12,-110}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absNegated if -(k + 1) < 0
    "Guarded by a negated group, which carries a leading sign"
    annotation (Placement(transformation(extent={{-8,-160},{12,-140}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absSubtracted if k - (k + 1) < 0
    "Guarded by a group subtracted from a term"
    annotation (Placement(transformation(extent={{-8,-190},{12,-170}})));
  Buildings.Controls.OBC.CDL.Reals.Abs absNotRelation if not k > 0
    "Guarded by a negated relation"
    annotation (Placement(transformation(extent={{-8,-220},{12,-200}})));
end ConditionalBlockWithCompoundGuard;
