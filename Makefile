##########################################
# Makefile to build and test the project
#########################################
include .env
export

.PHONY: install-node-packages install test run generate-reference-output clean-node-packages clean-installation

# download maven source file to current directory and change its name
install-node-packages:
	npm install --save

install: install-node-packages

test:
	npm test

# Target to generate reference output files
# This only needs to be run when the output format changes,
# or when new tests are added.
generate-reference-output:
	rm -rf ./test/reference; \
	(for ff in `find ./test/FromModelica -name '*.mo'`; do \
		node app.js -l warn -f $${ff} -o raw-json -d ./test/reference; \
		node app.js -l warn -f $${ff} -o json -d ./test/reference; \
		node app.js -l warn -f $${ff} -o semantic -d ./test/reference -p;\
		node app.js -l warn -f $${ff} -o cxf -d ./test/reference -p;\
		done); \
	node app.js -f Buildings/Controls/OBC/CDL -o cxf -d ./test/reference --elementary --cxfCore --prettyPrint; \
	cp ./test/reference/cxf/CXF-Core.jsonld .

generate-cxfCore:
	node app.js -f Buildings/Controls/OBC/CDL -o cxf --elementary --cxfCore --prettyPrint; 
	cp cxf/CXF-Core.jsonld .

clean-node-packages:
	rm -rf node-modules

clean-installation: clean-node-packages

run:
	node app.js \
	--log warn \
	-f Buildings/Controls/OBC/ASHRAE/G36/AHUs/MultiZone/VAV/Economizers/Controller.mo \
	-o html

ibpsa-library:
	node app.js \
	-o json \
	-f IBPSA/Fluid/FixedResistances/HydraulicDiameter.mo
