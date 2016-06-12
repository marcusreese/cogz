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
  for (var pair in cogObjClasses) {
    label = Object.keys(cogObjClasses[pair])[0];
    val = cogObjClasses[pair][label];
    (function makeIt1(label, val) {
      it('should record the name of ' + label + ' in cogInfo.', function() {
        cogz.addCog({ cogName: label, value: val });
        expect(cogz.cogInfo[label].cogName).to.equal(label);
      });
      it('should record the name of ' + label + ' in cogMorph.', function() {
        cogz.addCog({ cogName: label, value: val });
        expect(cogz.cogMorph[label].cogName).to.equal(label);
      });
      it('should give the name of ' + label + ' via toString.', function() {
        cogz.addCog({ cogName: label, value: val });
        expect(cogz[label].toString('cogName'))
          .to.equal('{\n  "cogName": "' + label + '"\n}');
      });
      it('should give the name of ' + label + ' via valueOf.', function() {
        cogz.addCog({ cogName: label, value: val });
        expect(cogz[label].valueOf('cogName')).to.equal(label);
      });
      it('should bump timesRead when a function reads ' + label + '.', function() {
        cogz.addCog({ cogName: label, value: val });
        cogz.addCog('func1', function () {});
        // Func1 reads other cog.
        cogz.func1(cogz[label]);
        expect(cogz.cogInfo[label].timesRead).to.equal(1);
      });
      it('should add to readers when a function reads ' + label + '.', function() {
        cogz.addCog({ cogName: label, value: val });
        cogz.addCog('func1', function () {});
        // Func1 reads other cog.
        cogz.func1(cogz[label]);
        expect(cogz.cogInfo[label].readers.func1).to.equal(1);
      });
      it('should add to cogsRead when a function reads ' + label + '.', function() {
        cogz.addCog({ cogName: label, value: val });
        cogz.addCog('func1', function () {});
        // Func1 reads other cog.
        cogz.func1(cogz[label]);
        expect(cogz.cogInfo.func1.cogsRead[label]).to.exist;
      });
      it('should preserve the normal toString of ' + label, function() {
        cogz.addCog({ cogName: label, value: val });
        expect(typeof cogz[label].toString).to.equal('function');
        expect(typeof cogz[label].toString()).to.equal('string');
      });
    })(label, val)
  }
  it('should preserve the normal toString of a function', function() {
    cogz.addCog({ cogName: 'fn1', value: function () { 'test' } });
    var fn2 = function () { 'test' };
    expect(cogz.fn1.toString()).to.equal(fn2.toString());
  });
  it('should preserve the normal toString of an object', function() {
    cogz.addCog({ cogName: 'ob1', value: { test: 1 } });
    var ob2 = { test: 1 };
    expect(cogz.ob1.toString()).to.equal(ob2.toString());
  });
  it('should preserve the normal toString of an array', function() {
    cogz.addCog({ cogName: 'ar1', value: ['test'] });
    var ar2 = ['test'];
    expect(cogz.ar1.toString()).to.equal(ar2.toString());
  });
  // for (var pair in cogObjClasses) {
  //   label = Object.keys(cogObjClasses[pair])[0];
  //   val = cogObjClasses[pair][label];
  //   (function makeIt2(label, val) {
  //   })(label, val)
  // }
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
