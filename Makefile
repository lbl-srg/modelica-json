##########################################
# Makefile to build and test the project
#########################################
	
# download maven source file to current directory and change its name
install_maven:	
	@echo "Installing maven ............"
	wget -O apache_maven.tar.gz http://apache.mirrors.tds.net/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz 
	mkdir -p apache_maven && tar xzvf apache_maven.tar.gz -C apache_maven --strip-components 1 && rm -rf apache_maven.tar.gz

run_maven:
	$(eval export PATH=$(dir $(realpath $(firstword $(MAKEFILE_LIST))))apache_maven/bin:${PATH}) 
	cd java && mvn package && cp parser/target/parser-1.0-SNAPSHOT-jar-with-dependencies.jar moParser.jar && mvn clean

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
	-f ~/GitFolder/modelica-buildings/Buildings/Controls/OBC/ASHRAE/G36_PR1/AHUs/MultiZone/Controller.mo \
	-w html
