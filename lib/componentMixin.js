'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

exports['default'] = {
  contextTypes: {
    flux: _react2['default'].PropTypes.object.isRequired
  },

  /**
   * Initiate the action handlers and store bindings
   */
  componentDidMount: function componentDidMount() {
    var _this = this;

    var fluxApp = this.context.flux;
    var flux = this.flux;

    this._actionMapper = {};
    this._storeMapper = {};

    if (flux) {
      if (flux.actions) {
        Object.keys(flux.actions).forEach(function (method) {
          if (typeof _this[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux action method not found ' + method);
          }

          _this.bindActions(flux.actions[method], _this[method]);
        });
      }

      if (_lodash2['default'].size(this._actionMapper)) {
        this.dispatchToken = fluxApp.getDispatcher().register(this.onDispatch, _lodash2['default'].keys(this._actionMapper));
      }

      if (flux.stores) {
        Object.keys(flux.stores).forEach(function (method) {
          if (typeof _this[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux store method not found ' + method);
          }

          _this.bindStores(flux.stores[method], method);
        });
      }
    }
  },

  /**
   * Unregister the dispatch token and unbind stores
   */
  componentWillUnmount: function componentWillUnmount() {
    var _this2 = this;

    var fluxApp = this.context.flux;
    var flux = this.flux;

    if (this.dispatchToken) {
      fluxApp.getDispatcher().unregister(this.dispatchToken);
    }

    if (flux && flux.stores) {
      Object.keys(flux.stores).forEach(function (method) {
        _this2.unbindStores(flux.stores[method], _this2[method]);
      });
    }
  },

  /**
   * Bind the actions provided to their methods
   *
   * @param {Object}   actionTypes
   * @param {Function} cb
   */
  bindActions: function bindActions(actionTypes, cb) {
    var _this3 = this;

    var namespaceTransform = require('./util/namespaceTransform');

    actionTypes = Array.isArray(actionTypes) ? actionTypes : [actionTypes];

    actionTypes.forEach(function (actionType) {
      var key = namespaceTransform(actionType);

      if (key.split('_').length !== 3) {
        throw new Error('Components may only bind to before, failed and after events');
      }

      _this3._actionMapper[key] = cb;
    });
  },

  /**
   * Bind the stores to their supplied methods
   *
   * @param {Object}   storeInstances
   * @param {Function} cb
   */
  bindStores: function bindStores(storeInstances, method) {
    var _this4 = this;

    var fluxApp = this.context.flux;
    var cb = this[method];

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [storeInstances];

    storeInstances.forEach(function (store) {
      var self = _this4;

      function onlyMounted() {
        var args = ['setState', 'replaceState'].indexOf(method) !== -1 ? [arguments[0]] : arguments;

        if (self.isMounted()) {
          cb.apply(this, args);
        }
      }

      if (typeof store === 'string') {
        store = fluxApp.getStore(store);
      }

      onlyMounted.listener = cb;

      store.addChangeListener(onlyMounted);
    });
  },

  /**
   * Unbinds the methods from the store change event
   *
   * @param {Object}   storeInstances
   * @param {Function} cb
   */
  unbindStores: function unbindStores(storeInstances, cb) {
    var fluxApp = this.context.flux;

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [storeInstances];

    storeInstances.forEach(function (store) {
      if (typeof store === 'string') {
        store = fluxApp.getStore(store);
      }

      store.removeChangeListener(cb);
    });
  },

  /**
   * Proxy to fluxApp.getStore
   *
   * @param {String} name
   */
  getStore: function getStore(name) {
    return this.context.flux.getStore(name.trim());
  },

  getStoreState: function getStoreState(name) {
    return this.getStore(name).getMutableState();
  },

  /**
   * Proxy to fluxApp.getActions
   * @param {String} namespace
   */
  getActions: function getActions(namespace) {
    return this.context.flux.getActions(namespace);
  },

  /**
   * Retrieves an individual action method
   *
   * @param {String} namespace
   * @param {String} method
   */
  getAction: function getAction(namespace, method) {
    var actions = this.getActions(namespace);

    if (!actions[method]) {
      throw new Error('Method `' + method + '` not found in namespace `' + namespace + '`');
    }

    return actions[method].bind(actions);
  },

  getFluxappContext: function getFluxappContext() {
    return this.context.flux;
  },

  /**
   * General function that ensures the actions are only dispatched when mounted and proxies to
   * the correct method
   *
   * @param {Object} payload
   */
  onDispatch: function onDispatch(payload) {
    var result = undefined;

    if (this.isMounted() && this._actionMapper[payload.actionType]) {
      result = this._actionMapper[payload.actionType](payload.payload, payload.actionType);
    }

    return result;
  }
};
module.exports = exports['default'];