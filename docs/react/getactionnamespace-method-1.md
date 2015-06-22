The react component mixin exposes the fluxapp context's getAction method.
[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n  mixins: [fluxapp.mixins.component],\n  \n  onChange: function() {\n    var action = this.getAction('user', 'permissions');\n    \n    action(true);\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [getActions(namespace)](/v0.1.0/docs/getactionsnamespace-1)"
}
[/block]