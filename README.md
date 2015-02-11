# Flux based Architecture

This module is an effort to ease the development of [flux](http://www.github.com/facebook/flux) based isomorphic applications.

### Install

`npm install fluxapp --save`

### Stores

#### Action Binding

fluxApp stores can bind to actions that are dispatched, the example below will call `onUserLogin`
on a successful user.login action

```
  var fluxApp = require('fluxapp');

  fluxApp.createStore('namespace', {
    mixins: [fluxApp.mixins.component],

    actions: {
      onUserLogin: 'user.login'
    },

    onUserLogin: function(result, actionType) {
      // process data from the user.login event
    }
  });
```

One store function can bind to multiple actions. In the following example
`onUserStateChange` is called both when user logs in and out

```
  ...
  actions: {
    onUserStateChange: ['user.login', 'user.logout']
  },

  onUserStateChange: function(result, actionType) {
  ...

```

### Actions

Actions are namespaced and allow for both async and sync actions. Sync actions only dispatch their
action event, whereas async functions will dispatch both a before and after event.

Sync actions emit sync events, async events emit a sync before event, main action event
when the promise resolves and an after event afterwards.

If a failure is thrown, a failed event is emitted async/sync depending on the state of the promise

```
  var fluxApp = require('fluxapp');

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
            reject(new Error('async'));
        });
      });
    }
  });

  var actions = fluxApp.getActions('namespace');

  actions.sync();
```

#### Binding to side events

It's possible to easily bind to before/after/failed events from inside the stores, consider the following:

```
  var fluxApp = require('fluxapp');

  fluxApp.createStore('namespace', {
    mixins: [fluxApp.mixins.component],

    actions: {
      onFailedLogin: 'user.login:failed',
      onBeforeLogin: 'user.login:before'
    },

    onFailedLogin: function(result, actionType) {
      // Called when login fails
    },

    onBeforeLogin: function(result, actionType) {
      // Called before executing the login action
    }
  });
```



### Component Mixin

The mixin component automatically binds to stores change events and will listen for async action events
like before, after or failed so the ui can be updated accordingly. It also takes care of ensuring that
the component is currently mounted.

The mixin will also expose a few helper methods `getStore(namespace)`, `getActions(namespace)`, `getAction(namespace, method)`

```
React.createClass({
  mixins: [fluxApp.mixins.component],

  getInitalState: function() {
    return {
      test: this.getStore('test').state,
      anothertest: this.getStore('anothertest').state
    };
  },

  flux: {
    stores: {
      onTestUpdate: 'test'
    },

    actions: {
      onTestMethodBefore: 'test.method:before'
    }
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
      <h1>Hello Flux</h1>
    );
  }
});
```

### Isomorphic applications

#### Server side

One approach to creating an isomorphic appliction is:
- Load the component that we have determined is required for this route.
- Expose a static load method that invokes the actions needed to populate the stores.

```
var fluxApp = require('fluxapp');

fluxApp.createRoutes(require('./client/routes'));

function handler(req, reply) {

  var componentClass = fluxApp.matchRoute(req.path, {
    method: req.method
  });
  var Component = react.createFactory(componentClass);
  var data = normalizeRequestData(req);

  componentClass.load(data).then(function() {
    var componentHtml = react.renderToString(Component());
    var state = {
        method: req.method,
        payload: fluxApp.dehydrate()
    };

    // .. Inject componentHtml and state json into your layout ..
  });
}
```

#### Client side

```
$(function() {
  var fluxApp = require('fluxapp');

  fluxApp.createRoutes(require('./routes'));

  var component = fluxApp.matchRoute(window.location.pathname, {
    method: statePassedFromServer.method
  });

  fluxApp.rehydrate(statePassedFromServer.payload);

  // ... bind component to node on page representing the component ...
});
```

#### Component load method

If the component depends on data from any store, its `statics.load` method should return a promise
that evaluates to an object that's going to be an initial state of application stores.

```
React.createClass({
  mixins: [fluxApp.mixins.component],

  statics : {
    load : function(request) {
      var userData = fluxApp.getActions('user').getData();
      var item = fluxApp.getActions('item').getDetails({
        itemId: request.params.itemId
      });

      return Promise.props({
        user: userData,
        item: item
      });
    }
  }
});
```

### Helper methods

`fluxApp.getDispatcher`: return an instance of the flux dispatcher
`fluxApp.getRouter`: return an instance of the router
`fluxApp.getActionType(string)` converts namespaced strings ie: user.login:after to constants USER_LOGIN_AFTER
