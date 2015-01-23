/* global describe, it, afterEach, document, expect, sinon */
'use strict';

// env setup
var React = require('react/addons');
var fluxApp = require('../../lib');

describe('Stores', function() {

  var renderedComponent;

  function renderComponent(spec) {
    var elem = document.createElement('div');
    var Component = React.createClass(spec);
    document.body.appendChild(elem);
    return React.render(<Component />, elem);
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
    fluxApp.createStore('test');

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
    var store = fluxApp.createStore('test');
    var spy = sinon.spy();

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
    });

    store.emitChange();

    expect(spy.called).to.equal(true);
  });

  it('should not get notified when a store updates, when unmounted', function() {
    var store = fluxApp.createStore('test');
    var spy = sinon.spy();

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
    });

    store.emitChange();

    expect(spy.called).to.equal(true);

    var elem = renderedComponent.getDOMNode().parentNode;
    React.unmountComponentAtNode(elem);
    document.body.removeChild(elem);

    renderedComponent = null;

    store.emitChange();

    expect(spy.callCount).to.equal(1);
  });
});
