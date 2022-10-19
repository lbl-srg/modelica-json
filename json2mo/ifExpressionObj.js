function parse (content, rawJson = false) {
  const util = require('util')
  
  var moOutput = ''
  for (var i = 0; i < content.length; i++) {
    var ithCon = content[i]
    var ithElseIf = ithCon.if_elseif
    moOutput += 'if ('
    moOutput += util.format('%s', ithElseIf[0].condition)
    moOutput += ') then \n'
    moOutput += util.format('%s', ithElseIf[0].then)
    for (var j = 1; j < ithElseIf.length; j++) {
      moOutput += ' elseif ('
      moOutput += util.format('%s', ithElseIf[j].condition)
      moOutput += ') then \n'
      moOutput += util.format('%s', ithElseIf[j].then)
    }
    moOutput += ' else '
    moOutput += util.format('%s', ithCon.else)
    if (content.length > 1) {
      moOutput += ','
    }
  }
  return moOutput
}

module.exports = {parse}
