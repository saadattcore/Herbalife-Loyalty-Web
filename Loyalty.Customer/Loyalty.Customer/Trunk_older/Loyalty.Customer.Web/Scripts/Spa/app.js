/*jshint node: true*/

'use strict';

var logger = require('./util/logger'),
    router = require('./core/router'),

    start = function () {
        logger.debug("app - start");
        router.start();
    };

start();