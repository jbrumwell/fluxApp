'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _actionsMixin = require('./actions/mixin');

var _actionsMixin2 = _interopRequireDefault(_actionsMixin);

var _actionsComponent = require('./actions/component');

var _actionsComponent2 = _interopRequireDefault(_actionsComponent);

describe('Actions', function () {
  (0, _actionsMixin2['default'])();
  (0, _actionsComponent2['default'])();
});