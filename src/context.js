import _ from 'lodash';
import Dispatcher from './dispatcher';
import Promise from 'bluebird';
import React from 'react';

const ReactDOM = React;
const ReactDOMServer = React;

export default class FluxAppContext {
  constructor(fluxApp, contextMethods = {}, state) {
    this._bindEventHandlers();
    this.bindContextMethods(contextMethods);

    this.dispatcher = new Dispatcher();
    this._dispatchToken = null;
    this._fluxApp = fluxApp;

    this._actions = _.mapValues(fluxApp.getActions(), (Action, namespace) => {
      return new Action(namespace, this);
    });

    this._stores = _.mapValues(fluxApp.getStores(), (Store) => {
      return new Store(this);
    });

    this._fluxApp.on('stores.add', this._onStoreAdd)
                 .on('stores.remove', this._onStoreRemove)
                 .on('actions.add', this._onActionAdd)
                 .on('actions.remove', this._onActionRemove);

    if (state) {
      this.rehydrate(state);
    }

    this.wrapper = fluxApp.createWrapper();

    this.destroyed = false;
  }

  /**
  * Rehydrate Context
  *
  * @param  {Object} state
  * @return {fluxAppContext}
  */
  rehydrate(state) {
    this.aliveCheck('rehydrate()');

    if (state.stores) {
      this._rehydrateStores(state.stores);
    }

    return this;
  }

  /*
  * Rehydrate the stores with the given state
  *
  * @param {Object} state
  */
  _rehydrateStores(state) {
    const stores = this._stores;

    if (state) {
      Object.keys(state).forEach((id) => {
        stores[ id ].rehydrate(state[ id ]);
      });
    }

    return this;
  }

  /**
  * Binds the event handlers to context
  */
  _bindEventHandlers() {
    this._onActionRemove = this._onActionRemove.bind(this);
    this._onActionAdd = this._onActionAdd.bind(this);
    this._onStoreRemove = this._onStoreRemove.bind(this);
    this._onStoreAdd = this._onStoreAdd.bind(this);
  }

  /**
  * Event handler when a store is added to fluxapp
  *
  * @param {String} id    Store name
  * @param {Class} Store Store constructor
  */
  _onStoreAdd(id, Store) {
    this._stores[id] = new Store(this);
  }

  /**
  * Event Handler when a store is removed from fluxapp
  *
  * @param {String} id store name
  */
  _onStoreRemove(id) {
    delete this._stores[id];
  }

  /**
  * Event Handler when actions are added to fluxapp
  *
  * @param {String} id     namespace
  * @param {Class} Action constructor for the actions
  */
  _onActionAdd(namespace, Action) {
    this._actions[namespace] = new Action(namespace, this);
  }

  /**
  * Event handler, when action is removed from fluxapp
  *
  * @param {String} id action namespace
  */
  _onActionRemove(id) {
    delete this._actions[id];
  }

  /**
  * Dehydrate Stores
  *
  * @return {Object}
  */
  _dehydrateStores() {
    const storeData = {};
    const stores = this._stores;

    Object.keys(stores).map((id) => {
      const state = stores[ id ].dehydrate();

      if (state) {
        storeData[ id ] = state;
      }
    });

    return storeData;
  }

  /**
   * Bootstraps the page context
   *
   * @param  {Object} request Route Request object
   * @param  {Object} options Options for the context generator
   * @return {Object}         Page Component, State and method
   */
  _getPageContext(request, options) {
    const router = this._fluxApp.getRouter();
    const route = router.getRouteById(request.routeId);

    if (_.isObject(options.state)) {
      this.rehydrate(options.state);
    }

    options.props = _.assign({}, options.props, {
      handler : route.handler,
      context : this,
      params : request.params,
      query : request.query,
      request : request,
    });

    options.wait = options.dehydrate ? true : !! options.wait;

    return new Promise((resolve, reject) => {
      const Element = React.createElement(
        this.getWrapper(),
        options.props
      );
      let result;

      if (options.dehydrate || ! options.state) {
        result = route.loader(request, this).then(() => {
          return {
            element : Element,
            state : options.dehydrate ? this.dehydrate() : {},
            method : options.method,
          };
        });
      }

      if (! result || ! options.wait) {
        result = Promise.resolve({
          element : Element,
          state : options.dehydrate ? this.dehydrate() : {},
          method : options.method,
        });
      }

      resolve(result);
    });
  }

  /**
  * Check if the context is alive or destroyed
  *
  * @param {String} name method which was called on the context
  */
  aliveCheck(name) {
    if (this.destroyed === true) {
      name = name || 'Uknown';

      throw new Error('Fluxapp: Context#' + name + ' called after being destroyed');
    }
  }

  /**
  * Bind the custom context methods to the context
  *
  * @param {Object} methods
  */
  bindContextMethods(methods) {
    _.each(methods, (fn, key) => {
      this[key] = function() {
        this.aliveCheck(key);

        return fn.apply(this, arguments);
      };
    });
  }

