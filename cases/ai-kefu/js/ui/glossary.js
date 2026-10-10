/* ==========================================================================
   ui/glossary.js — 「名词查询」页：搜索 + 分类筛选 + 词条列表
   点击词条打开右侧详解抽屉（与案例 Tab 共用同一份 terms.js 数据）
   ========================================================================== */

(function (H) {
  "use strict";

  var el = H.dom.el;
  var fmt = function (text) {
    return (H.ui.fmt || H.dom.escapeHTML)(text);
  };

  H.ui = H.ui || {};

  H.ui.glossary = {
    init: function init() {
      this.mount = document.getElementById("glossaryView");
      if (!this.mount || !H.terms) return;

      this.state = { query: "", cat: "全部" };
      this.render();
      this.bindTools();
    },

    render: function render() {
      var self = this;
      this.mount.innerHTML = "";

      var cats = ["全部"].concat(H.termCats || []);

      this.mount.appendChild(el("div", { class: "glossary" }, [
        el("header", { class: "glossary-head" }, [
          el("span", { class: "kicker", text: "GLOSSARY · 术语速查" }),
          el("h2", { text: "名词查询" }),
          el("p", {
            class: "lede",
            text: "案例中出现的全部术语：点击任意词条，查看名词定义、项目案例与技术解析和应用。"
          })
        ]),
        el("div", { class: "glossary-tools" }, [
          el("input", {
            class: "glossary-search",
            attrs: {
              type: "search",
              placeholder: "搜索术语 / 定义…",
              "aria-label": "搜索术语"
            }
          }),
          el("div", { class: "cat-chips" }, cats.map(function (cat) {
            return el("button", {
              class: "cat-chip" + (cat === "全部" ? " is-active" : ""),
              text: cat,
              attrs: { type: "button", "data-cat": cat }
            });
          })),
          el("span", { class: "glossary-count", attrs: { role: "status" } })
        ]),
        el("div", { class: "glossary-list" })
      ]));

      this.applyFilter();
    },

    bindTools: function bindTools() {
      var self = this;
      var search = this.mount.querySelector(".glossary-search");
      if (search) {
        search.addEventListener("input", function () {
          self.state.query = search.value.trim().toLowerCase();
          self.applyFilter();
        });
      }

      this.mount.querySelectorAll(".cat-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          self.state.cat = chip.dataset.cat;
          self.mount.querySelectorAll(".cat-chip").forEach(function (c) {
            c.classList.toggle("is-active", c === chip);
          });
          self.applyFilter();
        });
      });
    },

    applyFilter: function applyFilter() {
      var list = this.mount.querySelector(".glossary-list");
      var count = this.mount.querySelector(".glossary-count");
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

      /* 按分类分组（保持 termCats 的顺序） */
      var groups = {};
      (H.termCats || []).forEach(function (c) { groups[c] = []; });
      matched.forEach(function (item) {
        var c = item.entry.cat || "其他";
        (groups[c] = groups[c] || []).push(item);
      });

      var total = 0;
      Object.keys(groups).forEach(function (groupCat) {
        var items = groups[groupCat];
        if (!items.length) return;
        total += items.length;

        /* 注：词条列表不用 reveal 淡入——筛选会重建 DOM，
           新元素不会被 IntersectionObserver 观察，会永远停在 opacity:0 */
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

      if (count) {
        count.textContent = matched.length === entries.length
          ? "共 " + entries.length + " 条"
          : "匹配 " + matched.length + " / " + entries.length + " 条";
      }
    }
  };
})(window.Handbook = window.Handbook || {});
