##########################################
# Makefile to build and test the project
#########################################

.PHONY: test run compile-java generate-reference-output


test:
	npm test

# Target to generate reference output files
# This typically only needs to be run
# if the output format changes.
generate-reference-output:
	(cd test/FromModelica && \
	for ff in `find . -name '*.mo'`; do \
		node ../../app.js -l error -f $${ff} -w json; \
		node ../../app.js -l error -f $${ff} -w json-simplified; \
		done && \
		rm -f modelica-json.log)

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
