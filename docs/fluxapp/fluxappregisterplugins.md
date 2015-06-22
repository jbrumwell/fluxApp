Accepts an object where keys are plugin names and values are plugin object definition, it proxies each to the [fluxapp.registerPlugin](http://fluxapp.readme.io/v0.1.0/docs/fluxappregisterplugin) method.
[block:code]
{
  "codes": [
    {
      "code": "/**\n * @param {Object} plugins\n */\nfluxapp.registerPlugins({\n  pluginOne: definitionOne,\n  pluginTwo: definitionTwo\n});",
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
  "body": "On to [registerPlugin(name, plugin)](/v0.1.0/docs/fluxappregisterplugin)"
}
[/block]