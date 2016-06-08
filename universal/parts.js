(function partsWrapper(window, module) {
  function genCogz() {
    var parts = {};
    parts.add = function add(args) {
      if (typeof args === 'string') {
        args = {
          partName: arguments[0],
          partValue: arguments[1]
        }
      }
      if (args.partName in parts) {
        throw new Error('Duplicate: parts.' + args.partName + ' already exists.');
      }
      else {
        parts[args.partName] = genPart(args);
      }
    }
    return parts;
  }

  function genPart(args) {
    var part, partName = args.partName, partValue = args.partValue;
    if (typeof partValue === 'function') {
      part = function () {
        return part.partValue.apply(part, arguments);
      }
      part.partValue = function () {
        for (var i in arguments) {
          var arg = arguments[i];
          if (arg.isPart) {
            this.reads[arg.partName] = new Date();
            this.latestReads.push(arg.partName);
            if (this.latestReads.length > this.maxLatestReads) {
              this.latestReads.shift();
            }
            if (this.latestUniqueReads.slice(-1)[0] !== arg.partName) {
              this.latestUniqueReads.push(arg.partName);
            }
            if (this.latestUniqueReads.length > this.maxLatestUniqueReads) {
              this.latestUniqueReads.shift();
            }
            arg.readers[this.partName] = new Date();
            arg.latestReaders.push(this.partName);
            if (arg.latestReaders.length > arg.maxLatestReaders) {
              arg.latestReaders.shift();
            }
            if (arg.latestUniqueReaders.slice(-1)[0] !== this.partName) {
              arg.latestUniqueReaders.push(this.partName);
            }
            if (arg.latestUniqueReaders.length > arg.maxLatestUniqueReaders) {
              arg.latestUniqueReaders.shift();
            }
          }
        }
        return partValue.apply(this, arguments);
      };
    } else {
      part = { partValue: partValue };
    }
    part.isPart = true;
    part.partName = partName;
    part.reads = {};
    part.latestReads = [];
    part.maxLatestReads = 3;
    part.latestUniqueReads = []
    part.maxLatestUniqueReads = 3;
    part.readers = {};
    part.latestReaders = [];
    part.maxLatestReaders = 3;
    part.latestUniqueReaders = []
    part.maxLatestUniqueReaders = 3;
    // TODO: part.writes . . .
    // TODO: part.writers . . .
    // TODO: part.observers = [];
    // TODO: part.observing = [];
    // TODO: part.filePath . . .
    return part;
  }

  // Tests
  var numTests = 0;

  // Test for error on duplicate partName.
  (function testDupPartName() {
    var parts = genCogz();
    parts.add('first', 'test'); // should throw no error.
    var err;
    try {
      parts.add('first', 'again');
    } catch (e) {
      err = e;
    } finally {
      if (!err) throw new Error('Test failed to throw error on duplicate name.');
      else numTests++;
    }
  })(); // end of test

  // Test for error on parts.add as duplicate partName.
  (function testAddAsDupPartName() {
    var parts = genCogz();
    var err;
    try {
      parts.add('add', 'again');
    } catch (e) {
      err = e;
    } finally {
      if (!err) throw new Error('Test failed to throw error on duplicate parts.add.');
      else numTests++;
    }
  })(); // end of test

  // Test for natural functions.
  (function testAddFunc1() {
    var parts = genCogz();
    parts.add('func1', function () {});
    if (typeof parts.func1 !== 'function') {
      throw new Error('parts.add(func) should add parts.func as function.');
    }
    else numTests++;
  })(); // end of test

  // Test for predictable functions as parts.
  (function testAddFunc2_1() {
    var parts = genCogz();
    var result = 0;
    parts.add('func1', function () { result = result + 1; });
    parts.func1.partValue();
    if (result !== 1) {
      throw new Error('parts.func.partValue should work when called.');
    }
    else numTests++;
  })(); // end of test

  // Test for predictable functions as parts.
  (function testAddFunc2_2() {
    var parts = genCogz();
    var result = 0;
    parts.add('func1', function () { result = result + 1; });
    parts.func1();
    if (result !== 1) {
      throw new Error('parts.func and parts.func.partValue should work the same.');
    }
    else numTests++;
  })(); // end of test

  // Test for reads etc.
  (function testReadsEtc() {
    var parts = genCogz();
    parts.add('str1', 'strA');
    parts.add('func1', function () {});
    parts.func1(parts.str1);
    if (!parts.func1.reads.str1) {
      throw new Error('A function should record any part it reads.');
    }
    else numTests++;
    if (parts.func1.latestReads[0] !== 'str1') {
      throw new Error('A function should record the latest part it reads.');
    }
    else numTests++;
    if (parts.func1.latestUniqueReads[0] !== 'str1') {
      throw new Error('A function should record the unique parts it reads.');
    }
    else numTests++;
  })(); // end of test

  // Test for number of reads etc..
  (function testNumReadsEtc() {
    var parts = genCogz();
    parts.add('str1', 'strA');
    parts.add('str2', 'strB');
    parts.add('func1', function () {});
    parts.func1(parts.str1);
    parts.func1(parts.str1);
    if (Object.keys(parts.func1.reads).length !== 1) {
      throw new Error('part.reads should add only unique reads.');
    }
    else numTests++;
    if (parts.func1.latestReads[0] !== 'str1' ||
      parts.func1.latestReads[1] !== 'str1' ||
      parts.func1.latestReads.length !== 2) {
      throw new Error('A function should record the latest parts it reads.');
    }
    else numTests++;
    if (parts.func1.latestUniqueReads.length !== 1) {
      throw new Error('part.latestUniqueReads should add only unique reads.' +
      'State:' + parts.func1.latestUniqueReads);
    }
    else numTests++;

    parts.func1(parts.str2);
    if (Object.keys(parts.func1.reads).length !== 2) {
      throw new Error('part.reads should add all unique reads.');
    }
    else numTests++;
    if (parts.func1.latestReads[0] !== 'str1' ||
      parts.func1.latestReads[1] !== 'str1' ||
      parts.func1.latestReads[2] !== 'str2' ||
      parts.func1.latestReads.length !== 3) {
      throw new Error('A function should record all the latest parts it reads.');
    }
    else numTests++;
    if (parts.func1.latestUniqueReads[0] !== 'str1' ||
      parts.func1.latestUniqueReads[1] !== 'str2' ||
      parts.func1.latestUniqueReads.length !== 2) {
      throw new Error('part.latestUniqueReads should add all unique reads.' +
      'State:' + parts.func1.latestUniqueReads);
    }
    else numTests++;
  })(); // end of test

  // Test for maxLatestReads etc.
  (function testMaxLatestReadsEtc() {
    var parts = genCogz();
    parts.add('str1', 'strA');
    parts.add('str2', 'strB');
    parts.add('func1', function () {});
    parts.func1.maxLatestReads = 1;
    parts.func1.maxLatestUniqueReads = 1;
    parts.func1(parts.str1);
    parts.func1(parts.str2);
    if (parts.func1.latestReads[0] !== 'str2' ||
      parts.func1.latestReads.length !== 1) {
      throw new Error('A function should respect maxLatestReads.');
    }
    else numTests++;
    if (parts.func1.latestUniqueReads[0] !== 'str2' ||
      parts.func1.latestUniqueReads.length !== 1) {
      throw new Error('A function should respect maxLatestUniqueReads.');
    }
    else numTests++;
  })(); // end of test

  // Test for readers etc.
  (function testReadersEtc() {
    var parts = genCogz();
    parts.add('str1', 'strA');
    parts.add('func1', function () {});
    parts.func1(parts.str1);
      console.log('readers in test', parts.str1.readers)
    if (!parts.str1.readers.func1) {
      console.log('readers in test', parts.str1.readers)
      throw new Error('A part should record any part() that reads it.');
    }
    else numTests++;
    if (parts.str1.latestReaders[0] !== 'func1') {
      throw new Error('A part should record the latest part() that reads it.');
    }
    else numTests++;
    if (parts.str1.latestUniqueReaders[0] !== 'func1') {
      throw new Error('A part should record the latest unique part() that reads it.');
    }
    else numTests++;
  })(); // end of test

  // Test for number of readers etc.
  (function testNumReadersEtc() {
    var parts = genCogz();
    parts.add('str1', 'strA');
    parts.add('func1', function () {});
    parts.add('func2', function () {});
    parts.func1(parts.str1);
    parts.func1(parts.str1);
    if (Object.keys(parts.str1.readers).length !== 1) {
      throw new Error('part.readers should add only unique readers.');
    }
    else numTests++;
    if (parts.str1.latestReaders[0] !== 'func1' ||
      parts.str1.latestReaders[1] !== 'func1' ||
      parts.str1.latestReaders.length !== 2) {
      throw new Error('A part should record the latest part()s that read it.');
    }
    else numTests++;

    parts.func2(parts.str1);
    if (Object.keys(parts.str1.readers).length !== 2) {
      throw new Error('part.readers should add all unique readers.');
    }
    else numTests++;
    if (parts.str1.latestReaders[0] !== 'func1' ||
      parts.str1.latestReaders[1] !== 'func1' ||
      parts.str1.latestReaders[2] !== 'func2' ||
      parts.str1.latestReaders.length !== 3) {
      throw new Error('A part should record all the latest part()s that read it.');
    }
    else numTests++;
    if (parts.str1.latestUniqueReaders[0] !== 'func1' ||
      parts.str1.latestUniqueReaders[1] !== 'func2' ||
      parts.str1.latestUniqueReaders.length !== 2) {
      throw new Error('A part should record all the latest unique part()s that read it.');
    }
    else numTests++;
  })(); // end of test

  // Test for maxLatestReaders etc.
  (function testMaxLatestReadersEtc() {
    var parts = genCogz();
    parts.add('str1', 'strA');
    parts.add('func1', function () {});
    parts.add('func2', function () {});
    parts.str1.maxLatestReaders = 1;
    parts.str1.maxLatestUniqueReaders = 1;
    parts.func1(parts.str1);
    parts.func2(parts.str1);
    if (parts.str1.latestReaders[0] !== 'func2' ||
      parts.str1.latestReaders.length !== 1) {
      throw new Error('A part should respect maxLatestReaders.');
    }
    else numTests++;
    if (parts.str1.latestUniqueReaders[0] !== 'func2' ||
      parts.str1.latestUniqueReaders.length !== 1) {
      throw new Error('A part should respect maxLatestUniqueReaders.');
    }
    else numTests++;
  })(); // end of test

  console.log('Be thankful: ' + numTests + ' tests passed.');
  var parts = genCogz();
  parts.add('spawnEmptyCogz', function spawnEmptyCogz() { return genCogz(); });
  if (module) {
    module.exports = parts;
    // Fill up parts.
    require('./baseHtml');
    parts.baseHtml();
  } else {
    window.parts = parts;
  }

})(typeof window === 'undefined' ? null : window,
   typeof module === 'undefined' ? null : module);

//var normalizedPath = require("path").join(__dirname, "routes");

// require("fs").readdirSync(normalizedPath).forEach(function(file) {
//   require("./routes/" + file);
// });
