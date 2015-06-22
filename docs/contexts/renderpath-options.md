Client side render method, takes care of preparing the context for rendering and rendering it into the provided container.
[block:api-header]
{
  "type": "basic",
  "title": "Options"
}
[/block]
Accepts all options from [getPageContext](doc:getpagecontextpath-options) in addition to the options outlined below.
[block:parameters]
{
  "data": {
    "h-0": "Name",
    "h-1": "Type",
    "h-2": "Required",
    "h-3": "Description",
    "0-0": "container",
    "0-3": "The dom element in which the context should be rendered into.",
    "0-1": "DOMElement",
    "0-2": "YES"
  },
  "cols": 4,
  "rows": 1
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Example Usage"
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "// bootstrap adds all stores, actions and routes\nrequire('./bootstrap');\n\nvar React = require('react');\nvar fluxApp = require('fluxapp');\n\nvar appElement = document.getElementById('app');\n\nvar context = fluxApp.createContext();\n\n// id or url path\ncontext.render('page-id');",
      "language": "javascript"
    }
  ]
}
[/block]
With fluxapp-router plugin and isomorphic rendering
[block:code]
{
  "codes": [
    {
      "code": "// bootstrap adds all stores, actions and routes\nrequire('./bootstrap');\n\nvar React = require('react');\nvar fluxApp = require('fluxapp');\n\n// state passed down from server\nvar serverState = window.fluxAppState;\n\nvar appElement = document.getElementById('app');\n\nvar context = fluxApp.createContext();\n\nvar routerActions = context.getRouterActions();\n\ncontext.registerRouteHandler(function routeHandler(request) {\n  var isFirstRequest = ! request.lastRequest;\n  var options = {};\n\n  if (isFirstRequest) {\n    options.state = serverState.state,\n  }\n\n  options.container = appElement;\n\n  context.render(request, options);\n});\n\nrouterActions.init(window.location.href, {\n  method: serverState.method\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [renderToString](doc:rendertostringpath-options)"
}
[/block]