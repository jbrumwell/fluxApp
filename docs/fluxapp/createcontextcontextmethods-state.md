Creates a new fluxapp context, initiated with all registered stores, actions. It binds the passed context methods onto the context and makes them available to stores, actions and components. If a state is supplied the stores states will be rehydrated to match the state provided.
[block:code]
{
  "codes": [
    {
      "code": "/*\n* @param {Object} [contextMethods] Custom context methods to be bound\n* @param {Object} [state]          Application state to be re-initiated\n*/\nvar context = fluxapp.createContext();\n\nvar context = fluxapp.createContext({\n  getUsers: function getUser() {}\n});\n\n\nvar context = fluxapp.createContext(null, stateObject);\n",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [createWrapper(name)](/v0.1.0/docs/createwrappername)"
}
[/block]