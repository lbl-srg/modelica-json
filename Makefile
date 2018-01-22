##########################################
# Makefile to build and test the project
#########################################

.PHONY: test run

test:
	(cd motojson && npm test)

install-node-packages:
	npm install --save

run:
	(cd motojson && \
	node app.js --log debug -f ~/proj/ldrd/bie/modeling/github/lbl-srg/modelica-buildings/Buildings/Controls/OBC/ASHRAE/G36_PR1/AHUs/MultiZone/Controller.mo)
