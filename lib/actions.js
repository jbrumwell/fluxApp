'use strict';

var Promise = require('bluebird');
var namespaceTransform = require('../util/namespaceTransform');
var Dispatcher;

function noop() {}

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
function getInvokeAction(namespace, handler) {
  var fluxApp = require('./');

  Dispatcher = fluxApp.getDispatcher();

  return function invokedAction(handler) {
    var response = Promise.method(handler).apply(handler, arguments);
    var pending = response.isPending();

    if (pending) {
      Dispatcher.dispatch({
        actionType: namespaceTransform(namespace, 'before')
      });

      response.then(function emitActionSuccess(result) {
        Dispatcher.dispatch({
          actionType: namespaceTransform(namespace),
          payload: result
        });

        Dispatcher.dispatch({
          actionType: namespaceTransform(namespace, 'after')
        });
      }, function catchActionError(err) {
        Dispatcher.dispatch({
          actionType: namespaceTransform(namespace, 'failed'),
          payload: err
        });
      });
    } else if (response.isRejected()) {
      Dispatcher.dispatch({
        actionType: namespaceTransform(namespace, 'failed'),
        payload: response.reason()
      });

      response.catch(noop);
    } else {
      Dispatcher.dispatch({
        actionType: namespaceTransform(namespace),
        payload: response.value()
      });
    }

    return response;
  }.bind(null, handler);
}


module.exports = function createAction(namespace, handlers) {
  Object.keys(handlers).forEach(function(key) {
    handlers[ key ] = getInvokeAction([namespace, key], handlers[ key ]);
  });

  return handlers
};
