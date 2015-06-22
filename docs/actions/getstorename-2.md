Get a store from the current context
[block:code]
{
  "codes": [
    {
      "code": "fluxApp.registerActions('search', {  \n  search : function search(criteria) {\n    var criteriaStore = this.getStore('searchCriteria');\n    \n    // perform search\n    \n    return performSearch(criteria);\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "On to [Router](doc:overview-2)"
}
[/block]