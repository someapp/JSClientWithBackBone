var spark = spark || {};
spark.API = spark.API || {};
spark.API.restClient = spark.API.restClient || {

    errorCodes : {
        "error_ejab_auth_failed" : "ZA000A",
        "error_missing_token_cookie" : "ZA000T",
        "error_missing_member_id_cookie" : "ZA000C",
        "error_token_expired" : "ZA000E",
        "error_api_call_failed" : "ZA000R",
        "error_api_call_failed_bad_request" : "ZA400R",
        "error_api_call_failed_unauthorized" : "ZA401R",
        "error_api_call_failed_server_error" : "ZA500R"
    },

    isCorsSupported : function () {
        return !!(window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest());
    },

    clearCookie : function(cookieName, domain) {
        domain ? $.cookie(cookieName, null, { expires: -1, domain : domain }) :$.cookie(cookieName, null, { expires: -1 });
    },

    clearMOSCookies : function(domain) {
        this.clearCookie('MOS_MEMBER', domain);
        this.clearCookie('MOS_ACCESS', domain);
        this.clearCookie('MOS_SUB', domain);
        this.clearCookie('MOS_ACCESS_EXPIRES', domain);
        this.clearCookie('MOS_REFRESH', domain);
        this.clearCookie('MOS_EA', domain);
        this.clearCookie('MOS_DOMAIN', domain);
        this.clearCookie('MOS_SESSION', domain);
        this.clearCookie('MOS_OMNI_LOGIN', domain);
    },

//    showCookies : function() {
//        var getCookies = function(){
//            var pairs = document.cookie.split(";");
//            var cookies = {};
//            for (var i=0; i<pairs.length; i++){
//                var pair = pairs[i].split("=");
//                cookies[pair[0]] = unescape(pair[1]);
//            }
//            return cookies;
//        }
//        var text = '';
//        var cookies = getCookies();
//        for (var a in cookies) {
//            if (a.indexOf('MOS_') !== -1) {
//                text += a + ": " + cookies[a] + "\n";
//            }
//        }
//        alert(text);
//    },

    getLoginDataCookies : function () {
        var tokenDomain = $.cookie("MOS_DOMAIN");
//        if (tokenDomain !== spark.config.environmentSubdomain) {
//            alert(tokenDomain + " expecting: " + spark.config.environmentSubdomain);
//            this.clearMOSCookies(); // if cookies are coming from .jdate.com, and we're expecting cookies from a subdomain,
//            // then clear the .jdate.com cookies so the subdomain cookies can be returned, if they exist.
//            // The root subdomain cookies won't be right for the current environment, and shouldn't be set at the root going forward, anyway
//        }

        return {
            "memberId":parseInt($.cookie("MOS_MEMBER"), 10),
            "accessToken":$.cookie("MOS_ACCESS"),
            "isPayingMember":$.cookie("MOS_SUB"),
            "accessExpiresTime":new Date($.cookie("MOS_ACCESS_EXPIRES")),
            "refreshToken":$.cookie("MOS_REFRESH")
        };
    },

    getLoginData : function () {
        return this.getLoginDataCookies();
    },

    tokenResponseToLoginData : function (tokenResponse) {
        var loginData = {
            "memberId" : praseInt(tokenResponse["MemberId"], 10),
            "accessToken":tokenResponse["AccessToken"],
            "expiresIn":tokenResponse["ExpiresIn"],
            "accessExpiresTime":this.convertAspNetDate(tokenResponse["AccessExpiresTime"]),
            "refreshToken":tokenResponse["RefreshToken"],
            "isPayingMember":tokenResponse["IsPayingMember"]
        };
        spark.utilities.log("expires " + loginData.accessExpiresTime);
        return loginData;
    },

    getSearchPrefs : function () {
        var prefJson = localStorage["searchPrefs"];
        if (!prefJson) {
            return null;
        }
        var prefData = JSON.parse(prefJson);
        return prefData;
    },

    saveSearchPrefs : function (searchPrefs) {
        var prefJson = JSON.stringify(searchPrefs);
        localStorage["searchPrefs"] = prefJson;
    },

    loadSearchPrefsFromPage : function() {
        var searchPrefs = {
            "gender" : $('input:radio[name=gender]:checked').val(),
            "seekingGender" : $('input:radio[name=seekingGender]:checked').val(),
            "minAge" : parseInt($('#search-preferences-minage').val()),
            "maxAge" : parseInt($('#search-preferences-maxage').val()),
            "maxDistance" : parseInt($('#search-preferences-location-range').val()),
            "showOnlyMembersWithPhotos" : $('#search-preferences-photo').val() === "true",
            "showOnlyJewishMembers" : $('#search-preferences-jewish').val() === "true"
        };
        return searchPrefs;
    },

    matchPrefsResponseToDTO : function (machPrefsResponse) {
        var searchPrefs = {
            "gender" : machPrefsResponse["gender"],
            "seekingGender" : machPrefsResponse["seekingGender"],
            "minAge" : parseInt(machPrefsResponse["minAge"]),
            "maxAge" : parseInt(machPrefsResponse["maxAge"]),
            "location" : machPrefsResponse["location"],
            "maxDistance": parseInt(machPrefsResponse["maxDistance"]),
            "showOnlyMembersWithPhotos" : machPrefsResponse["showOnlyMembersWithPhotos"] === "true",
            "showOnlyJewishMembers" : true
        };
        return searchPrefs;
    },

    ensureSearchPrefs : function(callback, state) {
        if (typeof(callback) !== "function") {
            return;
        }
        var searchPrefs = getSearchPrefs();
        if (searchPrefs) {
            callback(searchPrefs, state);
        }
        else {
            ensureGoodToken(function () {
                var ajaxRequest = {
                    contentType : "application/json",
                    type : 'GET',
                    url : spark.config.restServerV2 + '/brandId/' + spark.config.brandData.brandId + '/match/preferences/' + loginData.memberId + '?access_token=' + loginData.accessToken,
                    tryCount : 0,
                    retryLimit : 3,
                    dataType:'json',
                    cache: false,
                    success : function (data) {
                        if (data.hasOwnProperty('data')) {
                            data = data['data'];
                        }
                        searchPrefs = matchPrefsResponseToDTO(data);
                        saveSearchPrefs(searchPrefs);
                        searchPrefs = getSearchPrefs();
                        callback(searchPrefs, state);
                    },
                    error : function(data) {
                        spark.API.restClient.showErrors(data);
                    }
                };
                if (webIM.IsAndroidGingerbread) {
                    ajaxRequest.beforeSend = function (xhr) {
                        // Hack for Android 2.3.X devices (known Google issue).
                        xhr.setRequestHeader("Content-Length", "");
                    };
                }
                $.ajax(ajaxRequest);
            });
        }
    },

    goToLogin : function (errorCode) {
        if (typeof(this.loggedOutCallback) === 'function') {
            this.loggedOutCallback(errorCode);
        }
    },

    setLoggedOutCallback : function (callback) {
        if (typeof(callback) === 'function') {
            this.loggedOutCallback = callback;
        }
    },

    fetchMiniProfile : function (memberId, callback) {
        this.ensureGoodToken(function () {
        if (memberId) {
            var api = spark.API.restClient;
            var ajaxRequest = {
                type : 'GET',
                url : spark.config.restServerV2 + '/brandId/' + spark.config.brandData.brandId + '/profile/attributeset/miniProfile/' + memberId + "/" + '?access_token=' + api.loginData.accessToken,
                tryCount : 0,
                retryLimit : 3,
                dataType : 'json',
                cache: false,
                success : function (data) {
                    if (typeof(callback) === 'function') {
                        if (data.hasOwnProperty('data')) {
                            data = data['data'];
                        }
                        data.thumbOrNoPic = api.getThumbOrNoPic(data); // adding convenience property
                        callback(true, data);
                    }
                },
                error : function(data) {
                    if (typeof(callback) === 'function') {
                        callback(false, data);
                    }
                }
            };
            if (webIM.IsAndroidGingerbread) {
                ajaxRequest.beforeSend = function (xhr) {
                    // Hack for Android 2.3.X devices (known Google issue).
                    xhr.setRequestHeader("Content-Length", "");
                };
            }
            $.ajax(ajaxRequest);
        }
        });
    },

    fetchHotlistCounts : function (successCallback, failureCallback) {
        spark.API.restClient.ensureGoodToken(function () {
            var api = spark.API.restClient;
            var ajaxRequest = {
                type:'GET',
                url: spark.config.restServerV2 + '/brandId/' + spark.config.brandData.brandId + '/hotlist/counts/' + api.loginData.memberId + '?access_token=' + api.loginData.accessToken,
                tryCount : 0,
                retryLimit : 3,
                dataType:'json',
                cache: false,
                success:function (data) {
                    if (data.hasOwnProperty('data')) {
                        data = data['data'];
                    }

                    if (typeof(successCallback) === "function") {
                        successCallback(data);
                    }
                },
                error : function(data) {
                    if (typeof(failureCallback) === "function") {
                        failureCallback();
                    }
                    spark.API.restClient.showErrors(data);
                }
            };
            if (webIM.IsAndroidGingerbread) {
                ajaxRequest.beforeSend = function (xhr) {
                    // Hack for Android 2.3.X devices (known Google issue).
                    xhr.setRequestHeader("Content-Length", "");
                };
            }
            $.ajax(ajaxRequest);
        });
     },

    fetchHotlist : function (hotlist, memberId, callback) {
        spark.API.restClient.ensureGoodToken(function () {
            var api = spark.API.restClient;
            var ajaxRequest = {
                type:'GET',
                url: spark.config.restServerV2 + '/brandId/' + spark.config.brandData.brandId + "/hotlist/" + hotlist + "/pagesize/500/pagenumber/1" + "?access_token=" + api.loginData.accessToken,
                tryCount : 0,
                retryLimit : 3,
                dataType:'json',
                cache: false,
                success:function (response) {
                    if (typeof(callback) === "function") {
                        callback(response);
                    }
                },
                error : function(xhr) {
                    if (typeof(callback) === "function") {
                         callback($.parseJSON(xhr.responseText));
                    }
                    
                   	spark.API.restClient.showErrors($.parseJSON(xhr.responseText));
                }
            };

            if (webIM.IsAndroidGingerbread) {
                ajaxRequest.beforeSend = function (xhr) {
                    // Hack for Android 2.3.X devices (known Google issue).
                    xhr.setRequestHeader("Content-Length", "");
                };
            }
            $.ajax(ajaxRequest);
        });
    },

    checkMemberOnHotlist : function (hotlist, listOwnerMemberId, targetMemberId,  callback) {
        spark.API.restClient.ensureGoodToken(function () {
            var api = spark.API.restClient;
            var ajaxRequest = {
                type:'GET',
                url: spark.config.restServerV2 + '/brandId/' + spark.config.brandData.brandId + '/memberonhotlist/' + hotlist + '/' + targetMemberId + '?access_token=' + api.loginData.accessToken,
                tryCount : 0,

                retryLimit : 3,                
                dataType:'json',
                cache: false,
                success:function (data) {
                    if (data.hasOwnProperty('data')) {
                        data = data['data'];
                    }
                    if (typeof(callback) === "function") {
                        callback(true, data);
                    }
                },
                error : function(data) {
                    if (typeof(callback) === "function") {
                        callback(false, data);
                    }
                    spark.API.restClient.showErrors(data);
                }
            };
            if (webIM.IsAndroidGingerbread) {
                ajaxRequest.beforeSend = function (xhr) {
                    // Hack for Android 2.3.X devices (known Google issue).
                    xhr.setRequestHeader("Content-Length", "");
                };
            }
            $.ajax(ajaxRequest);
        });
    },

    changeHotlist : function (hotlist, memberId, isAddAction, callback) {
        spark.API.restClient.ensureGoodToken(function () {
            var api = spark.API.restClient;
            var ajaxRequest = {
                url: spark.config.restServerV2 + '/brandId/' + spark.config.brandData.brandId + "/hotlist/" + hotlist + "/targetmemberid/" + memberId + "?access_token=" + api.loginData.accessToken,
                tryCount : 0,
                retryLimit : 3,
                dataType : 'json',
                success:function (response) {
                    if (typeof(callback) === "function") {
                        callback(true, response); // http call succeeded, now check to see if hotlist change worked
                    }
                },
                error : function(xhr) {
                    if (typeof(callback) === "function") {
                        callback(false, $.parseJSON(xhr.responseText));
                    }
                    spark.API.restClient.showErrors($.parseJSON(xhr.responseText));
                }
            };

            if (isAddAction) { // add to hotlist
                ajaxRequest.type = "post";
                if (!api.isCorsSupported()) {
                    ajaxRequest.data = {"a" : "b"}; // IE hack :( need something in the body or request fails
                }
            }
            else { // remove from hotlist
                if (api.isCorsSupported()) {
                    ajaxRequest.type = "delete";
                }
                else { // IE hack :(  need to tunnel DELETE request inside a POST request
                    ajaxRequest.type = "post";
                    ajaxRequest.data = { "method" : "delete"};
                }
            }
            if (webIM.IsAndroidGingerbread) {
                ajaxRequest.beforeSend = function (xhr) {
                    // Hack for Android 2.3.X devices (known Google issue).
                    xhr.setRequestHeader("Content-Length", "");
                };
            }
            
            $.ajax(ajaxRequest);
        });
    },

    showErrors : function (data) {
        var errorInfo = "";

        function showType(dataType) {
            for (var prop in data) {
                if (data.hasOwnProperty(prop) && (typeof(data[prop]) === dataType)) {
                    errorInfo += prop + " :  " + data[prop] + "\n";
                }
            }
        }
        showType("number");
        showType("string");
        spark.utilities.log(errorInfo);
    },

    completePendingRestCalls : function () {
        var count = this.restCallbackWithState.length;
        for (var i = 0; i < count; i++) {
            var cbAndState = this.restCallbackWithState[i];
            if (cbAndState) {
                if (cbAndState.callback && typeof(cbAndState.callback) === "function") {
                    cbAndState.callback(cbAndState.state);
                }
            }
        }
        this.restCallbackWithState = [];
    },

    getUTCTime : function(theTime) {
        if (!theTime) {
            theTime = new Date();
        }
        var utc = new Date(theTime.getTime() + theTime.getTimezoneOffset() * 60 * 1000);
        return utc;
    },

    ensureGoodToken : function (callback, state) {
        this.loginData = this.loginData || this.getLoginData();
        if (!this.loginData || !this.loginData.accessToken && !this.loginData.refreshToken) {
            this.goToLogin('error_missing_token_cookie');
            return;
        }

        var nowUTC = this.getUTCTime();
        var accessExpiresUTC = this.loginData.accessExpiresTime;
        accessExpiresUTC.setHours(accessExpiresUTC.getHours() + 8); // adjust from pacific time
        if (accessExpiresUTC > nowUTC) {
            callback(state); // good token, ok to make call
        }
        else {
            this.goToLogin('error_token_expired');
        }
    },

    convertAspNetDate : function (dateString) {
        if (!dateString) {
            return null;
        }
        return new Date(parseInt(dateString.substr(6)));
    },

    getNoPic : function(gender) {
        return (gender && gender === "Female") ? '//www.blacksingles.com/img/no-photo-s-f.png' : '//www.blacksingles.com/img/no-photo-s-m.png';
    },

    getThumbOrNoPic : function (member) {
        if (member.primaryPhoto && member.primaryPhoto.thumbPath) {
            member.primaryPhoto.thumbPath = member.primaryPhoto.thumbPath.replace('http://', '//');
            return member.primaryPhoto.thumbPath;
        }
        else if (member.defaultPhoto && member.defaultPhoto.thumbPath) {
            member.defaultPhoto.thumbPath = member.defaultPhoto.thumbPath.replace('http://', '//');
            return member.defaultPhoto.thumbPath;
        }
        return (this.getNoPic(member.gender));
    },

    getFullOrNoPic : function (member) {
        if (member.primaryPhoto && member.defaultPhoto.fullPath) {
            return member.primaryPhoto.fullPath;
        }
        else if (member.defaultPhoto && member.defaultPhoto.fullPath) {
            return member.defaultPhoto.fullPath;
        }
        return (this.getNoPic(member.gender));
    },

    init : function() {
//        this.baseUrl = spark.config.restServer + '/brandId/' + spark.config.brandData.brandId;
        this.loginData = this.loginData || this.getLoginData();
        this.restCallbackWithState = [];
        if( /Android 2.3/i.test(navigator.userAgent) ) {
            this.IsAndroidGingerbread = true;
        }

    }
};

if (!spark.API.restClient.initialized) {
    spark.API.restClient.init();
    spark.API.restClient.initialized = true;
}
