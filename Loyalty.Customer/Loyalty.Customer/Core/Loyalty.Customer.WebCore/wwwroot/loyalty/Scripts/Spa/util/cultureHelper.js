/*jshint node: true*/
/*global window*/

"use strict";

var cultureHelper = {
    GetCurrentUICulture: function () {
        var locale = "en-US";
        var regExp = new RegExp("^[a-z]{2}(?:-[A-Z]{2})?$");
        var url = window.location.href;
        var parts = url.split('/');

        parts.forEach(function (item) {
            if (regExp.test(item)) {
                locale = item;
            }
        });

        return locale;
    }
};

module.exports = cultureHelper;