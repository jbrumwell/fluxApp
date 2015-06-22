In order to operate in a multi context environment like node, we pass around a context object that ensures data is appropriately assigned to the proper requests. 

Each context is assigned its own dispatcher, store and action instances.

Using the plugin infrastructure or by passing custom context methods to the [createContext](doc:createcontextcontextmethods-state) method, we can extend this context provided to components, actions and stores.
[block:api-header]
{
  "type": "basic",
  "title": "Using in Actions",
  "sidebar": true
}
[/block]

[block:textarea]
{
  "text": "The context is exposed as property \"context\"",
  "sidebar": true
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxApp.registerActions('user', {\n  search: function(property) {\n    var criteria = this.context.getStore('userSearchCriteria');\n  }\n});",
      "language": "javascript",
      "name": null
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Using in Stores"
}
[/block]
The context is exposed as property "context"
[block:code]
{
  "codes": [
    {
      "code": "fluxApp.registerStore('userSearchResults', {\n  actions: {\n    onUserSearch: ['user.search', 'friend.search']\n  },\n  \n  onUserSearch: function(results, actionType) {\n    var userSearch = this.context.getActionType('user.search');\n    \n    if (userSearch === actionType) {\n      // user search \n    } else {\n      // friend search\n    }\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Using in React Components"
}
[/block]
The context is provided under [getFlux](doc:getflux) if the component mixin is used, if not it is available under the this.context.flux property.
[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n  mixins: [fluxapp.mixins.component],\n  \n  getInitialState: function() {\n    var store = this.getStore('name');\n    \n    //alternatively without the mixin above\n    store = this.context.flux.getStore('name');\n    \n    return {\n      name: store.getState() \n    };\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to Custom [Context Methods](doc:custom-context-methods)"
}
[/block]