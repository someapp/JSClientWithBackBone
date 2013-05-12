/* jqmTooltip plugin - a fun-time Jon Jandoc production */
(function ($) {

    $.fn.jqmTooltip = function (options) {

        var $this = $(this),
        settings = {
            'arrow': true,
            'fadeSpeed': 200,
            'maxWidth': 280,
            'minSideMargins': 15,
            'position': 'autoUnder',
            'offset': 15,
            'text': 'title'
        }

        function showTooltip(tooltip) {
            $(tooltip).fadeIn(settings.fadeSpeed);
        }
        function hideTooltip(tooltip) {
            if (tooltip = 'all') {
                tooltip = $('.jqmTooltip')
            }
            $(tooltip).fadeOut(settings.fadeSpeed);
        }

        // Hide visible tooltips when clicking rest of screen or on resize
        $this.parents('div:jqmData(role="page")').bind('tap.jqmTooltip', function (event) {
            hideTooltip('all');
        });
        $(window).bind('resize.jqmTooltip', function (event) {
            hideTooltip('all');
        });

        return this.each(function () {
            // Merge settings
            if (options) {
                $.extend(settings, options);
            }

            var cssStyles = {},
                tooltipID = 'tooltip-' + Math.floor(Math.random() * 1000),
                overlay, overlayWidth, overlayLeft, overlayOffset, element, elemOffset, windowHeight, windowWidth;

            // Create overlay
            overlay = $('<div class="jqmTooltip">');

            // Grab inner text from title tag by default
            if (settings.text == 'title') {
                settings.text = $this.attr('title');
                $this.attr('title', '');
            }
            overlay.html(settings.text)
			    .attr('id', tooltipID)
                .css('display', 'none')
			    .append('<a href="#" class="close">\u00D7</div>')
                .find('.close').bind('tap', function (e) {
                    e.preventDefault();
                    hideTooltip('#' + tooltipID);
                });
            if (settings.arrow) {
                overlay.append('<div class="arrow">');
                var arrowLeft;
            }

            $this.parents('div:jqmData(role="page")').append(overlay);

            // Bind tap event
            $this.bind('tap.jqmTooltip', function (e) {
                e.stopPropagation();
                if (overlay.hasClass('active')) {
                    hideTooltip(overlay);
                } else {

                    element = $(e.target);
                    elemOffset = element.offset();

                    windowHeight = $(window).height();
                    windowWidth = $(window).width();
                    overlayWidth = windowWidth - (2 * settings.minSideMargins);

                    if (overlayWidth > settings.maxWidth) {
                        overlayWidth = settings.maxWidth;
                    }
                    cssStyles.width = overlayWidth;

                    // position overlay horizontally based on trigger element and screen width
                    overlayLeft = (elemOffset.left + (element.width() / 2)) - (overlayWidth / 2)

                    // check if overlay is too far right
                    if (overlayLeft + overlayWidth > windowWidth) {
                        cssStyles.left = 'auto';
                        cssStyles.right = settings.minSideMargins;
                        if (settings.arrow) {
                            overlayOffset = overlay.offset();
                            arrowLeft = ((elemOffset.left - (windowWidth - settings.minSideMargins - overlayWidth)) + (element.width() / 2)) + 'px';
                            overlay.find('.arrow').css('left', arrowLeft);
                        }
                        // check if overlay is too far left
                    } else if (overlayLeft < 0) {
                        cssStyles.left = settings.minSideMargins;
                        cssStyles.right = 'auto';
                        if (settings.arrow) {
                            arrowLeft = ((elemOffset.left - settings.minSideMargins) + (element.width() / 2)) + 'px';
                            overlay.find('.arrow').css('left', arrowLeft);
                        }
                        // otherwise center overlay under element
                    } else {
                        cssStyles.left = (elemOffset.left + (element.width() / 2)) - (overlayWidth / 2)
                        if (settings.arrow) {
                            overlay.find('.arrow').css('left', '50%');
                        }
                    }

                    // position overlay vertically based on settings
                    switch (settings.position) {
                        case ('over'):
                            cssStyles.top = 'auto';
                            cssStyles.bottom = (windowHeight - elemOffset.top) + settings.offset + 'px';
                            overlay.addClass('over').css(cssStyles);
                            showTooltip(overlay);
                            break;
                        case ('under'):
                            cssStyles.top = elemOffset.top + element.outerHeight() + settings.offset + 'px';
                            cssStyles.bottom = 'auto';
                            overlay.addClass('under').css(cssStyles);
                            showTooltip(overlay);
                            break;
                        case ('autoOver'):
                            overlay.css(cssStyles);
                            showTooltip(overlay);
                            if ((overlay.outerHeight() + settings.offset) > (elemOffset.top - $(window).scrollTop())) {
                                cssStyles.top = elemOffset.top + element.outerHeight() + settings.offset + 'px';
                                overlay.addClass('under').removeClass('over').css(cssStyles);
                            } else {
                                cssStyles.top = elemOffset.top - overlay.outerHeight() - settings.offset + 'px';
                                overlay.addClass('over').removeClass('under').css(cssStyles);
                            }
                            break;
                        default: // aka 'autoUnder'
                            overlay.css(cssStyles);
                            showTooltip(overlay);
                            if ((overlay.outerHeight() + settings.offset) > ($(window).height() - elemOffset.top)) {
                                cssStyles.top = elemOffset.top - overlay.outerHeight() - settings.offset + 'px';
                                overlay.addClass('over').removeClass('under').css(cssStyles);
                            } else {
                                cssStyles.top = elemOffset.top + element.outerHeight() + settings.offset + 'px';
                                overlay.addClass('under').removeClass('over').css(cssStyles);
                            }
                            break;
                    }

                };

            });

        });

    };
})(jQuery);

/**
* Klass.js - copyright @dedfat
* version 1.0
* https://github.com/ded/klass
* Follow our software http://twitter.com/dedfat :)
* MIT License
*/
!function (context, f) {
    var fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\bsupr\b/ : /.*/,
      noop = function () { },
      proto = 'prototype',
      isFn = function (o) {
          return typeof o === f;
      };

    function klass(o) {
        return extend.call(isFn(o) ? o : noop, o, 1);
    }

    function wrap(k, fn, supr) {
        return function () {
            var tmp = this.supr;
            this.supr = supr[proto][k];
            var ret = fn.apply(this, arguments);
            this.supr = tmp;
            return ret;
        };
    }

    function process(what, o, supr) {
        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                what[k] = isFn(o[k])
          && isFn(supr[proto][k])
          && fnTest.test(o[k])
          ? wrap(k, o[k], supr) : o[k];
            }
        }
    }

    function extend(o, fromSub) {
        // must redefine noop each time so it doesn't inherit from previous arbitrary classes
        function noop() { }
        noop[proto] = this[proto];
        var supr = this,
        prototype = new noop(),
        isFunction = isFn(o),
        _constructor = isFunction ? o : this,
        _methods = isFunction ? {} : o,
        fn = function () {
            if (this.initialize) {
                this.initialize.apply(this, arguments);
            } else {
                fromSub || isFunction && supr.apply(this, arguments);
                _constructor.apply(this, arguments);
            }
        };

        fn.methods = function (o) {
            process(prototype, o, supr);
            fn[proto] = prototype;
            return this;
        };

        fn.methods.call(fn, _methods).prototype.constructor = fn;

        fn.extend = arguments.callee;
        fn[proto].implement = fn.statics = function (o, optFn) {
            o = typeof o == 'string' ? (function () {
                var obj = {};
                obj[o] = optFn;
                return obj;
            } ()) : o;
            process(this, o, supr);
            return this;
        };

        return fn;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = klass;
    } else {
        var old = context.klass;
        klass.noConflict = function () {
            context.klass = old;
            return this;
        };
        context.klass = klass;
    }

} (this, 'function');

// Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window) {

    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    if (!Function.prototype.bind) {

        Function.prototype.bind = function (obj) {
            var slice = [].slice,
					args = slice.call(arguments, 1),
					self = this,
					nop = function () { },
					bound = function () {
					    return self.apply(this instanceof nop ? this : (obj || {}),
																args.concat(slice.call(arguments)));
					};

            nop.prototype = self.prototype;

            bound.prototype = new nop();

            return bound;
        };
    }



    if (typeof window.Code === "undefined") {
        window.Code = {};
    }



    window.Code.Util = {


        /*
        * Function: registerNamespace
        */
        registerNamespace: function () {
            var 
				args = arguments, obj = null, i, j, ns, nsParts, root;
            for (i = 0; i < args.length; i++) {
                ns = args[i];
                nsParts = ns.split(".");
                root = nsParts[0];
                if (typeof window[root] === "undefined") {
                    window[root] = {};
                }
                obj = window[root];
                //eval('if (typeof ' + root + ' == "undefined"){' + root + ' = {};} obj = ' + root + ';');
                for (j = 1; j < nsParts.length; ++j) {
                    obj[nsParts[j]] = obj[nsParts[j]] || {};
                    obj = obj[nsParts[j]];
                }
            }
        },



        /*
        * Function: coalesce
        * Takes any number of arguments and returns the first non Null / Undefined argument.
        */
        coalesce: function () {
            var i;
            for (i = 0; i < arguments.length; i++) {
                if (!this.isNothing(arguments[i])) {
                    return arguments[i];
                }
            }
            return null;
        },



        /*
        * Function: extend
        */
        extend: function (destination, source, overwriteProperties) {
            var prop;
            if (this.isNothing(overwriteProperties)) {
                overwriteProperties = true;
            }
            if (destination && source && this.isObject(source)) {
                for (prop in source) {
                    if (this.objectHasProperty(source, prop)) {
                        if (overwriteProperties) {
                            destination[prop] = source[prop];
                        }
                        else {
                            if (typeof destination[prop] === "undefined") {
                                destination[prop] = source[prop];
                            }
                        }
                    }
                }
            }
        },



        /*
        * Function: clone
        */
        clone: function (obj) {
            var retval = {};
            this.extend(retval, obj);
            return retval;
        },



        /*
        * Function: isObject
        */
        isObject: function (obj) {
            return obj instanceof Object;
        },



        /*
        * Function: isFunction
        */
        isFunction: function (obj) {
            return ({}).toString.call(obj) === "[object Function]";
        },



        /*
        * Function: isArray
        */
        isArray: function (obj) {
            return obj instanceof Array;
        },


        /*
        * Function: isLikeArray
        */
        isLikeArray: function (obj) {
            return typeof obj.length === 'number';
        },



        /*
        * Function: isNumber
        */
        isNumber: function (obj) {
            return typeof obj === "number";
        },



        /*
        * Function: isString
        */
        isString: function (obj) {
            return typeof obj === "string";
        },


        /*
        * Function: isNothing
        */
        isNothing: function (obj) {

            if (typeof obj === "undefined" || obj === null) {
                return true;
            }
            return false;

        },



        /*
        * Function: swapArrayElements
        */
        swapArrayElements: function (arr, i, j) {

            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;

        },



        /*
        * Function: trim
        */
        trim: function (val) {
            return val.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        },



        /*
        * Function: toCamelCase
        */
        toCamelCase: function (val) {
            return val.replace(/(\-[a-z])/g, function ($1) { return $1.toUpperCase().replace('-', ''); });
        },



        /*
        * Function: toDashedCase
        */
        toDashedCase: function (val) {
            return val.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
        },



        /*
        * Function: objectHasProperty
        */
        objectHasProperty: function (obj, propName) {

            if (obj.hasOwnProperty) {
                return obj.hasOwnProperty(propName);
            }
            else {
                return ('undefined' !== typeof obj[propName]);
            }

        }


    };

} (window));
// Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, Util) {

    Util.Browser = {

        ua: null,
        version: null,
        safari: null,
        webkit: null,
        opera: null,
        msie: null,
        chrome: null,
        mozilla: null,

        android: null,
        blackberry: null,
        iPad: null,
        iPhone: null,
        iPod: null,
        iOS: null,

        is3dSupported: null,
        isCSSTransformSupported: null,
        isTouchSupported: null,
        isGestureSupported: null,


        _detect: function () {

            this.ua = window.navigator.userAgent;
            this.version = (this.ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || []);
            this.safari = (/Safari/gi).test(window.navigator.appVersion);
            this.webkit = /webkit/i.test(this.ua);
            this.opera = /opera/i.test(this.ua);
            this.msie = /msie/i.test(this.ua) && !this.opera;
            this.chrome = /Chrome/i.test(this.ua);
            this.mozilla = /mozilla/i.test(this.ua) && !/(compatible|webkit)/.test(this.ua);
            this.android = /android/i.test(this.ua);
            this.blackberry = /blackberry/i.test(this.ua);
            this.iOS = (/iphone|ipod|ipad/gi).test(window.navigator.platform);
            this.iPad = (/ipad/gi).test(window.navigator.platform);
            this.iPhone = (/iphone/gi).test(window.navigator.platform);
            this.iPod = (/ipod/gi).test(window.navigator.platform);

            var testEl = document.createElement('div');
            this.is3dSupported = !Util.isNothing(testEl.style.WebkitPerspective);
            this.isCSSTransformSupported = (!Util.isNothing(testEl.style.WebkitTransform) || !Util.isNothing(testEl.style.MozTransform) || !Util.isNothing(testEl.style.transformProperty));
            this.isTouchSupported = this.isEventSupported('touchstart');
            this.isGestureSupported = this.isEventSupported('gesturestart');

        },


        _eventTagNames: {
            'select': 'input',
            'change': 'input',
            'submit': 'form',
            'reset': 'form',
            'error': 'img',
            'load': 'img',
            'abort': 'img'
        },


        /*
        * Function: isEventSupported
        * http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
        */
        isEventSupported: function (eventName) {
            var 
				el = document.createElement(this._eventTagNames[eventName] || 'div'),
				isSupported;
            eventName = 'on' + eventName;
            isSupported = Util.objectHasProperty(el, eventName);
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] === 'function';
            }
            el = null;
            return isSupported;
        }
    };

    Util.Browser._detect();

}
(
	window,
	window.Code.Util
))
;
// Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, $, Util) {

    Util.extend(Util, {

        Events: {


            /*
            * Function: add
            * Add an event handler
            */
            add: function (obj, type, handler) {

                $(obj).bind(type, handler);

            },



            /*
            * Function: remove
            * Removes a handler or all handlers associated with a type
            */
            remove: function (obj, type, handler) {

                $(obj).unbind(type, handler);

            },


            /*
            * Function: fire
            * Fire an event
            */
            fire: function (obj, type) {

                var 
					event,
					args = Array.prototype.slice.call(arguments).splice(2);

                if (typeof type === "string") {
                    event = { type: type };
                }
                else {
                    event = type;
                }

                $(obj).trigger($.Event(event.type, event), args);

            },


            /*
            * Function: getMousePosition
            */
            getMousePosition: function (event) {

                var retval = {
                    x: event.pageX,
                    y: event.pageY
                };

                return retval;

            },


            /*
            * Function: getTouchEvent
            */
            getTouchEvent: function (event) {

                return event.originalEvent;

            },



            /*
            * Function: getWheelDelta
            */
            getWheelDelta: function (event) {

                var delta = 0;

                if (!Util.isNothing(event.wheelDelta)) {
                    delta = event.wheelDelta / 120;
                }
                else if (!Util.isNothing(event.detail)) {
                    delta = -event.detail / 3;
                }

                return delta;

            },


            /*
            * Function: domReady
            */
            domReady: function (handler) {

                $(document).ready(handler);

            }


        }


    });


}
(
	window,
	window.jQuery,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, $, Util) {

    Util.extend(Util, {

        DOM: {


            /*
            * Function: setData
            */
            setData: function (el, key, value) {

                Util.DOM.setAttribute(el, 'data-' + key, value);

            },



            /*
            * Function: getData
            */
            getData: function (el, key, defaultValue) {

                return Util.DOM.getAttribute(el, 'data-' + key, defaultValue);

            },



            /*
            * Function: removeData
            */
            removeData: function (el, key) {

                Util.DOM.removeAttribute(el, 'data-' + key);

            },



            /*
            * Function: isChildOf
            */
            isChildOf: function (childEl, parentEl) {
                if (parentEl === childEl) {
                    return false;
                }
                while (childEl && childEl !== parentEl) {
                    childEl = childEl.parentNode;
                }

                return childEl === parentEl;
            },



            /*
            * Function: find
            */
            find: function (selectors, contextEl) {
                if (Util.isNothing(contextEl)) {
                    contextEl = window.document;
                }
                var 
					els = $(selectors, contextEl),
					retval = [],
					i;

                for (i = 0; i < els.length; i++) {
                    retval.push(els[i]);
                }
                return retval;
            },



            /*
            * Function: createElement
            */
            createElement: function (type, attributes, content) {

                var retval = $('<' + type + '></' + type + '>');
                retval.attr(attributes);
                retval.append(content);

                return retval[0];

            },



            /*
            * Function: appendChild
            */
            appendChild: function (childEl, parentEl) {

                $(parentEl).append(childEl);

            },



            /*
            * Function: insertBefore
            */
            insertBefore: function (newEl, refEl, parentEl) {

                $(newEl).insertBefore(refEl);

            },



            /*
            * Function: appendText
            */
            appendText: function (text, parentEl) {

                $(parentEl).text(text);

            },



            /*
            * Function: appendToBody
            */
            appendToBody: function (childEl) {

                $('body').append(childEl);

            },



            /*
            * Function: removeChild
            */
            removeChild: function (childEl, parentEl) {

                $(childEl).empty().remove();

            },



            /*
            * Function: removeChildren
            */
            removeChildren: function (parentEl) {

                $(parentEl).empty();

            },



            /*
            * Function: hasAttribute
            */
            hasAttribute: function (el, attributeName) {

                return !Util.isNothing($(el).attr(attributeName));

            },



            /*
            * Function: getAttribute
            */
            getAttribute: function (el, attributeName, defaultValue) {

                var retval = $(el).attr(attributeName);
                if (Util.isNothing(retval) && !Util.isNothing(defaultValue)) {
                    retval = defaultValue;
                }
                return retval;

            },



            /*
            * Function: el, attributeName
            */
            setAttribute: function (el, attributeName, value) {

                $(el).attr(attributeName, value);

            },



            /*
            * Function: removeAttribute
            */
            removeAttribute: function (el, attributeName) {

                $(el).removeAttr(attributeName);

            },



            /*
            * Function: addClass
            */
            addClass: function (el, className) {

                $(el).addClass(className);

            },



            /*
            * Function: removeClass
            */
            removeClass: function (el, className) {

                $(el).removeClass(className);

            },



            /*
            * Function: hasClass
            */
            hasClass: function (el, className) {

                $(el).hasClass(className);

            },



            /*
            * Function: setStyle
            */
            setStyle: function (el, style, value) {

                var prop;

                if (Util.isObject(style)) {
                    for (prop in style) {
                        if (Util.objectHasProperty(style, prop)) {
                            if (prop === 'width') {
                                Util.DOM.width(el, style[prop]);
                            }
                            else if (prop === 'height') {
                                Util.DOM.height(el, style[prop]);
                            }
                            else {
                                $(el).css(prop, style[prop]);
                                el.style[prop] = style[prop];
                            }
                        }
                    }
                }
                else {
                    $(el).css(style, value);
                }

            },



            /*
            * Function: getStyle
            */
            getStyle: function (el, styleName) {

                return $(el).css(styleName);

            },



            /*
            * Function: hide
            */
            hide: function (el) {

                $(el).hide();

            },



            /*
            * Function: show
            */
            show: function (el) {

                $(el).show();

            },



            /*
            * Function: width 
            * Content width, exludes padding
            */
            width: function (el, value) {

                if (!Util.isNothing(value)) {
                    $(el).width(value);
                }

                return $(el).width();

            },



            /*
            * Function: outerWidth
            */
            outerWidth: function (el) {

                return $(el).outerWidth();

            },



            /*
            * Function: height 
            * Content height, excludes padding
            */
            height: function (el, value) {

                if (!Util.isNothing(value)) {
                    $(el).height(value);
                }

                return $(el).height();

            },



            /*
            * Function: outerHeight
            */
            outerHeight: function (el) {

                return $(el).outerHeight();

            },



            /*
            * Function: documentWidth
            */
            documentWidth: function () {

                return $(document.documentElement).width();

            },



            /*
            * Function: documentHeight
            */
            documentHeight: function () {

                return $(document.documentElement).height();

            },



            /*
            * Function: documentOuterWidth
            */
            documentOuterWidth: function () {

                return Util.DOM.width(document.documentElement);

            },



            /*
            * Function: documentOuterHeight
            */
            documentOuterHeight: function () {

                return Util.DOM.outerHeight(document.documentElement);

            },



            /*
            * Function: bodyWidth
            */
            bodyWidth: function () {

                return $(document.body).width();

            },



            /*
            * Function: bodyHeight
            */
            bodyHeight: function () {

                return $(document.body).height();

            },



            /*
            * Function: bodyOuterWidth
            */
            bodyOuterWidth: function () {

                return Util.DOM.outerWidth(document.body);

            },



            /*
            * Function: bodyOuterHeight
            */
            bodyOuterHeight: function () {

                return Util.DOM.outerHeight(document.body);

            },



            /*
            * Function: windowWidth
            */
            windowWidth: function () {
                //IE
                if (!window.innerWidth) {
                    return $(window).width();
                }
                //w3c
                return window.innerWidth;
            },



            /*
            * Function: windowHeight
            */
            windowHeight: function () {
                //IE
                if (!window.innerHeight) {
                    return $(window).height();
                }
                //w3c
                return window.innerHeight;
            },



            /*
            * Function: windowScrollLeft
            */
            windowScrollLeft: function () {
                //IE
                if (!window.pageXOffset) {
                    return $(window).scrollLeft();
                }
                //w3c
                return window.pageXOffset;
            },



            /*
            * Function: windowScrollTop
            */
            windowScrollTop: function () {
                //IE
                if (!window.pageYOffset) {
                    return $(window).scrollTop();
                }
                //w3c
                return window.pageYOffset;
            }

        }


    });


}
(
	window,
	window.jQuery,
	window.Code.Util
));
// Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, Util) {

    Util.extend(Util, {

        Animation: {

            _applyTransitionDelay: 50,

            _transitionEndLabel: (window.document.documentElement.style.webkitTransition !== undefined) ? "webkitTransitionEnd" : "transitionend",

            _transitionEndHandler: null,

            _transitionPrefix: (window.document.documentElement.style.webkitTransition !== undefined) ? "webkitTransition" : (window.document.documentElement.style.MozTransition !== undefined) ? "MozTransition" : "transition",

            _transformLabel: (window.document.documentElement.style.webkitTransform !== undefined) ? "webkitTransform" : (window.document.documentElement.style.MozTransition !== undefined) ? "MozTransform" : "transform",


            /*
            * Function: _getTransitionEndHandler
            */
            _getTransitionEndHandler: function () {

                if (Util.isNothing(this._transitionEndHandler)) {
                    this._transitionEndHandler = this._onTransitionEnd.bind(this);
                }

                return this._transitionEndHandler;

            },



            /*
            * Function: stop
            */
            stop: function (el) {

                if (Util.Browser.isCSSTransformSupported) {
                    var 
						property = el.style[this._transitionPrefix + 'Property'],
						callbackLabel = (property !== '') ? 'ccl' + property + 'callback' : 'cclallcallback',
						style = {};

                    Util.Events.remove(el, this._transitionEndLabel, this._getTransitionEndHandler());
                    if (Util.isNothing(el.callbackLabel)) {
                        delete el.callbackLabel;
                    }

                    style[this._transitionPrefix + 'Property'] = '';
                    style[this._transitionPrefix + 'Duration'] = '';
                    style[this._transitionPrefix + 'TimingFunction'] = '';
                    style[this._transitionPrefix + 'Delay'] = '';
                    style[this._transformLabel] = '';

                    Util.DOM.setStyle(el, style);
                }
                else if (!Util.isNothing(window.jQuery)) {

                    window.jQuery(el).stop(true, true);

                }


            },



            /*
            * Function: fadeIn
            */
            fadeIn: function (el, speed, callback, timingFunction) {

                if (speed <= 0) {
                    Util.DOM.setStyle(el, 'opacity', 1);
                    if (!Util.isNothing(callback)) {
                        callback(el);
                        return;
                    }
                }

                var opacity = Util.DOM.getStyle(el, 'opacity');

                if (opacity >= 1) {
                    Util.DOM.setStyle(el, 'opacity', 0);
                }

                if (Util.Browser.isCSSTransformSupported) {

                    this._applyTransition(el, 'opacity', 1, speed, callback, timingFunction);

                }
                else if (!Util.isNothing(window.jQuery)) {

                    window.jQuery(el).fadeTo(speed, 1, callback);

                }

            },



            /*
            * Function: fadeOut
            */
            fadeOut: function (el, speed, callback, timingFunction) {

                if (speed <= 0) {
                    Util.DOM.setStyle(el, 'opacity', 0);
                    if (!Util.isNothing(callback)) {
                        callback(el);
                        return;
                    }
                }

                if (Util.Browser.isCSSTransformSupported) {

                    this._applyTransition(el, 'opacity', 0, speed, callback, timingFunction);

                }
                else {

                    window.jQuery(el).fadeTo(speed, 0, callback);

                }

            },



            /*
            * Function: slideBy
            */
            slideBy: function (el, x, y, speed, callback, timingFunction) {

                var style = {};

                x = Util.coalesce(x, 0);
                y = Util.coalesce(y, 0);
                timingFunction = Util.coalesce(timingFunction, 'ease-out');

                style[this._transitionPrefix + 'Property'] = 'all';
                style[this._transitionPrefix + 'Delay'] = '0';

                if (speed === 0) {
                    style[this._transitionPrefix + 'Duration'] = '';
                    style[this._transitionPrefix + 'TimingFunction'] = '';
                }
                else {
                    style[this._transitionPrefix + 'Duration'] = speed + 'ms';
                    style[this._transitionPrefix + 'TimingFunction'] = Util.coalesce(timingFunction, 'ease-out');

                    Util.Events.add(el, this._transitionEndLabel, this._getTransitionEndHandler());

                }

                style[this._transformLabel] = (Util.Browser.is3dSupported) ? 'translate3d(' + x + 'px, ' + y + 'px, 0px)' : 'translate(' + x + 'px, ' + y + 'px)';

                if (!Util.isNothing(callback)) {
                    el.cclallcallback = callback;
                }

                Util.DOM.setStyle(el, style);

                if (speed === 0) {
                    window.setTimeout(function () {
                        this._leaveTransforms(el);
                    } .bind(this), this._applyTransitionDelay);
                }

            },



            /*
            * Function: 
            */
            resetTranslate: function (el) {

                var style = {};
                style[this._transformLabel] = style[this._transformLabel] = (Util.Browser.is3dSupported) ? 'translate3d(0px, 0px, 0px)' : 'translate(0px, 0px)';
                Util.DOM.setStyle(el, style);

            },



            /*
            * Function: _applyTransition
            */
            _applyTransition: function (el, property, val, speed, callback, timingFunction) {

                var style = {};

                timingFunction = Util.coalesce(timingFunction, 'ease-in');

                style[this._transitionPrefix + 'Property'] = property;
                style[this._transitionPrefix + 'Duration'] = speed + 'ms';
                style[this._transitionPrefix + 'TimingFunction'] = timingFunction;
                style[this._transitionPrefix + 'Delay'] = '0';

                Util.Events.add(el, this._transitionEndLabel, this._getTransitionEndHandler());

                Util.DOM.setStyle(el, style);

                if (!Util.isNothing(callback)) {
                    el['ccl' + property + 'callback'] = callback;
                }

                window.setTimeout(function () {
                    Util.DOM.setStyle(el, property, val);
                }, this._applyTransitionDelay);

            },



            /*
            * Function: _onTransitionEnd
            */
            _onTransitionEnd: function (e) {

                Util.Events.remove(e.currentTarget, this._transitionEndLabel, this._getTransitionEndHandler());
                this._leaveTransforms(e.currentTarget);

            },



            /*
            * Function: _leaveTransforms
            */
            _leaveTransforms: function (el) {

                var 
						property = el.style[this._transitionPrefix + 'Property'],
						callbackLabel = (property !== '') ? 'ccl' + property + 'callback' : 'cclallcallback',
						callback,
						transform = Util.coalesce(el.style.webkitTransform, el.style.MozTransform, el.style.transform),
						transformMatch,
						transformExploded,
						domX = window.parseInt(Util.DOM.getStyle(el, 'left'), 0),
						domY = window.parseInt(Util.DOM.getStyle(el, 'top'), 0),
						transformedX,
						transformedY,
						style = {};

                if (transform !== '') {
                    if (Util.Browser.is3dSupported) {
                        transformMatch = transform.match(/translate3d\((.*?)\)/);
                    }
                    else {
                        transformMatch = transform.match(/translate\((.*?)\)/);
                    }
                    if (!Util.isNothing(transformMatch)) {
                        transformExploded = transformMatch[1].split(', ');
                        transformedX = window.parseInt(transformExploded[0], 0);
                        transformedY = window.parseInt(transformExploded[1], 0);
                    }
                }

                style[this._transitionPrefix + 'Property'] = '';
                style[this._transitionPrefix + 'Duration'] = '';
                style[this._transitionPrefix + 'TimingFunction'] = '';
                style[this._transitionPrefix + 'Delay'] = '';

                Util.DOM.setStyle(el, style);

                window.setTimeout(function () {

                    if (!Util.isNothing(transformExploded)) {

                        style = {};
                        style[this._transformLabel] = '';
                        style.left = (domX + transformedX) + 'px';
                        style.top = (domY + transformedY) + 'px';

                        Util.DOM.setStyle(el, style);

                    }

                    if (!Util.isNothing(el[callbackLabel])) {
                        callback = el[callbackLabel];
                        delete el[callbackLabel];
                        callback(el);
                    }

                } .bind(this), this._applyTransitionDelay);

            }


        }


    });


}
(
	window,
	window.Code.Util
));
// Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.TouchElement');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.TouchElement.EventTypes = {

        onTouch: 'CodePhotoSwipeTouchElementOnTouch'

    };


    PhotoSwipe.TouchElement.ActionTypes = {

        touchStart: 'touchStart',
        touchMove: 'touchMove',
        touchEnd: 'touchEnd',
        tap: 'tap',
        doubleTap: 'doubleTap',
        swipeLeft: 'swipeLeft',
        swipeRight: 'swipeRight',
        swipeUp: 'swipeUp',
        swipeDown: 'swipeDown',
        gestureStart: 'gestureStart',
        gestureChange: 'gestureChange',
        gestureEnd: 'gestureEnd'

    };


}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.TouchElement');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.TouchElement.TouchElementClass = klass({



        el: null,
        touchSettings: null,
        touchStartPoint: null,
        touchEndPoint: null,
        touchStartTime: null,
        doubleTapTimeout: null,

        touchStartHandler: null,
        touchMoveHandler: null,
        touchEndHandler: null,

        mouseDownHandler: null,
        mouseMoveHandler: null,
        mouseUpHandler: null,
        mouseOutHandler: null,

        gestureStartHandler: null,
        gestureChangeHandler: null,
        gestureEndHandler: null,




        /*
        * Function: initialize
        */
        initialize: function (options) {

            this.touchSettings = {
                swipeThreshold: 50,
                swipeTimeThreshold: 250,
                doubleTapSpeed: 250
            };

            Util.extend(this.touchSettings, options);

            this.touchStartPoint = { x: 0, y: 0 };
            this.touchEndPoint = { x: 0, y: 0 };

        },



        /*
        * Function: addEventHandlers
        */
        addEventHandlers: function () {

            if (Util.isNothing(this.touchStartHandler)) {
                this.touchStartHandler = this.onTouchStart.bind(this);
                this.touchMoveHandler = this.onTouchMove.bind(this);
                this.touchEndHandler = this.onTouchEnd.bind(this);
                this.mouseDownHandler = this.onMouseDown.bind(this);
                this.mouseMoveHandler = this.onMouseMove.bind(this);
                this.mouseUpHandler = this.onMouseUp.bind(this);
                this.mouseOutHandler = this.onMouseOut.bind(this);
                this.gestureStartHandler = this.onGestureStart.bind(this);
                this.gestureChangeHandler = this.onGestureChange.bind(this);
                this.gestureEndHandler = this.onGestureEnd.bind(this);
            }

            Util.Events.add(this.el, 'touchstart', this.touchStartHandler);
            Util.Events.add(this.el, 'touchmove', this.touchMoveHandler);
            Util.Events.add(this.el, 'touchend', this.touchEndHandler);

            Util.Events.add(this.el, 'mousedown', this.mouseDownHandler);

            if (Util.Browser.isGestureSupported) {
                Util.Events.add(this.el, 'gesturestart', this.gestureStartHandler);
                Util.Events.add(this.el, 'gesturechange', this.gestureChangeHandler);
                Util.Events.add(this.el, 'gestureend', this.gestureEndHandler);
            }

        },



        /*
        * Function: removeEventHandlers
        */
        removeEventHandlers: function () {

            Util.Events.remove(this.el, 'touchstart', this.touchStartHandler);
            Util.Events.remove(this.el, 'touchmove', this.touchMoveHandler);
            Util.Events.remove(this.el, 'touchend', this.touchEndHandler);
            Util.Events.remove(this.el, 'mousedown', this.mouseDownHandler);

            if (Util.Browser.isGestureSupported) {
                Util.Events.remove(this.el, 'gesturestart', this.gestureStartHandler);
                Util.Events.remove(this.el, 'gesturechange', this.gestureChangeHandler);
                Util.Events.remove(this.el, 'gestureend', this.gestureEndHandler);
            }

        },



        /*
        * Function: getTouchPoint
        */
        getTouchPoint: function (touches) {

            return {
                x: touches[0].pageX,
                y: touches[0].pageY
            };

        },



        /*
        * Function: fireTouchEvent
        */
        fireTouchEvent: function () {

            var 
				action,
				distX = 0,
				distY = 0,
				dist = 0,
				self,
				endTime,
				diffTime;

            distX = this.touchEndPoint.x - this.touchStartPoint.x;
            distY = this.touchEndPoint.y - this.touchStartPoint.y;
            dist = Math.sqrt((distX * distX) + (distY * distY));

            endTime = new Date();
            diffTime = endTime - this.touchStartTime;

            // See if there was a swipe gesture
            if (diffTime <= this.touchSettings.swipeTimeThreshold) {

                if (window.Math.abs(distX) >= this.touchSettings.swipeThreshold) {

                    Util.Events.fire(this, {
                        type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                        target: this,
                        point: this.touchEndPoint,
                        action: (distX < 0) ? PhotoSwipe.TouchElement.ActionTypes.swipeLeft : PhotoSwipe.TouchElement.ActionTypes.swipeRight
                    });
                    return;

                }


                if (window.Math.abs(distY) >= this.touchSettings.swipeThreshold) {

                    Util.Events.fire(this, {
                        type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                        target: this,
                        point: this.touchEndPoint,
                        action: (distY < 0) ? PhotoSwipe.TouchElement.ActionTypes.swipeUp : PhotoSwipe.TouchElement.ActionTypes.swipeDown
                    });
                    return;

                }

            }


            if (dist > 1) {
                Util.Events.fire(this, {
                    type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                    target: this,
                    action: PhotoSwipe.TouchElement.ActionTypes.touchEnd,
                    point: this.touchEndPoint
                });
                return;
            }


            if (Util.isNothing(this.doubleTapTimeout)) {

                self = this;
                this.doubleTapTimeout = window.setTimeout(function () {

                    self.doubleTapTimeout = null;

                    Util.Events.fire(self, {
                        type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                        target: self,
                        point: this.touchEndPoint,
                        action: PhotoSwipe.TouchElement.ActionTypes.tap
                    });

                }, this.touchSettings.doubleTapSpeed);

                return;

            }
            else {

                window.clearTimeout(this.doubleTapTimeout);
                this.doubleTapTimeout = null;

                Util.Events.fire(this, {
                    type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                    target: this,
                    point: this.touchEndPoint,
                    action: PhotoSwipe.TouchElement.ActionTypes.doubleTap
                });

            }

        },



        /*
        * Function: onTouchStart
        */
        onTouchStart: function (e) {

            e.preventDefault();

            // No longer need mouse events
            Util.Events.remove(this.el, 'mousedown', this.mouseDownHandler);

            var 
				touchEvent = Util.Events.getTouchEvent(e),
				touches = touchEvent.touches;

            if (touches.length > 1) {
                this.isGesture = true;
                return;
            }

            this.touchStartTime = new Date();
            this.isGesture = false;
            this.touchStartPoint = this.getTouchPoint(touches);

            Util.Events.fire(this, {
                type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                target: this,
                action: PhotoSwipe.TouchElement.ActionTypes.touchStart,
                point: this.touchStartPoint
            });

        },



        /*
        * Function: onTouchMove
        */
        onTouchMove: function (e) {

            e.preventDefault();

            if (this.isGesture) {
                return;
            }

            var 
				touchEvent = Util.Events.getTouchEvent(e),
				touches = touchEvent.touches;

            Util.Events.fire(this, {
                type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                target: this,
                action: PhotoSwipe.TouchElement.ActionTypes.touchMove,
                point: this.getTouchPoint(touches)
            });

        },



        /*
        * Function: onTouchEnd
        */
        onTouchEnd: function (e) {

            if (this.isGesture) {
                return;
            }

            e.preventDefault();

            // http://backtothecode.blogspot.com/2009/10/javascript-touch-and-gesture-events.html
            // iOS removed the current touch from e.touches on "touchend"
            // Need to look into e.changedTouches

            var 
				touchEvent = Util.Events.getTouchEvent(e),
				touches = (!Util.isNothing(touchEvent.changedTouches)) ? touchEvent.changedTouches : touchEvent.touches;

            this.touchEndPoint = this.getTouchPoint(touches);

            this.fireTouchEvent();

        },



        /*
        * Function: onMouseDown
        */
        onMouseDown: function (e) {

            e.preventDefault();

            // No longer need touch events
            Util.Events.remove(this.el, 'touchstart', this.mouseDownHandler);
            Util.Events.remove(this.el, 'touchmove', this.touchMoveHandler);
            Util.Events.remove(this.el, 'touchend', this.touchEndHandler);

            // Add move/up/out
            Util.Events.add(this.el, 'mousemove', this.mouseMoveHandler);
            Util.Events.add(this.el, 'mouseup', this.mouseUpHandler);
            Util.Events.add(this.el, 'mouseout', this.mouseOutHandler);

            this.touchStartTime = new Date();
            this.isGesture = false;
            this.touchStartPoint = Util.Events.getMousePosition(e);

            Util.Events.fire(this, {
                type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                target: this,
                action: PhotoSwipe.TouchElement.ActionTypes.touchStart,
                point: this.touchStartPoint
            });

        },



        /*
        * Function: onMouseMove
        */
        onMouseMove: function (e) {

            e.preventDefault();

            Util.Events.fire(this, {
                type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                target: this,
                action: PhotoSwipe.TouchElement.ActionTypes.touchMove,
                point: Util.Events.getMousePosition(e)
            });

        },



        /*
        * Function: onMouseUp
        */
        onMouseUp: function (e) {

            e.preventDefault();

            Util.Events.remove(this.el, 'mousemove', this.mouseMoveHandler);
            Util.Events.remove(this.el, 'mouseup', this.mouseUpHandler);
            Util.Events.remove(this.el, 'mouseout', this.mouseOutHandler);

            this.touchEndPoint = Util.Events.getMousePosition(e);

            this.fireTouchEvent();

        },



        /*
        * Function: onMouseOut
        */
        onMouseOut: function (e) {

            e.preventDefault();

            Util.Events.remove(this.el, 'mousemove', this.mouseMoveHandler);
            Util.Events.remove(this.el, 'mouseup', this.mouseUpHandler);
            Util.Events.remove(this.el, 'mouseout', this.mouseOutHandler);

            this.touchEndPoint = Util.Events.getMousePosition(e);

            this.fireTouchEvent();

        },



        /*
        * Function: onGestureStart
        */
        onGestureStart: function (e) {

            e.preventDefault();

            var touchEvent = Util.Events.getTouchEvent(e);

            Util.Events.fire(this, {
                type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                target: this,
                action: PhotoSwipe.TouchElement.ActionTypes.gestureStart,
                scale: touchEvent.scale,
                rotation: touchEvent.rotation
            });

        },



        /*
        * Function: onGestureChange
        */
        onGestureChange: function (e) {

            e.preventDefault();

            var touchEvent = Util.Events.getTouchEvent(e);

            Util.Events.fire(this, {
                type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                target: this,
                action: PhotoSwipe.TouchElement.ActionTypes.gestureChange,
                scale: touchEvent.scale,
                rotation: touchEvent.rotation
            });

        },



        /*
        * Function: onGestureEnd
        */
        onGestureEnd: function (e) {

            e.preventDefault();

            var touchEvent = Util.Events.getTouchEvent(e);

            Util.Events.fire(this, {
                type: PhotoSwipe.TouchElement.EventTypes.onTouch,
                target: this,
                action: PhotoSwipe.TouchElement.ActionTypes.gestureEnd,
                scale: touchEvent.scale,
                rotation: touchEvent.rotation
            });

        }



    });



}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.Image');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.Image.EventTypes = {

        onLoad: 'onLoad'

    };



}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.Image');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.Image.ImageClass = klass({



        refObj: null,
        imageEl: null,
        src: null,
        caption: null,
        metaData: null,
        naturalWidth: null,
        naturalHeight: null,
        isLandscape: null,
        isLoading: null,
        imageLoadHandler: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop, i;

            this.shrinkImage();

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (refObj, src, caption, metaData) {

            this.refObj = refObj;
            this.src = src;
            this.caption = caption;
            this.metaData = metaData;
            this.naturalWidth = 0;
            this.naturalHeight = 0;
            this.isLandscape = false;
            this.isLoading = false;

            this.imageEl = new window.Image();

            this.imageLoadHandler = this.onImageLoad.bind(this);

        },



        /*
        * Function: load
        */
        load: function () {

            if (this.imageEl.src.indexOf(this.src) > -1) {
                Util.Events.fire(this, {
                    type: PhotoSwipe.Image.EventTypes.onLoad,
                    target: this
                });
                return;
            }

            this.imageEl.isLoading = true;
            this.imageEl.onload = this.imageLoadHandler;
            this.imageEl.src = this.src;

        },



        /*
        * Function: shrinkImage
        */
        shrinkImage: function () {

            if (Util.isNothing(this.imageEl)) {
                return;
            }

            if (this.imageEl.src.indexOf(this.src) > -1) {
                this.imageEl.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                if (!Util.isNothing(this.imageEl.parentNode)) {
                    Util.DOM.removeChild(this.imageEl, this.imageEl.parentNode);
                }
            }

        },



        /*
        * Function: onImageLoad
        */
        onImageLoad: function (e) {

            this.imageEl.onload = null;
            this.imageEl.naturalWidth = Util.coalesce(this.imageEl.naturalWidth, this.imageEl.width);
            this.imageEl.naturalHeight = Util.coalesce(this.imageEl.naturalHeight, this.imageEl.height);
            this.imageEl.isLandscape = (this.imageEl.naturalWidth > this.imageEl.naturalHeight);
            this.imageEl.isLoading = false;

            Util.Events.fire(this, {
                type: PhotoSwipe.Image.EventTypes.onLoad,
                target: this
            });

        }



    });



}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.Cache');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.Cache.Mode = {

        normal: 'normal',
        aggressive: 'aggressive'

    };



    PhotoSwipe.Cache.Functions = {

        /*
        * Function: getImageSource
        * Default method for returning an image's source
        */
        getImageSource: function (el) {
            return el.href;
        },



        /*
        * Function: getImageCaption
        * Default method for returning an image's caption
        * Assumes the el is an anchor and the first child is the
        * image. The returned value is the "alt" attribute of the
        * image.
        */
        getImageCaption: function (el) {

            if (el.nodeName === "IMG") {
                return Util.DOM.getAttribute(el, 'alt');
            }
            var i, childEl;
            for (i = 0; i < el.childNodes.length; i++) {
                childEl = el.childNodes[i];
                if (el.childNodes[i].nodeName === 'IMG') {
                    return Util.DOM.getAttribute(childEl, 'alt');
                }
            }
        },



        /*
        * Function: getImageMetaData
        * Can be used if you wish to store additional meta
        * data against the full size image
        */
        getImageMetaData: function (el) {

            return {};

        }

    };




}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util, Image) {


    Util.registerNamespace('Code.PhotoSwipe.Cache');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.Cache.CacheClass = klass({



        images: null,
        settings: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop, i;

            if (!Util.isNothing(this.images)) {
                for (i = 0; i < this.images.length; i++) {
                    this.images[i].dispose();
                }
                this.images.length = 0;
            }

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (images, options) {

            var i, cacheImage, image, src, caption, metaData;

            this.settings = options;

            this.images = [];

            for (i = 0; i < images.length; i++) {

                image = images[i];
                src = this.settings.getImageSource(image);
                caption = this.settings.getImageCaption(image);
                metaData = this.settings.getImageMetaData(image);

                this.images.push(new Image.ImageClass(image, src, caption, metaData));

            }


        },



        /*
        * Function: getImages
        */
        getImages: function (indexes) {

            var i, retval = [], cacheImage;

            for (i = 0; i < indexes.length; i++) {
                cacheImage = this.images[indexes[i]];
                if (this.settings.cacheMode === PhotoSwipe.Cache.Mode.aggressive) {
                    cacheImage.cacheDoNotShrink = true;
                }
                retval.push(cacheImage);
            }

            if (this.settings.cacheMode === PhotoSwipe.Cache.Mode.aggressive) {
                for (i = 0; i < this.images.length; i++) {
                    cacheImage = this.images[i];
                    if (!Util.objectHasProperty(cacheImage, 'cacheDoNotShrink')) {
                        cacheImage.shrinkImage();
                    }
                    else {
                        delete cacheImage.cacheDoNotShrink;
                    }
                }
            }

            return retval;

        }


    });



}
(
	window,
	window.klass,
	window.Code.Util,
	window.Code.PhotoSwipe.Image
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.DocumentOverlay');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.DocumentOverlay.CssClasses = {
        documentOverlay: 'ps-document-overlay'
    };



}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.DocumentOverlay');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.DocumentOverlay.DocumentOverlayClass = klass({



        el: null,
        settings: null,
        initialBodyHeight: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop;

            Util.Animation.stop(this.el);
            Util.DOM.removeChild(this.el, this.el.parentNode);

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (options) {

            this.settings = options;

            this.el = Util.DOM.createElement(
				'div',
				{
				    'class': PhotoSwipe.DocumentOverlay.CssClasses.documentOverlay
				},
				''
			);
            Util.DOM.setStyle(this.el, {
                display: 'block',
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: this.settings.zIndex
            });

            Util.DOM.hide(this.el);
            Util.DOM.appendToBody(this.el);

            Util.Animation.resetTranslate(this.el);

            // Store this value incase the body dimensions change to zero!
            // I've seen it happen! :D
            this.initialBodyHeight = Util.DOM.bodyOuterHeight();


        },



        /*
        * Function: resetPosition
        */
        resetPosition: function () {

            var 
				width = Util.DOM.windowWidth(),
				height = Util.DOM.bodyOuterHeight() * 2; // This covers extra height added by photoswipe

            if (height < 1) {
                height = this.initialBodyHeight;
            }


            if (Util.DOM.windowHeight() > height) {
                height = Util.DOM.windowHeight();
            }

            Util.DOM.setStyle(this.el, {
                width: width,
                height: height,
                top: (this.settings.jQueryMobile) ? Util.DOM.windowScrollTop() + 'px' : '0px'
            });

        },



        /*
        * Function: fadeIn
        */
        fadeIn: function (speed, callback) {

            this.resetPosition();

            Util.DOM.setStyle(this.el, 'opacity', 0);
            Util.DOM.show(this.el);

            Util.Animation.fadeIn(this.el, speed, callback);

        }


    });



}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.Carousel');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.Carousel.EventTypes = {

        onSlideByEnd: 'PhotoSwipeCarouselOnSlideByEnd',
        onSlideshowStart: 'PhotoSwipeCarouselOnSlideshowStart',
        onSlideshowStop: 'PhotoSwipeCarouselOnSlideshowStop'

    };



    PhotoSwipe.Carousel.CssClasses = {
        carousel: 'ps-carousel',
        content: 'ps-carousel-content',
        item: 'ps-carousel-item',
        itemLoading: 'ps-carousel-item-loading'
    };



    PhotoSwipe.Carousel.SlideByAction = {
        previous: 'previous',
        current: 'current',
        next: 'next'
    };


}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.Carousel');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.Carousel.CarouselClass = klass({



        el: null,
        contentEl: null,
        settings: null,
        cache: null,
        slideByEndHandler: null,
        currentCacheIndex: null,
        isSliding: null,
        isSlideshowActive: null,
        lastSlideByAction: null,
        touchStartPoint: null,
        touchStartPosition: null,
        imageLoadHandler: null,
        slideshowTimeout: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop;

            this.stopSlideshow();
            Util.Animation.stop(this.el);
            Util.DOM.removeChild(this.el, this.el.parentNode);

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (cache, options) {

            //this.supr(true);

            var i, totalItems, itemEl;

            this.cache = cache;
            this.settings = options;
            this.slideByEndHandler = this.onSlideByEnd.bind(this);
            this.imageLoadHandler = this.onImageLoad.bind(this);
            this.currentCacheIndex = 0;
            this.isSliding = false;
            this.isSlideshowActive = false;

            // No looping if < 3 images
            if (this.cache.images.length < 3) {
                this.settings.loop = false;
            }

            // Main container 
            this.el = Util.DOM.createElement(
				'div',
				{
				    'class': PhotoSwipe.Carousel.CssClasses.carousel
				},
				''
			);
            Util.DOM.setStyle(this.el, {
                display: 'block',
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'hidden',
                zIndex: this.settings.zIndex
            });
            Util.DOM.hide(this.el);


            // Content
            this.contentEl = Util.DOM.createElement(
				'div',
				{
				    'class': PhotoSwipe.Carousel.CssClasses.content
				},
				''
			);
            Util.DOM.setStyle(this.contentEl, {
                display: 'block',
                position: 'absolute',
                left: 0,
                top: 0
            });

            Util.DOM.appendChild(this.contentEl, this.el);


            // Items
            totalItems = (cache.images.length < 3) ? cache.images.length : 3;

            for (i = 0; i < totalItems; i++) {

                itemEl = Util.DOM.createElement(
					'div',
					{
					    'class': PhotoSwipe.Carousel.CssClasses.item +
						' ' + PhotoSwipe.Carousel.CssClasses.item + '-' + i
					},
					''
				);
                Util.DOM.setAttribute(itemEl, 'style', 'float: left;');
                Util.DOM.setStyle(itemEl, {
                    display: 'block',
                    position: 'relative',
                    left: 0,
                    top: 0,
                    overflow: 'hidden'
                });

                if (this.settings.margin > 0) {
                    Util.DOM.setStyle(itemEl, {
                        marginRight: this.settings.margin + 'px'
                    });
                }

                Util.DOM.appendChild(itemEl, this.contentEl);

            }


            Util.DOM.appendToBody(this.el);

        },




        /*
        * Function: resetPosition
        */
        resetPosition: function () {

            var 
				width = Util.DOM.windowWidth(),
				height = Util.DOM.windowHeight(),
				itemWidth = (this.settings.margin > 0) ? width + this.settings.margin : width,
				itemEls = Util.DOM.find('.' + PhotoSwipe.Carousel.CssClasses.item, this.contentEl),
				contentWidth = itemWidth * itemEls.length,
				i,
				itemEl, imageEl;


            // Set the height and width to fill the document
            Util.DOM.setStyle(this.el, {
                top: Util.DOM.windowScrollTop() + 'px',
                width: width,
                height: height
            });


            // Set the height and width of the content el
            Util.DOM.setStyle(this.contentEl, {
                width: contentWidth,
                height: height
            });


            // Set the height and width of item elements
            for (i = 0; i < itemEls.length; i++) {

                itemEl = itemEls[i];
                Util.DOM.setStyle(itemEl, {
                    width: width,
                    height: height
                });

                // If an item has an image then resize that
                imageEl = Util.DOM.find('img', itemEl)[0];
                if (!Util.isNothing(imageEl)) {
                    this.resetImagePosition(imageEl);
                }

            }

            this.setContentLeftPosition();


        },



        /*
        * Function: resetImagePosition
        */
        resetImagePosition: function (imageEl) {

            if (Util.isNothing(imageEl)) {
                return;
            }

            var 
				src = Util.DOM.getAttribute(imageEl, 'src'),
				scale,
				newWidth,
				newHeight,
				newTop,
				newLeft,
				maxWidth = Util.DOM.width(this.el),
				maxHeight = Util.DOM.height(this.el);

            if (this.settings.imageScaleMethod === 'fitNoUpscale') {

                newWidth = imageEl.naturalWidth;
                newHeight = imageEl.naturalHeight;

                if (newWidth > maxWidth) {
                    scale = maxWidth / newWidth;
                    newWidth = Math.round(newWidth * scale);
                    newHeight = Math.round(newHeight * scale);
                }

                if (newHeight > maxHeight) {
                    scale = maxHeight / newHeight;
                    newHeight = Math.round(newHeight * scale);
                    newWidth = Math.round(newWidth * scale);
                }

            }
            else {

                if (imageEl.isLandscape) {
                    // Ensure the width fits the screen
                    scale = maxWidth / imageEl.naturalWidth;
                }
                else {
                    // Ensure the height fits the screen
                    scale = maxHeight / imageEl.naturalHeight;
                }

                newWidth = Math.round(imageEl.naturalWidth * scale);
                newHeight = Math.round(imageEl.naturalHeight * scale);

                if (this.settings.imageScaleMethod === 'zoom') {

                    scale = 1;
                    if (newHeight < maxHeight) {
                        scale = maxHeight / newHeight;
                    }
                    else if (newWidth < maxWidth) {
                        scale = maxWidth / newWidth;
                    }

                    if (scale !== 1) {
                        newWidth = Math.round(newWidth * scale);
                        newHeight = Math.round(newHeight * scale);
                    }

                }
                else if (this.settings.imageScaleMethod === 'fit') {
                    // Rescale again to ensure full image fits into the viewport
                    scale = 1;
                    if (newWidth > maxWidth) {
                        scale = maxWidth / newWidth;
                    }
                    else if (newHeight > maxHeight) {
                        scale = maxHeight / newHeight;
                    }
                    if (scale !== 1) {
                        newWidth = Math.round(newWidth * scale);
                        newHeight = Math.round(newHeight * scale);
                    }
                }

            }

            newTop = Math.round(((maxHeight - newHeight) / 2)) + 'px';
            newLeft = Math.round(((maxWidth - newWidth) / 2)) + 'px';

            Util.DOM.setStyle(imageEl, {
                position: 'absolute',
                width: newWidth,
                height: newHeight,
                top: newTop,
                left: newLeft,
                display: 'block'
            });

        },



        /*
        * Function: setContentLeftPosition
        */
        setContentLeftPosition: function () {

            var 
				width = Util.DOM.windowWidth(),
				itemEls = this.getItemEls(),
				left = 0;

            if (this.settings.loop) {
                left = (width + this.settings.margin) * -1;
            }
            else {

                if (this.currentCacheIndex === this.cache.images.length - 1) {
                    left = ((itemEls.length - 1) * (width + this.settings.margin)) * -1;
                }
                else if (this.currentCacheIndex > 0) {
                    left = (width + this.settings.margin) * -1;
                }

            }

            Util.DOM.setStyle(this.contentEl, {
                left: left + 'px'
            });

        },



        /*
        * Function: 
        */
        show: function (index) {

            this.currentCacheIndex = index;
            this.resetPosition();
            this.setImages(false);
            Util.DOM.show(this.el);

            Util.Animation.resetTranslate(this.contentEl);
            var 
				itemEls = this.getItemEls(),
				i;
            for (i = 0; i < itemEls.length; i++) {
                Util.Animation.resetTranslate(itemEls[i]);
            }

            Util.Events.fire(this, {
                type: PhotoSwipe.Carousel.EventTypes.onSlideByEnd,
                target: this,
                action: PhotoSwipe.Carousel.SlideByAction.current,
                cacheIndex: this.currentCacheIndex
            });

        },



        /*
        * Function: setImages
        */
        setImages: function (ignoreCurrent) {

            var 
				cacheImages,
				itemEls = this.getItemEls(),
				nextCacheIndex = this.currentCacheIndex + 1,
				previousCacheIndex = this.currentCacheIndex - 1;

            if (this.settings.loop) {

                if (nextCacheIndex > this.cache.images.length - 1) {
                    nextCacheIndex = 0;
                }
                if (previousCacheIndex < 0) {
                    previousCacheIndex = this.cache.images.length - 1;
                }

                cacheImages = this.cache.getImages([
					previousCacheIndex,
					this.currentCacheIndex,
					nextCacheIndex
				]);

                if (!ignoreCurrent) {
                    // Current
                    this.addCacheImageToItemEl(cacheImages[1], itemEls[1]);
                }
                // Next
                this.addCacheImageToItemEl(cacheImages[2], itemEls[2]);
                // Previous
                this.addCacheImageToItemEl(cacheImages[0], itemEls[0]);

            }
            else {

                if (itemEls.length === 1) {
                    if (!ignoreCurrent) {
                        // Current
                        cacheImages = this.cache.getImages([
							this.currentCacheIndex
						]);
                        this.addCacheImageToItemEl(cacheImages[0], itemEls[0]);
                    }
                }
                else if (itemEls.length === 2) {

                    if (this.currentCacheIndex === 0) {
                        cacheImages = this.cache.getImages([
							this.currentCacheIndex,
							this.currentCacheIndex + 1
						]);
                        if (!ignoreCurrent) {
                            this.addCacheImageToItemEl(cacheImages[0], itemEls[0]);
                        }
                        this.addCacheImageToItemEl(cacheImages[1], itemEls[1]);
                    }
                    else {
                        cacheImages = this.cache.getImages([
							this.currentCacheIndex - 1,
							this.currentCacheIndex
						]);
                        if (!ignoreCurrent) {
                            this.addCacheImageToItemEl(cacheImages[1], itemEls[1]);
                        }
                        this.addCacheImageToItemEl(cacheImages[0], itemEls[0]);
                    }

                }
                else {

                    if (this.currentCacheIndex === 0) {
                        cacheImages = this.cache.getImages([
							this.currentCacheIndex,
							this.currentCacheIndex + 1,
							this.currentCacheIndex + 2
						]);
                        if (!ignoreCurrent) {
                            this.addCacheImageToItemEl(cacheImages[0], itemEls[0]);
                        }
                        this.addCacheImageToItemEl(cacheImages[1], itemEls[1]);
                        this.addCacheImageToItemEl(cacheImages[2], itemEls[2]);
                    }
                    else if (this.currentCacheIndex === this.cache.images.length - 1) {
                        cacheImages = this.cache.getImages([
							this.currentCacheIndex - 2,
							this.currentCacheIndex - 1,
							this.currentCacheIndex
						]);
                        if (!ignoreCurrent) {
                            // Current
                            this.addCacheImageToItemEl(cacheImages[2], itemEls[2]);
                        }
                        this.addCacheImageToItemEl(cacheImages[1], itemEls[1]);
                        this.addCacheImageToItemEl(cacheImages[0], itemEls[0]);
                    }
                    else {
                        cacheImages = this.cache.getImages([
							this.currentCacheIndex - 1,
							this.currentCacheIndex,
							this.currentCacheIndex + 1
						]);

                        if (!ignoreCurrent) {
                            // Current
                            this.addCacheImageToItemEl(cacheImages[1], itemEls[1]);
                        }
                        // Next
                        this.addCacheImageToItemEl(cacheImages[2], itemEls[2]);
                        // Previous
                        this.addCacheImageToItemEl(cacheImages[0], itemEls[0]);
                    }

                }

            }

        },



        /*
        * Function: addCacheImageToItemEl
        */
        addCacheImageToItemEl: function (cacheImage, itemEl) {

            Util.DOM.addClass(itemEl, PhotoSwipe.Carousel.CssClasses.itemLoading);

            Util.DOM.removeChildren(itemEl);

            Util.DOM.setStyle(cacheImage.imageEl, {
                display: 'none'
            });
            Util.DOM.appendChild(cacheImage.imageEl, itemEl);

            Util.Animation.resetTranslate(cacheImage.imageEl);

            Util.Events.add(cacheImage, PhotoSwipe.Image.EventTypes.onLoad, this.imageLoadHandler);

            cacheImage.load();

        },



        /*
        * Function: slideCarousel
        */
        slideCarousel: function (point, action, speed) {

            if (this.isSliding) {
                return;
            }

            var 
				width = Util.DOM.windowWidth() + this.settings.margin,
				diffX,
				slideBy;

            speed = Util.coalesce(speed, this.settings.slideSpeed);

            if (window.Math.abs(diffX) < 1) {
                return;
            }


            switch (action) {

                case PhotoSwipe.TouchElement.ActionTypes.swipeLeft:

                    slideBy = width * -1;
                    break;

                case PhotoSwipe.TouchElement.ActionTypes.swipeRight:

                    slideBy = width;
                    break;

                default:

                    diffX = point.x - this.touchStartPoint.x;

                    if (window.Math.abs(diffX) > width / 2) {
                        slideBy = (diffX > 0) ? width : width * -1;
                    }
                    else {
                        slideBy = 0;
                    }
                    break;

            }

            if (slideBy < 0) {
                this.lastSlideByAction = PhotoSwipe.Carousel.SlideByAction.next;
            }
            else if (slideBy > 0) {
                this.lastSlideByAction = PhotoSwipe.Carousel.SlideByAction.previous;
            }
            else {
                this.lastSlideByAction = PhotoSwipe.Carousel.SlideByAction.current;
            }

            // Check for non-looping carousels
            // If we are at the start or end, spring back to the current item element
            if (!this.settings.loop) {
                if ((this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.previous && this.currentCacheIndex === 0) || (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.next && this.currentCacheIndex === this.cache.images.length - 1)) {
                    slideBy = 0;
                    this.lastSlideByAction = PhotoSwipe.Carousel.SlideByAction.current;
                }
            }

            this.isSliding = true;
            this.doSlideCarousel(slideBy, speed);

        },



        /*
        * Function: 
        */
        moveCarousel: function (point) {

            if (this.isSliding) {
                return;
            }

            if (!this.settings.enableDrag) {
                return;
            }

            this.doMoveCarousel(point.x - this.touchStartPoint.x);

        },



        /*
        * Function: getItemEls
        */
        getItemEls: function () {

            return Util.DOM.find('.' + PhotoSwipe.Carousel.CssClasses.item, this.contentEl);

        },



        /*
        * Function: previous
        */
        previous: function () {

            this.stopSlideshow();
            this.slideCarousel({ x: 0, y: 0 }, PhotoSwipe.TouchElement.ActionTypes.swipeRight, this.settings.nextPreviousSlideSpeed);

        },



        /*
        * Function: next
        */
        next: function () {

            this.stopSlideshow();
            this.slideCarousel({ x: 0, y: 0 }, PhotoSwipe.TouchElement.ActionTypes.swipeLeft, this.settings.nextPreviousSlideSpeed);

        },



        /*
        * Function: slideshowNext
        */
        slideshowNext: function () {

            this.slideCarousel({ x: 0, y: 0 }, PhotoSwipe.TouchElement.ActionTypes.swipeLeft);

        },




        /*
        * Function: startSlideshow
        */
        startSlideshow: function () {

            this.stopSlideshow();

            this.isSlideshowActive = true;

            this.slideshowTimeout = window.setTimeout(this.slideshowNext.bind(this), this.settings.slideshowDelay);

            Util.Events.fire(this, {
                type: PhotoSwipe.Carousel.EventTypes.onSlideshowStart,
                target: this
            });

        },



        /*
        * Function: stopSlideshow
        */
        stopSlideshow: function () {

            if (!Util.isNothing(this.slideshowTimeout)) {

                window.clearTimeout(this.slideshowTimeout);
                this.slideshowTimeout = null;
                this.isSlideshowActive = false;

                Util.Events.fire(this, {
                    type: PhotoSwipe.Carousel.EventTypes.onSlideshowStop,
                    target: this
                });

            }

        },



        /*
        * Function: onSlideByEnd
        */
        onSlideByEnd: function (e) {

            if (Util.isNothing(this.isSliding)) {
                return;
            }

            var itemEls = this.getItemEls();

            this.isSliding = false;

            if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.next) {
                this.currentCacheIndex = this.currentCacheIndex + 1;
            }
            else if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.previous) {
                this.currentCacheIndex = this.currentCacheIndex - 1;
            }

            if (this.settings.loop) {

                if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.next) {
                    // Move first to the last
                    Util.DOM.appendChild(itemEls[0], this.contentEl);
                }
                else if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.previous) {
                    // Move the last to the first
                    Util.DOM.insertBefore(itemEls[itemEls.length - 1], itemEls[0], this.contentEl);
                }

                if (this.currentCacheIndex < 0) {
                    this.currentCacheIndex = this.cache.images.length - 1;
                }
                else if (this.currentCacheIndex === this.cache.images.length) {
                    this.currentCacheIndex = 0;
                }

            }
            else {

                if (this.cache.images.length > 3) {

                    if (this.currentCacheIndex > 1 && this.currentCacheIndex < this.cache.images.length - 2) {
                        if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.next) {
                            // Move first to the last
                            Util.DOM.appendChild(itemEls[0], this.contentEl);
                        }
                        else if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.previous) {
                            // Move the last to the first
                            Util.DOM.insertBefore(itemEls[itemEls.length - 1], itemEls[0], this.contentEl);
                        }
                    }
                    else if (this.currentCacheIndex === 1) {
                        if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.previous) {
                            // Move the last to the first
                            Util.DOM.insertBefore(itemEls[itemEls.length - 1], itemEls[0], this.contentEl);
                        }
                    }
                    else if (this.currentCacheIndex === this.cache.images.length - 2) {
                        if (this.lastSlideByAction === PhotoSwipe.Carousel.SlideByAction.next) {
                            // Move first to the last
                            Util.DOM.appendChild(itemEls[0], this.contentEl);
                        }
                    }

                }


            }

            if (this.lastSlideByAction !== PhotoSwipe.Carousel.SlideByAction.current) {
                this.setContentLeftPosition();
                this.setImages(true);
            }


            Util.Events.fire(this, {
                type: PhotoSwipe.Carousel.EventTypes.onSlideByEnd,
                target: this,
                action: this.lastSlideByAction,
                cacheIndex: this.currentCacheIndex
            });


            if (this.isSlideshowActive) {

                if (this.lastSlideByAction !== PhotoSwipe.Carousel.SlideByAction.current) {
                    this.startSlideshow();
                }
                else {
                    this.stopSlideshow();
                }

            }


        },



        /*
        * Function: onTouch
        */
        onTouch: function (action, point) {

            this.stopSlideshow();

            switch (action) {

                case PhotoSwipe.TouchElement.ActionTypes.touchStart:
                    this.touchStartPoint = point;
                    this.touchStartPosition = {
                        x: window.parseInt(Util.DOM.getStyle(this.contentEl, 'left'), 0),
                        y: window.parseInt(Util.DOM.getStyle(this.contentEl, 'top'), 0)
                    };
                    break;

                case PhotoSwipe.TouchElement.ActionTypes.touchMove:
                    this.moveCarousel(point);
                    break;

                case PhotoSwipe.TouchElement.ActionTypes.touchEnd:
                case PhotoSwipe.TouchElement.ActionTypes.swipeLeft:
                case PhotoSwipe.TouchElement.ActionTypes.swipeRight:
                    this.slideCarousel(point, action);
                    break;

                case PhotoSwipe.TouchElement.ActionTypes.tap:
                    break;

                case PhotoSwipe.TouchElement.ActionTypes.doubleTap:
                    break;


            }

        },



        /*
        * Function: onImageLoad
        */
        onImageLoad: function (e) {

            var cacheImage = e.target;

            if (!Util.isNothing(cacheImage.imageEl.parentNode)) {
                Util.DOM.removeClass(cacheImage.imageEl.parentNode, PhotoSwipe.Carousel.CssClasses.itemLoading);
                Util.Events.remove(cacheImage, PhotoSwipe.Image.EventTypes.onLoad, this.imageLoadHandler);
                this.resetImagePosition(cacheImage.imageEl);
            }

        }



    });



}
(
	window,
	window.klass,
	window.Code.Util,
	window.Code.PhotoSwipe.TouchElement
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util, TouchElement) {


    Util.registerNamespace('Code.PhotoSwipe.Carousel');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.Carousel.CarouselClass = PhotoSwipe.Carousel.CarouselClass.extend({


        /*
        * Function: getStartingPos
        */
        getStartingPos: function () {

            var startingPos = this.touchStartPosition;

            if (Util.isNothing(startingPos)) {
                startingPos = {
                    x: window.parseInt(Util.DOM.getStyle(this.contentEl, 'left'), 0),
                    y: window.parseInt(Util.DOM.getStyle(this.contentEl, 'top'), 0)
                };
            }

            return startingPos;

        },



        /*
        * Function: doMoveCarousel
        */
        doMoveCarousel: function (xVal) {

            var style;

            if (Util.Browser.isCSSTransformSupported) {

                style = {};

                style[Util.Animation._transitionPrefix + 'Property'] = 'all';
                style[Util.Animation._transitionPrefix + 'Duration'] = '';
                style[Util.Animation._transitionPrefix + 'TimingFunction'] = '';
                style[Util.Animation._transitionPrefix + 'Delay'] = '0';
                style[Util.Animation._transformLabel] = (Util.Browser.is3dSupported) ? 'translate3d(' + xVal + 'px, 0px, 0px)' : 'translate(' + xVal + 'px, 0px)';

                Util.DOM.setStyle(this.contentEl, style);

            }
            else if (!Util.isNothing(window.jQuery)) {


                window.jQuery(this.contentEl).stop().css('left', this.getStartingPos().x + xVal + 'px');

            }

        },



        /*
        * Function: doSlideCarousel
        */
        doSlideCarousel: function (xVal, speed) {

            var animateProps;

            if (speed <= 0) {

                this.slideByEndHandler();
                return;

            }


            if (Util.Browser.isCSSTransformSupported) {

                Util.Animation.slideBy(this.contentEl, xVal, 0, speed, this.slideByEndHandler, this.settings.slideTimingFunction);

            }
            else if (!Util.isNothing(window.jQuery)) {

                animateProps = {
                    left: this.getStartingPos().x + xVal + 'px'
                };

                if (this.settings.animationTimingFunction === 'ease-out') {
                    this.settings.animationTimingFunction = 'easeOutQuad';
                }

                if (Util.isNothing(window.jQuery.easing[this.settings.animationTimingFunction])) {
                    this.settings.animationTimingFunction = 'linear';
                }

                window.jQuery(this.contentEl).animate(
					animateProps,
					this.settings.slideSpeed,
					this.settings.animationTimingFunction,
					this.slideByEndHandler
				);

            }


        }

    });



}
(
	window,
	window.klass,
	window.Code.Util,
	window.Code.PhotoSwipe.TouchElement
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.Toolbar');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.Toolbar.CssClasses = {
        toolbar: 'ps-toolbar',
        toolbarContent: 'ps-toolbar-content',
        toolbarTop: 'ps-toolbar-top',
        caption: 'ps-caption',
        captionBottom: 'ps-caption-bottom',
        captionContent: 'ps-caption-content',
        close: 'ps-toolbar-close',
        play: 'ps-toolbar-play',
        previous: 'ps-toolbar-previous',
        previousDisabled: 'ps-toolbar-previous-disabled',
        next: 'ps-toolbar-next',
        nextDisabled: 'ps-toolbar-next-disabled'
    };



    PhotoSwipe.Toolbar.ToolbarAction = {
        close: 'close',
        play: 'play',
        next: 'next',
        previous: 'previous',
        none: 'none'
    };



    PhotoSwipe.Toolbar.EventTypes = {
        onTap: 'PhotoSwipeToolbarOnClick',
        onBeforeShow: 'PhotoSwipeToolbarOnBeforeShow',
        onShow: 'PhotoSwipeToolbarOnShow',
        onBeforeHide: 'PhotoSwipeToolbarOnBeforeHide',
        onHide: 'PhotoSwipeToolbarOnHide'
    };



    PhotoSwipe.Toolbar.getToolbar = function () {

        return '<div class="' + PhotoSwipe.Toolbar.CssClasses.close + '"><div class="' + PhotoSwipe.Toolbar.CssClasses.toolbarContent + '"></div></div><div class="' + PhotoSwipe.Toolbar.CssClasses.play + '"><div class="' + PhotoSwipe.Toolbar.CssClasses.toolbarContent + '"></div></div><div class="' + PhotoSwipe.Toolbar.CssClasses.previous + '"><div class="' + PhotoSwipe.Toolbar.CssClasses.toolbarContent + '"></div></div><div class="' + PhotoSwipe.Toolbar.CssClasses.next + '"><div class="' + PhotoSwipe.Toolbar.CssClasses.toolbarContent + '"></div></div>';

    };

}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.Toolbar');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.Toolbar.ToolbarClass = klass({



        toolbarEl: null,
        closeEl: null,
        playEl: null,
        previousEl: null,
        nextEl: null,
        captionEl: null,
        captionContentEl: null,
        currentCaption: null,
        settings: null,
        cache: null,
        timeout: null,
        isVisible: null,
        fadeOutHandler: null,
        touchStartHandler: null,
        touchMoveHandler: null,
        clickHandler: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop;

            this.clearTimeout();

            this.removeEventHandlers();

            Util.Animation.stop(this.toolbarEl);
            Util.Animation.stop(this.captionEl);

            Util.DOM.removeChild(this.toolbarEl, this.toolbarEl.parentNode);
            Util.DOM.removeChild(this.captionEl, this.captionEl.parentNode);

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (cache, options) {

            var cssClass;

            this.settings = options;
            this.cache = cache;
            this.isVisible = false;

            this.fadeOutHandler = this.onFadeOut.bind(this);
            this.touchStartHandler = this.onTouchStart.bind(this);
            this.touchMoveHandler = this.onTouchMove.bind(this);
            this.clickHandler = this.onClick.bind(this);


            cssClass = PhotoSwipe.Toolbar.CssClasses.toolbar;
            if (this.settings.captionAndToolbarFlipPosition) {
                cssClass = cssClass + ' ' + PhotoSwipe.Toolbar.CssClasses.toolbarTop;
            }


            // Toolbar
            this.toolbarEl = Util.DOM.createElement(
				'div',
				{
				    'class': cssClass
				},
				this.settings.getToolbar()
			);


            Util.DOM.setStyle(this.toolbarEl, {
                left: 0,
                position: 'absolute',
                overflow: 'hidden',
                zIndex: this.settings.zIndex
            });
            Util.DOM.appendToBody(this.toolbarEl);
            Util.DOM.hide(this.toolbarEl);

            this.closeEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.close, this.toolbarEl)[0];
            if (this.settings.preventHide && !Util.isNothing(this.closeEl)) {
                Util.DOM.hide(this.closeEl);
            }

            this.playEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.play, this.toolbarEl)[0];
            if (this.settings.preventSlideshow && !Util.isNothing(this.playEl)) {
                Util.DOM.hide(this.playEl);
            }

            this.nextEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.next, this.toolbarEl)[0];
            this.previousEl = Util.DOM.find('.' + PhotoSwipe.Toolbar.CssClasses.previous, this.toolbarEl)[0];


            // Caption
            cssClass = PhotoSwipe.Toolbar.CssClasses.caption;
            if (this.settings.captionAndToolbarFlipPosition) {
                cssClass = cssClass + ' ' + PhotoSwipe.Toolbar.CssClasses.captionBottom;
            }

            this.captionEl = Util.DOM.createElement(
				'div',
				{
				    'class': cssClass
				},
				''
			);
            Util.DOM.setStyle(this.captionEl, {
                left: 0,
                position: 'absolute',
                overflow: 'hidden',
                zIndex: this.settings.zIndex
            });
            Util.DOM.appendToBody(this.captionEl);
            Util.DOM.hide(this.captionEl);

            this.captionContentEl = Util.DOM.createElement(
				'div',
				{
				    'class': PhotoSwipe.Toolbar.CssClasses.captionContent
				},
				''
			);
            Util.DOM.appendChild(this.captionContentEl, this.captionEl);

            this.addEventHandlers();

        },



        /*
        * Function: resetPosition
        */
        resetPosition: function () {

            var toolbarTop, captionTop;

            if (this.settings.captionAndToolbarFlipPosition) {
                toolbarTop = Util.DOM.windowScrollTop();
                captionTop = (Util.DOM.windowScrollTop() + Util.DOM.windowHeight()) - Util.DOM.height(this.captionEl);
            }
            else {
                toolbarTop = (Util.DOM.windowScrollTop() + Util.DOM.windowHeight()) - Util.DOM.height(this.toolbarEl);
                captionTop = Util.DOM.windowScrollTop();
            }

            Util.DOM.setStyle(this.toolbarEl, {
                top: toolbarTop + 'px',
                width: Util.DOM.windowWidth()
            });

            Util.DOM.setStyle(this.captionEl, {
                top: captionTop + 'px',
                width: Util.DOM.windowWidth()
            });
        },



        /*
        * Function: toggleVisibility
        */
        toggleVisibility: function (index) {

            if (this.isVisible) {
                this.fadeOut();
            }
            else {
                this.show(index);
            }

        },



        /*
        * Function: show
        */
        show: function (index) {

            Util.Animation.stop(this.toolbarEl);
            Util.Animation.stop(this.captionEl);

            this.resetPosition();
            this.setToolbarStatus(index);

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onBeforeShow,
                target: this
            });

            this.showToolbar();
            this.setCaption(index);
            this.showCaption();

            this.isVisible = true;

            this.setTimeout();

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onShow,
                target: this
            });

        },



        /*
        * Function: setTimeout
        */
        setTimeout: function () {

            if (this.settings.captionAndToolbarAutoHideDelay > 0) {
                // Set a timeout to hide the toolbar
                this.clearTimeout();
                this.timeout = window.setTimeout(this.fadeOut.bind(this), this.settings.captionAndToolbarAutoHideDelay);
            }

        },



        /*
        * Function: clearTimeout
        */
        clearTimeout: function () {

            if (!Util.isNothing(this.timeout)) {
                window.clearTimeout(this.timeout);
                this.timeout = null;
            }

        },



        /*
        * Function: fadeOut
        */
        fadeOut: function () {

            this.clearTimeout();

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onBeforeHide,
                target: this
            });

            Util.Animation.fadeOut(this.toolbarEl, this.settings.fadeOutSpeed);
            Util.Animation.fadeOut(this.captionEl, this.settings.fadeOutSpeed, this.fadeOutHandler);

            this.isVisible = false;

        },



        /*
        * Function: addEventHandlers
        */
        addEventHandlers: function () {

            if (Util.Browser.isTouchSupported) {
                if (!Util.Browser.blackberry) {
                    // Had an issue with touchstart, animation and Blackberry. BB will default to click
                    Util.Events.add(this.toolbarEl, 'touchstart', this.touchStartHandler);
                }
                Util.Events.add(this.toolbarEl, 'touchmove', this.touchMoveHandler);
                Util.Events.add(this.captionEl, 'touchmove', this.touchMoveHandler);
            }
            Util.Events.add(this.toolbarEl, 'click', this.clickHandler);

        },



        /*
        * Function: removeEventHandlers
        */
        removeEventHandlers: function () {

            if (Util.Browser.isTouchSupported) {
                if (!Util.Browser.blackberry) {
                    // Had an issue with touchstart, animation and Blackberry. BB will default to click
                    Util.Events.remove(this.toolbarEl, 'touchstart', this.touchStartHandler);
                }
                Util.Events.remove(this.toolbarEl, 'touchmove', this.touchMoveHandler);
                Util.Events.remove(this.captionEl, 'touchmove', this.touchMoveHandler);
            }
            Util.Events.remove(this.toolbarEl, 'click', this.clickHandler);

        },



        /*
        * Function: handleTap
        */
        handleTap: function (e) {

            this.clearTimeout();

            var action;

            if (e.target === this.nextEl || Util.DOM.isChildOf(e.target, this.nextEl)) {
                action = PhotoSwipe.Toolbar.ToolbarAction.next;
            }
            else if (e.target === this.previousEl || Util.DOM.isChildOf(e.target, this.previousEl)) {
                action = PhotoSwipe.Toolbar.ToolbarAction.previous;
            }
            else if (e.target === this.closeEl || Util.DOM.isChildOf(e.target, this.closeEl)) {
                action = PhotoSwipe.Toolbar.ToolbarAction.close;
            }
            else if (e.target === this.playEl || Util.DOM.isChildOf(e.target, this.playEl)) {
                action = PhotoSwipe.Toolbar.ToolbarAction.play;
            }

            this.setTimeout();

            if (Util.isNothing(action)) {
                action = PhotoSwipe.Toolbar.ToolbarAction.none;
            }

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onTap,
                target: this,
                action: action,
                tapTarget: e.target
            });

        },



        /*
        * Function: setCaption
        */
        setCaption: function (index) {

            Util.DOM.removeChildren(this.captionContentEl);

            this.currentCaption = Util.coalesce(this.cache.images[index].caption, '\u00A0');

            if (Util.isObject(this.currentCaption)) {
                Util.DOM.appendChild(this.currentCaption, this.captionContentEl);
            }
            else {
                if (this.currentCaption === '') {
                    this.currentCaption = '\u00A0';
                }
                Util.DOM.appendText(this.currentCaption, this.captionContentEl);
            }

            this.currentCaption = (this.currentCaption === '\u00A0') ? '' : this.currentCaption;

        },



        /*
        * Function: showToolbar
        */
        showToolbar: function () {

            Util.DOM.setStyle(this.toolbarEl, {
                opacity: this.settings.captionAndToolbarOpacity
            });
            Util.DOM.show(this.toolbarEl);

        },



        /*
        * Function: showCaption
        */
        showCaption: function () {

            if (this.currentCaption === '' || this.captionContentEl.childNodes.length < 1) {
                // Empty caption
                if (!this.settings.captionAndToolbarShowEmptyCaptions) {
                    Util.DOM.hide(this.captionEl);
                    return;
                }
            }
            Util.DOM.setStyle(this.captionEl, {
                opacity: this.settings.captionAndToolbarOpacity
            });
            Util.DOM.show(this.captionEl);

        },



        /*
        * Function: setToolbarStatus
        */
        setToolbarStatus: function (index) {

            if (this.settings.loop) {
                return;
            }

            if (index > 0 && index < this.cache.images.length - 1) {
                Util.DOM.removeClass(this.previousEl, PhotoSwipe.Toolbar.CssClasses.previousDisabled);
                Util.DOM.removeClass(this.nextEl, PhotoSwipe.Toolbar.CssClasses.nextDisabled);
                return;
            }

            if (index === 0) {
                if (!Util.isNothing(this.previousEl)) {
                    Util.DOM.addClass(this.previousEl, PhotoSwipe.Toolbar.CssClasses.previousDisabled);
                }
            }

            if (index === this.cache.images.length - 1) {
                if (!Util.isNothing(this.nextEl)) {
                    Util.DOM.addClass(this.nextEl, PhotoSwipe.Toolbar.CssClasses.nextDisabled);
                }
            }

        },



        /*
        * Function: onFadeOut
        */
        onFadeOut: function () {

            Util.DOM.hide(this.toolbarEl);
            Util.DOM.hide(this.captionEl);

            Util.Events.fire(this, {
                type: PhotoSwipe.Toolbar.EventTypes.onHide,
                target: this
            });

        },



        /*
        * Function: onTouchStart
        */
        onTouchStart: function (e) {

            e.preventDefault();
            Util.Events.remove(this.toolbarEl, 'click', this.clickHandler);
            this.handleTap(e);

        },



        /*
        * Function: onTouchMove
        */
        onTouchMove: function (e) {

            e.preventDefault();

        },



        /*
        * Function: onClick
        */
        onClick: function (e) {

            e.preventDefault();
            this.handleTap(e);

        }


    });



}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.UILayer');
    var PhotoSwipe = window.Code.PhotoSwipe;

    PhotoSwipe.UILayer.CssClasses = {
        uiLayer: 'ps-uilayer'
    };

}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util, TouchElement) {


    Util.registerNamespace('Code.PhotoSwipe.UILayer');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.UILayer.UILayerClass = TouchElement.TouchElementClass.extend({



        el: null,
        settings: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop;

            this.removeEventHandlers();

            Util.DOM.removeChild(this.el, this.el.parentNode);

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (options) {

            this.settings = options;

            this.supr({
                swipeThreshold: this.settings.swipeThreshold,
                swipeTimeThreshold: this.settings.swipeTimeThreshold,
                doubleTapSpeed: this.settings.doubleTapSpeed
            });

            // Main container 
            this.el = Util.DOM.createElement(
				'div',
				{
				    'class': PhotoSwipe.UILayer.CssClasses.uiLayer
				},
				''
			);
            Util.DOM.setStyle(this.el, {
                display: 'block',
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'hidden',
                zIndex: this.settings.zIndex,
                opacity: 0
            });
            Util.DOM.hide(this.el);

            Util.DOM.appendToBody(this.el);

        },



        /*
        * Function: resetPosition
        */
        resetPosition: function () {

            // Set the height and width to fill the document
            Util.DOM.setStyle(this.el, {
                top: Util.DOM.windowScrollTop() + 'px',
                width: Util.DOM.windowWidth(),
                height: Util.DOM.windowHeight()
            });


        },



        /*
        * Function: show
        */
        show: function () {

            this.resetPosition();
            Util.DOM.show(this.el);
            this.addEventHandlers();

        },



        /*
        * Function: addEventHandlers
        */
        addEventHandlers: function () {

            this.supr();

        },



        /*
        * Function: removeEventHandlers
        */
        removeEventHandlers: function () {

            this.supr();

        }


    });



}
(
	window,
	window.klass,
	window.Code.Util,
	window.Code.PhotoSwipe.TouchElement
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.ZoomPanRotate');
    var PhotoSwipe = window.Code.PhotoSwipe;

    PhotoSwipe.ZoomPanRotate.CssClasses = {
        zoomPanRotate: 'ps-zoom-pan-rotate'
    };


}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util) {


    Util.registerNamespace('Code.PhotoSwipe.ZoomPanRotate');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.ZoomPanRotate.ZoomPanRotateClass = klass({

        el: null,
        settings: null,
        containerEl: null,
        imageEl: null,
        transformSettings: null,
        panStartingPoint: null,
        transformEl: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop;

            Util.DOM.removeChild(this.el, this.el.parentNode);

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (options, cacheImage, uiLayer) {

            this.settings = options;

            this.imageEl = cacheImage.imageEl.cloneNode(false);
            Util.DOM.setStyle(this.imageEl, {

                zIndex: 1

            });

            this.transformSettings = {

                startingScale: 1.0,
                scale: 1.0,
                startingRotation: 0,
                rotation: 0,
                startingTranslateX: 0,
                startingTranslateY: 0,
                translateX: 0,
                translateY: 0

            };


            this.el = Util.DOM.createElement(
				'div',
				{
				    'class': PhotoSwipe.ZoomPanRotate.CssClasses.zoomPanRotate
				},
				''
			);
            Util.DOM.setStyle(this.el, {
                left: 0,
                top: Util.DOM.windowScrollTop() + 'px',
                position: 'absolute',
                width: Util.DOM.windowWidth(),
                height: Util.DOM.windowHeight(),
                zIndex: this.settings.zIndex,
                display: 'block'
            });


            Util.DOM.insertBefore(this.el, uiLayer.el, document.body);


            if (Util.Browser.iOS) {
                this.containerEl = Util.DOM.createElement('div');
                Util.DOM.setStyle(this.containerEl, {
                    left: 0,
                    top: 0,
                    width: Util.DOM.windowWidth(),
                    height: Util.DOM.windowHeight(),
                    position: 'absolute',
                    zIndex: 1
                });
                Util.DOM.appendChild(this.imageEl, this.containerEl);
                Util.DOM.appendChild(this.containerEl, this.el);
                Util.Animation.resetTranslate(this.containerEl);
                Util.Animation.resetTranslate(this.imageEl);
                this.transformEl = this.containerEl;
            }
            else {
                Util.DOM.appendChild(this.imageEl, this.el);
                this.transformEl = this.imageEl;
            }

        },



        /*
        * Function: setStartingTranslateFromCurrentTransform
        */
        setStartingTranslateFromCurrentTransform: function () {

            var 
				transformValue = Util.coalesce(this.transformEl.style.webkitTransform, this.transformEl.style.MozTransform, this.transformEl.style.transform),
				transformExploded;

            if (!Util.isNothing(transformValue)) {

                transformExploded = transformValue.match(/translate\((.*?)\)/);

                if (!Util.isNothing(transformExploded)) {

                    transformExploded = transformExploded[1].split(', ');
                    this.transformSettings.startingTranslateX = window.parseInt(transformExploded[0], 10);
                    this.transformSettings.startingTranslateY = window.parseInt(transformExploded[1], 10);

                }

            }

        },



        /*
        * Function: getScale
        */
        getScale: function (scaleValue) {

            var scale = this.transformSettings.startingScale * scaleValue;

            if (this.settings.minUserZoom !== 0 && scale < this.settings.minUserZoom) {
                scale = this.settings.minUserZoom;
            }
            else if (this.settings.maxUserZoom !== 0 && scale > this.settings.maxUserZoom) {
                scale = this.settings.maxUserZoom;
            }

            return scale;

        },



        /*
        * Function: setStartingScaleAndRotation
        */
        setStartingScaleAndRotation: function (scaleValue, rotationValue) {

            this.transformSettings.startingScale = this.getScale(scaleValue);

            this.transformSettings.startingRotation =
				(this.transformSettings.startingRotation + rotationValue) % 360;

        },



        /*
        * Function: zoomRotate
        */
        zoomRotate: function (scaleValue, rotationValue) {

            this.transformSettings.scale = this.getScale(scaleValue);

            this.transformSettings.rotation =
				this.transformSettings.startingRotation + rotationValue;

            this.applyTransform();

        },



        /*
        * Function: panStart
        */
        panStart: function (point) {

            this.setStartingTranslateFromCurrentTransform();

            this.panStartingPoint = {
                x: point.x,
                y: point.y
            };

        },



        /*
        * Function: pan
        */
        pan: function (point) {

            var 
				dx = point.x - this.panStartingPoint.x,
				dy = point.y - this.panStartingPoint.y,
				dxScaleAdjust = dx / this.transformSettings.scale,
        dyScaleAdjust = dy / this.transformSettings.scale;

            this.transformSettings.translateX =
				this.transformSettings.startingTranslateX + dxScaleAdjust;

            this.transformSettings.translateY =
				this.transformSettings.startingTranslateY + dyScaleAdjust;

            this.applyTransform();

        },



        /*
		
        * Function: zoomAndPanToPoint
        */
        zoomAndPanToPoint: function (scaleValue, point) {

            this.panStart({
                x: Util.DOM.bodyWidth() / 2,
                y: Util.DOM.windowHeight() / 2
            });

            var 
				dx = point.x - this.panStartingPoint.x,
				dy = point.y - this.panStartingPoint.y,
				dxScaleAdjust = dx / this.transformSettings.scale,
        dyScaleAdjust = dy / this.transformSettings.scale;

            this.transformSettings.translateX =
				(this.transformSettings.startingTranslateX + dxScaleAdjust) * -1;

            this.transformSettings.translateY =
				(this.transformSettings.startingTranslateY + dyScaleAdjust) * -1;

            this.setStartingScaleAndRotation(scaleValue, 0);
            this.transformSettings.scale = this.transformSettings.startingScale;

            this.transformSettings.rotation = 0;

            this.applyTransform();

        },



        /*
        * Function: applyTransform
        */
        applyTransform: function () {

            var transform = 'scale(' + this.transformSettings.scale + ') rotate(' + (this.transformSettings.rotation % 360) + 'deg) translate(' + window.parseInt(this.transformSettings.translateX, 10) + 'px, ' + window.parseInt(this.transformSettings.translateY, 10) + 'px)';

            Util.DOM.setStyle(this.transformEl, {
                webkitTransform: transform,
                MozTransform: transform,
                msTransform: transform,
                transform: transform
            });

        }

    });



}
(
	window,
	window.klass,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, Util) {


    Util.registerNamespace('Code.PhotoSwipe');
    var PhotoSwipe = window.Code.PhotoSwipe;



    PhotoSwipe.CssClasses = {
        buildingBody: 'ps-building',
        activeBody: 'ps-active'
    };



    PhotoSwipe.EventTypes = {

        onBeforeShow: 'PhotoSwipeOnBeforeShow',
        onShow: 'PhotoSwipeOnShow',
        onBeforeHide: 'PhotoSwipeOnBeforeHide',
        onHide: 'PhotoSwipeOnHide',
        onDisplayImage: 'PhotoSwipeOnDisplayImage',
        onResetPosition: 'PhotoSwipeOnResetPosition',
        onSlideshowStart: 'PhotoSwipeOnSlideshowStart',
        onSlideshowStop: 'PhotoSwipeOnSlideshowStop',
        onTouch: 'PhotoSwipeOnTouch',
        onBeforeCaptionAndToolbarShow: 'PhotoSwipeOnBeforeCaptionAndToolbarShow',
        onCaptionAndToolbarShow: 'PhotoSwipeOnCaptionAndToolbarShow',
        onBeforeCaptionAndToolbarHide: 'PhotoSwipeOnBeforeCaptionAndToolbarHide',
        onCaptionAndToolbarHide: 'PhotoSwipeOnCaptionAndToolbarHide',
        onToolbarTap: 'PhotoSwipeOnToolbarTap'

    };



    PhotoSwipe.instances = [];
    PhotoSwipe.activeInstance = null;



    /*
    * Function: Code.PhotoSwipe.setActivateInstance
    */
    PhotoSwipe.setActivateInstance = function (instance) {

        if (!Util.isNothing(PhotoSwipe.activeInstance)) {
            throw 'Code.PhotoSwipe.activateInstance: Unable to active instance as another instance is already active';
        }

        PhotoSwipe.activeInstance = instance;

    };



    /*
    * Function: Code.PhotoSwipe.unsetActivateInstance
    */
    PhotoSwipe.unsetActivateInstance = function () {

        PhotoSwipe.activeInstance = null;

    };



    /*
    * Function: Code.PhotoSwipe.attach
    */
    PhotoSwipe.attach = function (images, options, id) {

        var i, instance, image;

        instance = PhotoSwipe.createInstance(images, options, id);

        // Add click event handlers if applicable
        for (i = 0; i < images.length; i++) {

            image = images[i];
            if (!Util.isNothing(image.nodeType)) {
                if (image.nodeType === 1) {
                    // DOM element
                    image.__photoSwipeClickHandler = PhotoSwipe.onTriggerElementClick.bind(instance);
                    Util.Events.remove(image, 'click', image.__photoSwipeClickHandler);
                    Util.Events.add(image, 'click', image.__photoSwipeClickHandler);
                }
            }

        }

        return instance;

    };



    /*
    * jQuery plugin
    */
    if (window.jQuery) {

        window.jQuery.fn.photoSwipe = function (options, id) {

            return PhotoSwipe.attach(this, options, id);

        };


    }



    /*
    * Function: Code.PhotoSwipe.detatch
    */
    PhotoSwipe.detatch = function (instance) {

        var i, image;

        // Remove click event handlers if applicable
        for (i = 0; i < instance.originalImages.length; i++) {

            image = instance.originalImages[i];
            if (!Util.isNothing(image.nodeType)) {
                if (image.nodeType === 1) {
                    // DOM element
                    Util.Events.remove(image, 'click', image.__photoSwipeClickHandler);
                    delete image.__photoSwipeClickHandler;
                }
            }

        }

        PhotoSwipe.disposeInstance(instance);

    };



    /*
    * Function: Code.PhotoSwipe.createInstance
    */
    PhotoSwipe.createInstance = function (images, options, id) {

        var i, instance, image;

        if (Util.isNothing(images)) {
            throw 'Code.PhotoSwipe.attach: No images passed.';
        }

        if (!Util.isLikeArray(images)) {
            throw 'Code.PhotoSwipe.createInstance: Images must be an array of elements or image urls.';
        }

        if (images.length < 1) {
            throw 'Code.PhotoSwipe.createInstance: No images to passed.';
        }

        options = Util.coalesce(options, {});

        instance = PhotoSwipe.getInstance(id);

        if (Util.isNothing(instance)) {
            instance = new PhotoSwipe.PhotoSwipeClass(images, options, id);
            PhotoSwipe.instances.push(instance);
        }
        else {
            throw 'Code.PhotoSwipe.createInstance: Instance with id "' + id + ' already exists."';
        }

        return instance;

    };



    /*
    * Function: Code.PhotoSwipe.disposeInstance
    */
    PhotoSwipe.disposeInstance = function (instance) {

        var instanceIndex = PhotoSwipe.getInstanceIndex(instance);

        if (instanceIndex < 0) {
            throw 'Code.PhotoSwipe.disposeInstance: Unable to find instance to dispose.';
        }

        instance.dispose();
        PhotoSwipe.instances.splice(instanceIndex, 1);
        instance = null;

    };



    /*
    * Function: onTriggerElementClick
    */
    PhotoSwipe.onTriggerElementClick = function (e) {

        e.preventDefault();

        var instance = this;
        instance.show(e.currentTarget);

    };



    /*
    * Function: Code.PhotoSwipe.getInstance
    */
    PhotoSwipe.getInstance = function (id) {

        var i, instance;

        for (i = 0; i < PhotoSwipe.instances.length; i++) {

            instance = PhotoSwipe.instances[i];
            if (instance.id === id) {
                return instance;
            }

        }

        return null;

    };



    /*
    * Function: Code.PhotoSwipe.getInstanceIndex
    */
    PhotoSwipe.getInstanceIndex = function (instance) {

        var i, instanceIndex = -1;

        for (i = 0; i < PhotoSwipe.instances.length; i++) {

            if (PhotoSwipe.instances[i] === instance) {
                instanceIndex = i;
                break;
            }

        }

        return instanceIndex;

    };



}
(
	window,
	window.Code.Util
)); // Copyright (c) 2011 by Code Computerlove (http://www.codecomputerlove.com)
// Licensed under the MIT license
// version: 2.0.3

