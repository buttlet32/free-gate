(function(window){"use strict";
var mbr = {};

if (localStorage['svt.debug'] && localStorage['svt.debug'] !== 'false') {
    window['mbr' + Math.round(Math.random() * 1000)] = mbr;    
}

mbr.config = {
    _current: {
        apiHost: '%SOVETNIK_API_HOST%',
        storageHost: '%SOVETNIK_STORAGE_HOST%',
        settingsHost: '%SOVETNIK_SETTINGS_HOST%',
        statsDHost: '%SOVETNIK_STATSD_HOST%'
    },

    _production: {
        apiHost: 'https://sovetnik.market.yandex.ru',
        storageHost: 'https://dl.metabar.ru',
        settingsHost: 'https://sovetnik.market.yandex.ru',
        statsDHost: 'https://s.sovetnik.yandex.net'
    },

    /**
     * return true if host is not a template-string
     * @param host
     * @returns {Boolean}
     * @private
     */
    _isPatched: function(host) {
        return !/^%[^%]+%$/.test(host);
    },

    /**
     * get host value by name. If host has been patched, we have current host. Otherwise - host from production
     * @param {String} hostName apiHost, storageHost or settingsHost
     * @returns {String}
     * @private
     */
    _getHost: function(hostName) {
        if (this._current[hostName] && this._isPatched(this._current[hostName])) {
            return this._current[hostName];
        }
        return this._production[hostName];
    },

    getApiHost: function() {
        return this._getHost('apiHost');
    },

    getStorageHost: function() {
        return this._getHost('storageHost');
    },

    getSettingsURL: function() {
        var host = this._getHost('settingsHost');
        if (host === this._production.settingsHost) {
            return host + '/app/settings';
        } else {
            return host + '/sovetnik';
        }
    },

    getSettingsHost: function() {
        return this._getHost('settingsHost');
    },

    getStatsDHost: function() {
        return this._getHost('statsDHost');
    }
};
/*
 * Lightweight JSONP fetcher
 * Copyright 2010-2012 Erik Karlsson. All rights reserved.
 * BSD licensed
 *
 * Usage:
 *
 * JSONP.get( 'someUrl.php', {param1:'123', param2:'456'}, function(data){
 *   //do something with data, which is the JSON object you should retrieve from someUrl.php
 * });
 */
mbr.JSONP = (function() {
    var counter = 0, head, config = {};

    function load(url, pfnError) {
        var script = window.document.createElement('script'),
            done = false;
        script.src = url;
        script.async = true;

        var errorHandler = pfnError || config.error;
        if (typeof errorHandler === 'function') {
            script.onerror = function(ex) {
                errorHandler({url: url, event: ex});
            };
        }

        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                done = true;
                script.onload = script.onreadystatechange = null;
                if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }
        };

        if (!head) {
            head = window.document.getElementsByTagName('head')[0];
        }
        head.appendChild(script);
    }

    function encode(str) {
        //noinspection JSUnresolvedFunction
        return encodeURIComponent(str);
    }

    function jsonp(url, params, callback, callbackName) {
        var query = (url || '').indexOf('?') === -1 ? '?' : '&', key;

        callbackName = (callbackName || config['callbackName'] || 'callback');
        var uniqueName = 'metabar_' + callbackName + "_json" + (++counter);

        params = params || {};
        for (key in params) {
            //noinspection JSUnresolvedFunction
            if (params.hasOwnProperty(key)) {
                query += encode(key) + "=" + encode(params[key]) + "&";
            }
        }

        window[ uniqueName ] = function(data) {
            callback(data);
            try {
                delete window[ uniqueName ];
            } catch (e) {
            }
            window[ uniqueName ] = null;
        };

        load(url + query + callbackName + '=' + uniqueName);
        return uniqueName;
    }

    function setDefaults(obj) {
        config = obj;
    }

    return {
        get: jsonp,
        init: setDefaults
    };
}());
// eo JSONP
var name = "Mediator";var exports = {}; var module = { exports : exports };

/*jslint bitwise: true, nomen: true, plusplus: true, white: true */

/*!
 * Mediator.js Library v0.9.7
 * https://github.com/ajacksified/Mediator.js
 *
 * Copyright 2013, Jack Lawson
 * MIT Licensed (http://www.opensource.org/licenses/mit-license.php)
 *
 * For more information: http://thejacklawson.com/2011/06/mediators-for-modularized-asynchronous-programming-in-javascript/index.html
 * Project on GitHub: https://github.com/ajacksified/Mediator.js
 *
 * Last update: October 19 2013
 */

(function(global, factory) {
    'use strict';

    if(typeof exports !== 'undefined') {
        // Node/CommonJS
        exports.Mediator = factory();
    } else if(typeof define === 'function' && define.amd) {
        // AMD
        define('mediator-js', [], function() {
            global.Mediator = factory();
            return global.Mediator;
        });
    } else {
        // Browser global
        global.Mediator = factory();
    }
}(this, function() {
    'use strict';

    // We'll generate guids for class instances for easy referencing later on.
    // Subscriber instances will have an id that can be refernced for quick
    // lookups.

    function guidGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };

        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    // Subscribers are instances of Mediator Channel registrations. We generate
    // an object instance so that it can be updated later on without having to
    // unregister and re-register. Subscribers are constructed with a function
    // to be called, options object, and context.

    function Subscriber(fn, options, context){
        if(!(this instanceof Subscriber)) {
            return new Subscriber(fn, options, context);
        }

        this.id = guidGenerator();
        this.fn = fn;
        this.options = options;
        this.context = context;
        this.channel = null;
    }

    Subscriber.prototype = {
        // Mediator.update on a subscriber instance can update its function,context,
        // or options object. It takes in an object and looks for fn, context, or
        // options keys.

        update: function(options){
            if(options){
                this.fn = options.fn || this.fn;
                this.context = options.context || this.context;
                this.options = options.options || this.options;
                if(this.channel && this.options && this.options.priority !== undefined) {
                    this.channel.setPriority(this.id, this.options.priority);
                }
            }
        }
    };


    function Channel(namespace, parent){
        if(!(this instanceof Channel)) {
            return new Channel(namespace);
        }

        this.namespace = namespace || "";
        this._subscribers = [];
        this._channels = [];
        this._parent = parent;
        this.stopped = false;
    }

    // A Mediator channel holds a list of sub-channels and subscribers to be fired
    // when Mediator.publish is called on the Mediator instance. It also contains
    // some methods to manipulate its lists of data; only setPriority and
    // StopPropagation are meant to be used. The other methods should be accessed
    // through the Mediator instance.

    Channel.prototype = {
        addSubscriber: function(fn, options, context){
            var subscriber = new Subscriber(fn, options, context);

            if(options && options.priority !== undefined){
                // Cheap hack to either parse as an int or turn it into 0. Runs faster
                // in many browsers than parseInt with the benefit that it won't
                // return a NaN.
                options.priority = options.priority >> 0;

                if(options.priority < 0){ options.priority = 0; }
                if(options.priority >= this._subscribers.length){ options.priority = this._subscribers.length-1; }

                this._subscribers.splice(options.priority, 0, subscriber);
            }else{
                this._subscribers.push(subscriber);
            }

            subscriber.channel = this;

            return subscriber;
        },

        // The channel instance is passed as an argument to the mediator subscriber,
        // and further subscriber propagation can be called with
        // channel.StopPropagation().
        stopPropagation: function(){
            this.stopped = true;
        },

        getSubscriber: function(identifier){
            var x = 0,
                y = this._subscribers.length;

            for(x, y; x < y; x++){
                if(this._subscribers[x].id === identifier || this._subscribers[x].fn === identifier){
                    return this._subscribers[x];
                }
            }
        },

        // Channel.setPriority is useful in updating the order in which Subscribers
        // are called, and takes an identifier (subscriber id or named function) and
        // an array index. It will not search recursively through subchannels.

        setPriority: function(identifier, priority){
            var oldIndex = 0,
                x = 0,
                sub, firstHalf, lastHalf, y;

            for(x = 0, y = this._subscribers.length; x < y; x++){
                if(this._subscribers[x].id === identifier || this._subscribers[x].fn === identifier){
                    break;
                }
                oldIndex ++;
            }

            sub = this._subscribers[oldIndex];
            firstHalf = this._subscribers.slice(0, oldIndex);
            lastHalf = this._subscribers.slice(oldIndex+1);

            this._subscribers = firstHalf.concat(lastHalf);
            this._subscribers.splice(priority, 0, sub);
        },

        addChannel: function(channel){
            this._channels[channel] = new Channel((this.namespace ? this.namespace + ':' : '') + channel, this);
        },

        hasChannel: function(channel){
            return this._channels.hasOwnProperty(channel);
        },

        returnChannel: function(channel){
            return this._channels[channel];
        },

        removeSubscriber: function(identifier){
            var x = this._subscribers.length - 1;

            // If we don't pass in an id, we're clearing all
            if(!identifier){
                this._subscribers = [];
                return;
            }

            // Going backwards makes splicing a whole lot easier.
            for(x; x >= 0; x--) {
                if(this._subscribers[x].fn === identifier || this._subscribers[x].id === identifier){
                    this._subscribers[x].channel = null;
                    this._subscribers.splice(x,1);
                }
            }
        },

        // This will publish arbitrary arguments to a subscriber and then to parent
        // channels.

        publish: function(data){
            var x = 0,
                y = this._subscribers.length,
                called = false,
                subscriber, l,
                subsBefore,subsAfter;

            // Priority is preserved in the _subscribers index.
            for(x, y; x < y; x++) {
                called = false;

                if(!this.stopped){
                    subscriber = this._subscribers[x];
                    if(subscriber.options !== undefined && typeof subscriber.options.predicate === "function"){
                        if(subscriber.options.predicate.apply(subscriber.context, data)){
                            subscriber.fn.apply(subscriber.context, data);
                            called = true;
                        }
                    }else{
                        subsBefore = this._subscribers.length;
                        subscriber.fn.apply(subscriber.context, data);
                        subsAfter = this._subscribers.length;
                        y = subsAfter;
                        if (subsAfter === subsBefore - 1){
                            x--;
                        }
                        called = true;
                    }
                }

                if(called && subscriber.options && subscriber.options !== undefined){
                    subscriber.options.calls--;

                    if(subscriber.options.calls < 1){
                        this.removeSubscriber(subscriber.id);
                        y--;
                        x--;
                    }
                }
            }

            if(this._parent){
                this._parent.publish(data);
            }

            this.stopped = false;
        }
    };

    function Mediator() {
        if(!(this instanceof Mediator)) {
            return new Mediator();
        }

        this._channels = new Channel('');
    }

    // A Mediator instance is the interface through which events are registered
    // and removed from publish channels.

    Mediator.prototype = {

        // Returns a channel instance based on namespace, for example
        // application:chat:message:received

        getChannel: function(namespace){
            var channel = this._channels,
                namespaceHierarchy = namespace.split(':'),
                x = 0,
                y = namespaceHierarchy.length;

            if(namespace === ''){
                return channel;
            }

            if(namespaceHierarchy.length > 0){
                for(x, y; x < y; x++){

                    if(!channel.hasChannel(namespaceHierarchy[x])){
                        channel.addChannel(namespaceHierarchy[x]);
                    }

                    channel = channel.returnChannel(namespaceHierarchy[x]);
                }
            }

            return channel;
        },

        // Pass in a channel namespace, function to be called, options, and context
        // to call the function in to Subscribe. It will create a channel if one
        // does not exist. Options can include a predicate to determine if it
        // should be called (based on the data published to it) and a priority
        // index.

        subscribe: function(channelName, fn, options, context){
            var channel = this.getChannel(channelName);

            options = options || {};
            context = context || {};

            return channel.addSubscriber(fn, options, context);
        },

        // Pass in a channel namespace, function to be called, options, and context
        // to call the function in to Subscribe. It will create a channel if one
        // does not exist. Options can include a predicate to determine if it
        // should be called (based on the data published to it) and a priority
        // index.

        once: function(channelName, fn, options, context){
            options = options || {};
            options.calls = 1;

            return this.subscribe(channelName, fn, options, context);
        },

        // Returns a subscriber for a given subscriber id / named function and
        // channel namespace

        getSubscriber: function(identifier, channel){
            return this.getChannel(channel || "").getSubscriber(identifier);
        },

        // Remove a subscriber from a given channel namespace recursively based on
        // a passed-in subscriber id or named function.

        remove: function(channelName, identifier){
            this.getChannel(channelName).removeSubscriber(identifier);
        },

        // Publishes arbitrary data to a given channel namespace. Channels are
        // called recursively downwards; a post to application:chat will post to
        // application:chat:receive and application:chat:derp:test:beta:bananas.
        // Called using Mediator.publish("application:chat", [ args ]);

        publish: function(channelName){
            var args = Array.prototype.slice.call(arguments, 1),
                channel = this.getChannel(channelName);

            args.push(channel);

            this.getChannel(channelName).publish(args);
        }
    };

    // Alias some common names for easy interop
    Mediator.prototype.on = Mediator.prototype.subscribe;
    Mediator.prototype.bind = Mediator.prototype.subscribe;
    Mediator.prototype.emit = Mediator.prototype.publish;
    Mediator.prototype.trigger = Mediator.prototype.publish;
    Mediator.prototype.off = Mediator.prototype.remove;

    // Finally, expose it all.

    Mediator.Channel = Channel;
    Mediator.Subscriber = Subscriber;
    Mediator.version = "0.9.7";

    return Mediator;
}));
  
mbr[name] = exports[name] || module.exports[name] || module.exports || exports;

var name = "Mustache";var exports = {}; var module = { exports : exports };

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (global, factory) {
    if (typeof exports === "object" && exports) {
        factory(exports); // CommonJS
    } else if (typeof define === "function" && define.amd) {
        define(['exports'], factory); // AMD
    } else {
        factory(global.Mustache = {}); // <script>
    }
}(this, function (mustache) {

    var Object_toString = Object.prototype.toString;
    var isArray = Array.isArray || function (object) {
        return Object_toString.call(object) === '[object Array]';
    };

    function isFunction(object) {
        return typeof object === 'function';
    }

    function escapeRegExp(string) {
        return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }

    // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
    // See https://github.com/janl/mustache.js/issues/189
    var RegExp_test = RegExp.prototype.test;
    function testRegExp(re, string) {
        return RegExp_test.call(re, string);
    }

    var nonSpaceRe = /\S/;
    function isWhitespace(string) {
        return !testRegExp(nonSpaceRe, string);
    }

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var equalsRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;

    /**
     * Breaks up the given `template` string into a tree of tokens. If the `tags`
     * argument is given here it must be an array with two string values: the
     * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
     * course, the default is to use mustaches (i.e. mustache.tags).
     *
     * A token is an array with at least 4 elements. The first element is the
     * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
     * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
     * all text that appears outside a symbol this element is "text".
     *
     * The second element of a token is its "value". For mustache tags this is
     * whatever else was inside the tag besides the opening symbol. For text tokens
     * this is the text itself.
     *
     * The third and fourth elements of the token are the start and end indices,
     * respectively, of the token in the original template.
     *
     * Tokens that are the root node of a subtree contain two more elements: 1) an
     * array of tokens in the subtree and 2) the index in the original template at
     * which the closing tag for that section begins.
     */
    function parseTemplate(template, tags) {
        if (!template)
            return [];

        var sections = [];     // Stack to hold section tokens
        var tokens = [];       // Buffer to hold the tokens
        var spaces = [];       // Indices of whitespace tokens on the current line
        var hasTag = false;    // Is there a {{tag}} on the current line?
        var nonSpace = false;  // Is there a non-space char on the current line?

        // Strips all whitespace tokens array for the current line
        // if there was a {{#tag}} on it and otherwise only space.
        function stripSpace() {
            if (hasTag && !nonSpace) {
                while (spaces.length)
                    delete tokens[spaces.pop()];
            } else {
                spaces = [];
            }

            hasTag = false;
            nonSpace = false;
        }

        var openingTagRe, closingTagRe, closingCurlyRe;
        function compileTags(tags) {
            if (typeof tags === 'string')
                tags = tags.split(spaceRe, 2);

            if (!isArray(tags) || tags.length !== 2)
                throw new Error('Invalid tags: ' + tags);

            openingTagRe = new RegExp(escapeRegExp(tags[0]) + '\\s*');
            closingTagRe = new RegExp('\\s*' + escapeRegExp(tags[1]));
            closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tags[1]));
        }

        compileTags(tags || mustache.tags);

        var scanner = new Scanner(template);

        var start, type, value, chr, token, openSection;
        while (!scanner.eos()) {
            start = scanner.pos;

            // Match any text between tags.
            value = scanner.scanUntil(openingTagRe);

            if (value) {
                for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
                    chr = value.charAt(i);

                    if (isWhitespace(chr)) {
                        spaces.push(tokens.length);
                    } else {
                        nonSpace = true;
                    }

                    tokens.push([ 'text', chr, start, start + 1 ]);
                    start += 1;

                    // Check for whitespace on the current line.
                    if (chr === '\n')
                        stripSpace();
                }
            }

            // Match the opening tag.
            if (!scanner.scan(openingTagRe))
                break;

            hasTag = true;

            // Get the tag type.
            type = scanner.scan(tagRe) || 'name';
            scanner.scan(whiteRe);

            // Get the tag value.
            if (type === '=') {
                value = scanner.scanUntil(equalsRe);
                scanner.scan(equalsRe);
                scanner.scanUntil(closingTagRe);
            } else if (type === '{') {
                value = scanner.scanUntil(closingCurlyRe);
                scanner.scan(curlyRe);
                scanner.scanUntil(closingTagRe);
                type = '&';
            } else {
                value = scanner.scanUntil(closingTagRe);
            }

            // Match the closing tag.
            if (!scanner.scan(closingTagRe))
                throw new Error('Unclosed tag at ' + scanner.pos);

            token = [ type, value, start, scanner.pos ];
            tokens.push(token);

            if (type === '#' || type === '^') {
                sections.push(token);
            } else if (type === '/') {
                // Check section nesting.
                openSection = sections.pop();

                if (!openSection)
                    throw new Error('Unopened section "' + value + '" at ' + start);

                if (openSection[1] !== value)
                    throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
            } else if (type === 'name' || type === '{' || type === '&') {
                nonSpace = true;
            } else if (type === '=') {
                // Set the tags for the next time around.
                compileTags(value);
            }
        }

        // Make sure there are no open sections when we're done.
        openSection = sections.pop();

        if (openSection)
            throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

        return nestTokens(squashTokens(tokens));
    }

    /**
     * Combines the values of consecutive text tokens in the given `tokens` array
     * to a single token.
     */
    function squashTokens(tokens) {
        var squashedTokens = [];

        var token, lastToken;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            token = tokens[i];

            if (token) {
                if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                    lastToken[1] += token[1];
                    lastToken[3] = token[3];
                } else {
                    squashedTokens.push(token);
                    lastToken = token;
                }
            }
        }

        return squashedTokens;
    }

    /**
     * Forms the given array of `tokens` into a nested tree structure where
     * tokens that represent a section have two additional items: 1) an array of
     * all tokens that appear in that section and 2) the index in the original
     * template that represents the end of that section.
     */
    function nestTokens(tokens) {
        var nestedTokens = [];
        var collector = nestedTokens;
        var sections = [];

        var token, section;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                case '^':
                    collector.push(token);
                    sections.push(token);
                    collector = token[4] = [];
                    break;
                case '/':
                    section = sections.pop();
                    section[5] = token[2];
                    collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                    break;
                default:
                    collector.push(token);
            }
        }

        return nestedTokens;
    }

    /**
     * A simple string scanner that is used by the template parser to find
     * tokens in template strings.
     */
    function Scanner(string) {
        this.string = string;
        this.tail = string;
        this.pos = 0;
    }

    /**
     * Returns `true` if the tail is empty (end of string).
     */
    Scanner.prototype.eos = function () {
        return this.tail === "";
    };

    /**
     * Tries to match the given regular expression at the current position.
     * Returns the matched text if it can match, the empty string otherwise.
     */
    Scanner.prototype.scan = function (re) {
        var match = this.tail.match(re);

        if (!match || match.index !== 0)
            return '';

        var string = match[0];

        this.tail = this.tail.substring(string.length);
        this.pos += string.length;

        return string;
    };

    /**
     * Skips all text until the given regular expression can be matched. Returns
     * the skipped string, which is the entire tail if no match can be made.
     */
    Scanner.prototype.scanUntil = function (re) {
        var index = this.tail.search(re), match;

        switch (index) {
            case -1:
                match = this.tail;
                this.tail = "";
                break;
            case 0:
                match = "";
                break;
            default:
                match = this.tail.substring(0, index);
                this.tail = this.tail.substring(index);
        }

        this.pos += match.length;

        return match;
    };

    /**
     * Represents a rendering context by wrapping a view object and
     * maintaining a reference to the parent context.
     */
    function Context(view, parentContext) {
        this.view = view == null ? {} : view;
        this.cache = { '.': this.view };
        this.parent = parentContext;
    }

    /**
     * Creates a new context using the given view with this context
     * as the parent.
     */
    Context.prototype.push = function (view) {
        return new Context(view, this);
    };

    /**
     * Returns the value of the given name in this context, traversing
     * up the context hierarchy if the value is absent in this context's view.
     */
    Context.prototype.lookup = function (name) {
        var cache = this.cache;

        var value;
        if (name in cache) {
            value = cache[name];
        } else {
            var context = this, names, index;

            while (context) {
                if (name.indexOf('.') > 0) {
                    value = context.view;
                    names = name.split('.');
                    index = 0;

                    while (value != null && index < names.length)
                        value = value[names[index++]];
                } else {
                    value = context.view[name];
                }

                if (value != null)
                    break;

                context = context.parent;
            }

            cache[name] = value;
        }

        if (isFunction(value))
            value = value.call(this.view);

        return value;
    };

    /**
     * A Writer knows how to take a stream of tokens and render them to a
     * string, given a context. It also maintains a cache of templates to
     * avoid the need to parse the same template twice.
     */
    function Writer() {
        this.cache = {};
    }

    /**
     * Clears all cached templates in this writer.
     */
    Writer.prototype.clearCache = function () {
        this.cache = {};
    };

    /**
     * Parses and caches the given `template` and returns the array of tokens
     * that is generated from the parse.
     */
    Writer.prototype.parse = function (template, tags) {
        var cache = this.cache;
        var tokens = cache[template];

        if (tokens == null)
            tokens = cache[template] = parseTemplate(template, tags);

        return tokens;
    };

    /**
     * High-level method that is used to render the given `template` with
     * the given `view`.
     *
     * The optional `partials` argument may be an object that contains the
     * names and templates of partials that are used in the template. It may
     * also be a function that is used to load partial templates on the fly
     * that takes a single argument: the name of the partial.
     */
    Writer.prototype.render = function (template, view, partials) {
        var tokens = this.parse(template);
        var context = (view instanceof Context) ? view : new Context(view);
        return this.renderTokens(tokens, context, partials, template);
    };

    /**
     * Low-level method that renders the given array of `tokens` using
     * the given `context` and `partials`.
     *
     * Note: The `originalTemplate` is only ever used to extract the portion
     * of the original template that was contained in a higher-order section.
     * If the template doesn't use higher-order sections, this argument may
     * be omitted.
     */
    Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
        var buffer = '';

        // This function is used to render an arbitrary template
        // in the current context by higher-order sections.
        var self = this;
        function subRender(template) {
            return self.render(template, context, partials);
        }

        var token, value;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                    value = context.lookup(token[1]);

                    if (!value)
                        continue;

                    if (isArray(value)) {
                        for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
                            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
                        }
                    } else if (typeof value === 'object' || typeof value === 'string') {
                        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
                    } else if (isFunction(value)) {
                        if (typeof originalTemplate !== 'string')
                            throw new Error('Cannot use higher-order sections without the original template');

                        // Extract the portion of the original template that the section contains.
                        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

                        if (value != null)
                            buffer += value;
                    } else {
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);
                    }

                    break;
                case '^':
                    value = context.lookup(token[1]);

                    // Use JavaScript's definition of falsy. Include empty arrays.
                    // See https://github.com/janl/mustache.js/issues/186
                    if (!value || (isArray(value) && value.length === 0))
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);

                    break;
                case '>':
                    if (!partials)
                        continue;

                    value = isFunction(partials) ? partials(token[1]) : partials[token[1]];

                    if (value != null)
                        buffer += this.renderTokens(this.parse(value), context, partials, value);

                    break;
                case '&':
                    value = context.lookup(token[1]);

                    if (value != null)
                        buffer += value;

                    break;
                case 'name':
                    value = context.lookup(token[1]);

                    if (value != null)
                        buffer += mustache.escape(value);

                    break;
                case 'text':
                    buffer += token[1];
                    break;
            }
        }

        return buffer;
    };

    mustache.name = "mustache.js";
    mustache.version = "0.8.1";
    mustache.tags = [ "{{", "}}" ];

    // All high-level mustache.* functions use this writer.
    var defaultWriter = new Writer();

    /**
     * Clears all cached templates in the default writer.
     */
    mustache.clearCache = function () {
        return defaultWriter.clearCache();
    };

    /**
     * Parses and caches the given template in the default writer and returns the
     * array of tokens it contains. Doing this ahead of time avoids the need to
     * parse templates on the fly as they are rendered.
     */
    mustache.parse = function (template, tags) {
        return defaultWriter.parse(template, tags);
    };

    /**
     * Renders the `template` with the given `view` and `partials` using the
     * default writer.
     */
    mustache.render = function (template, view, partials) {
        return defaultWriter.render(template, view, partials);
    };

    // This is here for backwards compatibility with 0.4.x.
    mustache.to_html = function (template, view, partials, send) {
        var result = mustache.render(template, view, partials);

        if (isFunction(send)) {
            send(result);
        } else {
            return result;
        }
    };

    // Export the escaping function so that the user may override it.
    // See https://github.com/janl/mustache.js/issues/244
    mustache.escape = escapeHtml;

    // Export these mainly for testing, but also for advanced usage.
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;

}));
mbr[name] = exports[name] || module.exports[name] || module.exports || exports;

var name = "Promise";var exports = {}; var module = { exports : exports };

/**@license MIT-promiscuous-©Ruben Verborgh*/
(function (func, obj) {
    // Type checking utility function
    function is(type, item) { return (typeof item)[0] == type; }

    // Creates a promise, calling callback(resolve, reject), ignoring other parameters.
    function Promise(callback, handler) {
        // The `handler` variable points to the function that will
        // 1) handle a .then(resolved, rejected) call
        // 2) handle a resolve or reject call (if the first argument === `is`)
        // Before 2), `handler` holds a queue of callbacks.
        // After 2), `handler` is a finalized .then handler.
        handler = function pendingHandler(resolved, rejected, value, queue, then, i) {
            function valueHandler(resolved) {
                return function (value) { then && (then = 0, pendingHandler(is, resolved, value)); };
            }

            queue = pendingHandler.q;

            // Case 1) handle a .then(resolved, rejected) call
            if (resolved != is) {
                return Promise(function (resolve, reject) {
                    queue.push({ p: this, r: resolve, j: reject, 1: resolved, 0: rejected });
                });
            }

            // Case 2) handle a resolve or reject call
            // (`resolved` === `is` acts as a sentinel)
            // The actual function signature is
            // .re[ject|solve](<is>, success, value)

            // Check if the value is a promise and try to obtain its `then` method
            if (value && (is(func, value) | is(obj, value))) {
                try { then = value.then; }
                catch (reason) { rejected = 0; value = reason; }
            }
            // If the value is a promise, take over its state
            if (is(func, then)) {
                try { then.call(value, valueHandler(1), rejected = valueHandler(0)); }
                catch (reason) { rejected(reason); }
            }
            // The value is not a promise; handle resolve/reject
            else {
                // Replace this handler with a finalized resolved/rejected handler
                handler = function (Resolved, Rejected) {
                    // If the Resolved or Rejected parameter is not a function,
                    // return the original promise (now stored in the `callback` variable)
                    if (!is(func, (Resolved = rejected ? Resolved : Rejected)))
                        return callback;
                    // Otherwise, return a finalized promise, transforming the value with the function
                    return Promise(function (resolve, reject) { finalize(this, resolve, reject, value, Resolved); });
                };
                // Resolve/reject pending callbacks
                i = 0;
                while (i < queue.length) {
                    then = queue[i++];
                    // If no callback, just resolve/reject the promise
                    if (!is(func, resolved = then[rejected]))
                        (rejected ? then.r : then.j)(value);
                    // Otherwise, resolve/reject the promise with the result of the callback
                    else
                        finalize(then.p, then.r, then.j, value, resolved);
                }
            }
        };
        // The queue of pending callbacks; garbage-collected when handler is resolved/rejected
        handler.q = [];

        // Create and return the promise (reusing the callback variable)
        callback.call(callback = { then:  function (resolved, rejected) { return handler(resolved, rejected); },
                catch: function (rejected)           { return handler(0,        rejected); } },
            function (value)  { handler(is, 1,  value); },
            function (reason) { handler(is, 0, reason); });
        return callback;
    }

    // Finalizes the promise by resolving/rejecting it with the transformed value
    function finalize(promise, resolve, reject, value, transform) {
        setTimeout(function () {
            try {
                // Transform the value through and check whether it's a promise
                value = transform(value);
                transform = value && (is(obj, value) | is(func, value)) && value.then;
                // Return the result if it's not a promise
                if (!is(func, transform))
                    resolve(value);
                // If it's a promise, make sure it's not circular
                else if (value == promise)
                    reject(TypeError());
                // Take over the promise's state
                else
                    transform.call(value, resolve, reject);
            }
            catch (error) { reject(error); }
        });
    }

    // Export the main module
    module.exports = Promise;

    // Creates a resolved promise
    Promise.resolve = ResolvedPromise;
    function ResolvedPromise(value) { return Promise(function (resolve) { resolve(value); }); }

    // Creates a rejected promise
    Promise.reject = function (reason) { return Promise(function (resolve, reject) { reject(reason); }); };

    // Transforms an array of promises into a promise for an array
    Promise.all = function (promises) {
        return Promise(function (resolve, reject, count, values) {
            // Array of collected values
            values = [];
            // Resolve immediately if there are no promises
            count = promises.length || resolve(values);
            // Transform all elements (`map` is shorter than `forEach`)
            promises.map(function (promise, index) {
                ResolvedPromise(promise).then(
                    // Store the value and resolve if it was the last
                    function (value) {
                        values[index] = value;
                        --count || resolve(values);
                    },
                    // Reject if one element fails
                    reject);
            });
        });
    };

    /**
     * Create a pipe for promises.
     * When first promise has resolved, second function will be called.
     * When second promise has resolved, third function will be called.
     * Etc.
     * If some promise has rejected, next function won't be called.
     * @param {[Function]} functions array of functions, which return a promise
     * @param {Object} data param for passing to first function
     */
    Promise.queue = function(functions, data) {
        function _addFunctionToQueue(resolve, reject, args) {
            args = Array.prototype.slice.call(arguments, 2);
            var func = functions.shift();
            if (func) {
                var promise = func.apply(null, args);
                promise.then(function() {
                    var args = Array.prototype.slice.call(arguments);
                    args = [resolve, reject].concat(args);

                    _addFunctionToQueue.apply(null, args);
                }, reject);
            } else {
                resolve.apply(null, args);
            }
        }
        return new Promise(function(resolve, reject) {
            _addFunctionToQueue(resolve,reject, data);
        });
    }
})('f', 'o');
mbr[name] = exports[name] || module.exports[name] || module.exports || exports;

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(s,p){var m={},l=m.lib={},n=function(){},r=l.Base={extend:function(b){n.prototype=this;var h=new n;b&&h.mixIn(b);h.hasOwnProperty("init")||(h.init=function(){h.$super.init.apply(this,arguments)});h.init.prototype=h;h.$super=this;return h},create:function(){var b=this.extend();b.init.apply(b,arguments);return b},init:function(){},mixIn:function(b){for(var h in b)b.hasOwnProperty(h)&&(this[h]=b[h]);b.hasOwnProperty("toString")&&(this.toString=b.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=l.WordArray=r.extend({init:function(b,h){b=this.words=b||[];this.sigBytes=h!=p?h:4*b.length},toString:function(b){return(b||t).stringify(this)},concat:function(b){var h=this.words,a=b.words,j=this.sigBytes;b=b.sigBytes;this.clamp();if(j%4)for(var g=0;g<b;g++)h[j+g>>>2]|=(a[g>>>2]>>>24-8*(g%4)&255)<<24-8*((j+g)%4);else if(65535<a.length)for(g=0;g<b;g+=4)h[j+g>>>2]=a[g>>>2];else h.push.apply(h,a);this.sigBytes+=b;return this},clamp:function(){var b=this.words,h=this.sigBytes;b[h>>>2]&=4294967295<<
32-8*(h%4);b.length=s.ceil(h/4)},clone:function(){var b=r.clone.call(this);b.words=this.words.slice(0);return b},random:function(b){for(var h=[],a=0;a<b;a+=4)h.push(4294967296*s.random()|0);return new q.init(h,b)}}),v=m.enc={},t=v.Hex={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++){var k=a[j>>>2]>>>24-8*(j%4)&255;g.push((k>>>4).toString(16));g.push((k&15).toString(16))}return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j+=2)g[j>>>3]|=parseInt(b.substr(j,
2),16)<<24-4*(j%8);return new q.init(g,a/2)}},a=v.Latin1={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++)g.push(String.fromCharCode(a[j>>>2]>>>24-8*(j%4)&255));return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j++)g[j>>>2]|=(b.charCodeAt(j)&255)<<24-8*(j%4);return new q.init(g,a)}},u=v.Utf8={stringify:function(b){try{return decodeURIComponent(escape(a.stringify(b)))}catch(g){throw Error("Malformed UTF-8 data");}},parse:function(b){return a.parse(unescape(encodeURIComponent(b)))}},
g=l.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(b){"string"==typeof b&&(b=u.parse(b));this._data.concat(b);this._nDataBytes+=b.sigBytes},_process:function(b){var a=this._data,g=a.words,j=a.sigBytes,k=this.blockSize,m=j/(4*k),m=b?s.ceil(m):s.max((m|0)-this._minBufferSize,0);b=m*k;j=s.min(4*b,j);if(b){for(var l=0;l<b;l+=k)this._doProcessBlock(g,l);l=g.splice(0,b);a.sigBytes-=j}return new q.init(l,j)},clone:function(){var b=r.clone.call(this);
b._data=this._data.clone();return b},_minBufferSize:0});l.Hasher=g.extend({cfg:r.extend(),init:function(b){this.cfg=this.cfg.extend(b);this.reset()},reset:function(){g.reset.call(this);this._doReset()},update:function(b){this._append(b);this._process();return this},finalize:function(b){b&&this._append(b);return this._doFinalize()},blockSize:16,_createHelper:function(b){return function(a,g){return(new b.init(g)).finalize(a)}},_createHmacHelper:function(b){return function(a,g){return(new k.HMAC.init(b,
g)).finalize(a)}}});var k=m.algo={};return m}(Math);
(function(s){function p(a,k,b,h,l,j,m){a=a+(k&b|~k&h)+l+m;return(a<<j|a>>>32-j)+k}function m(a,k,b,h,l,j,m){a=a+(k&h|b&~h)+l+m;return(a<<j|a>>>32-j)+k}function l(a,k,b,h,l,j,m){a=a+(k^b^h)+l+m;return(a<<j|a>>>32-j)+k}function n(a,k,b,h,l,j,m){a=a+(b^(k|~h))+l+m;return(a<<j|a>>>32-j)+k}for(var r=CryptoJS,q=r.lib,v=q.WordArray,t=q.Hasher,q=r.algo,a=[],u=0;64>u;u++)a[u]=4294967296*s.abs(s.sin(u+1))|0;q=q.MD5=t.extend({_doReset:function(){this._hash=new v.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(g,k){for(var b=0;16>b;b++){var h=k+b,w=g[h];g[h]=(w<<8|w>>>24)&16711935|(w<<24|w>>>8)&4278255360}var b=this._hash.words,h=g[k+0],w=g[k+1],j=g[k+2],q=g[k+3],r=g[k+4],s=g[k+5],t=g[k+6],u=g[k+7],v=g[k+8],x=g[k+9],y=g[k+10],z=g[k+11],A=g[k+12],B=g[k+13],C=g[k+14],D=g[k+15],c=b[0],d=b[1],e=b[2],f=b[3],c=p(c,d,e,f,h,7,a[0]),f=p(f,c,d,e,w,12,a[1]),e=p(e,f,c,d,j,17,a[2]),d=p(d,e,f,c,q,22,a[3]),c=p(c,d,e,f,r,7,a[4]),f=p(f,c,d,e,s,12,a[5]),e=p(e,f,c,d,t,17,a[6]),d=p(d,e,f,c,u,22,a[7]),
c=p(c,d,e,f,v,7,a[8]),f=p(f,c,d,e,x,12,a[9]),e=p(e,f,c,d,y,17,a[10]),d=p(d,e,f,c,z,22,a[11]),c=p(c,d,e,f,A,7,a[12]),f=p(f,c,d,e,B,12,a[13]),e=p(e,f,c,d,C,17,a[14]),d=p(d,e,f,c,D,22,a[15]),c=m(c,d,e,f,w,5,a[16]),f=m(f,c,d,e,t,9,a[17]),e=m(e,f,c,d,z,14,a[18]),d=m(d,e,f,c,h,20,a[19]),c=m(c,d,e,f,s,5,a[20]),f=m(f,c,d,e,y,9,a[21]),e=m(e,f,c,d,D,14,a[22]),d=m(d,e,f,c,r,20,a[23]),c=m(c,d,e,f,x,5,a[24]),f=m(f,c,d,e,C,9,a[25]),e=m(e,f,c,d,q,14,a[26]),d=m(d,e,f,c,v,20,a[27]),c=m(c,d,e,f,B,5,a[28]),f=m(f,c,
d,e,j,9,a[29]),e=m(e,f,c,d,u,14,a[30]),d=m(d,e,f,c,A,20,a[31]),c=l(c,d,e,f,s,4,a[32]),f=l(f,c,d,e,v,11,a[33]),e=l(e,f,c,d,z,16,a[34]),d=l(d,e,f,c,C,23,a[35]),c=l(c,d,e,f,w,4,a[36]),f=l(f,c,d,e,r,11,a[37]),e=l(e,f,c,d,u,16,a[38]),d=l(d,e,f,c,y,23,a[39]),c=l(c,d,e,f,B,4,a[40]),f=l(f,c,d,e,h,11,a[41]),e=l(e,f,c,d,q,16,a[42]),d=l(d,e,f,c,t,23,a[43]),c=l(c,d,e,f,x,4,a[44]),f=l(f,c,d,e,A,11,a[45]),e=l(e,f,c,d,D,16,a[46]),d=l(d,e,f,c,j,23,a[47]),c=n(c,d,e,f,h,6,a[48]),f=n(f,c,d,e,u,10,a[49]),e=n(e,f,c,d,
C,15,a[50]),d=n(d,e,f,c,s,21,a[51]),c=n(c,d,e,f,A,6,a[52]),f=n(f,c,d,e,q,10,a[53]),e=n(e,f,c,d,y,15,a[54]),d=n(d,e,f,c,w,21,a[55]),c=n(c,d,e,f,v,6,a[56]),f=n(f,c,d,e,D,10,a[57]),e=n(e,f,c,d,t,15,a[58]),d=n(d,e,f,c,B,21,a[59]),c=n(c,d,e,f,r,6,a[60]),f=n(f,c,d,e,z,10,a[61]),e=n(e,f,c,d,j,15,a[62]),d=n(d,e,f,c,x,21,a[63]);b[0]=b[0]+c|0;b[1]=b[1]+d|0;b[2]=b[2]+e|0;b[3]=b[3]+f|0},_doFinalize:function(){var a=this._data,k=a.words,b=8*this._nDataBytes,h=8*a.sigBytes;k[h>>>5]|=128<<24-h%32;var l=s.floor(b/
4294967296);k[(h+64>>>9<<4)+15]=(l<<8|l>>>24)&16711935|(l<<24|l>>>8)&4278255360;k[(h+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;a.sigBytes=4*(k.length+1);this._process();a=this._hash;k=a.words;for(b=0;4>b;b++)h=k[b],k[b]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;return a},clone:function(){var a=t.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=t._createHelper(q);r.HmacMD5=t._createHmacHelper(q)})(Math);

mbr.crypto = CryptoJS;
(function () {
    var cookie = {
        /**
         * set cookie
         * @param {String} name
         * @param {String} value
         * @param {Date} [expires]
         * @param {String} [path]
         * @param {String} [domain]
         */
        set: function(name, value, expires, path, domain) {
            var cookie = name + "=" + window.escape(value) + ";";
            if (expires) {
                // If it's a date
                if (expires instanceof Date) {
                    // If it isn't a valid date
                    if (window.isNaN(expires.getTime())) {
                        expires = new Date();
                    }
                }
                else {
                    expires = new Date(new window.Date().getTime() + window.parseInt(expires, 10) * 1000 * 60 * 60 * 24);
                }
                cookie += "expires=" + expires.toGMTString() + ";";
            }
            if (path) {
                cookie += "path=" + path + ";";
            }
            if (domain) {
                cookie += "domain=" + domain + ";";
            }
            window.document.cookie = cookie;
        },

        /**
         * get cookie
         * @param {String} name
         * @returns {String, null}
         */
        get: function(name) {
            var regexp = new RegExp("(?:^" + name + "|;\\s*" + name + ")=(.*?)(?:;|$)", "g");
            var result = regexp.exec(window.document.cookie);
            return (result === null) ? null : result[1];
        },

        /**
         * remove cookie
         * @param {String} cookie_name
         */
        remove: function(cookie_name) {
            this.set(cookie_name, '', new Date(1970, 1, 1, 1, 1), '/');
        }
    };

    if (typeof(mbr) === 'object') {
        mbr.cookie = cookie;
    } else {
        window.cookie = cookie;
    }
})();

mbr.hub = mbr.hub || {
    init: function() {
        mbr.hub = new mbr.Mediator();
    }
};
'use strict';

mbr.tools = mbr.tools || {

    _months: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],

    /**
     * get document.domain without 'www.' part
     * @param document
     * @returns {*}
     */
    getHostname(document) {
        document = document || window.document;
        let hostname = document.domain;
        if (/^www./.test(hostname)) {
            hostname = hostname.slice(4);
        }
        return hostname;
    },

    isSupportedBrowser() {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let unsupportedBrowserRegexp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

        return !unsupportedBrowserRegexp.test(userAgent);
    },

    /**
    * return true, if element has specified class
    * @param el
    * @param className
    */
    hasClass(el, className) {
        return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1;
    },

    /**
     * return true, if either domain equals to sub or sub is subdomain
     * @param domain
     * @param sub
     */
    isSubdomain(domain, sub) {
        let index = domain.indexOf(sub);
        if (index === -1) {
            return false;
        } else if (index === 0) {
            return true;
        } else {
            return domain[index-1] === '.'; //subdomain
        }
    },

    /**
     * Function for getting Price
     * @param str
     * @returns {XML|string}
     */
    priceAnalyze(str) {
        //delete all spaces for cases like '..54 100..'
        str = str.replace(/\s*/g, '');

        //take a substring '12/12.02/12.000.000 (belarus) asd' from '12 asd 345'
        str = /\d+[\.,`]*[0-9]*[\.,`]*[0-9]*/g.exec(str);

        str = str && str.length && str[0] || '';

        //delete everything except numbers,',' and '.'
        str = str.replace(/[^0-9,\.]/g, '');

        //delete '.' or ',' remained after 'rub.' in price, e.x.
        str = str.replace(/(,|\.)$/g, '');

        //delete cents, last 2 numbers after and '.' or ','
        str = str.replace(/(,|\.)\d\d?$/g, '');

        //delete remained '.' and ','
        str = str.replace(/[.,]/g, '');
        str = str.replace(/`*/g, '');
        return str;
    },

    /**
     * Functions for getting text from HTML element without whitespaces
     * @param {HTMLElement} elem
     * @returns {String}
     */
    getTextContents(elem, useAlt) {
        let res = '';
        for (var i = 0; i < elem.childNodes.length; i++) {
            if (elem.childNodes[i].nodeType == document.TEXT_NODE) {
                res += ' ' + elem.childNodes[i].textContent;
            } else if (useAlt && elem.childNodes[i].alt) {
                res += elem.childNodes[i].alt;
            } else if (elem.childNodes[i].nodeType == document.ELEMENT_NODE) {
                res += ' ' + this.getTextContents(elem.childNodes[i], useAlt);
            }
        }

        res = res.replace(/\s+/g, ' ')
            .replace(/^[^\dA-Za-zА-Яа-я\(\)\.\,\$€]+/, '')
            .replace(/[^\dA-Za-zА-Яа-я\(\)]\.\,\$€+$/, '');
        return res.trim();
    },
    /**
     * return value for queryParam
     * @param {String} url
     * @param {String} queryParam
     * @returns {string}
     */
    getQueryParam(url, queryParam) {
        let params = [];
        let query;
        let queryParams = [queryParam, encodeURIComponent(queryParam)];

        while (url.lastIndexOf('#') !== -1) {
            params = params.concat(url.substr(url.lastIndexOf('#') + 1).split('&'));
            url = url.substr(0, url.lastIndexOf('#'));
        }

        if (url.indexOf('?') != -1) {
            params = params.concat(url.substr(url.indexOf('?') + 1).split('&'));
        }

        if (params) {
            for (var j = 0; j < queryParams.length; j++) {
                for (var i = 0; i < params.length; i++) {
                    if (params[i].indexOf(queryParams[j] + '=') === 0) {
                        query = params[i].substr((queryParams[j] + '=').length);
                        return decodeURIComponent(query.replace(/\+/g, ' '));
                    }
                }
            }
        }
    },

    /**
     * return date with format (DD mon)
     * @param {String} date e.g. '2014-03-21T20:10:00Z'
     */
    formatDate(date) {
        let dateRE = /^\d{4}-(\d{2})-(\d{2})/;
        if (date && dateRE.test(date)) {
            return '(' + RegExp.$2 + ' ' + this._months[parseInt(RegExp.$1, 10) - 1] + ')';
        }
        return '';

    },

    decodeHtml(str) {
        let decodeEntities = (s) => {
            let str;
            let temp = document.createElement('p');
            temp.innerHTML = s;
            str = temp.textContent || temp.text;
            temp = null;
            return str;
        };
        return str.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, ($0, $1) => {
            if ($1[0] === '#') {
                return String.fromCharCode(
                    $1[1].toLowerCase() === 'x' ? parseInt($1.substr(2), 16) : parseInt($1.substr(1), 10)
                );
            } else {
                return decodeEntities('&' + $1 + ';');
            }
        });
    },

    /**
     * Get economy text
     * @param price {String} price from page
     * @param betterPrice {String} price from server API
     * @param currency {String} currency from server API
     * @returns {string} result string
     */
    getProfitText(price, betterPrice, currency) {
        let d = price - betterPrice;
        let text = '';
        if (d > 100 && currency == 'руб.') {
            text += d + ' ' + currency;
        }
        return text;
    },

    /**
     * return true, if month is less than current month
     * @param {Number} month Jan - 1, Dec - 12
     */
    isMonthOfNextYear(month) {
        let currentMonth = new Date().getMonth();
        return month < currentMonth;
    },

    /**
     * Mixin properties of src object to the dst object
     * including all properties in prototype chain up to Object
     * @param {Object} dst
     * @param {Object} src
     */
    mixin(dst, src) {
        let tobj = {};
        for (let x in src) {
            if ((typeof tobj[x] == 'undefined') || (tobj[x] != src[x])) {
                dst[x] = src[x];
            }
        }

        return dst;
    },

    /**
     * log by console if log has been enabled
     * @param data
     * @param logEnabled
     */
    log(data, logEnabled) {
        if (mbr.settings && mbr.settings.isLogEnabled && mbr.settings.isLogEnabled() || logEnabled) {
            console.log(data);
        }
    },

    /**
     * get script tag with price-context
     */
    getPriceContextElement(isWebsite) {
        let scripts = document.getElementsByTagName('script');
        if (isWebsite) {
            for (let i = scripts.length - 1; i >= 0; i--) { //for website partners
                if (scripts[i].src && (scripts[i].src.indexOf('sovetnik.webpartner.min.js') > -1)) {
                    return scripts[i];
                }
            }
        }

        for (let i = 0; i < scripts.length; i++) { //for sovetnik scripts
            let isOurScript = scripts[i].src && (
                    scripts[i].src.indexOf('static/js/ecomerce-context') > -1 ||
                    scripts[i].src.indexOf('sovetnik.min.js') > -1 ||
                    scripts[i].src.indexOf('mbr=') > -1
                );
            if (isOurScript) {
                return scripts[i];
            }
        }
    },

    _clearTemplates() {
        let styleNode = document.getElementById('mbrstl');
        let templateNode = document.getElementById('mbrtmplt');
        if (styleNode) {
            styleNode.parentNode.removeChild(styleNode);
        }
        if (templateNode) {
            templateNode.parentNode.removeChild(templateNode);
        }
    },

    /**
     * remove script node from DOM and remove iframe storage if we don't need it anymore
     * @param {Boolean} [force=false]
     */
    clearPriceContextNodes(force) {
        if (mbr.settings.needCleanDOM()) {
            mbr.hub.on('pipe:reject', () => {
                mbr.log('clear iframe after pipe:reject');

                this._clearTemplates();
                mbr.settings.removeScriptStartedInfo();
                mbr.iframeStorage && mbr.iframeStorage.clear();
            });

            if (force) {
                this._clearTemplates();
                mbr.settings.removeScriptStartedInfo();
                mbr.iframeStorage && mbr.iframeStorage.clear();
            }
        }
    },

    /**
     * get currency name from string. E.g. - if we have '$335' or '324 USD' or 'Price <b> 444 </b> usd' return 'USD'.
     * @param str
     * @returns {String}
     */
    getCurrencyFromStr(str) {
        if (!str) {
            return;
        }
        str = str.toUpperCase();
        const currencyPatterns = [
            {
                pattern: /(?:EUR)|€/,
                currency: 'EUR'
            },
            {
                pattern: /(?:USD)|(?:У\.Е\.)|\$/,
                currency: 'USD'
            },
            {
                pattern: /(?:UAH)|(?:ГРН)|(?:₴)/,
                currency: 'UAH'
            },
            {
                pattern: /(?:RUR)|(?:RUB)|(?:Р\.)|(?:РУБ)/,
                currency: 'RUB'
            },
            {
                pattern: /(?:ТГ)|(?:KZT)|(?:₸)|(?:ТҢГ)|(?:TENGE)|(?:ТЕНГЕ)/,
                currency: 'KZT'
            }
        ];

        let searchResult = currencyPatterns.map((pattern) => {
            return {
                currency: pattern.currency,
                index: str.search(pattern.pattern)
            };
        }).filter((result) => {
            return result.index > -1;
        }).sort((a, b) => {
            return a.index - b.index;
        });

        if (searchResult.length) {
            return searchResult[0].currency;
        }
    },

    /**
     * get one element which doesn't have a common parent with others
     * @param selector
     * @param [filterFunction]
     * @returns {*}
     */
    getDifferentElement(selector, filterFunction) {
        let elements = [].slice.call(document.querySelectorAll(selector));

        if (filterFunction) {
            elements = elements.filter(filterFunction);
        }

        while (elements.length > 1) {
            elements = elements.map((el) => el.parentNode);

            elements = elements.filter((el) => {
                return el && elements.filter((elem) => {
                    return elem === el;
                }).length === 1;
            });
        }
        if (elements.length) {
            try {
                if (elements[0].matches && elements[0].matches(selector)) {
                    return elements[0];
                }
                if (elements[0].matchesSelector && elements[0].matchesSelector(selector)) {
                    return elements[0];
                }
                if (elements[0].webkitMatchesSelector && elements[0].webkitMatchesSelector(selector)) {
                    return elements[0];
                }
            } catch (ex) {
            }

            return elements[0].querySelector && elements[0].querySelector(selector);
        }
    },

    /**
     * get querySelectorAll(selector) but elements with the exact same className
     * @param selector
     */
    getUniqueElements(selector) {
        let elements = [].slice.call(document.querySelectorAll(selector));
        if (elements.length) {
            let elementsWithClass = [];
            let elementsWithoutClass = [];
            let elementsWithItemType = [];

            elements.forEach((el) => {
                if (el.className) {
                    elementsWithClass.push(el);
                } else {
                    elementsWithoutClass.push(el);
                }
            });

            elementsWithClass = elementsWithClass.filter((el) => {
                var className = el.className;

                return elementsWithClass.filter((el) => {
                    return el.className === className;
                }).length === 1;
            });

            elementsWithItemType = elements.filter((el) => {
                return el.getAttribute('itemtype');
            });

            elementsWithItemType = elementsWithItemType.filter((el) => {
                var itemType = el.getAttribute('itemtype');
                return elementsWithItemType.filter((el) => {
                    return el.getAttribute('itemtype') === itemType;
                }).length === 1;
            });

            //if we have elements, we should pick one non-empty array with minimal length
            if (elementsWithoutClass.length || elementsWithClass.length || elementsWithItemType.length) {
                elements = elementsWithItemType;
                if (!elements.length || elementsWithoutClass.length < elements.length) {
                    elements = elementsWithoutClass;
                }
                if (!elements.length || elementsWithClass.length < elements.length) {
                    elements = elementsWithClass;
                }
            }

            if (elements.length > 5) { //catalog or search
                elements = [];
            }
        }
        return elements;
    },

    formatPrice(price, currency) {
        if (currency === 'USD') {
            currency = '$';
        } else if (currency === 'EUR') {
            currency = '€';
        }

        if (typeof price === 'string') {
            price = price.replace(/\D/g, '');
        }

        let priceElements = price.toString().split('');

        price = priceElements.map(function(elem, index) {
            if (index && (priceElements.length - index) % 3 === 0) {
                elem = ' ' + elem;
            }
            return elem;
        }).join('');

        price = price.replace(' .', '.');

        if (currency) {
            price += ' ' + currency;
        }

        return price;
    },

    /**
     * get url to shops detail information (ex. http://market.yandex.ru/shop-info.xml?shop_id=211,234,3678,18063,255)
     * @param {Array} shops array of objects with id field
     * @returns {String|null}
     */
    getShopDetailsUrl(shops) {
        let link = 'http://market.yandex.ru/shop-info.xml?shop_id=';
        let ids = {};
        let idsArr = [];

        shops.forEach((shop) => {
            if (shop.id) {
                ids[shop.id] = true;
            }
        });
        for (let id in ids) {
            if (ids.hasOwnProperty(id)) {
                idsArr.push(id);
            }
        }
        if (idsArr.length) {
            link += idsArr.join(',');
            return link;
        }
        return null;
    },

    getPageHeight() {
        return Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
    },

    getOffsetTop() {
        let top = window.pageYOffset;
        if (!top) {
            let elem = document.documentElement.clientHeight ? document.documentElement : document.body;
            top = elem.scrollTop || 0;
        }
        return top;
    },

    getRandomHash(length) {
        let hash = '';
        let cryptoObj = window.crypto || window.msCrypto;
        if (window.Uint32Array && cryptoObj && cryptoObj.getRandomValues) {
            try {
                let buffer = new window.Uint32Array(Math.round(length / 4 + 1));
                let i = 0;
                cryptoObj.getRandomValues(buffer);
                while (hash.length < length) {
                    hash += buffer[i].toString(36).substr(1);
                    i = (i + 1) % buffer.length;
                }
                hash = hash.substr(0, length);
                return hash;
            } catch (ex) {}
        }

        while (hash.length < length) {
            hash += Math.round(Math.random() * 35).toString(36);
        }
        return hash;
    },

    getGradeText(gradeCount) {
        let additionalText;
        let lastNum = gradeCount % 10;
        if (gradeCount === 0) {
            return 'Нет отзывов';
        }
        if (lastNum === 1) {
            additionalText = 'отзыв';
        } else if (lastNum > 1 && lastNum < 5) {
            additionalText = 'отзыва';
        } else {
            additionalText = 'отзывов';
        }

        return gradeCount + ' ' + additionalText;
    },

    getISBN(text) {
        text = text || '';
        return text
            .split(/[,;]/)
            .map(function(text) {
                text = text.replace(/[^\d\-]/g, '');
                let digits = text.replace(/[\D]/g, '');

                let isbnLength;
                if (digits.length % 13 === 0) {
                    isbnLength = 13;
                } else if (digits.length % 10 === 0) {
                    isbnLength = 10;
                }

                if (isbnLength) {
                    return text.split('')
                        .reduce((res, current) => {
                            let isbnIndex = (res.index / isbnLength) | 0;
                            res.isbn[isbnIndex] = res.isbn[isbnIndex] || '';
                            res.isbn[isbnIndex] += current;

                            if (/\d/.test(current)) {
                                res.index++;
                            }

                            return res;
                        }, {
                            isbn: [],
                            index: 0
                        }).isbn.toString();
                }
            }).reduce((isbn, current) => {
                if (current) {
                    isbn.push(current);
                }
                return isbn;
            }, []).toString();
    },

    getScreenSize() {
        let ratio = window.devicePixelRatio || 1;
        return (window.screen.width * ratio) + 'x' + (window.screen.height * ratio);
    },

    isPlugHunterExist() {
        //let scripts = [...document.querySelectorAll('script')];TODO fix
        let scripts = [].slice.call(document.querySelectorAll('script'));

        return scripts.some((script) => script.src && script.src.indexOf('plughunter.ru') !== -1);
    }
};

mbr.log = mbr.tools.log;
mbr.xhr = {

    /**
     * return true if we can send crossdomain requests
     * @returns {boolean}
     */
    isCORSSupported: function() {
        return !!this._getXHR('https://yandex.ru', 'GET', true);
    },

    /**
     * return XMLHttpRequest with CORS support
     * @returns {*}
     * @private
     */
    _getXHR: function(url, method, withCredentials) {
        var xmlhttp;
        if (typeof XMLHttpRequest !== 'undefined') {
            xmlhttp = new XMLHttpRequest();
        }
        if (withCredentials) {
            if ("withCredentials" in xmlhttp) {
                try {
                    xmlhttp.open(method, url, true);
                    xmlhttp.withCredentials = true;
                } catch(ex) {
                    xmlhttp = null;
                }
            } else {
                xmlhttp = null;
            }
        } else {
            xmlhttp.open(method, url, true);
        }

        return xmlhttp;
    },

    /**
     * get request
     * @param url
     * @param params
     * @param callback
     */
    get: function(url, params, callback, withoutCredentials) {
        var startTime;

        var query = params ? ((url || '').indexOf('?') === -1 ? '?' : '&') : '', key;

        params = params || {};
        var queryArr = [];
        for (key in params) {
            //noinspection JSUnresolvedFunction
            if (params.hasOwnProperty(key)) {
                queryArr.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
            }
        }
        query += queryArr.join('&');

        var xhr = this._getXHR(url + query, 'GET', !withoutCredentials);

        if (!xhr) {
            callback && callback({error: 'CORS not supported'});
        }

        xhr.onreadystatechange = function () {
            if (startTime) {
                var time = new Date().getTime() - startTime;
                mbr && mbr.hub && mbr.hub.trigger('server:responseEnd', time);
            }
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback && callback(JSON.parse(xhr.responseText));
                } else {
                    var errorMessage;
                    if (typeof xhr.status === 'number' || typeof xhr.status === 'string') {
                        errorMessage = xhr.status;

                        if (typeof xhr.statusText === 'string') {
                            errorMessage += ' ' + xhr.statusText;
                        }
                    } else {
                        errorMessage = 'Unknown code';
                    }
                    if (xhr.responseText) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            callback && callback(response);
                            return;
                        } catch(ex) {
                            //
                        }
                    }

                    callback && callback({
                        error: 'Error with XHR',
                        errorMessage: errorMessage
                    });
                }
            }
        };
        startTime = new Date().getTime();
        xhr.send(null);
    },

    post: function(url, obj, callback) {
        var xhr = this._getXHR(url, 'POST', true) || this._getXHR(url, 'POST');

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback && callback(JSON.parse(xhr.responseText));
            }
        };

        xhr.send(JSON.stringify(obj));
    }
};
class SiteInfo {
    constructor(currentDomainData, referrerData) {
        this._currentDomainData = currentDomainData;
        this._referrerData = referrerData;
    }

    get selector() {
        return this._currentDomainData && this._currentDomainData.selector;
    }

    get urlTemplates() {
        return this._currentDomainData && this._currentDomainData.urlTemplates;
    }

    get productPageSelector() {
        return this._currentDomainData && this._currentDomainData.productPageSelector;
    }

    currentDomainDataExists() {
        return !!this._currentDomainData;
    }

    /**
     * return true if rule exists in currentDomainData or referrerData
     * @param {String} rule
     * @param {String} [message] message to log if we have the rule
     * @param {Boolean} [isReferrer] true if we should check referrerData instead of currentDomainData
     * @returns {boolean}
     * @private
     */
    _checkRule(rule, message, isReferrer) {
        var data = isReferrer ? this._referrerData : this._currentDomainData;
        if (data && data.rules && data.rules.length && data.rules.indexOf(rule) > -1) {
            if (message) {
                mbr.log(message);
            }
            return true;
        }
        return false;
    }

    canBeProductPage() {
        let match;
        let url = document.URL;

        if (this.urlTemplates) {
            match = this.urlTemplates.some(template => (new RegExp(template)).test(url));
            if (match) {
                return true;
            }
        } else if (this.productPageSelector) {
            match = document.querySelector(this.productPageSelector);
            if (match) {
                return true;
            }
        } else {
            return true;
        }

        return false;
    }

    isBlacklisted() {
        return this._checkRule('blacklisted', 'domain is blacklisted');
    }

    isYandexWebPartner() {
        return this._checkRule('yandex-web-partner', 'this is webpartner');
    }

    isBlacklistedByReferrer() {
        return this._checkRule('blacklisted-by-referrer', 'blacklisted by referrer', true);
    }

    canUsePriceContext() {
        return !this._checkRule('no-price-context', 'can not use price context');
    }

    canUseMicrodata() {
        return !this._checkRule('no-microdata', 'can not use microdata');
    }

    canExtractPrice() {
        return !this._checkRule('no-price', 'can not extract price');
    }

    canAddRelativePosition() {
        return !this._checkRule('no-relative-position', 'can not add relative position');
    }

    canAddMarginTop() {
        return !this._checkRule('no-margin-top', 'can not add margin-top');
    }

    isReviewSite() {
        return this._checkRule('review', 'this is review site');
    }

    isShop() {
        return this._checkRule('shop', 'this is shop');
    }

    isClassified() {
        return this._checkRule('classified');
    }

    needUseRandomContainer() {
        return this._checkRule('random-container', 'should use random container');
    }
}

mbr.SiteInfo = SiteInfo;


mbr.settings = mbr.settings || {
    _defaultSettings: JSON.parse('{"applicationName":"Sovetnik","affId":1008,"universalScript":true}'),
    _blacklist: {},

    _defaultCampaignPrefix: 'Price Suggest - ',

    /**
     * return true, if either we have a selector for this domain or this domain is domain for avia
     * @param domain
     */
    isKnownHttpsSite(domain) {
        return this.getSelector() || this._siteInfo.currentDomainDataExist() || this.isOurSite(domain);
    },

    /**
     * return true if it's script for yandex web partner's site
     * @returns {Boolean}
     */
    isYandexWebPartner() {
        return !!this._defaultSettings.yandexWebPartner;
    },

    _cacheFromYandexMarket() {
        if (document.URL.indexOf('mvideo') > -1) { //MBR-7377
            var url = document.URL;
            url = url.replace(/\?.+/, '');

            mbr.cookie.set('svt-url', url);
        }
    },

    _isFromYandexMarketCached() {
        return document.URL.indexOf('mvideo') > -1 &&
            document.URL === decodeURIComponent(mbr.cookie.get('svt-url'));
    },

    /**
     * return true if referrer is market.yandex.ru
     * @returns {boolean}
     * @private
     */
    _fromYandexMarket() {
        let res = false;

        if (document.referrer && document.referrer.indexOf('market.yandex') === 0) {
            return true;
        }

        if (this._isFromYandexMarketCached()) {
            return true;
        }

        const ymclid = mbr.tools.getQueryParam(document.URL, 'ymclid');
        return !!ymclid && /^\d+$/.test(ymclid);

    },

    /**
     * return true if url has 'yclid' param
     * @param {String} url
     * @returns {boolean}
     * @private
     */
    _fromDirect(url) {
        return url.indexOf('yclid=') > 0;
    },

    /**
     * return true if domain is *yandex.* or *.ya.*
     * @param domain
     * @private
     */
    _isYandexSite(domain) {
        var secondRE = /([^\.]+?)\.[^\.]+?$/;
        var execRE = secondRE.exec(domain);
        if (execRE && execRE.length > 1) {
            return execRE[1] === 'yandex' || execRE[1] === 'ya';
        }
    },

    /**
     * return true if referrer has a domain from yandexBlackList
     * @param referrer
     * @private
     */
    _fromYandexPartner(referrer) {
        if (referrer) {
            var urlBegin = referrer.replace(/https?:\/\//, '');

            if (this._blacklist.yandexBlackList) {
                for (var i = 0; i < this._blacklist.yandexBlackList.length; i++) {
                    if (urlBegin.indexOf(this._blacklist.yandexBlackList[i]) === 0) {
                        return true;
                    }
                }
            }

            return this._siteInfo.isBlacklistedByReferrer();
        }
        return false;
    },

    /**
     * return false if:
     * 1. sovetnik has been removed
     * 2. offer enabled and it has been rejected
     * 3. _fullBlackList contains the current domain
     * @returns {boolean}
     */
    isSuggestScriptEnabled() {
        var domain = mbr.tools.getHostname(document);

        if (this.isSettingsPage()) {
            return true;
        }

        if (this._settings && this._settings.sovetnikRemoved) {
            mbr.log('sovetnik removed');
            return false;
        }

        if (this._domainDisabled) {
            mbr.hub.trigger('script:domainDisabled', document.domain);
            mbr.hub.trigger('script:disabled', 'DisabledForDomain');
            mbr.log('domain disabled');
            return false;
        }

        if (this.isYandexWebPartner()) {
            return true;
        }

        if (this._settings && this._settings.offerEnabled && this._settings.offer === 'rejected') {
            mbr.hub.trigger('script:disabled', 'EulaNotAccepted');
            mbr.log('offer rejected');
            return false;
        }

        if (document.location.protocol === 'https:' && !this.isKnownHttpsSite(domain)) {
            mbr.hub.trigger('page:unknownHttpsSite', domain);
            mbr.log('unknown https site');
            return false;
        }

        if (this._siteInfo.isBlacklisted() || this._siteInfo.isYandexWebPartner()) {
            mbr.log('full blacklist');
            return false;
        }

        if (this._blacklist.fullBlackList) {
            for (let i = 0; i < this._blacklist.fullBlackList.length; i++) {
                if (domain && mbr.tools.isSubdomain(domain, this._blacklist.fullBlackList[i])) {
                    mbr.hub.trigger('page:fullBlackList', domain);
                    mbr.log('full blacklist');

                    return false;
                }
            }
        }
        if (this._blacklist.yandexWebPartners) {
            for (let i = 0; i < this._blacklist.yandexWebPartners.length; i++) {
                if (domain && mbr.tools.isSubdomain(domain, this._blacklist.yandexWebPartners[i])) {
                    mbr.hub.trigger('page:yandexWebPartners', domain);
                    mbr.log('yandex web partners');
                    return false;
                }
            }
        }

        if (this._isYandexSite(domain)) {
            mbr.log('yandex site');
            return false;
        }
        if (this._fromYandexMarket()) {
            this._cacheFromYandexMarket();
            mbr.hub.trigger('script:disabled', 'fromMarketSite');
            mbr.log('from market');
            return false;
        }

        if (this._fromYandexPartner(document.referrer)) {
            mbr.log('from yandex partner');
            return false;
        }

        return true;
    },

    /**
     * return false if either pcBlacklist contains the domain or it's a main page of site
     * @param {String} domain
     * @returns {boolean}
     */
    isProductSuggestEnabled(domain) {
        if (this.isYandexWebPartner()) {
            return true;
        }

        if (!this._siteInfo.canUsePriceContext()) {
            return false;
        }

        if (this._blacklist.pcBlackList) {
            for (let i = 0; i < this._blacklist.pcBlackList.length; i++) {
                if (domain && mbr.tools.isSubdomain(domain, this._blacklist.pcBlackList[i])) {
                    mbr.log('pc blacklist');
                    return false;
                }
            }
        }

        if (this._fromDirect(document.URL)) {
            mbr.hub.trigger('script:disabled', 'fromYandexDirect');
            mbr.log('from direct');
            return false;
        }

        if (window.location.pathname === '/') {
            mbr.log('main page');
            return false;
        }

        return true;
    },

    /**
    * returns true if current url seems to be product page or if we can't determine that fact, false if not
    * @returns {boolean}
    */
    canBeProductPage() {
        if (this._siteInfo) {
            return this._siteInfo.canBeProductPage();
        } else {
            return true;
        }
    },

    /**
     * return true if priceBlackList doesn't contain a domain
     * @param {String} domain
     * @returns {boolean}
     */
    canExtractPrice(domain) {
        if (domain) {
            if (!this._siteInfo.canExtractPrice()) {
                return false;
            }

            if (this._blacklist.priceBlackList) {
                for (let i = 0; i < this._blacklist.priceBlackList.length; i++) {
                    if (mbr.tools.isSubdomain(domain, this._blacklist.priceBlackList[i])) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    /**
     * return false if microdataBlacklist contains a domain
     * @param domain
     * @returns {boolean}
     */
    canUseMicrodata(domain) {
        if (!this._siteInfo.canUseMicrodata()) {
            return false;
        }
        if (this._blacklist.microdataBlackList) {
            for (let i = 0; i < this._blacklist.microdataBlackList.length; i++) {
                if (domain && mbr.tools.isSubdomain(domain, this._blacklist.microdataBlackList[i])) {
                    return false;
                }
            }
        }
        return true;
    },

    /**
     * required for the pricebar
     * return false if blacklist contains a domain
     * @param domain
     * @returns {boolean}
     */
    canAddRelativePosition: function(domain) {
        if (this._siteInfo && !this._siteInfo.canAddRelativePosition()) {
            return false;
        }
        if (this._blacklist.relativePositionBlacklist) {
            for (let i = 0; i < this._blacklist.relativePositionBlacklist.length; i++) {
                if (domain && mbr.tools.isSubdomain(domain, this._blacklist.relativePositionBlacklist[i])) {
                    return false;
                }
            }
        }

        return true;
    },

    canAddMarginTop: function() {
        return this._siteInfo && this._siteInfo.canAddMarginTop() && !this.isAnti();
    },

    /**
     * return false if selector for current domain exists
     * @returns {boolean}
     */
    canCheckCMS() {
        return !this.getSelector();
    },

    /**
     * return false if selector for current domain exists
     * @returns {boolean}
     */
    canCheckDomain() {
        return !this.getSelector();
    },

    isOurSite(domain) {
        return domain.indexOf('.metabar.ru') > -1 ||
            domain === 'localhost' ||
            domain.indexOf('.yandex.ru') > -1;
    },

    isSettingsPage() {
        return document.URL && document.URL.indexOf(mbr.config.getSettingsHost()) === 0;
    },

    /**
     * get additional classes for pricebar
     * @returns {Null, String}
     */
    getViewModificators() {
        return this._settings && this._settings.view;
    },

    /**
     * get custom pricebar's logo
     * @returns {Null, String}
     */
    getCustomLogo() {
        return this._settings && this._settings.customLogo;
    },

    isUniversalScript() {
        return this._defaultSettings && this._defaultSettings.universalScript;
    },

    getRandomNameLength() {
        if (document.URL.match(/holodilnik\.ru/)) {
            return 7;
        }
        return 13;
    },

    /**
     * return true if we can send client statistics
     * @returns {boolean|*}
     */
    isStatsEnabled() {
        return !(this._settings && this._settings.statsDisabled);
    },

    getContainerId(maxId, needUseSavedContainer) {
        if (needUseSavedContainer) {
            var id = (parseInt(localStorage.containerId, 10) || 0) % maxId;
            localStorage.containerId = id + 1;
            return id;
        } else {
            return Math.round(Math.random() * maxId);
        }
    },

    _onSettingsLoaded(params) {
        this._blacklist = params.blacklist || {};
        this._selector = params.selector;

        this._siteInfo = new mbr.SiteInfo(params.domainData, params.referrerData);

        this._versionSent = params.versionSent;

        mbr.log(params);
    },

    getSelector() {
        let selector = null;
        let match = true;
        let customSelector = mbr.customSelectors[mbr.tools.getHostname()];

        if (this._settings && this._settings.selector) { //for yandex website partners
            return {
                name: this._settings.selector
            };
        }

        this._selector = this._selector || this._siteInfo.selector;

        if (this._selector) {
            selector = this._selector;
        }

        if (customSelector && match) {
            if (!selector) {
                selector = customSelector;
            } else {
                for (var i in customSelector) {
                    if (customSelector.hasOwnProperty(i)) {
                        selector[i] = customSelector[i];
                    }
                }
            }
        }
        return selector;
    },

    /**
     * return true if this site can contain reviews
     * @returns {boolean}
     */
    isReviewSite() {
        if (this._siteInfo.isReviewSite()) {
            return true;
        }

        let selector = this.getSelector();

        return selector && selector === 'review';
    },

    /**
     * for yandex partner's websites
     * partner can pass product's name into script as a query parameter
     * @return {String}
     */
    getProductName() {
        return this._settings && this._settings.productName;
    },

    /**
     * for yandex partner's websites
     * partner can pass market model id into script as a query parameter
     * @return {String}
     */
    getModelId() {
        return this._settings && this._settings.modelId;
    },

    getAppVersion() {
        return '201511181853';
    },

    getAffId() {
        return this._settings && this._settings.affId;
    },

    getClid() {
        return this._settings && this._settings.clid;
    },

    isLogEnabled() {
        return window.localStorage &&
            window.localStorage.getItem('svt.debug') &&
            window.localStorage.getItem('svt.debug') !== 'false';
    },

    /**
     * return true if we're on avito.ru
     * @returns {boolean}
     */
    isAvitoSite() {
        return location.host.indexOf('avito.ru') > -1;
    },

    isAliexpress() {
        return location.host.indexOf('aliexpress.com') > -1;
    },

    isWildberries() {
        return location.host.indexOf('wildberries.ru') > -1;
    },

    isLamoda() {
        return location.host.indexOf('lamoda.ru') > -1;
    },

    isShop() {
        return this._siteInfo.isShop();
    },
    
    isClassified: function() {
        return this._siteInfo && this._siteInfo.isClassified();
    },

    isSilentMode() {
        return this.isYandexWebPartner() && this._settings && this._settings.silent;
    },

    /**
     * return true if we have to remove both script tag and iframe storage after using.
     * @returns {boolean}
     */
    needCleanDOM() {
        return !this._doNotClean && !this.isYandexWebPartner();
    },

    synchronizeSettings() {
        if (mbr.settingsJSON || typeof (settingsJSON) !== 'undefined') {
            if (mbr.settingsJSON) {
                return this.applySettings(mbr.settingsJSON);
            } else {
                return this.applySettings(settingsJSON);
            }
        }
        if (this.isUniversalScript()) {
            return this.applySettingsFromUrl() || mbr.storage.loadSettings().then(this.applySettings.bind(this));
        } else if (this.isYandexWebPartner()) {
            return this.applySettingsFromUrl() || mbr.Promise.resolve();
        }

        return this.applySettingsFromUrl() || mbr.storage.loadSettings().then(this.applySettings.bind(this));
    },

    /**
     * return true if it's elements' extension
     * @returns {boolean}
     */
    isYandexElementsExtension() {
        return !!(mbr.extensionStorage &&
            (this.getAffId() == mbr.extensionStorage.getDefaultAffId() ||
            this.getClid() == mbr.extensionStorage.getDefaultClid()
            )
        );
    },

    /**
     * get offsetY when we have to show pricebar
     */
    getScrollPosition() {
        return +(this._settings && this._settings.startScroll || 0);
    },

    /**
     * get delay before popup in seconds
     * @returns {number}
     */
    getStartDelay() {
        return +(this._settings && this._settings.startDelay || 0);
    },

    /**
     * return unique (for one request) transaction id
     * @returns {string|*}
     */
    getTransactionId() {
        if (!this._transactionId) {
            let currentTime = new Date().getTime();
            currentTime = currentTime.toString(36);

            this._transactionId = currentTime + mbr.tools.getRandomHash(24);
        }
        return this._transactionId;
    },

    /**
     * get document referrer
     * @returns {string}
     */
    getReferrer() {
        return document.referrer;
    },

    canShowAdultOffer() {
        return this._adultOffer !== 'rejected';
    },

    needShowAdultOptIn() {
        return this._adultOffer !== 'accepted';
    },

    /**
     * we can put partner's settings to url by this way:
     * ..../ecomerce-context.js?param=param&settings=<JSON with settings>
     */
    applySettingsFromUrl() {
        let script = mbr.tools.getPriceContextElement(this.isYandexWebPartner());
        const params = ['affId',
            'clid',
            'applicationName',
            'offerEnabled',
            'affSub',
            'autoShowShopList',
            'selector',
            'productName',
            'modelId',
            'startScroll',
            'startDelay',
            'statsDisabled',
            'activeCity',
            'activeCountry',
            'otherRegions',
            'silent'
        ];

        if (script) {
            let settings;
            const settingsString = mbr.tools.getQueryParam(script.src, 'settings');
            if (settingsString) {
                settings = JSON.parse(decodeURIComponent(settingsString));
            } else {
                let param;
                for (let i = 0; i < params.length; i++) {
                    param = mbr.tools.getQueryParam(script.src, params[i]);
                    if (typeof param !== 'undefined') {
                        param = param === 'true' ? true : param === 'false' ? false : param;

                        settings = settings || {};
                        settings[params[i]] = param;
                    }
                }
            }

            script.parentNode && script.parentNode.removeChild(script);

            if (settings) {
                return this.applySettings(settings);
            }
        }
    },

    _formatSettings(settings) {
        let modelId;

        if (settings.hasOwnProperty('modelId')) {
            modelId = Number(settings.modelId);

            if (!(modelId && modelId > 0)) { // check if natural number
                delete settings.modelId;
            }
        }

        return settings;
    },

    applySettings(settings) {
        mbr.log('apply settings');
        mbr.log(settings);
        if (!this._settingsApplied) {
            while (typeof settings === 'string') {
                settings = JSON.parse(settings);
            }
            this._settings = this._settings || {};
            let scriptOwnSettings = {};
            if (settings) {
                settings = this._formatSettings(settings);
                if (this.isYandexWebPartner()) { //if it's partner's website, apply all settings
                    delete this._settings.clid;
                    delete this._settings.affId;

                    for (let i in settings) {
                        if (settings.hasOwnProperty(i)) {
                            this._settings[i] = settings[i];
                        }
                    }
                } else {
                    for (let i in settings) {
                        if (settings.hasOwnProperty(i)) {
                            if (typeof this._settings[i] === 'undefined') {
                                if (i === 'clid') {
                                    //apply clid if only it has whether no tapki or the exact same partner's tapki
                                    if (!this._settings.affId || this._settings.affId == settings.affId) {
                                        this._settings[i] = settings[i];
                                    }
                                } else {
                                    this._settings[i] = settings[i];
                                }
                            }

                            scriptOwnSettings[i] = settings[i];
                        }
                    }
                }
            }

            if (this._defaultSettings) {
                for (let i in this._defaultSettings) {
                    if (this._defaultSettings.hasOwnProperty(i)) {
                        if (typeof this._settings[i] === 'undefined') {
                            if (this.isYandexWebPartner()) { //if it's partner's website, apply all settings
                                this._settings[i] = this._defaultSettings[i];
                            } else if (i === 'clid') {
                                //apply clid if only it has whether no tapki or the exact same partner's tapki
                                if (!this._settings.affId || this._settings.affId == this._defaultSettings.affId) {
                                    this._settings[i] = this._defaultSettings[i];
                                }
                            } else {
                                this._settings[i] = this._defaultSettings[i];
                            }
                        }
                        if (typeof scriptOwnSettings[i] === 'undefined') {
                            scriptOwnSettings[i] = this._defaultSettings[i];
                        }
                    }
                }
            }

            if (this._resolvePostMessage) {
                this._resolvePostMessage();
            }

            this._settingsApplied = true;
        }

        return mbr.Promise.resolve();
    },

    /**
     * save time when script has been started
     * @param time
     */
    saveStartTime(time) {
        this._startTime = time;
    },

    /**
     * get time when script has been started
     * @returns {Number}
     */
    getStartTime() {
        return this._startTime;
    },

    /**
     * get time in ms between current time and DOMContentLoaded event (or script starting)
     * @returns {number}
     */
    getTimeAfterStart() {
        if (window.performance) {
            return new Date().getTime() - window.performance.timing.domContentLoadedEventStart;
        } else {
            return new Date().getTime() - this.getStartTime();
        }
    },

    delayAfterStart(delay) {
        var getTimeAfterStart = this.getTimeAfterStart.bind(this);
        return new mbr.Promise((resolve) => {
            function checkTime() {
                if (getTimeAfterStart() > delay * 1000) {
                    clearInterval(intervalId);
                    resolve();
                }
            }

            var intervalId = setInterval(checkTime, 2000);
        });
    },

    setSetting(name, value) {
        var provider = (mbr.xhr && mbr.xhr.isCORSSupported() || !mbr.JSONP) ? mbr.xhr : mbr.JSONP;

        var settings = {};
        settings[name] = value;
        settings.transactionId = this.getTransactionId();

        var params = {
            settings: JSON.stringify(settings)
        };

        return new mbr.Promise((resolve, reject) => {
            provider.post(mbr.config.getApiHost() + '/settings', params, function(res) {
                mbr.log(res);
                if (res) {
                    resolve();
                    return;
                }
                reject();
            });
        });
    },

    getSettings() {
        return this._settings;
    },

    shouldUseIframeStorage() {
        return !this._settings || !this._settings.extensionStorage;
    },

    isCustomSettingsPageExists() {
        return this._settings && this._settings.customSettingsPage;
    },

    isOptOutEnabled() {
        return !this._settings.optIn;
    },

    getOptInTitle() {
        let clid = this.getClid();
        if (clid == 2210496) {
            return 'SaveFrom.net помощник';
        } else if (clid == 2210499) {
            return 'Instant Translate';
        } else if (clid == 2210240) {
            return 'friGate';
        }
    },

    getOptInImage: function() {
        let clid = this.getClid();
        if (clid == 2210496) {
            return mbr.config.getStorageHost() + '/static/images/save-from.png';
        } else if (clid == 2210499) {
            return mbr.config.getStorageHost() + '/static/images/it.svg';
        } else if (clid == 2210240) {
            return mbr.config.getStorageHost() + '/static/images/frigate.png';
        }
    },

    /**
     * get rights from storage
     */
    init(domain) {
        if (this._loadPromise) {
            return this._loadPromise;
        }

        this._loadPromise = mbr.storage.canUseDomainData()
            .then((canUseDomainData) => {
                let paramsToLoad = {};
                if (canUseDomainData) {
                    paramsToLoad.domainData = mbr.storage.getDomainData(domain);
                    if (!this._settings.extensionStorage && mbr.storage.needSetYSCookie()) {
                        paramsToLoad.versionSent = mbr.storage.get('versionSent', true);
                    } else {
                        paramsToLoad.versionSent = mbr.Promise.resolve(true);
                    }

                    if (document.referrer) {
                        var referrerDomain = document.referrer
                            .replace(/^https?\:\/\//, '')
                            .replace(/\/.*$/, '');
                        if (referrerDomain) {
                            paramsToLoad.referrerData = mbr.storage.getDomainData(referrerDomain);
                        }
                    }
                } else {
                    paramsToLoad.selector = mbr.storage.getSelector(domain);
                    paramsToLoad.blacklist = mbr.storage.get('blacklist');
                }

                let paramsToLoadNames = [];
                let promises = [];
                for (var i in paramsToLoad) {
                    if (paramsToLoad.hasOwnProperty(i)) {
                        paramsToLoadNames.push(i);
                        promises.push(paramsToLoad[i]);
                    }
                }

                return mbr.Promise.all(promises)
                    .then((data) => {
                        var params = {};
                        for (var i=0; i<data.length; i++) {
                            params[paramsToLoadNames[i]] = data[i];
                        }
                        return params;
                    });
            }).then((data) => this._onSettingsLoaded(data));

        return this._loadPromise;
    },

    waitToStartScript() {
        const scrollPosition = this.getScrollPosition();
        const startDelay = this.getStartDelay();

        return new mbr.Promise((resolve) => {
            function onScroll() {
                if (mbr.tools.getOffsetTop() / mbr.tools.getPageHeight() * 100 > scrollPosition) {
                    mbr.log('try run after scroll');
                    if (window.removeEventListener) {
                        window.removeEventListener('scroll', onScroll);
                    } else if (window.detachEvent) {
                        window.detachEvent('onscroll', onScroll);
                    }
                    resolve();
                }
            }

            if (scrollPosition) {
                mbr.log('wait when scroll is ' + scrollPosition + '%');
                if (window.addEventListener) {
                    window.addEventListener('scroll', onScroll, false);
                } else if (window.attachEvent) {
                    window.attachEvent('onscroll', onScroll);
                }
            }
            if (startDelay) {
                mbr.log('wait ' + startDelay + ' seconds');
                mbr.settings.delayAfterStart(startDelay)
                    .then(function() {
                        mbr.log('run after delay');
                        resolve();
                    });
            }

            if (!scrollPosition && !startDelay) {
                mbr.log('run script without delay');
                resolve();
            }
        });
    },

    /**
     * return unique script hash (clid + version)
     * @returns {*}
     * @private
     */
    _getScriptHash() {
        return (this.getClid() || this.getAffId()) + this.getAppVersion();
    },

    /**
     * each script writes uniqueId (clid + version) to document's attribute 'g_init'
     * get all hashes
     * @private
     */
    _getStartedScriptsHashes() {
        let startedScripts = [];
        const started = document.documentElement.getAttribute('g_init');

        if (started) {
            startedScripts = started.split(',');
        }

        return startedScripts;
    },

    /**
     * each script writes uniqueId (clid + version) to document's attribute 'g_init'
     * return true if the attribute had been set before
     */
    isScriptStarted() {
        var currentScriptHash = this._getScriptHash();
        var isStarted = this._getStartedScriptsHashes().filter((hash) => hash === currentScriptHash).length === 1;

        return isStarted;
    },

    /**
     * clear information about current script has been started
     */
    removeScriptStartedInfo() {
        const currentScriptHash = this._getScriptHash();
        const otherScriptsStartedHashes = this._getStartedScriptsHashes().filter((hash) => hash !== currentScriptHash);

        if (otherScriptsStartedHashes.length) {
            document.documentElement.setAttribute('g_init', otherScriptsStartedHashes.join(','));
        } else {
            document.documentElement.removeAttribute('g_init');
        }
    },

    setScriptStarted() {
        const currentScriptHash = this._getScriptHash();
        let scriptStartedHashes = this._getStartedScriptsHashes();

        scriptStartedHashes.push(currentScriptHash);

        document.documentElement.setAttribute('g_init', scriptStartedHashes.join(','));
    },

    needUseRandomContainer() {
        return this._siteInfo && this._siteInfo.needUseRandomContainer();
    },

    /**
     * return true if page has antisovetnik
     * @returns {boolean}
     */
    isAnti() {
        return !!document.querySelector('[checkSovetnik="1"]');
    },

    needSendVersion() {
        return !this._versionSent && this.isSuggestScriptEnabled();
    },

    sendVersionToServer() {
        if (!this.needSendVersion() || !mbr.xhr.isCORSSupported()) {
            mbr.log('i dont need send version');
        } else {
            mbr.log('sending version');
            mbr.xhr.post(mbr.config.getApiHost() + '/sovetnik', {
                version: this.getAppVersion(),
                url: document.URL
            }, () => {
                mbr.log('version has been sent');
                mbr.storage.set('versionSent', true, true);
            });
        }
    }
};
'use strict';

mbr.iframeStorage = mbr.iframeStorage || {
    listeners: {},
    messages: [],
    iframe: {},
    ready: false,
    iframepath: '/static/storage/index.html',
    version: 1,

    generateCookie: function() {
        return Math.round(Math.random() * 9000000);
    },

    sendMessage: function(message) {
        this.iframe.postMessage(message, this.host);
        this.iframe.postMessage(JSON.stringify(message), this.host);
    },

    processMessages: function() {
        while (this.messages.length) {
            var message = this.messages.pop();
            this.sendMessage(message);
        }
    },

    /**
     * create cookie from message and bind it to the callback
     * @param message
     * @param callback
     * @returns {Object} message
     */
    prepareMessage: function(message, callback) {
        var messageCookie = this.generateCookie();
        message.cookie = messageCookie;
        this.listeners[messageCookie] = callback;

        return message;
    },

    /**
     * prepare message and put it to queue
     * @param {Object} message
     * @return {Promise}
     */
    pullMessage: function(message) {
        var promise = new mbr.Promise(function(resolve) {
            message = this.prepareMessage(message, resolve);
        }.bind(this));

        this.messages.push(message);
        if (this.ready) {
            this.processMessages();
        }
        return promise;
    },

    /**
     * get storage version
     * @returns {Promise}
     */
    getVersion: function() {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'get',
            'key': 'version'
        };

        var promise = new mbr.Promise(function(resolve) {
            message = this.prepareMessage(message, resolve);
        }.bind(this));

        this.sendMessage(message);

        return promise;
    },

    /**
     * get key value from metabar localStorage
     * @param {String} key
     * @param {Boolean} [session]
     * @return {Promise}
     */
    get: function(key, session) {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'get',
            'key': key,
            'session': session
        };
        return this.pullMessage(message);
    },
    /**
     * set key value to metabar localStorage
     * @param {String} key
     * @param {*} value
     * @param {Boolean} session
     * @return {Promise}
     */
    set: function(key, value, session) {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'set',
            'key': key,
            'value': value,
            'session': session
        };
        return this.pullMessage(message);
    },

    /**
     * send request for settings
     * @return {Promise}
     */
    loadSettings: function() {
        return this.init(mbr.config.getStorageHost()).then(function() {
            if (this.version > 1) {
                return this._loadSettingsV2();
            } else {
                return this._loadSettingsV1();
            }
        }.bind(this));
    },

    /**
     * send request for settings
     * @returns {Promise}
     * @private
     */
    _loadSettingsV1: function() {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'loadSettings'
        };
        return this.pullMessage(message);
    },

    /**
     * we have split settings to two parts - partner's settings and user's settings.
     * here we have to send 2 messages for getting partner's settings and user's settings and aggregate them
     * @private
     */
    _loadSettingsV2: function() {
        return mbr.Promise.all([
            this._loadPartnerSettings(),
            this._loadUserSettings()
        ]).then(function(settings) {
            var partnerSettings = settings[0];
            var userSettings = settings[1];

            for (var i in partnerSettings) {
                if (partnerSettings.hasOwnProperty(i) && !userSettings.hasOwnProperty(i)) {
                    userSettings[i] = partnerSettings[i];
                }
            }

            return userSettings;
        });
    },

    _loadPartnerSettings: function() {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'loadPartnerSettings'
        };
        return this.pullMessage(message);
    },

    _loadUserSettings: function() {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'loadUserSettings'
        };
        return this.pullMessage(message);
    },

    /**
     * save settings to iframeStorage
     * @param {Object} settings
     */
    saveSettings: function(settings) {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'saveSettings',
            'value': settings
        };
        this.pullMessage(message);
    },

    /**
     * send request for selector
     * @param {String} domain
     * @return {Promise}
     */
    getSelector: function(domain) {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'getSelector',
            'domain': domain
        };
        return this.pullMessage(message);
    },

    getDomainData: function(domain) {
        var domains = [];
        while (domain.indexOf('.') !== -1) {
            domains.push(mbr.crypto.MD5(domain).toString());
            domain = domain.replace(/^[^\.]+\./, '');
        }
        if (domains.toJSON) {
            //fucking prototype.js!
            domains.toJSON = function() {return this; };
        }
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'getDomainInfo',
            'domains': JSON.stringify(domains)
        };

        return this.pullMessage(message);
    },

    canUseDomainData: function() {
        return this.init(mbr.config.getStorageHost()).then(function() {
            return this.version > 2;
        }.bind(this));
    },

    /**
     * send request for cookies
     * @return {Promise}
     */
    getCookies: function() {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'getCookies'
        };
        return this.pullMessage(message);
    },

    /**
     * send request for localStorage
     * @return {Promise}
     */
    getLocalStorage: function() {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'getLocalStorage'
        };
        return this.pullMessage(message);
    },

    /**
     * test iframe's availability
     * @returns {Promise}
     */
    test: function() {
        var message = {
            'type': 'MBR_STORAGE',
            'command': 'testStorage'
        };
        return this.pullMessage(message);
    },

    listener: function(event) {
        var data;
        if (event && event.data) {
            if (typeof event.data === 'string') {
                try {
                    data = JSON.parse(event.data);
                } catch(ex) {
                    return;
                }
            } else {
                data = event.data;
            }

            if (data.cookie && data.type === 'MBR_STORAGE') {
                var callback = this.listeners[data.cookie];
                if (callback) {
                    try {
                        callback(data.value);
                    }
                    catch (e) {
                    }
                    delete this.listeners[data.cookie];
                }
            }

            if (data && data.type === 'MBR_SETTINGS' && data.value) {
                mbr.log('save settings');
                if (mbr.settings.isUniversalScript()) {
                    mbr.settings.applySettings(data.value);
                }
            }
        }

    },

    /**
     * remove iframe from DOM
     */
    clear: function() {
        if (!mbr.settings.isOurSite(mbr.tools.getHostname(document)) &&
            !mbr.settings.isYandexWebPartner() &&
            !mbr.settings.needSendVersion()) {

            this._container && this._container.parentNode && this._container.parentNode.removeChild(this._container);
            this.readyPromise = false;
        }
    },

    init: function(host) {
        if (!this.readyPromise) {
            var storage = this;
            this.readyPromise = new mbr.Promise(function(resolve) {
                storage.host = host;
                var frame = document.createElement("iframe");

                frame.style.display = "none";
                frame.onload = function () {
                    storage.iframe = this.contentWindow;

                    storage.getVersion().then(function(version) {
                        if (version) {
                            storage.version = version;
                        }
                        storage.ready = true;

                        if (storage.messages.length) {
                            storage.processMessages();
                        }
                        resolve();
                    });
                };
                frame.src = storage.host + storage.iframepath + '?version=' + mbr.settings.getAppVersion();
                storage._container = frame;
                document.body.appendChild(frame);
                if (window.addEventListener) {
                    window.addEventListener("message", function () {
                        storage.listener.apply(storage, arguments);
                    }, true);

                } else {
                    window.attachEvent("onmessage", function () {
                        storage.listener.apply(storage, arguments);
                    });
                }
            });
        }


        this.test().then(function(value) {
            if (!value) {
                this.clear();
                mbr.tools.clearPriceContextNodes();
            }
        }.bind(this));

        return this.readyPromise;

    }
};
'use strict';

mbr.storage = mbr.storage || {
    init: function(domain) {
        if (mbr.settings.shouldUseIframeStorage()) {
            return mbr.iframeStorage.init(domain);
        }
        if (mbr.extensionStorage && mbr.extensionStorage.init) {
            return mbr.extensionStorage.init();
        }

        return mbr.Promise.resolve();
    },

    /**
     *
     * @param key
     * @returns {Promise}
     */
    get: function(key, session) {
        if (mbr.extensionStorage) {
            return mbr.extensionStorage.get(key);
        }
        if (mbr.settings.shouldUseIframeStorage()) {
            return mbr.iframeStorage.get(key, session);
        }
        return mbr.Promise.resolve();
    },

    /**
     *
     * @param domain
     * @returns {Promise}
     */
    getSelector: function(domain) {
        if (mbr.extensionStorage) {
            return mbr.extensionStorage.getSelector(domain);
        }
        if (mbr.settings.shouldUseIframeStorage()) {
            return mbr.iframeStorage.getSelector('key');
        }
        return mbr.Promise.resolve();
    },


    /**
     * @returns {Promise}
     */
    loadSettings: function() {
        if (mbr.extensionStorage) {
            return mbr.extensionStorage.loadSettings();
        }
        if (!mbr.settings.shouldUseIframeStorage()) {
            return mbr.environment.getSovetnikInfo();
        }
        return mbr.Promise.resolve({});
    },

    /**
     * return true if we have one file with information about domains
     * @returns {Promise}
     */
    canUseDomainData: function() {
        if (mbr.extensionStorage) {
            return mbr.Promise.resolve(!!mbr.extensionStorage.getDomainData);
        }
        return mbr.Promise.resolve(true);
    },

    getDomainData: function(domain) {
        if (mbr.extensionStorage && mbr.extensionStorage.getDomainData) {
            return mbr.extensionStorage.getDomainData();
        }

        if (mbr.settings.shouldUseIframeStorage()) {
            return mbr.iframeStorage.getDomainData(domain);
        }

        return mbr.environment.getDomainInfo(domain);
    },

    /**
     *
     * @param key
     * @param value
     * @param session
     * @returns {Promise}
     */
    set: function(key, value, session) {
        var storage = mbr.extensionStorage || mbr.iframeStorage;
        return storage.set(key, value, session);
    },

    needSetYSCookie: function() {
        if (mbr.extensionStorage) {
            return !!mbr.extensionStorage.get;
        } else {
            return true;
        }
    }
};
'use strict';

/**
 * object for communication between the script and the page environment through window.postMessage
 */
mbr.environment = mbr.environment || {
    _listeners: {},

    _generateCookie: function() {
        return Math.round(Math.random() * 9000000);
    },

    _sendMessageToExtension: function(command, data) {
        return new mbr.Promise(function(resolve) {
            var listenerId = this._generateCookie();
            this._listeners[listenerId] = resolve;

            var origin = window.location.origin || (window.location.protocol + '//' + window.location.hostname);

            window.postMessage(JSON.stringify({
                type: 'MBR_ENVIRONMENT',
                command: command,
                clid: mbr.settings.getClid(),
                affId: mbr.settings.getAffId(),
                listenerId: listenerId,
                data: data
            }), origin);
        }.bind(this));
    },

    _listenExtensionMessages: function(event) {
        if (event && event.data) {
            var data = event.data;
            var clid = mbr.settings.getClid();
            var affId = mbr.settings.getAffId();


            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch(ex) {
                    return;
                }
            }
            if (typeof data.response === 'undefined') {
                return;
            }

            if (clid) {
                if (clid != data.clid) {
                    return;
                }
            } else if (affId && affId != data.affId) {
                return;
            }

            //message from our extension
            if (data.listenerId && this._listeners[data.listenerId]) {
                this._listeners[data.listenerId](data.response);
            }
        }
    },

    _onSecondScript: function() {
        this._sendMessageToExtension('serverMessage', {type: 'secondScript'});
    },

    _onOfferRejected: function() {
        this._sendMessageToExtension('serverMessage', {type: 'offerRejected'});
    },

    _onDomainDisabled: function() {
        this._sendMessageToExtension('serverMessage', {type: 'domainDisabled', domain: document.domain});
    },

    _showSettingsPage: function() {
        this._sendMessageToExtension('showSettingsPage');
    },

    getDomainInfo: function(domain) {
        return this._sendMessageToExtension('getDomainData', {domain: domain});
    },

    getSovetnikInfo: function() {
        return this._sendMessageToExtension('getSovetnikInfo');
    },

    init: function() {
        mbr.hub.on('script:secondScript', this._onSecondScript, null, this);
        mbr.hub.on('script:offerRejected', this._onOfferRejected, null, this);
        mbr.hub.on('script:domainDisabled', this._onDomainDisabled, null, this);
        mbr.hub.on('pricebar:settingsPage', this._showSettingsPage, null, this);

        if (window.addEventListener) {
            window.addEventListener('message', this._listenExtensionMessages.bind(this));
        } else {
            window.attachEvent('onmessage', this._listenExtensionMessages.bind(this));
        }

        window.postMessage({
            type: 'MBR_ENVIRONMENT'
        }, window.location.origin || (window.location.protocol + '//' + window.location.hostname));
    }
};

'use strict';

mbr.stats = mbr.stats || {

    _cacheStatsdCount: [],

    _statsDHost: mbr.config.getStatsDHost(),

    _sendStatsdMetric: function(url, nameMetric, valueMetric) {
        try {
            var provider = (mbr.xhr && mbr.xhr.isCORSSupported() || !mbr.JSONP) ? mbr.xhr : mbr.JSONP;

            provider.get(url, {
                name: nameMetric,
                value: valueMetric,
                transaction_id: mbr.settings.getTransactionId()
            }, null, true);
        } catch(ex) {}

    },

    /**
     * get partner's unique identifier (clid of aff_id)
     * @returns {Number}
     * @private
     */
    _getClid: function() {
        return mbr.settings &&
            (mbr.settings.getClid && mbr.settings.getClid() ||
            mbr.settings.getAffId && mbr.settings.getAffId()
            );
    },

    /**
     * track stats to statsd
     * @param metricName
     * @param metricValue
     * @private
     */
    _sendStatsdCount: function(metricName, metricValue) {
        var url = this._statsDHost + '/count';

        if (metricName && metricValue) {
            this._cacheStatsdCount.push({
                name: metricName,
                value: metricValue
            });
        }

        if (this._statsdInitialized) {
            var item;

            while (this._cacheStatsdCount.length) {
                item = this._cacheStatsdCount.shift();

                this._sendStatsdMetric(url, item.name.replace('<clid>', this._getClid()), item.value);
            }
        }
    },

    _getDomain: function() {
        return document.domain;
    },

    /**
     * get type view for stats. If view has type 'product' it return 'PriceBar'. If view has type 'avia' it return 'AviaBar'
     * @param {String} type
     * @returns {string}
     * @private
     */
    _getTypeView: function(type) {
        if (type === 'product') {
            return 'PriceBar';
        } else if (type === 'avia') {
            return 'AviaBar';
        }
        return type;
    },

    /**
     * Pricebar has been shown
     * @param {String} type type of view
     */
    trackShow: function(type) {
        var typeBar = this._getTypeView(type).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.shown'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('send PricebarIsShown');
    },

    /**
     * Pricebar has been closed
     */
    trackPriceBarClose: function(type) {
        var typeBar = this._getTypeView(type).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.closed.click'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('send CloseButtonClick');
    },


    /**
     * Pricebar has been disallowed for this domain
     */
    trackDisallowDomain: function(type) {
        var typeBar = this._getTypeView(type).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.settings_dlg.disable_domain.checked'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('send DisableForDomainClick');
    },

    /**
     * Pricebar has been clicked
     * @param {String} type type of popup
     * @param {Boolean} isPriceBarButtonClicked true if user has clicked on button
     * @param {String} target name of element. e.g. "AboutButton", "SettingsButton"
     */
    trackClick: function(type, isPriceBarButtonClicked, target) {
        var typeBar = this._getTypeView(type).toLowerCase();

        type = this._getTypeView(type);

        target = this._getTypeView(target) || target;

        if (target === type) { //for pricebar or aviabar click
            var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.click'
                .replace('<bar_type>', typeBar);

            this._sendStatsdCount(statsDName, 1);
        }

        mbr.log('send PriceBarClick');

    },


    /**
     * Opt-in screen has been showed
     */
    trackOptInShow: function(isBrightOptIn, typeBar) {
        typeBar = this._getTypeView(typeBar).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.optin.shown'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('send opt-in shown');
    },

    /**
     * Eula has been accepted
     */
    trackOptInAccept: function(isBrightOptIn, typeBar) {
        typeBar = this._getTypeView(typeBar).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.optin.accept'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('send opt-in accept');
    },

    /**
     * eula has been declined
     */
    trackOptInDecline: function(isBrightOptIn, typeBar) {
        typeBar = this._getTypeView(typeBar).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.optin.decline'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('send opt in decline');
    },

    trackShowInfoPopup: function(typeBar) {
        typeBar = this._getTypeView(typeBar).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.about_dlg.shown'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);
    },

    trackShowSettingsPopup: function(typeBar) {
        typeBar = this._getTypeView(typeBar).toLowerCase();

        var statsDName = 'suggest_script.<clid>.sitebar.<bar_type>.settings_dlg.shown'
            .replace('<bar_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);
    },


    trackScriptAlreadyWorked: function() {
        var name = 'lastAlreadyWorked';
        var statsDName = 'suggest_script.<clid>.script.stopped.already_worked';

        this._sendStatsdCount(statsDName, 1);

        mbr.storage.get(name).then(function(date) {
            var now = new Date().getTime();

            if (!date || now - parseInt(date, 10) > 86400000) { //one day
                mbr.storage.set(name, now);
            }
        });
    },

    trackScriptDisabled: function(reason) {
        var statsDName = 'suggest_script.<clid>.script.stopped.<reason>'
            .replace('<reason>', reason);

        if (reason === 'EulaNotAccepted') {
            var name = 'lastEulaNotAccepted';

            mbr.storage.get(name).then(function(date) {
                var now = new Date().getTime();

                if (!date || now - parseInt(date, 10) > 86400000) { //one day
                    mbr.storage.set(name, now);
                }
            });
        } else {
            this._sendStatsdCount(statsDName, 1); //don't send if reason is EulaNotAccepted
        }

        mbr.log('script stopped ' + reason);
    },

    trackShopListShown: function(isShopList) {
        var typeBar = isShopList ? 'shop_list' : 'dress_carousel';

        var statsDName = 'suggest_script.<clid>.popup.<popup_type>.shown'
            .replace('<popup_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('Shoplist is shown');
    },

    trackShopClick: function(typeClick, typeOffer, isShopList) {
        var typeBar = isShopList ? 'shop_list' : 'dress_carousel';

        var statsDName = 'suggest_script.<clid>.popup.<popup_type>.offerslist.<type_click>.click'
            .replace('<type_click>', typeClick.toLowerCase())
            .replace('<popup_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);

        mbr.log('shop clicked + ' + typeClick + ' + ' + typeOffer);
    },

    trackShopListCloseClick: function(isShopList) {
        var typeBar = isShopList ? 'shop_list' : 'dress_carousel';

        var statsDName = 'suggest_script.<clid>.popup.<popup_type>.closed.click'
            .replace('<popup_type>', typeBar);

        this._sendStatsdCount(statsDName, 1);
    },

    trackAbTestInfo: function(bucketInfo) {
        for (var abTestName in bucketInfo) {
            if (bucketInfo.hasOwnProperty(abTestName)) {
                var statsDName = 'suggest_script.<clid>.script.abtest.' + abTestName + '.' + bucketInfo[abTestName];
                this._sendStatsdCount(statsDName, 1);
            }
        }
    },

    trackUnacceptableAction: function(wrongParam) {
        var url = this._statsDHost + '/count';
        var statsdName = 'suggest_script.<clid>.script.error.' + wrongParam;
        statsdName = statsdName.replace('<clid>', this._getClid());

        this._sendStatsdMetric(url, statsdName, 1);

        mbr.log('Unacceptable action');
    },

    trackWrongProduct: function() {
        var url = this._statsDHost + '/count';
        var statsdName = 'suggest_script.<clid>.script.wrong_product'.replace('<clid>', this._getClid());
        this._sendStatsdMetric(url, statsdName, 1);

        mbr.log('track wrong product');
    },


    init: function() {
        if (!this._initialized) {
            this._initialized = true;

            mbr.hub.on('script:unacceptableAction', function(wrongParam) {
                this.trackUnacceptableAction(wrongParam);
            }, null, this);

            mbr.hub.on('script:wrongProduct', this.trackWrongProduct, null, this);
        }
    }
};

mbr.suggest = mbr.suggest || {

    _host: mbr.config.getApiHost(),
    /**
     * add affId, version, affSub and source to the params object
     * @param {Object} params
     * @private
     */
    _addScriptDataToParams(params) {
        let result = {};

        const settings = mbr.settings.getSettings && mbr.settings.getSettings();
        const version = mbr.settings.getAppVersion && mbr.settings.getAppVersion();
        const transactionId = mbr.settings.getTransactionId && mbr.settings.getTransactionId();
        const isShop = mbr.settings.isShop && mbr.settings.isShop();
        const isYandexWebPartner = mbr.settings.isYandexWebPartner && mbr.settings.isYandexWebPartner();
        const referrer = mbr.settings.getReferrer && mbr.settings.getReferrer();
        const adult = mbr.settings.canShowAdultOffer && mbr.settings.canShowAdultOffer();
        const antiSovetnik = mbr.settings.isAnti && mbr.settings.isAnti();
        const screenSize = mbr.tools.getScreenSize && mbr.tools.getScreenSize();
        const isPlugHunter = mbr.tools.isPlugHunterExist && mbr.tools.isPlugHunterExist();

        if (version) {
            result.v = version;
        }

        if (transactionId) {
            result.transaction_id = transactionId;
        }

        if (isShop) {
            result.is_shop = true;
        }

        if (settings) {
            result.settings = JSON.stringify(settings);
        }

        if (isYandexWebPartner) {
            result.webpartner = isYandexWebPartner;
        }

        if (referrer) {
            result.referrer = referrer;
        }

        if (adult) {
            result.adult = adult;
        }

        if (antiSovetnik) {
            result.as = antiSovetnik;
        }

        if (isPlugHunter) {
            result.ph = isPlugHunter;
        }

        if (screenSize) {
            result.screen = screenSize;
        }
        
        for (var i in params) {
            if (params.hasOwnProperty(i)) {
                result[i] = params[i];
            }
        }
        return result;
    },

    /**
     * give the best approach for getting data from the server
     * Provider is the xhr if CORS is allowed for current environment.
     * Otherwise we need use JSONP
     * @returns {Object}
     * @private
     */
    _getNetProvider: function() {
        return (mbr.xhr && mbr.xhr.isCORSSupported() || !mbr.JSONP) ? mbr.xhr : mbr.JSONP;
    },

    _getURL: function(url, params) {
        var query = (url || '').indexOf('?') === -1 ? '?' : '&', key;

        params = params || {};
        var queryArr = [];
        for (key in params) {
            //noinspection JSUnresolvedFunction
            if (params.hasOwnProperty(key)) {
                queryArr.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
            }
        }
        query += queryArr.join('&');

        return url + query;
    },

    /**
     *
     * @param {Object} data
     * @param {String} data.name
     * @param {Number} [data.price]
     * @param {String} data.url
     * @param {String} [data.modelId]
     */
    getProductOffers: function (data) {
        mbr.log('get offers');
        if (data.name) {
            data.text = data.name;
            delete data.name;
        }

        if (data.price) {
            if (typeof data.price === 'string') {
                data.price = parseInt(data.price, 10);
            }
            if (!(data.price > 0)) {
                delete data.price;
            }
        }

        data = this._addScriptDataToParams(data);

        mbr.log('get lowest price');
        mbr.log(data);
        var provider = this._getNetProvider();

        data.query = this._getURL(this._host + '/products?', data);

        this._requestSent = true;
        return new mbr.Promise(function(resolve, reject) {
            provider.get(data.query, null, function(res) {
                if (res.bucketInfo) {
                    mbr.hub.trigger('suggest:abtest', res.bucketInfo);
                }
                if (!res.error && res.offers && res.offers.length && res.offers[0].price ) {
                    res.original = data;
                    var originalPrice = res.searchInfo && res.searchInfo.convertedPrice && res.searchInfo.convertedPrice.value;

                    var convertedPrice = 0;
                    if (res.searchInfo && res.searchInfo.convertedPrice) {
                        convertedPrice = res.searchInfo.convertedPrice.value;
                    } else {
                        convertedPrice = res.convertedPrice;
                    }

                    res.offers = res.offers.map(function(offer) {
                        offer.price.value = Math.round(
                            parseFloat(offer.price.value)
                        );

                        if (convertedPrice) {
                            offer.price.isHigherThanCurrent = offer.price.value > convertedPrice;
                            offer.price.isEqualToCurrent = offer.price.value === convertedPrice;
                            offer.price.isLowerThanCurrent = offer.price.value < convertedPrice;
                        }

                        return offer;
                    });

                    res.method = data.method;

                    mbr.log('offers found');
                    mbr.log(res);
                    mbr.hub.trigger('suggest:productOfferFound', res);
                    resolve(res);
                } else {
                    mbr.log('have not offers');
                    if (res.rules && res.rules.length) {
                        res.rules.forEach(function(rule) {
                            if (rule === 'second-script') {
                                mbr.hub.trigger('script:secondScript');
                            } else if (rule === 'offer-rejected') {
                                mbr.hub.trigger('script:offer', false);
                            } else if (rule === 'domain-disabled') {
                                mbr.hub.trigger('script:domainDisabled', document.domain);
                            }
                        });
                    }

                    reject(res);
                }
            });
        });

    },

    /**
     * get offer for avia
     * @param {Object} info
     * @param {String} info.origin
     * @param {String} info.destination
     * @param {String} info.departure_at
     * @param {String} info.return_at
     * @param {String} info.price
     * @param {String} [info.person]
     * @param {String} [info.currency]
     * @returns {Promise}
     */
    getFlights: function (info) {
        mbr.log(info);
        if (info.origin && info.destination && info.departure_at && info.return_at) {
            var params = {
                origin: info.origin,
                destination: info.destination,
                departure_at: info.departure_at,
                return_at: info.return_at,
                url: info.url
            };

            if (info.price) {
                params.price = info.person ? info.price / info.person : info.price;
            }

            if (info.currency) {
                params.currency = info.currency;
            }


            params = this._addScriptDataToParams(params);
            var provider = this._getNetProvider();

            info.query = this._getURL(this._host + '/avia?', params);

            this._requestSent = true;
            return new mbr.Promise(function(resolve, reject) {
                provider.get(info.query, null, function(data) {
                    if (data && data.avia && data.avia.length) {
                        data.avia[0].original = info;

                        mbr.log('avia found');
                        mbr.log(data);
                        mbr.hub.trigger('suggest:aviaFound', data.avia[0]);
                        resolve(data);
                    } else {
                        reject(data);
                    }
                });
            });
        }
        return mbr.Promise.reject();
    },

    /**
     * return true if request to suggest has been sent
     */
    isRequestSent: function() {
        return !!this._requestSent;
    }
};
/**
 * Sometimes we can't extract product's information with either querySelector or querySelectorAll
 * Therefore we can create custom extractors for specific cases.
 * An extractor should contain at least one of methods: 'getName', 'getPrice', 'getCurrency'
 */
mbr.customSelectors = {
    "aliexpress.com": {
        /**
         * return first string without russian letters.
         * @param {Array} names
         * @returns {String}
         * @private
         */
        _tryGetEnglishName: function(names) {
            names = names || [];
            names = names.filter(function(name) {
                return name !== 'oem' && name !== 'new' && name.indexOf('Другой') === -1;
            });

            if (!names.length) {
                return '';
            }


            var ruRE = /[а-яА-Я]/;
            var englishNames = names.filter(function(name) {
                return !ruRE.test(name);
            });
            if (englishNames.length) {
                return englishNames[0];
            }
            if (names[0].indexOf('Яблоко') > -1 || names[0].indexOf('яблоко') > -1) {
                return 'Apple';
            }
            return names[0];
        },

        _getNameByCategoryRegex: function(info, regex) {
            return this._tryGetEnglishName(info.filter(function(item) {
                return regex.test(item.innerHTML);
            }).map(function(item) {
                return mbr.tools.getTextContents(item.querySelector('dd')).toLowerCase();
            }));
        },

        getName: function() {
            var name = '';

            var brandRE = /^(Фирменное\sнаименование)|(Производитель)|(>Brand)/;
            var modelRE = /(Model)|(моделирует)|(Модел)/;
            var memoryRE = /(ПЗУ)|(ROM)/;

            var info = [].slice.call(document.querySelectorAll('#product-desc .product-params .ui-box-body .ui-attr-list'));
            if (info && info.length) {
                var brand = this._getNameByCategoryRegex(info, brandRE);
                var model = this._getNameByCategoryRegex(info, modelRE);
                var memory = this._getNameByCategoryRegex(info, memoryRE);

                if (brand && model && !model.match(/другой/i)) {
                    if (model.indexOf(brand) === -1) {
                        name = brand + ' ';
                    }

                    name += model;
                    if (memory) {
                        if (/\dg$/.test(memory)) {
                            memory += 'b'; //replace 16G to 16GB
                        }
                        name += ' ' + memory;
                    }

                }
            }

            return name;
        }
    },

    "videoigr.net": {
        getName: function() {
            var productName;
            var br = document.querySelector('tbody>tr>.pageHeading:nth-of-type(1) br');
            var heading = document.querySelector('tbody>tr>.pageHeading:nth-of-type(1)');

            productName = br && br.previousSibling.textContent;

            if (!productName) {
                productName = heading ? mbr.tools.getTextContents(heading) : ''
            }

            return productName;
        }
    }
};
mbr.priceParser = mbr.priceParser || {
    /**
     * Return pruduct price if http://schema.org/Offer exist on page
     * @returns {Number} price or 0 if no schema or price
     */
    _getProductPriceBySchema: function(document) {
        var price = 0;
        var schemaElements = mbr.tools.getUniqueElements('[itemtype="http://schema.org/Product"],[itemtype="http://schema.org/Offer"],[itemtype="http://data-vocabulary.org/Product"],[xmlns\\:gr="http://purl.org/goodrelations/v1#"]');
        if (schemaElements.length) {
            var schemaEl = schemaElements[0];

            var priceEl = schemaEl.querySelector('[itemprop=price]') || schemaEl.querySelector('[itemprop=average]') || schemaEl.querySelector('[itemprop=lowPrice]') || schemaEl.querySelector('[property="gr:hasCurrencyValue"]');
            if (priceEl) {
                mbr.hub.trigger('productPrice:found', priceEl);

                price = mbr.tools.priceAnalyze(priceEl.textContent || priceEl.text || priceEl.getAttribute('content'));
                price = Number(price);
                price = price|| 0;
            }
        }
        return price;
    },

    /**
     * get currency by schema from specific currency's element
     * @param document
     * @returns {String}
     * @private
     */
    _getProductCurrencyBySchema: function(document) {
        var currency;
        var schemaElements = mbr.tools.getUniqueElements('[itemtype="http://schema.org/Product"],[itemtype="http://schema.org/Offer"],[itemtype="http://data-vocabulary.org/Product"],[xmlns\\:gr="http://purl.org/goodrelations/v1#"]');
        if (schemaElements.length) {
            var schemaEl = schemaElements[0];
            var curEl = schemaEl.querySelector('[itemprop=priceCurrency]') || schemaEl.querySelector('[itemprop=currency]');
            var priceEl = schemaEl.querySelector('[itemprop=price]') || schemaEl.querySelector('[itemprop=average]') || schemaEl.querySelector('[itemprop=lowPrice]') || schemaEl.querySelector('[property="gr:hasCurrencyValue"]');

            if (curEl) {
                currency = curEl.getAttribute('content') || curEl.textContent || curEl.text;
            } else if (priceEl) {
                currency = priceEl.getAttribute('content') || priceEl.textContent || priceEl.text;
                currency = mbr.tools.getCurrencyFromStr(currency);
                if (!currency) {
                    currency = priceEl.parentNode.getAttribute('content') || priceEl.parentNode.textContent || priceEl.parentNode.text;
                    currency = mbr.tools.getCurrencyFromStr(currency);
                }
            }
            if (currency) {
                currency = currency.replace(/[a-z]/g, function(e) {
                    return e.toUpperCase();
                }).replace(/[^A-Z]/g, '');
            }
        }
        return currency;
    },


    /**
     * Return product price if http://microformats.org/wiki/hproduct exist on page
     * @returns {Number} price or 0 if no hproduct or price
     */
    _getProductPriceByHProduct: function(document) {
        var price = 0;
        var priceElements = mbr.tools.getUniqueElements('.hproduct .price');
        if (priceElements.length) {
            var priceEl = priceElements[0];

            mbr.hub.trigger('productPrice:found', priceEl);

            price = mbr.tools.priceAnalyze(priceEl.textContent || priceEl.text || priceEl.getAttribute('content'));
            price = Number(price);
            price = price|| 0;
        }
        return price;
    },

    /**
     * get currency by hproduct - parse hproduct price string
     * @param document
     * @returns {String}
     * @private
     */
    _getProductCurrencyByHProduct: function(document) {
        var currency;
        var priceElements = mbr.tools.getUniqueElements('.hproduct .price');
        if (priceElements.length) {
            var priceEl = priceElements[0];
            currency = mbr.tools.getCurrencyFromStr(priceEl.innerHTML); //search currency in price node
            if (!currency) {
                currency = mbr.tools.getCurrencyFromStr(priceEl.parentNode.innerHTML); //search currency around price ndde
            }
        }
        return currency;
    },

    /**
     * find product price of current page
     * if there is no class "price" on page, it's not a shop
     * @returns {Number}
     */
    _getProductPriceByDefaultSelector: function(document) {
        var productPrice;

        productPrice = mbr.tools.getDifferentElement('.price', function(element) {
            var text = mbr.tools.getTextContents(element);
            if (text) {
                text = mbr.tools.priceAnalyze(text);
                return Number(text) || 0;
            }
            return 0;
        });

        if (productPrice) {
            mbr.hub.trigger('productPrice:found', productPrice);

            productPrice = mbr.tools.getTextContents(productPrice);
            if (productPrice) {
                productPrice = mbr.tools.priceAnalyze(productPrice);
                productPrice = Number(productPrice) || 0;
            } else {
                productPrice = 0;
            }
            return productPrice;
        }
        return 0;
    },

    /**
     * getting product price for specific selector
     * @param document
     * @param priceSelector
     * @returns {number}
     * @private
     */
    _getPriceBySelector: function(document, priceSelector){
        var price = 0;
        var el;
        var selectors = priceSelector.split(',');

        while (selectors.length && !price) {
            el = document.querySelector(selectors.shift());
            if (el) {
                if (el.getAttribute) {
                    price = el.getAttribute('data-price');
                }
                if (!price) {
                    price = mbr.tools.getTextContents(el) || el.getAttribute('value');
                    if (price) {
                        price = mbr.tools.priceAnalyze(price);
                        price = Number(price) || 0;
                    }
                }
            }
        }

        return price;
    },

    /**
     * get currency element by selector. If element has been found by selector we search currency in element's innerHTML
     * @param document
     * @param currencySelector
     * @returns {String}
     */
    _getCurrencyBySelector: function(document, currencySelector) {
        var currency;
        var priceElement = document.querySelector(currencySelector);
        if (priceElement) {
            currency = mbr.tools.getCurrencyFromStr(priceElement.innerHTML);
            if (!currency) {
                currency = mbr.tools.getCurrencyFromStr(priceElement.parentNode.innerHTML);
            }
        }
        return currency;
    },

    /**
     * get product's price by schema, hproduct or default selector
     * @param document
     */
    getProductPrice: function(document) {
        var domain = mbr.tools.getHostname(document);
        var price = 0;
        var selector = mbr.settings.getSelector();

        if (mbr.settings.canExtractPrice(domain)) {
            if (selector) {
                if (selector.price) {
                    price = this._getPriceBySelector(document, selector.price);
                } else if (selector.getPrice) {
                    price = selector.getPrice(document);
                }
            }

            if (!price && mbr.settings.canUseMicrodata(domain)) {
                price = this._getProductPriceBySchema(document) ||
                this._getProductPriceByHProduct(document);
            }

            if (!price) {
                price = this._getProductPriceByDefaultSelector(document);
            }
        }

        return price;
    },

    /**
     * get product's currency by schema and hproduct
     * @param document
     */
    getCurrency: function(document) {
        var currency;
        var selector = mbr.settings.getSelector();

        currency = this._getCurrencyBySelector(document, selector && (selector.currency || selector.price) || '.price');
        currency = currency || selector && selector.getCurrency && selector.getCurrency(document);
        currency = currency || this._getProductCurrencyBySchema(document) || this._getProductCurrencyByHProduct(document);

        return currency;
    }
};

mbr.selectorsParser = mbr.selectorsParser ||  {
    _attributesHaveManyValues: {
        category: {
            type: 'string',
            separator: '/'
        },
        pictures: {
            type: 'array'
        }
    },

    _extractValueBySelector: function(selector) {
        var domElement;
        var attribute;
        var selectors = selector.split(',');

        while (selectors.length) {
            domElement = document.querySelector(selectors.shift());
            if (domElement) {
                attribute = mbr.tools.getTextContents(domElement) || domElement.getAttribute('value');
                if (attribute) {
                    return attribute;
                }
            }
        }
    },

    _extractManyValuesBySelector: function(selector) {
        return selector.split(',')
            .reduce(function(values, selector) {
                var elements = document.querySelectorAll(selector);
                if (elements && elements.length) {
                    elements = Array.prototype.slice.call(elements);
                    values = values.concat(elements);
                }

                return values;
            }, [])
            .map(function(el) {
                return mbr.tools.getTextContents(el) || el.getAttribute('value');
            })
            .filter(function(val) {
                return val;
            });
    },

    _extractAttributes: function(doc, selectorObject) {
        var selectorFunctionRE = /^get(.+)$/;

        var selectors = Object.keys(selectorObject);

        return selectors.reduce(function(attributes, selectorName) {
            var attribute, attributeName, domElement;
            if (typeof selectorObject[selectorName] === 'function' && selectorFunctionRE.test(selectorName)) {
                attributeName = RegExp.$1.toLowerCase();

                attribute = selectorObject[selectorName]();
                if (attribute) {
                    attributes[attributeName] = attribute;
                }
            } else if (typeof selectorObject[selectorName] === 'string') {
                attributeName = selectorName;
                var selectors = selectorObject[selectorName].split(',');

                if (this._attributesHaveManyValues[selectorName]) {
                    var attributeValues = this._extractManyValuesBySelector(selectorObject[selectorName]);

                    if (attributeValues.length) {
                        if (this._attributesHaveManyValues[selectorName].type === 'array') {
                            attributes[selectorName] = attributeValues;
                        } else if (this._attributesHaveManyValues[selectorName].type === 'string') {
                            attributes[selectorName] = attributeValues.join(
                                this._attributesHaveManyValues[selectorName].separator
                            );
                        }
                    }
                } else {
                    attribute = this._extractValueBySelector(selectorObject[selectorName]);
                    if (attributeName === 'isbn' && attribute) {
                        attribute = mbr.tools.getISBN(attribute);
                    }
                    if (attribute) {
                        attributes[attributeName] = attribute;
                    }
                }
            }
            return attributes;
        }.bind(this), {});
    },

    /*
     * @param {String} domain
     * @return {Boolean}
     * @private
     */
    _canParse: function(domain) {
        return mbr.settings.isProductSuggestEnabled(domain) && mbr.settings.canBeProductPage();
    },

    /**
     * try to get both name and price by selectors.
     * If name has been found, return an object with fields name and price (price is not required)
     * If name has not been found, return null and trigger the event 'notFound'
     * @param {Document} doc
     * @param {Object} selector
     * @returns {Object, null}
     * @private
     */
    _parse: function(doc, selector) {
        var res = this._extractAttributes(doc, selector);

        if (Object.keys(res).length > 0) {
            var price = this.getProductPrice(doc); //use priceParser
            if (price) {
                res.price = price;

                var currency = this.getCurrency(doc);
                if (currency) {
                    res.currency = currency;
                }
            }

            if (res.name) {
                mbr.hub.trigger('productName:found', document.querySelector(selector.name));
            }
            if (res.price && selector.price) {
                mbr.hub.trigger('productPrice:found', document.querySelector(selector.price));
            }
        }

        return res;
    },

    run: function(doc) {
        var domain = mbr.tools.getHostname(doc);
        if (this._canParse(domain)) {
            mbr.log('selectors run!');
            var selector = mbr.settings.getSelector();
            if (selector) {
                var parseResult = this._parse(doc, selector);
                if (parseResult && Object.keys(parseResult).length > 0) {
                    mbr.log("Something is found by selector");
                    mbr.log(parseResult);

                    parseResult.url = doc.URL;
                    parseResult.method = 'selectors';
                    return mbr.suggest.getProductOffers(parseResult);
                }
            }
        }
        return mbr.Promise.reject();
    }
};

mbr.tools.mixin(mbr.selectorsParser, mbr.priceParser);
mbr.microdataParser = mbr.microdataParser || {
    _microdataSelectors: {
        name: {
            selector: '[itemprop="name"],[property="gr:name"],.fn'
        },
        vendor: {
            selector: '[itemprop="brand"], .brand'
        },
        isbn: {
            selector: '[itemprop="productID"],[itemprop="isbn"],.isbn,.identifier'
        },
        vendorCode: {
            selector: '[itemprop="mpn"],[itemprop="hasMPN"],[property="gr:mpn"],.mpn'
        },
        model: {
            selector: '[itemprop="model"],[itemprop="model"] [itemprop=name]'
        },
        barcode: {
            selector: '[itemprop^="gtin"],.identifier,.ean,[property="gr:hasEAN_UCC-13"]'
        },
        color: {
            selector: '[itemprop="color"], .color'
        },
        category: {
            selector: '[itemprop$="category"], .category',
            selectorFunction: function() {
                var breadCrumbSelector = '[itemtype="http://data-vocabulary.org/Breadcrumb"]';
                var titleSelector = '[itemprop="title"]';

                var breadCrumb = document.querySelector(breadCrumbSelector);
                var titleElements;
                var titleElement;
                var title;

                if (breadCrumb) {
                    var categories = [];
                    titleElements = breadCrumb.querySelectorAll(titleSelector)
                    for (var i =0; i < titleElements.length; i++ ) {
                        title = mbr.tools.getTextContents(titleElements[i]);
                        if (title) {
                            categories.push(title);
                        }
                    }
                    if (categories.length) {
                        return categories.join('/');
                    }
                }
            }
        },
        pictures: {
            selectorFunction: function(rootElem) {
                if (rootElem) {
                    var elements = rootElem.querySelectorAll('[itemprop$="image"], .photo');

                    if (elements && elements.length) {
                        var pictures = [].map.call(elements, function(node) {
                            return node.getAttribute('content') || node.getAttribute('src') || node.getAttribute('value');
                        }).filter(function(url) {
                            return !!url;
                        }).map(function(url) {
                            if (url.indexOf(location.protocol) === 0) {
                                return url;
                            } else {
                                return location.protocol + '//' + location.host + url;
                            }
                        });

                        if (pictures.length) {
                            return pictures
                        }
                    }
                }
            }
        }
    },


    /*
     * @param {String} domain
     * @return {Boolean}
     * @private
     */
    _canParse: function(domain) {
        return mbr.settings.isProductSuggestEnabled(domain) && mbr.settings.canUseMicrodata(domain) && mbr.settings.canBeProductPage();
    },

    _getRootElement: function() {
        var schemaEl;
        var schemaElements = mbr.tools.getUniqueElements('[itemtype="http://schema.org/Product"],' +
            '[itemtype="http://schema.org/Offer"],' +
            '[itemtype="http://data-vocabulary.org/Product"],' +
            '[xmlns\\:gr="http://purl.org/goodrelations/v1#"],' +
            '.hProduct,.hproduct');

        if (schemaElements.length) {
            schemaEl = schemaElements[0];
            if (schemaEl.getAttribute('itemref')) { //aggregate element
                schemaEl = null;
            }
        }

        return schemaEl;
    },

    _extractTextFromNode: function(node) {
        return mbr.tools.getTextContents(node) || node.getAttribute('content') || node.getAttribute('value');
    },

    _getTextBySelector: function(rootElement, selector) {
        var text;
        var elements = rootElement.querySelectorAll(selector);
        if (elements && elements.length) {
            text = [].reduce.call(elements, function(text, element) {
                text = text || this._extractTextFromNode(element);
                return text;
            }.bind(this), '');
        }

        return text;
    },

    /**
     * try to get a both product's name and product's price by Schema or Hproduct
     * @param doc
     * @returns {*}
     * @private
     */
    _parse: function(doc) {
        var fieldValue;
        var rootElement = this._getRootElement();
        var res = {};
        if (rootElement) {
            for (var field in this._microdataSelectors) {
                if (this._microdataSelectors.hasOwnProperty(field)) {
                    if (this._microdataSelectors[field].selectorFunction) {
                        fieldValue = this._microdataSelectors[field].selectorFunction(rootElement);
                    }
                    if (!fieldValue && this._microdataSelectors[field].selector) {
                        fieldValue = this._getTextBySelector(rootElement, this._microdataSelectors[field].selector);
                    }
                    if (fieldValue) {
                        res[field] = fieldValue;
                        fieldValue = null;
                    }

                }
            }

            if (res.vendor && res.name && res.name.indexOf(res.vendor) === -1) {
                res.name = res.vendor + ' ' + res.name;
            }
        }

        if (Object.keys(res).length > 0) {
            var price = this.getProductPrice(doc);
            if (price) {
                res.price = price;
                var currency = this.getCurrency(doc);
                if (currency) {
                    res.currency = currency;
                }
            }
        }

        return res;
    },

    run: function(doc) {
        var domain = mbr.tools.getHostname(doc);
        if (this._canParse(domain)) {
            mbr.log('md.run!');
            var parseResult = this._parse(doc);
            if (parseResult && Object.keys(parseResult).length > 0) {
                mbr.log('Something is found by microdata');
                mbr.log(JSON.stringify(parseResult));

                parseResult.url = doc.URL;
                parseResult.method = 'microdata';
                return mbr.suggest.getProductOffers(parseResult);
            }
        }
        return mbr.Promise.reject();
    }
};

mbr.tools.mixin(mbr.microdataParser, mbr.priceParser);
'use strict';

mbr.cmsParser = mbr.cmsParser || {

    _selectors: [
        {
            selector: 'link[href*="bitrix/"]',
            cms: '1C-Bitrix'
        },
        {
            selector: 'meta[content*="Amiro.CMS"]',
            cms: 'Amiro.CMS'
        },
        {
            selector: '[umi\\:field-name],html[xmlns\\:umi*="umi-cms.ru"]',
            cms: 'UMI.CMS',
            product: '[umi\\:field-name="h1"]',
            price: '[umi\\:field-name="price"]'
        },
        {
            selector: "meta[content*='AdVantShop.NET']",
            cms: 'AdVantShop.NET'
        },
        {
            selector: "meta[content*='PHPSHOP']",
            cms: 'PHPShop'
        },
        {
            selector: 'link[href*="insales.ru"]',
            cms: 'InSales'
        },
        {
            selector: 'h1.mainbox-title',
            cms: 'CS-Cart',
            product: 'h1.mainbox-title'
        },
        {
            cms: 'PrestaShop',
            selector: "meta[content*='PrestaShop']"
        },
        {
            cms: 'OsCommerce',
            selector: 'link[rel="stylesheet"][href^="templates/"][href$="/stylesheet.css"]'
        },
        {
            cms: 'Joomla!',
            selector: "meta[content*='Joomla']"
        },
        {
            cms: 'WordPress',
            selector: "meta[content*='WordPress']"
        },
        {
            selector: 'script[src*="drupal"]',
            cms: 'Drupal'

        }

    ],

    /*
     * @param {String} domain
     * @return {Boolean}
     * @private
     */
    _canParse: function(domain) {
        return mbr.settings.isProductSuggestEnabled(domain) && mbr.settings.canCheckCMS(domain) && mbr.settings.canBeProductPage();
    },

    /**
     * check cms for current site
     * @private
     */
    _getCMS: function(document) {
        for (var i=0; i<this._selectors.length; i++) {
            if (this._selectors[i].selector) {
                if (document.querySelector(this._selectors[i].selector)) {
                    return this._selectors[i];
                }
            }
        }
        return null;
    },

    /**
     * find product name
     * @return {String}
     */
    _getProductName: function(doc, cms) {
        var selectorProduct = cms.product || 'h1';
        var node = doc.querySelector(selectorProduct);
        if (node) {
            return mbr.tools.getTextContents(node);
        }
        return null;
    },


    /**
     * find product price of current page
     * @return {Number, String}
     */
    _getProductPriceBySelector: function(doc, selector) {
        if (selector) {
            var node = doc.querySelector(selector);
            if (node) {
                var price = mbr.tools.getTextContents(node);
                price = mbr.tools.priceAnalyze(price);
                price = Number(price) || 0;
                return price;
            }
        }
        return 0;
    },

    run: function(doc) {
        var domain = mbr.tools.getHostname(doc);
        if (this._canParse(domain)) {
            mbr.log('cms.run!');
            var cms = this._getCMS(doc);
            if (cms) {
                mbr.log('find cms = ' + cms.cms);

                var name = this._getProductName(doc, cms);
                if (name) {
                    var price = this._getProductPriceBySelector(doc, cms.price) || this.getProductPrice(doc);
                    var currency = this.getCurrency(doc);
                    if (price) {
                        mbr.log('Product name = ' + name + ' price = ' + price);

                        return mbr.suggest.getProductOffers({
                            name: name,
                            price: price,
                            currency: currency,
                            url: doc.URL,
                            method: 'cms'
                        });
                    } else {
                        mbr.log('price not found');
                    }
                }
            }
        }
        return mbr.Promise.reject();
    }

};

mbr.tools.mixin(mbr.cmsParser, mbr.priceParser);
'use strict';

mbr.urlParser = mbr.urlParser || {
    /**
     *
     * @param domain
     * @private
     */
    _canParse: function(domain) {
        return mbr.settings.isProductSuggestEnabled(domain) && !mbr.suggest.isRequestSent() && mbr.settings.canBeProductPage();
    },

    run: function(document) {
        mbr.log('url parser run');
        var domain = mbr.tools.getHostname(document);

        if (this._canParse(domain)) {
            var data = {};
            data.url = document.URL;

            if (mbr.settings.isReviewSite()) {
                data.method = 'review-site';
            } else if (mbr.settings.isShop()) {
                var h1 = document.querySelector('h1');
                if (h1) {
                    data.name = mbr.tools.getTextContents(h1);
                }

                var price = this.getProductPrice(document);

                if (price) {
                    data.price = price;

                    var currency = this.getCurrency(document);
                    if (currency) {
                        data.currency = currency;
                    }
                }
                data.method = 'shop';
            }

            if (data.method) {
                return mbr.suggest.getProductOffers(data);
            }

        }
        return mbr.Promise.reject();
    }
};

mbr.tools.mixin(mbr.urlParser, mbr.priceParser);
'use strict';
mbr.searchParser = mbr.searchParser || {
    /**
     * check first search
     * @return {Boolean}
     * @private
     */
    _isFirstSearch: function (query) {
        return !mbr.cookie.get(query);
    },


    _searchEngines: {
        'Mail.ru': {
            urlPattern: /https?:\/\/go\.mail\.ru\/search/,
            queryParam: 'q',
            nextPageParam: 'sf'
        },
        'Yandex': {
            urlPattern: /https?:\/\/(?:www.)?yandex\.ru\/yandsearch/,
            queryParam: 'text',
            nextPageParam: 'p'
        },
        'Google': {
            urlPattern: /^https?:\/\/(?:www.)?google\.(ru|com)\/.+q=/,
            nextPageParam: 'start',
            queryParam: 'q'
        },
        'SuperJob': {
            urlPattern: /https?:\/\/(?:www.)?superjob\.ru\/(vacancy|resume)\/search/,
            queryParam: 'keywords[0][keys]',
            nextPageParam: 'page'
        },
        'Avito': {
            urlPattern: /https?:\/\/(?:www.)?avito\.ru\/.+?\//,
            queryParam: 'q',
            infoRe: /https?:\/\/(?:www.)?avito\.ru\/.+?\/([^\/\?]+)\/?([^\?]+)?(?:.*?)(?:q\=([^&]+))?$/,
            priceContextSections: {
                telefony: true,
                bytovaya_elektronika: true,
                velosipedy: true,
                bytovaya_tehnika: true,
                tovary_dlya_kompyutera: true,
                audio_i_video: true
            },
            /**
             * return true if url match for infoRe and priceContextSections contains current section
             * @param url
             * @returns {boolean}
             */
            isPriceContextEnabled: function (url) {
                var execRE = this.infoRe.exec(url);
                if (execRE && execRE.length) {
                    var section = execRE[1];
                    return !!this.priceContextSections[section];
                }
                return false;
            }
        }
    },

    /**
     * get information about avito page: section, subSection (non-required) and query (non-required)
     * @param {String} url
     * @returns {Object}
     */
    getInfoFromAvito: function (url) {
        var execRE = this._searchEngines['Avito'].infoRe.exec(url);
        var section, subSection, query, info = null;
        if (execRE && execRE.length) {
            section = execRE[1];
            subSection = execRE[2];
            query = execRE[3];
            info = {};

            if (section) {
                info.section = section;
            }

            if (subSection && subSection.search(/_\d+$/) === -1) {
                info.subSection = subSection;
            }
            if (query) {
                info.query = decodeURIComponent(query.replace(/\+/g, ' '));
            }
        }
        return info;

    },


    /**
     * get info about search page: get query from url or delegate execution to specific method
     * @param {String} url
     * @returns {Object}
     */
    getInfoAboutSearchPage: function (url) {
        var info = null;
        for (var se in this._searchEngines) {
            if (this._searchEngines.hasOwnProperty(se)) {
                if (this._searchEngines[se].urlPattern.test(url) &&
                    (!this._searchEngines[se].nextPageParam ||
                        url.indexOf(this._searchEngines[se].nextPageParam + '=') === -1)) {
                    info = {};
                    if (se === 'Avito') {
                        info = this.getInfoFromAvito(url);
                    } else {
                        info.query = mbr.tools.getQueryParam(url, this._searchEngines[se].queryParam);

                        if (se === 'SuperJob') {
                            info.type = this._searchEngines[se].urlPattern.exec(url)[1];
                        }
                    }

                    info.engine = se;
                }
            }
        }
        return info;
    },

    _canFindOffers: function(domain) {
        return mbr.settings.isProductSuggestEnabled(domain);
    },

    run: function(document) {
        mbr.log('search run!');
        var url = document.URL;
        var domain = mbr.tools.getHostname(document);
        var info = this.getInfoAboutSearchPage(url);
        if (info) {
            if (this._searchEngines[info.engine].isPriceContextEnabled && this._searchEngines[info.engine].isPriceContextEnabled(url)) {
                if (info.query && this._isFirstSearch(info.query)) {
                    mbr.cookie.set(info.query, 'true');
                    if (this._canFindOffers(domain)) {

                        return mbr.suggest.getProductOffers({
                            name: info.query,
                            url: url,
                            method: 'search'
                        });
                    }
                }
            }
        }
        return mbr.Promise.reject();
    }

};
mbr.partnerWebsiteParser =  mbr.partnerWebsiteParser || {
    _canParse: function() {
        return mbr.settings.isYandexWebPartner && mbr.settings.isYandexWebPartner();
    },

    /**
     * get product name or modelId and send request to the server
     * @param {Document} doc
     * @return {Promise}
     */
    run: function(doc) {
        var domain = mbr.tools.getHostname(doc);
        if (this._canParse()) {
            mbr.log('partner\'s website parser run!');
            var productName = mbr.settings.getProductName();
            var modelId = mbr.settings.getModelId();

            if (productName || modelId) {
                var res = {
                    url: doc.URL,
                    method: 'partner-website'
                };
                if (modelId) {
                    res.model_id = modelId;
                } else if (productName) {
                    res.name = productName;
                }

                mbr.log("Name: " + res.name + "; ModelId: " + res.model_id);

                return mbr.suggest.getProductOffers(res)
                    .catch(function() {
                        return true; //block next parsers
                    })
            }
        }
        return mbr.Promise.reject();
    }
};


mbr.parserPipe = mbr.parserPipe || {
    _state: '',
    _canAddParser: true,
    _parsers: [],

    /**
     * call .run method from next parser
     * @private
     */
    _callNext: function() {
        this._state = 'pending';

        var parser = this._parsers.shift();
        parser && parser.run(document).then(this._onPromiseResolve, this._onPromiseReject);
    },

    /**
     * promise.onResolve handler.
     * We set pipe's state to 'fulfilled' for preventing a calling for next parsers
     * @private
     */
    _onPromiseResolve: function() {
        this._state = 'fulfilled';
        mbr.hub.trigger('pipe:fulfill');
    },

    /**
     * promise.onReject handler
     * We set pipe's state to 'rejecting' and try call next parser
     * @private
     */
    _onPromiseReject: function() {
        this._state = 'rejected';
        if (this._parsers.length === 0 && !this._canAddParser) {
            mbr.hub.trigger('pipe:reject');
        } else {
            this._callNext();
        }
    },

    /**
     * Must return true if a someone parser had returned a resolved promise
     * @returns {boolean}
     */
    isDone: function() {
        return this._state === 'fulfilled';
    },

    /**
     * Must return true if a someone parser was called and doesn't reject or resolve returned promise still
     * @returns {boolean}
     */
    isPending: function() {
        return this._state === 'pending';
    },

    /**
     * add a parser to the queue and
     * call method .run for the parser if pipe doesn't have the 'pending' or 'fulfilled' state
     * @param {Object} parser object with method 'run' which must return a promise
     */
    addParser: function(parser) {
        if (parser && typeof parser.run === 'function' && !this.isDone() && this._canAddParser) {
            this._parsers.push(parser);
            if (!this.isPending()) {
                this._callNext();
            }
        }
        return this;
    },

    /**
     * Forbid to add new parsers
     */
    end: function() {
        this._canAddParser = false;
    },

    /**
     * reset pipe to initial state
     */
    init: function() {
        this._state = '';
        this._parsers = [];
        this._canAddParser = true;
        this._onPromiseReject = this._onPromiseReject.bind(this);
        this._onPromiseResolve = this._onPromiseResolve.bind(this);
        return this;
    }
};

/**
 * Randomizer
 * extract all classnames and ids for randomizing
 * @param {String} html
 * * @param {Number} randomNameLength
 * @param {Boolean} [saveNames] true if we don't want randomize
 * @constructor
 */
function Randomizer(html, randomNameLength, saveNames) {
    this.html = html;
    this.randomNameLength = randomNameLength || 13;
    this.saveNames = !!saveNames;

    var allNames = this._getAllClassesAndIds();
    this.randomNames = this._createRandomNames(allNames);
    this.re = this._createRandomizationRegEx(allNames);

}

/**
 * extract all classes and ids and return them sorted by descending length
 * @returns {Array}
 * @private
 */
Randomizer.prototype._getAllClassesAndIds = function() {
    var resultObj = {};

    var re = /(?:class|id)\s*=["'](.+?)["']/g,
        execRE = null,
        value = '';

    while (execRE = re.exec(this.html)) {
        execRE[1]
            .replace(/\s+/, ' ')
            .split(' ')
            .forEach(function(str) {
                if (str) {
                    resultObj[str] = true;
                }
            });
    }

    //sort by length
    return Object.keys(resultObj).sort(function(a, b) {
        return b.length - a.length;
    });
};

/**
 * create hash {originalName: randomName}
 * @param {Array} allNames
 * @returns {Object}
 * @private
 */
Randomizer.prototype._createRandomNames = function(allNames) {
    var randomNames = {};
    var saveNames = this.saveNames;
    var pattern = 'm';
    while (pattern.length < this.randomNameLength) {
        pattern += 'x';
    }

    allNames.forEach(function (name) {
        randomNames[name] = saveNames ? name :  pattern.replace(/x/g, function () {
            return Math.round(Math.random() * 35).toString(36);
        }); //letter 'm' + random string 0-9 a-z
    });

    return randomNames;

};

/**
 * create regexp for replacing classes and ids. Regexp is kind of /class1Long|class2|class1Min|class1|id1/g
 * @param {Array} allNames
 * @returns {RegExp}
 * @private
 */
Randomizer.prototype._createRandomizationRegEx = function(allNames) {
    return new RegExp(allNames.join('|'), 'g');
};

/**
 * replace classes and ids from input
 * @param {String} input
 * @returns {String}
 */
Randomizer.prototype.randomize = function(input) {
    return input.replace(this.re, function (pattern) {
        return this.randomNames[pattern];
    }.bind(this));
};

mbr.Randomizer = Randomizer;
mbr.feedback = mbr.feedback || {
    _url: 'http://jira.metabar.ru/rest/api/2/issue/',

    _highPrice: {
        summary: 'Высокая цена на {{productName}}',
        description: 'Страница - {{url}}\n' +
            'Определенное название - {{originProductName}}\n' +
            'Определенная цена - {{originPrice}}\n' +
            'Валюта - {{currency}}\n' +
            '----\n' +
            'Название на прайсбаре - {{productName}}\n' +
            'Цена на прайсбаре - {{price}}\n' +
            '----\n' +
            'Метод извлечения - {{extractMethod}}\n' +
            'Город - {{region}}\n' +
            'User-Agent: {{userAgent}}\n' +
            '----\n' +
            '{code:javascript}{{settings}}{code}\n' +
            '----\n' +
            'Cookies:\n' +
            '||Name||Value||\n' +
            '{{cookiesTable}}\n' +
            'Local Storage:\n' +
            '||Name||Value||\n' +
            '{{localStorageTable}}' +
            '----\n' +
            'Ссылка-запрос к серверу - {{requestUrl}}\n' +
            'Ответ сервера - {code:javascript}{{serverResponse}}{code}\n'
    },
    _wrongName: {
        summary: 'Неверно определен товар {{productName}}',
        description: 'Страница - {{url}}\n' +
            'Определенное название - {{originProductName}}\n' +
            'Определенная цена - {{originPrice}}\n' +
            'Валюта - {{currency}}\n' +
            '----\n' +
            'Название на прайсбаре - {{productName}}\n' +
            'Цена на прайсбаре - {{price}}\n' +
            '----\n' +
            'Метод извлечения - {{extractMethod}}\n' +
            'Город - {{region}}\n' +
            'User-Agent: {{userAgent}}\n' +
            '----\n' +
            '{code:javascript}{{settings}}{code}\n' +
            '----\n' +
            'Cookies:\n' +
            '||Name||Value||\n' +
            '{{cookiesTable}}\n' +
            'Local Storage:\n' +
            '||Name||Value||\n' +
            '{{localStorageTable}}' +
            '----\n' +
            'Ссылка-запрос к серверу - {{requestUrl}}\n' +
            'Ответ сервера - {code:javascript}{{serverResponse}}{code}\n'
    },
    _unknownError: {
        summary: 'Ошибка в предложении {{productName}}',
        description: 'Сообщение пользователя: "{{message}}"\n' +
            '----\n' +
            'Страница - {{url}}\n' +
            'Определенное название - {{originProductName}}\n' +
            'Определенная цена - {{originPrice}}\n' +
            'Валюта - {{currency}}\n' +
            '----\n' +
            'Название на прайсбаре - {{productName}}\n' +
            'Цена на прайсбаре - {{price}}\n' +
            '----\n' +
            'Метод извлечения - {{extractMethod}}\n' +
            'Город - {{region}}\n' +
            'User-Agent: {{userAgent}}\n' +
            '----\n' +
            '{code:javascript}{{settings}}{code}\n' +
            '----\n' +
            'Cookies:\n' +
            '||Name||Value||\n' +
            '{{cookiesTable}}\n' +
            'Local Storage:\n' +
            '||Name||Value||\n' +
            '{{localStorageTable}}' +
            '----\n' +
            'Ссылка-запрос к серверу - {{requestUrl}}\n' +
            'Ответ сервера - {code:javascript}{{serverResponse}}{code}\n'
    },
    
    /**
     * get string from template
     * @param template
     * @param {Object} data
     * @param {String} data.productName
     * @param {String} data.domain
     * @param {String} data.url
     * @param {String} data.regionName
     * @param {String} data.originProductName
     * @param {String} data.originPrice
     * @param {String} data.settings
     * @param {String} data.requestUrl
     * @param {String} data.currency
     * @returns {String}
     * @private
     */
    _prepareString: function(template, data) {
        return template
            .replace(/{{message}}/g, data.message)
            .replace(/{{productName}}/g, data.productName)
            .replace(/{{url}}/g, data.url)
            .replace(/{{requestUrl}}/g, data.requestUrl)
            .replace(/{{originProductName}}/g, data.originProductName)
            .replace(/{{originPrice}}/g, data.originPrice)
            .replace(/{{serverResponse}}/g, data.serverResponse)
            .replace(/{{settings}}/g, data.settings)
            .replace(/{{extractMethod}}/g, data.extractMethod)
            .replace(/{{region}}/g, data.regionName || 'Определен автоматически')
            .replace(/{{currency}}/g, data.currency || 'Unknown')
            .replace(/{{userAgent}}/g, navigator.userAgent)
            .replace(/{{price}}/g, data.price)
            .replace(/{{cookiesTable}}/g, mbr.settings.getCookiesTable())
            .replace(/{{localStorageTable}}/g, mbr.settings.getLocalStorageTable());

    },

    /**
     * send post message to create a task
     * @param {String} summary title of the task
     * @param {String} description description of the task
     * @param {String} label e.g. 'high_price' or 'wrong_offer'
     * @private
     */
    _sendMessage: function(summary, description, label) {
        var message = {
            "fields": {
                "project":
                {
                    "key": "SOV"
                },
                "summary": summary,
                "description": description,
                "issuetype":
                {
                    "name": "Bug"
                },
                "labels": [label],
                "customfield_11130":"%REMOTE_IP%"
            }
        };
        mbr.xhr.post(this._url, message);
    },

    /**
     * create a bug about higher price
     * @param {String} url
     * @param {String} productName
     * @param {String} productPrice
     * @param {String} extractMethod
     * @param {String} serverResponse
     * @param {Object} original info about page
     * @param {Object} settings
     *
     */
    trackHighPrice: function(url, productName, productPrice, extractMethod, serverResponse, original, settings) {
        var summary = this._prepareString(this._highPrice.summary, {
            productName: productName
        });
        var description = this._prepareString(this._highPrice.description, {
            url: url,
            productName: productName,
            requestUrl: original.query,
            originProductName: original && original.productName,
            extractMethod: extractMethod,
            serverResponse: serverResponse,
            regionName: mbr.settings.getRegionName(),
            price: productPrice,
            originPrice: original && (original.price || original.productPrice),
            currency: original && original.currency,
            settings: JSON.stringify(settings, 2, 2)
        });

        this._sendMessage(summary, description, 'high_price');
    },

    /**
     * create a bug about wrong product name extraction
     * @param {String} url
     * @param {String} productName
     * @param {String} extractMethod
     * @param {String} serverResponse
     * @param {Object} original info about page
     */
    trackWrongProduct: function(url, productName, productPrice, extractMethod, serverResponse, original, settings) {
        var summary = this._prepareString(this._wrongName.summary, {
            productName: productName
        });
        var description = this._prepareString(this._wrongName.description, {
            url: url,
            productName: productName,
            requestUrl: original.query,
            originProductName: original && original.productName,
            extractMethod: extractMethod,
            serverResponse: serverResponse,
            regionName: mbr.settings.getRegionName(),
            price: productPrice,
            currency: original && original.currency,
            originPrice: original && (original.price || original.productPrice),
            settings: JSON.stringify(settings, 2, 2)
        });

        this._sendMessage(summary, description, 'wrong_offer');
    },

    /**
     * create a user's bug
     * @param {String} message
     * @param {String} url
     * @param {String} productName
     * @param {String} productPrice
     * @param {String} extractMethod
     * @param {String} serverResponse
     * @param {Object} original info about
     * @param {Object} settigns
     */
    trackUnknownError: function(message, url, productName, productPrice, extractMethod, serverResponse, original, settings) {
        var summary = this._prepareString(this._unknownError.summary, {
            productName: productName
        });
        var description = this._prepareString(this._unknownError.description, {
            message: message,
            url: url,
            productName: productName,
            requestUrl: original.query,
            originProductName: original && original.productName,
            extractMethod: extractMethod,
            serverResponse: serverResponse,
            regionName: mbr.settings.getRegionName(),
            price: productPrice,
            originPrice: original && (original.price || original.productPrice),
            currency: original && original.currency,
            settings: JSON.stringify(settings, 2, 2)
        });

        this._sendMessage(summary, description, 'unknown_error');
    }
};
mbr.abtest = mbr.abtest || {
    tests: [
       /* {
            match: {
                bestcpc_offers: 'bestcpc'
            }
        } for example */
    ],

    /**
     * get ab-modificators for popup. Ex. ["popup_red", "optIn_invert"]
     * @param {Object} bucket
     * @returns {Array}
     */
    getModificators: function(bucket) {
        bucket = bucket || {};
        var modificators = [];

        //if bucket has not value for experiment - use 'original' value
        this.tests.forEach(function(test) {
            for (var experimentName in test.match) {
                if (test.match.hasOwnProperty(experimentName) && !bucket.hasOwnProperty(experimentName)) {
                    bucket[experimentName] = 'original';
                }
            }
        });

        for (var i in bucket) {
            if (bucket.hasOwnProperty(i)) {
                modificators.push(i + '_' + bucket[i]);
            }
        }
        return modificators;
    }
};
'use strict';

var pricebar = {
    type: '',
    data: {},
    css: "#market_context_headcrab_container{position:absolute!important;top:-40px!important;left:0!important}#market_context_headcrab_container_relative{position:relative!important}#market_context_headcrab *{margin:0;padding:0;text-shadow:none;background:0 0;color:#000}#market_context_headcrab a{border:0!important;outline:0!important;font-style:normal}#market_context_headcrab .pb-sitebar-right-action{cursor:pointer!important}html>body>:not(#mbr-citilink-container):not(#mbr-citilink-container):not(#mbr-citilink-container)#market_context_headcrab,#market_context_headcrab .pb-cell{transition:background .2s ease 0s;background:#fadf76}#market_context_headcrab:hover,#market_context_headcrab.hover,#market_context_headcrab:active,#market_context_headcrab.active,#market_context_headcrab:hover .pb-cell,#market_context_headcrab.hover .pb-cell,#market_context_headcrab:active .pb-cell,#market_context_headcrab.active .pb-cell{background:#ffeeae!important}html>body>:not(#mbr-citilink-container):not(#mbr-citilink-container):not(#mbr-citilink-container)#market_context_headcrab,#market_context_headcrab{display:table!important;visibility:visible!important;opacity:100!important;font:13px/38px Arial,sans-serif!important;cursor:default;color:#000;width:100%!important;min-width:800px!important;height:35px!important;position:fixed;top:0;left:0;right:0;z-index:2147483647;border-collapse:collapse;text-transform:none!important;border-bottom:1px solid #c8c3ad;padding:0!important;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.13);-moz-box-shadow:0 1px 3px rgba(0,0,0,.13);box-shadow:0 1px 3px rgba(0,0,0,.13)}#market_context_headcrab .pb-sitebar-cnt *{font:13px/38px Arial,sans-serif!important}#market_context_headcrab .pb-sitebar-cnt strong{font-weight:700!important}#market_context_headcrab .pb-sitebar-cnt span,#market_context_headcrab .pb-sitebar-btns span,#market_context_headcrab .pb-sitebar_popover span,#market_context_headcrab .pb-cell span{background:0 0;display:inline;font-style:normal;float:inherit;padding:0;width:auto}#market_context_headcrab .pb-sitebar_popover p{background:0 0;font-style:normal;float:inherit;padding:0;text-align:inherit}#market_context_headcrab img{visibility:visible;position:inherit}#market_context_headcrab .pb-dash{font:13px/38px Arial,sans-serif!important;border:0!important}#market_context_headcrab strong{font-weight:700!important}#market_context_headcrab .pb-cell{display:table-cell;vertical-align:top!important;white-space:nowrap;text-align:left!important;font:13px/38px Arial,sans-serif!important;color:#000!important}#market_context_headcrab .pb-sitebar-logo{vertical-align:middle!important}#market_context_headcrab .pb-sitebar-logo img{display:block!important;max-width:inherit!important;margin:0 14px 0 11px!important;max-height:37px!important}#market_context_headcrab .pb-sitebar-options{width:89px;padding:0 5px 0 27px;text-align:right!important;box-sizing:initial!important;font-size:0!important}#market_context_headcrab .pb-sitebar-i,#market_context_headcrab .pb-sitebar-button .pb-caret,.pb-sitebar_popover-close,.pb-icheckbox,#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label input,#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label .jq-checkbox,#market_context_headcrab .pb-i-delivery,#market_context_headcrab .pb-disclaimer-i{width:16px;height:16px;text-indent:-9999px;display:inline-block;*display:inline;*zoom:1;vertical-align:top!important;overflow:hidden;margin:11px 6px 0 7px!important;position:relative;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAxCAYAAAASqKEbAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEJCN0E4RkM1NEEwMTFFNUI2REU4REJGQ0Q4NkVCQ0QiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEJCN0E4RkI1NEEwMTFFNUI2REU4REJGQ0Q4NkVCQ0QiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzE4RDZDMzA1NDBCMTFFNUI2REU4REJGQ0Q4NkVCQ0QiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzE4RDZDMzE1NDBCMTFFNUI2REU4REJGQ0Q4NkVCQ0QiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz75xPWQAAATWklEQVR42uxcC1BU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) 0 0 no-repeat}#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAWUlEQVR42mP4//8/AyUYBoSAWBuIjYDYGA82AGJFIGYBaYIZwAfEOkDMxUAYMAGxFBCrIxugCHUBKQBkITvMADUg5iHRALCeUQOGlQEUJySKkzJlmYnS7AwAm1iSw3nOshwAAAAASUVORK5CYII=) 0 4px no-repeat;cursor:pointer;font-weight:400!important;font-size:1em!important;color:#000!important;line-height:24px}#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label.checked{background:url(data:image/png;base64,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) 0 2px no-repeat}#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label input{opacity:0!important;cursor:pointer}#market_context_headcrab .pb-sitebar-close{background-position:-32px 0;margin-left:5px}#market_context_headcrab:hover .pb-sitebar-close{background-position:-32px -16px}#market_context_headcrab .pb-sitebar-close:hover{background-position:-32px -32px}#market_context_headcrab:hover .pb-sitebar-question{background-position:0 -16px}#market_context_headcrab .pb-sitebar-question:hover{background-position:0 -32px}#market_context_headcrab .pb-sitebar-btns{text-align:right!important;vertical-align:middle!important;font-style:normal!important}#market_context_headcrab .pb-sitebar-button{cursor:pointer;*cursor:pointer;height:26px;display:inline-block;*display:inline;*zoom:1;text-decoration:none;text-align:center;color:#000!important;padding:0 22px;line-height:25px!important;background:#fff;border:1px solid rgba(0,0,0,.2)!important;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;transition:all .2s ease 0s}#market_context_headcrab .pb-sitebar-settings{background-position:-16px 0!important}#market_context_headcrab:hover .pb-sitebar-settings{background-position:-16px -16px!important}#market_context_headcrab .pb-sitebar-settings:hover{background-position:-16px -32px!important}#market_context_headcrab .pb-sitebar-btns .pb-sitebar-button{margin:0 2px 0 3px!important;*margin:0 4px 0 5px!important;vertical-align:middle!important;position:relative;top:-1px;font-weight:400;font-style:normal;font-size:inherit!important}#market_context_headcrab .pb-sitebar-button-all~.pb-sitebar-button{right:249px}#market_context_headcrab .pb-sitebar-button-all{background:transparent}#market_context_headcrab .pb-sitebar-button-all .pb-caret{vertical-align:middle!important;background-position:-64px 0;margin:0 -3px 0 5px!important;border:0!important;padding:0!important}#market_context_headcrab .pb-sitebar-button-all:hover .pb-caret,#market_context_headcrab .pb-sitebar-button-all:active .pb-caret{}#market_context_headcrab.shoplist.shoplist .pb-sitebar-button .pb-caret{background-position:-64px -32px;padding:0!important}#market_context_headcrab .pb-sitebar-cnt{text-align:left;white-space:nowrap}#market_context_headcrab .pb-sitebar-cnt div{display:inline-block;vertical-align:top!important;line-height:inherit!important}#market_context_headcrab .pb-sitebar-text,#market_context_headcrab .pb-offer-text{text-overflow:ellipsis;overflow:hidden;max-width:100%;float:left}#market_context_headcrab .pb-sitebar-badge{width:28px;float:left}#market_context_headcrab .pb-sitebar-badge .pb-badge{margin-top:13px}#market_context_headcrab .pb-sitebar-cnt .pb-sitebar-price{font-weight:700!important;background:none!important;position:relative!important}#market_context_headcrab .pb-sitebar-cnt div.pb-sitebar-price-delivery{min-width:20%;color:#898163!important;max-width:240px!important;overflow:hidden;text-overflow:ellipsis;display:inline-block}#market_context_headcrab .pb-sitebar-cnt div.pb-sitebar-price-delivery img{height:8px;margin-left:2px;vertical-align:baseline}#market_context_headcrab .pb-sitebar-welcome .settings-link{color:#777!important}#market_context_headcrab .pb-sitebar_popover{cursor:auto;position:fixed;top:53px;right:38px;width:356px;padding:45px 40px 25px 50px;font:12px/24px arial,sans-serif;color:#000;background:#fff;border:1px solid rgba(0,0,0,.1);text-align:left!important;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;-o-box-sizing:border-box;box-sizing:border-box;-webkit-box-shadow:0 10px 20px rgba(0,0,0,.4);-moz-box-shadow:0 10px 20px rgba(0,0,0,.4);box-shadow:0 10px 20px rgba(0,0,0,.4)}#market_context_headcrab .pb-sitebar_popover_large{width:737px}#market_context_headcrab .pb-sitebar_popover *{margin:0;padding:0;font-family:arial,sans-serif!important}#market_context_headcrab .pb-sitebar_popover a{color:#669!important;text-decoration:underline!important;display:inline!important;border:0!important;font-weight:400!important;cursor:pointer!important;font-size:inherit}#market_context_headcrab .pb-sitebar_popover a.pb-color{color:#070!important;outline:0}#market_context_headcrab .pb-sitebar_popover .pb-block{display:block!important}#market_context_headcrab .pb-underline{text-decoration:underline!important}#market_context_headcrab a.pb-newline{display:inline-block!important}#market_context_headcrab .pb-sitebar_popover a:hover,#market_context_headcrab .pb-sitebar_popover a:active{color:red!important;text-decoration:underline!important}#market_context_headcrab .pb-sitebar_popover_footer{background:inherit}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer .pb-items{margin:0 -7px 0 -8px!important;padding:0!important;list-style:none!important}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer .pb-item{margin:0 7px 0 8px!important;list-style:none!important;display:inline!important;color:#999!important}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer a{color:#4a4a4a!important;font-size:11px!important}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer a:hover,#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer a:active{color:#2a2a2a!important}#market_context_headcrab .pb-sitebar_popover .pb-product-all .pb-sitebar_popover_footer{margin:20px -30px -30px;padding:19px 30px}#market_context_headcrab .pb-sitebar_popover a.link-inside,#market_context_headcrab .pb-sitebar_popover a.link-inside:hover{text-decoration:none!important}#market_context_headcrab .pb-sitebar_popover a.link-inside{border-bottom:1px dashed!important}#market_context_headcrab .pb-sitebar_popover ul,#market_context_headcrab .pb-sitebar_popover li{list-style:none!important;font-size:1em!important}#market_context_headcrab .pb-sitebar_popover h1{border:0!important;position:static!important;height:inherit;text-transform:none}#market_context_headcrab .pb-sitebar_popover h1 strong{float:none}#market_context_headcrab .pb-sitebar_popover p{font-size:1em!important;color:#000!important;margin:0 0 2em!important}#market_context_headcrab .pb-sitebar_popover label{font-weight:400!important}#market_context_headcrab .pb-sitebar_popover_product{right:123px;padding:30px 30px 0}#market_context_headcrab.shoplist .pb-sitebar_popover_product,#market_context_headcrab.shoplist .pb-sitebar_popover_clothes{display:block!important}#market_context_headcrab .pb-sitebar_popover .pb-title{font:700 12px/24px arial,sans-serif!important;color:#000!important;margin:0!important;text-align:left!important;border:0!important}#market_context_headcrab .pb-sitebar_popover_policy .pb-title{font-weight:400!important;margin:0 0 16px!important}#market_context_headcrab .pb-sitebar_popover .pb-header{margin:1px 0 20px!important}#market_context_headcrab .pb-sitebar_popover .pb-header .pb-title,#market_context_headcrab .pb-sitebar_popover .pb-header img{display:inline-block!important;*display:inline!important;*zoom:1!important;vertical-align:middle!important;width:48px;height:48px}#market_context_headcrab .pb-sitebar_popover .pb-header img{margin-right:16px!important}#market_context_headcrab .pb-sitebar_popover .pb-header .pb-title{font:700 22px/24px arial,sans-serif!important;width:70%!important}#market_context_headcrab .pb-sitebar_popover_opt_out .pb-title{font-weight:400!important;margin:0 0 16px!important}#market_context_headcrab .pb-sitebar_popover .pb-footer{color:#a9a9a9!important;font-size:11px!important;line-height:18px!important}#market_context_headcrab .pb-sitebar_popover_opt_out .pb-footer a{white-space:nowrap}#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label{margin:1em 0 0 -22px!important;padding:0 0 0 22px!important;position:relative!important;display:block!important;width:auto!important}#market_context_headcrab .pb-sitebar_popover .pb-icheckbox,#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label input,#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label .jq-checkbox{padding:0;background-position:-80px 0;display:block;position:absolute!important;left:0!important;top:4px!important;width:16px!important;height:16px!important}#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label input{top:-7px!important;left:-8px!important}#market_context_headcrab .pb-sitebar_popover .pb-icheckbox:hover,#market_context_headcrab .pb-sitebar_popover .pb-icheckbox.hover{background-position:-80px -16px}#market_context_headcrab .pb-sitebar_popover .pb-icheckbox.checked{background-position:-80px -32px;height:17px!important;top:2px!important}#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label:first-child{margin-top:0!important}#market_context_headcrab .pb-sitebar_popover .pb-checkbox-label b{display:block!important;font-weight:700!important}#market_context_headcrab .pb-sitebar_popover_settings .pb-btn{margin-top:15px!important;margin-bottom:10px!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-cnt{margin:0 -10px 1.25em 0!important}#market_context_headcrab .pb-sitebar_popover_opt_in .pb-btn-cnt{margin:0 0 .7em!important}#market_context_headcrab .pb-sitebar_popover_opt_out p+.pb-btn-cnt{margin-top:-.7em!important}#market_context_headcrab .pb-sitebar_popover .pb-btn{display:inline-block!important;margin:0 10px 10px 0;padding:0 19px;text-align:center!important;text-decoration:none!important;font:13px/25px Arial,sans-serif!important;color:#000!important;min-width:118px;height:28px;border:1px solid rgba(0,0,0,.2)!important;transition:all .2s ease 0s;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}#market_context_headcrab .pb-sitebar_popover .pb-btn:last-child{margin-right:0;*margin-right:0}#market_context_headcrab .pb-sitebar_popover .pb-btn:hover,#market_context_headcrab .pb-sitebar_popover .pb-btn:focus,#market_context_headcrab .pb-sitebar_popover .pb-btn:active{color:#000!important;text-decoration:none!important}#market_context_headcrab .pb-sitebar_popover .pb-btn:hover{border-color:rgba(0,0,0,.3)!important}#market_context_headcrab .pb-sitebar_popover .pb-btn:focus,#market_context_headcrab .pb-sitebar_popover .pb-btn:active{background:#f6f5f3;border-color:rgba(0,0,0,.2)!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-primary{min-width:128px;background:#FDE100;border:1px solid #C8B100!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-primary:hover{border-color:#AF9D00!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-primary:focus,#market_context_headcrab .pb-sitebar_popover .pb-btn-primary:active{background:#FFD100;border-color:#AF9D00!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-success{color:rgba(0,0,0,.6)!important;background:#7ED321;border:1px solid #71BA21!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-success:hover{color:rgba(0,0,0,.6)!important;border-color:#5AA409!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-success:focus,#market_context_headcrab .pb-sitebar_popover .pb-btn-success:active{color:rgba(0,0,0,.6)!important;background:#91E436;border-color:#5AA409!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-block{display:block!important}#market_context_headcrab .pb-sitebar_popover .pb-btn-lg{height:38px;line-height:35px!important}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover-close{position:absolute;right:7px;top:7px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAxCAYAAAASqKEbAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEJCN0E4RkM1NEEwMTFFNUI2REU4REJGQ0Q4NkVCQ0QiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEJCN0E4RkI1NEEwMTFFNUI2REU4REJGQ0Q4NkVCQ0QiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzE4RDZDMzA1NDBCMTFFNUI2REU4REJGQ0Q4NkVCQ0QiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzE4RDZDMzE1NDBCMTFFNUI2REU4REJGQ0Q4NkVCQ0QiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz75xPWQAAATWklEQVR42uxcC1BU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) -48px 0 no-repeat}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover-close:hover{text-decoration:none!important;background-position:-48px -16px}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover-close:focus,#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover-close:active{text-decoration:none!important;background-position:-48px -32px}#market_context_headcrab .pb-product-best{border-bottom:solid 1px #eee;position:relative;overflow:hidden;padding-top:4px;padding-bottom:9px;margin-top:-4px;margin-bottom:11px}#market_context_headcrab .pb-product-best-img{width:70px;float:left}#market_context_headcrab .pb-product-best-img img{border:1px solid #eee;max-width:48px;display:block}#market_context_headcrab .pb-product-best-txt{width:267px;float:left}#market_context_headcrab .pb-sitebar_popover h1.pb-disclaimer{position:absolute!important;color:#999!important;right:30px;top:6px;font-size:12px!important;font-weight:inherit!important}#market_context_headcrab .pb-product-best-btn{padding-top:28px;width:118px;float:right;clear:right}#market_context_headcrab .pb-product-best-btn .pb-btn{width:118px;min-width:118px}#market_context_headcrab .pb-product-best-btn .pb-btn:hover{text-decoration:none!important}#market_context_headcrab .pb-divider-cell{padding:0 27px!important}#market_context_headcrab .pb-product-all .pb-divider{width:100%!important;border:0!important;height:1px!important;background:#e5e5e5!important;display:block!important;visibility:visible!important;margin:18px 0 11px!important}#market_context_headcrab .pb-product-best h1,#market_context_headcrab .pb-product-all h1{color:#999;font-weight:400;font-size:13px;padding:4px 0 2px;text-align:left}#market_context_headcrab .pb-product-best h1{padding:0 0 2px;margin:0}#market_context_headcrab ul.pb-products{margin:0 -30px -2px!important}#market_context_headcrab .pb-products li,#market_context_headcrab .pb-products p{*zoom:1;margin:0!important;line-height:inherit!important}#market_context_headcrab .pb-products li:hover{background:#ffeba0}#market_context_headcrab .pb-products li:before,#market_context_headcrab .pb-products p:before,#market_context_headcrab .pb-products li:after,#market_context_headcrab .pb-products p:after{display:table;content:\" \"}#market_context_headcrab .pb-products li:after,#market_context_headcrab .pb-products p:after{clear:both}#market_context_headcrab .pb-products a{display:block!important;*zoom:1;position:relative;padding:2px 0 1px;overflow:hidden}#market_context_headcrab .pb-products a:hover,#market_context_headcrab .pb-products a:active{color:#669!important}#market_context_headcrab .pb-products .pb-products-name{float:left;max-width:242px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}#market_context_headcrab .pb-product-best .pb-products .pb-products-name{max-width:177px}#market_context_headcrab .pb-products .pb-products-price{font-size:13px!important;float:right!important;clear:right!important;font-weight:700!important;color:#000!important;text-align:right!important;margin:1px 0 0 10px!important}#market_context_headcrab .pb-products-rate{width:85px;float:right;clear:right;margin-top:4px;margin-right:62px}#market_context_headcrab .pb-products-rate,#market_context_headcrab .pb-products-rate-active{height:16px;overflow:hidden;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAgCAYAAAD0S5PyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAmZJREFUeNqkVc9rE0EUnk21TVODLXiwSXUxEsRLCj2VoJcUcoiiRwVz8JhDyCHgxYO39uTV/AGW/gHtIYcWcmghAQOiufTctIUgMSYUadGU9Xvr2zKdzM7S9MHHzM578/Z7P2bGchxHmMSyrEkMMHP++tmERLDMMMRYTsDCcxLh+VhMwplMZiKVSt3EfNLP6EZQKPl8XnQ6HdFqtYjRHy1jv8Ra//kv9Pv9UK/XE4lEYojvY609L0aBeQkxIF4ul23oXRQKBZt1dxVEXSactNvAbLVaFbFYTEQiEZFMJi/9sNlsiuFwKMBO5HI5WuoDA5eJB6oCcL9SqVwwUEE6siHbi32yE3ZEVYjX6/URB7VajRzEyUbeE9LkiCowwB9H8sdrv9gmsE/C2WzWnTQaDTcXJOgZGqa11VHCIbnX7XbtYrFocwXmS6WS3W636XtB3adzMpVOp8mYMEstw5gDExvda6s5GWk2lHuOq/QTujNFF8ZwBziBbmAKh/olpK5L+gmyMTJR5WTPWsJwGn3q7F/nPskDr4xXhokJWBD1I7e1hXgMNs44TDJc4kfA4rjhvJHmr68cDkKhMnf4miA5AB7oQnKdYEMR87fMzAM5eajYfwXUW3/dux4/AbeANe5OP1mSTwzwns7lpXDA6CWGjaAnAvKb8oXQNrU5gSOqwhZfPDppAy/g4LtvdVj5wcDinezAVOKswclKYIkRDiX7Bx19XvrC75OX1GO6b+RS65gsswMyWgWeAGngI+vjavfqXsDnwCEdPPxtV84FWG5j/Aw8A76ZmFD5FhUHXtJ3MKSAc3n9nwADAP67YTz5bbWmAAAAAElFTkSuQmCC) 0 0 repeat-x}#market_context_headcrab .pb-products-rate-active{display:block;background-position:0 -16px;text-indent:-9999em;position:inherit}#market_context_headcrab .pb-products-rate-active-0{width:0}#market_context_headcrab .pb-products-rate-active-1{width:17px}#market_context_headcrab .pb-products-rate-active-2{width:34px}#market_context_headcrab .pb-products-rate-active-3{width:51px}#market_context_headcrab .pb-products-rate-active-4{width:68px}#market_context_headcrab .pb-products-rate-active-5{width:100%}#market_context_headcrab .pb-products-txt{width:337px;float:left;padding-left:30px}#market_context_headcrab .track{width:1px!important;height:1px!important;position:absolute!important;bottom:0;right:0}#market_context_headcrab .sitebar__logo{position:absolute;top:0;left:0;width:80px;height:37px;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAlCAMAAACAj7KHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMlQTFRF2NS+IiIifJS6oq+8zcy+TnS4u7OXwsW9W324wbibgpm61dK+T3W4wLealaa7y8y+aoe5zMOki4VyjJ+7qbO8rba8xMa91Muqtq6TxMe9mKi7dI65n6281tO+lI550cinbou5ZYS5VHi4U1BH4de05d6/vLSXp6CHwcS9n5mCg5m61NG+JiYl39m/5N2/4Nq/iYNwfZW6l6e7nZaAXH645ty3ysGiboq5OTgzgXxrJCQjMTAt4Nazhpu6p7K8iIJwjYh0S3K4/////a6jsQAAAEN0Uk5T////////////////////////////////////////////////////////////////////////////////////////AEFiBO8AAACzSURBVHjazNPFFsMgEAVQphJp6u7u7m7k/z+qoSGkkdl1kbfizF0MMEB0LCTIsgqzzHwkQlmmqESX/n1ilD79Raa0Q1xZmHvbU09CplRRaaCit1EpoDKIY8KO5EzOkrFbiuKuld+y8qjYU9ha1e4mrznmo30vtlZPeSd3SiflP70DdS2J0ihbskUFgDKHF8CtL+RtyIVLz1gPhRzncE1waQKcD3af1i4j+kiTe9D/wkeAAQCf8NnweFJ78gAAAABJRU5ErkJggg==);background-repeat:no-repeat;background:#fdeeaa;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.13);-moz-box-shadow:0 1px 3px rgba(0,0,0,.13);box-shadow:0 1px 3px rgba(0,0,0,.13)}#market_context_headcrab.lowest .pb-sitebar-text:not(.lowest){display:none!important}#market_context_headcrab.profitable .pb-sitebar-text:not(.profitable){display:none!important}#market_context_headcrab .pb-sitebar_popover .app-title{font:15px Arial,sans-serif}#market_context_headcrab .pb-sitebar_popover .pb-btn-attention{background:#FFD100!important;border-color:#AF9D00!important}#market_context_headcrab:not(.pb-sitebar_offer) .pb-sitebar_popover_opt_out{display:none}#market_context_headcrab:not(.pb-sitebar_offer) .pb-overlay{display:none}#market_context_headcrab .pb-sitebar-welcome{display:block!important}#market_context_headcrab .pb-sitebar_popover_feedback{right:67px;display:none}#market_context_headcrab .pb-sitebar_popover_feedback ul{padding:0!important;margin:11px 0 21px!important;list-style:none}#market_context_headcrab .pb-sitebar_popover_feedback li{margin:10px 0;list-style:none!important}#market_context_headcrab .pb-sitebar_popover_feedback li a.active{color:#000!important}#market_context_headcrab .pb-sitebar_popover_feedback li a.pb-link-underline{color:#777!important;text-decoration:underline!important}#market_context_headcrab .pb-sitebar_popover_feedback form{text-align:right;padding-bottom:5px;display:none}#market_context_headcrab .pb-sitebar_popover_feedback form.error-shown{display:block}#market_context_headcrab .pb-sitebar_popover_feedback form .pb-btn{margin:0;height:26px}#market_context_headcrab .pb-sitebar_popover_feedback li p{margin:10px 0;display:none;white-space:normal}#market_context_headcrab .pb-sitebar_popover_feedback textarea{border:1px solid #eee!important;width:100%!important;height:140px!important;margin:17px 0 8px!important;color:#000!important;padding:5px!important;background:#fff!important;font:12px/15px Arial,sans-serif!important;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}#market_context_headcrab a:after{background:none!important;height:0;width:0;margin:0}#market_context_headcrab.without_settings .pb-sitebar-options{width:60px}#market_context_headcrab.without_settings .pb-sitebar-settings{display:none!important}#market_context_headcrab.without_settings .pb-sitebar_popover_feedback{right:38px!important}#market_context_headcrab.without_settings .pb-sitebar_popover_product,#market_context_headcrab.without_settings .pb-sitebar_popover_clothes{right:94px!important}#market_context_headcrab.without_about_link .link-about{display:none!important}#market_context_headcrab .pb-sitebar_popover .link-underline{color:#777!important;text-decoration:underline!important}#market_context_headcrab .pb-sitebar_popover p{white-space:normal}#market_context_headcrab .pb-sitebar_popover_clothes{max-height:345px;right:123px;display:none}#market_context_headcrab .pb-sitebar_popover_clothes .pb-title{text-align:center!important;margin:-7px 0 16px!important;font-size:15px!important}#market_context_headcrab .pb-sitebar-carousel-item{width:128px!important;margin:0 11px 1px;position:relative;text-align:center;float:left}#market_context_headcrab .pb-sitebar-carousel-item a{display:block!important;cursor:pointer!important}#market_context_headcrab .pb-sitebar-carousel-item a,#market_context_headcrab .pb-sitebar-carousel-item a:hover{text-decoration:none!important}#market_context_headcrab .pb-sitebar-carousel-item a:hover .pb-sitebar-carousel-title{text-decoration:underline!important}#market_context_headcrab .pb-sitebar-carousel-img{height:130px;width:100%;display:table-cell;vertical-align:middle;width:125px}#market_context_headcrab .pb-sitebar-carousel-img img{border:1px solid #e7e7e7;display:block;margin:0 auto;max-width:103px;max-height:128px}#market_context_headcrab .pb-sitebar-carousel-title{font-weight:400!important;font-size:12px!important;margin:9px 0 0!important;height:40px;overflow:hidden;line-height:18px!important}#market_context_headcrab .pb-sitebar-carousel-price{font-weight:700;color:#000}#market_context_headcrab .pb-sitebar-carousel-item p.pb-sitebar-carousel-url{font-size:11px!important;color:#777!important}#market_context_headcrab .pb-sitebar-carousel .slick-prev,#market_context_headcrab .pb-sitebar-carousel .slick-next{width:20px;height:20px;border:0;outline:0;cursor:pointer;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAYAAAD/Rn+7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAa1JREFUeNrEljFIQlEUhm8JgpMQNLm6OgWC0CQ0BGHQFLrUJAbSakuDS64iFEJQCEpTkCRtroHQ5OrqJASCIAjy+oM/eNzutXPfe9APH8rhnnP+573vHrc8z1N+tdtttUFn4BZ8gONyufyp/hDq7eDjBeyBC/BoW4t6v2LbSq4CuAcJsA86wrwO1yeYX3DoKTaYBU8g5osdCHP962Ksk43SYBq88hfw613YQ1+XYL10FAZ3wRs//ZqCktBgiesldZ0M2p50Dg4NTW2acv1cuDMig7azsgInYKzcNGbeSnC2RQZblrftHAxVMA2Zb7odWi4GL0HFEL8CPRVOPdbRVWFfkcFrQ+wONFQ0arCepK/TRf0vMhmsW7agFlHPmuUI1aUGm5YtuAHFkOaKrGM6Qk2XLa6CviH+APIBzeWZr6vPfk7XzBqcgpEWj4NnkHE0l2FeXIuP2GcdZJIswRGYaPEkx1RKaC7F9UktPmH9ZZhZPOOYmhmadoUGu4aHsdUNdM3YnjQnNJgT7kyo/4OmszIQ5g4EZzu0wZ+37XuWLjbMVbVhfi/4ve/ydn0JMAClkWAH05a3wQAAAABJRU5ErkJggg==) no-repeat;text-indent:-9999em;position:absolute;top:55px}#market_context_headcrab .pb-sitebar-carousel .slick-prev{left:-4px}#market_context_headcrab .pb-sitebar-carousel .slick-next{background-position:-20px 0;right:-4px}#market_context_headcrab .pb-sitebar-carousel .slick-prev:before,#market_context_headcrab .pb-sitebar-carousel .slick-next:before{content:''}#market_context_headcrab .pb-sitebar-carousel .slick-prev.slick-disabled,#market_context_headcrab .pb-sitebar-carousel .slick-next.slick-disabled{opacity:.3;filter:alpha(opacity=30);*zoom:1}#market_context_headcrab .pb-sitebar-carousel{height:220px!important;overflow:hidden}#market_context_headcrab .pb-sitebar-carousel-items{height:100%;position:relative;width:200%;left:0;transition:left 1s linear}#market_context_headcrab .pb-overlay{position:fixed;top:38px;bottom:0;left:0;right:0;background:rgba(24,28,33,.89);z-index:232367364;cursor:default}#market_context_headcrab .pb-overlay-title{margin:0;padding:0;text-transform:none;font:100 20px/24px Arial,sans-serif!important;color:#fff!important;position:relative;text-align:center!important}#market_context_headcrab .pb-overlay-title:before,#market_context_headcrab .pb-overlay-title:after{content:'';border-left:2px dotted #fff;width:2px;margin:14px auto 12px;height:42px;display:block}#market_context_headcrab .pb-overlay-header{visibility:visible;text-align:center;margin-bottom:-12px}#market_context_headcrab .pb-overlay-header:after{content:'';border-left:4px inset transparent;border-right:4px inset transparent;border-top:9px solid #fff;display:inline-block;*display:inline;*zoom:1;top:-19px;left:-1px;position:relative}#market_context_headcrab .pb-overlay-header h6,#market_context_headcrab .pb-overlay-header:after{opacity:0}#market_context_headcrab.overlay-suggest-arrow .pb-overlay-header h6,#market_context_headcrab.overlay-suggest-arrow .pb-overlay-header:after{opacity:1!important;transition:opacity .2s linear}#market_context_headcrab .pb-overlay .pb-sitebar_popover{display:block;position:relative;top:0;left:auto;right:auto;margin:0 auto}#market_context_headcrab .pb-overlay .pb-sitebar_popover_opt_out{top:122px}#market_context_headcrab .pb-overlay-arr{display:block;position:absolute;top:12px;right:309px;width:132px;height:252px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAAD8CAYAAAC2NQwLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc5OEE3OTY0REJBMjExRTRBMUY4REE0QUIyNkY2REI0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjc5OEE3OTY1REJBMjExRTRBMUY4REE0QUIyNkY2REI0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjMwOEVGMTdEQjg5MTFFNEExRjhEQTRBQjI2RjZEQjQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjMwOEVGMThEQjg5MTFFNEExRjhEQTRBQjI2RjZEQjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4EML9xAAAJuklEQVR42uydC5CW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) 0 0 no-repeat;margin-left:200px;opacity:1}#market_context_headcrab.overlay-suggest-arrow .pb-overlay-arr{opacity:0!important;transition:opacity .2s linear}#market_context_headcrab .pb-table{width:100%!important;table-layout:auto!important;border-spacing:0!important}#market_context_headcrab .pb-table,#market_context_headcrab .pb-table-cell{border:0!important;background:none!important}#market_context_headcrab .pb-table-cell{vertical-align:top!important;text-align:left!important;white-space:nowrap!important;padding:11px 5px 11px 0!important}#market_context_headcrab .pb-table-cell_right{text-align:right!important;padding-right:0!important}#market_context_headcrab .pb-table-cell_center{text-align:center!important}#market_context_headcrab .pb-block_full{margin:0 -30px}#market_context_headcrab .pb-block_full .pb-table-cell:first-child{padding-left:30px!important}#market_context_headcrab .pb-block_full .pb-table-cell:last-child{padding-right:30px!important}#market_context_headcrab .pb-product-stat .pb-table-cell{vertical-align:top!important}#market_context_headcrab .pb-product-stat .pb-table-cell:first-child{width:70%!important;white-space:normal!important}#market_context_headcrab .pb-product-stat .pb-table-cell:first-child a{white-space:nowrap!important;margin-right:6px!important}#market_context_headcrab .pb-product-stat td.pb-table-cell.pb-product-prices{width:75%!important}#market_context_headcrab .pb-grey-row .pb-table-cell{background:#F6F5F3!important;height:28px!important}#market_context_headcrab td.pb-table-cell span.pb-product-discount{width:45px;display:inline-block;text-align:center;color:#fff;font-size:13px!important;border-radius:2px;background-color:#3db73a}#market_context_headcrab .pb-divider{background:#e5e5e5;height:1px!important;margin:11px 0 9px!important}#market_context_headcrab .pb-product-title+.pb-divider{margin-top:16px!important}#market_context_headcrab .pb-sitebar_popover_product,#market_context_headcrab .pb-sitebar_popover_product *{font-size:15px!important;line-height:18px!important}#market_context_headcrab .pb-sitebar_popover_product a,#market_context_headcrab .pb-sitebar_popover_product a:hover{text-decoration:none!important}#market_context_headcrab .pb-product-title,#market_context_headcrab .pb-product-title *{font-size:25px!important;font-weight:400!important;line-height:30px!important}#market_context_headcrab .pb-product-title{margin:-10px 0 -1px!important}#market_context_headcrab .pb-product-title a{color:#000!important}#market_context_headcrab .pb-product-price,#market_context_headcrab .pb-product-price a{font-weight:700!important;color:#000!important}#market_context_headcrab .pb-product-price,#market_context_headcrab .pb-product-price_range{white-space:nowrap!important}#market_context_headcrab .pb-product-price_range{font-weight:100!important}#market_context_headcrab .pb-product-price_range,#market_context_headcrab .pb-product-total{color:#999}#market_context_headcrab .pb-product-price .pb-product-old-price_text{color:#999!important;font-size:12px!important;display:block;font-weight:400;text-decoration:line-through;margin-bottom:-11px;margin-top:-3px;text-align:right}#market_context_headcrab .pb-product-rate{color:#4A4A4A!important;font-size:13px!important}#market_context_headcrab .pb-product-rate .pb-tooltip-cnt{cursor:default}#market_context_headcrab .pb-product-rate .pb-product-rate-value{color:#fff!important;display:inline-block;*display:inline;*zoom:1;vertical-align:middle!important;font-weight:700!important;font-size:13px!important;background:#3E9E00;position:relative;padding:1px 6px;margin:0 5px 0 6px;height:18px;top:-1px}#market_context_headcrab .pb-product-rate-value:after{content:'';border-width:11px 0 9px 5px;border-style:inset solid solid;border-color:transparent transparent transparent #3E9E00;line-height:0;position:absolute;top:0;right:-5px}#market_context_headcrab .pb-rate{width:85px;display:inline-block;*display:inline;*zoom:1;vertical-align:top}#market_context_headcrab .pb-rate,#market_context_headcrab .pb-rate-active{height:16px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAgCAYAAAD0S5PyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQwMzk2QUU1RkRGQjExRTQ4RDE0Q0EyMjhDRTIyOTI0IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQwMzk2QUU2RkRGQjExRTQ4RDE0Q0EyMjhDRTIyOTI0Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDAzOTZBRTNGREZCMTFFNDhEMTRDQTIyOENFMjI5MjQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDAzOTZBRTRGREZCMTFFNDhEMTRDQTIyOENFMjI5MjQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6ABngbAAACHElEQVR42qSVS0tbQRTHZ5Jo7BUlRqxYrY/blS5cqCAWd2njJlQtt5v6FfwaumiX2q/g1kVA8NEuFUHdFAoGevsiYpsSQ0tKMY/xf/SoiTp3rsmBH5mcOf6dc86ciVBKCYOFGa0FhNl6mLpEehmthQwCjSBSsT6t5SSUxhHTU2s6lMZ38AM8NqXTB8ZAA/gPLltWAj95PQKmeS1BEyiAPUktlpJ8ohk8BWWwA/5p/rEFJjiLbZAXN+4JqQ2Dl5rj9/LeMMdemOayPQJOVeDF2uE9Xy2mdqa5NlH2ZdnX6FeEUvkCBsEQ+z5xlwbAV5MI+bq4+lS8DfZfFr2NY4pe96Sb/RkW+MtssC/AMcKrsKOg0+MCdnKMp0jQx1AGTSJVlk72dxyt9T+s6ymwLDn7ICxn63xPpIOpcDwjKmbnluXW7XaM5DGt86VSV/fzb7/vfRIVUjN8J0JWMDBTUzpVaSjpeKaT+/DkNdbv8EcthnaXqjt7fgnnr2qSXbftQINage648GVqt1yUc9G4+/kqneiU634s/JmE5gLPiM5ob5FiSUDbndyWnUC1kncfQLyIxNyksbDq+mfirr02f92R4lVF8fJExa5jFDletVuQXZwFDmRRjBD4ts9tj2eSdqunSLhVJOijrNTb9K/TiciUmyJShwV64d/Q8xiyzmP0U3zy3l7Kbg0809Uku2nHELPsKYKxbzbdkJsxZwIMAE/AskGGPoD+AAAAAElFTkSuQmCC) 0 0 repeat-x}#market_context_headcrab .pb-rate-active{display:block;background-position:0 -16px;text-indent:-9999em;background-color:#fff;font-size:0!important}#market_context_headcrab .pb-rate-active-0{width:0}#market_context_headcrab .pb-rate-active-1{width:17px}#market_context_headcrab .pb-rate-active-2{width:34px}#market_context_headcrab .pb-rate-active-3{width:51px}#market_context_headcrab .pb-rate-active-4{width:68px}#market_context_headcrab .pb-rate-active-5{width:100%}#market_context_headcrab .pb-product-shops{margin-top:13px}#market_context_headcrab .pb-product-shops tr{cursor:pointer}#market_context_headcrab .pb-product-shops tr:not(.pb-no-hover):hover .pb-table-cell,#market_context_headcrab .pb-product-shops tr:not(.pb-no-hover):active .pb-table-cell,#market_context_headcrab .pb-product-shops tr:not(.pb-no-hover):hover .pb-rate-active,#market_context_headcrab .pb-product-shops tr:not(.pb-no-hover):active .pb-rate-active{background-color:#FFEBA0!important}#market_context_headcrab .pb-product-shops-name{width:190px!important;white-space:normal!important}#market_context_headcrab .pb-product-shops-name,#market_context_headcrab .pb-product-price{padding-top:10px!important;padding-bottom:12px!important}#market_context_headcrab .pb-product-shops-badge{width:30px!important;padding-top:12px!important;padding-bottom:10px!important}#market_context_headcrab .pb-product-shops-name{width:160px!important;white-space:normal!important}#market_context_headcrab .pb-product-shops-rate{width:112px!important}#market_context_headcrab .pb-product-shops-delivery{max-width:144px;color:#4A4A4A;overflow:hidden;text-overflow:ellipsis}#market_context_headcrab .pb-product-shops tr:hover .pb-product-shops-delivery,#market_context_headcrab .pb-product-shops tr:active .pb-product-shops-delivery,#market_context_headcrab .pb-product-shops tr:hover .pb-price-old,#market_context_headcrab .pb-product-shops tr:active .pb-price-old{color:#9A9069}#market_context_headcrab .pb-product-shops tr:hover .pb-price-old:after,#market_context_headcrab .pb-product-shops tr:active .pb-price-old:after{background:rgba(154,144,105,.3)}#market_context_headcrab .pb-product-shops .pb-product-price,#market_context_headcrab .pb-product-shops .pb-product-price *{vertical-align:top!important}#market_context_headcrab .pb-product-shops .pb-product-shops-btn{padding-top:6px!important;padding-bottom:0!important}#market_context_headcrab .pb-product-shops .pb-product-shops-btn .pb-btn{min-width:10px!important;margin:0}#market_context_headcrab .pb-product-shops-name .pb-link-mask{color:#070!important;display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:160px!important}#market_context_headcrab .pb-product-shops .pb-table-cell:hover .pb-link-mask,#market_context_headcrab .pb-product-shops .pb-table-cell:hover .pb-link-mask span,#market_context_headcrab .pb-product-shops .pb-link-mask:hover,#market_context_headcrab .pb-product-shops .pb-link-mask:hover span{color:red!important}#market_context_headcrab .pb-product-shops .pb-table-cell:hover .pb-price-old:after,#market_context_headcrab .pb-product-shops .pb-link-mask:hover .pb-price-old:after{background:rgba(255,0,0,.3)}#market_context_headcrab .pb-product-shops-delivery,#market_context_headcrab .pb-product-shops-delivery *,#market_context_headcrab .pb-product-total,#market_context_headcrab .pb-product-total *{font-size:12px!important}#market_context_headcrab .pb-i-delivery{background-position:-112px 0;vertical-align:middle!important;margin:0 9px 0 -1px!important}#market_context_headcrab .pb-product-shops tr:hover .pb-i-delivery,#market_context_headcrab .pb-product-shops tr:active .pb-i-delivery{background-position:-112px -16px}#market_context_headcrab .pb-product-shops .pb-table-cell:hover .pb-i-delivery,#market_context_headcrab .pb-product-shops .pb-link-mask:hover .pb-i-delivery{background-position:-112px -32px}#market_context_headcrab .pb-product-shop{padding:6px 0 4px;margin-top:3px}#market_context_headcrab .pb-product-shop .pb-table-cell{vertical-align:middle!important;color:#4A4A4A}#market_context_headcrab .pb-product-shop .pb-table-cell,#market_context_headcrab .pb-product-shop .pb-table-cell *{font-size:13px!important}#market_context_headcrab .pb-product-shop .pb-product-shop-title span{white-space:nowrap!important;display:inline-block!important;*display:inline!important;*zoom:1!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:320px!important;vertical-align:top!important}#market_context_headcrab .pb-product-shop,#market_context_headcrab .pb-product-shop .pb-rate-active{background-color:#F6F5F3}#market_context_headcrab .pb-product-shop .pb-rate{margin:0 4px}#market_context_headcrab .pb-product-shop .pb-rate-active{font-size:0!important}#market_context_headcrab .pb-product-shop .pb-table-cell:first-child{white-space:normal!important;overflow:visible!important;text-overflow:none!important;width:60%!important}#market_context_headcrab .pb-product-shop .pb-product-total,#market_context_headcrab .pb-product-shop .pb-product-total *{font-size:12px!important}#market_context_headcrab .pb-product-shops-name .pb-link-mask{text-decoration:underline}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer,#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer *{font-size:11px!important;line-height:14px!important}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer a{text-decoration:underline!important;color:#4A4A4A!important}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer a:hover{color:red!important}#market_context_headcrab .pb-ya{color:red!important;text-decoration:underline!important}#market_context_headcrab .pb-sitebar_popover .pb-sitebar_popover_footer td{vertical-align:middle!important;height:35px}#market_context_headcrab .pb-table-cell .pb-tooltip-cnt{position:relative;display:inline-block;*display:inline;*zoom:1;cursor:pointer}#market_context_headcrab .pb-sitebar_popover .pb-tooltip{font:13px/15px Arial,sans-serif!important;color:#fff!important}#market_context_headcrab .pb-table-cell .pb-tooltip{background:rgba(50,50,50,.8);padding:4px 12px 0;position:absolute;top:50%;margin-top:-12px;z-index:10;display:block;visibility:hidden;height:18px;white-space:nowrap!important;opacity:0;transition:all .15s linear}#market_context_headcrab .pb-table-cell .pb-tooltip span{width:100%;height:100%;overflow:hidden;text-overflow:clip;-o-text-overflow:clip;display:inline-block;line-height:15px!important;color:#fff!important}#market_context_headcrab .pb-table-cell .pb-tooltip{margin-top:-11px}#market_context_headcrab .pb-table-cell.wrong-product .pb-tooltip{margin-top:-10px}#market_context_headcrab .pb-product-shops-rate .pb-tooltip{margin-top:-12px}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip:after{position:absolute;content:'';top:50%;margin-top:-7px;line-height:0}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_left:after{border-width:7px 0 7px 7px;border-style:inset solid solid;border-color:transparent transparent transparent rgba(50,50,50,.8);right:-7px}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_right:after{border-width:7px 7px 7px 0;border-style:inset solid solid;border-color:transparent rgba(50,50,50,.8) transparent transparent;left:-7px}#market_context_headcrab .pb-tooltip_left{transition:all .15s linear;right:100%;margin-right:24px}#market_context_headcrab .pb-tooltip_right{left:100%;margin-left:24px;transition:all .15s linear}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_success{background:rgba(108,186,104,.9)}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_success.pb-tooltip_left:after{border-left-color:rgba(108,186,104,.9)}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_success.pb-tooltip_right:after{border-right-color:rgba(108,186,104,.9)}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_error{background:rgba(255,100,100,.9)}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_error.pb-tooltip_left:after{border-left-color:rgba(255,100,100,.9)}#market_context_headcrab .pb-tooltip-cnt .pb-tooltip_error.pb-tooltip_right:after{border-right-color:rgba(255,100,100,.9)}#market_context_headcrab .pb-tooltip-cnt:hover .pb-tooltip{visibility:visible;transition:all .15s linear .7s;opacity:1}#market_context_headcrab .pb-tooltip-cnt:hover .pb-tooltip_right{transition:all .15s linear .7s;margin-left:14px}#market_context_headcrab .pb-tooltip-cnt:hover .pb-tooltip_left{transition:all .15s linear .7s;margin-right:14px}#market_context_headcrab .pb-badge{width:16px;height:16px;background:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjQzNnB4IiBoZWlnaHQ9Ijg3cHgiIHZpZXdCb3g9IjAgMCA0MzYgODciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBkPSJNMzk2Ljg1Miw0MC4yMjggQzQwMS4wMzQsNDAuMjI4IDQwMi43MDcsMzguNTU1IDQwMi43MDcsMzMuNjEzIEM0MDIuNzA3LDI4LjUyIDQwMS4wMzQsMjcgMzk2Ljg1MiwyNyBDMzkyLjY3MywyNyAzOTEsMjguNTIgMzkxLDMzLjYxMyBDMzkxLDM4LjU1NSAzOTIuNjczLDQwLjIyOCAzOTYuODUyLDQwLjIyOCIgaWQ9IkZpbGwtMjMiIGZpbGw9IiMxQTE5MTgiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMzk2LjYxMyw0NyBDMzkxLjc0OSw0NyAzOTAsNDkuMjA0IDM5MCw1My45OTMgQzM5MCw1OC43ODMgMzkxLjc0OSw2MC42ODIgMzk2LjYxMyw2MC42ODIgQzQwMS40NzksNjAuNjgyIDQwMy4yMjgsNTguNzgzIDQwMy4yMjgsNTMuOTkzIEM0MDMuMjI4LDQ5LjIwNCA0MDEuNDc5LDQ3IDM5Ni42MTMsNDciIGlkPSJGaWxsLTI0IiBmaWxsPSIjMUExOTE4Ij48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTM5Ni4zNTA1OTEsNjguMDM1IEMzODQuODcyNTkxLDY3LjgwOCAzODEuOTA4NTkxLDYzLjYyNyAzODEuOTA4NTkxLDU1LjE4OCBDMzgxLjkwODU5MSw0OS40ODggMzgyLjI4ODU5MSw0NS4xNTQgMzg3LjM4MTU5MSw0My4xNzggQzM4My4xMjQ1OTEsNDAuMDYyIDM4My4wNDg1OTEsMzYuODY4IDM4My4wNDg1OTEsMzQuMjg0IEwzODMuMDQ4NTkxLDMxLjY5OSBDMzgzLjUwNTU5MSwyMy4xMDggMzg2LjM5MzU5MSwxOS44NDEgMzk2LjM1MDU5MSwxOS44NDEgQzQwNi4zMDk1OTEsMTkuODQxIDQwOS4xOTc1OTEsMjMuMTA4IDQwOS42NTM1OTEsMzEuNjk5IEw0MDkuNjUzNTkxLDM0LjI4NCBDNDA5LjY1MzU5MSwzNi44NjggNDA5LjU3NzU5MSw0MC4wNjIgNDA1LjMyMDU5MSw0My4xNzggQzQxMC40MTU1OTEsNDUuMTU0IDQxMC43OTU1OTEsNDkuNDg4IDQxMC43OTU1OTEsNTUuMTg4IEM0MTAuNzk1NTkxLDYzLjYyNyA0MDcuODI5NTkxLDY3LjgwOCAzOTYuMzUwNTkxLDY4LjAzNSBMMzk2LjM1MDU5MSw2OC4wMzUgWiBNNDE1LjA1MTU5MSwyLjI4IEM0MTMuMzAyNTkxLDAuNTMyIDQxMS4wOTg1OTEsMCA0MDguNTkxNTkxLDAgTDM3NC42ODU1OTEsMCBDMzcyLjE3NzU5MSwwIDM2OS45NzM1OTEsMC41MzIgMzY4LjIyNDU5MSwyLjI4IEwzNTAuOTY5NTkxLDE5Ljc2NSBDMzQ4LjkxNzU5MSwyMS44MTYgMzQ4LjAwNDU5MSwyNC4yNSAzNDguMDA0NTkxLDI3LjA2MiBMMzQ4LjAwNDU5MSw2MC41ODYgQzM0Ny45MjY1OTEsNjMuMzk4IDM0OC44NDE1OTEsNjUuNDUgMzUwLjgxNzU5MSw2Ny40MjcgTDM2Ny43Njg1OTEsODQuMzc5IEMzNjkuNzQ1NTkxLDg2LjM1NSAzNzEuOTQ5NTkxLDg3LjI2NyAzNzQuNjg1NTkxLDg3LjI2NyBMNDA4LjU5MTU5MSw4Ny4yNjcgQzQxMS4zMjY1OTEsODcuMjY3IDQxMy41MzA1OTEsODYuMzU1IDQxNS41MDc1OTEsODQuMzc5IEw0MzIuNDU5NTkxLDY3LjQyNyBDNDM0LjQzNTU5MSw2NS41MjYgNDM1LjI3MjU5MSw2My4zOTggNDM1LjI3MjU5MSw2MC41ODYgTDQzNS4yNzI1OTEsNDkuMDMxIEM0MzUuMTk2NTkxLDQ4LjA0NCA0MzQuNjY0NTkxLDQ3LjUxMiA0MzMuNjc1NTkxLDQ3LjUxMiBMNDI4LjU4MzU5MSw0Ny41MTIgTDQyOC41ODM1OTEsNTEuMDg0IEM0MjguNTgzNTkxLDUzLjc0NCA0MjguMjAyNTkxLDU1LjExMiA0MjUuOTIyNTkxLDU1LjExMiBMNDIzLjY0MDU5MSw1NS4xMTIgQzQyMS4zNjE1OTEsNTUuMTEyIDQyMC45ODA1OTEsNTMuNzQ0IDQyMC45ODA1OTEsNTEuMDg0IEw0MjAuOTgwNTkxLDQ3LjUxMiBMNDE3LjQwODU5MSw0Ny41MTIgQzQxNC43NDg1OTEsNDcuNTEyIDQxMy4zNzk1OTEsNDcuMTMxIDQxMy4zNzk1OTEsNDQuODUgTDQxMy4zNzk1OTEsNDIuNDE4IEM0MTMuMzc5NTkxLDQwLjEzNyA0MTQuNzQ4NTkxLDM5Ljc1NyA0MTcuNDA4NTkxLDM5Ljc1NyBMNDIwLjk4MDU5MSwzOS43NTcgTDQyMC45ODA1OTEsMzYuMTgzIEM0MjAuOTgwNTkxLDMzLjUyNCA0MjEuMzYxNTkxLDMyLjE1NSA0MjMuNjQwNTkxLDMyLjE1NSBMNDI1LjkyMjU5MSwzMi4xNTUgQzQyOC4yMDI1OTEsMzIuMTU1IDQyOC41ODM1OTEsMzMuNTI0IDQyOC41ODM1OTEsMzYuMTgzIEw0MjguNTgzNTkxLDM5Ljc1NyBMNDMzLjY3NTU5MSwzOS43NTcgQzQzNC43Mzk1OTEsMzkuNzU3IDQzNS4yNzI1OTEsMzkuMTQ4IDQzNS4yNzI1OTEsMzguMDA5IEw0MzUuMjcyNTkxLDI3LjA2MiBDNDM1LjI3MjU5MSwyNC4yNSA0MzQuMjgzNTkxLDIxLjgxNiA0MzIuMzA3NTkxLDE5Ljc2NSBMNDE1LjA1MTU5MSwyLjI4IEw0MTUuMDUxNTkxLDIuMjggWiIgaWQ9IkZpbGwtMjUiIGZpbGw9IiMxQTE5MTgiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMzcxLjk0NiwyMSBMMzY1LjAyOCwyMSBDMzYyLjM2OSwyMSAzNjEsMjEuNDU3IDM2MSwyMy42NjEgTDM2MSwyNi4xNjkgQzM2MSwyOC4zNzQgMzYyLjM2OSwyOC44MjkgMzY1LjAyOCwyOC44MjkgTDM2Ni42MjUsMjguODI5IEMzNjcuNjEzLDI4LjgyOSAzNjguMDY4LDI5LjM2MiAzNjguMDY4LDMwLjg4MSBMMzY4LjA2OCw2My43MjEgQzM2OC4wNjgsNjYuMzgxIDM2OC41MjUsNjcuNzUgMzcwLjczLDY3Ljc1IEwzNzMuMzEzLDY3Ljc1IEMzNzUuNTE5LDY3Ljc1IDM3NS45NzYsNjYuMzgxIDM3NS45NzYsNjMuNzIxIEwzNzUuOTc2LDIzLjY2MSBDMzc1Ljk3NiwyMS40NTcgMzc0LjYwNiwyMSAzNzEuOTQ2LDIxIiBpZD0iRmlsbC0yNiIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik00MzQuODgyLDM3LjU0NyBDNDM0Ljg4MiwzOC42ODYgNDM0LjM0OSwzOS4yOTUgNDMzLjI4NSwzOS4yOTUgTDQyOC4xOTMsMzkuMjk1IEw0MjguMTkzLDM1LjcyMSBDNDI4LjE5MywzMy4wNjIgNDI3LjgxMiwzMS42OTMgNDI1LjUzMiwzMS42OTMgTDQyMy4yNSwzMS42OTMgQzQyMC45NzEsMzEuNjkzIDQyMC41OSwzMy4wNjIgNDIwLjU5LDM1LjcyMSBMNDIwLjU5LDM5LjI5NSBMNDE3LjAxOCwzOS4yOTUgQzQxNC4zNTgsMzkuMjk1IDQxMi45ODksMzkuNjc1IDQxMi45ODksNDEuOTU2IEw0MTIuOTg5LDQ0LjM4OCBDNDEyLjk4OSw0Ni42NjkgNDE0LjM1OCw0Ny4wNSA0MTcuMDE4LDQ3LjA1IEw0MjAuNTksNDcuMDUgTDQyMC41OSw1MC42MjIgQzQyMC41OSw1My4yODIgNDIwLjk3MSw1NC42NSA0MjMuMjUsNTQuNjUgTDQyNS41MzIsNTQuNjUgQzQyNy44MTIsNTQuNjUgNDI4LjE5Myw1My4yODIgNDI4LjE5Myw1MC42MjIgTDQyOC4xOTMsNDcuMDUgTDQzMy4yODUsNDcuMDUgQzQzNC4yNzQsNDcuMDUgNDM0LjgwNiw0Ny41ODIgNDM0Ljg4Miw0OC41NjkgTDQzNC44ODIsNjAuMTI0IEM0MzQuODgyLDYyLjkzNiA0MzQuMDQ1LDY1LjA2NCA0MzIuMDY5LDY2Ljk2NSBMNDE1LjExNyw4My45MTcgQzQxMy4xNCw4NS44OTMgNDEwLjkzNiw4Ni44MDUgNDA4LjIwMSw4Ni44MDUgTDM3NC4yOTUsODYuODA1IEMzNzEuNTU5LDg2LjgwNSAzNjkuMzU1LDg1Ljg5MyAzNjcuMzc4LDgzLjkxNyBMMzUwLjQyNyw2Ni45NjUgQzM0OC40NTEsNjQuOTg4IDM0Ny41MzYsNjIuOTM2IDM0Ny42MTQsNjAuMTI0IEwzNDcuNjE0LDI2LjYgQzM0Ny42MTQsMjMuNzg4IDM0OC41MjcsMjEuMzU0IDM1MC41NzksMTkuMzAzIEwzNjcuODM0LDEuODE4IEMzNjkuNTgzLDAuMDcgMzcxLjc4NywtMC40NjIgMzc0LjI5NSwtMC40NjIgTDQwOC4yMDEsLTAuNDYyIEM0MTAuNzA4LC0wLjQ2MiA0MTIuOTEyLDAuMDcgNDE0LjY2MSwxLjgxOCBMNDMxLjkxNywxOS4zMDMgQzQzMy44OTMsMjEuMzU0IDQzNC44ODIsMjMuNzg4IDQzNC44ODIsMjYuNiBMNDM0Ljg4MiwzNy41NDcgTDQzNC44ODIsMzcuNTQ3IFogTTQxOS4yOTcsLTIuNTkxIEM0MTYuMzMzLC01LjQ3OSA0MTIuNjA5LC03IDQwOC4xMjMsLTcgTDM3NC4zNzEsLTcgQzM2OS44ODYsLTcgMzY2LjA4NSwtNS40NzkgMzYzLjE5OCwtMi41OTEgTDM0NS4zMzIsMTUuMTk3IEMzNDIuNTIxLDE4LjAxMSAzNDEsMjEuNzM1IDM0MSwyNS44NDEgTDM0MSw2MC4xMjQgQzM0MSw2NC44MzcgMzQyLjU5Nyw2OC40ODYgMzQ1Ljc4OSw3MS42MDIgTDM2Mi43NDIsODguNTU0IEMzNjYuMDg1LDkxLjg5OCAzNjkuODEsOTMuNDIgMzc0LjYsOTMuMzQ0IEw0MDcuODk2LDkzLjM0NCBDNDEyLjUzMyw5My4zNDQgNDE2LjMzMyw5MS45NzQgNDE5Ljc1NCw4OC41NTQgTDQzNi43MDYsNzEuNjAyIEM0MzkuODIzLDY4LjQ4NiA0NDEuNDk1LDY0Ljc2MSA0NDEuNDk1LDYwLjEyNCBMNDQxLjQ5NSwyNS44NDEgQzQ0MS40OTUsMjEuNzM1IDQzOS45NzUsMTguMDExIDQzNy4xNjIsMTUuMTk3IEw0MTkuMjk3LC0yLjU5MSBMNDE5LjI5NywtMi41OTEgWiIgaWQ9IkZpbGwtMjciPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMzk2LjQ0Miw2MC45NzIgQzM5MS41NzgsNjAuOTcyIDM4OS44MjksNTkuMDczIDM4OS44MjksNTQuMjgzIEMzODkuODI5LDQ5LjQ5NCAzOTEuNTc4LDQ3LjI5IDM5Ni40NDIsNDcuMjkgQzQwMS4zMDgsNDcuMjkgNDAzLjA1Nyw0OS40OTQgNDAzLjA1Nyw1NC4yODMgQzQwMy4wNTcsNTkuMDczIDQwMS4zMDgsNjAuOTcyIDM5Ni40NDIsNjAuOTcyIEwzOTYuNDQyLDYwLjk3MiBaIE0zOTYuNDQyLDI2Ljk5MyBDNDAwLjYyNCwyNi45OTMgNDAyLjI5NywyOC41MTMgNDAyLjI5NywzMy42MDYgQzQwMi4yOTcsMzguNTQ4IDQwMC42MjQsNDAuMjIxIDM5Ni40NDIsNDAuMjIxIEMzOTIuMjYzLDQwLjIyMSAzOTAuNTksMzguNTQ4IDM5MC41OSwzMy42MDYgQzM5MC41OSwyOC41MTMgMzkyLjI2MywyNi45OTMgMzk2LjQ0MiwyNi45OTMgTDM5Ni40NDIsMjYuOTkzIFogTTQwNS40MTIsNDMuMzM3IEM0MDkuNjY5LDQwLjIyMSA0MDkuNzQ1LDM3LjAyNyA0MDkuNzQ1LDM0LjQ0MyBMNDA5Ljc0NSwzMS44NTggQzQwOS4yODksMjMuMjY3IDQwNi40MDEsMjAgMzk2LjQ0MiwyMCBDMzg2LjQ4NSwyMCAzODMuNTk3LDIzLjI2NyAzODMuMTQsMzEuODU4IEwzODMuMTQsMzQuNDQzIEMzODMuMTQsMzcuMDI3IDM4My4yMTYsNDAuMjIxIDM4Ny40NzMsNDMuMzM3IEMzODIuMzgsNDUuMzEzIDM4Miw0OS42NDcgMzgyLDU1LjM0NyBDMzgyLDYzLjc4NiAzODQuOTY0LDY3Ljk2NyAzOTYuNDQyLDY4LjE5NCBDNDA3LjkyMSw2Ny45NjcgNDEwLjg4Nyw2My43ODYgNDEwLjg4Nyw1NS4zNDcgQzQxMC44ODcsNDkuNjQ3IDQxMC41MDcsNDUuMzEzIDQwNS40MTIsNDMuMzM3IEw0MDUuNDEyLDQzLjMzNyBaIiBpZD0iRmlsbC0yOCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0yNDEuMDUyMzc2LDIuMjggQzIzOS4zMDMzNzYsMC41MzIgMjM3LjA5OTM3NiwwIDIzNC41OTEzNzYsMCBMMjAwLjY4NjM3NiwwIEMxOTguMTc4Mzc2LDAgMTk1Ljk3MzM3NiwwLjUzMiAxOTQuMjI1Mzc2LDIuMjggTDE3Ni45NjkzNzYsMTkuNzY1IEMxNzQuOTE3Mzc2LDIxLjgxNiAxNzQuMDA0Mzc2LDI0LjI1IDE3NC4wMDQzNzYsMjcuMDYyIEwxNzQuMDA0Mzc2LDYwLjU4NiBDMTczLjkyODM3Niw2My4zOTggMTc0Ljg0MTM3Niw2NS40NSAxNzYuODE3Mzc2LDY3LjQyNyBMMTkzLjc2OTM3Niw4NC4zNzkgQzE5NS43NDUzNzYsODYuMzU1IDE5Ny45NTAzNzYsODcuMjY3IDIwMC42ODYzNzYsODcuMjY3IEwyMzQuNTkxMzc2LDg3LjI2NyBDMjM3LjMyNjM3Niw4Ny4yNjcgMjM5LjUzMTM3Niw4Ni4zNTUgMjQxLjUwODM3Niw4NC4zNzkgTDI1OC40NTkzNzYsNjcuNDI3IEMyNjAuNDM1Mzc2LDY1LjUyNiAyNjEuMjcyMzc2LDYzLjM5OCAyNjEuMjcyMzc2LDYwLjU4NiBMMjYxLjI3MjM3Niw0OS4wMzEgQzI2MS4xOTYzNzYsNDguMDQ0IDI2MC42NjQzNzYsNDcuNTEyIDI1OS42NzYzNzYsNDcuNTEyIEwyNTQuNTgzMzc2LDQ3LjUxMiBMMjU0LjU4MzM3Niw1MS4wODQgQzI1NC41ODMzNzYsNTMuNzQ0IDI1NC4yMDIzNzYsNTUuMTEyIDI1MS45MjIzNzYsNTUuMTEyIEwyNDkuNjQxMzc2LDU1LjExMiBDMjQ3LjM2MTM3Niw1NS4xMTIgMjQ2Ljk4MDM3Niw1My43NDQgMjQ2Ljk4MDM3Niw1MS4wODQgTDI0Ni45ODAzNzYsNDcuNTEyIEwyNDMuNDA4Mzc2LDQ3LjUxMiBDMjQwLjc0ODM3Niw0Ny41MTIgMjM5LjM3OTM3Niw0Ny4xMzEgMjM5LjM3OTM3Niw0NC44NSBMMjM5LjM3OTM3Niw0Mi40MTggQzIzOS4zNzkzNzYsNDAuMTM3IDI0MC43NDgzNzYsMzkuNzU3IDI0My40MDgzNzYsMzkuNzU3IEwyNDYuOTgwMzc2LDM5Ljc1NyBMMjQ2Ljk4MDM3NiwzNi4xODMgQzI0Ni45ODAzNzYsMzMuNTI0IDI0Ny4zNjEzNzYsMzIuMTU1IDI0OS42NDEzNzYsMzIuMTU1IEwyNTEuOTIyMzc2LDMyLjE1NSBDMjU0LjIwMjM3NiwzMi4xNTUgMjU0LjU4MzM3NiwzMy41MjQgMjU0LjU4MzM3NiwzNi4xODMgTDI1NC41ODMzNzYsMzkuNzU3IEwyNTkuNjc2Mzc2LDM5Ljc1NyBDMjYwLjc0MDM3NiwzOS43NTcgMjYxLjI3MjM3NiwzOS4xNDggMjYxLjI3MjM3NiwzOC4wMDkgTDI2MS4yNzIzNzYsMjcuMDYyIEMyNjEuMjcyMzc2LDI0LjI1IDI2MC4yODMzNzYsMjEuODE2IDI1OC4zMDczNzYsMTkuNzY1IEwyNDEuMDUyMzc2LDIuMjgiIGlkPSJGaWxsLTI5IiBmaWxsPSIjMUExOTE4Ij48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTE5OC45NDcsMjEgTDE5Mi4wMjksMjEgQzE4OS4zNjksMjEgMTg4LDIxLjQ1NyAxODgsMjMuNjYxIEwxODgsMjYuMTY5IEMxODgsMjguMzc0IDE4OS4zNjksMjguODI5IDE5Mi4wMjksMjguODI5IEwxOTMuNjI2LDI4LjgyOSBDMTk0LjYxNCwyOC44MjkgMTk1LjA3LDI5LjM2MiAxOTUuMDcsMzAuODgxIEwxOTUuMDcsNjMuNzIxIEMxOTUuMDcsNjYuMzgxIDE5NS41MjYsNjcuNzUgMTk3LjczMSw2Ny43NSBMMjAwLjMxNSw2Ny43NSBDMjAyLjUyLDY3Ljc1IDIwMi45NzYsNjYuMzgxIDIwMi45NzYsNjMuNzIxIEwyMDIuOTc2LDIzLjY2MSBDMjAyLjk3NiwyMS40NTcgMjAxLjYwNywyMSAxOTguOTQ3LDIxIiBpZD0iRmlsbC0zMCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0yNjAuODgxLDM3LjU0NyBDMjYwLjg4MSwzOC42ODYgMjYwLjM0OSwzOS4yOTUgMjU5LjI4NSwzOS4yOTUgTDI1NC4xOTIsMzkuMjk1IEwyNTQuMTkyLDM1LjcyMSBDMjU0LjE5MiwzMy4wNjIgMjUzLjgxMSwzMS42OTMgMjUxLjUzMSwzMS42OTMgTDI0OS4yNSwzMS42OTMgQzI0Ni45NywzMS42OTMgMjQ2LjU4OSwzMy4wNjIgMjQ2LjU4OSwzNS43MjEgTDI0Ni41ODksMzkuMjk1IEwyNDMuMDE3LDM5LjI5NSBDMjQwLjM1NywzOS4yOTUgMjM4Ljk4OCwzOS42NzUgMjM4Ljk4OCw0MS45NTYgTDIzOC45ODgsNDQuMzg4IEMyMzguOTg4LDQ2LjY2OSAyNDAuMzU3LDQ3LjA1IDI0My4wMTcsNDcuMDUgTDI0Ni41ODksNDcuMDUgTDI0Ni41ODksNTAuNjIyIEMyNDYuNTg5LDUzLjI4MiAyNDYuOTcsNTQuNjUgMjQ5LjI1LDU0LjY1IEwyNTEuNTMxLDU0LjY1IEMyNTMuODExLDU0LjY1IDI1NC4xOTIsNTMuMjgyIDI1NC4xOTIsNTAuNjIyIEwyNTQuMTkyLDQ3LjA1IEwyNTkuMjg1LDQ3LjA1IEMyNjAuMjczLDQ3LjA1IDI2MC44MDUsNDcuNTgyIDI2MC44ODEsNDguNTY5IEwyNjAuODgxLDYwLjEyNCBDMjYwLjg4MSw2Mi45MzYgMjYwLjA0NCw2NS4wNjQgMjU4LjA2OCw2Ni45NjUgTDI0MS4xMTcsODMuOTE3IEMyMzkuMTQsODUuODkzIDIzNi45MzUsODYuODA1IDIzNC4yLDg2LjgwNSBMMjAwLjI5NSw4Ni44MDUgQzE5Ny41NTksODYuODA1IDE5NS4zNTQsODUuODkzIDE5My4zNzgsODMuOTE3IEwxNzYuNDI2LDY2Ljk2NSBDMTc0LjQ1LDY0Ljk4OCAxNzMuNTM3LDYyLjkzNiAxNzMuNjEzLDYwLjEyNCBMMTczLjYxMywyNi42IEMxNzMuNjEzLDIzLjc4OCAxNzQuNTI2LDIxLjM1NCAxNzYuNTc4LDE5LjMwMyBMMTkzLjgzNCwxLjgxOCBDMTk1LjU4MiwwLjA3IDE5Ny43ODcsLTAuNDYyIDIwMC4yOTUsLTAuNDYyIEwyMzQuMiwtMC40NjIgQzIzNi43MDgsLTAuNDYyIDIzOC45MTIsMC4wNyAyNDAuNjYxLDEuODE4IEwyNTcuOTE2LDE5LjMwMyBDMjU5Ljg5MiwyMS4zNTQgMjYwLjg4MSwyMy43ODggMjYwLjg4MSwyNi42IEwyNjAuODgxLDM3LjU0NyBMMjYwLjg4MSwzNy41NDcgWiBNMjQ1LjI5NiwtMi41OTEgQzI0Mi4zMzMsLTUuNDc5IDIzOC42MDksLTcgMjM0LjEyMiwtNyBMMjAwLjM3MSwtNyBDMTk1Ljg4NiwtNyAxOTIuMDg1LC01LjQ3OSAxODkuMTk3LC0yLjU5MSBMMTcxLjMzMiwxNS4xOTcgQzE2OC41MiwxOC4wMTEgMTY3LDIxLjczNSAxNjcsMjUuODQxIEwxNjcsNjAuMTI0IEMxNjcsNjQuODM3IDE2OC41OTcsNjguNDg2IDE3MS43ODgsNzEuNjAyIEwxODguNzQxLDg4LjU1NCBDMTkyLjA4NSw5MS44OTggMTk1LjgxLDkzLjQyIDIwMC42LDkzLjM0NCBMMjMzLjg5Niw5My4zNDQgQzIzOC41MzMsOTMuMzQ0IDI0Mi4zMzMsOTEuOTc0IDI0NS43NTMsODguNTU0IEwyNjIuNzA2LDcxLjYwMiBDMjY1LjgyMiw2OC40ODYgMjY3LjQ5Niw2NC43NjEgMjY3LjQ5Niw2MC4xMjQgTDI2Ny40OTYsMjUuODQxIEMyNjcuNDk2LDIxLjczNSAyNjUuOTc0LDE4LjAxMSAyNjMuMTYyLDE1LjE5NyBMMjQ1LjI5NiwtMi41OTEgTDI0NS4yOTYsLTIuNTkxIFoiIGlkPSJGaWxsLTMxIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTIzNi4xMzgsMzUuMzU2IEMyMzYuMTM4LDI0Ljk0MSAyMzUuMTUsMjAgMjIyLjM3OSwyMCBDMjEzLjQ4NSwyMCAyMDkuNjA5LDIyLjA1MyAyMDkuNjA5LDMxLjI1IEMyMDkuNjA5LDMzLjMwMyAyMTAuNDQ1LDMzLjgzNSAyMTIuNTczLDMzLjgzNSBMMjE0LjM5OCwzMy44MzUgQzIxNi4xNDYsMzMuODM1IDIxNy4yMSwzMy41MzIgMjE3LjIxLDMyLjAxIEMyMTcuMjEsMjguMjA5IDIxOC42NTQsMjcuODI5IDIyMi4zNzksMjcuODI5IEMyMjYuMjU3LDI3LjgyOSAyMjguMTU2LDI4LjIwOSAyMjguMTU2LDMzLjYwOCBDMjI4LjE1Niw0MS44OTMgMjIyLjA3NSw0Mi4xMjEgMjE2LjQ1LDQ0LjQ3OCBDMjA5Ljk4OSw0Ny4yMTQgMjA5LDUyLjE1NiAyMDksNTkuMzAxIEwyMDksNjMuODYyIEMyMDksNjcuMjA2IDIxMC40NDUsNjcuNzM5IDIxMy4yNTcsNjcuNzM5IEwyMzEuNzMsNjcuNzM5IEMyMzQuNTQyLDY3LjczOSAyMzUuOTg3LDY3LjI4MiAyMzUuOTg3LDY0Ljc3NSBMMjM1Ljk4Nyw2Mi40OTMgQzIzNS45ODcsNjAuMTM3IDIzNC41NDIsNTkuNjgxIDIzMS43Myw1OS42ODEgTDIxOC4yNzUsNTkuNjgxIEMyMTcuMjEsNTkuNjgxIDIxNi45MDUsNTkuMTQ5IDIxNi45MDUsNTcuOTMzIEwyMTYuOTA1LDU1LjQyNCBDMjE2LjkwNSw0Ny4yOSAyMzYuMTM4LDUyLjM4NCAyMzYuMTM4LDM1LjM1NiIgaWQ9IkZpbGwtMzIiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMzQ2LjY3NjQ4MywzOS43NTcgQzM0Ny43Mzk0ODMsMzkuNzU3IDM0OC4yNzM0ODMsMzkuMTQ4IDM0OC4yNzM0ODMsMzguMDA5IEwzNDguMjczNDgzLDI3LjA2MiBDMzQ4LjI3MzQ4MywyNC4yNSAzNDcuMjgzNDgzLDIxLjgxNiAzNDUuMzA4NDgzLDE5Ljc2NSBMMzI4LjA1MjQ4MywyLjI4IEMzMjYuMzAzNDgzLDAuNTMyIDMyNC4wOTk0ODMsMCAzMjEuNTkxNDgzLDAgTDI4Ny42ODY0ODMsMCBDMjg1LjE3ODQ4MywwIDI4Mi45NzQ0ODMsMC41MzIgMjgxLjIyNTQ4MywyLjI4IEwyNjMuOTcwNDgzLDE5Ljc2NSBDMjYxLjkxNzQ4MywyMS44MTYgMjYxLjAwNDQ4MywyNC4yNSAyNjEuMDA0NDgzLDI3LjA2MiBMMjYxLjAwNDQ4Myw2MC41ODYgQzI2MC45Mjc0ODMsNjMuMzk4IDI2MS44NDE0ODMsNjUuNDUgMjYzLjgxNzQ4Myw2Ny40MjcgTDI4MC43Njk0ODMsODQuMzc5IEMyODIuNzQ1NDgzLDg2LjM1NSAyODQuOTQ5NDgzLDg3LjI2NyAyODcuNjg2NDgzLDg3LjI2NyBMMzIxLjU5MTQ4Myw4Ny4yNjcgQzMyNC4zMjY0ODMsODcuMjY3IDMyNi41MzA0ODMsODYuMzU1IDMyOC41MDg0ODMsODQuMzc5IEwzNDUuNDU5NDgzLDY3LjQyNyBDMzQ3LjQzNjQ4Myw2NS41MjYgMzQ4LjI3MzQ4Myw2My4zOTggMzQ4LjI3MzQ4Myw2MC41ODYgTDM0OC4yNzM0ODMsNDkuMDMxIEMzNDguMTk2NDgzLDQ4LjA0NCAzNDcuNjY0NDgzLDQ3LjUxMiAzNDYuNjc2NDgzLDQ3LjUxMiBMMzQxLjU4MzQ4Myw0Ny41MTIgTDM0MS41ODM0ODMsNTEuMDg0IEMzNDEuNTgzNDgzLDUzLjc0NCAzNDEuMjAyNDgzLDU1LjExMiAzMzguOTIyNDgzLDU1LjExMiBMMzM2LjY0MTQ4Myw1NS4xMTIgQzMzNC4zNjE0ODMsNTUuMTEyIDMzMy45ODE0ODMsNTMuNzQ0IDMzMy45ODE0ODMsNTEuMDg0IEwzMzMuOTgxNDgzLDQ3LjUxMiBMMzMwLjQwODQ4Myw0Ny41MTIgQzMyNy43NDg0ODMsNDcuNTEyIDMyNi4zNzk0ODMsNDcuMTMxIDMyNi4zNzk0ODMsNDQuODUgTDMyNi4zNzk0ODMsNDIuNDE4IEMzMjYuMzc5NDgzLDQwLjEzNyAzMjcuNzQ4NDgzLDM5Ljc1NyAzMzAuNDA4NDgzLDM5Ljc1NyBMMzMzLjk4MTQ4MywzOS43NTcgTDMzMy45ODE0ODMsMzYuMTgzIEMzMzMuOTgxNDgzLDMzLjUyNCAzMzQuMzYxNDgzLDMyLjE1NSAzMzYuNjQxNDgzLDMyLjE1NSBMMzM4LjkyMjQ4MywzMi4xNTUgQzM0MS4yMDI0ODMsMzIuMTU1IDM0MS41ODM0ODMsMzMuNTI0IDM0MS41ODM0ODMsMzYuMTgzIEwzNDEuNTgzNDgzLDM5Ljc1NyBMMzQ2LjY3NjQ4MywzOS43NTciIGlkPSJGaWxsLTExNSIgZmlsbD0iIzFBMTkxOCI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0zNDguODgyLDM3LjU0NyBDMzQ4Ljg4MiwzOC42ODYgMzQ4LjM0OCwzOS4yOTUgMzQ3LjI4NSwzOS4yOTUgTDM0Mi4xOTIsMzkuMjk1IEwzNDIuMTkyLDM1LjcyMSBDMzQyLjE5MiwzMy4wNjIgMzQxLjgxMSwzMS42OTMgMzM5LjUzMSwzMS42OTMgTDMzNy4yNSwzMS42OTMgQzMzNC45NywzMS42OTMgMzM0LjU5LDMzLjA2MiAzMzQuNTksMzUuNzIxIEwzMzQuNTksMzkuMjk1IEwzMzEuMDE3LDM5LjI5NSBDMzI4LjM1NywzOS4yOTUgMzI2Ljk4OCwzOS42NzUgMzI2Ljk4OCw0MS45NTYgTDMyNi45ODgsNDQuMzg4IEMzMjYuOTg4LDQ2LjY2OSAzMjguMzU3LDQ3LjA1IDMzMS4wMTcsNDcuMDUgTDMzNC41OSw0Ny4wNSBMMzM0LjU5LDUwLjYyMiBDMzM0LjU5LDUzLjI4MiAzMzQuOTcsNTQuNjUgMzM3LjI1LDU0LjY1IEwzMzkuNTMxLDU0LjY1IEMzNDEuODExLDU0LjY1IDM0Mi4xOTIsNTMuMjgyIDM0Mi4xOTIsNTAuNjIyIEwzNDIuMTkyLDQ3LjA1IEwzNDcuMjg1LDQ3LjA1IEMzNDguMjczLDQ3LjA1IDM0OC44MDUsNDcuNTgyIDM0OC44ODIsNDguNTY5IEwzNDguODgyLDYwLjEyNCBDMzQ4Ljg4Miw2Mi45MzYgMzQ4LjA0NSw2NS4wNjQgMzQ2LjA2OCw2Ni45NjUgTDMyOS4xMTcsODMuOTE3IEMzMjcuMTM5LDg1Ljg5MyAzMjQuOTM1LDg2LjgwNSAzMjIuMiw4Ni44MDUgTDI4OC4yOTUsODYuODA1IEMyODUuNTU4LDg2LjgwNSAyODMuMzU0LDg1Ljg5MyAyODEuMzc4LDgzLjkxNyBMMjY0LjQyNiw2Ni45NjUgQzI2Mi40NSw2NC45ODggMjYxLjUzNiw2Mi45MzYgMjYxLjYxMyw2MC4xMjQgTDI2MS42MTMsMjYuNiBDMjYxLjYxMywyMy43ODggMjYyLjUyNiwyMS4zNTQgMjY0LjU3OSwxOS4zMDMgTDI4MS44MzQsMS44MTggQzI4My41ODMsMC4wNyAyODUuNzg3LC0wLjQ2MiAyODguMjk1LC0wLjQ2MiBMMzIyLjIsLTAuNDYyIEMzMjQuNzA4LC0wLjQ2MiAzMjYuOTEyLDAuMDcgMzI4LjY2MSwxLjgxOCBMMzQ1LjkxNywxOS4zMDMgQzM0Ny44OTIsMjEuMzU0IDM0OC44ODIsMjMuNzg4IDM0OC44ODIsMjYuNiBMMzQ4Ljg4MiwzNy41NDcgTDM0OC44ODIsMzcuNTQ3IFogTTMzMy4yOTcsLTIuNTkxIEMzMzAuMzMzLC01LjQ3OSAzMjYuNjA4LC03IDMyMi4xMjMsLTcgTDI4OC4zNzEsLTcgQzI4My44ODUsLTcgMjgwLjA4NSwtNS40NzkgMjc3LjE5NywtMi41OTEgTDI1OS4zMzIsMTUuMTk3IEMyNTYuNTIsMTguMDExIDI1NSwyMS43MzUgMjU1LDI1Ljg0MSBMMjU1LDYwLjEyNCBDMjU1LDY0LjgzNyAyNTYuNTk2LDY4LjQ4NiAyNTkuNzg5LDcxLjYwMiBMMjc2Ljc0MSw4OC41NTQgQzI4MC4wODUsOTEuODk4IDI4My44MDksOTMuNDIgMjg4LjU5OSw5My4zNDQgTDMyMS44OTUsOTMuMzQ0IEMzMjYuNTMyLDkzLjM0NCAzMzAuMzMzLDkxLjk3NCAzMzMuNzU0LDg4LjU1NCBMMzUwLjcwNiw3MS42MDIgQzM1My44MjIsNjguNDg2IDM1NS40OTUsNjQuNzYxIDM1NS40OTUsNjAuMTI0IEwzNTUuNDk1LDI1Ljg0MSBDMzU1LjQ5NSwyMS43MzUgMzUzLjk3NCwxOC4wMTEgMzUxLjE2MiwxNS4xOTcgTDMzMy4yOTcsLTIuNTkxIEwzMzMuMjk3LC0yLjU5MSBaIiBpZD0iRmlsbC0xMTYiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMzA5LjgyMyw2MC41OTMgQzMwNC40MjYsNjAuNTkzIDMwMi44Myw1OS4wNzMgMzAyLjgzLDU0LjU4OCBMMzAyLjgzLDQ3LjM2NSBDMzA0LjczMSw0Ni45MSAzMDYuNzgzLDQ2LjQ1NCAzMDguOTg4LDQ2LjQ1NCBDMzE0Ljg0MSw0Ni40NTQgMzE2LjEzMyw0Ny45NzQgMzE2LjEzMyw1My4yOTUgQzMxNi4xMzMsNTguMTYgMzE1LjQ0OSw2MC41OTMgMzA5LjgyMyw2MC41OTMgTDMwOS44MjMsNjAuNTkzIFogTTMwOS45NzYsMzkuNjEzIEMzMDguMDc1LDM5LjYxMyAzMDYuMTc1LDM5Ljc2NCAzMDQuMTk4LDQwLjE0NSBDMzAzLjQzOCw0MC4yOTYgMzAyLjgzLDM5Ljk5MyAzMDIuODMsMzkuMDggTDMwMi44MywzNy41NiBDMzAyLjgzLDMwLjQxNCAzMDMuMzYyLDI3LjgzIDMwOS4zNjcsMjcuODMgQzMxNC41MzYsMjcuODMgMzE1LjY3NywyOC4xMzMgMzE1LjY3NywzMS44NTkgQzMxNS42NzcsMzMuMzc5IDMxNi43NDEsMzMuODM1IDMxOC40OSwzMy44MzUgTDMyMC4zMTQsMzMuODM1IEMzMjIuNDQzLDMzLjgzNSAzMjMuMjc5LDMzLjMwMiAzMjMuMjc5LDMxLjI1IEMzMjMuMjc5LDIyLjI4IDMxOS40MDMsMjAgMzEwLjUwOCwyMCBDMjk2LjU5NywyMCAyOTUsMjUuNjI1IDI5NSw0My40MTMgQzI5NS4wNzYsNjAuNTkzIDI5NC4wODgsNjguMTk1IDMwOS42NzIsNjguMTk1IEMzMTkuNTU1LDY4LjE5NSAzMjMuOTYzLDY0LjkyNiAzMjMuOTYzLDUyLjM4MyBDMzIzLjk2Myw0Mi4wNDUgMzE5LjE3NCwzOS42MTMgMzA5Ljk3NiwzOS42MTMgTDMwOS45NzYsMzkuNjEzIFoiIGlkPSJGaWxsLTExNyIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0yODQuOTQ4LDIxIEwyNzguMDMsMjEgQzI3NS4zNywyMSAyNzQsMjEuNDU2IDI3NCwyMy42NjEgTDI3NCwyNi4xNjkgQzI3NCwyOC4zNzMgMjc1LjM3LDI4LjgyOSAyNzguMDMsMjguODI5IEwyNzkuNjI1LDI4LjgyOSBDMjgwLjYxNCwyOC44MjkgMjgxLjA3LDI5LjM2MSAyODEuMDcsMzAuODgyIEwyODEuMDcsNjMuNzIyIEMyODEuMDcsNjYuMzgyIDI4MS41MjYsNjcuNzUgMjgzLjczMSw2Ny43NSBMMjg2LjMxNSw2Ny43NSBDMjg4LjUyLDY3Ljc1IDI4OC45NzcsNjYuMzgyIDI4OC45NzcsNjMuNzIyIEwyODguOTc3LDIzLjY2MSBDMjg4Ljk3NywyMS40NTYgMjg3LjYwOCwyMSAyODQuOTQ4LDIxIiBpZD0iRmlsbC0xMTgiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMTMwLjQwNzM4NSw2OC4wMzcgQzExNC44MjMzODUsNjguMDM3IDExNS44MTEzODUsNjAuNDM0IDExNS43MzYzODUsNDMuMjU0IEMxMTUuNzM2Mzg1LDI1LjQ2NyAxMTcuMzMyMzg1LDE5Ljg0IDEzMS4yNDQzODUsMTkuODQgQzE0MC4xMzgzODUsMTkuODQgMTQ0LjAxNDM4NSwyMi4xMjEgMTQ0LjAxNDM4NSwzMS4wOTEgQzE0NC4wMTQzODUsMzMuMTQzIDE0My4xNzgzODUsMzMuNjc1IDE0MS4wNTAzODUsMzMuNjc1IEwxMzkuMjI1Mzg1LDMzLjY3NSBDMTM3LjQ3NjM4NSwzMy42NzUgMTM2LjQxMzM4NSwzMy4yMiAxMzYuNDEzMzg1LDMxLjY5OSBDMTM2LjQxMzM4NSwyNy45NzQgMTM1LjI3MjM4NSwyNy42NyAxMzAuMTAzMzg1LDI3LjY3IEMxMjQuMDk3Mzg1LDI3LjY3IDEyMy41NjYzODUsMzAuMjU1IDEyMy41NjYzODUsMzcuNCBMMTIzLjU2NjM4NSwzOC45MjEgQzEyMy41NjYzODUsMzkuODM0IDEyNC4xNzQzODUsNDAuMTM3IDEyNC45MzMzODUsMzkuOTg2IEMxMjYuOTExMzg1LDM5LjYwNiAxMjguODExMzg1LDM5LjQ1NCAxMzAuNzExMzg1LDM5LjQ1NCBDMTM5LjkxMDM4NSwzOS40NTQgMTQ0LjY5ODM4NSw0MS44ODYgMTQ0LjY5ODM4NSw1Mi4yMjUgQzE0NC42OTgzODUsNjQuNzY4IDE0MC4yOTAzODUsNjguMDM3IDEzMC40MDczODUsNjguMDM3IEwxMzAuNDA3Mzg1LDY4LjAzNyBaIE0xNTQuMDUxMzg1LDIuMjgxIEMxNTIuMzAzMzg1LDAuNTMyIDE1MC4wOTgzODUsMCAxNDcuNTkwMzg1LDAgTDExMy42ODUzODUsMCBDMTExLjE3ODM4NSwwIDEwOC45NzIzODUsMC41MzIgMTA3LjIyMzM4NSwyLjI4MSBMODkuOTY4Mzg0NiwxOS43NjUgQzg3LjkxNjM4NDYsMjEuODE3IDg3LjAwNDM4NDYsMjQuMjQ5IDg3LjAwNDM4NDYsMjcuMDYzIEw4Ny4wMDQzODQ2LDYwLjU4NSBDODYuOTI4Mzg0Niw2My4zOTkgODcuODM5Mzg0Niw2NS40NTEgODkuODE1Mzg0Niw2Ny40MjcgTDEwNi43NjgzODUsODQuMzc5IEMxMDguNzQ1Mzg1LDg2LjM1NiAxMTAuOTQ5Mzg1LDg3LjI2OSAxMTMuNjg1Mzg1LDg3LjI2OSBMMTQ3LjU5MDM4NSw4Ny4yNjkgQzE1MC4zMjYzODUsODcuMjY5IDE1Mi41MzEzODUsODYuMzU2IDE1NC41MDgzODUsODQuMzc5IEwxNzEuNDU5Mzg1LDY3LjQyNyBDMTczLjQzNTM4NSw2NS41MjggMTc0LjI3MTM4NSw2My4zOTkgMTc0LjI3MTM4NSw2MC41ODUgTDE3NC4yNzEzODUsNDkuMDMyIEMxNzQuMTk1Mzg1LDQ4LjA0MyAxNzMuNjYzMzg1LDQ3LjUxIDE3Mi42NzYzODUsNDcuNTEgTDE2Ny41ODIzODUsNDcuNTEgTDE2Ny41ODIzODUsNTEuMDg0IEMxNjcuNTgyMzg1LDUzLjc0NSAxNjcuMjAyMzg1LDU1LjExMyAxNjQuOTIyMzg1LDU1LjExMyBMMTYyLjY0MTM4NSw1NS4xMTMgQzE2MC4zNjAzODUsNTUuMTEzIDE1OS45ODAzODUsNTMuNzQ1IDE1OS45ODAzODUsNTEuMDg0IEwxNTkuOTgwMzg1LDQ3LjUxIEwxNTYuNDA3Mzg1LDQ3LjUxIEMxNTMuNzQ2Mzg1LDQ3LjUxIDE1Mi4zNzkzODUsNDcuMTMgMTUyLjM3OTM4NSw0NC44NSBMMTUyLjM3OTM4NSw0Mi40MTcgQzE1Mi4zNzkzODUsNDAuMTM3IDE1My43NDYzODUsMzkuNzU3IDE1Ni40MDczODUsMzkuNzU3IEwxNTkuOTgwMzg1LDM5Ljc1NyBMMTU5Ljk4MDM4NSwzNi4xODQgQzE1OS45ODAzODUsMzMuNTI0IDE2MC4zNjAzODUsMzIuMTU2IDE2Mi42NDEzODUsMzIuMTU2IEwxNjQuOTIyMzg1LDMyLjE1NiBDMTY3LjIwMjM4NSwzMi4xNTYgMTY3LjU4MjM4NSwzMy41MjQgMTY3LjU4MjM4NSwzNi4xODQgTDE2Ny41ODIzODUsMzkuNzU3IEwxNzIuNjc2Mzg1LDM5Ljc1NyBDMTczLjc0MDM4NSwzOS43NTcgMTc0LjI3MTM4NSwzOS4xNDkgMTc0LjI3MTM4NSwzOC4wMDkgTDE3NC4yNzEzODUsMjcuMDYzIEMxNzQuMjcxMzg1LDI0LjI0OSAxNzMuMjg0Mzg1LDIxLjgxNyAxNzEuMzA3Mzg1LDE5Ljc2NSBMMTU0LjA1MTM4NSwyLjI4MSBMMTU0LjA1MTM4NSwyLjI4MSBaIiBpZD0iRmlsbC00OSIgZmlsbD0iIzFBMTkxOCI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0xMzAuMTU2LDQ2IEMxMjcuOTUyLDQ2IDEyNS45LDQ2LjQ1NSAxMjQsNDYuOTExIEwxMjQsNTQuMTM0IEMxMjQsNTguNjE5IDEyNS41OTYsNjAuMTM5IDEzMC45OTMsNjAuMTM5IEMxMzYuNjE4LDYwLjEzOSAxMzcuMzAyLDU3LjcwNiAxMzcuMzAyLDUyLjg0MSBDMTM3LjMwMiw0Ny41MiAxMzYuMDEsNDYgMTMwLjE1Niw0NiIgaWQ9IkZpbGwtNTAiIGZpbGw9IiMxQTE5MTgiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMTc0Ljg4MiwzNy41NDYgQzE3NC44ODIsMzguNjg2IDE3NC4zNTEsMzkuMjk0IDE3My4yODcsMzkuMjk0IEwxNjguMTkzLDM5LjI5NCBMMTY4LjE5MywzNS43MjEgQzE2OC4xOTMsMzMuMDYxIDE2Ny44MTMsMzEuNjkzIDE2NS41MzMsMzEuNjkzIEwxNjMuMjUyLDMxLjY5MyBDMTYwLjk3MSwzMS42OTMgMTYwLjU5MSwzMy4wNjEgMTYwLjU5MSwzNS43MjEgTDE2MC41OTEsMzkuMjk0IEwxNTcuMDE4LDM5LjI5NCBDMTU0LjM1NywzOS4yOTQgMTUyLjk5LDM5LjY3NCAxNTIuOTksNDEuOTU0IEwxNTIuOTksNDQuMzg3IEMxNTIuOTksNDYuNjY3IDE1NC4zNTcsNDcuMDQ3IDE1Ny4wMTgsNDcuMDQ3IEwxNjAuNTkxLDQ3LjA0NyBMMTYwLjU5MSw1MC42MjEgQzE2MC41OTEsNTMuMjgyIDE2MC45NzEsNTQuNjUgMTYzLjI1Miw1NC42NSBMMTY1LjUzMyw1NC42NSBDMTY3LjgxMyw1NC42NSAxNjguMTkzLDUzLjI4MiAxNjguMTkzLDUwLjYyMSBMMTY4LjE5Myw0Ny4wNDcgTDE3My4yODcsNDcuMDQ3IEMxNzQuMjc0LDQ3LjA0NyAxNzQuODA2LDQ3LjU4IDE3NC44ODIsNDguNTY5IEwxNzQuODgyLDYwLjEyMiBDMTc0Ljg4Miw2Mi45MzYgMTc0LjA0Niw2NS4wNjUgMTcyLjA3LDY2Ljk2NCBMMTU1LjExOSw4My45MTYgQzE1My4xNDIsODUuODkzIDE1MC45MzcsODYuODA2IDE0OC4yMDEsODYuODA2IEwxMTQuMjk2LDg2LjgwNiBDMTExLjU2LDg2LjgwNiAxMDkuMzU2LDg1Ljg5MyAxMDcuMzc5LDgzLjkxNiBMOTAuNDI2LDY2Ljk2NCBDODguNDUsNjQuOTg4IDg3LjUzOSw2Mi45MzYgODcuNjE1LDYwLjEyMiBMODcuNjE1LDI2LjYgQzg3LjYxNSwyMy43ODYgODguNTI3LDIxLjM1NCA5MC41NzksMTkuMzAyIEwxMDcuODM0LDEuODE4IEMxMDkuNTgzLDAuMDY5IDExMS43ODksLTAuNDYzIDExNC4yOTYsLTAuNDYzIEwxNDguMjAxLC0wLjQ2MyBDMTUwLjcwOSwtMC40NjMgMTUyLjkxNCwwLjA2OSAxNTQuNjYyLDEuODE4IEwxNzEuOTE4LDE5LjMwMiBDMTczLjg5NSwyMS4zNTQgMTc0Ljg4MiwyMy43ODYgMTc0Ljg4MiwyNi42IEwxNzQuODgyLDM3LjU0NiBMMTc0Ljg4MiwzNy41NDYgWiBNMTU5LjI5OSwtMi41OTEgQzE1Ni4zMzMsLTUuNDggMTUyLjYwOSwtNyAxNDguMTI1LC03IEwxMTQuMzczLC03IEMxMDkuODg3LC03IDEwNi4wODYsLTUuNDggMTAzLjE5OCwtMi41OTEgTDg1LjMzNCwxNS4xOTcgQzgyLjUyMiwxOC4wMDkgODEsMjEuNzM0IDgxLDI1LjgzOSBMODEsNjAuMTIyIEM4MSw2NC44MzUgODIuNTk4LDY4LjQ4NSA4NS43OTEsNzEuNjAyIEwxMDIuNzQzLDg4LjU1NCBDMTA2LjA4Niw5MS44OTggMTA5LjgxMSw5My40MTggMTE0LjYsOTMuMzQzIEwxNDcuODk2LDkzLjM0MyBDMTUyLjUzNCw5My4zNDMgMTU2LjMzMyw5MS45NzUgMTU5Ljc1NCw4OC41NTQgTDE3Ni43MDcsNzEuNjAyIEMxNzkuODI0LDY4LjQ4NSAxODEuNDk2LDY0Ljc2IDE4MS40OTYsNjAuMTIyIEwxODEuNDk2LDI1LjgzOSBDMTgxLjQ5NiwyMS43MzQgMTc5Ljk3NSwxOC4wMDkgMTc3LjE2MywxNS4xOTcgTDE1OS4yOTksLTIuNTkxIEwxNTkuMjk5LC0yLjU5MSBaIiBpZD0iRmlsbC01MSI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0xMzAuODIzLDYwLjU5NCBDMTI1LjQyNiw2MC41OTQgMTIzLjgzLDU5LjA3NCAxMjMuODMsNTQuNTg5IEwxMjMuODMsNDcuMzY2IEMxMjUuNzMsNDYuOTEgMTI3Ljc4Miw0Ni40NTUgMTI5Ljk4Niw0Ni40NTUgQzEzNS44NCw0Ni40NTUgMTM3LjEzMiw0Ny45NzUgMTM3LjEzMiw1My4yOTYgQzEzNy4xMzIsNTguMTYxIDEzNi40NDgsNjAuNTk0IDEzMC44MjMsNjAuNTk0IEwxMzAuODIzLDYwLjU5NCBaIE0xMzAuOTc1LDM5LjYxNCBDMTI5LjA3NSwzOS42MTQgMTI3LjE3NSwzOS43NjYgMTI1LjE5Nyw0MC4xNDYgQzEyNC40MzgsNDAuMjk3IDEyMy44MywzOS45OTQgMTIzLjgzLDM5LjA4MSBMMTIzLjgzLDM3LjU2IEMxMjMuODMsMzAuNDE1IDEyNC4zNjEsMjcuODMgMTMwLjM2NywyNy44MyBDMTM1LjUzNiwyNy44MyAxMzYuNjc3LDI4LjEzNCAxMzYuNjc3LDMxLjg1OSBDMTM2LjY3NywzMy4zOCAxMzcuNzQsMzMuODM1IDEzOS40ODksMzMuODM1IEwxNDEuMzE0LDMzLjgzNSBDMTQzLjQ0MiwzMy44MzUgMTQ0LjI3OCwzMy4zMDMgMTQ0LjI3OCwzMS4yNTEgQzE0NC4yNzgsMjIuMjgxIDE0MC40MDIsMjAgMTMxLjUwOCwyMCBDMTE3LjU5NiwyMCAxMTYsMjUuNjI3IDExNiw0My40MTQgQzExNi4wNzUsNjAuNTk0IDExNS4wODcsNjguMTk3IDEzMC42NzEsNjguMTk3IEMxNDAuNTU0LDY4LjE5NyAxNDQuOTYyLDY0LjkyOCAxNDQuOTYyLDUyLjM4NSBDMTQ0Ljk2Miw0Mi4wNDYgMTQwLjE3NCwzOS42MTQgMTMwLjk3NSwzOS42MTQgTDEzMC45NzUsMzkuNjE0IFoiIGlkPSJGaWxsLTUyIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICAgICAgPHBhdGggZD0iTTY3LjA1MTM3NiwyLjI4MSBDNjUuMzAyMzc2LDAuNTMyIDYzLjA5ODM3NiwwIDYwLjU5MDM3NiwwIEwyNi42ODYzNzYsMCBDMjQuMTc3Mzc2LDAgMjEuOTczMzc2LDAuNTMyIDIwLjIyNDM3NiwyLjI4MSBMMi45NjgzNzYwNSwxOS43NjUgQzAuOTE2Mzc2MDUsMjEuODE3IDAuMDA0Mzc2MDQ5OTgsMjQuMjQ5IDAuMDA0Mzc2MDQ5OTgsMjcuMDYzIEwwLjAwNDM3NjA0OTk4LDYwLjU4NSBDLTAuMDcxNjIzOTUsNjMuMzk5IDAuODQxMzc2MDUsNjUuNDUxIDIuODE2Mzc2MDUsNjcuNDI3IEwxOS43NjgzNzYsODQuMzc5IEMyMS43NDQzNzYsODYuMzU2IDIzLjk0OTM3Niw4Ny4yNjggMjYuNjg2Mzc2LDg3LjI2OCBMNjAuNTkwMzc2LDg3LjI2OCBDNjMuMzI2Mzc2LDg3LjI2OCA2NS41MzEzNzYsODYuMzU2IDY3LjUwNzM3Niw4NC4zNzkgTDg0LjQ1OTM3Niw2Ny40MjcgQzg2LjQzNTM3Niw2NS41MjcgODcuMjcyMzc2LDYzLjM5OSA4Ny4yNzIzNzYsNjAuNTg1IEw4Ny4yNzIzNzYsNDkuMDMyIEM4Ny4xOTYzNzYsNDguMDQzIDg2LjY2MzM3Niw0Ny41MSA4NS42NzUzNzYsNDcuNTEgTDgwLjU4MjM3Niw0Ny41MSBMODAuNTgyMzc2LDUxLjA4MyBDODAuNTgyMzc2LDUzLjc0NSA4MC4yMDIzNzYsNTUuMTEzIDc3LjkyMjM3Niw1NS4xMTMgTDc1LjY0MTM3Niw1NS4xMTMgQzczLjM2MTM3Niw1NS4xMTMgNzIuOTgxMzc2LDUzLjc0NSA3Mi45ODEzNzYsNTEuMDgzIEw3Mi45ODEzNzYsNDcuNTEgTDY5LjQwODM3Niw0Ny41MSBDNjYuNzQ3Mzc2LDQ3LjUxIDY1LjM3OTM3Niw0Ny4xMyA2NS4zNzkzNzYsNDQuODUgTDY1LjM3OTM3Niw0Mi40MTcgQzY1LjM3OTM3Niw0MC4xMzcgNjYuNzQ3Mzc2LDM5Ljc1NyA2OS40MDgzNzYsMzkuNzU3IEw3Mi45ODEzNzYsMzkuNzU3IEw3Mi45ODEzNzYsMzYuMTg0IEM3Mi45ODEzNzYsMzMuNTI0IDczLjM2MTM3NiwzMi4xNTYgNzUuNjQxMzc2LDMyLjE1NiBMNzcuOTIyMzc2LDMyLjE1NiBDODAuMjAyMzc2LDMyLjE1NiA4MC41ODIzNzYsMzMuNTI0IDgwLjU4MjM3NiwzNi4xODQgTDgwLjU4MjM3NiwzOS43NTcgTDg1LjY3NTM3NiwzOS43NTcgQzg2LjczOTM3NiwzOS43NTcgODcuMjcyMzc2LDM5LjE0OSA4Ny4yNzIzNzYsMzguMDA5IEw4Ny4yNzIzNzYsMjcuMDYzIEM4Ny4yNzIzNzYsMjQuMjQ5IDg2LjI4MzM3NiwyMS44MTcgODQuMzA2Mzc2LDE5Ljc2NSBMNjcuMDUxMzc2LDIuMjgxIiBpZD0iRmlsbC01MyIgZmlsbD0iIzFBMTkxOCI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik01MC41NzgsNDkuNDE4IEM1MC41NzgsNTcuMjQ4IDUwLjI3NCw2MC41MTYgNDMuMjc5LDYwLjUxNiBDMzYuMjg2LDYwLjUxNiAzNS45ODIsNTcuMzI0IDM1Ljk4Miw0OS41NyBMMzUuOTgyLDM5LjA4IEMzNS45ODIsMzEuMjUgMzYuMjg2LDI3Ljk4MSA0My4yNzksMjcuOTgxIEM1MC4yNzQsMjcuOTgxIDUwLjU3OCwzMS4xNzUgNTAuNTc4LDM4LjkyOCBMNTAuNTc4LDQ5LjQxOCBMNTAuNTc4LDQ5LjQxOCBaIE00My4yNzksMjAgQzI4LjQ1NywyMCAyOCwyNy4xNDUgMjgsNDYuNTI5IEMyOCw2MS42NTcgMjkuNjcyLDY4LjQ5OSA0My4yNzksNjguNDk5IEM1Ny41NzEsNjguNDk5IDU4LjU1OSw2MC44OTYgNTguNTU5LDQ0LjAyMSBDNTguNTU5LDI3LjIyMSA1Ny41NzEsMjAgNDMuMjc5LDIwIEw0My4yNzksMjAgWiIgaWQ9IkZpbGwtNTQiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNODYuODgyLDM3LjU0NiBDODYuODgyLDM4LjY4NiA4Ni4zNDksMzkuMjk0IDg1LjI4NSwzOS4yOTQgTDgwLjE5MiwzOS4yOTQgTDgwLjE5MiwzNS43MjEgQzgwLjE5MiwzMy4wNjEgNzkuODEyLDMxLjY5MyA3Ny41MzIsMzEuNjkzIEw3NS4yNTEsMzEuNjkzIEM3Mi45NzEsMzEuNjkzIDcyLjU5MSwzMy4wNjEgNzIuNTkxLDM1LjcyMSBMNzIuNTkxLDM5LjI5NCBMNjkuMDE4LDM5LjI5NCBDNjYuMzU3LDM5LjI5NCA2NC45ODksMzkuNjc0IDY0Ljk4OSw0MS45NTQgTDY0Ljk4OSw0NC4zODcgQzY0Ljk4OSw0Ni42NjcgNjYuMzU3LDQ3LjA0NyA2OS4wMTgsNDcuMDQ3IEw3Mi41OTEsNDcuMDQ3IEw3Mi41OTEsNTAuNjIgQzcyLjU5MSw1My4yODIgNzIuOTcxLDU0LjY1IDc1LjI1MSw1NC42NSBMNzcuNTMyLDU0LjY1IEM3OS44MTIsNTQuNjUgODAuMTkyLDUzLjI4MiA4MC4xOTIsNTAuNjIgTDgwLjE5Miw0Ny4wNDcgTDg1LjI4NSw0Ny4wNDcgQzg2LjI3Myw0Ny4wNDcgODYuODA2LDQ3LjU4IDg2Ljg4Miw0OC41NjkgTDg2Ljg4Miw2MC4xMjIgQzg2Ljg4Miw2Mi45MzYgODYuMDQ1LDY1LjA2NCA4NC4wNjksNjYuOTY0IEw2Ny4xMTcsODMuOTE2IEM2NS4xNDEsODUuODkzIDYyLjkzNiw4Ni44MDUgNjAuMiw4Ni44MDUgTDI2LjI5Niw4Ni44MDUgQzIzLjU1OSw4Ni44MDUgMjEuMzU0LDg1Ljg5MyAxOS4zNzgsODMuOTE2IEwyLjQyNiw2Ni45NjQgQzAuNDUxLDY0Ljk4OCAtMC40NjIsNjIuOTM2IC0wLjM4Niw2MC4xMjIgTC0wLjM4NiwyNi42IEMtMC4zODYsMjMuNzg2IDAuNTI2LDIxLjM1NCAyLjU3OCwxOS4zMDIgTDE5LjgzNCwxLjgxOCBDMjEuNTgzLDAuMDY5IDIzLjc4NywtMC40NjMgMjYuMjk2LC0wLjQ2MyBMNjAuMiwtMC40NjMgQzYyLjcwOCwtMC40NjMgNjQuOTEyLDAuMDY5IDY2LjY2MSwxLjgxOCBMODMuOTE2LDE5LjMwMiBDODUuODkzLDIxLjM1NCA4Ni44ODIsMjMuNzg2IDg2Ljg4MiwyNi42IEw4Ni44ODIsMzcuNTQ2IEw4Ni44ODIsMzcuNTQ2IFogTTcxLjI5OCwtMi41OTEgQzY4LjMzMywtNS40OCA2NC42MDksLTcgNjAuMTI0LC03IEwyNi4zNzIsLTcgQzIxLjg4NywtNyAxOC4wODYsLTUuNDggMTUuMTk4LC0yLjU5MSBMLTIuNjY3LDE1LjE5NyBDLTUuNDc5LDE4LjAwOSAtNywyMS43MzQgLTcsMjUuODM5IEwtNyw2MC4xMjIgQy03LDY0LjgzNSAtNS40MDMsNjguNDg1IC0yLjIxMSw3MS42MDIgTDE0Ljc0Miw4OC41NTMgQzE4LjA4Niw5MS44OTggMjEuODExLDkzLjQxOCAyNi42LDkzLjM0MyBMNTkuODk2LDkzLjM0MyBDNjQuNTMyLDkzLjM0MyA2OC4zMzMsOTEuOTc0IDcxLjc1NCw4OC41NTMgTDg4LjcwNiw3MS42MDIgQzkxLjgyMyw2OC40ODUgOTMuNDk1LDY0Ljc2IDkzLjQ5NSw2MC4xMjIgTDkzLjQ5NSwyNS44MzkgQzkzLjQ5NSwyMS43MzQgOTEuOTc0LDE4LjAwOSA4OS4xNjEsMTUuMTk3IEw3MS4yOTgsLTIuNTkxIEw3MS4yOTgsLTIuNTkxIFoiIGlkPSJGaWxsLTU1Ij48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg==) 0 0 no-repeat;display:block;text-indent:-9999em;background-size:auto 16px;position:relative;top:-2px;opacity:.2;-ms-filter:\"alpha(Opacity=20)\";filter:alpha(Opacity=20);-webkit-transition:opacity .2s ease;-moz-transition:opacity .2s ease;-ms-transition:opacity .2s ease;-o-transition:opacity .2s ease;transition:opacity .2s ease}#market_context_headcrab table .pb-badge{top:1px}#market_context_headcrab .pb-badge-0{background-position:0 0}#market_context_headcrab .pb-badge-6{background-position:-16px 0}#market_context_headcrab .pb-badge-12{background-position:-32px 0}#market_context_headcrab .pb-badge-16{background-position:-48px 0}#market_context_headcrab .pb-badge-18{background-position:-64px 0}#market_context_headcrab .pb-product-shops td.pb-product-shops-badge{width:30px!important;padding-top:10px!important}#market_context_headcrab .pb-products-txt .pb-badge,#market_context_headcrab .pb-product-best-txt .pb-badge{display:inline-block!important;float:left!important;line-height:inherit!important;margin-right:12px!important;margin-top:6px!important}#market_context_headcrab .pb-product-best-txt .pb-badge{margin-top:8px!important}.fotorama--fullscreen{z-index:2147483647!important}#market_context_headcrab.pb-sitebar_adult{background:transparent!important;border:0!important}#market_context_headcrab.pb-sitebar_adult .pb-overlay{top:0}#market_context_headcrab.pb-sitebar_adult .pb-sitebar-logo,#market_context_headcrab.pb-sitebar_adult .pb-sitebar-logo img,#market_context_headcrab.pb-sitebar_adult .pb-sitebar-cnt,#market_context_headcrab.pb-sitebar_adult .pb-sitebar-btns,#market_context_headcrab.pb-sitebar_adult .pb-sitebar-options{visibility:hidden!important}#market_context_headcrab .pb-disclaimer{margin:7px 0 5px}#market_context_headcrab .pb-disclaimer_bar{background:rgba(50,50,50,.7);position:absolute;top:39px;left:0;right:0;padding:1px 0 1px 64px;margin:0}#market_context_headcrab .pb-disclaimer_bar:before{position:absolute;top:-6px;left:64px;content:'';border:6px inset transparent;border-width:6px;border-bottom-color:rgba(50,50,50,.7);border-bottom-style:solid;border-top:0}#market_context_headcrab .pb-disclaimer-txt{color:#D8D8D8;font:12px/18px Arial,sans-serif}#market_context_headcrab .pb-disclaimer-i{margin:0 4px 0 -2px!important;background-position:-96px -16px}#market_context_headcrab .pb-disclaimer_dark .pb-disclaimer-txt{color:#ababab}#market_context_headcrab .pb-disclaimer_dark .pb-disclaimer-i{background-position:-96px -32px;top:1px}",
    template: "<div id=\"market_context_headcrab\" class=\"pb-sitebar {{#showOffer}} pb-sitebar_offer {{/showOffer}} {{#needShowAdultOptIn}} pb-sitebar_offer pb-sitebar_adult {{/needShowAdultOptIn}} {{abClass}} {{viewModificators}}\" style=\"top:0\">{{#isAvia}}<div class=\"pb-cell pb-sitebar-logo\">{{#customLogo}} <img alt=\"\" src=\"{{customLogo}}\"> {{/customLogo}} {{^customLogo}} <img alt=\"\" src=\"data:image/png;base64,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\"> {{/customLogo}}</div>{{/isAvia}} {{#isProduct}} {{#isDefaultScript}}<div class=\"pb-cell pb-sitebar-logo\"><img alt=\"\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAYAAAAPtVbGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAghJREFUeNpidM3ZKMXGxhrLgAZ+//m3ddcknysMVAAsrMwssgwMTB0YEixMhkAqghqWMOGSYGT4H+icvU6YKpZsm3j69O/Xr3hg+P///6ug1rCxs3HGUcMSRnQBj/zt7szMjDtA7P//Ga4z/PobQIkFP9j+fWXEFG5g8i40f8TAyChNDV/8Z2DYgiVOGv4BPbiEgYoAa8T//v17Ac0t2TXF9wYwPk7S1BIoWEBzSxh//FkJTM4/aWrJ1uk+74HURorzyH+G50x4k9///xQFGTBe////93c1Xku2P/2yC2jRc9IN//8ciJcAM6HbtoneuxkJafAq3N7FyMhYSsDQT0DqILD82PP/9/892yd7XUMpbAm66s//BYys6Jb8/wUMiuP//zPuBYbInh8XTp4+cKDhD9FlFzbgXbjjJLB4YAMqBhr6d8/Lr/8OnZ3l+42aGZbBwaGBhWGwA2ZcEnJyctbCwsLJfHx8TB8/frxPKL8pKSlFCQgIBPDy8j799OnTe4JxArKAmZn5MDBVgeX//fvn+eDBgx24bABa0Aik6qAp7e2vX7/Unz59+hZvjgdaYA+zAKyIicmRQBKGywO1CbOwsOgRLFaAmrYBqV9Q9l8gtRlv0cHIuAGJ+/jr169niErCioqK6kALHIC+OHbv3r3LhCIXGMTOwBBQ/Pnz54Znz569QZYDCDAADJjPt0ourxwAAAAASUVORK5CYII=\"></div>{{/isDefaultScript}} {{^isDefaultScript}}<div class=\"pb-cell pb-sitebar-logo\">{{#customLogo}} <img alt=\"\" src=\"{{customLogo}}\"> {{/customLogo}} {{^customLogo}} <img alt=\"\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAYCAYAAAAPtVbGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAghJREFUeNpidM3ZKMXGxhrLgAZ+//m3ddcknysMVAAsrMwssgwMTB0YEixMhkAqghqWMOGSYGT4H+icvU6YKpZsm3j69O/Xr3hg+P///6ug1rCxs3HGUcMSRnQBj/zt7szMjDtA7P//Ga4z/PobQIkFP9j+fWXEFG5g8i40f8TAyChNDV/8Z2DYgiVOGv4BPbiEgYoAa8T//v17Ac0t2TXF9wYwPk7S1BIoWEBzSxh//FkJTM4/aWrJ1uk+74HURorzyH+G50x4k9///xQFGTBe////93c1Xku2P/2yC2jRc9IN//8ciJcAM6HbtoneuxkJafAq3N7FyMhYSsDQT0DqILD82PP/9/892yd7XUMpbAm66s//BYys6Jb8/wUMiuP//zPuBYbInh8XTp4+cKDhD9FlFzbgXbjjJLB4YAMqBhr6d8/Lr/8OnZ3l+42aGZbBwaGBhWGwA2ZcEnJyctbCwsLJfHx8TB8/frxPKL8pKSlFCQgIBPDy8j799OnTe4JxArKAmZn5MDBVgeX//fvn+eDBgx24bABa0Aik6qAp7e2vX7/Unz59+hZvjgdaYA+zAKyIicmRQBKGywO1CbOwsOgRLFaAmrYBqV9Q9l8gtRlv0cHIuAGJ+/jr169niErCioqK6kALHIC+OHbv3r3LhCIXGMTOwBBQ/Pnz54Znz569QZYDCDAADJjPt0ourxwAAAAASUVORK5CYII=\"> {{/customLogo}}</div>{{/isDefaultScript}} {{/isProduct}}<div class=\"pb-cell pb-sitebar-cnt\" id=\"market_context_text\">{{#needShowAgeBadge}}<div class=\"pb-sitebar-badge\"><div class=\"pb-badge pb-badge-{{age}}\">{{age}}+</div></div>{{/needShowAgeBadge}}<div class=\"pb-sitebar-text\" id=\"market_context_text_content\">{{#isClassified}} Цена на новый {{#model}}<strong>{{productName}}</strong>{{/model}}{{^model}}{{productName}}{{/model}} в магазине {{shop.name}} {{/isClassified}} {{^isClassified}} {{#isLowestPrice}} Более выгодная цена на {{#model}} <strong>{{productName}}</strong>{{/model}}{{^model}}{{productName}}{{/model}} в магазине {{shop.name}} {{/isLowestPrice}} {{^isLowestPrice}} {{#isEqualsPrice}} <span class=\"pb-offer-text\">Есть предложение на {{#model}} <strong>{{productName}}</strong>{{/model}}{{^model}}{{productName}}{{/model}}</span> &nbsp; <u class=\"pb-equals-text pb-underline\">по той же цене</u> в магазине {{shop.name}} {{/isEqualsPrice}} {{^isEqualsPrice}} {{#isHigherPrice}} На этой странице самая низкая цена на {{#model}} <strong>{{productName}}</strong>{{/model}}{{^model}}{{productName}}{{/model}} {{/isHigherPrice}} {{^isHigherPrice}} Цена в Яндекс.Маркете на {{#model}} <strong>{{productName}}</strong>{{/model}}{{^model}}{{productName}}{{/model}} в магазине {{shop.name}} {{/isHigherPrice}} {{/isEqualsPrice}} {{/isLowestPrice}} {{/isClassified}}</div>{{^isHigherPrice}} <span class=\"pb-dash\">&nbsp;&mdash;&nbsp;</span><div class=\"pb-sitebar-price\" id=\"market_context_price\">{{priceText}}</div>{{/isHigherPrice}} &nbsp;<div class=\"pb-sitebar-price-delivery\" id=\"market_context_delivery\">{{#isHigherPrice}} (по данным Яндекс.Маркета) {{/isHigherPrice}} {{^isHigherPrice}} {{#mainOfferDelivery}} (<img alt=\"доставка:\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE2OXB4IiBoZWlnaHQ9IjEwM3B4IiB2aWV3Qm94PSIwIDAgMTY5IDEwMyIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLRgdC60LDRh9Cw0L3QvdGL0LUt0YTQsNC4zIbQu9GLLWNvcHkiIGZpbGw9IiM3NTZBNDMiPgogICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsIiBjeD0iNDIiIGN5PSI5MSIgcj0iMTIiPjwvY2lyY2xlPgogICAgICAgICAgICA8Y2lyY2xlIGlkPSJPdmFsIiBjeD0iMTI4IiBjeT0iOTEiIHI9IjEyIj48L2NpcmNsZT4KICAgICAgICAgICAgPHBhdGggZD0iTTE0OS42ODU3MTQsMzYuNDI4NTcxNCBMMTMyLjc4NTcxNCwxMi4xNDI4NTcxIEw5Ni41NzE0Mjg2LDEyLjE0Mjg1NzEgTDk2LjU3MTQyODYsNjAuNzE0Mjg1NyBMODQuNSwwIEwwLDAgTDAsODUgTDIxLjcyODU3MTQsODUgQzI0LjE0Mjg1NzEsNzYuNSAzMi41OTI4NTcxLDY5LjIxNDI4NTcgNDIuMjUsNjkuMjE0Mjg1NyBDNTEuOTA3MTQyOSw2OS4yMTQyODU3IDYwLjM1NzE0MjksNzYuNSA2Mi43NzE0Mjg2LDg1IEwxMDcuNDM1NzE0LDg1IEMxMDkuODUsNzYuNSAxMTguMyw2OS4yMTQyODU3IDEyNy45NTcxNDMsNjkuMjE0Mjg1NyBDMTM3LjYxNDI4Niw2OS4yMTQyODU3IDE0NC44NTcxNDMsNzYuNSAxNDcuMjcxNDI5LDg1IEwxNjksODUgTDE2OSw0OC41NzE0Mjg2IEwxNDkuNjg1NzE0LDM2LjQyODU3MTQgTDE0OS42ODU3MTQsMzYuNDI4NTcxNCBaIE0xMjAuNzE0Mjg2LDQ4LjU3MTQyODYgTDEyMC43MTQyODYsMjUuNSBMMTQwLjAyODU3MSw0OC41NzE0Mjg2IEwxMjAuNzE0Mjg2LDQ4LjU3MTQyODYgTDEyMC43MTQyODYsNDguNTcxNDI4NiBaIiBpZD0iU2hhcGUtQ29weSI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+\">&nbsp; {{#delivery}} {{#price}} {{value}} {{currency}}) {{/price}} {{^price}} {{#free}} бесплатно) {{/free}} {{^free}} {{brief}}) {{/free}} {{/price}} {{/delivery}} {{^delivery}} не производится) {{/delivery}} {{/mainOfferDelivery}} {{/isHigherPrice}}</div>&nbsp;</div><div class=\"pb-cell pb-sitebar-btns\">{{^isHigherPrice}} <a class=\"pb-sitebar-button\">{{#isProduct}} Посмотреть {{/isProduct}} {{#isAvia}} Найти билеты {{/isAvia}}</a> {{/isHigherPrice}} {{#shops.length}} <a id=\"market_context_shops\" class=\"pb-sitebar-button pb-sitebar-button-all\">Ещё варианты <span class=\"pb-caret\"></span></a> {{/shops.length}}</div><div class=\"pb-cell pb-sitebar-options\"><a id=\"market_context_question\" class=\"pb-sitebar-i pb-sitebar-question pb-sitebar-right-action\" title=\"{{#isWebPartner}}О сервисе{{/isWebPartner}}{{^isWebPartner}}О программе{{/isWebPartner}}\"></a> <a id=\"market_context_settings\" class=\"pb-sitebar-i pb-sitebar-settings pb-sitebar-right-action\" title=\"Настройки\"></a> <a id=\"market_context_close\" class=\"pb-sitebar-i pb-sitebar-close pb-sitebar-right-action\" title=\"Закрыть\"></a></div>{{#warning}}<div class=\"pb-disclaimer pb-disclaimer_bar\"><div class=\"pb-disclaimer-txt\"><i class=\"pb-disclaimer-i\"></i>{{warning}}</div></div>{{/warning}}<div id=\"sitebar_info_popover\" class=\"pb-sitebar_popover pb-sitebar_popover_feedback\" style=\"display:none\"><a class=\"pb-sitebar_popover-close\">&times;</a><h1 class=\"pb-title\">{{#isMbrApplication}}<strong>Советник Яндекс.Маркета</strong>{{/isMbrApplication}} {{^isMbrApplication}}Советник Яндекс.Маркета для <strong>{{appName}}</strong>{{/isMbrApplication}}</h1>{{#isProduct}}<p>Это приложение подсказывает вам более выгодные цены на товары, на которые вы смотрите прямо сейчас.</p><p><a href=\"https://help.yandex.ru/market/personal-services/sovetnik.xml\" target=\"_blank\" class=\"pb-color pb-block\">Помощь</a> <a href=\"https://feedback2.yandex.ru/market/sovetnik/\" target=\"_blank\" class=\"pb-color pb-block\">Обратная связь</a></p><p class=\"pb-footer\">© 2013–2015 ООО «Яндекс» {{^isWebPartner}} <a class=\"pb-sitebar_software_agreement pb-newline\" href=\"http://legal.yandex.ru/desktop_software_agreement\" target=\"_blank\">Лицензионное соглашение</a> {{/isWebPartner}}</p>{{/isProduct}} {{#isAvia}}<p>Это приложение подсказывает вам более выгодные цены на авиабилеты в нужном вам направлении. Данные Aviasales.</p>{{/isAvia}}</div><div id=\"sitebar_feedback_popover\" class=\"pb-sitebar_popover pb-sitebar_popover_feedback\" style=\"display: none\"><a href=\"\" class=\"pb-sitebar_popover-close\">&times;</a><h1 class=\"pb-title\">Спасибо!</h1><p><span class=\"pb-block\">Ваше сообщение поможет</span> <span class=\"pb-block\">улучшить Советника</span></p></div><div id=\"sitebar_settings_popover\" class=\"pb-sitebar_popover pb-sitebar_popover_settings\" style=\"display:none; z-index:10000\"><a class=\"pb-sitebar_popover-close\">&times;</a><p>Сообщить об ошибке:<br><a class=\"wrong-product pb-color\" data-type=\"wrong-product\">Неверно определён товар</a></p><p><a href=\"{{settingsURL}}/#domain={{domain}}\" class=\"pb-color\" target=\"_blank\">Выключить на этом сайте</a> <a id=\"settings_link\" href=\"{{settingsURL}}\" target=\"_blank\" class=\"pb-btn pb-btn-primary\">Настройки</a></p></div>{{#showOffer}}<div class=\"pb-overlay\">{{#isOptOutEnabled}}<div id=\"sitebar_policy_popover\" class=\"pb-sitebar_popover pb-sitebar_popover_centered pb-sitebar_popover_opt_out\"><a href=\"\" class=\"pb-sitebar_popover-close\">&times;</a><div class=\"pb-header\">{{#optInImage}} <img src=\"{{optInImage}}\"> {{/optInImage}}<h1 class=\"pb-title\">{{optInTitle}}</h1></div><p><label id=\"price_context_show_this_site\" class=\"pb-checkbox-label checked\"><input type=\"checkbox\" checked=\"checked\">Советник Яндекс.Маркета для {{appName}} помогает сэкономить деньги с помощью автоматического поиска более выгодной цены на товары на сайтах интернет-магазинов</label></p><p class=\"pb-btn-cnt\"><a id=\"price_context_show_price\" class=\"pb-btn pb-btn-success pb-btn-block pb-btn-lg\">OK</a></p><p class=\"pb-footer\">Используя Советник Яндекс.Маркета для {{appName}}, я принимаю условия <a href=\"http://legal.yandex.ru/desktop_software_agreement/\" target=\"_blank\" id=\"price_context_policy\" class=\"pb-link pb-link-policy\">Лицензионного соглашения</a></p></div>{{/isOptOutEnabled}} {{^isOptOutEnabled}}<div class=\"pb-overlay-header\"><h6 class=\"pb-overlay-title\">Нажмите кнопку «Показывать»,<br>чтобы начать пользоваться Советником.</h6></div><div id=\"sitebar_policy_popover\" class=\"pb-sitebar-offer pb-sitebar_popover pb-sitebar_popover_policy pb-sitebar_popover_opt_in\" style=\"z-index:100000\"><h1 class=\"pb-title\">{{#isMbrApplication}}<strong>Советник Яндекс.Маркета</strong>{{/isMbrApplication}} {{^isMbrApplication}}<strong>Советник Яндекс.Маркета</strong> для <strong>{{appName}}</strong>{{/isMbrApplication}} может показывать более выгодные цены на&nbsp;товары в&nbsp;интернете.</h1><p class=\"pb-btn-cnt\"><a id=\"price_context_show_price\" class=\"pb-btn pb-btn-primary\">Показывать</a> <a id=\"price_context_no\" class=\"pb-btn\">Нет, спасибо</a></p><p class=\"pb-footer\">Нажимая «Показывать», я&nbsp;соглашаюсь с&nbsp;условиями <a href=\"http://legal.yandex.ru/desktop_software_agreement/\" target=\"_blank\" id=\"price_context_policy\" class=\"pb-link pb-link-policy\">Лицензионного соглашения</a>.</p></div><div class=\"pb-overlay-arr\"></div>{{/isOptOutEnabled}}</div>{{/showOffer}} {{#needShowAdultOptIn}}<div class=\"pb-overlay\"><div class=\"pb-overlay-header\"><h6 class=\"pb-overlay-title\">Нажмите кнопку «Показывать»,<br>чтобы начать пользоваться Советником</h6></div><div id=\"sitebar_policy_popover\" class=\"pb-sitebar-offer pb-sitebar_popover pb-sitebar_popover_centered pb-sitebar_popover_policy\"><h1 class=\"pb-title\">{{#isMbrApplication}}<strong>Советник Яндекс.Маркета</strong>{{/isMbrApplication}} {{^isMbrApplication}}<strong>Советник Яндекс.Маркета</strong> для <strong>{{appName}}</strong>{{/isMbrApplication}} нашел товары из категории &laquo;для взрослых&raquo;. Чтобы увидеть их, подтвердите, что вы старше 18 лет</h1><p class=\"pb-btn-cnt\"><a id=\"adult_yes\" class=\"pb-btn pb-btn-primary\">Подтвердить</a> <a id=\"adult_no\" class=\"pb-btn\">Отказаться</a></p></div></div>{{/needShowAdultOptIn}} {{#showWelcome}}<div id=\"sitebar_policy_popover\" class=\"pb-sitebar-offer pb-sitebar_popover pb-sitebar_popover_policy pb-sitebar-welcome\" style=\"z-index:100000\"><a class=\"pb-sitebar_popover-close\">&times;</a><h1 class=\"pb-title\"><strong>Яндекс.Элементы</strong> помогут найти более выгодные цены на&nbsp;товары в&nbsp;интернете</h1><p class=\"pb-btn-cnt\"><a id=\"pricebar_welcome_ok\" class=\"pb-btn pb-btn-primary\">ОК</a></p><p class=\"pb-footer\">Вы можете настроить или отключить такие советы в <a href=\"{{settingsURL}}\">Настройках</a></p></div>{{/showWelcome}} {{#shops.length}}<div id=\"sitebar_shops_popover\" class=\"pb-sitebar_popover pb-sitebar_popover_large pb-sitebar_popover_product\" style=\"display: none\"><a href=\"\" class=\"pb-sitebar_popover-close\">&times;</a> {{#model}}<h1 class=\"pb-product-title\"><a href=\"{{model.urls.model}}\" target=\"_blank\">{{#model.caption}} {{model.caption}} {{/model.caption}} {{^model.caption}} {{model.vendor}} {{model.name}} {{/model.caption}}</a></h1>{{/model}} {{^model}}<h1 class=\"pb-product-title\"><a href=\"{{searchUrl}}\" target=\"_blank\">{{productName}}</a></h1>{{/model}} {{#warning}}<div class=\"pb-disclaimer pb-disclaimer_dark\"><div class=\"pb-disclaimer-txt\"><i class=\"pb-disclaimer-i\"></i>{{warning}}</div></div>{{/warning}} {{#model}}<div class=\"pb-product-stat\"><table cellpadding=\"0\" class=\"pb-table\"><tr><td class=\"pb-table-cell pb-product-prices\"><a href=\"{{model.urls.price}}\" target=\"_blank\">Средняя цена</a>&nbsp;&nbsp;&nbsp; <span class=\"pb-product-price\">{{model.prices.avg}} <span class=\"pb-{{currencyClass}}\">{{currency}}</span></span>&nbsp;&nbsp;&nbsp; <span class=\"pb-product-price_range\">({{model.prices.min}} – {{model.prices.max}} {{currency}})</span></td><td class=\"pb-table-cell pb-table-cell_right\">{{#model.rating}}<div class=\"pb-product-rate\">Рейтинг товара <span class=\"pb-product-rate-value\" title=\"Рейтинг товара {{model.rating}} из 5\">{{model.rating}}</span></div>{{/model.rating}}</td></tr></table></div>{{/model}}<div class=\"pb-divider\"></div><div class=\"pb-block_full pb-product-shops\"><table cellpadding=\"0\" class=\"pb-table\">{{#shops}}<tr class=\"pb-shop-line\" data-url=\"{{url}}\" data-type-offer=\"{{type}}-{{rating}}\" data-type-shop=\"Offer{{index}}\">{{#needShowAgeBadge}}<td class=\"pb-table-cell pb-product-shops-badge\"><div class=\"pb-badge pb-badge-{{age}}\">{{age}}+</div></td>{{/needShowAgeBadge}}<td class=\"pb-table-cell pb-product-shops-name\" title=\"Перейти в магазин\"><span class=\"pb-link-mask\">{{name}}</span></td><td class=\"pb-table-cell pb-product-shops-rate\"><div class=\"pb-rate\" title=\"{{gradeText}}\"><i class=\"pb-rate-active pb-rate-active-{{rating}}\">{{rating}}</i></div></td><td class=\"pb-table-cell pb-product-shops-delivery\" title=\"{{delivery.brief}}\"><span class=\"pb-link-mask\"><i class=\"pb-i-delivery\"></i> {{#delivery}} {{#delivery.delivery}} {{#delivery.price}} {{value}} {{currency}} {{/delivery.price}} {{^delivery.price}} {{#free}} Бесплатно {{/free}} {{^free}} {{delivery.brief}} {{/free}} {{/delivery.price}} {{/delivery.delivery}} {{^delivery.delivery}} Не производится {{/delivery.delivery}} {{/delivery}}</span></td><td class=\"pb-table-cell pb-table-cell_center\">{{#discount}} <span title=\"Скидка {{discount}}%\" class=\"pb-product-discount\">&#45;{{discount}} &#37;</span> {{/discount}}</td><td class=\"pb-table-cell pb-table-cell_right pb-product-price\" title=\"Перейти в магазин\"><span class=\"pb-link-mask\">{{price}}</span> {{#discount}} <span class=\"pb-product-old-price_text\">{{oldPrice}}</span> {{/discount}}</td><td class=\"pb-table-cell pb-table-cell_right pb-product-shops-btn\" title=\"Перейти в магазин\" data-url=\"{{buttonUrl}}\"><span class=\"pb-btn pb-btn-primary\">В магазин</span></td></tr>{{/shops}}<tr><td colspan=\"{{#needShowAgeBadge}}7{{/needShowAgeBadge}}{{^needShowAgeBadge}}6{{/needShowAgeBadge}}\" class=\"pb-divider-cell\"><div class=\"pb-divider\"></div></td></tr><tr class=\"pb-no-hover\">{{#model}}<td colspan=\"{{#needShowAgeBadge}}3{{/needShowAgeBadge}}{{^needShowAgeBadge}}2{{/needShowAgeBadge}}\" class=\"pb-table-cell pb-table-cell_first pb-table-cell_left\"><a href=\"{{urls.offers}}\" target=\"_blank\">Все цены</a> {{#offersCount}} {{^ab.numbers_in_brackets_none}} <span class=\"pb-product-total\">({{offersCount}})</span> {{/ab.numbers_in_brackets_none}} {{/offersCount}}</td><td colspan=\"2\" class=\"pb-table-cell pb-table-cell_left\"><a href=\"{{urls.map}}\" target=\"_blank\">Магазины на карте</a> {{^ab.numbers_in_brackets_none}} <span class=\"pb-product-total\">({{outletsCount}})</span> {{/ab.numbers_in_brackets_none}}</td><td colspan=\"2\" class=\"pb-table-cell pb-table-cell_right\"><a href=\"{{urls.reviews}}\" target=\"_blank\">Отзывы</a> {{^ab.numbers_in_brackets_none}} <span class=\"pb-product-total\">({{reviewsCount}})</span> {{/ab.numbers_in_brackets_none}}</td>{{/model}} {{^model}}<td colspan=\"6\" class=\"pb-table-cell pb-table-cell_first\"><a href=\"{{pricesUrl}}\" target=\"_blank\">Все цены на товар</a> {{^ab.numbers_in_brackets_none}} {{#offersCount}} <span class=\"pb-product-total\">({{offersCount}})</span> {{/offersCount}} {{/ab.numbers_in_brackets_none}}</td>{{/model}}</tr>{{#shopInfo}}<tr class=\"pb-grey-row pb-product-shop pb-no-hover\"><td colspan=\"{{#needShowAgeBadge}}5{{/needShowAgeBadge}}{{^needShowAgeBadge}}4{{/needShowAgeBadge}}\" class=\"pb-table-cell\"><div class=\"pb-product-shop-title\">Вы на странице магазина {{shopName}}</div></td><td colspan=\"2\" class=\"pb-table-cell pb-table-cell_right\"><div class=\"pb-product-shop-rate\"><div class=\"pb-rate\"><a href=\"{{url}}\" target=\"_blank\"><i class=\"pb-rate-active pb-rate-active-{{rating}}\">{{rating}}</i></a></div><a href=\"{{url}}\" target=\"_blank\"><span class=\"pb-product-total\">{{gradeText}}</span></a></div></td></tr>{{/shopInfo}} {{^shopInfo}}<tr class=\"pb-no-hover\"><td colspan=\"6\" class=\"pb-divider-cell\"><div class=\"pb-divider\"></div></td></tr>{{/shopInfo}}<tr class=\"pb-sitebar_popover_footer pb-no-hover\"><td colspan=\"{{#needShowAgeBadge}}3{{/needShowAgeBadge}}{{^needShowAgeBadge}}2{{/needShowAgeBadge}}\" class=\"pb-table-cell pb-table-cell_first\"><a href=\"{{shopsInfoUrl}}\" target=\"_blank\">Информация о продавцах</a></td><td colspan=\"2\" class=\"pb-table-cell wrong-product\"><a class=\"wrong-product pb-color\" data-type=\"wrong-product\" title=\"Неверно определен товар\">Сообщить об ошибке</a></td><td colspan=\"2\" class=\"pb-table-cell pb-table-cell_right\">Данные <a href=\"{{marketUrl}}\" target=\"_blank\"><span class=\"pb-ya\">Я</span>ндекс.Маркета</a></td></tr></table></div></div>{{/shops.length}} <img class=\"track\" src=\"{{trackLogo}}\"></div><div class=\"mbr-citilink-container\" style=\"display:none\"></div>",
    html: null,

    _offerAccepted: undefined,

    events: {
        'click #market_context_headcrab': 'openUrl',
        'click .shop-url': 'showOpened',
        'click .pb-shop-line': 'openShop',

        'click #price_context_show_price, #sitebar_policy_popover .pb-sitebar_popover-close': 'acceptOffer',
        'click #price_context_no': 'declineOffer',
        'click #pricebar_welcome_ok': 'hideWelcomePopover',
        'click #adult_yes': 'acceptAdult',
        'click #adult_no': 'declineAdult',

        'click #market_context_question': 'toggleInfo',
        'click #market_context_settings': 'toggleSettings',
        'click #market_context_shops': 'toggleShops',
        'click #market_context_headcrab .pb-sitebar_popover-close': 'hidePopovers',
        'click #market_context_close': 'closePopup',
        'click #checkbox_do_not_show': 'toggleDisallowDomain',

        'click body': 'onBodyClick',
        'mouseenter .pb-sitebar-options': 'preventShowShops',
        'mouseleave .pb-sitebar-options': 'stopPreventingShowShops',
        'mouseenter #market_context_headcrab,#market_context_shops,.pb-sitebar-button': 'initShowShops',
        'mouseenter .pb-sitebar-right-action': 'cancelShowShops',
        'mouseenter .pb-sitebar-welcome': 'cancelShowShops',
        'mouseleave #market_context_headcrab': 'cancelShowShops',
        'click #sitebar_shops_popover, #sitebar_settings_popover, #sitebar_info_popover': 'onPopoverClick',
        'click .pb-sitebar-welcome, #sitebar_feedback_popover': 'onPopoverClick',

        'resize window': 'onResize',

        'click .wrong-product, .high-price, .unknown-error, .wrong-region': 'sendError',
        'submit #form-error': 'sendError',

        'click #settings_link': 'onSettingsClick',
        'click #price_context_show_this_site input': 'checkOptIn'
    },

    ids: {
        pricebar: 'market_context_headcrab',
        text: 'market_context_text',
        textContent: 'market_context_text_content',
        price: 'market_context_price',
        offerPopup: 'sitebar_policy_popover',
        welcomePopover: 'sitebar_policy_popover',
        offerYesButton: 'price_context_show_price',
        popoverInfo: 'sitebar_info_popover',
        popoverSettings: 'sitebar_settings_popover',
        popoverShops: 'sitebar_shops_popover',
        checkboxDoNotShow: 'checkbox_do_not_show',
        popoverThanks: 'sitebar_feedback_popover',
        formError: 'form-error',
        settingsLink: 'settings_link',
        delivery: 'market_context_delivery',
        randomContainer: 'market_context_headcrab_container',
        optInCheckbox: 'price_context_show_this_site'
    },

    classes: {
        offerShown: 'pb-sitebar_offer',
        adultOfferShown: 'pb-sitebar_adult',
        buttonGo: 'pb-sitebar-button',
        shoplist: 'shoplist',
        text: 'pb-sitebar-cnt',
        optionsBlock: 'pb-sitebar-options',
        overlaySuggestArrow: 'overlay-suggest-arrow',
        highlightOptInButton: 'pb-btn-attention',
        shopLine: 'pb-shop-line',
        offerText: 'pb-offer-text',
        equalsPriceText: 'pb-equals-text',
        optInArrow: 'pb-overlay-arr'
    },

    /**
     * set state to default
     */
    clean() {
        this.type = '';
        this.data = {};
        this.html = null;
        this._offerAccepted = undefined;
    },

    /**
     * create rendered pricebar
     * @param {String} type 'avia' or 'product'
     * @param {Object} serverResponse e.g. name, price, url, departureAt, returnCity, etc.
     * @param {Object} [scriptData] script's parameters such as 'showOffer', 'isMbrApplication', etc.
     * If we don't have scriptData we use mbr.settings for extracting it
     * @returns {Object}
     */
    init(type, serverResponse, scriptData) {
        scriptData = scriptData || {};
        let settings = serverResponse.settings;

        this.type = type;

        this.extractMethod = serverResponse.method || '';
        this.original = serverResponse.original || {}; // info about page

        try {
            this.serverResponse = JSON.stringify(serverResponse, 2, 2);
        } catch(ex) {
            this.serverResponse = JSON.stringify(serverResponse); // for aliexpress(
        }

        let mainOffer;
        let offers;
        if (serverResponse.offers) {
            offers = serverResponse.offers.map((offer) => {
                if (offer.age) {
                    offer.age = parseInt(offer.age, 10);
                    offer.needShowAgeBadge = true;
                }
                return offer;
            });
            let pricebarOffers = offers.filter((offer) => offer.target === 'pricebar');

            if (pricebarOffers.length) {
                mainOffer = pricebarOffers[0];
            }
        }

        this.data = {
            isAvia: type === 'avia',
            isProduct: type === 'product',
            isClassified: mbr.settings.isClassified(),
            isMbrApplication: settings.isMbrApplication,
            appName: settings.applicationName,
            showOffer: settings.needShowOptIn,
            isOptOutEnabled: mbr.settings.isOptOutEnabled(),
            useSavedRandomContainer: settings.randomContainer,
            isLowestPrice: mainOffer.price.isLowerThanCurrent,
            isEqualsPrice: mainOffer.price.isEqualToCurrent,
            isHigherPrice: mainOffer.price.isHigherThanCurrent,
            isMostRelevant: mainOffer.mostRelevant,
            url: mainOffer.url,
            autoShowShopList: settings.autoShowShopList,
            viewModificators: scriptData.viewModificators || mbr.settings.getViewModificators(),
            customLogo: scriptData.customLogo || mbr.settings.getCustomLogo(),
            settingsURL: mbr.config.getSettingsURL(),
            showWelcome: settings.isFirstDisplay && mbr.settings.isYandexElementsExtension(),
            domain: document.domain
        };

        if (this.data.showOffer && this.data.isOptOutEnabled) {
            this.data.optInImage = mbr.settings.getOptInImage();
            this.data.optInTitle = mbr.settings.getOptInTitle();
        }
        
        let ab = mbr.abtest.getModificators(serverResponse.bucketInfo);

        this.data.abClass = ab.join(' ');
        this.data.ab = {};
        ab.forEach((abModificator) => {
            this.data.ab[abModificator] = true;
        });

        if (type === 'product') {
            if (mainOffer.name) {
                let productName = '';

                if (serverResponse.model) {
                    if (serverResponse.model.name) {
                        productName = serverResponse.model.name;
                    }
                    if (serverResponse.model.vendor) {
                        if (productName.indexOf(serverResponse.model.vendor) !== 0) {
                            productName = serverResponse.model.vendor + ' ' + productName;
                        }
                    }
                    serverResponse.model.caption = productName;

                } else {
                    productName = mainOffer.name;
                }

                this.data.originalProductName = productName;
                if (productName && productName.length > 64) {
                    productName = productName.substr(0, 64) + '...';
                }
                this.data.productName = productName;
                this.data.currency = mainOffer.price.currencyName;

                if (mainOffer.price.currencyCode === 'RUB' || mainOffer.price.currencyCode === 'RUR') {
                    this.data.currencyClass = 'rouble';
                } else {
                    this.data.currencyClass = mainOffer.price.currencyCode;
                }

                this.data.age = mainOffer.age;
                this.data.needShowAgeBadge = mainOffer.needShowAgeBadge;
                this.data.photo = mainOffer.photo;
                
                this.data.shop = mainOffer.shopInfo;
                this.data.mainOfferDelivery = mainOffer.delivery;
                this.data.type = this._getTypeOffer(mainOffer);
                this.data.isHigherThanCurrent = mainOffer.price.isHigherThanCurrent;
                this.data.isEqualToCurrent = mainOffer.price.isEqualToCurrent;
                this.data.shops = offers.map((offer) => {
                    if (!this.data.warning && offer.warning) {
                        this.data.warning = offer.warning;
                    }

                    offer.shopInfo.rating = Math.max(offer.shopInfo.rating, 0); // it can be -1
                    return {
                        id: offer.shopInfo.id,
                        name: offer.shopInfo.name,
                        rating: offer.shopInfo.rating,
                        gradeText: mbr.tools.getGradeText(offer.shopInfo.gradeTotal),
                        url: offer.url,
                        buttonUrl: offer.buttonUrl,
                        price: mbr.tools.formatPrice(offer.price.value, offer.price.currencyName || ''),
                        priceValue: offer.price.value,
                        discount: offer.price.discount,
                        oldPrice: mbr.tools.formatPrice(Number(offer.price.base), offer.price.currencyName || ''),
                        type: this._getTypeOffer(offer),
                        photo: offer.photo,
                        target: offer.target,
                        delivery: offer.delivery,
                        shopUrl: offer.shopInfo.url,
                        age: offer.age,
                        needShowAgeBadge: offer.needShowAgeBadge
                    };

                });
                this.data.shopInfo = serverResponse.shopInfo;
                if (this.data.shopInfo) {
                    this.data.shopInfo.gradeText = mbr.tools.getGradeText(this.data.shopInfo.gradeTotal);
                }
                this.data.bestOffers = this.data.bestOffers || !this.original.productPrice ||
                    (!this.data.isAvito && (this.data.isHigherThanCurrent || this.data.isEqualToCurrent));

                this.data.shopDetailsUrl = mbr.tools.getShopDetailsUrl(this.data.shops);
                this.data.offersCount = serverResponse.searchInfo && serverResponse.searchInfo.offersCount || 0;

                this.data.hasAdultOffers = offers.some((offer) => offer.adult);
                this.data.needShowAdultOptIn = this.data.hasAdultOffers && settings.needShowAdultOptIn;

                this.data.shops = this.data.shops.filter((shop) => shop.target !== 'pricebar');

                this.data.shops.forEach((shop, id) => {
                    shop.index = id + 1;
                });

                this.data.byPriceShops = this.data.shops.filter((shop) => shop.target === 'price-list');

                if (this.data.shops.length === 1 && !this.data.hasAdultOffers && !this.data.isHigherPrice) {
                    this.data.shops = [];
                }

                if (serverResponse.model) {
                    this.data.model = serverResponse.model;
                    if (this.data.model.prices) {
                        for (let price in this.data.model.prices) {
                            if (this.data.model.prices.hasOwnProperty(price)) {
                                if (/^\d+$/.test(this.data.model.prices[price])) {
                                    this.data.model.prices[price] = mbr.tools.formatPrice(
                                        this.data.model.prices[price]
                                    );
                                }
                            }
                        }
                    }
                }

                this.data.shopsInfoUrl = serverResponse.searchInfo.urls.shopsInfo;
                this.data.marketUrl = serverResponse.searchInfo.urls.market;
                this.data.pricesUrl = serverResponse.searchInfo.urls.prices;
                this.data.searchUrl = serverResponse.searchInfo.urls.search;

            }
            this.data.isWebPartner = mbr.settings.isYandexWebPartner();
        }

        this.data.initialTop = -38;
        if (this.data.warning) {
            this.data.initialTop -= 18;
        }

        if (mainOffer.price) {
            this.data.priceText = mbr.tools.formatPrice(mainOffer.price.value, mainOffer.price.currencyName || '');
        }

        this._randomizer = this.getRandomizer(settings.noRandomize);

        mbr.log('render');
        this._render();

        return this;
    },

    getRandomizer(noRandomize) {
        let classes = '';
        for (let i in this.classes) {
            if (this.classes.hasOwnProperty(i)) {
                classes += ' ' + this.classes[i];
            }
        }

        let classesElement = '<div class="' + classes + '"></div>';
        let idsElement = Object.keys(this.ids).map((idKey) => {
            return '<div id="' + this.ids[idKey] + '"></div>';
        }).join(' ');

        return new Randomizer(this._getHTMLFromTemplate() + classesElement + idsElement,
            mbr.settings.getRandomNameLength(),
            noRandomize
        );
    },

    /**
     * return 'BestCPC' for mostRelevant offer, 'Lowest' for offer with lowest price, 'Profitable' otherwise
     * @param offer
     * @returns {string}
     * @private
     */
    _getTypeOffer(offer) {
        if (offer.mostRelevant) {
            return 'BestCPC';
        }
        if (offer.guaranteedLowestPrice) {
            return 'Lowest';
        }

        return 'Profitable';
    },

    /**
     * create style tag with our style and inject it to the body
     * @private
     */
    _injectCSS(css) {
        let cssContainer = document.createElement('style');

        cssContainer.textContent = css;
        cssContainer.text = css;

        document.body.appendChild(cssContainer);
    },

    /**
     * if we have inserted style we have to randomize all selectors
     * @private
     */
    _prepareExistingStyle() {
        let style;
        let styles = document.styleSheets;

        if (styles) {
            for (let i = 0; i < styles.length; i++) {
                if (styles[i].ownerNode && styles[i].ownerNode.id === 'mbrstl') {
                    style = styles[i];
                    break;
                }
            }
            if (style && style.cssRules && style.cssRules.length) {
                let length = style.cssRules.length;

                while (length--) {
                    let currentRule = style.cssRules[0];
                    let selector = currentRule.selectorText || '';
                    style.insertRule(currentRule.cssText.replace(selector, this._randomizer.randomize(selector)),
                        style.cssRules.length);
                    style.deleteRule(0);
                }
            }
        }
    },

    /**
     * get template from script tag
     * @private
     */
    _loadTemplate() {
        let content = '';
        let templateElement = document.getElementById('mbrtmplt');

        if (templateElement) {
            content = templateElement.innerHTML;
            templateElement.parentNode.removeChild(templateElement);
            return content;
        }

        return content;
    },

    /**
     * wrapper for Mustache.render and cache rendering result to the this.html property
     * @returns {String}
     * @private
     */
    _getHTMLFromTemplate() {
        let templateElement = this.template;

        if (!this.html) {
            this.template = templateElement || this._loadTemplate();
            if (this.template) {
                this.html = mbr.Mustache.render(this.template, this.data);
            }
        }

        return this.html;
    },

    /**
     * create DOM element, inject it to the page, show and return.
     * @private
     */
    _render() {
        if (this.el) {
            mbr.log('pricebar is already shown');
            return;
        }
        if (this.css) {
            this._injectCSS(this._randomizer.randomize(this.css));
        } else {
            this._prepareExistingStyle();
        }

        // create container
        let container = window.document.createElement('div');
        let html = this._randomizer.randomize(this._getHTMLFromTemplate());

        if (html) {
            container.innerHTML = html;
        } else {
            return;
        }

        // we need no container
        this.el = container.childNodes[0];
        this.el.style.top = this.data.initialTop + 'px';

        if (mbr.settings.needUseRandomContainer()) {
            let divs = document.querySelectorAll('div');

            divs = Array.prototype.filter.call(divs, (div) => {
                while (div && div !== document.documentElement && div !== document.body) {
                    let computedStyle = window.getComputedStyle(div);

                    if (computedStyle.getPropertyValue('display') === 'none' ||
                        computedStyle.getPropertyValue('visibility') === 'hidden' ||
                        computedStyle.getPropertyValue('opacity') != 1 ||
                        computedStyle.getPropertyValue('position') === 'relative') {
                        return false;
                    }

                    div = div.parentNode;
                }

                return true;
            });

            if (divs.length) {
                let currentIndex = mbr.settings.getContainerId(divs.length - 1, this.data.useSavedRandomContainer);

                mbr.log('Random container: ' + currentIndex + '/' + divs.length);
                mbr.log(divs[currentIndex]);

                let parent = divs[currentIndex];
                this.parentContainer = window.document.createElement('div');
                this.parentContainer.id = this._randomizer.randomize(this.ids.randomContainer);
                parent.appendChild(this.parentContainer);
            } else {
                this.parentContainer = body;
            }
        } else {
            this.parentContainer = document.body;
        }

        this.parentContainer.appendChild(this.el);

        this.el.style.setProperty('display', 'table', 'important');

        this.el.style.setProperty('opacity', '1', 'important');

        if (!this.data.autoShowShopList && this.data.shops.length) {
            this.el.style.setProperty('cursor', 'pointer', 'important');
        }

        let textNode = document.querySelector('.' + this._randomizer.randomize(this.classes.text));
        let text = mbr.tools.getTextContents(textNode, true);

        text = text.replace(this.data.productName, this.data.originalProductName);
        textNode.setAttribute('title', text);

        if (this.data.showOffer) {
            mbr.hub.trigger('pricebar:optInShow', false, this.type);
            if (this.data.isOptOutEnabled) {
                mbr.settings.setSetting('optOutAccepted', true);
            }
        } else if (this.data.needShowAdultOptIn) {
            mbr.hub.trigger('pricebar:adultOptInShow');
        } else {
            mbr.hub.trigger('pricebar:show', this.type);
        }

        this._bindEvents();
        mbr.hub.trigger('pricebar:startRender');
        this._animateShow();

        this._fixTextWidth();
        this._fixOptInArrow();

        this._startPricebarHighlighting();

        let checkStateTimeout = Math.round(Math.random() * 25000 + 5000); // from 5 to 30 seconds
        const checkStateTimeoutId = setTimeout(() => {
            this._checkPricebar();
        }, checkStateTimeout);

        mbr.hub.on('pricebar:close', () => {
            clearTimeout(checkStateTimeoutId);
        });
    },

    /**
     * show pricebar with animation
     * @private
     */
    _animateShow() {
        // slide down
        let top = this.data.initialTop - 1;
        let htmlTop = parseInt(document.documentElement.style.marginTop, 10) || 0;
        document.documentElement.setAttribute('mbr-initial-margin-top', htmlTop);
        document.documentElement.setAttribute('mbr-initial-position', document.documentElement.style.position);

        // set position: relative style to documentElement
        // to make absolutely positioned elements move down too
        if (mbr.settings.canAddRelativePosition(mbr.tools.getHostname(document))) {
            document.documentElement.style.position = 'relative';
        }

        if (!this.data.needShowAdultOptIn) {
            let timeout = setInterval(() => {
                top += 2;
                htmlTop += 2;
                if (top >= -1) {
                    mbr.hub.trigger('pricebar:render', new Date().getTime());
                    clearInterval(timeout);
                }
                this.el.style.setProperty('top', `${top}px`, 'important');
                if (mbr.settings.canAddMarginTop()) {
                    document.documentElement.style.setProperty('margin-top', htmlTop + 'px', 'important');
                }
                this._fixTextWidth();
                this._fixOptInArrow();
            }, 15);
        } else {
            this.el.style.setProperty('top', '-1px', 'important');
            if (mbr.settings.canAddMarginTop()) {
                document.documentElement.style.setProperty('margin-top', '38px', 'important');
            }

            mbr.hub.trigger('pricebar:render', new Date().getTime());
        }
    },

    onResize() {
        this._fixTextWidth();
        this._fixOptInArrow();
    },

    _fixTextWidth() {
        let priceElement = this._getElementById(this.ids.price);
        let deliveryElement = this._getElementById(this.ids.delivery);
        let textElement = this._getElementById(this.ids.text);
        let productTextElement = this._getElementById(this.ids.textContent);

        // for equals price
        let offerTextElement = this._querySelector('.' + this.classes.offerText);
        let equalsPriceElement = this._querySelector('.' + this.classes.equalsPriceText);

        const containerWidth = textElement ? textElement.offsetWidth : 0;
        const priceElementWidth = priceElement ? priceElement.offsetWidth : 0;
        const deliveryElementWidth = deliveryElement ? deliveryElement.offsetWidth : 0;
        const rightSpaceWidth = 30;

        const maxWidth = containerWidth - priceElementWidth - deliveryElementWidth - rightSpaceWidth;
        productTextElement && productTextElement.style.setProperty('max-width', maxWidth + 'px', 'important');

        if (deliveryElement && priceElement) {
            const maxDeliveryWidth = containerWidth
                - priceElementWidth
                - rightSpaceWidth
                - productTextElement.offsetWidth;

            deliveryElement.style.setProperty('max-width', maxDeliveryWidth + 'px', 'important');
        }

        if (offerTextElement && equalsPriceElement) {
            const offerTextMaxWidth = productTextElement.offsetWidth - equalsPriceElement.offsetWidth - 20;
            offerTextElement.style.maxWidth = offerTextMaxWidth + 'px';
        }
    },

    _fixOptInArrow() {
        let optIn = this._getElementById(this.ids.offerPopup);
        let arrow = this._querySelector('.' + this.classes.optInArrow);
        let button = this._querySelector('.' + this.classes.buttonGo);

        if (optIn && arrow && button && optIn.offsetLeft && optIn.offsetWidth) {
            const rightPosition = this.el.offsetWidth - arrow.offsetWidth - optIn.offsetWidth - optIn.offsetLeft - 20;
            const rightPositionFromButton = this.el.offsetWidth
                - button.offsetLeft - Math.round(button.offsetWidth / 2);

            if (rightPosition && rightPositionFromButton) {
                arrow.style.setProperty('right', Math.max(rightPosition, rightPositionFromButton) + 'px', 'important');
            }
        }

    },

    /**
     * iterate for each element from this.events and create event listeners
     * @private
     */
    _bindEvents() {
        const eventStringRE = /^(\S+)\s(.+)$/; // "<domEventName><space><selector>"
        let execRE;

        for (let i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                execRE = eventStringRE.exec(i);
                if (execRE && execRE.length > 2) {
                    this._addEventListener(execRE[2], execRE[1], this.events[i]);
                }
            }
        }
    },

    /**
     * wrapper for document.getElementById which uses randomized id
     * @param {String} id
     * @returns {HTMLElement}
     * @private
     */
    _getElementById(id) {
        return document.getElementById(this._randomizer.randomize(id));
    },

    /**
     * wrapper for document.querySelectorAll which uses randomized selector
     * @param {String} selector
     * @returns {NodeList}
     * @private
     */
    _querySelectorAll(selector) {
        return document.querySelectorAll(this._randomizer.randomize(selector));
    },

    /**
     * wrapper for document.querySelectorAll which uses randomized selector
     * @param {String} selector
     * @returns {Node}
     * @private
     */
    _querySelector(selector) {
        return document.querySelector(this._randomizer.randomize(selector));
    },

    /**
     * add DOM-event listener which is bound to the pricebar object
     * @param {String} elements e.g. "#id .className .className1"
     * @param {String} eventName e.g. click
     * @param {String} listenerName e.g. _onClick
     * @private
     */
    _addEventListener(elements, eventName, listenerName) {
        if (typeof this[listenerName] === 'function') {
            elements = elements === 'window' && [window] ||
                typeof elements === 'string' && this._querySelectorAll(elements) || elements;

            if (elements) {
                const listener = this[listenerName].bind(this);
                if (elements && elements[0] == window) {
                    window.addEventListener(eventName, listener, false);
                } else {
                    for (let i = 0; i < elements.length; i++) {
                        if (elements[i].addEventListener) {
                            elements[i].addEventListener(eventName, listener, false);
                        } else if (elements[i].attachEvent) {
                            elements[i].attachEvent('on' + eventName, listener);
                        }
                    }
                }
            }
        }
    },

    /**
     * set display property to 'none' and change document top position
     */
    hidePopup() {
        this.hidePopovers();

        const initialHtmlPosition = document.documentElement.getAttribute('mbr-initial-position');
        const initialMarginTop = parseInt(document.documentElement.getAttribute('mbr-initial-margin-top'), 10) || 0;

        let top = parseInt(this.el.style.top, 10) || 0;
        let marginTop = parseInt(document.documentElement.style.marginTop, 10) || 0;

        let timeout = setInterval(() => {
            top = Math.max(top - 1, this.data.initialTop);
            marginTop = Math.max(marginTop - 1, initialMarginTop);

            if (top === this.data.initialTop && marginTop === initialMarginTop) {
                clearInterval(timeout);
                document.documentElement.style.removeProperty('margin-top');
                document.documentElement.style.position = initialHtmlPosition;
                document.documentElement.style.marginTop = initialMarginTop + 'px';
                this.el.style.setProperty('display', 'none', 'important');
            } else {
                this.el.style.top = top + 'px';
                document.documentElement.style.setProperty('margin-top', marginTop + 'px', 'important');
            }
        }, 15);
    },

    /**
     * show or hide info popup
     * @param {Event} e
     * @returns {boolean}
     * @private
     */
    toggleInfo(e) {
        if (this._isOptInShown()) {
            this._highlightOptInButton();
        } else {
            let popoverInfo = this._getElementById(this.ids.popoverInfo);
            const isShown = popoverInfo.style.display === 'block';

            this.hidePopovers();

            popoverInfo.style.display = isShown ? 'none' : 'block';

            if (!isShown) {
                mbr.hub.trigger('pricebar:showInfoPopup', this.type);
                mbr.hub.trigger('pricebar:click', this.type, false, 'FeedbackButton');
            }
        }

        e.stopPropagation();
        return false;
    },

    /**
     * show or hide settings popup
     * @param {Object} e
     * @returns {boolean}
     * @private
     */
    toggleSettings(e) {
        if (this._isOptInShown()) {
            this._highlightOptInButton();
        } else {
            let popoverSettings = this._getElementById(this.ids.popoverSettings);
            const isShown = popoverSettings.style.display === 'block';

            this.hidePopovers();

            popoverSettings.style.display = isShown ? 'none' : 'block';

            if (!isShown) {
                mbr.hub.trigger('pricebar:showSettingsPopup', this.type);
                mbr.hub.trigger('pricebar:click', this.type, false, 'SettingsButton');
            }
        }

        e.stopPropagation();
        return false;
    },

    /**
     * get popover with offers
     * @private
     */
    _getShopsPopover() {
        return this._getElementById(this.ids.popoverShops);
    },

    /**
     * show or hide shops popup
     * @param {Object} e
     * @returns {boolean}
     * @private
     */
    toggleShops(e) {
        if (this._isOptInShown()) {
            this._highlightOptInButton();
        } else {
            let popoverShops = this._getShopsPopover();
            if (popoverShops) {
                const isShown = this._isShopsPopupVisible();

                this.hidePopovers();

                if (isShown) {
                    this._hideShopsPopup();
                } else {
                    this._showShopsPopup();
                }
            }
        }
        e && e.stopPropagation();
        return false;
    },

    /**
     *
     * @private
     */
    _showShopsPopup() {
        if (!this._isShopsPopupVisible() &&
            !this._isSomePopupVisible() &&
            this.el.className.indexOf(this._randomizer.randomize(this.classes.offerShown)) === -1) {

            this.hidePopovers();
            const shopPopover = this._getShopsPopover();
            if (shopPopover) {
                this.el.className += ' ' + this._randomizer.randomize(this.classes.shoplist);
                mbr.hub.trigger('shop:openList', !!this.data.shops);
            }
        }
    },

    /**
     *
     * @private
     */
    _hideShopsPopup() {
        this._showShopsTimeout = null;
        let shopPopover = this._getShopsPopover();
        if (shopPopover) {
            this.el.className = this.el.className.replace(' ' + this._randomizer.randomize(this.classes.shoplist), '');
        }
    },

    /**
     *
     * @returns {boolean}
     * @private
     */
    _isShopsPopupVisible() {
        return this._getShopsPopover() &&
            this.el.className.indexOf(this._randomizer.randomize(this.classes.shoplist)) > -1;
    },

    _isSomePopupVisible() {
        let info = this._getElementById(this.ids.popoverInfo);
        let settings = this._getElementById(this.ids.popoverSettings);
        let thanks = this._getElementById(this.ids.popoverThanks);

        return (this._isShopsPopupVisible()) ||
            (info && info.style.display !== 'none') ||
            (settings && settings.style.display !== 'none') ||
            (thanks && thanks.style.display !== 'none') ||
            (this.el.className.indexOf(this._randomizer.randomize(this.classes.offerShown)) > -1); // offer shown
    },

    /**
     * trigger event, set variable for offer and change popup's view: hide offer, show price and settings button
     * @param {Event} [e]
     * @returns {boolean}
     * @private
     */
    acceptOffer(e) {
        let checkbox = this._getElementById(this.ids.optInCheckbox);
        const accepted = !this.data.isOptOutEnabled
            || checkbox.className.indexOf(this._randomizer.randomize(' checked')) !== -1;

        mbr.hub.trigger('pricebar:show', this.type);

        mbr.settings.setSetting('optOutAccepted', accepted).then(() => {
            this._offerAccepted = accepted;
            mbr.hub.trigger('script:offer', accepted);
            this.el.className = this.el.className.replace(this._randomizer.randomize(this.classes.offerShown), '');
            this._fixTextWidth();

            if (accepted) {
                this._showShopsPopup();
            } else {
                this.hidePopup();
            }
        });

        e.stopPropagation();
        return false;
    },

    /**
     * trigger event, set variable for offer and change popup's view: hide offer, show price and settings button
     * @param {Event} [e]
     * @returns {boolean}
     * @private
     */
    acceptAdult(e) {
        mbr.hub.trigger('pricebar:show', this.type);

        mbr.settings.setSetting('adultOffer', true).then(() => {
            this.el.className = this.el.className.replace(this._randomizer.randomize(this.classes.offerShown), '');
            this.el.className = this.el.className.replace(this._randomizer.randomize(this.classes.adultOfferShown), '');
            this._fixTextWidth();

            this._showShopsPopup();

        });

        e.stopPropagation();
        return false;
    },

    /**
     * trigger event, set variable for offer and hide popup
     * @param e
     * @returns {boolean}
     * @private
     */
    declineOffer(e) {
        mbr.hub.trigger('pricebar:optInDecline', false, this.type);

        mbr.settings.setSetting('optOutAccepted', false).then(() => {
            mbr.log('offer declined!');
            this.hidePopup();
            mbr.hub.trigger('script:offer', false);
        });

        e.stopPropagation();
        return false;
    },

    declineAdult(e) {
        mbr.settings.setSetting('adultOffer', false).then(() => {
            this.hidePopup();
        });

        e.stopPropagation();
        return false;
    },

    /**
     * trigger event and hide popup. If bar's type is 'avia' we set session's cookie
     * @param e
     * @returns {boolean}
     * @private
     */
    closePopup(e) {
        mbr.hub.trigger('pricebar:close', this.type);
        this.hidePopup();

        if (this.type === 'avia') {
            mbr.cookie.set('flights_context_not_show', true, null, '/');
        }

        e && e.stopPropagation();
        return false;
    },

    _highlightOptInButton() {
        var priceButton = this._getElementById(this.ids.offerYesButton);
        const attentionClass = this._randomizer.randomize(this.classes.highlightOptInButton);
        const suggestClass = this._randomizer.randomize(this.classes.overlaySuggestArrow);

        priceButton.className += ' ' + attentionClass;

        this.el.className = this.el.className.replace(' ' + suggestClass, '');
        this.el.className += ' ' + suggestClass;

        setTimeout(() => {
            priceButton.className = priceButton.className.replace(attentionClass, '');
        }, 300);
    },

    _isOptInShown() {
        return this.data.showOffer && !this._offerAccepted;
    },

    /**
     * open product's url if we can: offer doesn't exist or accepted.
     * If the offer is shown and don't accepted we highlight a button in the offer
     * @param e
     * @param {Boolean} afterEulaAccepting true if we open url after click to 'offer accept' button
     * @returns {boolean}
     * @private
     */
    openUrl(e, afterEulaAccepting) {
        if (!afterEulaAccepting && this._isOptInShown()) {
            this._highlightOptInButton();
        } else {
            let isPriceBarButtonClicked = false;
            if (e) {
                let target = e.srcElement || e.target;
                isPriceBarButtonClicked = mbr.tools.hasClass(target, this._randomizer.randomize(this.classes.buttonGo));
            }

            if (isPriceBarButtonClicked) {
                mbr.hub.trigger('pricebar:click', this.type, isPriceBarButtonClicked, this.type);
                window.open(this.data.url);
            } else {
                this._showShopsPopup();
            }

            if (!afterEulaAccepting) {
                this._showShopsPopup();
                this._showShopsTimeout = null;
            }
        }

        e && e.stopPropagation();
        return false;
    },

    /**
     * check or uncheck a checkbox for disallowing domain's price-context
     * @param e
     * @returns {boolean}
     * @private
     */
    toggleDisallowDomain(e) {
        let input = this._getElementById(this.ids.checkboxDoNotShow);
        this.domainDisallowed = !this.domainDisallowed;

        if (mbr.settings.isYandexWebPartner()) {
            if (this.domainDisallowed) {
                localStorage.setItem('svt.disabled', true);
            } else {
                localStorage.removeItem('svt.disabled');
            }
        }
        
        if (this.domainDisallowed) {
            input.parentNode.className += ' checked';
        } else {
            input.parentNode.className = input.parentNode.className.replace(' checked', '');
        }

        this.domainDisallowed && mbr.hub.trigger('pricebar:disallowDomain', this.type);

        e.stopPropagation();
        return false;
    },

    /**
     * hide welcome screen
     * @param e
     */
    hideWelcomePopover(e) {
        let welcomePopover = this._getElementById(this.ids.welcomePopover);
        if (welcomePopover) {
            welcomePopover.className = welcomePopover.className.replace(
                this._randomizer.randomize('pb-sitebar-welcome'), ''
                );
        }
        e.stopPropagation();
        return false;
    },

    /**
     * hide both popovers info and settings
     * @param [e]
     * @returns {boolean}
     * @private
     */
    hidePopovers(e) {
        let popoverInfo = this._getElementById(this.ids.popoverInfo);
        popoverInfo.style.display = 'none';

        let popoverSettings = this._getElementById(this.ids.popoverSettings);
        popoverSettings.style.display = 'none';

        let shopPopover = this._getShopsPopover();
        if (shopPopover) {
            this.el.className = this.el.className.replace(' ' + this._randomizer.randomize(this.classes.shoplist), '');
        }

        let popoverThanks = this._getElementById(this.ids.popoverThanks);
        if (popoverThanks) {
            popoverThanks.style.display = 'none';
        }

        var errorForm = this._getElementById(this.ids.formError);
        if (errorForm) {
            errorForm.className = errorForm.className.replace(/form-error-shown/g, '');
        }

        let target = e && (e.target || e.srcElement);
        if (target && target.parentNode && target.parentNode === shopPopover) {
            mbr.hub.trigger('shop:closeButtonClicked', !!this.data.shops);
        }

        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onBodyClick() {
        this.hidePopovers();
    },

    /**
     * call when we click on a shop's offer in popup
     * @param {Event} e
     * @private
     */
    showOpened(e) {
        let target = e.target || e.srcElement;
        while (!target.className || target.className.indexOf(this._randomizer.randomize('shop-url')) === -1) {
            target = target.parentNode;
        }

        mbr.hub.trigger('shop:opened',
            target.getAttribute('data-type-shop'),
            target.getAttribute('data-type-offer'),
            !!this.data.shops);

        e.stopPropagation();
    },

    /**
     * call when we click on a shop's offer in popup
     * @param {Event} e
     * @private
     */
    openShop(e) {
        let target = e.target || e.srcElement;
        while (!target.getAttribute('data-url')) {
            target = target.parentNode;
        }

        if (target.getAttribute('data-url')) {
            window.open(target.getAttribute('data-url'));

            mbr.hub.trigger('shop:opened',
                target.getAttribute('data-type-shop'),
                target.getAttribute('data-type-offer'),
                !!this.data.shops);
        }

        e.stopPropagation();
    },

    /**
     * show shops popup after 2sec. delay
     * @private
     */
    initShowShops(e) {
        this._cancelHideShops();
        let target = e.srcElement || e.target;
        let timeOut;
        
        if (this.data.ab.popup_timeout_200) {
            timeOut = 200;
        } else if (this.data.ab.popup_timeout_100) {
            timeOut = 100;
        } else {
            timeOut = 0;
        }
            
        
        if (target === this.el) {
            let optionsNode = document.querySelector('.' + this._randomizer.randomize(this.classes.optionsBlock));
            if (optionsNode && optionsNode.offsetLeft && e.clientX) {
                if (e.clientX >= optionsNode.offsetLeft) { // options block
                    return;
                }
            }
        }
        if (this.data.autoShowShopList && !this._showingShopsPrevented && !this._isOptInShown()) {
            this._showShopsTimeout = setTimeout(() => {
                this._showShopsPopup();
            }, timeOut);
        }
    },

    /**
     * do not hide shops popup
     * @private
     */
    _cancelHideShops() {
        if (this._hideShopsTimeout) {
            clearTimeout(this._hideShopsTimeout);
            this._hideShopsTimeout = 0;
        }
    },

    /**
     * hide shops popup after 1sec. delay
     * @private
     */
    cancelShowShops(e) {
        if (this.data.autoShowShopList) {
            if (this._showShopsTimeout) {
                clearTimeout(this._showShopsTimeout);
                this._showShopsTimeout = null;
                if (this._isShopsPopupVisible()) {
                    this._hideShopsTimeout = setTimeout(() => {
                        this._isShopsPopupVisible() && this._hideShopsPopup();
                    }, 1000);
                }
            }
        }
    },

    /**
     * cancel bubbling
     * @param e
     * @returns {boolean}
     * @private
     */
    onPopoverClick(e) {
        e.stopPropagation();
        return false;
    },

    sendError(e) {
        var target = e.srcElement || e.target;
        if (target) {
            mbr.hub.trigger('script:wrongProduct');
            this._showPopoverThanks();

            setTimeout(() => {
                this.closePopup();
            }, 1500);
        }

        e.preventDefault();
        e.stopPropagation();
    },

    _showPopoverThanks() {
        this.hidePopovers();

        let thanks = this._getElementById(this.ids.popoverThanks);
        if (thanks) {
            thanks.style.display = 'block';

            setTimeout(() => {
                if (thanks && thanks.style.display === 'block') {
                    thanks.style.display = 'none';
                }
            }, 5000);
        }
    },

    preventShowShops() {
        this._showingShopsPrevented = true;
        this.cancelShowShops();
    },

    stopPreventingShowShops() {
        this._showingShopsPrevented = false;
    },

    /**
     * highlight pricebar element when mouse has entered to either price or product element
     * @private
     */
    _startPricebarHighlighting() {
        let highlightTriggers = [];

        if (mbr.view.nameElement) {
            highlightTriggers.push(mbr.view.nameElement);
        }
        if (mbr.view.priceElement) {
            highlightTriggers.push(mbr.view.priceElement);
        }
        this._addEventListener(highlightTriggers, 'mouseenter', '_highlightPricebar');
        this._addEventListener(highlightTriggers, 'mouseleave', '_normalizePricebar');
    },

    _highlightPricebar() {
        this.el.className += ' hover';
    },

    _normalizePricebar() {
        this.el.className = this.el.className.replace(/\shover/g, '');
    },

    _checkPricebar() {
        if (window.getComputedStyle) {
            let computedStyle = window.getComputedStyle(this.el);

            const display = computedStyle.getPropertyValue('display');
            const visibility = computedStyle.getPropertyValue('visibility');
            const opacity = computedStyle.getPropertyValue('opacity');
            const top = this.el.offsetTop;
            const left = this.el.offsetLeft;
            const width = this.el.offsetWidth;
            const height = this.el.offsetHeight;
            const clientWidth = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;

            let wrongParameter;

            if (this.el.parentNode !== this.parentContainer) {
                wrongParameter = 'parent';
            } else if (display === 'none') {
                wrongParameter = 'display';
            } else if (visibility === 'hidden') {
                wrongParameter = 'visibility';
            } else if (opacity == 0) {
                wrongParameter = 'opacity';
            } else if (top < -1 || top > 0 || left !== 0) {
                wrongParameter = 'position';
            } else if (height < 38 || Math.abs(clientWidth - width) > 100) {
                wrongParameter = 'size';
            } else if (document.elementFromPoint) {
                const x = Math.round(Math.random() * width + left);
                const y = Math.round(Math.random() * height / 2 + top + 1);

                mbr.log('check point ' + x + ',' + y);

                let elementFromPoint = document.elementFromPoint(x, y);
                do {
                    if (elementFromPoint === document.body || elementFromPoint === document) {
                        wrongParameter = 'zindex';
                        break;
                    } else if (elementFromPoint === this.el) {
                        break;
                    }
                } while (elementFromPoint = elementFromPoint.parentNode);
            }

            if (wrongParameter) {
                mbr.log('unacceptable action is detected. Parameter is ' + wrongParameter);
                mbr.hub.trigger('script:unacceptableAction', wrongParameter);
            }
        }
    },

    onSettingsClick(e) {
        if (mbr.settings.isCustomSettingsPageExists()) {
            mbr.hub.trigger('pricebar:settingsPage');
            e.preventDefault();
            return false;
        }
    },

    checkOptIn(e) {
        let element = this._getElementById(this.ids.optInCheckbox);

        this.checkboxOptInDeclined = !this.checkboxOptInDeclined;
        if (this.checkboxOptInDeclined) {
            element.className = element.className.replace(
                this._randomizer.randomize(' checked'), ''
            );
        } else {
            element.className += this._randomizer.randomize(' checked');
        }

        e.stopPropagation();
        return false;
    }
};

mbr.PriceBar = mbr.PriceBar || function(type, serverResponse, scriptData) {
    pricebar.clean();

    return pricebar.init(type, serverResponse, scriptData);
};

mbr.view = mbr.view || {

    _onProductOfferFound: function(data) {
        if (!mbr.settings.isSilentMode()) {
            mbr.pricebar = mbr.pricebar || new mbr.PriceBar('product', data);
        }
    },

    _onAviaFound: function(data) {
        mbr.pricebar = mbr.pricebar || new mbr.PriceBar('avia', data);

    },

    init: function() {
        mbr.hub.on('suggest:productOfferFound', this._onProductOfferFound, null, this);
        mbr.hub.on('suggest:aviaFound', this._onAviaFound, null, this);

        mbr.hub.on('productPrice:found', function(priceElement) {
            if (priceElement) {
                mbr.view.priceElement = priceElement;
            }
        });
        mbr.hub.on('productName:found', function(nameElement) {
            if (nameElement) {
                mbr.view.nameElement = nameElement;
            }
        });

    }
};

mbr.dirtyHacks = {
    _common: {
        setCSSHack: function(styleText) {
            var cssHack = document.createElement('style');

            cssHack.textContent = styleText;
            cssHack.text = styleText;

            document.body.appendChild(cssHack);

            return cssHack;
        },

        removeCSSHack: function(hack) {
            return hack && hack.parentNode && hack.parentNode.removeChild(hack);
        }
    },
    _hacks: {
        '4pda': {
            setHack: function() {
                var css = '#header .h-frame.fixed-menu {top: 37px !important;}';

                this.cssHack = mbr.dirtyHacks._common.setCSSHack(css);
            },

            removeHack: function() {
                mbr.dirtyHacks._common.removeCSSHack(this.cssHack);
            }
        },
        'just.ru': {
            setPricebarStartHack: function() {
                var css = '.top-subscriber {position: relative !important;} ' +
                    'body {top: 0px !important;}';

                this.cssHack = mbr.dirtyHacks._common.setCSSHack(css);
            },

            setPricebarRenderHack: function() {
                var css = '.top-subscriber {margin-top: 38px;}';
                this.cssHack = mbr.dirtyHacks._common.setCSSHack(css);
            },

            removeHack: function() {
                mbr.dirtyHacks._common.removeCSSHack(this.cssHack);
            }
        },
        'megaobzor.com': {
            setHack: function() {
                var css = '#megaobzor, #top_nav {margin-top: 37px !important;}';

                this.cssHack = document.createElement('style');

                this.cssHack.textContent = css;
                this.cssHack.text = css;

                document.body.appendChild(this.cssHack);
            },
            removeHack: function() {
                this.cssHack && this.cssHack.parentNode && this.cssHack.parentNode.removeChild(this.cssHack);
            }
        }
    },

    setPricebarStartRenderHack: function() {
        if (document.domain && document.domain.match(/just\.ru$/)) {
            this._hacks['just.ru'].setPricebarStartHack();
        }
    },

    setPricebarShowHack: function() {
        if (document.domain) {
            if (document.domain.match(/4pda\.ru$/)) {
                this._hacks['4pda'].setHack();
            } else if (document.domain.match(/just\.ru$/)) {
                this._hacks['just.ru'].removeHack();
                this._hacks['just.ru'].setPricebarRenderHack();
            } else if (document.domain.match(/megaobzor\.com/)) {
                this._hacks['megaobzor.com'].setHack();
            }
        }
    },

    removePricebarShowHack: function() {
        if (document.domain) {
            if (document.domain.match(/4pda\.ru$/)) {
                this._hacks['4pda'].removeHack();
            } else if (document.domain.match(/just\.ru$/)) {
                this._hacks['just.ru'].removeHack();
            } else if (document.domain.match(/megaobzor\.com/)) {
                this._hacks['megaobzor.com'].removeHack();
            }
        }
    },

    init: function() {
        mbr.hub.on('pricebar:startRender', this.setPricebarStartRenderHack.bind(this));
        mbr.hub.on('pricebar:render', this.setPricebarShowHack.bind(this));
        mbr.hub.on('pricebar:close', this.removePricebarShowHack.bind(this));
    }
};
function runSuggestScript() {
    mbr.log('start');

    mbr.hub.trigger('statsd:init');

    if (!mbr.settings.isSuggestScriptEnabled(document)) {
        mbr.log('script disabled');
        return;
    }

    mbr.settings.sendVersionToServer();

    mbr.settings.synchronizeSettings().then(runParsers)
}

function runParsers() {
    mbr.parserPipe
        .init()
        .addParser(mbr.partnerWebsiteParser)
        .addParser(mbr.selectorsParser)
        .addParser(mbr.microdataParser)
        .addParser(mbr.searchParser)
        .addParser(mbr.cmsParser)
        .addParser(mbr.urlParser)
        .end();
}

var started = false;

function start() {
    if (!mbr.tools.isSupportedBrowser()) {
        return;
    }
    
    if (started) { return; }
    started = true;

    if (!Function.prototype.bind || !Array.prototype.forEach) {
        return false;
    }


    if (document.querySelector('[href*="instiki"]')) {
        //MBR-7293
        return false;
    }
    mbr.hub.init && mbr.hub.init();
    mbr.dirtyHacks && mbr.dirtyHacks.init();
    mbr.stats && mbr.stats.init();
    mbr.view && mbr.view.init();
    mbr.environment && mbr.environment.init();

    var domain = mbr.tools.getHostname(document);
    mbr.settings.synchronizeSettings()
        .then(function() {
            return mbr.storage.init(mbr.config.getStorageHost());
        })
        .then(function() {
            return mbr.settings.init(window.document.domain);
        })
        .then(function() {
            if (mbr.settings.isSuggestScriptEnabled(document)) {
                if (!mbr.settings.isScriptStarted(document)) {
                    mbr.settings.setScriptStarted();
                    watchAjaxSites();
                    runSuggestScript();

                    mbr.tools.clearPriceContextNodes();
                }
            } else {
                mbr.log('clear iframe because of suggest disabled');
                mbr.hub.trigger('statsd:init');
                mbr.tools.clearPriceContextNodes(true);
            }
        }).catch(function() {
            mbr.log('clear iframe because of error');
            mbr.tools.clearPriceContextNodes(true);
        });
}


if (window.document.readyState === 'complete' || window.document.readyState === 'interactive') {
    start();
} else {
    if (window.document.addEventListener) {
        window.document.addEventListener("DOMContentLoaded", start, false); // fallback
        window.addEventListener("load", start, false); // fallback
        // If IE event model is used
    } else if (document.attachEvent) {

        window.attachEvent("onload", start); // fallback
    }
}



function watchAjaxSites() {
    /* for ajax sites - catch ajax-search */
    var ajaxSites = [
    ];

    if (window.location && window.location) {
        for (var i = 0; i < ajaxSites.length; i++) {
            if (ajaxSites[i].test(window.location.href)) {
                if (window.addEventListener) {
                    window.addEventListener('hashchange', function () {
                        runParsers();
                    }, false);
                } else {
                    window.attachEvent('hashchange', function () {
                        runParsers();
                    });
                }
            }
        }
    }
}



})((function () {
 if (window.RegExp) {
  return window;
 }    
 else {
  return Function("return this")();
 }
})());