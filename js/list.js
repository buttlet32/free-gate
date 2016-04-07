var lsList = [];
var siteList;
var fixEV = Browser.name != "ie" ? "keydown" : "onkeydown";
var preedithost = "",
    preediturl = "";
var isD = false;
var urlvalid = new RegExp("^" + "(?:(?:https?|ftp)://)" + "(?:\\S+(?::\\S*)?@)?" + "(?:" + "(?!(?:10|127)(?:\\.\\d{1,3}){3})" + "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" + "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" + "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" + "|" + "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" + "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" + ")" + "(?::\\d{2,5})?" + "(?:/\\S*)?" + "$", "i");

function makeSchemes(schemes) {
    return "(?:" + schemes.join("|") + ")://";
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function noact(event) {
    if (event) {
        event.stop();
    }
    return false;
}

function checkUrl(url) {
    if (!urlvalid.test(url)) {
        return false;
    }
    try {
        var purl = new URL(url);
    } catch (e) {
        return false;
    }
    if (purl.protocol == "http:" || purl.protocol == "https:") {
        return true;
    } else {
        return false;
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

function frigateSaveSiteStep2(j, site, url, key, endfu, endfu2) {
    if (j.s) {
        if (url == -2 && j.s == -1 || url == -1 && j.s == -1 && j.h2.search(/(4|5)\d\d/g) != -1 || !(url < 0) && j.s == -1) {
            if (siteList.on && (!key || siteList.d[key].on)) {
                var sendHost = function(response) {
                    chrome[runtimeOrExtension].sendMessage({
                        type: "frigatelist",
                        value: {
                            "act": "url",
                            "host": site,
                            "url": url,
                            "list": siteList.n,
                            "lid": params.id,
                            "new": preedithost == ""
                        }
                    }, function(response) {
                        if (key) {
                            siteList.d[key].u = url;
                        } else {
                            siteList.d.push({
                                h: site,
                                u: url,
                                on: true
                            });
                            key = siteList.d.length - 1;
                        }
                        lsList[params.id] = siteList;
                        ls.set("list", lsList);
                        endfu.apply();
                        endfu2.apply();
                    });
                };
                if (preedithost) {
                    chrome[runtimeOrExtension].sendMessage({
                        type: "frigatelist",
                        value: {
                            "act": "delurl",
                            "host": preedithost,
                            "url": preediturl,
                            "notApply": true
                        }
                    }, sendHost);
                } else {
                    sendHost.apply();
                }
            } else {
                if (!key) {
                    siteList.d.push({
                        h: site,
                        u: url,
                        on: true
                    });
                } else {
                    siteList.d[key]["u"] = url;
                }
                lsList[params.id] = siteList;
                ls.set("list", lsList);
                endfu.apply();
                endfu2.apply();
            }
        } else {
            if (j.s == -3) {
                okErr(l("messListsFileNotFound"), endfu2);
            } else {
                okErr(l("messListsNoAlg"), endfu2);
            }
        }
    } else {
        okErr(l("messListsSomethingHappened"), endfu2);
    }
}

function frigateSaveSite(site, url, t, key, endfu, endfu2) {
    if (!site && key) {
        site = siteList.d[key].h;
    }
    site = site.toLowerCase();
    var asterisk = "",
        end = "/",
        sheme = "http://",
        sheme2 = sheme,
        dopPostParam = "";
    if (site.indexOf("http") == 0) {
        if (site.indexOf("https") == 0) {
            sheme = "https://";
        }
        site = site.substring(sheme.length);
    }
    if (site.indexOf("*.") == 0) {
        site = site.substring(2);
        asterisk = "*.";
    }
    var urlSplit = site.split(/\/+/g);
    site = urlSplit[0];
    if (checkUrl(sheme + site + end)) {
        var alredyIs = false;
        var list = siteList.d;
        var siteCh = asterisk + site;
        Object.each(list, function(val, valkey) {
            if (val.h == siteCh) {
                if (!key || key != valkey) {
                    alredyIs = true;
                }
            }
        });
        if (!alredyIs) {
            url = url.trim();
            var urlCh = false;
            if (t == 2) {
                if (url) {
                    if (url.search(/http/i) == 0) {
                        if (url.search(/https/i) == 0) {
                            sheme2 = "https://";
                        }
                        url = url.substring(sheme2.length);
                    }
                    if (url.indexOf("/") != 0) {
                        var siteRegExp = new RegExp(escapeRegExp(site), "i");
                        if (url.search(siteRegExp) == 0) {
                            url = url.substring(site.length);
                        } else {
                            url = "/" + url;
                        }
                    }
                    if (checkUrl(sheme2 + site + url)) {
                        var urlReq = sheme2 + site + url;
                        dopPostParam = "comp404=1&";
                        urlCh = true;
                    }
                }
            } else {
                if (t == 3) {
                    url = -2;
                    urlCh = true;
                } else {
                    url = -1;
                    var urlReq = genRandFile(sheme, site);
                    dopPostParam = "noh=1&";
                    urlCh = true;
                }
            }
            if (urlCh !== false) {
                chrome[runtimeOrExtension].sendMessage({
                    type: "frigatelist",
                    value: {
                        "act": "churl",
                        "host": site,
                        "new": preedithost == ""
                    }
                }, function(response) {
                    if (response && response != params.id) {
                        if (response == response * 1) {
                            if (lsList && lsList.length > 0) {
                                siteList = lsList[response];
                                response = siteList.n;
                            }
                        }
                        okErr(l("messListsSiteUrlAlrIs2") + ' <b>"' + response + '"</b>. ' + l("messListsSiteUrlAlrIs3"), endfu2);
                    } else {
                        if (t == 3) {
                            frigateSaveSiteStep2({
                                s: -1
                            }, asterisk + site, url, key, endfu, endfu2);
                        } else {
                            var saveStep2 = function(j) {
                                frigateSaveSiteStep2(j, asterisk + site, url, key, endfu, endfu2);
                            };
                            var encchurl = Base64.encode(XXTEA.encrypt(urlReq, "kq6V2PeWMBTpg9aR"));
                            getUrl(urlForGetSize, "post", dopPostParam + "u=" + encodeURIComponent(encchurl), saveStep2, saveStep2, saveStep2);
                        }
                    }
                });
            } else {
                okErr(l("messListsSiteUrlFormat"), endfu2);
            }
        } else {
            okErr(l("messListsSiteUrlAlrIs"), endfu2);
        }
    } else {
        okErr(l("messListsSiteHostFormat"), endfu2);
    }
}

function frigateSaveIteamList(key) {
    var tr = $("list" + key);
    var td = tr.getElements("td");
    var url = td[2].getElement("input").value.trim();
    if (url != preediturl) {
        frigateSaveSite(false, url, $("typecheck" + key).getSelected().get("value"), key, $empty, function() {
            preediturl = "";
            preedithost = "";
            frigateOverlay.hide();
            frigateShowIteamList(key);
        });
    } else {
        frigateOverlay.hide();
        frigateShowIteamList(key);
    }
}

function frigateShowIteamList(key) {
    var tr = $("list" + key);
    var td = tr.getElements("td");
    genHost(key, siteList.d[key]).replaces(td[1]);
    td[2].empty().grab(new Element("a", {
        "text": cutUrl(siteList.d[key].u),
        "class": "nolink",
        "rel": key,
        "href": "",
        events: {
            "click": noact,
            "dblclick": frigateEditList
        }
    }));
    genAct(key).replaces(td[3]);
    if (siteList.d[key].u == -5) {
        td[4].empty();
    }
}

function frigateDelList(event) {
    if (event) {
        event.stop();
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
                    "act": "delurl",
                    "host": siteList.d[this.rel].h,
                    "url": siteList.d[this.rel].u
                }
            }, function() {});
            delete siteList.d[this.rel];
            siteList.d = siteList.d.clean();
            lsList[params.id] = siteList;
            ls.set("list", lsList);
            showList();
        }.bind(this),
        "title": l("messModalConfirmTitle"),
        "contents": l("messListsConfirmDelSite") + "<strong>" + siteList.n + "</strong> " + l("messAreYouSure")
    });
}

