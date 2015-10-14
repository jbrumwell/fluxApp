import Promise from 'bluebird';
import namespaceTransform from './util/namespaceTransform';
import _ from 'lodash';

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
    });
  }

  /**
  * Dispatches the action event
  */
  _dispatchAction(actionType, result) {
    return this.dispatcher.dispatch({
      actionType : actionType,
      payload : result,
    });
  }

  /**
  * Dispatches the action after event
  */
  _dispatchAfter(namespace) {
    return this.dispatcher.dispatch({
      actionType : namespaceTransform(namespace, 'after'),
    });
  }

  /**
  * Dispatches the action failed event
  */
  _dispatchFailed(namespace, err) {
    return this.dispatcher.dispatch({
      actionType : namespaceTransform(namespace, 'failed'),
      payload : err,
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
  _invokeAction(method, handler) {
    const namespace = `${this.namespace}.${method}`;
    const args = Array.prototype.slice.call(arguments, 2);
    const response = Promise.method(handler).apply(this, args);
    const pending = response.isPending();
    let actionDispatch = Promise.resolve();
    const actionType = namespaceTransform(namespace);

    this._dispatchBefore(namespace);

    if (pending) {
      actionDispatch = response.then(
        this._dispatchAction.bind(this, actionType)
      ).then(
        this._dispatchAfter.bind(this, namespace)
      ).catch(this._dispatchFailed.bind(this, namespace));
    } else if (response.isRejected()) {
      this._dispatchFailed(namespace, response.reason());
    } else {
      actionDispatch = this._dispatchAction(actionType, response.value());
      actionDispatch.then(this._dispatchAfter.bind(this, namespace));
    }

    return Promise.join(response, actionDispatch)
    .spread((result) => {
      return [ actionType, result ];
    })
    .catch((err) => {
      this._dispatchAction(namespaceTransform('action.failed'), {
        actionType : actionType,
        args : args,
        error : err,
      });
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

export default BaseActions;