(function (window, klass, Util, Cache, DocumentOverlay, Carousel, Toolbar, UILayer, ZoomPanRotate) {


    Util.registerNamespace('Code.PhotoSwipe');
    var PhotoSwipe = window.Code.PhotoSwipe;


    PhotoSwipe.PhotoSwipeClass = klass({



        id: null,
        settings: null,
        isBackEventSupported: null,
        backButtonClicked: null,
        currentIndex: null,
        originalImages: null,
        mouseWheelStartTime: null,



        // Components
        cache: null,
        documentOverlay: null,
        carousel: null,
        uiLayer: null,
        toolbar: null,
        zoomPanRotate: null,



        // Handlers
        windowOrientationChangeHandler: null,
        windowScrollHandler: null,
        windowHashChangeHandler: null,
        keyDownHandler: null,
        windowOrientationEventName: null,
        uiLayerTouchHandler: null,
        carouselSlideByEndHandler: null,
        carouselSlideshowStartHandler: null,
        carouselSlideshowStopHandler: null,
        toolbarTapHandler: null,
        toolbarBeforeShowHandler: null,
        toolbarShowHandler: null,
        toolbarBeforeHideHandler: null,
        toolbarHideHandler: null,
        mouseWheelHandler: null,



        /*
        * Function: dispose
        */
        dispose: function () {

            var prop;

            Util.Events.remove(this, PhotoSwipe.EventTypes.onBeforeShow);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onShow);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onBeforeHide);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onHide);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onDisplayImage);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onResetPosition);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onSlideshowStart);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onSlideshowStop);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onTouch);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onBeforeCaptionAndToolbarShow);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onCaptionAndToolbarShow);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onBeforeCaptionAndToolbarHide);
            Util.Events.remove(this, PhotoSwipe.EventTypes.onCaptionAndToolbarHide);

            this.removeEventHandlers();

            if (!Util.isNothing(this.documentOverlay)) {
                this.documentOverlay.dispose();
            }

            if (!Util.isNothing(this.carousel)) {
                this.carousel.dispose();
            }

            if (!Util.isNothing(this.uiLayer)) {
                this.uiLayer.dispose();
            }

            if (!Util.isNothing(this.toolbar)) {
                this.toolbar.dispose();
            }

            this.destroyZoomPanRotate();

            if (!Util.isNothing(this.cache)) {
                this.cache.dispose();
            }

            for (prop in this) {
                if (Util.objectHasProperty(this, prop)) {
                    this[prop] = null;
                }
            }

        },



        /*
        * Function: initialize
        */
        initialize: function (images, options, id) {

            if (Util.isNothing(id)) {
                this.id = 'PhotoSwipe' + new Date().getTime().toString();
            }
            else {
                this.id = id;
            }

            this.originalImages = images;

            if (Util.Browser.isAndroid) {
                if (window.navigator.userAgent.indexOf('2.1') > -1) {
                    this.isBackEventSupported = true;
                }
            }

            if (!this.isBackEventSupported) {
                this.isBackEventSupported = Util.objectHasProperty(window, 'onhashchange');
            }


            this.settings = {

                // General
                fadeInSpeed: 250,
                fadeOutSpeed: 250,
                preventHide: false,
                preventSlideshow: false,
                zIndex: 1000,
                backButtonHideEnabled: true,
                enableKeyboard: true,
                enableMouseWheel: true,
                mouseWheelSpeed: 350,
                autoStartSlideshow: false,
                jQueryMobile: (!Util.isNothing(window.jQuery) && !Util.isNothing(window.jQuery.mobile)),
                jQueryMobileDialogHash: '&ui-state=dialog',


                // Carousel
                loop: true,
                slideSpeed: 250,
                nextPreviousSlideSpeed: 0,
                enableDrag: true,
                swipeThreshold: 50,
                swipeTimeThreshold: 250,
                slideTimingFunction: 'ease-out',
                slideshowDelay: 3000,
                doubleTapSpeed: 250,
                margin: 20,
                imageScaleMethod: 'fit', // Either "fit", "fitNoUpscale" or "zoom",

                // Toolbar
                captionAndToolbarHide: false,
                captionAndToolbarFlipPosition: false,
                captionAndToolbarAutoHideDelay: 5000,
                captionAndToolbarOpacity: 0.8,
                captionAndToolbarShowEmptyCaptions: true,
                getToolbar: PhotoSwipe.Toolbar.getToolbar,


                // ZoomPanRotate
                allowUserZoom: true,
                allowRotationOnUserZoom: false,
                maxUserZoom: 5.0,
                minUserZoom: 0.5,
                doubleTapZoomLevel: 2.5,


                // Cache
                getImageSource: PhotoSwipe.Cache.Functions.getImageSource,
                getImageCaption: PhotoSwipe.Cache.Functions.getImageCaption,
                getImageMetaData: PhotoSwipe.Cache.Functions.getImageMetaData,
                cacheMode: PhotoSwipe.Cache.Mode.normal

            };

            Util.extend(this.settings, options);

            if (this.settings.preventHide) {
                this.settings.backButtonHideEnabled = false;
            }

            this.cache = new Cache.CacheClass(images, this.settings);

        },



        /*
        * Function: show
        */
        show: function (obj) {

            var i;

            // Work out what the starting index is
            if (Util.isNumber(obj)) {
                this.currentIndex = obj;
            }
            else {

                this.currentIndex = -1;
                for (i = 0; i < this.originalImages.length; i++) {
                    if (this.originalImages[i] === obj) {
                        this.currentIndex = i;
                        break;
                    }
                }

            }

            if (this.currentIndex < 0 || this.currentIndex > this.originalImages.length - 1) {
                throw "Code.PhotoSwipe.PhotoSwipeClass.show: Starting index out of range";
            }


            // Set this instance to be the active instance
            PhotoSwipe.setActivateInstance(this);

            // Create components
            Util.DOM.addClass(window.document.body, PhotoSwipe.CssClasses.buildingBody);
            this.createComponents();


            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onBeforeShow,
                target: this
            });


            // Fade in the document overlay
            this.documentOverlay.fadeIn(this.settings.fadeInSpeed, this.onDocumentOverlayFadeIn.bind(this));

        },



        /*
        * Function: createComponents
        */
        createComponents: function () {

            this.documentOverlay = new DocumentOverlay.DocumentOverlayClass(this.settings);
            this.carousel = new Carousel.CarouselClass(this.cache, this.settings);
            this.uiLayer = new UILayer.UILayerClass(this.settings);
            if (!this.settings.captionAndToolbarHide) {
                this.toolbar = new Toolbar.ToolbarClass(this.cache, this.settings);
            }

        },



        /*
        * Function: resetPosition
        */
        resetPosition: function () {

            this.destroyZoomPanRotate();

            this.documentOverlay.resetPosition();
            this.carousel.resetPosition();

            if (!Util.isNothing(this.toolbar)) {
                this.toolbar.resetPosition();
            }

            this.uiLayer.resetPosition();

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onResetPosition,
                target: this
            });

        },



        /*
        * Function: addEventHandler
        */
        addEventHandler: function (type, handler) {

            Util.Events.add(this, type, handler);

        },



        /*
        * Function: addEventHandlers
        */
        addEventHandlers: function () {

            if (Util.isNothing(this.windowOrientationChangeHandler)) {

                this.windowOrientationChangeHandler = this.onWindowOrientationChange.bind(this);
                this.windowScrollHandler = this.onWindowScroll.bind(this);
                this.keyDownHandler = this.onKeyDown.bind(this);
                this.windowHashChangeHandler = this.onWindowHashChange.bind(this);
                this.uiLayerTouchHandler = this.onUILayerTouch.bind(this);
                this.carouselSlideByEndHandler = this.onCarouselSlideByEnd.bind(this);
                this.carouselSlideshowStartHandler = this.onCarouselSlideshowStart.bind(this);
                this.carouselSlideshowStopHandler = this.onCarouselSlideshowStop.bind(this);
                this.toolbarTapHandler = this.onToolbarTap.bind(this);
                this.toolbarBeforeShowHandler = this.onToolbarBeforeShow.bind(this);
                this.toolbarShowHandler = this.onToolbarShow.bind(this);
                this.toolbarBeforeHideHandler = this.onToolbarBeforeHide.bind(this);
                this.toolbarHideHandler = this.onToolbarHide.bind(this);
                this.mouseWheelHandler = this.onMouseWheel.bind(this);

            }

            // Set window handlers
            if (Util.Browser.android) {
                // For some reason, resize was more stable than orientationchange in Android
                this.orientationEventName = 'resize';
            }
            else if (Util.Browser.iOS && (!Util.Browser.safari)) {
                Util.Events.add(window.document.body, 'orientationchange', this.windowOrientationChangeHandler);
            }
            else {
                var supportsOrientationChange = !Util.isNothing(window.onorientationchange);
                this.orientationEventName = supportsOrientationChange ? 'orientationchange' : 'resize';
            }

            if (!Util.isNothing(this.orientationEventName)) {
                Util.Events.add(window, this.orientationEventName, this.windowOrientationChangeHandler);
            }
            Util.Events.add(window, 'scroll', this.windowScrollHandler);

            if (this.settings.enableKeyboard) {
                Util.Events.add(window.document, 'keydown', this.keyDownHandler);
            }

            if (this.isBackEventSupported && this.settings.backButtonHideEnabled) {

                this.windowHashChangeHandler = this.onWindowHashChange.bind(this);

                if (this.settings.jQueryMobile) {
                    window.location.hash = this.settings.jQueryMobileDialogHash;
                }
                else {
                    this.currentHistoryHashValue = 'PhotoSwipe' + new Date().getTime().toString();
                    window.location.hash = this.currentHistoryHashValue;
                }

                Util.Events.add(window, 'hashchange', this.windowHashChangeHandler);

            }

            if (this.settings.enableMouseWheel) {
                Util.Events.add(window, 'mousewheel', this.mouseWheelHandler);
            }

            Util.Events.add(this.uiLayer, PhotoSwipe.TouchElement.EventTypes.onTouch, this.uiLayerTouchHandler);
            Util.Events.add(this.carousel, Carousel.EventTypes.onSlideByEnd, this.carouselSlideByEndHandler);
            Util.Events.add(this.carousel, Carousel.EventTypes.onSlideshowStart, this.carouselSlideshowStartHandler);
            Util.Events.add(this.carousel, Carousel.EventTypes.onSlideshowStop, this.carouselSlideshowStopHandler);

            if (!Util.isNothing(this.toolbar)) {
                Util.Events.add(this.toolbar, Toolbar.EventTypes.onTap, this.toolbarTapHandler);
                Util.Events.add(this.toolbar, Toolbar.EventTypes.onBeforeShow, this.toolbarBeforeShowHandler);
                Util.Events.add(this.toolbar, Toolbar.EventTypes.onShow, this.toolbarShowHandler);
                Util.Events.add(this.toolbar, Toolbar.EventTypes.onBeforeHide, this.toolbarBeforeHideHandler);
                Util.Events.add(this.toolbar, Toolbar.EventTypes.onHide, this.toolbarHideHandler);
            }

        },



        /*
        * Function: removeEventHandlers
        */
        removeEventHandlers: function () {

            if (Util.Browser.iOS && (!Util.Browser.safari)) {
                Util.Events.remove(window.document.body, 'orientationchange', this.windowOrientationChangeHandler);
            }

            if (!Util.isNothing(this.orientationEventName)) {
                Util.Events.remove(window, this.orientationEventName, this.windowOrientationChangeHandler);
            }

            Util.Events.remove(window, 'scroll', this.windowScrollHandler);

            if (this.settings.enableKeyboard) {
                Util.Events.remove(window.document, 'keydown', this.keyDownHandler);
            }

            if (this.isBackEventSupported && this.settings.backButtonHideEnabled) {
                Util.Events.remove(window, 'hashchange', this.windowHashChangeHandler);
            }

            Util.Events.remove(this.uiLayer, PhotoSwipe.TouchElement.EventTypes.onTouch, this.uiLayerTouchHandler);
            Util.Events.remove(this.carousel, Carousel.EventTypes.onSlideByEnd, this.carouselSlideByEndHandler);
            Util.Events.remove(this.carousel, Carousel.EventTypes.onSlideshowStart, this.carouselSlideshowStartHandler);
            Util.Events.remove(this.carousel, Carousel.EventTypes.onSlideshowStop, this.carouselSlideshowStopHandler);

            if (this.settings.enableMouseWheel) {
                Util.Events.remove(window, 'mousewheel', this.mouseWheelHandler);
            }

            if (!Util.isNothing(this.toolbar)) {
                Util.Events.remove(this.toolbar, Toolbar.EventTypes.onTap, this.toolbarTapHandler);
                Util.Events.remove(this.toolbar, Toolbar.EventTypes.onBeforeShow, this.toolbarBeforeShowHandler);
                Util.Events.remove(this.toolbar, Toolbar.EventTypes.onShow, this.toolbarShowHandler);
                Util.Events.remove(this.toolbar, Toolbar.EventTypes.onBeforeHide, this.toolbarBeforeHideHandler);
                Util.Events.remove(this.toolbar, Toolbar.EventTypes.onHide, this.toolbarHideHandler);
            }

        },




        /*
        * Function: hide
        */
        hide: function () {

            if (this.settings.preventHide) {
                return;
            }

            this.removeEventHandlers();

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onBeforeHide,
                target: this
            });

            this.uiLayer.dispose();
            this.uiLayer = null;

            if (!Util.isNothing(this.toolbar)) {
                this.toolbar.dispose();
                this.toolbar = null;
            }

            this.carousel.dispose();
            this.carousel = null;

            Util.DOM.removeClass(window.document.body, PhotoSwipe.CssClasses.activeBody);

            this.documentOverlay.dispose();
            this.documentOverlay = null;

            // Deactive this instance
            PhotoSwipe.unsetActivateInstance();

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onHide,
                target: this
            });

            this.goBackInHistory();

        },



        /*
        * Function: goBackInHistory
        */
        goBackInHistory: function () {

            if (this.isBackEventSupported && this.settings.backButtonHideEnabled) {
                if (!this.backButtonClicked) {
                    window.history.back();
                }
            }

        },



        /*
        * Function: play
        */
        play: function () {

            if (!this.settings.preventSlideshow) {
                if (!Util.isNothing(this.carousel)) {
                    this.fadeOutToolbarIfVisible();
                    this.carousel.startSlideshow();
                }
            }

        },



        /*
        * Function: stop
        */
        stop: function () {

            if (!Util.isNothing(this.carousel)) {
                this.carousel.stopSlideshow();
            }

        },



        /*
        * Function: previous
        */
        previous: function () {

            if (!Util.isNothing(this.carousel)) {
                this.carousel.previous();
            }

        },



        /*
        * Function: next
        */
        next: function () {

            if (!Util.isNothing(this.carousel)) {
                this.carousel.next();
            }

        },



        /*
        * Function: toggleToolbar
        */
        toggleToolbar: function () {

            if (!Util.isNothing(this.toolbar)) {
                this.toolbar.toggleVisibility(this.currentIndex);
            }

        },



        /*
        * Function: fadeOutToolbarIfVisible
        */
        fadeOutToolbarIfVisible: function () {

            if (!Util.isNothing(this.toolbar) && this.toolbar.isVisible && this.settings.captionAndToolbarAutoHideDelay > 0) {
                this.toolbar.fadeOut();
            }

        },



        /*
        * Function: createZoomPanRotate
        */
        createZoomPanRotate: function () {

            this.stop();

            if (this.canUserZoom() && !this.isZoomActive()) {

                this.zoomPanRotate = new ZoomPanRotate.ZoomPanRotateClass(
					this.settings,
					this.cache.images[this.currentIndex],
					this.uiLayer
				);

                this.fadeOutToolbarIfVisible();

            }

        },



        /*
        * Function: destroyZoomPanRotate
        */
        destroyZoomPanRotate: function () {

            if (!Util.isNothing(this.zoomPanRotate)) {
                this.zoomPanRotate.dispose();
                this.zoomPanRotate = null;
            }

        },



        /*
        * Function: canUserZoom
        */
        canUserZoom: function () {

            var testEl, cacheImage;

            if (Util.Browser.msie) {
                testEl = document.createElement('div');
                if (Util.isNothing(testEl.style.msTransform)) {
                    return false;
                }
            }
            else if (!Util.Browser.isCSSTransformSupported) {
                return false;
            }

            if (!this.settings.allowUserZoom) {
                return false;
            }

            if (this.carousel.isSliding) {
                return false;
            }

            cacheImage = this.cache.images[this.currentIndex];

            if (Util.isNothing(cacheImage)) {
                return false;
            }

            if (cacheImage.isLoading) {
                return false;
            }

            return true;

        },



        /*
        * Function: isZoomActive
        */
        isZoomActive: function () {

            return (!Util.isNothing(this.zoomPanRotate));

        },



        /*
        * Function: getCurrentImage
        */
        getCurrentImage: function () {

            return this.cache.images[this.currentIndex];

        },



        /*
        * Function: onDocumentOverlayFadeIn
        */
        onDocumentOverlayFadeIn: function (e) {

            window.setTimeout(function () {

                Util.DOM.removeClass(window.document.body, PhotoSwipe.CssClasses.buildingBody);
                Util.DOM.addClass(window.document.body, PhotoSwipe.CssClasses.activeBody);

                this.addEventHandlers();

                this.carousel.show(this.currentIndex);
                this.uiLayer.show();

                if (this.settings.autoStartSlideshow) {
                    this.play();
                }
                else if (!Util.isNothing(this.toolbar)) {
                    this.toolbar.show(this.currentIndex);
                }

                Util.Events.fire(this, {
                    type: PhotoSwipe.EventTypes.onShow,
                    target: this
                });

            } .bind(this), 250);


        },



        /*
        * Function: onWindowScroll
        */
        onWindowScroll: function (e) {

            this.resetPosition();

        },



        /*
        * Function: onWindowOrientationChange
        */
        onWindowOrientationChange: function (e) {

            this.resetPosition();

        },



        /*
        * Function: onWindowHashChange
        */
        onWindowHashChange: function (e) {

            var compareHash = '#' +
				((this.settings.jQueryMobile) ? this.settings.jQueryMobileDialogHash : this.currentHistoryHashValue);

            if (window.location.hash !== compareHash) {
                this.backButtonClicked = true;
                this.hide();
            }

        },



        /*
        * Function: onKeyDown
        */
        onKeyDown: function (e) {

            if (e.keyCode === 37) { // Left
                e.preventDefault();
                this.previous();
            }
            else if (e.keyCode === 39) { // Right
                e.preventDefault();
                this.next();
            }
            else if (e.keyCode === 38 || e.keyCode === 40) { // Up and down
                e.preventDefault();
            }
            else if (e.keyCode === 27) { // Escape
                e.preventDefault();
                this.hide();
            }
            else if (e.keyCode === 32) { // Spacebar
                if (!this.settings.hideToolbar) {
                    this.toggleToolbar();
                }
                else {
                    this.hide();
                }
                e.preventDefault();
            }
            else if (e.keyCode === 13) { // Enter
                e.preventDefault();
                this.play();
            }

        },



        /*
        * Function: onUILayerTouch
        */
        onUILayerTouch: function (e) {

            if (this.isZoomActive()) {

                switch (e.action) {

                    case PhotoSwipe.TouchElement.ActionTypes.gestureChange:
                        this.zoomPanRotate.zoomRotate(e.scale, (this.settings.allowRotationOnUserZoom) ? e.rotation : 0);
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.gestureEnd:
                        this.zoomPanRotate.setStartingScaleAndRotation(e.scale, (this.settings.allowRotationOnUserZoom) ? e.rotation : 0);
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.touchStart:
                        this.zoomPanRotate.panStart(e.point);
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.touchMove:
                        this.zoomPanRotate.pan(e.point);
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.doubleTap:
                        this.destroyZoomPanRotate();
                        this.toggleToolbar();
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.swipeLeft:
                        this.destroyZoomPanRotate();
                        this.next();
                        this.toggleToolbar();
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.swipeRight:
                        this.destroyZoomPanRotate();
                        this.previous();
                        this.toggleToolbar();
                        break;
                }

            }
            else {

                switch (e.action) {

                    case PhotoSwipe.TouchElement.ActionTypes.touchMove:
                    case PhotoSwipe.TouchElement.ActionTypes.swipeLeft:
                    case PhotoSwipe.TouchElement.ActionTypes.swipeRight:

                        // Hide the toolbar if need be 
                        this.fadeOutToolbarIfVisible();

                        // Pass the touch onto the carousel
                        this.carousel.onTouch(e.action, e.point);
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.touchStart:
                    case PhotoSwipe.TouchElement.ActionTypes.touchEnd:

                        // Pass the touch onto the carousel
                        this.carousel.onTouch(e.action, e.point);
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.tap:
                        this.toggleToolbar();
                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.doubleTap:

                        // Take into consideration the window scroll
                        e.point.x -= Util.DOM.windowScrollLeft();
                        e.point.y -= Util.DOM.windowScrollTop();

                        // Just make sure that if the user clicks out of the image
                        // that the image does not pan out of view!
                        var 
							cacheImageEl = this.cache.images[this.currentIndex].imageEl,

							imageTop = window.parseInt(Util.DOM.getStyle(cacheImageEl, 'top'), 10),
							imageLeft = window.parseInt(Util.DOM.getStyle(cacheImageEl, 'left'), 10),
							imageRight = imageLeft + Util.DOM.width(cacheImageEl),
							imageBottom = imageTop + Util.DOM.height(cacheImageEl);

                        if (e.point.x < imageLeft) {
                            e.point.x = imageLeft;
                        }
                        else if (e.point.x > imageRight) {
                            e.point.x = imageRight;
                        }

                        if (e.point.y < imageTop) {
                            e.point.y = imageTop;
                        }
                        else if (e.point.y > imageBottom) {
                            e.point.y = imageBottom;
                        }

                        this.createZoomPanRotate();
                        if (this.isZoomActive()) {
                            this.zoomPanRotate.zoomAndPanToPoint(this.settings.doubleTapZoomLevel, e.point);
                        }

                        break;

                    case PhotoSwipe.TouchElement.ActionTypes.gestureStart:
                        this.createZoomPanRotate();
                        break;
                }


            }

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onTouch,
                target: this,
                point: e.point,
                action: e.action
            });

        },



        /*
        * Function: onCarouselSlideByEnd
        */
        onCarouselSlideByEnd: function (e) {

            this.currentIndex = e.cacheIndex;

            if (!Util.isNothing(this.toolbar)) {
                this.toolbar.setCaption(this.currentIndex);
                this.toolbar.setToolbarStatus(this.currentIndex);
            }

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onDisplayImage,
                target: this,
                action: e.action,
                index: e.cacheIndex
            });

        },



        /*
        * Function: onToolbarTap
        */
        onToolbarTap: function (e) {

            switch (e.action) {

                case Toolbar.ToolbarAction.next:
                    this.next();
                    break;

                case Toolbar.ToolbarAction.previous:
                    this.previous();
                    break;

                case Toolbar.ToolbarAction.close:
                    this.hide();
                    break;

                case Toolbar.ToolbarAction.play:
                    this.play();
                    break;

            }

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onToolbarTap,
                target: this,
                toolbarAction: e.action,
                tapTarget: e.tapTarget
            });

        },



        /*
        * Function: onMouseWheel
        */
        onMouseWheel: function (e) {

            var 
				delta = Util.Events.getWheelDelta(e),
				dt = e.timeStamp - (this.mouseWheelStartTime || 0);

            if (dt < this.settings.mouseWheelSpeed) {
                return;
            }

            this.mouseWheelStartTime = e.timeStamp;

            if (this.settings.invertMouseWheel) {
                delta = delta * -1;
            }

            if (delta < 0) {
                this.next();
            }
            else if (delta > 0) {
                this.previous();
            }

        },



        /*
        * Function: onCarouselSlideshowStart
        */
        onCarouselSlideshowStart: function (e) {

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onSlideshowStart,
                target: this
            });

        },



        /*
        * Function: onCarouselSlideshowStop
        */
        onCarouselSlideshowStop: function (e) {

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onSlideshowStop,
                target: this
            });

        },



        /*
        * Function: onToolbarBeforeShow
        */
        onToolbarBeforeShow: function (e) {

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onBeforeCaptionAndToolbarShow,
                target: this
            });

        },



        /*
        * Function: onToolbarShow
        */
        onToolbarShow: function (e) {

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onCaptionAndToolbarShow,
                target: this
            });

        },



        /*
        * Function: onToolbarBeforeHide
        */
        onToolbarBeforeHide: function (e) {

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onBeforeCaptionAndToolbarHide,
                target: this
            });

        },



        /*
        * Function: onToolbarHide
        */
        onToolbarHide: function (e) {

            Util.Events.fire(this, {
                type: PhotoSwipe.EventTypes.onCaptionAndToolbarHide,
                target: this
            });

        }


    });



}
(
	window,
	window.klass,
	window.Code.Util,
	window.Code.PhotoSwipe.Cache,
	window.Code.PhotoSwipe.DocumentOverlay,
	window.Code.PhotoSwipe.Carousel,
	window.Code.PhotoSwipe.Toolbar,
	window.Code.PhotoSwipe.UILayer,
	window.Code.PhotoSwipe.ZoomPanRotate
));


