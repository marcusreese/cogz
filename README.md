# Cogz
A JavaScript microframework

[![Build Status](https://travis-ci.org/marcusreese/cogz.svg?branch=master)](https://travis-ci.org/marcusreese/cogz) [![Coverage Status](https://coveralls.io/repos/github/marcusreese/cogz/badge.svg?branch=master)](https://coveralls.io/github/marcusreese/cogz?branch=master&whyThisWillNotUpdate=unknown)

## Synopsis

I created this in my limited spare time during June and July of 2016. I'm almost ready to use it myself, but I'm guessing others probably won't want to use it yet.

## Code Example

```
    // Create one or more containers for namespacing.
    // There may be model, view, and controller containers,
    // but this demo will simplify things into just an app container.
    var app = {};
    cogz.add({
      container: app,
      cogName: 'watchedArray',
      value: ['arrayItem0']
    });

    // So now app has app.watchedArray.
    expect(app.watchedArray instanceof Array).to.equal(true);

    // And its current form is saved so that changes can be tracked.
    expect(cogz.changes.length).to.equal(1);
    expect(cogz.changes[0].cogName).to.equal('watchedArray');
    expect(cogz.changes[0].changeRecord.stringValue).to.equal('["arrayItem0"]');

    // By default, cogz saves the last 100 changes. Configuring that is easy.
    cogz.maxChangesToSave = 20;

    // The watchedArray cog also keeps some records in its own .asCog property.
    var arrayAsCog = app.watchedArray.asCog;
    expect(arrayAsCog.cogName).to.equal('watchedArray');

    // The cogz.changes array interleaves changes from all data cogs,
    // but if you're more interested in watchedArray, it tracks its own changes.
    expect(arrayAsCog.changes.length).to.equal(1);
    arrayAsCog.maxChangesToSave = 1000;

    // A cog can also be a function, set up in a similar way.
    // If a function needs to observe or inject, it specifies argGroups.
    cogz.add({
      container: app,
      cogName: 'arrayWatcherFunction',
      argGroups: {
        groupX: [
          { watch: 'watchedArray' },
          { include: 'newsObject' }
        ]
      },
      value: function (arr, obj) {
        obj.news.push(arr.asCog.cogName + ' has been changed');
      }
    });

    // So now app has app.arrayWatcherFunction()
    expect(typeof app.arrayWatcherFunction).to.equal('function');

    // It has one argGroup which is hoping for a 'newsObject'. Let's create one.
    cogz.add({
      container: app,
      cogName: 'newsObject',
      value: { news: [] }
    });

    // Now that all arguments are ready, arrayWatcherFunction automatically runs.
    expect(app.newsObject.news.length).to.equal(1);
    expect(cogz.changes.length).to.equal(3);
    expect(cogz.changes[0].cogName).to.equal('watchedArray');
    expect(cogz.changes[1].cogName).to.equal('newsObject');
    expect(cogz.changes[2].cogName).to.equal('newsObject');

    // Function cogs do not need to specify argGroups.
    cogz.add({
      container: app,
      cogName: 'arrayChanger',
      value: function (arr) {
        arr.push('newArrayItem');
      }
    });

    // When watchedArray is changed, arrayWatcherFunction runs again.
    app.arrayChanger(app.watchedArray);
    expect(app.watchedArray.length).to.equal(2);
    expect(app.watchedArray.asCog.changes.length).to.equal(2);
    expect(app.newsObject.news.length).to.equal(2);
    expect(app.newsObject.asCog.changes.length).to.equal(3);
    expect(cogz.changes.length).to.equal(5);

    // These saved changes can be used to implement undo (using cogz.replace).
    cogz.add({
      container: app,
      cogName: 'undo',
      value: function undo(dataCog) {
        var asCog = dataCog.asCog;
        // Remember where we are in the undo-redo history.
        if (!asCog.undoRedoIndex) {
          asCog.undoRedoIndex = asCog.changes.length - 1;
        }
        // To undo, we're going back to the previous state.
        asCog.undoRedoIndex = asCog.undoRedoIndex - 1;
        // And let's account for old states we deleted to honor maxChangesToSave
        var modifiedIndex = asCog.undoRedoIndex - asCog.numChangesDeleted;
        // If we have called undo too many times and ran out of older states, quit.
        if (!asCog.changes[modifiedIndex]) {
          return;
        }
        // Otherwise, grab the older stringified state.
        var olderStringValue = asCog.changes[modifiedIndex].stringValue;
        // Rehydrate it.
        var olderValue = JSON.parse(olderStringValue);
        // Replace the current value with the older value, and we're done.
        cogz.replace({
          cogName: asCog.cogName,
          value: olderValue
        });
      }
    });

    // Let's use our new undo function to remove newArrayItem from watchedArray.
    app.undo(app.watchedArray);
    expect(app.watchedArray.length).to.equal(1); // Length went down again.
    expect(app.newsObject.news.length).to.equal(3); // Watchers still work.
    expect(cogz.changes.length).to.equal(7); // This .changes increased by 2.
    expect(app.watchedArray.asCog.changes.length).to.equal(3); // This by 1.

    // For cogz users who do not want to keep up with their own containers,
    // Cogz includes an empty object named 'x' for 'extensions', and
    // if the user does not specify a container, cogz.x is used as the default..
    cogz.add({
      cogName: 'cogWithNoSpecifiedContainer',
      value: { someProp: 'someVal' }
    });
    expect(cogz.x.cogWithNoSpecifiedContainer.someProp).to.equal('someVal');

```

## Why I created Cogz

First, I must confess to being full of doubt and even anxiety about this. Why write my own framework when there are so many excellent, battle-hardened frameworks already available? Perhaps the overarching reason is that I want to create apps that are easier for me to reason about. Cogz does that for me. Will it do that for other developers? I don't know. But just in case it helps someone, I'll go ahead and mention some benefits I see in Cogz.

### Debugging

When something goes wrong with my code, the culprits line up and confess. For example, to see what changed an object (or array) named myData, I can simply look in myData.asCog.changerCogs and see them all. And I can see more details (e.g., their chronological order and what changes they made) by checking app.myData.asCog.changes (in isolation) or by checking cogz.changes (in the context of the rest of the app).

### Refactoring

When I'm thinking of changing a part of my code (i.e., modifying a cog such as app.myFunction), I can quickly find out what other cogs are depending on it, like by checking app.myFunction.neederCogs. For an object or an array (in this example: app.myData), the dependent cogz are divided into app.myData.nonChangerCogs and app.myData.changerCogs.

### Ease of reading code

Cogz reinforces the convention of putting everything a function will need in its parameters. The argGroups also clarifies in what contexts the function will be used.

### Modularity

Cogz makes it easy for me to keep data separated from the functions that use it. This naturally leads to separating model and view and controller code, but it is more complete.

### No error redirection

No more long lists of errors that don't even tell you what part of your code is to blame. Here, when you mess up, the error points directly at your code because your errors have not been intercepted, redirected, and logged from some meaningless error handler.

### Minimal magic

Cogz does just a few easy-to-understand bits of magic:
  1) It wraps functions in order to stringify and thus detect changes in arguments.
  2) It maintains an accessible lists of observers that can respond to those changes.
This simplicity means that I don't have to learn dozens of apis just to develop a simple app. Instead, I can just look up how to do something in vanilla JavaScript and see it work the first time.

### Universal/isomorphic

Cogz works both in the browser and in Node.js, without depending on any bundler/converter.

### No tree of components

Every cog, as a vertex/node with all of its edge relationships revealed, provides an abstracted, simplified view of the app. In a tree structure, it's hard to figure out how a component can live in multiple levels of a tree, but in a graph like this, I don't have to deal with the question of what "level" a cog is on because there are no required levels here. I just connect to whatever cog I need.

## Installation

npm install cogz --save

## Tests

npm test

## Contributors

Welcome.

## License

ISC (like MIT)
