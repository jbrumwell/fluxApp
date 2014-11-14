'use strict';
window.setImmediate = process.nextTick;

require('../server/fluxapp');
require('../server/stores');
require('../server/actions');
require('./stores.jsx');
require('./actions.jsx');