  /**
  * Destroy the context
  */
  destroy() {
    this._stores = {};
    this._actions = {};
    this.dispatcher = null;
    this.destroyed = true;

    if (this._fluxApp) {
      this._fluxApp.removeListener('stores.add', this._onStoreAdd)
                   .removeListener('stores.remove', this._onStoreRemove)
                   .removeListener('actions.add', this._onActionAdd)
                   .removeListener('actions.remove', this._onActionRemove);

      this._fluxApp = null;
    }
  }

  /**
  * Converts string based action type to constant
  *
  * @param {String} input
  */
  getActionType(input) {
    this.aliveCheck('getActionType(' + input + ')');

    return this._fluxApp.getActionType(input);
  }

  /**
  * Retrieve a store
  *
  * @param {Object|Null} name
  */
  getStore(name) {
    this.aliveCheck('getStore(' + name + ')');

    const store = this._stores[name];

    if (! store) {
      throw new Error('fluxApp: Could not locate store by the name ' + name);
    }

    return store;
  }

  /**
   * Check if a store is registered
   *
   * @param {Object|Null} name
   */
  hasStore(name) {
    this.aliveCheck(`hasStore(${name})`);

    return !! this._stores[name];
  }

  /**
  * Remove a store from the context
  *
  * @param {String} name
  */
  removeStore(name) {
    this.aliveCheck('removeStore(' + name + ')');

    const store = this.getStore(name);
    const dispatcher = this.getDispatcher();

    if (store) {
      dispatcher.unregister(store.dispatchToken);

      delete this._stores[ name ];

      store.destroy();
    }

    return this;
  }

  /**
  * Get an of actions by namespace and method name
  *
  * @param {String} namespace
  * @param {String} method
  */
  getAction(namespace, method) {
    this.aliveCheck('getAction(' + namespace + ', ' + method + ')');

    const actions = this._actions[ namespace ];

    return actions[ method ].bind(actions);
  }

  /**
  * Get a list of actions by namespace
  *
  * @param {String} namespace
  */
  getActions(namespace) {
    this.aliveCheck('getActions(' + namespace + ')');

    return this._actions[ namespace ];
  }

  /**
  * Remove action namespace
  *
  * @param {String} namespace
  */
  removeActions(namespace) {
    this.aliveCheck('removeActions(' + namespace + ')');

    delete this._actions[ namespace ];

    return this;
  }

  /**
  * Remove action from namespace
  *
  * @param {String} namespace
  * @param {string} method
  */
  removeAction(namespace, method) {
    this.aliveCheck('removeAction(' + namespace + ', ' + method + ')');
    delete this._actions[ namespace ][ method ];
  };

  /**
   * Determine if action exists
   */
  hasAction(namespace, action) {
    this.aliveCheck(`hasActions(${namespace}, ${action})`);

    return this.hasActions(namespace) && !! this.getActions(namespace)[action];
  }

  /**
   * Determine if action namespace exists
   */
  hasActions(namespace) {
    this.aliveCheck(`hasActions(${namespace})`);

    return !! this._actions[ namespace ];
  }

  /**
   * Set the wrapper used in getPageContext
   * @param {Object} wrapper React Class
   */
  setWrapper(wrapper) {
    this.wrapper = wrapper;

    return this;
  }

  /**
   * Get the wrapper
   *
   * @return {Object} React Class
   */
  getWrapper() {
    return this.wrapper;
  }

  /**
  * Get the contexts dispatcher
  */
  getDispatcher() {
    this.aliveCheck('getDispatcher');

    return this.dispatcher;
  }

  /**
   * Gets the request object and initiates the page context generator
   *
   * @param  {String|Object} path    url string or request object
   * @param  {Object} options The page generation options
   * @return {Promise}
   */
  getPageContext(path, options) {
    this.aliveCheck('render()');

    const router = this._fluxApp.getRouter();
    const requestOptions = _.pick(options, 'method');
    const request = _.isString(path) ? router.build(path, requestOptions) : path;

    return request ? this._getPageContext(request, options || {}) : Promise.resolve({
      element : false,
      state : {},
    });
  }

  /**
   * Generates page contexts and renders to string
   *
   * @param  {String|Object} path    url string or request object
   * @param  {Object} options The page generation options
   * @return {Promise}
   */
  renderToString(path, options) {
    return this.getPageContext(path, options).then((page) => {
      if (page && page.element) {
        page.element = ReactDOMServer.renderToString(page.element);
        this.destroy();
      }

      return page;
    });
  }

  /**
   * Generates page contexts and renders to string
   *
   * @param  {String|Object} path    url string or request object
   * @param  {Object} options The page generation options
   * @return {Promise}
   */
  render(path, options) {
    return this.getPageContext(path, options).then(function _render(page) {
      if (page && page.element) {
        ReactDOM.render(
          page.element,
          options.container
        );
      }

      return page;
    });
  }

  /**
  * Dehydrate Context
  *
  * @return {fluxAppContext}
  */
  dehydrate() {
    this.aliveCheck('dehydrate()');

    return {
      stores : this._dehydrateStores(),
    };
  }
}
