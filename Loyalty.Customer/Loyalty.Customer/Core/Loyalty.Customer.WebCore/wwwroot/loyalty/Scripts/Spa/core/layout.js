/*jshint node: true*/
/*global window, $, kendo*/

'use strict';

var logger = require('../util/logger'),
    homeVM = require('../viewmodels/homeVM'),
    termsVM = require('../viewmodels/termsVM'),
    dashboardVM = require('../viewmodels/dashboardVM'),

    layout = {
        // kendo layout to add the views
        mainLayout: new kendo.Layout('layout-tpl'),

        // views templates
        views: {
            homeView: new kendo.View('custHome', {
                model: homeVM,
                show: function () {
                    homeVM.runSlider($(".product-carousel"));
                    logger.debug("home template loaded");
                
                }
            }),
            termsView: new kendo.View('loyaltyTerms', {
                model: termsVM, show: function () {
                    logger.debug("Terms page loaded");
                    termsVM.LoadCustomer();
                }
            }),
            dashboardView: new kendo.View('dashboard', {
                model: dashboardVM,
                show: function () {
                    logger.debug("Dashboard page loaded");
                    dashboardVM.init();
                }
            })
        }
    };

window.spavm = $.extend(window.spavm || {},
{
    logger: logger,
    VMviews: layout.views
});

module.exports = layout;