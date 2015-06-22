Provide an initial state object for the store, works in the same way as reacts getInitialState method. If omitted an empty object is provided as state for the store.
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('users', {\n  getInitialState: function() {\n    return {\n      users: []\n    };\n  },\n  \n  getAll: function() {\n    return this.state.users;\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [addChangeListener(cb)](doc:addchangelistenercb)"
}
[/block]