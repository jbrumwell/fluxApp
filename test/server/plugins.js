/* global describe, it, beforeEach */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chai = require('chai');

var _lib = require('../../lib');

var _lib2 = _interopRequireDefault(_lib);

describe('Plugins', function () {
  var fluxapp = undefined;

  beforeEach(function () {
    fluxapp = _lib2['default'].noConflict();
  });

  it('should be possible to retrieve plugin', function () {
    var plugin = {
      stores: {
        test: {}
      }
    };

    fluxapp.registerPlugin('test', plugin);

    (0, _chai.expect)(fluxapp.getPlugin('test')).to.be.a('object');
    (0, _chai.expect)(fluxapp.getPlugin('test')).to.equal(plugin);
  });

  it('should register multiple plugins', function () {
    fluxapp.registerPlugins({
      test: {
        contextMethods: {
          getTest: function getTest() {}
        }
      },
      two: {
        contextMethods: {
          getTwo: function getTwo() {}
        }
      }
    });

    var context = fluxapp.createContext();

    (0, _chai.expect)(fluxapp.hasPlugin('test')).to.equal(true);
    (0, _chai.expect)(fluxapp.hasPlugin('two')).to.equal(true);
    (0, _chai.expect)(context.getTest).to.be.a('function');
    (0, _chai.expect)(context.getTwo).to.be.a('function');
  });

  it('should register stores passed', function () {
    var storeClass = (function (_BaseStore) {
      _inherits(TestStore, _BaseStore);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);

    fluxapp.registerPlugin('test', {
      stores: {
        test: storeClass
      }
    });

    var stores = fluxapp.getStores();

    (0, _chai.expect)(stores.test).to.be.a('function');
  });

  it('should register actions passed', function () {
    var testActions = (function (_BaseActions) {
      _inherits(TestActions, _BaseActions);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'test',
        value: function test() {
          throw new Error('sync failure');
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    fluxapp.registerPlugin('test', {
      actions: {
        test: testActions
      }
    });

    var actions = fluxapp.getActions();

    (0, _chai.expect)(actions.test).to.be.a('function');
  });

  it('should register context methods passed', function () {
    fluxapp.registerPlugin('test', {
      contextMethods: {
        getTest: function getTest() {}
      }
    });

    var context = fluxapp.createContext();

    (0, _chai.expect)(context.getTest).to.be.a('function');
  });

  it('should be possible to know if a plugin is registered', function () {
    fluxapp.registerPlugin('test', {
      contextMethods: {
        getTest: function getTest() {}
      }
    });

    (0, _chai.expect)(fluxapp.hasPlugin('test')).to.equal(true);
  });

  it('should be possible to remove a plugin', function () {
    var testActions = (function (_BaseActions2) {
      _inherits(TestActions, _BaseActions2);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'test',
        value: function test() {
          throw new Error('sync failure');
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var storeClass = (function (_BaseStore2) {
      _inherits(TestStore, _BaseStore2);

      function TestStore() {
        _classCallCheck(this, TestStore);

        _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
      }

      return TestStore;
    })(_lib.BaseStore);

    fluxapp.registerPlugin('test', {
      actions: {
        test: testActions
      },

      stores: {
        test: storeClass
      },

      contextMethods: {
        getTest: function getTest() {}
      }
    });

    var stores = fluxapp.getStores();
    var actions = fluxapp.getActions();
    var context = fluxapp.createContext();

    (0, _chai.expect)(context.getTest).to.be.a('function');
    (0, _chai.expect)(actions.test).to.be.a('function');
    (0, _chai.expect)(stores.test).to.be.a('function');
    (0, _chai.expect)(fluxapp.hasPlugin('test')).to.equal(true);

    fluxapp.removePlugin('test');

    stores = fluxapp.getStores();
    actions = fluxapp.getActions();
    context = fluxapp.createContext();

    (0, _chai.expect)(context.getTest).to.be.a('undefined');
    (0, _chai.expect)(actions.test).to.be.a('undefined');
    (0, _chai.expect)(stores.test).to.be.a('undefined');
    (0, _chai.expect)(fluxapp.hasPlugin('test')).to.equal(false);
  });
});