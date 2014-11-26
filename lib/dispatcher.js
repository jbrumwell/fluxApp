'use strict';

var Promise = require('bluebird');

function Dispatcher() {
  this._callbacks = [];
  this._queue = [];
}

Dispatcher.prototype.register = function register(callback) {
  this._callbacks.push(Promise.method(callback));

  return this._callbacks.length - 1;
};

Dispatcher.prototype.unregister = function unregister(id) {
  this._callbacks = this._callbacks.filter(function (cb, idx) {
    return idx !== id;
  });
};

Dispatcher.prototype.isDispatching = function isDispatching() {
  return this._isDispatching;
};

Dispatcher.prototype.queue = function queue(payload) {
  var resolver;

  var promise = new Promise(function(resolve) {
    resolver = resolve;
  });

  this._queue.push([payload, resolver]);

  return promise;
};

Dispatcher.prototype.dequeue = function dequeue() {
  if (this._queue.length) {
    var args = this._queue.shift();

    this.dispatch(args[0]).then(args[1]);
  }
};

Dispatcher.prototype.dispatch = function dispatch(payload) {
  var self = this;

  if (this._isDispatching) {
    return this.queue(payload);
  }

  this._isDispatching = true;

  var promises = this._callbacks.map(function methodToPromise(cb) {
    return cb(payload);
  });

  return Promise.all(promises).finally(function stopDispatching() {
    self._isDispatching = false;
    self.dequeue();
  });
};

Dispatcher.prototype.waitFor = function waitFor(ids) {
  if (! this._isDispatching) {
    throw new Error('Dispatcher.waitFor(...): Must be invoked while dispatching.');
  }

  var self = this;
  var promises = ids.map(function idToCallback(id) {
    var cb = self._callbacks[id];

    if (! cb) {
      throw new Error('Dispatcher.waitFor(...): `'+ id +'` does not map to a registered callback.');
    }

    return cb;
  });

  return Promise.all(promises);
};

module.exports = Dispatcher;
