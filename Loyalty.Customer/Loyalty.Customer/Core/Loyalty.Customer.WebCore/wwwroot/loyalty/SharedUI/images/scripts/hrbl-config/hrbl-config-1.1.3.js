// --------------------------------------------------------------------------------------------------------------------
// <copyright file="hrbl-config" company="Herbalife">
//   Herbalife 2014
// </copyright>
// <summary>
//   Base file for require JS modules
// </summary>
// <authors>
// DTS - Content DEV UI | DTS - Integration 
// </authors>
// --------------------------------------------------------------------------------------------------------------------

// namespace HL defined
var HL = HL || {};
HL['Util'] || (HL.Util = {});


// prototypes

Function.prototype.instantiate = function (constructorArguemnts) {
    var context = this,
        invokable = function () {
            context.apply(this, constructorArguemnts);
        };

    invokable.prototype = context.prototype;
    return new invokable();
};

viewModelHelpers = (function ($, kendo) {
    var customBindings = function (k) {
        // Kendo binding to set a view model's field from HTML one way (in case DOM bound to model,  but model value shoudl be passed from DOM)
        k.data.binders.oneWayValueFromDOM = k.data.Binder.extend({
            refresh: function () {
                // HTML5 supports this.element.dataset.initialvalue / but compatibility with IE is an issue so use $().attr()
                var valueFromDOM = $(this.element).data('initialvalue');
                this.bindings.oneWayValueFromDOM.set(valueFromDOM);
            }
        });

        //Kendo Window Center
        k.data.binders.widget.centerWindow = k.data.Binder.extend({
            init: function (widget, bindings, options) {
                try {
                    k.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
                    var flag = String(this.bindings['centerWindow'].path) === "true";
                    flag && widget && widget.center && widget.center();
                } catch (error) {
                    logger.log(error);
                }
            },
            refresh: function () {
            }
        });

        k.data.binders.widget.getWidget = k.data.Binder.extend({
            init: function (widget, bindings, options) {
                try {
                    k.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
                    var fieldName = String(this.bindings['getWidget'].path);
                    bindings.getWidget.parents[0][fieldName] = widget;
                } catch (error) {
                    logger.log(error);
                }
            },
            refresh: function () {
            }
        });

        k.data.binders.confirmedClick = k.data.Binder.extend({
            init: function (element, bindings, options) {
                try {
                    k.data.Binder.fn.init.call(this, element, bindings, options);
                    var binding = bindings['confirmedClick'];
                    var method = binding.source.get(binding.path);
                    var message = $(element).data('confirm-message');
                    $(element).bind("click", function (e) {
                        if (window.confirm(message)) {
                            method.call(binding.source, e);
                        }
                    });
                } catch (error) {
                    logger.log(error);
                }
            },
            refresh: function () { }
        });
    };
    var wire = (function () {
        var configuration = {
            makeModel: function (x) { return x; },
            bind: function (x) { return x; },
            init: function () {
            },
        };

        var wireMode = {
            shared: "shared",
            own: "own"
        };

        var defaultMode = wireMode.shared;

        var sharedInstances = {};

        var ownInstances = [];

        var modelsCreatedListeners = [];

        var getInstance = function (modelName, mode, args) {
            var instance = null;

            // if shared exists, return it.
            if (mode == wireMode.shared && sharedInstances[modelName]) {
                return sharedInstances[modelName];
            }

            // create instance
            //var target = new window[modelName];

            var proto = window[modelName];

            var target = proto.instantiate(args);

            instance = configuration.makeModel(target) || target;


            // stash if shared
            if (mode == wireMode.shared) {
                sharedInstances[modelName] = instance;
            } else {
                ownInstances.push(instance);
            }

            return instance;

        };

        var initializeModel = function (instance) {
            instance && instance[configuration.init] && instance[configuration.init]();
        };

        var activateLoaders = function () {
            for (var modelName in sharedInstances) {
                initializeModel(sharedInstances[modelName]);
            }

            for (var i = 0; i < ownInstances.length; i++) {
                initializeModel(ownInstances[i]);
            }
        };

        var notifyModelsCreated = function () {
            for (var i = 0; i < modelsCreatedListeners.length; i++) {
                try {
                    modelsCreatedListeners[i]();
                } catch (error) {
                    logger.log(error);
                }
            }
        };

        var configure = function (obj) {
            for (var f in obj) {
                configuration[f] = obj[f];
            }

            return this;
        };

        var parseConstructorArguments = function (args) {
            var a, result = [];

            while ((a = args.shift()) && a) {
                var parsed = JSON.parse($.trim(a));
                result.push(parsed);
            }
            return result;
        };
        var apply = function (element) {

            if (element == undefined) {
                $('[wire-model]').each(function () {
                    applyHelper(this);
                });
            }

            else {
                applyHelper(element);
            }

            try {
                notifyModelsCreated();
                activateLoaders();
            } catch (e2) {
                logger.log(e2);
            }

            return this;
        };

        var applyHelper = function (obj) {
            try {
                // config
                var args = ($(obj).attr("wire-mode") || defaultMode).split(','),
                    parsedArgs,
                    mode,
                    modelName = $(obj).attr("wire-model");

                // first arg is the mode.
                mode = ($.trim(args.shift()) == wireMode.own) ? wireMode.own : defaultMode;

                // rest to be parsed from the mode initialization
                parsedArgs = parseConstructorArguments(args);

                // model
                var model = getInstance(modelName, mode, parsedArgs);

                //adding obj to model
                model.obj = obj;

                // binding
                configuration.bind(obj, model);
            } catch (e1) {
                logger.log("ApplyHelper func: " + e1 + " @" + modelName);
            }
        };

        var modelsCreated = function (modelsCreatedListener) {
            if (!modelsCreatedListener) {
                return;
            }
            modelsCreatedListeners.push(modelsCreatedListener);
        };

        return {
            apply: apply,
            configure: configure,
            getInstance: getInstance,
            mode: wireMode,
            configuration: configuration,
            modelsCreated: modelsCreated,
        };
    }());

    var mvvmUtil = (function () {

        var toObservable = function (obj) {
            return kendo.observable(obj);
        };

        var isModelBoundToElement = function (obj) {
            return obj && obj._events && obj._events.change;
        };

        var wireModelsToElements = function (selectors) {
            var instance = this;

            // each selector, each element found by selector
            $.each(selectors, function (i, selector) {
                $(selector).each(function (index, sender) {
                    try {
                        kendo.bind(sender, instance);
                    } catch (err) {
                        logger.log('wireModelsToElements encountered binding error' + err);
                    }
                });
            });

            return instance;
        };

        var genericDataLoader = function (obj) {
            var instance = obj || this;
            if (!instance.isModelBoundToElement(instance)) {
                return;
            }

            if (!instance.get('canLoad') == true) {
                // should not load now.
                return;
            }

            if (!this.path) {
                // no way to load
                return;
            }

            if (instance.onBeforeLoad) {
                instance.onBeforeLoad();
            }

            $.ajax({
                type: "GET",
                url: this.path,
                xhrFields: {
                    withCredentials: true
                }
            })
                .done(function (context, status, xhr) {
                    if (instance.dataHandler) {
                        instance.dataHandler(context, status, xhr);
                    } else {
                        logger.log('No data handler found for data returned from ' + this.path);
                    }

                    if (instance.onAfterLoad) {
                        instance.onAfterLoad();
                    }
                })
                .fail(function (context, status, error) {
                    logger.log(status + ' : ' + error + " on " + this.url);
                    if (instance.onLoadError) {
                        instance.onLoadError(context, status, error);
                    }
                });
        };

        var toLoadable = function (obj) {
            // assign standard behavior unless exists on obj
            obj.load = obj.load || genericDataLoader;
            obj.canLoad = !(obj.canLoad === false);
            obj.isModelBoundToElement = obj.isModelBoundToElement || isModelBoundToElement;
            obj.wireModelsToElements = obj.wireModelsToElements || wireModelsToElements;

            return obj;
        };

        return {
            isModelBoundToElement: isModelBoundToElement,

            wireModelsToElements: wireModelsToElements,

            attachTo: function (obj) { return toLoadable(toObservable(obj)); },

            asObservable: toObservable,

            asLoadable: toLoadable
        };

    }());

    // register custom bindigs
    customBindings(kendo);

    return {
        wire: wire,
        mvvmUtil: mvvmUtil
    };

})($, kendo);


