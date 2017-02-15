/* global describe, it, afterEach, document, sinon, expect */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _libDom = require('../lib/dom');

var _libDom2 = _interopRequireDefault(_libDom);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lib = require('../../../lib');

var _lib2 = _interopRequireDefault(_lib);

exports['default'] = function () {
  describe('errors', function () {
    var renderedComponent = undefined;

    function renderComponent(Comp, context) {
      var elem = document.createElement('div');

      context = context && context.context ? context.context : _lib2['default'].createContext(context);
      var ContextWrapper = context.wrapper;

      document.body.appendChild(elem);

      return _libDom2['default'].render(_react2['default'].createElement(ContextWrapper, { handler: Comp, context: context }), elem);
    }

    before(function () {
      var actionClass = (function (_BaseActions) {
        _inherits(TestActions, _BaseActions);

        function TestActions() {
          _classCallCheck(this, TestActions);

          _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestActions, [{
          key: 'error',
          value: function error() {
            throw new Error('action error');
          }
        }, {
          key: 'asyncError',
          value: function asyncError() {
            return new _bluebird2['default'](function (resolve, reject) {
              setTimeout(resolve, 500);
            }).then(function () {
              throw new Error('action async error');
            });
          }
        }, {
          key: 'storeAsync',
          value: function storeAsync() {
            return new _bluebird2['default'](function (resolve, reject) {
              setTimeout(resolve, 500);
            }).then(function () {
              return {};
            });
          }
        }, {
          key: 'storeSync',
          value: function storeSync() {}
        }, {
          key: 'sync',
          value: function sync() {}
        }, {
          key: 'async',
          value: function async() {}
        }]);

        return TestActions;
      })(_lib.BaseActions);

      _lib2['default'].registerActions('testing', actionClass);

      var storeClass = (function (_BaseStore) {
        _inherits(TestStore, _BaseStore);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestStore, [{
          key: 'onSyncError',
          value: function onSyncError(result) {
            throw new Error('store sync error');
          }
        }, {
          key: 'onAsyncError',
          value: function onAsyncError(result) {
            return new _bluebird2['default'](function (resolve, reject) {
              setTimeout(resolve, 500);
            }).then(function () {
              throw new Error('store async error');
            });
          }
        }], [{
          key: 'actions',
          value: {
            onAsyncError: 'testing.storeAsync',
            onSyncError: 'testing.storeSync'
          },
          enumerable: true
        }]);

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('testing', storeClass);
    });

    after(function () {
      _lib2['default']._stores = {};
      _lib2['default']._actions = {};
    });

    afterEach(function () {
      if (renderedComponent) {
        var elem = _libDom2['default'].findDOMNode(renderedComponent).parentNode;
        _libDom2['default'].unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      renderedComponent = null;
    });

    it('action error sync', function (done) {
      var context = _lib2['default'].createContext();
      var spy = sinon.spy();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component) {
        _inherits(TestComponent, _Component);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onFailed',
          value: function onFailed() {
            spy();
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onFailed: 'testing.error:failed'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      context.getActions('testing').error().then(function () {
        expect(globalSpy.called).to.equal(true);
        expect(spy.called).to.equal(true);
        done();
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('action error');
          expect(event.payload.type).to.equal('action');
        }
      });
    });

    it('action error async', function (done) {
      var context = _lib2['default'].createContext();
      var spy = sinon.spy();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component2) {
        _inherits(TestComponent, _Component2);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onFailed',
          value: function onFailed() {
            spy();
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onFailed: 'testing.asyncError:failed'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      context.getActions('testing').asyncError().then(function () {
        expect(globalSpy.called).to.equal(true);
        expect(spy.called).to.equal(true);
        done();
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('action async error');
          expect(event.payload.type).to.equal('action');
        }
      });
    });

    it('store async error', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component3) {
        _inherits(TestComponent, _Component3);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      context.getActions('testing').storeAsync().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('store async error');
          expect(event.payload.type).to.equal('listener');
        }
      });
    });

    it('store sync error', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component4) {
        _inherits(TestComponent, _Component4);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('store sync error');
          expect(event.payload.type).to.equal('listener');
        }
      });

      context.getActions('testing').storeSync().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });
    });

    it('before sync event', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component5) {
        _inherits(TestComponent, _Component5);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onBefore',
          value: function onBefore() {
            throw new Error('testing before');
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onBefore: 'testing.sync:before'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('testing before');
          expect(event.payload.type).to.equal('before');
        }
      });

      context.getActions('testing').sync().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });
    });

    it('before async event', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component6) {
        _inherits(TestComponent, _Component6);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onBefore',
          value: function onBefore() {
            throw new Error('testing before');
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onBefore: 'testing.async:before'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('testing before');
          expect(event.payload.type).to.equal('before');
        }
      });

      context.getActions('testing').async().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });
    });

    it('after sync event', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component7) {
        _inherits(TestComponent, _Component7);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onAfter',
          value: function onAfter() {
            throw new Error('testing after');
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onAfter: 'testing.sync:after'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('testing after');
          expect(event.payload.type).to.equal('after');
        }
      });

      context.getActions('testing').sync().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });
    });

    it('after async event', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component8) {
        _inherits(TestComponent, _Component8);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onAfter',
          value: function onAfter() {
            throw new Error('testing after');
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onAfter: 'testing.async:after'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('testing after');
          expect(event.payload.type).to.equal('after');
        }
      });

      context.getActions('testing').async().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });
    });

    it('failed sync event', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component9) {
        _inherits(TestComponent, _Component9);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onFailed',
          value: function onFailed() {
            throw new Error('testing failed');
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onFailed: 'testing.error:failed'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('testing failed');
          expect(event.payload.type).to.equal('failed');
        }
      });

      context.getActions('testing').error().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });
    });

    it('failed async event', function (done) {
      var context = _lib2['default'].createContext();
      var globalSpy = sinon.spy();

      var Comp = (function (_Component10) {
        _inherits(TestComponent, _Component10);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onFailed',
          value: function onFailed() {
            throw new Error('testing async failed');
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }], [{
          key: 'actions',
          value: {
            onFailed: 'testing.asyncError:failed'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var Dispatcher = context.getDispatcher();

      var token = Dispatcher.register(function (event) {
        if (event.actionType === 'ACTION_FAILED') {
          globalSpy();
          expect(event.payload.error.message).to.equal('testing async failed');
          expect(event.payload.type).to.equal('failed');
        }
      });

      context.getActions('testing').asyncError().then(function () {
        expect(globalSpy.called).to.equal(true);
        done();
      });
    });
  });
};

module.exports = exports['default'];