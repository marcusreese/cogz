'use strict';

var expect = require('chai').expect;
var parentCogz = require('../index');

describe('Cogz, the boring side,', function() {
  var cogz;
  beforeEach(function () {
    cogz = parentCogz.spawnEmptyCogz();
  });
  var objClasses = [
    { "a string": 'str' },
    { "an empty string": '' },
    { "a positive number": 123 },
    { "a negative number": -123 },
    { "a zero": 0 },
    { "a true": true },
    { "a false": false },
    { "an empty object": {} },
    { "an object": { 'a': 1 } },
    { "an empty array": [] },
    { "an array": [1, 2, 3] },
    { "a function": function () {} },
    { "null": null },
    { "undefined": undefined },
  ];
  var cogObjClasses = [
    { "an empty object": {} },
    { "an object": { 'a': 1 } },
    { "an empty array": [] },
    { "an array": [1, 2, 3] },
    { "a function": function () {} },
  ];
  var label, val;
  for (var pair in cogObjClasses) {
    label = Object.keys(cogObjClasses[pair])[0];
    val = cogObjClasses[pair][label];
    (function makeIt1(label, val) {
      it('should record when a function cog reads ' + label + ' cog.', function() {
        cogz.addCog({ cogName: label, value: val });
        cogz.addCog('func1', function () {});
        // Func1 reads other cog.
        cogz.func1(cogz[label]);
        expect(cogz.cogInfo[label].timesRead).to.equal(1);
        expect(cogz.cogInfo[label].readers.func1).to.equal(1);
        expect(cogz.cogInfo.func1.cogsRead[label]).to.exist; // as date.
      });
    })(label, val)

  }

});


// Test for reads etc.
// (function testReadsEtc() {
//   var cogz = genCogz();
//   else numTests++;
//   if (cogz.func1.latestReads[0] !== 'str1') {
//     throw new Error('A function should record the latest part it reads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestUniqueReads[0] !== 'str1') {
//     throw new Error('A function should record the unique cogz it reads.');
//   }
//   else numTests++;
// })(); // end of test
//
// // Test for number of reads etc..
// (function testNumReadsEtc() {
//   var cogz = genCogz();
//   cogz.addCog('str1', 'strA');
//   cogz.addCog('str2', 'strB');
//   cogz.addCog('func1', function () {});
//   cogz.func1(cogz.str1);
//   cogz.func1(cogz.str1);
//   if (Object.keys(cogz.func1.reads).length !== 1) {
//     throw new Error('part.reads should addCog only unique reads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestReads[0] !== 'str1' ||
//     cogz.func1.latestReads[1] !== 'str1' ||
//     cogz.func1.latestReads.length !== 2) {
//     throw new Error('A function should record the latest cogz it reads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestUniqueReads.length !== 1) {
//     throw new Error('part.latestUniqueReads should addCog only unique reads.' +
//     'State:' + cogz.func1.latestUniqueReads);
//   }
//   else numTests++;
//
//   cogz.func1(cogz.str2);
//   if (Object.keys(cogz.func1.reads).length !== 2) {
//     throw new Error('part.reads should addCog all unique reads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestReads[0] !== 'str1' ||
//     cogz.func1.latestReads[1] !== 'str1' ||
//     cogz.func1.latestReads[2] !== 'str2' ||
//     cogz.func1.latestReads.length !== 3) {
//     throw new Error('A function should record all the latest cogz it reads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestUniqueReads[0] !== 'str1' ||
//     cogz.func1.latestUniqueReads[1] !== 'str2' ||
//     cogz.func1.latestUniqueReads.length !== 2) {
//     throw new Error('part.latestUniqueReads should addCog all unique reads.' +
//     'State:' + cogz.func1.latestUniqueReads);
//   }
//   else numTests++;
// })(); // end of test
//
// // Test for maxLatestReads etc.
// (function testMaxLatestReadsEtc() {
//   var cogz = genCogz();
//   cogz.addCog('str1', 'strA');
//   cogz.addCog('str2', 'strB');
//   cogz.addCog('func1', function () {});
//   cogz.func1.maxLatestReads = 1;
//   cogz.func1.maxLatestUniqueReads = 1;
//   cogz.func1(cogz.str1);
//   cogz.func1(cogz.str2);
//   if (cogz.func1.latestReads[0] !== 'str2' ||
//     cogz.func1.latestReads.length !== 1) {
//     throw new Error('A function should respect maxLatestReads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestUniqueReads[0] !== 'str2' ||
//     cogz.func1.latestUniqueReads.length !== 1) {
//     throw new Error('A function should respect maxLatestUniqueReads.');
//   }
//   else numTests++;
// })(); // end of test
//
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
