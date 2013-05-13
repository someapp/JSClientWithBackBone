var spark = spark || {};
spark.utilities = spark.utilities || {

    getRootDomain : function() {
        var domainParts = document.domain.split('.');
        var last = domainParts.length -1;
        var rootDomain;
        if (domainParts[last -1] === "co") { // grab 3 parts: jdate co il, jdate co uk
            rootDomain = domainParts[last -2] + '.' + domainParts[last -1] + '.' + domainParts[last];
        }
        else { // grab 2 parts, jdate com, jdate fr, blacksingles com
            rootDomain = domainParts[last -1] + '.' + domainParts[last];
        }
        return rootDomain;
    },

    getFormattedTime: function () {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var minStr = '' + minutes;
        while (minStr.length < 2) {
            minStr = '0' + minStr;
        }
        var amPm = 'am';
        if (hours > 11) {
            amPm = 'pm';
            if (hours > 12) {
                hours -= 12;
            }
        }
        return hours + ':' + minStr + amPm;
    },

    log : function(message) {
        if (typeof(console) !== "undefined") {
            console.log(message);
        }
        if ($('#debug')[0]) {
            $('#debug').append(message + '<br/>\n');
        }
    }
};
