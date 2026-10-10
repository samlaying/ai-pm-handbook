/* ==========================================================================
   ui/tabs.js — 页面级 Tab：「案例」/「名词查询」
   状态挂在 body.tab-terms 上；#glossary 哈希直达名词页。
   ========================================================================== */

(function (H) {
  "use strict";

  var HASH = "#glossary";

  H.ui = H.ui || {};

  H.ui.tabs = {
    init: function init() {
      var self = this;
      this.buttons = {};

      document.querySelectorAll(".tabs button").forEach(function (btn) {
        self.buttons[btn.dataset.tab] = btn;
        btn.addEventListener("click", function () {
          self.show(btn.dataset.tab);
        });
      });

      /* 哈希路由：#glossary 直达名词页；浏览器前进后退同步 */
      this.syncFromHash();
      window.addEventListener("popstate", function () {
        self.syncFromHash();
      });
    },

    current: function current() {
      return document.body.classList.contains("tab-terms") ? "terms" : "case";
    },

    /* opts.updateHash 为 false 时不改地址栏（供锚点跳转前静默切回案例页） */
    show: function show(name, opts) {
      opts = opts || {};
      var toTerms = name === "terms";
      document.body.classList.toggle("tab-terms", toTerms);

      var self = this;
      Object.keys(this.buttons).forEach(function (key) {
        var isThisTab = (key === "terms") === toTerms;
        self.buttons[key].classList.toggle("is-active", isThisTab);
        self.buttons[key].setAttribute("aria-selected", String(isThisTab));
      });

      if (opts.updateHash !== false) {
        if (toTerms) {
          window.history.pushState(null, "", HASH);
          window.scrollTo({ top: 0 });
        } else if (window.location.hash === HASH) {
          window.history.pushState(null, "", window.location.pathname);
        }
      }

      /* Tab 切换后重算进度条与滚动高亮 */
      if (H.ui.progress && H.ui.progress.update) H.ui.progress.update();
    },

    syncFromHash: function syncFromHash() {
      this.show(window.location.hash === HASH ? "terms" : "case", { updateHash: false });
    }
  };
})(window.Handbook = window.Handbook || {});
