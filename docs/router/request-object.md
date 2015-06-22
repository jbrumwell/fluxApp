The request object is intended to be passed to the loaders with the current context.  As a naive example demonstrates below.
[block:code]
{
  "codes": [
    {
      "code": "var router = fluxapp.getRouter();\nvar context = fluxapp.createContext();\n\nfluxapp.registerRoute({\n  id : 'user-homepace',\n  path : '/users/:id',\n  handler: require('./components/users/homepage'),\n  method : 'GET'\n});\n\nvar request = router.build('homepage', {\n  params: {\n    id: 1\n  }  \n});\n\nvar route = router.getRoute(request.routeId);\n\nroute.loader(request, context).then(render);\n\n",
      "language": "javascript"
    }
  ]
}
[/block]
This table outlines the request objects properties
[block:parameters]
{
  "data": {
    "h-0": "Name",
    "h-1": "Type",
    "h-2": "Description",
    "0-0": "path",
    "0-1": "String",
    "0-2": "The path taken from node's internal url#parse method.",
    "1-0": "pathname",
    "1-1": "String",
    "1-2": "The path name taken from node's internal url#parse method.",
    "2-0": "query",
    "2-1": "Object",
    "2-2": "An object containing any query parameters",
    "3-0": "url",
    "3-1": "String",
    "3-2": "The generated path consisting parameters, query and hash.",
    "4-0": "hash",
    "4-1": "String",
    "4-2": "The hash taken from node's internal url#parse method.",
    "5-0": "params",
    "5-1": "Object",
    "5-2": "An object containing the parameters passed in meta data on generation.",
    "6-0": "routeId",
    "6-1": "String",
    "6-2": "The route that was matched and generated the request object."
  },
  "cols": 3,
  "rows": 7
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Route Loaders](doc:route-loaders)"
}
[/block]