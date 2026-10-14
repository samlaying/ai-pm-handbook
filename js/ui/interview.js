/* ==========================================================================
   ui/interview.js — 面试题页（按问题组织）
   左侧导航 = 问答稿（每稿一个主问题），右侧 = 该稿的题目手风琴；
   题卡上带分类小标签（cat 字段），数据源：站级 js/data/interview.js；
   要点里的 [[术语]] 由 ui/drawer.js 打开详解抽屉；支持 #q-3 全局深链
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

  function topicOf(item) {
    return item.topic || "其他";
  }

  H.ui = H.ui || {};

  H.ui.interview = {
    init: function init() {
      this.list = document.getElementById("qaList");
      this.rail = document.getElementById("qaRail");
      this.count = document.getElementById("quizCount");
      this.search = document.querySelector(".quiz-search");
      if (!this.list || !this.rail || !H.quiz) return;

      this.state = { query: "", topic: "全部" };
      this.renderRail();
      this.bindTools();
      this.applyFilter();

      /* 深链：#q-3 → 展开第 3 题（题库全局序号）并滚动到位（页内跳转 hash 同样生效） */
      var byHash = function () {
        var m = /^#q-(\d+)$/.exec(location.hash);
        if (m) this.openQuestion(parseInt(m[1], 10), true);
      }.bind(this);
      byHash();
      window.addEventListener("hashchange", byHash);
    },

    /* —— 左侧导航：全部 + 各问答稿（按主问题，带实时计数） —— */
    renderRail: function renderRail() {
      var self = this;
      var cats = ["全部"].concat(this.topics());

      cats.forEach(function (cat) {
        self.rail.appendChild(el("button", {
          class: "rail-item" + (cat === "全部" ? " is-active" : ""),
          attrs: { type: "button", "data-topic": cat, "aria-pressed": cat === "全部" ? "true" : "false" }
        }, [
          el("span", { class: "rail-name", text: cat }),
          el("span", { class: "rail-count", attrs: { "data-topic-count": cat }, text: "" })
        ]));
      });
    },

    /* 题库里出现的问答稿主题（保持出现顺序） */
    topics: function topics() {
      var seen = [];
      (H.quiz || []).forEach(function (item) {
        var t = topicOf(item);
        if (seen.indexOf(t) === -1) seen.push(t);
      });
      return seen;
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
        self.state.topic = item.dataset.topic;
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

    /* 展开第 n 题（1 起数，按题库全局序号），支持滚动到位 */
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
      var topic = this.state.topic;
      list.innerHTML = "";

      var entries = (H.quiz || []).map(function (item, i) {
        return { no: i + 1, item: item };
      });

      var matched = entries.filter(function (entry) {
        if (topic !== "全部" && topicOf(entry.item) !== topic) return false;
        if (!query) return true;
        var haystack = (entry.item.q + " " + topicOf(entry.item) + " " + (entry.item.cat || "") + " " + entry.item.focus + " " + entry.item.points.join(" ")).toLowerCase();
        return haystack.indexOf(query) !== -1;
      });

      /* 按问答稿分组渲染（选择某稿时只渲染该组） */
      var groups = [];
      if (topic === "全部") {
        self.topics().forEach(function (t) {
          var items = matched.filter(function (entry) { return topicOf(entry.item) === t; });
          if (items.length) groups.push({ topic: t, items: items });
        });
      } else {
        groups.push({ topic: topic, items: matched });
      }

      groups.forEach(function (group) {
        list.appendChild(el("section", { class: "qa-group" }, [
          el("h3", {}, [
            group.topic,
            el("span", { class: "group-count", text: group.items.length + " 问" })
          ]),
          group.items.map(function (entry, idx) {
            return self.renderItem(entry, idx + 1);
          })
        ]));
      });

      if (!matched.length) {
        list.appendChild(el("p", { class: "qa-empty", text: "没有匹配的题目，换个关键词试试。" }));
      }

      /* 计数：总数 + 左侧导航各问答稿实时计数 */
      var countText = matched.length === entries.length
        ? "共 " + entries.length + " 问"
        : "匹配 " + matched.length + " / " + entries.length + " 问";
      if (this.count) this.count.textContent = countText;

      this.rail.querySelectorAll("[data-topic-count]").forEach(function (node) {
        var railTopic = node.getAttribute("data-topic-count");
        var n = railTopic === "全部"
          ? matched.length
          : matched.filter(function (entry) { return topicOf(entry.item) === railTopic; }).length;
        node.textContent = String(n);
        node.closest(".rail-item").classList.toggle("is-zero", n === 0);
      });
    },

    /* —— 单张手风琴题卡：scriptNo 为稿内序号，label 可覆盖显示（如「速记」） —— */
    renderItem: function renderItem(entry, scriptNo) {
      var item = entry.item;
      var noText = item.label || "Q" + scriptNo;

      return el("article", {
        class: "qa-item",
        attrs: { "data-qno": entry.no }
      }, [
        el("h4", {}, [
          el("button", {
            class: "qa-head",
            attrs: { type: "button", "aria-expanded": "false" }
          }, [
            el("span", { class: "qa-no", text: noText }),
            item.cat
              ? el("span", { class: "qa-chip", text: item.cat })
              : null,
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
