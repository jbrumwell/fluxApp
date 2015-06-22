Returns boolean weather or not a plugin has been registered with fluxapp. See plugins for more information on plugins.
[block:code]
{
  "codes": [
    {
      "code": "/**\n * @param {String} name plugin name\n */\nif (! fluxapp.hasPlugin('name')) {\n fluxApp.registerPlugin('name', pluginDefinition); \n}",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]