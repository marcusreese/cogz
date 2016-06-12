// (function cogzWrapper(window, module) {
//   function genCogz() {
//     var cogz = {};
//     cogz.add = function add(args) {
//       if (typeof args === 'string') {
//         args = {
//           cogName: arguments[0],
//           value: arguments[1]
//         }
//       }
//       if (args.cogName in cogz) {
//         throw new Error('Duplicate: cogz.' + args.cogName + ' already exists.');
//       }
//       else {
//         cogz[args.cogName] = genCog(args);
//       }
//     }
//     cogz.spawnEmptyCogz = function spawnEmptyCogz() { return genCogz(); }
//     return cogz;
//   }
//
//   function genCog(args) {
//     var cog, cogName = args.cogName, value = args.value;
//     if (typeof value === 'function') {
//       cog = function () {
//         return cog.value.apply(cog, arguments);
//       }
//       cog.value = function () {
//         for (var i in arguments) {
//           var arg = arguments[i];
//           if (arg.isCog) {
//             this.reads[arg.cogName] = new Date();
//             this.latestReads.push(arg.cogName);
//             if (this.latestReads.length > this.maxLatestReads) {
//               this.latestReads.shift();
//             }
//             if (this.latestUniqueReads.slice(-1)[0] !== arg.cogName) {
//               this.latestUniqueReads.push(arg.cogName);
//             }
//             if (this.latestUniqueReads.length > this.maxLatestUniqueReads) {
//               this.latestUniqueReads.shift();
//             }
//             arg.readers[this.cogName] = new Date();
//             arg.latestReaders.push(this.cogName);
//             if (arg.latestReaders.length > arg.maxLatestReaders) {
//               arg.latestReaders.shift();
//             }
//             if (arg.latestUniqueReaders.slice(-1)[0] !== this.cogName) {
//               arg.latestUniqueReaders.push(this.cogName);
//             }
//             if (arg.latestUniqueReaders.length > arg.maxLatestUniqueReaders) {
//               arg.latestUniqueReaders.shift();
//             }
//           }
//         }
//         return value.apply(this, arguments);
//       };
//     } else if (value instanceof Array) {
//       cog = value;
//       cog.value = value;
//     } else if (typeof value === 'object') {
//       cog = Object.create(value);
//       cog.value = value ;
//     } else {
//       cog = { value: value };
//     }
//     cog.isCog = true;
//     cog.cogName = cogName;
//     cog.reads = {};
//     cog.latestReads = [];
//     cog.maxLatestReads = 3;
//     cog.latestUniqueReads = []
//     cog.maxLatestUniqueReads = 3;
//     cog.readers = {};
//     cog.latestReaders = [];
//     cog.maxLatestReaders = 3;
//     cog.latestUniqueReaders = []
//     cog.maxLatestUniqueReaders = 3;
//     // TODO: cog.writes . . .
//     // TODO: cog.writers . . .
//     // TODO: cog.observers = [];
//     // TODO: cog.observing = [];
//     // TODO: cog.filePath . . .
//     return cog;
//   }
//
//   // Tests
//   var numTests = 0;
//
//   // Test for error on duplicate cogName.
//   (function testDupCogName() {
//     var cogz = genCogz();
//     cogz.add('first', 'test'); // should throw no error.
//     var err;
//     try {
//       cogz.add('first', 'again');
//     } catch (e) {
//       err = e;
//     } finally {
//       if (!err) throw new Error('Test failed to throw error on duplicate name.');
//       else numTests++;
//     }
//   })(); // end of test
//
//   // Test for error on cogz.add as duplicate cogName.
//   (function testAddAsDupCogName() {
//     var cogz = genCogz();
//     var err;
//     try {
//       cogz.add('add', 'again');
//     } catch (e) {
//       err = e;
//     } finally {
//       if (!err) throw new Error('Test failed to throw error on duplicate cogz.add.');
//       else numTests++;
//     }
//   })(); // end of test
//
//   // Test for natural functions.
//   (function testAddFunc1() {
//     var cogz = genCogz();
//     cogz.add('func1', function () {});
//     if (typeof cogz.func1 !== 'function') {
//       throw new Error('cogz.add(func) should add cogz.func as function.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for predictable functions as cogz.
//   (function testAddFunc2_1() {
//     var cogz = genCogz();
//     var result = 0;
//     cogz.add('func1', function () { result = result + 1; });
//     cogz.func1.value();
//     if (result !== 1) {
//       throw new Error('cogz.func.value should work when called.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for predictable functions as cogz.
//   (function testAddFunc2_2() {
//     var cogz = genCogz();
//     var result = 0;
//     cogz.add('func1', function () { result = result + 1; });
//     cogz.func1();
//     if (result !== 1) {
//       throw new Error('cogz.func and cogz.func.value should work the same.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for reads etc.
//   (function testReadsEtc() {
//     var cogz = genCogz();
//     cogz.add('str1', 'strA');
//     cogz.add('func1', function () {});
//     cogz.func1(cogz.str1);
//     if (!cogz.func1.reads.str1) {
//       throw new Error('A function should record any cog it reads.');
//     }
//     else numTests++;
//     if (cogz.func1.latestReads[0] !== 'str1') {
//       throw new Error('A function should record the latest cog it reads.');
//     }
//     else numTests++;
//     if (cogz.func1.latestUniqueReads[0] !== 'str1') {
//       throw new Error('A function should record the unique cogz it reads.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for number of reads etc..
//   (function testNumReadsEtc() {
//     var cogz = genCogz();
//     cogz.add('str1', 'strA');
//     cogz.add('str2', 'strB');
//     cogz.add('func1', function () {});
//     cogz.func1(cogz.str1);
//     cogz.func1(cogz.str1);
//     if (Object.keys(cogz.func1.reads).length !== 1) {
//       throw new Error('cog.reads should add only unique reads.');
//     }
//     else numTests++;
//     if (cogz.func1.latestReads[0] !== 'str1' ||
//       cogz.func1.latestReads[1] !== 'str1' ||
//       cogz.func1.latestReads.length !== 2) {
//       throw new Error('A function should record the latest cogz it reads.');
//     }
//     else numTests++;
//     if (cogz.func1.latestUniqueReads.length !== 1) {
//       throw new Error('cog.latestUniqueReads should add only unique reads.' +
//       'State:' + cogz.func1.latestUniqueReads);
//     }
//     else numTests++;
//
//     cogz.func1(cogz.str2);
//     if (Object.keys(cogz.func1.reads).length !== 2) {
//       throw new Error('cog.reads should add all unique reads.');
//     }
//     else numTests++;
//     if (cogz.func1.latestReads[0] !== 'str1' ||
//       cogz.func1.latestReads[1] !== 'str1' ||
//       cogz.func1.latestReads[2] !== 'str2' ||
//       cogz.func1.latestReads.length !== 3) {
//       throw new Error('A function should record all the latest cogz it reads.');
//     }
//     else numTests++;
//     if (cogz.func1.latestUniqueReads[0] !== 'str1' ||
//       cogz.func1.latestUniqueReads[1] !== 'str2' ||
//       cogz.func1.latestUniqueReads.length !== 2) {
//       throw new Error('cog.latestUniqueReads should add all unique reads.' +
//       'State:' + cogz.func1.latestUniqueReads);
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for maxLatestReads etc.
//   (function testMaxLatestReadsEtc() {
//     var cogz = genCogz();
//     cogz.add('str1', 'strA');
//     cogz.add('str2', 'strB');
//     cogz.add('func1', function () {});
//     cogz.func1.maxLatestReads = 1;
//     cogz.func1.maxLatestUniqueReads = 1;
//     cogz.func1(cogz.str1);
//     cogz.func1(cogz.str2);
//     if (cogz.func1.latestReads[0] !== 'str2' ||
//       cogz.func1.latestReads.length !== 1) {
//       throw new Error('A function should respect maxLatestReads.');
//     }
//     else numTests++;
//     if (cogz.func1.latestUniqueReads[0] !== 'str2' ||
//       cogz.func1.latestUniqueReads.length !== 1) {
//       throw new Error('A function should respect maxLatestUniqueReads.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for readers etc.
//   (function testReadersEtc() {
//     var cogz = genCogz();
//     cogz.add('str1', 'strA');
//     cogz.add('func1', function () {});
//     cogz.func1(cogz.str1);
//       console.log('readers in test', cogz.str1.readers)
//     if (!cogz.str1.readers.func1) {
//       console.log('readers in test', cogz.str1.readers)
//       throw new Error('A cog should record any cog() that reads it.');
//     }
//     else numTests++;
//     if (cogz.str1.latestReaders[0] !== 'func1') {
//       throw new Error('A cog should record the latest cog() that reads it.');
//     }
//     else numTests++;
//     if (cogz.str1.latestUniqueReaders[0] !== 'func1') {
//       throw new Error('A cog should record the latest unique cog() that reads it.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for number of readers etc.
//   (function testNumReadersEtc() {
//     var cogz = genCogz();
//     cogz.add('str1', 'strA');
//     cogz.add('func1', function () {});
//     cogz.add('func2', function () {});
//     cogz.func1(cogz.str1);
//     cogz.func1(cogz.str1);
//     if (Object.keys(cogz.str1.readers).length !== 1) {
//       throw new Error('cog.readers should add only unique readers.');
//     }
//     else numTests++;
//     if (cogz.str1.latestReaders[0] !== 'func1' ||
//       cogz.str1.latestReaders[1] !== 'func1' ||
//       cogz.str1.latestReaders.length !== 2) {
//       throw new Error('A cog should record the latest cog()s that read it.');
//     }
//     else numTests++;
//
//     cogz.func2(cogz.str1);
//     if (Object.keys(cogz.str1.readers).length !== 2) {
//       throw new Error('cog.readers should add all unique readers.');
//     }
//     else numTests++;
//     if (cogz.str1.latestReaders[0] !== 'func1' ||
//       cogz.str1.latestReaders[1] !== 'func1' ||
//       cogz.str1.latestReaders[2] !== 'func2' ||
//       cogz.str1.latestReaders.length !== 3) {
//       throw new Error('A cog should record all the latest cog()s that read it.');
//     }
//     else numTests++;
//     if (cogz.str1.latestUniqueReaders[0] !== 'func1' ||
//       cogz.str1.latestUniqueReaders[1] !== 'func2' ||
//       cogz.str1.latestUniqueReaders.length !== 2) {
//       throw new Error('A cog should record all the latest unique cog()s that read it.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   // Test for maxLatestReaders etc.
//   (function testMaxLatestReadersEtc() {
//     var cogz = genCogz();
//     cogz.add('str1', 'strA');
//     cogz.add('func1', function () {});
//     cogz.add('func2', function () {});
//     cogz.str1.maxLatestReaders = 1;
//     cogz.str1.maxLatestUniqueReaders = 1;
//     cogz.func1(cogz.str1);
//     cogz.func2(cogz.str1);
//     if (cogz.str1.latestReaders[0] !== 'func2' ||
//       cogz.str1.latestReaders.length !== 1) {
//       throw new Error('A cog should respect maxLatestReaders.');
//     }
//     else numTests++;
//     if (cogz.str1.latestUniqueReaders[0] !== 'func2' ||
//       cogz.str1.latestUniqueReaders.length !== 1) {
//       throw new Error('A cog should respect maxLatestUniqueReaders.');
//     }
//     else numTests++;
//   })(); // end of test
//
//   console.log('Be thankful: ' + numTests + ' tests passed.');
//   var cogz = genCogz();
//   if (module) {
//     module.exports = cogz;
//     // Fill up cogz.
//     require('./baseHtml');
//     cogz.baseHtml();
//   } else {
//     window.cogz = cogz;
//   }
//
// })(typeof window === 'undefined' ? null : window,
//    typeof module === 'undefined' ? null : module);
//
// //var normalizedPath = require("path").join(__dirname, "routes");
//
// // require("fs").readdirSync(normalizedPath).forEach(function(file) {
// //   require("./routes/" + file);
// // });
