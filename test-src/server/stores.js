/* global describe, it, afterEach, beforeEach */

import { expect } from 'chai';
import Promise from 'bluebird';
import fluxapp, { BaseActions, BaseStore } from '../../lib';


describe('store', () => {
  let context = fluxapp.createContext();

  function createStore(name, store) {
    fluxapp.registerStore(name, store);

    return context.getStore(name);
  }

  beforeEach(() => {
    if (context) {
      context.destroy();
    }

    context = fluxapp.createContext();
  });

  afterEach(() => {
    Object.keys(fluxapp._stores).forEach((id) => {
      fluxapp.removeStore(id);
    });

    fluxapp._actions = {};
  });

  it('should have a dehydrate method', () => {
    const storeClass = class TestStore extends BaseStore {};
    const store = createStore('testing', storeClass);
    expect(store.dehydrate).to.be.a('function');
  });

  it('should have a rehydrate method', () => {
    const storeClass = class TestStore extends BaseStore {};
    const store = createStore('testing', storeClass);
    expect(store.rehydrate).to.be.a('function');
  });

  it('should have a addChangeListener method', () => {
    const storeClass = class TestStore extends BaseStore {};
    const store = createStore('testing', storeClass);
    expect(store.addChangeListener).to.be.a('function');
  });

  it('should have a removeChangeListener method', () => {
    const storeClass = class TestStore extends BaseStore {};
    const store = createStore('testing', storeClass);
    expect(store.removeChangeListener).to.be.a('function');
  });

  it('should have a waitFor method', () => {
    const storeClass = class TestStore extends BaseStore {};
    const store = createStore('testing', storeClass);
    expect(store.waitFor).to.be.a('function');
  });

  it('should obtain its initial state from getInitialState', () => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          something : 'else',
        };
      }

      getSomething() {
        return this.state.something;
      }
    };
    const store = createStore('exposed', storeClass);

    const state = store.getState();

    expect(state).to.be.a('object');
    expect(state.something).to.equal('else');
  });

  it('should have an immutable state', () => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          something : 'else',
        };
      }

      getSomething() {
        return this.state.something;
      }
    };
    const store = createStore('exposed', storeClass);

    const state = store.getState();

    expect(state).to.be.a('object');
    expect(state.something).to.equal('else');
    expect(store.state.something).to.equal('else');

    expect(() => {
      state.something = 'then';
    }).to.throw(Error);

  });

  it('should be mutable when called with getMutableState', () => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          something : 'else',
        };
      }

      getSomething() {
        return this.state.something;
      }
    };
    const store = createStore('exposed', storeClass);

    const state = store.getMutableState();

    expect(state).to.be.a('object');
    expect(state.something).to.equal('else');
    expect(store.state.something).to.equal('else');

    state.something = 'then';

    expect(store.state.something).to.equal('else');
    expect(state.something).to.equal('then');
  });

  it('should expose getter methods provided', () => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          something : 'else',
        };
      }

      getSomething() {
        return this.state.something;
      }
    };
    const store = createStore('exposed', storeClass);

    expect(store.getSomething).to.be.a('function');
    expect(store.getSomething()).to.equal('else');
  });

  it('should emit a change event when state is changed', (done) => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          something : 'else',
        };
      }

      setSomething() {
        this.setState({
          something : 'new',
        });
      }

      getSomething() {
        return this.state.something;
      }
    };
    const store = createStore('exposed', storeClass);

    store.addChangeListener(function() {
      done();
    });

    store.setSomething();
  });

  it('should emit a change event with state and store', (done) => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          something : 'else',
        };
      }

      setSomething() {
        this.setState({
          something : 'new',
        });
      }

      getSomething() {
        return this.state.something;
      }
    };
    const store = createStore('exposed', storeClass);

    store.addChangeListener((state, storeInstance) => {
      expect(state.something).to.equal('new');
      expect(storeInstance instanceof storeClass).to.equal(true);
      done();
    });

    store.setSomething();
  });

  it('should dehydrate to false if unchanged', () => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          myState : 'is',
          always : 'here',
        };
      }
    };
    const store = createStore('exposed', storeClass);

    const state = store.dehydrate();

    expect(state).to.equal(false);
  });

  it('should dehydrate its state', () => {
    const storeClass = class TestStore extends BaseStore {
      getInitialState() {
        return {
          myState : 'is',
          always : 'here',
        };
      }

      toThere() {
        this.setState({
          always : 'there',
        });
      }
    };
    const store = createStore('dehydrate', storeClass);

    store.toThere();

    const state = store.dehydrate();

    expect(state.myState).to.equal('is');
    expect(state.always).to.equal('there');
  });

  it('should rehydrate the store with the supplied state', () => {
    const storeClass = class TestStore extends BaseStore {
      static actions = {
        onTestData : 'test.data',
      }

      onTestData(data) {
        this.setState(data);
      }
    };
    const store = createStore('rehydrate', storeClass);

    let state = store.getState();

    expect(state).to.be.a('object');
    expect(state).to.be.empty();

    store.rehydrate({
      now : 'string',
    });

    state = store.getState();

    expect(state).to.be.a('object');
    expect(state).to.not.be.empty();
    expect(state.now).to.equal('string');
  });

  it('should rehydrate from action result', function(done) {
    const storeClass = class TestStore extends BaseStore {
      static actions = {
        onUserLogin : 'user.login',
      }

      onUserLogin(result, actionType) {
        this.setState(result);
      }
    };
    const store = createStore('action', storeClass);

    const actionClass = class TestActions extends BaseActions {
      login() {
        return {
          success : true,
        };
      }
    };

    fluxapp.registerActions('user', actionClass);

    const actions = context.getActions('user');

    actions.login('user', 'password').then(() => {
      store.rehydrate(
        store.dehydrate()
      );

      const state = store.getState();

      expect(state).to.have.property('success');
      expect(state.success).to.equal(true);
      done();
    });
  });

  it('should rehydrate from action result async', (done) => {
    const storeClass = class TestStore extends BaseStore {
      static actions = {
        onUserLogin : 'user.login',
      }

      onUserLogin(result, actionType) {
        this.setState(result);
      }
    };
    const store = createStore('action', storeClass);

    const actionClass = class TestActions extends BaseActions {
      login() {
        return new Promise(function(resolve) {
          setImmediate(resolve.bind(resolve, {
            success : true,
          }));
        });
      }
    };

    fluxapp.registerActions('user', actionClass);

    const actions = context.getActions('user');

    actions.login('user', 'password').then(function loginResult() {
      store.rehydrate(
        store.dehydrate()
      );

      const state = store.getState();

      expect(state).to.have.property('success');
      expect(state.success).to.equal(true);
      done();
    });
  });

  it('should bind to actions provided', (done) => {
    const storeClass = class TestStore extends BaseStore {
      static actions = {
        onUserLogin : 'user.login',
      }

      onUserLogin(result, actionType) {
        expect(actionType).to.equal(fluxapp.getActionType('user.login'));
        expect(result.success).to.equal(true);
        done();
      }
    };
    createStore('actions', storeClass);

    const actionClass = class TestActions extends BaseActions {
      login() {
        return {
          success : true,
        };
      }
    };

    fluxapp.registerActions('user', actionClass);

    const actions = context.getActions('user');

    actions.login('user', 'password');
  });

  it('should wait for specified stores to complete', (done) => {
    const storeClass1 = class TestStore extends BaseStore {
      static actions = {
        onUserLogin : 'user.login',
      }

      onUserLogin(result, actionType) {
        this.setState({
          ran : true,
        });
      }
    };

    const storeClass2 = class TestStore extends BaseStore {
      static actions = {
        onUserLogin : 'user.login',
      }

      onUserLogin(result, actionType) {
        return this.waitFor('testStore').then(() => {
          const state = this.getStore('testStore').getState();
          expect(state.ran).to.equal(true);
          expect(actionType).to.equal(fluxapp.getActionType('user.login'));
          expect(result.success).to.equal(true);
          done();
        });
      }
    };

    createStore('testStore', storeClass1);
    createStore('actions', storeClass2);

    const actionClass = class TestActions extends BaseActions {
      login() {
        return {
          success : true,
        };
      }
    };

    fluxapp.registerActions('user', actionClass);

    const actions = context.getActions('user');

    actions.login('user', 'password');
  });
});
