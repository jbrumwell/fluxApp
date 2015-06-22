Stores bind to action events and use the data provided to manipulate their state.  The base store instance provides methods for setting the [initial state](doc:getinitialstate) of the store, [construction](doc:init), [replacing](doc:replacestatestate-noevent) and [merging](doc:getstate) new state data. Using either of these methods will invoke a change event to the [stores listeners](doc:addchangelistenercb).

The state store is [immutable](https://github.com/rtfeldman/seamless-immutable) and can be retrieved as [immutable](doc:getstate) or [mutable](/doc:getmutablestate).
[block:callout]
{
  "type": "success",
  "body": "On to [Binding Actins](doc:actions)"
}
[/block]