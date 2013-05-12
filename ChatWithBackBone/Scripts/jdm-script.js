var jdmApp = jdmApp || {};

jdmApp.setMemberId = function (memberId) {
    this.memberId = memberId;
};

jdmApp.getMemberId = function () {
    if (this.memberId) {
        return this.memberId;
    }
    return 0;
};

jdmApp.setBrandId = function (brandId) {
    this.brandId = brandId;
};

jdmApp.getBrandId = function () {
    if (this.brandId) {
        return this.brandId;
    }
    return 0;
};

jdmApp.isWrapperApp = function () {
	if (!(/iphone|ipod|ipad/gi).test(navigator.platform)) {
		return false; // platform is not iOS
	}

	if ((/Safari/i).test(navigator.appVersion)) {
		return false; // browser is safari - not wrapped app
	}
	if ("standalone" in navigator && navigator.standalone) {
		return false; // wrapped apps don't appear as standalone
	}
	return true; // This is a wrapped app
};

jdmApp.dateValidator = function (value, element) {
	//if all values are selected
	var module = $(element).parents('div');
	var month = module.find('.fulldate-month').val();
	var day = module.find('.fulldate-day').val();

	if (!month || !day || !value) {
		return null;
	}
	// date fields have values
	var yearInt = parseInt(value);
	var monthInt = parseInt(month) - 1; // 0 indexed
	var dayInt = parseInt(day);

	var date = new Date(yearInt, monthInt, dayInt);
	if (date.getFullYear() !== yearInt || date.getDate() !== dayInt || date.getMonth() !== monthInt) {
		return null;
	}
	return date;
};

jdmApp.addFBCallback = function(callback) {
	if (!this.FBCallbacks) {
		this.FBCallbacks = [];
	}
	this.FBCallbacks.push(callback);
};

jdmApp.executeFBCallbacks = function () {
	if (!this.FBCallbacks) {
		return;
	}
	var count = this.FBCallbacks.length;
	for (var i = 0; i < count; i++) {
		var callback = this.FBCallbacks[i];
		if (typeof (callback) === "function") {
			callback();
		}
	}
	this.FBCallbacks = [];
};

jdmApp.ensureFacebookAPI = function (callback) {
	if (typeof (callback) !== "function") {
		return;
	}
	if (typeof (FB) !== "undefined") {
		callback();
	}
	else {
		this.addFBCallback(callback);
	}
};


// activate auto back button
$.mobile.page.prototype.options.addBackBtn = true;




// Global Variables
var isLoadingCounts = false; // whether or not the site is currently in the middle of a call for the getCounts() function
var isCheckingNew = false; // whether or not the site is currently in the middle of a call for the checkForNew() function
var listCounts = new Object; // variable to hold results of getCounts() function
var getSize = 10; // number of results to return when hitting "show more" button on a list page

// Get counts and check for new messages
function getCounts(callback) {
    if (!isLoadingCounts) {
        isLoadingCounts = true;
        $.get('/hotlist/counts/', function (data) {
            // making an AJAX request to /hotlist/counts/ returns a JSON object that says how many total and new items are in various lists, and if there is unread mail
        	listCounts = data;
        	isLoadingCounts = false;
        	if (typeof callback == 'function') {
                // fire callback function if one was provided
        		callback.call(this);
        	}
        });
    }
}

// Get members online count
function getMembersOnlineCount(callback) {
    if (jdmIM.isInitialized()) { // jdmIM may not have initialized before this call was made
        // it's safe to skip the first call, since the server already populated the count
        // This initialization race condition needs to be addressed.
        var url = "/membersonline/count";

        jdmIM.invokeAPI(url, "GET", { }, function(success, response, statusText, errorThown) {
            if (success && response && response.data) {
                callback(true, response.data.count);
            } else {
                console.log('Failed to get members online count\n' + (response.code || '') + ' ' + statusText + '\n' + errorThown);
                callback(false);
            }
        });
    }
}

// Hide and show function of messaging or show more button for a list. List argument is selector of the list in question, message argument is a selector for which message to show
function showListMessage(list, message) {
    list.siblings(message).fadeIn('fast', function () {
        $(this).css('display', 'block');
    }).siblings('.no-refresh, .btn-showMore').css('display', 'none');
}
// Logic behind whether to show a "no more results" message or show more button, i.e. if we have hit the total number of results yet
function updateListMessage(list) {
    switch (list.attr('id')) {
        // for a few lists, we know what the total number is. That number is stored in the listCounts JSON object
        case ('viewedyou-hotlist'):
            getCounts(function () {
                if (listCounts.ViewedMyProfileTotal > list.find('li').length) {
                    showListMessage(list, '.btn-showMore');
                } else {
                    showListMessage(list, '.end-refresh');
                }
            });
            break;
        case ('favoritedyou-hotlist'):
            getCounts(function () {
                if (listCounts.AddedMeToTheirFavoritesTotal > list.find('li').length) {
                    showListMessage(list, '.btn-showMore');
                } else {
                    showListMessage(list, '.end-refresh');
                }
            });
            break;
        case ('yourfavorites-hotlist'):
            getCounts(function () {
                if (listCounts.MyFavoritesTotal > list.find('li').length) {
                    showListMessage(list, '.btn-showMore');
                } else {
                    showListMessage(list, '.end-refresh');
                }
            });
            break;
        default:
            // for lists where we do not have a total count, like inbox and search results. So instead we see if the current list length is a multiple of get size (i.e. see if got a returned set of results that was less than the getSize)
            if (list.find('li').length % getSize === 0) {
                showListMessage(list, '.btn-showMore');
            } else {
                showListMessage(list, '.end-refresh');
            }
            break;
    }
}

// Makes the AJAX call to retrieve more results. List argument is the selector for the list in question.
// The URL format is /some/url/pagesize/SOMENUMBER/page/SOMENUMBER/partial/true.
// Example: to get the second set of 10 results in search results, you would make an AJAX call to /search/results/pagesize/10/page/2/partial/true
function getResults(list, callback) {
    var getPage = Math.round((list.find('li').length) / getSize) + 1;
    var getUrl = list.attr('data-geturl') + '/pagesize/' + getSize + '/page/' + getPage + '/partial/true';
    // I've added the first portion of the correct url as an attribute, data-geturl, to each list.
    // getSize is our global variable. getPage is determined with a bit of math to figure out what the next set number is going to be.
    $.get(getUrl, function (data) {
        if ($.trim(data) == '' || data == null) {
            // If the returned data is null or empty then we've reached the end of the results. Show appropriate message.
            showListMessage(list, '.end-refresh');
        } else {
            // Otherwise update the results
            updateResults(list, data);
        }
    }, 'html').error(function () {
        // If there was an error in the AJAX call, show an error message.
        showListMessage(list, '.refresh-error');
    }).complete(function () {
        // Regardless of whether the AJAX call was successful, when call is complete hide any loading message and fire any callback function that may have been provided
        $.mobile.hidePageLoadingMsg();
        if (typeof callback == 'function') {
            callback.call(this);
        }
    });
}

// Updates the list with HTML data returned from getReseults().
function updateResults(list, data) {
    try {
        if (list.parents('div:jqmData(role="page")').hasClass('ui-page-active')) {
            var newPos = list.outerHeight() + list.offset().top;
            list.append(data).listview('refresh');
            $.mobile.silentScroll(newPos);
            // if the list we're trying to update is currently on the active page, before appending the data we find the position of the bottom of the list. After appending the data, we scroll the screen to that position.
        } else {
            list.append(data).listview('refresh');
            // if the list isn't on the current page, we just append the data to the list without scrolling
        };
        updateListMessage(list); // after list is updated, we figure out if we've hit the end of the results
    } catch (err) {
    	showListMessage(list, '.refresh-error'); // if there was an error, show the error message
    }
}

