'use strict';

var _ = require('lodash');
var Dispatcher = require('./dispatcher');
var Promise = require('bluebird');
var React = require('react');
var ReactDOM;
var ReactDOMServer;

try {
  ReactDOM = require('react-dom');
  ReactDOMServer = require('react-dom/server');
} catch (e) {
  ReactDOM = React;
  ReactDOMServer = React;
}

function FluxAppContext(fluxApp, contextMethods, state) {
  var self = this;

  contextMethods = contextMethods || {};

  this._bindEventHandlers();
  this.bindContextMethods(contextMethods);

  this.dispatcher = new Dispatcher();
  this._dispatchToken = null;
  this._fluxApp = fluxApp;

  this._actions = _.mapValues(fluxApp.getActions(), function mapActions(Action, namespace) {
    return new Action(namespace, self);
  });

  this._stores = _.mapValues(fluxApp.getStores(), function mapStores(Store) {
    return new Store(self);
  });

  this._fluxApp.on('stores.add', this._onStoreAdd).on('stores.remove', this._onStoreRemove).on('actions.add', this._onActionAdd).on('actions.remove', this._onActionRemove);

  if (state) {
    this.rehydrate(state);
  }

  this.wrapper = fluxApp.createWrapper();

  this.destroyed = false;
}

/**
* Check if the context is alive or destroyed
*
* @param {String} name method which was called on the context
*/
FluxAppContext.prototype.aliveCheck = function aliveCheck(name) {
  if (this.destroyed === true) {
    name = name || 'Uknown';

    throw new Error('Fluxapp: Context#' + name + ' called after being destroyed');
  }
};

/**
* Binds the event handlers to context
*/
FluxAppContext.prototype._bindEventHandlers = function _bindEventHandlers() {
  this._onActionRemove = this._onActionRemove.bind(this);
  this._onActionAdd = this._onActionAdd.bind(this);
  this._onStoreRemove = this._onStoreRemove.bind(this);
  this._onStoreAdd = this._onStoreAdd.bind(this);
};

/**
* Event handler when a store is added to fluxapp
*
* @param {String} id    Store name
* @param {Class} Store Store constructor
*/
FluxAppContext.prototype._onStoreAdd = function _onStoreAdd(id, Store) {
  this._stores[id] = new Store(this);
};

/**
* Event Handler when a store is removed from fluxapp
*
* @param {String} id store name
*/
FluxAppContext.prototype._onStoreRemove = function _onStoreRemove(id) {
  delete this._stores[id];
};

/**
* Event Handler when actions are added to fluxapp
*
* @param {String} id     namespace
* @param {Class} Action constructor for the actions
*/
FluxAppContext.prototype._onActionAdd = function _onActionAdd(namespace, Action) {
  this._actions[namespace] = new Action(namespace, this);
};

/**
* Event handler, when action is removed from fluxapp
*
* @param {String} id action namespace
*/
FluxAppContext.prototype._onActionRemove = function _onActionRemove(id) {
  delete this._actions[id];
};

/**
* Destroy the context
*/
FluxAppContext.prototype.destroy = function destroy() {
  this._stores = {};
  this._actions = {};
  this.dispatcher = null;
  this.destroyed = true;

  if (this._fluxApp) {
    this._fluxApp.removeListener('stores.add', this._onStoreAdd).removeListener('stores.remove', this._onStoreRemove).removeListener('actions.add', this._onActionAdd).removeListener('actions.remove', this._onActionRemove);

    this._fluxApp = null;
  }
};

/**
* Bind the custom context methods to the context
*
* @param {Object} methods
*/
FluxAppContext.prototype.bindContextMethods = function bindContextMethods(methods) {
  var self = this;

  _.each(methods, function bindMethod(fn, key) {
    self[key] = function () {
      self.aliveCheck(key);

      return fn.apply(self, arguments);
    };
  });
};

/**
* Get the contexts dispatcher
*/
FluxAppContext.prototype.getDispatcher = function getDispatcher() {
  this.aliveCheck('getDispatcher');

  return this.dispatcher;
};

/**
* Converts string based action type to constant
*
* @param {String} input
*/
FluxAppContext.prototype.getActionType = function getActionType(input) {
  this.aliveCheck('getActionType(' + input + ')');

  return this._fluxApp.getActionType(input);
};

