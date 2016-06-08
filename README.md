# Cogz
A simple JS framework to help you understand what your code is doing.

## Synopsis

I started this June 5 2016, and it's coming along nicely, but you probably don't want to use it yet.

## Code Example

A cog can be an object or a function or anything really.

```
    // Use the longer syntax (allows more options) . . .
    cogz.add({
      _cogName: 'myArray',
      _value: ['c', 'o', 'g', 'z']
    });
    // Or the shorter syntax (for most cases) . . .
    cogz.add('myFunc', function myFunc(obj) {
      throw new Error('Just to show off debugging.');
    });

```

Cogs can be used directly as functions or as values.
```
    // For info on debugging this code, see the next section!
    cogz.myFunc(cogz.myArray);
```

## The Biggest Benefit of Cogz

It adds a single layer to your cog functions that simply keeps track of what other cogs are in the parameters. Why? So that when you are debugging, you can inspect any cog to find:

 - What Cogs This Cog Has Accessed
   - myFunc._reads = { 'myArray': 2016-06-08T04:13:35.260Z };
   - myFunc._latestReads = ['myArray'];
   - myFunc._maxLatestReads = 3; // You can change these any time to record more.
   - myFunc._latestUniqueReads = ['myArray']
   - myFunc._maxLatestUniqueReads = 3;
 - What Cogs Have Accessed This Cog
   - myArray._readers = { 'myFunc': 2016-06-08T04:13:35.260Z };
   - myArray._latestReaders = ['myFunc'];
   - myArray._maxLatestReaders = 3;
   - myArray._latestUniqueReaders = ['myFunc']
   - myArray._maxLatestUniqueReaders = 3;
 - And Soon . . .
   - // TODO: cog._writes . . .
   - // TODO: cog._writers . . .
   - // TODO: cog._observers = [];
   - // TODO: cog._observing = [];
   - // TODO: cog._filePath . . .

 In other words, when something goes wrong with your code, the culprits line up and confess--in chronological order. And if you want to change a part (cog) of your code, you can immediately see every other cog that is depending on it.

## Other Benefits of Cogz

 - The convention of making everything a cog and accessing other cogs via parameters helps to keep code modular and easy to read.
 - Code this modular--where a cog can even be a primitive or a simple data object--naturally separates model and view and controller code, but goes even further.
 - There are pre-written cogs that do simple binding for you if you wish to use them, but because they're cogs, they're just as accessible as your code. No more black-box 'magic' making you wonder what happened.
 - No more long lists of errors that don't even tell you what part of your code is to blame. Here, when you mess up, the error points directly at your code because your errors have not been intercepted, redirected, and logged from some meaningless error handler.
 - No fighting a framework and learning dozens of apis just to develop a simple app. Now you can just look up how to do something in vanilla JavaScript and see it work the first time.
 - Cogz works in any browser as well as on a Node.js server--without depending on any bundler/converter. When a cog needs to be limited to the 'server' directory or the 'client' directory, it can be, but most cogs go in the 'universal' (isomorphic) directory. (That's the internal structure of Cogz, and you can organize your app that way too if you like, but you don't have to.)
 - Every cog, as a vertex/node with all of its edge relationships revealed, provides an abstracted, simplified view of your app. It's like a component in a tree of components, except better because it's hard to conceptualize how a component can live in multiple levels of a tree, and because it's hard to figure out how or why a component is different than a service. Here both components and services are just cogs that can be used by other cogs.

## Installation

npm install cogz --save

## Tests

npm test

## Contributors

Welcome.

## License

ISC (like MIT)
