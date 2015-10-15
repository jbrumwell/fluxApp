/* global describe, it, sinon, document */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lib = require('../../lib');

var _lib2 = _interopRequireDefault(_lib);

var _chai = require('chai');

var TestComponent = (function (_Component) {
  _inherits(TestComponent, _Component);

  function TestComponent() {
    _classCallCheck(this, TestComponent);

    _get(Object.getPrototypeOf(TestComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(TestComponent, [{
    key: '_componentWillMount',
    value: function _componentWillMount() {
      if (this.props.spies.will) {
        this.props.spies.will();
      }
    }
  }, {
    key: '_componentWillUnmount',
    value: function _componentWillUnmount() {
      if (this.props.spies.un) {
        this.props.spies.un();
      }
    }
  }, {
    key: 'getSpies',
    value: function getSpies() {
      return {};
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
  }]);

  return TestComponent;
})(_lib.Component);

describe('Component', function () {
  var renderedComponent = undefined;

  function renderComponent(Comp, spies) {
    var elem = document.createElement('div');

    var context = _lib2['default'].createContext(context);
    var ContextWrapper = context.wrapper;

    document.body.appendChild(elem);

    return _react2['default'].render(_react2['default'].createElement(ContextWrapper, { handler: Comp, context: context, spies: spies }), elem);
  }

  describe('lifecycle', function () {
    it('should call _componentWillMount', function () {
      var Comp = (function (_TestComponent) {
        _inherits(Comp, _TestComponent);

        function Comp() {
          _classCallCheck(this, Comp);

          _get(Object.getPrototypeOf(Comp.prototype), 'constructor', this).apply(this, arguments);
        }

        return Comp;
      })(TestComponent);
      var will = sinon.spy();

      renderComponent(Comp, {
        will: will
      });

      (0, _chai.expect)(will.callCount).to.equal(1);
    });

    it('should call _componentWillUnmount', function () {
      var Comp = (function (_TestComponent2) {
        _inherits(Comp, _TestComponent2);

        function Comp() {
          _classCallCheck(this, Comp);

          _get(Object.getPrototypeOf(Comp.prototype), 'constructor', this).apply(this, arguments);
        }

        return Comp;
      })(TestComponent);
      var un = sinon.spy();

      renderedComponent = renderComponent(Comp, {
        un: un
      });

      var elem = renderedComponent.getDOMNode().parentNode;
      _react2['default'].unmountComponentAtNode(elem);
      document.body.removeChild(elem);

      (0, _chai.expect)(un.callCount).to.equal(1);
    });

    it('should proxy componentWillMount', function () {
      var will = sinon.spy();
      var Comp = (function (_TestComponent3) {
        _inherits(Comp, _TestComponent3);

        function Comp() {
          _classCallCheck(this, Comp);

          _get(Object.getPrototypeOf(Comp.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(Comp, [{
          key: 'componentWillMount',
          value: function componentWillMount() {
            this.props.spies.will();
          }
        }]);

        return Comp;
      })(TestComponent);

      renderComponent(Comp, {
        will: will
      });

      (0, _chai.expect)(will.callCount).to.equal(2);
    });

    it('should proxy componentWillUnmount', function () {
      var un = sinon.spy();
      var Comp = (function (_TestComponent4) {
        _inherits(Comp, _TestComponent4);

        function Comp() {
          _classCallCheck(this, Comp);

          _get(Object.getPrototypeOf(Comp.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(Comp, [{
          key: 'componentWillUnmount',
          value: function componentWillUnmount() {
            this.props.spies.un();
          }
        }]);

        return Comp;
      })(TestComponent);

      renderedComponent = renderComponent(Comp, {
        un: un
      });

      var elem = renderedComponent.getDOMNode().parentNode;
      _react2['default'].unmountComponentAtNode(elem);
      document.body.removeChild(elem);

      (0, _chai.expect)(un.callCount).to.equal(2);
    });
  });
});