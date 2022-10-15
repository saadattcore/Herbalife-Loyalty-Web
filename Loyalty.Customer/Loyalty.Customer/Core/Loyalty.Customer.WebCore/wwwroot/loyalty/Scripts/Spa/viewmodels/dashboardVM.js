/*jshint node: true*/
/*global window, $, kendo, location, viewModelHelpers*/

'use strict';

var logger = require('../util/logger'),
    cultureHelper = require('../util/cultureHelper');

var viewModel = { 
    dataLoaded: false,
    shoppingReached: false,
    activityReached: false,
    productInfoVisible: false,
    hasError: false,
    customerId: '',
    rewardSelected: '',
    termsVisible: false,
    regresionPoints: false,
    regresionPoints2: false,
    today: new Date(),


     

    dataSource : new kendo.data.DataSource({
        transport: {
            read: {
                url: "/loyalty/api/Program/GetCustomerDashboard/" + cultureHelper.GetCurrentUICulture(),
                type: "get",
                dataType: "json"
            } 
        },  
        schema: {
            total: "Total",
            parse: function (response) {
                if (response.Data === null)
                    response.Data = [];
                if (!Array.isArray(response)) {
                    response = [response];
                }
                return response;
            }
        }
    }),

    goHome: function(e){
        e.preventDefault();
        window.location = "/Catalog/Home/Index/" + cultureHelper.GetCurrentUICulture();
    },

    doBindings: function (data) {
        var model = this;
        model.set("customerId", data.customerId);
        model.set("programId", data.programId);
        model.set("enableShoppingRewards", data.enableShoppingRewards);
        model.set("enableActivityRewards", data.enableActivityRewards);
        model.set("SubDate", data.customerStartDate);

        var oneDay = 24 * 60 * 60 * 1000;

        var secondDate = new Date(model.SubDate);
        var firstDate = model.today;
        //var diffDays = two - one;
        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
        if (diffDays === 0) {
            model.set("regresionPoints", true);
            model.set("regresionPoints2", false);
        }
        if (diffDays < 5) {
            if (data.shoppingPoints.productPoints > 0) {
                model.set("regresionPoints", false);
                model.set("regresionPoints2", true);
            }
        }
        


        //Shop info
        var x;
        var shoppingPointInfo = data.shoppingPoints;
        if (data.enableShoppingRewards && shoppingPointInfo) {
            if (shoppingPointInfo.productMaxTier == 3)
                model.set("isAllShopCompleted", true);
            model.set("shoppingPoints", shoppingPointInfo.productPoints);
            model.set("shoppingPointsNextLevel", shoppingPointInfo.productPointsNeededNextLevel);
            for (x = 0; x < shoppingPointInfo.consecutiveMonthsAchieved; x++) {
                model.set("shopTier" + x, true);
            }
            if (shoppingPointInfo.rewardsGroups)
                model.setTierRewards(shoppingPointInfo, "Shop");
            if (((shoppingPointInfo.consecutiveMonthsAchieved - 1) != shoppingPointInfo.productMaxTier) && shoppingPointInfo.productMaxTier > 0) {
                model.set("notConsecutive", true);
                for (x = 0; x < shoppingPointInfo.productMaxTier; x++) {
                    model.set("notConsecutiveTier" + (x + 1), true);
                }
            }
        } else {
            model.set("singleActivity", true);
        }

        //Activit info
        var activityPointInfo = data.activityPoints;
        if (data.enableActivityRewards && activityPointInfo) {
            if (activityPointInfo.activityCurrentTier == 4)
                model.set("isAllActivityCompleted", true);
            model.set("activityPoints", activityPointInfo.activityPoints);
            model.set("activityPointsNextLevel", activityPointInfo.activityPointsNeededNextLevel);
            for (x = 0; x < activityPointInfo.activityCurrentTier; x++) {
                model.set("activityTier" + (x + 1), true);
            }
            if (activityPointInfo.rewardsGroups)
                model.setTierRewards(activityPointInfo, "Activity");
            $.ajax({
                url: "/Loyalty/api/Program/GetActivitiesProgram/" + cultureHelper.GetCurrentUICulture(),
                method: "GET",
                dataType: "json",
                data: {
                    programId: model.get("programId")
                },
                success: function (actData) {
                    if (actData !== null) {
                        model.set("pendingActivities", actData);
                    }
                },
                error: function (result) {
                    // notify the data source that the request failed
                    console.log(result);
                }
            });

        } else {
            model.set("singleShopping", true);
        }

        if (!data.activeProgram || (!data.enableShoppingRewards && !data.enableActivityRewards)) {
            model.set("hasError", true);
        }
        else
            model.set("dataLoaded", true);

        if (model.get("newCustomer"))
            if (model.get("firstTimeModal")) model.get("firstTimeModal").open().center();
            else
                if (model.get("firstTimeModal")) model.get("firstTimeModal").close();
    },

    init: function () {
        var model = this;
        this.dataSource.fetch(function () { 
            var data = this.data()[0];
            model.doBindings(data);            
        });
    },

    closeFirstTimeModal: function(e){
        e.preventDefault();
        this.get("firstTimeModal").close();
    },

    closeActivityRewardModal: function(e){
        e.preventDefault();
        this.get("ActivityRewardModal").close();
    },

    closeSelectRewardFailedModal: function (e) {
        e.preventDefault();
        this.get("SelectRewardFailedModal").close();
    },

    setTierRewards: function (source, type) {
        var canRedeem = source.ableToRedeem !== undefined ? source.ableToRedeem : true;
        var rewardsGroup = source.rewardsGroups;
        for (var x = 0; x < rewardsGroup.length; x++) {
            this.set("redeemed" + type + "Tier" + rewardsGroup[x].tier, rewardsGroup[x].redeemed);
            var currentTier = (type == "Shop" ? source.productMaxTier : source.activityCurrentTier);
            if (rewardsGroup[x].tier <= currentTier  && !rewardsGroup[x].redeemed && canRedeem) {
                //When tier has been reached but not selected
                this.set("selectReached" + type + "Tier" + rewardsGroup[x].tier, true);
            }
            this.set(type + "RewardsTier" + rewardsGroup[x].tier, rewardsGroup[x]);
        }
    },

    showData: function (e) {
        var isRedeemed = this.get("redeemed" + $(e.currentTarget).data("tier"));
        if (isRedeemed)
            $(e.currentTarget).toggleClass("closed");
    },

    onSelect: function (e) {
        //if no element has been selected
        if (e.target == e.currentTarget) return true;        

        //get element
        var element = "";
        var childs = $(e.currentTarget).children();
        var actual = e.target;       
        do {
            if ($.inArray(actual, childs) !== -1)
                element = actual;
            else
                actual = actual.parentElement;
        } while (element === "");

        //if activity reward to be Redeemed
        if ($(e.currentTarget).hasClass("toRedeemed") && $("[data-category='Activity']", element).length !== 0) {
            //No element has been selected
            if ($(".selected", e.currentTarget).length === 0) {
                this.set("rewardSelected", element);
                this.get("ActivityRewardModal").open().center();
            }
            return true;
        }

        //element already selected, de-select
        if ($(element).hasClass("selected")) {
            $(element).removeClass();
            return true;
        }

        //everything cool, select reward
        childs.removeClass();
        this.selectReward(element);
    },

    selectReward: function(element){        
        var tier = $(element).closest("[data-tier]").data("tier");
        var model = this;
        model.set("loadSelect" + tier, true);

        var jsonResponse = {
            "CustomerId": this.get('customerId'),
            "Tier": $("a", element).first().data("tier"),
            "CategoryCode": $("a", element).first().data("category"),
            "Sku": $("a", element).first().data("sku")
        };
         
        $.ajax({
            url: "/loyalty/api/Program/SaveWishitem/" + cultureHelper.GetCurrentUICulture(),
            method: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(jsonResponse),
            success: function (response) {
                if (response && response.isSuccess) {
                    $(element).addClass("selected");                    
                } else {
                    model.get("SelectRewardFailedModal").open().center();
                    model.dataSource.read().then(function () {
                        var data = model.dataSource.data()[0];
                        model.doBindings(data);
                    });
                }
                model.set("loadSelect" + tier, false);
            },
            error: function (result) {
                // notify the data source that the request failed
                console.log(result);
            }
        });
    },

    redeemActivity: function(e){
        e.preventDefault();
        this.get("ActivityRewardModal").close();
        this.selectReward(this.get("rewardSelected"));
    },

    getShoppingPoints: function () {
        var sp = this.get("shoppingPoints");
        if (sp === undefined) return "  ";
        if (!isNaN(sp) && sp > 0) {
            return Math.floor(sp);
        } else {
            return 0;
        }
    },

    getActivityPoints: function () {
        var ap = this.get("activityPoints");
        if (ap === undefined) return "  ";
        if (!isNaN(ap) && ap > 0) {
            return ap;
        } else {
            return 0;
        }
    },

    getShopPointsNextLevel: function () {
        var sp = this.get("shoppingPointsNextLevel");
        if(sp === undefined) return "  ";
        if (!isNaN(sp) && sp > 0) {
            return Math.floor(sp);
        } else {
            return 0;
        }
    },

    getActivityPointsNextLevel: function () {
        var ap = this.get("activityPointsNextLevel");
        if (ap === undefined) return "  ";
        if (!isNaN(ap) && ap > 0) {
            return ap;
        } else {
            return 0;
        }
    },

    hasShoppingPoints: function () {
        if (!this.get("dataLoaded") || this.get("shoppingReached") || this.get("isAllShopCompleted"))
            return false;
        return true;
    },

    isShoppingReached: function () {
        if (!this.get("dataLoaded") || this.get("isAllShopCompleted")) {
            this.set("shoppingReached", false);
            return false;
        }
        if (this.get("shoppingPointsNextLevel") <= 0 && !this.get("notConsecutive")) {
            this.set("shoppingReached", true);
            return true;
        }
        this.set("shoppingReached", false);
        return false;
    },

    hasActivityPoints: function () {
        if (!this.get("dataLoaded") || this.get("activityReached") || this.get("isAllActivityCompleted"))
            return false;
        return true;
    },

    toggleProductInfo: function (e) {
        e.preventDefault();
        var cl = $("i", e.currentTarget).attr("class");
        cl = cl.includes("29") ? cl.replace("29", "30") : cl.replace("30", "29");
        $("i", e.currentTarget).removeClass().addClass(cl);
        var bool = this.get("productInfoVisible");
        this.set("productInfoVisible", !bool);
    },

    toggleTerms: function (e) {
        e.preventDefault();
        var cl = $("i", e.currentTarget).attr("class");
        cl = cl.includes("up") ? cl.replace("up", "down") : cl.replace("down", "up");
        $("i", e.currentTarget).removeClass().addClass(cl);
        var bool = this.get("termsVisible");
        this.set("termsVisible", !bool);
    },

    scrollTo: function (e) {
        var element = $(e.currentTarget).data("scrollto");
        $('html, body').animate({
            scrollTop: $("." + element).offset().top - 50
        }, 900);
    },

    isLoading: function () {
        return (!this.get("dataLoaded") && !this.get("hasError"));
    }

};

module.exports = viewModelHelpers.mvvmUtil.asObservable(viewModel);