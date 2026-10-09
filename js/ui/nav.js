/* ==========================================================================
   ui/nav.js — 导航交互：锚点平滑跳转 + 跳转后标题闪烁 + 移动端抽屉
   ========================================================================== */

(function (H) {
  "use strict";

  H.ui = H.ui || {};

  H.ui.nav = {
    init: function init() {
      this.bindAnchors();
      this.bindDrawer();
    },

    /* —— 所有页面内锚点：手动接管跳转（不依赖浏览器默认行为），
           跳转后给目标标题橙色下划线闪烁 —— */
    bindAnchors: function bindAnchors() {
      var self = this;
      document.addEventListener("click", function (event) {
        var link = event.target.closest('a[href^="#"]');
        if (!link) return;

        var targetId = link.getAttribute("href").slice(1);
        var target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;

        event.preventDefault();

        /* 移动端：点目录项后收起抽屉 */
        document.body.classList.remove("drawer-open");
        var toggle = document.querySelector(".menu-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");

        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var topbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 56;
        var top = target.getBoundingClientRect().top + window.scrollY - (topbar + 24);

        window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", "#" + targetId);
        } else {
          window.location.hash = targetId;
        }

        self.flash(target.querySelector(".module-head"));
      });
    },

    flash: function flash(head) {
      if (!head) return;
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      /* 平滑滚动约 400ms 后触发闪烁提醒 */
      window.setTimeout(function () {
        head.classList.remove("flash-underline");
        void head.offsetWidth; /* 重置动画 */
        head.classList.add("flash-underline");
      }, 420);
    },

    /* —— 移动端抽屉（汉堡菜单） —— */
    bindDrawer: function bindDrawer() {
      var toggle = document.querySelector(".menu-toggle");
      var backdrop = document.getElementById("backdrop");

      function setOpen(open) {
        document.body.classList.toggle("drawer-open", open);
        if (toggle) toggle.setAttribute("aria-expanded", String(open));
      }

      if (toggle) {
        toggle.addEventListener("click", function () {
          setOpen(!document.body.classList.contains("drawer-open"));
        });
      }
      if (backdrop) {
        backdrop.addEventListener("click", function () {
          setOpen(false);
        });
      }
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setOpen(false);
      });
    }
  };
})(window.Handbook = window.Handbook || {});
