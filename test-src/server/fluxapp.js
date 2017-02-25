/* global describe, it, after */
import { expect } from 'chai';
import fluxapp, { BaseStore } from '../../lib';

describe('fluxapp', () => {
  after(() => {
    Object.keys(fluxapp._stores).forEach((id) => {
      fluxapp.removeStore(id);
    });
  });

  it('should have a noConflict method', () => {
    expect(fluxapp.noConflict).to.be.a('function');
  });

  it('should have a registerPlugin method', () => {
    expect(fluxapp.registerPlugin).to.be.a('function');
  });

  it('should have a registerPlugins method', () => {
    expect(fluxapp.registerPlugins).to.be.a('function');
  });

  it('should have a removePlugin method', () => {
    expect(fluxapp.removePlugin).to.be.a('function');
  });

  it('should have a hasPlugin method', () => {
    expect(fluxapp.registerPlugin).to.be.a('function');
  });

  it('should have a createContext method', () => {
    expect(fluxapp.createContext).to.be.a('function');
  });

  it('should have a getStores method', () => {
    expect(fluxapp.getStores).to.be.a('function');
  });

  it('should have a removeStore method', () => {
    expect(fluxapp.removeStore).to.be.a('function');
  });

  it('should have a registerStore method', () => {
    expect(fluxapp.registerStore).to.be.a('function');
  });

  it('should have a registerStores method', () => {
    expect(fluxapp.registerStores).to.be.a('function');
  });

  it('should have a registerActions method', () => {
    expect(fluxapp.registerActions).to.be.a('function');
  });

  it('should have a getActionType method', () => {
    expect(fluxapp.getActionType).to.be.a('function');
  });

  it('should allow us to register a store', () => {
    const storeClass = class TestStore extends BaseStore {};

    fluxapp.registerStore('test', storeClass);

    expect(fluxapp._stores.test).to.be.a('function');
  });

  describe('context', () => {
    let context = fluxapp.createContext({
      getRouter() {},
    });

    it('should have a destroy method', () => {
      expect(context.destroy).to.be.a('function');
    });

    it('should allow custom methods', () => {
      expect(context.getRouter).to.be.a('function');
    });

    it('should have a removeActions method', () => {
      expect(context.removeActions).to.be.a('function');
    });

    it('should have a removeActions method', () => {
      expect(context.removeActions).to.be.a('function');
    });

    it('should have a getActions method', () => {
      expect(context.getActions).to.be.a('function');
    });

    it('should have a getAction method', () => {
      expect(context.getAction).to.be.a('function');
    });

    it('should have a removeStore method', () => {
      expect(context.removeStore).to.be.a('function');
    });

    it('should have a getStore method', () => {
      expect(context.getStore).to.be.a('function');
    });

    it('should have a getDispatcher method', () => {
      expect(context.getDispatcher).to.be.a('function');
    });

    it('should have a dehydrate method', () => {
      expect(context.dehydrate).to.be.a('function');
    });

    it('should have a rehydrate method', () => {
      expect(context.rehydrate).to.be.a('function');
    });

    it('should have a getActionType method', () => {
      expect(context.getActionType).to.be.a('function');
    });

    it('should rehydrate store state base on action', () => {
      const storeClass = class TestStore extends BaseStore {
        static actions = {
          onTest : 'test.test',
        }

        onTest(state) {
          this.setState(state);
        }
      };
      fluxapp.registerStore('name', storeClass);

      const store = context.getStore('name');
      let state = store.getState();

      expect(state).to.be.a('object');
      expect(state).to.be.empty;

      context.rehydrate({
        stores : {
          name : {
            now : 'string',
          },
        },
      });

      state = store.getState();

      expect(state).to.be.a('object');
      expect(state).to.not.be.empty;
      expect(state.now).to.equal('string');
    });

    it('should rehydrate store state base on context constructor', () => {
      context = fluxapp.createContext(null, {
        stores : {
          name : {
            now : 'string',
          },
        },
      });

      const store = context.getStore('name');
      const state = store.getState();

      expect(state).to.be.a('object');
      expect(state).to.not.be.empty;
      expect(state.now).to.equal('string');
    });

    it('should throw if used after being destroyed', () => {
      context = fluxapp.createContext();

      context.destroy();

      expect(context.removeActions).to.throw(Error);
      expect(context.removeAction).to.throw(Error);
      expect(context.getActions).to.throw(Error);
      expect(context.getAction).to.throw(Error);
      expect(context.removeStore).to.throw(Error);
      expect(context.getStore).to.throw(Error);
      expect(context.getActionType).to.throw(Error);
      expect(context.getDispatcher).to.throw(Error);
      expect(context.dehydrate).to.throw(Error);
      expect(context.rehydrate).to.throw(Error);
      expect(context.destroy.bind(context)).to.not.throw(Error);
    });

    it('should throw custom method, if used after being destroyed', () => {
      context = fluxapp.createContext({
        getRouter() {},
      });

      context.destroy();

      expect(context.getRouter).to.throw(Error);
    });
  });
});
