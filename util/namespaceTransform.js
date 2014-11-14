'use strict';

function stringToArray(namespace) {
  var parts = [];
  var suffix;

  if (typeof namespace === 'string') {
    if (-1 !== namespace.indexOf(':')) {
      parts = namespace.split(':');
      suffix = parts[1];
      namespace = parts[0];
    }

    namespace = namespace.split('.');

    if (suffix) {
      namespace.push(suffix);
    }
  } else {
    namespace = parts.concat(namespace);
  }

  return namespace;
}

module.exports = function transformNamespace(namespace, suffix) {
  namespace = stringToArray(namespace, suffix);

  if (namespace.length === 2 && suffix) {
    namespace.push(suffix);
  }

  namespace = namespace.map(function toUpperCase(part) {
    return part.toUpperCase();
  });

  return namespace.join('_');
};

module.exports.stringToArray = stringToArray;
