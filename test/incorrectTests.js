'use strict';

var expect = require('chai').expect;
var parentCogz = require('../index');

describe('Cogz used incorrectly', function() {
  var cogz;
  beforeEach(function () {
    //cogz = parentCogz.spawnEmptyCogz();
  });
  var illegalNames = [
    { 'window': 'is reserved for cogz.defaultInputCheck' },
    //{ 'defaultInputCheck': 'already exists in cogz' },
    //{ 'inputCheckInterface': 'already exists in cogz' },
    { 'addCog': 'already exists in cogz' },
    { 'spawnEmptyCogz': 'already exists in cogz' },
    { 'cogInfo': 'already exists in cogz' },
    { 'cogMorph': 'already exists in cogz' },
    { 'baseHtml': 'already exists in cogz' },
    { 'saveFileOnServer': 'already exists in cogz' },
  ];
  var label, val;
  for (var pair in illegalNames) {
    label = Object.keys(illegalNames[pair])[0];
    val = illegalNames[pair][label];
    (function makeIt1(label, val) {
      it('should error on cogz.' + label + ' because it ' + val, function() {
        var fn = function () {
          parentCogz.addCog({
            cogName: label,
            value: 'someValue'
          });
        };
        expect(fn).to.throw(Error);
      });
    })(label, val)
  }
});

// // Test for readers etc.
// (function testReadersEtc() {
//   var cogz = genCogz();
//   cogz.addCog('str1', 'strA');
//   cogz.addCog('func1', function () {});
//   cogz.func1(cogz.str1);
//   if (!cogz.str1.readers.func1) {
//     console.log('readers in test', cogz.str1.readers)
//     throw new Error('A part should record any part() that reads it.');
//   }
//   else numTests++;
//   if (cogz.str1.latestReaders[0] !== 'func1') {
//     throw new Error('A part should record the latest part() that reads it.');
//   }
//   else numTests++;
//   if (cogz.str1.latestUniqueReaders[0] !== 'func1') {
//     throw new Error('A part should record the latest unique part() that reads it.');
//   }
//   else numTests++;
// })(); // end of test
//
// // Test for number of readers etc.
// (function testNumReadersEtc() {
//   var cogz = genCogz();
//   cogz.addCog('str1', 'strA');
//   cogz.addCog('func1', function () {});
//   cogz.addCog('func2', function () {});
//   cogz.func1(cogz.str1);
//   cogz.func1(cogz.str1);
//   if (Object.keys(cogz.str1.readers).length !== 1) {
//     throw new Error('part.readers should addCog only unique readers.');
//   }
//   else numTests++;
//   if (cogz.str1.latestReaders[0] !== 'func1' ||
//     cogz.str1.latestReaders[1] !== 'func1' ||
//     cogz.str1.latestReaders.length !== 2) {
//     throw new Error('A part should record the latest part()s that read it.');
//   }
//   else numTests++;
//
//   cogz.func2(cogz.str1);
//   if (Object.keys(cogz.str1.readers).length !== 2) {
//     throw new Error('part.readers should addCog all unique readers.');
//   }
//   else numTests++;
//   if (cogz.str1.latestReaders[0] !== 'func1' ||
//     cogz.str1.latestReaders[1] !== 'func1' ||
//     cogz.str1.latestReaders[2] !== 'func2' ||
//     cogz.str1.latestReaders.length !== 3) {
//     throw new Error('A part should record all the latest part()s that read it.');
//   }
//   else numTests++;
//   if (cogz.str1.latestUniqueReaders[0] !== 'func1' ||
//     cogz.str1.latestUniqueReaders[1] !== 'func2' ||
//     cogz.str1.latestUniqueReaders.length !== 2) {
//     throw new Error('A part should record all the latest unique part()s that read it.');
//   }
//   else numTests++;
// })(); // end of test
//
// // Test for maxLatestReaders etc.
// (function testMaxLatestReadersEtc() {
//   var cogz = genCogz();
//   cogz.addCog('str1', 'strA');
//   cogz.addCog('func1', function () {});
//   cogz.addCog('func2', function () {});
//   cogz.str1.maxLatestReaders = 1;
//   cogz.str1.maxLatestUniqueReaders = 1;
//   cogz.func1(cogz.str1);
//   cogz.func2(cogz.str1);
//   if (cogz.str1.latestReaders[0] !== 'func2' ||
//     cogz.str1.latestReaders.length !== 1) {
//     throw new Error('A part should respect maxLatestReaders.');
//   }
//   else numTests++;
//   if (cogz.str1.latestUniqueReaders[0] !== 'func2' ||
//     cogz.str1.latestUniqueReaders.length !== 1) {
//     throw new Error('A part should respect maxLatestUniqueReaders.');
//   }
//   else numTests++;
// })(); // end of test
//
// console.log('Be thankful: ' + numTests + ' tests passed.');
// var cogz = genCogz();
// if (module) {
//   module.exports = cogz;
//   // Fill up cogz.
//   require('./baseHtml');
//   cogz.baseHtml();
// } else {
//   window.cogz = cogz;
// }
//
// })(typeof window === 'undefined' ? null : window,
//  typeof module === 'undefined' ? null : module);
