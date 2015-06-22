Familiarize yourself with  [Facebook's flux design](https://facebook.github.io/flux/docs/overview.html#content), The main concept behind fluxapp is the unidirectional flow of data, but there is some great information in that documentation. 

Fluxapp follows this design primarily with a few exceptions;
[block:api-header]
{
  "type": "basic",
  "title": "Flexibility"
}
[/block]
Fluxapp does not impose a directory structure, or even a philosophy on how to run your application.  The information below is an example of how to fluxapp, but it could be manipulated to act in the same manor that facebook describes above, in regards to data flow.

It can be used as an isomorphic framework or as a traditional client side framework.
[block:api-header]
{
  "type": "basic",
  "title": "Multi Context"
}
[/block]
In order to operate in a multi context environment like node, we pass around a context object that ensures data is appropriately assigned to the proper requests. 

Each context is assigned its own dispatcher, store and action instances.

Using the plugin infrastructure or by passing custom context methods to the [createContext](/v0.1.0/docs/createcontextcontextmethods-state) method, we can extend this context provided to components, actions and stores.

For more information see the [Context Overview](doc:overview-1) 
[block:api-header]
{
  "type": "basic",
  "title": "Actions Handlers"
}
[/block]
Fluxapp uses namespaced actions, and handles both async and sync responses using [bluebirds](https://www.npmjs.com/package/bluebird) Promise API.  On each action whether async or sync a before and after event is dispatched.  In the event that the Promise is rejected a failed event is dispatched with the error that occured.

For more information see [Actions](doc:overview-3) 
[block:api-header]
{
  "type": "basic",
  "title": "Action Types"
}
[/block]
When using namespace action handlers, we needed a way to easily reference the action. [getActionType](/v0.1.0/docs/getactiontypeaction) does this by converting a string made up of namespace.method:event to the proper constant for use inside of fluxapp.

For more information see [Action Types](doc:action-types) 
[block:api-header]
{
  "type": "basic",
  "title": "Stores"
}
[/block]
Stores bind to action events and use the data provided to manipulate their state.  The base store instance provides methods for setting the [initial state](doc:getinitialstate) of the store, [construction](doc:init), [replacing](doc:replacestatestate-noevent) and [merging](doc:getstate) new state data. Using either of these methods will invoke a change event to the [stores listeners](doc:addchangelistenercb).

The state store is [immutable](https://github.com/rtfeldman/seamless-immutable) and can be retrieved as [immutable](doc:getstate) or [mutable](/doc:getmutablestate).
[block:api-header]
{
  "type": "basic",
  "title": "Router"
}
[/block]
The internal fluxapp router is primarily used for [creating request routes](doc:buildidurl-metadata) and retrieving [route objects](doc:getrouteidurl-metadata-strict).

For more information see [Request Object](doc:request-object) and [Route Objects](doc:route-object) 
[block:api-header]
{
  "type": "basic",
  "title": "Dispatcher"
}
[/block]
There is still one dispatcher per context, as in flux design. Where our dispatcher alters is that it handles both async and sync requests while still providing an intelligent [waitFor](doc:waitfortokens) method that detects circular dependencies.

Another feature we have added is the queueing of events that allows additional events to occur but not be processed until the current action has completed its dispatch cycle.  This feature allows us to automate before, after and failed child events saving the developer from implementing them.

For more information see [Dispatcher](doc:overview-5) 
[block:api-header]
{
  "type": "basic",
  "title": "Plugins"
}
[/block]
Fluxapps plugin design allows for modules to register stores, actions and provide custom context methods to each context created.

For more information see [Plugins](doc:overview-4) and [Existing Plugins](doc:overview-6) 
[block:api-header]
{
  "type": "basic",
  "title": "React Components"
}
[/block]
While not directly tied to react components we do provide a context wrapper using reacts context types, as well as a component mixin that takes care of binding before, after and failed action events as well as store listeners.

For more information see [Component Mixin](doc:component-mixin) and [createWrapper](doc:fluxappcreatewrappername)
[block:callout]
{
  "type": "success",
  "body": "On to the [Contexts](doc:overview-1)"
}
[/block]