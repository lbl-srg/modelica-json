##########################################
# Makefile to build and test the project
#########################################

.PHONY: test run compile-java

test:
	npm test

install-node-packages:
	npm install --save

compile-java:
	@echo "Compiling java code to produce jar"

clean-installation:
	rm -rf node-modules
	@echo "Cleaning compiled java code"

run:
	node app.js \
	--log debug \
	-f ~/proj/ldrd/bie/modeling/github/lbl-srg/modelica-buildings/Buildings/Controls/OBC/ASHRAE/G36_PR1/AHUs/MultiZone/Controller.mo \
	-w html
