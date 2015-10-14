import Promise from 'bluebird';
import _ from 'lodash';
import promiseMethod from './decorators/promise-method';

let _lastID = 1;
const _prefix = 'ID_';

/**
 * Flux dispatcher with promise handling and circular recursion detection.
 *
 * It is different from the standard Flux dispatcher as it allows actions
 * called from within other actions
 */
export default class Dispatcher {
  constructor() {
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
  register(callback) {
    const id = _prefix + _lastID;
    this._callbacks[id] = Promise.method(callback);

    _lastID += 1;
    return id;
  }

  /**
   * Unregisters a callback with the dispatcher
   *
   * @param  {String} id [description]
   */
  unregister(id) {
    delete this._callbacks[id];
  }

  /**
   * Determine if the Dispatcher is currently dispatching
   */
  isDispatching() {
    return false !== this._isDispatching;
  }

  /*
   * Queues a payload ror the next available iteration
   *
   * @param  {Object} payload
   * @return {Promise}
   */
  _queue(payload) {
    let resolver;

    const promise = new Promise(function(resolve) {
      resolver = resolve;
    });

    this._queued.push([ payload, resolver ]);

    return promise;
  }

  /**
   * Drains the queue of the next job
   */
  _drain() {
    if (this._queued.length) {
      const args = this._queued.shift();
      const payload = args[0];
      const resolve = args[1];

      this.dispatch(payload).then(resolve);
    }
  }

  /*
   * Dispatches a batch of promises
   *
   * @param {Array} promises
   */
  _dispatchBatch(promises) {
    return Promise.resolve(Object.keys(promises))
                  .each((idx) => {
                    const cb = this._pending[idx];

                    // this promise was already resolved with a waitfor
                    /* eslint-disable consistent-return */
                    if (! cb) {
                      return;
                    }


                    this._dispatchingId = idx;
                    this._openPromises.push(idx);

                    return cb().finally(this._postDispatch.bind(this, idx));
                    /* eslint-enable consistent-return */
                  }).finally(() => {
                    this._dispatchingId = null;
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
  dispatch(payload) {
    if (this._isDispatching) {
      return this._queue(payload);
    }

    this._isDispatching = true;

    this._openPromises = [];

    this._pending = {};

    Object.keys(this._callbacks).forEach((idx) => {
      this._pending[idx] = () => {
        return _.isFunction(this._callbacks[idx]) ? this._callbacks[idx](payload) :
                                                    Promise.resolve();
      };
    });

    return this._dispatchBatch(this._callbacks, payload).finally(this._stopDispatching.bind(this));
  }

  /*
   * Dispatch shutdown
   */
  _stopDispatching() {
    this._isDispatching = false;
    this._drain();
  }

  /**
   * Waits until execution of the given ids has completed
   *
   * @param {Array}
   */
  @promiseMethod
  waitFor(ids) {
    if (! this._isDispatching) {
      throw new Error('Dispatcher.waitFor(...): Must be invoked while dispatching.');
    }

    const pending = {};

    ids.forEach((id) => {
      const cb = this._pending[id];

      if (! this._callbacks[id]) {
        throw new Error(
          'Dispatcher.waitFor(...): `' + id + '` does not map to a registered callback.'
        );
      }

      if (-1 !== this._openPromises.indexOf(id)) {
        throw new Error('Dispatcher.waitFor(...): Circular dependency detected');
      }

      if (this._pending[id]) {
        pending[id] = cb;
      }
    });

    return Object.keys(pending).length ? this._dispatchBatch(pending) : Promise.resolve();
  }

  /*
   * Post Dispatch
   *
   * Called when an individual callback has completed its dispatch
   * removes from pending and open promises
   *
   * @param {String} idx
   */
  _postDispatch(idx) {
    if (idx) {
      delete this._pending[idx];

      this._openPromises = this._openPromises.filter(function removeId(id) {
        return idx !== id;
      });
    }
  }
}
