'use strict';

var Promise = require('bluebird');
var Context = require('./context');
var _ = require('lodash');
var utils = require('util');
var EventEmitter = require('events').EventEmitter;
var React = require('react');
var Router = require('./router');

/**
 * Fluxapp Module
 */
function FluxApp() {
  this._stores = {};
  this._actions = {};

  this.router = new Router(this);

  this._contextTypes = {
    fluxApp: React.PropTypes.object.isRequired
  };

  EventEmitter.call(this);

  this.setMaxListeners(0);
}

utils.inherits(FluxApp, EventEmitter);

/**
 * Get a new instance of fluxapp
 */
FluxApp.getInstance = function getInstance() {
  var instance = new FluxApp();

  /**
   * import the mixins for the app
   *
   * @type {Object}
   */
  instance.mixins = {
    component : require('./componentMixin')
  };

  return instance;
};

FluxApp.prototype.request = function request(route, options) {
  var react = require('react');

  var self = this;
  var componentClass = route.handler;
  var Component = react.createFactory(componentClass);
  var context = this.createContext(options);

  return componentClass.load(route, context).then(function handleRequest() {
    navigateAway(context);

    var state = context.dehydrate();

    // populate the stores with the data returned from the loader
    self.rehydrate(state);

    var page = react.renderToString(Component()); // jshint ignore:line

    var payload = {
      state : JSON.stringify(state),
      page : page
    };

    return payload;
  })
  .catch(function (e) {
    if (e.then) {
      return e.then(R.partial(navigateAway, context, e));
    }

    throw e;
  });
};

FluxApp.prototype.createWrapper = function createWrapper(route, contextMethods) {
  contextMethods = contextMethods || {};

  var Component = route.handler;
  var context = contextMethods.context || this.createContext(contextMethods);

  return React.createClass({
    statics: {
      load: function routeLoader() {
        return route.loader(route, context).then(function returnContext() {
          return context;
        });
      },

      getContext: function getContext() {
        return context;
      },
    },

    childContextTypes: {
      fluxApp: React.PropTypes.object.isRequired,
    },

    getChildContext: function() {
      return {
        fluxApp: context,
      };
    },

    render: function() {
      return React.createElement(Component, null);
    }
  });
};

/**
 * Register a store
 *
 * @param {String} name
 * @param {Object} spec
 */
FluxApp.prototype.registerStore = function registerStore(name, spec) {
  var creator = require('./store');
  var store = creator(name, spec);

  if (this._stores[ name ]) {
    throw new Error('fluxApp: store already registered under id "' + store.id + '"');
  }

  this._stores[ name ] = store;

  this.emit('stores.add', name, store);

  return this;
};

/**
 * Get a list of registered stores
 */
FluxApp.prototype.getStores = function getStores() {
  return this._stores;
};

FluxApp.prototype.hasStore = function hasStore(name) {
  return this._stores[name];
};

/**
 * Register a stores
 *
 * @param {Object} stores
 */
FluxApp.prototype.registerStores = function registerStores(stores) {
  var self = this;

  _.forIn(stores, function register(value, key) {
    self.registerStore(key, value);
  });

  return this;
};

/**
 * Remove a store from the fluxapp module
 *
 * @param {String} name
 */
FluxApp.prototype.removeStore = function removeStore(name) {
  delete this._stores[ name ];
  this.emit('stores.remove', name);

  return this;
};

/**
 * Create actions and register them in fluxApp
 *
 * @param {String} namespace
 * @param {Object} handlers
 */
FluxApp.prototype.registerActions = function registerActions(namespace, handlers) {
  var creator = require('./actions');

  if (-1 !== namespace.indexOf('.')) {
    throw new Error('fluxApp:actions namespaces cannot contain a period');
  }

  if (! this._actions[ namespace ]) {
    this._actions[ namespace ] = creator(namespace, handlers);
  } else {
    throw new Error('Actions with namespace ' + namespace + ' have already been initiated');
  }

  this.emit('actions.add', namespace, this._actions[ namespace ]);

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
 * Get a list of actions
 */
FluxApp.prototype.getActions = function getActions() {
  return this._actions;
};

FluxApp.prototype.getRouter = function getRouter() {
  return this.router;
};

/**
 * Remove action namespace
 *
 * @param {String} namespace
 */
FluxApp.prototype.removeActions = function removeActions(namespace) {
  delete this._actions[ namespace ];
  this.emit('actions.remove', namespace);

  return this;
};

/**
 * Register our routes with the router
 * @param {Array} routes
 */
FluxApp.prototype.registerRoutes = function registerRoutes(routes) {
  routes.forEach(this.registerRoute.bind(this));

  return this;
};

/**
 * Register a route with the router
 * @param {Object} route
 */
FluxApp.prototype.registerRoute = function registerRoute(route) {
  this.router.addRoute(route);

  this.emit('routes.add', route);

  return this;
};

FluxApp.prototype.createContext = function createContext(contextMethods) {
  return new Context(this, contextMethods || {});
};



module.exports = FluxApp.getInstance();
