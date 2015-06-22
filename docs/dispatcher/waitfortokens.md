Returns a promise that is resolved when the tokens provided in the array have had there listeners called and resolved.
[block:code]
{
  "codes": [
    {
      "code": "var tokenA = dispatcher.register(function(payload) {\n  \n});\n\ndispatcher.register(function(payload) {\n  dispatcher.waitFor([ tokenA ]).then(function() {\n    // tokenA's listener has been called\n  });\n});\n\nvar payload = {};\n\ndispatcher.dispatch(payload);",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Fluxapp Module](doc:overview-7)"
}
[/block]