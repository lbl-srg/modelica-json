// const as = require('assert')
// const mo = require('mocha')
// const hw = require('../lib/htmlWriter.js')

// mo.describe('htmlWriter', function () {
//   mo.describe('removeHtmlTag()', function () {
//     mo.it('should return true', function () {
//       as.equal(hw.removeHtmlTag('aa <html> bb', 'html'), 'aa  bb')
//       as.equal(hw.removeHtmlTag('aa <HTML> bb', 'html'), 'aa  bb')
//       as.equal(hw.removeHtmlTag('aa </html> bb', 'html'), 'aa  bb')
//       as.equal(hw.removeHtmlTag('aa </HTML> bb', 'html'), 'aa  bb')
//     })
//     mo.it('should return false', function () {
//       as.notEqual(hw.removeHtmlTag('aa <Ahtml> bb', 'html'), 'aa  bb')
//       as.notEqual(hw.removeHtmlTag('aa <AHTML> bb', 'html'), 'aa  bb')
//       as.notEqual(hw.removeHtmlTag('aa </Ahtml> bb', 'html'), 'aa  bb')
//       as.notEqual(hw.removeHtmlTag('aa </AHTML> bb', 'html'), 'aa  bb')
//     })
//   })
//   mo.describe('returnImageLocations()', function () {
//     mo.it('should return', function () {
//       as.deepEqual(hw.getImageLocations(
//         'aa <img src="Buildings/Resources/Images/test.png" alt="altComment">'),
//       ['Buildings/Resources/Images/test.png'])
//       as.deepEqual(hw.getImageLocations(
//         'aa <img src="Buildings/Resources/Images/test.png">'),
//       ['Buildings/Resources/Images/test.png'])
//       as.deepEqual(hw.getImageLocations(
//         'aa <img src="Buildings/Resources/Images/test.png"/>'),
//       ['Buildings/Resources/Images/test.png'])
//       as.deepEqual(hw.getImageLocations(
//         'aa <img src="Buildings/Resources/Images/test.png"> bb <img src="Buildings/Resources/Images/test2.png">'),
//       ['Buildings/Resources/Images/test.png', 'Buildings/Resources/Images/test2.png'])
//     })
//   })
// })
