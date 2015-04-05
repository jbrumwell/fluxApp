'use strict';

var _ = require('lodash');
var Dispatcher = require('./dispatcher');
var Router = require('fluxapp-router');
var IsoFetch = require('iso-fetch');

function FluxAppRequest(fluxApp, options) {
  options = options || {};

  this.dispatcher = new Dispatcher();

  this._fluxApp = fluxApp;
  this.clone(this._fluxApp);

  var platformOpts = fluxApp._platformOptions;
  this._isoFetch = new IsoFetch(platformOpts.fetch, _.assign({}, platformOpts.transports, options));

  this.mixins = fluxApp.mixins;
  this._routerConstants = fluxApp._routerConstants;

  this.removeStore(this._routerConstants.STORE_NAME);
  this.removeActions(this._routerConstants.ACTION_PREFIX);

  this._router = new Router(this);
  this.clone(this);

  this._router._routes = this._stores.__routeStore;
}

FluxAppRequest.prototype.clone = function clone(fluxApp) {
  var self = this;

  this._stores = _.mapValues(fluxApp._stores, function newStoreInstance(store) {
    return store.clone(self);
  });

  this._actions = _.mapValues(fluxApp._actions, function newActionInstance(action) {
    return action.clone(self);
  });
};

FluxAppRequest.prototype.fetch = function fetch() {
  return this._fluxApp.fetch.apply(this, arguments);
};

FluxAppRequest.prototype.getRouter = function getRouter() {
  return this._router;
};

FluxAppRequest.prototype.getActionType = function getActionType() {
  return this._fluxApp.getActionType.apply(this, arguments);
};

FluxAppRequest.prototype.getDispatcher = function getDispatcher() {
  return this.dispatcher;
};

FluxAppRequest.prototype.getStore = function getStore(name) {
  return this._fluxApp.getStore.apply(this, arguments);
};

FluxAppRequest.prototype.removeStore = function removeStore(name) {
  return this._fluxApp.removeStore.apply(this, arguments);
};

FluxAppRequest.prototype.createStore = function createStore(name) {
  return this._fluxApp.createStore.apply(this, arguments);
};

FluxAppRequest.prototype.getActions = function getActions(namespace) {
  return this._fluxApp.getActions.apply(this, arguments);
};

FluxAppRequest.prototype.getAction = function getAction(namespace, method) {
  return this._fluxApp.getAction.apply(this, arguments);
};

FluxAppRequest.prototype.createActions = function createActions(namespace) {
  return this._fluxApp.createActions.apply(this, arguments);
};

FluxAppRequest.prototype.removeActions = function removeActions(namespace) {
  return this._fluxApp.removeActions.apply(this, arguments);
};

FluxAppRequest.prototype.dehydrate = function dehydrate() {
  return this._fluxApp.dehydrate.call(this);
};

FluxAppRequest.prototype._dehydrateStores = function _dehydrateStores() {
  return this._fluxApp._dehydrateStores.call(this);
};

module.exports = FluxAppRequest;
