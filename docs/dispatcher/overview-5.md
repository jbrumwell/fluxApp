The dispatcher is an integral part of the fluxapp framework, much of its use is abstracted through stores, actions and component mixins.  In rare occasions you  may need to deal with the dispatcher directly.

The dispatcher is unique in that it handles the queueing of events and ensures all listeners have promises have resolved. It also encompasses an intelligent waitFor method that allows for cross store dependencies, and detects circular recursion.
[block:callout]
{
  "type": "success",
  "body": "On to [register(callback)](doc:registercallback)"
}
[/block]