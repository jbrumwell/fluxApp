Action types are provided as a way to easily convert a more readable syntax to constant form that the dispatcher uses. The table below demonstrates the parts that make up the action type string.
[block:callout]
{
  "type": "info",
  "title": "React Components",
  "body": "React components when using the fluxapp mixin can bind to before, after and failed events to update the component state based on the failure."
}
[/block]

[block:parameters]
{
  "data": {
    "h-0": "Action Namespace",
    "h-1": "Action handler",
    "h-2": "Child Event",
    "h-3": "Result",
    "0-0": "user",
    "0-1": "login",
    "0-2": "before",
    "0-3": "user.login:before",
    "1-0": "user",
    "1-1": "login",
    "1-3": "user.login",
    "2-0": "user",
    "2-1": "login",
    "2-2": "after",
    "2-3": "user.login:after",
    "3-0": "user",
    "3-1": "login",
    "3-2": "failed",
    "3-3": "user.login:failed"
  },
  "cols": 4,
  "rows": 4
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [Acton Context](doc:context-property-1)"
}
[/block]