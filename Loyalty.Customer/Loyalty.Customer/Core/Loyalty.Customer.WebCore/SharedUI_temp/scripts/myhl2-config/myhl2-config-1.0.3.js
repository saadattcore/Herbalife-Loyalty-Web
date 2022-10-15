// --------------------------------------------------------------------------------------------------------------------
// <copyright file="myhl2-config" company="Herbalife">
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

//Core MVVM
function CoreMVVM() {

    this.Init = function () {

        // these models rely on loggen in user.
        if (window && window._AnalyticsFacts_ && window._AnalyticsFacts_.Id) {

            mvvmUtil.attachTo(new AlertsViewModel()).wireModelsToElements(['#alertsLocaleSelector, #alertIcon, #bannerAlertContainer']).load();
            mvvmUtil.attachTo(new VolumeViewModel()).wireModelsToElements(['#headerVolumeSummary, .volumeData']).load();
            mvvmUtil.attachTo(new ProfileViewModel()).wireModelsToElements(['.profileData, #myProfileDropDown, .headerMemberInfo']).load();

            wire.configure({ makeModel: function (o) { return kendo.observable(mvvmUtil.asLoadable(o)); }, bind: kendo.bind, init: 'load' }).apply();

        }
    };
}

function RedirectToAlerts() {
    window.location = "/Account/Communication/NotificationAlerts.aspx";
}

Function.prototype.instantiate = function (constructorArguemnts) {
    var context = this,
        invokable = function () {
            context.apply(this, constructorArguemnts);
        };

    invokable.prototype = context.prototype;
    return new invokable();
};

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

        if (!topics[topic]) {
            return false;
        }

        args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = topics[topic].length; i < l; i++) {

            var subscription = topics[topic][i],
                ctx = subscription.context,
                cb = subscription.callback,
                fn = (typeof cb == "string" || (typeof cb == "object" && cb.constructor === String)) ? ctx[cb] : cb;

            fn.apply(ctx, args);
        }
        return this;
    };

    return {
        publish: publish,
        subscribe: subscribe,
        attachTo: function (obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
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
            return navigator.userAgent.match(/Chrome/i);
        },
        Firefox: function () {
            return navigator.userAgent.match(/Firefox/i);
        },
        Safari: function () {
            return navigator.userAgent.match(/Safari/i);
        },
        Explorer: function () {
            return navigator.userAgent.match(/MSIE/i);
        },
        //detection for the 4 major supported browsers
        all: function () {
            return (this.Chrome() || this.Firefox() || this.Safari() || this.Explorer());
        }
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