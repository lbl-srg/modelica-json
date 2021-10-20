const path = require('path');
const fs = require('fs');
const stored_definitonParser = require('./json2mo/stored_definitonParser');

function convertToModeica(jsonFile) {
    var fileContent = fs.readFileSync(jsonFile, 'utf8');
    //TODO: the [0] should change with the new simplified json
	var jsonOutput = JSON.parse(fileContent)[0];

    moOutput = stored_definitonParser.parse(jsonOutput);
    return moOutput;
}

// console.log(convertToModeica('raw-json/FromModelica.ExtendsClause_1.json'));
console.log(convertToModeica('raw-json/FromModelica.Modulation.json'));