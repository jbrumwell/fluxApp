/* global describe, it, beforeEach */
import { expect } from 'chai';
import _fluxapp, { BaseActions, BaseStore } from '../../lib';

describe('Plugins', () => {
  let fluxapp;

  beforeEach(() => {
    fluxapp = _fluxapp.noConflict();
  });

  it('should be possible to retrieve plugin', () => {
    const plugin = {
      stores : {
        test : {},
      },
    };

    fluxapp.registerPlugin('test', plugin);

    expect(fluxapp.getPlugin('test')).to.be.a('object');
    expect(fluxapp.getPlugin('test')).to.equal(plugin);
  });

  it('should register multiple plugins', () => {
    fluxapp.registerPlugins({
      test : {
        contextMethods : {
          getTest() {},
        },
      },
      two : {
        contextMethods : {
          getTwo() {},
        },
      },
    });

    const context = fluxapp.createContext();

    expect(fluxapp.hasPlugin('test')).to.equal(true);
    expect(fluxapp.hasPlugin('two')).to.equal(true);
    expect(context.getTest).to.be.a('function');
    expect(context.getTwo).to.be.a('function');
  });

  it('should register stores passed', () => {
    const storeClass = class TestStore extends BaseStore {};

    fluxapp.registerPlugin('test', {
      stores : {
        test : storeClass,
      },
    });

    var stores = fluxapp.getStores();

    expect(stores.test).to.be.a('function');
  });

  it('should register actions passed', () => {
    const testActions = class TestActions extends BaseActions {
      test() {
        throw new Error('sync failure');
      }
    };

    fluxapp.registerPlugin('test', {
      actions : {
        test : testActions,
      },
    });

    const actions = fluxapp.getActions();

    expect(actions.test).to.be.a('function');
  });

  it('should register context methods passed', () => {
    fluxapp.registerPlugin('test', {
      contextMethods : {
        getTest() {},
      },
    });

    var context = fluxapp.createContext();

    expect(context.getTest).to.be.a('function');
  });

  it('should be possible to know if a plugin is registered', () => {
    fluxapp.registerPlugin('test', {
      contextMethods : {
        getTest() {},
      },
    });

    expect(fluxapp.hasPlugin('test')).to.equal(true);
  });

  it('should be possible to remove a plugin', () => {
    const testActions = class TestActions extends BaseActions {
      test() {
        throw new Error('sync failure');
      }
    };

    const storeClass = class TestStore extends BaseStore {};

    fluxapp.registerPlugin('test', {
      actions : {
        test : testActions,
      },

      stores : {
        test : storeClass,
      },

      contextMethods : {
        getTest() {},
      },
    });

    let stores = fluxapp.getStores();
    let actions = fluxapp.getActions();
    let context = fluxapp.createContext();

    expect(context.getTest).to.be.a('function');
    expect(actions.test).to.be.a('function');
    expect(stores.test).to.be.a('function');
    expect(fluxapp.hasPlugin('test')).to.equal(true);

    fluxapp.removePlugin('test');

    stores = fluxapp.getStores();
    actions = fluxapp.getActions();
    context = fluxapp.createContext();

    expect(context.getTest).to.be.a('undefined');
    expect(actions.test).to.be.a('undefined');
    expect(stores.test).to.be.a('undefined');
    expect(fluxapp.hasPlugin('test')).to.equal(false);
  });
});
