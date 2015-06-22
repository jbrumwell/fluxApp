Register a plugin with fluxapp.
[block:code]
{
  "codes": [
    {
      "code": "var plugin = {\n  stores: {\n    name: {\n     //definition \n    }\n  },\n  \n  actions: {\n   namespace: {\n     method: handler\n   }\n  },\n  \n  contextMethods: {\n    functionName: function() {}\n  }\n};\n\nfluxapp.registerPlugin('myPlugin', plugin);\n\n/**\n * @param {String} name   plugin name\n * @param {Object} plugin plugin object\n */\nfluxapp.registerPlugin('name', plugin);",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]
For more information see [Plugins](/v0.1.0/docs/overview-4) 
[block:callout]
{
  "type": "success",
  "body": "On to [removePlugin(name)](/v0.1.0/docs/fluxappremoveplugin)"
}
[/block]