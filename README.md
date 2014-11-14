# Flux based Architecture

This module is an effort to ease the development of flux, http://www.github.com/facebook/flux, based isomorphic applications.

### Stores

```
  var fluxApp = require('fluxApp');

  fluxApp.createStore('namespace', {
    getInitialState: function getInitialState() {
      return {
        my: 'state'
      };
    },

    action: {
      onUserLogin: 'user.login'
    },

    onUserLogin: function(result, actionType) {
      // process data from the user.login event
    }
  })
```

### Actions

Actions are namespaced and allow for both async and sync actions. Sync actions only dispatch their
action event, whereas async functions will dispatch both a before and after event.

Sync actions emit sync events, async events emit a sync before event as async after and main action event
when the promise resolves.

If a failure is thrown, a failed event is emitted async/sync depending on the state of the promise

```
  var fluxApp = require('fluxApp');

  fluxApp.createActions('namespace', {
    sync: function() {
        return 'sync';
    },
    syncFailure: function() {
        throw new Error('sync failure');
    },

    async: function() {
        return new Promise(function(resolve) {
          setImmediate(function() {
              resolve('async');
          });
        });
    },

    asyncFailure: function() {
      return new Promise(function(resolve, reject) {
        setImmediate(function() {
            reject(new Erro('async'));
        });
      });
    }
  });

  var actions = fluxApp.getActions('namespace');

  actions.sync();
```

### Component Mixin

The mixin component automatically binds to stores change events and will listen for async action events
like before, after or failed. So the ui can be updated accordingly. It also takes care of ensuring that
the component is currently mounted.

The mixin will also expose a few helper methods `getStore(namespace)`, `getActions(namespace)`, `getAction(namespace, method)`

```
React.createClass({
  mixins: [fluxApp.mixins.component],

  getInitalState: function() {
    return {
      test: this.getStore('test'),
      anothertest: this.getStore('anothertest')
    }
  }

  stores: {
    onTestUpdate: 'test'
  },

  actions: {
    onTestMethodBefore: 'test.method:before'
  },

  onTestMethodBefore: function() {
    // fired before test.method event, if the event is async  
  },

  onTestUpdate: function() {
    // fired if the test store is changed
  },

  onClick: function() {
    var actions = this.getActions('test'); // could also use this.getAction('test', 'method')

    actions.method('arg1', 'arg2');
  },

  render: function() {
    return (
      <h1>Hello</h1>
    );
  }
}};
```

### Isomorphic applications

#### Server side

```
function handler(req, reply) {
    var Component = react.createFactory(require(./client/component'));

    component.load(req).then(function(state) {
      reply(react.renderToString(Component()));                        
    });
```

#### Client side

```
require('./stores'); //initialize the stores

var fluxApp = require('fluxApp');

fluxApp.rehydrate(statePassedFromServer);
```
