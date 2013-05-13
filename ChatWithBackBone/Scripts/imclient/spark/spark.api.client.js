var spark = spark || {};
spark.api = spark.api || {};

spark.api.client = (function () {
    var AJAX_REST_AUTHORITY = "https://api.spark.net";
    var BRAND_ID = 0;
    var loginData = {};
    var self = {};
    var defaultAjaxOptions = {
        beforeSend: function (xhr) {
            // Hack for Android 2.3.X devices (known Google issue).
            xhr.setRequestHeader("Content-Length", "");
        },
        tryCount: 0,
        retryLimit: 3,
        dataType: "json"
    };

    // List of urls to REST API.
    var urlLookup = {
        miniprofile: { url: "/profile/attributeset/miniprofile/{targetMemberId}/{memberId}", method: "GET" },
        sendTease: { url: "/mail/tease", method: "POST" }
    };

    // Private method(s).
    function buildUrl(originalUrl, urlParams) {
        // Replace place-holder with url params.
        originalUrl = formatUrl(originalUrl, urlParams);

        // Build complete API url (add timestamp query-string to explicitly disable ajax caching).
        var url = AJAX_REST_AUTHORITY + "/brandId/" + BRAND_ID + originalUrl + "?access_token=" + loginData.accessToken + "&_" + new Date().getTime();
        return url;
    };

    function formatUrl(url, params) {
        for (key in params) {
            url = url.replace("{" + key + "}", params[key]);
        }

        return url;
    }

    function getLoginData() {
        var tokenDomain = $.cookie("MOS_DOMAIN");

        return {
            "memberId": parseInt($.cookie("MOS_MEMBER"), 10),
            "accessToken": $.cookie("MOS_ACCESS"),
            "isPayingMember": $.cookie("MOS_SUB"),
            "accessExpiresTime": new Date($.cookie("MOS_ACCESS_EXPIRES")),
            "refreshToken": $.cookie("MOS_REFRESH")
        };
    };

    function isValidToken() {
        if (!loginData || !loginData.accessToken || !loginData.aaccessExpiresTime) {
            return false;
        }

        var nowUTC = getUTCTime();
        var accessExpiresUTC = loginData.accessExpiresTime;
        accessExpiresUTC.setHours(accessExpiresUTC.getHours() + 8); // adjust from pacific time
        if (accessExpiresUTC > nowUTC) {
            return true;
        }

        return false;
    };

    function getUTCTime(theTime) {
        if (!theTime) {
            theTime = new Date();
        }
        var utc = new Date(theTime.getTime() + theTime.getTimezoneOffset() * 60 * 1000);
        return utc;
    };

    function gotoLogin() {

    };

    function handleAjaxCallback(success, data, fn) {
        if (typeof fn === "function")
            fn(success, data);
    };

    // Public method(s).
    self.init = function (brandId, ajaxUrl, ajaxOptions) {
        BRAND_ID = brandId;
        AJAX_REST_AUTHORITY = ajaxUrl;
        loginData = getLoginData();

        if (typeof ajaxOptions !== "undefined")
            $.extend(defaultAjaxOptions, ajaxOptions);
    };

    self.callAPI = function (options, urlParams, data, callback) {
        /*if(!isValidToken()) {
        gotoLogin();
			
        return;
        }*/

        var spec = {
            type: options.method,
            url: buildUrl(options.url, urlParams),
            //cache: false,
            data: data,
            success: function (response) {
                handleAjaxCallback(true, response, callback);
            },
            error: function (xhr, statusText, error) {
                handleAjaxCallback(false, $.parseJSON(xhr.responseText), callback);
            }
        };

        if (options.method.toLowerCase() !== 'get' && data) {
            var count = 0;
            for (var key in data) if (data.hasOwnProperty(key)) {
                count++;
            }

            if (count > 0) {
                spec.contentType = "application/json";
                spec.data = JSON.stringify(data);
            }
        }

        $.extend(spec, defaultAjaxOptions);
        $.ajax(spec);
    };

    self.urls = urlLookup;

    return self;
})();
