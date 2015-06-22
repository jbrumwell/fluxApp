Passes each item in the array/object to the [fluxapp.registerRoute](http://fluxapp.readme.io/v0.1.0/docs/registerrouteroute) method.

If an object is passed it should have route.id as key and route definition as values.
[block:code]
{
  "codes": [
    {
      "code": "var routes = [\n  {\n    id : 'homepace',\n    path : '/index',\n    handler: require('./components/homepage'),\n    method : 'GET'\n  }\n];\n\n// or\n\nroutes = {\n  homepage: {\n    path : '/index',\n    handler: require('./components/homepage'),\n    method : 'GET'\n  }\n};\n\nfluxapp.registerRoutes(routes);",
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
  "body": "On to [registerRoute(route)](/v0.1.0/docs/registerrouteroute)"
}
[/block]