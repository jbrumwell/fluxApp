'use strict';

var React = require('react');
var router = require('fluxapp-router');
var utils = require('./utils');

var CONTAINER_ID = utils.CONTAINER_ID;

function renderComponent(routeStore, Component, serverSideRendered, routeId) {
  if (routeStore.state.current.id === routeId) {
    React.render(React.createElement(Component, {
      serverSideRendered: serverSideRendered
    }), document.getElementById(CONTAINER_ID));
  }
}

module.exports = function initBrowser(fluxApp, options) {
  options = options || {};
  CONTAINER_ID = options.containerId || utils.CONTAINER_ID;

  var routeStore = router.getStore();

  routeStore.addChangeListener(function(change) {
    var current = routeStore.state.current;
    var route = current.route;
    var isInitialRender = routeStore.state.history.length === 1;
    var Component = route.handler;

    if (isInitialRender) {
      var state = options.state || window.fluxAppState;

      fluxApp.rehydrate(state);

      renderComponent(routeStore, Component, true, current.id);
    } else if (typeof Component.load === 'function') {
      Component.load(route).then(
        renderComponent.bind(null, routeStore, Component, false, current.id)
      );
    } else {
      renderComponent(routeStore, Component, false, current.id);
    }
  });

  setTimeout(router.init, 0);
};
