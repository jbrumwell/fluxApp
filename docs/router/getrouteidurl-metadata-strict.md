Retrieve a route object by id or url, while taking metadata passed into account
[block:parameters]
{
  "data": {
    "h-0": "Parameter Name",
    "h-1": "Type",
    "h-2": "Description",
    "0-0": "id",
    "0-1": "String",
    "0-2": "Can be a route id or a generated route url",
    "1-0": "metadata",
    "1-1": "Object",
    "1-2": "Pass the parameters for the route and / or query string object.\n\n  * params Object\n  * query Object",
    "2-0": "strict",
    "2-1": "Boolean",
    "2-2": "If false the builder will return a route registered with notFound as true."
  },
  "cols": 3,
  "rows": 3
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "var router = fluxapp.getRouter();\n\nvar route = router.getRoute('user-list', {\n  method: 'POST'\n});\n\nroute.id // user-list\n\nvar route = router.getRoute('/users/list', {\n  method: 'POST'\n});\n\nroute.id // user-list\n\nvar route = router.getRoute('/users/list-typo', {\n  method: 'POST'\n}, false);\n\nroute.notFound // true (if a not found route was registered)",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Dispatcher](doc:overview-5)"
}
[/block]