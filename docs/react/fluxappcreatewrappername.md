Creates a react component that ensures the flux context type is passed down to the child components. This method is provided for convenience, your own wrapper can be used as desired
[block:code]
{
  "codes": [
    {
      "code": "/**\n * @param {String} name optional custom name for the context\n */\nvar ContextWrapper = fluxapp.createWrapper('ApplicationContext');",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Writing your own context wrapper",
  "sidebar": true
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n   displayName: 'MyContextWrapper',\n\n   PropTypes: {\n     handler: React.PropTypes.element.isRequired,\n     context: React.PropTypes.object.isRequired,\n   },\n\n   childContextTypes: {\n     flux: React.PropTypes.object.isRequired,\n   },\n\n   getChildContext: function() {\n     return {\n       flux: fluxapp.createContext(),\n     };\n   },\n\n   render: function() {\n     var Component = this.props.handler;\n     var props = _.omit(this.props, 'handler');\n\n      return React.createElement(Component, props);\n   }\n });",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getStore](/v0.1.0/docs/getstorename-3)"
}
[/block]