/* ==========================================================================
   ui/dictionary.js — 独立名词词典页：搜索 + 分类筛选 + 分组列表
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
      this.count = document.getElementById("glossaryCount");
      this.search = document.querySelector(".glossary-search");
      this.chips = document.querySelector(".cat-chips");
      if (!this.list || !H.terms) return;

      this.state = { query: "", cat: "全部" };
      this.renderChips();
      this.bindTools();
      this.applyFilter();
    },

    renderChips: function renderChips() {
      var self = this;
      var cats = ["全部"].concat(H.termCats || []);
      cats.forEach(function (cat) {
        self.chips.appendChild(el("button", {
          class: "cat-chip" + (cat === "全部" ? " is-active" : ""),
          text: cat,
          attrs: { type: "button", "data-cat": cat }
        }));
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
      this.chips.querySelectorAll(".cat-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          self.state.cat = chip.dataset.cat;
          self.chips.querySelectorAll(".cat-chip").forEach(function (c) {
            c.classList.toggle("is-active", c === chip);
          });
          self.applyFilter();
        });
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

      var matched = entries.filter(function (item) {
        if (cat !== "全部" && item.entry.cat !== cat) return false;
        if (!query) return true;
        var haystack = (item.name + " " + (item.entry.def || "") + " " + (item.entry.case || "")).toLowerCase();
        return haystack.indexOf(query) !== -1;
      });

      var groups = {};
      (H.termCats || []).forEach(function (c) { groups[c] = []; });
      matched.forEach(function (item) {
        var c = item.entry.cat || "其他";
        (groups[c] = groups[c] || []).push(item);
      });

      Object.keys(groups).forEach(function (groupCat) {
        var items = groups[groupCat];
        if (!items.length) return;

        /* 注：列表不参与淡入（筛选会重建 DOM） */
        list.appendChild(el("section", { class: "glossary-group" }, [
          el("h3", {}, [
            groupCat,
            el("span", { class: "group-count", text: items.length + " 条" })
          ])
        ].concat(items.map(function (item) {
          return el("button", {
            class: "glossary-item",
            attrs: { type: "button", "data-term": item.name },
            html: '<span class="item-name">' + H.dom.escapeHTML(item.name) + "</span>" +
                  '<span class="item-def">' + fmt(item.entry.def || "") + "</span>"
          });
        }))));
      });

      if (!matched.length) {
        list.appendChild(el("p", { class: "glossary-empty", text: "没有匹配的术语，换个关键词试试。" }));
      }

      if (this.count) {
        this.count.textContent = matched.length === entries.length
          ? "共 " + entries.length + " 条"
          : "匹配 " + matched.length + " / " + entries.length + " 条";
      }
    }
  };
})(window.Handbook = window.Handbook || {});
