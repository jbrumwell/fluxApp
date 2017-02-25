/* global describe, it, afterEach, beforeEach */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chai = require('chai');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lib = require('../../lib');

var _lib2 = _interopRequireDefault(_lib);

var _libErrors = require('../../lib/errors');

// runs in both the browser and server https://github.com/webpack/webpack/issues/304
var mysinon = typeof sinon === 'undefined' ? require('sinon') : sinon;

describe('store', function () {
  var context = _lib2['default'].createContext();

  function createStore(name, store) {
    _lib2['default'].registerStore(name, store);

    return context.getStore(name);
  }

  beforeEach(function () {
    if (context) {
      context.destroy();
    }

    context = _lib2['default'].createContext();
  });

  afterEach(function () {
    Object.keys(_lib2['default']._stores).forEach(function (id) {
      _lib2['default'].removeStore(id);
    });

    _lib2['default']._actions = {};
  });

  it('should have a dehydrate method', function () {
    var storeClass = (function (_BaseStore) {
      _inherits(TestStore, _BaseStore);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('testing', storeClass);
    (0, _chai.expect)(store.dehydrate).to.be.a('function');
  });

  it('should have a rehydrate method', function () {
    var storeClass = (function (_BaseStore2) {
      _inherits(TestStore, _BaseStore2);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('testing', storeClass);
    (0, _chai.expect)(store.rehydrate).to.be.a('function');
  });

  it('should have a addChangeListener method', function () {
    var storeClass = (function (_BaseStore3) {
      _inherits(TestStore, _BaseStore3);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('testing', storeClass);
    (0, _chai.expect)(store.addChangeListener).to.be.a('function');
  });

  it('should have a removeChangeListener method', function () {
    var storeClass = (function (_BaseStore4) {
      _inherits(TestStore, _BaseStore4);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('testing', storeClass);
    (0, _chai.expect)(store.removeChangeListener).to.be.a('function');
  });

  it('should have a waitFor method', function () {
    var storeClass = (function (_BaseStore5) {
      _inherits(TestStore, _BaseStore5);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('testing', storeClass);
    (0, _chai.expect)(store.waitFor).to.be.a('function');
  });

  it('should obtain its initial state from getInitialState', function () {
    var storeClass = (function (_BaseStore6) {
      _inherits(TestStore, _BaseStore6);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            something: 'else'
          };
        }
      }, {
        key: 'getSomething',
        value: function getSomething() {
          return this.state.something;
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('exposed', storeClass);

    var state = store.getState();

    (0, _chai.expect)(state).to.be.a('object');
    (0, _chai.expect)(state.something).to.equal('else');
  });

  it('should have an immutable state', function () {
    var storeClass = (function (_BaseStore7) {
      _inherits(TestStore, _BaseStore7);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            something: 'else'
          };
        }
      }, {
        key: 'getSomething',
        value: function getSomething() {
          return this.state.something;
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('exposed', storeClass);

    var state = store.getState();

    (0, _chai.expect)(state).to.be.a('object');
    (0, _chai.expect)(state.something).to.equal('else');
    (0, _chai.expect)(store.state.something).to.equal('else');

    (0, _chai.expect)(function () {
      state.something = 'then';
    }).to['throw'](Error);
  });

  it('should be mutable when called with getMutableState', function () {
    var storeClass = (function (_BaseStore8) {
      _inherits(TestStore, _BaseStore8);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            something: 'else'
          };
        }
      }, {
        key: 'getSomething',
        value: function getSomething() {
          return this.state.something;
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('exposed', storeClass);

    var state = store.getMutableState();

    (0, _chai.expect)(state).to.be.a('object');
    (0, _chai.expect)(state.something).to.equal('else');
    (0, _chai.expect)(store.state.something).to.equal('else');

    state.something = 'then';

    (0, _chai.expect)(store.state.something).to.equal('else');
    (0, _chai.expect)(state.something).to.equal('then');
  });

  it('should expose getter methods provided', function () {
    var storeClass = (function (_BaseStore9) {
      _inherits(TestStore, _BaseStore9);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            something: 'else'
          };
        }
      }, {
        key: 'getSomething',
        value: function getSomething() {
          return this.state.something;
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('exposed', storeClass);

    (0, _chai.expect)(store.getSomething).to.be.a('function');
    (0, _chai.expect)(store.getSomething()).to.equal('else');
  });

  it('should emit a change event when state is changed', function (done) {
    var storeClass = (function (_BaseStore10) {
      _inherits(TestStore, _BaseStore10);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            something: 'else'
          };
        }
      }, {
        key: 'setSomething',
        value: function setSomething() {
          this.setState({
            something: 'new'
          });
        }
      }, {
        key: 'getSomething',
        value: function getSomething() {
          return this.state.something;
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('exposed', storeClass);

    store.addChangeListener(function () {
      done();
    });

    store.setSomething();
  });

  it('should emit a change event with state and store', function (done) {
    var storeClass = (function (_BaseStore11) {
      _inherits(TestStore, _BaseStore11);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            something: 'else'
          };
        }
      }, {
        key: 'setSomething',
        value: function setSomething() {
          this.setState({
            something: 'new'
          });
        }
      }, {
        key: 'getSomething',
        value: function getSomething() {
          return this.state.something;
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('exposed', storeClass);

    store.addChangeListener(function (state, storeInstance) {
      (0, _chai.expect)(state.something).to.equal('new');
      (0, _chai.expect)(storeInstance instanceof storeClass).to.equal(true);
      done();
    });

    store.setSomething();
  });

  it('should dehydrate to false if unchanged', function () {
    var storeClass = (function (_BaseStore12) {
      _inherits(TestStore, _BaseStore12);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            myState: 'is',
            always: 'here'
          };
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('exposed', storeClass);

    var state = store.dehydrate();

    (0, _chai.expect)(state).to.equal(false);
  });

  it('should dehydrate its state', function () {
    var storeClass = (function (_BaseStore13) {
      _inherits(TestStore, _BaseStore13);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'getInitialState',
        value: function getInitialState() {
          return {
            myState: 'is',
            always: 'here'
          };
        }
      }, {
        key: 'toThere',
        value: function toThere() {
          this.setState({
            always: 'there'
          });
        }
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('dehydrate', storeClass);

    store.toThere();

    var state = store.dehydrate();

    (0, _chai.expect)(state.myState).to.equal('is');
    (0, _chai.expect)(state.always).to.equal('there');
  });

  it('should rehydrate the store with the supplied state', function () {
    var storeClass = (function (_BaseStore14) {
      _inherits(TestStore, _BaseStore14);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onTestData',
        value: function onTestData(data) {
          this.setState(data);
        }
      }], [{
        key: 'actions',
        value: {
          onTestData: 'test.data'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('rehydrate', storeClass);

    var state = store.getState();

    (0, _chai.expect)(state).to.be.a('object');
    (0, _chai.expect)(state).to.be.empty;

    store.rehydrate({
      now: 'string'
    });

    state = store.getState();

    (0, _chai.expect)(state).to.be.a('object');
    (0, _chai.expect)(state).to.not.be.empty;
    (0, _chai.expect)(state.now).to.equal('string');
  });

  it('should rehydrate from action result', function (done) {
    var storeClass = (function (_BaseStore15) {
      _inherits(TestStore, _BaseStore15);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          this.setState(result);
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('action', storeClass);

    var actionClass = (function (_BaseActions) {
      _inherits(TestActions, _BaseActions);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'login',
        value: function login() {
          return {
            success: true
          };
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    _lib2['default'].registerActions('user', actionClass);

    var actions = context.getActions('user');

    actions.login('user', 'password').then(function () {
      store.rehydrate(store.dehydrate());

      var state = store.getState();

      (0, _chai.expect)(state).to.have.property('success');
      (0, _chai.expect)(state.success).to.equal(true);
      done();
    });
  });

  it('should rehydrate from action result async', function (done) {
    var storeClass = (function (_BaseStore16) {
      _inherits(TestStore, _BaseStore16);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          this.setState(result);
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);
    var store = createStore('action', storeClass);

    var actionClass = (function (_BaseActions2) {
      _inherits(TestActions, _BaseActions2);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'login',
        value: function login() {
          return new _bluebird2['default'](function (resolve) {
            setImmediate(resolve.bind(resolve, {
              success: true
            }));
          });
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    _lib2['default'].registerActions('user', actionClass);

    var actions = context.getActions('user');

    actions.login('user', 'password').then(function loginResult() {
      store.rehydrate(store.dehydrate());

      var state = store.getState();

      (0, _chai.expect)(state).to.have.property('success');
      (0, _chai.expect)(state.success).to.equal(true);
      done();
    });
  });

  it('should bind to actions provided', function (done) {
    var storeClass = (function (_BaseStore17) {
      _inherits(TestStore, _BaseStore17);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          (0, _chai.expect)(actionType).to.equal(_lib2['default'].getActionType('user.login'));
          (0, _chai.expect)(result.success).to.equal(true);
          done();
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);
    createStore('actions', storeClass);

    var actionClass = (function (_BaseActions3) {
      _inherits(TestActions, _BaseActions3);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'login',
        value: function login() {
          return {
            success: true
          };
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    _lib2['default'].registerActions('user', actionClass);

    var actions = context.getActions('user');

    actions.login('user', 'password');
  });

  it('should not bind to actions not declared', function (done) {
    var eventCalled = mysinon.spy();
    var actionType = _lib2['default'].getActionType('user.login');
    var storeClass = (function (_BaseStore18) {
      _inherits(TestStore, _BaseStore18);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          (0, _chai.expect)(actionType).to.equal(actionType);
          (0, _chai.expect)(result.success).to.equal(true);
          done();
        }
      }, {
        key: '_processActionEvent',
        value: function _processActionEvent(payload) {
          eventCalled();
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);
    createStore('actions', storeClass);

    var actionClass = (function (_BaseActions4) {
      _inherits(TestActions, _BaseActions4);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'login',
        value: function login() {
          return {
            success: true
          };
        }
      }, {
        key: 'notObserved',
        value: function notObserved() {}
      }]);

      return TestActions;
    })(_lib.BaseActions);

    _lib2['default'].registerActions('user', actionClass);

    var actions = context.getActions('user');

    actions.login('user', 'password').then(function () {
      return actions.notObserved();
    }).then(function () {
      (0, _chai.expect)(eventCalled.callCount).to.equal(1);
    }).nodeify(done);
  });

  it('should wait for specified stores to complete', function (done) {
    var storeClass1 = (function (_BaseStore19) {
      _inherits(TestStore, _BaseStore19);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          this.setState({
            ran: true
          });
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);

    var storeClass2 = (function (_BaseStore20) {
      _inherits(TestStore, _BaseStore20);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          var _this = this;

          return this.waitFor('testStore').then(function () {
            var state = _this.getStore('testStore').getState();
            (0, _chai.expect)(state.ran).to.equal(true);
            (0, _chai.expect)(actionType).to.equal(_lib2['default'].getActionType('user.login'));
            (0, _chai.expect)(result.success).to.equal(true);
            done();
          });
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);

    createStore('testStore', storeClass1);
    createStore('actions', storeClass2);

    var actionClass = (function (_BaseActions5) {
      _inherits(TestActions, _BaseActions5);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'login',
        value: function login() {
          return {
            success: true
          };
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    _lib2['default'].registerActions('user', actionClass);

    var actions = context.getActions('user');

    actions.login('user', 'password');
  });

  it('should throw a Listener error if waitFor is called an no promise is returned', function (done) {
    var storeClass1 = (function (_BaseStore21) {
      _inherits(TestStore, _BaseStore21);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          this.setState({
            ran: true
          });
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);

    var storeClass2 = (function (_BaseStore22) {
      _inherits(TestStore, _BaseStore22);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestStore, [{
        key: 'onUserLogin',
        value: function onUserLogin(result, actionType) {
          var _this2 = this;

          this.waitFor('testStore').then(function () {
            var state = _this2.getStore('testStore').getState();
            (0, _chai.expect)(state.ran).to.equal(true);
            (0, _chai.expect)(actionType).to.equal(_lib2['default'].getActionType('user.login'));
            (0, _chai.expect)(result.success).to.equal(true);
          });
        }
      }], [{
        key: 'actions',
        value: {
          onUserLogin: 'user.login'
        },
        enumerable: true
      }]);

      return TestStore;
    })(_lib.BaseStore);

    createStore('testStore', storeClass1);
    createStore('actions', storeClass2);

    var actionClass = (function (_BaseActions6) {
      _inherits(TestActions, _BaseActions6);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'login',
        value: function login() {
          return {
            success: true
          };
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    _lib2['default'].registerActions('user', actionClass);

    var actions = context.getActions('user');

    actions.login('user', 'password').then(function (result) {
      (0, _chai.expect)(result.status).to.equal(0);
      (0, _chai.expect)(result.error).to.be['instanceof'](_libErrors.ListenerDispatchError);
    }).nodeify(done);
  });
});