Retrieve an object with the actions registered handlers
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerActions('user', {\n  login: function(user, password) {\n    // process login\n    return promise;\n  },\n  \n  logout: function() {\n    // process logout\n    \n    return promise;\n  }\n});\n\nvar context = fluxapp.createContext();\nvar userActions = context.getActions('user');\n\nuserActions.login('username', 'password');\n\nuserActions.logout();",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getAction(namespace, method)](doc:getactionnamespace-method)"
}
[/block]