Server side render method, takes care of preparing the context for rendering and rendering it into html markup and destroying the context.
[block:api-header]
{
  "type": "basic",
  "title": "Options"
}
[/block]
Accepts all options from [getPageContext](doc:getpagecontextpath-options) in addition to the options outlined below.
[block:callout]
{
  "type": "info",
  "title": "Isomorphic Implementation",
  "body": "This function is normally used in conjunction with the dehydrate option to give server side access to the state and markup for delivery to the client."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Example Usage"
}
[/block]
An example universal hapi handler
[block:code]
{
  "codes": [
    {
      "code": "function appHandler(request, reply) {\n  var context = fluxApp.createContext();\n\n  return context.renderToString(request.path, {\n    method: request.method,\n    dehydrate: true,\n  }).then((page) => {\n    var markup = page.element;\n    \n    if (! markup) {\n      Boom.notFound();\n    } else {\n      reply(Mustache.render(indexTemplate, {\n        page: markup,\n        state: JSON.stringify({\n          state: page.state,\n          method: page.method,\n        }),\n      })).code(200);\n    }\n  }).catch(reply);\n}",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getActionType](doc:getactiontype)"
}
[/block]