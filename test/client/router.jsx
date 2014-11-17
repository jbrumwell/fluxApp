/* global describe, it, afterEach, document, spy, expect */
'use strict';

// env setup
var React = require('react/addons');
var fluxApp = require('../../lib');

describe('Router', function() {

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

    fluxApp._stores = {};
  });

  it('should expose a getStore method', function() {
    renderedComponent = renderComponent({
      mixins: [fluxApp.mixins.component],

      flux: {
        route: {
          id: 1,
          path: '/index'
        }
      },

      render: function() {
        expect(this.getStore).to.be.a('function');

        return (
          <h1>Hello</h1>
        );
      }
    });

    var route = fluxApp.matchRoute('/index');

    expect(route.id).to.equal(1);
  });
});
