Dispatch a payload through the dispatcher, to the registered listeners
[block:code]
{
  "codes": [
    {
      "code": "var context = fluxapp.createContext();\nvar dispatcher = fluxapp.getDispatcher();\n\nvar token = dispatcher.register(function(payload) {\n  payload.user; // me\n});\n\ndispatcher.dispatch({\n  user: 'me'\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [waitFor(tokens)](doc:waitfortokens)"
}
[/block]