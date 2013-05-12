"use strict";

var jdmIM = (function () {
    var IM_POPUP_ID = "#popup_im_invite";
    var brandId = 0;
    var memberId = 0;       // Unique Id of logged in user
    var restUrl = "";
    var invites = [];       // Number of invites received from API
    var removedInvites;
    var loginData = {};     // Required cookie values for invoking API
    var popupActive = false;
    var popupTemplate = "";
    var timerHandle;
    var connection; // strophe connection
    var ownJid;
    var chatServerName;
    var environment;
    var boshServer;
    var communityId;
    var initialized = false;

    return {
        init: function (bid, mid, url) {
            loginData = this.getLoginData();
            if (!loginData.accessToken) { // if user isn't logged in, don't init IM
                return;
            }
            removedInvites = [];

            var siteLookup = {
                "blacksingles": 24,
                "jdate": 3,
                "spark": 1,
                "bbwpersonalsplus": 23,
                "cupid": 10
            };

            var domain = jdmIM.getRootDomain().toLowerCase();
            var communityName = domain.split('.')[0];
            communityId = siteLookup[communityName];

            var boshPort = '';  // TODO improve environment handling
            if (document.domain.indexOf('stgv3') !== -1) {
                environment = 'stgv3';
                chatServerName = 'chat.stgv3.spark.net';
            }
            else if (document.domain.indexOf('local') !== -1) {
                environment = 'dev';
                chatServerName = 'chat.dev.spark.net';
                boshPort = ':5280';
            }
            else {
                environment = 'prod';
                chatServerName = 'chat.spark-networks.com';
            }
            boshServer = "//" + chatServerName + boshPort + "/http-bind";

            brandId = bid;
            memberId = mid;
            restUrl = url;

            var popup = $(IM_POPUP_ID);

            // Initialize IM Invite popup.
            popup.trigger("create");
            popup.popup({ tolerance: "15,5,15,5" });

            // Hack to disable closing popup when users tap outside.
            popup.on({
                popupbeforeposition: function () {
                    $('.ui-popup-screen').off();
                }
            });

            popup.bind({
                popupafteropen: function () {
                    popupActive = true;
                    //console.log("active");
                },
                popupafterclose: function () {
                    popupActive = false;
                    //console.log("inactive");
                }
            });

            popupTemplate = popup.html();

            //$(":jqmData(role='dialog')").live("pagehide", function () {
            //    jdmIM.showInvite();
            //});

            //$(":jqmData(role='dialog')").live("pageshow", function () {
            //    clearInterval(jdmIM.timerHandle);
            //    console.log("Clear interval");
            //});

            $(window).bind("message", function (event) {
                if (jdmIM.getRootDomain(event.originalEvent.origin) !== jdmIM.getRootDomain(window.location.href)) {
                    return;
                }
                if (event.originalEvent.data.indexOf("chatterMemberId") !== -1) {
                    console.log(event.originalEvent.origin);
                    console.log("Message from IM client: " + event.originalEvent.data);
                    var params = JSON.parse(event.originalEvent.data);
                    jdmIM.handleIMWindowClosing(params);
                }
            });

            $("#IM_me").live("click", function () {
                jdmIM.callOmniture({ pageName: "m_im_chat_launcher" });
                var chatUrl = $(this).attr("data-url");
                var memberID = $(this).attr("data-memberID");
                jdmIM.openIM(chatUrl, memberID);
            });

            // Initialize timer
            timerHandle = setInterval(this.getInvites, (1000 * 20));
            //setTimeout(this.getInvites, 1000);

            initialized = true;
        },
        
        isInitialized: function () {
            return initialized;
        },

        getRootDomain: function () { // TODO: use the spark.utilities function.  This is duplication.
            var domainParts = document.domain.split('.');
            var last = domainParts.length - 1;
            var rootDomain;
            if (domainParts[last - 1] === "co") { // grab 3 parts: jdate co il, jdate co uk
                rootDomain = domainParts[last - 2] + '.' + domainParts[last - 1] + '.' + domainParts[last];
            }
            else { // grab 2 parts, jdate com, jdate fr, blacksingles com
                rootDomain = domainParts[last - 1] + '.' + domainParts[last];
            }
            return rootDomain;
        },


        getLoginDataCookies: function () {
            var tokenDomain = $.cookie("MOS_DOMAIN");
            return {
                "memberId": parseInt($.cookie("MOS_MEMBER"), 10),
                "accessToken": $.cookie("MOS_ACCESS"),
                "isPayingMember": $.cookie("MOS_SUB"),
                "accessExpiresTime": new Date($.cookie("MOS_ACCESS_EXPIRES")),
                "refreshToken": $.cookie("MOS_REFRESH")
            };
        },

        getLoginData: function () {
            return this.getLoginDataCookies();
        },

        sendSyncDisconnect: function (chatterJid) {
            alert('disconnecting with ' + chatterJid);
            if (!connection) {
                alert('no connection :(');
                return;
            }
            connection.send($pres({
                to: chatterJid,
                "type": "unavailable"
            }));
            connection.sync = true;
            connection.flush();
            connection.disconnect('disconnecting');
            alert('sent disconnect');
        },

        getInvites: function () {
            // For testing only. Remove when API is merged in Main.
            /*var data = [
            { SenderMemberId: 100171163, ConversationKey: "bb", InviteDate: "" },
            { SenderMemberId: 101802703, ConversationKey: "cc", InviteDate: "" }
            ];

            console.log(data);
            jdmIM.invites = [];
            jdmIM.invites = jdmIM.filterInvites(data);

            jdmIM.closeInvite();
            jdmIM.showInvite();*/

            var url = "/instantmessenger/invites";

            //console.log("Getting invites...");
            invites = [];
            jdmIM.closeInvite();
            jdmIM.invokeAPI(url, "GET", {}, function (success, response, statusText, errorThown) {
                if (success && response) {
                    invites = jdmIM.filterInvites(response.data);
                    jdmIM.showInvite();
                }
                else {
                    //alert('Failed to check IM invites\n' + (response.code || '') + ' ' + statusText + '\n' + errorThown);
                }
            });
        },

        showInvite: function () {
            var length = invites.length;
            if (length == 0) {
                return;
            }

            //var invite = jdmIM.invites.splice(length - 1, 1);
            var invite = invites[length - 1];
            var senderId = invite.SenderMemberId;
            var key = invite.ConversationKey;

            jdmIM.getProfile(senderId, function (data) {
                if (!jdmIM.hasActiveInvite()) {
                    var popup = $(IM_POPUP_ID);
                    var html = Mustache.to_html(popupTemplate, data);
                    var yesBtn;
                    var img;
                    var imgSrc = (data.primaryPhoto !== null) ?
                        data.primaryPhoto.thumbPath : (data.gender === "Male") ?
                            "/images/no-photo-m.png" : "/images/no-photo-f.png";
                    var link;
                    var isPayingMember = loginData.isPayingMember;

                    popup.html(html);
                    img = popup.find("img[id='popup_im_profile_img']");
                    img.attr("src", imgSrc);
                    img.unbind("click").bind("click", function () {
                        jdmIM.viewProfile(data.memberId);
                    });

                    link = popup.find("a[id='popup_im_profile_link']");
                    link.unbind("click").bind("click", function () {
                        jdmIM.viewProfile(data.memberId);
                    });

                    // Bind event to NO button.
                    popup.find("a[id='popup_no_btn']").unbind("click").bind("click", function () {
                        jdmIM.removeInvite(key, senderId);
                        jdmIM.sendEjabIMRejectedMessage(senderId);
                        jdmIM.closeInvite();

                        jdmIM.callOmniture({
                            pageName: "m_im_invitation",
                            eVar2: "m_im_invitation",
                            prop2: "m_im_invitation",
                            events: "event69"
                        });

                        setTimeout(jdmIM.showInvite, 500);
                    });

                    // Bind event to YES/UPGRADE button.
                    yesBtn = popup.find("a[id='popup_yes_btn']");
                    if (isPayingMember === "N") {
                        yesBtn.find("span.ui-btn-text").text("Upgrade");
                    }

                    yesBtn.unbind("click").bind("click", function () {
                        jdmIM.removeInvite(key, senderId);
                        jdmIM.closeInvite();
                        if (isPayingMember !== "Y") {
                            // Go to subscription page.
                            $(this).attr("href", "/subscription/subscribe/2260");
                            $(this).attr("data-ajax", "false"); // Disable ajax/xhr request.
                        } else {
                            var url = $(this).attr("data-url");

                            jdmIM.callOmniture({
                                pageName: "m_im_invitation",
                                eVar2: "m_im_invitation",
                                prop2: "m_im_invitation",
                                events: "event68"
                            });

                            jdmIM.openIM(url, senderId);
                        }


                        // Show next invite so when user goes back to original
                        // page the user can take action.
                        setTimeout(jdmIM.showInvite, 500);
                    });

                    // Show IM invite popup.
                    popup.show();
                    popup.popup("open");
                }
            });
        },

        removeInvite: function (key) {
            var url = "/instantmessenger/invite";
            var params = {
                ConversationKey: key
            };

            removedInvites.push(key);

            //console.log("Removing invite: " + key);
            invites.splice((invites.length - 1), 1); // Remove item from end.
            jdmIM.invokeAPI(url, "DELETE", params, function (success, response, statusText, errorThrown) {
                if (success) {
                    console.log("Invite removed: " + key);
                }
                else {
                    //alert('Failed to remove IM invitation' + statusText + ' ' + errorThrown);
                }
            });
        },


        connectToEjabberd: function (callback) {
            if (!communityId) {
                return; // unknown site
            }

            ownJid = loginData.memberId + '-' + communityId + '@' + chatServerName;

            connection = new Strophe.Connection(boshServer);
            connection.connect(ownJid, loginData.accessToken, callback);
        },


        // let the other user know the instant message invitation was declined
        sendEjabIMRejectedMessage: function (recipientMemberId) {

            var recipientJid = recipientMemberId + '-' + communityId + '@' + chatServerName;

            jdmIM.connectToEjabberd(function (status) {
                if (status === Strophe.Status.CONNECTED) {
                    if (connection) {
                        connection.send($pres());
                        connection.send($pres({
                            to: recipientJid,
                            "type": "declined"
                        }));
                    }
                } else if (status === Strophe.Status.CONNFAIL) {
                    spark.log.logError('Connection to chat server at ' + boshServer + ' failed.');
                } else if (status === Strophe.Status.AUTHFAIL) {
                    spark.log.logError('authorization with chat server failed');
                }
            });
        },

        // TODO: this code is duplicated on webchat IM.js
        sendMissedIM: function (messageQueue, targetMemberId) {
            if (messageQueue.length == 0)
                return;
            var missedIMUrl = '/instantmessenger/missedIM';
            var postData = {
                recipientMemberId: targetMemberId,
                messages: messageQueue
            };
            //spark.utilities.log('calling ' + missedIMUrl + ' ' + postData);
            jdmIM.invokeAPI(missedIMUrl, "POST", postData, function (success, data) {
                if (success) {
                    //spark.utilities.log('missed IM successful \n' + data.statusText);
                }
                else {
                    //spark.utilities.log('missed IM error \n' + data.statusText);
                }
            });
        },


        handleIMWindowClosing: function (params) {
            var chatterJid = params.chatterMemberId + '-' + communityId + '@' + chatServerName;

            jdmIM.connectToEjabberd(function (status) {
                if (status === Strophe.Status.CONNECTED) {
                    if (connection) {
                        connection.send($pres());
                        connection.send($pres({
                            to: chatterJid,
                            "type": "unavailable"
                        }));
                    }
                } else if (status === Strophe.Status.CONNFAIL) {
                    spark.log.logError('Connection to chat server at ' + boshServer + ' failed.');
                } else if (status === Strophe.Status.AUTHFAIL) {
                    spark.log.logError('authorization with chat server failed');
                }
            });

            //            jdmIM.sendSyncDisconnect(chatterJid);

            // if receiver never got online, trigger missed IM
            if (params.messageQueue && params.messageQueue.length > 0) {
                jdmIM.sendMissedIM(params.messageQueue, params.chatterMemberId);
            }
            //spark.utilities.log("Total duration in seconds:" + params.chatDuration);
            //spark.utilities.log("Total messages sent:" + params.messageCount);

            s.pageName = 'm_im_chat_window';
            s.eVar58 = params.chatDuration;
            s.eVar59 = params.messageCount;
            jdmIM.callOmniture();

        },

        getProfile: function (id, callback) {
            var url = "/profile/attributeset/miniprofile/" + id;

            //console.log("Getting profile data: " + id);
            this.invokeAPI(url, "GET", null, function (success, response) {
                if (success && typeof callback === "function") {
                    callback(response.data);
                }
            });
        },

        openIM: function (url, chatterID) {
            window.open(url, '_' + chatterID);
        },

        openSubscription: function () {
            // Go to subscrition page.
            window.location.href = "/subscription/subscribe";
        },

        viewProfile: function (id) {
            var url = "/profile/static/" + id;
            window.open(url);
        },

        hasActiveInvite: function () {
            return popupActive;
        },

        closeInvite: function () {
            var popup = $(IM_POPUP_ID);
            popup.hide();
            popup.popup("close");
        },

        filterInvites: function (data) {
            var temp = [];
            var length = data.length;
            for (var i = 0; i < length; i++) {
                if (!jdmIM.isRemoved(data[i].ConversationKey))
                    temp.push(data[i]);
            }

            return temp;
        },

        isRemoved: function (key) {
            var length = removedInvites.length;
            for (var i = 0; i < length; i++) {
                if (key === removedInvites[i])
                    return true;
            }

            return false;
        },

        callOmniture: function (settings) {
            $.extend(s, settings, {
                eVar36: "m.jdate.com",
                prop23: memberId
            });
            //$.extend(s, settings);

            s.t();
            for (var key in settings) {
                delete s[key];
            };
        },


        invokeAPI: function (url, type, params, callback) {
            var ajaxRequest =
                {
                    url: restUrl + "/brandid/" + brandId + url + "?access_token=" + loginData.accessToken + "&ts=" + new Date().getTime(),
                    type: type,
                    data: params,
                    tryCount: 0,
                    retryLimit: 3,
                    dataType: 'json',
                    //cache: false,
                    success: function (data) {
                        if (typeof (callback) == "function") {
                            callback(true, data);
                        }
                    },
                    error: function (xhr, textStatus, e) {
                        if (console.log) {
                            console.log("call to " + url + " failed");
                            console.log("params: " + params);
                            console.log(xhr);
                            console.log(textStatus);
                            console.log(e);
                        }
                        if (typeof (callback) == "function") {
                            callback(false, xhr, textStatus, e);
                        }
                    }
                };

            if (type.toLowerCase() !== 'get' && params) { // if post/put with params, convert body to JSON
                var count = 0;
                for (var key in params)
                    if (params.hasOwnProperty(key)) {
                        count++;
                    }
                if (count > 0) {
                    ajaxRequest.contentType = "application/json";
                    ajaxRequest.data = JSON.stringify(params);
                }
            }

            if (/Android 2.3/i.test(navigator.userAgent)) {
                ajaxRequest.beforeSend = function (xhr) {
                    // Hack for Android 2.3.X devices (known Google issue).
                    xhr.setRequestHeader("Content-Length", "");
                };
            }
            $.ajax(ajaxRequest);
        }
    };
})();

(function () { // polyfill for IE
    if (!window.console) {
        window.console = {};
        window.console.log = function () {
        };
    }
})();
