Merge the provided state object into the current state, 
[block:callout]
{
  "type": "info",
  "title": "Auto notifies listeners",
  "body": "Calls to setState and replaceState emit a change event that notifies listeners, only if the state has been changed by the call."
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('user', {\n   actions: {\n     onUserLogin: 'user.login',\n   },\n        \n   onUserLogin: function(user) {\n     this.setState({\n      token: user.token\n     });\n   }\n });",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [replaceState(state)](doc:replacestatestate)"
}
[/block]