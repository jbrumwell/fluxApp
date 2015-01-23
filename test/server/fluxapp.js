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

  it('should have a getStore method', function() {
    expect(fluxApp.getStore).to.be.a('function');
  });

  it('should have a getDispatcher method', function() {
    expect(fluxApp.getDispatcher).to.be.a('function');
  });

  it('should have a createStore method', function() {
    expect(fluxApp.createStore).to.be.a('function');
  });

  it('should have a createActions method', function() {
    expect(fluxApp.createActions).to.be.a('function');
  });

  it('should have a debug method', function() {
    expect(fluxApp.debug).to.be.a('function');
  });

  it('should have a getActionType method', function() {
    expect(fluxApp.getActionType).to.be.a('function');
  });

  it('should have a dehydrate method', function() {
    expect(fluxApp.dehydrate).to.be.a('function');
  });

  it('should have a rehydrate method', function() {
    expect(fluxApp.rehydrate).to.be.a('function');
  });

  it('should allow us to register an then retrieve a store', function() {
    fluxApp.createStore('test');

    var store = fluxApp.getStore('test');

    expect(store).to.be.a('object');
  });

  it('should rehydrate store state base on action', function() {
    var store = fluxApp.createStore('name', {
      actions : {
        onTest : 'test.test'
      },

      onTest : function onTest(state) {
        this.setState(state);
      }
    });

    expect(store.state).to.be.a('object');
    expect(store.state).to.be.empty();

    fluxApp.rehydrate({
      stores : {
        name : [
          fluxApp.getActionType('test.test'),
          {
            now : 'string'
          }
        ]
      }
    });

    expect(store.state).to.be.a('object');
    expect(store.state).to.not.be.empty();
    expect(store.state.now).to.equal('string');
  });
});