/**
* Retrieve a store
*
* @param {Object|Null} name
*/
FluxAppContext.prototype.getStore = function getStore(name) {
  this.aliveCheck('getStore(' + name + ')');

  var store = this._stores[name];

  if (!store) {
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
  this.aliveCheck('removeStore(' + name + ')');

  var store = this.getStore(name);
  var dispatcher = this.getDispatcher();

  if (store) {
    dispatcher.unregister(store.dispatchToken);

    delete this._stores[name];

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
  this.aliveCheck('getAction(' + namespace + ', ' + method + ')');

  var actions = this._actions[namespace];

  return actions[method].bind(actions);
};

/**
* Get a list of actions by namespace
*
* @param {String} namespace
*/
FluxAppContext.prototype.getActions = function getActions(namespace) {
  this.aliveCheck('getActions(' + namespace + ')');

  return this._actions[namespace];
};

/**
* Remove action namespace
*
* @param {String} namespace
*/
FluxAppContext.prototype.removeActions = function removeActions(namespace) {
  this.aliveCheck('removeActions(' + namespace + ')');

  delete this._actions[namespace];

  return this;
};

/**
* Remove action from namespace
*
* @param {String} namespace
* @param {string} method
*/
FluxAppContext.prototype.removeAction = function removeAction(namespace, method) {
  this.aliveCheck('removeAction(' + namespace + ', ' + method + ')');
  delete this._actions[namespace][method];
};

/**
 * Set the wrapper used in getPageContext
 * @param {Object} wrapper React Class
 */
FluxAppContext.prototype.setWrapper = function setWrapper(wrapper) {
  this.wrapper = wrapper;

  return this;
};

/**
 * Get the wrapper
 *
 * @return {Object} React Class
 */
FluxAppContext.prototype.getWrapper = function getWrapper() {
  return this.wrapper;
};

/**
 * Bootstraps the page context
 *
 * @param  {Object} request Route Request object
 * @param  {Object} options Options for the context generator
 * @return {Object}         Page Component, State and method
 */
FluxAppContext.prototype._getPageContext = function _getPageContext(request, options) {
  var self = this;
  var router = this._fluxApp.getRouter();
  var route = router.getRouteById(request.routeId);

  if (_.isObject(options.state)) {
    this.rehydrate(options.state);
  }

  options.props = _.assign({}, options.props, {
    handler: route.handler,
    context: this,
    params: request.params,
    query: request.query,
    request: request
  });

  options.wait = options.dehydrate ? true : !!options.wait;

  return new Promise(function prepareContext(resolve, reject) {
    var Element = React.createElement(self.getWrapper(), options.props);
    var result;

    if (options.dehydrate || !options.state) {
      result = route.loader(request, self).then(function () {
        return {
          element: Element,
          state: options.dehydrate ? self.dehydrate() : {},
          method: options.method
        };
      });
    }

    if (!result || !options.wait) {
      result = Promise.resolve({
        element: Element,
        state: options.dehydrate ? self.dehydrate() : {},
        method: options.method
      });
    }

    resolve(result);
  });
};

/**
 * Gets the request object and initiates the page context generator
 *
 * @param  {String|Object} path    url string or request object
 * @param  {Object} options The page generation options
 * @return {Promise}
 */
FluxAppContext.prototype.getPageContext = function getPageContext(path, options) {
  this.aliveCheck('render()');

  var router = this._fluxApp.getRouter();
  var requestOptions = _.pick(options, 'method');
  var request = _.isString(path) ? router.build(path, requestOptions) : path;

  return request ? this._getPageContext(request, options || {}) : Promise.resolve({
    element: false,
    state: {}
  });
};

/**
 * Generates page contexts and renders to string
 *
 * @param  {String|Object} path    url string or request object
 * @param  {Object} options The page generation options
 * @return {Promise}
 */
FluxAppContext.prototype.renderToString = function renderToString(path, options) {
  var self = this;

  return this.getPageContext(path, options).then(function _renderToString(page) {
    if (page && page.element) {
      page.element = ReactDOMServer.renderToString(page.element);
      self.destroy();
    }

    return page;
  });
};

/**
 * Generates page contexts and renders to string
 *
 * @param  {String|Object} path    url string or request object
 * @param  {Object} options The page generation options
 * @return {Promise}
 */
FluxAppContext.prototype.render = function render(path, options) {
  return this.getPageContext(path, options).then(function _render(page) {
    if (page && page.element) {
      ReactDOM.render(page.element, options.container);
    }

    return page;
  });
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
    var state = stores[id].dehydrate();

    if (state) {
      storeData[id] = state;
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
  this.aliveCheck('dehydrate()');

  return {
    stores: this._dehydrateStores()
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
      stores[id].rehydrate(state[id]);
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
  this.aliveCheck('rehydrate()');

  if (state.stores) {
    this._rehydrateStores(state.stores);
  }

  return this;
};

module.exports = FluxAppContext;