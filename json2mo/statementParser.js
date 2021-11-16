function parse(content, rawJson) {
    const assignment_statementParser = require('./assignment_statementParser');
    const function_call_statementParser = require('./function_call_statementParser');
    const assignment_with_function_call_statementParser = require('./assignment_with_function_call_statementParser');
    const if_statementParser = require('./if_statementParser');
    const for_statementParser = require('./for_statementParser');
    const while_statementParser = require('./while_statementParser');
    const when_statementParser = require('./when_statementParser');
    const commentParser = require('./commentParser');

    var moOutput = "";
    if (content.assignment_statement != null) {
        moOutput+="\n";
        moOutput+=assignment_statementParser.parse(content.assignment_statement, rawJson);
    } else if (content.function_call_statement != null) {
        moOutput+="\n";
        moOutput+=function_call_statementParser.parse(content.function_call_statement, rawJson);
    } else if (content.assignment_with_function_call_statement != null) {
        moOutput+="\n";
        moOutput+=assignment_with_function_call_statementParser.parse(content.assignment_with_function_call_statement, rawJson);
    } else if (content.is_break != null) {
        if (content.is_break) {
            moOutput+="\nbreak\n";
        }
    } else if (content.is_return != null) {
        if (content.is_return) {
            moOutput+="\nreturn\n";
        }
    } else if (content.if_statement != null) {
        moOutput+="\n";
        moOutput+=if_statementParser.parse(content.if_statement, rawJson);
    } else if (content.for_statement != null) {
        moOutput+="\n";
        moOutput+=for_statementParser.parse(content.for_statement, rawJson);
    } else if (content.while_statement != null) {
        moOutput+="\n";
        moOutput+=while_statementParser.parse(content.while_statement, rawJson);
    } else if (content.when_statement != null) {
        moOutput+="\n";
        moOutput+=when_statementParser.parse(content.when_statement, rawJson);
    }

    if (rawJson) { 
        if (content.comment != null) {
            moOutput+=commentParser.parse(content.comment, rawJson);
        }   
    } else {
        if (content.description != null) {
            moOutput+=commentParser.parse(content.description, rawJson)
        }
    }
    return moOutput;
}

module.exports = {parse};