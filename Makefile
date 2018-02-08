##########################################
# Makefile to build and test the project
#########################################

.PHONY: install-maven install-node-packages install compile test run compile-java generate-reference-output

# download maven source file to current directory and change its name
install-maven:
	@echo "Installing maven"
	wget -O apache_maven.tar.gz http://apache.mirrors.tds.net/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz
	mkdir -p apache_maven && tar xzvf apache_maven.tar.gz -C apache_maven --strip-components 1 && rm -rf apache_maven.tar.gz

install-node-packages:
	npm install --save

install: install-maven install-node-packages

compile:
	@echo "Compiling java code to produce jar"
	$(eval export PATH=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))apache_maven/bin:${PATH})
	cd java && mvn package && cp parser/target/parser-1.0-SNAPSHOT-jar-with-dependencies.jar moParser.jar && mvn clean

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

clean-installation:
	rm -rf node-modules
	rm -rf apache_maven

run:
	node app.js \
	--log debug \
	-f ~/GitFolder/modelica-buildings/Buildings/Controls/OBC/ASHRAE/G36_PR1/AHUs/MultiZone/Controller.mo \
	-w html
