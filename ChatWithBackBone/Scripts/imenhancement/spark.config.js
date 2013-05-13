var spark = spark || {};
spark.config = spark.config || {
    fwsWebServerSegment : "",
    environmentSubdomain : "local",
    restServer : "http://api.local.spark.net",
    restServerV2 : "http://apiv2.local.spark.net/v2",
    chatServerName : "chat.dev.spark.net",
    boshServer : "http://chat.dev.spark.net:5280/http-bind"
};
/* must be included after spark.config has been created */
(function(){

    var brandDataMap =
    {
        "jdate.com" : {
            "siteName" : "JDate",
            "brandId" : 1003,
            "communityId" : 3,
            "omnitureKeyword" : "sparkjdatecom",
            "locale" : spark.localization.enUS
        },

        "jdate.co.uk" : {
            "siteName" : "JDate",
            "brandId" : 1003,
            "communityId" : 3,
            "omnitureKeyword" : "sparkjdatecouk",
            "locale" : spark.localization.enGB
        },

        "jdate.co.il" : {
            "siteName" : "JDate",
            "brandId" : 1004,
            "communityId" : 3,
            "omnitureKeyword" : "sparkjdatecoil",
            "locale" : spark.localization.heIL
        },

        "jdate.fr" : {
            "siteName" : "JDate",
            "brandId" : 1003,
            "communityId" : 3,
            "omnitureKeyword" : "sparkjdatefr",
            "locale" : spark.localization.frFR
        },

        "cupid.co.il" : {
            "siteName" : "Cupid",
            "brandId" : 1015,
            "communityId" : 10,
            "omnitureKeyword" : "sparkcupidcoil",
            "locale" : spark.localization.heIL
        },

        "spark.com" : {
            "siteName" : "Spark",
            "brandId" : 1001,
            "communityId" : 1,
            "omnitureKeyword" : "sparkamericansinglescom",
            "locale" : spark.localization.enUS
        },

        "bbwpersonalsplus.com" : {
            "siteName" : "BBW Personals Plus",
            "brandId" : 90410,
            "communityId" : 23,
            "omnitureKeyword" : "sparkbbw",
            "locale" : spark.localization.enUS
        },

        "blacksingles.com" : {
            "siteName" : "Black Singles",
            "brandId" : 90510,
            "communityId" : 24,
            "omnitureKeyword" : "sparkblack",
            "locale" : spark.localization.enUS
        }
    };

    spark.config.rootDomain = spark.utilities.getRootDomain();
    spark.config.brandData = brandDataMap[spark.config.rootDomain];
    if (!spark.config.brandData) {
        throw 'missing brand data for domain: ' + spark.config.rootDomain;
    }
    spark.config.fwsUrl = '//' + spark.config.fwsWebServerSegment + spark.config.environmentSubdomain + '.' +  spark.config.rootDomain;
    spark.config.IMInitiatorUrl = spark.config.fwsUrl +  '/applications/instantmessenger/icxml.aspx';
    if (spark.config.environmentSubdomain === "www") {
        spark.config.mobileLoginUrl = '//m.' + spark.config.rootDomain + '/logon/logonIM'; // m.jdate.com/logon/logonIM
        spark.config.mobileStaticProfileUrl = '//m.' + spark.config.rootDomain + '/profile/static'; // m.jdate.com/profile/static
    }
    else if (spark.config.environmentSubdomain === "preprod") {
        spark.config.mobileLoginUrl = '//preprod.m.' + spark.config.rootDomain + '/logon/logonIM'; // preprod.m.jdate.com/logon/logonIM
        spark.config.mobileStaticProfileUrl = '//preprod.m.' + spark.config.rootDomain + '/profile/static'; // preprod.m.jdate.com/profile/static
    }
    else {
        spark.config.mobileLoginUrl = '//m.' + spark.config.environmentSubdomain + '.' + spark.config.rootDomain + '/logon/logonIM'; //m.stgv3.jdate.com/logon/loginIM
        spark.config.mobileStaticProfileUrl = '//m.' + spark.config.environmentSubdomain + '.' + spark.config.rootDomain + '/profile/static'; //m.stgv3.jdate.com/profile/static
    }
    spark.locale = spark.config.brandData.locale;

})();