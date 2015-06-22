Unregister a listener by dispatch token
[block:code]
{
  "codes": [
    {
      "code": "var context = fluxapp.createContext();\nvar dispatcher = fluxapp.getDispatcher();\n\nvar token = dispatcher.register(function() {\n  // only called once\n  dispatcher.unregister(token);\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "On to [dispatch(payload)](doc:dispatchpayload)"
}
[/block]