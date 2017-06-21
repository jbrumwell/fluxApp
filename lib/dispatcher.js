'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _decoratorsPromiseMethod = require('./decorators/promise-method');

var _decoratorsPromiseMethod2 = _interopRequireDefault(_decoratorsPromiseMethod);

var _utilNamespaceTransform = require('./util/namespaceTransform');

var _utilNamespaceTransform2 = _interopRequireDefault(_utilNamespaceTransform);

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Flux dispatcher with promise handling and circular recursion detection.
 *
 * It is different from the standard Flux dispatcher as it allows actions
 * called from within other actions
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._openPromises = [];
    this._callbacks = [];
    this._events = {};
    this._queued = [];
    this._isDispatching = false;
    this._isDispatchingEvent = null;
  }

  _createDecoratedClass(Dispatcher, [{
    key: 'register',

    /**
     * Register a callback with the dispatcher
     *
     * Register a callback with the dispatcher and return a token for unregistering
     *
     * @param  {Function} callback
     * @return {[String]}
     */
    value: function register(callback) {
      var _this = this;

      var events = arguments.length <= 1 || arguments[1] === undefined ? '*' : arguments[1];

      var id = _prefix + _lastID;

      events = _lodash2['default'].isString(events) ? [events] : events;

      if (!_lodash2['default'].size(events)) {
        throw new Error('Fluxapp: Dispatcher requires a list of events or "*" to receive all events');
      }

      this._callbacks[id] = _bluebird2['default'].method(callback);

      _lodash2['default'].each(events, function (event) {
        event = event === '*' ? event : (0, _utilNamespaceTransform2['default'])(event);
        _this._events[event] = _this._events[event] || [];
        _this._events[event].push(id);
      });

      _lastID += 1;

      return id;
    }

    /**
     * Register events to an already bound callback
     *
     * @param  {Integer} dispatchToken
     * @param  {Array} events
     * @return {void}
     */
  }, {
    key: 'registerEvents',
    value: function registerEvents(dispatchToken, events) {
      var _this2 = this;

      if (!this._callbacks[dispatchToken]) {
        throw new Error('Fluxapp: Unable to register event for invalid dispatch token');
      }

      events = _lodash2['default'].castArray(events);

      _lodash2['default'].each(events, function (event) {
        event = event === '*' ? event : (0, _utilNamespaceTransform2['default'])(event);
        _this2._events[event] = _this2._events[event] || [];

        if (!_lodash2['default'].includes(_this2._events[event], dispatchToken)) {
          _this2._events[event].push(dispatchToken);
        }
      });
    }

    /**
     * Register event to an already bound callback
     *
     * @param  {Integer} dispatchToken
     * @param  {Array} events
     * @return {void}
     */
  }, {
    key: 'registerEvent',
    value: function registerEvent(dispatchToken, event) {
      return this.registerEvents(dispatchToken, event);
    }

    /**
     * Unregister events from an already bound callback
     *
     * @param  {Integer} dispatchToken
     * @param  {Array} events
     * @return {void}
     */
  }, {
    key: 'unregisterEvents',
    value: function unregisterEvents(dispatchToken, events) {
      var _this3 = this;

      if (!this._callbacks[dispatchToken]) {
        throw new Error('Fluxapp: Unable to unregister event for invalid dispatch token');
      }

      events = _lodash2['default'].castArray(events);

      _lodash2['default'].each(events, function (event) {
        event = event === '*' ? event : (0, _utilNamespaceTransform2['default'])(event);
        _this3._events[event] = _lodash2['default'].without(_this3._events[event] || [], dispatchToken);
      });
    }

    /**
     * Unregister event from an already bound callback
     *
     * @param  {Integer} dispatchToken
     * @param  {Array} events
     * @return {void}
     */
  }, {
    key: 'unregisterEvent',
    value: function unregisterEvent(dispatchToken, event) {
      return this.unregisterEvents(dispatchToken, event);
    }

    /**
     * Unregisters a callback with the dispatcher
     *
     * @param  {String} id [description]
     */
  }, {
    key: 'unregister',
    value: function unregister(id) {
      delete this._callbacks[id];

      this._events = _lodash2['default'].mapValues(this._events, function (events) {
        return _lodash2['default'].without(events, id);
      });
    }

    /**
     * Determine if the Dispatcher is currently dispatching
     */
  }, {
    key: 'isDispatching',
    value: function isDispatching() {
      return false !== this._isDispatching;
    }

    /*
     * Queues a payload ror the next available iteration
     *
     * @param  {Object} payload
     * @return {Promise}
     */
  }, {
    key: '_queue',
    value: function _queue(payload) {
      var _this4 = this;

      return new _bluebird2['default'](function (resolve, reject) {
        _this4._queued.push([payload, resolve, reject]);
      });
    }

    /**
     * Drains the queue of the next job
     */
  }, {
    key: '_drain',
    value: function _drain() {
      var _this5 = this;

      if (this._queued.length) {
        (function () {
          var args = _this5._queued.shift();
          var payload = args[0];
          var resolve = args[1];
          var reject = args[2];

          setTimeout(function () {
            _this5.dispatch(payload).then(resolve, reject);
          });
        })();
      }
    }

    /*
     * Dispatches a batch of promises
     *
     * @param {Array} promises
     */
  }, {
    key: '_dispatchBatch',
    value: function _dispatchBatch(batch) {
      var _this6 = this;

      return _bluebird2['default'].using(this._batchPromise(batch), function (idxs) {
        return _bluebird2['default'].each(idxs, _this6._dispatchJob.bind(_this6));
      });
    }
  }, {
    key: '_dispatchJob',
    value: function _dispatchJob(idx) {
      var _this7 = this;

      this._dispatchingId = idx;
      this._openPromises.push(idx);

      return _bluebird2['default'].using(this._jobPromise(idx), function () {
        var cb = _this7._pending[idx];

        return cb ? cb() : null;
      });
    }
  }, {
    key: '_batchPromise',
    value: function _batchPromise(promises) {
      var _this8 = this;

      return _bluebird2['default'].resolve(_lodash2['default'].keys(promises)).disposer(function () {
        return _this8._stopDispatching();
      });
    }
  }, {
    key: '_jobPromise',
    value: function _jobPromise(idx) {
      var _this9 = this;

      return _bluebird2['default'].resolve().disposer(function () {
        return _this9._postDispatch(idx);
      });
    }

    /**
     * Dispatch entry point
     *
     * Prepares the regitered callbacks for dispatch and sets up the dispatch specific variables
     *
     * @param  {Object} payload
     * @return {Promise}
     */
  }, {
    key: 'dispatch',
    decorators: [_decoratorsPromiseMethod2['default']],
    value: function dispatch(payload) {
      var _this10 = this;

      if (this._isDispatching) {
        return this._queue(payload);
      }

      var event = payload.actionType;
      var events = _lodash2['default'].chain([]).concat(this._events['*'] || [], this._events[event] || []).uniq().value();

      this._isDispatching = true;
      this._isDispatchingEvent = event;

      this._openPromises = [];

      this._pending = {};

      _lodash2['default'].each(events).forEach(function (idx) {
        _this10._pending[idx] = function () {
          return _lodash2['default'].isFunction(_this10._callbacks[idx]) ? _this10._callbacks[idx](payload) : _bluebird2['default'].resolve();
        };
      });

      return events.length ? this._dispatchBatch(this._pending) : this._stopDispatching();
    }

    /*
     * Dispatch shutdown
     */
  }, {
    key: '_stopDispatching',
    value: function _stopDispatching() {
      this._isDispatching = false;
      this._isDispatchingEvent = null;

      this._drain();
    }

    /**
     * Waits until execution of the given ids has completed
     *
     * @param {Array}
     */
  }, {
    key: 'waitFor',
    decorators: [_decoratorsPromiseMethod2['default']],
    value: function waitFor(ids) {
      var _this11 = this;

      if (!this._isDispatching) {
        throw new Error('Dispatcher.waitFor(...): Must be invoked while dispatching.');
      }

      var pending = [];

      ids.forEach(function (id) {
        var cb = _this11._pending[id];

        if (!_this11._callbacks[id]) {
          throw new Error('Dispatcher.waitFor(...): `' + id + '` does not map to a registered callback.');
        }

        if (-1 !== _this11._openPromises.indexOf(id)) {
          throw new Error('Dispatcher.waitFor(...): Circular dependency detected');
        }

        if (cb) {
          pending.push(id);
        }
      });

      return !_lodash2['default'].size(pending) ? _bluebird2['default'].resolve() : _bluebird2['default'].mapSeries(pending, this._dispatchJob.bind(this));
    }

    /**
     * Is the dispatcher currently dispatching
     *
     * @return {Boolean} [description]
     */
  }, {
    key: 'isDispatching',
    value: function isDispatching() {
      return this._isDispatching;
    }

    /**
     * Method for retrieving the current event being dispatched
     *
     * @return {String}
     */
  }, {
    key: 'getCurrentEvent',
    value: function getCurrentEvent() {
      return this._isDispatchingEvent;
    }

    /*
     * Post Dispatch
     *
     * Called when an individual callback has completed its dispatch
     * removes from pending and open promises
     *
     * @param {String} idx
     */
  }, {
    key: '_postDispatch',
    value: function _postDispatch(idx) {
      if (idx) {
        delete this._pending[idx];

        this._openPromises = this._openPromises.filter(function (id) {
          return idx !== id;
        });
      }

      this._dispatchingId = null;
    }
  }]);

  return Dispatcher;
})();

exports['default'] = Dispatcher;
module.exports = exports['default'];