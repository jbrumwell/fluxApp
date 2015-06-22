Given a route id or url and a set of meta data, build returns a route request object or false if the route is not found. see Route Request Object
[block:parameters]
{
  "data": {
    "h-0": "Property Name",
    "h-1": "Type",
    "h-2": "Description",
    "0-0": "params",
    "0-1": "Object",
    "0-2": "The params needed to generate the route request object.",
    "1-0": "method",
    "1-1": "String",
    "1-2": "The HTTP method that the request should be invoked with. Used for matching routes",
    "2-0": "query",
    "2-1": "Object",
    "2-2": "Additional query properties to add to the query string"
  },
  "cols": 3,
  "rows": 3
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "var router = fluxapp.getRouter();\n\nfluxapp.registerRoute({\n   id : 6,\n   path : '/route/with/:end?very=cool',\n   handler: _.noop\n });\n\nvar routeRequest = router.build(6, {\n  params: {\n    end: 'query'\n  },\n  query: {\n     cool: 'indeed' \n  }\n});\n\nrouteRequest.url // /route/with/query?very=cool&cool=indeed",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getRoute(id, metadata, strict)](doc:getrouteidurl-metadata-strict)"
}
[/block]