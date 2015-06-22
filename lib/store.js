'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var mixin = require('../util/mixin');
var immutable = require('seamless-immutable');

var CHANGE_EVENT = 'changed';

/**
 * Base Store
 */
function BaseStore(spec, context) {
  EventEmitter.apply(this);

  this.setMaxListeners(1000);

  if (! context) {
    throw new Error('fluxApp: Context must be passed to the BaseStore');
  }

  this.context = context;
  this.state = immutable(this.getInitialState());

  this._initActions(spec.actions || {});
  this._initDispatcher();

  this.init();
}

util.inherits(BaseStore, EventEmitter);

/**
 * Initiate the actions provided by the spec
 * @param {Object} actions
 */
BaseStore.prototype._initActions = function initActions(actions) {
  var self = this;
  var namespaceTransform = require('../util/namespaceTransform');

  this._actionTypes = {};

  Object.keys(actions).forEach(function addAction(method) {
    var value = actions[method];

    if (! Array.isArray(value)) {
      value = [ value ];
    }

    value.forEach(function processAction(name) {
      name = namespaceTransform(name);

      self._actionTypes[name] = method;
    });
  });
};

/**
 * Initiate the dispatch event
 */
BaseStore.prototype._initDispatcher = function initDispatcher() {
  var Dispatcher = this.context.getDispatcher();

  this.dispatchToken = Dispatcher.register(this._processActionEvent.bind(this));
};

/**
* Wait for a list of stores before processing
*
* <pre>
*   <code>
*     this.waitFor('session').then(function() {
*       // session store has processed
*     });
*   </code>
* </pre>
*
* @param {String} stores comma delimited list of stores
*/
BaseStore.prototype.waitFor = function waitFor(stores) {
  var context = this.context;
  var dispatcher = context.getDispatcher();
  var tokens;

  if (typeof stores === 'string') {
    stores = stores.split(',');
  }

  tokens = stores.map(function storeToToken(name) {
    var store = context.getStore(name.trim());

    if (! store) {
      throw new Error('fluxapp:componentMixin waitFor unable to locate store ' + name.trim());
    }

    return store.dispatchToken;
  });

  return dispatcher.waitFor(tokens);
},

/**
* Ease the use of getStore for the store
*
* <pre>
*   <code>
*     this.getStore('name');
*   </code>
* </pre>
*
* @param {String} name
*/
BaseStore.prototype.getStore = function getStore(name) {
  return this.context.getStore(name);
},

/*
 * Process a dispatched event
 * @param {Object} payload
 */
BaseStore.prototype._processActionEvent = function _processActionEvent(payload) {
  var method = this._actionTypes[ payload.actionType ];

  if (method && this[ method ]) {
    if (['replaceState', 'setState'].indexOf(method) === -1) {
      this[ method ](payload.payload, payload.actionType);
    } else {
      this[ method ](payload.payload);
    }
  }

  return this;
}; /*jshint ignore:line */

/**
* Fallback for store initiation
*
* <pre>
*   <code>
*     fluxapp.registerStore('user', {
*       init: function() {
*         // store is being created
*       }
*     });
*   </code>
* </pre>
*
* @return {Object}
*/
BaseStore.prototype.init = function init() {};

/**
* Fallback for store destruction
*/
BaseStore.prototype.destroy = function destroy() {};

/**
* Initiates the state for the store
*
* <pre>
*   <code>
*     fluxapp.registerStore('user', {
*       getInitialState: function() {
*         return {
*           users: []
*         };
*       },
*
*       getAll: function() {
*         return this.state.users;
*       }
*     });
*   </code>
* </pre>
*/
BaseStore.prototype.getInitialState = function getInitialState() {
  return {};
};

/**
 * Set the state of the store
 *
 * <pre>
 *   <code>
 *     fluxapp.registerStore('user', {
 *       actions: {
 *         onUserLogin: 'user.login',
 *       },
 *
 *       onUserLogin: function(user) {
 *         this.setState({
 *           token: user.token
 *         });
 *       }
 *     });
 *   </code>
 * </pre>
 *
 * @param {Object} state
 */