/*!
** Unobtrusive Ajax support library for jQuery
** Copyright (C) Microsoft Corporation. All rights reserved.
*/

/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */
/*global window: false, jQuery: false */

(function ($) {
    var data_click = "unobtrusiveAjaxClick",
        data_validation = "unobtrusiveValidation";

    function getFunction(code, argNames) {
        var fn = window, parts = (code || "").split(".");
        while (fn && parts.length) {
            fn = fn[parts.shift()];
        }
        if (typeof (fn) === "function") {
            return fn;
        }
        argNames.push(code);
        return Function.constructor.apply(null, argNames);
    }

    function isMethodProxySafe(method) {
        return method === "GET" || method === "POST";
    }

    function asyncOnBeforeSend(xhr, method) {
        if (!isMethodProxySafe(method)) {
            xhr.setRequestHeader("X-HTTP-Method-Override", method);
        }
    }

    function asyncOnSuccess(element, data, contentType) {
        var mode;

        if (contentType.indexOf("application/x-javascript") !== -1) {  // jQuery already executes JavaScript for us
            return;
        }

        mode = (element.getAttribute("data-ajax-mode") || "").toUpperCase();
        $(element.getAttribute("data-ajax-update")).each(function (i, update) {
            var top;

            switch (mode) {
            case "BEFORE":
                top = update.firstChild;
                $("<div />").html(data).contents().each(function () {
                    update.insertBefore(this, top);
                });
                break;
            case "AFTER":
                $("<div />").html(data).contents().each(function () {
                    update.appendChild(this);
                });
                break;
            default:
                $(update).html(data);
                break;
            }
        });
    }

    function asyncRequest(element, options) {
        var confirm, loading, method, duration;

        confirm = element.getAttribute("data-ajax-confirm");
        if (confirm && !window.confirm(confirm)) {
            return;
        }

        loading = $(element.getAttribute("data-ajax-loading"));
        duration = element.getAttribute("data-ajax-loading-duration") || 0;

        $.extend(options, {
            type: element.getAttribute("data-ajax-method") || undefined,
            url: element.getAttribute("data-ajax-url") || undefined,
            beforeSend: function (xhr) {
                var result;
                asyncOnBeforeSend(xhr, method);
                result = getFunction(element.getAttribute("data-ajax-begin"), ["xhr"]).apply(this, arguments);
                if (result !== false) {
                    loading.show(duration);
                }
                return result;
            },
            complete: function () {
                loading.hide(duration);
                getFunction(element.getAttribute("data-ajax-complete"), ["xhr", "status"]).apply(this, arguments);
            },
            success: function (data, status, xhr) {
                asyncOnSuccess(element, data, xhr.getResponseHeader("Content-Type") || "text/html");
                getFunction(element.getAttribute("data-ajax-success"), ["data", "status", "xhr"]).apply(this, arguments);
            },
            error: getFunction(element.getAttribute("data-ajax-failure"), ["xhr", "status", "error"])
        });

        options.data.push({ name: "X-Requested-With", value: "XMLHttpRequest" });

        method = options.type.toUpperCase();
        if (!isMethodProxySafe(method)) {
            options.type = "POST";
            options.data.push({ name: "X-HTTP-Method-Override", value: method });
        }

        $.ajax(options);
    }

    function validate(form) {
        var validationInfo = $(form).data(data_validation);
        return !validationInfo || !validationInfo.validate || validationInfo.validate();
    }

    $("a[data-ajax=true]").live("click", function (evt) {
        evt.preventDefault();
        asyncRequest(this, {
            url: this.href,
            type: "GET",
            data: []
        });
    });

    $("form[data-ajax=true] input[type=image]").live("click", function (evt) {
        var name = evt.target.name,
            $target = $(evt.target),
            form = $target.parents("form")[0],
            offset = $target.offset();

        $(form).data(data_click, [
            { name: name + ".x", value: Math.round(evt.pageX - offset.left) },
            { name: name + ".y", value: Math.round(evt.pageY - offset.top) }
        ]);

        setTimeout(function () {
            $(form).removeData(data_click);
        }, 0);
    });

    $("form[data-ajax=true] :submit").live("click", function (evt) {
        var name = evt.target.name,
            form = $(evt.target).parents("form")[0];

        $(form).data(data_click, name ? [{ name: name, value: evt.target.value }] : []);

        setTimeout(function () {
            $(form).removeData(data_click);
        }, 0);
    });

    $("form[data-ajax=true]").live("submit", function (evt) {
        var clickInfo = $(this).data(data_click) || [];
        evt.preventDefault();
        if (!validate(this)) {
            return;
        }
        asyncRequest(this, {
            url: this.action,
            type: this.method || "GET",
            data: clickInfo.concat($(this).serializeArray())
        });
    });
}(jQuery));

