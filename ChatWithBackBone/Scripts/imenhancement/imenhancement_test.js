;
/* ***** BEGIN DESCRIPTION BLOCK *****
Ed Tsang
Javascript unit test to call the imenhacement im client

* ***** END DESCRIPTION BLOCK ***** */
"use strict";

(function( window ) {
    var _statusCode = undefined;
        
}

module("InternetMesseging", "stage3 v2 rest api");
test("[post AddInvite] wlee invites arod");

test("[get GetInvites] for arod");

test("[remove RemoveInvite] from wlee for arod");

test("[post P2P text message, both online] send P2P VideoMessage to arod from wlee, both online");

test("[post SendMissedIM] send missed IM to arod from wlee");

test("[post P2P VideoMessage, both online] send P2P VideoMessage to arod from wlee, both online");

test("[post P2P VideoMessage, both online, empty size message] send P2P Empty VideoMessage to arod from wlee, both online");

test("[post P2P VideoMessage, both online, big size (10M) message] send P2P HUGE SIZE VideoMessage to arod from wlee, both online");

test("[post P2P VideoMessage, both online, huge size (60M) message] send P2P HUGE SIZE VideoMessage to arod from wlee, both online");

test("[post Peer2Peer VoiceMessage] send P2P VideoMessage to arod offline from wlee online");



