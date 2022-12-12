const as = require('assert')
const mo = require('mocha')
const path = require('path')
const ut = require('../lib/util.js')

// mo.describe('util', function () {
//   mo.describe('getModelicaFileName()', function () {
//     mo.it('must be equal', function () {
//       as.equal(
//         ut.getModelicaFileName(
//           'FromModelica', 'Block1',
//           path.join('test', 'FromModelica', 'Block1.mo')),
//         path.join('test', 'FromModelica', 'Block1.mo'))
//       as.equal(
//         ut.getModelicaFileName(
//           'FromModelica', 'Block1',
//           path.join('test', 'FromModelica', 'BlockWithBlock1.mo')),
//         path.join('test', 'FromModelica', 'Block1.mo'))
//     })
//   })
//   mo.describe('getModelicaFileName() with full name', function () {
//     mo.it('must be equal', function () {
//       as.equal(
//         ut.getModelicaFileName(
//           'FromModelica', 'Block1',
//           path.join('test', 'FromModelica', 'FromModelica.Block1.mo')),
//         path.join('test', 'FromModelica', 'Block1.mo'))
//       as.equal(
//         ut.getModelicaFileName(
//           'FromModelica', 'Block1',
//           path.join('test', 'FromModelica', 'FromModelica.BlockWithBlock1.mo')),
//         path.join('test', 'FromModelica', 'Block1.mo'))
//     })
//   })
// })
