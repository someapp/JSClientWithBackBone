; var _statusCode;
"use strict";

module("OAuth Authentication", "stage3 v2 rest api");
test("[post CreateAccessTokenPassword] for arod", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/oauth2/accesstoken/application/" + _appId + "?client_secret=" + _clientSecret;
    var request = { "email": _emailAddress, "password": _password };

    var sendReq = $.ajax({
        type: 'POST',
        url: url,
        data: request,
        success: function (data) {
            var response = data.data;
            sessionStorage.setItem("AccessToken", response.AccessToken);
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });
    ok(true, "url: " + url);
    ok(true, "brandId: " + _brandId);
    ok(true, "appId: " + _appId);
    ok(true, "clientSecrete: " + _clientSecret);
    ok(true, "password: " + request.password);
    ok(true, "email: " + request.email);
    ok(true, "password: " + request.password);
    ok(true, "access token retrieved:" + sessionStorage.getItem("AccessToken"));
    ok(true, "rest resquest sent: " + sendReq.toString());
    ok(true, "rest response raw received" + sendReq.complete());
    strictEqual(_statusCode, "200", "Expect HTTP Status 200");
    notStrictEqual(undefined, sessionStorage.getItem("AccessToken"), "Expect some access token be returned");
    notStrictEqual(null, sessionStorage.getItem("AccessToken"), "Expect some access token be returned");

});
test("[post CreateAccessTokenPassword] for wlee", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/oauth2/accesstoken/application/" + _appId + "?client_secret=" + _clientSecret;
    var request = { "email": _targetMemberEmailAddress, "password": _targetMemberPassword };

    $.ajax({
        type: 'POST',
        url: url,
        data: request,
        success: function (data) {
            var response = data.data;
            sessionStorage.setItem("TargetMemberAccessToken", response.AccessToken);
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });

    ok((_statusCode == "200"), "retrieved an access token for " + _targetMemberEmailAddress + " access token:" + sessionStorage.getItem("TargetMemberAccessToken"));
});

module("Profile");

test("[get AttributeSetMiniProfile] wlee fetches arod mini profile", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/profile/attributeset/miniProfile/" + _memberId + "?access_token=" + sessionStorage.getItem("TargetMemberAccessToken");
    var miniProfile;

    $.ajax({
        type: 'GET',
        url: url,
        success: function (data) {
            miniProfile = data.data;
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });

    ok((_statusCode == "200"), "fetched arod's profile for wlee. username:" + miniProfile.username + " IsOnline:" + miniProfile.isOnline);
});

test("[get AttributeSetMiniProfile] arod fetches wlee mini profile", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/profile/attributeset/miniProfile/" + _targetMemberId + "?access_token=" + sessionStorage.getItem("AccessToken");
    var miniProfile;

    $.ajax({
        type: 'GET',
        url: url,
        success: function (data) {
            miniProfile = data.data;
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });

    ok((_statusCode == "200"), "fetched wlee's profile for arod. username:" + miniProfile.username + " IsOnline:" + miniProfile.isOnline);
});

module("Instant Messenger");
test("[post AddInvite] wlee invites arod", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/instantmessenger/invite?access_token=" + sessionStorage.getItem("TargetMemberAccessToken");
    var request = { "recipientMemberId": _memberId };

    $.ajax({
        type: 'POST',
        url: url,
        data: request,
        success: function (data) {
            var response = data;
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });

    ok((_statusCode == "200"), "added a new IM invite for memberId:" + _targetMemberId);
});
test("[get GetInvites] for arod", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/instantmessenger/invites?access_token=" + sessionStorage.getItem("AccessToken");
    var count;

    $.ajax({
        type: 'GET',
        url: url,
        success: function (data) {
            var invites = data.data;
            count = invites.length;
            sessionStorage.setItem("ConversationKey", invites[0].ConversationKey);
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });

    ok((count > 0), "retrieved invites total: " + count + " conversationKey: " + sessionStorage.getItem("ConversationKey"));
});
test("[remove RemoveInvite] from wlee for arod", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/instantmessenger/invite?access_token=" + sessionStorage.getItem("AccessToken");
    var request = { "ConversationKey": sessionStorage.getItem("ConversationKey") };
    var response;

    $.ajax({
        type: 'DELETE',
        url: url,
        data: request,
        success: function (data) {
            response = data.data;
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });

    ok((_statusCode == "200"), "removed invite.");
});
test("[post SendMissedIM] send missed IM to arod from wlee", function () {
    var url = _apiUrl + "/brandId/" + _brandId + "/instantmessenger/missedIM?access_token=" + sessionStorage.getItem("TargetMemberAccessToken");
    var messages = ["First message", "Second message", "Third message"];
    var request = { "recipientMemberId": _memberId, "Messages": messages };

    $.ajax({
        type: 'POST',
        url: url,
        data: request,
        traditional: true,
        success: function (data) {
            var response = data;
        },
        dataType: "json",
        async: false,
        complete: function (e, xhr, settings) {
            _statusCode = e.status;
            start();
        }
    });

    ok((_statusCode == "200"), "please check arod's mailbox. need addtional work to test the inbox.");
});


function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}