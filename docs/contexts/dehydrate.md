Dehydrate is an essential component to the isomorphic capabilities of fluxapp, it allows us to extract the state which has been modified during the server request and rehydrate it on the client side.

Dehydrate all stores that have been registered with the context, primarily used to pass state initiated on the server down to the client.
[block:code]
{
  "codes": [
    {
      "code": "var context = fluxapp.createContext();\n\n// run actions\n\nvar state = context.dehydrate(); // only exports what was changed",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [rehydrate(state)](doc:rehydratestate)"
}
[/block]