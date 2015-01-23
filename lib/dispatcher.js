'use strict';

var Promise = require('bluebird');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Flux dispatcher with promise handling and circular recursion detection
 */
function Dispatcher() {
  this._openPromises = [];
  this._callbacks = {};
  this._queued = [];
}

/**
 * Register a callback with the dispatcher
 *
 * Register a callback with the dispatcher and return a token for unregistering
 *
 * @param  {Function} callback
 * @return {[String]}
 */
Dispatcher.prototype.register = function register(callback) {
  var id = _prefix + _lastID++;
  this._callbacks[id] = Promise.method(callback);
  return id;
};

/**
 * Unregisters a callback with the dispatcher
 *
 * @param  {String} id [description]
 */
Dispatcher.prototype.unregister = function unregister(id) {
  delete this._callbacks[id];
};

/**
 * Determine if the Dispatcher is currently dispatching
 */
Dispatcher.prototype.isDispatching = function isDispatching() {
  return false !== this._isDispatching;
};

/*
 * Queues a payload ror the next available iteration
 *
 * @param  {Object} payload
 * @return {Promise}
 */
Dispatcher.prototype._queue = function _queue(payload) {
  var resolver;

  var promise = new Promise(function(resolve) {
    resolver = resolve;
  });

  this._queued.push([ payload, resolver ]);

  return promise;
};

/**
 * Drains the queue of the next job
 */
Dispatcher.prototype._drain = function drain() {
  if (this._queued.length) {
    var args = this._queued.shift();
    var payload = args[0];
    var resolve = args[1];

    this.dispatch(payload).then(resolve);
  }
};

/*
 * Dispatches a batch of promises
 *
 * @param {Array} promises
 */
Dispatcher.prototype._dispatchBatch = function _dispatchBatch(promises) {
  var self = this;

  return Promise.resolve(Object.keys(promises))
                .each(function iteratePromises(idx) {
                  var cb = self._pending[idx];

                  // this promise was already resolved with a waitfor
                  if (! cb) {
                    return;
                  }

                  self._dispatchingId = idx;
                  self._openPromises.push(idx);

                  return cb().finally(self._postDispatch.bind(self, idx));
                }).finally(function stopDispatching() {
                  self._dispatchingId = null;
                });
};

/**
 * Dispatch entry point
 *
 * Prepares the regitered callbacks for dispatch and sets up the dispatch specific variables
 *
 * @param  {Object} payload
 * @return {Promise}
 */
Dispatcher.prototype.dispatch = function dispatch(payload) {
  var self = this;

  if (this._isDispatching) {
    return this._queue(payload);
  }

  this._isDispatching = true;

  this._openPromises = [];

  this._pending = {};

  Object.keys(this._callbacks).forEach(function preparePending(idx) {
    self._pending[idx] = function invokePromise() {
      return self._callbacks[idx](payload);
    };
  });

  return this._dispatchBatch(this._callbacks, payload).finally(this._stopDispatching.bind(this));
};

/*
 * Dispatch shutdown
 */
Dispatcher.prototype._stopDispatching = function _stopDispatching() {
  this._isDispatching = false;
  this._drain();
};

/**
 * Waits until execution of the given ids has completed
 *
 * @param {Array}
 */
Dispatcher.prototype.waitFor = Promise.method(function waitFor(ids) {
  if (! this._isDispatching) {
    throw new Error('Dispatcher.waitFor(...): Must be invoked while dispatching.');
  }

  var self = this;
  var pending = {};

  ids.forEach(function idToCallback(id) {
    var cb = self._pending[id];

    if (! self._callbacks[id]) {
      throw new Error(
        'Dispatcher.waitFor(...): `' + id + '` does not map to a registered callback.'
      );
    }

    if (-1 !== self._openPromises.indexOf(id)) {
      throw new Error('Dispatcher.waitFor(...): Circular dependency detected');
    }

    if (self._pending[id]) {
      pending[id] = cb;
    }
  });

  return Object.keys(pending).length ? this._dispatchBatch(pending) : Promise.resolve();
});

/*
 * Post Dispatch
 *
 * Called when an individual callback has completed its dispatch
 * removes from pending and open promises
 *
 * @param {String} idx
 */
Dispatcher.prototype._postDispatch = function _postDispatch(idx) {
  if (idx) {
    delete this._pending[idx];

    this._openPromises = this._openPromises.filter(function removeId(id) {
      return idx !== id;
    });
  }
};

module.exports = Dispatcher;
