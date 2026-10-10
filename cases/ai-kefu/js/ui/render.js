/* ==========================================================================
   ui/render.js — 渲染层：把 data/ 下的结构化数据变成 DOM
   纯函数式拼接，不含任何交互行为（交互由其他 ui/* 文件挂载）
   ========================================================================== */

(function (H) {
  "use strict";

  var el = H.dom.el;
  var escapeHTML = H.dom.escapeHTML;

  /**
   * 行内格式化（先转义再标记替换，保证安全）：
   *   **text**  → <strong>
   *   [[Term]]  → <button class="term" data-term="Term">Term</button>
   *               （点击后由 ui/drawer.js 打开右侧详解抽屉；button 自带键盘可达）
   */
  function fmt(text) {
    var safe = escapeHTML(text);
    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\[\[([^\]]+)\]\]/g, function (match, name) {
      if (!H.terms || !H.terms[name]) {
        if (window.console) console.warn("[handbook] 未收录的术语: " + name);
        return name;
      }
      return '<button class="term" type="button" data-term="' + escapeHTML(name) + '" aria-haspopup="dialog">' + escapeHTML(name) + "</button>";
    });
    return safe;
  }

  /* —— 单个 block → DOM —— */
  function renderBlock(block, isFirstParagraph) {
    switch (block.type) {
      case "p":
        return el("p", { class: isFirstParagraph ? "drop-cap" : null, html: fmt(block.text) });

      case "list":
        return el(
          block.ordered ? "ol" : "ul",
          { class: "content-list" },
          (block.items || []).map(function (item) {
            return el("li", { html: fmt(item) });
          })
        );

      case "quote":
        return el("blockquote", { class: "quote" }, [
          el("p", { html: fmt(block.text) }),
          block.cite ? el("cite", { text: block.cite }) : null
        ]);

      case "table":
        return el("div", { class: "table-scroll" }, [
          el("table", {}, [
            el("thead", {}, [
              el("tr", {}, (block.head || []).map(function (cell) {
                return el("th", { html: fmt(cell) });
              }))
            ]),
            el("tbody", {}, (block.rows || []).map(function (row) {
              return el("tr", {}, row.map(function (cell) {
                return el("td", { html: fmt(cell) });
              }));
            }))
          ])
        ]);

      case "warning":
        return el("div", { class: "warning" }, [
          el("span", { class: "block-label", text: block.label || "注意" }),
          el("p", { html: fmt(block.text) })
        ]);

      case "code":
        return el("div", { class: "code-block" }, [
          block.lang ? el("span", { class: "code-lang", text: block.lang }) : null,
          el("pre", {}, [el("code", { text: block.text })])
        ]);

      default:
        if (window.console) console.warn("[handbook] 未知 block 类型: " + block.type);
        return null;
    }
  }

  /* —— 一个小节 → DOM（state.seenFirstP 在整个模块内共享，保证首字下沉只出现一次） —— */
  function renderSection(section, state) {
    var blocks = (section.blocks || []).map(function (block) {
      var isFirst = block.type === "p" && !state.seenFirstP;
      if (isFirst) state.seenFirstP = true;
      return renderBlock(block, isFirst);
    });

    var head = el("h3", {}, [
      section.no ? el("span", { class: "sec-no", text: section.no }) : null,
      section.heading
    ]);

    /* 点题句：本节解决什么 */
    var goal = section.goal ? el("p", { class: "section-goal", html: fmt(section.goal) }) : null;

    return el("article", { class: "subsection reveal" }, [head, goal].concat(blocks));
  }

  /* —— 产出物卡片 */
  function renderDeliverables(items) {
    if (!items || !items.length) return null;
    return el("div", { class: "deliverables reveal" }, [
      el("span", { class: "block-label", text: "📌 产出物" }),
      el("ul", {}, items.map(function (item) {
        return el("li", { html: fmt(item) });
      }))
    ]);
  }

  /* —— 检查清单（复选框状态由 checklist.js 挂载恢复） */
  function renderChecklist(moduleId, items) {
    if (!items || !items.length) return null;
    return el("div", { class: "checklist reveal" }, [
      el("span", { class: "block-label", text: "☑ 检查清单" }),
      el("ul", {}, items.map(function (item, index) {
        var input = el("input", { attrs: { type: "checkbox" } });
        input.dataset.module = moduleId;
        input.dataset.index = String(index);
        return el("li", {}, [
          el("label", {}, [
            input,
            el("span", { class: "check-text", html: fmt(item) })
          ])
        ]);
      }))
    ]);
  }

  /* —— 实战延伸卡 */
  function renderExercise(text) {
    if (!text) return null;
    return el("div", { class: "exercise reveal" }, [
      el("span", { class: "block-label", text: "✏️ 实战延伸" }),
      el("p", { html: fmt(text) })
    ]);
  }

  /* —— 模块核心问题卡：点名本模块要解决什么、解法是什么 —— */
  function renderProblem(data) {
    if (!data.problem) return null;
    return el("div", { class: "module-problem reveal" }, [
      el("span", { class: "block-label problem-label", text: "本模块要解决的问题" }),
      el("p", { class: "problem-q", html: fmt(data.problem) }),
      data.answer ? el("p", { class: "problem-a", html: fmt(data.answer) }) : null
    ]);
  }

  /* —— 一个完整模块 → DOM */
  function renderModule(mod) {
    var state = { seenFirstP: false };
    return el("section", {
      class: "module",
      id: mod.id,
      attrs: { "aria-label": "模块 " + mod.num + " " + mod.title }
    }, [
      el("header", { class: "module-head reveal" }, [
        el("span", {
          class: "module-num",
          text: mod.num,
          attrs: { "aria-hidden": "true" }
        }),
        el("h2", { class: "module-title", html: escapeHTML(mod.title) + '<span class="title-sep">——</span>' + escapeHTML(mod.tagline) }),
        el("p", { class: "module-lead", html: fmt(mod.lead) })
      ]),
      el("hr", { class: "module-rule" }),
      renderProblem(mod),
      mod.sections.map(function (section) {
        return renderSection(section, state);
      }),
      renderDeliverables(mod.deliverables),
      renderChecklist(mod.id, mod.checklist),
      renderExercise(mod.exercise)
    ]);
  }

  /* —— 总结页 */
  function renderSummary(data) {
    return el("section", {
      class: "module summary",
      id: data.id,
      attrs: { "aria-label": "总结" }
    }, [
      el("header", { class: "module-head summary-head reveal" }, [
        el("span", { class: "module-num", text: data.num, attrs: { "aria-hidden": "true" } }),
        el("h2", { class: "module-title", html: escapeHTML(data.title) + '<span class="title-sep">——</span>' + escapeHTML(data.tagline) }),
        el("hr", { class: "module-rule" })
      ]),
      renderProblem(data),
      el("div", { class: "summary-section reveal" }, [
        el("h3", {}, [el("span", { class: "sec-no", text: "10.1" }), "四份交付物"]),
        data.deliverablesGoal ? el("p", { class: "section-goal", html: fmt(data.deliverablesGoal) }) : null,
        el("ol", { class: "summary-list" }, data.deliverables.map(function (d) {
          return el("li", {}, [
            el("strong", { text: d.name }),
            el("span", { class: "summary-from", text: d.from }),
            el("p", { html: fmt(d.desc) })
          ]);
        }))
      ]),
      el("div", { class: "summary-section reveal" }, [
        el("h3", {}, [el("span", { class: "sec-no", text: "10.2" }), "自查六问"]),
        data.selfCheckGoal ? el("p", { class: "section-goal", html: fmt(data.selfCheckGoal) }) : null,
        renderChecklist(data.id + "-self", data.selfCheck),
        el("p", { html: fmt(data.practiceNote), class: "practice-note" })
      ]),
      el("p", { class: "ending reveal", text: data.ending })
    ]);
  }

  /* —— 侧边栏 + 顶部导航（与模块同源生成，保持一致） —— */
  function renderNavigation(mods, summary) {
    var toc = document.getElementById("toc");
    var topNav = document.getElementById("topNav");
    if (!toc) return;

    var entries = mods.concat([summary]);

    toc.appendChild(el("p", { class: "toc-label", text: "目录" }));
    var tocNav = el("nav", { class: "toc", attrs: { "aria-label": "模块目录" } });
    entries.forEach(function (entry) {
      tocNav.appendChild(el("a", { href: "#" + entry.id, dataset: { target: entry.id } }, [
        el("span", { class: "toc-num", text: entry.num }),
        el("span", { text: entry.title })
      ]));
    });
    toc.appendChild(tocNav);
    toc.appendChild(el("div", { class: "toc-actions" }, [
      el("button", { class: "reset-checks", text: "重置全部勾选", attrs: { type: "button" } })
    ]));

    if (topNav) {
      entries.forEach(function (entry) {
        topNav.appendChild(el("a", {
          href: "#" + entry.id,
          text: entry.num,
          dataset: { target: entry.id, name: entry.title },
          attrs: { title: entry.num + " " + entry.title, "aria-label": entry.num + " " + entry.title }
        }));
      });
    }
  }

  /* —— Hero / 顶栏品牌 / 页脚：文案统一来自 data/site.js —— */
  function renderChrome() {
    var site = H.site;
    if (!site) return;

    function fill(id, value, prop) {
      var node = document.getElementById(id);
      if (!node || value == null) return;
      if (prop) node.setAttribute(prop, value);
      else node.textContent = value;
    }

    if (site.name) {
      /* 品牌含 logo 标记时，文案写入内部 span，避免 textContent 覆盖整块标记 */
      var brandText = document.getElementById("brandText");
      if (brandText) brandText.textContent = site.name;
      else fill("brand", site.name);
    }
    fill("heroKicker", site.hero && site.hero.kicker);
    fill("heroTitle", site.hero && site.hero.title);
    fill("heroSubtitle", site.hero && site.hero.subtitle);
    fill("heroLede", site.hero && site.hero.lede);
    fill("heroCta", site.hero && site.hero.cta);
    if (site.hero && site.hero.ctaTarget) {
      var cta = document.getElementById("heroCta");
      if (cta) cta.setAttribute("href", site.hero.ctaTarget);
    }
    fill("footerLeft", site.footer && site.footer.left);
    fill("footerRight", site.footer && site.footer.right);
    if (site.title) document.title = site.title;
  }

  /* —— 对外入口 —— */
  H.ui = H.ui || {};
  H.ui.fmt = fmt; /* 供 drawer.js 等复用同一套行内格式化 */
  H.ui.render = function render() {
    var mount = document.getElementById("modules");
    if (!mount) return;

    renderChrome();
    H.modules.forEach(function (mod) {
      mount.appendChild(renderModule(mod));
    });
    mount.appendChild(renderSummary(H.summary));
    renderNavigation(H.modules, H.summary);
  };
})(window.Handbook = window.Handbook || {});
