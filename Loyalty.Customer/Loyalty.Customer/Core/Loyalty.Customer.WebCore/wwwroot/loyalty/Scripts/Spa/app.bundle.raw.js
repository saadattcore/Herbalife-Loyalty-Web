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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtbG9nZ2VyL3NyYy9sb2dnZXIuanMiLCJ3d3dyb290L2xveWFsdHkvU2NyaXB0cy9TcGEvYXBwLmpzIiwid3d3cm9vdC9sb3lhbHR5L1NjcmlwdHMvU3BhL2NvcmUvbGF5b3V0LmpzIiwid3d3cm9vdC9sb3lhbHR5L1NjcmlwdHMvU3BhL2NvcmUvcm91dGVyLmpzIiwid3d3cm9vdC9sb3lhbHR5L1NjcmlwdHMvU3BhL3V0aWwvY3VsdHVyZUhlbHBlci5qcyIsInd3d3Jvb3QvbG95YWx0eS9TY3JpcHRzL1NwYS91dGlsL2xvZ2dlci5qcyIsInd3d3Jvb3QvbG95YWx0eS9TY3JpcHRzL1NwYS91dGlsL3NsaWNrLmpzIiwid3d3cm9vdC9sb3lhbHR5L1NjcmlwdHMvU3BhL3ZpZXdtb2RlbHMvZGFzaGJvYXJkVk0uanMiLCJ3d3dyb290L2xveWFsdHkvU2NyaXB0cy9TcGEvdmlld21vZGVscy9ob21lVk0uanMiLCJ3d3dyb290L2xveWFsdHkvU2NyaXB0cy9TcGEvdmlld21vZGVscy90ZXJtc1ZNLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxyXG4gKiBqcy1sb2dnZXIgLSBodHRwOi8vZ2l0aHViLmNvbS9qb25ueXJlZXZlcy9qcy1sb2dnZXJcclxuICogSm9ubnkgUmVldmVzLCBodHRwOi8vam9ubnlyZWV2ZXMuY28udWsvXHJcbiAqIGpzLWxvZ2dlciBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cclxuICovXHJcbihmdW5jdGlvbiAoZ2xvYmFsKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5cdC8vIFRvcCBsZXZlbCBtb2R1bGUgZm9yIHRoZSBnbG9iYWwsIHN0YXRpYyBsb2dnZXIgaW5zdGFuY2UuXHJcblx0dmFyIExvZ2dlciA9IHsgfTtcclxuXHJcblx0Ly8gRm9yIHRob3NlIHRoYXQgYXJlIGF0IGhvbWUgdGhhdCBhcmUga2VlcGluZyBzY29yZS5cclxuXHRMb2dnZXIuVkVSU0lPTiA9IFwiMS4zLjBcIjtcclxuXHJcblx0Ly8gRnVuY3Rpb24gd2hpY2ggaGFuZGxlcyBhbGwgaW5jb21pbmcgbG9nIG1lc3NhZ2VzLlxyXG5cdHZhciBsb2dIYW5kbGVyO1xyXG5cclxuXHQvLyBNYXAgb2YgQ29udGV4dHVhbExvZ2dlciBpbnN0YW5jZXMgYnkgbmFtZTsgdXNlZCBieSBMb2dnZXIuZ2V0KCkgdG8gcmV0dXJuIHRoZSBzYW1lIG5hbWVkIGluc3RhbmNlLlxyXG5cdHZhciBjb250ZXh0dWFsTG9nZ2Vyc0J5TmFtZU1hcCA9IHt9O1xyXG5cclxuXHQvLyBQb2x5ZmlsbCBmb3IgRVM1J3MgRnVuY3Rpb24uYmluZC5cclxuXHR2YXIgYmluZCA9IGZ1bmN0aW9uKHNjb3BlLCBmdW5jKSB7XHJcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBmdW5jLmFwcGx5KHNjb3BlLCBhcmd1bWVudHMpO1xyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHQvLyBTdXBlciBleGNpdGluZyBvYmplY3QgbWVyZ2VyLW1hdHJvbiA5MDAwIGFkZGluZyBhbm90aGVyIDEwMCBieXRlcyB0byB5b3VyIGRvd25sb2FkLlxyXG5cdHZhciBtZXJnZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBhcmdzID0gYXJndW1lbnRzLCB0YXJnZXQgPSBhcmdzWzBdLCBrZXksIGk7XHJcblx0XHRmb3IgKGkgPSAxOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRmb3IgKGtleSBpbiBhcmdzW2ldKSB7XHJcblx0XHRcdFx0aWYgKCEoa2V5IGluIHRhcmdldCkgJiYgYXJnc1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0XHR0YXJnZXRba2V5XSA9IGFyZ3NbaV1ba2V5XTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0YXJnZXQ7XHJcblx0fTtcclxuXHJcblx0Ly8gSGVscGVyIHRvIGRlZmluZSBhIGxvZ2dpbmcgbGV2ZWwgb2JqZWN0OyBoZWxwcyB3aXRoIG9wdGltaXNhdGlvbi5cclxuXHR2YXIgZGVmaW5lTG9nTGV2ZWwgPSBmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xyXG5cdFx0cmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBuYW1lOiBuYW1lIH07XHJcblx0fTtcclxuXHJcblx0Ly8gUHJlZGVmaW5lZCBsb2dnaW5nIGxldmVscy5cclxuXHRMb2dnZXIuREVCVUcgPSBkZWZpbmVMb2dMZXZlbCgxLCAnREVCVUcnKTtcclxuXHRMb2dnZXIuSU5GTyA9IGRlZmluZUxvZ0xldmVsKDIsICdJTkZPJyk7XHJcblx0TG9nZ2VyLlRJTUUgPSBkZWZpbmVMb2dMZXZlbCgzLCAnVElNRScpO1xyXG5cdExvZ2dlci5XQVJOID0gZGVmaW5lTG9nTGV2ZWwoNCwgJ1dBUk4nKTtcclxuXHRMb2dnZXIuRVJST1IgPSBkZWZpbmVMb2dMZXZlbCg4LCAnRVJST1InKTtcclxuXHRMb2dnZXIuT0ZGID0gZGVmaW5lTG9nTGV2ZWwoOTksICdPRkYnKTtcclxuXHJcblx0Ly8gSW5uZXIgY2xhc3Mgd2hpY2ggcGVyZm9ybXMgdGhlIGJ1bGsgb2YgdGhlIHdvcms7IENvbnRleHR1YWxMb2dnZXIgaW5zdGFuY2VzIGNhbiBiZSBjb25maWd1cmVkIGluZGVwZW5kZW50bHlcclxuXHQvLyBvZiBlYWNoIG90aGVyLlxyXG5cdHZhciBDb250ZXh0dWFsTG9nZ2VyID0gZnVuY3Rpb24oZGVmYXVsdENvbnRleHQpIHtcclxuXHRcdHRoaXMuY29udGV4dCA9IGRlZmF1bHRDb250ZXh0O1xyXG5cdFx0dGhpcy5zZXRMZXZlbChkZWZhdWx0Q29udGV4dC5maWx0ZXJMZXZlbCk7XHJcblx0XHR0aGlzLmxvZyA9IHRoaXMuaW5mbzsgIC8vIENvbnZlbmllbmNlIGFsaWFzLlxyXG5cdH07XHJcblxyXG5cdENvbnRleHR1YWxMb2dnZXIucHJvdG90eXBlID0ge1xyXG5cdFx0Ly8gQ2hhbmdlcyB0aGUgY3VycmVudCBsb2dnaW5nIGxldmVsIGZvciB0aGUgbG9nZ2luZyBpbnN0YW5jZS5cclxuXHRcdHNldExldmVsOiBmdW5jdGlvbiAobmV3TGV2ZWwpIHtcclxuXHRcdFx0Ly8gRW5zdXJlIHRoZSBzdXBwbGllZCBMZXZlbCBvYmplY3QgbG9va3MgdmFsaWQuXHJcblx0XHRcdGlmIChuZXdMZXZlbCAmJiBcInZhbHVlXCIgaW4gbmV3TGV2ZWwpIHtcclxuXHRcdFx0XHR0aGlzLmNvbnRleHQuZmlsdGVyTGV2ZWwgPSBuZXdMZXZlbDtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBJcyB0aGUgbG9nZ2VyIGNvbmZpZ3VyZWQgdG8gb3V0cHV0IG1lc3NhZ2VzIGF0IHRoZSBzdXBwbGllZCBsZXZlbD9cclxuXHRcdGVuYWJsZWRGb3I6IGZ1bmN0aW9uIChsdmwpIHtcclxuXHRcdFx0dmFyIGZpbHRlckxldmVsID0gdGhpcy5jb250ZXh0LmZpbHRlckxldmVsO1xyXG5cdFx0XHRyZXR1cm4gbHZsLnZhbHVlID49IGZpbHRlckxldmVsLnZhbHVlO1xyXG5cdFx0fSxcclxuXHJcblx0XHRkZWJ1ZzogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR0aGlzLmludm9rZShMb2dnZXIuREVCVUcsIGFyZ3VtZW50cyk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGluZm86IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0dGhpcy5pbnZva2UoTG9nZ2VyLklORk8sIGFyZ3VtZW50cyk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHdhcm46IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0dGhpcy5pbnZva2UoTG9nZ2VyLldBUk4sIGFyZ3VtZW50cyk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGVycm9yOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHRoaXMuaW52b2tlKExvZ2dlci5FUlJPUiwgYXJndW1lbnRzKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0dGltZTogZnVuY3Rpb24gKGxhYmVsKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgbGFiZWwgPT09ICdzdHJpbmcnICYmIGxhYmVsLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHR0aGlzLmludm9rZShMb2dnZXIuVElNRSwgWyBsYWJlbCwgJ3N0YXJ0JyBdKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHR0aW1lRW5kOiBmdW5jdGlvbiAobGFiZWwpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBsYWJlbCA9PT0gJ3N0cmluZycgJiYgbGFiZWwubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdHRoaXMuaW52b2tlKExvZ2dlci5USU1FLCBbIGxhYmVsLCAnZW5kJyBdKTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblx0XHQvLyBJbnZva2VzIHRoZSBsb2dnZXIgY2FsbGJhY2sgaWYgaXQncyBub3QgYmVpbmcgZmlsdGVyZWQuXHJcblx0XHRpbnZva2U6IGZ1bmN0aW9uIChsZXZlbCwgbXNnQXJncykge1xyXG5cdFx0XHRpZiAobG9nSGFuZGxlciAmJiB0aGlzLmVuYWJsZWRGb3IobGV2ZWwpKSB7XHJcblx0XHRcdFx0bG9nSGFuZGxlcihtc2dBcmdzLCBtZXJnZSh7IGxldmVsOiBsZXZlbCB9LCB0aGlzLmNvbnRleHQpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdC8vIFByb3RlY3RlZCBpbnN0YW5jZSB3aGljaCBhbGwgY2FsbHMgdG8gdGhlIHRvIGxldmVsIGBMb2dnZXJgIG1vZHVsZSB3aWxsIGJlIHJvdXRlZCB0aHJvdWdoLlxyXG5cdHZhciBnbG9iYWxMb2dnZXIgPSBuZXcgQ29udGV4dHVhbExvZ2dlcih7IGZpbHRlckxldmVsOiBMb2dnZXIuT0ZGIH0pO1xyXG5cclxuXHQvLyBDb25maWd1cmUgdGhlIGdsb2JhbCBMb2dnZXIgaW5zdGFuY2UuXHJcblx0KGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gU2hvcnRjdXQgZm9yIG9wdGltaXNlcnMuXHJcblx0XHR2YXIgTCA9IExvZ2dlcjtcclxuXHJcblx0XHRMLmVuYWJsZWRGb3IgPSBiaW5kKGdsb2JhbExvZ2dlciwgZ2xvYmFsTG9nZ2VyLmVuYWJsZWRGb3IpO1xyXG5cdFx0TC5kZWJ1ZyA9IGJpbmQoZ2xvYmFsTG9nZ2VyLCBnbG9iYWxMb2dnZXIuZGVidWcpO1xyXG5cdFx0TC50aW1lID0gYmluZChnbG9iYWxMb2dnZXIsIGdsb2JhbExvZ2dlci50aW1lKTtcclxuXHRcdEwudGltZUVuZCA9IGJpbmQoZ2xvYmFsTG9nZ2VyLCBnbG9iYWxMb2dnZXIudGltZUVuZCk7XHJcblx0XHRMLmluZm8gPSBiaW5kKGdsb2JhbExvZ2dlciwgZ2xvYmFsTG9nZ2VyLmluZm8pO1xyXG5cdFx0TC53YXJuID0gYmluZChnbG9iYWxMb2dnZXIsIGdsb2JhbExvZ2dlci53YXJuKTtcclxuXHRcdEwuZXJyb3IgPSBiaW5kKGdsb2JhbExvZ2dlciwgZ2xvYmFsTG9nZ2VyLmVycm9yKTtcclxuXHJcblx0XHQvLyBEb24ndCBmb3JnZXQgdGhlIGNvbnZlbmllbmNlIGFsaWFzIVxyXG5cdFx0TC5sb2cgPSBMLmluZm87XHJcblx0fSgpKTtcclxuXHJcblx0Ly8gU2V0IHRoZSBnbG9iYWwgbG9nZ2luZyBoYW5kbGVyLiAgVGhlIHN1cHBsaWVkIGZ1bmN0aW9uIHNob3VsZCBleHBlY3QgdHdvIGFyZ3VtZW50cywgdGhlIGZpcnN0IGJlaW5nIGFuIGFyZ3VtZW50c1xyXG5cdC8vIG9iamVjdCB3aXRoIHRoZSBzdXBwbGllZCBsb2cgbWVzc2FnZXMgYW5kIHRoZSBzZWNvbmQgYmVpbmcgYSBjb250ZXh0IG9iamVjdCB3aGljaCBjb250YWlucyBhIGhhc2ggb2Ygc3RhdGVmdWxcclxuXHQvLyBwYXJhbWV0ZXJzIHdoaWNoIHRoZSBsb2dnaW5nIGZ1bmN0aW9uIGNhbiBjb25zdW1lLlxyXG5cdExvZ2dlci5zZXRIYW5kbGVyID0gZnVuY3Rpb24gKGZ1bmMpIHtcclxuXHRcdGxvZ0hhbmRsZXIgPSBmdW5jO1xyXG5cdH07XHJcblxyXG5cdC8vIFNldHMgdGhlIGdsb2JhbCBsb2dnaW5nIGZpbHRlciBsZXZlbCB3aGljaCBhcHBsaWVzIHRvICphbGwqIHByZXZpb3VzbHkgcmVnaXN0ZXJlZCwgYW5kIGZ1dHVyZSBMb2dnZXIgaW5zdGFuY2VzLlxyXG5cdC8vIChub3RlIHRoYXQgbmFtZWQgbG9nZ2VycyAocmV0cmlldmVkIHZpYSBgTG9nZ2VyLmdldGApIGNhbiBiZSBjb25maWd1cmVkIGluZGVwZW5kZW50bHkgaWYgcmVxdWlyZWQpLlxyXG5cdExvZ2dlci5zZXRMZXZlbCA9IGZ1bmN0aW9uKGxldmVsKSB7XHJcblx0XHQvLyBTZXQgdGhlIGdsb2JhbExvZ2dlcidzIGxldmVsLlxyXG5cdFx0Z2xvYmFsTG9nZ2VyLnNldExldmVsKGxldmVsKTtcclxuXHJcblx0XHQvLyBBcHBseSB0aGlzIGxldmVsIHRvIGFsbCByZWdpc3RlcmVkIGNvbnRleHR1YWwgbG9nZ2Vycy5cclxuXHRcdGZvciAodmFyIGtleSBpbiBjb250ZXh0dWFsTG9nZ2Vyc0J5TmFtZU1hcCkge1xyXG5cdFx0XHRpZiAoY29udGV4dHVhbExvZ2dlcnNCeU5hbWVNYXAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG5cdFx0XHRcdGNvbnRleHR1YWxMb2dnZXJzQnlOYW1lTWFwW2tleV0uc2V0TGV2ZWwobGV2ZWwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gUmV0cmlldmUgYSBDb250ZXh0dWFsTG9nZ2VyIGluc3RhbmNlLiAgTm90ZSB0aGF0IG5hbWVkIGxvZ2dlcnMgYXV0b21hdGljYWxseSBpbmhlcml0IHRoZSBnbG9iYWwgbG9nZ2VyJ3MgbGV2ZWwsXHJcblx0Ly8gZGVmYXVsdCBjb250ZXh0IGFuZCBsb2cgaGFuZGxlci5cclxuXHRMb2dnZXIuZ2V0ID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuXHRcdC8vIEFsbCBsb2dnZXIgaW5zdGFuY2VzIGFyZSBjYWNoZWQgc28gdGhleSBjYW4gYmUgY29uZmlndXJlZCBhaGVhZCBvZiB1c2UuXHJcblx0XHRyZXR1cm4gY29udGV4dHVhbExvZ2dlcnNCeU5hbWVNYXBbbmFtZV0gfHxcclxuXHRcdFx0KGNvbnRleHR1YWxMb2dnZXJzQnlOYW1lTWFwW25hbWVdID0gbmV3IENvbnRleHR1YWxMb2dnZXIobWVyZ2UoeyBuYW1lOiBuYW1lIH0sIGdsb2JhbExvZ2dlci5jb250ZXh0KSkpO1xyXG5cdH07XHJcblxyXG5cdC8vIENyZWF0ZURlZmF1bHRIYW5kbGVyIHJldHVybnMgYSBoYW5kbGVyIGZ1bmN0aW9uIHdoaWNoIGNhbiBiZSBwYXNzZWQgdG8gYExvZ2dlci5zZXRIYW5kbGVyKClgIHdoaWNoIHdpbGxcclxuXHQvLyB3cml0ZSB0byB0aGUgd2luZG93J3MgY29uc29sZSBvYmplY3QgKGlmIHByZXNlbnQpOyB0aGUgb3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgY2FuIGJlIHVzZWQgdG8gY3VzdG9taXNlIHRoZVxyXG5cdC8vIGZvcm1hdHRlciB1c2VkIHRvIGZvcm1hdCBlYWNoIGxvZyBtZXNzYWdlLlxyXG5cdExvZ2dlci5jcmVhdGVEZWZhdWx0SGFuZGxlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcblx0XHRvcHRpb25zLmZvcm1hdHRlciA9IG9wdGlvbnMuZm9ybWF0dGVyIHx8IGZ1bmN0aW9uIGRlZmF1bHRNZXNzYWdlRm9ybWF0dGVyKG1lc3NhZ2VzLCBjb250ZXh0KSB7XHJcblx0XHRcdC8vIFByZXBlbmQgdGhlIGxvZ2dlcidzIG5hbWUgdG8gdGhlIGxvZyBtZXNzYWdlIGZvciBlYXN5IGlkZW50aWZpY2F0aW9uLlxyXG5cdFx0XHRpZiAoY29udGV4dC5uYW1lKSB7XHJcblx0XHRcdFx0bWVzc2FnZXMudW5zaGlmdChcIltcIiArIGNvbnRleHQubmFtZSArIFwiXVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBNYXAgb2YgdGltZXN0YW1wcyBieSB0aW1lciBsYWJlbHMgdXNlZCB0byB0cmFjayBgI3RpbWVgIGFuZCBgI3RpbWVFbmQoKWAgaW52b2NhdGlvbnMgaW4gZW52aXJvbm1lbnRzXHJcblx0XHQvLyB0aGF0IGRvbid0IG9mZmVyIGEgbmF0aXZlIGNvbnNvbGUgbWV0aG9kLlxyXG5cdFx0dmFyIHRpbWVyU3RhcnRUaW1lQnlMYWJlbE1hcCA9IHt9O1xyXG5cclxuXHRcdC8vIFN1cHBvcnQgZm9yIElFOCsgKGFuZCBvdGhlciwgc2xpZ2h0bHkgbW9yZSBzYW5lIGVudmlyb25tZW50cylcclxuXHRcdHZhciBpbnZva2VDb25zb2xlTWV0aG9kID0gZnVuY3Rpb24gKGhkbHIsIG1lc3NhZ2VzKSB7XHJcblx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGhkbHIsIGNvbnNvbGUsIG1lc3NhZ2VzKTtcclxuXHRcdH07XHJcblxyXG5cdFx0Ly8gQ2hlY2sgZm9yIHRoZSBwcmVzZW5jZSBvZiBhIGxvZ2dlci5cclxuXHRcdGlmICh0eXBlb2YgY29uc29sZSA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCkgeyAvKiBubyBjb25zb2xlICovIH07XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKG1lc3NhZ2VzLCBjb250ZXh0KSB7XHJcblx0XHRcdC8vIENvbnZlcnQgYXJndW1lbnRzIG9iamVjdCB0byBBcnJheS5cclxuXHRcdFx0bWVzc2FnZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChtZXNzYWdlcyk7XHJcblxyXG5cdFx0XHR2YXIgaGRsciA9IGNvbnNvbGUubG9nO1xyXG5cdFx0XHR2YXIgdGltZXJMYWJlbDtcclxuXHJcblx0XHRcdGlmIChjb250ZXh0LmxldmVsID09PSBMb2dnZXIuVElNRSkge1xyXG5cdFx0XHRcdHRpbWVyTGFiZWwgPSAoY29udGV4dC5uYW1lID8gJ1snICsgY29udGV4dC5uYW1lICsgJ10gJyA6ICcnKSArIG1lc3NhZ2VzWzBdO1xyXG5cclxuXHRcdFx0XHRpZiAobWVzc2FnZXNbMV0gPT09ICdzdGFydCcpIHtcclxuXHRcdFx0XHRcdGlmIChjb25zb2xlLnRpbWUpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS50aW1lKHRpbWVyTGFiZWwpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRpbWVyU3RhcnRUaW1lQnlMYWJlbE1hcFt0aW1lckxhYmVsXSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdGlmIChjb25zb2xlLnRpbWVFbmQpIHtcclxuXHRcdFx0XHRcdFx0Y29uc29sZS50aW1lRW5kKHRpbWVyTGFiZWwpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0XHRcdGludm9rZUNvbnNvbGVNZXRob2QoaGRsciwgWyB0aW1lckxhYmVsICsgJzogJyArXHJcblx0XHRcdFx0XHRcdFx0KG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZXJTdGFydFRpbWVCeUxhYmVsTWFwW3RpbWVyTGFiZWxdKSArICdtcycgXSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdC8vIERlbGVnYXRlIHRocm91Z2ggdG8gY3VzdG9tIHdhcm4vZXJyb3IgbG9nZ2VycyBpZiBwcmVzZW50IG9uIHRoZSBjb25zb2xlLlxyXG5cdFx0XHRcdGlmIChjb250ZXh0LmxldmVsID09PSBMb2dnZXIuV0FSTiAmJiBjb25zb2xlLndhcm4pIHtcclxuXHRcdFx0XHRcdGhkbHIgPSBjb25zb2xlLndhcm47XHJcblx0XHRcdFx0fSBlbHNlIGlmIChjb250ZXh0LmxldmVsID09PSBMb2dnZXIuRVJST1IgJiYgY29uc29sZS5lcnJvcikge1xyXG5cdFx0XHRcdFx0aGRsciA9IGNvbnNvbGUuZXJyb3I7XHJcblx0XHRcdFx0fSBlbHNlIGlmIChjb250ZXh0LmxldmVsID09PSBMb2dnZXIuSU5GTyAmJiBjb25zb2xlLmluZm8pIHtcclxuXHRcdFx0XHRcdGhkbHIgPSBjb25zb2xlLmluZm87XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRvcHRpb25zLmZvcm1hdHRlcihtZXNzYWdlcywgY29udGV4dCk7XHJcblx0XHRcdFx0aW52b2tlQ29uc29sZU1ldGhvZChoZGxyLCBtZXNzYWdlcyk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fTtcclxuXHJcblx0Ly8gQ29uZmlndXJlIGFuZCBleGFtcGxlIGEgRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiB3aGljaCB3cml0ZXMgdG8gdGhlIGB3aW5kb3cuY29uc29sZWAgKGlmIHByZXNlbnQpLiAgVGhlXHJcblx0Ly8gYG9wdGlvbnNgIGhhc2ggY2FuIGJlIHVzZWQgdG8gY29uZmlndXJlIHRoZSBkZWZhdWx0IGxvZ0xldmVsIGFuZCBwcm92aWRlIGEgY3VzdG9tIG1lc3NhZ2UgZm9ybWF0dGVyLlxyXG5cdExvZ2dlci51c2VEZWZhdWx0cyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHRcdExvZ2dlci5zZXRMZXZlbChvcHRpb25zICYmIG9wdGlvbnMuZGVmYXVsdExldmVsIHx8IExvZ2dlci5ERUJVRyk7XHJcblx0XHRMb2dnZXIuc2V0SGFuZGxlcihMb2dnZXIuY3JlYXRlRGVmYXVsdEhhbmRsZXIob3B0aW9ucykpO1xyXG5cdH07XHJcblxyXG5cdC8vIEV4cG9ydCB0byBwb3B1bGFyIGVudmlyb25tZW50cyBib2lsZXJwbGF0ZS5cclxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcblx0XHRkZWZpbmUoTG9nZ2VyKTtcclxuXHR9XHJcblx0ZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuXHRcdG1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xyXG5cdH1cclxuXHRlbHNlIHtcclxuXHRcdExvZ2dlci5fcHJldkxvZ2dlciA9IGdsb2JhbC5Mb2dnZXI7XHJcblxyXG5cdFx0TG9nZ2VyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGdsb2JhbC5Mb2dnZXIgPSBMb2dnZXIuX3ByZXZMb2dnZXI7XHJcblx0XHRcdHJldHVybiBMb2dnZXI7XHJcblx0XHR9O1xyXG5cclxuXHRcdGdsb2JhbC5Mb2dnZXIgPSBMb2dnZXI7XHJcblx0fVxyXG59KHRoaXMpKTtcclxuIiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbG9nZ2VyID0gcmVxdWlyZSgnLi91dGlsL2xvZ2dlcicpLFxyXG4gICAgcm91dGVyID0gcmVxdWlyZSgnLi9jb3JlL3JvdXRlcicpLFxyXG5cclxuICAgIHN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcImFwcCAtIHN0YXJ0XCIpO1xyXG4gICAgICAgIHJvdXRlci5zdGFydCgpO1xyXG4gICAgfTtcclxuXHJcbnN0YXJ0KCk7IiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcbi8qZ2xvYmFsIHdpbmRvdywgJCwga2VuZG8qL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGxvZ2dlciA9IHJlcXVpcmUoJy4uL3V0aWwvbG9nZ2VyJyksXHJcbiAgICBob21lVk0gPSByZXF1aXJlKCcuLi92aWV3bW9kZWxzL2hvbWVWTScpLFxyXG4gICAgdGVybXNWTSA9IHJlcXVpcmUoJy4uL3ZpZXdtb2RlbHMvdGVybXNWTScpLFxyXG4gICAgZGFzaGJvYXJkVk0gPSByZXF1aXJlKCcuLi92aWV3bW9kZWxzL2Rhc2hib2FyZFZNJyksXHJcblxyXG4gICAgbGF5b3V0ID0ge1xyXG4gICAgICAgIC8vIGtlbmRvIGxheW91dCB0byBhZGQgdGhlIHZpZXdzXHJcbiAgICAgICAgbWFpbkxheW91dDogbmV3IGtlbmRvLkxheW91dCgnbGF5b3V0LXRwbCcpLFxyXG5cclxuICAgICAgICAvLyB2aWV3cyB0ZW1wbGF0ZXNcclxuICAgICAgICB2aWV3czoge1xyXG4gICAgICAgICAgICBob21lVmlldzogbmV3IGtlbmRvLlZpZXcoJ2N1c3RIb21lJywge1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IGhvbWVWTSxcclxuICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBob21lVk0ucnVuU2xpZGVyKCQoXCIucHJvZHVjdC1jYXJvdXNlbFwiKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiaG9tZSB0ZW1wbGF0ZSBsb2FkZWRcIik7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIHRlcm1zVmlldzogbmV3IGtlbmRvLlZpZXcoJ2xveWFsdHlUZXJtcycsIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsOiB0ZXJtc1ZNLCBzaG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiVGVybXMgcGFnZSBsb2FkZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVybXNWTS5Mb2FkQ3VzdG9tZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGRhc2hib2FyZFZpZXc6IG5ldyBrZW5kby5WaWV3KCdkYXNoYm9hcmQnLCB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbDogZGFzaGJvYXJkVk0sXHJcbiAgICAgICAgICAgICAgICBzaG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKFwiRGFzaGJvYXJkIHBhZ2UgbG9hZGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhc2hib2FyZFZNLmluaXQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxud2luZG93LnNwYXZtID0gJC5leHRlbmQod2luZG93LnNwYXZtIHx8IHt9LFxyXG57XHJcbiAgICBsb2dnZXI6IGxvZ2dlcixcclxuICAgIFZNdmlld3M6IGxheW91dC52aWV3c1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbGF5b3V0OyIsIi8qanNoaW50IG5vZGU6IHRydWUqL1xyXG4vKmdsb2JhbCB3aW5kb3csICQsIGtlbmRvLCBsb2NhbFN0b3JhZ2UqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGxheW91dCA9IHJlcXVpcmUoJy4vbGF5b3V0JyksXHJcbiAgICBtYWluTGF5b3V0ID0gbGF5b3V0Lm1haW5MYXlvdXQsXHJcbiAgICB2aWV3cyA9IGxheW91dC52aWV3cyxcclxuXHJcbiAgICByb3V0ZXIgPSBuZXcga2VuZG8uUm91dGVyKHtcclxuICAgICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG1haW5MYXlvdXQucmVuZGVyKCcjbG95YWx0eS1hcHAnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvdXRlTWlzc2luZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByb3V0ZXIubmF2aWdhdGUoJy8nKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbi8vIHJvdXRlc1xyXG5yb3V0ZXIucm91dGUoJy8nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBtYWluTGF5b3V0LnNob3dJbignI2FwcC1jb250ZW50Jywgdmlld3MuZGFzaGJvYXJkVmlldyk7XHJcbn0pO1xyXG5cclxucm91dGVyLnJvdXRlKCcvbG95YWx0eVRlcm1zJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbWFpbkxheW91dC5zaG93SW4oJyNhcHAtY29udGVudCcsIHZpZXdzLnRlcm1zVmlldyk7XHJcbn0pO1xyXG5cclxucm91dGVyLnJvdXRlKCcvZGFzaGJvYXJkKC86bmV3Q3VzdG9tZXIpJywgZnVuY3Rpb24gKG5ld0N1c3RvbWVyKSB7XHJcbiAgICBpZiAodHlwZW9mIG5ld0N1c3RvbWVyICE9PSAndW5kZWZpbmVkJyAmJiBsb2NhbFN0b3JhZ2UubmV3Y3VzdG9tZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHZpZXdzLmRhc2hib2FyZFZpZXcubW9kZWwuc2V0KFwibmV3Q3VzdG9tZXJcIiwgdHJ1ZSk7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJuZXdjdXN0b21lclwiLCBcInRydWVcIik7XHJcbiAgICB9XHJcbiAgICBlbHNlIHZpZXdzLmRhc2hib2FyZFZpZXcubW9kZWwuc2V0KFwibmV3Q3VzdG9tZXJcIiwgZmFsc2UpO1xyXG4gICAgbWFpbkxheW91dC5zaG93SW4oJyNhcHAtY29udGVudCcsIHZpZXdzLmRhc2hib2FyZFZpZXcpO1xyXG59KTtcclxuXHJcbndpbmRvdy5zcGF2bSA9ICQuZXh0ZW5kKHdpbmRvdy5zcGF2bSB8fCB7fSxcclxue1xyXG4gICAgcm91dGVyOiByb3V0ZXJcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiLCIvKmpzaGludCBub2RlOiB0cnVlKi9cclxuLypnbG9iYWwgd2luZG93Ki9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGN1bHR1cmVIZWxwZXIgPSB7XHJcbiAgICBHZXRDdXJyZW50VUlDdWx0dXJlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGxvY2FsZSA9IFwiZW4tVVNcIjtcclxuICAgICAgICB2YXIgcmVnRXhwID0gbmV3IFJlZ0V4cChcIl5bYS16XXsyfSg/Oi1bQS1aXXsyfSk/JFwiKTtcclxuICAgICAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcbiAgICAgICAgdmFyIHBhcnRzID0gdXJsLnNwbGl0KCcvJyk7XHJcblxyXG4gICAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgICAgaWYgKHJlZ0V4cC50ZXN0KGl0ZW0pKSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhbGUgPSBpdGVtO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBsb2NhbGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGN1bHR1cmVIZWxwZXI7IiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBsb2dnZXIgPSByZXF1aXJlKCdqcy1sb2dnZXInKTtcclxuXHJcbmxvZ2dlci51c2VEZWZhdWx0cyh7XHJcbiAgICBkZWZhdWx0TGV2ZWw6IGxvZ2dlci5XQVJOLFxyXG4gICAgZm9ybWF0dGVyOiBmdW5jdGlvbiAobWVzc2FnZXMsIGNvbnRleHQpIHtcclxuICAgICAgICBtZXNzYWdlcy51bnNoaWZ0KG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsb2dnZXI7IiwiLypqc2hpbnQgbm9kZTogdHJ1ZSAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5cclxudmFyIGRvU2xpY2sgPSBmdW5jdGlvbiAocGFyYW0pIHtcclxuICAgIHBhcmFtLnNsaWNrKHtcclxuICAgICAgICAvL2RvdHM6IGZhbHNlLFxyXG4gICAgICAgIGluZmluaXRlOiB0cnVlLFxyXG4gICAgICAgIC8vc3BlZWQ6IDMwMCxcclxuICAgICAgICBzbGlkZXNUb1Nob3c6IDMsXHJcbiAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDMsXHJcbiAgICAgICAgcHJldkFycm93OiAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS1yb2xlPVwibm9uZVwiIGNsYXNzPVwic2xpY2stcHJldiBpY29uLWFycm93LWxlZnQtbG4tMlwiIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7XCI+PC9idXR0b24+JyxcclxuICAgICAgICBuZXh0QXJyb3c6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCIgY2xhc3M9XCJzbGljay1uZXh0IGljb24tYXJyb3ctcmlnaHQtbG4tMlwiIHN0eWxlPVwiZGlzcGxheTogYmxvY2s7XCI+PC9idXR0b24+JyxcclxuICAgICAgICByZXNwb25zaXZlOiBbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDEzMjAsXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMyxcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Njcm9sbDogM1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBicmVha3BvaW50OiAxMDAwLFxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGw6IDIsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGU6IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDY2MCxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZmluaXRlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICBdXHJcblxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGRvU2xpY2s7IiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcbi8qZ2xvYmFsIHdpbmRvdywgJCwga2VuZG8sIGxvY2F0aW9uLCB2aWV3TW9kZWxIZWxwZXJzKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBsb2dnZXIgPSByZXF1aXJlKCcuLi91dGlsL2xvZ2dlcicpLFxyXG4gICAgY3VsdHVyZUhlbHBlciA9IHJlcXVpcmUoJy4uL3V0aWwvY3VsdHVyZUhlbHBlcicpO1xyXG5cclxudmFyIHZpZXdNb2RlbCA9IHsgXHJcbiAgICBkYXRhTG9hZGVkOiBmYWxzZSxcclxuICAgIHNob3BwaW5nUmVhY2hlZDogZmFsc2UsXHJcbiAgICBhY3Rpdml0eVJlYWNoZWQ6IGZhbHNlLFxyXG4gICAgcHJvZHVjdEluZm9WaXNpYmxlOiBmYWxzZSxcclxuICAgIGhhc0Vycm9yOiBmYWxzZSxcclxuICAgIGN1c3RvbWVySWQ6ICcnLFxyXG4gICAgcmV3YXJkU2VsZWN0ZWQ6ICcnLFxyXG4gICAgdGVybXNWaXNpYmxlOiBmYWxzZSxcclxuICAgIHJlZ3Jlc2lvblBvaW50czogZmFsc2UsXHJcbiAgICByZWdyZXNpb25Qb2ludHMyOiBmYWxzZSxcclxuICAgIHRvZGF5OiBuZXcgRGF0ZSgpLFxyXG5cclxuXHJcbiAgICAgXHJcblxyXG4gICAgZGF0YVNvdXJjZSA6IG5ldyBrZW5kby5kYXRhLkRhdGFTb3VyY2Uoe1xyXG4gICAgICAgIHRyYW5zcG9ydDoge1xyXG4gICAgICAgICAgICByZWFkOiB7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2xveWFsdHkvYXBpL1Byb2dyYW0vR2V0Q3VzdG9tZXJEYXNoYm9hcmQvXCIgKyBjdWx0dXJlSGVscGVyLkdldEN1cnJlbnRVSUN1bHR1cmUoKSxcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiZ2V0XCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICB9LCAgXHJcbiAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHRvdGFsOiBcIlRvdGFsXCIsXHJcbiAgICAgICAgICAgIHBhcnNlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5EYXRhID09PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLkRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShyZXNwb25zZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IFtyZXNwb25zZV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KSxcclxuXHJcbiAgICBnb0hvbWU6IGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBcIi9DYXRhbG9nL0hvbWUvSW5kZXgvXCIgKyBjdWx0dXJlSGVscGVyLkdldEN1cnJlbnRVSUN1bHR1cmUoKTtcclxuICAgIH0sXHJcblxyXG4gICAgZG9CaW5kaW5nczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzO1xyXG4gICAgICAgIG1vZGVsLnNldChcImN1c3RvbWVySWRcIiwgZGF0YS5jdXN0b21lcklkKTtcclxuICAgICAgICBtb2RlbC5zZXQoXCJwcm9ncmFtSWRcIiwgZGF0YS5wcm9ncmFtSWQpO1xyXG4gICAgICAgIG1vZGVsLnNldChcImVuYWJsZVNob3BwaW5nUmV3YXJkc1wiLCBkYXRhLmVuYWJsZVNob3BwaW5nUmV3YXJkcyk7XHJcbiAgICAgICAgbW9kZWwuc2V0KFwiZW5hYmxlQWN0aXZpdHlSZXdhcmRzXCIsIGRhdGEuZW5hYmxlQWN0aXZpdHlSZXdhcmRzKTtcclxuICAgICAgICBtb2RlbC5zZXQoXCJTdWJEYXRlXCIsIGRhdGEuY3VzdG9tZXJTdGFydERhdGUpO1xyXG5cclxuICAgICAgICB2YXIgb25lRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMDtcclxuXHJcbiAgICAgICAgdmFyIHNlY29uZERhdGUgPSBuZXcgRGF0ZShtb2RlbC5TdWJEYXRlKTtcclxuICAgICAgICB2YXIgZmlyc3REYXRlID0gbW9kZWwudG9kYXk7XHJcbiAgICAgICAgLy92YXIgZGlmZkRheXMgPSB0d28gLSBvbmU7XHJcbiAgICAgICAgdmFyIGRpZmZEYXlzID0gTWF0aC5yb3VuZChNYXRoLmFicygoZmlyc3REYXRlLmdldFRpbWUoKSAtIHNlY29uZERhdGUuZ2V0VGltZSgpKSAvIChvbmVEYXkpKSk7XHJcbiAgICAgICAgaWYgKGRpZmZEYXlzID09PSAwKSB7XHJcbiAgICAgICAgICAgIG1vZGVsLnNldChcInJlZ3Jlc2lvblBvaW50c1wiLCB0cnVlKTtcclxuICAgICAgICAgICAgbW9kZWwuc2V0KFwicmVncmVzaW9uUG9pbnRzMlwiLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaWZmRGF5cyA8IDUpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuc2hvcHBpbmdQb2ludHMucHJvZHVjdFBvaW50cyA+IDApIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldChcInJlZ3Jlc2lvblBvaW50c1wiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXCJyZWdyZXNpb25Qb2ludHMyXCIsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuXHJcbiAgICAgICAgLy9TaG9wIGluZm9cclxuICAgICAgICB2YXIgeDtcclxuICAgICAgICB2YXIgc2hvcHBpbmdQb2ludEluZm8gPSBkYXRhLnNob3BwaW5nUG9pbnRzO1xyXG4gICAgICAgIGlmIChkYXRhLmVuYWJsZVNob3BwaW5nUmV3YXJkcyAmJiBzaG9wcGluZ1BvaW50SW5mbykge1xyXG4gICAgICAgICAgICBpZiAoc2hvcHBpbmdQb2ludEluZm8ucHJvZHVjdE1heFRpZXIgPT0gMylcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldChcImlzQWxsU2hvcENvbXBsZXRlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgbW9kZWwuc2V0KFwic2hvcHBpbmdQb2ludHNcIiwgc2hvcHBpbmdQb2ludEluZm8ucHJvZHVjdFBvaW50cyk7XHJcbiAgICAgICAgICAgIG1vZGVsLnNldChcInNob3BwaW5nUG9pbnRzTmV4dExldmVsXCIsIHNob3BwaW5nUG9pbnRJbmZvLnByb2R1Y3RQb2ludHNOZWVkZWROZXh0TGV2ZWwpO1xyXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgc2hvcHBpbmdQb2ludEluZm8uY29uc2VjdXRpdmVNb250aHNBY2hpZXZlZDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXCJzaG9wVGllclwiICsgeCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHNob3BwaW5nUG9pbnRJbmZvLnJld2FyZHNHcm91cHMpXHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXRUaWVyUmV3YXJkcyhzaG9wcGluZ1BvaW50SW5mbywgXCJTaG9wXCIpO1xyXG4gICAgICAgICAgICBpZiAoKChzaG9wcGluZ1BvaW50SW5mby5jb25zZWN1dGl2ZU1vbnRoc0FjaGlldmVkIC0gMSkgIT0gc2hvcHBpbmdQb2ludEluZm8ucHJvZHVjdE1heFRpZXIpICYmIHNob3BwaW5nUG9pbnRJbmZvLnByb2R1Y3RNYXhUaWVyID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0KFwibm90Q29uc2VjdXRpdmVcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgc2hvcHBpbmdQb2ludEluZm8ucHJvZHVjdE1heFRpZXI7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnNldChcIm5vdENvbnNlY3V0aXZlVGllclwiICsgKHggKyAxKSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtb2RlbC5zZXQoXCJzaW5nbGVBY3Rpdml0eVwiLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vQWN0aXZpdCBpbmZvXHJcbiAgICAgICAgdmFyIGFjdGl2aXR5UG9pbnRJbmZvID0gZGF0YS5hY3Rpdml0eVBvaW50cztcclxuICAgICAgICBpZiAoZGF0YS5lbmFibGVBY3Rpdml0eVJld2FyZHMgJiYgYWN0aXZpdHlQb2ludEluZm8pIHtcclxuICAgICAgICAgICAgaWYgKGFjdGl2aXR5UG9pbnRJbmZvLmFjdGl2aXR5Q3VycmVudFRpZXIgPT0gNClcclxuICAgICAgICAgICAgICAgIG1vZGVsLnNldChcImlzQWxsQWN0aXZpdHlDb21wbGV0ZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIG1vZGVsLnNldChcImFjdGl2aXR5UG9pbnRzXCIsIGFjdGl2aXR5UG9pbnRJbmZvLmFjdGl2aXR5UG9pbnRzKTtcclxuICAgICAgICAgICAgbW9kZWwuc2V0KFwiYWN0aXZpdHlQb2ludHNOZXh0TGV2ZWxcIiwgYWN0aXZpdHlQb2ludEluZm8uYWN0aXZpdHlQb2ludHNOZWVkZWROZXh0TGV2ZWwpO1xyXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgYWN0aXZpdHlQb2ludEluZm8uYWN0aXZpdHlDdXJyZW50VGllcjsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXCJhY3Rpdml0eVRpZXJcIiArICh4ICsgMSksIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhY3Rpdml0eVBvaW50SW5mby5yZXdhcmRzR3JvdXBzKVxyXG4gICAgICAgICAgICAgICAgbW9kZWwuc2V0VGllclJld2FyZHMoYWN0aXZpdHlQb2ludEluZm8sIFwiQWN0aXZpdHlcIik7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IFwiL0xveWFsdHkvYXBpL1Byb2dyYW0vR2V0QWN0aXZpdGllc1Byb2dyYW0vXCIgKyBjdWx0dXJlSGVscGVyLkdldEN1cnJlbnRVSUN1bHR1cmUoKSxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtSWQ6IG1vZGVsLmdldChcInByb2dyYW1JZFwiKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChhY3REYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdERhdGEgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwuc2V0KFwicGVuZGluZ0FjdGl2aXRpZXNcIiwgYWN0RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm90aWZ5IHRoZSBkYXRhIHNvdXJjZSB0aGF0IHRoZSByZXF1ZXN0IGZhaWxlZFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtb2RlbC5zZXQoXCJzaW5nbGVTaG9wcGluZ1wiLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZGF0YS5hY3RpdmVQcm9ncmFtIHx8ICghZGF0YS5lbmFibGVTaG9wcGluZ1Jld2FyZHMgJiYgIWRhdGEuZW5hYmxlQWN0aXZpdHlSZXdhcmRzKSkge1xyXG4gICAgICAgICAgICBtb2RlbC5zZXQoXCJoYXNFcnJvclwiLCB0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBtb2RlbC5zZXQoXCJkYXRhTG9hZGVkXCIsIHRydWUpO1xyXG5cclxuICAgICAgICBpZiAobW9kZWwuZ2V0KFwibmV3Q3VzdG9tZXJcIikpXHJcbiAgICAgICAgICAgIGlmIChtb2RlbC5nZXQoXCJmaXJzdFRpbWVNb2RhbFwiKSkgbW9kZWwuZ2V0KFwiZmlyc3RUaW1lTW9kYWxcIikub3BlbigpLmNlbnRlcigpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBpZiAobW9kZWwuZ2V0KFwiZmlyc3RUaW1lTW9kYWxcIikpIG1vZGVsLmdldChcImZpcnN0VGltZU1vZGFsXCIpLmNsb3NlKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbW9kZWwgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuZGF0YVNvdXJjZS5mZXRjaChmdW5jdGlvbiAoKSB7IFxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuZGF0YSgpWzBdO1xyXG4gICAgICAgICAgICBtb2RlbC5kb0JpbmRpbmdzKGRhdGEpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbG9zZUZpcnN0VGltZU1vZGFsOiBmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5nZXQoXCJmaXJzdFRpbWVNb2RhbFwiKS5jbG9zZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjbG9zZUFjdGl2aXR5UmV3YXJkTW9kYWw6IGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB0aGlzLmdldChcIkFjdGl2aXR5UmV3YXJkTW9kYWxcIikuY2xvc2UoKTtcclxuICAgIH0sXHJcblxyXG4gICAgY2xvc2VTZWxlY3RSZXdhcmRGYWlsZWRNb2RhbDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5nZXQoXCJTZWxlY3RSZXdhcmRGYWlsZWRNb2RhbFwiKS5jbG9zZSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzZXRUaWVyUmV3YXJkczogZnVuY3Rpb24gKHNvdXJjZSwgdHlwZSkge1xyXG4gICAgICAgIHZhciBjYW5SZWRlZW0gPSBzb3VyY2UuYWJsZVRvUmVkZWVtICE9PSB1bmRlZmluZWQgPyBzb3VyY2UuYWJsZVRvUmVkZWVtIDogdHJ1ZTtcclxuICAgICAgICB2YXIgcmV3YXJkc0dyb3VwID0gc291cmNlLnJld2FyZHNHcm91cHM7XHJcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCByZXdhcmRzR3JvdXAubGVuZ3RoOyB4KyspIHtcclxuICAgICAgICAgICAgdGhpcy5zZXQoXCJyZWRlZW1lZFwiICsgdHlwZSArIFwiVGllclwiICsgcmV3YXJkc0dyb3VwW3hdLnRpZXIsIHJld2FyZHNHcm91cFt4XS5yZWRlZW1lZCk7XHJcbiAgICAgICAgICAgIHZhciBjdXJyZW50VGllciA9ICh0eXBlID09IFwiU2hvcFwiID8gc291cmNlLnByb2R1Y3RNYXhUaWVyIDogc291cmNlLmFjdGl2aXR5Q3VycmVudFRpZXIpO1xyXG4gICAgICAgICAgICBpZiAocmV3YXJkc0dyb3VwW3hdLnRpZXIgPD0gY3VycmVudFRpZXIgICYmICFyZXdhcmRzR3JvdXBbeF0ucmVkZWVtZWQgJiYgY2FuUmVkZWVtKSB7XHJcbiAgICAgICAgICAgICAgICAvL1doZW4gdGllciBoYXMgYmVlbiByZWFjaGVkIGJ1dCBub3Qgc2VsZWN0ZWRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KFwic2VsZWN0UmVhY2hlZFwiICsgdHlwZSArIFwiVGllclwiICsgcmV3YXJkc0dyb3VwW3hdLnRpZXIsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHR5cGUgKyBcIlJld2FyZHNUaWVyXCIgKyByZXdhcmRzR3JvdXBbeF0udGllciwgcmV3YXJkc0dyb3VwW3hdKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNob3dEYXRhOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHZhciBpc1JlZGVlbWVkID0gdGhpcy5nZXQoXCJyZWRlZW1lZFwiICsgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoXCJ0aWVyXCIpKTtcclxuICAgICAgICBpZiAoaXNSZWRlZW1lZClcclxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLnRvZ2dsZUNsYXNzKFwiY2xvc2VkXCIpO1xyXG4gICAgfSxcclxuXHJcbiAgICBvblNlbGVjdDogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAvL2lmIG5vIGVsZW1lbnQgaGFzIGJlZW4gc2VsZWN0ZWRcclxuICAgICAgICBpZiAoZS50YXJnZXQgPT0gZS5jdXJyZW50VGFyZ2V0KSByZXR1cm4gdHJ1ZTsgICAgICAgIFxyXG5cclxuICAgICAgICAvL2dldCBlbGVtZW50XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBcIlwiO1xyXG4gICAgICAgIHZhciBjaGlsZHMgPSAkKGUuY3VycmVudFRhcmdldCkuY2hpbGRyZW4oKTtcclxuICAgICAgICB2YXIgYWN0dWFsID0gZS50YXJnZXQ7ICAgICAgIFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgaWYgKCQuaW5BcnJheShhY3R1YWwsIGNoaWxkcykgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGFjdHVhbDtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgYWN0dWFsID0gYWN0dWFsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgfSB3aGlsZSAoZWxlbWVudCA9PT0gXCJcIik7XHJcblxyXG4gICAgICAgIC8vaWYgYWN0aXZpdHkgcmV3YXJkIHRvIGJlIFJlZGVlbWVkXHJcbiAgICAgICAgaWYgKCQoZS5jdXJyZW50VGFyZ2V0KS5oYXNDbGFzcyhcInRvUmVkZWVtZWRcIikgJiYgJChcIltkYXRhLWNhdGVnb3J5PSdBY3Rpdml0eSddXCIsIGVsZW1lbnQpLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAvL05vIGVsZW1lbnQgaGFzIGJlZW4gc2VsZWN0ZWRcclxuICAgICAgICAgICAgaWYgKCQoXCIuc2VsZWN0ZWRcIiwgZS5jdXJyZW50VGFyZ2V0KS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KFwicmV3YXJkU2VsZWN0ZWRcIiwgZWxlbWVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldChcIkFjdGl2aXR5UmV3YXJkTW9kYWxcIikub3BlbigpLmNlbnRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9lbGVtZW50IGFscmVhZHkgc2VsZWN0ZWQsIGRlLXNlbGVjdFxyXG4gICAgICAgIGlmICgkKGVsZW1lbnQpLmhhc0NsYXNzKFwic2VsZWN0ZWRcIikpIHtcclxuICAgICAgICAgICAgJChlbGVtZW50KS5yZW1vdmVDbGFzcygpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vZXZlcnl0aGluZyBjb29sLCBzZWxlY3QgcmV3YXJkXHJcbiAgICAgICAgY2hpbGRzLnJlbW92ZUNsYXNzKCk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RSZXdhcmQoZWxlbWVudCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNlbGVjdFJld2FyZDogZnVuY3Rpb24oZWxlbWVudCl7ICAgICAgICBcclxuICAgICAgICB2YXIgdGllciA9ICQoZWxlbWVudCkuY2xvc2VzdChcIltkYXRhLXRpZXJdXCIpLmRhdGEoXCJ0aWVyXCIpO1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXM7XHJcbiAgICAgICAgbW9kZWwuc2V0KFwibG9hZFNlbGVjdFwiICsgdGllciwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHZhciBqc29uUmVzcG9uc2UgPSB7XHJcbiAgICAgICAgICAgIFwiQ3VzdG9tZXJJZFwiOiB0aGlzLmdldCgnY3VzdG9tZXJJZCcpLFxyXG4gICAgICAgICAgICBcIlRpZXJcIjogJChcImFcIiwgZWxlbWVudCkuZmlyc3QoKS5kYXRhKFwidGllclwiKSxcclxuICAgICAgICAgICAgXCJDYXRlZ29yeUNvZGVcIjogJChcImFcIiwgZWxlbWVudCkuZmlyc3QoKS5kYXRhKFwiY2F0ZWdvcnlcIiksXHJcbiAgICAgICAgICAgIFwiU2t1XCI6ICQoXCJhXCIsIGVsZW1lbnQpLmZpcnN0KCkuZGF0YShcInNrdVwiKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgIFxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogXCIvbG95YWx0eS9hcGkvUHJvZ3JhbS9TYXZlV2lzaGl0ZW0vXCIgKyBjdWx0dXJlSGVscGVyLkdldEN1cnJlbnRVSUN1bHR1cmUoKSxcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIsXHJcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGpzb25SZXNwb25zZSksXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmlzU3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5nZXQoXCJTZWxlY3RSZXdhcmRGYWlsZWRNb2RhbFwiKS5vcGVuKCkuY2VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuZGF0YVNvdXJjZS5yZWFkKCkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gbW9kZWwuZGF0YVNvdXJjZS5kYXRhKClbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLmRvQmluZGluZ3MoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RlbC5zZXQoXCJsb2FkU2VsZWN0XCIgKyB0aWVyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3RpZnkgdGhlIGRhdGEgc291cmNlIHRoYXQgdGhlIHJlcXVlc3QgZmFpbGVkXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlZGVlbUFjdGl2aXR5OiBmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5nZXQoXCJBY3Rpdml0eVJld2FyZE1vZGFsXCIpLmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RSZXdhcmQodGhpcy5nZXQoXCJyZXdhcmRTZWxlY3RlZFwiKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFNob3BwaW5nUG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNwID0gdGhpcy5nZXQoXCJzaG9wcGluZ1BvaW50c1wiKTtcclxuICAgICAgICBpZiAoc3AgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFwiICBcIjtcclxuICAgICAgICBpZiAoIWlzTmFOKHNwKSAmJiBzcCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3Ioc3ApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0QWN0aXZpdHlQb2ludHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgYXAgPSB0aGlzLmdldChcImFjdGl2aXR5UG9pbnRzXCIpO1xyXG4gICAgICAgIGlmIChhcCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gXCIgIFwiO1xyXG4gICAgICAgIGlmICghaXNOYU4oYXApICYmIGFwID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRTaG9wUG9pbnRzTmV4dExldmVsOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNwID0gdGhpcy5nZXQoXCJzaG9wcGluZ1BvaW50c05leHRMZXZlbFwiKTtcclxuICAgICAgICBpZihzcCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gXCIgIFwiO1xyXG4gICAgICAgIGlmICghaXNOYU4oc3ApICYmIHNwID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihzcCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRBY3Rpdml0eVBvaW50c05leHRMZXZlbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBhcCA9IHRoaXMuZ2V0KFwiYWN0aXZpdHlQb2ludHNOZXh0TGV2ZWxcIik7XHJcbiAgICAgICAgaWYgKGFwID09PSB1bmRlZmluZWQpIHJldHVybiBcIiAgXCI7XHJcbiAgICAgICAgaWYgKCFpc05hTihhcCkgJiYgYXAgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGhhc1Nob3BwaW5nUG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmdldChcImRhdGFMb2FkZWRcIikgfHwgdGhpcy5nZXQoXCJzaG9wcGluZ1JlYWNoZWRcIikgfHwgdGhpcy5nZXQoXCJpc0FsbFNob3BDb21wbGV0ZWRcIikpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgaXNTaG9wcGluZ1JlYWNoZWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZ2V0KFwiZGF0YUxvYWRlZFwiKSB8fCB0aGlzLmdldChcImlzQWxsU2hvcENvbXBsZXRlZFwiKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldChcInNob3BwaW5nUmVhY2hlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0KFwic2hvcHBpbmdQb2ludHNOZXh0TGV2ZWxcIikgPD0gMCAmJiAhdGhpcy5nZXQoXCJub3RDb25zZWN1dGl2ZVwiKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldChcInNob3BwaW5nUmVhY2hlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0KFwic2hvcHBpbmdSZWFjaGVkXCIsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9LFxyXG5cclxuICAgIGhhc0FjdGl2aXR5UG9pbnRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmdldChcImRhdGFMb2FkZWRcIikgfHwgdGhpcy5nZXQoXCJhY3Rpdml0eVJlYWNoZWRcIikgfHwgdGhpcy5nZXQoXCJpc0FsbEFjdGl2aXR5Q29tcGxldGVkXCIpKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvZ2dsZVByb2R1Y3RJbmZvOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgY2wgPSAkKFwiaVwiLCBlLmN1cnJlbnRUYXJnZXQpLmF0dHIoXCJjbGFzc1wiKTtcclxuICAgICAgICBjbCA9IGNsLmluY2x1ZGVzKFwiMjlcIikgPyBjbC5yZXBsYWNlKFwiMjlcIiwgXCIzMFwiKSA6IGNsLnJlcGxhY2UoXCIzMFwiLCBcIjI5XCIpO1xyXG4gICAgICAgICQoXCJpXCIsIGUuY3VycmVudFRhcmdldCkucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcyhjbCk7XHJcbiAgICAgICAgdmFyIGJvb2wgPSB0aGlzLmdldChcInByb2R1Y3RJbmZvVmlzaWJsZVwiKTtcclxuICAgICAgICB0aGlzLnNldChcInByb2R1Y3RJbmZvVmlzaWJsZVwiLCAhYm9vbCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRvZ2dsZVRlcm1zOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB2YXIgY2wgPSAkKFwiaVwiLCBlLmN1cnJlbnRUYXJnZXQpLmF0dHIoXCJjbGFzc1wiKTtcclxuICAgICAgICBjbCA9IGNsLmluY2x1ZGVzKFwidXBcIikgPyBjbC5yZXBsYWNlKFwidXBcIiwgXCJkb3duXCIpIDogY2wucmVwbGFjZShcImRvd25cIiwgXCJ1cFwiKTtcclxuICAgICAgICAkKFwiaVwiLCBlLmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoY2wpO1xyXG4gICAgICAgIHZhciBib29sID0gdGhpcy5nZXQoXCJ0ZXJtc1Zpc2libGVcIik7XHJcbiAgICAgICAgdGhpcy5zZXQoXCJ0ZXJtc1Zpc2libGVcIiwgIWJvb2wpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzY3JvbGxUbzogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKFwic2Nyb2xsdG9cIik7XHJcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICBzY3JvbGxUb3A6ICQoXCIuXCIgKyBlbGVtZW50KS5vZmZzZXQoKS50b3AgLSA1MFxyXG4gICAgICAgIH0sIDkwMCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGlzTG9hZGluZzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAoIXRoaXMuZ2V0KFwiZGF0YUxvYWRlZFwiKSAmJiAhdGhpcy5nZXQoXCJoYXNFcnJvclwiKSk7XHJcbiAgICB9XHJcblxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB2aWV3TW9kZWxIZWxwZXJzLm12dm1VdGlsLmFzT2JzZXJ2YWJsZSh2aWV3TW9kZWwpOyIsIi8qanNoaW50IG5vZGU6IHRydWUqL1xyXG4vKmdsb2JhbCB3aW5kb3csICQsIGtlbmRvKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxudmFyIGRvU2xpY2sgPSByZXF1aXJlKCcuLi91dGlsL3NsaWNrJyksXHJcbiAgICBjdWx0dXJlSGVscGVyID0gcmVxdWlyZSgnLi4vdXRpbC9jdWx0dXJlSGVscGVyJyk7XHJcblxyXG52YXIgaW5zdGFuY2UgPSBrZW5kby5vYnNlcnZhYmxlKHtcclxuICAgIHJld2FyZHNTb3VyY2U6IG5ldyBrZW5kby5kYXRhLkRhdGFTb3VyY2Uoe1xyXG4gICAgICAgIHRyYW5zcG9ydDoge1xyXG4gICAgICAgICAgICByZWFkOiB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvbG95YWx0eS9hcGkvUHJvZ3JhbS9HZXRIaWdoVmFsdWVSZXdhcmRzLycgKyBjdWx0dXJlSGVscGVyLkdldEN1cnJlbnRVSUN1bHR1cmUoKSxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pLFxyXG5cclxuICAgIHJ1blNsaWRlcjogZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICAgIHZhciBtb2RlbCA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5zZXQoXCJlbGVtZW50XCIsIG9iaik7XHJcbiAgICAgICAgdGhpcy5yZXdhcmRzU291cmNlLmJpbmQoXCJjaGFuZ2VcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBkb1NsaWNrKG1vZGVsLmdldChcImVsZW1lbnRcIikpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaW5zdGFuY2U7IiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcbi8qZ2xvYmFsIHdpbmRvdywgJCwga2VuZG8sIGxvY2F0aW9uKi9cclxuXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBsb2dnZXIgPSByZXF1aXJlKCcuLi91dGlsL2xvZ2dlcicpLFxyXG4gICAgY3VsdHVyZUhlbHBlciA9IHJlcXVpcmUoJy4uL3V0aWwvY3VsdHVyZUhlbHBlcicpLFxyXG4gICAgcGhvbmVUeXBlTWFwID0ge1xyXG4gICAgICAgIFwiMVwiOiBcIkhvbWVcIixcclxuICAgICAgICBcIjJcIjogXCJNb2JpbGVcIixcclxuICAgICAgICBcIjNcIjogXCJXb3JrXCJcclxuICAgIH0sXHJcblxyXG4gICAgaW5zdGFuY2UgPSBrZW5kby5vYnNlcnZhYmxlKHtcclxuICAgICAgICBmaXJzdE5hbWU6ICcnLFxyXG4gICAgICAgIGxhc3ROYW1lOiAnJyxcclxuICAgICAgICBwaG9uZToge1xyXG4gICAgICAgICAgICBudW1iZXI6ICcnLFxyXG4gICAgICAgICAgICB0eXBlOiAnTW9iaWxlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgICBoYXNBY2NlcHRlZDogZmFsc2UsXHJcbiAgICAgICAgbmV4dERpc2FibGVkOiBmYWxzZSxcclxuXHJcbiAgICAgICAgTG9hZEN1c3RvbWVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvbG95YWx0eS9hcGkvUHJvZ3JhbS9HZXRDdXN0b21lci8nICsgY3VsdHVyZUhlbHBlci5HZXRDdXJyZW50VUlDdWx0dXJlKCksXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnanNvbicsXHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXQoJ2ZpcnN0TmFtZScsIHJlc3BvbnNlLmZpcnN0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXQoJ2xhc3ROYW1lJywgcmVzcG9uc2UubGFzdE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2V0KCdwaG9uZS5udW1iZXInLCByZXNwb25zZS5waG9uZU51bWJlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXQoJ3Bob25lLnR5cGUnLCBwaG9uZVR5cGVNYXBbcmVzcG9uc2UucGhvbmVUeXBlXSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXhjZXB0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIEFjdGl2YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICAgICAgdmFyIHZhbGlkYXRvciA9ICQoJy5obC1mb3JtJykua2VuZG9WYWxpZGF0b3IoKS5kYXRhKCdrZW5kb1ZhbGlkYXRvcicpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHZhbGlkYXRvci52YWxpZGF0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGF0LnNldChcImlzTG9hZGluZ1wiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoYXQuc2V0KFwibmV4dERpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdmFyIF9jdXN0RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnRmlyc3ROYW1lJzogdGhhdC5maXJzdE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0xhc3ROYW1lJzogdGhhdC5sYXN0TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAnUGhvbmUnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdOdW1iZXInOiB0aGF0LnBob25lLm51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ1R5cGUnOiB0aGF0LnBob25lLnR5cGVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2xveWFsdHkvYXBpL1Byb2dyYW0vQWN0aXZhdGVQcm9ncmFtLycgKyBjdWx0dXJlSGVscGVyLkdldEN1cnJlbnRVSUN1bHR1cmUoKSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBfY3VzdERhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaXNTdWNjZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNldChcImlzTG9hZGluZ1wiLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJyMvZGFzaGJvYXJkL2p1c3RFbnJvbGxlZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3JNZXNzYWdlID09PSBcIkxPQ0tfUEVSSU9EXCIgfHwgcmVzcG9uc2UuZXJyb3JNZXNzYWdlID09PSBcIkN1c3RvbWVyIGFscmVhZHkgZW5yb2xsZWQuXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaG93IGVycm9yIGFib3V0IGxvY2sgcGVyaW9kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXQoXCJsb2NrQWN0aXZlXCIsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2V0KFwiaXNMb2FkaW5nXCIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihyZXNwb25zZS5lcnJvck1lc3NhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGV4Y2VwdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBFbmFibGVBY3RpdmU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdoYXNBY2NlcHRlZCcpICYmIHRoaXMuZ2V0KCdmaXJzdE5hbWUnKSAhPT0gJycgJiYgdGhpcy5nZXQoJ2xhc3ROYW1lJykgIT09ICcnICYmIHRoaXMuZ2V0KCdwaG9uZS5udW1iZXInKSAhPT0gJyc7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgQ2xvc2VMb2NrTWVzc2FnZU1vZGFsOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0KFwibG9ja01lc3NhZ2VNb2RhbFwiKS5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBpbnN0YW5jZTsiXX0=
