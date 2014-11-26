'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('Dispatcher', function() {

  var Dispatcher = require('../../lib/dispatcher');
  var dispatcher;
  var callbackA;
  var callbackB;

  beforeEach(function() {
    dispatcher = new Dispatcher();
    callbackA = sinon.spy();
    callbackB = sinon.spy();
  });

  it('should execute all subscriber callbacks', function() {
    dispatcher.register(callbackA);
    dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(1);
    expect(callbackA.withArgs(payload).called);

    expect(callbackB.callCount).to.equal(1);
    expect(callbackB.withArgs(payload).called);

    dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(1);
    expect(callbackA.withArgs(payload).calledTwice);

    expect(callbackB.callCount).to.equal(1);
    expect(callbackB.withArgs(payload).calledTwice);
  });


  it('should wait for callbacks registered earlier', function() {
    var tokenA = dispatcher.register(callbackA);

    dispatcher.register(function(payload) {
      dispatcher.waitFor([tokenA]);
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);
      callbackB(payload);
    });

    var payload = {};
    dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(1);
    expect(callbackA.withArgs(payload).called);

    expect(callbackB.callCount).to.equal(1);
    expect(callbackB.withArgs(payload).called);
  });

  it('should wait for callbacks registered later', function() {
    dispatcher.register(function(payload) {
      return dispatcher.waitFor([tokenB]).then(function() {
        expect(callbackB.callCount).to.equal(1);
        expect(callbackB.withArgs(payload).called);
        callbackA(payload);
      })
    });

    var tokenB = dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);
    });
  });

  it.skip('should throw if dispatch() while dispatching', function() {
    dispatcher.register(function(payload) {
      dispatcher.dispatch(payload);
      callbackA();
    });

    var payload = {};
    expect(function() {
      dispatcher.dispatch(payload);
    }).toThrow();

    expect(callbackA.mock.calls.length).toBe(0);
  });

  it('should throw if waitFor() while not dispatching', function() {
    var tokenA = dispatcher.register(callbackA);

    expect(function() {
      dispatcher.waitFor([tokenA]);
    }).to.throw();

    expect(callbackA.callCount).to.equal(0);
  });

  it('should throw if waitFor() with invalid token', function(done) {
    var invalidToken = 1337;

    dispatcher.register(function() {
      dispatcher.waitFor([invalidToken]);
    });

    var payload = {};

    dispatcher.dispatch(payload).catch(function(err) {
      done();
    });
  });

  it.skip('should throw on self-circular dependencies', function() {
    var tokenA = dispatcher.register(function() {
      dispatcher.waitFor([tokenA]);
    });

    var payload = {};
    expect(function() {
      dispatcher.dispatch(payload);
    }).to.throw();

    expect(callbackA.callCount).toBe(0);
  });

  it.skip('should throw on multi-circular dependencies', function() {
    var tokenA = dispatcher.register(function() {
      dispatcher.waitFor([tokenB]);
    });

    var tokenB = dispatcher.register(function() {
      dispatcher.waitFor([tokenA]);
    });

    var payload = {};
    expect(function() {
      dispatcher.dispatch(payload);
    }).toThrow();

    expect(callbackA.mock.calls.length).toBe(0);
    expect(callbackB.mock.calls.length).toBe(0);
  });

  it('should remain in a consistent state after a failed dispatch', function(done) {
    dispatcher.register(callbackA);

    dispatcher.register(function(payload) {
      if (payload.shouldThrow) {
        throw new Error();
      }
      callbackB();
    });

    dispatcher.dispatch({shouldThrow: true}).catch(function() {
      // Cannot make assumptions about a failed dispatch.
      var callbackACount = callbackA.callCount;

      dispatcher.dispatch({shouldThrow: false}).then(function() {
        expect(callbackA.callCount).to.equal(callbackACount + 1);
        expect(callbackB.callCount).to.equal(1);
        done();
      });
    });
  });

  it('should properly unregister callbacks', function() {
    dispatcher.register(callbackA);

    var tokenB = dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(1);
    expect(callbackA.withArgs(payload).called);

    expect(callbackB.callCount).to.equal(1);
    expect(callbackB.withArgs(payload).called);

    dispatcher.unregister(tokenB);

    dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(1);
    expect(callbackA.withArgs(payload).calledTwice);

    expect(callbackB.callCount).to.equal(1);
  });

});
