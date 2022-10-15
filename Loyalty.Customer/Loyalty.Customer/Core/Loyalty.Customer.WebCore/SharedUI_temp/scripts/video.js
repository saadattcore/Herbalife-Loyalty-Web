$(document).ready(function () {
    var rToken;
    $('a[class*="bc_modal_link"]').each(function () {
        if ($(this).data("bc-tkn") !== undefined) {
            rToken = $(this).data("bc-tkn");
        }
    });

    if ($("a.p_bc_modal_link").length > 0) {
        $("body").append('<div id="p" class="bc_modal k-widget k-window"><div class="k-window-titlebar k-header">&nbsp;<span style="right: 32px;" class="k-window-title"></span><div class="k-window-actions"><a role="button" class="k-window-action k-link"><span role="presentation" class="k-icon k-i-close icon-x"></span></a></div></div><div class="modal_content"><video data-account="' + $("a.p_bc_modal_link").data("bc-account") + '" data-player="' + $("a.p_bc_modal_link").data("bc-player") + '" data-bc-tkn="' + rToken + '" data-embed="default" data-playlist-id=""  width="600px" height="338px" class="video-js myhl-video" controls></video><div class="playlist-wrapper"><ol class="vjs-playlist"></ol></div></div></div>'); $("body").append(decodeURIComponent('%3Cscript src="//players.brightcove.net/' + $("a.p_bc_modal_link").data("bc-account") + '/' + $("a.p_bc_modal_link").data("bc-player") + '_default/index.min.js" %3E%3C/script%3E'));
    }

    if ($("a.s_bc_modal_link").length > 0) {
        $("body").append('<div id="s" class="bc_modal k-widget k-window" ><div class="k-window-titlebar k-header" style="margin-top: -30px;">&nbsp;<span class="k-window-title" style="right: 32px;"></span><div class="k-window-actions"><a class="k-window-action k-link" role="button"><span class="k-icon k-i-close icon-x" role="presentation"></span></a></div></div><div class="modal_content"><video data-account="' + $("a.s_bc_modal_link").data("bc-account") + '" data-player="' + $("a.s_bc_modal_link").data("bc-player") + '" data-embed="default" data-video-id="" width="600px" height="338px" class="video-js myhl-video" controls ></video></div></div>');
        $("body").append(decodeURIComponent('%3Cscript src="//players.brightcove.net/' + $("a.s_bc_modal_link").data("bc-account") + '/' + $("a.s_bc_modal_link").data("bc-player") + '_default/index.min.js" %3E%3C/script%3E'));
    }

    if ($("a.a_bc_modal_link").length > 0) {
        $("body").append('<div id="a" class="bc_modal k-widget k-window"><div class="k-window-titlebar k-header">&nbsp;<span style="right: 32px;" class="k-window-title"></span><div class="k-window-actions"><a role="button" class="k-window-action k-link"><span role="presentation" class="k-icon k-i-close icon-x"></span></a></div></div><div class="modal_content"><video data-account="' + $("a.a_bc_modal_link").data("bc-account") + '" data-player="' + $("a.a_bc_modal_link").data("bc-player") + '" data-bc-tkn="' + rToken + '" data-embed="default" data-video-id="" width="600px" height="100px" class="video-js hl-audio" controls ></video><div class="a-bc-playlist-wrapper playlist-wrapper-audio"><ol class="a-playlist-scroller vjs-playlist" style="position:relative;left:0px"></ol></div></div></div>');
        $("body").append(decodeURIComponent('%3Cscript src="//players.brightcove.net/' + $("a.a_bc_modal_link").data("bc-account") + '/' + $("a.a_bc_modal_link").data("bc-player") + '_default/index.min.js" %3E%3C/script%3E'));
    }

    if ($("a.u_bc_modal_link").length > 0) {
        $("body").append('<div id="u" class="bc_modal k-widget k-window"><div class="k-window-titlebar k-header">&nbsp;<span style="right: 32px;" class="k-window-title"></span><div class="k-window-actions"><a role="button" class="k-window-action k-link"><span role="presentation" class="k-icon k-i-close icon-x"></span></a></div></div><div class="modal_content"><video data-account="' + $("a.u_bc_modal_link").data("bc-account") + '" data-player="' + $("a.u_bc_modal_link").data("bc-player") + '" data-bc-tkn="' + rToken + '" data-embed="default" data-video-id="" width="600px" height="100px" class="video-js hl-audio" controls ></video></div></div>');
        $("body").append(decodeURIComponent('%3Cscript src="//players.brightcove.net/' + $("a.u_bc_modal_link").data("bc-account") + '/' + $("a.u_bc_modal_link").data("bc-player") + '_default/index.min.js" %3E%3C/script%3E'));
    }
});
