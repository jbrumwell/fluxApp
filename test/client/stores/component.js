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

var _lib = require('../../../lib');

var _lib2 = _interopRequireDefault(_lib);

exports['default'] = function () {
  describe('component', function () {
    var renderedComponent = undefined;

    function renderComponent(Comp, context) {
      var elem = document.createElement('div');

      context = context && context.context ? context.context : _lib2['default'].createContext(context);
      var ContextWrapper = context.wrapper;

      document.body.appendChild(elem);

      return _react2['default'].render(_react2['default'].createElement(ContextWrapper, { handler: Comp, context: context }), elem);
    }

    afterEach(function () {
      if (renderedComponent) {
        var elem = renderedComponent.getDOMNode().parentNode;
        _react2['default'].unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      Object.keys(_lib2['default']._stores).forEach(function (id) {
        _lib2['default'].removeStore(id);
      });
    });

    it('should expose a getStore method', function () {
      var Comp = (function (_Component) {
        _inherits(TestComponent, _Component);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'render',
          value: function render() {
            expect(this.getStore).to.be.a('function');

            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp);
    });

    it('should return a store when getStore is called', function () {
      var storeClass = (function (_BaseStore) {
        _inherits(TestStore, _BaseStore);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      var Comp = (function (_Component2) {
        _inherits(TestComponent, _Component2);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'render',
          value: function render() {
            expect(this.getStore).to.be.a('function');
            expect(this.getStore('test') instanceof _lib.BaseStore).to.equal(true);

            return _react2['default'].createElement(
              'h1',
              null,
              'Hello'
            );
          }
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp);
    });

    it('should get notified when a store updates', function () {
      var storeClass = (function (_BaseStore2) {
        _inherits(TestStore, _BaseStore2);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      var spy = sinon.spy();
      var context = _lib2['default'].createContext();

      var Comp = (function (_Component3) {
        _inherits(TestComponent, _Component3);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onTestUpdate',
          value: function onTestUpdate() {
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
          key: 'stores',
          value: {
            onTestUpdate: 'test'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      var store = context.getStore('test');

      store.emitChange();

      expect(spy.called).to.equal(true);
    });

    it('should not get notified when a store updates, when unmounted', function () {
      var storeClass = (function (_BaseStore3) {
        _inherits(TestStore, _BaseStore3);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      var spy = sinon.spy();
      var context = _lib2['default'].createContext();
      var store = context.getStore('test');

      var Comp = (function (_Component4) {
        _inherits(TestComponent, _Component4);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onTestUpdate',
          value: function onTestUpdate() {
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
          key: 'stores',
          value: {
            onTestUpdate: 'test'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      context.getStore('test');

      store.emitChange();

      expect(spy.called).to.equal(true);

      var elem = renderedComponent.getDOMNode().parentNode;
      _react2['default'].unmountComponentAtNode(elem);
      document.body.removeChild(elem);

      renderedComponent = null;

      store.emitChange();

      expect(spy.callCount).to.equal(1);
    });

    it('should have access to custom context', function () {
      var storeClass = (function (_BaseStore4) {
        _inherits(TestStore, _BaseStore4);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestStore, [{
          key: 'method',
          value: function method() {
            this.setState({
              custom: this.context.custom()
            });
          }
        }]);

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      var spy = sinon.spy();
      var context = _lib2['default'].createContext({
        custom: function custom() {
          return true;
        }
      });
      var store = context.getStore('test');

      var Comp = (function (_Component5) {
        _inherits(TestComponent, _Component5);

        function TestComponent() {
          _classCallCheck(this, TestComponent);

          _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestComponent, [{
          key: 'onTestUpdate',
          value: function onTestUpdate() {
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
          key: 'stores',
          value: {
            onTestUpdate: 'test'
          },
          enumerable: true
        }]);

        return TestComponent;
      })(_lib.Component);

      renderedComponent = renderComponent(Comp, {
        context: context
      });

      context.getStore('test');

      store.method();

      var state = store.getState();

      expect(spy.called).to.equal(true);
      expect(state.custom).to.equal(true);
    });
  });
};

module.exports = exports['default'];