function frigateOnOffList(event) {
    if (event) {
        event.stop();
    }
    var onoff = function(resp) {
        if (siteList.d[this.rel].on) {
            this.set("class", "off");
            siteList.d[this.rel].on = false;
        } else {
            this.set("class", "on");
            siteList.d[this.rel].on = true;
        }
        lsList[params.id] = siteList;
        if (siteList.d[this.rel].u != -5) {
            ls.set("list", lsList);
        }
    };
    if (siteList.on) {
        if (typeof siteList.d[this.rel].on == "undefined" || !siteList.d[this.rel].on) {
            chrome[runtimeOrExtension].sendMessage({
                type: "frigatelist",
                value: {
                    "act": "url",
                    "host": siteList.d[this.rel].h,
                    "list": siteList.n,
                    "lid": params.id,
                    "url": siteList.d[this.rel].u
                }
            }, onoff.bind(this));
        } else {
            chrome[runtimeOrExtension].sendMessage({
                type: "frigatelist",
                value: {
                    "act": "delurl",
                    "host": siteList.d[this.rel].h,
                    "url": siteList.d[this.rel].u
                }
            }, onoff.bind(this));
        }
    } else {
        onoff.apply(this);
    }
}

function frigateEditList(event) {
    if (event) {
        event.stop();
    }
    if (siteList.d[this.rel].u != -5) {
        var tr = $("list" + this.rel);
        var getOpt = function(el, val) {
            if (el.u == -1 && val == 1) {
                return "selected";
            } else {
                if (el.u == -2 && val == 3) {
                    return "selected";
                } else {
                    if (!(el.u < 0) && val == 2) {
                        return "selected";
                    } else {
                        return "";
                    }
                }
            }
        };
        var getInpCl = function(el) {
            if (el.u == -1 || el.u == -2) {
                return " hide";
            } else {
                return "";
            }
        };
        var getInpVal = function(el) {
            if (el.u == -1 || el.u == -2) {
                return "";
            } else {
                return el.u;
            }
        };
        var td = tr.getElements("td");
        frigateOverlay.show(this.rel);
        var select = new Element("select", {
            "id": "typecheck" + this.rel,
            "class": "select3"
        });
        select.grab(new Element("option", {
            "text": l("messTypeCh2"),
            "value": 2,
            "selected": getOpt(siteList.d[this.rel], 2)
        }));
        select.grab(new Element("option", {
            "text": l("messTypeCh3"),
            "value": 3,
            "selected": getOpt(siteList.d[this.rel], 3)
        }));
        var inpUrl = new Element("input", {
            "id": "sitehost" + this.rel,
            "class": "inpedit3" + getInpCl(siteList.d[this.rel]),
            "value": getInpVal(siteList.d[this.rel])
        });
        select.addEvent("change", function() {
            if (this.getSelected().get("value") == 2) {
                inpUrl.removeClass("hide");
            } else {
                inpUrl.addClass("hide");
            }
        });
        td[2].empty().grab(select);
        td[2].grab(inpUrl);
        td[3].empty().grab(new Element("a", {
            "href": "",
            "class": "save2",
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
        preedithost = siteList.d[this.rel].h;
        preediturl = siteList.d[this.rel].u;
    }
    return false;
}

function cutUrl(url) {
    if (url == -1) {
        return l("messTypeCh1");
    } else {
        if (url == -2) {
            return l("messTypeCh3");
        } else {
            if (url == -5) {
                return l("messFromList") + " friGate";
            }
        }
    }
    splitUrl = url.split(/\/+/g);
    if (splitUrl.length > 3) {
        delemiterUrl = "/.../";
    } else {
        delemiterUrl = "/";
    }
    return splitUrl[0] + delemiterUrl + splitUrl[splitUrl.length - 1];
}

function genAct(key) {
    var acts = new Element("td", {
        "class": "text-right"
    });
    if (siteList.d[key].u != -5) {
        acts.grab(new Element("a", {
            "href": "",
            "class": "edit",
            "rel": key,
            events: {
                "click": frigateEditList
            }
        }));
        acts.grab(new Element("a", {
            "href": "",
            "class": "trbut",
            "rel": key,
            events: {
                "click": frigateDelList
            }
        }));
    }
    return acts;
}

function genHost(key, val) {
    clHost = getClHost(val.h);
    return (new Element("td")).grab(new Element("img", {
        src: "http://" + clHost + "/favicon.ico",
        width: 18,
        styles: {
            "vertical-align": "middle",
            "margin-right": "5px",
            "display": "inline-block",
            "padding-bottom": "1px"
        },
        events: {
            "error": function() {
                this.set("src", "im/folder.png");
            }
        }
    })).grab(new Element("a", {
        "text": val.h,
        "class": "nolink bold",
        "rel": key,
        "href": "http://" + clHost,
        "target": "_blank",
        styles: {},
        events: {}
    }));
}

function showList() {
    var list = siteList.d;
    var list_list = $("list_list").empty();
    if (list && list.length > 0) {
        list.sort(function(a, b) {
            ah = getClHost(a.h);
            bh = getClHost(b.h);
            if (ah == bh) {
                return 0;
            }
            return ah < bh ? -1 : 1;
        });
        var i = 0;
        var className = "";
        var classonoff, splitUrl, delemiterUrl;
        tableObj = new Element("table", {});
        Object.each(list, function(val, key) {
            i = i + 1;
            if (i % 2) {
                className = "odd";
            } else {
                className = "even";
            }
            tr = new Element("tr", {
                "class": className,
                "id": "list" + key
            });
            tr.grab(new Element("td", {
                "text": i
            }));
            tr.grab(genHost(key, val));
            if (val.u != -5) {
                tr.grab((new Element("td")).grab(new Element("a", {
                    "text": cutUrl(val.u),
                    "class": "nolink",
                    "rel": key,
                    "href": "",
                    events: {
                        "click": noact,
                        "dblclick": frigateEditList
                    }
                })));
                tr.grab(genAct(key));
            }
            if (typeof val.on == "undefined" || !val.on) {
                classonoff = "off";
            } else {
                classonoff = "on";
            }
            tr.grab((new Element("td", {
                "class": "text-center"
            })).grab(new Element("a", {
                "href": "",
                "class": classonoff,
                "rel": key,
                events: {
                    "click": frigateOnOffList
                }
            })));
            tableObj.grab(tr);
        });
        list_list.grab(tableObj);
    } else {
        list_list.grab((new Element("ul")).grab((new Element("li")).appendText(l("messListsEmpty"))));
    }
}
var params = {};
window.addEvent("domready", function() {
    var prmstr = window.location.search.substr(1);
    var prmarr = prmstr.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    document.title = "friGate" + " - " + l("mess_option");
    $("header").appendText("friGate" + " - " + l("messLists"));
    $("back").appendText(l("messBack"));
    if (params.id == -1) {
        $("stylized-form").addClass("hide");
    } else {
        $("algDesc").set("html", l("messListsAlgDesc"));
        $("addsite").appendText(l("messListsAddSite"));
        $("site").set("placeholder", l("messListsAddSiteDomain"));
        var urlcheck = $("url");
        urlcheck.set("placeholder", l("messListsAddSiteFile"));
        var typech = $("typecheck").getChildren("option");
        typech[0].set("text", l("messTypeCh3"));
        typech[0].set("value", "3");
        typech[1].set("text", l("messTypeCh2"));
        typech[1].set("value", "2");
        $("typecheck").addEvent("change", function() {
            if (this.value == 2) {
                urlcheck.removeClass("hide");
            } else {
                urlcheck.addClass("hide");
            }
        });
    }
    if (params.id == -1) {
        chrome[runtimeOrExtension].sendMessage({
            type: "frigate",
            value: "getfrlist"
        }, function(resp) {
            var dat = [];
            Object.each(resp, function(val, key) {
                var todat = {
                    h: key,
                    u: -5,
                    on: true
                };
                if (val.ons < 0) {
                    todat.on = false;
                }
                dat.push(todat);
            });
            siteList = {
                n: "friGate list",
                on: true,
                d: dat
            };
            $("listname").set("text", "friGate");
            showList();
        });
    } else {
        lsList = ls.get("list");
        if (lsList && lsList.length > 0) {
            siteList = lsList[params.id];
            $("listname").set("text", siteList.n);
        }
        showList();
    }
    $("addsite").addEvent("click", function(event) {
        event.stop();
        this.setStyle("visibility", "hidden");
        $("sendWite").setStyle("visibility", "visible");
        site = $("site").value.trim();
        url = $("url").value.trim();
        frigateSaveSite(site, url, $("typecheck").getSelected().get("value"), false, function() {
            showList(siteList.d);
            $("site").value = "";
            urlcheck.value = "";
            urlcheck.addClass("hide");
            typech[0].set("selected", "selected");
        }, function() {
            $("sendWite").setStyle("visibility", "hidden");
            this.setStyle("visibility", "visible");
        }.bind(this));
    });
});
