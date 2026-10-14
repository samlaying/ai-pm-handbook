/* ==========================================================================
   ui/gallery.js — 画廊首页渲染：入口计数 + 案例卡片列表（数据驱动）
   ========================================================================== */

(function (H) {
  "use strict";

  var el = H.dom.el;

  function statLine(stats) {
    var parts = [];
    if (stats.modules) parts.push(stats.modules + " 个模块");
    if (stats.terms) parts.push(stats.terms + " 个术语词条");
    if (stats.demo) parts.push(stats.demo + " 可运行 Demo");
    return parts.join(" · ");
  }

  function renderCaseCard(item) {
    var live = item.status === "live" && item.url;

    var title = live
      ? el("h2", { class: "card-title" }, [
          el("a", { class: "card-title-link", href: item.url, text: item.title })
        ])
      : el("h2", { class: "card-title", text: item.title });

    var card = el("article", {
      class: "case-card reveal" + (live ? "" : " is-soon"),
      attrs: { "data-slug": item.slug }
    }, [
      el("span", { class: "card-num", text: item.num, attrs: { "aria-hidden": "true" } }),
      el("span", { class: "card-status " + (live ? "is-live" : "is-soon"), text: item.statusLabel }),
      el("div", { class: "card-body" }, [
        el("p", { class: "card-kicker", text: "CASE " + item.num }),
        title,
        el("p", { class: "card-subtitle", text: item.subtitle }),
        el("p", { class: "card-desc", text: item.desc }),
        el("div", { class: "card-tags" }, (item.tags || []).map(function (tag) {
          return el("span", { class: "card-tag", text: tag });
        })),
        item.stats ? el("p", { class: "card-stats", text: statLine(item.stats) }) : null
      ]),
      live
        ? el("a", {
            class: "card-link",
            href: item.url,
            attrs: { "aria-label": "进入案例：" + item.title }
          }, ["进入案例", el("span", { class: "card-arrow", text: " →" })])
        : el("span", { class: "card-link is-disabled", text: "敬请期待" })
    ]);

    return card;
  }

  H.ui = H.ui || {};

  H.ui.gallery = {
    init: function init() {
      var mount = document.getElementById("caseList");
      if (!mount || !H.cases) return;

      H.cases.forEach(function (item) {
        mount.appendChild(renderCaseCard(item));
      });

      /* 入口卡片的计数 */
      var live = H.cases.filter(function (c) { return c.status === "live"; }).length;
      var soon = H.cases.filter(function (c) { return c.status === "soon"; }).length;
      var terms = H.terms ? Object.keys(H.terms).length
        : H.cases.reduce(function (sum, c) {
            return sum + (c.stats && c.stats.terms ? c.stats.terms : 0);
          }, 0);
      var caseCount = document.getElementById("entryCaseCount");
      var termCount = document.getElementById("entryTermCount");
      var quizCount = document.getElementById("entryQuizCount");
      if (caseCount) caseCount.textContent = live + " 个已上线 · " + soon + " 个规划中";
      if (termCount) termCount.textContent = terms + " 个术语 · 定义 / 项目案例 / 技术解析";
      if (quizCount && H.quiz) {
        var scripts = {};
        H.quiz.forEach(function (q) { if (q.topic) scripts[q.topic] = 1; });
        var n = Object.keys(scripts).length || 1;
        quizCount.textContent = H.quiz.length + " 问 · " + n + " 套问答稿";
      }

      /* 滚动淡入 */
      var targets = document.querySelectorAll(".reveal");
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
        targets.forEach(function (node) { io.observe(node); });
      } else {
        targets.forEach(function (node) { node.classList.add("is-visible"); });
      }
    }
  };
})(window.Handbook = window.Handbook || {});
