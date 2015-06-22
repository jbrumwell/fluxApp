Plugins allow us to register stores, actions and custom context methods.  They can be useful for adding features on top of fluxapp.
[block:code]
{
  "codes": [
    {
      "code": "var plugin = {\n  stores: {\n    name: {\n     //definition \n    }\n  },\n  \n  actions: {\n   namespace: {\n     method: handler\n   }\n  },\n  \n  contextMethods: {\n    functionName: function() {}\n  }\n};\n\nfluxapp.registerPlugin('myPlugin', plugin);",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Existing Plugins](/v0.1.0/docs/overview-6)"
}
[/block]