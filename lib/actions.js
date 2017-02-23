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

var _errors = require('./errors');

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

  /**
  * Dispatches the action before event
  */

  _createClass(BaseActions, [{
    key: '_dispatchBefore',
    value: function _dispatchBefore(namespace, args) {
      return this.dispatcher.dispatch({
        actionType: (0, _utilNamespaceTransform2['default'])(namespace, 'before'),
        payload: args
      })['catch'](function (err) {
        throw new _errors.BeforeDispatchError(err);
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
      })['catch'](function (err) {
        throw new _errors.ListenerDispatchError(err);
      });;
    }

    /**
    * Dispatches the action after event
    */
  }, {
    key: '_dispatchAfter',
    value: function _dispatchAfter(namespace) {
      return this.dispatcher.dispatch({
        actionType: (0, _utilNamespaceTransform2['default'])(namespace, 'after')
      })['catch'](function (err) {
        throw new _errors.AfterDispatchError(err);
      });;
    }

    /**
    * Dispatches the action failed event
    */
  }, {
    key: '_dispatchFailed',
    value: function _dispatchFailed(namespace, args, error, type, result) {
      var _this2 = this;

      this._handleFailed(result, error, type);

      return this.dispatcher.dispatch({
        actionType: (0, _utilNamespaceTransform2['default'])(namespace, 'failed'),
        payload: {
          args: args,
          error: error,
          type: type
        }
      })['catch'](function (err) {
        throw new _errors.FailedDispatchError(err);
      }).tap(function () {
        return _this2._dispatchAction((0, _utilNamespaceTransform2['default'])('action.failed'), {
          actionType: (0, _utilNamespaceTransform2['default'])(namespace),
          args: args,
          error: error,
          type: type
        });
      });
    }
  }, {
    key: '_handleFailed',
    value: function _handleFailed(result, err, type) {
      if (result.error) {
        result.previousError = result.error;
      }

      result.status = 0;
      result.error = err;
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
      var _this3 = this;

      var namespace = this.namespace + '.' + method;
      var actionType = (0, _utilNamespaceTransform2['default'])(namespace);
      var args = Array.prototype.slice.call(arguments, 2);
      var result = {
        status: 1,
        args: args,
        actionType: actionType,
        namespace: namespace,
        response: null,
        error: null,
        previousError: null
      };

      return _bluebird2['default'].resolve().tap(function () {
        return _this3._dispatchBefore(namespace, args);
      }).then(function () {
        return _bluebird2['default'].method(handler).apply(_this3, args)['catch'](function (err) {
          throw new _errors.ActionDispatchError(err);
        });
      }).tap(function (response) {
        result.response = response;

        return _this3._dispatchAction(actionType, response);
      }).tap(function () {
        return _this3._dispatchAfter(namespace);
      })['catch'](_errors.BeforeDispatchError, function (err) {
        return _this3._dispatchFailed(namespace, args, err, 'before', result);
      })['catch'](_errors.ActionDispatchError, function (err) {
        return _this3._dispatchFailed(namespace, args, err, 'action', result);
      })['catch'](_errors.ListenerDispatchError, function (err) {
        return _this3._dispatchFailed(namespace, args, err, 'listener', result);
      })['catch'](_errors.AfterDispatchError, function (err) {
        return _this3._dispatchFailed(namespace, args, err, 'after', result);
      })['catch'](_errors.FailedDispatchError, function (err) {
        return _this3._dispatchAction((0, _utilNamespaceTransform2['default'])('action.failed'), {
          actionType: actionType,
          args: args,
          error: err,
          type: 'failed'
        }).then(_this3._handleFailed.bind(_this3, result, err, 'failed'));
      })['catch'](function (err) {
        _this3._handleFailed(result, err, 'uncaught');
        return _this3._dispatchAction((0, _utilNamespaceTransform2['default'])('action.uncaught'), {
          actionType: actionType,
          args: args,
          error: err,
          type: 'uncaught'
        });
      }).then(function () {
        return result;
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