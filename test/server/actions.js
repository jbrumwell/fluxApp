/* global describe, afterEach, it */
'use strict';
var expect = require('chai').expect;

describe('actions', function() {
  var fluxApp = require('../../lib');
  var context = fluxApp.createContext();
  var Promise = require('bluebird');
  var dispatcher;

  function createActions(name, spec) {
    fluxApp.registerActions(name, spec);

    return context.getActions(name);
  }

  afterEach(function() {
    if (context) {
      context.destroy();
    }

    context = fluxApp.createContext();
    dispatcher = context.getDispatcher();

    fluxApp._actions = {};
  });

  it('should return a promise', function(done) {
    var actions = createActions('test', {
      method : function() {
        return 'syncing';
      }
    });

    var promise = actions.method();

    expect(promise.then).to.be.a('function');

    promise.then(done.bind(null, null));
  });

  it('should emit the failed event when sync', function(done) {
    var dispatchId;
    var failedType = fluxApp.getActionType('test.method:failed');
    var beforeType = fluxApp.getActionType('test.method:before');

    var actions = createActions('test', {
      method : function() {
        throw new Error('sync failure');
      }
    });

    function listener(result) {
      if (result.actionType === failedType) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(failedType);
        expect(result.payload.message).to.equal('sync failure');
        done();
      } else {
        expect(result.actionType).to.equal(beforeType);
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when sync', function(done) {
    var dispatchId;

    var actions = createActions('test', {
      method : function() {
        return 'sync';
      }
    });

    var methodType = fluxApp.getActionType('test.method');
    var beforeType = fluxApp.getActionType('test.method:before');

    function listener(result) {
      if (result.actionType === methodType) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(methodType);
        expect(result.payload).to.equal('sync');
        done();
      } else {
        expect(result.actionType).to.equal(beforeType);
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit pre event when async', function(done) {
    var dispatchId;

    var actions = createActions('test', {
      method : function() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            resolve('async');
          });
        });
      }
    });

    function listener(result) {
      dispatcher.unregister(dispatchId);
      expect(result.actionType).to.equal(fluxApp.getActionType('test.method:before'));
      expect(result.payload).to.be.undefined();
      done();
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when async', function(done) {
    var dispatchId;
    var eventName = fluxApp.getActionType('test.method');

    var actions = createActions('test', {
      method : function() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            resolve('async');
          });
        });
      }
    });

    function listener(result) {
      if (result.actionType === eventName) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(eventName);
        done();
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit post event when async', function(done) {
    var dispatchId;
    var eventName = fluxApp.getActionType('test.method:after');

    var actions = createActions('test', {
      method : function() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            resolve('async success');
          });
        });
      }
    });

    function listener(result) {
      if (result.actionType === eventName) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(eventName);
        expect(result.payload).to.be.undefined();
        done();
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the failed event when async', function(done) {
    var dispatchId;
    var eventName = fluxApp.getActionType('test.method:failed');

    var actions = createActions('test', {
      method : function() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            reject(new Error('async failure'));
          });
        });
      }
    });

    function listener(result) {
      if (result.actionType === eventName) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(eventName);
        done();
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should receive the parameters passed by component', function(done) {
    fluxApp.registerActions('test', {
      method : function(a, b) {
        expect(a).to.equal('a');
        expect(b).to.equal('b');
        done();
      }
    });

    context.getActions('test').method('a', 'b');
  });

  it('should resolve to an object of actionType = actionResponse', function(done) {
    fluxApp.registerActions('test', {
      method : function(a, b) {
        expect(a).to.equal('a');
        expect(b).to.equal('b');
        return [ a, b ];
      }
    });

    context.getActions('test').method('a', 'b').then(function(result) {
      var actionType = fluxApp.getActionType('test.method');

      expect(result).to.be.a('array');
      expect(result[0]).to.equal(actionType);
      expect(result[1]).to.be.a('array');
      expect(result[1][0]).to.equal('a');
      expect(result[1][1]).to.equal('b');
      done();
    });
  });

  it('should resolve to an object of actionType = actionResponse async', function(done) {
    fluxApp.registerActions('test', {
      method : function(a, b) {
        expect(a).to.equal('a');
        expect(b).to.equal('b');
        return new Promise(function(resolve) {
          setImmediate(resolve.bind(resolve, [ a, b ]));
        });
      }
    });

    context.getActions('test').method('a', 'b').then(function(result) {
      var actionType = fluxApp.getActionType('test.method');

      expect(result).to.be.a('array');
      expect(result[0]).to.equal(actionType);
      expect(result[1]).to.be.a('array');
      expect(result[1][0]).to.equal('a');
      expect(result[1][1]).to.equal('b');
      done();
    });
  });
});
