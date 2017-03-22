import Promise from 'bluebird';
import namespaceTransform from './util/namespaceTransform';
import _ from 'lodash';
import {
  ActionDispatchError,
  BeforeDispatchError,
  AfterDispatchError,
  FailedDispatchError,
  ListenerDispatchError,
} from './errors';

export default class BaseActions {
  constructor(namespace, context) {
    this.namespace = namespace;
    this.context = context;

    if (! context) {
      throw new Error('fluxApp: BaseActions requires a context be provided');
    }

    this.dispatcher = context.getDispatcher();

    _.each(Object.getOwnPropertyNames(this.constructor.prototype), (method) => {
      const fn = this[method];

      if (method.indexOf('_') !== 0 && _.isFunction(fn)) {
        this[method] = function() {
          return this._invokeAction(method, fn, ...arguments);
        }.bind(this);
      }
    });
  }

  /**
  * Dispatches the action before event
  */
  _dispatchBefore(namespace, args) {
    return this.dispatcher.dispatch({
      actionType : namespaceTransform(namespace, 'before'),
      payload : args,
    }).catch((err) => {
      throw new BeforeDispatchError(err);
    });
  }

  /**
  * Dispatches the action event
  */
  _dispatchAction(actionType, result) {
    return this.dispatcher.dispatch({
      actionType : actionType,
      payload : result,
    }).catch((err) => {
      throw new ListenerDispatchError(err);
    });;
  }

  /**
  * Dispatches the action after event
  */
  _dispatchAfter(namespace) {
    return this.dispatcher.dispatch({
      actionType : namespaceTransform(namespace, 'after'),
    }).catch((err) => {
      throw new AfterDispatchError(err);
    });;
  }

  /**
  * Dispatches the action failed event
  */
  _dispatchFailed(namespace, args, error, type, result) {
    this._handleFailed(result, error, type);

    return this.dispatcher.dispatch({
      actionType : namespaceTransform(namespace, 'failed'),
      payload : {
        args,
        error : _.has(error, 'originalError') ? error.originalError : error,
        type,
      },
    }).catch((err) => {
      throw new FailedDispatchError(err);
    }).tap(() => {
      return this._dispatchAction(namespaceTransform('action.failed'), {
        actionType : namespaceTransform(namespace),
        args,
        error,
        type,
      });
    });
  }

  _handleFailed(result, err, type) {
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
  _invokeAction(method, handler) {
    const namespace = `${this.namespace}.${method}`;
    const actionType = namespaceTransform(namespace);
    const args = Array.prototype.slice.call(arguments, 2);
    const result = {
      status : 1,
      args,
      actionType,
      namespace,
      response : null,
      error : null,
      previousError : null,
    };

    return Promise.resolve()
    .tap(() => {
      return this._dispatchBefore(namespace, args);
    })
    .then(() => {
      return Promise.method(handler).apply(this, args)
      .catch((err) => {
        throw new ActionDispatchError(err);
      });
    })
    .tap((response) => {
      result.response = response;

      return this._dispatchAction(actionType, response);
    })
    .tap(() => {
      return this._dispatchAfter(namespace);
    })
    .catch(BeforeDispatchError, (err) => {
      return this._dispatchFailed(namespace, args, err, 'before', result);
    })
    .catch(ActionDispatchError, (err) => {
      return this._dispatchFailed(namespace, args, err, 'action', result);
    })
    .catch(ListenerDispatchError, (err) => {
      return this._dispatchFailed(namespace, args, err, 'listener', result);
    })
    .catch(AfterDispatchError, (err) => {
      return this._dispatchFailed(namespace, args, err, 'after', result);
    })
    .catch(FailedDispatchError, (err) => {
      return this._dispatchAction(namespaceTransform('action.failed'), {
        actionType,
        args,
        error : err,
        type : 'failed',
      })
      .then(this._handleFailed.bind(this, result, err, 'failed'));
    })
    .catch((err) => {
      this._handleFailed(result, err, 'uncaught');
      return this._dispatchAction(namespaceTransform('action.uncaught'), {
        actionType,
        args,
        error : err,
        type : 'uncaught',
      });
    })
    .then(() => {
      return result;
    });
  }

  /**
   * Proxy to fluxApp.getStore
   *
   * @param {String} name
   */
   getStore(name) {
     return this.context.getStore(name.trim());
   }

   /**
    * Proxy to fluxApp.getActions
    * @param {String} namespace
    */
   getActions(namespace) {
     return this.context.getActions(namespace);
   }

   /**
    * Retrieves an individual action method
    *
    * @param {String} namespace
    * @param {String} method
    */
   getAction(namespace, method) {
     const actions = this.getActions(namespace);

     return actions[method].bind(actions);
   }
}

export default BaseActions;
