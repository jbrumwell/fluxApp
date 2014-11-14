'use strict';

module.exports = function merge(Constructor, spec) {
  var proto = Constructor.prototype;

  if (spec) {
    Object.keys(spec).forEach(function iterateSpec(key) {
      proto[key] = spec[key];
    });
  }

  return Constructor;
};
