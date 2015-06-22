Route loaders role in the framework is to prepare the application state for rendering, the loader should return a promise that is resolved when all actions promises have resolved. 
[block:callout]
{
  "type": "info",
  "title": "Static Component Pages",
  "body": "Static component pages that do not rely on actions for their state can omit the loader from their route object definition."
}
[/block]
Example
[block:code]
{
  "codes": [
    {
      "code": "var router = fluxapp.getRouter();\nvar context = fluxapp.createContext();\n\nfluxapp.registerRoute({\n  id : 'user-homepace',\n  path : '/users/:id',\n  handler: require('./components/users/homepage'),\n  method : 'GET'\n});\n\nvar request = router.build('homepage', {\n  params: {\n    id: 1\n  }  \n});\n\nvar route = router.getRoute(request.routeId);\n\nroute.loader(request, context).then(render);",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Router.build](doc:buildidurl-metadata)"
}
[/block]