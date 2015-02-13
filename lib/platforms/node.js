'use strict';

var Promise = require('bluebird');
var react = require('react');
var _ = require('lodash');

var TEMPLATE = _.template("<div id='fluxapp-container' " +
  "class='app' data-fluxapp-state='<%= state %>'><%= page %></div>");

function render(fluxApp, request) {

  var route = fluxApp.matchRoute(request.path, {
    method : request.method
  });

  if (! route) {
    return Promise.reject(404);
  }

  var componentClass = route.handler;

  var Component = react.createFactory(componentClass);

  return componentClass.load(route).then(function pageLoaded(stores) {
    var state = {
      stores : stores || {}
    };

    // populate the stores with the data returned from the loader
    fluxApp.rehydrate(state);

    var page = react.renderToString(Component()); // jshint ignore:line

    return TEMPLATE({
      state: JSON.stringify(state),
      page: page
    });
  });
}

module.exports = function initNode(fluxApp) {

  fluxApp.platform = {
    render: _.partial(render, fluxApp),
    router: require('fluxapp-router')
  };
};