function _resolveScope(context, accessor) {
    var result = context[accessor] || context;
    return result;
}

var simpleMediator = (function () {
    var topics = {};

    // topic: thing to subscribe to, some name
    // fn: function to call back when someone publishes to that topic.
    var subscribe = function (topic, fn) {

        if (!topics[topic]) {
            topics[topic] = [];
        }

        topics[topic].push({ context: this, callback: fn });

        return this;

    };

    // topic: the topic listeners attach to.
    // further arguments may be supplied after the topic, which will be relayed to the subscribers
    var publish = function (topic) {
        var args;
        var response;

        if (!topics[topic]) {
            return false;
        }

        args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = topics[topic].length; i < l; i++) {

            var subscription = topics[topic][i],
                ctx = subscription.context,
                cb = subscription.callback,
                fn = (typeof cb == "string" || (typeof cb == "object" && cb.constructor === String)) ? ctx[cb] : cb;

            response = fn.apply(ctx, args);
        }
        return response || this;
    };

    var isPublished = function (topic) {
        return !topics[topic] ? false : true;
    };

    return {
        publish: publish,
        subscribe: subscribe,
        isPublished: isPublished,
        attachTo: function (obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
            obj.isPublished = isPublished;
            return obj;
        }
    };

}());

var logger = (function () {
    var logToConsole = function (message) {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    };
    return {
        log: logToConsole
    };
}());

