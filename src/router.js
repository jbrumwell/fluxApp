import Route from 'route-parser';
import Promise from 'bluebird';
import _ from 'lodash';
import immutable from 'seamless-immutable';
import url from 'url';
import path from 'path';

export default class Router {
  _routes = {};
  _parsers = {};

  constructor(routes) {
    if (routes) {
      this.addRoutes(routes);
    }
  }

  build(to, meta = {}, strict = true) {
    let parsed = false;
    let path = to;
    const route = this.getRoute(to, meta, strict);
    let parser;

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
  }

  getRoute(input, meta, strict) {
    let route = input;

    if (! _.isObject(input)) {
      route = this.getRouteById(input, true);

      if (! route) {
        route = this.getRouteByUrl(input, meta, strict);
      }
    }

    return route;
  }

  /**
   * Returns a route satisfying path and metadata constraints
   *
   * @param {Object} path
   * @param {Object} meta
   */
  getRouteByUrl(path, meta, strict) {
    const fields = ['pathname', 'query', 'hash'];
    const parsed = _.pick(url.parse(path.toString(), true), fields);
    let params;
    let notFound = false;
    let found = false;

    path = url.format(parsed);
    meta = meta || {};

    _.some(this._routes, (route, key) => {
      params = this._parsers[route.id].match(path);

      if (params && this._methodMatch(meta.method, route.method)) {
        if (! route.notFound) {
          found = route;
        } else if (! strict && (! notFound || route.path > notFound.path)) {
          notFound =  route;
        }
      }

      return found;
    });

    if (! found && notFound) {
      found = notFound;
    }

    return found ? found.asMutable() : false;
  }

  getRouteById(id, strict) {
    let found = this._routes[id];

    if (! found && ! strict) {
      _.some(this._routes, (route, key) => {
        if (route.notFound) {
          found = route;
        }

        return found;
      });
    }

    return found ? found.asMutable() : false;
  }

  getParserById(id) {
    return this._parsers[id];
  }

  /**
   * Checks if a supplied method is supported by a given route
   *
   * @param {String} supplied
   * @param {Object} route
   */
  _methodMatch(supplied, route) {
    let match = false;

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
  }

  /**
   * A wrapper for adding many routes
   *
   * @param {Array} routes
   */
  addRoutes(routes) {
    if (Array.isArray(routes)) {
      routes.forEach(this.addRoute.bind(this));
    }
  }

  /**
   * Adds a route into the router
   *
   * @param {Object} route
   */
  addRoute(route) {
    if (! route.id) {
      throw new Error('fluxapp:router Route requires an id property.');
    }

    if (this._routes[ route.id ]) {
      throw new Error('fluxapp:router Route with id ' + route.id + ' already exists');
    }

    if (route.notFound) {
      route.path = ! route.path ? '/*path' : path.join(route.path, '/*path');
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

    if (route.handler.loader) {
      route.loader = route.handler.loader;
    }

    if (! route.loader) {
      route.loader = _.noop;
    }

    route.loader = Promise.method(route.loader);

    this._routes[route.id] = immutable(route);
    this._parsers[route.id] = new Route(route.path);

    return this;
  }
};
