var mobileIM = (function() {
	var PROFILE_HEADER_HEIGHT = 55
	var TYPING_PANEL_HEIGHT = 65
	var STATUS_PANEL_HEIGHT = 25
	var ADDRESS_BAR_HEIGHT = 60		// Address bar height for iOS/Android browser
	
	return {
		init: function() {
			// Attach orientation change event (if supported).
			if(window.orientation !== undefined) {
				window.onorientationchange = function() {
					mobileIM.updatePageLayout();			
				};
			} else {
				// Fallback in case browser doesn't support orientation change event.
				$(window).bind("resize", function() {
					mobileIM.updatePageLayout();
				});
			}
			
			mobileIM.updatePageLayout();		
		},
		
		updatePageLayout: function() {
			window.scrollTo(0, 1);
			
			mobileIM.adjustLayout();
			mobileIM.hideAddressBar();	
		},
		
		adjustLayout: function() {
			var messagePanel = $("#messages");
			var height = $(window).height();
			
			height = height - (PROFILE_HEADER_HEIGHT + TYPING_PANEL_HEIGHT + STATUS_PANEL_HEIGHT);
			messagePanel.css({
				height: height + ADDRESS_BAR_HEIGHT
			});
		},
		
		hideAddressBar: function() {
			setTimeout(function() {
				var scrollTop = mobileIM.getScrollTop();
				window.scrollTo(0, scrollTop === 1 ? 0 : 1);
			},100);			
		},
		
		getScrollTop: function() {
			// Get proper scroll top value since it's different for Android and iOS.
			return window.pageYOffset || document.compatMode === "CSS1Compat" && 
				document.documentElement.scrollTop || document.body.scrollTop || 0;
		}
	};
})();
