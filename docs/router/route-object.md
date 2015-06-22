The route object consists of the following properties;
[block:callout]
{
  "type": "info",
  "title": "Not Found Routes",
  "body": "Multiple not found routes can be registered, the one that matches and has the deepest path will be used.\n\nNot found routes are all suffixed with a catchall, so registering both / and /admin is possible."
}
[/block]

[block:parameters]
{
  "data": {
    "h-0": "Name",
    "h-1": "Required",
    "0-0": "id",
    "0-1": "Yes",
    "h-2": "Type",
    "0-2": "String",
    "h-3": "Description",
    "0-3": "The id of the route, used in getRouteById method",
    "1-0": "notFound",
    "1-1": "No",
    "1-2": "Boolean",
    "1-3": "Whether or not this route is responsible for display 404 not found pages.",
    "2-0": "path",
    "2-3": "use the [route-parser](https://github.com/rcs/route-parser) module.",
    "2-1": "Yes\n\nUnless registering a global not found route",
    "2-2": "String",
    "3-0": "handler",
    "3-1": "Yes",
    "3-2": "Function",
    "3-3": "The handler to be called when the route is matched.",
    "4-0": "loader",
    "4-1": "Yes\n\nIf the handler option has a load property it will be used",
    "4-2": "Function",
    "4-3": "See[ loaders](/v0.1.0/docs/route-loaders) for more information",
    "5-0": "method",
    "5-1": "No",
    "5-2": "String",
    "5-3": "The http method that this route should match, if omitted the route will match any method."
  },
  "cols": 4,
  "rows": 6
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Request Object](doc:request-object)"
}
[/block]