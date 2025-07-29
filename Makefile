##########################################
# Makefile to build and test the project
#########################################
include .env
export

ifeq ($(wildcard ./apache_maven/bin/mvn),)
MVN = mvn  # Use maven from system installation
else
MVN = ../apache_maven/bin/mvn
endif

MVN_LINK = https://archive.apache.org/dist/maven/maven-3/$(MAVEN3_VERSION)/binaries/apache-maven-$(MAVEN3_VERSION)-bin.tar.gz

.PHONY: install-maven install-node-packages install compile test run compile-java generate-reference-output clean-node-packages clean-maven clean-installation

# download maven source file to current directory and change its name
install-maven:
	@echo "Installing Maven v$(MAVEN3_VERSION)"
	curl $(MVN_LINK) > apache-maven.tar.gz
	mkdir -p apache_maven
	tar xzf apache-maven.tar.gz -C apache_maven --strip-components 1
	rm -rf apache-maven.tar.gz

install-node-packages:
	npm install --save

install: install-maven install-node-packages

compile:
	@echo "Compiling java to produce jar"
	cd java && $(MVN) package
	mv java/parser/target/parser-1.0-SNAPSHOT-jar-with-dependencies.jar java/moParser.jar
	cd java && $(MVN) clean

test:
	npm test

test-moParser:
	java -jar java/moParser.jar --mo test/FromModelica/Block1.mo

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

clean-maven:
	rm -rf apache_maven

clean-installation: clean-node-packages clean-maven

run:
	node app.js \
	--log warn \
	-f Buildings/Controls/OBC/ASHRAE/G36/AHUs/MultiZone/VAV/Economizers/Controller.mo \
	-o html

ibpsa-library:
	node app.js \
	-o json \
	-f IBPSA/Fluid/FixedResistances/HydraulicDiameter.mo
