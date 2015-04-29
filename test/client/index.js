/* global window */
'use strict';

window.setImmediate = process.nextTick;

require('../server/fluxapp');
require('../server/stores');
require('../server/actions');
require('../server/dispatcher');
require('../server/router');
require('./stores');
require('./actions');
