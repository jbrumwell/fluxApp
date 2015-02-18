'use strict';

var Promise = require('bluebird');
var react = require('react');
var _ = require('lodash');
var utils = require('./utils');

function genTemplate(containerId) {
  return _.template("<div id='" + containerId + "' " +
  "class='app' data-fluxapp-state='<%= state %>'><%= page %></div>");
}

var TEMPLATE = genTemplate(utils.CONTAINER_ID);

function render(fluxApp, options, request) {

  var route = fluxApp.matchRoute(request.path, {
    method: request.method
  });

  if (! route) {
    return Promise.reject(404);
  }

  var componentClass = route.handler;

  var Component = react.createFactory(componentClass);

  return componentClass.load(route).then(function pageLoaded(stores) {
    var state = {
      stores: stores || {}
    };

    // populate the stores with the data returned from the loader
    fluxApp.rehydrate(state);

    var page = react.renderToString(Component()); // jshint ignore:line
    var payload = {
      state: JSON.stringify(state),
      page: page
    };

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
};
