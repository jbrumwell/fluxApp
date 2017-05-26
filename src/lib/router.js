'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _routeParser = require('route-parser');

var _routeParser2 = _interopRequireDefault(_routeParser);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var Router = (function () {
  function Router(routes) {
    _classCallCheck(this, Router);

    this._routes = {};
    this._parsers = {};

    if (routes) {
      this.addRoutes(routes);
    }
  }

  _createClass(Router, [{
    key: 'build',
    value: function build(to) {
      var meta = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var strict = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      var parsed = false;
      var path = to;
      var route = this.getRoute(to, meta, strict);
      var parser = undefined;

      if (route) {
        parser = this._parsers[route.id];

        if (route.id === path) {
          path = parser.reverse(meta.params);
        }

        if (!path) {
          throw new Error('fluxapp:router:build Missing required parameters, unable to build route.');
        }

        parsed = _lodash2['default'].merge(_lodash2['default'].pick(_url2['default'].parse(path, true), 'path', 'pathname', 'query', 'hash'), meta);

        parsed.params = parsed.params || {};
        parsed.url = _url2['default'].format(parsed);
        parsed.routeId = route.id;

        if (route.id !== path) {
          parsed.params = _lodash2['default'].assign(parsed.params, parser.match(parsed.url));
        }
      }

      return parsed;
    }
  }, {
    key: 'getRoute',
    value: function getRoute(input, meta, strict) {
      var route = input;

      if (!_lodash2['default'].isObject(input)) {
        route = this.getRouteById(input, true);

        if (!route) {
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
  }, {
    key: 'getRouteByUrl',
    value: function getRouteByUrl(path, meta, strict) {
      var _this = this;

      var fields = ['pathname', 'query', 'hash'];
      var parsed = _lodash2['default'].pick(_url2['default'].parse(path.toString(), true), fields);
      var params = undefined;
      var notFound = false;
      var found = false;

      path = _url2['default'].format(parsed);
      meta = meta || {};

      _lodash2['default'].some(this._routes, function (route, key) {
        params = _this._parsers[route.id].match(path);

        if (params && _this._methodMatch(meta.method, route.method)) {
          if (!route.notFound) {
            found = route;
          } else if (!strict && (!notFound || route.path > notFound.path)) {
            notFound = route;
          }
        }

        return found;
      });

      if (!found && notFound) {
        found = notFound;
      }

      return found ? found.asMutable() : false;
    }
  }, {
    key: 'getRouteById',
    value: function getRouteById(id, strict) {
      var found = this._routes[id];

      if (!found && !strict) {
        _lodash2['default'].some(this._routes, function (route, key) {
          if (route.notFound) {
            found = route;
          }

          return found;
        });
      }

      return found ? found.asMutable() : false;
    }
  }, {
    key: 'getParserById',
    value: function getParserById(id) {
      return this._parsers[id];
    }

    /**
     * Checks if a supplied method is supported by a given route
     *
     * @param {String} supplied
     * @param {Object} route
     */
  }, {
    key: '_methodMatch',
    value: function _methodMatch(supplied, route) {
      var match = false;

      if (supplied) {
        supplied = supplied.toLowerCase();
      }

      if (route) {
        if (!supplied || (route === supplied || Array.isArray(route) && -1 !== route.indexOf(supplied))) {
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
  }, {
    key: 'addRoutes',
    value: function addRoutes(routes) {
      if (Array.isArray(routes)) {
        routes.forEach(this.addRoute.bind(this));
      }
    }

    /**
     * Adds a route into the router
     *
     * @param {Object} route
     */
  }, {
    key: 'addRoute',
    value: function addRoute(route) {
      if (!route.id) {
        throw new Error('fluxapp:router Route requires an id property.');
      }

      if (this._routes[route.id]) {
        throw new Error('fluxapp:router Route with id ' + route.id + ' already exists');
      }

      if (route.notFound) {
        route.path = !route.path ? '/*path' : _path2['default'].join(route.path, '/*path');
      }

      if (!route.path) {
        throw new Error('fluxApp:router requires a path to be registered');
      }

      if (!route.handler) {
        throw new Error('fluxApp:router requires a handler to be registered');
      }

      if (route.method) {
        route.method = route.method.toLowerCase();
      }

      if (route.handler.loader) {
        route.loader = route.handler.loader;
      }

      if (!route.loader) {
        route.loader = _lodash2['default'].noop;
      }

      route.loader = _bluebird2['default'].method(route.loader);

      this._routes[route.id] = (0, _seamlessImmutable2['default'])(route);
      this._parsers[route.id] = new _routeParser2['default'](route.path);

      return this;
    }
  }]);

  return Router;
})();

exports['default'] = Router;
;
module.exports = exports['default'];