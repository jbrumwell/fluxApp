'use strict';

var Promise = require('bluebird');
var namespaceTransform = require('../util/namespaceTransform');
var _ = require('lodash');
var fluxApp = require('./');

function BaseActions(namespace, context) {
  this.namespace = namespace;
  this.context = context;

  if (! context) {
    throw new Error('fluxApp: BaseActions requires a context be provided');
  }

  this.dispatcher = this.context.getDispatcher();
}

/**
* Dispatches the action before event
*/
BaseActions.prototype._dispatchBefore = function _dispatchBefore(namespace) {
  return this.dispatcher.dispatch({
    actionType : namespaceTransform(namespace, 'before')
  });
};

/**
* Dispatches the action event
*/
BaseActions.prototype._dispatchAction = function _dispatchAction(actionType, result) {
  return this.dispatcher.dispatch({
    actionType : actionType,
    payload : result
  });
};

/**
* Dispatches the action after event
*/
BaseActions.prototype._dispatchAfter = function _dispatchAfter(namespace) {
  return this.dispatcher.dispatch({
    actionType : namespaceTransform(namespace, 'after')
  });
};

/**
* Dispatches the action failed event
*/
BaseActions.prototype._dispatchFailed = function _dispatchFailed(namespace, err) {
  return this.dispatcher.dispatch({
    actionType : namespaceTransform(namespace, 'failed'),
    payload : err
  });
};

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
BaseActions.prototype._invokeAction = function _invokeAction(namespace, handler) {
  var args = Array.prototype.slice.call(arguments, 2);
  var response = Promise.method(handler).apply({ context: this.context }, args);
  var pending = response.isPending();
  var actionDispatch = Promise.resolve();
  var actionType = namespaceTransform(namespace);

  this._dispatchBefore(namespace);

  if (pending) {
    actionDispatch = response.then(
      this._dispatchAction.bind(this, actionType),
      this._dispatchFailed.bind(this, namespace)
    ).then(
      this._dispatchAfter.bind(this, namespace)
    );
  } else if (response.isRejected()) {
    this._dispatchFailed(namespace, response.reason());
  } else {
    actionDispatch = this._dispatchAction(actionType, response.value());
    actionDispatch.then(this._dispatchAfter.bind(this, namespace))
  }

  return Promise.join(response, actionDispatch)
  .spread(function formatResponse(result) {
    return [ actionType, result ];
  })
  .catch(this._dispatchAction.bind(this, [ 'action', 'failed' ], {
    actionType : actionType,
    payload : args
  }));
};

module.exports = function createAction(namespace, handlers) {
  function Actions(namespace, handlers, context) {
    BaseActions.apply(this, arguments);
  }

  Actions.prototype = _.create(BaseActions.prototype);

  Object.keys(handlers).forEach(function(key) {
    Actions.prototype[ key ] = _.partial(function() {
      return this._invokeAction.apply(this, arguments);
    }, [ namespace, key ], handlers[ key ]);
  });

  return Actions.bind(null, namespace);
};
