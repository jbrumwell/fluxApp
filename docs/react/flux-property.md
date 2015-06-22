The flux property on the component enables the mixin to properly initiate and destruct the component. It consists of two properties in itself, actions and stores.

The flux property is optional and can be omitted if no binding is required.
[block:api-header]
{
  "type": "basic",
  "title": "Actions"
}
[/block]
In the actions property we can bind to before, after and failed events, that our component may want to react on.
[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n  mixins: [fluxapp.mixins.component],\n  \n  flux: {\n    actions: {\n      onFailed: ['user.login:failed', 'session.renew:failed'],\n      onBefore: 'user.login:before',\n      onAfter: 'user.login:after',\n    }\n  },\n  \n  onFailed: function(reason) {\n    // action failed, show visual notification\n  },\n  \n  onBefore: function() {\n    // show a loading spinner\n  },\n  \n  onAfter: function() {\n    // remove the spinner display user name\n  },\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Stores"
}
[/block]
In the stores property we can bind a method to the change event of one or more stores, even  directly to setState or replaceState
[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n  mixins: [fluxapp.mixins.component],\n  \n  flux: {\n    stores: {\n      replaceState: ['user'],\n      setState: 'session',\n      onPermissionsChange: 'permissions'\n    }\n  },\n  \n  onPermissionsChange: function(permissions, storeName) {\n    this.setState({\n      permissions: permissions\n    });\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to the [Component Mixin](/v0.1.0/docs/component-mixin)"
}
[/block]