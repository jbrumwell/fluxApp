Returns the immutable state object from the store
[block:api-header]
{
  "type": "basic",
  "title": "Inside Store",
  "sidebar": true
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxapp.registerStore('search', {\n  actions: {\n    onSearchResults: 'search.search',\n  },\n\n  onSearchResults: function(results) {        \n    this.replaceState(results);\n  },\n  \n  getFilteredResults: function(filter) {\n    var state = this.getState(); \n    \n    return state.results.filter(filter);\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Inside Action",
  "sidebar": true
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "fluxApp.registerActions('search', {\n  search : function search(criteria) {\n    var criteriaStore = this.getStore('searchCriteria').getState();\n    \n    return performSearch(criteria);\n  }\n\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Inside React Components",
  "sidebar": true
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "module.exports = React.createClass({\n  displayName : 'SearchBar',\n\n  mixins : [ fluxApp.mixins.component ],  \n\n  render : function renderSearchBar() {\n    var results = this.getStore('search').getState();\n    var term = results.term;\n    \n\n    return (\n      <input defaultValue={term} />\n    );\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getMutableState()](doc:getmutablestate)"
}
[/block]