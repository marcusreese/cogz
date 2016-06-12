# Cogz
A simple JS framework to help you understand what your code is doing.

## Synopsis

I started this June 5 2016, and it's coming along nicely, but you probably don't want to use it yet.

## Code Example

A cog can be an object or a function or an array.

```
// Use the longer syntax (allows more options) . . .
cogz.add({
  cogName: 'myArray',
  value: ['c', 'o', 'g']
});
// Or the shorter syntax (for most cases) . . .
cogz.add('myFunc', function myFunc(someArray) {
  someArray.push('z');
  throw new Error('Just to show off debugging.');
});

```

Cogs can be used from the cogz namespace as functions or as values.
```
// For info on debugging this code, see the next section!
cogz.myFunc(cogz.myArray);
```

## One Benefit of Cogz: Debugging Info

Cog toString and toValue are overloaded with good stuff.

Type in console:
```
cogz.myArray.toString('writers')
```
Result:
```
{
  "latestUniqueWriters": [ 'cogz', 'myFunc'],
  "latestWriters": [ 'cogz', 'myFunc'],
  "writers": {
    "cogz": 1,
    "myFunc": 1
  },
  "timesWrittenTo": 2
}
```

Type in console:
```
cogz.myArray.valueOf(cogz)
```
Result:
```
{
  cogName: 'myArray',
  values: [
    {
      "time": "2016-06-12T02:24:54.880Z",
      "writer": "cogz",
      "value": ['c', 'o', 'g']
    },
    {
      "time": "2016-06-12T02:24:54.881Z",
      "writer": "myFunc",
      "value": ['c', 'o', 'g', 'z']
    }
  ]
}
```

More from cogz.myFunc.toString(cogz):

 - latestUniqueExecuters: [ "cogz" ],
 - latestExecuters: [ "cogz" ],
 - executers: { "cogz": 1 },
 - timesExecuted: 1,
 - latestUniqueReaders: [ "cogz" ],
 - latestReaders: [ "cogz" ],
 - readers: {  "cogz": 1 },
 - timesRead: 1,
 - cogsWrittenTo: { "myArray" },
 - cogsExecuted: {},
 - cogsRead: { "myArray": 1 },
 - maxLatestUniqueWriters: 3,
 - maxLatestWriters: 3,
 - maxLatestUniqueExecuters: 3,
 - maxLatestExecuters: 3,
 - maxLatestUniqueReaders: 3,
 - maxLatestReaders: 3,
 - cogName: "myFunc",
 - objectClass: "Function",
 - observing: [],
 - observers: []

 In other words, when something goes wrong with your code, the culprits line up and confess--in chronological order. And if you want to change a part (cog) of your code, you can immediately see every other cog that is depending on it.

## Other Benefits of Cogz

 - The convention of making everything a cog and accessing other cogs via parameters helps to keep code modular and easy to read.
 - Code this modular--where a cog can even be a simple data object--naturally encourages the separation of model and view and controller code, but goes even further.
 - There are pre-written cogs that do simple binding for you if you wish to use them, but because they're cogs, they're just as accessible as your code. No more black-box 'magic' making you wonder what happened.
 - No more long lists of errors that don't even tell you what part of your code is to blame. Here, when you mess up, the error points directly at your code because your errors have not been intercepted, redirected, and logged from some meaningless error handler.
 - No fighting a framework and learning dozens of apis just to develop a simple app. Now you can just look up how to do something in vanilla JavaScript and see it work the first time.
 - Cogz works in any browser as well as on a Node.js server--without depending on any bundler/converter. When a cog needs to be limited to the 'server' directory or the 'client' directory, it can be, but most cogs go in the 'universal' (isomorphic) directory. (That's the internal structure of Cogz, and you can organize your app that way too if you like, but you don't have to.)
 - Every cog, as a vertex/node with all of its edge relationships revealed, provides an abstracted, simplified view of your app. It's like a component in a tree of components, except better in two ways:
    1) In a tree structure, it's hard to figure out how a component can live in multiple levels of a tree, but in a graph like this, you don't have to deal with the question of what "level" a cog is on because there are no levels here. Just connect to whatever cog you need.
    2) In some frameworks, it's hard to figure out how or why a component is different than a service. Here both components and services are just cogs that can be used by other cogs.

## The plan for binding/observing in Cogz

This (and all of cogz, really) is still in the design stage.

```
cogz.addCog('defaultInputCheck', function defaultInputCheck(savedInput, savedInfo, savedTimes, numChanges) {
  // TODO: apply savedInput
  return /* defaults, all optional */ {
    savedInput: savedInput[0], // The only thing from inputCheck passed to other functions
    savedInfo: '', // In defaultInputCheck, config object; else, 'note to future self'
    savedTimes: 100, // ignored if less than maxSeconds or maxCalls (needed for them)
    useArg: true, // Some functions just run if it changed, but default should allow use.
    maxVals: 0, // No array (todo: beforeMemFull=-1?), ignored if >0&<minlength.
    eagerness: 1, // ignored until minVals is satisfied, can be 1, 0, or -1
    minVals: 1, // if 0, run if ready
    maxIntervals: 1 // 0 dangerously does not allow checking
    maxSeconds: 1, // at 1s (within 100 calls), return readiness=-1 to free call stack
    maxCalls: 100, // at 1 calls (within 1s), return readiness=-1 to free call stack
    developerLog: '', // Should go to console and file in case of crash.
    messageToUser: '', // Should go to a cog that can also be observed.
  }
}


cogz.addCog({
  cogName: 'funcX',
  input: { // cogName: cogz.inputCheckInterface function or config object
    items: cogz.evensArgCheck // Some conforming user-created function
    otherArg: {}, // Use defaults--for basic observer pattern (see details)
    lessImportantArg: { eagerness: 0 }, // Passive (see details)
    window: {}, // Not available without this line (see details)
  },
  value: function funcX(args) { console.log(args.items, args.window) }
}
```

## Installation

npm install cogz --save

## Tests

npm test

## Contributors

Welcome.

## License

ISC (like MIT)
