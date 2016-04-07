isD = false;
var lsList = [];
var frList = {};
var fixEV = Browser.name != "ie" ? "keydown" : "onkeydown";

function l(mess) {
    return chrome.i18n.getMessage(mess);
}

function isipv4(addr) {
    var ipSplit = addr.split(/\:/g);
    if (typeof ipSplit[1] != "undefined") {
        if (ipSplit[1] < 65535 && ipSplit[1] > 0) {
            if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipSplit[0])) {
                return true;
            }
        }
    }
    return false;
}

function isipv6(addr) {
    var ipSplit = addr.split(/\]:/g);
    if (typeof ipSplit[1] != "undefined") {
        if (ipSplit[1] < 65535 && ipSplit[1] > 0) {
            ipSplit = ipSplit[0].split(/\[/g);
            if (typeof ipSplit[1] != "undefined") {
                return /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i.test(ipSplit[1]);
            }
        }
    }
    return false;
}

function okErr(txt, end) {
    var SM = new SimpleModal({
        "btn_ok": l("messAlertClose"),
        "onClose": end
    });
    SM.show({
        "title": l("messAlertError"),
        "contents": txt
    });
}

function frigateDelProxy(event) {
    if (event) {
        event.stop();
    }
    var pr = ls.get("pr2");
    pr = pr.erase(this.rel);
    ls.set("pr2", pr);
    showProxy();
    chrome[runtimeOrExtension].sendMessage({
        type: "frigate",
        value: "proxy"
    });
}

function showProxy() {
    var pr = ls.get("pr2");
    var proxy_list = $("proxy_list").empty();
    if (pr && pr.length > 0) {
        var ins = "";
        Array.each(pr, function(val, key) {
            newval = val.replace("PROXY", "PROXY<strong>");
            newval = val.replace("SOCKS", "SOCKS<strong>");
            proxy_list.grab((new Element("div", {
                html: newval + "</strong>"
            })).grab(new Element("a", {
                text: " ",
                "class": "trbut",
                rel: val,
                events: {
                    click: frigateDelProxy
                }
            }), "top"));
        });
    } else {
        proxy_list.grab((new Element("ul")).grab((new Element("li")).appendText(l("mess_fgproxy"))));
    }
}

function frigateDelList(event) {
    if (event) {
        event.stop();
    }
    if (lsList[this.rel].d.length > 0) {
        var mess = l("messListsConfirmDelNoEmptyList")
    } else {
        var mess = l("messListsConfirmDelList")
    }
    var SM = new SimpleModal({
        "btn_ok": l("messListsConfirmOK"),
        "btn_cancel": l("messListsConfirmCancel")
    });
    SM.show({
        "model": "confirm",
        "callback": function() {
            chrome[runtimeOrExtension].sendMessage({
                type: "frigatelist",
                value: {
                    "act": "offlist",
                    "id": this.rel
                }
            }, function(resp) {
                delete lsList[this.rel];
                lsList = lsList.clean();
                ls.set("list", lsList);
                showList();
            }.bind(this));
        }.bind(this),
        "title": l("messModalConfirmTitle"),
        "contents": mess
    });
}

function frigateOnOffList(event) {
    if (event) {
        event.stop();
    }
    if (typeof lsList[this.rel].on == "undefined" || !lsList[this.rel].on) {
        chrome[runtimeOrExtension].sendMessage({
            type: "frigatelist",
            value: {
                "act": "onlist",
                "id": this.rel
            }
        }, function(resp) {
            this.set("class", "on");
            lsList[this.rel].on = true;
            ls.set("list", lsList);
        }.bind(this));
    } else {
        chrome[runtimeOrExtension].sendMessage({
            type: "frigatelist",
            value: {
                "act": "offlist",
                "id": this.rel
            }
        }, function(resp) {
            this.set("class", "off");
            lsList[this.rel].on = false;
            ls.set("list", lsList);
        }.bind(this));
    }
}
frigateOverlay = {
    listKey: false,
    keyPressThis: false,
    keyPress: function(e) {
        if (e.key == "esc") {
            if (e) {
                e.stop();
            }
            this.cancelEdit(e);
        } else {
            if (e.key == "enter") {
                if (e) {
                    e.stop();
                }
                frigateSaveIteamList(this.listKey);
            }
        }
    },
    cancelEdit: function(e) {
        if (e) {
            e.stop();
        }
        this.hide();
        frigateShowIteamList(this.listKey);
    },
    show: function(key) {
        if (key) {
            this.listKey = key;
        }
        this.hide();
        var overlay = new Element("div", {
            "id": "frigate-overlay",
            events: {
                click: this.cancelEdit.bind(this)
            }
        });
        overlay.inject($$("body")[0], "top");
        keyPressThis = this.keyPress.bind(this);
        window.addEvent(fixEV, keyPressThis);
    },
    hide: function() {
        try {
            window.removeEvent(fixEV, keyPressThis);
            $("frigate-overlay").destroy();
        } catch (err) {}
    }
};

