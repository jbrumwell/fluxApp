/* global describe, it, after */
'use strict';

var expect = require('chai').expect;

describe('Plugins', function() {
  var _fluxApp = require('../../lib');
  var fluxApp;

  beforeEach(function() {
    fluxApp = _fluxApp.noConflict();
  });

  it('should be possible to retrieve plugin', function() {
    var plugin = {
      stores: {
        test: {}
      }
    };

    fluxApp.registerPlugin('test', plugin);

    expect(fluxApp.getPlugin('test')).to.be.a('object');
    expect(fluxApp.getPlugin('test')).to.equal(plugin);
  });

  it('should register multiple plugins', function() {
    fluxApp.registerPlugins({
      test: {
        contextMethods: {
          getTest: function getTest() {}
        }
      },
      two: {
        contextMethods: {
          getTwo: function getTest() {}
        }
      }
    });

    var context = fluxApp.createContext();

    expect(fluxApp.hasPlugin('test')).to.equal(true);
    expect(fluxApp.hasPlugin('two')).to.equal(true);
    expect(context.getTest).to.be.a('function');
    expect(context.getTwo).to.be.a('function');
  });

  it('should register stores passed', function() {
    fluxApp.registerPlugin('test', {
      stores: {
        test: {}
      }
    });

    var stores = fluxApp.getStores();

    expect(stores.test).to.be.a('function');
  });

  it('should register actions passed', function() {
    fluxApp.registerPlugin('test', {
      actions: {
        test: {}
      }
    });

    var actions = fluxApp.getActions();

    expect(actions.test).to.be.a('function');
  });

  it('should register context methods passed', function() {
    fluxApp.registerPlugin('test', {
      contextMethods: {
        getTest: function getTest() {}
      }
    });

    var context = fluxApp.createContext();

    expect(context.getTest).to.be.a('function');
  });

  it('should be possible to know if a plugin is registered', function() {
    fluxApp.registerPlugin('test', {
      contextMethods: {
        getTest: function getTest() {}
      }
    });

    expect(fluxApp.hasPlugin('test')).to.equal(true);
  });

  it('should be possible to remove a plugin', function() {
    fluxApp.registerPlugin('test', {
      actions: {
        test: {}
      },

      stores: {
        test: {}
      },

      contextMethods: {
        getTest: function getTest() {}
      }
    });

    var stores = fluxApp.getStores();
    var actions = fluxApp.getActions();
    var context = fluxApp.createContext();

    expect(context.getTest).to.be.a('function');
    expect(actions.test).to.be.a('function');
    expect(stores.test).to.be.a('function');
    expect(fluxApp.hasPlugin('test')).to.equal(true);

    fluxApp.removePlugin('test');

    stores = fluxApp.getStores();
    actions = fluxApp.getActions();
    context = fluxApp.createContext();

    expect(context.getTest).to.be.a('undefined');
    expect(actions.test).to.be.a('undefined');
    expect(stores.test).to.be.a('undefined');
    expect(fluxApp.hasPlugin('test')).to.equal(false);
  });
});
