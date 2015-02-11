'use strict';
var pathToRegex = require('path-to-regexp');
var pathMatch = require('path-match')();
var _ = require('lodash');

function Router(routes) {
  this._routes = [];

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
  var notFound;
  var found;

  meta = meta || {};
  var baseUrl = path.split('?')[0];

  this._routes.some(function(route) {
    if (route.regex.exec(baseUrl) && self._methodMatch(meta.method, route.method)) {
      found = self._pullParams(route, path);
    } else if (route.notFound) {
      notFound = route;
    }

    return found;
  });

  return found || notFound;
};

/**
 * Parses parameters in a route into a route.query and route.params objects
 *
 * @param {Object} route
 * @param {Object} path
 */
Router.prototype._pullParams = function pullParams(route, path) {

  var splitUrl = path.split('?');
  var baseUrl  = splitUrl[0];

  // Get the query params
  if (splitUrl.length > 1) {
    var queryParams = _.last(splitUrl).split('&');
    route.query = _.reduce(queryParams, function(params, param) {
      var splitParam = param.split('=');
      params[splitParam[0]] = splitParam[1];
      return params;
    }, {});
  }

  route.params = pathMatch(route.path)(baseUrl);
  return route;
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
  if (! route.path) {
    throw new Error('fluxApp:router requires a path to be registered');
  }

  route.regex = pathToRegex(route.path);

  if (route.method) {
    route.method = route.method.toLowerCase();
  }

  this._routes.push(route);

  return this;
};

module.exports = Router;
