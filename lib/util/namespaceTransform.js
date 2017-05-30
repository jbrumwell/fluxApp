'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

exports['default'] = function (namespace, suffix) {
  namespace = namespace.toLowerCase();
  namespace = suffix ? namespace + ':' + suffix : namespace;

  return _lodash2['default'].snakeCase(namespace).toUpperCase();
};

module.exports = exports['default'];