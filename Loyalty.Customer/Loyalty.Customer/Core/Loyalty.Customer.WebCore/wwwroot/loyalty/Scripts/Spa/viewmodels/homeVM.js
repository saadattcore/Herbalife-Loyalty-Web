/*jshint node: true*/
/*global window, $, kendo*/

'use strict';
var doSlick = require('../util/slick'),
    cultureHelper = require('../util/cultureHelper');

var instance = kendo.observable({
    rewardsSource: new kendo.data.DataSource({
        transport: {
            read: {
                url: '/loyalty/api/Program/GetHighValueRewards/' + cultureHelper.GetCurrentUICulture(),
                dataType: 'json'
            }
        }
    }),

    runSlider: function (obj) {
        var model = this;
        this.set("element", obj);
        this.rewardsSource.bind("change", function () {
            doSlick(model.get("element"));
        });
    }
});

module.exports = instance;