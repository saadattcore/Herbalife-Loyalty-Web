/*jshint node: true*/
/*global window, $, kendo, localStorage*/

'use strict';

var layout = require('./layout'),
    mainLayout = layout.mainLayout,
    views = layout.views,

    router = new kendo.Router({
        init: function () {
            mainLayout.render('#loyalty-app');
        },
        routeMissing: function () {
            router.navigate('/');
        }
    });

// routes
router.route('/', function () {
    mainLayout.showIn('#app-content', views.dashboardView);
});

router.route('/loyaltyTerms', function () {
    mainLayout.showIn('#app-content', views.termsView);
});

router.route('/dashboard(/:newCustomer)', function (newCustomer) {
    if (typeof newCustomer !== 'undefined' && localStorage.newcustomer === undefined) {
        views.dashboardView.model.set("newCustomer", true);
        localStorage.setItem("newcustomer", "true");
    }
    else views.dashboardView.model.set("newCustomer", false);
    mainLayout.showIn('#app-content', views.dashboardView);
});

window.spavm = $.extend(window.spavm || {},
{
    router: router
});

module.exports = router;