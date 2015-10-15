'use strict';
var React = require('react');

module.exports = {
  contextTypes: {
    flux: React.PropTypes.object.isRequired
  },

  /**
   * Initiate the action handlers and store bindings
   */
  componentDidMount: function componentDidMount() {
    var self = this;
    var fluxApp = this.context.flux;
    var flux = this.flux;

    this._actionMapper = {};
    this._storeMapper = {};

    if (flux) {
      if (flux.actions) {
        Object.keys(flux.actions).forEach(function iterateAction(method) {
          if (typeof self[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux action method not found ' + method);
          }

          self.bindActions(flux.actions[method], self[method]);
        });

        this.dispatchToken = fluxApp.getDispatcher().register(this.onDispatch);
      }

      if (flux.stores) {
        Object.keys(flux.stores).forEach(function iterateAction(method) {
          if (typeof self[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux store method not found ' + method);
          }

          self.bindStores(flux.stores[method], method);
        });
      }
    }
  },

  /**
   * Unregister the dispatch token and unbind stores
   */
  componentWillUnmount: function componentWillUnmount() {
    var fluxApp = this.context.flux;
    var self = this;
    var flux = this.flux;

    if (this.dispatchToken) {
      fluxApp.getDispatcher().unregister(this.dispatchToken);
    }

    if (flux && flux.stores) {
      Object.keys(flux.stores).forEach(function iterateAction(method) {
        self.unbindStores(flux.stores[method], self[method]);
      });
    }
  },

  /**
   * Bind the actions provided to their methods
   *
   * @param {Object}   actionTypes
   * @param {Function} cb
   */
  bindActions: function bindActions(actionTypes, cb) {
    var namespaceTransform = require('./util/namespaceTransform');
    var self = this;

    actionTypes = Array.isArray(actionTypes) ? actionTypes : [actionTypes];

    actionTypes.forEach(function mapActionType(actionType) {
      var key = namespaceTransform(actionType);

      if (key.split('_').length !== 3) {
        throw new Error('Components may only bind to before, failed and after events');
      }

      self._actionMapper[key] = cb;
    });
  },

  /**
   * Bind the stores to their supplied methods
   *
   * @param {Object}   storeInstances
   * @param {Function} cb
   */
  bindStores: function bindStores(storeInstances, method) {
    var self = this;
    var fluxApp = this.context.flux;
    var cb = this[method];

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [storeInstances];

    storeInstances.forEach(function mapStoreBindType(store) {
      function onlyMounted() {
        var args = ['setState', 'replaceState'].indexOf(method) !== -1 ? [arguments[0]] : arguments;

        if (self.isMounted()) {
          cb.apply(self, args);
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
  unbindStores: function bindStores(storeInstances, cb) {
    var fluxApp = this.context.flux;

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [storeInstances];

    storeInstances.forEach(function mapStoreUnbindType(store) {
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
  getStore: function getStore(name) {
    return this.context.flux.getStore(name.trim());
  },

  /**
   * Proxy to fluxApp.getActions
   * @param {String} namespace
   */
  getActions: function getActions(namespace) {
    return this.context.flux.getActions(namespace);
  },

  /**
   * Retrieves an individual action method
   *
   * @param {String} namespace
   * @param {String} method
   */
  getAction: function getAction(namespace, method) {
    var actions = this.getActions(namespace);

    if (!actions[method]) {
      throw new Error('Method `' + method + '` not found in namespace `' + namespace + '`');
    }

    return actions[method].bind(actions);
  },

  getFluxappContext: function getFluxappContext() {
    return this.context.flux;
  },

  /**
   * General function that ensures the actions are only dispatched when mounted and proxies to
   * the correct method
   *
   * @param {Object} payload
   */
  onDispatch: function onDispatch(payload) {
    if (this.isMounted() && this._actionMapper[payload.actionType]) {
      this._actionMapper[payload.actionType](payload.payload, payload.actionType);
    }
  }
};