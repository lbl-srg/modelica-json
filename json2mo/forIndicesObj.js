function parse (content, rawJson = false) {
  const util = require('util')

  let moOutput = ''
  moOutput += util.format('%s', content[0].name)
  moOutput += ' in '
  moOutput += util.format('%s', content[0].range)
  if (content.length > 1) {
    for (let i = 1; i < content.length; i++) {
      const ith = content[i]
      moOutput += ', '
      moOutput += util.format('%s', ith.name)
      moOutput += ' in '
      moOutput += util.format('%s', ith.range)
    }
  }
  return moOutput
}

module.exports = { parse }
