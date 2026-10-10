/* ==========================================================================
   ui/fmt.js — 行内格式化（词典页与抽屉共用）
   **text** → <strong>；[[术语]] → 可点击术语词（由 drawer.js 接管点击）
   ========================================================================== */

(function (H) {
  "use strict";

  var escapeHTML = H.dom.escapeHTML;

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

  H.ui = H.ui || {};
  H.ui.fmt = fmt;
})(window.Handbook = window.Handbook || {});
