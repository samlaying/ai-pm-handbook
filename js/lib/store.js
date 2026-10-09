/* ==========================================================================
   lib/store.js — localStorage 封装（带命名空间与降级容错）
   file:// 或隐私模式下 localStorage 可能抛异常，统一吞掉返回 false。
   ========================================================================== */

(function (H) {
  "use strict";

  var NS = "aipm-handbook:";

  function get(key, fallback) {
    try {
      var raw = window.localStorage.getItem(NS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function set(key, value) {
    try {
      window.localStorage.setItem(NS + key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  /** 删除本命名空间下的所有数据，返回删除的条数 */
  function clearAll() {
    var removed = 0;
    try {
      var keys = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var key = window.localStorage.key(i);
        if (key && key.indexOf(NS) === 0) keys.push(key);
      }
      keys.forEach(function (key) {
        window.localStorage.removeItem(key);
        removed++;
      });
    } catch (err) {
      /* 忽略 */
    }
    return removed;
  }

  H.store = {
    get: get,
    set: set,
    clearAll: clearAll
  };
})(window.Handbook = window.Handbook || {});
