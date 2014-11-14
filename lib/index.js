'use strict';

var Dispatcher = require('flux').Dispatcher;

/**
 * Main module extry point
 */
function fluxApp() {
  this.dispatcher = new Dispatcher();
  this._stores = {};
  this._actions = {};
}

/**
 * Enables debugging of disptached information
 *
 * @return {fluxApp}
 */
fluxApp.prototype.debug = function debug() {
  this.getDispatcher().register(function debugDispatcher(payload) {
    console.log(payload.actionType, payload.payload);
  });

  return this;
};

/**
 * Create a store
 *
 * @param {String} name
 * @param {Object} spec
 */
fluxApp.prototype.createStore = function createStore(name, spec) {
  var createStore = require('./store');
  var store = createStore(name, spec);

  if (this._stores[ store.id ]) {
    throw new Error('fluxApp: store already registered under id "' + store.id + '"');
  }

  this._stores[ store.id ] = store;

  return store;
};

/**
 * Retrieve a store
 *
 * @param {Object|Null} name
 */
fluxApp.prototype.getStore = function getStore(name) {
  return this._stores[ name ];
};

/**
 * Get the dispatcher
 */
fluxApp.prototype.getDispatcher = function getDispatcher() {
  return this.dispatcher;
};

/**
 * Create actions and register them in fluxApp
 *
 * @param {String} namespace
 * @param {Object} handlers
 */
fluxApp.prototype.createActions = function createActions(namespace, handlers) {
  var createActions = require('./actions');

  if (! this._actions[ namespace ]) {
    this._actions[ namespace ] = createActions(namespace, handlers);
  } else {
    throw new Error('Actions with namespace ' + namespace + ' have already been initiated');
  }

  return this._actions[ namespace ];
};

/**
 * Converts string based action type to constant
 *
 * @param {String} input
 */
fluxApp.prototype.getActionType = function getActionType(input) {
  var namespaceTransform = require('../util/namespaceTransform');

  return namespaceTransform(input);
};

/**
 * Get a list of actions by namespace
 *
 * @param {String} namespace
 */
fluxApp.prototype.getActions = function getActions(namespace) {
  return this._actions[ namespace ];
};

/**
 * Dehydrates stores and returns the data they represent
 */
fluxApp.prototype._dehydrateStores = function _dehydrateStores() {
  var storeData = {};
  var stores = this._stores;

  Object.keys(stores).map(function dehydrateStore(id) {
    storeData[ id ] = stores[ id ].dehydrate();
  });

  return storeData;
};

/**
 * Dehydrate the fluxApp
 *
 * @return {Object}
 */
fluxApp.prototype.dehydrate = function dehydrate() {
  return {
     stores: this._dehydrateStores()
  };
};

/**
 * Rehydrate the stores with the given state
 *
 * @param {Object} storeData
 */
fluxApp.prototype._rehydrateStores = function _rehydrateStores(storeData) {
  var stores = this._stores;

  if (state.stores) {
    Object.keys(state.stores).forEach(function rehydrateStore(id) {
      stores[ id ].rehydrate(state.stores[ id ]);
    });
  }

  return this;
};

/**
 * Rehydrate the fluxapp
 *
 * @param  {Object} state
 * @return {fluxApp}
 */
fluxApp.prototype.rehydrate = function rehydrate(state) {
   if (state.stores) {
     this._rehydrateStores(state.stores);
   }

   return this;
};

var instance = new fluxApp();

/**
 * import the mixins for the app
 * 
 * @type {Object}
 */
instance.mixins = {
  component: require('./componentMixin')
};

module.exports = instance;
