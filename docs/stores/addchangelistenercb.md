Subscribes to the stores change event, that is emitted when the store updates or replaces its state.


[block:callout]
{
  "type": "info",
  "body": "When used with React the react component mixin handles binding and unbinding stores and actions, see the [Flux property](doc:flux-property) of the mixin for more information.",
  "title": "React Component"
}
[/block]

[block:code]
{
  "codes": [
    {
      "code": "var context = fluxapp.getContext();\nvar store = context.getStore('name');\n\nfunction onChange(state) {\n  // state on store 'name' was changed\n}\n\nstore.addChangeListener(onChange);",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]

[block:callout]
{
  "type": "success",
  "body": "On to [removeChangeListener(cb)](doc:removechangelistenercb)"
}
[/block]