'use strict';

var expect = require('chai').expect;
var cogz = require('../index');

describe('Cogz used incorrectly', function() {
  beforeEach(function () {
    cogz.clear(['cogs', 'changes', 'warnings']);
  });
  var primitives = [
    ["a string.", 'str'],
    ["an empty string.", ''],
    ["a positive number.", 123],
    ["a negative number.", -123],
    ["a zero.", 0],
    ["a true.", true],
    ["a false.", false],
    ["null.", null],
    ["undefined.", undefined],
  ];
  primitives.forEach(function testPrimitive(primitive) {
    it('should warn on adding ' + primitive[0], function () {
      var numWarnings = cogz.warnings.length;
      var app = {};
      cogz.add({
        container: app,
        cogName: primitive[0],
        value: primitive[1],
        reduceLogs: primitive[1] !== null // log once
      });
      expect(cogz.warnings.length).to.equal(numWarnings + 1);
    })
  }); // end forEach
  it("should warn on overwriting due to duplicate name.", function () {
    var app = { prop1: 'val1' };
    var numWarnings = cogz.warnings.length;
    cogz.add({
      container: app,
      cogName: 'prop1',
      value: ['val2'],
      reduceLogs: true
    });
    expect(cogz.warnings.length).to.be.above(numWarnings);
    cogz.add({
      container: app,
      cogName: 'prop2',
      value: ['val1']
    });
    cogz.add({
      container: app,
      cogName: 'prop2',
      value: ['val2']
    });
    expect(cogz.warnings.length).to.be.above(numWarnings + 2);
    var container2 = {};
    cogz.add({
      container: container2,
      cogName: 'prop2',
      value: ['val3'],
      reduceLogs: true
    });
    expect(cogz.warnings.length).to.be.above(numWarnings + 3);
  });
  it("should error on overwriting due to duplicate value.", function () {
    // because when passed into functions, a cog must be recognisable.
    // The only alternative would be to attach an array of cognames?
    var fn = function () {
      var app = {}, val = {};
      cogz.add({
        container: app,
        cogName: 'name1',
        value: val
      });
      cogz.add({
        container: app,
        cogName: 'name2',
        value: val
      });
    };
    expect(fn).to.throw(Error);
  });
  it("warns on a direct infinite loop using watch.", function () {
    var app = {};
    var numWarnings = cogz.warnings.length;
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [
          { watch: 'watchedArray' }
        ]
      },
      value: function (arr) {
        arr.push('change');
      }
    });
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['val']
    });
    expect(cogz.warnings.length).to.be.above(numWarnings);
  });
  it("warns on an indirect infinite loop using watch.", function () {
    var app = {};
    var numWarnings = cogz.warnings.length;
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [
          { watch: 'watchedArray' },
          { include: 'includedFunc' }
        ]
      },
      reduceLogs: true,
      value: function (arr, func) {
        func(arr);
      }
    });
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['val']
    });
    cogz.add({
      container: app,
      cogName: 'includedFunc',
      value: function (arr) { arr[0] = arr[0] + '&'; }
    });
    expect(cogz.warnings.length).to.be.above(numWarnings);
  });
  it("warns on a change to watched data before argGroup ready.", function () {
    var app = {};
    var numWarnings = cogz.warnings.length;
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [
          { watch: 'watchedArray' },
          { include: 'includedObj' }
        ]
      },
      reduceLogs: true,
      value: function (arr, obj) {}
    });
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['val']
    });
    cogz.add({
      container: app,
      cogName: 'modifier',
      value: function (arr) { arr[0] = arr[0] + '&'; }
    });
    app.modifier(app.watchedArray);
    cogz.add({
      container: app,
      cogName: 'includedObj',
      value: {}
    });
    expect(cogz.warnings.length).to.be.above(numWarnings);
  });
  it("should clear everything using cogz.clear.", function () {
    var app = { name1: 'someVal' };
    // probably incorrect except in testing.
    cogz.add({
      container: app,
      cogName: 'name1',
      value: {},
      reduceLogs: true
    });
    expect(Object.keys(cogz.cogs).length).to.be.above(0);
    expect(cogz.changes.length).to.be.above(0);
    expect(cogz.warnings.length).to.be.above(0);
    cogz.clear();
    expect(Object.keys(cogz.cogs).length).to.equal(0);
    expect(cogz.changes.length).to.equal(0);
    expect(cogz.warnings.length).to.equal(0);
  });

}); // end describe
