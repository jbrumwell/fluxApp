Rehydrate is the counterpart to dehydrate it allows us to reinitialized the state to the point it was on the server side render in an isomorphic application.
[block:code]
{
  "codes": [
    {
      "code": "var context = fluxapp.createContext();\ncontext.rehydrate(window.serverState);",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Stores](doc:overview)"
}
[/block]