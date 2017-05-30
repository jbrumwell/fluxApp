'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

var _utilNamespaceTransform = require('./util/namespaceTransform');

var _utilNamespaceTransform2 = _interopRequireDefault(_utilNamespaceTransform);

var CHANGE_EVENT = 'changed';

var BaseStore = (function (_EventEmitter) {
  _inherits(BaseStore, _EventEmitter);

  function BaseStore(context) {
    _classCallCheck(this, BaseStore);

    _get(Object.getPrototypeOf(BaseStore.prototype), 'constructor', this).call(this);

    this.changed = false;
    this._waitForCalled = false;
    this.setMaxListeners(1000);

    if (!context) {
      throw new Error('fluxApp:BaseStore Context must be passed to the BaseStore');
    }

    this.context = context;
    this._initActions();
    this._initDispatcher();
    this.reset();
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

  _createClass(BaseStore, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {};
    }

    /**
     * Initiate the actions provided by the class
     * @param {Object} actions
     */
  }, {
    key: '_initActions',
    value: function _initActions() {
      var _this = this;

      var actions = this.constructor.actions || {};

      this._actionTypes = {};

      _lodash2['default'].each(_lodash2['default'].keys(actions), function (method) {
        var value = actions[method];

        if (!Array.isArray(value)) {
          value = [value];
        }

        value.forEach(function (name) {
          _this.listenTo(name, method, false);
        });
      });
    }

    /**
     * allow for runtime listenTo
     * @param {Object} actions
     * @param {Boolean} bind
     */
  }, {
    key: 'listenTo',
    value: function listenTo(actionType, method) {
      var bind = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      actionType = (0, _utilNamespaceTransform2['default'])(actionType);

      if (_lodash2['default'].isFunction(method)) {
        method = method.name;
      }

      if (this._actionTypes[actionType]) {
        throw new Error('Fluxapp: Already listening to ' + arguments[0] + ' at ' + this._actionTypes[actionType]);
      }

      this._actionTypes[actionType] = method;

      if (bind) {
        if (!this._dispatchToken) {
          this._initDispatcher();
        } else {
          var Dispatcher = this.context.getDispatcher();
          Dispatcher.registerEvent(this._dispatchToken, actionType);
        }
      }
    }

    /**
     * Check if we are already listening to this action type
     *
     * @param  {String}  actionType
     * @return {Boolean}
     */
  }, {
    key: 'isListeningTo',
    value: function isListeningTo(actionType) {
      actionType = (0, _utilNamespaceTransform2['default'])(actionType);

      return !!this._actionTypes[actionType];
    }

    /**
     * Initiate the dispatch event
     */
  }, {
    key: '_initDispatcher',
    value: function _initDispatcher() {
      var Dispatcher = this.context.getDispatcher();
      var events = _lodash2['default'].keys(this._actionTypes);

      if (events.length) {
        this._dispatchToken = Dispatcher.register(this._processActionEvent.bind(this), events);
      }
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
  }, {
    key: 'waitFor',
    value: function waitFor(stores) {
      var context = this.context;
      var dispatcher = context.getDispatcher();
      var tokens = undefined;

      if (typeof stores === 'string') {
        stores = stores.split(',');
      }

      this._waitForCalled = true;

      tokens = stores.map(function (name) {
        var store = context.getStore(name.trim());

        if (!store) {
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
  }, {
    key: 'getStore',
    value: function getStore(name) {
      return this.context.getStore(name);
    }

    /**
     * Get a stores mutable state
     * @param {Object} name
     */
  }, {
    key: 'getStoreState',
    value: function getStoreState(name) {
      return this.getStore(name).getMutableState();
    }

    /**
     * Process a dispatched event
     * @param {Object} payload
     */
  }, {
    key: '_processActionEvent',
    value: function _processActionEvent(payload) {
      var method = this._actionTypes[payload.actionType];
      var result = undefined;

      if (method && this[method]) {
        if (['replaceState', 'setState'].indexOf(method) === -1) {
          result = this[method](payload.payload, payload.actionType);
        } else {
          result = this[method](payload.payload);
        }

        if (this._waitForCalled && !_lodash2['default'].isFunction(_lodash2['default'].get(result, 'then'))) {
          throw new Error('Fluxapp Store: Action handler called `waitFor` but did not return a promise');
        }
      }

      this._waitForCalled = false;

      return result;
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
  }, {
    key: 'init',
    value: function init() {}

    /**
    * Fallback for store destruction
    */
  }, {
    key: 'destroy',
    value: function destroy() {}
  }, {
    key: 'reset',
    value: function reset() {
      this.state = (0, _seamlessImmutable2['default'])(this.getInitialState());
    }

    /**
     * Tests the equality of current and next state
     *
     * @param  {Ojbect}  nextState
     * @return {Boolean}
     */
  }, {
    key: '_isEqual',
    value: function _isEqual(nextState) {
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
  }, {
    key: 'setState',
    value: function setState(state, noEvent) {
      var currentState = this.getMutableState();
      var isEqual = this._isEqual(state);

      this.state = isEqual ? this.state : (0, _seamlessImmutable2['default'])(currentState).merge(state);

      if (!noEvent && !isEqual) {
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
  }, {
    key: 'replaceState',
    value: function replaceState(state, noEvent) {
      var isEqual = this._isEqual(state);

      this.state = isEqual ? this.state : (0, _seamlessImmutable2['default'])(state);

      if (!noEvent && !isEqual) {
        this.emitChange();
      }

      return this;
    }

    /**
     * Get the state of the store
     */
  }, {
    key: 'getState',
    value: function getState() {
      return this.state;
    }

    /**
     * Get the state of the store as mutatable
     */
  }, {
    key: 'getMutableState',
    value: function getMutableState() {
      return this.state.asMutable({ deep: true });
    }

    /**
     * Inform listeners that the store has updated
     */
  }, {
    key: 'emitChange',
    value: function emitChange() {
      this.emit(CHANGE_EVENT, this.getMutableState(), this);

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
  }, {
    key: 'addChangeListener',
    value: function addChangeListener(cb) {
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
  }, {
    key: 'removeChangeListener',
    value: function removeChangeListener(cb) {
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
  }, {
    key: 'dehydrate',
    value: function dehydrate() {
      var state = false;
      var current = this.getState();

      if (!_lodash2['default'].isEqual(current, this.getInitialState())) {
        state = _lodash2['default'].assign({}, current);
      }

      return state;
    }

    /**
     * Re-hydrate the stores state
     * @return {BaseStore}
     */
  }, {
    key: 'rehydrate',
    value: function rehydrate(data) {
      this.replaceState(data, true);

      return this;
    }
  }]);

  return BaseStore;
})(_events.EventEmitter);

exports['default'] = BaseStore;
exports['default'] = BaseStore;
module.exports = exports['default'];