/*
* Note: While Microsoft is not the author of this file, Microsoft is
* offering you a license subject to the terms of the Microsoft Software
* License Terms for Microsoft ASP.NET Model View Controller 3.
* Microsoft reserves all other rights. The notices below are provided
* for informational purposes only and are not the license terms under
* which Microsoft distributed this file.
*
* jQuery validation plug-in 1.7
*
* http://bassistance.de/jquery-plugins/jquery-plugin-validation/
* http://docs.jquery.com/Plugins/Validation
*
* Copyright (c) 2006 - 2008 Jörn Zaefferer
*
* $Id: jquery.validate.js 6403 2009-06-17 14:27:16Z joern.zaefferer $
*
*/

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if (!this.length) {
			options && options.debug && window.console && console.warn( "nothing selected, can't validate, returning nothing" );
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data(this[0], 'validator');
		if ( validator ) {
			return validator;
		}
		
		validator = new $.validator( options, this[0] );
		$.data(this[0], 'validator', validator); 
		
		if ( validator.settings.onsubmit ) {
		
			// allow suppresing validation by adding a cancel class to the submit button
			this.find("input, button").filter(".cancel").click(function() {
				validator.cancelSubmit = true;
			});
			
			// when a submitHandler is used, capture the submitting button
			if (validator.settings.submitHandler) {
				this.find("input, button").filter(":submit").click(function() {
					validator.submitButton = this;
				});
			}
		
			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug )
					// prevent form submit to be able to see console output
					event.preventDefault();
					
				function handle() {
					if ( validator.settings.submitHandler ) {
						if (validator.submitButton) {
							// insert a hidden input as a replacement for the missing submit button
							var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm );
						if (validator.submitButton) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}
					
				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}
		
		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
        if ( $(this[0]).is('form')) {
            return this.validate().form();
        } else {
            var valid = true;
            var validator = $(this[0].form).validate();
            this.each(function() {
				valid &= validator.element(this);
            });
            return valid;
        }
    },
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function(attributes) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function(index, value) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function(command, argument) {
		var element = this[0];
		
		if (command) {
			var settings = $.data(element.form, 'validator').settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				staticRules[element.name] = existingRules;
				if (argument.messages)
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				break;
			case "remove":
				if (!argument) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function(index, method) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}
		
		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.metadataRules(element),
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.staticRules(element)
		), element);
		
		// make sure required is at front
		if (data.required) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}
		
		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function(a) {return !$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function(a) {return !!$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function(a) {return !a.checked;}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function(source, params) {
	if ( arguments.length == 1 ) 
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	if ( arguments.length > 2 && params.constructor != Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor != Array ) {
		params = [ params ];
	}
	$.each(params, function(i, n) {
		source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
	});
	return source;
};

$.extend($.validator, {
	
	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: [],
		ignoreTitle: false,
		onfocusin: function(element) {
			this.lastActive = element;
				
			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				this.settings.unhighlight && this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				this.errorsFor(element).hide();
			}
		},
		onfocusout: function(element) {
			if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
				this.element(element);
			}
		},
		onkeyup: function(element) {
			if ( element.name in this.submitted || element == this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function(element) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted )
				this.element(element);
			// or option elements, check parent select in that case
			else if (element.parentNode.name in this.submitted)
				this.element(element.parentNode);
		},
		highlight: function( element, errorClass, validClass ) {
			$(element).addClass(errorClass).removeClass(validClass);
		},
		unhighlight: function( element, errorClass, validClass ) {
			$(element).removeClass(errorClass).addClass(validClass);
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function(settings) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: "This field is required.",
		remote: "Please fix this field.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		accept: "Please enter a value with a valid extension.",
		maxlength: $.validator.format("Please enter no more than {0} characters."),
		minlength: $.validator.format("Please enter at least {0} characters."),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("Please enter a value less than or equal to {0}."),
		min: $.validator.format("Please enter a value greater than or equal to {0}.")
	},
	
	autoCreateRanges: false,
	
	prototype: {
		
		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();
			
			var groups = (this.groups = {});
			$.each(this.settings.groups, function(key, value) {
				$.each(value.split(/\s/), function(index, name) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function(key, value) {
				rules[key] = $.validator.normalizeRule(value);
			});
			
			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				validator.settings[eventType] && validator.settings[eventType].call(validator, this[0] );
			}
			$(this.currentForm)
				.validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate)
				.validateDelegate(":radio, :checkbox, select, option", "click", delegate);

			if (this.settings.invalidHandler)
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if (!this.valid())
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			this.showErrors();
			return this.valid();
		},
		
		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid(); 
		},
		
		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.clean( element );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element );
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function(errors) {
			if(errors) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function(element) {
					return !(element.name in errors);
				});
			}
			this.settings.showErrors
				? this.settings.showErrors.call( this, this.errorMap, this.errorList )
				: this.defaultShowErrors();
		},
		
		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm )
				$( this.currentForm ).resetForm();
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass );
		},
		
		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},
		
		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj )
				count++;
			return count;
		},
		
		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},
		
		valid: function() {
			return this.size() == 0;
		},
		
		size: function() {
			return this.errorList.length;
		},
		
		focusInvalid: function() {
			if( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},
		
		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function(n) {
				return n.element.name == lastActive.name;
			}).length == 1 && lastActive;
		},
		
		elements: function() {
			var validator = this,
				rulesCache = {};
			
			// select all valid inputs inside the form (no submit or reset buttons)
			// workaround $Query([]).add until http://dev.jquery.com/ticket/2114 is solved
			return $([]).add(this.currentForm.elements)
			.filter(":input")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				!this.name && validator.settings.debug && window.console && console.error( "%o has no name assigned", this);
			
				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
					return false;
				
				rulesCache[this.name] = true;
				return true;
			});
		},
		
		clean: function( selector ) {
			return $( selector )[0];
		},
		
		errors: function() {
			return $( this.settings.errorElement + "." + this.settings.errorClass, this.errorContext );
		},
		
		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},
		
		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},
		
		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},
	
		check: function( element ) {
			element = this.clean( element );
			
			// if radio/checkbox, validate first element in group instead
			if (this.checkable(element)) {
				element = this.findByName( element.name )[0];
			}
			
			var rules = $(element).rules();
			var dependencyMismatch = false;
			for( method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {
					var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );
					
					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result == "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;
					
					if ( result == "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}
					
					if( !result ) {
						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
						 + ", check the '" + rule.method + "' method", e);
					throw e;
				}
			}
			if (dependencyMismatch)
				return;
			if ( this.objectLength(rules) )
				this.successList.push(element);
			return true;
		},
		
		// return the custom message for the given element and validation method
		// specified in the element's "messages" metadata
		customMetaMessage: function(element, method) {
			if (!$.metadata)
				return;
			
			var meta = this.settings.meta
				? $(element).metadata()[this.settings.meta]
				: $(element).metadata();
			
			return meta && meta.messages && meta.messages[method];
		},
		
		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor == String
				? m
				: m[method]);
		},
		
		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if (arguments[i] !== undefined)
					return arguments[i];
			}
			return undefined;
		},
		
		defaultMessage: function( element, method) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customMetaMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},
		
		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message == "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
			}			
			this.errorList.push({
				message: message,
				element: element
			});
			
			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},
		
		addWrapper: function(toToggle) {
			if ( this.settings.wrapper )
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			return toToggle;
		},
		
		defaultShowErrors: function() {
			for ( var i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				this.settings.highlight && this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				this.showLabel( error.element, error.message );
			}
			if( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if (this.settings.success) {
				for ( var i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if (this.settings.unhighlight) {
				for ( var i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},
		
		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},
		
		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},
		
		showLabel: function(element, message) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass().addClass( this.settings.errorClass );
			
				// check if we have a generated label, replace the message then
				label.attr("generated") && label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + "/>")
					.attr({"for":  this.idOrName(element), generated: true})
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length )
					this.settings.errorPlacement
						? this.settings.errorPlacement(label, $(element) )
						: label.insertAfter(element);
			}
			if ( !message && this.settings.success ) {
				label.text("");
				typeof this.settings.success == "string"
					? label.addClass( this.settings.success )
					: this.settings.success( label );
			}
			this.toShow = this.toShow.add(label);
		},
		
		errorsFor: function(element) {
			var name = this.idOrName(element);
    		return this.errors().filter(function() {
				return $(this).attr('for') == name;
			});
		},
		
		idOrName: function(element) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		checkable: function( element ) {
			return /radio|checkbox/i.test(element.type);
		},
		
		findByName: function( name ) {
			// select by name and filter by form for performance over form.find("[name=...]")
			var form = this.currentForm;
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element  || null;
			});
		},
		
		getLength: function(value, element) {
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				return $("option:selected", element).length;
			case 'input':
				if( this.checkable( element) )
					return this.findByName(element.name).filter(':checked').length;
			}
			return value.length;
		},
	
		depend: function(param, element) {
			return this.dependTypes[typeof param]
				? this.dependTypes[typeof param](param, element)
				: true;
		},
	
		dependTypes: {
			"boolean": function(param, element) {
				return param;
			},
			"string": function(param, element) {
				return !!$(param, element.form).length;
			},
			"function": function(param, element) {
				return param(element);
			}
		},
		
		optional: function(element) {
			return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
		},
		
		startRequest: function(element) {
			if (!this.pending[element.name]) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},
		
		stopRequest: function(element, valid) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if (this.pendingRequest < 0)
				this.pendingRequest = 0;
			delete this.pending[element.name];
			if ( valid && this.pendingRequest == 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},
		
		previousValue: function(element) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}
		
	},
	
	classRuleSettings: {
		required: {required: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateISO: {dateISO: true},
		dateDE: {dateDE: true},
		number: {number: true},
		numberDE: {numberDE: true},
		digits: {digits: true},
		creditcard: {creditcard: true}
	},
	
	addClassRules: function(className, rules) {
		className.constructor == String ?
			this.classRuleSettings[className] = rules :
			$.extend(this.classRuleSettings, className);
	},
	
	classRules: function(element) {
		var rules = {};
		var classes = $(element).attr('class');
		classes && $.each(classes.split(' '), function() {
			if (this in $.validator.classRuleSettings) {
				$.extend(rules, $.validator.classRuleSettings[this]);
			}
		});
		return rules;
	},
	
	attributeRules: function(element) {
		var rules = {};
		var $element = $(element);
		
		for (method in $.validator.methods) {
			var value = $element.attr(method);
			if (value) {
				rules[method] = value;
			}
		}
		
		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
			delete rules.maxlength;
		}
		
		return rules;
	},
	
	metadataRules: function(element) {
		if (!$.metadata) return {};
		
		var meta = $.data(element.form, 'validator').settings.meta;
		return meta ?
			$(element).metadata()[meta] :
			$(element).metadata();
	},
	
	staticRules: function(element) {
		var rules = {};
		var validator = $.data(element.form, 'validator');
		if (validator.settings.rules) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},
	
	normalizeRules: function(rules, element) {
		// handle dependency check
		$.each(rules, function(prop, val) {
			// ignore rule when param is explicitly false, eg. required:false
			if (val === false) {
				delete rules[prop];
				return;
			}
			if (val.param || val.depends) {
				var keepRule = true;
				switch (typeof val.depends) {
					case "string":
						keepRule = !!$(val.depends, element.form).length;
						break;
					case "function":
						keepRule = val.depends.call(element, element);
						break;
				}
				if (keepRule) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});
		
		// evaluate parameters
		$.each(rules, function(rule, parameter) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});
		
		// clean number parameters
		$.each(['minlength', 'maxlength', 'min', 'max'], function() {
			if (rules[this]) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			if (rules[this]) {
				rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
			}
		});
		
		if ($.validator.autoCreateRanges) {
			// auto-create ranges
			if (rules.min && rules.max) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if (rules.minlength && rules.maxlength) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}
		
		// To support custom messages in metadata ignore rule methods titled "messages"
		if (rules.messages) {
			delete rules.messages;
		}
		
		return rules;
	},
	
	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function(data) {
		if( typeof data == "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},
	
	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function(name, method, message) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
		if (method.length < 3) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function(value, element, param) {
			// check if dependency is met
			if ( !this.depend(param, element) )
				return "dependency-mismatch";
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			case 'input':
				if ( this.checkable(element) )
					return this.getLength(value, element) > 0;
			default:
				return $.trim(value).length > 0;
			}
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function(value, element, param) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			
			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] )
				this.settings.messages[element.name] = {};
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;
			
			param = typeof param == "string" && {url:param} || param; 
			
			if ( previous.old !== value ) {
				previous.old = value;
				var validator = this;
				this.startRequest(element);
				var data = {};
				data[element.name] = value;
				$.ajax($.extend(true, {
					url: param,
					mode: "abort",
					port: "validate" + element.name,
					dataType: "json",
					data: data,
					success: function(response) {
						validator.settings.messages[element.name].remote = previous.originalMessage;
						var valid = response === true;
						if ( valid ) {
							var submitted = validator.formSubmitted;
							validator.prepareElement(element);
							validator.formSubmitted = submitted;
							validator.successList.push(element);
							validator.showErrors();
						} else {
							var errors = {};
							var message = (previous.message = response || validator.defaultMessage( element, "remote" ));
							errors[element.name] = $.isFunction(message) ? message(value) : message;
							validator.showErrors(errors);
						}
						previous.valid = valid;
						validator.stopRequest(element, valid);
					}
				}, param));
				return "pending";
			} else if( this.pending[element.name] ) {
				return "pending";
			}
			return previous.valid;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) >= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) <= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function(value, element, param) {
			var length = this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},
        
		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function(value, element) {
			return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function(value, element) {
			return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function(value, element) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function(value, element) {
			return this.optional(element) || /^\d+$/.test(value);
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function(value, element) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			// accept only digits and dashes
			if (/[^0-9-]+/.test(value))
				return false;
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				var nDigit = parseInt(cDigit, 10);
				if (bEven) {
					if ((nDigit *= 2) > 9)
						nDigit -= 9;
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) == 0;
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/accept
		accept: function(value, element, param) {
			param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
			return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i")); 
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function(value, element, param) {
			// bind to the blur event of the target in order to revalidate whenever the target field is updated
			// TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
			var target = $(param).unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
				$(element).valid();
			});
			return value == target.val();
		}
		
	}
	
});

