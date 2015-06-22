Fluxapp uses namespaced actions, and handles both async and sync responses using [bluebirds](https://www.npmjs.com/package/bluebird) Promise API. 
[block:api-header]
{
  "type": "basic",
  "title": "Action Lifecycle"
}
[/block]
When an action is invoked if successful it invokes the handler, emits a before event, the actual event response and finally the after event.

In the event an event fails, throws or promise is rejected, the lifecycle changes to before and failed.

Given this examlple action
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerActions('user', {\n  login: function() {\n    return {\n      id: 1\n    };\n  },\n  \n  logout: function() {\n    throw new Error('No logging out allowed');\n  }\n});",
      "language": "javascript",
      "name": "actions/user.js"
    }
  ]
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n  mixins: [fluxapp.mixins.component],\n  \n  flux: {\n    actions: {\n      onUserLogoutFailed: 'user.logout:failed'\n    }        \n  },\n  \n  handleLogin: function() {\n    var userAction = this.getActions('user');\n    \n    userActions.login();\n  },\n  \n  handleLogout: function() {\n    var userAction = this.getActions('user');\n    \n    userActions.logout();\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "userActions.login Lifecycle"
}
[/block]

[block:callout]
{
  "type": "info",
  "title": "Stores receive second parameter",
  "body": "When stores bind to the action they also provide a secondary parameter that contains the converted action type that allows them to process multiple similar actions."
}
[/block]

[block:parameters]
{
  "data": {
    "h-0": "Action Type (string)",
    "h-1": "Action Type (converted)",
    "0-0": "user.login:before",
    "0-1": "USER_LOGIN_BEFORE",
    "h-2": "Listener parameters",
    "1-0": "user.login",
    "1-1": "USER_LOGIN",
    "1-2": "1. Action resolved result",
    "2-0": "user.login:after",
    "2-1": "USER_LOGIN_AFTER"
  },
  "cols": 3,
  "rows": 3
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "userActions.logout Lifecycle"
}
[/block]

[block:parameters]
{
  "data": {
    "h-0": "Action Type (string)",
    "h-1": "Action Type (converted)",
    "h-2": "Listener parameters",
    "0-0": "user.logout:before",
    "0-1": "USER_LOGOUT_BEFORE",
    "1-0": "user.logout:failed",
    "1-1": "USER_LOGOUT_FAILED",
    "1-2": "1. Reason for the failure"
  },
  "cols": 3,
  "rows": 2
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "On to [Action Types](doc:action-types)"
}
[/block]