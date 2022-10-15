(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint node: true*/

'use strict';

var logger = require('./util/logger'),
    router = require('./core/router'),

    start = function () {
        logger.debug("app - start");
        router.start();
    };

start();
},{"./core/router":3,"./util/logger":4}],2:[function(require,module,exports){
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
                    logger.debug("home template loaded");
                    window.makeSlick();
                }
            }),
            termsView: new kendo.View('loyaltyTerms', {
                model: termsVM,
                show: function () {
                    logger.debug("Terms page loaded");
                    termsVM.LoadCustomer();
                }
            }),
            dashboardView: new kendo.View('dashboard', {
                model: dashboardVM,
                show: function () {
                    logger.debug("Dashboard page loaded");
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
},{"../util/logger":4,"../viewmodels/dashboardVM":5,"../viewmodels/homeVM":6,"../viewmodels/termsVM":7}],3:[function(require,module,exports){
/*jshint node: true*/
/*global window, $, kendo*/

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
    mainLayout.showIn('#app-content', views.homeView);
});

router.route('/loyaltyTerms', function () {
    mainLayout.showIn('#app-content', views.termsView);
});

router.route('/dashboard', function () {
    mainLayout.showIn('#app-content', views.dashboardView);
});

window.spavm = $.extend(window.spavm || {},
{
    router: router
});

module.exports = router;
},{"./layout":2}],4:[function(require,module,exports){
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
},{"js-logger":8}],5:[function(require,module,exports){
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
},{"../util/logger":4}],6:[function(require,module,exports){
/*jshint node: true*/
/*global window, $, kendo*/

'use strict';

var instance = kendo.observable({
    rewardsSource: new kendo.data.DataSource({
        transport: {
            read: {
                url: '/api/Program/GetHighValueRewards',
                async: false,
                dataType: 'json'
            }
        }
    })
});

module.exports = instance;
},{}],7:[function(require,module,exports){
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
},{"../util/logger":4}],8:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=app.bundle.js.map
