# Flux based Architecture

This module is an effort to ease the development of [flux](http://www.github.com/facebook/flux) based isomorphic applications.

### Install

`npm install fluxapp --save`

### Helper methods

* `fluxApp.getRouter`: return an instance of the router
* `fluxApp.getActionType(string)` converts namespaced strings ie: user.login:after to constants USER_LOGIN_AFTER

### Routes

Routes are registered with fluxApp using the `fluxApp.registerRoute(<ROUTE>)` or with an array of routes `fluxApp.registerRoutes(<Routes>)`

A route is comprised of the following sections;

* id
  - can be used with `router.getById(id);`
* method
  - Http method supported by the route, or array of methods
* handler
  - React component that handles this route
* loader
  - Method invoke when this component will be loaded, used for initiating actions needed to populate
    state for the component.
* path
  - the path used for matching the route to request, see [path-match](https://github.com/pillarjs/path-match)

### Stores

Stores allow us to listen for actions and process their results into the stores internal state. This
state is then emitted to the mounted components that are listening to the store.

Stores are passed a `context`. It is availalbe under `this.context` from within the action method. See Custom Context Methods for more information.

#### Action Binding

fluxApp stores can bind to actions that are dispatched, the example below will call `onUserLogin`
on a successful user.login action and `onUserLoginFailed` if the action fails.

```
  var fluxApp = require('fluxapp');

  fluxApp.registerStore('namespace', {
    actions: {
      onUserLogin: 'user.login',
      onUserLoginFailed: 'user.login:failed'
    },

    onUserLogin: function(result, actionType) {
      // process data from the user.login event
    },

    onUserLoginFailed: function(err, actionType) {

    },
  });
```

One store function can bind to multiple actions. In the following example
`onUserStateChange` is called both when user logs in and out

```
var fluxApp = require('fluxapp');

fluxApp.registerStore('namespace', {
  actions: {
    onUserStateChange: ['user.login', 'user.logout']
  },

  onUserStateChange: function(result, actionType) {
    if (fluxApp.getActionType('user.login') === actionType) {
        ...
    }
  },
});
```

It's possible to easily bind to before/after/failed events from inside the stores, consider the following:

```
  var fluxApp = require('fluxapp');

  fluxApp.registerStore('namespace', {
    actions: {
      onFailedLogin: 'user.login:failed',
      onBeforeLogin: 'user.login:before'
    },

    onFailedLogin: function(err, actionType) {
      // Called when login fails
    },

    onBeforeLogin: function(result, actionType) {
      // Called before executing the login action
    }
  });
```

### Actions

Actions are namespaced and allow for both async and sync actions. They are also passed a `context`. It is availalbe under `this.context` from within the action method. See Custom Context Methods for more information.

Actions dispatch both a before and after event. If a failure is thrown, a failed event is emitted.

```
  var fluxApp = require('fluxapp');

  fluxApp.registerActions('namespace', {
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
    // fired before test.method event
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

#### Component load method

If the component depends on data from any store, its `statics.load` method should return a promise
that evaluates to an object that's going to be an initial state of application stores. Alternatively
load methods can be registered on the `Route` under the `loader` property.

```
React.createClass({
  mixins: [fluxApp.mixins.component],

  statics : {
    load : function(route, context) {
      var userData = context.getActions('user').getData();
      var item = context.getActions('item').getDetails({
        itemId: route.params.itemId
      });

      return Promise.props({
        user: userData,
        item: item
      });
    }
  }
});
```

### Custom Context Methods

Fluxapp is isomorphic by design, this requires a `context` aware implementation.  Fluxapp uses Reacts
internal `context` and a contextWrapper for passing the context through the application. For a simple example;

Assuming we have setup the context wrapper in the following manor;

```
var fluxapp = require('fluxapp');
var Component = <MyApp />;
var contextWrapper = fluxapp.createWrapper(Component, {
    getCustomContext: function() {
        ...
    }
});
```

#### Components

```
React.createClass({
  mixins: [fluxApp.mixins.component],

  render: function() {
    var customContext = this.context.fluxApp.getCustomContext();

    return (
      <h1>Hello Flux</h1>
    );
  }
});
```

#### Stores

```
  var fluxApp = require('fluxapp');

  fluxApp.registerStore('namespace', {
    actions: {
      onUserLogin: 'user.login',
    },

    onUserLogin: function(result, actionType) {
      var customContext = this.context.getCustomContext();

      ...
    }
  });
```

#### Actions

```
  var fluxApp = require('fluxapp');

  fluxApp.registerActions('namespace', {
    action: function() {
      var customContext = this.context.getCustomContext();

      ...
    }
  });
```

### Isomorphic applications

#### Server Side Example

```
var fluxApp = require('fluxapp');
var router = fluxApp.getRouter();

fluxApp.registerRoutes(require('./client/routes'));

function handler(req, reply) {

  var route = router.getRoute(req.path, {
    method: req.method
  });  
  var ContextWrapper = fluxApp.createWrapper(route);

  ContextWrapper.load().then(function(context) {
    var Component = react.createFactory(ContextWrapper);
    var componentHtml = react.renderToString(Component());
    var state = {
        method: req.method,
        payload: context.dehydrate()
    };

    // .. Inject componentHtml and state json into your layout ..
  });
}
```

#### Client side

Assuming `statePassedFromServer` is the state mentioned in the server side example;

```
$(function() {
  var fluxApp = require('fluxapp');
  var router = fluxApp.getRouter();

  fluxApp.registerRoutes(require('./client/routes'));

  var route = router.getRoute(window.location.pathname, {
    method: statePassedFromServer.method
  });

  var ContextWrapper = fluxApp.createWrapper(route);
  var context = ContextWrapper.getContext();

  context.rehydrate(statePassedFromServer.payload);

  React.render(React.createElement(ContextWrapper), document.getElementById('myAppId'));
});
```
