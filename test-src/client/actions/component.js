/* global describe, it, afterEach, document, sinon, expect */
import React from 'react';
import Promise from 'bluebird';
import fluxapp, { BaseActions, Component } from '../../../lib';

export default () => {
  describe('component', () => {
    let renderedComponent;

    function renderComponent(Comp, context) {
      const elem = document.createElement('div');

      context = context && context.context ? context.context : fluxapp.createContext(context);
      const ContextWrapper = context.wrapper;

      document.body.appendChild(elem);

      return React.render((
        <ContextWrapper handler={Comp} context={context} />
      ), elem);
    }

    afterEach(() => {
      if (renderedComponent) {
        const elem = renderedComponent.getDOMNode().parentNode;
        React.unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      renderedComponent = null;

      fluxapp._stores = {};
      fluxapp._actions = {};
    });

    it('should expose a getActions method', () => {
      const Comp = class TestComponent extends Component {
        render() {
          expect(this.getActions).to.be.a('function');

          return (
            <h1>Hello</h1>
          );
        }
      };

      renderedComponent = renderComponent(Comp);
    });

    it('should expose a getAction method', () => {
      const Comp = class TestComponent extends Component {
        render() {
          expect(this.getActions).to.be.a('function');

          return (
            <h1>Hello</h1>
          );
        }
      };

      renderedComponent = renderComponent(Comp);
    });

    describe('getActions', () => {
      it('should return the actions registered', () => {
        const actionClass = class TestActions extends BaseActions {
          methodA() {}
          methodB() {}
        };

        fluxapp.registerActions('testing', actionClass);

        const Comp = class TestComponent extends Component {
          render() {
            expect(this.getActions).to.be.a('function');
            const actions = this.getActions('testing');

            expect(actions).to.be.a('object');
            expect(actions.methodA).to.be.a('function');
            expect(actions.methodB).to.be.a('function');

            return (
              <h1>Hello</h1>
            );
          }
        };

        renderedComponent = renderComponent(Comp);
      });
    });

    describe('getAction', () => {
      it('should return the action requested', () => {
        const actionClass = class TestActions extends BaseActions {
          methodA() {}
          methodB() {}
        };

        fluxapp.registerActions('testing', actionClass);

        const Comp = class TestComponent extends Component {
          render() {
            expect(this.getAction).to.be.a('function');
            const action = this.getAction('testing', 'methodA');

            expect(action).to.be.a('function');

            return (
              <h1>Hello</h1>
            );
          }
        };

        renderedComponent = renderComponent(Comp);
      });
    });


    it('should get notified when a before action occurs', function(done) {
      const spy = sinon.spy();
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          return new Promise((resolve) => {
            setImmediate(() => {
              resolve('something');
            });
          });
        }
      };

      fluxapp.registerActions('test', actionClass);

      const Comp = class TestComponent extends Component {
        static actions = {
            onTestMethodBefore : 'test.method:before',
          }

        onTestMethodBefore() {
          spy();
        }

        render() {
          return (
            <h1>Hello</h1>
          );
        }
      };

      renderedComponent = renderComponent(Comp, {
        context : context,
      });

      const promise = context.getActions('test').method();

      promise.then(() => {
        expect(spy.called).to.equal(true);
        done();
      });
    });

    it('should get notified when a after action occurs', function(done) {
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          return new Promise((resolve) => {
            setImmediate(() => {
              resolve('something');
            });
          });
        }
      };

      fluxapp.registerActions('test', actionClass);

      const Comp = class TestComponent extends Component {
        static actions = {
          onTestMethodAfter : 'test.method:after',
        }

        onTestMethodAfter() {
          done();
        }

        render() {
          return (
            <h1>Hello</h1>
          );
        }
      };

      renderedComponent = renderComponent(Comp, {
        context : context,
      });

      context.getActions('test').method();
    });

    it('should get notified when failed action occurs (SYNC)', function(done) {
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          throw new Error('sync failed');
        }
      };

      fluxapp.registerActions('test', actionClass);

      const Comp = class TestComponent extends Component {
        static actions = {
          onTestMethodFailed : 'test.method:failed',
        }

        onTestMethodFailed() {
          done();
        }

        render() {
          return (
            <h1>Hello</h1>
          );
        }
      };

      renderedComponent = renderComponent(Comp, {
        context : context,
      });

      context.getActions('test').method();
    });

    it('should get notified when failed action occurs', function(done) {
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          return new Promise((resolve, reject) => {
            setImmediate(() => {
              reject(new Error('something'));
            });
          });
        }
      };

      fluxapp.registerActions('test', actionClass);

      const Comp = class TestComponent extends Component {
        static actions = {
          onTestMethodFailed : 'test.method:failed',
        }

        onTestMethodFailed() {
          done();
        }

        render() {
          return (
            <h1>Hello</h1>
          );
        }
      };

      renderedComponent = renderComponent(Comp, {
        context : context,
      });

      context.getActions('test').method();
    });

    it('should have access to custom context methods', function(done) {
      const context = fluxapp.createContext({
        custom() {
          return true;
        },
      });

      const actionClass = class TestActions extends BaseActions {
        method() {
          expect(this.context.custom()).to.equal(true);
          done();
        }
      };

      fluxapp.registerActions('test', actionClass);

      context.getActions('test').method();
    });
  });
};
