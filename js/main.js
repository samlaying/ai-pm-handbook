/* ==========================================================================
   main.js — 站级启动器：按页面挂载点分发
   首页（index.html）：画廊 + 入口计数
   词典页（glossary.html）：词典列表 + 详解抽屉
   面试题页（interview.html）：题卡手风琴 + 详解抽屉
   ========================================================================== */

(function (H) {
  "use strict";

  function boot() {
    if (!H.dom) {
      if (window.console) console.error("[handbook] 基础库未加载，请检查脚本引用顺序");
      return;
    }

    var onHome = !!document.getElementById("caseList");
    var onDict = !!document.getElementById("glossaryList");
    var onQuiz = !!document.getElementById("qaList");

    if (onHome && H.ui.gallery) H.ui.gallery.init();

    if (onDict) {
      if (H.ui.dictionary) H.ui.dictionary.init();
      if (H.ui.drawer) H.ui.drawer.init();
    }

    if (onQuiz) {
      if (H.ui.interview) H.ui.interview.init();
      if (H.ui.drawer) H.ui.drawer.init();
    }

    document.documentElement.classList.add("js-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.Handbook = window.Handbook || {});
