# parts
A simple JS framework to help you understand what your code is doing.

## Synopsis

I started this June 5 2016, and it's coming along nicely, but you probably don't want to use it yet.

## Code Example

A part can be an object or a function or anything really.

```
    parts.add({
      partName: 'myObj',
      partValue: {
        prop1: 'value1'
      }
    });
    parts.add({
      partName: 'myFunc',
      partValue: function myFunc(obj) {
        throw new Error('Just to show off debugging.');
      }
    });
```

Parts can be used directly as functions or as values.
```
    parts.myFunc(parts.myObj);
```

## The Biggest Benefit of Parts

It adds a single layer to your 'part' functions that simply keeps track of what other 'parts' are in the parameters. Why? So that when you are debugging, you can inspect any 'part' to find:

 - What Parts This Part Has Accessed
   - part.reads = {};
   - part.latestReads = [];
   - part.maxLatestReads = 3;
   - part.latestUniqueReads = []
   - part.maxLatestUniqueReads = 3;
 - What Parts Have Accessed This Part
   - part.readers = {};
   - part.latestReaders = [];
   - part.maxLatestReaders = 3;
   - part.latestUniqueReaders = []
   - part.maxLatestUniqueReaders = 3;
 - And Soon . . .
   - // TODO: part.writes . . .
   - // TODO: part.writers . . .
   - // TODO: part.observers = [];
   - // TODO: part.observing = [];
   - // TODO: part.filePath . . .

 In other words, when something goes wrong with your code, the culprits line up and confess--in chronological order. And if you want to change a 'part' of your code, you can immediately see every other 'part' that is depending on it.

## Other Benefits of Parts

 - The convention of making everything a 'part' and accessing other parts via parameters helps to keep code modular and easy to read.
 - Code this modular--where a 'part' can even be a primitive or a simple data object--naturally separates model and view and controller code, but goes even further.
 - There are pre-written 'parts' that do simple binding for you if you wish to use them, but because they're 'parts', they're just as accessible as your code. No more black-box 'magic' making you wonder what happened.
 - No more long lists of errors that don't even tell you what part of your code is to blame. Here, when you mess up, the error points directly at your code because your errors have not been intercepted, redirected, and logged from some meaningless error handler.
 - No fighting a framework and learning dozens of apis just to develop a simple app. Now you can just look up how to do something in vanilla JavaScript and see it work the first time.
 - 'Parts' works in any browser as well as on a Node.js server--without depending on any bundler/converter. When a 'part' needs to be limited to the 'server' directory or the 'client' directory, it can be, but most 'parts' go in the 'universal' (isomorphic) directory. (That's the internal structure of Parts, and you can organize your app that way too if you like, but you don't have to.)
 - Every 'part', as a vertex/node with all of its edge relationships revealed, provides an abstracted, simplified view of your app. It's like a component in a tree of components, except better because it's hard to conceptualize how a component can live in multiple levels of a tree, and because it's hard to figure out how or why a component is different than a service. Here both components and services are just parts that can be used by other parts.

## Installation

npm install @marcusreese/parts

## Tests

npm test

## Contributors

Welcome.

## License

ISC (like MIT)
