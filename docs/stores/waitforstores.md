When provided a store name, comma delimited list of stores or an array, waitFor returns a promise that will be resolved when those stores have processed the action.


[block:callout]
{
  "type": "info",
  "body": "Internally this maps to the dispatchers waitFor method providing it a list of the stores dispatch tokens.",
  "title": "Proxies to Dispatcher"
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('user', {\n  logout: function() {\n    this.waitFor('session').then(function() {\n      // session store has finished processing\n    });\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getStore](doc:getstorename)"
}
[/block]