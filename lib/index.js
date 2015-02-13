'use strict';

var Dispatcher = require('./dispatcher');
var Router = require('./router');
var Promise = require('bluebird');

/**
 * Main module extry point
 */
function FluxApp() {
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
FluxApp.prototype.debug = function debug() {
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
FluxApp.prototype.createStore = function createStore(name, spec) {
  var creator = require('./store');
  var store = creator(name, spec);

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
FluxApp.prototype.getStore = function getStore(name) {
  return this._stores[ name ];
};

/**
 * Remove a store from the fluxapp module
 *
 * @param {String} name
 */
FluxApp.prototype.removeStore = function removeStore(name) {
  var store = this.getStore(name);
  var dispatcher = this.getDispatcher();

  if (store) {
    dispatcher.unregister(store.dispatchToken);
  }

  delete this._stores[ name ];

  store.destroy();

  return this;
};

/**
 * Get the dispatcher
 */
FluxApp.prototype.getDispatcher = function getDispatcher() {
  return this.dispatcher;
};

/**
 * Create actions and register them in fluxApp
 *
 * @param {String} namespace
 * @param {Object} handlers
 */
FluxApp.prototype.createActions = function createActions(namespace, handlers) {
  var creator = require('./actions');

  if (-1 !== namespace.indexOf('.')) {
    throw new Error('fluxApp:actions namespaces cannot contain a period');
  }

  if (! this._actions[ namespace ]) {
    this._actions[ namespace ] = creator(namespace, handlers);
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
FluxApp.prototype.getActionType = function getActionType(input) {
  var namespaceTransform = require('../util/namespaceTransform');

  return namespaceTransform(input);
};

/**
 * Get a list of actions by namespace
 *
 * @param {String} namespace
 */
FluxApp.prototype.getActions = function getActions(namespace) {
  return this._actions[ namespace ];
};

/**
 * Get fluxApp Router
 */
FluxApp.prototype.getRouter = function getRouter() {
  return this.router;
};

/**
 * Register our routes with the router
 * @param {Array} routes
 */
FluxApp.prototype.createRoutes = function createRoutes(routes) {
  routes.forEach(this.createRoute.bind(this));

  return this;
};

/**
 * Register a route with the router
 * @param {Object} route
 */
FluxApp.prototype.createRoute = function createRoute(route) {
  this.router.addRoute(route);

  return this;
};

/**
 * Return the matching route from the router
 *
 * @param {String} path
 * @param {Object} meta
 */
FluxApp.prototype.matchRoute = function matchRoute(path, meta) {
  var route = this.router.getRoute(path, meta);

  // Add a load handler if it is not present
  if (route && route.handler && ! route.handler.load) {
    route.handler.load = function defaultLoadHandler() {
      return Promise.resolve();
    };
  }

  return route;
};

/*
 * Dehydrates stores and returns the data they represent
 */
FluxApp.prototype._dehydrateStores = function _dehydrateStores() {
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
FluxApp.prototype.dehydrate = function dehydrate() {
  return {
     stores : this._dehydrateStores()
  };
};

/*
 * Rehydrate the stores with the given state
 *
 * @param {Object} state
 */
FluxApp.prototype._rehydrateStores = function _rehydrateStores(state) {
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
FluxApp.prototype.rehydrate = function rehydrate(state) {
  if (state.stores) {
    this._rehydrateStores(state.stores);
  }

  return this;
};

FluxApp.prototype.setPlatform = function setPlatform(platform, options) {
  if (platform === 'browser') {
    require('./platforms/browser')(this, options);
  } else if (platform === 'node') {
    require('./platforms/node')(this, options);
  } else {
    throw new Error('Platform ' + platform + ' is not recognized');
  }
};

var instance = new FluxApp();

/**
 * import the mixins for the app
 *
 * @type {Object}
 */
instance.mixins = {
  component : require('./componentMixin')
};

module.exports = instance;
