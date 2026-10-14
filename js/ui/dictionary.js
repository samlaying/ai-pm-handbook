/* ==========================================================================
   ui/dictionary.js — 独立名词词典页
   布局：左侧分组导航栏（计数 + 筛选）+ 右侧双列词条网格
   数据源：站级 js/data/terms.js；点击词条由 ui/drawer.js 打开详解抽屉
   ========================================================================== */

(function (H) {
  "use strict";

  var el = H.dom.el;
  var fmt = function (text) {
    return (H.ui.fmt || H.dom.escapeHTML)(text);
  };

  H.ui = H.ui || {};

  H.ui.dictionary = {
    init: function init() {
      this.list = document.getElementById("glossaryList");
      this.rail = document.getElementById("dictRail");
      this.count = document.getElementById("glossaryCount");
      this.search = document.querySelector(".glossary-search");
      if (!this.list || !this.rail || !H.terms) return;

      this.state = { query: "", cat: "全部" };
      this.renderRail();
      this.bindTools();
      this.applyFilter();
    },

    /* —— 左侧分组导航：全部 + 各分类（带实时计数） —— */
    renderRail: function renderRail() {
      var self = this;
      var cats = ["全部"].concat(H.termCats || []);

      cats.forEach(function (cat) {
        self.rail.appendChild(el("button", {
          class: "rail-item" + (cat === "全部" ? " is-active" : ""),
          attrs: { type: "button", "data-cat": cat, "aria-pressed": cat === "全部" ? "true" : "false" }
        }, [
          el("span", { class: "rail-name", text: cat }),
          el("span", { class: "rail-count", attrs: { "data-cat-count": cat }, text: "" })
        ]));
      });
    },

    bindTools: function bindTools() {
      var self = this;

      if (this.search) {
        this.search.addEventListener("input", function () {
          self.state.query = self.search.value.trim().toLowerCase();
          self.applyFilter();
        });
      }

      /* 「/」快捷聚焦搜索 */
      document.addEventListener("keydown", function (event) {
        if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
        var active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
        if (!self.search) return;
        event.preventDefault();
        self.search.focus();
      });

      this.rail.addEventListener("click", function (event) {
        var item = event.target.closest(".rail-item");
        if (!item) return;
        self.state.cat = item.dataset.cat;
        self.rail.querySelectorAll(".rail-item").forEach(function (n) {
          var on = n === item;
          n.classList.toggle("is-active", on);
          n.setAttribute("aria-pressed", String(on));
        });
        self.applyFilter();
      });
    },

    applyFilter: function applyFilter() {
      var list = this.list;
      var query = this.state.query;
      var cat = this.state.cat;
      list.innerHTML = "";

      var entries = Object.keys(H.terms).map(function (name) {
        var entry = H.terms[name];
        if (typeof entry === "string") entry = { def: entry };
        return { name: name, entry: entry };
      });

      /* 先按搜索筛（侧栏计数用它：不随当前选中分类清零），再按分类筛出列表 */
      var byQuery = entries.filter(function (item) {
        if (!query) return true;
        var haystack = (item.name + " " + (item.entry.def || "") + " " + (item.entry.case || "")).toLowerCase();
        return haystack.indexOf(query) !== -1;
      });

      var matched = byQuery.filter(function (item) {
        return cat === "全部" || item.entry.cat === cat;
      });

      /* 分组渲染（选择具体分类时只渲染该组，不重复组标题） */
      var groups = [];
      if (cat === "全部") {
        (H.termCats || []).forEach(function (c) {
          var items = matched.filter(function (item) { return item.entry.cat === c; });
          if (items.length) groups.push({ cat: c, items: items });
        });
        var others = matched.filter(function (item) { return !item.entry.cat; });
        if (others.length) groups.push({ cat: "其他", items: others });
      } else {
        groups.push({ cat: cat, items: matched });
      }

      groups.forEach(function (group) {
        list.appendChild(el("section", { class: "dict-group" }, [
          el("h3", {}, [
            group.cat,
            el("span", { class: "group-count", text: group.items.length + " 条" })
          ]),
          el("div", { class: "dict-grid" }, group.items.map(function (item) {
            return el("button", {
              class: "term-card",
              attrs: { type: "button", "data-term": item.name },
              html:
                (item.entry.cat ? '<span class="card-cat">' + H.dom.escapeHTML(item.entry.cat) + "</span>" : "") +
                '<span class="card-name">' + H.dom.escapeHTML(item.name) + "</span>" +
                '<span class="card-def">' + fmt(item.entry.def || "") + "</span>"
            });
          }))
        ]));
      });

      if (!matched.length) {
        list.appendChild(el("p", { class: "glossary-empty", text: "没有匹配的术语，换个关键词试试。" }));
      }

      /* 计数：总数 + 左侧导航各分类实时计数 */
      var countText = matched.length === entries.length
        ? "共 " + entries.length + " 条"
        : "匹配 " + matched.length + " / " + entries.length + " 条";
      if (this.count) this.count.textContent = countText;

      this.rail.querySelectorAll("[data-cat-count]").forEach(function (node) {
        var railCat = node.getAttribute("data-cat-count");
        var n = railCat === "全部"
          ? byQuery.length
          : byQuery.filter(function (item) { return item.entry.cat === railCat; }).length;
        node.textContent = String(n);
        node.closest(".rail-item").classList.toggle("is-zero", n === 0);
      });
    }
  };
})(window.Handbook = window.Handbook || {});
