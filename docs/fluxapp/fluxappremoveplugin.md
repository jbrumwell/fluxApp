Removes a plugin from fluxapp, removing a plugin removes any stores, actions and context methods that it has registered with fluxapp.
[block:code]
{
  "codes": [
    {
      "code": "/**\n * @param {String} name plugin name\n */\nfluxapp.removePlugin('name');",
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
  "body": "On to [createContext(methods, state)](/v0.1.0/docs/createcontextcontextmethods-state)"
}
[/block]