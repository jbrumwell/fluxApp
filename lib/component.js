'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utilNamespaceTransform = require('./util/namespaceTransform');

var _utilNamespaceTransform2 = _interopRequireDefault(_utilNamespaceTransform);

var fluxappComponent = (function (_Component) {
  _inherits(fluxappComponent, _Component);

  _createClass(fluxappComponent, null, [{
    key: 'contextTypes',
    value: {
      flux: _react2['default'].PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  function fluxappComponent(props, context, updater) {
    _classCallCheck(this, fluxappComponent);

    if (!context) {
      throw new Error('Fluxapp:Component did not receive a context, from extended class');
    }

    _get(Object.getPrototypeOf(fluxappComponent.prototype), 'constructor', this).apply(this, arguments);

    this._ensureLifecycleMethods();

    this._storeMap = {};
    this._actionMap = {};

    this._initActions(this.constructor.actions);
    this._initStores(this.constructor.stores);
  }

  _createClass(fluxappComponent, [{
    key: '_ensureLifecycleMethods',
    value: function _ensureLifecycleMethods() {
      var _this = this;

      var lifecycle = ['componentWillMount', 'componentWillUnmount'];

      _lodash2['default'].each(lifecycle, function (method) {
        var childMethod = _this[method];
        var componentMethod = _this['_' + method].bind(_this);

        if (childMethod) {
          _this[method] = function () {
            componentMethod();
            childMethod.call(_this);
          };
        } else {
          _this[method] = componentMethod;
        }
      });
    }

    /**
     * Initiate the action handlers
     */
  }, {
    key: '_initActions',
    value: function _initActions(actions) {
      var _this2 = this;

      var fluxapp = this.context.flux;

      if (actions) {
        Object.keys(actions).forEach(function (method) {
          if (typeof _this2[method] !== 'function') {
            throw Error('fluxapp:Component flux action method not found ' + method);
          }

          _this2._bindActions(actions[method], _this2[method]);
        });

        this._dispatchToken = fluxapp.getDispatcher().register(this.onDispatch.bind(this));
      }
    }

    /**
     * Bind the actions provided to their methods
     *
     * @param {Object}   actionTypes
     * @param {Function} cb
     */
  }, {
    key: '_bindActions',
    value: function _bindActions(actionTypes, cb) {
      var _this3 = this;

      actionTypes = Array.isArray(actionTypes) ? actionTypes : [actionTypes];

      actionTypes.forEach(function (actionType) {
        var key = (0, _utilNamespaceTransform2['default'])(actionType);

        if (key.split('_').length !== 3) {
          throw new Error('Components may only bind to before, failed and after events');
        }

        _this3._actionMap[key] = cb;
      });
    }

    /**
     * Initiate the store bindings
     */
  }, {
    key: '_initStores',
    value: function _initStores(stores) {
      var _this4 = this;

      if (stores) {
        Object.keys(stores).forEach(function (method) {
          if (typeof _this4[method] !== 'function') {
            throw Error('fluxapp:Component flux store method not found ' + method);
          }

          _this4._storeMap[method] = stores[method];
        });
      }
    }

    /**
     * Bind the stores to their supplied methods
     *
     * @param {Object}   storeInstances
     * @param {Function} cb
     */
  }, {
    key: '_bindStores',
    value: function _bindStores(storeInstances, method) {
      var _this5 = this;

      var fluxapp = this.context.flux;
      var cb = this[method];

      storeInstances = Array.isArray(storeInstances) ? storeInstances : [storeInstances];

      storeInstances.forEach(function (store) {
        var listener = (function () {
          var isInternal = ['setState', 'replaceState'].indexOf(method) !== -1;
          var args = isInternal ? [arguments[0]] : arguments;
          cb.apply(this, args);
        }).bind(_this5);

        if (typeof store === 'string') {
          store = fluxapp.getStore(store);
        }

        listener.listener = cb;

        store.addChangeListener(listener);
      });
    }

    /**
     * Unbinds the methods from the store change event
     *
     * @param {Object}   storeInstances
     * @param {string} method
     */
  }, {
    key: '_unbindStores',
    value: function _unbindStores(storeInstances, method) {
      var fluxapp = this.context.flux;
      var cb = this[method];

      storeInstances = Array.isArray(storeInstances) ? storeInstances : [storeInstances];

      storeInstances.forEach(function mapStoreUnbindType(store) {
        if (typeof store === 'string') {
          store = fluxapp.getStore(store);
        }

        store.removeChangeListener(cb);
      });
    }
  }, {
    key: '_componentWillMount',
    value: function _componentWillMount() {
      var _this6 = this;

      _lodash2['default'].each(this._storeMap, function (stores, method) {
        return _this6._bindStores(stores, method);
      });
    }

    /**
     * Unregister the dispatch token and unbind stores
     */
  }, {
    key: '_componentWillUnmount',
    value: function _componentWillUnmount() {
      var _this7 = this;

      var fluxapp = this.context.flux;

      if (this._dispatchToken) {
        fluxapp.getDispatcher().unregister(this._dispatchToken);
      }

      _lodash2['default'].each(this._storeMap, function (stores, method) {
        return _this7._unbindStores(stores, method);
      });
    }

    /**
     * Get the current fluxapp context
     * @return {FluxappContext}
     */
  }, {
    key: 'getFluxappContext',
    value: function getFluxappContext() {
      return this.context.flux;
    }

    /**
     * Proxy to fluxapp.getStore
     *
     * @param {String} name
     */
  }, {
    key: 'getStore',
    value: function getStore(name) {
      return this.context.flux.getStore(name.trim());
    }

    /**
     * Proxy to fluxapp.getActions
     * @param {String} namespace
     */
  }, {
    key: 'getActions',
    value: function getActions(namespace) {
      return this.context.flux.getActions(namespace);
    }

    /**
     * Retrieves an individual action method
     *
     * @param {String} namespace
     * @param {String} method
     */
  }, {
    key: 'getAction',
    value: function getAction(namespace, method) {
      var actions = this.getActions(namespace);

      if (!actions[method]) {
        throw new Error('Method `' + method + '` not found in namespace `' + namespace + '`');
      }

      return actions[method].bind(actions);
    }

    /**
     * Get the fluxapp Context
     * @return {Fluxapp}
     */
  }, {
    key: 'getContext',
    value: function getContext() {
      return this.context.flux;
    }

    /**
     * General function that ensures the actions are only dispatched when mounted and proxies to
     * the correct method
     *
     * @param {Object} payload
     */
  }, {
    key: 'onDispatch',
    value: function onDispatch(payload) {
      var map = this._actionMap;

      if (map[payload.actionType]) {
        map[payload.actionType](payload.payload, payload.actionType);
      }
    }
  }]);

  return fluxappComponent;
})(_react.Component);

exports['default'] = fluxappComponent;
module.exports = exports['default'];