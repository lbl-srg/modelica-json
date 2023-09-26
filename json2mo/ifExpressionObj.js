function parse (content, rawJson = false) {
  const util = require('util')
  let moOutput = ''
  for (let i = 0; i < content.length; i++) {
    const ithCon = content[i]
    const ithElseIf = ithCon.if_elseif
    moOutput += 'if ('
    moOutput += util.format('%s', ithElseIf[0].condition)
    moOutput += ') then '
    moOutput += util.format('%s', ithElseIf[0].then)
    for (let j = 1; j < ithElseIf.length; j++) {
      moOutput += ' elseif ('
      moOutput += util.format('%s', ithElseIf[j].condition)
      moOutput += ') then '
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

module.exports = { parse }
