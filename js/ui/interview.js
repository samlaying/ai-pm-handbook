/* ==========================================================================
   ui/interview.js — 面试题页
   布局：左侧分类导航（计数 + 筛选）+ 右侧手风琴题卡（点击展开答题要点）
   数据源：站级 js/data/interview.js；要点里的 [[术语]] 由 ui/drawer.js 打开详解抽屉
   支持 #q-3 深链：直达并展开第 3 题
   ========================================================================== */

(function (H) {
  "use strict";

  var el = H.dom.el;
  var fmt = function (text) {
    return (H.ui.fmt || H.dom.escapeHTML)(text);
  };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  H.ui = H.ui || {};

  H.ui.interview = {
    init: function init() {
      this.list = document.getElementById("qaList");
      this.rail = document.getElementById("qaRail");
      this.count = document.getElementById("quizCount");
      this.search = document.querySelector(".quiz-search");
      if (!this.list || !this.rail || !H.quiz) return;

      this.state = { query: "", cat: "全部" };
      this.renderRail();
      this.bindTools();
      this.applyFilter();

      /* 深链：#q-3 → 展开第 3 题并滚动到位（页内跳转 hash 同样生效） */
      var byHash = function () {
        var m = /^#q-(\d+)$/.exec(location.hash);
        if (m) this.openQuestion(parseInt(m[1], 10), true);
      }.bind(this);
      byHash();
      window.addEventListener("hashchange", byHash);
    },

    /* —— 左侧分类导航：全部 + 各分类（带实时计数） —— */
    renderRail: function renderRail() {
      var self = this;
      var cats = ["全部"].concat(H.quizCats || []);

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

      /* 手风琴：点击题头展开 / 收起（事件委托，重渲染后依然有效） */
      this.list.addEventListener("click", function (event) {
        var head = event.target.closest(".qa-head");
        if (!head || !self.list.contains(head)) return;
        var item = head.closest(".qa-item");
        if (!item) return;
        self.toggle(item, !item.classList.contains("is-open"));
      });
    },

    toggle: function toggle(item, open) {
      item.classList.toggle("is-open", open);
      var head = item.querySelector(".qa-head");
      if (head) head.setAttribute("aria-expanded", String(open));
    },

    /* 展开第 n 题（1 起数，按题库原始顺序），支持滚动到位 */
    openQuestion: function openQuestion(n, scroll) {
      var target = this.list.querySelector('[data-qno="' + n + '"]');
      if (!target) return;
      this.toggle(target, true);
      if (scroll && target.scrollIntoIfNeeded) {
        target.scrollIntoIfNeeded(false);
      } else if (scroll) {
        target.scrollIntoView({ block: "center" });
      }
    },

    applyFilter: function applyFilter() {
      var self = this;
      var list = this.list;
      var query = this.state.query;
      var cat = this.state.cat;
      list.innerHTML = "";

      var entries = (H.quiz || []).map(function (item, i) {
        return { no: i + 1, item: item };
      });

      var matched = entries.filter(function (entry) {
        if (cat !== "全部" && entry.item.cat !== cat) return false;
        if (!query) return true;
        var haystack = (entry.item.q + " " + entry.item.focus + " " + entry.item.points.join(" ")).toLowerCase();
        return haystack.indexOf(query) !== -1;
      });

      /* 分组渲染（选择具体分类时只渲染该组，不重复组标题） */
      var groups = [];
      if (cat === "全部") {
        (H.quizCats || []).forEach(function (c) {
          var items = matched.filter(function (entry) { return entry.item.cat === c; });
          if (items.length) groups.push({ cat: c, items: items });
        });
      } else {
        groups.push({ cat: cat, items: matched });
      }

      groups.forEach(function (group) {
        list.appendChild(el("section", { class: "qa-group" }, [
          el("h3", {}, [
            group.cat,
            el("span", { class: "group-count", text: group.items.length + " 题" })
          ]),
          group.items.map(function (entry) {
            return self.renderItem(entry);
          })
        ]));
      });

      if (!matched.length) {
        list.appendChild(el("p", { class: "qa-empty", text: "没有匹配的题目，换个关键词试试。" }));
      }

      /* 计数：总数 + 左侧导航各分类实时计数 */
      var countText = matched.length === entries.length
        ? "共 " + entries.length + " 题"
        : "匹配 " + matched.length + " / " + entries.length + " 题";
      if (this.count) this.count.textContent = countText;

      this.rail.querySelectorAll("[data-cat-count]").forEach(function (node) {
        var railCat = node.getAttribute("data-cat-count");
        var n = railCat === "全部"
          ? matched.length
          : matched.filter(function (entry) { return entry.item.cat === railCat; }).length;
        node.textContent = String(n);
      });
    },

    /* —— 单张手风琴题卡 —— */
    renderItem: function renderItem(entry) {
      var item = entry.item;

      return el("article", {
        class: "qa-item",
        attrs: { "data-qno": entry.no }
      }, [
        el("h4", {}, [
          el("button", {
            class: "qa-head",
            attrs: { type: "button", "aria-expanded": "false" }
          }, [
            el("span", { class: "qa-no", text: "Q" + pad(entry.no) }),
            el("span", { class: "qa-q", text: item.q }),
            el("span", {
              class: "qa-toggle",
              attrs: { "aria-hidden": "true" },
              html: '<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4v14M4 11h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/></svg>'
            })
          ])
        ]),
        el("div", { class: "qa-body" }, [
          el("div", { class: "qa-body-in" }, [
            el("div", { class: "qa-body-pad" }, [
              el("p", { class: "qa-focus", html: "<strong>考察点</strong> · " + fmt(item.focus) }),
              el("ul", { class: "qa-points" }, item.points.map(function (point) {
                return el("li", { html: fmt(point) });
              }))
            ])
          ])
        ])
      ]);
    }
  };
})(window.Handbook = window.Handbook || {});
