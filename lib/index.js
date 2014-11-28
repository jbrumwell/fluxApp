'use strict';

var Dispatcher = require('./dispatcher');
var Router = require('./router');
var Promise = require('bluebird');


/**
 * Main module extry point
 */
function fluxApp() {
  this.dispatcher = new Dispatcher();
  this.router = new Router();
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

  if (-1 !== namespace.indexOf('.')) {
    throw new Error('fluxApp:actions namespaces cannot contain a period');
  }

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
 * Get fluxApp Router
 */
fluxApp.prototype.getRouter = function getRouter() {
  return this.router;
};

/**
 * Register our routes with the router
 * @param {Array} routes
 */
fluxApp.prototype.createRoutes = function createRoutes(routes) {
  routes.forEach(this.createRoute.bind(this));

  return this;
};

/**
 * Register a route with the router
 * @param {Object} route
 */
fluxApp.prototype.createRoute = function createRoute(route) {
  this.router.addRoute(route);

  return this;
};

/**
 * Return the matching route from the router
 *
 * @param {String} path
 * @param {Object} meta
 */
fluxApp.prototype.matchRoute = function matchRoute(path, meta) {
  var route = this.router.getRoute(path, meta);

  // Add a load handler if it is not present
  if (route && route.handler && !route.handler.load) {
    route.handler.load = function defaultLoadHandler() {
      return Promise.resolve();
    };
  }

  return route;
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
fluxApp.prototype._rehydrateStores = function _rehydrateStores(state) {
  var stores = this._stores;

  if (state) {
    Object.keys(state).forEach(function rehydrateStore(id) {
      stores[ id ].rehydrate(state[ id ]);
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