// Function for if we need to refresh the list for any reason (like if we know there are new results). startOver argument is a boolean.
function fullRefresh(list, startOver, callback) {
    if (startOver) {
        // if startOver is true, we empty the entire list and show the first ten results only.
        list.empty();
        getResults(list, callback);
    } else {
        // if we're not starting over, find the lenght of the list and replace the current list with that many results
        var getUrl = list.attr('data-geturl') + '/pagesize/' + list.find('li').length + '/page/1/partial/true';
        $.get(getUrl, function (data) {
            if ($.trim(data) == '' || data == null) {
                // if response is null or empty show "no results"
        		showListMessage(list, '.no-results');
        	} else {
                // otherwise update the list
        		updateResults(list, data);
        	}
        }, 'html').error(function () {
            // if an error was returned, show the error message.
        	showListMessage(list, '.refresh-error');
        }).complete(function () {
            // regardless of whether AJAX was successful, hide any loading message and fire any callback functions provided
        	$.mobile.hidePageLoadingMsg();
        	if (typeof callback == 'function') {
        		callback.call(this);
        	}
        });
    }
}

// Hot list pages have a total count in their page title. This function updates that count.
function updatePageCount(list) {
    var count;
    switch (list.attr('id')) {
        case ('viewedyou-hotlist'):
            count = listCounts.ViewedMyProfileTotal;
            break;
        case ('favoritedyou-hotlist'):
            count = listCounts.AddedMeToTheirFavoritesTotal;
            break;
        case ('yourfavorites-hotlist'):
            count = listCounts.MyFavoritesTotal;
            break;
        default:
            count = 0;
    }
    if (count > 0) {
        list.parents('div:jqmData(role="page")').find('.total-count').text('(' + count + ')');
    } else {
        list.parents('div:jqmData(role="page")').find('.total-count').text('');
    }
}

// This function determines whether the list needs to be updated and if so executes the fullRefresh function
function checkForNew(list) {
    if (!isCheckingNew) {
        isCheckingNew = true;
        switch (list.attr('id')) {
            // In some cases we know whether there are new entries and how many
            case ('viewedyou-hotlist'):
                if (listCounts.ViewedMyProfileNew > 0) {
                    fullRefresh(list, false, function () {
                        isCheckingNew = false;
                    });
                }
                break;
            case ('favoritedyou-hotlist'):
                if (listCounts.AddedMeToTheirFavoritesNew > 0) {
                    fullRefresh(list, false, function () {
                        isCheckingNew = false;
                    });
                }
                break;
            // We don't check for new with search results
            case ('search-results-list'):
                isCheckingNew = false;
                break;
            // If we don't know whether there are new entries, we make an AJAX call
            // for a set of results that matches the length of the current list,
            // build an array of URLs pulled from the data and compare that
            // with URLs from the currently existing list. If there is a URL in the data 
            // that doesn't exist in the currently existing list, we refresh the current list.
            default:
                var currentListItems = list.find('li');
                var currentListUrls = new Array();
                var checkSize;
                var dataDummyContainer = $('<ul>'); // For some reason I needed to put the data into a dummy container to find how many <li> elements were in the data
                if (currentListItems.length <= getSize) {
                    // if the list is currently less than one complete set of 10, we'll still ask for at least 10 results for the data
                    checkSize = getSize;
                } else {
                    checkSize = currentListItems.length;
                }
                var getURL = list.attr('data-geturl') + '/pagesize/' + checkSize + '/page/1/partial/true';
                for (var i = 0; i < currentListItems.length; i++) {
                    /// Build an array of the href values of the current list so we can compare it with
                    /// the href values in our AJAX data and see if there are any new values. This is sloppy.
                    /// For lists that aren't inbox, we have a flag for new items.
                    currentListUrls[i] = $(currentListItems[i]).find('a').attr('href');
                }
                $.get(getURL, function (data) {
                    var newListItems = dataDummyContainer.empty().append(data).find('li');
                    for (var j = 0; j < newListItems.length; j++) {
                        /// This is sloppy. In the future, I want to prepend just the new ones, but that messes up the math and would
                        /// cause duplicate items. We need to change how we paginate through results to grab by index numbers. 
                        /// Then we could ask for (list.find('li').length) to ((list.find('li').length) + getSize).
                        var findUrl = $(newListItems[j]).find('a').attr('href');
                        if ($.inArray(findUrl, currentListUrls) == -1) {
                            list.empty().append(data);
                            updateListMessage(list);
                            break;
                        }
                    };
                    isCheckingNew = false;
                }, 'html');
                break;
        };

    };
}





//Vertical Centering Function for Edit Photo Page

function photoVerticalCenter() {
    var $img = $('#editPhotoMainImage');
    //  var h = $img.height();
    var h = document.getElementById('editPhotoMainImage').height;
    var b = 237 - h;
    var c = b / 2;

    if (h > 237)
        c = 0;

    /// $img.css('top', b / 2 + "px");


    document.getElementById('editPhotoMainImage').style.top = c  + "px";
}

// Page specific bindings for the Edit Photo Page:


$('.m_editphoto').live('pageshow', function (e) {

    photoVerticalCenter();
});
 

// Page specific bindings for the home page
$('.m_home').live('pageinit', function (e) {
    // Caching selectors
    var homeLinkList = $(e.target).find('.homelinks');
    var inboxLink = homeLinkList.find('.homelink-inbox');
    var viewedYouLink = homeLinkList.find('.homelink-viewedyou');
    var favoritedYouLink = homeLinkList.find('.homelink-favoritedyou');
    var yourFavoritesLink = homeLinkList.find('.homelink-yourfavorites');

    $(e.target).bind('pageshow', function (ev, ui) {

        var photoCount = $('.spanphotocount').attr('data-photocount');

        var uploadPhotoLink = $('.home-uploadphotolink');

        if (isUploadFeatureSupported()) {

            uploadPhotoLink.text('Upload a photo');
            $(".homelink-uploadphoto").addClass('uploadable');

            if (photoCount >= 12) {
                uploadPhotoLink.attr('href', '/profile/photolist');
            } else {
                uploadPhotoLink.attr('href', '/profile/photoupload');
            }
        }
        // homeLinkList.listview("refresh");

        // update the listCounts variable and use that object to populate the counts and indicators on the home page
        getCounts(function () {
            if (listCounts.HasNewMail == true) {
                inboxLink.find('.message-status').show();
            } else {
                inboxLink.find('.message-status').hide();
            };

            if (listCounts.ViewedMyProfileTotal > 0) {
                viewedYouLink.find('.total-count').text('(' + listCounts.ViewedMyProfileTotal + ')').css('visibility', 'visible');
                if (listCounts.ViewedMyProfileNew > 0) {
                    viewedYouLink.find('.new').text(listCounts.ViewedMyProfileNew).css('visibility', 'visible');
                } else {
                    viewedYouLink.find('.new').css('visibility', 'hidden');
                };
            } else {
                viewedYouLink.find('.total-count').css('visibility', 'hidden');
            };
            if (listCounts.AddedMeToTheirFavoritesTotal > 0) {
                favoritedYouLink.find('.total-count').text('(' + listCounts.AddedMeToTheirFavoritesTotal + ')').css('visibility', 'visible');
                if (listCounts.AddedMeToTheirFavoritesNew > 0) {
                    favoritedYouLink.find('.new').text(listCounts.AddedMeToTheirFavoritesNew).css('visibility', 'visible');
                } else {
                    favoritedYouLink.find('.new').css('visibility', 'hidden');
                };
            } else {
                favoritedYouLink.find('.total-count').css('visibility', 'hidden');
            };
            if (listCounts.MyFavoritesTotal > 0) {
                yourFavoritesLink.find('.total-count').text('(' + listCounts.MyFavoritesTotal + ')').css('visibility', 'visible');
            } else {
                yourFavoritesLink.find('.total-count').css('visibility', 'hidden');
            };
        });

        getMembersOnlineCount(function (success, count) {
            if (success) {
                $('#online-button .ui-btn-text').text(count + ' Online');
            }
        });
    });
});

