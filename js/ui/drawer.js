/* ==========================================================================
   ui/drawer.js — 术语详解抽屉：点击正文中的划线词，右侧滑入完整解释
   数据源：js/data/terms.js（def 一句话 + detail 多段详解 + related 相关词）
   ========================================================================== */

(function (H) {
  "use strict";

  var el = H.dom.el;
  var fmt = function (text) {
    return (H.ui.fmt || H.dom.escapeHTML)(text);
  };

  H.ui = H.ui || {};

  H.ui.drawer = {
    init: function init() {
      this.root = document.getElementById("termDrawer");
      this.backdrop = document.getElementById("termBackdrop");
      if (!this.root || !this.backdrop) return;

      this.bindTermClick();
      this.bindClose();
    },

    /* —— 点击 / 键盘激活术语（正文 button.term 与抽屉内相关词 .term-chip 共用） —— */
    bindTermClick: function bindTermClick() {
      var self = this;
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("button[data-term]");
        if (!trigger) return;
        self.open(trigger.getAttribute("data-term"), trigger);
      });
    },

    bindClose: function bindClose() {
      var self = this;
      var closeBtn = this.root.querySelector(".term-drawer-close");
      if (closeBtn) closeBtn.addEventListener("click", function () { self.close(); });
      this.backdrop.addEventListener("click", function () { self.close(); });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && self.isOpen()) self.close();
      });
    },

    isOpen: function isOpen() {
      return document.body.classList.contains("term-drawer-open");
    },

    /* —— 打开并渲染词条 —— */
    open: function open(name, trigger) {
      var entry = H.terms && H.terms[name];
      if (!entry) {
        if (window.console) console.warn("[handbook] 未收录的术语: " + name);
        return;
      }
      if (typeof entry === "string") entry = { def: entry };

      if (!this.isOpen()) this.lastTrigger = trigger || null;
      this.renderEntry(name, entry);
      document.body.classList.add("term-drawer-open");

      var closeBtn = this.root.querySelector(".term-drawer-close");
      if (closeBtn) closeBtn.focus();
    },

    close: function close() {
      document.body.classList.remove("term-drawer-open");
      if (this.lastTrigger && this.lastTrigger.isConnected) this.lastTrigger.focus();
      this.lastTrigger = null;
    },

    /* —— 词条 → DOM —— */
    renderEntry: function renderEntry(name, entry) {
      var title = this.root.querySelector(".term-drawer-head h4");
      var body = this.root.querySelector(".term-drawer-body");
      title.textContent = name;

      body.innerHTML = "";

      if (entry.def) {
        body.appendChild(el("p", { class: "term-def", html: fmt(entry.def) }));
      }

      if (entry.detail && entry.detail.length) {
        body.appendChild(el("div", { class: "term-detail" },
          entry.detail.map(function (para) {
            return el("p", { html: fmt(para) });
          })
        ));
      }

      var related = (entry.related || []).filter(function (n) { return H.terms[n]; });
      if (related.length) {
        body.appendChild(el("div", { class: "term-related" }, [
          el("span", { class: "block-label", text: "相关术语" }),
          el("div", { class: "term-chips" }, related.map(function (n) {
            return el("button", {
              class: "term-chip",
              text: n,
              attrs: { type: "button", "data-term": n }
            });
          }))
        ]));
      }

      body.scrollTop = 0;
    }
  };
})(window.Handbook = window.Handbook || {});