// deprecated, use $.validator.format instead
$.format = $.validator.format;

})(jQuery);

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort() 
;(function($) {
	var ajax = $.ajax;
	var pendingRequests = {};
	$.ajax = function(settings) {
		// create settings for compatibility with ajaxSetup
		settings = $.extend(settings, $.extend({}, $.ajaxSettings, settings));
		var port = settings.port;
		if (settings.mode == "abort") {
			if ( pendingRequests[port] ) {
				pendingRequests[port].abort();
			}
			return (pendingRequests[port] = ajax.apply(this, arguments));
		}
		return ajax.apply(this, arguments);
	};
})(jQuery);

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target 
;(function($) {
	// only implement if not provided by jQuery core (since 1.4)
	// TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
	if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'	
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				return $.event.handle.call(this, e);
			}
		});
	};
	$.extend($.fn, {
		validateDelegate: function(delegate, type, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		}
	});
})(jQuery);


/// <reference path="jquery-1.4.4.js" />
/// <reference path="jquery.validate.js" />

/*!
** Unobtrusive validation support library for jQuery and jQuery Validate
** Copyright (C) Microsoft Corporation. All rights reserved.
*/

/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: false */
/*global document: false, jQuery: false */

(function ($) {
    var $jQval = $.validator,
        adapters,
        data_validation = "unobtrusiveValidation";

    function setValidationValues(options, ruleName, value) {
        options.rules[ruleName] = value;
        if (options.message) {
            options.messages[ruleName] = options.message;
        }
    }

    function splitAndTrim(value) {
        return value.replace(/^\s+|\s+$/g, "").split(/\s*,\s*/g);
    }

    function getModelPrefix(fieldName) {
        return fieldName.substr(0, fieldName.lastIndexOf(".") + 1);
    }

    function appendModelPrefix(value, prefix) {
        if (value.indexOf("*.") === 0) {
            value = value.replace("*.", prefix);
        }
        return value;
    }

    function onError(error, inputElement) {  // 'this' is the form element
        var container = $(this).find("[data-valmsg-for='" + inputElement[0].name + "']"),
            replace = $.parseJSON(container.attr("data-valmsg-replace")) !== false;

        container.removeClass("field-validation-valid").addClass("field-validation-error");
        error.data("unobtrusiveContainer", container);

        if (replace) {
            container.empty();
            error.removeClass("input-validation-error").appendTo(container);
        }
        else {
            error.hide();
        }
    }

    function onErrors(form, validator) {  // 'this' is the form element
        var container = $(this).find("[data-valmsg-summary=true]"),
            list = container.find("ul");

        if (list && list.length && validator.errorList.length) {
            list.empty();
            container.addClass("validation-summary-errors").removeClass("validation-summary-valid");

            $.each(validator.errorList, function () {
                $("<li />").html(this.message).appendTo(list);
            });
        }
    }

    function onSuccess(error) {  // 'this' is the form element
        var container = error.data("unobtrusiveContainer"),
            replace = $.parseJSON(container.attr("data-valmsg-replace"));

        if (container) {
            container.addClass("field-validation-valid").removeClass("field-validation-error");
            error.removeData("unobtrusiveContainer");

            if (replace) {
                container.empty();
            }
        }
    }

    function validationInfo(form) {
        var $form = $(form),
            result = $form.data(data_validation);

        if (!result) {
            result = {
                options: {  // options structure passed to jQuery Validate's validate() method
                    errorClass: "input-validation-error",
                    errorElement: "span",
                    errorPlacement: $.proxy(onError, form),
                    invalidHandler: $.proxy(onErrors, form),
                    messages: {},
                    rules: {},
                    success: $.proxy(onSuccess, form)
                },
                attachValidation: function () {
                    $form.validate(this.options);
                },
                validate: function () {  // a validation function that is called by unobtrusive Ajax
                    $form.validate();
                    return $form.valid();
                }
            };
            $form.data(data_validation, result);
        }

        return result;
    }

    $jQval.unobtrusive = {
        adapters: [],

        parseElement: function (element, skipAttach) {
            /// <summary>
            /// Parses a single HTML element for unobtrusive validation attributes.
            /// </summary>
            /// <param name="element" domElement="true">The HTML element to be parsed.</param>
            /// <param name="skipAttach" type="Boolean">[Optional] true to skip attaching the
            /// validation to the form. If parsing just this single element, you should specify true.
            /// If parsing several elements, you should specify false, and manually attach the validation
            /// to the form when you are finished. The default is false.</param>
            var $element = $(element),
                form = $element.parents("form")[0],
                valInfo, rules, messages;

            if (!form) {  // Cannot do client-side validation without a form
                return;
            }

            valInfo = validationInfo(form);
            valInfo.options.rules[element.name] = rules = {};
            valInfo.options.messages[element.name] = messages = {};

            $.each(this.adapters, function () {
                var prefix = "data-val-" + this.name,
                    message = $element.attr(prefix),
                    paramValues = {};

                if (message !== undefined) {  // Compare against undefined, because an empty message is legal (and falsy)
                    prefix += "-";

                    $.each(this.params, function () {
                        paramValues[this] = $element.attr(prefix + this);
                    });

                    this.adapt({
                        element: element,
                        form: form,
                        message: message,
                        params: paramValues,
                        rules: rules,
                        messages: messages
                    });
                }
            });

            jQuery.extend(rules, { "__dummy__": true });

            if (!skipAttach) {
                valInfo.attachValidation();
            }
        },

        parse: function (selector) {
            /// <summary>
            /// Parses all the HTML elements in the specified selector. It looks for input elements decorated
            /// with the [data-val=true] attribute value and enables validation according to the data-val-*
            /// attribute values.
            /// </summary>
            /// <param name="selector" type="String">Any valid jQuery selector.</param>
            $(selector).find(":input[data-val=true]").each(function () {
                $jQval.unobtrusive.parseElement(this, true);
            });

            $("form").each(function () {
                var info = validationInfo(this);
                if (info) {
                    info.attachValidation();
                }
            });
        }
    };

    adapters = $jQval.unobtrusive.adapters;

    adapters.add = function (adapterName, params, fn) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
        /// <param name="params" type="Array" optional="true">[Optional] An array of parameter names (strings) that will
        /// be extracted from the data-val-nnnn-mmmm HTML attributes (where nnnn is the adapter name, and
        /// mmmm is the parameter name).</param>
        /// <param name="fn" type="Function">The function to call, which adapts the values from the HTML
        /// attributes into jQuery Validate rules and/or messages.</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        if (!fn) {  // Called with no params, just a function
            fn = params;
            params = [];
        }
        this.push({ name: adapterName, params: params, adapt: fn });
        return this;
    };

    adapters.addBool = function (adapterName, ruleName) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
        /// the jQuery Validate validation rule has no parameter values.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
        /// <param name="ruleName" type="String" optional="true">[Optional] The name of the jQuery Validate rule. If not provided, the value
        /// of adapterName will be used instead.</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        return this.add(adapterName, function (options) {
            setValidationValues(options, ruleName || adapterName, true);
        });
    };

    adapters.addMinMax = function (adapterName, minRuleName, maxRuleName, minMaxRuleName, minAttribute, maxAttribute) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
        /// the jQuery Validate validation has three potential rules (one for min-only, one for max-only, and
        /// one for min-and-max). The HTML parameters are expected to be named -min and -max.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute (where nnnn is the adapter name).</param>
        /// <param name="minRuleName" type="String">The name of the jQuery Validate rule to be used when you only
        /// have a minimum value.</param>
        /// <param name="maxRuleName" type="String">The name of the jQuery Validate rule to be used when you only
        /// have a maximum value.</param>
        /// <param name="minMaxRuleName" type="String">The name of the jQuery Validate rule to be used when you
        /// have both a minimum and maximum value.</param>
        /// <param name="minAttribute" type="String" optional="true">[Optional] The name of the HTML attribute that
        /// contains the minimum value. The default is "min".</param>
        /// <param name="maxAttribute" type="String" optional="true">[Optional] The name of the HTML attribute that
        /// contains the maximum value. The default is "max".</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        return this.add(adapterName, [minAttribute || "min", maxAttribute || "max"], function (options) {
            var min = options.params.min,
                max = options.params.max;

            if (min && max) {
                setValidationValues(options, minMaxRuleName, [min, max]);
            }
            else if (min) {
                setValidationValues(options, minRuleName, min);
            }
            else if (max) {
                setValidationValues(options, maxRuleName, max);
            }
        });
    };

    adapters.addSingleVal = function (adapterName, attribute, ruleName) {
        /// <summary>Adds a new adapter to convert unobtrusive HTML into a jQuery Validate validation, where
        /// the jQuery Validate validation rule has a single value.</summary>
        /// <param name="adapterName" type="String">The name of the adapter to be added. This matches the name used
        /// in the data-val-nnnn HTML attribute(where nnnn is the adapter name).</param>
        /// <param name="attribute" type="String">[Optional] The name of the HTML attribute that contains the value.
        /// The default is "val".</param>
        /// <param name="ruleName" type="String" optional="true">[Optional] The name of the jQuery Validate rule. If not provided, the value
        /// of adapterName will be used instead.</param>
        /// <returns type="jQuery.validator.unobtrusive.adapters" />
        return this.add(adapterName, [attribute || "val"], function (options) {
            setValidationValues(options, ruleName || adapterName, options.params[attribute]);
        });
    };

    $jQval.addMethod("__dummy__", function (value, element, params) {
        return true;
    });

    $jQval.addMethod("regex", function (value, element, params) {
        var match;
        if (this.optional(element)) {
            return true;
        }

        match = new RegExp(params).exec(value);
        return (match && (match.index === 0) && (match[0].length === value.length));
    });

    adapters.addSingleVal("accept", "exts").addSingleVal("regex", "pattern");
    adapters.addBool("creditcard").addBool("date").addBool("digits").addBool("email").addBool("number").addBool("url");
    adapters.addMinMax("length", "minlength", "maxlength", "rangelength").addMinMax("range", "min", "max", "range");
    adapters.add("equalto", ["other"], function (options) {
        var prefix = getModelPrefix(options.element.name),
            other = options.params.other,
            fullOtherName = appendModelPrefix(other, prefix),
            element = $(options.form).find(":input[name=" + fullOtherName + "]")[0];

        setValidationValues(options, "equalTo", element);
    });
    adapters.add("required", function (options) {
        // jQuery Validate equates "required" with "mandatory" for checkbox elements
        if (options.element.tagName.toUpperCase() !== "INPUT" || options.element.type.toUpperCase() !== "CHECKBOX") {
            setValidationValues(options, "required", true);
        }
    });
    adapters.add("remote", ["url", "type", "additionalfields"], function (options) {
        var value = {
            url: options.params.url,
            type: options.params.type || "GET",
            data: {}
        },
            prefix = getModelPrefix(options.element.name);

        $.each(splitAndTrim(options.params.additionalfields || options.element.name), function (i, fieldName) {
            var paramName = appendModelPrefix(fieldName, prefix);
            value.data[paramName] = function () {
                return $(options.form).find(":input[name='" + paramName + "']").val();
            };
        });

        setValidationValues(options, "remote", value);
    });

    $(function () {
        $jQval.unobtrusive.parse(document);
    });
}(jQuery));

