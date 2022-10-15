// --------------------------------------------------------------------------------------------------------------------
// <copyright file="hrbl-ui.js" company="Herbalife">
//   Herbalife 2013
// </copyright>
// <summary>
//   Global UI Javascript modules, used in MyHerbalife.com and Herbalife.com
//   Framwork: Require JS, jQuery JS and Kendo UI
// </summary>
// <authors>
// DTS - Content DEV UI | DTS - Integration 
// </authors>
// --------------------------------------------------------------------------------------------------------------------  

function alphaNumericNoSpace(e) {
    var input = String.fromCharCode(e.which);
    var regex = /[a-zA-Z0-9_]/;
    if (!regex.test(input)) {
        if (!e.shiftKey && input != ".") {
            switch (e.keyCode) {
                case 8://backspace
                case 9://tab
                case 13://enter
                case 35://end
                case 36://home
                case 37://left arrow
                case 38://up arrow
                case 39://right arrow
                case 40://down arrow
                case 46://delete
                    return;
            }
        }
        e.preventDefault();
    }
};

var IdleLogout = (function () {
    var config = {
        Act: { Handle: null, Action: null, Interval: 25 * 60 * 1000 },
        Warn: { Handle: null, Action: null, Interval: 20 * 60 * 1000 }
    };

    var configure = function (cfg) {
        setIfDefined(config.Act, 'Interval', cfg.Act);
        setIfDefined(config.Act, 'Action', cfg.Act);

        setIfDefined(config.Warn, 'Interval', cfg.Warn);
        setIfDefined(config.Warn, 'Action', cfg.Warn);
    };

    var setIfDefined = function (target, prop, value) {
        if (target && value && value[prop]) {
            target[prop] = value[prop];
        }
    };

    var reset = function () {
        tryReset(config.Warn);
        tryReset(config.Act);

        // We need to review this line, is causing a print of <P> in every scroll action.
        //$('body').append('<p>reset by something ' + new Date() + '</p>');

        start();
    };

    var tryReset = function (cfg) {
        if (cfg && cfg.Handle && window) { window.clearTimeout(cfg.Handle); }

    };

    var start = function () {
        tryStart(config.Warn);
        tryStart(config.Act);
    };

    var tryStart = function (cfg) {
        if (cfg && cfg.Action && cfg.Interval) {
            cfg.Handle = window.setTimeout(cfg.Action, cfg.Interval);
        }
    };

    //elements that have conflicts with this modal
    var conflictElement = [];

    var addConflictElement = function (element) {
        conflictElement.push(element);
    };

    var hideConflictElements = function () {
        for (x = 0; x < conflictElement.length; x++) {
            $(conflictElement[x]).css("visibility", "hidden");
        }
    };

    var showConflictElements = function (element) {
        for (x = 0; x < conflictElement.length; x++) {
            $(conflictElement[x]).css("visibility", "");
        }
    };

    return {
        reset: reset,

        start: start,

        addConflictElement: addConflictElement,

        hideConflictElements: hideConflictElements,

        showConflictElements: showConflictElements,

        configure: function (configuration) {
            reset();
            configure(configuration);
        }
    };
})();

