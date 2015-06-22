Register a store with fluxapp
[block:code]
{
  "codes": [
    {
      "code": "/**\n * @param {String} name\n * @param {Object} definition\n */\nfluxapp.registerStore('user', {\n  actions: {\n   onLogin: 'user.login' \n  },\n  \n  onLogin: function onLogin(user) {\n    this.setState(user);\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]
For more information about stores see [Stores](/v0.1.0/docs/overview).
[block:callout]
{
  "type": "success",
  "body": "On to [registerPlugins(plugins)](/v0.1.0/docs/fluxappregisterplugins)"
}
[/block]