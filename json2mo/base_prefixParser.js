function parse(content) {
    const util = require('util');
    var moOutput = "";
    if (content.type_prefix != null) {
        moOutput+=util.format("%s ", content.type_prefix);
    }
    return moOutput;
}

module.exports = {parse};