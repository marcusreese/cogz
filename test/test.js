'use strict';

var expect = require('chai').expect;
var parts = require('../index');

describe('parts', function() {
    it('should have an add function', function() {
        expect(typeof parts.add).to.equal('function');
    });
});

// I have about 26 other passing tests, currently still in parts.js
