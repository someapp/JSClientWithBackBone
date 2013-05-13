var spark = spark || {};
spark.localization = spark.localization || {
    getText : function (key) { // don't change args without changing the slice call below
        if (this[key]) {
            var text = this[key];
            if (arguments.length > 1) {
                var params = Array.prototype.slice.call(arguments);
                params = params.slice(1); // first param is the format string, so drop it
                if (params.length == 1) {
                    text = text.replace('{0}', params[0]);
                    return text;
                }
                var pattern = "{([0-" + (params.length -1) + "])}";
                try {
                    var regex = new RegExp(pattern, "g");
                    return text.replace(regex, function(match, index) {
                        return (typeof(params) !== "undefined") ? params[parseInt(index, 10)] : '';
                    });
                }
                catch (err) {
                    logIt('exception parsing string format params: ' + err + ' pattern: ' + pattern + ' params' + params);
                }
            }
            return text;
        }
        else {
            return key;
        }
    },

    addTranslations : function(translations) {
        for (var key in translations) {
            this[key] = translations[key];
        }
    }
};

(function() { // polyfill for IE8
    if (!Object.create) {
        Object.create = function (o) {
            if (arguments.length > 1) {
                throw new Error('Object.create implementation only accepts the first parameter.');
            }
            function F() {}
            F.prototype = o;
            return new F();
        };
    }
})();