HL.Util.Stash = (function () {

    var isSupported = function () {
        return (typeof (Storage) !== "undefined" || sessionStorage && localStorage);
    };

    var setItem = function (store, key, value) {
        if (!isSupported || !store) {
            return false;
        }


        if (value) {
            store.setItem(key, value);
        } else {
            store.removeItem(key);
        }

        return true;
    };

    var getItem = function (store, key) {
        return store.getItem(key);
    };

    return {
        isSupported: isSupported,
        session: { set: function (k, v) { return setItem(sessionStorage, k, v); }, get: function (k) { return getItem(sessionStorage, k); } },
        local: { set: function (k, v) { return setItem(localStorage, k, v); }, get: function (k) { return getItem(localStorage, k); } }
    };
})();

HL.Util.Browser = {

    //simple dirty mobile OS detection
    isMobile: {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
        }
    },

    //simple dirty browser detection
    whatBrowser: {
        Chrome: function () {
            return !(navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.toLowerCase().indexOf("op") > -1) ? navigator.userAgent.match(/Chrome/i) : null;
        },
        Firefox: function () {
            return navigator.userAgent.match(/Firefox/i);
        },
        Safari: function () {
            return !(navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf("Safari") > -1) ? navigator.userAgent.match(/Safari/i) : null;
        },
        Explorer: function () {
            return navigator.userAgent.match(/MSIE/i);
        },
        //detection for the 4 major supported browsers
        all: function () {
            return (this.Chrome() || this.Firefox() || this.Safari() || this.Explorer());
        }
    },

    //IE real detection browser
    IE: function () {
        "use strict";
        var ret, isTheBrowser, actualVersion, jscriptMap, jscriptVersion;

        isTheBrowser = false;
        jscriptMap = { "5.5": "5.5", "5.6": "6", "5.7": "7", "5.8": "8", "9": "9", "10": "10", "11": "11" };
        jscriptVersion = new Function("/*@cc_on return @_jscript_version; @*/")();

        if (jscriptVersion !== undefined) {
            isTheBrowser = true;
            actualVersion = jscriptMap[jscriptVersion];
            if (actualVersion === undefined) {
                actualVersion = jscriptVersion;
            }
        }

        ret = { isTheBrowser: isTheBrowser, actualVersion: actualVersion };

        return ret;
    },

    dimensions: {
        Height: function () {
            return $(window).height();
        },
        Width: function () {
            return $(window).width();
        }

    }
};

HL.Util.Lib = {
    resolveScope: function (context, accessor) {
        var result = context[accessor] || context;
        return result;
    },

    moduleExtender: function (moduleArray) {
        for (var i = 0; i < length.moduleArray; i++) {
            HL.ModuleList.push(moduleArray[i]);
        }
    },

    depsExtender: function (depsArray) {
        for (var i = 0; i < length.depsArray; i++) {
            require.deps.push(depsArray[i]);
        }
    }
};

