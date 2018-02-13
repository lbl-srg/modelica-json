##########################################
# Makefile to build and test the project
#########################################

.PHONY: install-maven install-node-packages install compile test run compile-java generate-reference-output clean-node-packages clean-maven clean-installation

# download maven source file to current directory and change its name
install-maven:
	@echo "Installing maven"
	curl http://apache.mirrors.tds.net/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz > apache-maven.tar.gz
	mkdir -p apache_maven
	tar xzf apache-maven.tar.gz -C apache_maven --strip-components 1
	rm -rf apache-maven.tar.gz

install-node-packages:
	npm install --save

install: install-maven install-node-packages

compile:
	@echo "Compiling java to produce jar"
	cd java && ../apache_maven/bin/mvn package
	mv java/parser/target/parser-1.0-SNAPSHOT-jar-with-dependencies.jar java/moParser.jar
	cd java && ../apache_maven/bin/mvn clean

test:
	npm test

# Target to generate reference output files
# This typically only needs to be run
# if the output format changes.
generate-reference-output:
	(cd test/FromModelica && \
	for ff in `find . -name '*.mo'`; do \
		node ../../app.js -l debug -f $${ff} -w json; \
		node ../../app.js -l debug -f $${ff} -w json-simplified; \
		node ../../app.js -l debug -f $${ff} -w html; \
		done)
	rm -f test/FromModelica/modelica-json.log

clean-node-packages:
	rm -rf node-modules

clean-maven:
	rm -rf apache_maven

clean-installation: clean-node-packages clean-maven


run:
	node app.js \
	--log warn \
	-f ~/proj/ldrd/bie/modeling/github/lbl-srg/modelica-buildings/Buildings/Controls/OBC/ASHRAE/G36_PR1/AHUs/MultiZone/Economizers/Controller.mo \
	-w html
