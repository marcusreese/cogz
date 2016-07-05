'use strict';

var expect = require('chai').expect;
var cogz= require('../index');

describe('Cogz used correctly', function() {
  beforeEach(function () {
    cogz.clear(['cogs', 'changes']); // let 'warnings' accumulate for last test.
  });
  var cogTypes = [
    ["a ", "function", function () {}],
    ["an ", "array", []],
    ["an ", "object", {}]
  ]
  cogTypes.forEach(function testType(type) {
    // adds a function, adds an array, add an object
    it("adds " + type[0] + type[1] + " to a container.", function () {
      var name = type[0] + type[1], app = {};
      var val1 = type[1]==='function' ?
        function () {} :
        JSON.parse(JSON.stringify(type[2]));
      cogz.add({
        container: app,
        cogName: name,
        value: val1
      });
      expect(getObjType(app[name])).to.equal(type[1]);
    });
  });
  var dataTypes = [
    ["an ", "array", []],
    ["an ", "object", {}]
  ]
  dataTypes.forEach(function testType(type) {
    it("configures numValuesToSave on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2])),
        numValuesToSave: 8
      });
      expect(app[name].asCog.numValuesToSave).to.equal(8);
      app[name].asCog.numValuesToSave = Infinity;
      expect(app[name].asCog.numValuesToSave).to.equal(Infinity);
    });
    it("saves changes of " + type[0] + type[1] + " in cogz.changes.", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2]))
      });
      var modifier = function (x, i, newVal) {
        x[i] = newVal;
      };
      cogz.add({
        container: app,
        cogName: 'modifier',
        value: function (x, i, newVal) {
          x[i] = newVal;
        }
      });
      modifier(app[name], 0, 'someValue');
      app.modifier(app[name], 0, { label: 'newestValue' });
      expect(cogz.changes.length).to.equal(3);
      var lastTwo = cogz.changes.slice(-2);
      expect(lastTwo[0].cogName).to.equal(name);
      expect(lastTwo[1].cogName).to.equal(name);
      expect(lastTwo[0].changeRecord.stringValue).to.contain('someValue');
      expect(lastTwo[1].changeRecord.stringValue).to.contain('newestValue');
    });
    it("adds newlines to stringValues of a larger " + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2]))
      });
      cogz.add({
        container: app,
        cogName: 'modifier',
        value: function (x, i, newVal) {
          x[i] = newVal;
        }
      });
      expect(app[name].asCog.changes.slice(-1)[0].stringValue).not.to.contain('\n');
      app.modifier(app[name], 0, { prop: 'val' });
      expect(app[name].asCog.changes.slice(-1)[0].stringValue).not.to.contain('\n');
      app.modifier(app[name], 1, { prop: 'val' });
      expect(app[name].asCog.changes.slice(-1)[0].stringValue).not.to.contain('\n');
      app.modifier(app[name], 2, { prop: 'val' });
      expect(app[name].asCog.changes.slice(-1)[0].stringValue).not.to.contain('\n');
      app.modifier(app[name], 3, { prop: 'val' });
      expect(app[name].asCog.changes.slice(-1)[0].stringValue).to.contain('\n');
      cogz.add({
        container: app,
        cogName: 'bigArray',
        value: [1,2,3,4]
      });
      expect(app.bigArray.asCog.changes.slice(-1)[0].stringValue).to.contain('\n');
      cogz.add({
        container: app,
        cogName: 'bigObject',
        value: {1:1,2:2,3:3,4:4}
      });
      expect(app.bigObject.asCog.changes.slice(-1)[0].stringValue).to.contain('\n');

    });
  });
  it("limits the length of cogz.changes.", function () {
    cogz.maxChangesToSave = 4;
    var app = {};
    cogz.add({
      container: app,
      cogName: 'someName',
      value: ['someValue']
    });
    cogz.add({
      container: app,
      cogName: 'modifier',
      value: function (x, i, newVal) {
        x[i] = newVal;
      }
    });
    [1,2,3,4,5].forEach(function (val) {
      app.modifier(app.someName, 0, { label: val });
    });
    expect(cogz.changes.length).to.equal(4);
    expect(cogz.changes.slice(-1)[0].cogName).to.equal('someName');
  });
  it("runs an observer when an argGroup is ready.", function () {
    var app = {};
    cogz.add({
      container: app,
      cogName: 'needed array',
      value: ['arrValue']
    });
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [
          { include: 'needed array'},
          { include: 'needed object' },
          { include: 'needed function' }
        ]
      },
      value: function (arr, obj, func) { func(arr, obj); }
    });
    cogz.add({
      container: app,
      cogName: 'needed function',
      value: function (arr, obj) { arr.push(obj.prop1); obj.prop1 = arr[0]; }
    });
    cogz.add({
      container: app,
      cogName: 'needed object',
      value: { prop1: 'objValue' }
    });
    expect(app['needed array'][1]).to.equal('objValue');
    expect(app['needed array'].length).to.equal(2);
    expect(app['needed object'].prop1).to.equal('arrValue');
  });
  it("runs a later watcher when an argGroup is changed by a cog.", function () {
    var app = {};
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['val']
    });
    cogz.add({
      container: app,
      cogName: 'includedObj',
      value: { timesRun: 0, arrayEdited: false }
    });
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [
          { watch: 'watchedArray' },
          { include: 'includedObj' }
        ]
      },
      value: function (arr, obj) {
        if (arr[0] === 'val&') {
          obj.arrayEdited = true;
        }
        obj.timesRun++;
      }
    });
    expect(app.includedObj.timesRun).to.equal(1);
    expect(app.includedObj.arrayEdited).to.equal(false);
    cogz.add({
      container: app,
      cogName: 'modifier',
      value: function (arr) { arr[0] = arr[0] + '&'; }
    });
    app.modifier(app.watchedArray);
    expect(app.includedObj.timesRun).to.equal(2);
    expect(app.includedObj.arrayEdited).to.equal(true);
  });
  it("runs a prior watcher when an argGroup is changed by a cog.", function () {
    var app = {};
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [
          { watch: 'watchedArray' },
          { include: 'includedObj' }
        ]
      },
      value: function (arr, obj) {
        if (arr[0] === 'val&') {
          obj.arrayEdited = true;
        }
        obj.timesRun++;
      }
    });
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['val']
    });
    cogz.add({
      container: app,
      cogName: 'includedObj',
      value: { timesRun: 0, arrayEdited: false }
    });
    expect(app.includedObj.timesRun).to.equal(1);
    expect(app.includedObj.arrayEdited).to.equal(false);
    cogz.add({
      container: app,
      cogName: 'modifier',
      value: function (arr) { arr[0] = arr[0] + '&'; }
    });
    app.modifier(app.watchedArray);
    expect(app.includedObj.timesRun).to.equal(2);
    expect(app.includedObj.arrayEdited).to.equal(true);
  });
  it("allows a potentially infinite loop using alwaysWatch.", function () {
    var app = {};
    var numWarnings = cogz.warnings.length;
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [
          { alwaysWatch: 'watchedArray' }
        ]
      },
      value: function (arr) {
        if (arr.length < 10) arr.push('change');
      }
    });
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['val']
    });
    expect(cogz.warnings.length).to.equal(numWarnings);
    expect(app.watchedArray.length).to.equal(10);
  });
  it("handles a good example for the readme.", function () {

    // Create one or more containers for namespacing.
    // There may be model, view, and controller containers,
    // but this demo will simplify things into just an app container.
    var app = {};
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['arrayItem0']
    });
    // So now app has app.watchedArray.
    expect(app.watchedArray instanceof Array).to.equal(true);
    // And its current form is saved so that changes can be tracked.
    expect(cogz.changes.length).to.equal(1);
    expect(cogz.changes[0].cogName).to.equal('watchedArray');
    expect(cogz.changes[0].changeRecord.stringValue).to.equal('["arrayItem0"]');
    // By default, cogz saves the last 100 changes. Configuring that is easy.
    cogz.maxChangesToSave = 20;
    // The watchedArray cog also keeps some records in its own .asCog property.
    var arrayAsCog = app.watchedArray.asCog;
    expect(arrayAsCog.cogName).to.equal('watchedArray');
    // The cogz.changes array interleaves changes from all data cogs,
    // but if you're more interested in watchedArray, it tracks its own changes.
    expect(arrayAsCog.changes.length).to.equal(1);
    arrayAsCog.maxChangesToSave = 1000;

    // A cog can also be a function, set up in a similar way.
    // If a function needs to observe or inject, it specifies argGroups.
    cogz.add({
      container: app,
      cogName: 'arrayWatcherFunction',
      argGroups: {
        groupX: [
          { watch: 'watchedArray' },
          { include: 'newsObject' }
        ]
      },
      value: function (arr, obj) {
        obj.news.push(app.watchedArray.asCog.cogName + ' has been changed');
      }
    });
    // So now app has app.arrayWatcherFunction()
    expect(typeof app.arrayWatcherFunction).to.equal('function');
    // It has one argGroup which is hoping for a 'newsObject'. Let's add one.
    cogz.add({
      container: app,
      cogName: 'newsObject',
      value: { news: [] }
    });

    // Now that all arguments are ready, arrayWatcherFunction runs.
    expect(app.newsObject.news.length).to.equal(1);
    expect(cogz.changes.length).to.equal(3);
    expect(cogz.changes[0].cogName).to.equal('watchedArray');
    expect(cogz.changes[1].cogName).to.equal('newsObject');
    expect(cogz.changes[2].cogName).to.equal('newsObject');

    // Function cogs do not need to specify argGroups.
    cogz.add({
      container: app,
      cogName: 'arrayChanger',
      value: function (arr) {
        arr.push('newArrayItem');
      }
    });

    // When watchedArray is changed, arrayWatcherFunction runs again.
    app.arrayChanger(app.watchedArray);
    expect(app.watchedArray.length).to.equal(2);
    expect(app.watchedArray.asCog.changes.length).to.equal(2);
    expect(app.newsObject.news.length).to.equal(2);
    expect(app.newsObject.asCog.changes.length).to.equal(3);
    expect(cogz.changes.length).to.equal(5);

    // TODO: demonstrate reactive style code and undo/redo.
  });
}); // end describe

