'use strict';
var pathToRegex = require('path-to-regexp');
var pathMatch = require('path-match')();
var _ = require('lodash');
var immutable = require('immutable');
var uuid = require('node-uuid');
var url = require('url');

function Router(routes) {
  this._routes = {};

  this.addRoutes(routes);
}

/**
 * Returns a route satisfying path and metadata constraints
 *
 * @param {Object} path
 * @param {Object} meta
 */
Router.prototype.getRoute = function getRoute(path, meta) {
  var self = this;
  var parsed = typeof path === 'string' ? url.parse(path, true) : path;
  var notFound;
  var found;

  meta = meta || {};

  _.some(this._routes, function(route, key) {
    if (route.get('regex').exec(parsed.pathname) && self._methodMatch(meta.method, route.get('method'))) {
      found = route;
    } else if (route.get('notFound')) {
      notFound = route;
    }

    return found;
  });

  found = found || notFound;

  if (found) {
    found = found.toObject();

    found = _.assign(found, this._pullParams(found, parsed));
  }

  console.log(found);

  return found;
};

Router.prototype.getRouteById = function getRouteById(id) {
  var found = this._routes[id];

  if (! found) {
    _.some(this._routes, function(route, key) {
      if (route.get('notFound')) {
        found = route;
      }

      return found;
    });
  }

  return found && found.toObject();
};

/**
 * Parses parameters in a route into a route.query and route.params objects
 *
 * @param {Object} route
 * @param {Object} path
 */
Router.prototype._pullParams = function pullParams(route, parsed) {
  return {
    params: pathMatch(route.path)(parsed.pathname),
    query: parsed.query
  };
};

/**
 * Checks if a supplied method is supported by a given route
 *
 * @param {String} supplied
 * @param {Object} route
 */
Router.prototype._methodMatch = function methodMatch(supplied, route) {
  var match = false;

  if (supplied) {
    supplied = supplied.toLowerCase();
  }

  if (route) {
    if (! supplied ||
      (route === supplied || (Array.isArray(route) && (-1 !== route.indexOf(supplied))))
    ) {
      match = true;
    }
  } else {
    match = true;
  }

  return match;
};

/**
 * A wrapper for adding many routes
 *
 * @param {Array} routes
 */
Router.prototype.addRoutes = function addRoutes(routes) {
  if (Array.isArray(routes)) {
    routes.forEach(this.addRoute.bind(this));
  }
};

/**
 * Adds a route into the router
 *
 * @param {Object} route
 */
Router.prototype.addRoute = function addRoute(route) {
  if (! route.id) {
    route.id = uuid.v4();
  }

  if (this._routes[ route.id ]) {
    throw new Error('fluxapp:router Route with id ' + route.id + ' already exists');
  }

  if (! route.path) {
    throw new Error('fluxApp:router requires a path to be registered');
  }

  if (! route.handler) {
    throw new Error('fluxApp:router requires a handler to be registered');
  }

  route.regex = pathToRegex(route.path);

  if (route.method) {
    route.method = route.method.toLowerCase();
  }

  if (route.handler.load) {
    route.loader = route.handler.load;
  }

  if (! route.loader) {
    route.loader = function defaultLoadHandler() {
      return Promise.resolve();
    };
  }

  this._routes[route.id] = immutable.fromJS(route);

  return this;
};

module.exports = Router;
