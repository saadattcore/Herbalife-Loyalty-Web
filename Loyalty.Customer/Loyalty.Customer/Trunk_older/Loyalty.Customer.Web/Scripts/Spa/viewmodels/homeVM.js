/*jshint node: true*/
/*global window, $, kendo*/

'use strict';

var instance = kendo.observable({
    rewardsSource: new kendo.data.DataSource({
        transport: {
            read: {
                url: '/api/Program/GetHighValueRewards',
                async: false,
                dataType: 'json'
            }
        }
    })
});

module.exports = instance;