BaseStore.prototype.setState = function setState(state, noEvent) {
  var currentState = this.getMutableState();
  var isEqual = _.isEqual(currentState, state);

  this.state = isEqual ? this.state : immutable(currentState).merge(state);

  if (! noEvent && ! isEqual) {
    this.emitChange();
  }

  return this;
};

/**
* Replace the state of the store
*
* <pre>
*   <code>
*     fluxapp.registerStore('user', {
*       actions: {
*         onUserLogout: 'user.logout',
*       },
*
*       onUserLogout: function() {
*         this.replaceState({});
*       }
*     });
*   </code>
* </pre>
*
* @param {Object} state
*/
BaseStore.prototype.replaceState = function replaceState(state, noEvent) {
  var isEqual = _.isEqual(this.getMutableState(), state);

  this.state = isEqual ? this.state : immutable(state);

  if (! noEvent && ! isEqual) {
    this.emitChange();
  }

  return this;
};

/**
 * Get the state of the store
 */
BaseStore.prototype.getState = function getState() {
  return this.state;
};

/**
 * Get the state of the store as mutatable
 */
BaseStore.prototype.getMutableState = function getMutableState() {
  return this.state.asMutable({deep: true});
};

/**
 * Inform listeners that the store has updated
 */
BaseStore.prototype.emitChange = function emitChange() {
  this.emit(CHANGE_EVENT, this.getMutableState(), this.id);

  return this;
};

/**
* Add a listener to this store
*
* <pre>
*   <code>
*     var context = fluxapp.getContext();
*     var store = context.getStore('name');
*
*     function onChange(state) {
*       // state on store 'name' was changed
*     }
*
*     store.addChangeListener(onChange);
*   </code>
* </pre>
*
* @param {Function} cb
*/
BaseStore.prototype.addChangeListener = function addChangeListener(cb) {
  this.on(CHANGE_EVENT, cb);

  return this;
};

/**
 * Remove the specified listener
 *
 * <pre>
 *   <code>
 *     var context = fluxapp.getContext();
 *     var store = context.getStore('name');
 *
 *     function onChange(state) {
 *       // will only be called once
 *       store.removeChangeListener(onChange);
 *     }
 *
 *     store.addChangeListener(onChange);
 *   </code>
 * </pre>
 * @param {Function} cb
 */
BaseStore.prototype.removeChangeListener = function removeChangeListener(cb) {
  this.removeListener(CHANGE_EVENT, cb);

  return this;
};

/**
 * Dehydrate returns the state of the store for transmittion to client
 *
 * <pre>
 *   <code>
 *     var context = fluxapp.getContext();
 *     var store = context.getStore('search');
 *
 *     // emit actions to populate the store
 *
 *     var state = store.dehydrate();
 *
 *     if (state) {
 *       // store was mutated
 *     }
 *   </code>
 * </pre>
 * @return {Object|Null}
 */
BaseStore.prototype.dehydrate = function dehydrate() {
  var state = false;
  var current = this.getState();

  if (! _.isEqual(current, this.getInitialState())) {
    state = _.assign({}, current)
  }

  return state;
};

/**
 * Re-hydrate the stores state
 * @return {BaseStore}
 */
BaseStore.prototype.rehydrate = function rehydrate(data) {
  this.replaceState(data, true);

  return this;
};

/**
 * Creates a store and mixes in the spec provided
 *
 * @param  {String|Object} name The name of the store
 * @param  {Object|Null} spec The spec to merge into the base prototype
 * @return {StoreWithSpec}
 */
module.exports = function createStore(name, spec) {
  var StoreWithSpec;

  function Store(spec) {
    BaseStore.apply(this, arguments);
  }

  spec = spec || {};

  if (typeof name === 'object') {
    spec = name;
  } else {
    spec.id = name;
  }

  Store.prototype = Object.create(BaseStore.prototype);

  StoreWithSpec = mixin(Store, spec);

  return StoreWithSpec.bind(null, spec);
};

/**
 * The BaseStore Implementation
 * @type {Constructor}
 */
module.exports.BaseStore = BaseStore;
