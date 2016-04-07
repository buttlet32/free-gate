var isGetMessageStart, frigateS2Start, mainWinIsShow, tabHost, tabId, tabUrl;
var runtimeOrExtensionFrigate = chrome.runtime && chrome.runtime.sendMessage ? "runtime" : "extension";
if (typeof $empty != "function") {
    function $empty() {}
}
if (typeof frigate_s2 !== "function") {
    isGetMessageStart = false;
    frigateS2Start = false;
    mainWinIsShow = false;

    function frigate_s2() {
        frigateS2Start = true;
        var frigate_s2_close = function(e) {
            if (e) {
                e.stop();
            }
            var frigate_wr = $("frigate_wr");
            frigate_wr.setStyle("visibility", "hidden");
            frigate_wr.removeClass("frigate_vi");
            if (!$("frigate_wr2")) {
                var head = (new Element("div", {
                    "id": "frigate_wr2"
                })).grab((new Element("div", {
                    "class": "frigate_h",
                    "text": ""
                })).grab(new Element("a", {
                    "class": "frigate_link2",
                    "html": "&nbsp;",
                    "data-tooltip": "open",
                    events: {
                        "click": frigate_s2_open
                    }
                })));
                document.html.grab(head);
                head.setStyle("visibility", "visible");
            }
            chrome[runtimeOrExtensionFrigate].sendMessage({
                "type": "from_s2",
                "tabHost": tabHost,
                "value": true
            });
        };
        var frigate_s2_open = function(e) {
            if (e) {
                e.stop();
            }
            $("frigate_wr2").destroy();
            var frigate_wr = $("frigate_wr");
            frigate_wr.setStyle("visibility", "visible");
            frigate_wr.addClass("frigate_vi");
            chrome[runtimeOrExtensionFrigate].sendMessage({
                "type": "from_s2",
                "tabHost": tabHost,
                "value": false
            });
        };
        var onProxy = function() {
            chrome[runtimeOrExtensionFrigate].sendMessage({
                "type": "frigatetabon",
                "tabHost": tabHost,
                "url": tabUrl,
                "tabId": tabId
            });
        };
        var offProxy = function() {
            chrome[runtimeOrExtensionFrigate].sendMessage({
                "type": "frigatetaboff",
                "tabHost": tabHost,
                "url": tabUrl,
                "tabId": tabId
            });
        };
        var chProxy = function() {
            chrome[runtimeOrExtensionFrigate].sendMessage({
                "type": "chproxy",
                "tabHost": tabHost,
                "url": tabUrl,
                "tabId": tabId
            });
        };
        var showMainWin = function() {
            if (mainWinIsShow) {
                return;
            }
            mainWinIsShow = true;
            document.html.grab((new Element("div", {
                "id": "frigate_wr",
                styles: {
                    display: "none"
                },
                "class": "frigate_vi"
            })).grab((new Element("div", {
                "id": "frigate_topbl"
            })).grab(new Element("div", {
                "class": "frigate_h",
                "html": ""
            })).grab((new Element("div", {
                "id": "frigate_body"
            })).grab(new Element("div", {
                "id": "frigate_list",
                "class": "frigate_highlight"
            })).grab(new Element("a", {
                "id": "frigate_on",
                "class": "frigate_links frigate_off",
                "html": "&nbsp;"
            })).grab(new Element("div", {
                "id": "frigate_dop",
                "class": "frigate_small"
            }))).grab((new Element("div", {
                "id": "frigate_f"
            })).grab(new Element("a", {
                "class": "frigate_link",
                "html": "&nbsp;",
                "data-tooltip": "close",
                events: {
                    "click": frigate_s2_close
                }
            })))));
        };
        var getMessage4s2 = function(request, sender) {
            if (request.type == "showwait") {
                showMainWin();
            } else {
                if (request.type == "s2" && request.value) {
                    showMainWin();
                    if (!isGetMessageStart) {
                        var frigate_list, frigate_dop, frigate_on;
                        var frigate_body = $("frigate_body");
                        window.addEvent("domready", function() {
                            var ScrollSpy = new Class({
                                Implements: [Options, Events],
                                options: {
                                    min: 0,
                                    mode: "vertical",
                                    max: 0,
                                    container: window,
                                    onEnter: "",
                                    onLeave: $empty,
                                    onTick: $empty
                                },
                                initialize: function(a) {
                                    this.setOptions(a);
                                    this.container = document.id(this.options.container);
                                    this.enters = this.leaves = 0;
                                    this.max = this.options.max;
                                    if (this.max == 0) {
                                        var b = this.container.getScrollSize();
                                        this.max = this.options.mode == "vertical" ? b.y : b.x;
                                    }
                                    this.addListener();
                                },
                                addListener: function() {
                                    this.inside = false;
                                    this.container.addEvent("scroll", function() {
                                        var a = this.container.getScroll();
                                        var b = this.options.mode == "vertical" ? a.y : a.x;
                                        if (b >= this.options.min && b <= this.max) {
                                            if (!this.inside) {
                                                this.inside = true;
                                                this.enters++;
                                                this.fireEvent("enter", [a, this.enters]);
                                            }
                                            this.fireEvent("tick", [a, this.inside, this.enters, this.leaves]);
                                        } else {
                                            if (this.inside) {
                                                this.inside = false;
                                                this.leaves++;
                                                this.fireEvent("leave", [a, this.leaves]);
                                            }
                                        }
                                    }.bind(this));
                                }
                            });
                            var topbar = $("frigate_wr").set("tween", {
                                    duration: 200
                                }),
                                topDistance = 30,
                                fadeTo = .5;
                            var topbarME = function() {
                                    topbar.tween("opacity", 1);
                                },
                                topbarML = function() {
                                    topbar.tween("opacity", fadeTo);
                                };
                            var events = {
                                mouseenter: topbarME,
                                mouseleave: topbarML
                            };
                            var ss = new ScrollSpy({
                                min: topDistance,
                                max: window.getScrollSize().y + 1E3,
                                onLeave: function() {
                                    topbarME();
                                    topbar.removeEvents(events);
                                },
                                onEnter: function() {
                                    topbarML();
                                    topbar.addEvents(events);
                                }
                            });
                        });
                        if (request.u) {
                            frigate_body.grab(new Element("div", {
                                "html": request.u
                            }));
                        }
                        if (request.n) {
                            frigate_body.grab(new Element("div", {
                                "html": request.n
                            }));
                        }
                    }
                    frigate_list = $("frigate_list");
                    frigate_dop = $("frigate_dop");
                    frigate_on = $("frigate_on");
                    tabId = request.tabId, tabHost = request.tabHost, tabUrl = request.tabUrl;
                    $("frigate_wr").setStyle("background", "none");
                    frigate_list.setStyle("visibility", "visible");
                    frigate_list.set("html", request.value.dop[2]);
                    frigate_dop.setStyle("visibility", "visible");
                    frigate_dop.set("html", request.value.dop[0]);
                    frigate_on.setStyle("visibility", "visible");
                    if (request.value.dop[1]) {
                        frigate_on.set("data-tooltip", request.value.dop[1]);
                    }
                    if (request.value.isonepage == 3 || request.value.isonepage == 4) {
                        frigate_on.removeClass("frigate_off");
                        frigate_on.addClass("frigate_on");
                    } else {
                        if (request.value.isonepage == 1) {
                            frigate_on.removeClass("frigate_off");
                            frigate_on.addClass("frigate_on");
                            frigate_on.removeEvent("click", onProxy);
                            frigate_on.removeEvent("click", offProxy);
                            frigate_on.addEvent("click", offProxy);
                        } else {
                            frigate_on.removeClass("frigate_on");
                            frigate_on.addClass("frigate_off");
                            frigate_on.removeEvent("click", onProxy);
                            frigate_on.removeEvent("click", offProxy);
                            frigate_on.addEvent("click", onProxy);
                        }
                    }
                    if (request.value.isonepage == 3 || request.value.isonepage == 4 || request.value.isonepage == 1) {
                        if (request.pr[1]) {
                            frigate_dop.grab(new Element("a", {
                                "class": "frigatel_" + request.pr[1] + " frigate_links",
                                "html": "&nbsp;",
                                "data-tooltip": request.pr[0],
                                events: {
                                    "click": chProxy
                                }
                            }));
                        }
                    }
                    if (!request.hide) {
                        $("frigate_wr").setStyle("visibility", "visible");
                    } else {
                        frigate_s2_close();
                    }
                    isGetMessageStart = true;
                }
            }
        };
        chrome[runtimeOrExtensionFrigate].onMessage.addListener(getMessage4s2);
    }
}
if (!frigateS2Start) {
    frigate_s2();
};