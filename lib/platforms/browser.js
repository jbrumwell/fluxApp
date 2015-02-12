'use strict';

var React = require('react');

var CONTAINER_ID = 'fluxapp-container';

function renderComponent(routeStore, Component, serverSideRendered, routeId) {
  if (routeStore.state.current.id === routeId) {
    React.render(React.createElement(Component, {
      serverSideRendered : true
    }), document.getElementById(CONTAINER_ID));
  }
}

module.exports = function initBrowser(fluxApp) {
  var router = require('fluxapp-router');
  router.use(fluxApp);

  var routeStore = router.getStore();

  routeStore.addChangeListener(function(change) {
    var current = routeStore.state.current;
    var route = current.route;
    var isInitialRender = routeStore.state.history.length === 1;
    var Component = route.handler;

    if (isInitialRender) {
      var state = JSON.parse(document.getElementById(CONTAINER_ID)
        .getAttribute('data-fluxapp-state'));

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

  fluxApp.platform = {
    router : router
  };

  setTimeout(router.init, 0);
};
