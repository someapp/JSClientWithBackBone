var webIM = webIM || {

    chatServerName: spark.config.chatServerName,
    boshServer: spark.config.boshServer,
    IMInitiatorUrl: spark.config.IMInitiatorUrl,
    ownJid: null,
    ownMiniProfile: null,
    chatterMemberId: null,
    chatterJid: null,
    chatterMiniProfile: null,
    chatterState: "unavailable",
    chatterIsBlocked : false,
    chatterIsFavorite : false,
	invitationPending: false,
    composing: false,
    composingContainer: null,
    errorContainer: null,
    connection: null,
    messageQueue: [],
    startChatTime: new Date().getTime(),
    messageCount: 0,
    stropheStatusText: {
        0: 'Error',
        1: 'Connecting',
        2: 'Connection fail',
        3: 'Authenticating',
        4: 'Authentication fail',
        5: 'Connected',
        6: 'Disconnected',
        7: 'Disconnecting',
        8: 'Attached'
    },
    stropheOmnitureCodes: {
        0: 'strophe_error',
        1: 'strophe_connecting',
        2: 'strophe_connection_fail',
        3: 'strophe_authenticating',
        4: 'strophe_authentication_fail',
        5: 'strophe_connected',
        6: 'strophe_disconnected',
        7: 'strophe_disconnecting',
        8: 'strophe_attached'
    },

    callOmniture : function() {
        s.pageName = "webchat_window";        	
        if (webIM.isMobile()) {
        	s.pageName = "m_webchat_window";
        	s.eVar36 = spark.config.rootDomain;
        }
        s.t();
    },

    getQueryVariable: function (url, variable) {
        var query = url.split("?");
        if (query.length > 1) {
            var vars = query[1].split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
        }
        return null;
    },

    renderTemplate: function (templateSelector, dto, doAppend) {
        var template = $(templateSelector);
        if (template[0]) {
            var html = Mustache.to_html(template.html(), dto);
            var targetSelector = template.data("target-element");
            var target = $(targetSelector);
            if (target[0]) {
                if (doAppend) {
                    target.append(html);
                }
                else {
                    target.html(html);
                }
                return targetSelector;
            }
        }
    },


    on_roster: function (iq) {
        //alert("on roster");
        spark.utilities.log('on roster event');
        // set up presence handler and send initial presence
        webIM.connection.addHandler(webIM.on_presence, null, "presence");
        webIM.connection.send($pres());
        webIM.connection.send($pres({
            to: webIM.chatterJid,
            "type": "online"
        }));

        return true;
    },

    pending_subscriber: null,

    on_presence: function (presence) {
        var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
        var jid = Strophe.getBareJidFromJid(from);
        var dto;

        spark.utilities.log("on_presence " + jid + ' ' + (ptype || ''));
        if (webIM.chatterJid !== jid) {
            return true;
        }

        if (ptype === "online" || ptype === "declined") {
            webIM.invitationPending = false;
        }

        if (ptype === "declined") {
            dto = { "username": spark.config.brandData.siteName,
                "chatText": spark.locale.getText('memberDeclinedInvitation', webIM.chatterMiniProfile.username),
                "timestamp": spark.utilities.getFormattedTime()
            };
            webIM.renderTemplate('#system_template', dto, true);
            webIM.scroll_chat();
        }

        if (webIM.chatterState === "unavailable" && ptype === "online") {
            // if user is coming online, send them a presence message.  This should not cause infinite looping
            // because the message is only sent when a user goes from unavailable to online status
            webIM.connection.send($pres({
                to: webIM.chatterJid,
                "type": "online"
            }));
        }

        if (!(webIM.chatterState === "declined" && ptype === "unavailable")) {
            spark.utilities.log('updating chatter state to: ' + ptype);
            webIM.chatterState = ptype;
            // don't change status from declined to unavailable,
            // which would cause "waiting for xxx to join" to display instead of "xxx has declined"
        }
        webIM.renderChatState();

        if (webIM.chatterState === "online") {
            for (var i = 0; i < webIM.messageQueue.length; i++) {
                webIM.sendMessage(webIM.messageQueue[i]);
                spark.utilities.log("sent queue message " + webIM.messageQueue[i]);
            }
            webIM.messageQueue.length = 0;
            webIM.missedIMQueued = false;
        }

        return true;
    },

    renderChatState: function () {
        var dto;
        var userName = 'the member';
        if (webIM.chatterMiniProfile) {
            userName = webIM.chatterMiniProfile.username;
        }

        if (webIM.isMobile()) {
            userName = "<span>" + userName + "</span>"
        }

        if (webIM.chatterIsBlocked) {
            dto = { "userState": spark.locale.getText('youBlockedMember', userName) };
            webIM.composingContainer = $(webIM.renderTemplate('#chatter_status_template', dto, false));
            return;
        }
        if (webIM.chatterState === 'unavailable') {
            var message;
            if (webIM.invitationPending) {
                message = spark.locale.getText('waitingForMember', userName);
            }
            else if (!webIM.chatterHasJoined && !webIM.invitationPending) {
                message = spark.locale.getText('typeAMessage', userName);
            }
            else {
                message = spark.locale.getText('IMWindowClosed', userName);
            }
            dto = { "userState": message };
            webIM.composingContainer = $(webIM.renderTemplate('#chatter_status_template', dto, false));
        } else if (webIM.chatterState === "blocked"){
            dto = { "userState": spark.locale.getText('userNotAccepting', userName) };
            webIM.composingContainer = $(webIM.renderTemplate('#chatter_status_template', dto, false));
        } else if (webIM.chatterState === "declined"){
            dto = { "userState": spark.locale.getText('memberDeclinedInvitation', userName) };
            webIM.composingContainer = $(webIM.renderTemplate('#chatter_status_template', dto, false));
        } else {
            webIM.chatterHasJoined = true;
            dto = { "userState": spark.locale.getText('IMWindowOpen', userName)  };
            webIM.composingContainer = $(webIM.renderTemplate('#chatter_status_template', dto, false));
            clearTimeout(webIM.missedImInfoCall);
            spark.utilities.log("clearing missedImInfoCall");
        }
    },

    on_roster_changed: function () { // (iq)
        spark.utilities.log('roster changed');
        //alert('roster changed');
        return true;
    },

    on_message: function (message) {
        spark.utilities.log('on message');
        if (!message) {
            spark.utilities.log('Error! on_message called with no message!');
        }

        var full_jid = $(message).attr('from');
        var jid = Strophe.getBareJidFromJid(full_jid);
        var chatArea = $('.chat_messages');
        if (chatArea.length === 0) {
            chatArea = null;
        }
        var chatterMemberId = parseInt(jid ? jid.split("@")[0] : null, 10);

        if (chatArea[0]) {
            if (chatterMemberId !== webIM.chatterMemberId) {
                return true; // message wasn't meant for this window, ignore it
            }
            if (webIM.chatterState === "blocked" || webIM.chatterIsBlocked) { // if blocked or blocking, don't continue
                return true;
            }
            var composing = $(message).find('composing');
            var dto;
            if (composing.length > 0) { // if this is a "composing" message, add "<user> is typing..."
            	var userName = (!webIM.isMobile()) ? webIM.chatterMiniProfile.username : "<span>" + webIM.chatterMiniProfile.username + "</span>";
                dto = { "userState": spark.locale.getText('memberIsTyping', userName) };
                webIM.composingContainer = $(webIM.renderTemplate('#chatter_status_template', dto, false));
                return true;
            }

            var paused = $(message).find('paused');
            if (paused.length > 0) { // if this is a "paused" message, remove "user is typing..."
                if (webIM.composingContainer) {
                    webIM.renderChatState();
                }
                return true;
            }

            var body = $(message).find("html > body");
            if (body.length === 0) {
                body = $(message).find('body');
                if (body.length > 0) {
                    body = body.text()
                } else {
                    body = null;
                }
            } else {
                body = body.contents();

                var span = $("<span></span>");
                body.each(function () {
                    if (document.importNode) {
                        $(document.importNode(this, true)).appendTo(span);
                    } else {
                        // IE workaround
                        span.append(this.xml);
                    }
                });
                body = span;
            }

            if (body) {
                spark.utilities.log('message received: ' + body);
                var div = document.createElement('temp');
                div.innerHTML = body;
                var decoded = div.firstChild.nodeValue;
                dto = { "thumbnail": webIM.chatterMiniProfile.thumbOrNoPic,
                    "username": webIM.chatterMiniProfile.username,
                    "chatText": decoded,
                    "timestamp": spark.utilities.getFormattedTime()
                };
                webIM.renderTemplate('#message_template', dto, true);


//                if (webIM.chatterState !==  "online") { // user presence was offline, but we got a message? something is wrong, send online presence to other user
//                    // if user is coming online, send them a presence message.  This should not cause infinite looping
//                    // because the message is only sent when a user goes from unavailable to online status
//                    webIM.connection.send($pres({
//                        to: webIM.chatterJid,
//                        "type": "online"
//                    }));
//                }
//
                webIM.title = document.title;
                webIM.renderChatState();
//                setInterval(function(){
//                    var title = document.title;
//                    document.title = (title == "test" ? "none" : "test");
//                }, 1000);

                if (webIM.composingContainer) {
                    webIM.renderChatState();
                    //webIM.composingContainer.html('');
                }
                webIM.scroll_chat();
            }
        }
        return true;
    },

    invokeAPI: function (url, type, params, callback) {
        var ajaxRequest =
        {
            url: spark.config.restServerV2 + "/brandid/" + spark.config.brandData.brandId + url + "?access_token=" + spark.API.restClient.loginData.accessToken + "&ts=" + new Date().getTime(),
            type: type,
            data: params,
            tryCount: 0,
            retryLimit: 3,
            dataType : 'json',
            //cache: false,
            success: function (data) {
                if (typeof (callback) == "function") {
                    callback(true, data);
                }
            },
            error: function (xhr, textStatus, e) {
                spark.utilities.log("call to " + url + " failed");
                spark.utilities.log("params: " + params);
                spark.utilities.log(xhr);
                spark.utilities.log(textStatus);
                spark.utilities.log(e);
                if (typeof (callback) == "function") {
                    callback(false, xhr, textStatus, e);
                }
            }
        };

        if (type.toLowerCase() !== 'get' && params) { // if post/put with params, convert body to JSON
            var count = 0;
            for (var key in params) if (params.hasOwnProperty(key)) {
                count++;
            }
            if (count > 0) {
                ajaxRequest.contentType = "application/json";
                ajaxRequest.data = JSON.stringify(params);
            }
        }

        if (webIM.IsAndroidGingerbread) {
            ajaxRequest.beforeSend = function (xhr) {
                // Hack for Android 2.3.X devices (known Google issue).
                xhr.setRequestHeader("Content-Length", "");
            };
        }
        $.ajax(ajaxRequest);
    },


//    deleteInvite: function (conversationKey, callback) {
//        var url = "/instantmessenger/invite";
//        var params = {
//            "conversationKey" : conversationKey
//        };
//
//        this.invokeAPI(url, "DELETE", params, function (success, response) {
//            // TODO: Handle callback
//            if (success) {
////                alert("Invite deleted: " + conversationKey);
//                spark.utilities.log("Invite deleted: " + conversationKey);
//            }
//            else {
////                alert("Invite delete failed: " + conversationKey);
//                spark.utilities.log("Invite failed: " + conversationKey);
//            }
//            if (typeof callback === "function") {
//                callback();
//            }
//        });
//    },


    sendInvite: function (recipientID) {
        var url = "/instantmessenger/invite";

        var params = {
            recipientMemberId: recipientID
        };

        spark.utilities.log("Sending invite to: " + recipientID);
        this.invokeAPI(url, "POST", params, function (success, response, textStatus) {

                // TODO: Handle callback
            if (success) {
//                if (response.conversationKey) {
//                    webIM.inviteConversationKey = response.conversationKey;
//                }
//                alert("Invite sent: " + recipientID);
                spark.utilities.log("Invite sent: " + recipientID);
            }
            else {                                
                webIM.showSystemMessage(spark.locale.getText("inviteFailed", webIM.chatterMiniProfile.username));
                spark.utilities.log("Invite failed: " + recipientID);
            }
        });
    },

//    resetAndSendInvite: function(recipientID) {
//        if (this.inviteConversationKey) {
//            this.deleteInvite(this.inviteConversationKey, function() {
//                delete this.inviteConversationKey;
//            })
//        }
//        else {
//            this.sendInviteToAPI()
//        }
//    },

    sendMissedIM: function (messageQueue, targetMemberId) {
        if (messageQueue.length == 0)
            return;
        if (webIM.chatterState === "blocked" || webIM.chatterIsBlocked) { // if blocked or blocking, don't continue
            return;
        }
        var missedIMUrl = '/instantmessenger/missedIM';
        var postData = {
            recipientMemberId : targetMemberId,
            messages : messageQueue
        };
        spark.utilities.log('calling ' + missedIMUrl + ' ' + postData);
        this.invokeAPI(missedIMUrl, "POST", postData, function (success, data) {
             if (success) {
                spark.utilities.log('missed IM successful \n' + data.statusText);
            }
            else {
                spark.utilities.log('missed IM error \n' + data.statusText);
            }
        });
    },

    sendMessage: function (messageText) {
        if (!messageText) {
            return false;
        }

        var dto;
        var now;
        if (webIM.chatterState === "blocked") {
            now = spark.utilities.getFormattedTime();
            dto = { "username": spark.config.brandData.siteName,
                "chatText": spark.locale.getText('userNotAccepting', webIM.chatterMiniProfile.username),
                "timestamp": now
            };
            webIM.renderTemplate('#system_template', dto, true);
            webIM.scroll_chat();
            return false;
        }

        if (webIM.chatterState === "declined") {
            webIM.chatterState = "unavailable";  // let the user try to make contact again
            webIM.renderChatState();
        }

        if (webIM.chatterIsBlocked) {
            now = spark.utilities.getFormattedTime();
            dto = { "username": spark.config.brandData.siteName,
                "chatText": spark.locale.getText('youMustUnblock', webIM.chatterMiniProfile.username),
                "timestamp": now
            };
            webIM.renderTemplate('#system_template', dto, true);
            webIM.scroll_chat();
            return false;
        }

        var message = $msg({ to: webIM.chatterJid,
            "type": "chat"
        })
            .c('body').t(messageText).up()
            .c('active', { xmlns: "http://jabber.org/protocol/chatstates" });
        
        $(this).val('');
        webIM.composing = false;
		webIM.messageCount++;
		if (webIM.chatterState === "unavailable") {
            webIM.messageQueue.push(messageText.replace("\n", ""));
            //spark.utilities.log("message enqueued. total:" + webIM.messageQueue.length + " message:" + messageText);
			if (!webIM.invitationPending) {
                webIM.sendInvite(webIM.chatterMemberId);
                webIM.scheduleMissedIMNotice();
                webIM.invitationPending = true;
				s.eVar26 = "IM"; // type of iMail being sent (with event 11)
                s.events = "event11,event67"; // event11 = iMail sent, 67 = IM initiate
                webIM.callOmniture();
                delete s.events;
                delete s.eVar26;
                webIM.renderChatState(); // change status from "type a message to invite..." to "waiting for ..."
            }
        }
		webIM.connection.send(message);

        //webIM.sendMissedIM(webIM.messageQueue, webIM.chatterMemberId); //for testing only, otherwise comment this out
        return true;
    },

    scroll_chat: function () {
        var div = $('.chat_messages').get(0);
        div.scrollTop = div.scrollHeight;
    },

    displayOwnMessage : function (messageText) {
        var dto = { "username": webIM.ownMiniProfile.username,
            "chatText": messageText,
            "timestamp": spark.utilities.getFormattedTime()
        };
        webIM.renderTemplate('#self_message_template', dto, true);
        webIM.scroll_chat();
    },
	
	showSystemMessage: function(message) {
		var dto = {
			chatText: message, 
			username: "JDate", 
			timestamp: spark.utilities.getFormattedTime()
		};
                
        webIM.renderTemplate("#system_template", dto, true);
	},
	
    // TODO improve this UI, see if css here can be moved to css file
    blockUI : function(message) {
        $.unblockUI();
//        message = message + ' <a href="#" class="reload_link">Click to reload page</a>';
        $.blockUI({
            message: message,
            css: {
                border: '',
                cursor: '',
                color: '',
                backgroundColor: 'white',
                padding:'1em',
                fontSize : '13px'
            },
            overlayCSS: {
                cursor: null
            }
        });
    },

    allowUI : function() {
        $.unblockUI();
    },

    reconnectToServer: function () {
        webIM.chatterState = 'unavailable';
        webIM.chatterHasJoined = false;
        webIM.invitationPending = false;
        webIM.renderChatState();
        setTimeout(function () {
            $(document).trigger('connect', {
                jid: webIM.ownJid,
                password: spark.API.restClient.loginData.accessToken
            });
        }, 2000);
    },

    sendSynchDisconnect: function() {
        if (webIM.connection) {
            webIM.connection.send($pres({
                to: webIM.chatterJid,
                "type": "unavailable"
            }));
            webIM.connection.sync = true;
            webIM.connection.flush();
            webIM.connection.disconnect('disconnecting');
        }
    },

    scheduleMissedIMNotice: function () {
        if (webIM.missedIMQueued) {
            return;
        }

        webIM.missedImInfoCall = setTimeout(function () {
            var dto = { "username": spark.config.brandData.siteName,
                "chatText": spark.locale.getText('messagesWillBeEmailed', webIM.chatterMiniProfile.username),
                "timestamp": spark.utilities.getFormattedTime()
            };
            webIM.renderTemplate('#system_template', dto, true);
            webIM.scroll_chat();
            webIM.missedIMQueued = false;
        }, 300000);
        webIM.missedIMQueued = true;
    },

    scheduleStuckMessage: function(message) {
        var that = this;
        this.stuckMessageCall = setTimeout(function () {
            s.eVar66 = message;
            that.callOmniture();
            delete s.eVar66;
        }, 30000);
    },

    cancelStuckMessage: function() {
        if (webIM.stuckMessageCall) {
            clearTimeout(webIM.stuckMessageCall);
        }
    },

    executeChatEndActions : function() {
        webIM.sendSynchDisconnect();

        // if receiver never got online, trigger missed IM
        if (webIM.messageQueue.length > 0) {
            webIM.sendMissedIM(webIM.messageQueue, webIM.chatterMemberId);
        }

        s.eVar58 = webIM.chatDuration;
        s.eVar59 = webIM.messageCount;
        webIM.callOmniture();
        delete s.eVar58;
        delete s.eVar59;
    },

    handleWindowClosing : function() {
        if (webIM.endChatActionsTaken) {
            //alert('end of chat actions already taken');
            return;
        }

        webIM.closingWindow = true; // to prevent reconnecting to chat
        var endChatTime = new Date().getTime();
        webIM.chatDuration = Math.round((endChatTime - webIM.startChatTime) / 1000);
        spark.utilities.log("Total duration in seconds:" + webIM.chatDuration  + " Start:" + webIM.startChatTime + " End:" + endChatTime);
        spark.utilities.log("Total messages sent:" + webIM.messageCount);

        if (webIM.isMobile() && window.opener) { // send the parent window a message tell it to handle end of chat actions
                             // this is done because the current window may be destroyed before it can finish ajax calls, etc.
            var params = {
                chatterMemberId : webIM.chatterMemberId,
                messageQueue : webIM.messageQueue,
                chatDuration : webIM.chatDuration,
                messageCount : webIM.messageCount
            };
            var jsonParams = JSON.stringify(params);
            window.opener.postMessage(jsonParams, '*');
        }
        else { // parent was closed, try to handle end of chat actions in the current window (hopefully, before it closes)
            webIM.executeChatEndActions();
        }
        webIM.endChatActionsTaken = true;
    },

    bindEvents: function () {
        var that = this;
        $(document).bind('connect', function (ev, data) {
            var conn = new Strophe.Connection(that.boshServer);
            var message = spark.locale.getText('connecting');
            that.blockUI(message);
            spark.utilities.log(message);

            conn.connect(data.jid, data.password, function (status) {
                spark.utilities.log('status: ' + that.stropheStatusText[status]);
                //that.blockUI(that.stropheStatusText[status]);
                if (status != that.lastStropheStatus && that.stropheOmnitureCodes[status]) {
                    if (that.chatConnectStartTime) {
                        // status went from connecting to something else.  Tell omniture how long it took to connect or fail
                        that.chatConnectDuration = Math.round(new Date().getTime() - that.chatConnectStartTime);
                        spark.utilities.log("chat connect duration in milliseconds:" + that.chatConnectDuration);
                        that.chatConnectStartTime = null;
                        s.eVar20 = that.chatConnectDuration;
                    }
                    if (status === Strophe.Status.CONNECTING) {
                        s.eVar19 = that.initialAPICallDuration;
                    }
                    s.eVar66 = that.stropheOmnitureCodes[status];
                    that.callOmniture();
                    delete s.eVar66;
                    delete s.eVar19;
                    delete s.eVar20;
                }
                that.lastStropheStatus = status;
                if (status === Strophe.Status.CONNECTING) {
                    that.chatConnectStartTime = new Date().getTime();
                    that.scheduleStuckMessage('error_stuck_connecting');
                }
                else {
                    if (status === Strophe.Status.CONNFAIL) {
                        that.cancelStuckMessage();
                        spark.utilities.log('Connection to chat server at ' + that.boshServer + ' failed.  Retrying...');
                        message = spark.locale.getText('chatConnectionFailed');
                        that.blockUI(message);
                        that.reconnectToServer();
                    }
                    else if (status === Strophe.Status.CONNECTED) {
                        that.cancelStuckMessage();
                        that.allowUI();
                        $(document).trigger('connected');
                    }
                    else if (status === Strophe.Status.DISCONNECTED) {
                        that.cancelStuckMessage();
                        if (!that.closingWindow) {
                            message = spark.locale.getText('disconnectedReconnecting');
                            that.blockUI(message);
                            that.reconnectToServer();
                        }
                    }
                    else if (status === Strophe.Status.AUTHENTICATING) {
                        that.cancelStuckMessage();
                        that.scheduleStuckMessage('error_stuck_authenticating');
                    }
                    else if (status === Strophe.Status.AUTHFAIL) {
                        spark.utilities.log('authorization with chat server failed');
                        that.cancelStuckMessage();
                        message = spark.locale.getText('oopsTryLater', spark.API.restClient.errorCodes["error_ejab_auth_failed"]);
                        that.blockUI(message);
                        //that.redirectUserToMobileLogin('error_ejab_auth_failed');
                    }
                }

            });
            that.connection = conn;
        });

        $(document).bind('connected', function () {
            var iq = $iq({ type: 'get' }).c('query', { xmlns: 'jabber:iq:roster' });
            webIM.connection.sendIQ(iq, webIM.on_roster);

            webIM.connection.addHandler(webIM.on_roster_changed,
                "jabber:iq:roster", "iq", "set");
            webIM.connection.addHandler(webIM.on_message,
                null, "message", "chat");
        });

        $(window).bind("pageshow", function() {
            webIM.closingWindow = false; // allow reconnect to chat
            webIM.renderChatState();
            webIM.endChatActionsTaken = false;
        });

        $(window).bind("pagehide", function() {
            webIM.sendSynchDisconnect();
            webIM.renderChatState();
            webIM.handleWindowClosing();
        });

        $(window).bind('beforeunload', function () {
            // IE8 closes before the disconnecting message goes through, delay by prompting the user
            webIM.handleWindowClosing();
            //if (navigator.appVersion.indexOf('MSIE 8') !== -1 || window.location.href.toLocaleLowerCase().indexOf('forceexitprompt') !== -1) {
            if (!webIM.isMobile() || window.location.href.toLocaleLowerCase().indexOf('forceexitprompt') !== -1) {
                return 'Leaving this page will end your IM session';
                // note: browsers may show their own text along with or instead of the text returned here
            }
        });

        $(document).bind('disconnected', function () {
            webIM.connection = null;
            webIM.pending_subscriber = null;
            webIM.blockUI(spark.locale.getText('refreshPage'));
            $('.chat_messages ul').empty();
        });

        $('.send_button').live('click', function () {
            var input = $('.chat_input');
            var messageText = input.val();
            if (webIM.sendMessage(messageText)) {
                webIM.displayOwnMessage(messageText);
            }
            input.val('');
        });

        webIM.$favorite_symbol.live('click', function () {
            var isAddAction = !webIM.chatterIsFavorite;
            spark.utilities.log(isAddAction ? 'Adding' : 'Removing' + ' favorite');
            spark.API.restClient.changeHotlist('default', webIM.chatterMemberId, isAddAction, function(success, response) {
                if (success) {
                    var imagePath;
                    var titleText;
                    if (isAddAction) {
                        imagePath = 'images/icon_fave_on.png';
                        titleText = spark.locale.getText('unfavoriteMember');
                    }
                    else {
                        imagePath = 'images/icon_fave_off.png';
                        titleText = spark.locale.getText('favoriteMember');
                    }
                    webIM.$favorite_symbol = $('#favorite_symbol');
                    if(webIM.$favorite_symbol.is("img")) {
                    	webIM.$favorite_symbol.attr('src', imagePath);
                    	webIM.$favorite_symbol.attr('title', titleText);
                    } else {
                    	// Anchor tag used for mobile instead of image.
                    	if (isAddAction) {
                    		webIM.$favorite_symbol.removeClass("fave-off").addClass("fave-on");
                    	} else {
                    		webIM.$favorite_symbol.removeClass("fave-on").addClass("fave-off");
                    	}
                    }
                    webIM.chatterIsFavorite = isAddAction;
                    spark.utilities.log('successfully updated favorite list');
                }
                else {
                	webIM.showSystemMessage(spark.locale.getText("favoriteFailed", webIM.chatterMiniProfile.username));
                    spark.utilities.log('failed to update favorite list');
                }
            });
        });

//        $('.reload_link').live('click', function () {
//            location.reload();
//        });

        webIM.$block_symbol.live('click', function () {
            var isAddAction = !webIM.chatterIsBlocked;
            spark.utilities.log(isAddAction ? 'Adding' : 'Removing' + ' to blocked list');
            var status = isAddAction ? 'blocked' : 'online';
            webIM.connection.send($pres({
                to: webIM.chatterJid,
                "type": status
            }));

            spark.API.restClient.changeHotlist('IgnoreList', webIM.chatterMemberId, isAddAction, function(success, response) {
                if (success) {
                    var imagePath;
                    var titleText;
                    if (isAddAction) {
                        imagePath = 'images/icon_block_on.png';
                        titleText = spark.locale.getText('unblockMember');
                    }
                    else {
                        imagePath = 'images/icon_block_off.png';
                        titleText = spark.locale.getText('blockMember');
                    }
                    webIM.$block_symbol = $('#block_symbol');
                    if(webIM.$block_symbol.is("img")) {
                    	webIM.$block_symbol.attr('src', imagePath);
                    	webIM.$block_symbol.attr('title', titleText);
                    } else {
                    	if(isAddAction) {
                    		webIM.$block_symbol.removeClass("block-off").addClass("block-on");
                    	} else {
                    		webIM.$block_symbol.removeClass("block-on").addClass("block-off");
                    	}
                    }

                    webIM.chatterIsBlocked = isAddAction;
                    webIM.renderChatState();
                    spark.utilities.log('successfully updated blocked list');
                }
                else {
                	webIM.showSystemMessage(spark.locale.getText("blockFailed", webIM.chatterMiniProfile.username));
                    spark.utilities.log('failed to update blocked list');
                }
            });
        });
        
        $('.chat_input').live('keyup', function (ev) {
            var messageText = $(this).val().replace(/[\n\r]/g, '');
            if (ev.which === 13) { //} && !ev.shiftKey) {
                ev.preventDefault();
                $(this).val('');
                if (!messageText) {
                    return;
                }
                spark.utilities.log('sending message: ' + messageText);
                if (webIM.sendMessage(messageText)) {
                    webIM.displayOwnMessage(messageText);
                }
                return;
            }

            if (!webIM.isMaxLengthSupported()) { // if textarea maxLength isn't supported by the browser, limit characters here
                var val = webIM.$textarea.val().replace(/\r\n|\r|\n/g, "\r\n"); // Fix OS-specific line-returns to do an accurate count
                if (val.length > webIM.maxLength) {
                    val = val.slice(0, webIM.maxLength);
                    webIM.$textarea.val(val);
                }
            }

            var notify;
            if (!messageText && webIM.composing) {  // remove "user is typing..."
                spark.utilities.log('sending paused message');
                notify = $msg({ to: webIM.chatterJid, "type": "chat" })
                    .c('paused', { xmlns: "http://jabber.org/protocol/chatstates" });
                webIM.connection.send(notify);
                webIM.composing = false;
            }
            else if (messageText && !webIM.composing && webIM.chatterState === "online") { // add "user is typing..."
                spark.utilities.log('sending composing message');
                notify = $msg({ to: webIM.chatterJid, "type": "chat" })
                    .c('composing', { xmlns: "http://jabber.org/protocol/chatstates" });
                webIM.connection.send(notify);
                webIM.composing = true;
            }
        });
    },

    redirectUserToMobileLogin: function (errorCode) {
        s.eVar66 = errorCode;
        this.callOmniture();
        //this.blockUI(spark.locale.getText('pleaseLogIn', spark.API.restClient.errorCodes[errorCode]));
        spark.API.restClient.clearMOSCookies('.' + spark.config.rootDomain);
        spark.API.restClient.clearMOSCookies('.' + spark.config.environmentSubdomain + '.' + spark.config.rootDomain);
        window.location.href = spark.config.mobileLoginUrl + '?destinationURL=' + encodeURIComponent(window.location.href);
    },

    getErrorCodeForHttpStatus: function (status){
        var errorCode;
        switch (status) {
            case 400: errorCode = 'error_api_call_failed_bad_request';
                break;
            case 401: errorCode = 'error_api_call_failed_unauthorized';
                break;
            case 500: errorCode = 'error_api_call_failed_server_error';
                break;
            default: errorCode = 'error_api_call_failed';
        }
        return errorCode;
    },

    handleFailedAPICall : function(status) {
        var errorCode = this.getErrorCodeForHttpStatus(status);
        if (status === 401) {
            this.redirectUserToMobileLogin(errorCode);
        }
        else {        	
            var message = spark.locale.getText('oopsTryLater', spark.API.restClient.errorCodes[errorCode]);
            this.blockUI(message, errorCode);
        }
    },

    useFlXHRIfNeeded : function () {
        if (!spark.API.restClient.isCorsSupported()) {
            $.flXHRproxy.registerOptions(spark.config.restServerV2, {xmlResponseText:false});
            // set flXHR as the default XHR object used in jQuery AJAX requests
            $.ajaxSetup({transport:'flXHRproxy'});
        }
    },

    isMaxLengthSupported : function () {
        if (typeof(webIM.maxLengthSupported) !== "undefined") {
            return webIM.maxLengthSupported;
        }
        var ta =  document.createElement("textarea");
        webIM.maxLengthSupported = (typeof(ta.maxLength) !== "undefined");
        spark.utilities.log('maxLength is ' + (webIM.maxLengthSupported ? '' : 'not ') + 'supported');
        return webIM.maxLengthSupported;
    },
	
	isMobile : function() {
		var e = $("meta[name='mobile']");
		if($(e).length !== 0) {
			var mobile = $(e).attr("content");
			return (mobile === "true");
		}
		return false;
	},
	
    init: function () {
        "use strict";
        if (!spark || !spark.config) {
            var error = 'Missing spark.config, cannot continue';
            spark.utilities.log(error);
            throw(error);
        }
        //alert('(ignore this popup)\n onbeforeunload=' + window.onbeforeunload + '\n pagehide=' + window.onpagehide);
        $('.send_button').text(spark.locale.getText('send'));
        this.$textarea = $(".chat_input");
        this.$textarea.focus();
        var max = this.$textarea.attr('maxLength');
        this.maxLength = parseInt(max, 10);

        webIM.endChatActionsTaken = false;
        if ( /Android 2.3/i.test(navigator.userAgent) ) {
            webIM.IsAndroidGingerbread = true;
        }

        this.$favorite_symbol = $('#favorite_symbol');
        this.$block_symbol = $('#block_symbol');

        this.bindEvents();
        if (!spark.API.restClient.loginData || !spark.API.restClient.loginData.accessToken) {
            spark.utilities.log('Missing access token cookie, log into main site');
            this.redirectUserToMobileLogin('error_missing_token_cookie');
            return;
        }
        if (!spark.API.restClient.loginData.memberId) {
            spark.utilities.log('Missing logged in member ID cookie');
            this.redirectUserToMobileLogin('error_missing_member_id_cookie');
            return;
        }
        this.chatterMemberId = parseInt(this.getQueryVariable(window.location.href, "memberId"), 10);
        if (!this.chatterMemberId) {
            this.blockUI(spark.locale.getText('noMemberId'));
            return;
        }
        this.ownJid = spark.API.restClient.loginData.memberId + '-' + spark.config.brandData.communityId + '@' + this.chatServerName;
        this.chatterJid = this.chatterMemberId + '-' + spark.config.brandData.communityId + '@' + this.chatServerName;
        if (spark.API.restClient.loginData.memberId === this.chatterMemberId) {
            this.blockUI(spark.locale.getText('noSelfChat'));
            return;
        }

        this.useFlXHRIfNeeded();
        spark.API.restClient.setLoggedOutCallback(this.redirectUserToMobileLogin);

        this.blockUI(spark.locale.getText('loadingProfile'));
        this.APIConnectStartTime = new Date().getTime();
        var that = this;
        // get chatter's mini profile first, so the username can be displayed in messages like "<username> has blocked you, etc.
        spark.API.restClient.fetchMiniProfile(webIM.chatterMemberId, function (success, data) {
            // status went from connecting to something else.  Tell omniture how long it took to connect or fail
            that.initialAPICallDuration = Math.round((new Date().getTime() - that.APIConnectStartTime));
            spark.utilities.log("API Connect duration in milliseconds:" + that.initialAPICallDuration);
            if (success) {
                that.chatterMiniProfile = data;
				
                var gender = that.chatterMiniProfile.gender ? spark.locale.getText(that.chatterMiniProfile.gender.toLowerCase()) : '';
                var seekingGender = that.chatterMiniProfile.seekingGender ? spark.locale.getText(that.chatterMiniProfile.seekingGender.toLowerCase()) : '';
                var dto = {
                    "miniProfileId": that.chatterMiniProfile.id,
                    "username": that.chatterMiniProfile.username,
                    "thumbnail": that.chatterMiniProfile.thumbOrNoPic,
                    "age": spark.locale.getText('yearsOld', that.chatterMiniProfile.age),
                    "genderAndSeeking": spark.locale.getText('genderAndSeeking', gender, seekingGender),
                    "location": that.chatterMiniProfile.location,
                    "profileLink": (!webIM.isMobile()) ? spark.config.fwsUrl + "/Applications/MemberProfile/ViewProfile.aspx?PersistLayoutTemplate=1&EntryPoint=99999&Ordinal=1&MemberID=" + that.chatterMemberId + "&LayoutTemplateID=15&rnd=1348172485420" :
                    	spark.config.mobileStaticProfileUrl + "/" + that.chatterMiniProfile.memberId
                };

                that.renderTemplate('#mini_profile_template', dto, false);
                that.$favorite_symbol = $('#favorite_symbol');
                if(that.$favorite_symbol.is("img")) 
                	that.$favorite_symbol.attr('title', spark.locale.getText('favoriteMember'));

                that.$block_symbol = $('#block_symbol');
                if(that.$block_symbol.is("img")) 
                	that.$block_symbol.attr('title', spark.locale.getText('blockMember'));

                // todo: bedrock should assign the title instead. launchEjabIMWindow();
                document.title = that.chatterMiniProfile.username + ' - Instant Message';
                spark.API.restClient.fetchHotlist('ignoreList', spark.API.restClient.loginData.memberId, function (response) {
					var statusCode = response ? (response.Result ? response.Result.code : response.code) : 0;
					
					if(statusCode !== 200) {
						var message = response ? (response.Result ? response.Result.error.message : response.error.message) : "";
						var status = statusCode;
						
                        spark.utilities.log("Unable to retrieve blocked list for logged in member");
                        spark.utilities.log(message);
                        that.handleFailedAPICall(status);
						return;
					}
                    
                    var data = (response) ? response.data : null;
                    var len = (data) ? data.length : 0;
                    for (var i = 0; i < len; i++) {                    	
                        var miniProfile = data[i]['miniProfile'];
                        if (miniProfile && miniProfile.id === that.chatterMemberId) {
                           	that.blockUI(spark.locale.getText('youMustUnblock', that.chatterMiniProfile.username));
                            that.chatterIsBlocked = true;
                            // todo: display blocked symbol instead of using blockUI?
                            return;
                        }
                    }
                    
                    spark.API.restClient.checkMemberOnHotlist('ignoreList', that.chatterMemberId, spark.API.restClient.loginData.memberId, function (success, data) {
                        if (!success) {
                            spark.utilities.log('Unable to retrieve blocked status for member ' +  spark.API.restClient.loginData.memberId + ' on blocked list of member ' + that.chatterMemberId);
                            
                            that.handleFailedAPICall(data.status);
                            return;
                        }
                        if (data) {
                            that.blockUI(spark.locale.getText('notAcceptingMessages', that.chatterMiniProfile.username));
                            return;
                        }
                        spark.API.restClient.fetchMiniProfile(spark.API.restClient.loginData.memberId, function (success, data) {
                            if (success) {
                                that.ownMiniProfile = data;
                                if (!that.ownMiniProfile['passedFraudCheck']) {
                                    that.blockUI(spark.locale.getText('pendingSubscription'));
                                    return;
                                }
                                that.renderChatState();
                                $(function () {
                                    $(document).trigger('connect', {
                                        jid: that.ownJid,
                                        password:spark.API.restClient.loginData.accessToken
                                    });
                                });
                            }
                            else { // token looked good but API call failed
                                spark.utilities.log('Error getting own mini Profile. Status code:' + data.status);
                                that.handleFailedAPICall(data.status);
                                return;
                            }
                        });
                        spark.API.restClient.fetchHotlist('default', spark.API.restClient.loginData.memberId, function (response) {
							var statusCode = response ? (response.Result ? response.Result.code : response.code) : 0;
							
							if(statusCode !== 200) {
								var message = response ? (response.Result ? response.Result.error.message : response.error.message) : "";
								var status = statusCode;
								
		                        spark.utilities.log("Unable to retrieve blocked list for logged in member");
		                        spark.utilities.log(message);
		                        that.handleFailedAPICall(status);
								return;
							}
		                    
		                    var data = (response) ? response.data : null;
		                    var len = (data) ? data.length : 0;
                            for (var i = 0; i < len; i++) {
                                var miniProfile = data[i]['miniProfile'];
                                if (miniProfile && miniProfile.id === that.chatterMemberId) {
                                    that.$favorite_symbol = $('#favorite_symbol');
                                    if(that.$favorite_symbol.is("img")) {
                                    	that.$favorite_symbol.attr('src', 'images/icon_fave_on.png');
                                    	that.$favorite_symbol.attr('title', spark.locale.getText('unfavoriteMember'));
                                    } else {
                                    	// Anchor tag used for mobile instead of image.
                                    	that.$favorite_symbol.removeClass("fave-off").addClass("fave-on");
                                    }
                                    that.chatterIsFavorite = true;
                                    return;
                                }
                            }
                        });

                    });
                });

            }
            else { // token looked good but call to API failed
                s.eVar19 = that.initialAPICallDuration;
                that.callOmniture();
                spark.utilities.log('Error getting chatter mini Profile. Status code:' + data.status);
                
                that.handleFailedAPICall(status);
                return;
            }
        });

    }
};

if (!webIM.initialized) {
    $(function() {
        webIM.init();
        webIM.initialized = true;
    });
}
