/* global window */
'use strict';

window.setImmediate = process.nextTick;
window.clearImmediate = process.nextTick;

require('../server/fluxapp');
require('../server/stores');
require('../server/actions');
require('../server/dispatcher');
require('../server/router');
require('../server/plugins');
require('./stores');
require('./actions');
require('./component');