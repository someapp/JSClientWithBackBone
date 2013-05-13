/* Environment Settings for IMEnahcement js client
** environment.js should be loaded before your im client and im client test js.
*/
; "use strict";
var appConfig = {
                var siteLookup = {
                "blacksingles": 24,
                "jdate": 3,
                "spark": 1,
                "bbwpersonalsplus": 23,
                "cupid": 10
            };
boshPort: 
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
    accountSid: 'ACXXX',
    authToken: 'XXX',
    from: '+16512223333', //The Twilio number you've bought or configured
    to: '+16513334444' //The number you would like to send messages to for testing
};

