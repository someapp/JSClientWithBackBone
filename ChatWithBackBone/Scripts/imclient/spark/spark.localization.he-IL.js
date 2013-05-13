spark.localization.heIL = Object.create(spark.localization.enUS); // inherit from US english to display english if the Hebrew is missing
(function(){
    var translations = {
        "loadingProfile": "טוען פרטי פרופיל.",
        "waitingForMember": "אנא התאזר בסבלנות- אנחנו מחכים ש-{0} יתחבר.",
        "youBlockedMember": "חסמת את החבר {0}.",
        "youMustUnblock": "חסמת את החבר {0} ותצטרך להסיר את החסימה על מנת לשלוח הודעה.",
        "pendingSubscription": "שלום לך! תוכל להתחיל להשתמש בשירות הצ'ט ברגע שהמנוי שלך יאומת.",
        "notAcceptingMessages": "מצטערים, אבל {0} לא מקבל הודעות צ'ט כרגע",
        "pleaseLogIn" : "כניסה למערכת לא התבצעה בהצלחה, אנא בצע כניסה לאתר הראשי ונסה שוב. {0}",
        "yearsOld": "גיל: {0}",
        "genderAndSeeking": "{0} מחפש\\ת {1}",
        "chatConnectionFailed": "ההתחברות לשרת הצ'ט נכשלה. מנסה שוב...",
        "connecting": "מתחבר...",
        "disconnectedReconnecting": "נותקת משרת הצ'ט, מנסה להתחבר שוב...",
        "userNotAccepting": "מצטערים, אבל {0} לא מקבל הודעות צ'ט כרגע",
        "IMWindowClosed": "חלון הצ'ט של {0} סגור כרגע.",
        "IMWindowOpen": "הנה מתחילים! חלון הצ'ט של {0} פתוח כרגע לשיחה.",
        "memberIsTyping": "{0} מקליד...",
        "memberDeclinedInvitation": "מצטערים, {0} דחה את הזמנתך לצ'וטט כרגע.",
        "messagesWillBeEmailed": "אם {0} לא יקבל את הודעתך, היא תשלח למייל האישי עם סגירת חלון השיחה.",
        "refreshPage": "אינך מחובר - טען מחדש את העמוד.",
        "oopsTryLater" : "אופס! הפעולה לא הצליחה, אנא נסה שנית מאוחר יותר.",
        "typeAMessage" : "הקלד הודעה על מנת להזמין את {0} לשיחה",
        "male" : "גבר",
        "female" : "אשה",
        "blockMember" : "חסום חבר",
        "unblockMember" : "שחרר חסימה",
        "favoriteMember" : "הוסף למועדפים",
        "unfavoriteMember" : "הסר ממועדפים",
        "noSelfChat" : "לא ניתן להזמין את עצמך לצ'ט",
        "send" : "שלח",
        "noMemberId" : "מספר חבר לא נמצא"
    }
    spark.localization.heIL.addTranslations(translations);
})();



