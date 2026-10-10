/* ==========================================================================
   ui/drawer.js — 术语详解抽屉（站级词典页版本）
   三段式：名词定义 → 项目案例 → 技术解析和应用（+ 相关术语 / 模块回跳）
   与案例站抽屉的差异：模块回跳链接带案例路径前缀，可跨页跳进案例
   ========================================================================== */

(function (H) {
  "use strict";

  var el = H.dom.el;
  var fmt = function (text) {
    return (H.ui.fmt || H.dom.escapeHTML)(text);
  };

  /* 目前全部术语来自案例 01；多案例后可按词条的所属案例动态拼接 */
  var CASE_BASE = "cases/ai-kefu/";

  H.ui = H.ui || {};

  H.ui.drawer = {
    init: function init() {
      this.root = document.getElementById("termDrawer");
      this.backdrop = document.getElementById("termBackdrop");
      if (!this.root || !this.backdrop) return;

      this.bindTermClick();
      this.bindClose();
    },

    /* —— 点击术语（列表词条、抽屉内相关词、详解段落里的嵌套术语共用） —— */
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

      if (entry.def) {
        body.appendChild(el("div", { class: "term-section" }, [
          el("span", { class: "term-section-label", text: "名词定义" }),
          el("p", { class: "term-def", html: fmt(entry.def) })
        ]));
      }

      if (entry.case || (entry.modules && entry.modules.length)) {
        body.appendChild(el("div", { class: "term-section" }, [
          el("span", { class: "term-section-label", text: "项目案例" }),
          entry.case ? el("p", { class: "term-case", html: fmt(entry.case) }) : null,
          this.renderModuleLinks(entry.modules)
        ]));
      }

      var techParas = this.paragraphs(entry.tech || entry.detail);
      if (techParas.length) {
        body.appendChild(el("div", { class: "term-section" }, [
          el("span", { class: "term-section-label", text: "技术解析和应用" }),
          el("div", { class: "term-tech" }, techParas)
        ]));
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
    },

    /* —— 「出现在案例」回跳链接：带案例路径，跳进案例页对应模块 —— */
    renderModuleLinks: function renderModuleLinks(moduleIds) {
      if (!moduleIds || !moduleIds.length) return null;

      var byId = {};
      (H.modules || []).forEach(function (m) { byId[m.id] = m; });
      /* 词典页未加载案例模块数据时，用站级注册表拼链接名 */
      var fallbackNames = {
        m01: "01·项目启动", m02: "02·需求解读", m03: "03·需求拆解", m04: "04·组织协作",
        m05: "05·需求固化", m06: "06·调研验证", m07: "07·竞品定位", m08: "08·产品设计",
        m09: "09·落地 Demo", m10: "10·总结"
      };

      var links = moduleIds.filter(function (id) { return byId[id] || fallbackNames[id]; }).map(function (id) {
        var m = byId[id];
        var label = m ? ("模块 " + m.num + " · " + m.title) : fallbackNames[id];
        return el("a", {
          class: "term-module-link",
          href: CASE_BASE + "#" + id,
          text: label
        });
      });
      if (!links.length) return null;

      return el("p", { class: "term-module-links" }, [
        el("span", { class: "module-links-label", text: "出现在案例：" })
      ].concat(links));
    }
  };
})(window.Handbook = window.Handbook || {});
