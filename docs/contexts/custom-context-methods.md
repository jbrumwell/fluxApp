Custom context methods are an important part of fluxapp, it allows us to bootstrap our application uniquely in different environments. 

As an example, we created and published an isomorphic fetching module that proxies to jquery on the client side and hapi.js on the server side.  this allows us to write code like the example below and have it run seamlessly in both environments.
[block:code]
{
  "codes": [
    {
      "code": "// client side boostrap\nvar context = fluxApp.createContext({\n  fetcher: fetcher('jquery')\n});\n\n// inside actions\nfluxApp.registerActions('search', {\n  search : function search(term) {\n    return this.context.fetcher({\n      url : '/api/search/' + term\n    });\n  }\n\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getPageContext(path, options)](doc:getpagecontextpath-options)"
}
[/block]