spark.localization.enGB = Object.create(spark.localization.enUS); // inherit from US english.
(function(){
    var translations = {
        "favoriteMember" : "Favourite Member",
        "unfavoriteMember" : "Unfavourite Member"
    };
    spark.localization.enGB.addTranslations(translations);
})();
