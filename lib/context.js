'use strict';

var _ = require('lodash');
var Dispatcher = require('./dispatcher');

function FluxAppContext(fluxApp, contextMethods) {
  var self = this;

  contextMethods = contextMethods || {};

  this.bindContextMethods(contextMethods);

  this.dispatcher = new Dispatcher();
  this._fluxApp = fluxApp;

  this._actions = _.mapValues(fluxApp.getActions(), function(Action) {
    return new Action(self);
  });

  this._stores = _.mapValues(fluxApp.getStores(), function(Store) {
    return new Store(self);
  });

  this._fluxApp.on('stores.add', function(id, Store) {
    self._stores[id] = new Store(self);
  });

  this._fluxApp.on('stores.remove', function(id) {
    delete self._stores[id];
  });

  this._fluxApp.on('actions.add', function(id, Action) {
    self._actions[id] = new Action(self);
  });

  this._fluxApp.on('actions.remove', function(id) {
    delete self._actions[id];
  });
}

FluxAppContext.prototype.bindContextMethods = function bindContextMethods(methods) {
  var self = this;

  _.each(methods, function bindMethod(fn, key) {
    self[key] = fn.bind(self);
  });
};

FluxAppContext.prototype.getDispatcher = function getDispatcher() {
  return this.dispatcher;
};

/**
 * Converts string based action type to constant
 *
 * @param {String} input
 */
FluxAppContext.prototype.getActionType = function getActionType(input) {
  return this._fluxApp.getActionType(input);
};

/**
 * Retrieve a store
 *
 * @param {Object|Null} name
 */
FluxAppContext.prototype.getStore = function getStore(name) {
  var store = this._stores[name];

  if (! store) {
    throw new Error('fluxApp: Could not locate store by the name ' + name);
  }

  return store;
};

/**
 * Remove a store from the context
 *
 * @param {String} name
 */
FluxAppContext.prototype.removeStore = function removeStore(name) {
  var store = this.getStore(name);
  var dispatcher = this.getDispatcher();

  if (store) {
    dispatcher.unregister(store.dispatchToken);

    delete this._stores[ name ];

    store.destroy();
  }

  return this;
};

/**
 * Get an of actions by namespace and method name
 *
 * @param {String} namespace
 * @param {String} method
 */
FluxAppContext.prototype.getAction = function getAction(namespace, method) {
  var actions = this._actions[ namespace ];

  return actions[ method ].bind(actions);
};

/**
 * Get a list of actions by namespace
 *
 * @param {String} namespace
 */
FluxAppContext.prototype.getActions = function getActions(namespace) {
  return this._actions[ namespace ];
};

/**
 * Remove action namespace
 *
 * @param {String} namespace
 */
FluxAppContext.prototype.removeActions = function removeActions(namespace) {
  delete this._actions[ namespace ];

  return this;
};

/**
 * Remove action from namespace
 *
 * @param {String} namespace
 * @param {string} method
 */
FluxAppContext.prototype.removeAction = function removeAction(namespace, method) {
  delete this._actions[ namespace ][ method ];
};

/**
 * Dehydrate Stores
 *
 * @return {Object}
 */
FluxAppContext.prototype._dehydrateStores = function _dehydrateStores() {
  var storeData = {};
  var stores = this._stores;

  Object.keys(stores).map(function dehydrateStore(id) {
    var state = stores[ id ].dehydrate();

    if (state) {
      storeData[ id ] = state;
    }
  });

  return storeData;
};

/**
 * Dehydrate Context
 *
 * @return {fluxAppContext}
 */
FluxAppContext.prototype.dehydrate = function dehydrate() {
  return {
     stores : this._dehydrateStores()
  };
};

/*
 * Rehydrate the stores with the given state
 *
 * @param {Object} state
 */
 FluxAppContext.prototype._rehydrateStores = function _rehydrateStores(state) {
  var stores = this._stores;

  if (state) {
    Object.keys(state).forEach(function rehydrateStore(id) {
      stores[ id ].rehydrate(state[ id ]);
    });
  }

  return this;
};

/**
 * Rehydrate Context
 *
 * @param  {Object} state
 * @return {fluxAppContext}
 */
 FluxAppContext.prototype.rehydrate = function rehydrate(state) {
  if (state.stores) {
    this._rehydrateStores(state.stores);
  }

  return this;
};

module.exports = FluxAppContext;