// Bindings for any of the pages with a "show more" button
$('.page-refreshable').live('pageinit', function (e) {
    // Cache selector
    var pageList = $('ul:jqmData(role="listview")', e.target);

    // Find initial list length so we can determine whether to show button, or "no results" button. 
    // Note: ".no-results" messaging (as in there are no results at all) is different from ".end-refresh" 
    //messaging (as in there are no more results to show).
    var pageListLength = pageList.find('li').length;
    if (pageListLength == 0) {
        showListMessage(pageList, '.no-results');
    } else {
        switch (pageList.attr('id')) {
            case ('viewedyou-hotlist'):
                getCounts(function () {
                    if (listCounts.ViewedMyProfileTotal > pageListLength) {
                        showListMessage(pageList, '.btn-showMore');
                    } else {
                        showListMessage(pageList, '.end-refresh');
                    }
                });
                break;
            case ('favoritedyou-hotlist'):
                getCounts(function () {
                    if (listCounts.AddedMeToTheirFavoritesTotal > pageListLength) {
                        showListMessage(pageList, '.btn-showMore');
                    } else {
                        showListMessage(pageList, '.end-refresh');
                    }
                });
                break;
            case ('yourfavorites-hotlist'):
                getCounts(function () {
                    if (listCounts.MyFavoritesTotal > pageListLength) {
                        showListMessage(pageList, '.btn-showMore');
                    } else {
                        showListMessage(pageList, '.end-refresh');
                    }
                });
                break;
            default:
                if (getSize > pageListLength) {
                    showListMessage(pageList, '.end-refresh');
                } else {
                    showListMessage(pageList, '.btn-showMore');
                }
                break;
        }
    };

    updatePageCount(pageList); // update count in the header of the page

    // bind functions for when this page is shown in the future
    $(e.target).bind('pagebeforeshow', function (e, ui) {
        getCounts(function () { // update listCounts object
            checkForNew(pageList); // check for new results
            updatePageCount(pageList); // update the count
        });

    }).find('.btn-showMore').bind('tap', function (e2) { // bind handler for show more button
        e.preventDefault();
        $.mobile.showPageLoadingMsg(); // activate loading message
        getResults(pageList); // get more results
    });
});

// Profile Favoriting functionality
$('.icon-favorite').live('tap', function (e) {
    e.preventDefault();
    var profileId = $(this).attr('data-profileId');
    // if the favorite button was not currently selected, make it selected
    $(this).toggleClass('selected').removeClass('ui-btn-active');
    // switch the text on the button and make a post to the server so it knows to record the favoriting action
    if ($(this).hasClass('selected')) {
        $(this).find('.ui-btn-text').text('Unfavorite');
        $.post('/hotlist/favorite/', { 'favoriteMemberId': profileId });
    } else {
        $(this).find('.ui-btn-text').text('Favorite');
        $.ajax({
            type: 'DELETE',
            url: '/hotlist/favorite/' + profileId
        });
    };
});

// Whenever someone expands a collapsible UI, scroll to the top of that section
$('div:jqmData(role="collapsible")').live('expand', function (e) {
    setTimeout(function () { // needed a setTimeout to wait for all other collapsibles to collapse
        $.mobile.silentScroll($(e.target).position().top);
    }, 0);
});

// Functions for Compose Mail page
$('.m_mail_email').live('pageinit', function (e) {
    var subjectField = $(e.target).find('input[type="text"]');
    var textField = $(e.target).find('textarea');
    var submitButton = $(e.target).find(':input[type="submit"]');
    // Enable/disable submit button if fields are empty
    var buttonHandler = function () {
        if (subjectField.val() != '' && textField.val() != '') {
            submitButton.button('enable');
        } else {
            submitButton.button('disable');
        }
    };
    // If you hit cancel on the compose email page and all fields are blank, go back to the profile. If there is any text, however, go to confirm delete page.
    $(e.target).find('.btn-cancel').bind('tap', function (f) {
        f.preventDefault();
        if (subjectField.val() == '' && textField.val() == '') {
            history.back();
            return;
        } else {
            var changeUrl = $(this).attr('href');
            $.mobile.changePage(changeUrl);
        }
    });
    subjectField.keyup(buttonHandler);
    textField.keyup(buttonHandler);
});

// Functions for reading message page
$('.m_mail_inbox_message').live('pageinit', function (e) {
    var textField = $(e.target).find('textarea');
    var submitButton = $(e.target).find(':input[type="submit"]');
    // Only enable send button if there is text in the reply box
    textField.keyup(function () {
        if (textField.val() != '') {
            submitButton.button('enable');
        } else {
            submitButton.button('disable');
        };
    });
    $(e.target).find('.btn-reply').bind('tap', function () {
        var replyPos = $(this).parents('.m_mail_inbox_message').find('.message-inline-reply').offset().top;
        $.mobile.silentScroll(replyPos); // Scrolls to reply box on view message page when reply button is tapped
    });
});


// Bind event to Flirt navigation button.
$("#flirt_nav_btn").live("click", function () {
    var recipientMemberId = parseInt($(this).attr("data-memberid"), 10);
    var userName = $(this).attr("data-username");
    var postData = {
        RecipientMemberId: recipientMemberId,
        TeaseId: 494, // Tease_Casual_Mobile_1
        TeaseCategoryId: 66, // Casual
        Body: "I'm sending you a Flirt to get the conversation started. Contact me and let's get to know each other!"
    };

    spark.api.client.callAPI(spark.api.client.urls.sendTease, {}, postData, function (success, response) {
        //var e = $("#profile_status_message");
        var e = $("#_" + recipientMemberId);
        var msg = "Flirt sent to " + userName;

        e.parent().hide();
        if (!success) {
            var data = response ? response.Result : null;
            if (data && data.error) {
                var code = data.error.code;
                switch (code) {
                    case 40019: // Exceeded maximum allowed.
                        //msg = "You have exceeded maximum flirt allowed.";
                        //break;
                    default:
                        msg = "Your flirt was not able to be sent.";
                }
            }

            e.addClass("error");
        } else {
            s.pageName = "m_flirt_confirmation";
            s.events = "event11";
            s.eVar26 = "mobile_flirt";
            callOmniture();
        }

        //console.log(response);
        e.parent().show();
        e.find("span").text(msg);
    });
});

// Activate send button when flirt is chosen
$('.m_mail_flirt').live('pageinit', function (e) {
    $(e.target).find('input[type="radio"]').bind('change', function () {
        $(e.target).find(':input[type="submit"]').button('enable');
    });
});

