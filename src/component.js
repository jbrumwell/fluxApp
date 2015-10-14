import React, { Component } from 'react';
import _ from 'lodash';
import namespaceTransform from './util/namespaceTransform';

export default class fluxappComponent extends Component {
  static contextTypes = {
    flux : React.PropTypes.object.isRequired,
  }

  constructor(props, context, updater) {
    super(props, context, updater);

    this._storeMap = {};
    this._actionMap = {};

    this._initActions(this.constructor.actions);
    this._initStores(this.constructor.stores);
  }

  /**
   * Initiate the action handlers
   */
  _initActions(actions) {
    const fluxapp = this.context.flux;

    if (actions) {
      Object.keys(actions).forEach((method) => {
        if (typeof this[method] !== 'function') {
          throw Error('fluxapp:Component flux action method not found ' + method);
        }

        this._bindActions(actions[ method ], this[ method ]);
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
  _bindActions(actionTypes, cb) {
    actionTypes = Array.isArray(actionTypes) ? actionTypes : [ actionTypes ];

    actionTypes.forEach((actionType) => {
      const key = namespaceTransform(actionType);

      if (key.split('_').length !== 3) {
        throw new Error('Components may only bind to before, failed and after events');
      }

      this._actionMap[ key ] = cb;
    });
  }

  /**
   * Initiate the store bindings
   */
  _initStores(stores) {
    if (stores) {
      Object.keys(stores).forEach((method) => {
        if (typeof this[method] !== 'function') {
          throw Error('fluxapp:Component flux store method not found ' + method);
        }

        this._storeMap[method] = stores[method];
      });
    }
  }

  /**
   * Bind the stores to their supplied methods
   *
   * @param {Object}   storeInstances
   * @param {Function} cb
   */
  _bindStores(storeInstances, method) {
    const fluxapp = this.context.flux;
    const cb = this[ method ];

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [ storeInstances ];

    storeInstances.forEach((store) => {
      const listener = () => {
        const args = ['setState', 'replaceState'].indexOf(method) !== -1 ? [ arguments[0] ] : arguments;
        cb.apply(this, args);
      };

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
  _unbindStores(storeInstances, method) {
    const fluxapp = this.context.flux;
    const cb = this[method];

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [ storeInstances ];

    storeInstances.forEach(function mapStoreUnbindType(store) {
      if (typeof store === 'string') {
        store = fluxapp.getStore(store);
      }

      store.removeChangeListener(cb);
    });
  }

  componentWillMount() {
    _.each(this._storeMap, (stores, method) => this._bindStores(stores, method));
  }

  /**
   * Unregister the dispatch token and unbind stores
   */
  componentWillUnmount() {
    const fluxapp = this.context.flux;

    if (this._dispatchToken) {
      fluxapp.getDispatcher().unregister(this._dispatchToken);
    }

    _.each(this._storeMap, (stores, method) => this._unbindStores(stores, method));
  }

  /**
   * Proxy to fluxapp.getStore
   *
   * @param {String} name
   */
  getStore(name) {
    return this.context.flux.getStore(name.trim());
  }

  /**
   * Proxy to fluxapp.getActions
   * @param {String} namespace
   */
  getActions(namespace) {
    return this.context.flux.getActions(namespace);
  }

  /**
   * Retrieves an individual action method
   *
   * @param {String} namespace
   * @param {String} method
   */
   getAction(namespace, method) {
     var actions = this.getActions(namespace);

     if (! actions[method]) {
       throw new Error('Method `' + method + '` not found in namespace `' + namespace + '`');
     }

     return actions[method].bind(actions);
   }

   /**
    * Get the fluxapp Context
    * @return {Fluxapp}
    */
   getContext() {
     return this.context.flux;
   }

   /**
    * General function that ensures the actions are only dispatched when mounted and proxies to
    * the correct method
    *
    * @param {Object} payload
    */
   onDispatch(payload) {
     const map = this._actionMap;

     if (map[ payload.actionType ]) {
       map[ payload.actionType ](payload.actionType, payload.payload);
     }
   }
}
