/* ==========================================================================
   ui/progress.js — 顶部阅读进度条 + 侧边栏 / 顶栏 scroll-spy 高亮
   ========================================================================== */

(function (H) {
  "use strict";

  H.ui = H.ui || {};

  H.ui.progress = {
    init: function init() {
      this.bar = document.querySelector(".progress-bar");
      this.sections = [];
      this.tocLinks = {};
      this.topLinks = {};
      this.currentId = null;
      this.ticking = false;

      this.collect();
      this.bindScroll();
      this.update();
    },

    collect: function collect() {
      var self = this;
      document.querySelectorAll("section.module").forEach(function (section) {
        if (!section.id) return;
        self.sections.push(section);
        self.tocLinks[section.id] = document.querySelector('.toc a[data-target="' + section.id + '"]');
        self.topLinks[section.id] = document.querySelector('.topnav a[data-target="' + section.id + '"]');
      });
    },

    bindScroll: function bindScroll() {
      var self = this;
      window.addEventListener("scroll", function () {
        if (self.ticking) return;
        self.ticking = true;
        window.requestAnimationFrame(function () {
          self.update();
          self.ticking = false;
        });
      }, { passive: true });
      window.addEventListener("resize", function () {
        self.update();
      });
    },

    update: function update() {
      /* —— 进度条：滚动比例 —— */
      if (this.bar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        this.bar.style.width = (ratio * 100).toFixed(2) + "%";
      }

      /* —— scroll-spy：当前阅读到的最后一个模块 —— */
      var offset = window.innerHeight * 0.3;
      var activeId = null;
      for (var i = 0; i < this.sections.length; i++) {
        var section = this.sections[i];
        if (section.getBoundingClientRect().top - offset <= 0) {
          activeId = section.id;
        }
      }
      /* 页面顶部（Hero 区域）不高亮任何模块 */
      if (window.scrollY < window.innerHeight * 0.4) activeId = null;
      if (activeId === this.currentId) return;

      this.currentId = activeId;
      var self = this;
      Object.keys(this.tocLinks).forEach(function (id) {
        if (self.tocLinks[id]) self.tocLinks[id].classList.toggle("is-active", id === activeId);
        if (self.topLinks[id]) self.topLinks[id].classList.toggle("is-active", id === activeId);
      });
    }
  };
})(window.Handbook = window.Handbook || {});
