//// The script to open event detail window
function openEventDetailWindow(eventID) {
    var arr = document.URL.split("/");
    if (arr.length > 2) {
        var url = arr[0] + '//' + arr[2] + '/Events/EventDetail.aspx?eid=' + eventID;
        window.open(url, "", "height=400,width=650,left=160,top=100,resizable=yes,toolbar=yes,scrollbars=yes,menubar=yes,location=no,directories=no,status=yes");
    }
}

function openEventDetailWindowAnonmyous(eventID) {
    var url = '/Events/Public/EventDetail.aspx?eid=' + eventID;
    window.open(url, "", "height=500,width=650,left=160,top=100,resizable=yes,toolbar=yes,scrollbars=yes,menubar=yes,location=no,directories=no,status=yes");
}


// Support for firefox - add click event to a link
function addClickEventToLink(id) {
    var linkElement = document.getElementById(id);
    if (linkElement && typeof (linkElement.click) == 'undefined') {
        linkElement.click = function () {
            var result = true;
            if (linkElement.onclick) result = linkElement.onclick();
            if (typeof (result) == 'undefined' || result) {
                eval(linkElement.href);
                linkElement.click();
            }
        }
    }
}


///////////////////////////////////////
// Support for flash activation - start
//Copyright 2006 Adobe Systems, Inc. All rights reserved. //v1.0
function AC_AddExtension(src, ext) {
    if (src.indexOf('?') != -1)
        return src.replace(/\?/, ext + '?');
    else
        return src + ext;
}

