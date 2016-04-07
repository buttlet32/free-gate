ls = {isset:function(key) {
  if (typeof localStorage[key] != "undefined") {
    return true;
  } else {
    return false;
  }
}, get:function(key, enc) {
  if (localStorage.getItem(key) !== null) {
    if (enc) {
      var denc = XXTEA.decrypt(localStorage.getItem(key), enc);
      if (denc) {
        return JSON.parse(Utf8.decode(denc));
      } else {
        return "";
      }
    } else {
      return JSON.parse(localStorage.getItem(key));
    }
  } else {
    return null;
  }
}, set:function(key, val, enc) {
  val = JSON.stringify(val);
  if (enc) {
    val = XXTEA.encrypt(Utf8.encode(val), enc);
  }
  localStorage.setItem(key, val);
}, del:function(key) {
  localStorage.removeItem(key);
}, getAll:function() {
  ret = {};
  Object.each(localStorage, function(value, host) {
    try {
      ret[host] = JSON.parse(value);
    } catch (e) {
    }
  });
  return ret;
}};