HL.Util.Url = {
    getUrlParameter: function (queryParameterName) {
        return decodeURI(
            window.location.search.replace(
                new RegExp("^(?:.*[&\\?]" + encodeURI(queryParameterName).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1")
        );
    }
};

HL.Util.UI = {
    centerWindow: function (e) {
        if (!$("." + e.sender._guid)[1]) {
            var element = e.element.parent(),
                eWidth = element.width(),
                wWidth = $(window).width(),

                newLeft = Math.floor(wWidth / 2 - eWidth / 2);
            e.element.parent().css({ left: newLeft });
        }
    },

    scrollTo: function (config) {
        config = config || {};

        if (config.element == null) {
            var xpos = config.xpos || 0;
            var ypos = config.ypos || 0;

            window.scrollTo(xpos, ypos);
        } else {
            var offset = config.element.offset();
            window.scrollTo(offset.left, offset.top);
        }
    }
};

HL.Util.Kendo = {
    Validation: {
        Create: function (ele) {
            var result = ele.kendoValidator().data("kendoValidator");
            return result;
        }
    },


    Notification: {

        Defaults: { parent: "#hrblNotifications", hideDelay: 0, pinned: true, top: 30, stacking: 'down', appendTo: null },

        Level: { Success: 'success', Error: 'error', Info: 'info', Warning: 'warning' },

        Create: function (config) {
            var result;

            config = config || {};

            result = $((config.parent || HL.Util.Kendo.Notification.Defaults.parent)).kendoNotification({
                position: {
                    pinned: config.pinned || HL.Util.Kendo.Notification.Defaults.pinned,
                    top: config.top || HL.Util.Kendo.Notification.Defaults.top
                },
                autoHideAfter: config.hideDelay || HL.Util.Kendo.Notification.Defaults.hideDelay,
                stacking: config.stacking || HL.Util.Kendo.Notification.Defaults.stacking,
                appendTo: config.appendTo || HL.Util.Kendo.Notification.Defaults.appendTo,
                show: HL.Util.UI.centerWindow,
                templates: [
                    {
                        type: HL.Util.Kendo.Notification.Level.Success,
                        template: '<div class="hrblNotice success"><i class="icon-chat-ln-2"></i><span class="text">#= message #</span></div>'
                    }, {
                        type: HL.Util.Kendo.Notification.Level.Error,
                        template: '<div class="hrblNotice error"><i class="alert icon-alert-ln-1"></i><span class="text">#= message #</span><span class="k-icon k-i-close">Hide</span></div>'
                    }, {
                        type: HL.Util.Kendo.Notification.Level.Info,
                        template: '<div class="hrblNotice info"><i class="alert icon-alert-ln-1"></i><span class="text">#= message #</span><span class="k-icon k-i-close">Hide</span></div>'
                    }, {
                        type: HL.Util.Kendo.Notification.Level.Warning,
                        template: '<div class="hrblNotice warning"><i class="alert icon-alert-ln-1"></i><span class="text">#= message #</span><span class="k-icon k-i-close">Hide</span></div>'
                    }
                ],

            }).data("kendoNotification");

            return result;
        }
    }
};

HL.Locale = (function () {

    var byCookie = function () {
        return HL.Cookie.getCookie('HerbalifeUser', 'Locale');
    };

    var byURL = function () {
        locale = location.pathname.split("/")[1];
        return locale.match(/[A-Za-z]{2}-[A-Za-z]{2}/) != null ? locale : false;
    };

    var getNormalizedURL = function () {

        var nurl = location.pathname;
        var regex = new RegExp("^/" + getLocale(), "ig");
        nurl = nurl.replace(regex, "");
        nurl = nurl.replace(/\/(Mb|Ds)/ig, "");

        return nurl;
    };

    var getLocale = function () {
        return byURL() ? byURL() : byCookie();
    };


    return {
        getLocale: getLocale,
        getNormalizedURL: getNormalizedURL
    };

})();

HL.Cookie = (function () {

    var getCookie = function (name, value) {
        var name = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                if (value) {
                    var values = c.substring(name.length, c.length).split('&');
                    for (var j = 0; j < values.length; j++) {
                        if (values[j].indexOf(value) == 0) {
                            return values[j].substring(value.length + 1, values[j].length);
                        }
                    }
                }
                else {
                    return c.substring(name.length, c.length);
                }
            }
        }
        return "";
    };

    return {
        getCookie: getCookie
    }

})();

function MvvmConfiguration() {

    this.Activate = function () {
        viewModelHelpers.wire.configure({ makeModel: function (o) { return kendo.observable(viewModelHelpers.mvvmUtil.asLoadable(o)); }, bind: kendo.bind, init: 'load' }).apply();
    };
}