function frigateSaveIteamList(key) {
    var listName = $("listname" + key).value.trim();
    if (!listName || /[^\u0400-\u04FF_\-a-z0-9]/ig.test(listName)) {
        okErr(l("messOptListFormat"), $empty);
    } else {
        var errListName = false;
        lsListlength = lsList.length;
        for (var i = 0; i < lsListlength; i++) {
            if (lsList[i].n == listName && (!key || key && key != i)) {
                errListName = true;
                break;
            }
        }
        if (errListName) {
            okErr(l("messOptListAlrIs"), $empty);
        } else {
            if (key) {
                lsList[key].n = listName;
            } else {
                var i = lsList.length;
                lsList[i] = {
                    n: listName,
                    on: true,
                    d: []
                };
                $("listname").value = "";
            }
            ls.set("list", lsList);
            frigateOverlay.hide();
            frigateShowIteamList(key);
        }
    }
}

function frigateShowIteamList(key) {
    if (key) {
        var td = $("list" + key).empty();
        td.set("html", '<h4><span class="folder">&nbsp;</span><a href="' + chrome.extension.getURL("list.html") + "?id=" + key + '">' + lsList[key].n + "</a>");
    }
}

function frigateEditList(event) {
    if (event) {
        event.stop();
    }
    var td = $("list" + this.rel).empty();
    frigateOverlay.show(this.rel);
    var inp = new Element("input", {
        "id": "listname" + this.rel,
        "class": "inpedit",
        "value": lsList[this.rel].n
    });
    td.grab(inp).grab(new Element("a", {
        "href": "#",
        "class": "save",
        "rel": this.rel,
        events: {
            "click": function(e) {
                if (e) {
                    e.stop();
                }
                frigateSaveIteamList(this.rel);
                return false;
            }
        }
    }));
}