// Clear email forms on submit and update your sent folder.
$('.m_mail_email, .m_mail_inbox_message, .m_mail_flirt').live('pageinit', function (e) {
    $(e.target).find('form').bind('submit', function () {
        $(this).ajaxSuccess(function () {
            $(this).find('input[type="text"], textarea').val('').end()
                .find('input:radio:checked').prop('checked', false).checkboxradio('refresh').end()
                .find(':input[type="submit"]').button('disable').end()
                .find('div:jqmData(role="collapsible")').trigger('collapse');
        });
    });
});
// Clear email form if user hits Cancel => Delete
$('.cancel-confirmation').live('pageinit', function (e) {
    $(e.target).find('.btn-delete').bind('tap', function () {
        var fieldsToClear = $('.m_mail_email').find('form').find('input[type="text"], textarea');
        fieldsToClear.val('');
    });
});

// Photoswipe plugin options
var photoSwipeOptions = {
	captionAndToolbarAutoHideDelay: 0,
	minUserZoom: 1,
	captionAndToolbarShowEmptyCaptions: false,
	swipeThreshold: 75,
	swipeTimeThreshold: 500,
    allowUserZoom : false
};

// Bind photoswipe plugin to hidden "profile-photo-list" element on profile
$('.m_profile').live('pageinit', function (e) {
	var profilePhotos = $('.profile-photo-list', e.target).find('a');
	if (profilePhotos.length > 0) {
	    var myPhotoSwipe = profilePhotos.photoSwipe(photoSwipeOptions);
        // bind tap event handler on main image photo that triggers photo gallery to start.
		$('.profile-photo-container', e.target).children('.primaryphotolink').bind('tap', function(event) {
			event.preventDefault();
			profilePhotos.first().trigger('click');
		});
	}
    else {
        if ($('.managePhotoButtonClass').length > 0) {
            if (!isUploadFeatureSupported()) {
                $('.managePhotoButtonClass').attr('href', '/profile/howtouploadphotos');
            }
        }
    }
});

function logIt(element, message) {
	if (!(element && message)) {
		return;
	}
	var html = element.html();
	element.html(html + '<br/>' + message);
}

function isUploadFeatureSupported() {
	var i = document.createElement("input");
	i.setAttribute("type", "file");
	if (i.type !== "file" || i.disabled) {
		return false;
	}
	return true;
}

function isAsyncUploadFeatureSupported() {
	if (!isUploadFeatureSupported()) {
		return false;
	}
	if (typeof (FormData) === "undefined") {
		return false;
	}
	return true;
}

function logIt(element, message) {
	if (!(element && message)) {
		return;
	}
	var html = element.html();
	element.html(html + '<br/>' + message);
}


$('.m_photo_howtoupload').live('pageinit', function (e) {
    $('.emailphotos').live('click', function (ev) {
        s.pageName = "m_photo_howtoupload";
        s.eVar2 = "m_photo_howtoupload";
        s.prop2 = "m_photo_howtoupload";
        s.events = "event72";
        callOmniture();
    });
});

$('.m_photo_deleteconfirm').live('pageinit', function (e) {
    $('#deletephotolink').live('click', function (ev) {
        s.pageName = "m_photo_deleteconfirm";
        s.eVar2 = "m_photo_deleteconfirm";
        s.prop2 = "m_photo_deleteconfirm";
        s.events = "event2,event75";
        callOmniture();
        return;
    });
});

$('.m_editphoto').live('pageinit', function (e) {
    $('#captionchanges-continue').live('click', function (ev) {
        s.pageName = "m_editphoto";
        s.eVar2 = "m_editphoto";
        s.prop2 = "m_editphoto";
        s.events = "event2,event34";
        callOmniture();
        return;
    });
});

$('.m_photo_upload').live('pagecreate', function (e) {
    var logInfo = $('#logInfo');
    var form = $('#photoForm');
    var asyncForm = $('#photoFormAsync');
    //if (true) {
    if (!isAsyncUploadFeatureSupported()) { // i.e. FormData is not supported on android browsers older than 3.0
        asyncForm.hide();
        form.find('input[type="file"]').bind('change', function () {
            form.find(':input[type="submit"]').removeAttr('disabled').button('enable');
            $('#photoSubmit').bind('click', function () {
                $.mobile.showPageLoadingMsg();
            });
        });
        //$('#upload').disabled = true;
        return;
    }
    form.hide();
    asyncForm.show();
    asyncForm.find('input[type="file"]').bind('change', function () {
        asyncForm.find(':input[type="button"]').removeAttr('disabled').button('enable');
    });

    $('#upload').click(function (e) {
        //var formElement = $('#photoFormAsync'); // using the jquery element blows up the constructor call to FormData(formElement)
        var $button = $('#upload');
        $button.button();
        var formElement = document.getElementById("photoFormAsync");
        if (!formElement) {
            logIt(logInfo, 'no form element');
            return;
        }

        try {
            var formData = new FormData(formElement);
        }
        catch (error) {
            logIt(logInfo, 'error creating formdata: ' + error.message);
            return;
        }
        if (XMLHttpRequest === "undefined") {
            logIt(logInfo, 'no XHR');
        }
        var xhr = new XMLHttpRequest();
        if (!xhr) {
            logIt(logInfo, 'no XHR object');
        }
        xhr.addEventListener('progress', function (e) {
            var done = e.position || e.loaded, total = e.totalSize || e.total;
            console.log('xhr progress: ' + (Math.floor(done / total * 1000) / 10) + '%');
        }, false);
        if (xhr.upload) {
            xhr.upload.onprogress = function (e) {
                var done = e.position || e.loaded, total = e.totalSize || e.total;
                console.log('xhr.upload progress: ' + done + ' / ' + total + ' = ' + (Math.floor(done / total * 1000) / 10) + '%');
            };
        }
        var restUploadEndpointUrl = $("#restUploadEndpointUrl").attr('href');
        xhr.onreadystatechange = function (e) {
            if (this.readyState === 4) {
                logIt(logInfo, 'upload complete');
                $button.button('enable');
                $.mobile.hidePageLoadingMsg();
                if (this.status === 200) {
                    s.pageName = "m_photo_upload";
                    s.eVar2 = "m_photo_upload";
                    s.prop2 = "m_photo_upload";
                    s.events = "event2,event29";
                    var captionValue = $('#captionAsync').val();
                    if (captionValue.length > 0) {
                        s.events = "event2,event29,event34";
                    }
                    callOmniture();
                    //					$.mobile.changePage('#upload_completed', { transition: 'pop', role: 'dialog' });
                    //var photoListUrl = $('#photoListLink').attr('href');
                    //$.mobile.changePage(photoListUrl);

                    var photoListUrl = $('#photoListLink').attr('href');
                    //$.mobile.changePage(photoListUrl);
                    $.mobile.changePage(photoListUrl, { reloadPage: 'true' });



                } else {
                    alert('upload failed:' + this.responseText);
                }
                console.log(['xhr upload complete', e]);
            }
        };
        logIt(logInfo, 'starting upload');
        $button.button('disable');
        xhr.open('post', restUploadEndpointUrl, true);
        xhr.send(formData);
        $.mobile.showPageLoadingMsg();
    });
});

$('.m_photolist').live('pageinit', function (e) {
    $(e.target).bind('pageshow', function (f) {
        var total = $('#spancount').attr('data-count');
        if (total >= 12) {
            $('.btn-UploadAPhoto').attr('href', '#');
            $('.btn-UploadAPhoto').addClass('ui-disabled');
        }
        else {
            if (isUploadFeatureSupported()) {
                $('.btn-UploadAPhoto').attr('href', '/profile/photoupload');
            }
            else {
                $('.btn-UploadAPhoto').attr('href', '/profile/howtouploadphotos');
            }
        }
    });
});

