Register actions handlers into fluxapp that will be passed onto any context created. 

See [Actions](/v0.1.0/docs/overview-3) for more information
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerActions('user', {\n  login: function() {\n    // gets the user object after loging in\n    return user;\n  },\n  \n  logout: function() {\n    return null;\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [registerStores(stores)](/v0.1.0/docs/registerstoresstores)"
}
[/block]