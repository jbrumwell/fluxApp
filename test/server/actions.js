'use strict';
var expect = require('chai').expect;

describe('actions', function() {
  var fluxApp = require('../../lib');
  var dispatcher = fluxApp.getDispatcher();
  var Promise = require('bluebird');

  function createActions(name, spec, tag) {
    fluxApp.createActions(name, spec, tag);

    return fluxApp.getActions(name);
  }

  afterEach(function() {
    fluxApp._actions = {};
  });

  it('should return a promise', function(done) {
    var actions = createActions('test', {
      method: function() {
        return 'syncing';
      }
    });

    var promise = actions.method();

    expect(promise.then).to.be.a('function');

    promise.then(done.bind(null, null));
  });

  it('should emit the failed event when sync', function(done) {
    var dispatchId;
    var called = false;

    var actions = createActions('test', {
      method: function() {
        throw new Error('sync failure');
      }
    });

    function listener(result) {
      dispatcher.unregister(dispatchId);
      expect(result.actionType).to.equal(fluxApp.getActionType('test.method:failed'));
      expect(result.payload.message).to.equal('sync failure');
      done();
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when sync', function(done) {
    var dispatchId;

    var actions = createActions('test', {
      method: function() {
        return 'sync'
      }
    });

    function listener(result) {
      dispatcher.unregister(dispatchId);
      expect(result.actionType).to.equal(fluxApp.getActionType('test.method'));
      expect(result.payload).to.equal('sync');
      done();
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit pre event when async', function(done) {
    var dispatchId;

    var actions = createActions('test', {
      method: function() {
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
      expect(result.payload).to.be.undefined;
      done();
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when async', function(done) {
    var dispatchId;
    var eventName = fluxApp.getActionType('test.method');

    var actions = createActions('test', {
      method: function() {
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
      method: function() {
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
        expect(result.payload).to.be.undefined;
        done();
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the failed event when async', function(done) {
    var dispatchId;
    var eventName = fluxApp.getActionType('test.method:failed');
    var promise;

    var actions = createActions('test', {
      method: function() {
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
});
