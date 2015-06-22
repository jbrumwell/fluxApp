Determines if a store has been registered with fluxapp
[block:code]
{
  "codes": [
    {
      "code": "if (! fluxapp.hasStore('name')) {\n  fluxapp.registerStore('name', storeDefinition);\n}",
      "language": "javascript"
    }
  ],
  "sidebar": true
}
[/block]