'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dispatcher = require('./dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var ReactDOM = _react2['default'];
var ReactDOMServer = _react2['default'];

var FluxAppContext = (function () {
  function FluxAppContext(fluxApp, contextMethods, state) {
    var _this = this;

    if (contextMethods === undefined) contextMethods = {};

    _classCallCheck(this, FluxAppContext);

    this._bindEventHandlers();
    this.bindContextMethods(contextMethods);

    this.dispatcher = new _dispatcher2['default']();
    this._dispatchToken = null;
    this._fluxApp = fluxApp;

    this._actions = _lodash2['default'].mapValues(fluxApp.getActions(), function (Action, namespace) {
      return new Action(namespace, _this);
    });

    this._stores = _lodash2['default'].mapValues(fluxApp.getStores(), function (Store) {
      return new Store(_this);
    });

    this._fluxApp.on('stores.add', this._onStoreAdd).on('stores.remove', this._onStoreRemove).on('actions.add', this._onActionAdd).on('actions.remove', this._onActionRemove);

    if (state) {
      this.rehydrate(state);
    }

    this.wrapper = fluxApp.createWrapper();

    this.destroyed = false;
  }

  /**
  * Rehydrate Context
  *
  * @param  {Object} state
  * @return {fluxAppContext}
  */

  _createClass(FluxAppContext, [{
    key: 'rehydrate',
    value: function rehydrate(state) {
      this.aliveCheck('rehydrate()');

      if (state.stores) {
        this._rehydrateStores(state.stores);
      }

      return this;
    }

    /*
    * Rehydrate the stores with the given state
    *
    * @param {Object} state
    */
  }, {
    key: '_rehydrateStores',
    value: function _rehydrateStores(state) {
      var stores = this._stores;

      if (state) {
        Object.keys(state).forEach(function (id) {
          stores[id].rehydrate(state[id]);
        });
      }

      return this;
    }

    /**
    * Binds the event handlers to context
    */
  }, {
    key: '_bindEventHandlers',
    value: function _bindEventHandlers() {
      this._onActionRemove = this._onActionRemove.bind(this);
      this._onActionAdd = this._onActionAdd.bind(this);
      this._onStoreRemove = this._onStoreRemove.bind(this);
      this._onStoreAdd = this._onStoreAdd.bind(this);
    }

    /**
    * Event handler when a store is added to fluxapp
    *
    * @param {String} id    Store name
    * @param {Class} Store Store constructor
    */
  }, {
    key: '_onStoreAdd',
    value: function _onStoreAdd(id, Store) {
      this._stores[id] = new Store(this);
    }

    /**
    * Event Handler when a store is removed from fluxapp
    *
    * @param {String} id store name
    */
  }, {
    key: '_onStoreRemove',
    value: function _onStoreRemove(id) {
      delete this._stores[id];
    }

    /**
    * Event Handler when actions are added to fluxapp
    *
    * @param {String} id     namespace
    * @param {Class} Action constructor for the actions
    */
  }, {
    key: '_onActionAdd',
    value: function _onActionAdd(namespace, Action) {
      this._actions[namespace] = new Action(namespace, this);
    }

    /**
    * Event handler, when action is removed from fluxapp
    *
    * @param {String} id action namespace
    */
  }, {
    key: '_onActionRemove',
    value: function _onActionRemove(id) {
      delete this._actions[id];
    }

    /**
    * Dehydrate Stores
    *
    * @return {Object}
    */
  }, {
    key: '_dehydrateStores',
    value: function _dehydrateStores() {
      var storeData = {};
      var stores = this._stores;

      Object.keys(stores).map(function (id) {
        var state = stores[id].dehydrate();

        if (state) {
          storeData[id] = state;
        }
      });

      return storeData;
    }

    /**
     * Bootstraps the page context
     *
     * @param  {Object} request Route Request object
     * @param  {Object} options Options for the context generator
     * @return {Object}         Page Component, State and method
     */
  }, {
    key: '_getPageContext',
    value: function _getPageContext(request, options) {
      var _this2 = this;

      var router = this._fluxApp.getRouter();
      var route = router.getRouteById(request.routeId);

      if (_lodash2['default'].isObject(options.state)) {
        this.rehydrate(options.state);
      }

      options.props = _lodash2['default'].assign({}, options.props, {
        handler: route.handler,
        context: this,
        params: request.params,
        query: request.query,
        request: request
      });

      options.wait = options.dehydrate ? true : !!options.wait;

      return new _bluebird2['default'](function (resolve, reject) {
        var Element = _react2['default'].createElement(_this2.getWrapper(), options.props);
        var result = undefined;

        if (options.dehydrate || !options.state) {
          result = route.loader(request, _this2).then(function () {
            return {
              element: Element,
              state: options.dehydrate ? _this2.dehydrate() : {},
              method: options.method
            };
          });
        }

        if (!result || !options.wait) {
          result = _bluebird2['default'].resolve({
            element: Element,
            state: options.dehydrate ? _this2.dehydrate() : {},
            method: options.method
          });
        }

        resolve(result);
      });
    }

    /**
    * Check if the context is alive or destroyed
    *
    * @param {String} name method which was called on the context
    */
  }, {
    key: 'aliveCheck',
    value: function aliveCheck(name) {
      if (this.destroyed === true) {
        name = name || 'Uknown';

        throw new Error('Fluxapp: Context#' + name + ' called after being destroyed');
      }
    }

    /**
    * Bind the custom context methods to the context
    *
    * @param {Object} methods
    */
  }, {
    key: 'bindContextMethods',
    value: function bindContextMethods(methods) {
      var _this3 = this;

      _lodash2['default'].each(methods, function (fn, key) {
        _this3[key] = function () {
          this.aliveCheck(key);

          return fn.apply(this, arguments);
        };
      });
    }

    /**
    * Destroy the context
    */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._stores = {};
      this._actions = {};
      this.dispatcher = null;
      this.destroyed = true;

      if (this._fluxApp) {
        this._fluxApp.removeListener('stores.add', this._onStoreAdd).removeListener('stores.remove', this._onStoreRemove).removeListener('actions.add', this._onActionAdd).removeListener('actions.remove', this._onActionRemove);

        this._fluxApp = null;
      }
    }

    /**
    * Converts string based action type to constant
    *
    * @param {String} input
    */
  }, {
    key: 'getActionType',
    value: function getActionType(input) {
      this.aliveCheck('getActionType(' + input + ')');

      return this._fluxApp.getActionType(input);
    }

    /**
     * Get all registered stores
     *
     * @return {Object}
     */
  }, {
    key: 'getStores',
    value: function getStores() {
      this.aliveCheck('getStores()');

      return this._stores;
    }

    /**
    * Retrieve a store
    *
    * @param {Object|Null} name
    */
  }, {
    key: 'getStore',
    value: function getStore(name) {
      this.aliveCheck('getStore(' + name + ')');

      var store = this._stores[name];

      if (!store) {
        throw new Error('fluxApp: Could not locate store by the name ' + name);
      }

      return store;
    }

    /**
     * Check if a store is registered
     *
     * @param {Object|Null} name
     */
  }, {
    key: 'hasStore',
    value: function hasStore(name) {
      this.aliveCheck('hasStore(' + name + ')');

      return !!this._stores[name];
    }

    /**
    * Remove a store from the context
    *
    * @param {String} name
    */
  }, {
    key: 'removeStore',
    value: function removeStore(name) {
      this.aliveCheck('removeStore(' + name + ')');

      var store = this.getStore(name);
      var dispatcher = this.getDispatcher();

      if (store) {
        dispatcher.unregister(store.dispatchToken);

        delete this._stores[name];

        store.destroy();
      }

      return this;
    }

    /**
    * Get an of actions by namespace and method name
    *
    * @param {String} namespace
    * @param {String} method
    */
  }, {
    key: 'getAction',
    value: function getAction(namespace, method) {
      this.aliveCheck('getAction(' + namespace + ', ' + method + ')');

      var actions = this._actions[namespace];

      return actions[method].bind(actions);
    }

    /**
    * Get a list of actions by namespace
    *
    * @param {String} namespace
    */
  }, {
    key: 'getActions',
    value: function getActions(namespace) {
      this.aliveCheck('getActions(' + namespace + ')');

      return this._actions[namespace];
    }

    /**
    * Remove action namespace
    *
    * @param {String} namespace
    */
  }, {
    key: 'removeActions',
    value: function removeActions(namespace) {
      this.aliveCheck('removeActions(' + namespace + ')');

      delete this._actions[namespace];

      return this;
    }

    /**
    * Remove action from namespace
    *
    * @param {String} namespace
    * @param {string} method
    */
  }, {
    key: 'removeAction',
    value: function removeAction(namespace, method) {
      this.aliveCheck('removeAction(' + namespace + ', ' + method + ')');
      delete this._actions[namespace][method];
    }
  }, {
    key: 'hasAction',

    /**
     * Determine if action exists
     */
    value: function hasAction(namespace, action) {
      this.aliveCheck('hasActions(' + namespace + ', ' + action + ')');

      return this.hasActions(namespace) && !!this.getActions(namespace)[action];
    }

    /**
     * Determine if action namespace exists
     */
  }, {
    key: 'hasActions',
    value: function hasActions(namespace) {
      this.aliveCheck('hasActions(' + namespace + ')');

      return !!this._actions[namespace];
    }

    /**
     * Set the wrapper used in getPageContext
     * @param {Object} wrapper React Class
     */
  }, {
    key: 'setWrapper',
    value: function setWrapper(wrapper) {
      this.wrapper = wrapper;

      return this;
    }

    /**
     * Get the wrapper
     *
     * @return {Object} React Class
     */
  }, {
    key: 'getWrapper',
    value: function getWrapper() {
      return this.wrapper;
    }

    /**
    * Get the contexts dispatcher
    */
  }, {
    key: 'getDispatcher',
    value: function getDispatcher() {
      this.aliveCheck('getDispatcher');

      return this.dispatcher;
    }

    /**
     * Gets the request object and initiates the page context generator
     *
     * @param  {String|Object} path    url string or request object
     * @param  {Object} options The page generation options
     * @return {Promise}
     */
  }, {
    key: 'getPageContext',
    value: function getPageContext(path, options) {
      this.aliveCheck('render()');

      var router = this._fluxApp.getRouter();
      var requestOptions = _lodash2['default'].pick(options, 'method');
      var request = _lodash2['default'].isString(path) ? router.build(path, requestOptions) : path;

      return request ? this._getPageContext(request, options || {}) : _bluebird2['default'].resolve({
        element: false,
        state: {}
      });
    }

    /**
     * Generates page contexts and renders to string
     *
     * @param  {String|Object} path    url string or request object
     * @param  {Object} options The page generation options
     * @return {Promise}
     */
  }, {
    key: 'renderToString',
    value: function renderToString(path, options) {
      var _this4 = this;

      return this.getPageContext(path, options).then(function (page) {
        if (page && page.element) {
          page.element = ReactDOMServer.renderToString(page.element);
          _this4.destroy();
        }

        return page;
      });
    }

    /**
     * Generates page contexts and renders to string
     *
     * @param  {String|Object} path    url string or request object
     * @param  {Object} options The page generation options
     * @return {Promise}
     */
  }, {
    key: 'render',
    value: function render(path, options) {
      return this.getPageContext(path, options).then(function _render(page) {
        if (page && page.element) {
          ReactDOM.render(page.element, options.container);
        }

        return page;
      });
    }

    /**
    * Dehydrate Context
    *
    * @return {fluxAppContext}
    */
  }, {
    key: 'dehydrate',
    value: function dehydrate() {
      this.aliveCheck('dehydrate()');

      return {
        stores: this._dehydrateStores()
      };
    }
  }]);

  return FluxAppContext;
})();

exports['default'] = FluxAppContext;
module.exports = exports['default'];