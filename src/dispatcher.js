import Promise from 'bluebird';
import _ from 'lodash';
import promiseMethod from './decorators/promise-method';
import namespaceTransform from './util/namespaceTransform';

let _lastID = 1;
const _prefix = 'ID_';

/**
 * Flux dispatcher with promise handling and circular recursion detection.
 *
 * It is different from the standard Flux dispatcher as it allows actions
 * called from within other actions
 */
export default class Dispatcher {

  _openPromises = [];
  _callbacks = [];
  _events = {};
  _queued = [];

  _isDispatching = false;
  _isDispatchingEvent = null;

  /**
   * Register a callback with the dispatcher
   *
   * Register a callback with the dispatcher and return a token for unregistering
   *
   * @param  {Function} callback
   * @return {[String]}
   */
  register(callback, events = '*') {
    const id = _prefix + _lastID;

    events = _.isString(events) ? [ events ] : events;

    if (! _.size(events)) {
      throw new Error('Fluxapp: Dispatcher requires a list of events or "*" to receive all events');
    }

    this._callbacks[id] = Promise.method(callback);

    _.each(events, (event) => {
      event = event === '*' ? event : namespaceTransform(event);
      this._events[event] = this._events[event] || [];
      this._events[event].push(id);
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
  registerEvents(dispatchToken, events) {
    if (! this._callbacks[dispatchToken]) {
      throw new Error('Fluxapp: Unable to register event for invalid dispatch token');
    }

    events = _.castArray(events);

    _.each(events, (event) => {
      event = event === '*' ? event : namespaceTransform(event);
      this._events[event] = this._events[event] || [];

      if (! _.includes(this._events[event], dispatchToken)) {
        this._events[event].push(dispatchToken);
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
  registerEvent(dispatchToken, event) {
    return this.registerEvents(dispatchToken, event);
  }

  /**
   * Unregister events from an already bound callback
   *
   * @param  {Integer} dispatchToken
   * @param  {Array} events
   * @return {void}
   */
  unregisterEvents(dispatchToken, events) {
    if (! this._callbacks[dispatchToken]) {
      throw new Error('Fluxapp: Unable to unregister event for invalid dispatch token');
    }

    events = _.castArray(events);

    _.each(events, (event) => {
      event = event === '*' ? event : namespaceTransform(event);
      this._events[event] = _.without(this._events[event] || [], dispatchToken);
    });
  }

  /**
   * Unregister event from an already bound callback
   *
   * @param  {Integer} dispatchToken
   * @param  {Array} events
   * @return {void}
   */
  unregisterEvent(dispatchToken, event) {
    return this.unregisterEvents(dispatchToken, event);
  }

  /**
   * Unregisters a callback with the dispatcher
   *
   * @param  {String} id [description]
   */
  unregister(id) {
    delete this._callbacks[id];

    this._events = _.mapValues(this._events, (events) => {
      return _.without(events, id);
    });
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
    return new Promise((resolve, reject) => {
      this._queued.push([ payload, resolve, reject ]);
    });
  }

  /**
   * Drains the queue of the next job
   */
  _drain() {
    if (this._queued.length) {
      const args = this._queued.shift();
      const payload = args[0];
      const resolve = args[1];
      const reject = args[2];

      this.dispatch(payload).then(resolve, reject);
    }
  }

  /*
   * Dispatches a batch of promises
   *
   * @param {Array} promises
   */
  _dispatchBatch(batch) {
    return Promise.using(this._batchPromise(batch), (idxs) => {
      return Promise.each(idxs, this._dispatchJob.bind(this));
    });
  }

  _dispatchJob(idx) {
    this._dispatchingId = idx;
    this._openPromises.push(idx);

    return Promise.using(this._jobPromise(idx), () => {
      const cb = this._pending[idx];

      return cb ? cb() : null;
    });
  }

  _batchPromise(promises) {
    return Promise.resolve(_.keys(promises))
    .disposer(() => {
      return this._stopDispatching();
    });
  }

  _jobPromise(idx) {
    return Promise.resolve()
    .disposer(() => {
      return this._postDispatch(idx);
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
  @promiseMethod
  dispatch(payload) {
    if (this._isDispatching) {
      return this._queue(payload);
    }

    const event = payload.actionType;
    const events = _.chain([])
                    .concat(this._events['*'] || [], this._events[event] || [])
                    .uniq()
                    .value();

    this._isDispatching = true;
    this._isDispatchingEvent = event;

    this._openPromises = [];

    this._pending = {};

    _.each(events).forEach((idx) => {
      this._pending[idx] = () => {
        return _.isFunction(this._callbacks[idx]) ? this._callbacks[idx](payload) :
                                                    Promise.resolve();
      };
    });

    return events.length ? this._dispatchBatch(this._pending) : this._stopDispatching();
  }

  /*
   * Dispatch shutdown
   */
  _stopDispatching() {
    this._isDispatching = false;
    this._isDispatchingEvent = null;

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

    const pending = [];

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

      if (cb) {
        pending.push(id);
      }
    });

    return ! _.size(pending) ? Promise.resolve() :
                               Promise.mapSeries(pending, this._dispatchJob.bind(this));
  }

  /**
   * Is the dispatcher currently dispatching
   *
   * @return {Boolean} [description]
   */
  isDispatching() {
    return this._isDispatching;
  }

  /**
   * Method for retrieving the current event being dispatched
   *
   * @return {String}
   */
  getCurrentEvent() {
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
  _postDispatch(idx) {
    if (idx) {
      delete this._pending[idx];

      this._openPromises = this._openPromises.filter((id) => idx !== id);
    }

    this._dispatchingId = null;
  }
}
