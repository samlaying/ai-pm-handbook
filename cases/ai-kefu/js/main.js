/* ==========================================================================
   main.js — 启动器：唯一入口，按依赖顺序装配各模块
   依赖注入点：index.html 中脚本按 lib → data → ui → main 顺序加载
   ========================================================================== */

(function (H) {
  "use strict";

  function boot() {
    if (!H.dom || !H.store) {
      if (window.console) console.error("[handbook] 基础库未加载，请检查脚本引用顺序");
      return;
    }
    if (!H.modules || !H.modules.length || !H.summary || !H.site) {
      if (window.console) console.error("[handbook] 数据文件未加载，请检查 data/ 目录脚本");
      return;
    }

    /* 1. 数据 → DOM */
    H.ui.render();

    /* 2. 交互行为 */
    H.ui.nav.init();
    H.ui.progress.init();
    H.ui.reveal.init();
    H.ui.drawer.init();
    H.ui.checklist.init();

    document.documentElement.classList.add("js-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.Handbook = window.Handbook || {});