// Functionality for Inbox/Sent/Trash
$('.inbox').live('pageinit', function (e) {
    $(e.target).bind('pageshow', function (f) {
        // Highlights the appropriate button
        if ($(this).hasClass('m_mail_inbox')) {
            $(this).find('.nav-inbox').addClass('ui-btn-active ui-state-persist');
        } else if ($(e.target).hasClass('m_mail_sent')) {
            $(this).find('.nav-sent').addClass('ui-btn-active ui-state-persist');
        } else if ($(e.target).hasClass('m_mail_trash')) {
            $(this).find('.nav-trash').addClass('ui-btn-active ui-state-persist');
            $(this).find('.nav-sent').attr('data-direction', 'reverse'); // more intuitive transition for moving from trash to sent folder
        }
    }).find('#inbox-message-list, #trash-message-list').delegate('a', 'tap', function () {
        $(this).find('.message-status').remove(); // remove unread icon from message
    });
});


// Members Online
$("#online-button").live("click", function () {
    s.pageName = "m_search_results_mol";
    s.events = "event2,event18";

    var listLength = $("#mol-results-list").children().size();
    var getPage = Math.round(listLength / 10) + 1;
    s.eVar25 = getPage;
    s.eVar36 = "m.jdate.com";
    callOmniture();
});

$('#mol_page').live("pageshow", function (e) {
    s.pageName = "m_search_results_mol_filter";
    callOmniture();
});

$('#mol_page').live("pageinit", function (e) {
    var minSlider = $(e.target).find('#mol_pref_minage');
    var maxSlider = $(e.target).find('#mol_pref_maxage');
    $(minSlider).live('change', function () {
        var minVal = minSlider.val();
        var maxVal = maxSlider.val();
        if (minVal > maxVal) {
            maxSlider.val(minVal).slider('refresh');
        };
    });

    $(maxSlider).live('change', function () {
        var minVal = minSlider.val();
        var maxVal = maxSlider.val();
        if (maxVal < minVal) {
            minSlider.val(maxVal).slider('refresh');
        };
    });

    $(e.target).find('form').bind('submit', function (f) {
        f.preventDefault();
        $.mobile.showPageLoadingMsg();

        s.pageName = "m_search_results_mol_filter";
        s.events = "event53";
        s.eVar69 = "MOL";
        callOmniture();

        // AJAX submit form
        $.post($(this).attr('action'), $(this).serialize(), (function () {
            var searchResults = $('#mol-results-list');
            // if the Search Results List is currently in the DOM, clear out old results and insert fresh new set with fullRefresh function
            if (searchResults.length > 0) {
                fullRefresh(searchResults, true, function () {
                    $.mobile.changePage('/membersonline/results', { transition: 'slide', reverse: 'true' });
                });
                // otherwise, just go to the search results page
            } else {

                // Call Omniture
                s.pageName = "m_search_results_mol";
                var listLength = $("#mol-results-list").children().size();
                var getPage = Math.round(listLength / 10) + 1;
                s.eVar1 = "m_search_results_mol_filter";
                s.eVar25 = getPage;
                callOmniture();

                $.mobile.changePage('/membersonline/results', { transition: 'slide', reverse: 'true' });
            };
        }));
    });
});

// Functions for Search Preferences page
$('.m_search_preferences').live('pageinit', function (e) {
    // prevent min age from being larger than max age and vice-versa. This can be deleted when Mobiscroll plugin is added.
    var minSlider = $(e.target).find('#search-preferences-minage');
    var maxSlider = $(e.target).find('#search-preferences-maxage');
    $(minSlider).live('change', function () {
        var minVal = minSlider.val();
        var maxVal = maxSlider.val();
        if (minVal > maxVal) {
            maxSlider.val(minVal).slider('refresh');
        };
    });
    $(maxSlider).live('change', function () {
        var minVal = minSlider.val();
        var maxVal = maxSlider.val();
        if (maxVal < minVal) {
            minSlider.val(maxVal).slider('refresh');
        };
    });
     //end stuff that can be deleted after plugin is added.
    // Search preferences form submit handler
    $(e.target).find('form').bind('submit', function (f) {
        f.preventDefault();
        $.mobile.showPageLoadingMsg();
        // AJAX submit form
        $.post($(this).attr('action'), $(this).serialize(), (function () {
            var searchResults = $('#search-results-list');
            // if the Search Results List is currently in the DOM, clear out old results and insert fresh new set with fullRefresh function
            if (searchResults.length > 0) {
                fullRefresh(searchResults, true, function () {
                    $.mobile.changePage('/search/results', { transition: 'slide', reverse: 'true' });
                });
            // otherwise, just go to the search results page
            } else {
                $.mobile.changePage('/search/results', { transition: 'slide', reverse: 'true' });
            };
        }));
    });
});
// Manually add back button to pages not loaded with ajax, or for pages after page refresh
$('div:jqmData(role="page"):not(".m_home, .m_login, .m_reg_step_1, .m_reg_step_2, .m_reg_step_3, .m_reg_complete, .m_subscription_confirmation")').live('pageinit', function (e) {
    if ($.mobile.page.prototype.options.addBackBtn) {
        var pageHeader = $(e.target).find('header:first');
        if (pageHeader.find('a').length < 2) {
            pageHeader.prepend('<a href="#" data-rel="back" data-icon="arrow-l" data-theme="j" class="ui-btn-left">Back</a>').trigger('create');
        }
    };
});

$('.m_login').live('pageinit', function (e) {
	// Add "Remember me" tooltip
    $(e.target).find('.icon-question').jqmTooltip();
    // Resize fix
});

$('.m_reg_step_1').live('pageinit', function (e) {
    var io_install_flash = false; // do not install Flash
    var io_enable_rip = true; // collect Real IP information
    GetIOBB(0);
});

$('.m_fbreg_step_1').live('pageinit', function (e) {
    var io_install_flash = false; // do not install Flash
    var io_enable_rip = true; // collect Real IP information
    GetIOBB(0);
});
 
function GetIOBB(pass) {
    if (typeof ioGetBlackbox == 'function') {
        var bb_data = ioGetBlackbox();
        var blackbox = bb_data.blackbox;
        if (bb_data.finished || pass > 10) {
            if (typeof jQuery != 'undefined') {
                jQuery.cookie('MOS_regiobb', blackbox, { expires: 1, path :'/' });
            }
            return false;
        }
        setTimeout("GetIOBB(" + (pass + 1) + ")", 100);
    }
    return false;
}

// Make clicking on logo send you to home page
$('div:jqmData(role="page"):not(".m_home")').find('header').find('.logo').live('tap', function (e) {
    $.mobile.changePage('/home/', { transition: 'slidedown' });
});

// Show page loading message after completion of registration
$('form', '.m_reg_step_3').live('submit', function (e) {
    $.mobile.showPageLoadingMsg();
});


// Toggling between full site and mobile site
$('.m_login').live('pageshow', function (event, ui) {
    $.cookie("sofs", "0", { expires: -1, path: '/', domain: 'jdate.com' });
    var ea = $.cookie("MOS_EA");

    if (ea != null) {
        $('.logonemailaddress').val(ea);
    }
});

$('.m_home').live('pageshow', function (event, ui) {
    $.cookie("sofs", "0", { expires: -1, path: '/', domain: 'jdate.com' });
});

$('.fullsite-link').live('tap', function (e) {
    $.cookie("sofs", 1, { expires: null, path: '/', domain: 'jdate.com' });
    s.prop50 = "F_" + getPageClassName($('div:jqmData(role="page")'));
    callOmniture();
    return;
});

