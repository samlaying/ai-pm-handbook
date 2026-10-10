/* ==========================================================================
   ui/drawer.js — 术语详解抽屉：点击划线词 / 名词页词条，右侧滑入完整解释
   三段式结构：名词定义 → 项目案例 → 技术解析和应用（+ 相关术语 / 模块回跳）
   数据源：js/data/terms.js
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

    /* —— 点击 / 键盘激活术语（正文 button.term、名词页 .glossary-item、抽屉内相关词共用） —— */
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

    /* —— 段落容器：字符串或字符串数组都接受 —— */
    paragraphs: function paragraphs(content) {
      if (!content) return [];
      return (Array.isArray(content) ? content : [content]).map(function (para) {
        return el("p", { html: fmt(para) });
      });
    },

    /* —— 词条 → DOM（三段式） —— */
    renderEntry: function renderEntry(name, entry) {
      var title = this.root.querySelector(".term-drawer-head h4");
      var body = this.root.querySelector(".term-drawer-body");
      title.textContent = name;
      body.innerHTML = "";

      /* ① 名词定义 */
      if (entry.def) {
        body.appendChild(el("div", { class: "term-section" }, [
          el("span", { class: "term-section-label", text: "名词定义" }),
          el("p", { class: "term-def", html: fmt(entry.def) })
        ]));
      }

      /* ② 项目案例 */
      if (entry.case || (entry.modules && entry.modules.length)) {
        body.appendChild(el("div", { class: "term-section" }, [
          el("span", { class: "term-section-label", text: "项目案例" }),
          entry.case ? el("p", { class: "term-case", html: fmt(entry.case) }) : null,
          this.renderModuleLinks(entry.modules)
        ]));
      }

      /* ③ 技术解析和应用 */
      var techParas = this.paragraphs(entry.tech || entry.detail);
      if (techParas.length) {
        body.appendChild(el("div", { class: "term-section" }, [
          el("span", { class: "term-section-label", text: "技术解析和应用" }),
          el("div", { class: "term-tech" }, techParas)
        ]));
      }

      /* 相关术语 */
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
    },

    /* —— 「出现在案例」回跳链接：切回案例 Tab 并滚动到对应模块 —— */
    renderModuleLinks: function renderModuleLinks(moduleIds) {
      if (!moduleIds || !moduleIds.length) return null;

      var byId = {};
      (H.modules || []).forEach(function (m) { byId[m.id] = m; });

      var links = moduleIds.filter(function (id) { return byId[id]; }).map(function (id) {
        var m = byId[id];
        return el("a", {
          class: "term-module-link",
          href: "#" + id,
          html: "模块 " + m.num + " · " + H.dom.escapeHTML(m.title)
        });
      });
      if (!links.length) return null;

      return el("p", { class: "term-module-links" }, [
        el("span", { class: "module-links-label", text: "出现在案例：" })
      ].concat(links));
    }
  };
})(window.Handbook = window.Handbook || {});
