within FromModelica;
block BlockWithBlock1 "A block that instantiates another public and protected block"
  Block1 bloPub "A public block";
protected
  Block1 bloPro "A protected block";
end BlockWithBlock1;
