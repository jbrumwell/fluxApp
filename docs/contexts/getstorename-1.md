Returns the store instance registered to the context
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('user', {\n  getInitialState: function() {\n   return {}; \n  }    \n});\n\nvar context = fluxapp.createContext();\nvar instance = context.getStore('user');",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getDispatcher()](doc:getdispatcher)"
}
[/block]