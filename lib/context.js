'use strict';

var _ = require('lodash');
var Dispatcher = require('./dispatcher');

function FluxAppContext(fluxApp, contextMethods) {
  var self = this;

  contextMethods = contextMethods || {};

  this._bindEventHandlers();
  this.bindContextMethods(contextMethods);

  this.dispatcher = new Dispatcher();
  this._fluxApp = fluxApp;

  this._actions = _.mapValues(fluxApp.getActions(), function mapActions(Action) {
    return new Action(self);
  });

  this._stores = _.mapValues(fluxApp.getStores(), function mapStores(Store) {
    return new Store(self);
  });

  this._fluxApp.on('stores.add', this._onStoreAdd)
               .on('stores.remove', this._onStoreRemove)
               .on('actions.add', this._onActionAdd)
               .on('actions.remove', this._onActionRemove);
}

FluxAppContext.prototype._bindEventHandlers = function _bindEventHandlers() {
  this._onActionRemove = this._onActionRemove.bind(this);
  this._onActionAdd = this._onActionAdd.bind(this);
  this._onStoreRemove = this._onStoreRemove.bind(this);
  this._onStoreAdd = this._onStoreAdd.bind(this);
};

FluxAppContext.prototype._onStoreAdd = function _onStoreAdd(id, Store) {
  this._stores[id] = new Store(this);
};

FluxAppContext.prototype._onStoreRemove = function _onStoreRemove(id) {
  delete this._stores[id];
};

FluxAppContext.prototype._onActionAdd = function _onActionAdd(id, Action) {
  this._actions[id] = new Action(this);
};

FluxAppContext.prototype._onActionRemove = function _onActionRemove(id) {
  delete this._actions[id];
};

FluxAppContext.prototype.destroy = function destroy() {
  this._stores = {};
  this._actions = {};
  this.dispatcher = null;

  this._fluxApp.removeListener('stores.add', this._onStoreAdd)
               .removeListener('stores.remove', this._onStoreRemove)
               .removeListener('actions.add', this._onActionAdd)
               .removeListener('actions.remove', this._onActionRemove);
};

FluxAppContext.prototype.bindContextMethods = function bindContextMethods(methods) {
  var self = this;

  _.each(methods, function bindMethod(fn, key) {
    self[key] = fn.bind(self);
  });
};

FluxAppContext.prototype.getDispatcher = function getDispatcher() {
  return this.dispatcher;
};

FluxAppContext.prototype.registerErrorHandler = function registerErrorHandler(handler) {
  this.registerHandler('action.failed', handler);
};

FluxAppContext.prototype.registerHandler = function registerHandler(action, handler) {
  var dispatcher = this.getDispatcher();
  var actionType = this.getActionType(action);

  dispatcher.on(actionType, handler);

  return this;
};

FluxAppContext.prototype.unregisterHandler = function registerHandler(action, handler) {
  var dispatcher = this.getDispatcher();
  var actionType = this.getActionType(action);

  dispatcher.removeListener(actionType, handler);

  return this;
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
