Generates the context for the page which includes the React Element, application state and http method.   
[block:callout]
{
  "type": "info",
  "title": "Rendering a Context",
  "body": "Two helper methods are provided for rendering a context, [render(path, options)](doc:render) and [renderToString(path, options)](doc:rendertostring)"
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Options"
}
[/block]

[block:callout]
{
  "type": "info",
  "title": "Route Loaders",
  "body": "The async method controls whether or not the route loaders are run. There are two cases in which the option is ignored, if you provide the dehydrate options as true it will set async to true. If you provide an state option it will set async to false."
}
[/block]

[block:parameters]
{
  "data": {
    "h-0": "Name",
    "h-1": "Type",
    "h-2": "Required",
    "0-0": "props",
    "0-1": "Object",
    "h-3": "Description",
    "0-2": "No",
    "0-3": "Additional options to pass to the handler component",
    "1-0": "state",
    "1-1": "Object",
    "1-2": "No",
    "1-3": "The application state if we are rehydrating the application.\n\nWill bypass running the routes loaders as the state is provided",
    "2-0": "wait",
    "2-1": "Boolean",
    "2-2": "No",
    "2-3": "If true the promise will not wait for loaders to complete before rendering.\n\nUseful to show a \"loading\" visual\n\nDefaults to false",
    "3-0": "dehydrate",
    "3-1": "Boolean",
    "3-2": "No",
    "3-3": "Should the context run the loaders and return the resulting state.\n\nIf true it sets the wait option to true independent of what is provided.\n\nUsed in isomorphic server side rendering."
  },
  "cols": 4,
  "rows": 4
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Client Side (Static)"
}
[/block]
This is an example usage, when providing static pages served from a server
[block:code]
{
  "codes": [
    {
      "code": "// our bootstrap loads all actions / stores and routes\nrequire('./bootstrap');\n\nvar React = require('react');\nvar fluxApp = require('fluxapp');\n\nvar appElement = document.getElementById('app');\n\nvar context = fluxApp.createContext();\n\ncontext.getPageContext('route-id').then(function render(page) {\n  React.render(\n    page.element,\n    appElement\n  );\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Client Side (using fluxapp-router plugin)"
}
[/block]
An example of a client side one page application
[block:code]
{
  "codes": [
    {
      "code": "// our bootstrap loads all actions / stores and routes\nrequire('./bootstrap');\n\nvar React = require('react');\nvar fluxApp = require('fluxapp');\nvar context = fluxApp.createContext();\n\nvar appElement = document.getElementById('app');\nvar routerActions = context.getRouterActions();\n\ncontext.registerRouteHandler(function routeHandler(request) {\n  context.getPageContext(request).then(function render(page) {\n    React.render(\n      page.element,\n      appElement\n    );\n  });\n});\n\nrouterActions.init(window.location.href, {\n  method: 'get'\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Client Side (Isomorphic)"
}
[/block]
An example of a client side application that gets its state from the server side.
[block:code]
{
  "codes": [
    {
      "code": "// our bootstrap loads all actions / stores and routes\nrequire('./bootstrap');\n\nvar React = require('react');\nvar fluxApp = require('fluxapp');\n\nvar appElement = document.getElementById('app');\n\nvar context = fluxApp.createContext();\n\n// State passed down from server includes method and app state\nvar serverState = window.fluxAppState;\n\nfunction render(page) {\n  React.render(\n    page.element,\n    appElement\n  );\n}\n\ncontext.getPageContext('route-id', {\n  state: serverState.state\n}).then(render);",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Client Side (Isomorphic, with routing)"
}
[/block]
An Example using [fluxapp-router](http://github.com/colonyamerican/fluxapp-router) with an isomorphic application
[block:code]
{
  "codes": [
    {
      "code": "// our bootstrap loads all actions / stores and routes\nrequire('./bootstrap');\n\nvar React = require('react');\nvar fluxApp = require('fluxapp');\n\n// State passed down from server includes method and app state\nvar serverState = window.fluxAppState;\n\nvar appElement = document.getElementById('app');\n\nvar context = fluxApp.createContext();\n\nvar routerActions = context.getRouterActions();\n\nfunction render(page) {\n  React.render(\n    page.element,\n    appElement\n  );\n}\n\ncontext.registerRouteHandler(function routeHandler(request) {\n  var isFirstRequest = ! request.lastRequest;\n  var options = {};\n  \n  // Its our first request so we need to pass our state\n  if (isFirstRequest) {\n    options.state = serverState.state;\n  }\n\n  context.getPageContext(request, options).then(render);\n});\n\nrouterActions.init(window.location.href, {\n  method: serverState.method\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Server Side"
}
[/block]
Rendering on the server side, this example is global handler for all routes. They could be separated into individual handlers if desired.
[block:callout]
{
  "type": "warning",
  "title": "Context Management",
  "body": "After you have rendered your markup for the component it is important to destroy the context. See [context.renderToString](doc:renderToString) to avoid context management."
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "function handler(request, reply) {\n  var context = fluxApp.createContext();\n\n  return context.getPageContext(request.path, {\n    method: request.method,\n    dehydrate: true,\n  }).then((page) => {\n    var Element = page.element;\n    var markup = Element ? React.renderToString(Element) : null;\n    \n    context.destroy()\n\n    if (! markup) {\n      throw Error('Not Found');\n    } else {\n      reply(Mustache.render(indexTemplate, {\n        page: markup,\n        state: JSON.stringify({\n          state: page.state,\n          method: page.method,\n        }),\n      })).code(200);\n    }\n  });\n}",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [render](doc:renderpath-options)"
}
[/block]