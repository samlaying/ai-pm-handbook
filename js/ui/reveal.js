/* ==========================================================================
   ui/reveal.js — 滚动动效：模块淡入（IntersectionObserver）
   + 章节大编号轻微 parallax（随滚动位移约 5%）
   ========================================================================== */

(function (H) {
  "use strict";

  H.ui = H.ui || {};

  H.ui.reveal = {
    init: function init() {
      this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      this.bindReveal();
      if (!this.reduce) this.bindParallax();
    },

    /* —— .reveal 元素进入视口时淡入 —— */
    bindReveal: function bindReveal() {
      var targets = document.querySelectorAll(".reveal");
      if (!targets.length) return;

      if (this.reduce || !("IntersectionObserver" in window)) {
        targets.forEach(function (node) {
          node.classList.add("is-visible");
        });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

      targets.forEach(function (node) {
        observer.observe(node);
      });
    },

    /* —— 章节大编号 parallax：滚过时缓慢位移约 5% —— */
    bindParallax: function bindParallax() {
      if (!("IntersectionObserver" in window)) return;

      var nums = Array.prototype.slice.call(document.querySelectorAll(".module-num"));
      var visible = new Set();
      var ticking = false;
      var self = this;

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
      }, { rootMargin: "80px" });

      nums.forEach(function (num) {
        observer.observe(num);
      });

      function apply() {
        ticking = false;
        visible.forEach(function (num) {
          var rect = num.getBoundingClientRect();
          var progress = rect.top / window.innerHeight; /* 1 → 0 → 负值 */
          var shift = (progress - 0.35) * -0.05 * window.innerHeight; /* 约 5% 位移量 */
          num.style.setProperty("--parallax", Math.max(-64, Math.min(64, shift)).toFixed(1) + "px");
        });
      }

      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(apply);
      }, { passive: true });

      apply();
    }
  };
})(window.Handbook = window.Handbook || {});
