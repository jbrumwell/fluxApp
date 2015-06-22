Convenience method for registering multiple stores at once, iterates over the object passing to [fluxapp.registerStore(key, value)](http://fluxapp.readme.io/v0.1.0/docs/registerstorename-spec) 
[block:code]
{
  "codes": [
    {
      "code": "// assuming stores returns an object { name : definition }\nvar stores = require('./stores/index');\n\n/**\n * @param {Object} stores keys are used for names and values for definitions\n */\nfluxapp.registerStores(stores);",
      "language": "javascript"
    }
  ]
}
[/block]
For more information see [Stores](/v0.1.0/docs/overview) 
[block:callout]
{
  "type": "success",
  "body": "On to [registerStore(name, definition)](/v0.1.0/docs/registerstorename-spec)"
}
[/block]