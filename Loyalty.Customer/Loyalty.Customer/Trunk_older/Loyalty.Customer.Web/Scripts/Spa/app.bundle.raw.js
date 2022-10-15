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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJTY3JpcHRzL1NwYS9hcHAuanMiLCJTY3JpcHRzL1NwYS9jb3JlL2xheW91dC5qcyIsIlNjcmlwdHMvU3BhL2NvcmUvcm91dGVyLmpzIiwiU2NyaXB0cy9TcGEvdXRpbC9sb2dnZXIuanMiLCJTY3JpcHRzL1NwYS92aWV3bW9kZWxzL2Rhc2hib2FyZFZNLmpzIiwiU2NyaXB0cy9TcGEvdmlld21vZGVscy9ob21lVk0uanMiLCJTY3JpcHRzL1NwYS92aWV3bW9kZWxzL3Rlcm1zVk0uanMiLCJub2RlX21vZHVsZXMvanMtbG9nZ2VyL3NyYy9sb2dnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbG9nZ2VyID0gcmVxdWlyZSgnLi91dGlsL2xvZ2dlcicpLFxyXG4gICAgcm91dGVyID0gcmVxdWlyZSgnLi9jb3JlL3JvdXRlcicpLFxyXG5cclxuICAgIHN0YXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcImFwcCAtIHN0YXJ0XCIpO1xyXG4gICAgICAgIHJvdXRlci5zdGFydCgpO1xyXG4gICAgfTtcclxuXHJcbnN0YXJ0KCk7IiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcbi8qZ2xvYmFsIHdpbmRvdywgJCwga2VuZG8qL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGxvZ2dlciA9IHJlcXVpcmUoJy4uL3V0aWwvbG9nZ2VyJyksXHJcbiAgICBob21lVk0gPSByZXF1aXJlKCcuLi92aWV3bW9kZWxzL2hvbWVWTScpLFxyXG4gICAgdGVybXNWTSA9IHJlcXVpcmUoJy4uL3ZpZXdtb2RlbHMvdGVybXNWTScpLFxyXG4gICAgZGFzaGJvYXJkVk0gPSByZXF1aXJlKCcuLi92aWV3bW9kZWxzL2Rhc2hib2FyZFZNJyksXHJcblxyXG4gICAgbGF5b3V0ID0ge1xyXG4gICAgICAgIC8vIGtlbmRvIGxheW91dCB0byBhZGQgdGhlIHZpZXdzXHJcbiAgICAgICAgbWFpbkxheW91dDogbmV3IGtlbmRvLkxheW91dCgnbGF5b3V0LXRwbCcpLFxyXG5cclxuICAgICAgICAvLyB2aWV3cyB0ZW1wbGF0ZXNcclxuICAgICAgICB2aWV3czoge1xyXG4gICAgICAgICAgICBob21lVmlldzogbmV3IGtlbmRvLlZpZXcoJ2N1c3RIb21lJywge1xyXG4gICAgICAgICAgICAgICAgbW9kZWw6IGhvbWVWTSxcclxuICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoXCJob21lIHRlbXBsYXRlIGxvYWRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWFrZVNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICB0ZXJtc1ZpZXc6IG5ldyBrZW5kby5WaWV3KCdsb3lhbHR5VGVybXMnLCB7XHJcbiAgICAgICAgICAgICAgICBtb2RlbDogdGVybXNWTSxcclxuICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoXCJUZXJtcyBwYWdlIGxvYWRlZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB0ZXJtc1ZNLkxvYWRDdXN0b21lcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgZGFzaGJvYXJkVmlldzogbmV3IGtlbmRvLlZpZXcoJ2Rhc2hib2FyZCcsIHtcclxuICAgICAgICAgICAgICAgIG1vZGVsOiBkYXNoYm9hcmRWTSxcclxuICAgICAgICAgICAgICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZGVidWcoXCJEYXNoYm9hcmQgcGFnZSBsb2FkZWRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbndpbmRvdy5zcGF2bSA9ICQuZXh0ZW5kKHdpbmRvdy5zcGF2bSB8fCB7fSxcclxue1xyXG4gICAgbG9nZ2VyOiBsb2dnZXIsXHJcbiAgICBWTXZpZXdzOiBsYXlvdXQudmlld3NcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxheW91dDsiLCIvKmpzaGludCBub2RlOiB0cnVlKi9cclxuLypnbG9iYWwgd2luZG93LCAkLCBrZW5kbyovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbGF5b3V0ID0gcmVxdWlyZSgnLi9sYXlvdXQnKSxcclxuICAgIG1haW5MYXlvdXQgPSBsYXlvdXQubWFpbkxheW91dCxcclxuICAgIHZpZXdzID0gbGF5b3V0LnZpZXdzLFxyXG5cclxuICAgIHJvdXRlciA9IG5ldyBrZW5kby5Sb3V0ZXIoe1xyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbWFpbkxheW91dC5yZW5kZXIoJyNsb3lhbHR5LWFwcCcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm91dGVNaXNzaW5nOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJvdXRlci5uYXZpZ2F0ZSgnLycpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuLy8gcm91dGVzXHJcbnJvdXRlci5yb3V0ZSgnLycsIGZ1bmN0aW9uICgpIHtcclxuICAgIG1haW5MYXlvdXQuc2hvd0luKCcjYXBwLWNvbnRlbnQnLCB2aWV3cy5ob21lVmlldyk7XHJcbn0pO1xyXG5cclxucm91dGVyLnJvdXRlKCcvbG95YWx0eVRlcm1zJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbWFpbkxheW91dC5zaG93SW4oJyNhcHAtY29udGVudCcsIHZpZXdzLnRlcm1zVmlldyk7XHJcbn0pO1xyXG5cclxucm91dGVyLnJvdXRlKCcvZGFzaGJvYXJkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgbWFpbkxheW91dC5zaG93SW4oJyNhcHAtY29udGVudCcsIHZpZXdzLmRhc2hib2FyZFZpZXcpO1xyXG59KTtcclxuXHJcbndpbmRvdy5zcGF2bSA9ICQuZXh0ZW5kKHdpbmRvdy5zcGF2bSB8fCB7fSxcclxue1xyXG4gICAgcm91dGVyOiByb3V0ZXJcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiLCIvKmpzaGludCBub2RlOiB0cnVlKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIGxvZ2dlciA9IHJlcXVpcmUoJ2pzLWxvZ2dlcicpO1xyXG5cclxubG9nZ2VyLnVzZURlZmF1bHRzKHtcclxuICAgIGRlZmF1bHRMZXZlbDogbG9nZ2VyLldBUk4sXHJcbiAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uIChtZXNzYWdlcywgY29udGV4dCkge1xyXG4gICAgICAgIG1lc3NhZ2VzLnVuc2hpZnQobmV3IERhdGUoKS50b1VUQ1N0cmluZygpKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2dlcjsiLCIvKmpzaGludCBub2RlOiB0cnVlKi9cclxuLypnbG9iYWwgd2luZG93LCAkLCBrZW5kbywgbG9jYXRpb24sIHZpZXdNb2RlbEhlbHBlcnMqL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGxvZ2dlciA9IHJlcXVpcmUoJy4uL3V0aWwvbG9nZ2VyJyk7XHJcblxyXG52YXIgdmlld01vZGVsID0ge1xyXG4gICAgeCA6IDAsXHJcblxyXG4gICAgZGF0YVNvdXJjZSA6IG5ldyBrZW5kby5kYXRhLkRhdGFTb3VyY2Uoe1xyXG4gICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgeyBcIm5hbWVcIjogXCJbRmlyc3QgbmFtZV0gW0xhc3QgbmFtZV1cIiwgXCJkYXRhRW5yb2xsZWRcIjogXCIwOS8wOS8yMDE1XCIgfSxcclxuICAgICAgICAgICAgeyBcIm5hbWVcIjogXCJbRmlyc3QgbmFtZV0gW0xhc3QgbmFtZV1cIiwgXCJkYXRhRW5yb2xsZWRcIjogXCIwOS8wOS8yMDE1XCIgfSxcclxuICAgICAgICAgICAgeyBcIm5hbWVcIjogXCJbRmlyc3QgbmFtZV0gW0xhc3QgbmFtZV1cIiwgXCJkYXRhRW5yb2xsZWRcIjogXCIwOS8wOS8yMDE1XCIgfSxcclxuICAgICAgICAgICAgeyBcIm5hbWVcIjogXCJbRmlyc3QgbmFtZV0gW0xhc3QgbmFtZV1cIiwgXCJkYXRhRW5yb2xsZWRcIjogXCIwOS8wOS8yMDE1XCIgfVxyXG4gICAgICAgIF1cclxuICAgIH0pLFxyXG5cclxuICAgIHNob3dEYXRhIDpmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS50b2dnbGVDbGFzcyhcImNsb3NlZFwiKTtcclxuICAgIH0sXHJcblxyXG4gICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyIGNoaWxkcyA9ICQoZS5jdXJyZW50VGFyZ2V0KS5jaGlsZHJlbigpO1xyXG4gICAgICAgIGNoaWxkcy5yZW1vdmVDbGFzcygpO1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gXCJcIjtcclxuICAgICAgICB2YXIgYWN0dWFsID0gZS50YXJnZXQ7XHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBpZiAoJC5pbkFycmF5KGFjdHVhbCwgY2hpbGRzKSAhPSAtMSlcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBhY3R1YWw7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGFjdHVhbCA9IGFjdHVhbC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH0gd2hpbGUgKGVsZW1lbnQgPT09IFwiXCIpO1xyXG4gICAgICAgICQoZWxlbWVudCkuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuICAgIH0gXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHZpZXdNb2RlbEhlbHBlcnMubXZ2bVV0aWwuYXNPYnNlcnZhYmxlKHZpZXdNb2RlbCk7IiwiLypqc2hpbnQgbm9kZTogdHJ1ZSovXHJcbi8qZ2xvYmFsIHdpbmRvdywgJCwga2VuZG8qL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGluc3RhbmNlID0ga2VuZG8ub2JzZXJ2YWJsZSh7XHJcbiAgICByZXdhcmRzU291cmNlOiBuZXcga2VuZG8uZGF0YS5EYXRhU291cmNlKHtcclxuICAgICAgICB0cmFuc3BvcnQ6IHtcclxuICAgICAgICAgICAgcmVhZDoge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2FwaS9Qcm9ncmFtL0dldEhpZ2hWYWx1ZVJld2FyZHMnLFxyXG4gICAgICAgICAgICAgICAgYXN5bmM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGluc3RhbmNlOyIsIi8qanNoaW50IG5vZGU6IHRydWUqL1xyXG4vKmdsb2JhbCB3aW5kb3csICQsIGtlbmRvLCBsb2NhdGlvbiovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbG9nZ2VyID0gcmVxdWlyZSgnLi4vdXRpbC9sb2dnZXInKSxcclxuXHJcbiAgICBpbnN0YW5jZSA9IGtlbmRvLm9ic2VydmFibGUoe1xyXG4gICAgICAgIGlkOiBcIjBcIixcclxuICAgICAgICBmaXJzdE5hbWU6IFwiSm9oblwiLFxyXG4gICAgICAgIGxhc3ROYW1lOiBcIkRvZVwiLFxyXG4gICAgICAgIGVtYWlsOiBcImVtYWlsQGV4YW1wbGUuY29tXCIsXHJcbiAgICAgICAgZ29ITElkOiBcIlhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFwiLFxyXG4gICAgICAgIGhhc0FjY2VwdGVkOiBmYWxzZSxcclxuXHJcbiAgICAgICAgTG9hZEN1c3RvbWVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL1Byb2dyYW0vR2V0Q3VzdG9tZXInLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2pzb24nLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2V0KCdpZCcsIHJlc3BvbnNlLklkKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNldCgnZmlyc3ROYW1lJywgcmVzcG9uc2UuRmlyc3ROYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNldCgnbGFzdE5hbWUnLCByZXNwb25zZS5MYXN0TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZXQoJ2VtYWlsJywgcmVzcG9uc2UuRW1haWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2V0KCdnb0hMSWQnLCByZXNwb25zZS5Hb0hsQ3VzdG9tZXJJZCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXhjZXB0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgQWN0aXZhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICB2YXIgX2N1c3REYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgJ0lkJzogdGhhdC5pZCxcclxuICAgICAgICAgICAgICAgICdEaXN0cmlidXRvcklkJzogXCJTVEFGRlwiLFxyXG4gICAgICAgICAgICAgICAgJ0VtYWlsJzogdGhhdC5lbWFpbCxcclxuICAgICAgICAgICAgICAgICdGaXJzdE5hbWUnOiB0aGF0LmZpcnN0TmFtZSxcclxuICAgICAgICAgICAgICAgICdMYXN0TmFtZSc6IHRoYXQubGFzdE5hbWUsXHJcbiAgICAgICAgICAgICAgICAnR29IbEN1c3RvbWVySWQnOiB0aGF0LmdvSExJZCxcclxuICAgICAgICAgICAgICAgICdMb3lhbGl0eVByb2dyYW1JZCc6IFwiQjU1QTg5NzktMDhCNS1FNjEyLTgwQzQtMDAxNURERTFFNTExXCJcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL1Byb2dyYW0vQWN0aXZhdGVQcm9ncmFtJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IF9jdXN0RGF0YSxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdqc29uJyxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcjL2Rhc2hib2FyZCc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChleGNlcHRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXhjZXB0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgRW5hYmxlQWN0aXZlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldCgnaGFzQWNjZXB0ZWQnKSAmJiB0aGlzLmdldCgnZmlyc3ROYW1lJykgIT09ICcnICYmIHRoaXMuZ2V0KCdsYXN0TmFtZScpICE9PSAnJztcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gaW5zdGFuY2U7IiwiLyohXHJcbiAqIGpzLWxvZ2dlciAtIGh0dHA6Ly9naXRodWIuY29tL2pvbm55cmVldmVzL2pzLWxvZ2dlclxyXG4gKiBKb25ueSBSZWV2ZXMsIGh0dHA6Ly9qb25ueXJlZXZlcy5jby51ay9cclxuICoganMtbG9nZ2VyIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4gKi9cclxuKGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuXHRcInVzZSBzdHJpY3RcIjtcclxuXHJcblx0Ly8gVG9wIGxldmVsIG1vZHVsZSBmb3IgdGhlIGdsb2JhbCwgc3RhdGljIGxvZ2dlciBpbnN0YW5jZS5cclxuXHR2YXIgTG9nZ2VyID0geyB9O1xyXG5cclxuXHQvLyBGb3IgdGhvc2UgdGhhdCBhcmUgYXQgaG9tZSB0aGF0IGFyZSBrZWVwaW5nIHNjb3JlLlxyXG5cdExvZ2dlci5WRVJTSU9OID0gXCIxLjMuMFwiO1xyXG5cclxuXHQvLyBGdW5jdGlvbiB3aGljaCBoYW5kbGVzIGFsbCBpbmNvbWluZyBsb2cgbWVzc2FnZXMuXHJcblx0dmFyIGxvZ0hhbmRsZXI7XHJcblxyXG5cdC8vIE1hcCBvZiBDb250ZXh0dWFsTG9nZ2VyIGluc3RhbmNlcyBieSBuYW1lOyB1c2VkIGJ5IExvZ2dlci5nZXQoKSB0byByZXR1cm4gdGhlIHNhbWUgbmFtZWQgaW5zdGFuY2UuXHJcblx0dmFyIGNvbnRleHR1YWxMb2dnZXJzQnlOYW1lTWFwID0ge307XHJcblxyXG5cdC8vIFBvbHlmaWxsIGZvciBFUzUncyBGdW5jdGlvbi5iaW5kLlxyXG5cdHZhciBiaW5kID0gZnVuY3Rpb24oc2NvcGUsIGZ1bmMpIHtcclxuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIGZ1bmMuYXBwbHkoc2NvcGUsIGFyZ3VtZW50cyk7XHJcblx0XHR9O1xyXG5cdH07XHJcblxyXG5cdC8vIFN1cGVyIGV4Y2l0aW5nIG9iamVjdCBtZXJnZXItbWF0cm9uIDkwMDAgYWRkaW5nIGFub3RoZXIgMTAwIGJ5dGVzIHRvIHlvdXIgZG93bmxvYWQuXHJcblx0dmFyIG1lcmdlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIGFyZ3MgPSBhcmd1bWVudHMsIHRhcmdldCA9IGFyZ3NbMF0sIGtleSwgaTtcclxuXHRcdGZvciAoaSA9IDE7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdGZvciAoa2V5IGluIGFyZ3NbaV0pIHtcclxuXHRcdFx0XHRpZiAoIShrZXkgaW4gdGFyZ2V0KSAmJiBhcmdzW2ldLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuXHRcdFx0XHRcdHRhcmdldFtrZXldID0gYXJnc1tpXVtrZXldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRhcmdldDtcclxuXHR9O1xyXG5cclxuXHQvLyBIZWxwZXIgdG8gZGVmaW5lIGEgbG9nZ2luZyBsZXZlbCBvYmplY3Q7IGhlbHBzIHdpdGggb3B0aW1pc2F0aW9uLlxyXG5cdHZhciBkZWZpbmVMb2dMZXZlbCA9IGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XHJcblx0XHRyZXR1cm4geyB2YWx1ZTogdmFsdWUsIG5hbWU6IG5hbWUgfTtcclxuXHR9O1xyXG5cclxuXHQvLyBQcmVkZWZpbmVkIGxvZ2dpbmcgbGV2ZWxzLlxyXG5cdExvZ2dlci5ERUJVRyA9IGRlZmluZUxvZ0xldmVsKDEsICdERUJVRycpO1xyXG5cdExvZ2dlci5JTkZPID0gZGVmaW5lTG9nTGV2ZWwoMiwgJ0lORk8nKTtcclxuXHRMb2dnZXIuVElNRSA9IGRlZmluZUxvZ0xldmVsKDMsICdUSU1FJyk7XHJcblx0TG9nZ2VyLldBUk4gPSBkZWZpbmVMb2dMZXZlbCg0LCAnV0FSTicpO1xyXG5cdExvZ2dlci5FUlJPUiA9IGRlZmluZUxvZ0xldmVsKDgsICdFUlJPUicpO1xyXG5cdExvZ2dlci5PRkYgPSBkZWZpbmVMb2dMZXZlbCg5OSwgJ09GRicpO1xyXG5cclxuXHQvLyBJbm5lciBjbGFzcyB3aGljaCBwZXJmb3JtcyB0aGUgYnVsayBvZiB0aGUgd29yazsgQ29udGV4dHVhbExvZ2dlciBpbnN0YW5jZXMgY2FuIGJlIGNvbmZpZ3VyZWQgaW5kZXBlbmRlbnRseVxyXG5cdC8vIG9mIGVhY2ggb3RoZXIuXHJcblx0dmFyIENvbnRleHR1YWxMb2dnZXIgPSBmdW5jdGlvbihkZWZhdWx0Q29udGV4dCkge1xyXG5cdFx0dGhpcy5jb250ZXh0ID0gZGVmYXVsdENvbnRleHQ7XHJcblx0XHR0aGlzLnNldExldmVsKGRlZmF1bHRDb250ZXh0LmZpbHRlckxldmVsKTtcclxuXHRcdHRoaXMubG9nID0gdGhpcy5pbmZvOyAgLy8gQ29udmVuaWVuY2UgYWxpYXMuXHJcblx0fTtcclxuXHJcblx0Q29udGV4dHVhbExvZ2dlci5wcm90b3R5cGUgPSB7XHJcblx0XHQvLyBDaGFuZ2VzIHRoZSBjdXJyZW50IGxvZ2dpbmcgbGV2ZWwgZm9yIHRoZSBsb2dnaW5nIGluc3RhbmNlLlxyXG5cdFx0c2V0TGV2ZWw6IGZ1bmN0aW9uIChuZXdMZXZlbCkge1xyXG5cdFx0XHQvLyBFbnN1cmUgdGhlIHN1cHBsaWVkIExldmVsIG9iamVjdCBsb29rcyB2YWxpZC5cclxuXHRcdFx0aWYgKG5ld0xldmVsICYmIFwidmFsdWVcIiBpbiBuZXdMZXZlbCkge1xyXG5cdFx0XHRcdHRoaXMuY29udGV4dC5maWx0ZXJMZXZlbCA9IG5ld0xldmVsO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIElzIHRoZSBsb2dnZXIgY29uZmlndXJlZCB0byBvdXRwdXQgbWVzc2FnZXMgYXQgdGhlIHN1cHBsaWVkIGxldmVsP1xyXG5cdFx0ZW5hYmxlZEZvcjogZnVuY3Rpb24gKGx2bCkge1xyXG5cdFx0XHR2YXIgZmlsdGVyTGV2ZWwgPSB0aGlzLmNvbnRleHQuZmlsdGVyTGV2ZWw7XHJcblx0XHRcdHJldHVybiBsdmwudmFsdWUgPj0gZmlsdGVyTGV2ZWwudmFsdWU7XHJcblx0XHR9LFxyXG5cclxuXHRcdGRlYnVnOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHRoaXMuaW52b2tlKExvZ2dlci5ERUJVRywgYXJndW1lbnRzKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0aW5mbzogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR0aGlzLmludm9rZShMb2dnZXIuSU5GTywgYXJndW1lbnRzKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0d2FybjogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHR0aGlzLmludm9rZShMb2dnZXIuV0FSTiwgYXJndW1lbnRzKTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0dGhpcy5pbnZva2UoTG9nZ2VyLkVSUk9SLCBhcmd1bWVudHMpO1xyXG5cdFx0fSxcclxuXHJcblx0XHR0aW1lOiBmdW5jdGlvbiAobGFiZWwpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBsYWJlbCA9PT0gJ3N0cmluZycgJiYgbGFiZWwubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdHRoaXMuaW52b2tlKExvZ2dlci5USU1FLCBbIGxhYmVsLCAnc3RhcnQnIF0pO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdHRpbWVFbmQ6IGZ1bmN0aW9uIChsYWJlbCkge1xyXG5cdFx0XHRpZiAodHlwZW9mIGxhYmVsID09PSAnc3RyaW5nJyAmJiBsYWJlbC5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0dGhpcy5pbnZva2UoTG9nZ2VyLlRJTUUsIFsgbGFiZWwsICdlbmQnIF0pO1xyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cclxuXHRcdC8vIEludm9rZXMgdGhlIGxvZ2dlciBjYWxsYmFjayBpZiBpdCdzIG5vdCBiZWluZyBmaWx0ZXJlZC5cclxuXHRcdGludm9rZTogZnVuY3Rpb24gKGxldmVsLCBtc2dBcmdzKSB7XHJcblx0XHRcdGlmIChsb2dIYW5kbGVyICYmIHRoaXMuZW5hYmxlZEZvcihsZXZlbCkpIHtcclxuXHRcdFx0XHRsb2dIYW5kbGVyKG1zZ0FyZ3MsIG1lcmdlKHsgbGV2ZWw6IGxldmVsIH0sIHRoaXMuY29udGV4dCkpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fTtcclxuXHJcblx0Ly8gUHJvdGVjdGVkIGluc3RhbmNlIHdoaWNoIGFsbCBjYWxscyB0byB0aGUgdG8gbGV2ZWwgYExvZ2dlcmAgbW9kdWxlIHdpbGwgYmUgcm91dGVkIHRocm91Z2guXHJcblx0dmFyIGdsb2JhbExvZ2dlciA9IG5ldyBDb250ZXh0dWFsTG9nZ2VyKHsgZmlsdGVyTGV2ZWw6IExvZ2dlci5PRkYgfSk7XHJcblxyXG5cdC8vIENvbmZpZ3VyZSB0aGUgZ2xvYmFsIExvZ2dlciBpbnN0YW5jZS5cclxuXHQoZnVuY3Rpb24oKSB7XHJcblx0XHQvLyBTaG9ydGN1dCBmb3Igb3B0aW1pc2Vycy5cclxuXHRcdHZhciBMID0gTG9nZ2VyO1xyXG5cclxuXHRcdEwuZW5hYmxlZEZvciA9IGJpbmQoZ2xvYmFsTG9nZ2VyLCBnbG9iYWxMb2dnZXIuZW5hYmxlZEZvcik7XHJcblx0XHRMLmRlYnVnID0gYmluZChnbG9iYWxMb2dnZXIsIGdsb2JhbExvZ2dlci5kZWJ1Zyk7XHJcblx0XHRMLnRpbWUgPSBiaW5kKGdsb2JhbExvZ2dlciwgZ2xvYmFsTG9nZ2VyLnRpbWUpO1xyXG5cdFx0TC50aW1lRW5kID0gYmluZChnbG9iYWxMb2dnZXIsIGdsb2JhbExvZ2dlci50aW1lRW5kKTtcclxuXHRcdEwuaW5mbyA9IGJpbmQoZ2xvYmFsTG9nZ2VyLCBnbG9iYWxMb2dnZXIuaW5mbyk7XHJcblx0XHRMLndhcm4gPSBiaW5kKGdsb2JhbExvZ2dlciwgZ2xvYmFsTG9nZ2VyLndhcm4pO1xyXG5cdFx0TC5lcnJvciA9IGJpbmQoZ2xvYmFsTG9nZ2VyLCBnbG9iYWxMb2dnZXIuZXJyb3IpO1xyXG5cclxuXHRcdC8vIERvbid0IGZvcmdldCB0aGUgY29udmVuaWVuY2UgYWxpYXMhXHJcblx0XHRMLmxvZyA9IEwuaW5mbztcclxuXHR9KCkpO1xyXG5cclxuXHQvLyBTZXQgdGhlIGdsb2JhbCBsb2dnaW5nIGhhbmRsZXIuICBUaGUgc3VwcGxpZWQgZnVuY3Rpb24gc2hvdWxkIGV4cGVjdCB0d28gYXJndW1lbnRzLCB0aGUgZmlyc3QgYmVpbmcgYW4gYXJndW1lbnRzXHJcblx0Ly8gb2JqZWN0IHdpdGggdGhlIHN1cHBsaWVkIGxvZyBtZXNzYWdlcyBhbmQgdGhlIHNlY29uZCBiZWluZyBhIGNvbnRleHQgb2JqZWN0IHdoaWNoIGNvbnRhaW5zIGEgaGFzaCBvZiBzdGF0ZWZ1bFxyXG5cdC8vIHBhcmFtZXRlcnMgd2hpY2ggdGhlIGxvZ2dpbmcgZnVuY3Rpb24gY2FuIGNvbnN1bWUuXHJcblx0TG9nZ2VyLnNldEhhbmRsZXIgPSBmdW5jdGlvbiAoZnVuYykge1xyXG5cdFx0bG9nSGFuZGxlciA9IGZ1bmM7XHJcblx0fTtcclxuXHJcblx0Ly8gU2V0cyB0aGUgZ2xvYmFsIGxvZ2dpbmcgZmlsdGVyIGxldmVsIHdoaWNoIGFwcGxpZXMgdG8gKmFsbCogcHJldmlvdXNseSByZWdpc3RlcmVkLCBhbmQgZnV0dXJlIExvZ2dlciBpbnN0YW5jZXMuXHJcblx0Ly8gKG5vdGUgdGhhdCBuYW1lZCBsb2dnZXJzIChyZXRyaWV2ZWQgdmlhIGBMb2dnZXIuZ2V0YCkgY2FuIGJlIGNvbmZpZ3VyZWQgaW5kZXBlbmRlbnRseSBpZiByZXF1aXJlZCkuXHJcblx0TG9nZ2VyLnNldExldmVsID0gZnVuY3Rpb24obGV2ZWwpIHtcclxuXHRcdC8vIFNldCB0aGUgZ2xvYmFsTG9nZ2VyJ3MgbGV2ZWwuXHJcblx0XHRnbG9iYWxMb2dnZXIuc2V0TGV2ZWwobGV2ZWwpO1xyXG5cclxuXHRcdC8vIEFwcGx5IHRoaXMgbGV2ZWwgdG8gYWxsIHJlZ2lzdGVyZWQgY29udGV4dHVhbCBsb2dnZXJzLlxyXG5cdFx0Zm9yICh2YXIga2V5IGluIGNvbnRleHR1YWxMb2dnZXJzQnlOYW1lTWFwKSB7XHJcblx0XHRcdGlmIChjb250ZXh0dWFsTG9nZ2Vyc0J5TmFtZU1hcC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcblx0XHRcdFx0Y29udGV4dHVhbExvZ2dlcnNCeU5hbWVNYXBba2V5XS5zZXRMZXZlbChsZXZlbCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHQvLyBSZXRyaWV2ZSBhIENvbnRleHR1YWxMb2dnZXIgaW5zdGFuY2UuICBOb3RlIHRoYXQgbmFtZWQgbG9nZ2VycyBhdXRvbWF0aWNhbGx5IGluaGVyaXQgdGhlIGdsb2JhbCBsb2dnZXIncyBsZXZlbCxcclxuXHQvLyBkZWZhdWx0IGNvbnRleHQgYW5kIGxvZyBoYW5kbGVyLlxyXG5cdExvZ2dlci5nZXQgPSBmdW5jdGlvbiAobmFtZSkge1xyXG5cdFx0Ly8gQWxsIGxvZ2dlciBpbnN0YW5jZXMgYXJlIGNhY2hlZCBzbyB0aGV5IGNhbiBiZSBjb25maWd1cmVkIGFoZWFkIG9mIHVzZS5cclxuXHRcdHJldHVybiBjb250ZXh0dWFsTG9nZ2Vyc0J5TmFtZU1hcFtuYW1lXSB8fFxyXG5cdFx0XHQoY29udGV4dHVhbExvZ2dlcnNCeU5hbWVNYXBbbmFtZV0gPSBuZXcgQ29udGV4dHVhbExvZ2dlcihtZXJnZSh7IG5hbWU6IG5hbWUgfSwgZ2xvYmFsTG9nZ2VyLmNvbnRleHQpKSk7XHJcblx0fTtcclxuXHJcblx0Ly8gQ3JlYXRlRGVmYXVsdEhhbmRsZXIgcmV0dXJucyBhIGhhbmRsZXIgZnVuY3Rpb24gd2hpY2ggY2FuIGJlIHBhc3NlZCB0byBgTG9nZ2VyLnNldEhhbmRsZXIoKWAgd2hpY2ggd2lsbFxyXG5cdC8vIHdyaXRlIHRvIHRoZSB3aW5kb3cncyBjb25zb2xlIG9iamVjdCAoaWYgcHJlc2VudCk7IHRoZSBvcHRpb25hbCBvcHRpb25zIG9iamVjdCBjYW4gYmUgdXNlZCB0byBjdXN0b21pc2UgdGhlXHJcblx0Ly8gZm9ybWF0dGVyIHVzZWQgdG8gZm9ybWF0IGVhY2ggbG9nIG1lc3NhZ2UuXHJcblx0TG9nZ2VyLmNyZWF0ZURlZmF1bHRIYW5kbGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuXHRcdG9wdGlvbnMuZm9ybWF0dGVyID0gb3B0aW9ucy5mb3JtYXR0ZXIgfHwgZnVuY3Rpb24gZGVmYXVsdE1lc3NhZ2VGb3JtYXR0ZXIobWVzc2FnZXMsIGNvbnRleHQpIHtcclxuXHRcdFx0Ly8gUHJlcGVuZCB0aGUgbG9nZ2VyJ3MgbmFtZSB0byB0aGUgbG9nIG1lc3NhZ2UgZm9yIGVhc3kgaWRlbnRpZmljYXRpb24uXHJcblx0XHRcdGlmIChjb250ZXh0Lm5hbWUpIHtcclxuXHRcdFx0XHRtZXNzYWdlcy51bnNoaWZ0KFwiW1wiICsgY29udGV4dC5uYW1lICsgXCJdXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdC8vIE1hcCBvZiB0aW1lc3RhbXBzIGJ5IHRpbWVyIGxhYmVscyB1c2VkIHRvIHRyYWNrIGAjdGltZWAgYW5kIGAjdGltZUVuZCgpYCBpbnZvY2F0aW9ucyBpbiBlbnZpcm9ubWVudHNcclxuXHRcdC8vIHRoYXQgZG9uJ3Qgb2ZmZXIgYSBuYXRpdmUgY29uc29sZSBtZXRob2QuXHJcblx0XHR2YXIgdGltZXJTdGFydFRpbWVCeUxhYmVsTWFwID0ge307XHJcblxyXG5cdFx0Ly8gU3VwcG9ydCBmb3IgSUU4KyAoYW5kIG90aGVyLCBzbGlnaHRseSBtb3JlIHNhbmUgZW52aXJvbm1lbnRzKVxyXG5cdFx0dmFyIGludm9rZUNvbnNvbGVNZXRob2QgPSBmdW5jdGlvbiAoaGRsciwgbWVzc2FnZXMpIHtcclxuXHRcdFx0RnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoaGRsciwgY29uc29sZSwgbWVzc2FnZXMpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBDaGVjayBmb3IgdGhlIHByZXNlbmNlIG9mIGEgbG9nZ2VyLlxyXG5cdFx0aWYgKHR5cGVvZiBjb25zb2xlID09PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7IC8qIG5vIGNvbnNvbGUgKi8gfTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gZnVuY3Rpb24obWVzc2FnZXMsIGNvbnRleHQpIHtcclxuXHRcdFx0Ly8gQ29udmVydCBhcmd1bWVudHMgb2JqZWN0IHRvIEFycmF5LlxyXG5cdFx0XHRtZXNzYWdlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG1lc3NhZ2VzKTtcclxuXHJcblx0XHRcdHZhciBoZGxyID0gY29uc29sZS5sb2c7XHJcblx0XHRcdHZhciB0aW1lckxhYmVsO1xyXG5cclxuXHRcdFx0aWYgKGNvbnRleHQubGV2ZWwgPT09IExvZ2dlci5USU1FKSB7XHJcblx0XHRcdFx0dGltZXJMYWJlbCA9IChjb250ZXh0Lm5hbWUgPyAnWycgKyBjb250ZXh0Lm5hbWUgKyAnXSAnIDogJycpICsgbWVzc2FnZXNbMF07XHJcblxyXG5cdFx0XHRcdGlmIChtZXNzYWdlc1sxXSA9PT0gJ3N0YXJ0Jykge1xyXG5cdFx0XHRcdFx0aWYgKGNvbnNvbGUudGltZSkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLnRpbWUodGltZXJMYWJlbCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGltZXJTdGFydFRpbWVCeUxhYmVsTWFwW3RpbWVyTGFiZWxdID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdFx0aWYgKGNvbnNvbGUudGltZUVuZCkge1xyXG5cdFx0XHRcdFx0XHRjb25zb2xlLnRpbWVFbmQodGltZXJMYWJlbCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0aW52b2tlQ29uc29sZU1ldGhvZChoZGxyLCBbIHRpbWVyTGFiZWwgKyAnOiAnICtcclxuXHRcdFx0XHRcdFx0XHQobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aW1lclN0YXJ0VGltZUJ5TGFiZWxNYXBbdGltZXJMYWJlbF0pICsgJ21zJyBdKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSB7XHJcblx0XHRcdFx0Ly8gRGVsZWdhdGUgdGhyb3VnaCB0byBjdXN0b20gd2Fybi9lcnJvciBsb2dnZXJzIGlmIHByZXNlbnQgb24gdGhlIGNvbnNvbGUuXHJcblx0XHRcdFx0aWYgKGNvbnRleHQubGV2ZWwgPT09IExvZ2dlci5XQVJOICYmIGNvbnNvbGUud2Fybikge1xyXG5cdFx0XHRcdFx0aGRsciA9IGNvbnNvbGUud2FybjtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKGNvbnRleHQubGV2ZWwgPT09IExvZ2dlci5FUlJPUiAmJiBjb25zb2xlLmVycm9yKSB7XHJcblx0XHRcdFx0XHRoZGxyID0gY29uc29sZS5lcnJvcjtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKGNvbnRleHQubGV2ZWwgPT09IExvZ2dlci5JTkZPICYmIGNvbnNvbGUuaW5mbykge1xyXG5cdFx0XHRcdFx0aGRsciA9IGNvbnNvbGUuaW5mbztcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG9wdGlvbnMuZm9ybWF0dGVyKG1lc3NhZ2VzLCBjb250ZXh0KTtcclxuXHRcdFx0XHRpbnZva2VDb25zb2xlTWV0aG9kKGhkbHIsIG1lc3NhZ2VzKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHQvLyBDb25maWd1cmUgYW5kIGV4YW1wbGUgYSBEZWZhdWx0IGltcGxlbWVudGF0aW9uIHdoaWNoIHdyaXRlcyB0byB0aGUgYHdpbmRvdy5jb25zb2xlYCAoaWYgcHJlc2VudCkuICBUaGVcclxuXHQvLyBgb3B0aW9uc2AgaGFzaCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHQgbG9nTGV2ZWwgYW5kIHByb3ZpZGUgYSBjdXN0b20gbWVzc2FnZSBmb3JtYXR0ZXIuXHJcblx0TG9nZ2VyLnVzZURlZmF1bHRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cdFx0TG9nZ2VyLnNldExldmVsKG9wdGlvbnMgJiYgb3B0aW9ucy5kZWZhdWx0TGV2ZWwgfHwgTG9nZ2VyLkRFQlVHKTtcclxuXHRcdExvZ2dlci5zZXRIYW5kbGVyKExvZ2dlci5jcmVhdGVEZWZhdWx0SGFuZGxlcihvcHRpb25zKSk7XHJcblx0fTtcclxuXHJcblx0Ly8gRXhwb3J0IHRvIHBvcHVsYXIgZW52aXJvbm1lbnRzIGJvaWxlcnBsYXRlLlxyXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuXHRcdGRlZmluZShMb2dnZXIpO1xyXG5cdH1cclxuXHRlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBMb2dnZXI7XHJcblx0fVxyXG5cdGVsc2Uge1xyXG5cdFx0TG9nZ2VyLl9wcmV2TG9nZ2VyID0gZ2xvYmFsLkxvZ2dlcjtcclxuXHJcblx0XHRMb2dnZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0Z2xvYmFsLkxvZ2dlciA9IExvZ2dlci5fcHJldkxvZ2dlcjtcclxuXHRcdFx0cmV0dXJuIExvZ2dlcjtcclxuXHRcdH07XHJcblxyXG5cdFx0Z2xvYmFsLkxvZ2dlciA9IExvZ2dlcjtcclxuXHR9XHJcbn0odGhpcykpO1xyXG4iXX0=
