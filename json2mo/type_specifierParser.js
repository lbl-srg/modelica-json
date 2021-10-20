function parse(content) {
    const util = require('util');
    const nameParser = require('./nameParser');

    var moOutput = "";
    if (content.name != null) {
        moOutput+=nameParser.parse(content.name);
    }
    return moOutput;
}

module.exports = {parse};