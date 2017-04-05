/* global describe, afterEach, it */
import chai from 'chai';
import Promise from 'bluebird';
import fluxapp, { BaseActions } from '../../lib';

const expect = chai.expect;

describe('actions', () => {
  let context = fluxapp.createContext();

  let dispatcher = context.getDispatcher();

  function createActions(name, constructor) {
    fluxapp.registerActions(name, constructor);

    return context.getActions(name);
  }

  afterEach(function() {
    if (context) {
      context.destroy();
    }

    context = fluxapp.createContext();
    dispatcher = context.getDispatcher();

    fluxapp._actions = {};
  });

  it('should return a promise', (done) => {
    const actionClass = class TestActions extends BaseActions {
      method() {
        return 'syncing';
      }
    };

    const actions = createActions('test', actionClass);

    const promise = actions.method();

    expect(promise.then).to.be.a('function');

    promise.then(done.bind(null, null));
  });

  it('should emit the failed event when sync', (done) => {
    let dispatchId;
    const failedType = fluxapp.getActionType('test.method:failed');
    const beforeType = fluxapp.getActionType('test.method:before');

    const actionClass = class TestActions extends BaseActions {
      method() {
        throw new Error('sync failure');
      }
    };

    const actions = createActions('test', actionClass);

    function listener(result) {
      if (result.actionType === failedType) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(failedType);
        expect(result.payload.error.message).to.equal('sync failure');
        done();
      } else {
        expect(result.actionType).to.equal(beforeType);
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when sync', (done) => {
    let dispatchId;

    const actionClass = class TestActions extends BaseActions {
      method() {
        return 'sync';
      }
    };

    const actions = createActions('test', actionClass);

    const methodType = fluxapp.getActionType('test.method');
    const beforeType = fluxapp.getActionType('test.method:before');

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

  it('should emit pre event when async', (done) => {
    let dispatchId;

    const actionClass = class TestActions extends BaseActions {
      method() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            resolve('async');
          });
        });
      }
    };

    const actions = createActions('test', actionClass);

    function listener(result) {
      dispatcher.unregister(dispatchId);
      expect(result.actionType).to.equal(fluxapp.getActionType('test.method:before'));
      expect(result.payload).to.be.instanceof(Array);
      done();
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when async', (done) => {
    let dispatchId;
    const eventName = fluxapp.getActionType('test.method');

    const actionClass = class TestActions extends BaseActions {
      method() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            resolve('async');
          });
        });
      }
    };

    const actions = createActions('test', actionClass);

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

  it('should emit post event when async', (done) => {
    let dispatchId;
    const eventName = fluxapp.getActionType('test.method:after');

    const actionClass = class TestActions extends BaseActions {
      method() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            resolve('async success');
          });
        });
      }
    };

    const actions = createActions('test', actionClass);

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

  it('should emit the failed event when async', (done) => {
    let dispatchId;
    const eventName = fluxapp.getActionType('test.method:failed');

    const actionClass = class TestActions extends BaseActions {
      method() {
        return new Promise(function(resolve, reject) {
          setImmediate(function() {
            reject(new Error('async failure'));
          });
        });
      }
    };

    const actions = createActions('test', actionClass);

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

  it('should receive the parameters passed by component', (done) => {
    const actionClass = class TestActions extends BaseActions {
      parameters(a, b) {
        expect(a).to.equal('a');
        expect(b).to.equal('b');
        done();
      }
    };

    createActions('test', actionClass);

    context.getActions('test').parameters('a', 'b');
  });

  it('should resolve to an object of actionType = actionResponse', (done) => {
    const actionClass = class TestActions extends BaseActions {
      parameters(a, b) {
        expect(a).to.equal('a');
        expect(b).to.equal('b');
        return [ a, b ];
      }
    };

    createActions('test', actionClass);

    context.getActions('test').parameters('a', 'b').then((result) => {
      const actionType = fluxapp.getActionType('test.parameters');

      expect(result).to.be.a('object');
      expect(result.actionType).to.equal(actionType);
      expect(result.args).to.be.a('array');
      expect(result.args[0]).to.equal('a');
      expect(result.args[1]).to.equal('b');
      done();
    });
  });

  it('should resolve to an object of actionType = actionResponse async', (done) => {
    const actionClass = class TestActions extends BaseActions {
      method(a, b) {
        expect(a).to.equal('a');
        expect(b).to.equal('b');
        return new Promise(function(resolve) {
          setImmediate(resolve.bind(resolve, [ a, b ]));
        });
      }
    };

    createActions('test', actionClass);

    context.getActions('test').method('a', 'b').then((result) => {
      const actionType = fluxapp.getActionType('test.method');

      expect(result).to.be.a('object');
      expect(result.actionType).to.equal(actionType);
      expect(result.args).to.be.a('array');
      expect(result.args[0]).to.equal('a');
      expect(result.args[1]).to.equal('b');
      done();
    });
  });

  it('should return result object (success)', (done) => {
    const actionClass = class TestActions extends BaseActions {
      method(a, b) {
        expect(a).to.equal('a');
        expect(b).to.equal('b');
        return new Promise(function(resolve) {
          setImmediate(resolve.bind(resolve, [ 'c', 'd' ]));
        });
      }
    };

    createActions('test', actionClass);

    context.getActions('test').method('a', 'b').then((result) => {
      const actionType = fluxapp.getActionType('test.method');

      expect(result).to.be.a('object');

      expect(result).to.include.keys([
        'status',
        'error',
        'previousError',
        'response',
        'args',
        'namespace',
        'actionType',
      ]);
      expect(result.status).to.equal(1);
      expect(result.args).to.eql(['a', 'b']);
      expect(result.error).to.be.null;
      expect(result.previousError).to.be.null;
      expect(result.response).to.eql(['c', 'd']);
      expect(result.namespace).to.equal('test.method');
      expect(result.actionType).to.equal(actionType);

      done();
    });
  });
});
