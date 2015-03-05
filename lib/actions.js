'use strict';

var Promise = require('bluebird');
var namespaceTransform = require('../util/namespaceTransform');
var _ = require('lodash');
var fluxApp = require('./');

function BaseActions(namespace, context) {
  this.namespace = namespace;
  this._fluxApp = context || fluxApp;
  this.dispatcher = this._fluxApp.getDispatcher();
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

BaseActions.prototype._invokedActions = [];

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
  var response = Promise.method(handler).apply(this._fluxApp, args);
  this._invokedActions.push(response);

  var pending = response.isPending();
  var actionDispatch = Promise.resolve();
  var actionType = namespaceTransform(namespace);

  if (pending) {
    this._dispatchBefore(namespace);

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
  function Actions(namespace, handlers, fluxApp) {
    BaseActions.apply(this, arguments);
  }

  Actions.prototype = _.create(BaseActions.prototype);

  Object.keys(handlers).forEach(function(key) {
    Actions.prototype[ key ] = _.partial(function() {
      return this._invokeAction.apply(this, arguments);
    }, [ namespace, key ], handlers[ key ]);
  });

  Actions.prototype.clone = function clone(context) {
    return new Actions(namespace, context);
  };

  return new Actions(namespace);
};
