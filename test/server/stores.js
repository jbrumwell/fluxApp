'use strict';
var expect = require('chai').expect;

describe('store', function() {
  var fluxApp = require('../../lib');

  function createStore(name, spec) {
    fluxApp.createStore(name, spec);

    return fluxApp.getStore(name);
  }

  afterEach(function() {
    fluxApp._stores = {};
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

  it('should obtain its initial state from getInitialState', function() {
    var store = createStore('exposed', {
      getInitialState: function() {
        return {
          something: 'else'
        };
      },

      getSomething: function() {
        return this.state.something;
      }
    });

    expect(store.state).to.be.a('object');
    expect(store.state.something).to.equal('else');
  });

  it('should expose getter methods provided', function() {
    var store = createStore('exposed', {
      getInitialState: function() {
        return {
          something: 'else'
        };
      },

      getSomething: function() {
        return this.state.something;
      }
    });

    expect(store.getSomething).to.be.a('function');
    expect(store.getSomething()).to.equal('else');
  });

  it('should emit a change event when state is changed', function(done) {
    var store = createStore('exposed', {
      getInitialState: function() {
        return {
          something: 'else'
        };
      },

      setSomething: function() {
        this.setState({
          something: 'new'
        });
      },

      getSomething: function() {
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
      getInitialState: function() {
        return {
          myState: 'is',
          always: 'here'
        }
      },

      toThere: function() {
        this.setState({
          always: 'there'
        });
      }
    });

    var state = store.dehydrate();

    expect(state.myState).to.equal('is');
    expect(state.always).to.equal('here');

    store.toThere();

    expect(state.myState).to.equal('is');
    expect(state.always).to.equal('there');
  });

  it('should rehydrate the store with the supplied state', function() {
    var store = createStore('rehydrate');

    expect(store.state).to.be.a('object');
    expect(store.state).to.be.empty();

    store.rehydrate({
      now: 'string'
    });

    expect(store.state).to.be.a('object');
    expect(store.state).to.not.be.empty();
    expect(store.state.now).to.equal('string');
  });

  it('should bind to actions provided', function(done) {
    var store = createStore('actions', {
      actions: {
        onUserLogin: 'user.login'
      },

      onUserLogin: function(result, actionType) {
        expect(actionType).to.equal(fluxApp.getActionType('user.login'));
        expect(result.success).to.equal(true);
        fluxApp._actions = {};
        fluxApp.dispatcher.$Dispatcher_callbacks = {};
        done();
      }
    });

    fluxApp.createActions('user', {
      login: function() {
        return {
          success: true
        }
      }
    });

    var actions = fluxApp.getActions('user');

    actions.login('user', 'password');
  });
});
