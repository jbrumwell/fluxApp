'use strict';
var pathToRegex = require('path-to-regexp');
var pathMatch = require('path-match')();
var _ = require('lodash');

function Router(routes) {
  this._routes = []

  this.addRoutes(routes);
}

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

Router.prototype._pullParams = function pullParams(route, path) {
  // Pulls route parameters from an url

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

Router.prototype.addRoutes = function addRoutes(routes) {
  if (Array.isArray(routes)) {
    routes.forEach(this.addRoute.bind(this));
  }
};

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