describe("The asCog property", function() {
  beforeEach(function () {
    cogz.clear(['cogs', 'changes']); // let 'warnings' accumulate for last test.
  });
  var cogTypes = [
    ["a ", "function", function () {}],
    ["an ", "array", []],
    ["an ", "object", {}]
  ]
  cogTypes.forEach(function testType(type) {
    it("exists on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      var val1 = type[1]==='function' ?
        function () {} :
        JSON.parse(JSON.stringify(type[2]));
      cogz.add({
        container: app,
        cogName: name,
        value: val1
      });
      expect(typeof app[name].asCog).to.equal('object');
    });
    it("provides the cogName of " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      var val1 = type[1]==='function' ?
        function () {} :
        JSON.parse(JSON.stringify(type[2]));
      cogz.add({
        container: app,
        cogName: name,
        value: val1
      });
      expect(app[name].asCog.cogName).to.equal(name);
    });
    it("provides observers on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1];
      var name2 = name + '2';
      var app = {};
      var val1 = type[1]==='function' ?
        function () {} :
        JSON.parse(JSON.stringify(type[2]));
      var val2 = type[1]==='function' ?
        function () {} :
        JSON.parse(JSON.stringify(type[2]));
      cogz.add({
        container: app,
        cogName: name,
        value: val1
      });
      cogz.add({
        container: app,
        cogName: name2,
        value: val2
      });
      cogz.add({
        container: app,
        cogName: 'needer',
        argGroups: {
          groupX: [{ include: name }, { watch: name2 }]
        },
        value: function (neededDataCog1, neededDataCog2) {}
      });
      expect(app.needer.asCog.argGroups.groupX[0].include).to.equal(name);
      expect(app.needer.asCog.argGroups.groupX[1].watch).to.equal(name2);
      expect(getObjType(app[name].asCog.observers)).to.equal('array');
      expect(app[name].asCog.observers.length).to.equal(1);
      expect(getObjType(app[name].asCog.observers[0])).to.equal('object');
      expect(app[name].asCog.observers[0].observer).to.equal('needer');
      expect(app[name].asCog.observers[0].argGroup).to.equal('groupX');
      expect(app[name2].asCog.observers.length).to.equal(1);
      expect(app[name2].asCog.observers[0].observer).to.equal('needer');
      expect(app[name2].asCog.observers[0].argGroup).to.equal('groupX');
    }); // end it
    it("provides prior observers on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1];
      var name2 = name + '2';
      var app = {};
      var val1 = type[1]==='function' ?
        function () {} :
        JSON.parse(JSON.stringify(type[2]));
      var val2 = type[1]==='function' ?
        function () {} :
        JSON.parse(JSON.stringify(type[2]));
      cogz.add({
        container: app,
        cogName: 'needer',
        argGroups: {
          groupX: [{ include: name }, { watch: name2 }]
        },
        value: function (neededDataCog1, neededDataCog2) {}
      });
      cogz.add({
        container: app,
        cogName: name,
        value: val1
      });
      cogz.add({
        container: app,
        cogName: name2,
        value: val2
      });
      expect(app.needer.asCog.argGroups.groupX[0].include).to.equal(name);
      expect(app.needer.asCog.argGroups.groupX[1].watch).to.equal(name2);
      expect(getObjType(app[name].asCog.observers)).to.equal('array');
      expect(app[name].asCog.observers.length).to.equal(1);
      expect(getObjType(app[name].asCog.observers[0])).to.equal('object');
      expect(app[name].asCog.observers[0].observer).to.equal('needer');
      expect(app[name].asCog.observers[0].argGroup).to.equal('groupX');
      expect(app[name2].asCog.observers.length).to.equal(1);
      expect(app[name2].asCog.observers[0].observer).to.equal('needer');
      expect(app[name2].asCog.observers[0].argGroup).to.equal('groupX');
    }); // end it
  }); // end forEach type

  var dataTypes = [
    ["an ", "array", []],
    ["an ", "object", {}]
  ]
  dataTypes.forEach(function testData(type) {
    it("provides changerCogs on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2]))
      });
      cogz.add({
        container: app,
        cogName: 'modifier',
        value: function (x, i, newVal) {
          x[i] = newVal;
        }
      });
      // Before the changes
      expect(getObjType(app[name].asCog.changerCogs)).to.equal('object');
      expect(Object.keys(app[name].asCog.changerCogs).length).to.equal(1);
      var firstChanger = app[name].asCog.changerCogs['cogz.add'];
      expect(firstChanger).to.equal(1);
      // First change
      app.modifier(app[name], 0, 'someValue');
      expect(Object.keys(app[name].asCog.changerCogs).length).to.equal(2);
      var secondChanger = app[name].asCog.changerCogs['modifier'];
      expect(secondChanger).to.equal(1);
      // Second change
      app.modifier(app[name], 0, function () { return 'theValueIsAFunction'; });
      expect(Object.keys(app[name].asCog.changerCogs).length).to.equal(2);
      var secondChanger = app[name].asCog.changerCogs['modifier'];
      expect(secondChanger).to.equal(2);
      // Now run again without changing anything.
      app.modifier(app[name], 0, function () { return 'theValueIsAFunction'; });
      expect(Object.keys(app[name].asCog.changerCogs).length).to.equal(2);
      var secondChanger = app[name].asCog.changerCogs['modifier'];
      expect(secondChanger).to.equal(2);
    }); // end it
    it("provides nonChangerCogs on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2]))
      });
      cogz.add({
        container: app,
        cogName: 'depender',
        value: function () {}
      });
      // Before the usage
      expect(getObjType(app[name].asCog.nonChangerCogs)).to.equal('object');
      expect(Object.keys(app[name].asCog.nonChangerCogs).length).to.equal(0);
      // First usage
      app.depender(app[name]);
      expect(Object.keys(app[name].asCog.nonChangerCogs).length).to.equal(1);
      expect(app[name].asCog.nonChangerCogs['depender']).to.equal(1);
      // Second usage
      app.depender(app[name]);
      expect(Object.keys(app[name].asCog.nonChangerCogs).length).to.equal(1);
      expect(app[name].asCog.nonChangerCogs['depender']).to.equal(2);
    }); // end it
    it("provides changes on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2]))
      });
      cogz.add({
        container: app,
        cogName: 'modifier',
        value: function (x, i, newVal) {
          x[i] = newVal;
        }
      });
      // Before the changes
      expect(getObjType(app[name].asCog.changes)).to.equal('array');
      expect(app[name].asCog.changes.length).to.equal(1);
      var changesEntry0 = app[name].asCog.changes[0];
      expect(changesEntry0.byWhatFunction).not.to.equal('modifier');
      expect(changesEntry0.stringValue).not.to.contain('someValue');
      // First change
      app.modifier(app[name], 0, 'someValue');
      expect(app[name].asCog.changes.length).to.equal(2);
      var changesEntry1 = app[name].asCog.changes[1];
      expect(getObjType(changesEntry1)).to.equal('object');
      var date1 = Date.parse(changesEntry1.whenValueStarted)
      expect(isNaN(date1)).to.equal(false);
      expect(changesEntry1.byWhatFunction).to.equal('modifier');
      expect(changesEntry1.stringValue).to.contain('someValue');
      // Second change
      app.modifier(app[name], 0, function () { return 'theValueIsAFunction'; });
      expect(app[name].asCog.changes.length).to.equal(3);
      var changesEntry2 = app[name].asCog.changes[2];
      var date2 = Date.parse(changesEntry2.whenValueStarted)
      expect(isNaN(date2)).to.equal(false);
      expect(date1 > date2).to.equal(false);
      expect(changesEntry2.byWhatFunction).to.equal('modifier');
      expect(changesEntry2.stringValue).to.contain('theValueIsAFunction');
      // Now run again without changing anything.
      app.modifier(app[name], 0, function () { return 'theValueIsAFunction'; });
      expect(app[name].asCog.changes.length).to.equal(3);
      changesEntry2 = app[name].asCog.changes[2];
      date2 = Date.parse(changesEntry2.whenValueStarted)
      expect(isNaN(date2)).to.equal(false);
      expect(date1 > date2).to.equal(false);
      expect(changesEntry2.byWhatFunction).to.equal('modifier');
      expect(changesEntry2.stringValue).to.contain('theValueIsAFunction');
    }); // end it
    it("limits changes on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2])),
        numValuesToSave: 2
      });
      cogz.add({
        container: app,
        cogName: 'modifier',
        value: function (x, i, newVal) {
          x[i] = newVal;
        }
      });
      // First change
      app.modifier(app[name], 0, 'someValue');
      expect(app[name].asCog.changes.length).to.equal(2);
      var changesEntry1 = app[name].asCog.changes[1];
      expect(changesEntry1.stringValue).to.contain('someValue');
      var date1 = Date.parse(changesEntry1.whenValueStarted);
      // Second change
      app.modifier(app[name], 0, function () { return 'theValueIsAFunction'; });
      expect(app[name].asCog.changes.length).to.equal(2);
      var changesEntry0 = app[name].asCog.changes[0];
      var date0 = Date.parse(changesEntry0.whenValueStarted);
      expect(date0).to.equal(date1);
      expect(changesEntry0.stringValue).to.equal(changesEntry1.stringValue);
      changesEntry1 = app[name].asCog.changes[1];
      expect(changesEntry1.stringValue).to.contain('theValueIsAFunction');
    }); // end it
    it("saves non-cog changes on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2]))
      });
      var modifier = function (x, i, newVal) {
        x[i] = newVal;
      };
      cogz.add({
        container: app,
        cogName: 'modifier',
        value: function (x, i, newVal) {
          x[i] = newVal;
        }
      });
      // First change
      modifier(app[name], 0, 'someValue');
      // Second change
      app.modifier(app[name], 0, { label: 'newestValue' });
      expect(app[name].asCog.changes.length).to.equal(3);
      var changesEntry1 = app[name].asCog.changes[1];
      expect(changesEntry1.stringValue).to.contain('someValue');
      expect(changesEntry1.byWhatFunction).to.equal(undefined);
      var changesEntry2 = app[name].asCog.changes[2];
      expect(changesEntry2.stringValue).to.contain('"label":"newestValue"');
      expect(changesEntry2.byWhatFunction).to.equal('modifier');
    }); // end it
    // it("provides changes from nested " + type[1] + "s.", function () {
    //   var name = type[0] + type[1], app = {};
    //   cogz.add({
    //     container: app,
    //     cogName: name,
    //     value: JSON.parse(JSON.stringify(type[2]))
    //   });
    //   cogz.add({
    //     container: app,
    //     cogName: 'modifier',
    //     value: function (x, name, i, newVal) {
    //       x[name][i] = newVal;
    //     }
    //   });
    //   var objectForNesting = {};
    //   objectForNesting[name] = app[name];
    //   app.modifier(objectForNesting, name, 0, 'someValue');
    //   expect(getObjType(app[name].asCog.changes)).to.equal('array');
    //   expect(app[name].asCog.changes.length).to.equal(1);
    //   var changesEntry1 = app[name].asCog.changes[0];
    //   expect(getObjType(changesEntry1)).to.equal('object');
    //   var date1 = Date.parse(changesEntry1.whenValueStarted)
    //   expect(isNaN(date1)).to.equal(false);
    //   expect(changesEntry1.byWhatFunction).to.equal('modifier');
    //   expect(changesEntry1.stringValue).not.to.contain('someValue');
    //
    //   app.modifier(objectForNesting, name, 0, function () { return 'theValueIsAFunction'; });
    //   expect(app[name].asCog.changes.length).to.equal(2);
    //   var changesEntry2 = app[name].asCog.changes[1];
    //   var date2 = Date.parse(changesEntry2.whenValueStarted)
    //   expect(isNaN(date2)).to.equal(false);
    //   expect(date1 > date2).to.equal(false);
    //   expect(changesEntry2.byWhatFunction).to.equal('modifier');
    //   expect(changesEntry2.stringValue).to.contain('someValue');
    // }); // end it

    it("provides numValuesToSave on " + type[0] + type[1] + ".", function () {
      var name = type[0] + type[1], app = {};
      cogz.add({
        container: app,
        cogName: name,
        value: JSON.parse(JSON.stringify(type[2]))
      });
      expect(typeof app[name].asCog.numValuesToSave).to.equal('number');
      expect(app[name].asCog.numValuesToSave).to.be.above(2);
      expect(app[name].asCog.numValuesToSave).to.be.below(12);
    });
  }); // end forEach dataType
  it("provides neederCogs on a function.", function () {
    var app = {};
    cogz.add({
      container: app,
      cogName: 'needed',
      value: function() {}
    });
    cogz.add({
      container: app,
      cogName: 'needer',
      value: function (neededFunction) {}
    });
    // Before the usage
    expect(getObjType(app.needed.asCog.neederCogs)).to.equal('object');
    expect(Object.keys(app.needed.asCog.neederCogs).length).to.equal(0);
    // First usage
    app.needer(app.needed);
    expect(Object.keys(app.needed.asCog.neederCogs).length).to.equal(1);
    expect(app.needed.asCog.neederCogs['needer']).to.equal(1);
    // Second usage
    app.needer(app.needed);
    expect(Object.keys(app.needed.asCog.neederCogs).length).to.equal(1);
    expect(app.needed.asCog.neederCogs['needer']).to.equal(2);
  }); // end it
  it("provides neededCogs on a function.", function () {
    var app = {};
    cogz.add({
      container: app,
      cogName: 'needed',
      value: function() {}
    });
    cogz.add({
      container: app,
      cogName: 'needer',
      value: function (neededFunction) {}
    });
    // Before the usage
    expect(getObjType(app.needer.asCog.neededCogs)).to.equal('object');
    expect(Object.keys(app.needer.asCog.neededCogs).length).to.equal(0);
    // First usage
    app.needer(app.needed);
    expect(Object.keys(app.needer.asCog.neededCogs).length).to.equal(1);
    expect(app.needer.asCog.neededCogs['needed']).to.equal(1);
    // Second usage
    app.needer(app.needed);
    expect(Object.keys(app.needer.asCog.neededCogs).length).to.equal(1);
    expect(app.needer.asCog.neededCogs['needed']).to.equal(2);
  }); // end it
  it("provides argGroups on a function.", function () {
    var app = {};
    cogz.add({
      container: app,
      cogName: 'needed',
      value: function() {}
    });
    cogz.add({
      container: app,
      cogName: 'needer',
      argGroups: {
        groupX: [{ include: 'needed' }]
      },
      value: function (neededFunction) {}
    });
    expect(getObjType(app.needer.asCog.argGroups)).to.equal('object');
    expect(Object.keys(app.needer.asCog.argGroups).length).to.equal(1);
    expect(getObjType(app.needer.asCog.argGroups.groupX)).to.equal('array');
    expect(app.needer.asCog.argGroups.groupX.length).to.equal(1);
    expect(app.needer.asCog.argGroups.groupX[0].include).to.equal('needed');
  }); // end it
}); // end describe the asCog function
describe('Cogs used correctly (reprise)', function () {
  beforeEach(function () {
    cogz.clear(['cogs', 'changes']); // let 'warnings' accumulate for last test.
  });
  it('has no warnings.', function () {
    expect(cogz.warnings.length).to.equal(0);
  });
});
function getObjType(x) {
  return Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
}
