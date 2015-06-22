getActionType is used internally to translate namespaced strings to action constants. See actions for more information on action types.
[block:code]
{
  "codes": [
    {
      "code": "fluxapp.getActionType('user.login'); // USER_LOGIN\nfluxapp.getActionType('user.login:after'); // USER_LOGIN_AFTER",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]
For more information see [Action Types](/v0.1.0/docs/action-types) 
[block:callout]
{
  "type": "success",
  "body": "On to [registerActions(namespace, handlers)](/v0.1.0/docs/registeractionsnamespace-handlers)"
}
[/block]