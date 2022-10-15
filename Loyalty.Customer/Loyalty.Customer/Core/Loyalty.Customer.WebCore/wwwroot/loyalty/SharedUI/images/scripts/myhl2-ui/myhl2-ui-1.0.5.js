$(document).ready(function () {

        coreMVVM = new CoreMVVM();
        coreMVVM.Init();

        var omniture = new OmnitureModule();
        omniture.Init();

        //*** Login form rules
        $("#userName").keypress(function (e) {
            if (e.keyCode == 8 || e.keyCode == 46) return;
            var input = String.fromCharCode(e.which);
            var regex = /[a-zA-Z0-9_]/;
            if (!regex.test(input)) {
                if (!e.shiftKey && input != ".") {
                    switch (e.keyCode) {
                        case 8://backspace
                        case 9://tab
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
        });

        $("#password").blur(function () {
            var regex = /[a-zA-Z0-9_]{3,13}/;
            var value = "none";
            if (!regex.test($("#password").val()) || $("#password").val().length > 13) {
                value = "inline";
            }
            $("#pinErrorIcon").css("display", value);
        });

        //*** HFF modal from login
        $HFFModal = {
            container: null,
            launch: function (f) {
            }
        };

        //*** Login script for locales
        $('.firstFocusedControl').focus();

        $('#_PinManagmentLink').click(function (e) {
            e.preventDefault();
            var url = $(this).attr('href');
            window.open(url, "", "height=470,width=500,left=160,top=100,resizable=yes,toolbar=no,scrollbars=yes,menubar=yes,location=no,directories=no,status=yes");
        });

        $('#_DSIdManagmentLink').click(function (e) {
            e.preventDefault();
            var url = $(this).attr('href');
            window.open(url, "", "height=470,width=500,left=160,top=100,resizable=yes,toolbar=no,scrollbars=yes,menubar=yes,location=no,directories=no,status=yes");
        });

        ////*** Navigations
        try {
            var leftNav = $("#left_menu").kendoTreeView().data("kendoTreeView");

            // expand items
            var pathname = $(location).attr('pathname') + $(location).attr('search');
            //arr = pathname.split("/");

            var item = $("#left_menu a[href$='" + pathname + "']");
            if (leftNav && item && item.parent(".k-in")) {
                item.parent().addClass("k-state-selected");
                leftNav.expand(item);

                var parent = leftNav.parent(leftNav.findByText(leftNav.text(item)));
                leftNav.expand(parent);
            }
        } catch (err) {

        }

        if ($("#_LeftNavMenuPanel").length != 0 && $("#_LeftNavMenuPanel").children().length == 0) {
            $("#LeftNavMenuCell").remove();
            $("#ContentCell").css("border","none");
        }
            


        //convert top nav to javascript kendomenu for mobile devices and tablets
        if (HL.Util.Browser.isMobile.any()) {
            console.log('mobile detected');
            $('> a', $('#top_Nav > li > ul').parent()).click(function (e) {
                        e.preventDefault();
            });
            $('#top_Nav li a span').parent().click(function (e) {
                e.preventDefault();
            });

        }

        //Multiple tabs on main nab to adjust 100% width
        $("#top_Nav > li").css("min-width", (100 / $("#top_Nav > li").length).toFixed(2) + "%");


        //*** Search box
        var input = document.createElement('input');
        if (!('placeholder' in input)) {
            var placeholderText = $("#search_txt").attr('placeholder');
            if ($("#search_txt").val() == '') $("#search_txt").val(placeholderText);
            $("#search_txt").click(function () { if ($(this).val() == placeholderText) $(this).val(''); });
            $("#search_txt").blur(function () { if ($(this).val() == '') $(this).val(placeholderText); });
        }
        $("#SearchBox").submit(function () { if ($("#search_txt").val() == "") return false; });

        //*** Locale Selector
        var localeSelectorChangeHandler = function (e) {
            var sender = e.target;
            var locale = sender.options[sender.selectedIndex].value;

            if (locale && locale.length >= 5) {
                window.location.href = '/LocaleChange.ashx?locale=' + locale.substring(0, 5);
            }
        };
        $("select._localeSelector").change(localeSelectorChangeHandler);

        //**************** CLASSES FOR INPUT TYPE TEXT ****************//

        //only letters and space for inputs use class "lettersWithSpace"
        $('body').on('input keydown keyup', '.lettersWithSpace', function (e) {
            regex = /[^a-zA-Z ]/g;
            if (this.value.match(regex)) {
                this.value = this.value.replace(regex, '');
            }
        });

        //only numbers for inputs use class "onlyNumbers"
        $('body').on('input keydown keyup', '.onlyNumbers', function (e) {
            regex = /[^0-9]/g;
            if (this.value.match(regex)) {
                this.value = this.value.replace(regex, '');
            }
        });

        //only numbers for inputs use class "lettersNumbersWithSpace"
        $('body').on('input keydown keyup', '.lettersNumbersWithSpace', function (e) {
            regex = /[^a-zA-Z0-9 ]/g;
            if (this.value.match(regex)) {
                this.value = this.value.replace(regex, '');
            }
        });

        //**************** Prevent multiple logout ****************//
        $(".LogoutLink").click(function () {
            if (!$(this).hasClass("disabled")) $(this).addClass("disabled");
            else return false;
            });

        //Firing the modals on Kendo
        $(".hrblModal").each(function () {
            w = $(this).width();
            title = $("h4", $(this)).text();
            $(this).kendoWindow({
                modal: true,
                resizable: false,
                visible: false,
                width: w,
                title: title
            });
        });

        $(".k-window .k-icon").addClass("icon-x").text("");

        $(".modalBtn").click(function (e) {
            e.preventDefault();
            $("#" + $(this).attr("title")).data("kendoWindow").center();
            $("#" + $(this).attr("title")).data("kendoWindow").open();
        });

        //hot fix for MyLeads.aspx critical fix reported 11/3/13 MyHL 3 EMEA cutover
        $('table[id*="LeadListViewGrid"] tr:nth-child(2n) td:last-child').css('min-width', '150px');

    });


// ********************************** THIS IS NEEDED TO CALL FLASH EMBED FROM TS. TO BE ERASED. LEAVE IT TO THE EOF ********************************** //

//v1.7
// Flash Player Version Detection
// Detect Client Browser type
// Copyright 2005-2008 Adobe Systems Incorporated.  All rights reserved.
var isIE = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;
function ControlVersion() {
    var version;
    var axo;
    var e;
    // NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry
    try {
        // version will be set for 7.X or greater players
        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        version = axo.GetVariable("$version");
    } catch (e) {
    }
    if (!version) {
        try {
            // version will be set for 6.X players only
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");

            // installed player is some revision of 6.0
            // GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
            // so we have to be careful. 

            // default to the first public version
            version = "WIN 6,0,21,0";
            // throws if AllowScripAccess does not exist (introduced in 6.0r47)		
            axo.AllowScriptAccess = "always";
            // safe to call for 6.0r47 or greater
            version = axo.GetVariable("$version");
        } catch (e) {
        }
    }
    if (!version) {
        try {
            // version will be set for 4.X or 5.X player
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
            version = axo.GetVariable("$version");
        } catch (e) {
        }
    }
    if (!version) {
        try {
            // version will be set for 3.X player
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
            version = "WIN 3,0,18,0";
        } catch (e) {
        }
    }
    if (!version) {
        try {
            // version will be set for 2.X player
            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            version = "WIN 2,0,0,11";
        } catch (e) {
            version = -1;
        }
    }

    return version;
}
// JavaScript helper required to detect Flash Player PlugIn version information
function GetSwfVer() {
    // NS/Opera version >= 3 check for Flash plugin in plugin array
    var flashVer = -1;

    if (navigator.plugins != null && navigator.plugins.length > 0) {
        if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
            var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
            var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
            var descArray = flashDescription.split(" ");
            var tempArrayMajor = descArray[2].split(".");
            var versionMajor = tempArrayMajor[0];
            var versionMinor = tempArrayMajor[1];
            var versionRevision = descArray[3];
            if (versionRevision == "") {
                versionRevision = descArray[4];
            }
            if (versionRevision[0] == "d") {
                versionRevision = versionRevision.substring(1);
            } else if (versionRevision[0] == "r") {
                versionRevision = versionRevision.substring(1);
                if (versionRevision.indexOf("d") > 0) {
                    versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
                }
            }
            var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
        }
    }
        // MSN/WebTV 2.6 supports Flash 4
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
        // WebTV 2.5 supports Flash 3
    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
        // older WebTV supports Flash 2
    else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
    else if (isIE && isWin && !isOpera) {
        flashVer = ControlVersion();
    }
    return flashVer;
}
// When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available
function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision) {
    versionStr = GetSwfVer();
    if (versionStr == -1) {
        return false;
    } else if (versionStr != 0) {
        if (isIE && isWin && !isOpera) {
            // Given "WIN 2,0,0,11"
            tempArray = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
            tempString = tempArray[1];			// "2,0,0,11"
            versionArray = tempString.split(",");	// ['2', '0', '0', '11']
        } else {
            versionArray = versionStr.split(".");
        }
        var versionMajor = versionArray[0];
        var versionMinor = versionArray[1];
        var versionRevision = versionArray[2];
        // is the major.revision >= requested major.revision AND the minor version >= requested minor
        if (versionMajor > parseFloat(reqMajorVer)) {
            return true;
        } else if (versionMajor == parseFloat(reqMajorVer)) {
            if (versionMinor > parseFloat(reqMinorVer))
                return true;
            else if (versionMinor == parseFloat(reqMinorVer)) {
                if (versionRevision >= parseFloat(reqRevision))
                    return true;
            }
        }
        return false;
    }
}
function AC_AddExtension(src, ext) {
    if (src.indexOf('?') != -1)
        return src.replace(/\?/, ext + '?');
    else
        return src + ext;
}
function AC_Generateobj(objAttrs, params, embedAttrs) {
    var str = '';
    if (isIE && isWin && !isOpera) {
        str += '<object ';
        for (var i in objAttrs) {
            str += i + '="' + objAttrs[i] + '" ';
        }
        str += '>';
        for (var i in params) {
            str += '<param name="' + i + '" value="' + params[i] + '" /> ';
        }
        str += '</object>';
    }
    else {
        str += '<embed ';
        for (var i in embedAttrs) {
            str += i + '="' + embedAttrs[i] + '" ';
        }
        str += '> </embed>';
    }
    document.write(str);
}
function AC_FL_RunContent() {
    var ret =
      AC_GetArgs
      (arguments, ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
       , "application/x-shockwave-flash"
      );
    AC_Generateobj(ret.objAttrs, ret.params, ret.embedAttrs);
}
function AC_SW_RunContent() {
    var ret =
      AC_GetArgs
      (arguments, ".dcr", "src", "clsid:166B1BCA-3F9C-11CF-8075-444553540000"
       , null
      );
    AC_Generateobj(ret.objAttrs, ret.params, ret.embedAttrs);
}
function AC_GetArgs(args, ext, srcParamName, classid, mimeType) {
    var ret = new Object();
    ret.embedAttrs = new Object();
    ret.params = new Object();
    ret.objAttrs = new Object();
    for (var i = 0; i < args.length; i = i + 2) {
        var currArg = args[i].toLowerCase();
        switch (currArg) {
            case "classid":
                break;
            case "pluginspage":
                ret.embedAttrs[args[i]] = args[i + 1];
                break;
            case "src":
            case "movie":
                args[i + 1] = AC_AddExtension(args[i + 1], ext);
                ret.embedAttrs["src"] = args[i + 1];
                ret.params[srcParamName] = args[i + 1];
                break;
            case "onafterupdate":
            case "onbeforeupdate":
            case "onblur":
            case "oncellchange":
            case "onclick":
            case "ondblclick":
            case "ondrag":
            case "ondragend":
            case "ondragenter":
            case "ondragleave":
            case "ondragover":
            case "ondrop":
            case "onfinish":
            case "onfocus":
            case "onhelp":
            case "onmousedown":
            case "onmouseup":
            case "onmouseover":
            case "onmousemove":
            case "onmouseout":
            case "onkeypress":
            case "onkeydown":
            case "onkeyup":
            case "onload":
            case "onlosecapture":
            case "onpropertychange":
            case "onreadystatechange":
            case "onrowsdelete":
            case "onrowenter":
            case "onrowexit":
            case "onrowsinserted":
            case "onstart":
            case "onscroll":
            case "onbeforeeditfocus":
            case "onactivate":
            case "onbeforedeactivate":
            case "ondeactivate":
            case "type":
            case "codebase":
            case "id":
                ret.objAttrs[args[i]] = args[i + 1];
                break;
            case "width":
            case "height":
            case "align":
            case "vspace":
            case "hspace":
            case "class":
            case "title":
            case "accesskey":
            case "name":
            case "tabindex":
                ret.embedAttrs[args[i]] = ret.objAttrs[args[i]] = args[i + 1];
                break;
            default:
                ret.embedAttrs[args[i]] = ret.params[args[i]] = args[i + 1];
        }
    }
    ret.objAttrs["classid"] = classid;
    if (mimeType) ret.embedAttrs["type"] = mimeType;
    return ret;
}

// ********************************** END OF FLASH CALL. DO NOT PUT ANYTHING BELOW THIS ********************************** //