function parse(content) {
    const util = require('util');

    var moOutput = "";
    moOutput+=util.format("%s ", content);
    return moOutput;
}

module.exports = {parse};