$(function () {
    coreMvvm = new MvvmConfiguration();
    coreMvvm.Activate();

    //*** splash page
    if ($(".splash").length == 0) {
        try { //break in case there's no Cart available for any country
            var cartVM = viewModelHelpers.wire.getInstance('CartViewModel', 'shared');
            simpleMediator.attachTo(cartVM);
            cartVM.subscribe("topNavCartEvent", cartVM.activationHandler);
        } catch (error) {
            logger.log(error);
        }
    } //else splash();

    //*** Left Menu fixes
    if ($("#left_menu.leftMenuNew").length == 0) $("#LeftNavMenuCell").remove();

    try {
        var leftMenuVar = $(".leftMenuNew") ? ".leftMenuNew" : "#main-side-nav";
        var leftNav = $(leftMenuVar);

        //Getting page name
        var pathname = decodeURI($(location).attr('pathname') + $(location).attr('search')).toLowerCase();

        //Searching and assigning active class
        var item = $(leftMenuVar + " a").filter(function () {
            link = $(this).attr("href").toLowerCase();
            if ($("#ProductMenu").length > 0) link = "/ordering/" + link;
            return link == pathname;
        });
        if (leftNav && item) item.parents('li').addClass("active");
    } catch (err) {
    }

    $("#main-left-container > span a").click(function () {
        var that = this;
        if ($("#main-side-nav:visible").length != 0) { //visible
            $(that).removeClass();
            $(that).addClass("icon-arrow-circle-fl-29");
            $("#main-side-nav").slideUp();

            $(window).resize(function () {
                if ($(window).width() > 960) {
                    $(that).removeClass();
                    $(that).addClass("icon-arrow-circle-fl-30");
                    $("#main-side-nav").slideDown();
                }
                else {
                    $(that).removeClass();
                    $(that).addClass("icon-arrow-circle-fl-29");
                    $("#main-side-nav").slideUp();
                }
            });
        }
        else { //not visible
            $(that).removeClass();
            $(that).addClass("icon-arrow-circle-fl-30");
            $("#main-side-nav").slideDown();
        }
    });

    //Left Menu fixed
    scrollFixed();

    //*** Placeholders for I8 and IE9
    var testElement = document.createElement('input');
    if (!('placeholder' in testElement)) {
        $("input[placeholder]").each(function () {
            if ($(this).attr("type") == "password")
                $(this).before('<label for="' + $(this).attr("id") + '" class="placeholder">' + $(this).attr('placeholder') + '</label>');
            else
                $(this).val($(this).attr('placeholder'));
        });

        $("input[placeholder]").focusin(function () {
            if ($(this).attr("type") == "password") {
                if ($(this).val() == "") $('label[for="' + $(this).attr("id") + '"]').hide();
            }
            else
                if ($(this).val() == $(this).attr('placeholder')) $(this).val('');
        });

        $("input[placeholder]").blur(function () {
            if ($(this).val() == '') {
                if ($(this).attr("type") == "password")
                    $('label[for="' + $(this).attr("id") + '"]').show();
                else
                    $(this).val($(this).attr('placeholder'));
            }
        });

        $("#pin").bind('propertychange change', function () {
            if ($("#pin").val() == '')
                $('label[for="pin"]').show();
            else
                $('label[for="pin"]').hide();
        });

    }

    //*** Search box
    $("#rightTopNav input.search, #mobile-main-nav input.search").keypress(function (event) {
        var locale;
        //Get locale value from current selection    
        $.each($(".localeSelector option").filter(":selected"),
        function (i, val) {
            if (val.value) {
                if (val.length >= 5) {
                    locale = locale.substr(0, 5);
                }

                locale = val.value;
            }
        });
        if (event.keyCode == 13) {
            if ($(this).val() == "") return false;
            else {
                event.preventDefault();
                window.location.href = '/ed/' + locale + '/SearchResults?q=' + $(this).val();
            }
        }
    });

    //*** Local Selector
    $("#closeLocalSel").click(function () {
        $("#localeSel").click();
    });

    $("#localeSel, #localeSelMobile").click(function (e) {
        $(this).toggleClass("selected");
        if ($(".icon-chevron-down", this).length) $(".icon-chevron-down", this).toggleClass("icon-chevron-up");
        else $(".icon-chevron-up", this).toggleClass("icon-chevron-down");

        if ($("#locales").is(":visible")) $("#locales").slideUp(400);
        else $("#locales").slideDown(400);

        e.stopImmediatePropagation();
    });

    var localeSelectorChangeHandler = function (e) {
        var sender = e.target;
        var locale = sender.options[sender.selectedIndex].value;

        if (locale) {
            if (locale.length >= 5) {
                locale = locale.substr(0, 5);
            }

            $.get('/api/localeSelector/' + locale + '?url=' + encodeURI(window.location.href))
                .success(function (data, status) {
                    window.location.href = data;
                })
                .error(function (jqXHR, textStatus, errorThrown) {
                    logger.log('An error has ocurred executing locale change api.');
                });
        }
    };

    $("select.localeSelector").kendoDropDownList({
        height: 500
    });
    $("select.localeSelector").change(localeSelectorChangeHandler);

    //*** Nav position        
    var nav = $("#main-nav");
    var navPos = nav.offset();
    $(window).scroll(function () {
        //code for fixed navigation
        if (nav.length != 0) {
            if (($(this).scrollTop() > navPos.top) && !nav.hasClass('fixed')) {
                nav.addClass('fixed');
            } else if ($(this).scrollTop() <= navPos.top && nav.hasClass('fixed')) {
                nav.removeClass('fixed');
            }
        }
    });

    //*** Footer fix when not enough content   
    if ((h = $(window).height() - $("body").height()) > 0) {
        $("#hrblSiteWrapper > footer").css("margin-top", h + "px");
    }

    var resizeId;
    $(window).resize(function () {
        clearTimeout(resizeId);
        resizeId = setTimeout(function () {
            $("#hrblSiteWrapper > footer").css("margin-top", "0px");
            h = $(window).height() - $("body").height();
            if ((h = $(window).height() - $("body").height()) > 0) {
                $("#hrblSiteWrapper > footer").css("margin-top", h + "px");
            }
        }, 200);
    });

    //*** Buttons for K-grid
    if ($(".k-grid").length) {
        //Add record buttons on k-grid
        $(".k-grid-add").removeClass("k-button");
        $(".k-grid-add").addClass("btn"); //styling of "Add Shipping Address" button
    }

    //*** modal window
    $(".hrblModal").each(function () {
        hrblModal = this;
        var model;

        model = new modalWindowViewModel(hrblModal).load();
    });

    $('.modalBtn[title]').live("mouseenter", function () {
        $(this).data("title", $(this).attr("title")).removeAttr("title");
    });

    $('.modalBtn').live("click", function (e) {
        e.preventDefault();
        actualModal = $("#" + $(this).data("title") + ".hrblModal").data("kendoWindow");
        if (actualModal != null) {

            img = $("img", actualModal.element[0]);
            if (img.length != 0) {
                if (img.prop('complete')) {
                    actualModal.open().center();
                } else {
                    img.on("load", function () {
                        img.show();
                        actualModal.open().center();
                    }).error(function () {
                        img.hide();
                        actualModal.open().center();
                    });
                }
            } else {
                actualModal.open().center();
            }


        }

    });

    $(window).resize(function () {
        if ($('[data-centerwindow]:visible').length != 0) {
            $("[data-centerwindow]:visible").data("kendoWindow").center();
        }
    });

    //*** Alert Messages
    if ($("#systemAlert")) {

        var numPar = $('#systemAlert div').length;
        var actualDiv = $('#systemAlert div:first-child');
        var currentPar = 1;

        $('#systemAlert span b').html(currentPar + ' of ' + numPar);

        $('#systemAlert .next').click(function () {
            if (currentPar >= numPar) {
                currentPar = numPar;
            } else {
                currentPar++;
                var nextDiv = actualDiv.next();
                actualDiv.fadeOut(200, function () { nextDiv.fadeIn(200); });
                actualDiv = nextDiv;
                $('#systemAlert span b').html(currentPar + ' of ' + numPar);
            }
        });

        $('#systemAlert .prev').click(function () {
            if (currentPar <= 1) {
                currentPar = 1;
            } else {
                currentPar--;
                var nextDiv = actualDiv.prev();
                actualDiv.fadeOut(200, function () { nextDiv.fadeIn(400); });
                actualDiv = nextDiv;
                $('#systemAlert span b').html(currentPar + ' of ' + numPar);
            }
        });

        $('#systemAlert button').click(function () {
            $("#systemAlert p").slideToggle(600);
        });

    }

    //*** Video
    if ($(".videoWrapper").length != 0) {
        $('.videoWrapper iframe').each(function () {
            var separator = "?";
            var url = $(this).attr("src");

            if (url.indexOf("?") != -1) {
                separator = "&";
            }
            $(this).attr("src", url + separator + "wmode=transparent");
        });
    }

    if (window && window._AnalyticsFacts_ && window._AnalyticsFacts_.Id) {
        //*** idle timeout handling
        var idleWarningWindow = '#idleLogout';
        var idleWarningContentUrl = '/ed/' + _AnalyticsFacts_.LanguageCode + '-' + _AnalyticsFacts_.CountryCode + '/pages/IdleTimeoutWarning.html';
        var handle = "";
        var logoutUrl = '/Authentication/Logout';

        IdleLogout.configure({
            Warn: {
                Action: function () {
                    if (handle == "") {
                        //Check if fragment exists
                        $.get(idleWarningContentUrl)
                            .done(function () {

                                try {
                                    handle = $(idleWarningWindow).data("kendoWindow");
                                    handle.refresh({
                                        url: idleWarningContentUrl
                                    });
                                    $(idleWarningWindow + " .btnForward").live("click", function () { handle.close(); });

                                    //On close
                                    handle.bind("close", function () {
                                        IdleLogout.showConflictElements();
                                        IdleLogout.reset();
                                    });

                                    IdleLogout.hideConflictElements();

                                    handle.bind("refresh", function () {
                                        handle.open().center();
                                    });
                                } catch (err) { }

                            }).fail(function () {
                                // not exists code
                                handle = "fail";
                                logger.log("There's no fragment to show for Session Timeout. Reseting the timer");
                                IdleLogout.reset();
                            });
                    }
                    else {
                        if (handle == "fail")
                            IdleLogout.reset();
                        else {
                            IdleLogout.hideConflictElements();
                            handle && handle.open().center();
                        }
                    }
                }
            },
            Act: {
                Action: function () { document.location.href = logoutUrl; }
            }
        });
        // wire up resetting actions
        $(window).scroll(IdleLogout.reset);
        $(window).click(IdleLogout.reset);
        // start the timer
        IdleLogout.start();

    }

    //Put  locale text from current selection in Country Header
    var locale;
    $.each($(".localeSelector option").filter(":selected"),
    function (i, val) {
        if (val.value) {
            locale = val.text;
            $('#localeSel').html('<i class="icon-chevron-down"></i> ' + locale);
        }
    });

    $('a[href="/Home/RedirectToProfileCreate"]').hide();

    //Link Box
    if ($('#classicLinkBox') && $('#classicLinkBox').length != 0) {
        $('#classicLinkBox').prepend("<i class='icon-x'></i>");
        $('#classicLinkBox i').click(function () {
            $('#classicLinkBox').remove();
        });
    }

    //**************** Prevent multiple logout ****************//
    $("#myProfileDropDown a.full-width").click(function () {
        if (!$(this).hasClass("disabled")) {
            $(this).addClass("disabled");
        }
        else { return false; }
    });

});

//Fixes left search to scroll SearchResults page
function scrollFixed() {
    var leftMenuFixed = $('.scroll-fixed');
    if (leftMenuFixed.length != 0) {
        var leftMenuOffset = leftMenuFixed.offset().top - $('#main-nav').height();
        $(window).scroll(function () {
            if (($(this).scrollTop() > leftMenuOffset) && !leftMenuFixed.hasClass('fixed')) {
                leftMenuFixed.addClass('fixed');
            } else if ($(this).scrollTop() <= leftMenuOffset && leftMenuFixed.hasClass('fixed')) {
                leftMenuFixed.removeClass('fixed');
            }
        });
    }
};
