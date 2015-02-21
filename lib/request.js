'use strict';

var _ = require('lodash');
var Dispatcher = require('./dispatcher');

function FluxAppRequest(fluxApp) {
  var self = this;

  this.dispatcher = new Dispatcher();

  this._stores = _.mapValues(fluxApp._stores, function newStoreInstance(store) {
    return store.clone(self);
  });

  this._actions = _.mapValues(fluxApp._actions, function newActionInstance(action) {
    return action.clone(self);
  });
}

FluxAppRequest.prototype.getDispatcher = function getDispatcher() {
  return this.dispatcher;
};

FluxAppRequest.prototype.getStore = function getStore(name) {
  return this._fluxApp.getStore.apply(this, arguments);
};

FluxAppRequest.prototype.removeStore = function removeStore() {
  return this._fluxApp.removeStore.apply(this, arguments);
};

FluxAppRequest.prototype.getActions = function getActions(namespace) {
  return this._fluxApp.getActions.apply(this, arguments);
};

FluxAppRequest.prototype.getAction = function getAction(namespace, method) {
  return this._fluxApp.getAction.apply(this, arguments);
};

module.exports = FluxAppRequest;