$('.logout-link').live('tap', function (e) {
    s.prop50 = "L_" + getPageClassName($('div:jqmData(role="page")'));
    callOmniture();
});


///////////////////////////////
//                           //
//   Omniture requirements   //
//                           //
///////////////////////////////
function callOmniture() {
    setGlobalVars();
    s.t();
    ClearOmnitureObject(s);
}
//We also set eVar11,12,13 in s_code.js which the fws is also doing.
function setGlobalVars() {
    s.prop10 = location.href;
    var today = new Date();
    var hour = today.getHours();
    var ap = "AM";
    if (hour > 11) { ap = "PM"; }
    if (hour > 12) { hour = hour - 12; }
    if (hour == 0) { hour = 12; }
    var minutes = (Math.round(today.getMinutes() / 30) * 30) % 60
    if (minutes == 0) { minutes = 00; }
    s.prop11 = hour + ":" + minutes + ap;
    s.eVar12 = $.query.get('eid');
}
function callOmnitureLink(type) {
    // unlike the s.t() method, this has a built-in 500ms delay to allow for the call to be made.
    // Only necessary for links or form submissions that do not use AJAX.
    // Type can be either "o" for "other/general", "d" for "File Download", or "e" for "exit link"
    if (type === "undefined") {
        type = 'o';
    }
    s.tl(this, type);
    ClearOmnitureObject(s);
}
function ClearOmnitureObject(sObj) { for (var i = 0; i < 100; i++) { sObj['prop' + i] = ''; sObj['eVar' + i] = ''; } sObj.products = ''; sObj.events = ''; sObj.linkTrackVars = ''; sObj.server = ''; sObj.channel = ''; sObj.pageName = ''; sObj.pageType = ''; sObj.campaign = ''; }

// Page views
$('.m_login').live('pageshow', function (event, ui) {
    s.pageName = "m_login";
    s.eVar2 = "m_login";
    s.prop2 = "m_login";
    s.events = "event2";
    s.eVar36 = "m.jdate.com";
    callOmniture();
});







$('.m_home').live('pagecreate', function (event, ui) {
	s.pageName = "m_home";
	s.eVar2 = "m_home";
	s.prop2 = "m_home";
	var memberId = jdmApp.getMemberId();
	if (memberId > 0) {
		s.prop23 = String(memberId);
	}

	s.events = "event2,event3,event20";
	// event2 = generic page load, event3 = login, event20 = autologin
	// "remember me/auto login" scenario. User came to home page, did not log in because oauth cookies were already present

	var ea = $.cookie("MOS_OMNI_LOGIN");

	if (ea !== null) {
		if (ea === "Y") {
			// if member just successfully logged in from login page
			s.events = "event2,event3";
			// event2 = generic page load, event3 = login
		}
		else if (ea === "N") { // already made omniture call in this session
			return;
		}
	}
	callOmniture();
	s.events = "";
	$.cookie("MOS_OMNI_LOGIN", "N"); // set cookie to "N" so omniture is not called again this session
});

$('.m_contact_us').live('pageshow', function (event, ui) {
    s.pageName = "m_contact_us";
    s.eVar2 = "m_contact_us";
    s.prop2 = "m_contact_us";
    s.events = "event2";
    callOmniture();
});

$('.m_search_results').live('pageshow', function (event, ui) {
    s.pageName = "m_search_results";
    s.eVar2 = "m_search_results";
    s.prop2 = "m_search_results";
    s.events = "event2";
    var listLength = $("#search-results-list").children().size();
    var getPage = Math.round(listLength / 10);
    s.eVar25 = getPage;
    callOmniture();
});

$('.m_search_preferences').live('pageshow', function (event, ui) {
    s.pageName = "m_search_preferences";
    s.eVar2 = "m_search_preferences";
    s.prop2 = "m_search_preferences";
    s.events = "event2";
    callOmniture();
});

$('.m_hotlist_yourfavorites').live('pageshow', function (event, ui) {
    s.pageName = "m_hotlist_yourfavorites";
    s.eVar2 = "m_hotlist_yourfavorites";
    s.prop2 = "m_hotlist_yourfavorites";
    s.events = "event2";
    callOmniture();
});

$('.m_hotlist_favoritedyou').live('pageshow', function (event, ui) {
    s.pageName = "m_hotlist_favoritedyou";
    s.eVar2 = "m_hotlist_favoritedyou";
    s.prop2 = "m_hotlist_favoritedyou";
    s.events = "event2";
    callOmniture();
});

$('.m_hotlist_viewedyou').live('pageshow', function (event, ui) {
    s.pageName = "m_hotlist_viewedyou";
    s.eVar2 = "m_hotlist_viewedyou";
    s.prop2 = "m_hotlist_viewedyou";
    s.events = "event2";
    callOmniture();
});

$('.m_mail_inbox').live('pageshow', function (event, ui) {
    s.pageName = "m_mail_inbox";
    s.eVar2 = "m_mail_inbox";
    s.prop2 = "m_mail_inbox";
    s.events = "event2";
    callOmniture();
});

$('.m_mail_sent').live('pageshow', function (event, ui) {
    s.pageName = "m_mail_sent";
    s.eVar2 = "m_mail_sent";
    s.prop2 = "m_mail_sent";
    s.events = "event2";
    callOmniture();
});

$('.m_mail_trash').live('pageshow', function (event, ui) {
    s.pageName = "m_mail_trash";
    s.eVar2 = "m_mail_trash";
    s.prop2 = "m_mail_trash";
    s.events = "event2";
    callOmniture();
});

$('.m_mail_inbox_message').live('pageshow', function (event, ui) {
    s.pageName = "m_mail_inbox_message";
    s.eVar2 = "m_mail_inbox_message";
    s.prop2 = "m_mail_inbox_message";
    s.events = "event2";
    callOmniture();
});

// For grabbing the class name of the previous page for profile view reporting.
function startsWith(string, pattern) {
    return string.slice(0, pattern.length) == pattern;
}

function getPageClassName(div) {
    var pageClass;
    var classes = $(div).attr('class');
    var classSplit = classes.split(' ');
    for (var i = 0; i < classSplit.length; i++) {
        if (startsWith(classSplit[i], 'm_')) {
            var pageClass = classSplit[i];
        };
    };

    return pageClass;
}

$('div:jqmData(role="page")').live('pagecreate', function (e) {
    $(e.target).bind('pagebeforehide', function () {
        if ($('div:jqmData(role="page")').hasClass('m_profile')) {
            var pageClass = getPageClassName(this);
            s.eVar1 = pageClass + "_profile";
        }
    });
});

$('.m_profile').live('pageshow', function (event, ui) {
    s.pageName = "m_profile";
    s.eVar2 = "m_profile";
    s.prop2 = "m_profile";
    s.events = "event2,event12";
    callOmniture();
});

$('.m_my_profile').live('pageshow', function (event, ui) {
    s.pageName = "m_my_profile";
    s.eVar2 = "m_my_profile";
    s.prop2 = "m_my_profile";
    s.events = "event2,event12";
    callOmniture();
});

$('.m_photo_upload').live('pageshow', function (event, ui) {
    s.pageName = "m_photo_upload";
    s.eVar2 = "m_photo_upload";
    s.prop2 = "m_photo_upload";
    s.events = "event2";
    callOmniture();
});

