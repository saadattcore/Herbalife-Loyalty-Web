customBindings();

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

    var notifyModelsCreated = function() {
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
    var apply = function () {

        $('[wire-model]').each(function () {
            try {
                // config
                var args = ($(this).attr("wire-mode") || defaultMode).split(','),
                    parsedArgs,
                    mode,
                    modelName = $(this).attr("wire-model");

                // first arg is the mode.
                mode = ($.trim(args.shift()) == wireMode.own) ? wireMode.own : defaultMode;

                // rest to be parsed from the mode initialization
                parsedArgs = parseConstructorArguments(args);

                // model
                var model = getInstance(modelName, mode, parsedArgs);

                // binding
                configuration.bind(this, model);
            } catch (e1) {
                logger.log(e1);
            }

        });

        try {

            notifyModelsCreated();

            activateLoaders();
        } catch (e2) {
            logger.log(e2);
        }

        return this;
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
        modelsCreated: modelsCreated
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
        {
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
        }
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

        $.get(this.path)
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
                logger.log(status + ' : ' + error + " response: " + context.responseText);
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


// Custom Bindings
function customBindings() {
    // Kendo binding to set a view model's field from HTML one way (in case DOM bound to model,  but model value shoudl be passed from DOM)
    kendo.data.binders.oneWayValueFromDOM = kendo.data.Binder.extend({
        refresh: function () {
            // HTML5 supports this.element.dataset.initialvalue / but compatibility with IE is an issue so use $().attr()
            var valueFromDOM = $(this.element).data('initialvalue');
            this.bindings.oneWayValueFromDOM.set(valueFromDOM);
        }
    });

    //Kendo Window Center
    kendo.data.binders.widget.centerWindow = kendo.data.Binder.extend({
        init: function (widget, bindings, options) {
            try {
                kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
                var flag = String(this.bindings['centerWindow'].path) === "true";
                flag && widget && widget.center && widget.center();
            } catch (error) {
                logger.log(error);
            }
        },
        refresh: function () {
        }
    });

    kendo.data.binders.widget.getWidget = kendo.data.Binder.extend({
        init: function (widget, bindings, options) {
            try {
                kendo.data.Binder.fn.init.call(this, widget.element[0], bindings, options);
                var fieldName = String(this.bindings['getWidget'].path);
                bindings.getWidget.parents[0][fieldName] = widget;
            } catch (error) {
                logger.log(error);
            }
        },
        refresh: function () {
        }
    });
}

// content list view model - generic CMS content lists 
function ContentListModel(path) {
    this.items = [];
    this.randomItem = null;
    this.originId = null;
    this.title = null;
    this.path = '/api/ContentListItem?id=' + path + "&tags=";
    this.loading = true;
    this.dataHandler = function(data) {
        if (data != null) {
            this.set('loading', false);
            this.set('loaded', true);
            this.set("title", data.Title);
            this.set("originId", data.OriginId);
            if (data.Items) {
                var item = data.Items[Math.floor(Math.random() * data.Items.length)];

                this.set('randomItem', {
                    originId: item.OriginId || '',
                    body: item.Body || ''
                });
                while (item = data.Items.shift()) {
                    this.items.push({
                        originId: item.OriginId || '',
                        body: item.Body || ''
                    });
                }
            } else {
                this.set('error', true);
                this.set('loading', false);
            }
        };
    };
}

// profile
function ProfileViewModel() {
    this.path = '/api/DistributorProfile/';
    this.Name = '';
    this.Salutation = '';
    this.TeamLevelName = '';
    this.DisplayBizworksStatus = '';
    this.loading = true;
    this.IsBizworksSubscriber = false;
    this.dataHandler = function(data) {
        if (data) {
            this.set("loading", false);
            this.set("loaded", true);
            this.set("Name", data.FullNamePattern);
            this.set("Salutation", data.Salutation);
            this.set("TeamLevelName", data.TeamLevelName);
            this.set("DisplayBizworksStatus", data.DisplayBizworksStatus);
            this.set("IsBizworksSubscriber", data.IsBizworksSubscriber);
        }
    };
}

// alerts
function AlertsViewModel() {
    // internal class variables
    var _alertsContainerStorageKey = 'ds_alerts_container_collapsed_status';

    this.currentIndex = 0;
    this.path = '/api/AlertsV1/';
    this.AlertCount = "0";
    this.EnvelopeClass = 'dsInboxEmpt';
    this.BannerAlerts = [];
    this.CurrentAlert = {};
    this.UpDownClass = 'up';
    this.ContainerPadding = '5px';
    this.Collapsed = false;
    this.NotificationColors = {        
        1: '#F7DBCC',
        2: '#DAE8AF',
        3: '#FAE4B2'
    };
    
    this.onBeforeLoad = function() {
        if (sessionStorage != undefined) {
            var storeValue = sessionStorage.getItem(_alertsContainerStorageKey);

            if (storeValue && storeValue === true) {
                this.set('Collapsed', true);
            }
        }
    };

    this.dataHandler = function(data) {
        if (data) {
            var totalNumber = data.UnreadRoutedAlertCount;
            if (totalNumber > 0) {
                this.set('EnvelopeClass', 'dsInboxBubble');
                this.set('AlertCount', totalNumber > 9 ? '9+' : totalNumber);
            }

            var visibleAlerts = [];
            $.each(data.AlertsMessage, function (i, item) {
                if ($.inArray('/home/default1.aspx', item.ValidPages) > -1) {
                    item.ValidPages.push('/home/default.aspx');
                    item.ValidPages.push('/home/default');
                }

                if ($.inArray(window.location.pathname.toLowerCase(), item.ValidPages) > -1) {
                    visibleAlerts.push(item);
                }
            });

            var alertData = null;
            //Green System Notifications
            if (visibleAlerts && visibleAlerts.length > 0) {
                var colors = this.get('NotificationColors');
                $.each(visibleAlerts, function (i, v) {
                    v.NotificationColor = colors[v.BannerTypeId];
                    v.CollapseClass = v.CanCollapse ? 'upDownArrows icon-chevron-down' : '';
                });
                alertData = visibleAlerts[this.get("currentIndex")];
            }
            this.set('BannerAlerts', visibleAlerts);
            this.set('CurrentAlert', alertData);
        }
    };

    this.getBannerType = function() {
        var alertData = this.get('CurrentAlert');
        if (alertData && alertData.BannerTypeId) {
            var value = 'hrblAlert';
            switch (alertData.BannerTypeId) {
            case 1:
                value = 'hrblAlert';
                break;
            case 2:
                value = 'hrblAlert general';
                break;
            case 3:
                value = 'hrblAlert info';
                break;
            }

            return value;
        }

        return 'hrblAlert';
    };

    this.previousAlert = function() {
        var bannerAlerts = this.get('BannerAlerts');
        var _currentIndex = this.get("currentIndex");

        if (bannerAlerts && bannerAlerts.length > 0 && _currentIndex > 0) {
            _currentIndex--;
            this.set('CurrentAlert', bannerAlerts[_currentIndex]);
            this.set("currentIndex", _currentIndex);
        }
    };

    this.nextAlert = function() {
        var bannerAlerts = this.get('BannerAlerts');
        var _currentIndex = this.get("currentIndex");

        if (bannerAlerts && bannerAlerts.length > 0 && _currentIndex < bannerAlerts.length - 1) {
            _currentIndex++;
            this.set('CurrentAlert', bannerAlerts[_currentIndex]);
            this.set("currentIndex", _currentIndex);
        }
    };

    this.getCurrentCount = function (localizedOf) {
        var _currentIndex = this.get("currentIndex");
        var bannerAlerts = this.get('BannerAlerts');
        return (_currentIndex + 1) + ' ' + localizedOf + ' ' + bannerAlerts.length;
    };

    this.getShouldShowBanner = function(isEnabled) {
        var bannerAlerts = this.get('BannerAlerts');
        return !isEnabled || (isEnabled && bannerAlerts.length <= 0);
    };

    this.getShouldHidePagination = function() {
        var bannerAlerts = this.get('BannerAlerts');
        return bannerAlerts.length = 1;
    };

    this.collapseAlert = function() {
        var isCollapsed = !this.get('Collapsed');

        if (isCollapsed) {
            this.set('UpDownClass', 'down');
            this.set('ContainerPadding', '15px 5px');
        } else {
            this.set('UpDownClass', 'up');
            this.set('ContainerPadding', '5px');
        }

        if (sessionStorage != undefined) {
            sessionStorage.setItem(_alertsContainerStorageKey, isCollapsed);
        }

        this.set('Collapsed', isCollapsed);
    };
    
    this.CollapseNotification = function (event) {
        if (!event || !event.data || !this.get('BannerAlerts'))
            return;

        //The DOM element
        var target = $(event.currentTarget);
        if (target) {
            var notificationId = event.data.Id;
            var notificationIndex = this.GetNotificationIndex(notificationId);
            var tempNotifications = this.get('BannerAlerts');

            if (tempNotifications[notificationIndex] && tempNotifications[notificationIndex].CanCollapse) {
                var currentH = $(target).height();
                var maxH = $(target).css('height', 'auto').height();
                if (tempNotifications[notificationIndex].HasLink)
                    maxH += 20;
                
                $(target).css('height', currentH);
                
                //Collapse/Expand animation
                $(target).animate({
                    height: tempNotifications[notificationIndex].IsCollapsed
                            ? maxH
                            : '20'
                }, 150);

                this.set('BannerAlerts[' + notificationIndex + '].IsCollapsed', !tempNotifications[notificationIndex].IsCollapsed);
                this.set('BannerAlerts[' + notificationIndex + '].CollapseClass', tempNotifications[notificationIndex].IsCollapsed
                                                                                            ? 'upDownArrows icon-chevron-down'
                                                                                            : 'upDownArrows icon-chevron-up');
            }
        }
    };

    this.GetNotificationIndex = function (notificationId) {
        var result = null;
        if (this.BannerAlerts && this.BannerAlerts.length > 0) {
            var index = $.map(this.BannerAlerts, function (obj, idx) {
                if (obj.Id == notificationId)
                    return idx;
            });

            result = index;
        }
        return result;
    };
}

function VolumeViewModel() {
    this.path = '/api/Volume/';

    this.CurrentMonthVolume = { "VolumeMonth": 0, "HeaderText": "...", "PlainHeaderText": "...", "PPV": 0, "DV": 0, "TV": 0, "PV": 0, "GV": 0, "HeaderVolume": 0 };

    this.LastMonthVolume = null;

    this.ChartData = [{ "name": "PPV", "value": 0 }, { "name": "DLV", "value": 0 }, { "name": "PV", "value": 0 }, { "name": "GV", "value": 0 }, { "name": "TV", "value": 0 }];

    this.MonthName = "";

    this.loading = true;

    this.error = "";

    this.dataHandler = function(data, status, xhr) {
        if (xhr && xhr.status == 200 && data && $.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                var v = this.cleanHeaderText(data[i]);
                this.set("MonthName", v.MonthName);
                if (v.IsCurrentMonth) {
                    this.set("CurrentMonthVolume", v);
                    this.setChartValues(v);
                    this.createChart("#volChart");
                    this.set("loading", false);
                    this.set("loaded", true);
                } else {
                    this.set("LastMonthVolume", v);
                    this.createChart("#volChart");
                    this.set("loading", false);
                    this.set("loaded", true);
                }
            }
        } else {
            // no transport issue, but data not as expected.
            this.set("error", "inline");
        }
    };

    this.onLoadError = function(xhr, status, statusText) {
        this.set("error", "inline");
    };

    this.cleanHeaderText = function(volumeObject) {
        if (volumeObject && volumeObject.HeaderText) {
            volumeObject.PlainHeaderText = volumeObject.HeaderText.replace(/\<[^>]+\>/, ' ');
        }
        return volumeObject;
    };

    this.setChartValues = function(volume) {
        this.set(
            "ChartData",
            [{ "name": "PPV", "value": volume.PPV }, { "name": "DLV", "value": volume.DV }, { "name": "PV", "value": volume.PV }, { "name": "GV", "value": volume.GV }, { "name": "TV", "value": volume.TV }]);
    };

    this.createChart = function(selector) {
        var chart = $(selector);
        if (!(chart && chart.length)) {
            return;
        }
        chart.kendoChart({
            dataSource: new kendo.data.DataSource({
                data: this.ChartData
            }),
            chartArea: {
                width: 280,
                background: "#EEE"
            },
            title: {
                text: this.MonthName,
                position: "bottom"
            },
            legend: {
                visible: true,
                position: "top"
            },
            seriesDefaults: {
                type: "column",
                labels: {
                    visible: false
                }
            },
            series: [
                {
                    field: "value",
                    color: "#75c52a",
                    gap: .9,
                    border: 0,
                    overlay: {
                        gradient: "none"
                    }
                }
            ],
            categoryAxis: {
                field: "name",
                majorGridLines: {
                    visible: false
                }
            },
            valueAxis: [
                {
                    majorGridLines: {
                        visible: false
                    }
                }
            ],
            tooltip: {
                visible: true,
                template: "#= category #: #= value #",
                color: "gray",
                background: "white"
            }
        });
    };
};