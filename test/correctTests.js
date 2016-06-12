'use strict';

var expect = require('chai').expect;
var parentCogz = require('../index');

describe('Cogz used correctly', function() {
  var cogz;
  beforeEach(function () {
    cogz = parentCogz.spawnEmptyCogz();
  });
  it('should have an addCog function', function() {
    expect(typeof cogz.addCog).to.equal('function');
  });
  it('should allow member functions', function() {
    cogz.addCog('func1', function (num) { return ++num; });
    expect(typeof cogz.func1).to.equal('function');
    expect(cogz.func1(0)).to.equal(1);
    cogz.addCog({
      cogName: 'func2',
      value: function (num) { return ++num; }
    });
    expect(typeof cogz.func2).to.equal('function');
    expect(cogz.func2(0)).to.equal(1);
  });
  it('should allow member objects', function() {
    cogz.addCog('config1', { prop1: 'val1' });
    expect(cogz.config1.prop1).to.equal('val1');
    cogz.addCog({
      cogName: 'config2',
      value: { prop1: 'val1' }
    });
    expect(cogz.config2.prop1).to.equal('val1');
  });
  it('should allow member arrays', function() {
    cogz.addCog('arr1', ['val1']);
    expect(cogz.arr1[0]).to.equal('val1');
    cogz.addCog({
      cogName: 'arr2',
      value: [ 'val2' ]
    });
    expect(cogz.arr2[0]).to.equal('val2');
  });
});
// TODO: change parts.js to cogz.js and make it work.
// TODO: figure out how to bump npm version and record it in handy.
// TODO: FINISH TUTORIAL BY RE-REGISTERING ON TRAVIS AND ADDING COVERAGE AND BADGES

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
