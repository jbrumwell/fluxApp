/* global describe, it, afterEach */
'use strict';

var expect = require('chai').expect;
var Promise = require('bluebird');

describe('store', function() {
  var fluxApp = require('../../lib');

  function createStore(name, spec) {
    fluxApp.createStore(name, spec);

    return fluxApp.getStore(name);
  }

  afterEach(function() {
    Object.keys(fluxApp._stores).forEach(function destroyStore(id) {
      fluxApp.removeStore(id);
    });
  });

  it('should have a dehydrate method', function() {
    var store = createStore('testing');
    expect(store.dehydrate).to.be.a('function');
  });

  it('should have a rehydrate method', function() {
    var store = createStore('testing');
    expect(store.rehydrate).to.be.a('function');
  });

  it('should have a addChangeListener method', function() {
    var store = createStore('testing');
    expect(store.addChangeListener).to.be.a('function');
  });

  it('should have a removeChangeListener method', function() {
    var store = createStore('testing');
    expect(store.removeChangeListener).to.be.a('function');
  });

  it('should have a waitFor method', function() {
    var store = createStore('testing');
    expect(store.waitFor).to.be.a('function');
  });

  it('should obtain its initial state from getInitialState', function() {
    var store = createStore('exposed', {
      getInitialState : function() {
        return {
          something : 'else'
        };
      },

      getSomething : function() {
        return this.state.something;
      }
    });

    expect(store.state).to.be.a('object');
    expect(store.state.something).to.equal('else');
  });

  it('should expose getter methods provided', function() {
    var store = createStore('exposed', {
      getInitialState : function() {
        return {
          something : 'else'
        };
      },

      getSomething : function() {
        return this.state.something;
      }
    });

    expect(store.getSomething).to.be.a('function');
    expect(store.getSomething()).to.equal('else');
  });

  it('should emit a change event when state is changed', function(done) {
    var store = createStore('exposed', {
      getInitialState : function() {
        return {
          something : 'else'
        };
      },

      setSomething : function() {
        this.setState({
          something : 'new'
        });
      },

      getSomething : function() {
        return this.state.something;
      }
    });

    store.addChangeListener(function() {
      done();
    });

    store.setSomething();
  });

  it('should dehydrate its state', function() {
    var store = createStore('dehydrate', {
      getInitialState : function() {
        return {
          myState : 'is',
          always : 'here'
        };
      },

      toThere : function() {
        this.setState({
          always : 'there'
        });
      }
    });

    var state = store.dehydrate();

    expect(state.myState).to.equal('is');
    expect(state.always).to.equal('here');
  });

  it('once dehyrated store states should be empty', function() {
    var store = createStore('dehydrate', {
      getInitialState : function() {
        return {
          myState : 'is',
          always : 'here'
        };
      },

      toThere : function() {
        this.setState({
          always : 'there'
        });
      }
    });

    var state = store.dehydrate();

    expect(state.myState).to.equal('is');
    expect(state.always).to.equal('here');
    expect(store.state).to.be.empty();
  });

  it('should rehydrate the store with the supplied state', function() {
    var store = createStore('rehydrate', {
      actions : {
        onTestData : 'test.data'
      },

      onTestData : function onTestData(data) {
        this.setState(data);
      }
    });

    expect(store.state).to.be.a('object');
    expect(store.state).to.be.empty();

    store.rehydrate(
      [
        fluxApp.getActionType('test.data'),
        {
          now : 'string'
        }
      ]
    );

    expect(store.state).to.be.a('object');
    expect(store.state).to.not.be.empty();
    expect(store.state.now).to.equal('string');
  });

  it('should rehydrate from action result', function(done) {
    var store = createStore('actions', {
      actions : {
        onUserLogin : 'user.login'
      },

      onUserLogin : function(result, actionType) {
        fluxApp._actions = {};
        // jshint camelcase:false
        fluxApp.dispatcher.$Dispatcher_callbacks = {};
        // jshint camelcase:true
        this.setState(result);
      }
    });

    fluxApp.createActions('user', {
      login : function() {
        return {
          success : true
        };
      }
    });

    var actions = fluxApp.getActions('user');

    actions.login('user', 'password').then(function loginResult(result) {
      store.rehydrate(result);

      expect(store.state).to.have.property('success');
      expect(store.state.success).to.equal(true);
      done();
    });
  });

  it('should rehydrate from action result async', function(done) {
    var store = createStore('actions', {
      actions : {
        onUserLogin : 'user.login'
      },

      onUserLogin : function(result, actionType) {
        fluxApp._actions = {};
        // jshint camelcase:false
        fluxApp.dispatcher.$Dispatcher_callbacks = {};
        // jshint camelcase:true
        this.setState(result);
      }
    });

    fluxApp.createActions('user', {
      login : function() {
        return new Promise(function(resolve) {
          setImmediate(resolve.bind(resolve, {
            success : true
          }));
        });
      }
    });

    var actions = fluxApp.getActions('user');

    actions.login('user', 'password').then(function loginResult(result) {
      store.rehydrate(result);

      expect(store.state).to.have.property('success');
      expect(store.state.success).to.equal(true);
      done();
    });
  });

  it('should bind to actions provided', function(done) {
    createStore('actions', {
      actions : {
        onUserLogin : 'user.login'
      },

      onUserLogin : function(result, actionType) {
        expect(actionType).to.equal(fluxApp.getActionType('user.login'));
        expect(result.success).to.equal(true);
        fluxApp._actions = {};
        // jshint camelcase:false
        fluxApp.dispatcher.$Dispatcher_callbacks = {};
        // jshint camelcase:true
        done();
      }
    });

    fluxApp.createActions('user', {
      login : function() {
        return {
          success : true
        };
      }
    });

    var actions = fluxApp.getActions('user');

    actions.login('user', 'password');
  });

  it('should wait for specified stores to complete', function(done) {
    createStore('testStore', {
      actions : {
        onUserLogin : 'user.login'
      },

      onUserLogin : function(result, actionType) {
        this.setState({
          ran : true
        });
      }
    });

    createStore('actions', {
      actions : {
        onUserLogin : 'user.login'
      },

      onUserLogin : function(result, actionType) {
        var self = this;

        return this.waitFor('testStore').then(function() {
          var state = self.getStore('testStore').state;
          expect(state.ran).to.equal(true);
          expect(actionType).to.equal(fluxApp.getActionType('user.login'));
          expect(result.success).to.equal(true);
          fluxApp._actions = {};
          // jshint camelcase:false
          fluxApp.dispatcher.$Dispatcher_callbacks = {};
          // jshint camelcase:true
          done();
        });
      }
    });

    fluxApp.createActions('user', {
      login : function() {
        return {
          success : true
        };
      }
    });

    var actions = fluxApp.getActions('user');

    actions.login('user', 'password');
  });
});
