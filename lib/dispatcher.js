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
    this._queued = [];
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
      var id = _prefix + _lastID;
      this._callbacks[id] = _bluebird2['default'].method(callback);

      _lastID += 1;
      return id;
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
      var _this = this;

      return new _bluebird2['default'](function (resolve, reject) {
        _this._queued.push([payload, resolve, reject]);
      });
    }

    /**
     * Drains the queue of the next job
     */
  }, {
    key: '_drain',
    value: function _drain() {
      if (this._queued.length) {
        var args = this._queued.shift();
        var payload = args[0];
        var resolve = args[1];
        var reject = args[2];

        this.dispatch(payload).then(resolve, reject);
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
      var _this2 = this;

      return _bluebird2['default'].using(this._batchPromise(batch), function (idxs) {
        return _bluebird2['default'].each(idxs, function (idx) {
          _this2._dispatchingId = idx;
          _this2._openPromises.push(idx);

          return _bluebird2['default'].using(_this2._jobPromise(idx), function () {
            var cb = _this2._pending[idx];

            return cb ? cb() : null;
          });
        });
      });
    }
  }, {
    key: '_batchPromise',
    value: function _batchPromise(promises) {
      var _this3 = this;

      return _bluebird2['default'].resolve(_lodash2['default'].keys(promises)).disposer(function () {
        _this3._dispatchingId = null;

        return _this3._stopDispatching();
      });
    }
  }, {
    key: '_jobPromise',
    value: function _jobPromise(idx) {
      var _this4 = this;

      return _bluebird2['default'].resolve().disposer(function () {
        return _this4._postDispatch(idx);
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
    value: function dispatch(payload) {
      var _this5 = this;

      if (this._isDispatching) {
        return this._queue(payload);
      }

      this._isDispatching = true;

      this._openPromises = [];

      this._pending = {};

      Object.keys(this._callbacks).forEach(function (idx) {
        _this5._pending[idx] = function () {
          return _lodash2['default'].isFunction(_this5._callbacks[idx]) ? _this5._callbacks[idx](payload) : _bluebird2['default'].resolve();
        };
      });

      return this._dispatchBatch(this._callbacks);
    }

    /*
     * Dispatch shutdown
     */
  }, {
    key: '_stopDispatching',
    value: function _stopDispatching() {
      this._isDispatching = false;
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
      var _this6 = this;

      if (!this._isDispatching) {
        throw new Error('Dispatcher.waitFor(...): Must be invoked while dispatching.');
      }

      var pending = {};

      ids.forEach(function (id) {
        var cb = _this6._pending[id];

        if (!_this6._callbacks[id]) {
          throw new Error('Dispatcher.waitFor(...): `' + id + '` does not map to a registered callback.');
        }

        if (-1 !== _this6._openPromises.indexOf(id)) {
          throw new Error('Dispatcher.waitFor(...): Circular dependency detected');
        }

        if (_this6._pending[id]) {
          pending[id] = cb;
        }
      });

      return _lodash2['default'].keys(pending).length ? this._dispatchBatch(pending) : _bluebird2['default'].resolve();
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
    }
  }]);

  return Dispatcher;
})();

exports['default'] = Dispatcher;
module.exports = exports['default'];