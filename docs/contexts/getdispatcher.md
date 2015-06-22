Each context has its own dispatcher to ensure action events are isolated in multi context environments. This method will return the dispatcher for the context.

Stores, actions and react components abstract the dispatcher and in most cases you would not need to deal with the dispatcher directly.
[block:code]
{
  "codes": [
    {
      "code": "var context = fluxapp.createContext();\nvar dispatcher = context.getDispatcher();",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [dehydrate()](doc:dehydrate)"
}
[/block]