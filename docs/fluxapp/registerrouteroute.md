Register a route with fluxapp, to be used by the router, see Route Object for more information on route structure.
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerRoute({\n  id : 'homepace',\n  path : '/index',\n  handler: require('./components/homepage'),\n  method : 'GET'\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]
For more information see [Route Object](/v0.1.0/docs/route-object)
[block:callout]
{
  "type": "success",
  "body": "On to [getActionType(action)](/v0.1.0/docs/getactiontypeaction)"
}
[/block]