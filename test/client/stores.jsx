/* global describe, it, afterEach, document, expect, sinon */
'use strict';

// env setup
var React = require('react/addons');
var fluxApp = require('../../lib');

describe('Stores', function() {

  var renderedComponent;

  function renderComponent(spec, context) {
    var elem = document.createElement('div');
    var Component = React.createClass(spec);

    var ContextWrapper = fluxApp.createWrapper(
      {
        handler: Component
      },
      context
    );

    document.body.appendChild(elem);

    return React.render((
      <ContextWrapper />
    ), elem);
  }

  afterEach(function() {
    if (renderedComponent) {
      var elem = renderedComponent.getDOMNode().parentNode;
      React.unmountComponentAtNode(elem);
      document.body.removeChild(elem);
    }

    Object.keys(fluxApp._stores).forEach(function destroyStore(id) {
      fluxApp.removeStore(id);
    });
  });

  it('should expose a getStore method', function() {
    renderedComponent = renderComponent({
      mixins : [ fluxApp.mixins.component ],

      render : function() {
        expect(this.getStore).to.be.a('function');

        return (
          <h1>Hello</h1>
        );
      }
    });
  });

  it('should return a store when getStore is called', function() {
    fluxApp.registerStore('test');

    renderedComponent = renderComponent({
      mixins : [ fluxApp.mixins.component ],

      render : function() {
        expect(this.getStore).to.be.a('function');
        expect(this.getStore('test').id).to.equal('test');

        return (
          <h1>Hello</h1>
        );
      }
    });
  });

  it('should get notified when a store updates', function() {
    fluxApp.registerStore('test');

    var spy = sinon.spy();
    var context = fluxApp.createContext();
    var store = context.getStore('test');

    renderedComponent = renderComponent({
      mixins : [ fluxApp.mixins.component ],

      flux : {
        stores : {
          onTestUpdate : 'test'
        }
      },

      onTestUpdate : spy,

      render : function() {
        return (
          <h1>Hello</h1>
        );
      }
    }, {
      context: context
    });

    context.getStore('test');

    store.emitChange();

    expect(spy.called).to.equal(true);
  });

  it('should not get notified when a store updates, when unmounted', function() {
    fluxApp.registerStore('test');

    var spy = sinon.spy();
    var context = fluxApp.createContext();
    var store = context.getStore('test');

    renderedComponent = renderComponent({
      mixins : [ fluxApp.mixins.component ],

      flux : {
        stores : {
          onTestUpdate : 'test'
        }
      },

      onTestUpdate : spy,

      render : function() {
        return (
          <h1>Hello</h1>
        );
      }
    }, {
      context: context
    });

    context.getStore('test');

    store.emitChange();

    expect(spy.called).to.equal(true);

    var elem = renderedComponent.getDOMNode().parentNode;
    React.unmountComponentAtNode(elem);
    document.body.removeChild(elem);

    renderedComponent = null;

    store.emitChange();

    expect(spy.callCount).to.equal(1);
  });

  it('should have access to custom context', function() {
    fluxApp.registerStore('test', {
      method: function() {
        this.setState({
          custom: this.context.custom()
        });
      }
    });

    var spy = sinon.spy();
    var context = fluxApp.createContext({
      custom: function() {
        return true;
      }
    });
    var store = context.getStore('test');

    renderedComponent = renderComponent({
      mixins : [ fluxApp.mixins.component ],

      flux : {
        stores : {
          onTestUpdate : 'test'
        }
      },

      onTestUpdate : spy,

      render : function() {
        return (
          <h1>Hello</h1>
        );
      }
    }, {
      context: context,
    });

    context.getStore('test');

    store.method();

    expect(spy.called).to.equal(true);
    expect(store.state.custom).to.equal(true);
  });
});