/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

/**
* jQuery.query - Query String Modification and Creation for jQuery
* Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
* Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
* Date: 2009/8/13
*
* @author Blair Mitchelmore
* @version 2.1.7
*
**/
new function (settings) {
    // Various Settings
    var $separator = settings.separator || '&';
    var $spaces = settings.spaces === false ? false : true;
    var $suffix = settings.suffix === false ? '' : '[]';
    var $prefix = settings.prefix === false ? false : true;
    var $hash = $prefix ? settings.hash === true ? "#" : "?" : "";
    var $numbers = settings.numbers === false ? false : true;

    jQuery.query = new function () {
        var is = function (o, t) {
            return o != undefined && o !== null && (!!t ? o.constructor == t : true);
        };
        var parse = function (path) {
            var m, rx = /\[([^[]*)\]/g, match = /^([^[]+)(\[.*\])?$/.exec(path), base = match[1], tokens = [];
            while (m = rx.exec(match[2])) tokens.push(m[1]);
            return [base, tokens];
        };
        var set = function (target, tokens, value) {
            var o, token = tokens.shift();
            if (typeof target != 'object') target = null;
            if (token === "") {
                if (!target) target = [];
                if (is(target, Array)) {
                    target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
                } else if (is(target, Object)) {
                    var i = 0;
                    while (target[i++] != null);
                    target[--i] = tokens.length == 0 ? value : set(target[i], tokens.slice(0), value);
                } else {
                    target = [];
                    target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
                }
            } else if (token && token.match(/^\s*[0-9]+\s*$/)) {
                var index = parseInt(token, 10);
                if (!target) target = [];
                target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
            } else if (token) {
                var index = token.replace(/^\s*|\s*$/g, "");
                if (!target) target = {};
                if (is(target, Array)) {
                    var temp = {};
                    for (var i = 0; i < target.length; ++i) {
                        temp[i] = target[i];
                    }
                    target = temp;
                }
                target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
            } else {
                return value;
            }
            return target;
        };

        var queryObject = function (a) {
            var self = this;
            self.keys = {};

            if (a.queryObject) {
                jQuery.each(a.get(), function (key, val) {
                    self.SET(key, val);
                });
            } else {
                jQuery.each(arguments, function () {
                    var q = "" + this;
                    q = q.replace(/^[?#]/, ''); // remove any leading ? || #
                    q = q.replace(/[;&]$/, ''); // remove any trailing & || ;
                    if ($spaces) q = q.replace(/[+]/g, ' '); // replace +'s with spaces

                    jQuery.each(q.split(/[&;]/), function () {
                        var key = decodeURIComponent(this.split('=')[0] || "");
                        var val = decodeURIComponent(this.split('=')[1] || "");

                        if (!key) return;

                        if ($numbers) {
                            if (/^[+-]?[0-9]+\.[0-9]*$/.test(val)) // simple float regex
                                val = parseFloat(val);
                            else if (/^[+-]?[0-9]+$/.test(val)) // simple int regex
                                val = parseInt(val, 10);
                        }

                        val = (!val && val !== 0) ? true : val;

                        if (val !== false && val !== true && typeof val != 'number')
                            val = val;

                        self.SET(key, val);
                    });
                });
            }
            return self;
        };

        queryObject.prototype = {
            queryObject: true,
            has: function (key, type) {
                var value = this.get(key);
                return is(value, type);
            },
            GET: function (key) {
                if (!is(key)) return this.keys;
                var parsed = parse(key), base = parsed[0], tokens = parsed[1];
                var target = this.keys[base];
                while (target != null && tokens.length != 0) {
                    target = target[tokens.shift()];
                }
                return typeof target == 'number' ? target : target || "";
            },
            get: function (key) {
                var target = this.GET(key);
                if (is(target, Object))
                    return jQuery.extend(true, {}, target);
                else if (is(target, Array))
                    return target.slice(0);
                return target;
            },
            SET: function (key, val) {
                var value = !is(val) ? null : val;
                var parsed = parse(key), base = parsed[0], tokens = parsed[1];
                var target = this.keys[base];
                this.keys[base] = set(target, tokens.slice(0), value);
                return this;
            },
            set: function (key, val) {
                return this.copy().SET(key, val);
            },
            REMOVE: function (key) {
                return this.SET(key, null).COMPACT();
            },
            remove: function (key) {
                return this.copy().REMOVE(key);
            },
            EMPTY: function () {
                var self = this;
                jQuery.each(self.keys, function (key, value) {
                    delete self.keys[key];
                });
                return self;
            },
            load: function (url) {
                var hash = url.replace(/^.*?[#](.+?)(?:\?.+)?$/, "$1");
                var search = url.replace(/^.*?[?](.+?)(?:#.+)?$/, "$1");
                return new queryObject(url.length == search.length ? '' : search, url.length == hash.length ? '' : hash);
            },
            empty: function () {
                return this.copy().EMPTY();
            },
            copy: function () {
                return new queryObject(this);
            },
            COMPACT: function () {
                function build(orig) {
                    var obj = typeof orig == "object" ? is(orig, Array) ? [] : {} : orig;
                    if (typeof orig == 'object') {
                        function add(o, key, value) {
                            if (is(o, Array))
                                o.push(value);
                            else
                                o[key] = value;
                        }
                        jQuery.each(orig, function (key, value) {
                            if (!is(value)) return true;
                            add(obj, key, build(value));
                        });
                    }
                    return obj;
                }
                this.keys = build(this.keys);
                return this;
            },
            compact: function () {
                return this.copy().COMPACT();
            },
            toString: function () {
                var i = 0, queryString = [], chunks = [], self = this;
                var encode = function (str) {
                    str = str + "";
                    if ($spaces) str = str.replace(/ /g, "+");
                    return encodeURIComponent(str);
                };
                var addFields = function (arr, key, value) {
                    if (!is(value) || value === false) return;
                    var o = [encode(key)];
                    if (value !== true) {
                        o.push("=");
                        o.push(encode(value));
                    }
                    arr.push(o.join(""));
                };
                var build = function (obj, base) {
                    var newKey = function (key) {
                        return !base || base == "" ? [key].join("") : [base, "[", key, "]"].join("");
                    };
                    jQuery.each(obj, function (key, value) {
                        if (typeof value == 'object')
                            build(value, newKey(key));
                        else
                            addFields(chunks, newKey(key), value);
                    });
                };

                build(this.keys);

                if (chunks.length > 0) queryString.push($hash);
                queryString.push(chunks.join($separator));

                return queryString.join("");
            }
        };

        return new queryObject(location.search, location.hash);
    };
} (jQuery.query || {}); // Pass in jQuery.query as settings object
