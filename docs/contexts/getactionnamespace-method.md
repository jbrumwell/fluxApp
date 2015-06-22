Returns a single handler from the registered action namespace.
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerActions('user', {\n  login: function(user, password) {\n    // process login\n    return promise;\n  },\n  \n  logout: function() {\n    // process logout\n    \n    return promise;\n  }\n});\n\nvar context = fluxapp.createContext();\nvar login = context.getActions('user', 'login');\n\nlogin('username', 'password');",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getStore(name)](doc:getstorename-3)"
}
[/block]