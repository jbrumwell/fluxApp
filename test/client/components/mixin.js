/* global describe, it, afterEach, document, sinon, expect */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

      return _react2['default'].render(_react2['default'].createElement(ContextWrapper, { handler: Component, context: context }), elem);
    }

    afterEach(function () {
      if (renderedComponent) {
        var elem = renderedComponent.getDOMNode().parentNode;
        _react2['default'].unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      renderedComponent = null;

      _lib2['default']._stores = {};
      _lib2['default']._actions = {};
    });

    it('should expose a getActions method', function () {
      renderedComponent = renderComponent({
        mixins: [_lib2['default'].mixins.component],

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
        mixins: [_lib2['default'].mixins.component],

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
        _lib2['default'].registerActions('testing', {
          methodA: function methodA() {},
          methodB: function methodB() {}
        });

        renderedComponent = renderComponent({
          mixins: [_lib2['default'].mixins.component],

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
        _lib2['default'].registerActions('testing', {
          methodA: function methodA() {},
          methodB: function methodB() {}
        });

        renderedComponent = renderComponent({
          mixins: [_lib2['default'].mixins.component],

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

      _lib2['default'].registerActions('test', {
        method: function method() {
          return new _bluebird2['default'](function (resolve) {
            setImmediate(function () {
              resolve('something');
            });
          });
        }
      });

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].mixins.component],

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

      _lib2['default'].registerActions('test', {
        method: function method() {
          return new _bluebird2['default'](function (resolve) {
            setImmediate(function () {
              resolve('something');
            });
          });
        }
      });

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].mixins.component],

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

      _lib2['default'].registerActions('test', {
        method: function method() {
          throw new Error('sync failed');
        }
      });

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].mixins.component],

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

      _lib2['default'].registerActions('test', {
        method: function method() {
          return new _bluebird2['default'](function (resolve, reject) {
            setImmediate(function () {
              reject(new Error('something'));
            });
          });
        }
      });

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].mixins.component],

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

      _lib2['default'].registerActions('test', {
        method: function method() {
          expect(this.context.custom()).to.equal(true);
          done();
        }
      });

      context.getActions('test').method();
    });
  });
};

module.exports = exports['default'];