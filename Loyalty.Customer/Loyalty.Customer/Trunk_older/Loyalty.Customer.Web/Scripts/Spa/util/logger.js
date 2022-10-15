/*jshint node: true*/

"use strict";

var logger = require('js-logger');

logger.useDefaults({
    defaultLevel: logger.WARN,
    formatter: function (messages, context) {
        messages.unshift(new Date().toUTCString());
    }
});

module.exports = logger;