$('.m_editphoto').live('pageshow', function (event, ui) {
    s.pageName = "m_editphoto";
    s.eVar2 = "m_editphoto";
    s.prop2 = "m_editphoto";
    s.events = "event2";
    callOmniture();
});


$('.m_photo_howtoupload').live('pageshow', function (event, ui) {
    s.pageName = "m_photo_howtoupload";
    s.eVar2 = "m_photo_howtoupload";
    s.prop2 = "m_photo_howtoupload";
    s.events = "event2";
    callOmniture();
});

$('.m_photolist').live('pageshow', function (event, ui) {
    s.pageName = "m_photolist";
    s.eVar2 = "m_photolist";
    s.prop2 = "m_photolist";
    s.events = "event2";
    callOmniture();
});

$('.m_photo_deleteconfirm').live('pageshow', function (event, ui) {
    s.pageName = "m_photo_deleteconfirm";
    s.eVar2 = "m_photo_deleteconfirm";
    s.prop2 = "m_photo_deleteconfirm";
    callOmniture();
});

// Event tracking w/ page view
$('form', '.m_login').live('submit', function (e) {
	s.eVar2 = "m_logon";
	s.prop2 = "m_logon";
	//s.events = "event3";
	callOmnitureLink();
});

$('.btn-call', '.m_contact_us').live('tap', function (e) {
    s.eVar2 = "m_contact_us";
    s.prop2 = "m_contact_us";
    s.events = "event70";
    callOmniture();
});

$('.btn-email', '.m_contact_us').live('tap', function (e) {
    s.eVar2 = "m_contact_us";
    s.prop2 = "m_contact_us";
    s.events = "event71";
    callOmniture();
});

$('.homelink-uploadphoto a', '.m_home').live('tap', function (e) {
    // Not implemented. On Click Upload Photos, fire event 64 (mobile_uploadphotoattempt 64)
});

$('.btn-showMore', '.m_search_results').live('tap', function (e) {
    s.eVar2 = "m_search_results";
    s.prop2 = "m_search_results";
    s.events = "event76";
    s.eVar63 = "search_results";
    var listLength = $("#search-results-list").children().size();
    var getPage = Math.round(listLength / 10) + 1;
    s.eVar25 = getPage;
    callOmniture();
});

// MOL show more button.
$('.btn-showMore', '.m_members_online').live('tap', function (e) {
    s.pageName = "m_search_results_mol";
    s.eVar2 = "";
    s.prop2 = "";
    s.events = "event2, event76";
    s.eVar63 = "mol_search_results";
    var listLength = $("#mol-results-list").children().size();
    var getPage = Math.round(listLength / 10) + 1;
    s.eVar25 = getPage;
    s.eVar36 = "m.jdate.com";
    callOmniture();
});


$('form', '.m_search_preferences').live('submit', function (e) {
    s.eVar2 = "m_search_preferences";
    s.prop2 = "m_search_preferences";
    s.events = "event53";
    callOmniture();
});

$('.btn-showMore', '.m_mail_inbox').live('tap', function (e) {
    s.eVar2 = "m_mail_inbox_message";
    s.prop2 = "m_mail_inbox_message";
    s.events = "event76";
    s.eVar63 = "mail_inbox";
    callOmniture();
});

$('form', '.m_mail_inbox_message').live('submit', function (e) {
    s.eVar2 = "m_mail_inbox_message";
    s.prop2 = "m_mail_inbox_message";
    s.events = "event11";
    s.eVar26 = "mobile_email";
    callOmniture();
});

$('.report-concern', '.m_profile').live('tap', function (e) {
    s.events = "event65";
    callOmniture();
});

$('div:jqmData(role="collapsible")', '.m_profile').live('expand', function () {
    s.eVar2 = "m_profile";
    s.prop2 = "m_profile";
    s.events = "event4";
    callOmniture();
});

$('.icon-favorite', '.m_profile').live('tap', function (e) {
    s.eVar2 = "m_profile";
    s.prop2 = "m_profile";
    s.events = "event27";
    callOmniture();
});

$('form', '.m_mail_email').live('submit', function (e) {
    s.eVar2 = 'm_mail_email';
    s.prop2 = 'm_mail_email';
    s.events = "event11";
    s.eVar26 = "mobile_email";
    callOmniture();
});

$('.btn-showMore', '.m_mail_sent').live('tap', function (e) {
    s.eVar2 = "m_mail_sent";
    s.prop2 = "m_mail_sent";
    s.events = "event76";
    s.eVar63 = "mail_sent";
    callOmniture();
});

$('.btn-showMore', '.m_mail_drafts').live('tap', function (e) {
    // This doesn't exist yet, but I'm putting it here for future
    s.events = "event76";
    s.prop2 = "event76";
    s.eVar26 = "mail_drafts";
    callOmniture();
});

$('.btn-showMore', '.m_mail_trash').live('tap', function (e) {
    s.eVar2 = "m_mail_trash";
    s.prop2 = "m_mail_trash";
    s.events = "event76";
    s.eVar26 = "mail_trash";
    callOmniture();
});

$('form', '.m_mail_flirt').live('submit', function (e) {
    s.eVar2 = "m_mail_flirt";
    s.prop2 = "m_mail_flirt";
    s.events = "event11";
    s.eVar26 = "mobile_flirt";
    callOmniture();
});

$('.btn-showMore', '.m_hotlist_favoritedyou').live('tap', function (e) {
    s.eVar2 = "m_hotlist_favoritedyou";
    s.prop2 = "m_hotlist_favoritedyou";
    s.events = "event76";
    s.eVar63 = "hotlist_favyou";
    callOmniture();
});

$('.btn-showMore', '.m_hotlist_yourfavorites').live('tap', function (e) {
    s.eVar2 = "m_hotlist_yourfavorites";
    s.prop2 = "m_hotlist_yourfavorites";
    s.events = "event76";
    s.eVar63 = "hotlist_favorites";
    callOmniture();
});

function initBirthdayFields() {
	if (Modernizr && Modernizr.inputtypes.date) { // use HTML5 input type=date if supported, otherwise fall back to month/day/year fields
		$('#registration-dob-fieldset').hide();
		$('input#registration-dob-datefield').live('change blur', function () {
			var dateStr = $(this).val();
			if (!dateStr) {
				return;
			}
			var dateVal = Date.parse(dateStr);
			if (!dateVal || isNaN(dateVal)) { // parse failed, try manually parsing (Safari Mobile parse was failing)
				var dateParts = dateStr.split("-");
				dateVal = new Date(dateParts[0], (dateParts[1] - 1), dateParts[2]);
			}
			if (!dateVal || isNaN(dateVal)) {
				alert('Could not read the birthdate from your browser.  Please try again using month/day/year fields.');
				$('#registration-dob-fieldset').show();
				$("#registration-dob-singledatefieldset").remove();
				return;
			}
			var birthdate = new Date(dateVal);

			$('input#registration-dob-y').val(birthdate.getFullYear().toString());
			$('#registration-dob-d option').eq(birthdate.getDate() - 1).attr('selected', 'selected');
			$('#registration-dob-m option').eq(birthdate.getMonth()).attr('selected', 'selected');
		});
	}
	else {
		$("#registration-dob-singledatefieldset").remove();
	}
}

$('.m_fbreg_step_1').live('pagecreate', function () {
	jdmApp.ensureFacebookAPI(function() {
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				spark.facebook.fbRegPopulator();
			} else {
				alert('Failed to authorize with Facebook');
				history.back();
			}
		});
	});
});

