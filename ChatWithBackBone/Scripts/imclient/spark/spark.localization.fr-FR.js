spark.localization.frFR = Object.create(spark.localization.enGB); // inherit from GB english to display english if the French is missing
(function(){
    var translations = {
        "loadingProfile" : "Chargement des informations du profil.",
        "waitingForMember" : "Veuillez patienter.  Nous attendons que {0} se connecte.",
        "youBlockedMember" : "Vous avez bloqué le membre {0}.",
        "youMustUnblock" : "Vous avez bloqué {0} et devez débloquer ce membre afin de lui envoyer un message.",
        "pendingSubscription" : "Bonjour ! Vous allez pouvoir envoyer un message instantané des que votre demande d'inscription sera validée.",
        "notAcceptingMessages" : "Désolé mais {0} n'accepte pas de messages en ce moment.",
        "pleaseLogIn" : "Vous ne pouvez pas vous connecter au tchat. Merci de vous connecter à partir du site et de réessayer. {0}",
        "yearsOld" : "{0} ans",
        "genderAndSeeking" : "{0} cherche {1}",
        "chatConnectionFailed" : "La connexion au serveur du tchat a échoué.  Nouvelle tentative en cours...",
        "connecting" : "Connexion...",
        "disconnectedReconnecting" : "Déconnexion du tchat, reconnexion.",
        "userNotAccepting" : "Désolé, mais {0} n'accepte pas de messages en ce moment.",
        "IMWindowClosed" : "La fenêtre du tchat de \"{0}\"’ est maintenant fermée.",
        "IMWindowOpen" : "Ca y est ! La fenêtre du tchat de {0} est maintenant ouverte.",
        "memberIsTyping" : "{0} est en train d'écrire.",
        "memberDeclinedInvitation" : "Désolé. {0} a décliné votre invitation à tchater pour le moment.",
        "messagesWillBeEmailed" : "Si {0} ne reçoit pas de message, un e-mail lui sera envoyé quand vous fermerez votre fenêtre.",
        "refreshPage" : "Non connecte - rafraichissez cette page.",
        "oopsTryLater" : "Nous ne pouvions pas répondre à votre demande. S'il vous plaît réessayer plus tard. ",
        "typeAMessage" : "Tapez un message pour inviter {0} à chatter.",
        "male" : "Homme",
        "female" : "Femme",
        "blockMember" : "Bloquer Membre",
        "unblockMember" : "Débloquer Membre",
        "favoriteMember" : "Ajouter aux Favoris",
        "unfavoriteMember" : "Enlever des Favoris",
        "noSelfChat" : "Vous ne pouvez pas chatter avec vous-même",
        "send" : "Envoyer",
        "noMemberId" : "Manque de l’identification de membre dans l’url"
    }
    spark.localization.frFR.addTranslations(translations);
})();
