function parse (content, rawJson = false) {
  const util = require('util')

  var moOutput = ''
  if (content.not != null) {
    moOutput += 'not '
  }
  if (content.arithmetic_expressions) {
    moOutput += util.format('%s', content.arithmetic_expressions[0].name)
    moOutput += ' '
    moOutput += util.format('%s', content.relation_operator)
    moOutput += ' '
    moOutput += util.format('%s', content.arithmetic_expressions[1].name)
  }
  return moOutput
}

module.exports = {parse}
