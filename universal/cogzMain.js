// TODO
// record changes to cogz, like cogz.stringifyReplacer and cogz.maxChangesToSave.
// removeCog and ensure no memory leak
// fix getObjClass usage because will not allow constructed or Map or WeakMap or anything.
// add incorrect/abuse/unexpectedInputs, ensure they give warning or error of some kind.
// work through other scattered TODO comments

(function cogzWrapper(window, module) {
  'use strict';
  var logTemp = console.log.bind(console);
  var logPerm = console.log.bind(console);
  var cogz = {
    add: add,
    replace: replace,
    containersByCogName: {},
    warning: warning,
    warnings: [],
    changes: [],
    maxChangesToSave: 100,
    numChangesDeleted: 0,
    getCog: getCog,
    count: count,
    recordChange: recordChange,
    pushChangeAndLimit: pushChangeAndLimit,
    registerObserver: registerObserver,
    toBeObserved: {},
    getObservers: getObservers,
    tryArgGroup: tryArgGroup,
    clear: clear,
    stringifyReplacer: stringifyReplacer,
    logTemp: logTemp,
    view: {},
    model: {}
  };
  function clear(arr) { // for testing
    if (!arr) arr = ['cogNames', 'changes', 'warnings'];
    arr.forEach(function (toClear) {
      switch (toClear) {
        case 'cogNames':
          cogz.containersByCogName = {};
          break;
        case 'changes':
          cogz.changes = [];
          cogz.numChangesDeleted = 0;
          break;
        case 'warnings':
          cogz.warnings = [];
          break;
      }
    });

  }
  function getCog(cogName) {
    // Look up the app reference by cogName, then use that to get the cog.
    if (this.containersByCogName[cogName]) {
      return this.containersByCogName[cogName][cogName];
    }
  }
  function count(obj, key) {
    if (!obj[key]) {
      obj[key] = 1;
    } else {
      obj[key]++;
    }
  }
  function recordChange(name, changeRecord) {
    var changed = cogz.getCog(name);
    // If an cog function calls an inner cog function that changes data, both
    // call this function, but only the inner, earlier function gets credit,
    // and the change is recorded and watched only once.
    var latestStr = changed.asCog.changes.slice(-1)[0].stringValue;
    if (changeRecord.stringValue === latestStr) return;
    cogz.pushChangeAndLimit(changed.asCog, changeRecord);
    cogz.pushChangeAndLimit(cogz, {
      cogName: name,
      changeRecord: changeRecord
    });
    changed.asCog.observers.forEach(function (observerRecord) {
      var thisCycle = observerRecord.changersThisCycle;
      var changer = changeRecord.byWhatFunction;
      var type = observerRecord.observationType;
      thisCycle[changer] = thisCycle[changer] ? ++thisCycle[changer] : 1;
      setTimeout(function () {
        thisCycle[changer] = 0; // Does this work in node?
      }, 0);
      if (thisCycle[changer] > 1 && type === 'watch') {
        var msg = "Warning: '" + changer + "' changed " + name + " more than once" +
        " in one cycle of the event loop, so to avoid a stack overflow, the " +
        "watcher " + observerRecord.observer + " is not being run this " +
        "time. To skip this protection, change 'watch:' to 'alwaysWatch:'.";
        cogz.warning(msg, observerRecord.observer);
        if (!cogz.getCog(observerRecord.observer).asCog.reduceLogs) {
          logPerm(msg);
        }
      } else if (type === 'watch' || type === 'alwaysWatch') {
        tryArgGroup(observerRecord, 'fromChange');
      }
    });
  }
  function pushChangeAndLimit(obj, item) {
    obj.changes.push(item);
    if (obj.changes.length > obj.maxChangesToSave) {
      // Limit length, which could be a big change if the max was recently set.
      // If max==arr.length+1, shift will work, but that's probably O(n) anyway.
      obj.changes.splice(0, obj.changes.length - obj.maxChangesToSave);
      obj.numChangesDeleted++;
    }

  }
  function warning(msg, cogName) {
    var entry = {
      cogName: cogName,
      warning: msg
    };
    cogz.warnings.push(entry);
    cogz.pushChangeAndLimit(cogz, entry);
  }
  function registerObserver(args) {
    if (!args.argGroups) return;
    var group, observerRecord, observedCog;
    for (var groupName in args.argGroups) {
      group = args.argGroups[groupName];
      group.forEach(function (argItem, i) {
        var type = Object.keys(argItem)[0];
        var argName = argItem[type];
        observerRecord = {
          observer: args.cogName,
          argGroup: groupName,
          observationType: type,
          changersThisCycle: {}
        };
        observedCog = cogz.getCog(argName);
        if (observedCog) {
          observedCog.asCog.observers.push(observerRecord);
          tryArgGroup(observerRecord);
        } else {
          cogz.toBeObserved[argName] = cogz.toBeObserved[argName] || [];
          cogz.toBeObserved[argName].push(observerRecord);
        }
      });
    }
  }
  function getObservers(cogName) {
    var observerRecords = cogz.toBeObserved[cogName] || [];
    delete cogz.toBeObserved[cogName];
    return observerRecords;
  }
  function tryArgGroup(observerRecord, fromChange) {
    var observerCog = cogz.getCog(observerRecord.observer);
    var itemsInArgGroup = observerCog.asCog.argGroups[observerRecord.argGroup];
    if (itemsInArgGroup.ranAtLeastOnce && !fromChange) return;
    var argsReady = true;
    var watching = observerRecord.observationType.match(/watch/i) && fromChange;
    var argGroupCogs = [];
    itemsInArgGroup.forEach(function (item) {
      var type = Object.keys(item)[0];
      var name = item[type];
      var cog = cogz.getCog(name);
      if (cog) {
        argGroupCogs.push(cog);
      } else {
        argGroupCogs.push(undefined);
        argsReady = false;
      }
    });
    if (watching && !argsReady) {
      var msg = "Warning: " + observerRecord.observer + " is being run with " +
      "incomplete args because of argGroup " + observerRecord.argGroup +
      " where a watched change occurred before other args were ready.";
      cogz.warning(msg, observerRecord.observer);
      // if (!observerCog.asCog.reduceLogs) {
      //   logPerm(msg);
      // }
    } else if (argsReady) {
      // add non-enumerable flag to array
      itemsInArgGroup.ranAtLeastOnce = true;
    }
    if (watching || argsReady) {
      observerCog.apply(null, argGroupCogs);
    }
  }
  function add(args) {
    var msg;
    if (args.value && args.value.asCog) {
      msg = "Tried to add a cog named '" + args.cogName + "' but its " +
      " value already has an 'asCog' property and its old cogName is '" +
      args.value.asCog.cogName + "'.";
      throw new Error(msg);
    }
    if (cogz.containersByCogName[args.cogName]) {
      msg = "Warning: a cog named '" + args.cogName + "' already exists but " +
      "now another has been added so the first may lose some functionality.";
      cogz.warning(msg, args.cogName);
      if (!args.reduceLogs) {
        logPerm(msg);
      }
    }
    // TODO: check for args.container and do something if it's not there.
    cogz.containersByCogName[args.cogName] = args.container;
    if (args.container[args.cogName]) {
      msg = "Warning: An item by the name of '" + args.cogName +
      "' already existed on the specified container but is being overwritten " +
      "due to a cogz.add argument with the same name.\n" +
      "Overwritten value: \n" + JSON.stringify(args.container[args.cogName]) +
      "\nNew value: \n" + JSON.stringify(args.value);
      cogz.warning(msg, args.cogName);
      if (!args.reduceLogs) {
        logPerm(msg);
      }
    }
    addOrReplace(args);
    if (typeof args.value === 'function') {
      cogz.registerObserver(args);
    }
  }
  // Optional cog parameter for replace.
  function addOrReplace(args, oldCog) {
    // TODO: check for args.cogName and do something if it's not there.
    if (!args.value ||
      (typeof args.value !== 'object' && typeof args.value !== 'function')) {
      var msg = "Warning: A cog value must be a function, a plain object, or " +
      "an array, but an attempt was made to add type: '" + typeof args.value +
      "', value: " + JSON.stringify(args.value) + ", cogName: '" + args.cogName +
      "'. It is being wrapped in an array for now, but consider fixing the code.";
      cogz.warning(msg, args.cogName);
      if (!args.reduceLogs) {
        logPerm(msg);
      }
      var oldValue = args.value;
      args.value = [];
      args.value.push(oldValue);
    }
    var newCog = args.container[args.cogName] = generateCog(args, oldCog);
    newCog.asCog.observers.forEach(function (observerRecord) {
      tryArgGroup(observerRecord, !!oldCog);
    });
  }
  // Would call this replaceValue but it may replace other stuff at some point?
  function replace(args) {
    var container;
    if (args.container) {
      cogz.containersByCogName[args.cogName] = container = args.container;
    } else { // if (cogz.containersByCogName[args.cogName]) {
      args.container = container = cogz.containersByCogName[args.cogName];
    }
    //else { TODO: do something, because they're replacing a non-existent cog? }
    addOrReplace(args, container[args.cogName]);
  }
  // args from add or replace, optional oldCog parameter from replace
  function generateCog(args, oldCog) {
    var cog = (typeof args.value === 'function') ? wrapper(args) : args.value;
    Object.defineProperty(cog, 'asCog', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: generateAsCog(args, oldCog)
    });
    return cog;
  }
  function wrapper(initArgs) {
    function wrapping(/* runtime arguments */) {
      // Note that what's passed to noteArgs is the runtime arguments.
      var dataArgs = noteArgs(arguments, cogz.getCog(initArgs.cogName));
      // Run function and capture returnValue
      var returnValue = initArgs.value.apply(null, arguments)

      saveOverwrittenValues(initArgs.cogName, dataArgs)
      return returnValue;
    }
    // Fix wrapping toString and valueOf to reflect wrapped function.

    return wrapping;
  }
  function noteArgs(args, receiverFunction) {
    var dataArgs = { topNames: [], strings: {}, cogs: {} };
    var arg, cName1, cName2, latest, indent;
    // Record cogs being read into this function.
    for (var i in args) {
      arg = args[i];
      cName1 = arg && arg.asCog && arg.asCog.cogName;
      if (cName1 && arg.asCog.isFunction) {
        cogz.count(receiverFunction.asCog.neededCogs, cName1);
        cogz.count(arg.asCog.neederCogs, receiverFunction.asCog.cogName);
      } else if (cName1) { // just arrays and objects left
        dataArgs.topNames[i] = cName1;
        if (Object.keys(arg).length > 3) {
          indent =  2;
        } else {
          indent = 0;
        }
        dataArgs.strings[cName1] = JSON.stringify(arg, cogz.stringifyReplacer, indent);
        dataArgs.cogs[cName1] = arg;
        latest = cName1 && arg.asCog.changes.slice(-1)[0].stringValue;
        if (cName1 && dataArgs.strings[cName1] !== latest) {
          var time = new Date().toISOString();
          cogz.recordChange(cName1, {
            whenValueStarted: time,
            byWhatFunction: undefined,
            stringValue: dataArgs.strings[cName1]
          });
        }
      }
    } // end for loop
    return dataArgs;
  }
  function saveOverwrittenValues(initCogName, dataArgs) {
    var newString, cInfo, time, fnName, indent;
    for (var name in dataArgs.cogs) {
      if (Object.keys(dataArgs.cogs[name]).length > 3) {
        indent = 2;
      } else {
        indent = 0;
      }
      newString = JSON.stringify(dataArgs.cogs[name], cogz.stringifyReplacer, indent);
      cInfo = dataArgs.cogs[name].asCog;
      fnName = initCogName;
      if (newString === dataArgs.strings[name]) {
        cogz.count(cInfo.nonChangerCogs, fnName);
      } else {
        time = new Date().toISOString();
        cogz.count(cInfo.changerCogs, fnName);
        cogz.recordChange(cInfo.cogName, {
          whenValueStarted: time,
          byWhatFunction: fnName,
          stringValue: newString
        });
      }
    }
  }
  function stringifyReplacer(key, val) {
    if (typeof val === 'function') {
      return val.toString();
    } else {
      return val;
    }
  }
  function generateAsCog(args, oldCog) {
    var asCog = (typeof args.value === 'function') ?
      generateAsCogForFunction(args, oldCog) : generateAsCogForData(args, oldCog);
    asCog.cogName = args.cogName;
    asCog.observers = oldCog ? oldCog.asCog.observers : cogz.getObservers(args.cogName);
    return asCog;
  }
  function generateAsCogForFunction(args, oldCog) {
    // TODO: check if args has argGroups or something to replace?
    return oldCog ? oldCog.asCog : {
      isFunction: true,
      neederCogs: {},
      neededCogs: {},
      argGroups: args.argGroups,
      thisCycle: {},
      reduceLogs: args.reduceLogs,
      originalFunction: args.value
    };
  }
  function generateAsCogForData(args, oldCog) {
    var time = new Date().toISOString();
    var fnName = oldCog ? 'cogz.replace' : 'cogz.add';
    var oldAsCog = oldCog ? oldCog.asCog : {};
    if (Object.keys(args.value).length > 3) {
      args.indent =  2;
    } else {
      args.indent = 0;
    }
    var str = JSON.stringify(args.value, cogz.stringifyReplacer, args.indent);
    var record = {
      whenValueStarted: time,
      byWhatFunction: fnName,
      stringValue: str
    };
    var changerCogs = oldAsCog.changerCogs || {};
    changerCogs[fnName] = changerCogs[fnName] ? changerCogs[fnName] + 1 : 1;
    var asCog = {
      changes: oldAsCog.changes || [],
      maxChangesToSave: args.maxChangesToSave || oldAsCog.maxChangesToSave || 10,
      numChangesDeleted: oldAsCog.numChangesDeleted || 0,
      changerCogs: changerCogs,
      nonChangerCogs: oldAsCog.nonChangerCogs || {}
    };
    // // If replacing, allow observers to do their thing.
    // if (oldAsCog.cogName) {
    //   cogz.recordChange(oldAsCog.cogName, record);
    // }
    // else { // If adding, wait until all includes are added.
      cogz.pushChangeAndLimit(cogz, {
        cogName: args.cogName,
        changeRecord: record
      });
      cogz.pushChangeAndLimit(asCog, record);
    //}
    return asCog;
  }
  // Tests run either in Node.js or browser but not both at once, so . . .
  /* istanbul ignore next */
  if (module) {
    module.exports = cogz;
  } else {
    window.cogz = cogz;
  }
})(typeof window === 'undefined' ? null : /* istanbul ignore next */ window,
   typeof module === 'undefined' ? /* istanbul ignore next */ null : module);
