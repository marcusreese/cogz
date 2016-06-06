# parts
A simple JS framework to help you understand what your code is doing.

## Synopsis

I started this June 5 2016, and it's coming along nicely, but you probably don't want to use it yet.

## Code Example

A part can be an object or a function or anything really.
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

Parts can be used directly as functions or as values.
    parts.myFunc(parts.myObj);

When you are debugging, you can inspect the 'part' to find:
 - part.reads = {};
 - part.latestReads = [];
 - part.maxLatestReads = 3;
 - part.latestUniqueReads = []
 - part.maxLatestUniqueReads = 3;
 - part.readers = {};
 - part.latestReaders = [];
 - part.maxLatestReaders = 3;
 - part.latestUniqueReaders = []
 - part.maxLatestUniqueReaders = 3;
 - // TODO: part.writes . . .
 - // TODO: part.writers . . .
 - // TODO: part.observers = [];
 - // TODO: part.observing = [];
 - // TODO: part.filePath . . .

 In other words, when you debug, you can instantly see everything that has touched the variable you're debugging--and in what order. And if you want to change part of your code, you can immediately see every function that is depending on that code, whether those functions were registered observers or just used it once.

## Motivation

I don't like
 - long lists of errors (e.g. zone.js) that don't even tell me what part of my code is to blame.
 - wondering what part of my code caused a bug in another part.
 - fighting a framework and learning dozens of apis just to develop a simple app.

## Installation

npm install marcusreese/parts

## Tests

npm test

## Contributors

Welcome.

## License

ISC (like MIT)