function AC_Generateobj(objAttrs, params, embedAttrs) {
    var str = '<object ';
    for (var i in objAttrs)
        str += i + '="' + objAttrs[i] + '" ';
    str += '>';
    for (var i in params)
        str += '<param name="' + i + '" value="' + params[i] + '" /> ';
    str += '<embed ';
    for (var i in embedAttrs)
        str += i + '="' + embedAttrs[i] + '" ';
    str += ' ></embed></object>';

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
            case "ondblClick":
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
            case "id":
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

function dynamicDividerLine() {

    if (document.getElementById('3tabsbox') && document.getElementById('tab12-col1')) {
        var tab12_col1_height = document.getElementById('tab12-col1').offsetHeight;
        if (tab12_col1_height > 130) {

        }
    }
    if (document.getElementById('3tabsbox') && document.getElementById('tab1-col1')) {

        var tab1_col1_height = document.getElementById('tab1-col1').offsetHeight;
        
        var tab1_col2_height = document.getElementById('tab1-col2').offsetHeight;
        

        if ((tab1_col1_height > 130) || (tab1_col2_height > 130)) {
        
            var tab1_tallest;
            if (tab1_col1_height > tab1_col2_height) {
                tab1_tallest = tab1_col1_height;
                document.getElementById('tab1-divider').style.height = tab1_tallest + 'px';
            }
            else if (tab1_col2_height > tab1_col1_height) {
                tab1_tallest = tab1_col2_height;
                document.getElementById('tab1-divider').style.height = tab1_tallest + 'px';
            }
            else { /* DO NOTHING */ }
        }
        else if ((tab1_col1_height < 130) && (tab1_col2_height < 130)) {
        }
        else { /* DO NOTHING */ }

    }
}



function adjustDividerLineTab2() {

    if (document.getElementById('3tabsbox') && document.getElementById('tab1-col2')) {

        var tab2_col1_height = document.getElementById('tab2-col1').offsetHeight;
        var tab2_col2_height = document.getElementById('tab2-col2').offsetHeight;

        if ((tab2_col1_height > 130) || (tab2_col2_height > 130)) {
            var tab2_tallest;
            if (tab2_col1_height > tab2_col2_height) {
                tab2_tallest = tab2_col1_height;
                document.getElementById('tab2-divider').style.height = tab2_tallest + 'px';
            }
            else if (tab2_col2_height > tab2_col1_height) {
                tab2_tallest = tab2_col2_height;
                document.getElementById('tab2-divider').style.height = tab2_tallest + 'px';
            }
            else { /* DO NOTHING */ }
        }
        else if ((tab2_col1_height < 130) && (tab2_col2_height < 130)) {
        }
        else { /* DO NOTHING */ }

    }
}



function adjustDividerLineTab3() {

    if (document.getElementById('3tabsbox') && document.getElementById('tab3-col1')) {

        var tab3_col1_height = document.getElementById('tab3-col1').offsetHeight;
        var tab3_col2_height = document.getElementById('tab3-col2').offsetHeight;

        if ((tab3_col1_height > 130) || (tab3_col2_height > 130)) {
            var tab3_tallest;
            if (tab3_col1_height > tab3_col2_height) {
                tab3_tallest = tab3_col1_height;
                document.getElementById('tab3-divider').style.height = tab3_tallest + 'px';
            }
            else if (tab3_col2_height > tab3_col1_height) {
                tab3_tallest = tab3_col2_height;
                document.getElementById('tab3-divider').style.height = tab3_tallest + 'px';
            }
            else { /* DO NOTHING */ }
        }
        else if ((tab3_col1_height < 130) && (tab3_col2_height < 130)) {
        }
        else { /* DO NOTHING */ }

    }
}




function hideAllWraps() {
    if (document.getElementById('dynamic_wrap1a') != null)
        document.getElementById('dynamic_wrap1a').style.display = 'none';
    if (document.getElementById('dynamic_wrap1b') != null)
        document.getElementById('dynamic_wrap1b').style.display = 'none';
    if (document.getElementById('dynamic_wrap2') != null)
        document.getElementById('dynamic_wrap2').style.display = 'none';
    if (document.getElementById('dynamic_wrap3') != null)
        document.getElementById('dynamic_wrap3').style.display = 'none';
}


function showDynamicWrap1a() {
    if (document.getElementById('dynamic_wrap1a') != null)
        document.getElementById('dynamic_wrap1a').style.display = 'inline';
}


// dynamic_wrap1b - TWO COLUMNS;
function showDynamicWrap1b() {
    if (document.getElementById('dynamic_wrap1b') != null)
        document.getElementById('dynamic_wrap1b').style.display = 'inline';
}

// dynamic_wrap2 - TWO COLUMN;
function showDynamicWrap2() {
    if (document.getElementById('dynamic_wrap2') != null)
        document.getElementById('dynamic_wrap2').style.display = 'inline';
}

// dynamic_wrap3 - TWO COLUMN;
function showDynamicWrap3() {
    if (document.getElementById('dynamic_wrap3') != null)
        document.getElementById('dynamic_wrap3').style.display = 'inline';
}

function showHealthyIcons() {
    if (document.getElementById('healthy_icons') != null)
        document.getElementById('healthy_icons').style.display = 'inline';
}
function hideHealthyIcons() {
    if (document.getElementById('healthy_icons') != null)
        document.getElementById('healthy_icons').style.display = 'none';
}


function toggleTab(id) {
    if (id == 'tab1') {
        hideAllWraps();
        showDynamicWrap1a();
        hideHealthyIcons();
        if (document.getElementById('vis1') != null)
            document.getElementById('vis1').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-on.gif)';
        if (document.getElementById('vis1-header') != null)
            document.getElementById('vis1-header').style.color = '#005b7f';
        if (document.getElementById('vis2') != null)
            document.getElementById('vis2').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-off.gif)';
        if (document.getElementById('vis2-header') != null)
            document.getElementById('vis2-header').style.color = '#8c978b';
        if (document.getElementById('vis3') != null)
            document.getElementById('vis3').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-off_171x25.gif)';
        if (document.getElementById('vis3-header') != null)
            document.getElementById('vis3-header').style.color = '#8c978b';
    }

    else if (id == 'tab2') {
        hideAllWraps();
        showDynamicWrap2();
        showHealthyIcons();
        if (document.getElementById('vis1') != null)
            document.getElementById('vis1').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-off.gif)';
        if (document.getElementById('vis1-header') != null)
            document.getElementById('vis1-header').style.color = '#8c978b';
        if (document.getElementById('vis2') != null)
            document.getElementById('vis2').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-on.gif)';
        if (document.getElementById('vis2-header') != null)
            document.getElementById('vis2-header').style.color = '#005b7f';
        if (document.getElementById('vis3') != null)
            document.getElementById('vis3').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-off_171x25.gif)';
        if (document.getElementById('vis3-header') != null)
            document.getElementById('vis3-header').style.color = '#8c978b';
    }


    else if (id == 'tab3') {
        hideAllWraps();
        showDynamicWrap3();
        showHealthyIcons();
        if (document.getElementById('vis1') != null)
            document.getElementById('vis1').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-off.gif)';
        if (document.getElementById('vis1-header') != null)
            document.getElementById('vis1-header').style.color = '#8c978b';
        if (document.getElementById('vis2') != null)
            document.getElementById('vis2').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-off.gif)';
        if (document.getElementById('vis2-header') != null)
            document.getElementById('vis2-header').style.color = '#8c978b';
        if (document.getElementById('vis3') != null)
            document.getElementById('vis3').style.backgroundImage = 'url(/Content/Global/Products/Img/tab-blu-on_171x25.gif)';
        if (document.getElementById('vis3-header') != null)
            document.getElementById('vis3-header').style.color = '#005b7f';
    }


}


