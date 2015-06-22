Retrieve another stores instance by name
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('user', {\n  logout: function() {\n    var sessionStore = this.getStore('session');\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Actions](doc:overview-3)"
}
[/block]