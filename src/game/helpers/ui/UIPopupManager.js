// Manages showing and hiding pop-ups
define(['ash', 'game/GameGlobals', 'game/GlobalSignals'],
function (Ash, GameGlobals, GlobalSignals) {
    var UIPopupManager = Ash.Class.extend({
        
        popupQueue: null,
        
        constructor: function () {
            this.popupQueue = [];
            
            GlobalSignals.windowResizedSignal.add(this.onResize);
        },
        
        onResize: function () {
            var winh = $(window).height();
            var winw = $(window).width();
            var padding = 20;
            $.each($(".popup"), function () {
                var popuph = $(this).height();
                var popupw = $(this).width();
                $(this).css("top", Math.max(0, (winh - popuph) / 2 - padding));
                $(this).css("left", (winw - popupw) / 2);
            });
        },
        
        showPopup: function (title, msg, okButtonLabel, cancelButtonLabel, resultVO, okCallback, cancelCallback) {
            if (this.hasOpenPopup()) {
                this.popupQueue.push({title: title, msg: msg, okButtonLabel: okButtonLabel, cancelButtonLabel: cancelButtonLabel, resultVO: resultVO, okCallback: okCallback, cancelCallback: cancelCallback });
                return;
            }
            
            // use the same popup container for all popups
            var popUpManager = this;
            var popup = $("#common-popup");
            if ($(popup).parent().hasClass("popup-overlay")) $(popup).unwrap();
            
            // text
            GameGlobals.uiFunctions.toggle("#common-popup-input-container", false);
            $("#common-popup h3").text(title);
            $("#common-popup p#common-popup-desc").html(msg);
            
            // results and rewards
            var hasResult = resultVO && typeof resultVO !== 'undefined';
            GameGlobals.uiFunctions.toggle("#info-results", hasResult);
            $("#info-results").empty();
            if (hasResult) {
                var rewardDiv = GameGlobals.playerActionResultsHelper.getRewardDiv(resultVO, false);
                $("#info-results").append(rewardDiv);
            }
            
            // buttons and callbacks
            $("#common-popup .buttonbox").empty();
            var showTakeAll = hasResult;
            if (showTakeAll) {
                $("#common-popup .buttonbox").append("<button id='confirmation-takeall' class='action' action='take_all'>Take all</button>");
                $("#confirmation-takeall").click(function (e) {
                    popUpManager.closePopup("common-popup");
                    if (okCallback) okCallback(true);
                });
            }
            $("#common-popup .buttonbox").append("<button id='info-ok' class='action'>" + okButtonLabel + "</button>");
            if (hasResult) $("#info-ok").attr("action", "accept_inventory");
            $("#info-ok").click(function (e) {
                popUpManager.closePopup("common-popup");
                if (okCallback) okCallback(false);
            });            
            if (cancelButtonLabel) {
                $("#common-popup .buttonbox").append("<button id='confirmation-cancel'>" + cancelButtonLabel + "</button>");
                $("#confirmation-cancel").click(function (e) {
                    popUpManager.closePopup("common-popup");
                    if (cancelCallback) cancelCallback();
                });
            }
            
            // overlay
            $("#common-popup").wrap("<div class='popup-overlay' style='display:none'></div>");
            GameGlobals.uiFunctions.toggle(".popup-overlay", true);
            popUpManager.onResize();
            GlobalSignals.popupOpenedSignal.dispatch("common-popup");
            $("#common-popup").slideDown(200, popUpManager.onResize);
            
            GameGlobals.uiFunctions.generateButtonOverlays("#common-popup .buttonbox");
            GameGlobals.uiFunctions.generateCallouts("#common-popup .buttonbox");
            
            // pause the game while a popup is open
            GameGlobals.gameState.isPaused = this.hasOpenPopup();
        },
        
        closePopup: function (id) {
            var popupManager = this;
            if (popupManager.popupQueue.length === 0) {
                $("#" + id).data("fading", true);
                $("#" + id).slideUp(200, function () {
                    GameGlobals.uiFunctions.toggle(".popup-overlay", false);
                    $("#" + id).unwrap();
                    $("#" + id).data("fading", false);
                    $("#" + id + "p#common-popup-desc");
                    GlobalSignals.popupClosedSignal.dispatch(id);
                    popupManager.showQueuedPopup();
                    GameGlobals.gameState.isPaused = popupManager.hasOpenPopup();
                });
            } else {
                $("#" + id).data("fading", false);
                GameGlobals.uiFunctions.toggle("#" + id, false);
                GlobalSignals.popupClosedSignal.dispatch(id);
                popupManager.showQueuedPopup();
                popupManager.gameState.isPaused = popupManager.hasOpenPopup();
            }
        },
        
        closeAllPopups: function () {
            this.popupQueue = [];
            var popupManager = this;
            $.each($(".popup:visible"), function () {
                popupManager.closePopup($(this).attr("id"));
            });
        },
        
        showQueuedPopup: function () {
            if (this.popupQueue.length > 0) {
                var queued = this.popupQueue.pop();
                this.showPopup(queued.title, queued.msg, queued.okButtonLabel, queued.cancelButtonLabel, queued.resultVO, queued.okCallback, queued.cancelCallback);
            }
        },
        
        hasOpenPopup: function () {
            return $(".popup:visible").length > 0;
        },
        
    });

    return UIPopupManager;
});
