(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * js-logger - http://github.com/jonnyreeves/js-logger
 * Jonny Reeves, http://jonnyreeves.co.uk/
 * js-logger may be freely distributed under the MIT license.
 */
(function (global) {
	"use strict";

	// Top level module for the global, static logger instance.
	var Logger = { };

	// For those that are at home that are keeping score.
	Logger.VERSION = "1.3.0";

	// Function which handles all incoming log messages.
	var logHandler;

	// Map of ContextualLogger instances by name; used by Logger.get() to return the same named instance.
	var contextualLoggersByNameMap = {};

	// Polyfill for ES5's Function.bind.
	var bind = function(scope, func) {
		return function() {
			return func.apply(scope, arguments);
		};
	};

	// Super exciting object merger-matron 9000 adding another 100 bytes to your download.
	var merge = function () {
		var args = arguments, target = args[0], key, i;
		for (i = 1; i < args.length; i++) {
			for (key in args[i]) {
				if (!(key in target) && args[i].hasOwnProperty(key)) {
					target[key] = args[i][key];
				}
			}
		}
		return target;
	};

	// Helper to define a logging level object; helps with optimisation.
	var defineLogLevel = function(value, name) {
		return { value: value, name: name };
	};

	// Predefined logging levels.
	Logger.DEBUG = defineLogLevel(1, 'DEBUG');
	Logger.INFO = defineLogLevel(2, 'INFO');
	Logger.TIME = defineLogLevel(3, 'TIME');
	Logger.WARN = defineLogLevel(4, 'WARN');
	Logger.ERROR = defineLogLevel(8, 'ERROR');
	Logger.OFF = defineLogLevel(99, 'OFF');

	// Inner class which performs the bulk of the work; ContextualLogger instances can be configured independently
	// of each other.
	var ContextualLogger = function(defaultContext) {
		this.context = defaultContext;
		this.setLevel(defaultContext.filterLevel);
		this.log = this.info;  // Convenience alias.
	};

	ContextualLogger.prototype = {
		// Changes the current logging level for the logging instance.
		setLevel: function (newLevel) {
			// Ensure the supplied Level object looks valid.
			if (newLevel && "value" in newLevel) {
				this.context.filterLevel = newLevel;
			}
		},

		// Is the logger configured to output messages at the supplied level?
		enabledFor: function (lvl) {
			var filterLevel = this.context.filterLevel;
			return lvl.value >= filterLevel.value;
		},

		debug: function () {
			this.invoke(Logger.DEBUG, arguments);
		},

		info: function () {
			this.invoke(Logger.INFO, arguments);
		},

		warn: function () {
			this.invoke(Logger.WARN, arguments);
		},

		error: function () {
			this.invoke(Logger.ERROR, arguments);
		},

		time: function (label) {
			if (typeof label === 'string' && label.length > 0) {
				this.invoke(Logger.TIME, [ label, 'start' ]);
			}
		},

		timeEnd: function (label) {
			if (typeof label === 'string' && label.length > 0) {
				this.invoke(Logger.TIME, [ label, 'end' ]);
			}
		},

		// Invokes the logger callback if it's not being filtered.
		invoke: function (level, msgArgs) {
			if (logHandler && this.enabledFor(level)) {
				logHandler(msgArgs, merge({ level: level }, this.context));
			}
		}
	};

	// Protected instance which all calls to the to level `Logger` module will be routed through.
	var globalLogger = new ContextualLogger({ filterLevel: Logger.OFF });

	// Configure the global Logger instance.
	(function() {
		// Shortcut for optimisers.
		var L = Logger;

		L.enabledFor = bind(globalLogger, globalLogger.enabledFor);
		L.debug = bind(globalLogger, globalLogger.debug);
		L.time = bind(globalLogger, globalLogger.time);
		L.timeEnd = bind(globalLogger, globalLogger.timeEnd);
		L.info = bind(globalLogger, globalLogger.info);
		L.warn = bind(globalLogger, globalLogger.warn);
		L.error = bind(globalLogger, globalLogger.error);

		// Don't forget the convenience alias!
		L.log = L.info;
	}());

	// Set the global logging handler.  The supplied function should expect two arguments, the first being an arguments
	// object with the supplied log messages and the second being a context object which contains a hash of stateful
	// parameters which the logging function can consume.
	Logger.setHandler = function (func) {
		logHandler = func;
	};

	// Sets the global logging filter level which applies to *all* previously registered, and future Logger instances.
	// (note that named loggers (retrieved via `Logger.get`) can be configured independently if required).
	Logger.setLevel = function(level) {
		// Set the globalLogger's level.
		globalLogger.setLevel(level);

		// Apply this level to all registered contextual loggers.
		for (var key in contextualLoggersByNameMap) {
			if (contextualLoggersByNameMap.hasOwnProperty(key)) {
				contextualLoggersByNameMap[key].setLevel(level);
			}
		}
	};

	// Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
	// default context and log handler.
	Logger.get = function (name) {
		// All logger instances are cached so they can be configured ahead of use.
		return contextualLoggersByNameMap[name] ||
			(contextualLoggersByNameMap[name] = new ContextualLogger(merge({ name: name }, globalLogger.context)));
	};

	// CreateDefaultHandler returns a handler function which can be passed to `Logger.setHandler()` which will
	// write to the window's console object (if present); the optional options object can be used to customise the
	// formatter used to format each log message.
	Logger.createDefaultHandler = function (options) {
		options = options || {};

		options.formatter = options.formatter || function defaultMessageFormatter(messages, context) {
			// Prepend the logger's name to the log message for easy identification.
			if (context.name) {
				messages.unshift("[" + context.name + "]");
			}
		};

		// Map of timestamps by timer labels used to track `#time` and `#timeEnd()` invocations in environments
		// that don't offer a native console method.
		var timerStartTimeByLabelMap = {};

		// Support for IE8+ (and other, slightly more sane environments)
		var invokeConsoleMethod = function (hdlr, messages) {
			Function.prototype.apply.call(hdlr, console, messages);
		};

		// Check for the presence of a logger.
		if (typeof console === "undefined") {
			return function () { /* no console */ };
		}

		return function(messages, context) {
			// Convert arguments object to Array.
			messages = Array.prototype.slice.call(messages);

			var hdlr = console.log;
			var timerLabel;

			if (context.level === Logger.TIME) {
				timerLabel = (context.name ? '[' + context.name + '] ' : '') + messages[0];

				if (messages[1] === 'start') {
					if (console.time) {
						console.time(timerLabel);
					}
					else {
						timerStartTimeByLabelMap[timerLabel] = new Date().getTime();
					}
				}
				else {
					if (console.timeEnd) {
						console.timeEnd(timerLabel);
					}
					else {
						invokeConsoleMethod(hdlr, [ timerLabel + ': ' +
							(new Date().getTime() - timerStartTimeByLabelMap[timerLabel]) + 'ms' ]);
					}
				}
			}
			else {
				// Delegate through to custom warn/error loggers if present on the console.
				if (context.level === Logger.WARN && console.warn) {
					hdlr = console.warn;
				} else if (context.level === Logger.ERROR && console.error) {
					hdlr = console.error;
				} else if (context.level === Logger.INFO && console.info) {
					hdlr = console.info;
				}

				options.formatter(messages, context);
				invokeConsoleMethod(hdlr, messages);
			}
		};
	};

	// Configure and example a Default implementation which writes to the `window.console` (if present).  The
	// `options` hash can be used to configure the default logLevel and provide a custom message formatter.
	Logger.useDefaults = function(options) {
		Logger.setLevel(options && options.defaultLevel || Logger.DEBUG);
		Logger.setHandler(Logger.createDefaultHandler(options));
	};

	// Export to popular environments boilerplate.
	if (typeof define === 'function' && define.amd) {
		define(Logger);
	}
	else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Logger;
	}
	else {
		Logger._prevLogger = global.Logger;

		Logger.noConflict = function () {
			global.Logger = Logger._prevLogger;
			return Logger;
		};

		global.Logger = Logger;
	}
}(this));

},{}],2:[function(require,module,exports){
/*jshint node: true*/

'use strict';

var logger = require('./util/logger'),
    router = require('./core/router'),

    start = function () {
        logger.debug("app - start");
        router.start();
    };

start();
},{"./core/router":4,"./util/logger":6}],3:[function(require,module,exports){
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
},{"../util/logger":6,"../viewmodels/dashboardVM":8,"../viewmodels/homeVM":9,"../viewmodels/termsVM":10}],4:[function(require,module,exports){
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
},{"./layout":3}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"js-logger":1}],7:[function(require,module,exports){
/*jshint node: true */
'use strict';


var doSlick = function (param) {
    param.slick({
        //dots: false,
        infinite: true,
        //speed: 300,
        slidesToShow: 3,
        slidesToScroll: 3,
        prevArrow: '<button type="button" data-role="none" class="slick-prev icon-arrow-left-ln-2" style="display: block;"></button>',
        nextArrow: '<button type="button" data-role="none" class="slick-next icon-arrow-right-ln-2" style="display: block;"></button>',
        responsive: [
            {
                breakpoint: 1320,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: true
                }
            },
            {

                breakpoint: 660,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true
                }
            }
        ]

    });
};

module.exports = doSlick;
},{}],8:[function(require,module,exports){
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
},{"../util/cultureHelper":5,"../util/logger":6}],9:[function(require,module,exports){
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
},{"../util/cultureHelper":5,"../util/slick":7}],10:[function(require,module,exports){
/*jshint node: true*/
/*global window, $, kendo, location*/

'use strict';

var logger = require('../util/logger'),
    cultureHelper = require('../util/cultureHelper'),
    phoneTypeMap = {
        "1": "Home",
        "2": "Mobile",
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

            $.ajax({
                url: '/loyalty/api/Program/GetCustomer/' + cultureHelper.GetCurrentUICulture(),
                type: 'json',
                method: 'GET',
                success: function (response) {
                    that.set('firstName', response.firstName);
                    that.set('lastName', response.lastName);
                    that.set('phone.number', response.phoneNumber);
                    that.set('phone.type', phoneTypeMap[response.phoneType]);
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
},{"../util/cultureHelper":5,"../util/logger":6}]},{},[2])
//# sourceMappingURL=app.bundle.js.map
