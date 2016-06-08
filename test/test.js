'use strict';

var expect = require('chai').expect;
var parentCogz = require('../index');
var cogz;

describe('cogz', function() {
    beforeEach(function () {
      cogz = parentCogz.spawnEmptyCogz();
    })
    it('should have an add function', function() {
        expect(typeof cogz.add).to.equal('function');
    });
    it('should throw error on duplicate name', function() {
        cogz.add('first', 'test');
        var err;
        try {
          cogz.add('first', 'again');
        } catch (e) {
          err = e;
        } finally {
          expect(typeof err).to.equal('object');
        }
    });
    it('should throw error on duplicate cogz.add', function() {
        var err;
        try {
          cogz.add('add', 'again');
        } catch (e) {
          err = e;
        } finally {
          expect(typeof err).to.equal('object');
        }
    });
    it('should allow member functions', function() {
      cogz.add('func1', function () {});
      expect(typeof cogz.func1).to.equal('function');
      cogz.add({
        partName: 'func2',
        partValue: function () {}
      });
      expect(typeof cogz.func2).to.equal('function');
      console.log('FIRST', cogz.first)
    });
});

// // Test for predictable functions as cogz.
// (function testAddFunc2_1() {
//   var cogz = genCogz();
//   var result = 0;
//   cogz.add('func1', function () { result = result + 1; });
//   cogz.func1.partValue();
//   if (result !== 1) {
//     throw new Error('cogz.func.partValue should work when called.');
//   }
//   else numTests++;
// })(); // end of test
//
// // Test for predictable functions as cogz.
// (function testAddFunc2_2() {
//   var cogz = genCogz();
//   var result = 0;
//   cogz.add('func1', function () { result = result + 1; });
//   cogz.func1();
//   if (result !== 1) {
//     throw new Error('cogz.func and cogz.func.partValue should work the same.');
//   }
//   else numTests++;
// })(); // end of test
//
// // Test for reads etc.
// (function testReadsEtc() {
//   var cogz = genCogz();
//   cogz.add('str1', 'strA');
//   cogz.add('func1', function () {});
//   cogz.func1(cogz.str1);
//   if (!cogz.func1.reads.str1) {
//     throw new Error('A function should record any part it reads.');
//   }
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
//   cogz.add('str1', 'strA');
//   cogz.add('str2', 'strB');
//   cogz.add('func1', function () {});
//   cogz.func1(cogz.str1);
//   cogz.func1(cogz.str1);
//   if (Object.keys(cogz.func1.reads).length !== 1) {
//     throw new Error('part.reads should add only unique reads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestReads[0] !== 'str1' ||
//     cogz.func1.latestReads[1] !== 'str1' ||
//     cogz.func1.latestReads.length !== 2) {
//     throw new Error('A function should record the latest cogz it reads.');
//   }
//   else numTests++;
//   if (cogz.func1.latestUniqueReads.length !== 1) {
//     throw new Error('part.latestUniqueReads should add only unique reads.' +
//     'State:' + cogz.func1.latestUniqueReads);
//   }
//   else numTests++;
//
//   cogz.func1(cogz.str2);
//   if (Object.keys(cogz.func1.reads).length !== 2) {
//     throw new Error('part.reads should add all unique reads.');
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
//     throw new Error('part.latestUniqueReads should add all unique reads.' +
//     'State:' + cogz.func1.latestUniqueReads);
//   }
//   else numTests++;
// })(); // end of test
//
// // Test for maxLatestReads etc.
// (function testMaxLatestReadsEtc() {
//   var cogz = genCogz();
//   cogz.add('str1', 'strA');
//   cogz.add('str2', 'strB');
//   cogz.add('func1', function () {});
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
//   cogz.add('str1', 'strA');
//   cogz.add('func1', function () {});
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
//   cogz.add('str1', 'strA');
//   cogz.add('func1', function () {});
//   cogz.add('func2', function () {});
//   cogz.func1(cogz.str1);
//   cogz.func1(cogz.str1);
//   if (Object.keys(cogz.str1.readers).length !== 1) {
//     throw new Error('part.readers should add only unique readers.');
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
//     throw new Error('part.readers should add all unique readers.');
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
//   cogz.add('str1', 'strA');
//   cogz.add('func1', function () {});
//   cogz.add('func2', function () {});
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
