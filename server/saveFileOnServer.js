(function saveFileOnServerWrapper() {
  var parts = require('../universal/parts.js');
  var fs = require('fs');

  parts.add({
    partName: 'saveFileOnServer',
    partValue: function saveFileOnServer(path, text) {
      fs.writeFile(__dirname + '/' + path, text, function(err) {
          if (err) {
              return console.log(err);
          }
      });
    }
  });

})();
