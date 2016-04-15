import { EventEmitter } from 'events';
import _ from 'lodash';
import immutable from 'seamless-immutable';
import namespaceTransform from './util/namespaceTransform';

const CHANGE_EVENT = 'changed';

export default class BaseStore extends EventEmitter {
  changed = false;

  constructor(context) {
    super();

    this.setMaxListeners(1000);

    if (! context) {
      throw new Error('fluxApp:BaseStore Context must be passed to the BaseStore');
    }

    this.context = context;
    this._initActions();
    this._initDispatcher();
    this.state = immutable(this.getInitialState());
    this.init();
  }

  /**
  * Initiates the state for the store
  *
  * <pre>
  *   <code>
  *     fluxapp.registerStore('user', {
  *       getInitialState: function() {
  *         return {
  *           users: []
  *         };
  *       },
  *
  *       getAll: function() {
  *         return this.state.users;
  *       }
  *     });
  *   </code>
  * </pre>
  */
  getInitialState() {
    return {};
  }

  /**
   * Initiate the actions provided by the class
   * @param {Object} actions
   */
  _initActions() {
    const actions = this.constructor.actions || {};

    this._actionTypes = {};

    _.each(_.keys(actions), (method) => {
      let value = actions[method];

      if (! Array.isArray(value)) {
        value = [ value ];
      }

      value.forEach((name) => {
        name = namespaceTransform(name);

        this._actionTypes[name] = method;
      });
    });
  }

  /**
   * allow for runtime listenTo
   * @param {Object} actions
   */
  listenTo(actionType, method) {
    actionType = namespaceTransform(actionType);

    if (_.isFunction(method)) {
      method = method.name;
    }

    this.actionTypes[actionType] = method;
  }

  /**
   * Initiate the dispatch event
   */
  _initDispatcher() {
    const Dispatcher = this.context.getDispatcher();

    this._dispatchToken = Dispatcher.register(this._processActionEvent.bind(this));
  }

  /**
  * Wait for a list of stores before processing
  *
  * <pre>
  *   <code>
  *     this.waitFor('session').then(function() {
  *       // session store has processed
  *     });
  *   </code>
  * </pre>
  *
  * @param {String} stores comma delimited list of stores
  */
  waitFor(stores) {
    const context = this.context;
    const dispatcher = context.getDispatcher();
    let tokens;

    if (typeof stores === 'string') {
      stores = stores.split(',');
    }

    tokens = stores.map((name) => {
      const store = context.getStore(name.trim());

      if (! store) {
        throw new Error('fluxapp:BaseStore waitFor unable to locate store ' + name.trim());
      }

      return store._dispatchToken;
    });

    return dispatcher.waitFor(tokens);
  }

  /**
  * Ease the use of getStore for the store
  *
  * <pre>
  *   <code>
  *     this.getStore('name');
  *   </code>
  * </pre>
  *
  * @param {String} name
  */
  getStore(name) {
    return this.context.getStore(name);
  }

  /*
   * Process a dispatched event
   * @param {Object} payload
   */
  _processActionEvent(payload) {
    const method = this._actionTypes[ payload.actionType ];

    if (method && this[ method ]) {
      if (['replaceState', 'setState'].indexOf(method) === -1) {
        this[ method ](payload.payload, payload.actionType);
      } else {
        this[ method ](payload.payload);
      }
    }

    return this;
  }

  /**
  * Fallback for store initiation
  *
  * <pre>
  *   <code>
  *     fluxapp.registerStore('user', {
  *       init: function() {
  *         // store is being created
  *       }
  *     });
  *   </code>
  * </pre>
  *
  * @return {Object}
  */
  init() {}

  /**
  * Fallback for store destruction
  */
  destroy() {}

  /**
   * Tests the equality of current and next state
   *
   * @param  {Ojbect}  nextState
   * @return {Boolean}
   */
  _isEqual(nextState) {
    return JSON.stringify(nextState) === JSON.stringify(this.getMutableState());
  }

  /**
   * Set the state of the store
   *
   * <pre>
   *   <code>
   *     fluxapp.registerStore('user', {
   *       actions: {
   *         onUserLogin: 'user.login',
   *       },
   *
   *       onUserLogin: function(user) {
   *         this.setState({
   *           token: user.token
   *         });
   *       }
   *     });
   *   </code>
   * </pre>
   *
   * @param {Object} state
   */
  setState(state, noEvent) {
    const currentState = this.getMutableState();
    const isEqual = this._isEqual(state);

    this.state = isEqual ? this.state : immutable(currentState).merge(state);

    if (! noEvent && ! isEqual) {
      this.emitChange();
    }

    return this;
  }

  /**
  * Replace the state of the store
  *
  * <pre>
  *   <code>
  *     fluxapp.registerStore('user', {
  *       actions: {
  *         onUserLogout: 'user.logout',
  *       },
  *
  *       onUserLogout: function() {
  *         this.replaceState({});
  *       }
  *     });
  *   </code>
  * </pre>
  *
  * @param {Object} state
  */
  replaceState(state, noEvent) {
    const isEqual = this._isEqual(state);

    this.state = isEqual ? this.state : immutable(state);

    if (! noEvent && ! isEqual) {
      this.emitChange();
    }

    return this;
  }

  /**
   * Get the state of the store
   */
  getState() {
    return this.state;
  }

  /**
   * Get the state of the store as mutatable
   */
  getMutableState() {
    return this.state.asMutable({ deep : true });
  }

  /**
   * Inform listeners that the store has updated
   */
  emitChange() {
    if (this.changed !== true) {
      this.changed = true;

      process.nextTick(() => {
        this.emit(CHANGE_EVENT, this.getMutableState(), this);
        this.changed = false;
      });
    }

    return this;
  }

  /**
  * Add a listener to this store
  *
  * <pre>
  *   <code>
  *     var context = fluxapp.getContext();
  *     var store = context.getStore('name');
  *
  *     function onChange(state) {
  *       // state on store 'name' was changed
  *     }
  *
  *     store.addChangeListener(onChange);
  *   </code>
  * </pre>
  *
  * @param {Function} cb
  */
  addChangeListener(cb) {
    this.on(CHANGE_EVENT, cb);

    return this;
  }

  /**
   * Remove the specified listener
   *
   * <pre>
   *   <code>
   *     var context = fluxapp.getContext();
   *     var store = context.getStore('name');
   *
   *     function onChange(state) {
   *       // will only be called once
   *       store.removeChangeListener(onChange);
   *     }
   *
   *     store.addChangeListener(onChange);
   *   </code>
   * </pre>
   * @param {Function} cb
   */
  removeChangeListener(cb) {
    this.removeListener(CHANGE_EVENT, cb);

    return this;
  }

  /**
   * Dehydrate returns the state of the store for transmittion to client
   *
   * <pre>
   *   <code>
   *     var context = fluxapp.getContext();
   *     var store = context.getStore('search');
   *
   *     // emit actions to populate the store
   *
   *     var state = store.dehydrate();
   *
   *     if (state) {
   *       // store was mutated
   *     }
   *   </code>
   * </pre>
   * @return {Object|Null}
   */
  dehydrate() {
    let state = false;
    const current = this.getState();

    if (! _.isEqual(current, this.getInitialState())) {
      state = _.assign({}, current);
    }

    return state;
  }

  /**
   * Re-hydrate the stores state
   * @return {BaseStore}
   */
  rehydrate(data) {
    this.replaceState(data, true);

    return this;
  }
}

export default BaseStore;
