'use strict';

module.exports = {
  /**
   * Initiate the action handlers and store bindings
   */
  componentDidMount: function componentWillMount() {
    var self = this;
    var fluxApp = require('./');
    var flux = this.flux;
    var route;

    this._actionMapper = {};
    this._storeMapper = {};

    if (flux) {
      if (flux.actions) {
        Object.keys(flux.actions).forEach(function iterateAction(method) {
          if (typeof self[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux action method not found '+ method);
          }

          self.bindActions(flux.actions[ method ], self[ method ]);
        });

        this.dispatchToken = fluxApp.getDispatcher().register(this.onDispatch);
      }

      if (flux.stores) {
        Object.keys(flux.stores).forEach(function iterateAction(method) {
          if (typeof self[method] !== 'function') {
            throw Error('fluxapp:componentMixin flux store method not found '+ method);
          }

          self.bindStores(flux.stores[ method ], self[ method ]);
        });
      }

      if (flux.route) {
        flux.route.handler = this;
        fluxApp.createRoute(flux.route);
      }
    }
  },

  /**
   * Unregister the dispatch token and unbind stores
   */
  componentWillUnmount: function componentWillUnmount() {
    var fluxApp = require('./');
    var self = this;
    var flux = this.flux;

    if (this.dispatchToken) {
      fluxApp.getDispatcher().unregister(this.dispatchToken);
    }

    if (flux && flux.stores) {
      Object.keys(flux.stores).forEach(function iterateAction(method) {
        self.unbindStores(flux.stores[ method ], self[ method ]);
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
    var namespaceTransform = require('../util/namespaceTransform');
    var self = this;

    actionTypes = Array.isArray(actionTypes) ? actionTypes : [ actionTypes ];

    actionTypes.forEach(function mapActionType(actionType) {
      var key = namespaceTransform(actionType);

      if (key.split('_').length !== 3) {
        throw new Error('Components may only bind to before, failed and after events');
      }

      self._actionMapper[ key ] = cb;
    });
  },

  /**
   * Bind the stores to their supplied methods
   *
   * @param {Object}   storeInstances
   * @param {Function} cb
   */
  bindStores: function bindStores(storeInstances, cb) {
    var self = this;
    var fluxApp = require('./');

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [ storeInstances ];

    storeInstances.forEach(function mapStoreBindType(store) {
      function onlyMounted() {
        cb.apply(self, arguments);
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
    var self = this;
    var fluxApp = require('./');

    storeInstances = Array.isArray(storeInstances) ? storeInstances : [ storeInstances ];

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
    var fluxApp = require('./');

    return fluxApp.getStore(name);
  },

  /**
   * Proxy to fluxApp.getActions
   * @param {String} namespace
   */
  getActions: function getActions(namespace) {
    var fluxApp = require('./');

    return fluxApp.getActions(namespace);
  },

  /**
   * Retrieves an individual action method
   *
   * @param {String} namespace
   * @param {String} method
   */
  getAction: function getAction(namespace, method) {
    var actions = this.getActions(namespace);

    return actions[method];
  },

  /**
   * General function that ensures the actions are ony dispatched when mounted and proxies to
   * the correct method
   *
   * @param {Object} payload
   */
  onDispatch: function onDispatch(payload) {
    if (this.isMounted() && this._actionMapper[ payload.actionType ]) {
      this._actionMapper[ payload.actionType ](payload.actionType, payload.payload);
    }
  }
};
