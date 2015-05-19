'use strict';

var Route = require('route-parser');
var Promise = require('bluebird');
var _ = require('lodash');
var immutable = require('seamless-immutable');
var uuid = require('node-uuid');
var url = require('url');
var path = require('path');

function Router(routes) {
  this._routes = {};
  this._parsers = {};

  this.addRoutes(routes);
}

Router.prototype.build = function build(to, meta) {
  var parsed = false;
  var path = to;
  var route = this.getRoute(to, meta, true);
  var parser;

  meta = meta || {};

  if (route) {
    parser = this._parsers[route.id];

    if (route.id === path) {
      path = parser.reverse(meta.params);
    }

    if (! path) {
      throw new Error('fluxapp:router:build Missing required parameters, unable to build route.');
    }

    parsed = _.merge(
      _.pick(url.parse(path, true), 'path', 'pathname', 'query', 'hash'),
      meta
    );

    parsed.params = parsed.params || {};
    parsed.url = url.format(parsed);
    parsed.routeId = route.id;

    if (route.id !== path) {
      parsed.params = _.assign(parsed.params, parser.match(parsed.url));
    }
  }

  return parsed;
};

Router.prototype.getRoute = function getRoute(input, meta, only) {
  var route = input;

  if (! _.isObject(input)) {
    route = this.getRouteById(input, only);

    if (! route) {
      route = this.getRouteByUrl(input, meta, only);
    }
  }

  return route;
};

/**
 * Returns a route satisfying path and metadata constraints
 *
 * @param {Object} path
 * @param {Object} meta
 */
Router.prototype.getRouteByUrl = function getRouteByUrl(path, meta, only) {
  var self = this;
  var fields = ['pathname', 'query', 'hash'];
  var parsed = _.pick(url.parse(path.toString(), true), fields);
  var params;
  var notFound = false;
  var found = false;

  path = url.format(parsed);
  meta = meta || {};

  _.some(this._routes, function(route, key) {
    params = self._parsers[route.id].match(path);

    if (params && self._methodMatch(meta.method, route.method)) {
      if(! route.notFound) {
        found = route;
      } else if (! only && (! notFound || route.path > notFound.path)) {
        notFound =  route;
      }
    }

    return found;
  });

  if (! found && notFound) {
    found = notFound;
  }

  return found ? found.asMutable() : false;
};

Router.prototype.getRouteById = function getRouteById(id, only) {
  var found = this._routes[id];

  if (! found && ! only) {
    _.some(this._routes, function(route, key) {
      if (route.notFound) {
        found = route;
      }

      return found;
    });
  }

  return found ? found.asMutable() : false;
};

Router.prototype.getParserById = function getParserById(id) {
  return this._parsers[id];
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
    throw new Error('fluxapp:router Route requires an id property.');
  }

  if (this._routes[ route.id ]) {
    throw new Error('fluxapp:router Route with id ' + route.id + ' already exists');
  }

  if (route.notFound) {
    route.path = ! route.path ? '/*path' : path.join(route.path,'/*path');
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
    route.loader = _.noop;
  }

  route.loader = Promise.method(route.loader);

  this._routes[route.id] = immutable(route);
  this._parsers[route.id] = new Route(route.path);

  return this;
};

module.exports = Router;
