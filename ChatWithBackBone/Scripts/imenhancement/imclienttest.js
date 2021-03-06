﻿; var _statusCode;
"use strict";
var serviceApi = {
    _apiUrl: "http://api.stgv3.spark.net/v2"
};

var wlee = {    
    _brandId: "1003",
    _appId: "1054",
    _clientSecret: "nZGVVfj8dfaBPKsx_dmcRXQml8o5N-iivf5lBkrAmLQ1",
    _memberId: "114402580",
    _emailAddress: "arodriguez@spark.net",
    _password: "1111",
    _targetMemberId: "27029711",
    _targetMemberEmailAddress: "wlee@spark.net",
    _targetMemberPassword: "1234"

};

var aRod = {  
    _brandId: "1003",
    _appId: "1054",
    _clientSecret: "nZGVVfj8dfaBPKsx_dmcRXQml8o5N-iivf5lBkrAmLQ1",
    _memberId: "114402580",
    _emailAddress: "arodriguez@spark.net",
    _password: "1111",
    _targetMemberId: "27029711",
    _targetMemberEmailAddress: "wlee@spark.net",
    _targetMemberPassword: "1234"    

};


module("OAuth Authentication", "stage3 v2 rest api", {
    setup: function () {
        
    
    
    },

    teardown: function () {
        
    }

});
test("[post CreateAccessTokenPassword] for arod", function () {
    var url = serviceApi._apiUrl + "/brandId/" + wlee._brandId + "/oauth2/accesstoken/application/" + wlee._appId + "?client_secret=" + wlee._clientSecret;
    var request = { "email": wlee._emailAddress, "password": wlee._password };
    console.log("email: " + request.email + "password: " + request.password);

    $.ajax({
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
            if (QUnit.config.semaphore > 0) {
                QUnit.start();}
            
        }
    });

    ok(true, "url: " + url);
    ok(true, "brandId: " + wlee._brandId);
    ok(true, "appId: " + wlee._appId);
    ok(true, "clientSecrete: " + wlee._clientSecret);
    ok(true, "password: " + request.password);
    ok(true, "email: " + request.email);
    ok(true, "password: " + request.password);
    var accessToken = sessionStorage.getItem("AccessToken");
    ok(true, "access token retrieved:" + accessToken);
    var accessTokenLength = accessToken.length;
    strictEqual(_statusCode, 200, "Expect HTTP Status 200");
    ok((accessTokenLength > 0), "Expect Access Token has length: " + accessTokenLength);
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