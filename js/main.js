/* ==========================================================================
   main.js — 画廊首页启动器（渲染 + 淡入动效，无其他交互）
   ========================================================================== */

(function (H) {
  "use strict";

  function boot() {
    if (!H.dom || !H.cases || !H.ui.gallery) {
      if (window.console) console.error("[gallery] 依赖未加载，请检查脚本引用顺序");
      return;
    }
    H.ui.gallery.init();
    document.documentElement.classList.add("js-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.Handbook = window.Handbook || {});
