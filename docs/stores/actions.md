Fluxapp stores take care of binding the action types to the store, there are multiple ways the actions can be defined, we will give some examples here;
[block:api-header]
{
  "type": "basic",
  "title": "Via String Action Type"
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('user', {\n  actions: {\n    // bind the onLogout method to action result of user.logout \n    onLogout: 'user.logout' \n  },\n  \n  onLogout: function() {\n    var sessionStore = this.getStore('session');\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Via Array of Action Types"
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('user', {\n  actions: {\n    // set state directly with the result of login / logout user action\n    setState: ['user.logout', 'user.login']\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Context Property](doc:context-property)"
}
[/block]