const path = require('path');
const fs = require('fs');
const stored_definitonParser = require('./json2mo/stored_definitonParser');

function convertToModelica(jsonFile, rawJson=false) {
    var fileContent = fs.readFileSync(jsonFile, 'utf8');
    //TODO: the [0] should change with the new simplified json
    var jsonOutput;
	if (rawJson) {
        jsonOutput = JSON.parse(fileContent)[0];
    } else {
        jsonOutput = JSON.parse(fileContent);
    }
    moOutput = stored_definitonParser.parse(jsonOutput, rawJson);
    return moOutput;
}

// console.log(convertToModeica('raw-json/FromModelica.ExtendsClause_1.json'));
// console.log(convertToModelica('raw-json/FromModelica.Modulation.json', rawJson=true));
console.log(convertToModelica('json/Modulation_2.json', rawJson=false));