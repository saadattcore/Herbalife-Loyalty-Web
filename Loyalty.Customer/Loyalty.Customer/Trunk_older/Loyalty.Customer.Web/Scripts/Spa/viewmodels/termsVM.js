/*jshint node: true*/
/*global window, $, kendo, location*/

'use strict';

var logger = require('../util/logger'),

    instance = kendo.observable({
        id: "0",
        firstName: "John",
        lastName: "Doe",
        email: "email@example.com",
        goHLId: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        hasAccepted: false,

        LoadCustomer: function () {
            var that = this;

            $.ajax({
                url: '/api/Program/GetCustomer',
                type: 'json',
                method: 'GET',
                success: function (response) {
                    that.set('id', response.Id);
                    that.set('firstName', response.FirstName);
                    that.set('lastName', response.LastName);
                    that.set('email', response.Email);
                    that.set('goHLId', response.GoHlCustomerId);
                },
                error: function (exception) {
                    logger.error(exception);
                }
            });
        },

        Activate: function () {
            var that = this;
            var _custData = {
                'Id': that.id,
                'DistributorId': "STAFF",
                'Email': that.email,
                'FirstName': that.firstName,
                'LastName': that.lastName,
                'GoHlCustomerId': that.goHLId,
                'LoyalityProgramId': "B55A8979-08B5-E612-80C4-0015DDE1E511"
            };

            $.ajax({
                url: '/api/Program/ActivateProgram',
                data: _custData,
                type: 'json',
                method: 'POST',
                success: function (response) {
                    location.href = '#/dashboard';
                },
                error: function (exception) {
                    logger.error(exception);
                }
            });
        },

        EnableActive: function () {
            return this.get('hasAccepted') && this.get('firstName') !== '' && this.get('lastName') !== '';
        }
    });

module.exports = instance;