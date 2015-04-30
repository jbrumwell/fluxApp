'use strict';
var Route = require('route-parser');
var _ = require('lodash');
var immutable = require('seamless-immutable');
var uuid = require('node-uuid');
var url = require('url');

function Router(routes) {
  this._routes = {};
  this._patterns = {};

  this.addRoutes(routes);
}

Router.prototype.build = function build(to, options) {
  var isAbsolute = this.isAbsolutePath(to);
  var path = to;
  var parsed;
  var route;

  options = options || {};

  if (! isAbsolute) {
    route = this.getRouteById(to);
    path = route.pattern.reverse(options.params || {});
  }

  if (path) {
    parsed = url.parse(path, true);
    delete parsed.search;
    parsed = _.merge(parsed, options);
    path = url.format(parsed);
  }

  return path;
};

Router.prototype.isAbsolutePath = function isAbsolutePath(path) {
  return typeof path === 'string' && path[0] === '/';
};

/**
 * Returns a route satisfying path and metadata constraints
 *
 * @param {Object} path
 * @param {Object} meta
 */
Router.prototype.getRoute = function getRoute(path, meta) {
  var self = this;
  var parsed = typeof path === 'string' ? url.parse(path, true) : path;
  var params = {};
  var notFound;
  var found;

  meta = meta || {};

  _.some(this._routes, function(route, key) {
    params = self._patterns[route.id].match(parsed.pathname);

    if (params && self._methodMatch(meta.method, route.method)) {
      found = immutable(route).asMutable();
    } else if (route.notFound) {
      notFound = immutable(route).asMutable();
    }

    return found;
  });

  found = found || notFound;

  if (found) {
    found = _.assign(found, {
      params: params,
      query: parsed.query,
      pattern: this._patterns[found.id]
    });
  }

  return found;
};

Router.prototype.getRouteById = function getRouteById(id) {
  var found = this._routes[id];

  if (! found) {
    _.some(this._routes, function(route, key) {
      if (route.notFound) {
        found = route;
      }

      return found;
    });
  }

  found = found.asMutable();
  found.pattern = this._patterns[found.id];

  return found;
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

  this._routes[route.id] = immutable(route);
  this._patterns[route.id] = new Route(route.path);

  return this;
};

module.exports = Router;
