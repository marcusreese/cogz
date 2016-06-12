//var f = o.toString; o.toString = function(x){if(x) return x; else return f.call(this);};}

(function cogzWrapper(window, module) {

  function generateCogz() {
    var cogz = {};
    cogz.cogInfo = { cogz: {} };
    cogz.cogMorph = { cogz: {} };
    cogz.addCog = function addCog(args) {
      if (typeof args === 'string') {
        args = {
          cogName: arguments[0],
          value: arguments[1]
        }
      }
      if (args.cogName in cogz) {
        throw new Error('Duplicate: cogz.' + args.cogName + ' already exists.');
      } else if (args.cogName === 'window') {
        throw new Error('This name is off-limits due to cogz.defaultInputCheck.');
      } else {
        cogz.cogInfo[args.cogName] = generateInfo(args);
        cogz.cogMorph[args.cogName] = generateMorph(args, cogz.cogInfo);
        // Include cogInfo and cogMorph as arguments to generateCog,
        // not for immediate side effects, but for closure.
        cogz[args.cogName] = generateCog(args, cogz.cogInfo, cogz.cogMorph);
      }
    }
    cogz.spawnEmptyCogz = function spawnEmptyCogz() { return generateCogz(); }
    return cogz;
  }

  function generateInfo(args) {
    var info = {
      latestUniqueWriters: [],
      latestWriters: [],
      writers: {}, // name and? numTimes or latestTime? or both? or one in w and one in r?
      timesWrittenTo: 1,
      latestUniqueExecuters: [],
      latestExecuters: [],
      executers: {},
      timesExecuted: 0,
      latestUniqueReaders: [],
      latestReaders: [],
      readers: {},
      timesRead: 0,
      cogsWrittenTo: {},
      cogsExecuted: {},
      cogsRead: {},
      maxLatestUniqueWriters: 3,
      maxLatestWriters: 3,
      maxLatestUniqueExecuters: 3,
      maxLatestExecuters: 3,
      maxLatestUniqueReaders: 3,
      maxLatestReaders: 3,
      cogName: args.cogName,
      objectClass: Object.prototype.toString.call(args.value)
        .split(' ')[1].slice(0, -1),
      filePath: 'unknown',
      observing: args.observing,
      observers: [],
    };
    if (!window) {
      //console.log("Won't add this filePath because it's cogz's", __filename);
    }

    return info;
  }
  function generateMorph(args, cogInfo) {
    var morph = [
      typeof args.value === 'function' ?
        args.value.toString() : JSON.stringify(args.value)
    ]
    return morph;
  }
  function generateCog(args, cogInfo, cogMorph) {
  console.log('Before:', args);
    var cog = (typeof args.value === 'function') ?
      functionWrapper(args, cogInfo, cogMorph) : args.value;
    if (typeof cog === 'object' || typeof cog === 'function') {
      var originalToString = cog.toString;
      var originalValueOf = cog.valueOf;
      cog.toString = function cogToString(x) {
        var returnableString;
        if (x && cogInfo[args.cogName][x]) {
          // Give the specific requested property.
          returnableString = cogInfo[args.cogName][x];
        } else if (x && x.addCog) {
          // cogz object passed as arg, so give all info for this cog.
          returnableString = cogInfo[args.cogName];
        } else if (typeof cog === 'function') {
          // No recognized args, so let Function give the function text.
          returnableString = originalToString.apply(this.wrappedFunction, arguments);
        } else {
          // No recognized args, so let Object or Array provide the text.
          returnableString = originalToString.apply(this, arguments);
        }
        return returnableString;
      }
      cog.valueOf = function cogValueOf(x) {
        var returnableVal;
        if ((x || x === 0) && cogMorph[args.cogName][x]) {
          // A specific index or property name is passed to valueOf()
          // so only give what is requested.
          returnableVal = cogMorph[args.cogName][x];
        } else if (x && x.addCog) {
          // cogz object passed as arg, so give all info for this cog.
          returnableVal = cogMorph[args.cogName];
        } else if (typeof cog === 'function') {
          // No recognized args, so let Function give the function value.
          returnableVal = originalValueOf.apply(this.wrappedFunction, arguments);
        } else {
          // No recognized args, so let Object or Array provide the value.
          returnableVal = originalValueOf.apply(this, arguments);
        }
        return returnableVal;
      }
    }
    return cog;
  }
  // functionWrapper used above, at top of generateCog
  function functionWrapper(fnDetails, cogInfo, cogMorph) {
    var wrapping = function wrapping(/*arguments*/) {
      var returnValue, arg, argInfo, argMorph, fnInfo, fnMorph;
      fnInfo = cogInfo[fnDetails.cogName];
      fnMorph = cogMorph[fnDetails.cogName];
    // note arguments that are functions, to check later if they've been run.
    // record how many times they've been run before running fn.
      for (var i in arguments) {
        arg = arguments[i];
        if (typeof arg !== 'number' && cogInfo[arg.toString('cogName')]) {
          argInfo = cogInfo[arg.toString('cogName')];
          argMorph = cogInfo[arg.toString('cogName')];
          argInfo.timesRead++;
          if (argInfo.readers[fnDetails.cogName]) {
            argInfo.readers[fnDetails.cogName]++;
          } else {
            argInfo.readers[fnDetails.cogName] = 1;
          }
          fnInfo.cogsRead[argInfo.cogName] = new Date();
        }
      }
    // also record number of keys in global (or wrap global??)
    // also record value of arguments before
      // run function and capture returnValue
      returnValue = fnDetails.value.apply(null, arguments)
    // check if an argument is changed and not returned?
    // check if global keys are increased (can't check if global changed right?)
    // if devLeadOptions say error or warn, do it
    // record in cogInfo and cogMorph and cogInfo['cogz'] and cogMorph['cogz']
    // if a cog is morphed and being observed, call the observers
    // return captured returnValue
      return returnValue;
    }
    wrapping.wrappedFunction = fnDetails.value;
    return wrapping;
  } // end of wrapper definition

  //
  // function genCog(args) {
  //   var cog, cogName = args.cogName, value = args.value;
  //   if (typeof value === 'function') {
  //     cog = function () {
  //       return cog.value.apply(cog, arguments);
  //     }
  //     cog.value = function () {
  //       for (var i in arguments) {
  //         var arg = arguments[i];
  //         if (arg.isCog) {
  //           this.reads[arg.cogName] = new Date();
  //           this.latestReads.push(arg.cogName);
  //           if (this.latestReads.length > this.maxLatestReads) {
  //             this.latestReads.shift();
  //           }
  //           if (this.latestUniqueReads.slice(-1)[0] !== arg.cogName) {
  //             this.latestUniqueReads.push(arg.cogName);
  //           }
  //           if (this.latestUniqueReads.length > this.maxLatestUniqueReads) {
  //             this.latestUniqueReads.shift();
  //           }
  //           arg.readers[this.cogName] = new Date();
  //           arg.latestReaders.push(this.cogName);
  //           if (arg.latestReaders.length > arg.maxLatestReaders) {
  //             arg.latestReaders.shift();
  //           }
  //           if (arg.latestUniqueReaders.slice(-1)[0] !== this.cogName) {
  //             arg.latestUniqueReaders.push(this.cogName);
  //           }
  //           if (arg.latestUniqueReaders.length > arg.maxLatestUniqueReaders) {
  //             arg.latestUniqueReaders.shift();
  //           }
  //         }
  //       }
  //       return value.apply(this, arguments);
  //     };
  //   } else if (value instanceof Array) {
  //     cog = value;
  //     cog.value = value;
  //   } else if (typeof value === 'object') {
  //     cog = Object.create(value);
  //     cog.value = value ;
  //   } else {
  //     cog = { value: value };
  //   }
  //   cog.isCog = true;
  //   cog.cogName = cogName;
  //   cog.reads = {};
  //   cog.latestReads = [];
  //   cog.maxLatestReads = 3;
  //   cog.latestUniqueReads = []
  //   cog.maxLatestUniqueReads = 3;
  //   cog.readers = {};
  //   cog.latestReaders = [];
  //   cog.maxLatestReaders = 3;
  //   cog.latestUniqueReaders = []
  //   cog.maxLatestUniqueReaders = 3;
  //   // TODO: cog.writes . . .
  //   // TODO: cog.writers . . .
  //   // TODO: cog.observers = [];
  //   // TODO: cog.observing = [];
  //   // TODO: cog.filePath . . .
  //   return cog;
  // }
  //
  var cogz = generateCogz();
  if (module) {
    module.exports = cogz;
    // Fill up cogz.
    //require('./baseHtml');
    //cogz.baseHtml();
  } else {
    window.cogz = cogz;
  }

})(typeof window === 'undefined' ? null : window,
   typeof module === 'undefined' ? null : module);
