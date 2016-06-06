'use strict';
var parts = require('./universal/parts');
// Initialize parts.
var path = require('path');
var fs = require('fs');
var normalizedPath = path.join(__dirname, 'universal');
fs.readdirSync(normalizedPath).forEach(function(file) {
  require('./universal/' + file);
});
normalizedPath = path.join(__dirname, 'server');
fs.readdirSync(normalizedPath).forEach(function(file) {
  require('./server/' + file);
});
module.exports = parts;