// Support for flash activation - end



/// <reference name="MicrosoftAjax.js"/>
var xmlHttp = false;
function getXmlHttpRequestObject() {
    // check for native XMLHttpRequest object
    if (window.XMLHttpRequest && !(window.ActiveXObject)) {
        try {
            xmlHttp = new XMLHttpRequest();
        }
        catch (e) {
            xmlHttp = false;
        }
    }
        // check for IE/Windows ActiveX version
    else if (window.ActiveXObject) {
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
                xmlHttp = false;
            }
        }
    }
}


function OpenWindow(strLink, width, height, strName) {
    var blnSizeWindow = true;
    var strWidth = "";
    var strHeight = "";
    var strTop = "";
    var strLeft = "";
    var strProp = "toolbar=no,,directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes";

    if (strName == null)
        strName = "MiVentana"

    if (width == null || width == 0) {
        width = screen.availWidth - 15;
        height = screen.availHeight - 50;
        _top = 0
        _left = 0
    }
    else {
        _top = (screen.availHeight / 2) - (height / 2);
        _left = (screen.availWidth / 2) - (width / 2);
    }

    if (width != 0) {
        strWidth = "width=" + width;
        strLeft = "left=" + _left;
    }

    if (height != 0) {
        strHeight = "height=" + height;
        strTop = "top=" + _top;
    }


    if (blnSizeWindow)
        strProp = "toolbar=no,,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes," + strWidth + "," + strHeight + "," + strTop + "," + strLeft;

    var oWindow = window.open(strLink, strName, strProp)
    oWindow.focus();

    return;
}

function checkMaxQuantity(event, max, error) {
    if (event.srcElement.value > max) {
        event.srcElement.value = "";
        alert(error);
    }
}

function checkSKU(e, ctrl, error) {

    var sku = event.srcElement.value;
    if (sku != null && sku != "") {
        var inputAmounts = document.getElementsByTagName("input");
        for (i = 0; i < inputAmounts.length; i++) {
            var p = inputAmounts[i];
            if (p.name.indexOf("uxSKU") != -1 && p.value != "" && p.name != event.srcElement.name) {
                if (p.value == sku) {
                    event.srcElement.value = "";
                    var newString = error.replace("{0}", sku);
                    alert(newString);
                    break;
                }                
            }
        }
    }
}

