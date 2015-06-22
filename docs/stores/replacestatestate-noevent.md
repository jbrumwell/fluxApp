Replace the current state with the state provided, if the noEvent is true it will not emit a change event to the listeners.
[block:callout]
{
  "type": "info",
  "body": "Calls to setState and replaceState emit a change event that notifies listeners, only if the state has been changed by the call."
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('user', {\n  actions: {\n    onUserLogout: 'user.logout',\n  },\n     \n  onUserLogout: function() {\n    this.replaceState({});\n  }\n });\n",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getState()](doc:getstate)"
}
[/block]