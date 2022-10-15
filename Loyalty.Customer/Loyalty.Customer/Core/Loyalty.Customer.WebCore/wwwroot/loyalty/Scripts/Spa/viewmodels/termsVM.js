/*jshint node: true*/
/*global window, $, kendo, location*/

'use strict';

var logger = require('../util/logger'),
    cultureHelper = require('../util/cultureHelper'),
    phoneTypeMap = {
        "1": "Mobile",
        "2": "Home",
        "3": "Work"
    },

    instance = kendo.observable({
        firstName: '',
        lastName: '',
        phone: {
            number: '',
            type: 'Mobile'
        },
        isLoading: false,
        hasAccepted: false,
        nextDisabled: false,

        LoadCustomer: function () {
            var that = this;
            var email = '';

            $.ajax({
                url: '/loyalty/api/Program/GetCustomer/' + cultureHelper.GetCurrentUICulture(),
                type: 'json',
                method: 'GET',
                success: function (response) {
                    that.set('firstName', response.firstName);
                    that.set('lastName', response.lastName);
                    that.set('phone.number', response.phoneNumber);
                    that.set('phone.type', phoneTypeMap[response.phoneType]);
                    email = response.email;

                },
                error: function (exception) {
                    logger.error(exception);
                }
            });

            $.ajax({
                url: '/loyalty/api/Program/GetDistributor/' + cultureHelper.GetCurrentUICulture(),
                type: 'json',
                data: JSON.stringify('email', email),
                method: 'GET',
                success: function (response) {

                    if (response != null) {
                        that.set('custActive', true);
                    }
                },
                error: function (exception) {
                    logger.error(exception);
                }
            });
        },

        Activate: function () {
            var that = this;
            var validator = $('.hl-form').kendoValidator().data('kendoValidator');

            if (validator.validate()) {
                that.set("isLoading", true);
                that.set("nextDisabled", true);
                var _custData = {
                    'FirstName': that.firstName,
                    'LastName': that.lastName,
                    'Phone': {
                        'Number': that.phone.number,
                        'Type': that.phone.type
                    }
                };

                $.ajax({
                    url: '/loyalty/api/Program/ActivateProgram/' + cultureHelper.GetCurrentUICulture(),
                    data: _custData,
                    type: 'json',
                    method: 'POST',
                    success: function (response) {
                        if (response.isSuccess) {
                            that.set("isLoading", false);
                            location.href = '#/dashboard/justEnrolled';
                        } else {
                            if (response.errorMessage === "LOCK_PERIOD" || response.errorMessage === "Customer already enrolled.") {
                                // Show error about lock period
                                that.set("lockActive", true);
                                that.set("isLoading", false);
                            }
                            logger.error(response.errorMessage);

                        }
                    },
                    error: function (exception) {
                        logger.error(exception);
                    }
                });
            }
        },

        EnableActive: function () {
            return this.get('hasAccepted') && this.get('firstName') !== '' && this.get('lastName') !== '' && this.get('phone.number') !== '';
        },

        CloseLockMessageModal: function (e) {
            e.preventDefault();
            this.get("lockMessageModal").close();
        }
    });

module.exports = instance;