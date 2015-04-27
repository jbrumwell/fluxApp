/*global window, document */
'use strict';

var React = require('react');
var utils = require('./utils');

var CONTAINER_ID = utils.CONTAINER_ID;

function renderComponent(routeStore, Component, serverSideRendered) {
  React.render(React.createElement(Component, {
    serverSideRendered : serverSideRendered
  }), document.getElementById(CONTAINER_ID));
}

module.exports = function initBrowser(fluxApp, options) {
  options = options || {};
  CONTAINER_ID = options.containerId || utils.CONTAINER_ID;

  var router = fluxApp.getRouter();
  var routeStore = router.getStore();

  routeStore.addChangeListener(function(change) {
    var currentRoute = routeStore.state.current;
    var route = currentRoute.route;
    var isInitialRender = routeStore.state.history.length === 1;
    var Component = route.handler;

    if (isInitialRender) {
      var state = options.state || window.fluxAppState;

      fluxApp.rehydrate(state);

      renderComponent(routeStore, Component, true);
    } else if (typeof Component.load === 'function') {
      Component.load(route, fluxApp.createContext()).then(
        renderComponent.bind(null, routeStore, Component, false)
      );
    } else {
      renderComponent(routeStore, Component, false);
    }
  });

  setTimeout(router.init.bind(router), 0);

  fluxApp.createContext = function createContext() {
    return this;
  }.bind(fluxApp);
};
