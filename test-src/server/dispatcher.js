/* global describe, it, sinon, beforeEach */
'use strict';

var Promise = require('bluebird');
var expect = require('chai').expect;

// runs in both the browser and server https://github.com/webpack/webpack/issues/304
var mysinon = typeof sinon === 'undefined' ? require('sinon') : sinon;

describe('Dispatcher', function() {
  var Dispatcher = require('../../lib/dispatcher');
  var dispatcher;
  var callbackA;
  var callbackB;

  beforeEach(function() {
    dispatcher = new Dispatcher();
    callbackA = mysinon.spy();
    callbackB = mysinon.spy();
  });

  it('should allow for inspection of dispatching status', function(done) {
    var dispatch1 = mysinon.spy();
    var dispatch2 = mysinon.spy();
    dispatcher.register(function(payload) {
      expect(dispatcher.isDispatching()).to.equal(true);
    });

    var payload = {
      type : 'initial'
    };

    expect(dispatcher.isDispatching()).to.equal(false);

    dispatcher.dispatch(payload).then(function() {
      expect(dispatcher.isDispatching()).to.equal(false);
      done();
    });
  });

  it('should allow for getting the current dispatched event', function(done) {
    var dispatch1 = mysinon.spy();
    var dispatch2 = mysinon.spy();
    var payload = {
      actionType : 'initial'
    };

    dispatcher.register(function(payload) {
      expect(dispatcher.getCurrentEvent()).to.equal(payload.actionType);
    });

    dispatcher.dispatch(payload).then(function() {
      expect(dispatcher.getCurrentEvent()).to.equal(null);
      done();
    });
  });

  it('should execute all subscriber callbacks', function(done) {
    dispatcher.register(callbackA);
    dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);

      dispatcher.dispatch(payload).then(function() {
        expect(callbackA.callCount).to.equal(2);
        expect(callbackA.withArgs(payload).calledTwice);

        expect(callbackB.callCount).to.equal(2);
        expect(callbackB.withArgs(payload).calledTwice);

        done();
      });
    });
  });

  it('should execute all subscriber async callbacks', function(done) {
    dispatcher.register(function(payload) {
      return new Promise(function(resolve) {
        setImmediate(function() {
          callbackA();
          resolve();
        });
      });
    });
    dispatcher.register(function() {
      return new Promise(function(resolve) {
        setImmediate(function() {
          callbackB();
          resolve();
        });
      });
    });

    var payload = {};
    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);

      return dispatcher.dispatch(payload).then(function() {
        expect(callbackA.callCount).to.equal(2);
        expect(callbackA.withArgs(payload).calledTwice);

        expect(callbackB.callCount).to.equal(2);
        expect(callbackB.withArgs(payload).calledTwice);

        done();
      });
    });
  });

  it('should wait for callbacks registered earlier', function(done) {
    var tokenA = dispatcher.register(callbackA);

    dispatcher.register(function(payload) {
      dispatcher.waitFor([ tokenA ]).then(function() {
        expect(callbackA.callCount).to.equal(1);
        expect(callbackA.withArgs(payload).called);
        callbackB(payload);
      }, done);
    });

    var payload = {};

    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);

      done();
    }, done);
  });

  it('should wait for callbacks registered earlier async', function(done) {
    var tokenA = dispatcher.register(function() {
      return new Promise(function(resolve) {
        setTimeout(function() {
          callbackA();
          resolve();
        }, 150);
      });
    });

    dispatcher.register(function(payload) {
      dispatcher.waitFor([ tokenA ]).then(function() {
        expect(callbackA.callCount).to.equal(1);
        expect(callbackA.withArgs(payload).called);
        callbackB(payload);
      }, done);
    });

    var payload = {};

    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);

      done();
    }, done);
  });

  it('should wait for callbacks registered later', function(done) {
    dispatcher.register(function(payload) {
      return dispatcher.waitFor([ tokenB ]).then(function() {
        expect(callbackB.callCount).to.equal(1);
        expect(callbackB.withArgs(payload).called);
        callbackA(payload);
      });
    });

    var tokenB = dispatcher.register(callbackB);

    var payload = {};

    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);
      done();
    }, done);
  });

  it('should wait for callbacks registered later async', function(done) {
    dispatcher.register(function(payload) {
      return dispatcher.waitFor([ tokenB ]).then(function() {
        expect(callbackB.callCount).to.equal(1);
        expect(callbackB.withArgs(payload).called);
        callbackA(payload);
      });
    });

    var tokenB = dispatcher.register(function() {
      return new Promise(function(resolve) {
        setTimeout(function() {
          callbackB();
          resolve();
        }, 150);
      });
    });

    var payload = {};

    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);
      done();
    }, done);
  });

  it('should wait for multiple async', function(done) {
    var callbackC = mysinon.spy();
    var callbackD = mysinon.spy();

    dispatcher.register(function() {
      return dispatcher.waitFor([ tokenC, tokenB, tokenD ]).then(function() {
        expect(callbackB.callCount).to.equal(1);
        expect(callbackC.callCount).to.equal(1);
        expect(callbackD.callCount).to.equal(1);
        callbackA();
      });
    });

    var tokenB = dispatcher.register(function() {
      return dispatcher.waitFor([ tokenD, tokenC ]).then(function() {
        expect(callbackD.callCount).to.equal(1);
        expect(callbackC.callCount).to.equal(1);
        callbackB();
      });
    });

    var tokenC = dispatcher.register(function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          callbackC();
          resolve();
        }, 500);
      });
    });

    var tokenD = dispatcher.register(function() {
      return dispatcher.waitFor([ tokenC ]).then(function() {
        expect(callbackC.callCount).to.equal(1);
        callbackD();
      });
    });

    var payload = {};

    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackB.callCount).to.equal(1);
      expect(callbackC.callCount).to.equal(1);
      expect(callbackD.callCount).to.equal(1);
      done();
    });
  });

  it('should wait for all listeners before launching another event', function(done) {
    var callbackC = mysinon.spy();
    var callbackD = mysinon.spy();
    var callbackE = mysinon.spy();
    var secondEvent = mysinon.spy();

    dispatcher.register(function(payload) {
      if (payload.actionType === 'one' && callbackA.callCount === 0) {
        dispatcher.dispatch({
          actionType : 'two',
        });
      }

      return dispatcher.waitFor([ tokenC ]).then(function() {
        if (payload.actionType === 'one' && callbackA.callCount === 0) {
          expect(callbackB.callCount).to.equal(0);
          expect(callbackC.callCount).to.equal(1);
          expect(callbackD.callCount).to.equal(0);
        }
        callbackA();
      });
    });

    var tokenB = dispatcher.register(function(payload) {
      if (payload.actionType === 'one' && callbackB.callCount === 0) {
        callbackB();
      }
    });

    var tokenC = dispatcher.register(function(payload) {
      if (payload.actionType === 'one' && callbackC.callCount === 0) {
        callbackC();
      }
    });

    var tokenD = dispatcher.register(function(payload) {
      if (payload.actionType === 'one' && callbackD.callCount === 0) {
        callbackD();
      }
    });

    var tokenE = dispatcher.register(function(payload) {
      if (payload.actionType === 'one' && callbackE.callCount === 0) {
        callbackE();
      }
    });

    var payload = {
      actionType : 'one',
    };

    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackB.callCount).to.equal(1);
      expect(callbackC.callCount).to.equal(1);
      expect(callbackD.callCount).to.equal(1);
      expect(callbackE.callCount).to.equal(1);
      done();
    });
  });

  it('should handle complex dependencies async', function(done) {
    var callbackC = mysinon.spy();
    var callbackD = mysinon.spy();

    dispatcher.register(function() {
      return dispatcher.waitFor([ tokenB ]).then(function() {
        expect(callbackB.callCount).to.equal(1);
        callbackA();
      });
    });

    var tokenB = dispatcher.register(function() {
      return dispatcher.waitFor([ tokenD ]).then(function() {
        expect(callbackD.callCount).to.equal(1);
        callbackB();
      });
    });

    var tokenC = dispatcher.register(function() {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          callbackC();
          resolve();
        }, 500);
      });
    });

    var tokenD = dispatcher.register(function() {
      return dispatcher.waitFor([ tokenC ]).then(function() {
        expect(callbackC.callCount).to.equal(1);
        callbackD();
      });
    });

    var payload = {};

    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackB.callCount).to.equal(1);
      expect(callbackC.callCount).to.equal(1);
      expect(callbackD.callCount).to.equal(1);
      done();
    });
  });

  it('should throw if waitFor() while not dispatching', function(done) {
    var tokenA = dispatcher.register(callbackA);

    dispatcher.waitFor([ tokenA ]).catch(done.bind(null, null));

    expect(callbackA.callCount).to.equal(0);
  });

  it('should throw if waitFor() with invalid token', function(done) {
    var invalidToken = 1337;

    dispatcher.register(function() {
      dispatcher.waitFor([ invalidToken ]).catch(done.bind(null, null));
    });

    var payload = {};

    dispatcher.dispatch(payload);
  });

  it('should throw on dispatch() if waitFor() job fails', function(done) {
    dispatcher.register(function(payload) {
      callbackA();
      return dispatcher.waitFor([ tokenB ]);
    });

    var tokenB = dispatcher.register(function() {
      expect(callbackA.callCount).to.equal(1);
      throw new Error('Error');
    });

    dispatcher.dispatch({}).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.equal('Error');
      done();
    });
  });

  it('should throw on dispatch() if waitFor() job fails async', function(done) {
    dispatcher.register(function(payload) {
      callbackA();
      return dispatcher.waitFor([ tokenB ]);
    });

    var tokenB = dispatcher.register(function() {
      expect(callbackA.callCount).to.equal(1);

      return new Promise(function(resolve, reject) {
        setImmediate(function() {
          reject(new Error('Error'));
        });
      });
    });

    dispatcher.dispatch({}).catch(function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.equal('Error');
      done();
    });
  });

  it('should throw on self-circular dependencies', function(done) {
    var tokenA = dispatcher.register(function() {
      return dispatcher.waitFor([ tokenA ]);
    });

    var payload = {};

    dispatcher.dispatch(payload).catch(done.bind(null, null));

    expect(callbackA.callCount).to.equal(0);
  });

  /**
   * This test will log "'Possibly unhandled Error: Dispatcher.waitFor(...):
   * Circular dependency detected"
   * because of the then() on the rejected promise, bluebird does not know if it was handled
   */
  it('should throw on self-circular dependencies async', function(done) {
    var tokenA = dispatcher.register(function() {
      return new Promise(function(resolve, reject) {
        setImmediate(function() {
          dispatcher.waitFor([ tokenA ]).then(resolve, reject);
        });
      });
    });

    var payload = {};

    dispatcher.dispatch(payload).catch(function() {
      expect(callbackA.callCount).to.equal(0);
      done();
    });

    expect(callbackA.callCount).to.equal(0);
  });

  it('should throw on multi-circular dependencies', function(done) {
    var tokenA = dispatcher.register(function() {
      return dispatcher.waitFor([ tokenB ])
      .catch(done.bind(null, null));
    });

    var tokenB = dispatcher.register(function() {
      return dispatcher.waitFor([ tokenA ])
      .catch(done.bind(null, null));
    });

    var payload = {};

    dispatcher.dispatch(payload).catch(function() {
      expect(callbackA.callCount).to.equal(0);
      expect(callbackB.callCount).to.equal(0);
      done();
    });
  });

  it('should throw on multi-circular dependencies async', function(done) {
    var tokenA = dispatcher.register(function() {
      callbackA();
      return new Promise(function(resolve) {
        dispatcher.waitFor([ tokenB ]).then(callbackA, done.bind(null, null));
      });
    });

    var tokenB = dispatcher.register(function() {
      expect(callbackA.calledCount).to.equal(1);
      dispatcher.waitFor([ tokenA ]).then(callbackB, done.bind(null, null));
    });

    var payload = {};

    dispatcher.dispatch(payload).catch(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackB.callCount).to.equal(0);
      done();
    });
  });

  it('should throw on complex circular dependencies async', function(done) {
    var callbackC = mysinon.spy();

    var tokenA = dispatcher.register(function() {
      callbackA();
      return dispatcher.waitFor([ tokenB ]);
    });

    var tokenB = dispatcher.register(function() {
      callbackB();
      return dispatcher.waitFor([ tokenD ]);
    });

    dispatcher.register(function() {
      return new Promise(function(resolve, reject) {
        callbackC();
        setTimeout(resolve, 1000);
      });
    });

    var tokenD = dispatcher.register(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackB.callCount).to.equal(1);
      expect(callbackC.callCount).to.equal(0);
      return dispatcher.waitFor([ tokenA ]).catch(done.bind(null, null));
    });

    var payload = {};

    dispatcher.dispatch(payload);
  });

  it('should remain in a consistent state after a failed dispatch', function(done) {
    dispatcher.register(callbackA);

    dispatcher.register(function(payload) {
      if (payload.shouldThrow) {
        throw new Error();
      }
      callbackB();
    });

    dispatcher.dispatch({ shouldThrow : true }).catch(function() {
      // Cannot make assumptions about a failed dispatch.
      var callbackACount = callbackA.callCount;

      dispatcher.dispatch({ shouldThrow : false }).then(function() {
        expect(callbackA.callCount).to.equal(callbackACount + 1);
        expect(callbackB.callCount).to.equal(1);
        done();
      });
    });
  });

  it('should properly unregister callbacks', function(done) {
    dispatcher.register(callbackA);

    var tokenB = dispatcher.register(callbackB);

    var payload = {};
    dispatcher.dispatch(payload).then(function() {
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.withArgs(payload).called);

      expect(callbackB.callCount).to.equal(1);
      expect(callbackB.withArgs(payload).called);

      dispatcher.unregister(tokenB);

      dispatcher.dispatch(payload).then(function() {
        expect(callbackA.callCount).to.equal(2);
        expect(callbackA.withArgs(payload).calledTwice);

        expect(callbackB.callCount).to.equal(1);

        done();
      });
    });
  });

  it('should queue events when dispatching a current event', function(done) {
    var dispatch1 = mysinon.spy();
    var dispatch2 = mysinon.spy();
    dispatcher.register(function(payload) {
      if (payload.type === 'initial') {
        payload.type = 'secondary';

        dispatcher.dispatch(payload).then(function() {
          expect(dispatch1.called).to.equal(true);
          expect(dispatch1.callCount).to.equal(1);
          expect(dispatcher._queued.length).to.equal(0);
          dispatch2();
          done();
        });

        expect(dispatcher._queued.length).to.equal(1);
      }
    });

    var payload = {
      type : 'initial'
    };

    dispatcher.dispatch(payload).then(function() {
      expect(dispatch2.called).to.equal(false);
      dispatch1();
    });
  });
});
