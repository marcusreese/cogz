(function cogzWrapper(window, module) {
  var templog = console.log.bind(console);
  var permLog = console.log.bind(console);
  var cogz = {
    add: add,
    cogs: {},
    warning: warning,
    warnings: [],
    changes: [],
    maxChangesToSave: 100,
    getCog: getCog,
    count: count,
    recordChange: recordChange,
    pushAndLimit: pushAndLimit,
    registerObserver: registerObserver,
    toBeObserved: {},
    getObservers: getObservers,
    tryArgGroup: tryArgGroup,
    clear: clear
  };
  function clear(arr) { // for testing
    if (!arr) arr = ['cogs', 'changes', 'warnings'];
    arr.forEach(function (toClear) {
      switch (toClear) {
        case 'cogs':
          cogz.cogs = {};
          break;
        case 'changes':
          cogz.changes = [];
          break;
        case 'warnings':
          cogz.warnings = [];
          break;
      }
    });

  }
  function getCog(cogName) {
    // Look up the app reference by cogName, then use that to get the cog.
    if (this.cogs[cogName]) {
      return this.cogs[cogName][cogName];
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
    cogz.pushAndLimit(
      changed.asCog.changes,
      changed.asCog.numValuesToSave,
      changeRecord
    );
    cogz.pushAndLimit(cogz.changes, cogz.maxChangesToSave, {
      cogName: name,
      changeRecord: changeRecord
    });
    changed.asCog.observers.forEach(function (observerRecord) {
      var thisCycle = observerRecord.changersThisCycle;
      var changer = changeRecord.byWhatFunction;
      var type = observerRecord.observationType;
      thisCycle[changer] = thisCycle[changer] ? ++thisCycle[changer] : 1;
      setTimeout(function () {
        thisCycle[changer] = 0;
      }, 0);
      if (thisCycle[changer] > 1 && type === 'watch') {
        var msg = "Warning: '" + changer + "' changed " + name + " more than once" +
        " in one cycle of the event loop, so to avoid a stack overflow, the " +
        "watcher " + observerRecord.observer + " is not being run this " +
        "time. To skip this protection, change 'watch:' to 'alwaysWatch:'.";
        cogz.warning(msg, observerRecord.observer);
        if (!cogz.getCog(observerRecord.observer).asCog.reduceLogs) {
          permLog(msg);
        }
      } else if (type === 'watch' || type === 'alwaysWatch') {
        tryArgGroup(observerRecord, 'fromChange');
      }
    });
  }
  function pushAndLimit(arr, max, item) {
    arr.push(item);
    // Limit length, which could be a big change if the max was recently set.
    // If max==arr.length+1, shift will work, but that's probably O(n) anyway.
    arr.splice(0, arr.length - max);
  }
  function warning(msg, cogName) {
    var entry = {
      cogName: cogName,
      warning: msg
    };
    cogz.warnings.push(entry);
    cogz.pushAndLimit(cogz.changes, cogz.maxChangesToSave, entry);
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
        observed = cogz.getCog(argName);
        if (observed) {
          observed.asCog.observers.push(observerRecord);
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
      //   permLog(msg);
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
    if (cogz.cogs[args.cogName]) {
      msg = "Warning: a cog named '" + args.cogName + "' already exists but " +
      "now another has been added so the first may lose some functionality.";
      cogz.warning(msg, args.cogName);
      if (!args.reduceLogs) {
        permLog(msg);
      }
    }
    cogz.cogs[args.cogName] = args.container;
    if (!args.value ||
      (typeof args.value !== 'object' && typeof args.value !== 'function')) {
      msg = "Warning: A cog value must be a function, a plain object, or " +
      "an array, but an attempt was made to add type: '" + typeof args.value +
      "', value: " + JSON.stringify(args.value) + ", cogName: '" + args.cogName +
      "'. It is being wrapped in an array for now, but consider fixing the code.";
      cogz.warning(msg, args.cogName);
      if (!args.reduceLogs) {
        permLog(msg);
      }
      var oldValue = args.value;
      args.value  = [];
      args.value.push(oldValue);
    }
    if (args.container[args.cogName]) {
      msg = "Warning: An item by the name of '" + args.cogName +
      "' already existed on the specified container but is being overwritten " +
      "due to a cogz.add argument with the same name.\n" +
      "Overwritten value: \n" + JSON.stringify(args.container[args.cogName]) +
      "\nNew value: \n" + JSON.stringify(args.value);
      cogz.warning(msg, args.cogName);
      if (!args.reduceLogs) {
        permLog(msg);
      }
    }
    var newCog = args.container[args.cogName] = generateCog(args);
    // Check 1) what may be waiting already, and 2) if this will be waiting.
    newCog.asCog.observers.forEach(function (observerRecord) {
      tryArgGroup(observerRecord);
    });
    if (typeof args.value === 'function') {
      cogz.registerObserver(args);
    }
  }
  function generateCog(args) {
    var cog = (typeof args.value === 'function') ? wrapper(args) : args.value;
    Object.defineProperty(cog, 'asCog', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: generateAsCog(args)
    });
    return cog;
  }
  function wrapper(initArgs) {
    function wrapping(/*arguments*/) {
      var dataArgs = noteArgs(arguments, cogz.getCog(initArgs.cogName));
      // Run function and capture returnValue
      returnValue = initArgs.value.apply(null, arguments)

      saveOverwrittenValues(initArgs, dataArgs)
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
        dataArgs.strings[cName1] = JSON.stringify(arg, funcsToo, indent);
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
  function saveOverwrittenValues(initArgs, dataArgs) {
    var newString, cInfo, time, fnName, indent;
    for (var name in dataArgs.cogs) {
      if (Object.keys(dataArgs.cogs[name]).length > 3) {
        indent = 2;
      } else {
        indent = 0;
      }
      newString = JSON.stringify(dataArgs.cogs[name], funcsToo, indent);
      cInfo = dataArgs.cogs[name].asCog;
      fnName = initArgs.cogName;
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
  function funcsToo(key, val) {
    if (typeof val === 'function') {
      return val.toString();
    } else {
      return val;
    }
  }
  function generateAsCog(args) {
    var asCog = (typeof args.value === 'function') ?
      generateAsCogForFunction(args) : generateAsCogForData(args);
    asCog.cogName = args.cogName;
    asCog.observers = cogz.getObservers(args.cogName);
    return asCog;
  }
  function generateAsCogForFunction(args) {
    return {
      isFunction: true,
      neederCogs: {},
      neededCogs: {},
      argGroups: args.argGroups,
      thisCycle: {},
      reduceLogs: args.reduceLogs
    };
  }
  function generateAsCogForData(args) {
    var time = new Date().toISOString();
    var fnName = 'cogz.add';
    if (Object.keys(args.value).length > 3) {
      args.indent =  2;
    } else {
      args.indent = 0;
    }
    var str = JSON.stringify(args.value, funcsToo, args.indent);
    var record = {
      whenValueStarted: time,
      byWhatFunction: fnName,
      stringValue: str
    };
    cogz.pushAndLimit(cogz.changes, cogz.maxChangesToSave, {
      cogName: args.cogName,
      changeRecord: record
    });
    return {
      changes: [record],
      numValuesToSave: args.numValuesToSave || 10,
      changerCogs: {
        'cogz.add': 1
      },
      nonChangerCogs: {}
    };
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
