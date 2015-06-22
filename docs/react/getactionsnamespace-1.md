The react component mixin exposes the contexts getActions method
[block:code]
{
  "codes": [
    {
      "code": "React.createClass({\n  mixins: [fluxapp.mixins.component],\n  \n  onChange: function() {\n    var userAction = this.getActions('user');\n    \n    userActions.permission(true);\n  }\n});",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]