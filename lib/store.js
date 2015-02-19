'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var mixin = require('../util/mixin');

var CHANGE_EVENT = 'changed';

/**
 * Base Store
 */
function BaseStore(spec) {
  EventEmitter.apply(this)
  this.setMaxListeners(1000);

  this.state = this.getInitialState();

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
  var fluxApp = require('./');
  var Dispatcher = fluxApp.getDispatcher();

  this.dispatchToken = Dispatcher.register(this._processActionEvent.bind(this));
};

/**
* Ease the use of wait for inside the store
*
* @param {[type]} stores [description]
*/
BaseStore.prototype.waitFor = function waitFor(stores) {
  var fluxApp = require('./');
  var dispatcher = fluxApp.getDispatcher();
  var tokens;

  if (typeof stores === 'string') {
    stores = stores.split(',');
  }

  tokens = stores.map(function storeToToken(name) {
    var store = fluxApp.getStore(name.trim());

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
* @param {String} name
*/
BaseStore.prototype.getStore = function getStore(name) {
  var fluxApp = require('./');

  return fluxApp.getStore(name);
},

/*
 * Process a dispatched event
 * @param {Object} payload
 */
BaseStore.prototype._processActionEvent = function _processActionEvent(payload) {
  var method = this._actionTypes[ payload.actionType ];

  if (method && this[ method ]) {
    this[ method ](payload.payload, payload.actionType);
  }

  return this;
}; /*jshint ignore:line */

/**
 * Fallback for store initiation
 * @return {Object}
 */
BaseStore.prototype.init = function init() {
  return {};
};

/**
* Fallback for store destruction
*/
BaseStore.prototype.destroy = function destroy() {};

/**
 * Initiates the state for the store
 */
BaseStore.prototype.getInitialState = function getInitialState() {
  return {};
};

/**
 * Set the state of the store
 * @param {Object} state
 */
BaseStore.prototype.setState = function setState(state) {
  this.state = _.extend(this.state, state);

  this.emitChange();

  return this;
};

/**
 * Inform listeners that the store has updated
 */
BaseStore.prototype.emitChange = function emitChange() {
  this.emit(CHANGE_EVENT);

  return this;
};

/**
 * Add a listener to this store
 * @param {Function} cb
 */
BaseStore.prototype.addChangeListener = function addChangeListener(cb) {
  this.on(CHANGE_EVENT, cb);

  return this;
};

/**
 * Remove the specified listener
 * @param {Function} cb
 */
BaseStore.prototype.removeChangeListener = function removeChangeListener(cb) {
  this.removeListener(CHANGE_EVENT, cb);

  return this;
};

/**
 * Dehydrate returns the state of the store for transmittion to client
 * @return {Object|Null}
 */
BaseStore.prototype.dehydrate = function dehydrate() {
  var state = _.assign({}, this.state);

  this.state = {};

  return state;
};

/**
 * Re-hydrate the stores state
 * @return {BaseStore}
 */
BaseStore.prototype.rehydrate = function rehydrate(data) {
  this._processActionEvent({
    actionType : data[0],
    payload : data[1]
  });

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
    BaseStore.call(this, spec);
  }

  spec = spec || {};

  if (typeof name === 'object') {
    spec = name;
  } else {
    spec.id = name;
  }

  Store.prototype = Object.create(BaseStore.prototype);

  StoreWithSpec = mixin(Store, spec);

  return new StoreWithSpec(spec);
};

/**
 * The BaseStore Implementation
 * @type {Constructor}
 */
module.exports.BaseStore = BaseStore;
