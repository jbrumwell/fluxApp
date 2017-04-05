/* global describe, afterEach, it */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lib = require('../../lib');

var _lib2 = _interopRequireDefault(_lib);

var expect = _chai2['default'].expect;

describe('actions', function () {
  var context = _lib2['default'].createContext();

  var dispatcher = context.getDispatcher();

  function createActions(name, constructor) {
    _lib2['default'].registerActions(name, constructor);

    return context.getActions(name);
  }

  afterEach(function () {
    if (context) {
      context.destroy();
    }

    context = _lib2['default'].createContext();
    dispatcher = context.getDispatcher();

    _lib2['default']._actions = {};
  });

  it('should return a promise', function (done) {
    var actionClass = (function (_BaseActions) {
      _inherits(TestActions, _BaseActions);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method() {
          return 'syncing';
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var actions = createActions('test', actionClass);

    var promise = actions.method();

    expect(promise.then).to.be.a('function');

    promise.then(done.bind(null, null));
  });

  it('should emit the failed event when sync', function (done) {
    var dispatchId = undefined;
    var failedType = _lib2['default'].getActionType('test.method:failed');
    var beforeType = _lib2['default'].getActionType('test.method:before');

    var actionClass = (function (_BaseActions2) {
      _inherits(TestActions, _BaseActions2);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method() {
          throw new Error('sync failure');
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var actions = createActions('test', actionClass);

    function listener(result) {
      if (result.actionType === failedType) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(failedType);
        expect(result.payload.error.message).to.equal('sync failure');
        done();
      } else {
        expect(result.actionType).to.equal(beforeType);
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when sync', function (done) {
    var dispatchId = undefined;

    var actionClass = (function (_BaseActions3) {
      _inherits(TestActions, _BaseActions3);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method() {
          return 'sync';
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var actions = createActions('test', actionClass);

    var methodType = _lib2['default'].getActionType('test.method');
    var beforeType = _lib2['default'].getActionType('test.method:before');

    function listener(result) {
      if (result.actionType === methodType) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(methodType);
        expect(result.payload).to.equal('sync');
        done();
      } else {
        expect(result.actionType).to.equal(beforeType);
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit pre event when async', function (done) {
    var dispatchId = undefined;

    var actionClass = (function (_BaseActions4) {
      _inherits(TestActions, _BaseActions4);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method() {
          return new _bluebird2['default'](function (resolve, reject) {
            setImmediate(function () {
              resolve('async');
            });
          });
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var actions = createActions('test', actionClass);

    function listener(result) {
      dispatcher.unregister(dispatchId);
      expect(result.actionType).to.equal(_lib2['default'].getActionType('test.method:before'));
      expect(result.payload).to.be['instanceof'](Array);
      done();
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the event when async', function (done) {
    var dispatchId = undefined;
    var eventName = _lib2['default'].getActionType('test.method');

    var actionClass = (function (_BaseActions5) {
      _inherits(TestActions, _BaseActions5);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method() {
          return new _bluebird2['default'](function (resolve, reject) {
            setImmediate(function () {
              resolve('async');
            });
          });
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var actions = createActions('test', actionClass);

    function listener(result) {
      if (result.actionType === eventName) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(eventName);
        done();
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit post event when async', function (done) {
    var dispatchId = undefined;
    var eventName = _lib2['default'].getActionType('test.method:after');

    var actionClass = (function (_BaseActions6) {
      _inherits(TestActions, _BaseActions6);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method() {
          return new _bluebird2['default'](function (resolve, reject) {
            setImmediate(function () {
              resolve('async success');
            });
          });
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var actions = createActions('test', actionClass);

    function listener(result) {
      if (result.actionType === eventName) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(eventName);
        expect(result.payload).to.be.undefined;
        done();
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should emit the failed event when async', function (done) {
    var dispatchId = undefined;
    var eventName = _lib2['default'].getActionType('test.method:failed');

    var actionClass = (function (_BaseActions7) {
      _inherits(TestActions, _BaseActions7);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method() {
          return new _bluebird2['default'](function (resolve, reject) {
            setImmediate(function () {
              reject(new Error('async failure'));
            });
          });
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    var actions = createActions('test', actionClass);

    function listener(result) {
      if (result.actionType === eventName) {
        dispatcher.unregister(dispatchId);
        expect(result.actionType).to.equal(eventName);
        done();
      }
    }

    dispatchId = dispatcher.register(listener);

    actions.method();
  });

  it('should receive the parameters passed by component', function (done) {
    var actionClass = (function (_BaseActions8) {
      _inherits(TestActions, _BaseActions8);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'parameters',
        value: function parameters(a, b) {
          expect(a).to.equal('a');
          expect(b).to.equal('b');
          done();
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    createActions('test', actionClass);

    context.getActions('test').parameters('a', 'b');
  });

  it('should resolve to an object of actionType = actionResponse', function (done) {
    var actionClass = (function (_BaseActions9) {
      _inherits(TestActions, _BaseActions9);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'parameters',
        value: function parameters(a, b) {
          expect(a).to.equal('a');
          expect(b).to.equal('b');
          return [a, b];
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    createActions('test', actionClass);

    context.getActions('test').parameters('a', 'b').then(function (result) {
      var actionType = _lib2['default'].getActionType('test.parameters');

      expect(result).to.be.a('object');
      expect(result.actionType).to.equal(actionType);
      expect(result.args).to.be.a('array');
      expect(result.args[0]).to.equal('a');
      expect(result.args[1]).to.equal('b');
      done();
    });
  });

  it('should resolve to an object of actionType = actionResponse async', function (done) {
    var actionClass = (function (_BaseActions10) {
      _inherits(TestActions, _BaseActions10);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method(a, b) {
          expect(a).to.equal('a');
          expect(b).to.equal('b');
          return new _bluebird2['default'](function (resolve) {
            setImmediate(resolve.bind(resolve, [a, b]));
          });
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    createActions('test', actionClass);

    context.getActions('test').method('a', 'b').then(function (result) {
      var actionType = _lib2['default'].getActionType('test.method');

      expect(result).to.be.a('object');
      expect(result.actionType).to.equal(actionType);
      expect(result.args).to.be.a('array');
      expect(result.args[0]).to.equal('a');
      expect(result.args[1]).to.equal('b');
      done();
    });
  });

  it('should return result object (success)', function (done) {
    var actionClass = (function (_BaseActions11) {
      _inherits(TestActions, _BaseActions11);

      function TestActions() {
        _classCallCheck(this, TestActions);

        _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
      }

      _createClass(TestActions, [{
        key: 'method',
        value: function method(a, b) {
          expect(a).to.equal('a');
          expect(b).to.equal('b');
          return new _bluebird2['default'](function (resolve) {
            setImmediate(resolve.bind(resolve, ['c', 'd']));
          });
        }
      }]);

      return TestActions;
    })(_lib.BaseActions);

    createActions('test', actionClass);

    context.getActions('test').method('a', 'b').then(function (result) {
      var actionType = _lib2['default'].getActionType('test.method');

      expect(result).to.be.a('object');

      expect(result).to.include.keys(['status', 'error', 'previousError', 'response', 'args', 'namespace', 'actionType']);
      expect(result.status).to.equal(1);
      expect(result.args).to.eql(['a', 'b']);
      expect(result.error).to.be['null'];
      expect(result.previousError).to.be['null'];
      expect(result.response).to.eql(['c', 'd']);
      expect(result.namespace).to.equal('test.method');
      expect(result.actionType).to.equal(actionType);

      done();
    });
  });
});