function checkQuantity(e, ctrl) {
    var keynum;
    var keychar;

    if (!e) {
        e = window.event;
    }

    if (e.keyCode) {
        keynum = e.keyCode;
    } else if (e.which) {
        keynum = e.which;
    }

    keychar = String.fromCharCode(keynum);

    // take only numbers
    if (!/^ *[0-9]+ *$/.test(keychar)) {
        e.cancelBubble = true;
        if (event.preventDefault) {
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
    }
}

function checkAmount(e, ctrl, allowdecimal) {
    var keynum;
    var keychar;

    if (window.event) // IE
    {
        keynum = e.keyCode;
    } else if (e.which) // Netscape/Firefox/Opera
    {
        keynum = e.which;
    }
    keychar = String.fromCharCode(keynum);

    var valid = false;
    if (allowdecimal == 1) {
        valid = (/^ *[0-9.]+ *$/.test(keychar));
    } else {
        valid = (/^ *[0-9]+ *$/.test(keychar));
    }
    if (valid == false) {

        e.cancelBubble = true;
        if (window.event) // IE
        {
            e.keyCode = 0;
        } else if (e.which) {
            e.which = 0;
        }

    }
}

var amtField = null;
var balanceField = null;

function CVVKeyPress(e, ctrl, totaldue, maxlen) {
    var useComma = totaldue.indexOf(',') > -1;
    checkQuantity(e, ctrl);
    var eSource = GetEventSource(e);
    var name = eSource.id;
    name = name.replace("txtCVV", "txtAmount");
    var amtField = document.getElementById(name);
    var balanceField = null;
    if (null != amtField) {
        balanceField = findBalanceField();
        if (null != balanceField) {
            if (balanceField.value.length == 0) {
                balanceField.value = window.amount;
            }
            var balance = balanceField.value;
            if (amtField.value.length == 0) {
                if (useComma) {
                    balanceField.value = balanceField.value.replace(',', '.');
                }
                if (parseFloat(balanceField.value) > 0) {
                    amtField.value = balance;
                    balanceField.value = 0;
                }
                if (useComma) {
                    balanceField.value = balanceField.value.replace('.', ',');
                }
            }
        }
    }
}

function AmountLosingFocus(e, ctrl, totaldue, allowDecimals) {
    var ftotaldue = 0.0;
    var total = 0.0;
    var hasCommas = totaldue.indexOf(',') > -1;
    if (hasCommas) {
        totaldue = totaldue.replace(',', '.');
    }
    //test;
    ftotaldue = parseFloat(totaldue).toFixed(2);
    var inputAmounts = document.getElementsByTagName("input");
    for (i = 0; i < inputAmounts.length; i++) {
        var p = inputAmounts[i];
        if (p.name.indexOf("txtAmount") != -1 && p.value != "") {
            if (hasCommas) {
                p.value = p.value.replace(',', '.');
            }
            if (parseFloat(p.value) == 0) {
                p.value = '';
            }
            else {
                if (allowDecimals) {
                    p.value = parseFloat(p.value).toFixed(2);
                }
                else {
                    p.value = parseInt(p.value);
                }
                total += parseFloat(p.value);
                if (hasCommas) {
                    p.value = p.value.replace('.', ',');
                }
            }
        }
    }

    var balanceField = findBalanceField();
    if (null != balanceField) {
        var val = (ftotaldue - total).toFixed(2);
        if (isNaN(val)) {
            window.alert('Please enter valid input');
        }
        else {
            if (allowDecimals) {
                balanceField.value = val;
            }
            else {
                balanceField.value = parseInt(val);
            }
            if (hasCommas) {
                balanceField.value = balanceField.value.replace('.', ',');
            }
        }
    }
}

function findBalanceField() {
    var balanceField = null;
    var inputAmounts = document.getElementsByTagName("input");
    for (i = 0; i < inputAmounts.length; i++) {
        var p = inputAmounts[i];
        if (p.name.indexOf("totalAmountBalance") != -1) {
            balanceField = p;
            break;
        }
    }

    return balanceField;
}

function HideButtons() {
    var checkout1 = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButtonDisabled');
    if (checkout1 != null) {
        checkout1.style.display = 'none';
    }
    var checkout2 = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButton2Disabled');
    if (checkout2 != null) {
        checkout2.style.display = 'none';
    }
}

function displayButton(ctrl) {
    if (ctrl != null) {
        ctrl.style.display = 'inline';
    }
}

function DisableOnClick(ctrl) {
    ctrl.style.display = 'none';
    var button = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButtonDisabled');
    if (button != null) {
        displayButton(button);
    }
    button = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButton2');
    if (button != null) {
        button.style.display = 'none';
    }
    button = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButton2Disabled');
    if (button != null) {
        displayButton(button);
    }
}

function DisableOnClick2(ctrl) {
    ctrl.style.display = 'none';
    var button = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButton2Disabled');
    if (button != null) {
        displayButton(button);
    }
    button = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButton');
    if (button != null) {
        button.style.display = 'none';
    }
    button = document.getElementById('ctl00_ctl00_ContentArea_ProductsContent_CheckoutButtonDisabled');
    if (button != null) {
        displayButton(button);
    }
}

function AmoutLosingFocus(e, ctrl, totaldue) {

    var total = 0.0;

    var inputAmounts = document.getElementsByTagName("input");
    for (i = 0; i < inputAmounts.length; i++) {
        var p = inputAmounts[i];
        if (p.name.indexOf("txtAmount") != -1 && p.value != "") {
            total += parseFloat(p.value);
        }
    }
    if (balanceField == null) {
        findBalanceField();
    }

    if (balanceField != null) {
        balanceField.value = totaldue - total;
    }
}