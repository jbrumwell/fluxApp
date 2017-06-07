/* global describe, it, afterEach, document, sinon, expect */
import React from 'react';
import DOM from '../lib/dom';
import fluxapp, { BaseStore } from '../../../lib';

export default () => {
  describe('mixin', () => {
    let renderedComponent;

    function renderComponent(spec, context) {
      const elem = document.createElement('div');
      const Component = React.createClass(spec);

      context = context && context.context ? context.context : fluxapp.createContext(context);
      const ContextWrapper = context.wrapper;

      document.body.appendChild(elem);

      return DOM.render((
        <ContextWrapper handler={Component} context={context} />
      ), elem);
    }

    afterEach(() => {
      if (renderedComponent) {
        const elem = DOM.findDOMNode(renderedComponent).parentNode;
        DOM.unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      Object.keys(fluxapp._stores).forEach((id) => {
        fluxapp.removeStore(id);
      });
    });

    it('should expose a getStore method', () => {
      renderedComponent = renderComponent({
        mixins : [ fluxapp.Mixin ],

        render() {
          expect(this.getStore).to.be.a('function');

          return (
            <h1>Hello</h1>
          );
        },
      });
    });

    it('should return a store when getStore is called', () => {
      const storeClass = class TestStore extends BaseStore {};

      fluxapp.registerStore('test', storeClass);

      renderedComponent = renderComponent({
        mixins : [ fluxapp.Mixin ],

        render() {
          expect(this.getStore).to.be.a('function');
          expect(this.getStore('test') instanceof BaseStore).to.equal(true);

          return (
            <h1>Hello</h1>
          );
        },
      });
    });

    it('should get notified when a store updates', (done) => {
      const storeClass = class TestStore extends BaseStore {};

      fluxapp.registerStore('test', storeClass);

      const spy = sinon.spy();
      const context = fluxapp.createContext();
      const store = context.getStore('test');

      renderedComponent = renderComponent({
        mixins : [ fluxapp.Mixin ],

        flux : {
          stores : {
            onTestUpdate : 'test',
          },
        },

        onTestUpdate() {
          done();
        },

        render() {
          return (
            <h1>Hello</h1>
          );
        },
      }, {
        context : context,
      });

      context.getStore('test');

      store.emitChange();
    });

    it('should not get notified when a store updates, when unmounted', (done) => {
      const storeClass = class TestStore extends BaseStore {};

      fluxapp.registerStore('test', storeClass);

      const spy = sinon.spy();
      const context = fluxapp.createContext();
      const store = context.getStore('test');

      renderedComponent = renderComponent({
        mixins : [ fluxapp.Mixin ],

        flux : {
          stores : {
            onTestUpdate : 'test',
          },
        },

        onTestUpdate : spy,

        render() {
          return (
            <h1>Hello</h1>
          );
        },
      }, {
        context : context,
      });

      context.getStore('test');

      store.emitChange();

      setTimeout(() => {
        expect(spy.called).to.equal(true);

        const elem = DOM.findDOMNode(renderedComponent).parentNode;
        DOM.unmountComponentAtNode(elem);
        document.body.removeChild(elem);

        renderedComponent = null;

        store.emitChange();

        setTimeout(() => {
          expect(spy.callCount).to.equal(1);
          done();
        }, 200);
      }, 200);
    });

    it('should have access to custom context', (done) => {
      const storeClass = class TestStore extends BaseStore {
        method() {
          this.setState({
            custom : this.context.custom(),
          });
        }
      };

      fluxapp.registerStore('test', storeClass);

      const spy = sinon.spy();
      const context = fluxapp.createContext({
        custom() {
          return true;
        },
      });
      const store = context.getStore('test');

      renderedComponent = renderComponent({
        mixins : [ fluxapp.Mixin ],

        flux : {
          stores : {
            onTestUpdate : 'test',
          },
        },

        onTestUpdate : spy,

        render() {
          return (
            <h1>Hello</h1>
          );
        },
      }, {
        context : context,
      });

      context.getStore('test');

      store.method();

      const state = store.getState();

      setTimeout(() => {
        expect(spy.called).to.equal(true);
        expect(state.custom).to.equal(true);
        done();
      }, 200);
    });
  });
};