function showList() {
    lsList = ls.get("list");
    lsListShow = {};
    lsListShow[0] = frList;
    if (lsList == null || typeof lsList != "object" || lsList.length == 0) {
        lsList = [];
    } else {
        Array.each(lsList, function(val, key) {
            lsListShow[key + 1] = val;
        });
    }
    var list_list = $("list_list").empty();
    if (lsListShow && !emptyObject(lsListShow)) {
        list_table = new Element("table", {});
        var i = 0;
        var className = "";
        var col;
        var listname, acts;
        var classonoff;
        Object.each(lsListShow, function(val, key) {
            i = i + 1;
            if (i % 2) {
                className = "even";
            } else {
                className = "odd";
            }
            col = Element("td", {
                text: val.d.length
            });
            tr = new Element("tr", {
                "class": className
            });
            listname = new Element("td", {
                "id": "list" + (key - 1),
                "html": '<h4><span class="folder">&nbsp;</span><a href="' + chrome.extension.getURL("list.html") + "?id=" + (key - 1) + '">' + val.n + "</a></h4>"
            });
            tr = tr.grab(listname);
            tr = tr.grab(col);
            if (key == 0) {
                tr.grab(new Element("td")).grab(new Element("td"));
            } else {
                if (typeof val.on == "undefined" || !val.on) {
                    classonoff = "off";
                } else {
                    classonoff = "on";
                }
                acts = new Element("td", {
                    "class": "text-center"
                });
                acts.grab(new Element("a", {
                    "href": "#",
                    "class": "edit",
                    "rel": key - 1,
                    events: {
                        "click": frigateEditList
                    }
                }));
                acts.grab(new Element("a", {
                    "href": "#",
                    "class": "trbut",
                    "rel": key - 1,
                    events: {
                        "click": frigateDelList
                    }
                }));
                tr.grab(acts);
                tr.grab((new Element("td", {
                    "class": "text-center"
                })).grab(new Element("a", {
                    "href": "#",
                    "class": classonoff,
                    "rel": key - 1,
                    events: {
                        "click": frigateOnOffList
                    }
                })));
            }
            list_table.grab(tr);
        });
        list_list.grab(list_table);
    } else {
        lsList = [];
        list_list.grab((new Element("ul")).grab((new Element("li")).appendText(l("messListsEmpty"))));
    }
}
window.addEvent("domready", function() {
    document.title = l("chrome_extension_name") + " - " + l("mess_option");
    $("header").appendText(l("chrome_extension_name") + " - " + l("mess_option"));
    $("header_proxy").appendText(l("mess_header_proxy"));
    $("header_alert").appendText(l("mess_header_alert"));
    $("header_opt").appendText(l("mess_header_opt"));
    $("header_anon").appendText(l("mess_header_anon"));
    $("isanon").appendText(l("mess_isanon"));
    $("isalert").appendText(l("mess_isalert"));
    $("iscompress").set("html", l("mess_iscompress"));
    $("addproxy").appendText(l("mess_addproxy"));
    $("ownproxy").appendText(l("mess_ownproxy"));
    $("ownlist").appendText(l("messListsOwn"));
    $("messLists").appendText(l("messLists"));
    $("addlist").appendText(l("messAddList"));
    $("listname").set("placeholder", l("messListsName"));
    $("noalert").set("checked", ls.get("noalert"));
    $("noalert").addEvent("change", function() {
        ls.set("noalert", $("noalert").get("checked"));
        chrome[runtimeOrExtension].sendMessage({
            type: "frigate",
            value: "noalert"
        });
    });

    $("anon").set("checked", ls.get("a"));
    $("anon").addEvent("change", function() {
        ls.set("a", this.get("checked") ? 1 : 0);
        chrome[runtimeOrExtension].sendMessage({
            type: "frigate",
            value: "anon",
            val2: this.get("checked")
        });
    });
    var compres = ls.get("compres");
    $("nocompress").set("checked", compres);
    $("nocompress").addEvent("change", function() {
        if (this.get("checked")) {
            $("ContentLenStat").setStyle("display", "inline-block");
        } else {
            $("ContentLenStat").setStyle("display", "none");
        }
        ls.set("compres", this.get("checked") ? 1 : 0);
        chrome[runtimeOrExtension].sendMessage({
            type: "frigate",
            value: "compres",
            val2: this.get("checked")
        });
    });
    $("ContentLen").appendText(l("messEconomy"));
    $("OriginalContentLength").set("html", "<strong>" + Math.round((ls.get("OriginalContentLength") - ls.get("ContentLength")) / 102.4) / 10 + "Mb</strong>");
    var ContentLengthCounterStart = ls.get("ContentLengthCounterStart");
    var suf = "";
    var t = new Date;
    ContentLengthCounterStart = t.getTime() / 1E3 - ContentLengthCounterStart;
    if (ContentLengthCounterStart < 3600) {
        ContentLengthCounterStart = Math.round(ContentLengthCounterStart / 60);
        suf = l("messMin");
    } else {
        if (ContentLengthCounterStart < 86400) {
            ContentLengthCounterStart = Math.round(ContentLengthCounterStart / 3600);
            var lastDig = ContentLengthCounterStart % 10;
            var last2Dig = ContentLengthCounterStart % 100;
            if (last2Dig > 10 && last2Dig < 16) {
                suf = l("messHos");
            } else {
                if (lastDig == 1) {
                    suf = l("messHo");
                } else {
                    if (lastDig > 1 && lastDig < 5) {
                        suf = l("messHos2");
                    } else {
                        suf = l("messHos");
                    }
                }
            }
        } else {
            ContentLengthCounterStart = Math.round(ContentLengthCounterStart / 86400);
            var lastDig = ContentLengthCounterStart % 10;
            var last2Dig = ContentLengthCounterStart % 100;
            if (last2Dig > 10 && last2Dig < 16) {
                suf = l("messHos");
            } else {
                if (lastDig == 1) {
                    suf = l("messDay");
                } else {
                    if (lastDig > 1 && lastDig < 5) {
                        suf = l("messDays2");
                    } else {
                        suf = l("messDays");
                    }
                }
            }
        }
    }
    $("ContentLenInterval").appendText(l("messLast") + " " + ContentLengthCounterStart + " " + suf);
    $("resetContentLen").appendText(l("messReset"));
    $("resetContentLen").addEvent("click", function(event) {
        ls.set("OriginalContentLength", 0);
        ls.set("ContentLength", 0);
        setContentLengthCounterStart();
    });
    if (compres) {
        $("ContentLenStat").setStyle("display", "inline-block");
    }
    $("autochproxy").appendText(l("mess_autochproxy"));
    $("noautochproxy").set("checked", !ls.get("noAutoChangeProxy"));
    $("noautochproxy").addEvent("change", function() {
        ls.set("noAutoChangeProxy", this.get("checked") ? 0 : 1);
        chrome[runtimeOrExtension].sendMessage({
            type: "frigate",
            value: "noautochproxy",
            val2: !this.get("checked")
        });
    });
    $("slowconn").appendText(l("mess_slowconn"));
    $("isslowconn").set("checked", ls.get("slow"));
    $("isslowconn").addEvent("change", function() {
        ls.set("slow", this.get("checked") ? 1 : 0);
        chrome[runtimeOrExtension].sendMessage({
            type: "frigate",
            value: "isslowconn",
            val2: !this.get("checked")
        });
    });
    showProxy();
    $("addproxy").addEvent("click", function(event) {
        event.stop();
        ip = $("proxy").value;
        if (isipv4(ip) || isipv6(ip)) {
            var pr = ls.get("pr2");
            if (!pr || pr.length < 1) {
                pr = [];
            }
            if ($("frigateproxytypep").get("checked")) {
                ip = "PROXY " + ip;
            } else {
                ip = "SOCKS " + ip;
            }
            pr = pr.include(ip);
            ls.set("pr2", pr);
            showProxy();
            $("proxy").value = "";
            chrome[runtimeOrExtension].sendMessage({
                type: "frigate",
                value: "proxy"
            });
        } else {
            okErr(l("mess_proxyformat_err"), $empty);
        }
    });
    chrome[runtimeOrExtension].sendMessage({
        type: "frigate",
        value: "getfrlist"
    }, function(resp) {
        var dat = [];
        Object.each(resp, function(val, key) {
            dat.push(val.h);
        });
        frList = {
            n: "friGate",
            on: true,
            d: dat
        };
        showList();
    });
    $("addlist").addEvent("click", function(event) {
        event.stop();
        frigateSaveIteamList("");
        showList();
    });
});