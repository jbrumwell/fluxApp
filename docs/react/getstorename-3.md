The component mixin makes the fluxapp context's getStore method available to the component.
[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n  mixins: [fluxapp.mixins.component],\n  \n  getInitialState: function() {\n    var store = this.getStore('name');\n    \n    return {\n      name: store.getState() \n    };\n  }\n});",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getAction(namespace, method)](/v0.1.0/docs/getactionnamespace-method-1)"
}
[/block]