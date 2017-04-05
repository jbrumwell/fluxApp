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
  describe('mixin', function () {
    var renderedComponent = undefined;

    function renderComponent(spec, context) {
      var elem = document.createElement('div');
      var Component = _react2['default'].createClass(spec);

      context = context && context.context ? context.context : _lib2['default'].createContext(context);
      var ContextWrapper = context.wrapper;

      document.body.appendChild(elem);

      return _libDom2['default'].render(_react2['default'].createElement(ContextWrapper, { handler: Component, context: context }), elem);
    }

    afterEach(function () {
      if (renderedComponent) {
        var elem = _libDom2['default'].findDOMNode(renderedComponent).parentNode;
        _libDom2['default'].unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      renderedComponent = null;

      _lib2['default']._stores = {};
      _lib2['default']._actions = {};
    });

    it('should expose a getActions method', function () {
      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        render: function render() {
          expect(this.getActions).to.be.a('function');

          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      });
    });

    it('should expose a getAction method', function () {
      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        render: function render() {
          expect(this.getActions).to.be.a('function');

          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      });
    });

    describe('getActions', function () {
      it('should return the actions registered', function () {
        var actionClass = (function (_BaseActions) {
          _inherits(TestActions, _BaseActions);

          function TestActions() {
            _classCallCheck(this, TestActions);

            _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
          }

          _createClass(TestActions, [{
            key: 'methodA',
            value: function methodA() {}
          }, {
            key: 'methodB',
            value: function methodB() {}
          }]);

          return TestActions;
        })(_lib.BaseActions);

        _lib2['default'].registerActions('testing', actionClass);

        renderedComponent = renderComponent({
          mixins: [_lib2['default'].Mixin],

          render: function render() {
            expect(this.getActions).to.be.a('function');
            var actions = this.getActions('testing');

            expect(actions).to.be.a('object');
            expect(actions.methodA).to.be.a('function');
            expect(actions.methodB).to.be.a('function');

            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        });
      });
    });

    describe('getAction', function () {
      it('should return the action requested', function () {
        var actionClass = (function (_BaseActions2) {
          _inherits(TestActions, _BaseActions2);

          function TestActions() {
            _classCallCheck(this, TestActions);

            _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
          }

          _createClass(TestActions, [{
            key: 'methodA',
            value: function methodA() {}
          }, {
            key: 'methodB',
            value: function methodB() {}
          }]);

          return TestActions;
        })(_lib.BaseActions);

        _lib2['default'].registerActions('testing', actionClass);

        renderedComponent = renderComponent({
          mixins: [_lib2['default'].Mixin],

          render: function render() {
            expect(this.getAction).to.be.a('function');
            var action = this.getAction('testing', 'methodA');

            expect(action).to.be.a('function');

            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        });
      });
    });

    it('should get notified when a before action occurs', function (done) {
      var spy = sinon.spy();
      var context = _lib2['default'].createContext();

      var actionClass = (function (_BaseActions3) {
        _inherits(TestActions, _BaseActions3);

        function TestActions() {
          _classCallCheck(this, TestActions);

          _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestActions, [{
          key: 'method',
          value: function method() {
            return new _bluebird2['default'](function (resolve) {
              setImmediate(function () {
                resolve('something');
              });
            });
          }
        }]);

        return TestActions;
      })(_lib.BaseActions);

      _lib2['default'].registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        flux: {
          actions: {
            onTestMethodBefore: 'test.method:before'
          }
        },

        onTestMethodBefore: spy,

        render: function render() {
          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      }, {
        context: context
      });

      var promise = context.getActions('test').method();

      promise.then(function () {
        expect(spy.called).to.equal(true);
        done();
      });
    });

    it('should get notified when a after action occurs', function (done) {
      var context = _lib2['default'].createContext();

      var actionClass = (function (_BaseActions4) {
        _inherits(TestActions, _BaseActions4);

        function TestActions() {
          _classCallCheck(this, TestActions);

          _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestActions, [{
          key: 'method',
          value: function method() {
            return new _bluebird2['default'](function (resolve) {
              setImmediate(function () {
                resolve('something');
              });
            });
          }
        }]);

        return TestActions;
      })(_lib.BaseActions);

      _lib2['default'].registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        flux: {
          actions: {
            onTestMethodAfter: 'test.method:after'
          }
        },

        onTestMethodAfter: function onTestMethodAfter() {
          done();
        },

        render: function render() {
          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      }, {
        context: context
      });

      context.getActions('test').method();
    });

    it('should get notified when failed action occurs (SYNC)', function (done) {
      var context = _lib2['default'].createContext();

      var actionClass = (function (_BaseActions5) {
        _inherits(TestActions, _BaseActions5);

        function TestActions() {
          _classCallCheck(this, TestActions);

          _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestActions, [{
          key: 'method',
          value: function method() {
            throw new Error('sync failed');
          }
        }]);

        return TestActions;
      })(_lib.BaseActions);

      _lib2['default'].registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        flux: {
          actions: {
            onTestMethodFailed: 'test.method:failed'
          }
        },

        onTestMethodFailed: function onTestMethodFailed() {
          done();
        },

        render: function render() {
          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      }, {
        context: context
      });

      context.getActions('test').method();
    });

    it('should get notified when failed action occurs', function (done) {
      var context = _lib2['default'].createContext();

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
                reject(new Error('something'));
              });
            });
          }
        }]);

        return TestActions;
      })(_lib.BaseActions);

      _lib2['default'].registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        flux: {
          actions: {
            onTestMethodFailed: 'test.method:failed'
          }
        },

        onTestMethodFailed: function onTestMethodFailed() {
          done();
        },

        render: function render() {
          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      }, {
        context: context
      });

      context.getActions('test').method();
    });

    it('should have access to custom context methods', function (done) {
      var context = _lib2['default'].createContext({
        custom: function custom() {
          return true;
        }
      });

      var actionClass = (function (_BaseActions7) {
        _inherits(TestActions, _BaseActions7);

        function TestActions() {
          _classCallCheck(this, TestActions);

          _get(Object.getPrototypeOf(TestActions.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestActions, [{
          key: 'method',
          value: function method() {
            expect(this.context.custom()).to.equal(true);
            done();
          }
        }]);

        return TestActions;
      })(_lib.BaseActions);

      _lib2['default'].registerActions('test', actionClass);

      context.getActions('test').method();
    });
  });
};

module.exports = exports['default'];