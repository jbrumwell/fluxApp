'use strict';
var Route = require('route-parser');
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
  var parsed;
  var route = this.getRoute(to, meta, true);
  var parser;

  meta = meta || {};

  if (route) {
    if (! route.url) {
      route.url = this._parsers[route.id].reverse(meta.params || {});

      if (false === route.url) {
        throw new Error('fluxapp:router:build Missing required parameters, unable to build route.');
      }

      parsed = url.parse(route.url, true);
      delete parsed.search;
      parsed = _.merge(parsed, meta);
      route.url = url.format(parsed);
    }
  }

  return route;
};

Router.prototype.getRoute = function getRoute(input, meta, only) {
  var route = this.getRouteById(input, only);

  if (! route) {
    route = this.getRouteByUrl(input, meta, only);
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
  var notFound;
  var found = false;

  path = url.format(parsed);
  meta = meta || {};

  _.some(this._routes, function(route, key) {
    params = self._parsers[route.id].match(path);

    if (params && self._methodMatch(meta.method, route.method)) {
      if(! route.notFound) {
        found = immutable(route).asMutable();
      } else if (! only && (! notFound || route.path > notFound.path)) {
        notFound =  immutable(route).asMutable();
      }
    }

    return found;
  });

  if (! found && notFound) {
    found = _.assign(notFound, {
      params: {
        url: path,
      },
      query: {},
    });
  } else if (found) {
    found = _.assign(found, {
      url: path,
      params: params || {},
      query: parsed.query,
    });
  }

  return found;
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
    route.id = uuid.v4();
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
    route.loader = function defaultLoadHandler() {
      return Promise.resolve();
    };
  }

  this._routes[route.id] = immutable(route);
  this._parsers[route.id] = new Route(route.path);

  return this;
};

module.exports = Router;
