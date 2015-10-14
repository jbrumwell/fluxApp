/* global describe */
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _storesMixin = require('./stores/mixin');

var _storesMixin2 = _interopRequireDefault(_storesMixin);

var _storesComponent = require('./stores/component');

var _storesComponent2 = _interopRequireDefault(_storesComponent);

describe('Stores', function () {
  (0, _storesMixin2['default'])();
  (0, _storesComponent2['default'])();
});