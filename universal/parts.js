(function cogsWrapper(window, module) {
  function genCogz() {
    var cogs = {};
    cogs.add = function add(args) {
      if (typeof args === 'string') {
        args = {
          cogName: arguments[0],
          value: arguments[1]
        }
      }
      if (args.cogName in cogs) {
        throw new Error('Duplicate: cogs.' + args.cogName + ' already exists.');
      }
      else {
        cogs[args.cogName] = genCog(args);
      }
    }
    return cogs;
  }

  function genCog(args) {
    var cog, cogName = args.cogName, value = args.value;
    if (typeof value === 'function') {
      cog = function () {
        return cog.value.apply(cog, arguments);
      }
      cog.value = function () {
        for (var i in arguments) {
          var arg = arguments[i];
          if (arg.isCog) {
            this.reads[arg.cogName] = new Date();
            this.latestReads.push(arg.cogName);
            if (this.latestReads.length > this.maxLatestReads) {
              this.latestReads.shift();
            }
            if (this.latestUniqueReads.slice(-1)[0] !== arg.cogName) {
              this.latestUniqueReads.push(arg.cogName);
            }
            if (this.latestUniqueReads.length > this.maxLatestUniqueReads) {
              this.latestUniqueReads.shift();
            }
            arg.readers[this.cogName] = new Date();
            arg.latestReaders.push(this.cogName);
            if (arg.latestReaders.length > arg.maxLatestReaders) {
              arg.latestReaders.shift();
            }
            if (arg.latestUniqueReaders.slice(-1)[0] !== this.cogName) {
              arg.latestUniqueReaders.push(this.cogName);
            }
            if (arg.latestUniqueReaders.length > arg.maxLatestUniqueReaders) {
              arg.latestUniqueReaders.shift();
            }
          }
        }
        return value.apply(this, arguments);
      };
    } else {
      cog = { value: value };
    }
    cog.isCog = true;
    cog.cogName = cogName;
    cog.reads = {};
    cog.latestReads = [];
    cog.maxLatestReads = 3;
    cog.latestUniqueReads = []
    cog.maxLatestUniqueReads = 3;
    cog.readers = {};
    cog.latestReaders = [];
    cog.maxLatestReaders = 3;
    cog.latestUniqueReaders = []
    cog.maxLatestUniqueReaders = 3;
    // TODO: cog.writes . . .
    // TODO: cog.writers . . .
    // TODO: cog.observers = [];
    // TODO: cog.observing = [];
    // TODO: cog.filePath . . .
    return cog;
  }

  // Tests
  var numTests = 0;

  // Test for error on duplicate cogName.
  (function testDupCogName() {
    var cogs = genCogz();
    cogs.add('first', 'test'); // should throw no error.
    var err;
    try {
      cogs.add('first', 'again');
    } catch (e) {
      err = e;
    } finally {
      if (!err) throw new Error('Test failed to throw error on duplicate name.');
      else numTests++;
    }
  })(); // end of test

  // Test for error on cogs.add as duplicate cogName.
  (function testAddAsDupCogName() {
    var cogs = genCogz();
    var err;
    try {
      cogs.add('add', 'again');
    } catch (e) {
      err = e;
    } finally {
      if (!err) throw new Error('Test failed to throw error on duplicate cogs.add.');
      else numTests++;
    }
  })(); // end of test

  // Test for natural functions.
  (function testAddFunc1() {
    var cogs = genCogz();
    cogs.add('func1', function () {});
    if (typeof cogs.func1 !== 'function') {
      throw new Error('cogs.add(func) should add cogs.func as function.');
    }
    else numTests++;
  })(); // end of test

  // Test for predictable functions as cogs.
  (function testAddFunc2_1() {
    var cogs = genCogz();
    var result = 0;
    cogs.add('func1', function () { result = result + 1; });
    cogs.func1.value();
    if (result !== 1) {
      throw new Error('cogs.func.value should work when called.');
    }
    else numTests++;
  })(); // end of test

  // Test for predictable functions as cogs.
  (function testAddFunc2_2() {
    var cogs = genCogz();
    var result = 0;
    cogs.add('func1', function () { result = result + 1; });
    cogs.func1();
    if (result !== 1) {
      throw new Error('cogs.func and cogs.func.value should work the same.');
    }
    else numTests++;
  })(); // end of test

  // Test for reads etc.
  (function testReadsEtc() {
    var cogs = genCogz();
    cogs.add('str1', 'strA');
    cogs.add('func1', function () {});
    cogs.func1(cogs.str1);
    if (!cogs.func1.reads.str1) {
      throw new Error('A function should record any cog it reads.');
    }
    else numTests++;
    if (cogs.func1.latestReads[0] !== 'str1') {
      throw new Error('A function should record the latest cog it reads.');
    }
    else numTests++;
    if (cogs.func1.latestUniqueReads[0] !== 'str1') {
      throw new Error('A function should record the unique cogs it reads.');
    }
    else numTests++;
  })(); // end of test

  // Test for number of reads etc..
  (function testNumReadsEtc() {
    var cogs = genCogz();
    cogs.add('str1', 'strA');
    cogs.add('str2', 'strB');
    cogs.add('func1', function () {});
    cogs.func1(cogs.str1);
    cogs.func1(cogs.str1);
    if (Object.keys(cogs.func1.reads).length !== 1) {
      throw new Error('cog.reads should add only unique reads.');
    }
    else numTests++;
    if (cogs.func1.latestReads[0] !== 'str1' ||
      cogs.func1.latestReads[1] !== 'str1' ||
      cogs.func1.latestReads.length !== 2) {
      throw new Error('A function should record the latest cogs it reads.');
    }
    else numTests++;
    if (cogs.func1.latestUniqueReads.length !== 1) {
      throw new Error('cog.latestUniqueReads should add only unique reads.' +
      'State:' + cogs.func1.latestUniqueReads);
    }
    else numTests++;

    cogs.func1(cogs.str2);
    if (Object.keys(cogs.func1.reads).length !== 2) {
      throw new Error('cog.reads should add all unique reads.');
    }
    else numTests++;
    if (cogs.func1.latestReads[0] !== 'str1' ||
      cogs.func1.latestReads[1] !== 'str1' ||
      cogs.func1.latestReads[2] !== 'str2' ||
      cogs.func1.latestReads.length !== 3) {
      throw new Error('A function should record all the latest cogs it reads.');
    }
    else numTests++;
    if (cogs.func1.latestUniqueReads[0] !== 'str1' ||
      cogs.func1.latestUniqueReads[1] !== 'str2' ||
      cogs.func1.latestUniqueReads.length !== 2) {
      throw new Error('cog.latestUniqueReads should add all unique reads.' +
      'State:' + cogs.func1.latestUniqueReads);
    }
    else numTests++;
  })(); // end of test

  // Test for maxLatestReads etc.
  (function testMaxLatestReadsEtc() {
    var cogs = genCogz();
    cogs.add('str1', 'strA');
    cogs.add('str2', 'strB');
    cogs.add('func1', function () {});
    cogs.func1.maxLatestReads = 1;
    cogs.func1.maxLatestUniqueReads = 1;
    cogs.func1(cogs.str1);
    cogs.func1(cogs.str2);
    if (cogs.func1.latestReads[0] !== 'str2' ||
      cogs.func1.latestReads.length !== 1) {
      throw new Error('A function should respect maxLatestReads.');
    }
    else numTests++;
    if (cogs.func1.latestUniqueReads[0] !== 'str2' ||
      cogs.func1.latestUniqueReads.length !== 1) {
      throw new Error('A function should respect maxLatestUniqueReads.');
    }
    else numTests++;
  })(); // end of test

  // Test for readers etc.
  (function testReadersEtc() {
    var cogs = genCogz();
    cogs.add('str1', 'strA');
    cogs.add('func1', function () {});
    cogs.func1(cogs.str1);
      console.log('readers in test', cogs.str1.readers)
    if (!cogs.str1.readers.func1) {
      console.log('readers in test', cogs.str1.readers)
      throw new Error('A cog should record any cog() that reads it.');
    }
    else numTests++;
    if (cogs.str1.latestReaders[0] !== 'func1') {
      throw new Error('A cog should record the latest cog() that reads it.');
    }
    else numTests++;
    if (cogs.str1.latestUniqueReaders[0] !== 'func1') {
      throw new Error('A cog should record the latest unique cog() that reads it.');
    }
    else numTests++;
  })(); // end of test

  // Test for number of readers etc.
  (function testNumReadersEtc() {
    var cogs = genCogz();
    cogs.add('str1', 'strA');
    cogs.add('func1', function () {});
    cogs.add('func2', function () {});
    cogs.func1(cogs.str1);
    cogs.func1(cogs.str1);
    if (Object.keys(cogs.str1.readers).length !== 1) {
      throw new Error('cog.readers should add only unique readers.');
    }
    else numTests++;
    if (cogs.str1.latestReaders[0] !== 'func1' ||
      cogs.str1.latestReaders[1] !== 'func1' ||
      cogs.str1.latestReaders.length !== 2) {
      throw new Error('A cog should record the latest cog()s that read it.');
    }
    else numTests++;

    cogs.func2(cogs.str1);
    if (Object.keys(cogs.str1.readers).length !== 2) {
      throw new Error('cog.readers should add all unique readers.');
    }
    else numTests++;
    if (cogs.str1.latestReaders[0] !== 'func1' ||
      cogs.str1.latestReaders[1] !== 'func1' ||
      cogs.str1.latestReaders[2] !== 'func2' ||
      cogs.str1.latestReaders.length !== 3) {
      throw new Error('A cog should record all the latest cog()s that read it.');
    }
    else numTests++;
    if (cogs.str1.latestUniqueReaders[0] !== 'func1' ||
      cogs.str1.latestUniqueReaders[1] !== 'func2' ||
      cogs.str1.latestUniqueReaders.length !== 2) {
      throw new Error('A cog should record all the latest unique cog()s that read it.');
    }
    else numTests++;
  })(); // end of test

  // Test for maxLatestReaders etc.
  (function testMaxLatestReadersEtc() {
    var cogs = genCogz();
    cogs.add('str1', 'strA');
    cogs.add('func1', function () {});
    cogs.add('func2', function () {});
    cogs.str1.maxLatestReaders = 1;
    cogs.str1.maxLatestUniqueReaders = 1;
    cogs.func1(cogs.str1);
    cogs.func2(cogs.str1);
    if (cogs.str1.latestReaders[0] !== 'func2' ||
      cogs.str1.latestReaders.length !== 1) {
      throw new Error('A cog should respect maxLatestReaders.');
    }
    else numTests++;
    if (cogs.str1.latestUniqueReaders[0] !== 'func2' ||
      cogs.str1.latestUniqueReaders.length !== 1) {
      throw new Error('A cog should respect maxLatestUniqueReaders.');
    }
    else numTests++;
  })(); // end of test

  console.log('Be thankful: ' + numTests + ' tests passed.');
  var cogs = genCogz();
  cogs.add('spawnEmptyCogz', function spawnEmptyCogz() { return genCogz(); });
  if (module) {
    module.exports = cogs;
    // Fill up cogs.
    require('./baseHtml');
    cogs.baseHtml();
  } else {
    window.cogs = cogs;
  }

})(typeof window === 'undefined' ? null : window,
   typeof module === 'undefined' ? null : module);

//var normalizedPath = require("path").join(__dirname, "routes");

// require("fs").readdirSync(normalizedPath).forEach(function(file) {
//   require("./routes/" + file);
// });
