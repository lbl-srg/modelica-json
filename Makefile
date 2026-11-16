##########################################
# Makefile to build and test the project
#########################################
include .env
export

.PHONY: install-node-packages install test run generate-reference-output clean-node-packages clean-installation

install:
	npm install --save

test:
	npm test

# Target to generate reference output files
# This only needs to be run when the output format changes,
# or when new tests are added.
generate-reference-output:
	@echo "Generating new reference results"
	@echo "-------- Note: the versions of MBL and MSL in the MODELICAPATH should be consistent with the ones in .travis.yml. --------"
	@echo "-------- Note: the classes that are not CDL-compliant, such as ExtendsClause_1, fail with -o cxf, and have no CXF. --------"
	rm -rf ./test/reference; \
	(for ff in `find ./test/FromModelica -name '*.mo'` ./test/NoWithin.mo; do \
		node app.js -l warn -i $${ff} -o raw-json -d ./test/reference; \
		node app.js -l warn -i $${ff} -o json -d ./test/reference; \
		node app.js -l warn -i $${ff} -o semantic -d ./test/reference -p;\
		node app.js -l warn -i $${ff} -o cxf -d ./test/reference -p;\
		done); \
	node test/generateObjectsReference.js ./test/reference `find ./test/FromModelica -name '*.mo'` ./test/NoWithin.mo; \
        make generate-reference-output-modelica-mode; \
	node app.js -i Buildings/Controls/OBC/CDL -o cxf-core -d ./test/reference --pretty-print; \
	cp ./test/reference/cxf-core/CXF-Core.jsonld .

generate-reference-output-modelica-mode:
	@echo "Generating new reference results for test/ModelicaMode"
	@echo "-------- Note: the versions of MBL and MSL in the MODELICAPATH should be consistent with the ones in .travis.yml. --------"
	rm -rf ./test/reference/raw-json/ModelicaMode; \
	rm -rf ./test/reference/json/ModelicaMode; \
	rm -rf ./test/reference/objects/ModelicaMode; \
	rm -rf ./test/reference/cxf/ModelicaMode; \
	(for ff in `find ./test/ModelicaMode -name '*.mo'`; do \
		node app.js -l warn -i $${ff} -o raw-json -d ./test/reference; \
		node app.js -l warn -i $${ff} -o json -d ./test/reference; \
		node app.js -l warn -i $${ff} -o semantic -d ./test/reference -p; \
		node app.js -l warn -i $${ff} -o cxf -d ./test/reference -p; \
		done); \
	node test/generateObjectsReference.js ./test/reference `find ./test/ModelicaMode -name '*.mo'`

generate-reference-output-doc:
	@echo "Generating new reference results for test/expressionEvaluation and test/cdlDoc"
	@echo "-------- Note: the version of MBL in the MODELICAPATH should be consistent with the one in .travis.yml. --------"
	node test/cdlDoc/generateReference.js

generate-cxfCore:
	node app.js -i Buildings/Controls/OBC/CDL -o cxf-core --pretty-print;
	cp cxf-core/CXF-Core.jsonld .

clean-installation:
	rm -rf node-modules

run:
	node app.js \
	--log warn \
	-i Buildings/Controls/OBC/ASHRAE/G36/AHUs/MultiZone/VAV/Economizers/Controller.mo \
	-o cxf

ibpsa-library:
	node app.js \
	-o json \
	-i IBPSA/Fluid/FixedResistances/HydraulicDiameter.mo

# The below command should be run if jsParser/antlr/modelica.g4 
# grammar file has been updated. It will auto-generate the tokens, 
# lexers and parsers based on the updated grammar. 
update-grammar:
	cd jsParser/antlrFiles && curl -O https://www.antlr.org/download/antlr-4.7.2-complete.jar && ./generateFiles.sh
