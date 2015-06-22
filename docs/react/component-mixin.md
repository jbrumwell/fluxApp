The component mixin abstract away a lot of the common use cases for accessing the context. It also takes care of binding and unbinding stores and actions to the component methods and ensuring that the component is mounted when it receives the store or action events.

It also ensure that that react `contextTypes` is properly declared on the component so that the flux context is available.
[block:callout]
{
  "type": "success",
  "body": "On to [fluxapp.createWrapper](/v0.1.0/docs/fluxappcreatewrappername)"
}
[/block]