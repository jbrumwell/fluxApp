Register a handler that will be notified on every action, returns a token to be used to unregister the handler
[block:code]
{
  "codes": [
    {
      "code": "var context = fluxapp.createContext();\nvar dispatcher = fluxapp.getDispatcher();\n\nvar token = dispatcher.register(function() {\n  // called on each action type\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "On to [unregister(token)](doc:unregistertoken)"
}
[/block]