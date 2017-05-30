'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

exports['default'] = function (Target, name, descriptor) {
  descriptor.value = _bluebird2['default'].method(descriptor.value);

  return descriptor;
};

module.exports = exports['default'];