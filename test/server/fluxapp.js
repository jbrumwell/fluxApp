/* global describe, it, after */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chai = require('chai');

var _lib = require('../../lib');

var _lib2 = _interopRequireDefault(_lib);

describe('fluxapp', function () {
  after(function () {
    Object.keys(_lib2['default']._stores).forEach(function (id) {
      _lib2['default'].removeStore(id);
    });
  });

  it('should have a noConflict method', function () {
    (0, _chai.expect)(_lib2['default'].noConflict).to.be.a('function');
  });

  it('should have a registerPlugin method', function () {
    (0, _chai.expect)(_lib2['default'].registerPlugin).to.be.a('function');
  });

  it('should have a registerPlugins method', function () {
    (0, _chai.expect)(_lib2['default'].registerPlugins).to.be.a('function');
  });

  it('should have a removePlugin method', function () {
    (0, _chai.expect)(_lib2['default'].removePlugin).to.be.a('function');
  });

  it('should have a hasPlugin method', function () {
    (0, _chai.expect)(_lib2['default'].registerPlugin).to.be.a('function');
  });

  it('should have a createContext method', function () {
    (0, _chai.expect)(_lib2['default'].createContext).to.be.a('function');
  });

  it('should have a getStores method', function () {
    (0, _chai.expect)(_lib2['default'].getStores).to.be.a('function');
  });

  it('should have a removeStore method', function () {
    (0, _chai.expect)(_lib2['default'].removeStore).to.be.a('function');
  });

  it('should have a registerStore method', function () {
    (0, _chai.expect)(_lib2['default'].registerStore).to.be.a('function');
  });

  it('should have a registerStores method', function () {
    (0, _chai.expect)(_lib2['default'].registerStores).to.be.a('function');
  });

  it('should have a registerActions method', function () {
    (0, _chai.expect)(_lib2['default'].registerActions).to.be.a('function');
  });

  it('should have a getActionType method', function () {
    (0, _chai.expect)(_lib2['default'].getActionType).to.be.a('function');
  });

  it('should allow us to register a store', function () {
    var storeClass = (function (_BaseStore) {
      _inherits(TestStore, _BaseStore);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);

    _lib2['default'].registerStore('test', storeClass);

    (0, _chai.expect)(_lib2['default']._stores.test).to.be.a('function');
  });

  describe('context', function () {
    var context = _lib2['default'].createContext({
      getRouter: function getRouter() {}
    });

    it('should have a destroy method', function () {
      (0, _chai.expect)(context.destroy).to.be.a('function');
    });

    it('should allow custom methods', function () {
      (0, _chai.expect)(context.getRouter).to.be.a('function');
    });

    it('should have a removeActions method', function () {
      (0, _chai.expect)(context.removeActions).to.be.a('function');
    });

    it('should have a removeActions method', function () {
      (0, _chai.expect)(context.removeActions).to.be.a('function');
    });

    it('should have a getActions method', function () {
      (0, _chai.expect)(context.getActions).to.be.a('function');
    });

    it('should have a getAction method', function () {
      (0, _chai.expect)(context.getAction).to.be.a('function');
    });

    it('should have a removeStore method', function () {
      (0, _chai.expect)(context.removeStore).to.be.a('function');
    });

    it('should have a getStore method', function () {
      (0, _chai.expect)(context.getStore).to.be.a('function');
    });

    it('should have a getDispatcher method', function () {
      (0, _chai.expect)(context.getDispatcher).to.be.a('function');
    });

    it('should have a dehydrate method', function () {
      (0, _chai.expect)(context.dehydrate).to.be.a('function');
    });

    it('should have a rehydrate method', function () {
      (0, _chai.expect)(context.rehydrate).to.be.a('function');
    });

    it('should have a getActionType method', function () {
      (0, _chai.expect)(context.getActionType).to.be.a('function');
    });

    it('should rehydrate store state base on action', function () {
      var storeClass = (function (_BaseStore2) {
        _inherits(TestStore, _BaseStore2);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestStore, [{
          key: 'onTest',
          value: function onTest(state) {
            this.setState(state);
          }
        }], [{
          key: 'actions',
          value: {
            onTest: 'test.test'
          },
          enumerable: true
        }]);

        return TestStore;
      })(_lib.BaseStore);
      _lib2['default'].registerStore('name', storeClass);

      var store = context.getStore('name');
      var state = store.getState();

      (0, _chai.expect)(state).to.be.a('object');
      (0, _chai.expect)(state).to.be.empty();

      context.rehydrate({
        stores: {
          name: {
            now: 'string'
          }
        }
      });

      state = store.getState();

      (0, _chai.expect)(state).to.be.a('object');
      (0, _chai.expect)(state).to.not.be.empty();
      (0, _chai.expect)(state.now).to.equal('string');
    });

    it('should rehydrate store state base on context constructor', function () {
      context = _lib2['default'].createContext(null, {
        stores: {
          name: {
            now: 'string'
          }
        }
      });

      var store = context.getStore('name');
      var state = store.getState();

      (0, _chai.expect)(state).to.be.a('object');
      (0, _chai.expect)(state).to.not.be.empty();
      (0, _chai.expect)(state.now).to.equal('string');
    });

    it('should throw if used after being destroyed', function () {
      context = _lib2['default'].createContext();

      context.destroy();

      (0, _chai.expect)(context.removeActions).to['throw'](Error);
      (0, _chai.expect)(context.removeAction).to['throw'](Error);
      (0, _chai.expect)(context.getActions).to['throw'](Error);
      (0, _chai.expect)(context.getAction).to['throw'](Error);
      (0, _chai.expect)(context.removeStore).to['throw'](Error);
      (0, _chai.expect)(context.getStore).to['throw'](Error);
      (0, _chai.expect)(context.getActionType).to['throw'](Error);
      (0, _chai.expect)(context.getDispatcher).to['throw'](Error);
      (0, _chai.expect)(context.dehydrate).to['throw'](Error);
      (0, _chai.expect)(context.rehydrate).to['throw'](Error);
      (0, _chai.expect)(context.destroy.bind(context)).to.not['throw'](Error);
    });

    it('should throw custom method, if used after being destroyed', function () {
      context = _lib2['default'].createContext({
        getRouter: function getRouter() {}
      });

      context.destroy();

      (0, _chai.expect)(context.getRouter).to['throw'](Error);
    });
  });
});