/* global describe, it, after */
'use strict';

var expect = require('chai').expect;

describe('fluxapp', function() {
  var fluxApp = require('../../lib');

  after(function() {
    Object.keys(fluxApp._stores).forEach(function destroyStore(id) {
      fluxApp.removeStore(id);
    });
  });

  it('should have a noConflict method', function() {
    expect(fluxApp.noConflict).to.be.a('function');
  });

  it('should have a registerPlugin method', function() {
    expect(fluxApp.registerPlugin).to.be.a('function');
  });

  it('should have a registerPlugins method', function() {
    expect(fluxApp.registerPlugins).to.be.a('function');
  });

  it('should have a removePlugin method', function() {
    expect(fluxApp.removePlugin).to.be.a('function');
  });

  it('should have a hasPlugin method', function() {
    expect(fluxApp.registerPlugin).to.be.a('function');
  });

  it('should have a createContext method', function() {
    expect(fluxApp.createContext).to.be.a('function');
  });

  it('should have a getStores method', function() {
    expect(fluxApp.getStores).to.be.a('function');
  });

  it('should have a removeStore method', function() {
    expect(fluxApp.removeStore).to.be.a('function');
  });

  it('should have a registerStore method', function() {
    expect(fluxApp.registerStore).to.be.a('function');
  });

  it('should have a registerStores method', function() {
    expect(fluxApp.registerStores).to.be.a('function');
  });

  it('should have a registerActions method', function() {
    expect(fluxApp.registerActions).to.be.a('function');
  });

  it('should have a getActionType method', function() {
    expect(fluxApp.getActionType).to.be.a('function');
  });

  it('should allow us to register a store', function() {
    fluxApp.registerStore('test');

    expect(fluxApp._stores.test).to.be.a('function');
  });

  describe('context', function() {
    var context = fluxApp.createContext({
      getRouter: function getRouter() {}
    });

    it('should have a destroy method', function() {
      expect(context.destroy).to.be.a('function');
    });

    it('should allow custom methods', function() {
      expect(context.getRouter).to.be.a('function');
    });

    it('should have a removeActions method', function() {
      expect(context.removeActions).to.be.a('function');
    });

    it('should have a removeActions method', function() {
      expect(context.removeActions).to.be.a('function');
    });

    it('should have a getActions method', function() {
      expect(context.getActions).to.be.a('function');
    });

    it('should have a getAction method', function() {
      expect(context.getAction).to.be.a('function');
    });

    it('should have a removeStore method', function() {
      expect(context.removeStore).to.be.a('function');
    });

    it('should have a getStore method', function() {
      expect(context.getStore).to.be.a('function');
    });

    it('should have a getDispatcher method', function() {
      expect(context.getDispatcher).to.be.a('function');
    });

    it('should have a dehydrate method', function() {
      expect(context.dehydrate).to.be.a('function');
    });

    it('should have a rehydrate method', function() {
      expect(context.rehydrate).to.be.a('function');
    });

    it('should have a getActionType method', function() {
      expect(context.getActionType).to.be.a('function');
    });

    it('should rehydrate store state base on action', function() {
      fluxApp.registerStore('name', {
        actions : {
          onTest : 'test.test'
        },

        onTest : function onTest(state) {
          this.setState(state);
        }
      });

      var context = fluxApp.createContext();
      var store = context.getStore('name');
      var state = store.getState();

      expect(state).to.be.a('object');
      expect(state).to.be.empty();

      context.rehydrate({
        stores : {
          name : {
            now : 'string'
          }
        }
      });

      var state = store.getState();

      expect(state).to.be.a('object');
      expect(state).to.not.be.empty();
      expect(state.now).to.equal('string');
    });
  });
});
