/*jshint node: true*/
/*global window, $, kendo, location, viewModelHelpers*/

'use strict';

var logger = require('../util/logger');

var viewModel = {
    x : 0,

    dataSource : new kendo.data.DataSource({
        data: [
            { "name": "[First name] [Last name]", "dataEnrolled": "09/09/2015" },
            { "name": "[First name] [Last name]", "dataEnrolled": "09/09/2015" },
            { "name": "[First name] [Last name]", "dataEnrolled": "09/09/2015" },
            { "name": "[First name] [Last name]", "dataEnrolled": "09/09/2015" }
        ]
    }),

    showData :function (e) {
        $(e.currentTarget).toggleClass("closed");
    },

    onSelect: function (e) {
        var childs = $(e.currentTarget).children();
        childs.removeClass();
        var element = "";
        var actual = e.target;
        do {
            if ($.inArray(actual, childs) != -1)
                element = actual;
            else
                actual = actual.parentElement;
        } while (element === "");
        $(element).addClass("selected");
    } 
};

module.exports = viewModelHelpers.mvvmUtil.asObservable(viewModel);