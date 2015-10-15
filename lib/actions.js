'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _slice = Array.prototype.slice;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _utilNamespaceTransform = require('./util/namespaceTransform');

var _utilNamespaceTransform2 = _interopRequireDefault(_utilNamespaceTransform);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var BaseActions = (function () {
  function BaseActions(namespace, context) {
    var _this = this;

    _classCallCheck(this, BaseActions);

    this.namespace = namespace;
    this.context = context;

    if (!context) {
      throw new Error('fluxApp: BaseActions requires a context be provided');
    }

    this.dispatcher = context.getDispatcher();

    _lodash2['default'].each(Object.getOwnPropertyNames(this.constructor.prototype), function (method) {
      var fn = _this[method];

      if (method.indexOf('_') !== 0 && _lodash2['default'].isFunction(fn)) {
        _this[method] = (function () {
          return this._invokeAction.apply(this, [method, fn].concat(_slice.call(arguments)));
        }).bind(_this);
      }
    });
  }

  /*
  export default (namespace, handlers) => {
    function Actions() {
      BaseActions.apply(this, arguments);
    }
  
    console.log(BaseActions.prototype);
  
    Actions.prototype = _.create(BaseActions.prototype);
  
    Object.keys(handlers).forEach(function(key) {
      Actions.prototype[ key ] = _.partial(function() {
        return this._invokeAction.apply(this, arguments);
      }, [ namespace, key ], handlers[ key ]);
    });
  
    return Actions.bind(null, namespace);
  };*/

  /**
  * Dispatches the action before event
  */

  _createClass(BaseActions, [{
    key: '_dispatchBefore',
    value: function _dispatchBefore(namespace, args) {
      return this.dispatcher.dispatch({
        actionType: (0, _utilNamespaceTransform2['default'])(namespace, 'before'),
        payload: args
      });
    }

    /**
    * Dispatches the action event
    */
  }, {
    key: '_dispatchAction',
    value: function _dispatchAction(actionType, result) {
      return this.dispatcher.dispatch({
        actionType: actionType,
        payload: result
      });
    }

    /**
    * Dispatches the action after event
    */
  }, {
    key: '_dispatchAfter',
    value: function _dispatchAfter(namespace) {
      return this.dispatcher.dispatch({
        actionType: (0, _utilNamespaceTransform2['default'])(namespace, 'after')
      });
    }

    /**
    * Dispatches the action failed event
    */
  }, {
    key: '_dispatchFailed',
    value: function _dispatchFailed(namespace, args, error) {
      return this.dispatcher.dispatch({
        actionType: (0, _utilNamespaceTransform2['default'])(namespace, 'failed'),
        payload: {
          args: args,
          error: error
        }
      });
    }

    /**
     * Gets the action handler
     *
     * Action handler wraps the function in a promise
     * If sync it emits the event
     * If async it emits a before event for async handling on the ui side
     * Catches errors that may have occured and emits a failed event action
     *
     * @param {Array} namespace
     * @param {Function} handler
     */
  }, {
    key: '_invokeAction',
    value: function _invokeAction(method, handler) {
      var _this2 = this;

      var namespace = this.namespace + '.' + method;
      var args = Array.prototype.slice.call(arguments, 2);
      var response = _bluebird2['default'].method(handler).apply(this, args);
      var pending = response.isPending();
      var actionDispatch = _bluebird2['default'].resolve();
      var actionType = (0, _utilNamespaceTransform2['default'])(namespace);

      this._dispatchBefore(namespace);

      if (pending) {
        actionDispatch = response.then(this._dispatchAction.bind(this, actionType)).then(this._dispatchAfter.bind(this, namespace))['catch'](this._dispatchFailed.bind(this, namespace, args));
      } else if (response.isRejected()) {
        this._dispatchFailed(namespace, args, response.reason());
      } else {
        actionDispatch = this._dispatchAction(actionType, response.value());
        actionDispatch.then(this._dispatchAfter.bind(this, namespace));
      }

      return _bluebird2['default'].join(response, actionDispatch).spread(function (result) {
        return [actionType, result];
      })['catch'](function (err) {
        _this2._dispatchAction((0, _utilNamespaceTransform2['default'])('action.failed'), {
          actionType: actionType,
          args: args,
          error: err
        });
      });
    }

    /**
     * Proxy to fluxApp.getStore
     *
     * @param {String} name
     */
  }, {
    key: 'getStore',
    value: function getStore(name) {
      return this.context.getStore(name.trim());
    }

    /**
     * Proxy to fluxApp.getActions
     * @param {String} namespace
     */
  }, {
    key: 'getActions',
    value: function getActions(namespace) {
      return this.context.getActions(namespace);
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

      return actions[method].bind(actions);
    }
  }]);

  return BaseActions;
})();

exports['default'] = BaseActions;
exports['default'] = BaseActions;
module.exports = exports['default'];