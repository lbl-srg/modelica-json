function parse(content) {
    const util = require('util');
    const assignment_equationParser = require('./assignment_equationParser');
    const if_equationParser = require('./if_equationParser');
    const for_equationParser = require('./for_equationParser');
    const connect_clauseParser = require('./connect_clauseParser');
    const when_equationParser = require('./when_equationParser');
    const function_call_equationParser = require('./function_call_equationParser');
    const commentParser = require('./commentParser');
    
    var moOutput = "";
    if (content.assignment_equation != null) {
        moOutput+=assignment_equationParser.parse(content.assignment_equation);
    } else if (content.if_equation != null) {
        moOutput+=if_equationParser.parse(content.if_equation);
    } else if (content.for_equation != null) {
        moOutput+=for_equationParser.parse(content.for_equation);
    } else if (content.connect_clause != null) {
        moOutput+=connect_clauseParser.parse(content.connect_clause);
    } else if (content.when_equation != null) {
        moOutput+=when_equationParser.parse(content.when_equation);
    } else if (content.function_call_equation != null) {
        moOutput+=function_call_equationParser.parse(content.function_call_equation);
    } 

    if (content.comment != null) {
        moOutput+=commentParser.parse(content.comment);
    }

    return moOutput;
}

module.exports = {parse};