$('.m_fbreg_interstitial').live('pagecreate', function () {
    s.pageName = "m_fbreg_interstitial";
    s.eVar2 = "m_fbreg_interstitial";
    s.prop53 = "Facebook Registration";
    s.prop2 = "m_fbreg_interstitial";
    callOmniture();
    initBirthdayFields();
});


$('.m_fbreg_step_1').live('pagecreate', function () {
	s.pageName = "m_reg_step_1";
	s.eVar2 = "m_reg_step_1";
	s.prop53 = "Facebook Registration";
	s.prop2 = "m_reg_step_1";
	s.events = "event2,event7";
	callOmniture();
	initBirthdayFields();
});


$('.m_reg_step_1').live('pagecreate', function () {
	s.pageName = "m_reg_step_1";
	s.eVar2 = "m_reg_step_1";
	s.prop53 = "Standard Registration";
	s.prop2 = "m_reg_step_1";
	s.events = "event2,event7";
	callOmniture(); initBirthdayFields();
});

$('.m_fbreg_step_2').live('pageshow', function () {
    s.pageName = "m_reg_step_2";
    s.eVar2 = "m_reg_step_2";
    s.prop53 = "Facebook Registration";
    s.prop2 = "m_reg_step_2";
    s.events = "event2";
    callOmniture();
});
    
$('.m_reg_step_2').live('pageshow', function () {
	s.pageName = "m_reg_step_2";
    s.eVar2 = "m_reg_step_2";
    s.prop53 = "Standard Registration";
    s.prop2 = "m_reg_step_2";
    s.events = "event2";
    callOmniture();
});

$('.m_fbreg_step_3').live('pageshow', function () {
    s.pageName = "m_reg_step_3";
    s.eVar2 = "m_reg_step_3";
    s.prop53 = "Facebook Registration";
    s.prop2 = "m_reg_step_3";
    s.events = "event2";
    callOmniture();
});

$('.m_reg_step_3').live('pageshow', function () {
    s.pageName = "m_reg_step_3";
    s.eVar2 = "m_reg_step_3";
    s.prop53 = "Standard Registration";
    s.prop2 = "m_reg_step_3";
    s.events = "event2";
    callOmniture();
});

$('.m_fbreg_complete').live('pageshow', function () {
    s.pageName = "m_reg_complete";
    s.eVar2 = "m_reg_complete";
    s.prop53 = "Facebook Registration";
    s.prop2 = "m_reg_complete";
    s.events = "event2,event8";
    callOmniture();
});

$('.m_reg_complete').live('pageshow', function () {
    s.pageName = "m_reg_complete";
    s.eVar2 = "m_reg_complete";
    s.prop53 = "Standard Registration";
    s.prop2 = "m_reg_complete";
    s.events = "event2,event8";
    callOmniture();
});

$('.m_subscription_confirmation').live('pageshow', function () {
    s.pageName = "m_subscription_confirmation";
    s.eVar2 = "m_subscription_confirmation";
    s.prop2 = "m_subscription_confirmation";
    s.events = "event10";
    callOmniture();
});

$(function () {

	if (jdmApp.isWrapperApp()) {
		var wrapper = $.cookie("iOS_WRAP");
		if (!wrapper) {
			$.cookie("iOS_WRAP", "Y", { path: '/', domain: 'jdate.com' });
		}
	}

	jQuery.validator.unobtrusive.adapters.add("brequired", function (options) {
		//b-required for checkboxes
		if (options.element.tagName.toUpperCase() == "INPUT" && options.element.type.toUpperCase() == "CHECKBOX") {
			options.rules["required"] = true;
			if (options.message) {
				options.messages["required"] = options.message;
			}
		}
	});

	jQuery.validator.addMethod('required_group', function (value, element) {
		var module = $(element).parents('form');
		return module.find('input.required_group:checked').length;
	}, 'Please select at least one');

	jQuery.validator.addMethod("fulldate-year", jdmApp.dateValidator, 'Please enter a valid date');

	jQuery.validator.addMethod("adult-birthdate", function (value, element) {
		var birthdate = jdmApp.dateValidator(value, element);
		if (!birthdate) {
			return false; // invalid date
		}
		var today = new Date();
		if (today.getFullYear() - birthdate.getFullYear() < 18) {
			return false; // under age
		}

		if (today.getFullYear() - birthdate.getFullYear() == 18) {
			if (today.getMonth() < birthdate.getMonth()) {
				return false; // under age
			}
			if (birthdate.getMonth() == today.getMonth() && today.getDate() < birthdate.getDate()) {
				return false; // under age
			}
		}
		if (today.getFullYear() - birthdate.getFullYear() > 99) {
			return false; // over age
		}
		return true;
	}, 'You must be over 18 and under 100 to join this site');

});

// adjust collapsible top position when no-photo
$('.m_profile').live('pageinit', function () {
    var viewportWidth = $(window).width();

    if (viewportWidth > 650 && $('.m_profile .profile-photo-container').children().length == 0) {
        $('.ui-content .ui-collapsible-set').addClass('no-photo');
    }
});


//window.fbAsyncInit = function () {
//	//logIt(x, 'FB.init ' + window.location.href);
//	FB.init({
//		appId: spark.facebook.appId, // App ID
//		// comment from Erik Phipps in bedrock:
//		// removing the channel file since it is not needed for our implementation and it causes a bug in IE
//		// the IE bug: if the user cancels the popup, the popup does not close
//		//channelUrl: '//' + document.domain + "/fbchannel/channel.html", // Channel File
//		status: true, // check login status
//		cookie: true, // enable cookies to allow the server to access the session
//		xfbml: true  // parse XFBML
//	});
//	function goToStep1() {
//		$.mobile.changePage("/fbregistration/step1");
//	}
//	// handle quick join with facebook click	
//	$('.m_fbreg_interstitial #fbloginform').submit(function () {
//		FB.getLoginStatus(function (response) {
//			if (response.status === 'connected') {
//				goToStep1();
//			} else {
//				FB.login(function (loginResponse) {
//					if (loginResponse.authResponse) {
//						goToStep1();
//					} else { // show error message or assume FB has?
//					}
//				}, {
//					scope: 'user_birthday,user_photos,email,user_likes'
//				});
//			}
//		});
//	return false;});
//	jdmApp.executeFBCallbacks();
//};

//function showFBSSOLogin() {
//    FB.login(function(response) {
//        if (response.authResponse) {
//            console.log('Welcome! Fetching your information.... ');
//            FB.api('/me', function(response) {
//                console.log('Good to see you, ' + response.name + '.');
//            });
//            $('form#login input[name="a"]').val('fb_login');
//            document.getElementById('login').submit();
//        } else {
//            console.log('User cancelled login or did not fully authorize.');
//        }
//    }, {scope: 'user_birthday,user_photos,email,user_likes'});
//}

//// Load the Facebook SDK Asynchronously
//(function(d) {
//	var js, id = 'facebook-jssdk';
//	if (d.getElementById(id)) {
//		return;
//	}
//	var ref = d.getElementsByTagName('script')[0];
//	if (d.getElementById(id)) {
//		return;
//	}
//	js = d.createElement('script');
//	js.id = id;
//	js.async = true;
//	js.src = "//connect.facebook.net/en_US/all.js";
//	ref.parentNode.insertBefore(js, ref);
//	//logIt(x, 'inserting FB script tag on ' + window.location.href);
//}(document));

$('.m_im_login').live('pagecreate', function() {
    s.pageName = "m_im_login";
    s.events = "event2";
    callOmniture();
    s.events = '';
    $('#mainloginbutton').live('click', function() {
        $('#loginformmain').submit();
    });
});
