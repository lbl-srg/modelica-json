function parse(content, rawJson=false) {
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
        moOutput+="\n";
        moOutput+=assignment_equationParser.parse(content.assignment_equation, rawJson);
    } else if (content.if_equation != null) {
        moOutput+="\n";
        moOutput+=if_equationParser.parse(content.if_equation, rawJson);
    } else if (content.for_equation != null) {
        moOutput+="\n";
        moOutput+=for_equationParser.parse(content.for_equation, rawJson);
    } else if (content.connect_clause != null) {
        moOutput+="\n";
        moOutput+=connect_clauseParser.parse(content.connect_clause, rawJson);
    } else if (content.when_equation != null) {
        moOutput+="\n";
        moOutput+=when_equationParser.parse(content.when_equation, rawJson);
    } else if (content.function_call_equation != null) {
        moOutput+="\n";
        moOutput+=function_call_equationParser.parse(content.function_call_equation, rawJson);
    } 

    if (rawJson) {
        if (content.comment != null) {
            moOutput+=commentParser.parse(content.comment, rawJson);
        }
    } else {
        if (content.description != null) {
            moOutput+=commentParser.parse(content.description, rawJson);
        }
    }
    

    return moOutput;
}

module.exports = {parse};