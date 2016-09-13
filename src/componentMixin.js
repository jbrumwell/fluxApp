import React from 'react';

export default {
  contextTypes : {
    flux : React.PropTypes.object.isRequired,
  },

  /**
   * Initiate the action handlers and store bindings
   */
  componentDidMount() {
    const fluxApp = this.context.flux;
    const flux = this.flux;

    this._actionMapper = {};
    this._storeMapper = {};

    if (flux) {
      if (flux.actions) {
        Object.keys(flux.actions).forEach((method) => {
          if (typeof this[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux action method not found ' + method);
          }

          this.bindActions(flux.actions[ method ], this[ method ]);
        });

        this.dispatchToken = fluxApp.getDispatcher().register(this.onDispatch);
      }

      if (flux.stores) {
        Object.keys(flux.stores).forEach((method) => {
          if (typeof this[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux store method not found ' + method);
          }

          this.bindStores(flux.stores[ method ], method);
        });
      }
    }
  },

  /**
   * Unregister the dispatch token and unbind stores
   */
  componentWillUnmount() {
    const fluxApp = this.context.flux;
    const flux = this.flux;

    if (this.dispatchToken) {
      fluxApp.getDispatcher().unregister(this.dispatchToken);
    }

    if (flux && flux.stores) {
      Object.keys(flux.stores).forEach((method) => {
        this.unbindStores(flux.stores[ method ], this[ method ]);
      });
    }
  },

  /**
   * Bind the actions provided to their methods
   *
   * @param {Object}   actionTypes
   * @param {Function} cb
   */
  bindActions(actionTypes, cb) {
    const namespaceTransform = require('./util/namespaceTransform');

    actionTypes = Array.isArray(actionTypes) ? actionTypes : [ actionTypes ];

    actionTypes.forEach((actionType) => {
      var key = namespaceTransform(actionType);

      if (key.split('_').length !== 3) {
        throw new Error('Components may only bind to before, failed and after events');
      }

      this._actionMapper[ key ] = cb;
    });
  },

  /**
   * Bind the stores to their supplied methods
   *
   * @param {Object}   storeInstances
   * @param {Function} cb
   */
  bindStores(storeInstances, method) {
    const fluxApp = this.context.flux;
    const cb = this[ method ];

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [ storeInstances ];

    storeInstances.forEach((store) => {
      const self = this;

      function onlyMounted() {
        var args = ['setState', 'replaceState'].indexOf(method) !== -1 ? [ arguments[0] ] : arguments;

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
  unbindStores(storeInstances, cb) {
    const fluxApp = this.context.flux;

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [ storeInstances ];

    storeInstances.forEach((store) => {
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
  getStore(name) {
    return this.context.flux.getStore(name.trim());
  },

  getStoreState(name) {
    return this.getStore(name).getMutableState();
  },

  /**
   * Proxy to fluxApp.getActions
   * @param {String} namespace
   */
  getActions(namespace) {
    return this.context.flux.getActions(namespace);
  },

  /**
   * Retrieves an individual action method
   *
   * @param {String} namespace
   * @param {String} method
   */
  getAction(namespace, method) {
    const actions = this.getActions(namespace);

    if (! actions[method]) {
      throw new Error('Method `' + method + '` not found in namespace `' + namespace + '`');
    }

    return actions[method].bind(actions);
  },

  getFluxappContext() {
    return this.context.flux;
  },

  /**
   * General function that ensures the actions are only dispatched when mounted and proxies to
   * the correct method
   *
   * @param {Object} payload
   */
  onDispatch(payload) {
    if (this.isMounted() && this._actionMapper[ payload.actionType ]) {
      this._actionMapper[ payload.actionType ](payload.payload, payload.actionType);
    }
  },
};
