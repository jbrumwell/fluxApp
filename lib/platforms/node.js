'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var utils = require('./utils');
var FluxAppRequest = require('../request');

function genTemplate(containerId) {
  return _.template("<div id='" + containerId + "' " +"class='app'><%= page %></div>" +
    "<script type='text/javascript'>window.fluxAppState = <%= state %>;</script>");
}

var TEMPLATE = genTemplate(utils.CONTAINER_ID);

function render(fluxApp, options, request) {

  var route = fluxApp.matchRoute(request.path, {
    method: request.method
  });

  if (! route) {
    return Promise.reject({ code: 404 });
  }

  return fluxApp.request(route, options).then(function renderResponse(payload) {
    return options.wrap ? TEMPLATE(payload) : payload;
  });
}

module.exports = function initNode(fluxApp, options) {
  options = _.assign({
    wrap: true
  }, options || {});

  if (options.containerId) {
    TEMPLATE = genTemplate(options.containerId);
  }

  fluxApp.render = _.partial(render, fluxApp, options);

  fluxApp.createContext = function createContext() {
    return new FluxAppRequest(this);
  }.bind(fluxApp);
};
